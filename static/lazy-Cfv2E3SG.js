import { Icon as a } from "@iconify/vue";
import { defineAsyncComponent as u, defineComponent as l, h as r, onMounted as p } from "vue";
const i = 3e4, d = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", m = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function f(t) {
  let e;
  const o = new Promise((n, c) => {
    e = setTimeout(() => c(new Error(`Loading timed out after ${i} ms.`)), i);
  });
  return Promise.race([t, o]).finally(() => clearTimeout(e));
}
function y(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function s(t, e, o) {
  const n = o();
  p(() => n("error", { message: t, error: e }));
}
function w(t, e, o) {
  return () => f(t()).catch((n) => ({
    rootComponent: l(() => (s(e, n, o), () => r("wippy-error", { title: "Failed to load", message: e })))
  }));
}
function x(t, e, o) {
  return u({
    loader: t,
    loadingComponent: {
      render: () => r("span", {
        role: "status",
        "data-lazy-state": "loading",
        "aria-label": e.loading,
        style: `${d}color:var(--p-text-muted-color);`
      }, r("span", { style: "display:inline-flex;", onVnodeMounted: y }, r(a, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: l({
      props: { error: { type: Error, required: !0 } },
      setup(n) {
        return s(e.failed, n.error, o), () => r("span", {
          role: "alert",
          "data-lazy-state": "failed",
          title: e.iconOnly ? e.failed : void 0,
          style: `${d}color:var(--p-danger-500);`
        }, e.iconOnly ? [r(a, { icon: "tabler:alert-circle", "aria-hidden": "true" }), r("span", { style: m }, e.failed)] : e.failed);
      }
    }),
    delay: e.immediate ? 0 : 200,
    timeout: i,
    suspensible: !1
  });
}
export {
  w as a,
  x as l
};
//# sourceMappingURL=lazy-Cfv2E3SG.js.map
