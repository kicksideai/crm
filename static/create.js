import { W as e, u as o } from "./wc-runtime-CNDpK4lj.js";
import { c as r } from "./crmStyles-FURw0f4P.js";
import { l as n } from "./lazy-Cfv2E3SG.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const s = {
  type: "object",
  properties: {
    "parent-id": { type: "string", default: "", description: "Workspace folder that owns the CRM." },
    mode: { type: "string", default: "create" },
    type: { type: "string", default: "" }
  }
}, a = n(
  () => import("./CrmCreate-D6Hr72ow.js"),
  { loading: "Loading the CRM creation form…", failed: "Could not load the CRM creation form. Reload the page to try again." },
  o
);
class t extends e {
  static get wippyConfig() {
    return { propsSchema: s, hostCssKeys: ["themeConfigUrl"], inlineCss: r };
  }
  static get vueConfig() {
    return { rootComponent: a };
  }
}
async function C() {
  return t;
}
i(import.meta.url, t);
export {
  C as webComponent
};
//# sourceMappingURL=create.js.map
