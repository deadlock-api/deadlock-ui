import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import repoConfig from '../repo.config.mjs';

const config: Config = {
  title: repoConfig.projectName,
  tagline: 'Open-source Web Components for Deadlock game items',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: repoConfig.docsUrl,
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Allow web components in MDX
  markdown: {
    format: 'mdx',
  },

  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'module',
        src: '/deadlock-ui/main.esm.js',
      },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: repoConfig.projectName,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/playground',
          label: 'Playground',
          position: 'left',
        },
        {
          to: '/items',
          label: 'Items',
          position: 'left',
        },
        {
          to: '/heroes',
          label: 'Heroes',
          position: 'left',
        },
        {
          href: repoConfig.githubUrl,
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
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Components', to: '/docs/components/dl-provider' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Deadlock API', href: 'https://deadlock-api.com/' },
            { label: 'StencilJS', href: 'https://stenciljs.com/' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ${repoConfig.projectName}. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
