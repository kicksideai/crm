import { defineComponent as P, ref as m, computed as G, watch as j, onBeforeUnmount as H, openBlock as u, createElementBlock as n, createElementVNode as y, normalizeClass as S, toDisplayString as h, unref as p, createBlock as J, createVNode as V, createCommentVNode as x, createTextVNode as B, Fragment as Q, renderList as W, withModifiers as X } from "vue";
import { Icon as k } from "@iconify/vue";
import { o as Y, x as D, e as Z, p as ee, i as ae, T as te, m as E, A as le, b as oe } from "./crm-model-BaRhr3mT.js";
const re = {
  key: 0,
  class: "crm-avatar small"
}, ue = ["value", "placeholder", "disabled", "aria-expanded", "aria-activedescendant"], ne = {
  key: 0,
  class: "crm-picker-state"
}, se = {
  key: 1,
  class: "crm-picker-state error"
}, ie = ["id", "aria-selected", "onMouseenter", "onMousedown"], ce = { class: "crm-avatar small" }, de = { key: 0 }, ve = {
  key: 3,
  class: "crm-picker-state"
}, be = /* @__PURE__ */ P({
  __name: "RecordPickerControl",
  props: {
    crmId: {},
    objectType: { default: "" },
    attributes: {},
    modelValue: { default: "" },
    placeholder: { default: "Search records…" },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue", "select"],
  setup(g, { emit: A }) {
    const l = g, w = A, s = m(""), i = m([]), c = m(null), o = m(-1), r = m(!1), d = m(!1), v = m("");
    let f, _ = 0;
    const T = `crm-picker-${Math.random().toString(36).slice(2)}`, I = m(l.attributes || []), C = G(() => Y(I.value, l.objectType));
    async function F() {
      if (I.value.length || !l.crmId) return;
      const e = await oe(l.crmId);
      if ("provisioned" in e) throw new Error("No CRM workspace has been created yet.");
      I.value = e.attributes;
    }
    function b(e) {
      return Z(e, C.value);
    }
    function $(e) {
      for (const t of ee(C.value)) {
        const a = e.values[t.attr];
        if (a != null && a !== "") return ae(a, t);
      }
      return "";
    }
    async function q(e) {
      const t = ++_;
      if (!e) {
        c.value = null, s.value = "";
        return;
      }
      d.value = !0, v.value = "";
      try {
        const a = await te(l.crmId, e);
        if (t !== _) return;
        c.value = a, s.value = a ? b(a) : "";
      } catch (a) {
        t === _ && (c.value = null, s.value = "", v.value = E(a, "Selected record could not load."));
      } finally {
        t === _ && (d.value = !1);
      }
    }
    async function R(e) {
      if (!l.crmId || !l.objectType) {
        v.value = "CRM and record type are required.", r.value = !0;
        return;
      }
      d.value = !0, v.value = "";
      try {
        await F(), i.value = (await le(l.crmId, l.objectType, { search: e.trim(), limit: 20 })).rows, o.value = i.value.length ? 0 : -1, r.value = !0;
      } catch (t) {
        i.value = [], v.value = E(t, "Records could not load."), r.value = !0;
      } finally {
        d.value = !1;
      }
    }
    function L(e) {
      s.value = e, c.value = null, f && clearTimeout(f), f = setTimeout(() => R(e), 180);
    }
    function N(e) {
      c.value = e, s.value = b(e), r.value = !1, w("update:modelValue", e.record_id), w("select", e);
    }
    function U() {
      c.value = null, s.value = "", i.value = [], r.value = !1, w("update:modelValue", void 0), w("select", null);
    }
    function z(e) {
      e.key === "ArrowDown" ? (e.preventDefault(), o.value = Math.min(o.value + 1, i.value.length - 1), r.value = !0) : e.key === "ArrowUp" ? (e.preventDefault(), o.value = Math.max(o.value - 1, 0)) : e.key === "Enter" && o.value >= 0 ? (e.preventDefault(), N(i.value[o.value])) : e.key === "Escape" && (r.value = !1);
    }
    function K(e) {
      e.currentTarget.contains(e.relatedTarget) || (r.value = !1);
    }
    return j(() => l.attributes, (e) => {
      e?.length && (I.value = e);
    }, { immediate: !0 }), j(() => [l.crmId, l.modelValue], ([, e]) => q(String(e || "")), { immediate: !0 }), H(() => {
      f && clearTimeout(f);
    }), (e, t) => (u(), n("div", {
      class: "crm-picker",
      onFocusout: K
    }, [
      y("div", {
        class: S(["crm-picker-input", { open: r.value }])
      }, [
        c.value ? (u(), n("span", re, h(p(D)(b(c.value))), 1)) : (u(), J(p(k), {
          key: 1,
          icon: d.value ? "tabler:loader-2" : "tabler:search",
          class: S({ spin: d.value })
        }, null, 8, ["icon", "class"])),
        y("input", {
          value: s.value,
          type: "text",
          placeholder: g.placeholder,
          disabled: g.disabled,
          role: "combobox",
          "aria-expanded": r.value,
          "aria-controls": T,
          "aria-activedescendant": o.value >= 0 ? `${T}-option-${o.value}` : void 0,
          "aria-autocomplete": "list",
          onFocus: t[0] || (t[0] = (a) => R(s.value)),
          onInput: t[1] || (t[1] = (a) => L(a.target.value)),
          onKeydown: z
        }, null, 40, ue),
        s.value && !g.disabled ? (u(), n("button", {
          key: 2,
          type: "button",
          "aria-label": "Clear selection",
          onClick: U
        }, [
          V(p(k), { icon: "tabler:x" })
        ])) : x("", !0)
      ], 2),
      r.value ? (u(), n("div", {
        key: 0,
        id: T,
        class: "crm-picker-menu",
        role: "listbox"
      }, [
        d.value ? (u(), n("div", ne, [
          V(p(k), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          t[2] || (t[2] = B("Searching…", -1))
        ])) : v.value ? (u(), n("div", se, [
          V(p(k), { icon: "tabler:alert-circle" }),
          B(h(v.value), 1)
        ])) : (u(!0), n(Q, { key: 2 }, W(i.value, (a, M) => (u(), n("button", {
          id: `${T}-option-${M}`,
          key: a.record_id,
          type: "button",
          class: S({ active: M === o.value }),
          role: "option",
          "aria-selected": M === o.value,
          onMouseenter: (O) => o.value = M,
          onMousedown: X((O) => N(a), ["prevent"])
        }, [
          y("span", ce, h(p(D)(b(a))), 1),
          y("span", null, [
            y("strong", null, h(b(a)), 1),
            $(a) ? (u(), n("small", de, h($(a)), 1)) : x("", !0)
          ]),
          V(p(k), { icon: "tabler:chevron-right" })
        ], 42, ie))), 128)),
        !d.value && !v.value && !i.value.length ? (u(), n("div", ve, "No matching records.")) : x("", !0)
      ])) : x("", !0)
    ], 32));
  }
});
export {
  be as _
};
//# sourceMappingURL=RecordPickerControl.vue_vue_type_script_setup_true_lang-DqL5RXQ_.js.map
