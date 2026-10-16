import { W as t } from "./index-BzYkOw4T.js";
import { P as i } from "./primevue-plugin-BK4VDKFT.js";
import { c as o } from "./crmStyles-CmIx_Z1C.js";
import "@iconify/vue";
import { define as r } from "@wippy-fe/proxy";
const n = { type: "object", properties: { "component-id": { type: "string", default: "", description: "CRM component id." } } };
class s extends t {
  static get wippyConfig() {
    return { propsSchema: n, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: o };
  }
  static get vueConfig() {
    return { lazyConfig: () => import("./CrmSettingsRoot-BCMjwgpH.js").then((e) => ({ rootComponent: e.default, plugins: [i] })) };
  }
}
r(import.meta.url, s);
//# sourceMappingURL=settings.js.map
