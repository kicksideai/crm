import { W as t } from "./index-BzYkOw4T.js";
import { P as i } from "./primevue-plugin-BK4VDKFT.js";
import { c as r } from "./crmStyles-CmIx_Z1C.js";
import "@iconify/vue";
import { define as o } from "@wippy-fe/proxy";
const n = {
  type: "object",
  properties: {
    route: { type: "string", default: "", description: "CRM object, record, review, or model route." },
    "component-id": { type: "string", default: "", description: "CRM component id." },
    "entry-id": { type: "string", default: "", description: "CRM component id supplied by the Workspace manage view." }
  }
};
class p extends t {
  static get wippyConfig() {
    return { propsSchema: n, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: r };
  }
  static get vueConfig() {
    return { lazyConfig: () => import("./CrmSurface-CUAz0qWn.js").then((e) => ({ rootComponent: e.default, plugins: [i] })) };
  }
}
o(import.meta.url, p);
//# sourceMappingURL=surface.js.map
