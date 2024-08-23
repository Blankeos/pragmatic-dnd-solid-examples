import "@/styles/app.css";

import { type FlowProps } from "solid-js";

export default function RootLayout(props: FlowProps) {
  return <>{props.children}</>;
}
