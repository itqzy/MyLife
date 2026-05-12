// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MyLife Blog',
  tagline: 'Personal Knowledge Base',
  favicon: 'img/favicon.ico',
  url: 'https://your-domain.com',
  baseUrl: '/',
  organizationName: 'itqzy',
  projectName: 'MyLife',
  deploymentBranch: 'main',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
          blogTitle: '博客',
          blogDescription: '个人博客文章',
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
      navbar: {
        title: 'MyLife',
        items: [
          { to: '/blog', label: '博客', position: 'left' },
          { to: '/docs/intro', label: '知识库', position: 'left' },
        ],
      },
    }),
};

module.exports = config;
