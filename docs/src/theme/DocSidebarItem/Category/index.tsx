import React, { type ReactNode } from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type { WrapperProps } from '@docusaurus/types';
import * as icons from 'lucide-react';

type Props = WrapperProps<typeof CategoryType>;

const ICON_SIZE = 16;

export default function CategoryWrapper(props: Props): ReactNode {
  const iconName = (props.item.customProps?.icon as string) ?? null;
  const IconComponent = iconName ? (icons[iconName] as icons.LucideIcon) : null;

  if (IconComponent) {
    return (
      <Category
        {...props}
        item={{
          ...props.item,
          label: (
            <>
              <IconComponent size={ICON_SIZE} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
              {props.item.label}
            </>
          ) as unknown as string,
        }}
      />
    );
  }

  return <Category {...props} />;
}
