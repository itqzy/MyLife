## 起因

绿联上部署了Vaultwarden，但是很蛋疼的一点就是Vaultwarden 必须使用https才能同步，没办法只能在nginx中做代理配置上证书，好在tailscale可以提供免费证书。

用了一段时间后发现Vaultwarden突然同步不了了，看了看发现是证书过期了，不是哥们！我局域网证书还过期😅  没招了  只能重新生成证书替换，重启nginx，搞定！ 然后三个月后一次下午又过期了。。。这种情况真的有点下头了 。还是配个脚本来自动更新吧，



首先说下环境，我的tailscale和nginx都部署在docker容器中

| 容器      | 网络   | 配置                                                         | 说明                               |
| --------- | ------ | ------------------------------------------------------------ | ---------------------------------- |
| nginx     | bridge | 映射:<br />/etc/ningx/conf.d<br />/usr/share/nginx/certs<br />/usr/share/nginx/html | 反向代理请求升级https到Vaultwarden |
| tailscale | host   | 映射：<br />/dev/net/tun<br />/var/lib                       | 局域网穿透                         |

nginx配置文件如下：

```nginx
server {
    listen 41101 ssl;  # Nginx 容器监听 443 端口（HTTPS）
    server_name xxx.net;  # Tailscale 域名

    # 证书路径（容器内路径，对应宿主机 ~/docker/apps/tailscale/lib/tailscale/certs）
    ssl_certificate /usr/share/nginx/certs/xxx.crt;
    ssl_certificate_key /usr/share/nginx/certs/xxx.key;

    # 反向代理到 Vaultwarden
    location / {
        proxy_pass http://ip:port;

        # 必要的代理头（确保Vaultwarden获取正确的客户端信息）
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
手动更新证书的流程就是进入tailscale容器执行`tailscale cert 域名`命令生成证书，生成后的证书在容器的`/var/lib/tailscale/certs`目录下，因为映射了`/var/lib`目录到宿主机，又把这个目录映射到了nginx容器的`/usr/share/nginx/certs/`目录 ，所以生成证书后就重新替换了nginx的证书，接下来重启nginx容器就可以重新加载新的证书了。

因为绿联官方没有定时执行脚本的功能，只能自己写一个脚本在绿联机器执行cron任务来实现了。

## 开始实现

实现思路是：**每周一凌晨4点检查一次证书剩余有效期，只有证书不存在、已过期或剩余天数小于阈值时，才去执行 `tailscale cert` 并重启 Nginx**。这样既能自动续期，又不会频繁重启 Nginx。

1. 宿主机上由 cron 触发脚本。
2. 脚本检查宿主机上 Nginx 实际读取的证书文件。
3. 用 `openssl x509 -checkend` 判断证书是否会在指定天数内过期。
4. 如果证书还很久才过期 → 打印日志，直接退出。
5. 如果证书不存在/即将过期/已过期 → 进入 Tailscale 容器执行 `tailscale cert 域名`。
6. 验证新证书是否生成且有效期足够。
7. 重启 Nginx 容器，让新证书生效。
8. 日志同时输出到终端和日志文件。

###  确认依赖

宿主机上需要有：

- `bash`
- `docker`
- `openssl`
- `date`
- `tee`

绿联一般都有。可以在终端执行：

```
which docker openssl date tee
```

如果都有输出就没问题。

### 脚本内容

```sh
#!/bin/bash

# ================== 可配置变量 ==================
TAILSCALE_CONTAINER="tailscale"          # Tailscale 容器名称
NGINX_CONTAINER="nginx"                  # Nginx 容器名称
DOMAIN="xxx.net"                         # Tailscale 域名
CERT_HOST_DIR="/volume1/docker/apps/tailscale/lib/tailscale/certs"  # 宿主机证书目录
CERT_FILE="${CERT_HOST_DIR}/${DOMAIN}.crt"  # 证书文件，需与 Nginx 配置一致
KEY_FILE="${CERT_HOST_DIR}/${DOMAIN}.key"   # 私钥文件
DAYS_THRESHOLD=7                        # 剩余天数小于此值则续期
LOG_FILE="/volume1/docker/apps/renew_tailscale_cert/tailscale-cert-renew.log"
# ================================================

# 确保 cron 环境下也能找到 docker 等命令
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

# 日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 日志函数：同时输出到终端和日志文件
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $*" | tee -a "$LOG_FILE"
}
log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $*" | tee -a "$LOG_FILE"
}
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" | tee -a "$LOG_FILE" >&2
}

log_info "========== 开始检查 Tailscale 证书 =========="
log_info "域名：$DOMAIN"
log_info "证书路径：$CERT_FILE"
log_info "续期阈值：剩余 $DAYS_THRESHOLD 天"

NEED_RENEW=0

# 1. 检查证书是否存在
if [ ! -f "$CERT_FILE" ]; then
    log_warn "证书文件不存在，将执行首次生成。"
    NEED_RENEW=1
else
    # 打印当前证书到期时间
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" 2>/dev/null | cut -d= -f2)
    log_info "当前证书到期时间：${EXPIRY_DATE:-未知}"

    # 2. 判断证书是否在阈值天数内过期
    if openssl x509 -checkend $((DAYS_THRESHOLD * 86400)) -noout -in "$CERT_FILE" >/dev/null 2>&1; then
        log_info "证书距离过期还有超过 $DAYS_THRESHOLD 天，无需更新。"
        log_info "========== 检查结束 =========="
        exit 0
    else
        log_warn "证书已过期或将在 $DAYS_THRESHOLD 天内过期，需要续期。"
        NEED_RENEW=1
    fi
fi

# 3. 执行续期
if [ "$NEED_RENEW" -eq 1 ]; then
    log_info "在容器 $TAILSCALE_CONTAINER 中执行：tailscale cert $DOMAIN"

    if docker exec "$TAILSCALE_CONTAINER" tailscale cert "$DOMAIN" >> "$LOG_FILE" 2>&1; then
        log_info "tailscale cert 命令执行成功。"
    else
        log_error "tailscale cert 命令执行失败，请检查 Tailscale 容器状态和日志。"
        exit 1
    fi

    # 4. 验证新证书是否生成
    if [ ! -f "$CERT_FILE" ]; then
        log_error "续期后证书文件仍不存在：$CERT_FILE"
        exit 1
    fi

    # 5. 再次检查新证书有效期
    NEW_EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" 2>/dev/null | cut -d= -f2)
    if openssl x509 -checkend $((DAYS_THRESHOLD * 86400)) -noout -in "$CERT_FILE" >/dev/null 2>&1; then
        log_info "新证书验证通过，到期时间：${NEW_EXPIRY_DATE:-未知}"
    else
        log_error "新证书验证失败，可能仍未成功续期。到期时间：${NEW_EXPIRY_DATE:-未知}"
        exit 1
    fi

    # 6. 重启 Nginx 容器
    log_info "重启 Nginx 容器：$NGINX_CONTAINER"
    if docker restart "$NGINX_CONTAINER" >> "$LOG_FILE" 2>&1; then
        log_info "Nginx 容器重启成功，证书更新完成。"
    else
        log_error "Nginx 容器重启失败！"
        exit 1
    fi
fi

log_info "========== 证书检查/更新流程结束 =========="
exit 0

```

`openssl x509 -checkend 秒数 -noout -in 证书文件` 会检查证书是否在指定秒数后过期：

- 返回 `0`：证书在指定时间内**不会**过期。
- 返回 `1`：证书已过期，或将在指定时间内过期。

```
openssl x509 -checkend $((30 * 86400)) -noout -in "$CERT_FILE"
```

就是判断证书是否会在 30 天内过期。这样比用 `date -d` 解析日期更稳，跨平台兼容性更好。



### 创建定时任务：

先给脚本执行权限：

```
chmod +x renew_tailscale_cert.sh
```

然后编辑 cron：

```
sudo crontab -e
```

添加一行，每周一凌晨四点检查一次：

```
0 4 * * 1 /bin/bash /volume1/docker/apps/renew_tailscale_cert/renew_tailscale_cert.sh >/dev/null 2>&1
```

因为脚本内部已经写日志了，所以把 cron 的 stdout/stderr 重定向到 `/dev/null`。

查看是否配置成功：

```
sudo crontab -l
```

查看服务是否正常：

```
sudo systemctl status cron
```

先手动运行一次：

```
sudo /bin/bash /volume1/docker/apps/renew_tailscale_cert/renew_tailscale_cert.sh
```

会看到类似输出：

```
[2026-09-10 17:35:50] [INFO] ========== 开始检查 Tailscale 证书 ==========
[2026-09-10 17:35:50] [INFO] 域名：dh4300plus.tail6b1815.ts.net
[2026-09-10 17:35:50] [INFO] 证书路径：/volume1/docker/apps/tailscale/lib/tailscale/certs/xxx.crt
[2026-09-10 17:35:50] [INFO] 续期阈值：剩余 15 天
[2026-09-10 17:35:50] [INFO] 当前证书到期时间：Dec  9 07:00:55 2026 GMT
[2026-09-10 17:35:50] [INFO] 证书距离过期还有超过 15 天，无需更新。
[2026-09-10 17:35:50] [INFO] ========== 检查结束 ==========

```



### 注意

`tailscale cert` 对仍有效的证书不会重新签发，**只要当前证书还在有效期内，`tailscale cert` 就不会重新生成**，除非你显式强制。目的是避免频繁申请 Let's Encrypt 证书、触发速率限制。

这个“需要续期”的判断阈值，根据 Tailscale 的版本和策略不同，通常是：

- **证书到期前 14 天**：这是 Tailscale 早期硬编码的续期逻辑。
- **证书剩余有效期低于 1/3**：对于 90 天有效期的证书，大约也是在到期前 30 天左右。