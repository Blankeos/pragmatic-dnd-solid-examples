import {
  createContext,
  createEffect,
  createSignal,
  For,
  onCleanup,
  useContext,
  VoidProps,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import battery from "@/assets/battery.png";
import drill from "@/assets/drill.png";
import koala from "@/assets/koala.png";
import ui from "@/assets/ui.png";
import wallet from "@/assets/wallet.png";
import yeti from "@/assets/yeti.png";
import { cn } from "@/utils/cn.util";

const InstanceIdContext = createContext<() => string | null>(() => null);

type State = "idle" | "dragging" | "over";

const Item = (props: VoidProps<{ src: string }>) => {
  const [state, setState] = createSignal<State>("idle");

  let ref!: HTMLImageElement;
  const instanceId = useContext(InstanceIdContext);

  createEffect(() => {
    onCleanup(
      combine(
        draggable({
          element: ref,
          getInitialData: () => ({ type: "grid-item", src: props.src, instanceId: instanceId() }),
          onDragStart: () => setState("dragging"),
          onDrop: () => setState("idle"),
        }),
        dropTargetForElements({
          element: ref,
          getData: () => ({ src: props.src }),
          getIsSticky: () => true,
          canDrop: ({ source }) =>
            source.data.instanceId === instanceId() &&
            source.data.type === "grid-item" &&
            source.data.src !== props.src,
          onDragEnter: () => setState("over"),
          onDragLeave: () => setState("idle"),
          onDrop: () => setState("idle"),
        })
      )
    );
  });

  // Use the `state` to style.
  return (
    <div>
      <img
        ref={ref}
        class={cn(
          "object-cover w-full box-border p-1 rounded shadow transition-all ease-out",
          state() === "idle" && "hover:shadow-lg",
          state() === "dragging" && "grayscale-[0.8]",
          state() === "over" && "scale-[1.1] rotate-[8deg] brightness-[1.15] shadow-lg",
          props.src.includes("yeti") && "bg-yellow-500 w-20 h-20"
        )}
        // Avoid 'save image' popup on iOS
        style="-webkit-touch-callout: none; -webkit-user-select: none; user-select: none;"
        src={props.src}
      />
    </div>
  );
};

export default function Page() {
  const [items, setItems] = createStore<string[]>([battery, drill, koala, ui, wallet, yeti]);

  const [instanceId] = createSignal<string>("instance-id");

  createEffect(() => {
    console.log("[on]", 1);

    onCleanup(
      monitorForElements({
        canMonitor({ source }) {
          console.log("canMonitor", { source });
          return source.data.instanceId === instanceId();
        },
        onDrop({ source, location }) {
          console.log("onDrop", { source, location });
          const destination = location.current.dropTargets[0];
          if (!destination) {
            return;
          }
          const destinationSrc = destination.data.src;
          const startSrc = source.data.src;

          if (typeof destinationSrc !== "string") {
            return;
          }

          if (typeof startSrc !== "string") {
            return;
          }

          // swapping item positions
          const updated = [...items];
          updated[items.indexOf(startSrc)] = destinationSrc;
          updated[items.indexOf(destinationSrc)] = startSrc;

          setItems(reconcile(updated));
        },
      })
    );
  });

  return (
    <div class="max-w-2xl mx-auto">
      <InstanceIdContext.Provider value={instanceId}>
        <div class="grid grid-cols-3 gap-4 p-8">
          <For each={items}>{(src) => <Item src={src} />}</For>
        </div>
      </InstanceIdContext.Provider>
    </div>
  );
}
