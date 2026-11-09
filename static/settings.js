import { W as o, u as n } from "./wc-runtime-CNDpK4lj.js";
import { c as i } from "./crmStyles-FURw0f4P.js";
import { a as r } from "./lazy-Cfv2E3SG.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const p = { type: "object", properties: { "component-id": { type: "string", default: "", description: "CRM component id." } } };
class t extends o {
  static get wippyConfig() {
    return { propsSchema: p, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: i };
  }
  static get vueConfig() {
    return {
      lazyConfig: r(
        () => import("./settings-mount-CuIz1vkO.js").then((e) => e.mountConfig),
        "Could not load the CRM settings. Reload the page to try again.",
        n
      )
    };
  }
}
async function C() {
  return t;
}
s(import.meta.url, t);
export {
  C as webComponent
};
//# sourceMappingURL=settings.js.map
