import { W as o, u as r } from "./wc-runtime-CNDpK4lj.js";
import { c as i } from "./crmStyles-FURw0f4P.js";
import { a as n } from "./lazy-Cfv2E3SG.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const p = {
  type: "object",
  properties: {
    route: { type: "string", default: "", description: "CRM object, record, review, or model route." },
    "component-id": { type: "string", default: "", description: "CRM component id." },
    "entry-id": { type: "string", default: "", description: "CRM component id supplied by the Workspace manage view." }
  }
};
class e extends o {
  static get wippyConfig() {
    return { propsSchema: p, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: i };
  }
  static get vueConfig() {
    return {
      lazyConfig: n(
        () => import("./surface-mount-id8OKqaL.js").then((t) => t.mountConfig),
        "Could not load the CRM. Reload the page to try again.",
        r
      )
    };
  }
}
async function f() {
  return e;
}
s(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=surface.js.map
