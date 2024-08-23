import "@/styles/app.css";

import { type FlowProps } from "solid-js";

export default function RootLayout(props: FlowProps) {
  return (
    <>
      <nav class="flex gap-x-2 p-4">
        <a href="/">Basic Grid</a>
        <span>|</span>
        <a href="/flip-animation">Flip Animation</a>
      </nav>
      {props.children}
    </>
  );
}
