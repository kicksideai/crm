import { _ as g, P as y } from "./CrmSettings.vue_vue_type_script_setup_true_lang-vvRk7aa4.js";
import { defineComponent as C, ref as r, computed as k, onMounted as b, openBlock as n, createElementBlock as l, createVNode as m, unref as d, createTextVNode as w, createElementVNode as i, toDisplayString as M, createBlock as R } from "vue";
import { Icon as p } from "@iconify/vue";
import { a as N } from "./wc-runtime-CNDpK4lj.js";
import { b as P, m as V } from "./crm-model-BaRhr3mT.js";
const x = { class: "crm-admin-root" }, B = {
  key: 0,
  class: "crm-state full"
}, I = {
  key: 1,
  class: "crm-state full error",
  role: "alert"
}, S = {
  key: 2,
  class: "crm-state full"
}, h = /* @__PURE__ */ C({
  __name: "CrmSettingsRoot",
  setup(E) {
    const v = N(), t = r(null), s = r(!0), a = r(""), c = r(!0), f = k(() => String(v.value?.componentId || "").trim());
    async function u() {
      s.value = !0, a.value = "";
      try {
        const e = await P(f.value);
        if ("provisioned" in e) {
          t.value = null;
          return;
        }
        t.value = e, c.value = e.can_write;
      } catch (e) {
        a.value = V(e, "CRM administration could not load.");
      } finally {
        s.value = !1;
      }
    }
    return b(u), (e, o) => (n(), l("main", x, [
      s.value ? (n(), l("div", B, [
        m(d(p), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        o[1] || (o[1] = w(" Opening CRM administration…", -1))
      ])) : a.value ? (n(), l("div", I, [
        m(d(p), { icon: "tabler:alert-circle" }),
        i("div", null, [
          o[2] || (o[2] = i("strong", null, "CRM administration could not load", -1)),
          i("span", null, M(a.value), 1)
        ]),
        i("button", {
          class: "crm-button",
          onClick: u
        }, "Try again")
      ])) : t.value ? (n(), R(g, {
        key: 3,
        "crm-id": t.value.crm_id,
        initial: t.value,
        "can-write": c.value,
        onChanged: o[0] || (o[0] = (_) => t.value = _)
      }, null, 8, ["crm-id", "initial", "can-write"])) : (n(), l("div", S, "No CRM workspace has been created yet."))
    ]));
  }
}), j = {
  rootComponent: h,
  plugins: [y]
};
export {
  j as mountConfig
};
//# sourceMappingURL=settings-mount-CuIz1vkO.js.map
