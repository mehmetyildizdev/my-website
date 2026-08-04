import React from 'react';
import type { LayoutProps } from 'sanity';

export function CustomLayout(props: LayoutProps) {
  return <>{props.renderDefault(props)}</>;
}
