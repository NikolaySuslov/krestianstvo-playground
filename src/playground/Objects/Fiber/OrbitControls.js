import { createSignal, onCleanup, createMemo, createEffect } from 'solid-js';
import { useThree, useFrame } from "@krestianstvo/solid-three";
import { OrbitControls as OrbitControls$1 } from "three-stdlib";

export const OrbitControls = (props) => {
    const invalidate = useThree(({invalidate: invalidate2}) => invalidate2);
    const defaultCamera = useThree(({
      camera
    }) => camera);
    const gl = useThree(({
      gl: gl2
    }) => gl2);
    useThree(({
      events
    }) => events);
    const set = useThree(({
      set: set2
    }) => set2);
    const get = useThree(({
      get: get2
    }) => get2);
    useThree(({
      performance
    }) => performance);
    const orbitControls = createMemo(() => new OrbitControls$1(defaultCamera()));
    useFrame(() => {
      let controls = orbitControls();
      if (controls.enabled)
        controls.update();
    }, -1);
    createEffect(() => {
      const callback = (e) => {
        var _a;
        invalidate();
        (_a = props.onChange) == null ? void 0 : _a.call(props, e);
      };
      orbitControls().connect(gl().domElement);
      orbitControls().addEventListener("change", callback);
      if (props.onStart)
        orbitControls().addEventListener("start", props.onStart);
      if (props.onEnd)
        orbitControls().addEventListener("end", props.onEnd);
      onCleanup(() => {
        orbitControls().removeEventListener("change", callback);
        if (props.onStart)
          orbitControls().removeEventListener("start", props.onStart);
        if (props.onEnd)
          orbitControls().removeEventListener("end", props.onEnd);
        orbitControls().dispose();
      });
    });
    createEffect(() => {
      if (props.makeDefault) {
        const old = get()().controls;
        set()({
          controls: orbitControls()
        });
        onCleanup(() => set()({
          controls: old
        }));
      }
    });
    return null;
  };
  