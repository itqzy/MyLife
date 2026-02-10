// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '你好！我是Allen👋',
  tagline: '希望这里的内容可以帮到你！',
  favicon: 'img/favicon.ico',


  // Set the production url of your site here
  url: 'https://qimle.com/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['en', 'zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/itqzy/MyLife/tree/main/',
        },
        // 设置博客的配置
        blog: {
          blogSidebarTitle: 'All posts', // 博客侧边栏的标题
          blogSidebarCount: 'ALL', // 博客侧边栏显示所有文章
          showReadingTime: true, // 显示阅读时间
          feedOptions: {
            type: ['rss', 'atom'], // 博客的格式
            xslt: true, // 是否使用XSLT
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/itqzy/MyLife/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '首页',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '知识库',
          },
          { to: '/bookmarks', label: '收藏夹', position: 'left' },
          { to: '/blog', label: '碎碎念', position: 'left' },
          { to: '/AboutMe', label: '关于我', position: 'left' },
          {
            href: 'https://github.com/itqzy/MyLife',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: '知识库',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Projects',
            items: [
              {
                label: 'MyLife',
                href: 'https://github.com/itqzy/MyLife',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: '关于我',
                to: '/AboutMe',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/itqzy',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} allen, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,

        },
      },
      // 设置文档目录的层级
      themeConfig: {
        tableOfContents: {
          minHeadingLevel: 2,
          maxHeadingLevel: 5,
        },
      },
    }),

  // 添加本地搜索插件配置
  themes: [
    // 其他主题配置
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      ({
        // 配置选项
        // 使用 `hashed` 模式有助于长期缓存索引文件。
        hashed: true,
        // 如果文档中有中文内容，推荐设置 `language` 为：
        language: ["en", "zh"],
      }),
    ],

  ],
};

export default config;
