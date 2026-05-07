---
id: mylife-automation-workflow
title: MyLife 博客自动化工作流详解
description: 详细介绍如何使用 Hermes Agent 自动化管理 MyLife 博客，包括 API 推送、确认机制和本地备份
---

# MyLife 博客自动化工作流详解

本文档详细记录了我们为 MyLife 博客搭建的完整自动化工作流，包括技术方案、使用流程和最佳实践。

## 背景与需求

### 原始痛点

- **网络限制**: 容器内无法直接使用 `git clone/push` 访问 GitHub（SSL 握手超时）
- **流程繁琐**: 传统方式需要本地编辑 → 提交 → 推送多个步骤
- **缺乏备份**: API 推送后本地没有文件副本
- **无确认机制**: 直接推送可能导致不满意的内容发布

### 设计目标

1. 绕过网络限制，实现稳定推送
2. 支持发布前确认，避免误操作
3. 自动同步本地备份，支持离线编辑
4. 保持原有工作流习惯，无缝切换

## 技术方案

### 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                        工作流程图                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   用户提供主题                                               │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │ Hermes  │───▶│ 生成文章 │───▶│ 展示确认 │                │
│   └─────────┘    └─────────┘    └────┬────┘                │
│                                      │                      │
│                        ┌─────────────┴─────────────┐        │
│                        │                           │        │
│                        ▼                           ▼        │
│                  ┌──────────┐              ┌──────────┐     │
│                  │ 确认推送 │              │ 修改内容 │     │
│                  └────┬─────┘              └────┬─────┘     │
│                       │                         │           │
│                       ▼                         │           │
│              ┌─────────────────┐                │           │
│              │ GitHub API 推送 │◀───────────────┘           │
│              └────────┬────────┘                           │
│                       │                                    │
│           ┌───────────┼───────────┐                        │
│           ▼           ▼           ▼                        │
│      ┌────────┐  ┌────────┐  ┌────────┐                   │
│      │ GitHub │  │本地备份 │  │Cloudflare│                  │
│      └────────┘  └────────┘  └────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 技术选型

| 组件 | 技术 | 说明 |
|------|------|------|
| 推送方式 | GitHub REST API | 绕过 git SSL 问题 |
| 认证方式 | Personal Access Token | 安全、可控 |
| 本地备份 | Git 克隆 | 保留完整历史 |
| 自动化 | Python + Bash 脚本 | 灵活、可维护 |

### 目录结构

```
/volume1/docker/hermes-work/mylife-blog/
├── blog-posts/              # 待发布文章临时存放
│   └── published/          # 已发布文章归档
├── docs/                   # 文档目录
├── scripts/                # 自动化脚本
│   ├── github-api-push.py         # 主推送脚本
│   ├── auto-sync-after-push.sh    # 自动同步备份
│   ├── sync-local-repo.sh         # 手动同步
│   └── update-docs.py             # 更新 docs
└── MyLife-local/          # 本地备份仓库
    ├── blog/               # 博客文章
    └── docs/               # 知识库文档
```

## 使用流程

### 方式一：快速发布（推荐）

适用于发布新博客文章，全流程自动化。

#### 步骤 1: 提供主题

告诉 Hermes 你想写的主题：

```
"帮我写一篇关于 AI 工具使用心得的博客文章"
```

#### 步骤 2: 内容确认

Hermes 会生成文章并展示给你：

```
📝 博客文章预览
================================================
---
slug: ai-gong-ju-shi-yong-xin-de
title: AI 工具使用心得
authors: [allen]
tags: [AI, 工具, 效率]
---

# AI 工具使用心得

近期在工作中大量使用了 AI 工具...
[内容预览]
================================================

请确认是否推送？
回复 "确认推送" 或 "修改 XXX 内容"
```

#### 步骤 3: 确认推送

- **满意**: 回复 "确认推送"
- **需修改**: 回复具体修改意见，如 "标题改为 XXX"

#### 步骤 4: 自动完成

确认后自动执行：
1. API 推送到 GitHub
2. 触发 Cloudflare 部署
3. 同步到本地备份 `MyLife-local/`

### 方式二：本地编辑

适用于精细修改、批量更新或编辑 docs。

#### 场景 A: 编辑已有文章

```bash
# 直接编辑本地备份
vim /volume1/docker/hermes-work/MyLife-local/blog/2025-05-07-xxx.md

# 提交更新
cd /volume1/docker/hermes-work/MyLife-local
git add .
git commit -m "update: 修改文章内容"
git push origin main
```

#### 场景 B: 创建新文章

```bash
# 1. 同步最新代码
bash /volume1/docker/hermes-work/mylife-blog/scripts/sync-local-repo.sh

# 2. 创建新文章
cd /volume1/docker/hermes-work/MyLife-local/blog
cp template.md 2025-05-08-new-post.md
vim 2025-05-08-new-post.md

# 3. 推送
git add . && git commit -m "add blog" && git push
```

#### 场景 C: 更新知识库 (docs)

```bash
# 编辑 docs 文件
vim /volume1/docker/hermes-work/MyLife-local/docs/AI/xxx.md

# 或使用脚本推送
cd /volume1/docker/hermes-work/MyLife-local
# 编辑后
python3 ../mylife-blog/scripts/update-docs.py
```

## 技术细节

### GitHub API 推送原理

传统 git 方式在容器内失败：

```bash
$ git clone https://github.com/itqzy/MyLife.git
# SSL 握手超时...
```

改用 HTTP API 直接操作文件：

```python
import urllib.request
import base64

# 读取文件
with open('article.md', 'rb') as f:
    content = base64.b64encode(f.read()).decode()

# API 请求
data = {
    'message': 'add blog',
    'content': content,
    'branch': 'main'
}

req = urllib.request.Request(
    'https://api.github.com/repos/itqzy/MyLife/contents/blog/article.md',
    data=json.dumps(data).encode(),
    headers={
        'Authorization': 'token ghp_xxxx',
        'Content-Type': 'application/json'
    },
    method='PUT'
)

urllib.request.urlopen(req)
```

### 自动同步备份机制

推送成功后自动执行：

```bash
#!/bin/bash
# auto-sync-after-push.sh

REPO_DIR="/volume1/docker/hermes-work/MyLife-local"

if [ -d "$REPO_DIR/.git" ]; then
    cd "$REPO_DIR"
    git pull origin main
else
    git clone https://github.com/itqzy/MyLife.git "$REPO_DIR"
fi
```

### 确认机制实现

在 Weixin 环境中的交互流程：

1. Hermes 生成文章 → 保存到临时文件
2. 读取文件内容 → 展示给用户
3. 等待用户回复
4. 根据回复决定：
   - "确认推送" → 执行 API 推送
   - "修改 XXX" → 重新生成 → 回到步骤 2

## 最佳实践

### 博客文章规范

**文件命名**: `YYYY-MM-DD-文章标题拼音.md`

示例: `2025-05-07-AI-gong-ju-shi-yong-xin-de.md`

**前置元数据**:

```yaml
---
slug: wen-zhang-biao-shi       # URL 友好标识
title: 文章标题                 # 显示标题
authors: [allen]              # ⚠️ 必须是 allen
tags: [标签1, 标签2]           # 分类标签
---
```

**内容建议**:
- 使用 `<!-- truncate -->` 标记摘要截断点
- 添加适当的标题层级
- 包含代码块时使用正确的语言标识

### 冲突避免

1. **推送前确认**: 避免重复推送相同内容
2. **本地编辑前拉取**: 
   ```bash
   cd MyLife-local && git pull
   ```
3. **文件移动注意**: blog ↔ docs 需要修改 frontmatter

### 常见问题

**Q: 推送成功但网站没更新？**
A: 检查 Cloudflare 构建日志，可能是：
- 作者名称错误（必须用 allen）
- 前置元数据格式错误
- 构建队列延迟（等待 1-2 分钟）

**Q: 本地备份和 GitHub 不一致？**
A: 执行同步脚本：
```bash
bash mylife-blog/scripts/sync-local-repo.sh
```

**Q: 如何更新 docs 知识库？**
A: 推荐使用本地编辑方式：
```bash
# 编辑 docs/AI/xxx.md
python3 mylife-blog/scripts/update-docs.py
```

## 总结

这套工作流结合了 API 推送的便捷性和本地备份的可靠性：

- **快速发布**: 一句话生成并发布博客
- **内容可控**: 确认机制避免误操作
- **本地备份**: 自动同步，随时可编辑
- **灵活切换**: 既可用 API 快速发布，也可本地精细编辑

关键优势在于**不用改变原有习惯**，只是在原有基础上增加了自动化和确认环节。

---

*文档生成时间: 2025-05-07*  
*作者: Hermes Agent*  
*位置: docs/AI/mylife-automation-workflow.md*
