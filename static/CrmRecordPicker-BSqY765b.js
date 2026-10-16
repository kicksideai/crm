import { defineComponent as p, computed as t, openBlock as s, createBlock as m } from "vue";
import { u as d, a as i } from "./index-BzYkOw4T.js";
import { _ as v } from "./RecordPickerControl.vue_vue_type_script_setup_true_lang-DqL5RXQ_.js";
const h = /* @__PURE__ */ p({
  __name: "CrmRecordPicker",
  setup(_) {
    const e = d(), c = i(), l = t(() => String(e.value?.crmId || e.value?.componentId || "").trim()), r = t(() => String(e.value?.objectType || "").trim()), a = t(() => e.value?.value), n = t(() => e.value?.placeholder);
    function u(o) {
      c("crm-record-selected", o ? { record_id: o.record_id, object_type: o.object_type, values: o.values } : { record_id: null });
    }
    return (o, f) => (s(), m(v, {
      "crm-id": l.value,
      "object-type": r.value,
      "model-value": a.value,
      placeholder: n.value,
      onSelect: u
    }, null, 8, ["crm-id", "object-type", "model-value", "placeholder"]));
  }
});
export {
  h as default
};
//# sourceMappingURL=CrmRecordPicker-BSqY765b.js.map
