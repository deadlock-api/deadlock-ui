import React, { type ReactNode } from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type { WrapperProps } from '@docusaurus/types';
import * as icons from 'lucide-react';

type Props = WrapperProps<typeof LinkType>;

const ICON_SIZE = 14;

export default function LinkWrapper(props: Props): ReactNode {
  const iconName = (props.item.customProps?.icon as string) ?? null;
  const IconComponent = iconName ? (icons[iconName] as icons.LucideIcon) : null;

  const badge = (props.item.customProps?.badge as string) ?? null;

  const label = (
    <>
      {IconComponent && <IconComponent size={ICON_SIZE} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />}
      {props.item.label}
      {badge && (
        <span
          style={{
            marginLeft: 8,
            fontSize: 10,
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: 4,
            background: 'var(--ifm-color-warning-contrast-background)',
            color: 'var(--ifm-color-warning-contrast-foreground)',
            verticalAlign: 'middle',
          }}
        >
          {badge}
        </span>
      )}
    </>
  ) as unknown as string;

  if (IconComponent || badge) {
    return <Link {...props} item={{ ...props.item, label }} />;
  }

  return <Link {...props} />;
}
