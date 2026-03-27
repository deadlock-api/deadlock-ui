import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    { type: 'doc', id: 'getting-started', label: 'Getting Started', customProps: { icon: 'Rocket' } },
    {
      type: 'category',
      label: 'Components',
      collapsible: false,
      customProps: { icon: 'Puzzle' },
      items: [
        { type: 'doc', id: 'components/dl-provider', label: 'Provider', customProps: { icon: 'Settings' } },
        { type: 'doc', id: 'components/dl-item-card', label: 'ItemCard', customProps: { icon: 'Square' } },
        { type: 'doc', id: 'components/dl-shop-panel', label: 'ShopPanel', customProps: { icon: 'LayoutGrid' } },
        { type: 'doc', id: 'components/dl-build-panel', label: 'BuildPanel', customProps: { icon: 'Hammer', badge: 'WIP' } },
      ],
    },
    {
      type: 'category',
      label: 'Frameworks',
      collapsible: true,
      customProps: { icon: 'Zap' },
      items: [
        { type: 'doc', id: 'frameworks/react', label: 'React', customProps: { icon: 'Atom' } },
        { type: 'doc', id: 'frameworks/vue', label: 'Vue', customProps: { icon: 'Triangle' } },
      ],
    },
    { type: 'doc', id: 'types', label: 'Types', customProps: { icon: 'FileType' } },
  ],
};

export default sidebars;
