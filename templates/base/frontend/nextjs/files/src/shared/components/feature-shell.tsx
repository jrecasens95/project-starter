import type { PropsWithChildren } from "react";

export function FeatureShell({ children }: PropsWithChildren) {
  return <main className="page-shell">{children}</main>;
}
