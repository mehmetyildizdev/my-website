import { ReactNode } from "react";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="-mt-16">{children}</div>;
}
