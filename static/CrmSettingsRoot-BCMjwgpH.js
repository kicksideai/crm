import { defineComponent as y, ref as r, computed as g, onMounted as k, openBlock as a, createElementBlock as l, createVNode as d, unref as m, createTextVNode as b, createElementVNode as i, toDisplayString as C, createBlock as w } from "vue";
import { Icon as p } from "@iconify/vue";
import { u as M } from "./index-BzYkOw4T.js";
import { b as R, m as N } from "./crm-model-BaRhr3mT.js";
import { _ as x } from "./CrmSettings.vue_vue_type_script_setup_true_lang-BKAWI-EU.js";
const B = { class: "crm-admin-root" }, I = {
  key: 0,
  class: "crm-state full"
}, S = {
  key: 1,
  class: "crm-state full error",
  role: "alert"
}, V = {
  key: 2,
  class: "crm-state full"
}, W = /* @__PURE__ */ y({
  __name: "CrmSettingsRoot",
  setup(h) {
    const v = M(), t = r(null), s = r(!0), n = r(""), c = r(!0), f = g(() => String(v.value?.componentId || "").trim());
    async function u() {
      s.value = !0, n.value = "";
      try {
        const e = await R(f.value);
        if ("provisioned" in e) {
          t.value = null;
          return;
        }
        t.value = e, c.value = e.can_write;
      } catch (e) {
        n.value = N(e, "CRM administration could not load.");
      } finally {
        s.value = !1;
      }
    }
    return k(u), (e, o) => (a(), l("main", B, [
      s.value ? (a(), l("div", I, [
        d(m(p), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        o[1] || (o[1] = b(" Opening CRM administration…", -1))
      ])) : n.value ? (a(), l("div", S, [
        d(m(p), { icon: "tabler:alert-circle" }),
        i("div", null, [
          o[2] || (o[2] = i("strong", null, "CRM administration could not load", -1)),
          i("span", null, C(n.value), 1)
        ]),
        i("button", {
          class: "crm-button",
          onClick: u
        }, "Try again")
      ])) : t.value ? (a(), w(x, {
        key: 3,
        "crm-id": t.value.crm_id,
        initial: t.value,
        "can-write": c.value,
        onChanged: o[0] || (o[0] = (_) => t.value = _)
      }, null, 8, ["crm-id", "initial", "can-write"])) : (a(), l("div", V, "No CRM workspace has been created yet."))
    ]));
  }
});
export {
  W as default
};
//# sourceMappingURL=CrmSettingsRoot-BCMjwgpH.js.map
