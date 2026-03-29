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
        { type: 'doc', id: 'components/dl-ability-order', label: 'AbilityOrder', customProps: { icon: 'Box', badge: 'WIP' } },
        { type: 'doc', id: 'components/dl-build-panel', label: 'BuildPanel', customProps: { icon: 'Box', badge: 'WIP' } },
        { type: 'doc', id: 'components/dl-hero-card', label: 'HeroCard', customProps: { icon: 'Box', badge: 'WIP' } },
        { type: 'doc', id: 'components/dl-hero-minimap-icon', label: 'HeroMinimapIcon', customProps: { icon: 'Box', badge: 'WIP' } },
        { type: 'doc', id: 'components/dl-item-card', label: 'ItemCard', customProps: { icon: 'Box' } },
        { type: 'doc', id: 'components/dl-provider', label: 'Provider', customProps: { icon: 'Box' } },
        { type: 'doc', id: 'components/dl-shop-panel', label: 'ShopPanel', customProps: { icon: 'Box' } },
      ],
    },
    {
      type: 'category',
      label: 'Frameworks',
      collapsible: true,
      customProps: { icon: 'Zap' },
      items: [
        { type: 'doc', id: 'frameworks/react', label: 'React' },
        { type: 'doc', id: 'frameworks/vue', label: 'Vue' },
      ],
    },
    { type: 'doc', id: 'types', label: 'Types', customProps: { icon: 'FileType' } },
  ],
};

export default sidebars;
