import { W as t } from "./index-BzYkOw4T.js";
import { s as r } from "./surface-AKPuj56F.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const o = { type: "object", properties: { "crm-id": { type: "string", default: "", description: "CRM workspace id." }, "component-id": { type: "string", default: "", description: "CRM component id." }, "object-type": { type: "string", default: "", description: "Declared CRM object type to search." }, placeholder: { type: "string", default: "Search records…", description: "Search input placeholder." }, value: { type: "string", default: "", description: "Selected record id." } } };
class p extends t {
  static get wippyConfig() {
    return { propsSchema: o, hostCssKeys: ["themeConfigUrl"], inlineCss: r };
  }
  static get vueConfig() {
    return { lazyConfig: () => import("./CrmRecordPicker-BSqY765b.js").then((e) => ({ rootComponent: e.default })) };
  }
}
i(import.meta.url, p);
//# sourceMappingURL=picker.js.map
