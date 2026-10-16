import { defineComponent as x, useAttrs as E, computed as p, ref as i, openBlock as c, createElementBlock as u, withModifiers as I, createElementVNode as a, withDirectives as N, vModelText as S, createVNode as f, unref as v, createTextVNode as C, toDisplayString as b, createCommentVNode as y, normalizeClass as V } from "vue";
import { Icon as _ } from "@iconify/vue";
import { api as D } from "@wippy-fe/proxy";
import { u as U, a as B } from "./index-BzYkOw4T.js";
const T = { class: "crm-create-field" }, j = {
  key: 0,
  class: "crm-create-error",
  role: "alert"
}, z = { class: "crm-create-actions" }, A = ["disabled"], K = ["disabled"], J = /* @__PURE__ */ x({
  __name: "CrmCreate",
  setup(P) {
    const d = U(), m = B(), s = E(), h = p(() => String(d.value?.parentId || "").trim()), M = p(() => String(s.mode || d.value?.mode || "") !== "initial"), l = i(""), o = i(!1), r = i(""), g = crypto.randomUUID();
    function k(t) {
      const e = { id: t };
      m("created", e);
      const n = s.onCreated;
      typeof n == "function" && n(e);
    }
    async function w() {
      if (!o.value) {
        o.value = !0, r.value = "";
        try {
          const { data: t } = await D.post("/api/v1/workspace/crm", {
            title: l.value.trim() || "CRM",
            parent_id: h.value,
            idempotency_key: g
          }), e = String(t?.id || "").trim();
          if (t?.success !== !0 || !e) throw new Error(t?.error || "CRM could not be created.");
          k(e);
        } catch (t) {
          r.value = t instanceof Error ? t.message : "CRM could not be created.";
        } finally {
          o.value = !1;
        }
      }
    }
    function R() {
      const t = {};
      m("close", t);
      const e = s.onClose;
      typeof e == "function" && e(t);
    }
    return (t, e) => (c(), u("form", {
      class: "crm-create",
      "aria-label": "Create CRM",
      onSubmit: I(w, ["prevent"])
    }, [
      a("label", T, [
        e[1] || (e[1] = a("span", null, "Name", -1)),
        N(a("input", {
          "onUpdate:modelValue": e[0] || (e[0] = (n) => l.value = n),
          type: "text",
          autocomplete: "off",
          autofocus: "",
          placeholder: "CRM"
        }, null, 512), [
          [S, l.value]
        ])
      ]),
      e[2] || (e[2] = a("p", { class: "crm-create-hint" }, "Create an empty CRM workspace. Install a business module or define its objects and fields after creation.", -1)),
      r.value ? (c(), u("p", j, [
        f(v(_), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        C(b(r.value), 1)
      ])) : y("", !0),
      a("footer", z, [
        M.value ? (c(), u("button", {
          key: 0,
          class: "crm-button ghost",
          type: "button",
          disabled: o.value,
          onClick: R
        }, "Cancel", 8, A)) : y("", !0),
        a("button", {
          class: "crm-button primary",
          type: "submit",
          disabled: o.value
        }, [
          f(v(_), {
            icon: o.value ? "tabler:loader-2" : "tabler:plus",
            class: V({ spin: o.value }),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          C(" " + b(o.value ? "Creating…" : "Create CRM"), 1)
        ], 8, K)
      ])
    ], 32));
  }
});
export {
  J as _
};
//# sourceMappingURL=CrmCreate.vue_vue_type_script_setup_true_lang-C0vvaoVz.js.map
