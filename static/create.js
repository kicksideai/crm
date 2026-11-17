import { W as o, l as r } from "./wc-runtime-Be-ICKk2.js";
import { c as n } from "./crmStyles-bezepf8D.js";
import { define as i } from "@wippy-fe/proxy";
const a = {
  type: "object",
  properties: {
    "parent-id": { type: "string", default: "", description: "Workspace folder that owns the CRM." },
    mode: { type: "string", default: "create" },
    type: { type: "string", default: "" }
  }
};
class e extends o {
  static get wippyConfig() {
    return { propsSchema: a, hostCssKeys: ["themeConfigUrl"], inlineCss: n };
  }
  static get vueConfig() {
    return r(() => import("./CrmCreate-CcJ9gsaT.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the CRM creation form…", failed: "Could not load the CRM creation form. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function c() {
  return e;
}
i(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=create.js.map
