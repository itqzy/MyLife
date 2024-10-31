## 什么是 Node 版本管理

Node.js 是一个开源、跨平台的 JavaScript 运行时环境，使得 JavaScript 能够运行在服务端，在现代前端和全栈开发中具有重要地位。

通常，我们会直接访问 [Node.js 官网](https://nodejs.cn/) 下载并安装 Node.js。但这种方式存在两个常见问题：

1. **版本更新频繁**：Node.js 的版本迭代较快，手动检查更新和重新安装新版本非常耗时。
2. **无法并存多个版本**：一台计算机上通常只能安装一个版本的 Node.js。这在需要不同版本支持的项目中可能会带来困扰，例如，一个项目依赖 Node.js v16，而另一个项目需要 Node.js v18。

为了简化版本管理并实现不同版本间的快速切换，我们可以使用 Node 版本管理工具来解决这些问题。

## fnm 是什么

🚀 `fnm`（Fast Node Manager）是一个快速、简洁的 Node.js 版本管理器，用 Rust 构建，能够帮助我们轻松管理和切换 Node.js 版本。

### fnm 安装

在 Windows 上，可以通过以下命令安装 `fnm`：

```bash
winget install Schniz.fnm
```

### fnm 配置

在安装后，`fnm` 需要配置环境变量，以便在不同路径下自动加载所需的 Node.js 版本。请按以下步骤配置：

1. **配置 fnm 环境变量**

   在 PowerShell 中，`fnm` 的环境变量需要添加到 PowerShell 配置文件中，以便每次启动时自动加载。

   #### 步骤 1：打开 PowerShell 配置文件

   使用以下命令编辑 PowerShell 配置文件：

   ```powershell
   notepad $PROFILE
   ```

   如果文件不存在，系统会提示创建新文件。

   #### 步骤 2：添加 fnm 配置命令

   在配置文件中添加以下内容：

   ```powershell
   fnm env | Out-String | Invoke-Expression
   ```

   这样，每次启动 PowerShell 时，`fnm` 都会自动加载所需的环境变量。

   #### 步骤 3：保存并重启 PowerShell

   保存配置文件并重启 PowerShell，以确保配置生效。

2. **验证配置**

   在 PowerShell 重新启动后，运行以下命令验证 `fnm` 是否正确配置：

   ```powershell
   fnm use 16.20.2
   ```

   这将切换到指定的 Node.js 版本，如果没有报错说明配置成功。

3. **检查配置文件路径**

   如果需要确认配置文件的具体路径，可以运行以下命令：

   ```powershell
   echo $PROFILE
   ```

   该路径通常位于用户目录下的 `Documents\PowerShell\Microsoft.PowerShell_profile.ps1`。

4. **设置 PowerShell 执行策略**

   如果 PowerShell 阻止脚本运行，可能是执行策略限制了脚本的执行。可以通过以下步骤解决：

   - **检查当前执行策略**：

     ```powershell
     Get-ExecutionPolicy
     ```

     如果结果是 `Restricted`，表示脚本执行被禁用。

   - **临时允许脚本执行**：

     如果只需在当前会话允许脚本运行：

     ```powershell
     Set-ExecutionPolicy Bypass -Scope Process
     ```

   - **永久更改执行策略**：

     如果希望永久启用脚本执行，运行以下命令：

     ```powershell
     Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

     `RemoteSigned` 策略允许本地脚本直接运行，而外部下载的脚本需经过签名认证。

   - **重新加载配置文件**：

     修改执行策略后，重新加载 PowerShell 配置文件：

     ```powershell
     . $PROFILE
     ```

### 常用 fnm 命令

1. **下载并使用指定版本**：

   ```bash
   fnm use --install-if-missing 16
   ```

2. **卸载指定版本**：

   ```bash
   fnm uninstall 16.12.0
   ```

3. **查看本地安装的 Node.js 版本**：

   ```bash
   fnm list
   ```

4. **设置全局默认版本**：

   ```bash
   fnm default 16.12.0
   ```

5. **在当前 Shell 中使用指定版本**：

   ```bash
   fnm use 16.12.0
   ```

通过 `fnm`，我们可以简化 Node.js 版本管理流程，快速切换 Node.js 版本并解决项目依赖不同版本带来的兼容性问题。