import { ReactNode } from "react";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <body className="-mt-16">{children}</body>;
}
