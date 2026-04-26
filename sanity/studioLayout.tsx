import React from "react";
import type { LayoutProps } from "sanity";

export function CustomLayout(props: LayoutProps) {
  return <div className="pt-16 h-full">{props.renderDefault(props)}</div>;
}
