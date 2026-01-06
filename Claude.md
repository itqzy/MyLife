## 项目信息

- **项目名称**: MyLife
- **构建工具**: Docusaurus
- **主要功能**: 个人文档和博客网站

## 注意

- 使用npm来运行和更新依赖
- 更新依赖前需要切换代理 `$Env:http_proxy="http://127.0.0.1:7890";$Env:https_proxy="http://127.0.0.1:7890"`
- 对项目结构有更改后及时更新Claude.md文件的项目结构部分

## 项目结构
```
MyLife/
├── docs/              # 文档文件夹
├── blog/              # 博客文件夹
├── src/               # 源代码
├── static/            # 静态资源
├── docusaurus.config.js  # Docusaurus 配置
├── sidebars.js        # 侧边栏配置
├── package.json       # 项目依赖
└── README.md          # 项目说明
```
## 相关文档
- [Docusaurus 官方文档](https://docusaurus.io/)
## 更新记录
- 2026-01-06: 初始化 Claude.md 文件
