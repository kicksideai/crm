import { W as t, u as o } from "./wc-runtime-CNDpK4lj.js";
import { l as r } from "./lazy-Cfv2E3SG.js";
import { s as i } from "./surface-1WqTw1e0.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const p = { type: "object", properties: { "crm-id": { type: "string", default: "", description: "CRM workspace id." }, "component-id": { type: "string", default: "", description: "CRM component id." }, "object-type": { type: "string", default: "", description: "Declared CRM object type to search." }, placeholder: { type: "string", default: "Search records…", description: "Search input placeholder." }, value: { type: "string", default: "", description: "Selected record id." } } }, s = r(
  () => import("./CrmRecordPicker-yqumBzKw.js"),
  { loading: "Loading the record picker…", failed: "Could not load the record picker. Reload the page to try again." },
  o
);
class e extends t {
  static get wippyConfig() {
    return { propsSchema: p, hostCssKeys: ["themeConfigUrl"], inlineCss: i };
  }
  static get vueConfig() {
    return { rootComponent: s };
  }
}
async function f() {
  return e;
}
n(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=picker.js.map
