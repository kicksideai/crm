import { W as o, l as i } from "./wc-runtime-Be-ICKk2.js";
import { c as r } from "./crmStyles-bezepf8D.js";
import { define as n } from "@wippy-fe/proxy";
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
    return { propsSchema: p, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: r };
  }
  static get vueConfig() {
    return {
      ...i(() => import("./surface-mount-COTEwtYl.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the CRM. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function d() {
  return e;
}
n(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=surface.js.map
