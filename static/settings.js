import { W as o, l as n } from "./wc-runtime-Be-ICKk2.js";
import { c as i } from "./crmStyles-bezepf8D.js";
import { define as r } from "@wippy-fe/proxy";
const s = { type: "object", properties: { "component-id": { type: "string", default: "", description: "CRM component id." } } };
class e extends o {
  static get wippyConfig() {
    return { propsSchema: s, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: i };
  }
  static get vueConfig() {
    return {
      ...n(() => import("./settings-mount-CJ7m_q06.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the CRM settings. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function g() {
  return e;
}
r(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=settings.js.map
