import { W as t } from "./index-BzYkOw4T.js";
import { c as r } from "./crmStyles-CmIx_Z1C.js";
import "@iconify/vue";
import { define as o } from "@wippy-fe/proxy";
const i = {
  type: "object",
  properties: {
    "parent-id": { type: "string", default: "", description: "Workspace folder that owns the CRM." },
    mode: { type: "string", default: "create" },
    type: { type: "string", default: "" }
  }
};
class s extends t {
  static get wippyConfig() {
    return { propsSchema: i, hostCssKeys: ["themeConfigUrl"], inlineCss: r };
  }
  static get vueConfig() {
    return { lazyConfig: () => import("./CrmCreate-CFmNjUZd.js").then((e) => ({ rootComponent: e.default })) };
  }
}
o(import.meta.url, s);
//# sourceMappingURL=create.js.map
