import { W as o, l as r } from "./wc-runtime-Be-ICKk2.js";
import { s as i } from "./surface-D9EVvOmc.js";
import { define as n } from "@wippy-fe/proxy";
const p = { type: "object", properties: { "crm-id": { type: "string", default: "", description: "CRM workspace id." }, "component-id": { type: "string", default: "", description: "CRM component id." }, "object-type": { type: "string", default: "", description: "Declared CRM object type to search." }, placeholder: { type: "string", default: "Search records…", description: "Search input placeholder." }, value: { type: "string", default: "", description: "Selected record id." } } };
class e extends o {
  static get wippyConfig() {
    return { propsSchema: p, hostCssKeys: ["themeConfigUrl"], inlineCss: i };
  }
  static get vueConfig() {
    return r(() => import("./CrmRecordPicker-D8LqacFP.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the record picker…", failed: "Could not load the record picker. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function l() {
  return e;
}
n(import.meta.url, e);
export {
  l as webComponent
};
//# sourceMappingURL=picker.js.map
