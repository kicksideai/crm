import { defineComponent as E, computed as y, ref as _, openBlock as l, createElementBlock as a, Fragment as b, createElementVNode as e, toDisplayString as o, normalizeClass as C, normalizeStyle as S, createTextVNode as w, createCommentVNode as i, renderList as h, withDirectives as I, vModelRadio as A, vModelText as B } from "vue";
import { u as K, a as P } from "./index-BzYkOw4T.js";
import { p as j, c as z, a as D, b as F } from "./model-COKQFUj6.js";
const L = { class: "cm" }, U = { class: "cm-why" }, q = { class: "cm-reason" }, G = { class: "cm-conf-bar" }, H = { class: "cm-obj" }, J = {
  key: 0,
  class: "cm-summary"
}, O = { class: "cm-grid" }, Q = { class: "cm-rec-head" }, W = { class: "cm-rec-title" }, X = {
  key: 0,
  class: "cm-radio"
}, Y = ["value"], Z = {
  key: 1,
  class: "cm-rec-name"
}, ee = {
  key: 2,
  class: "cm-tag"
}, te = {
  key: 3,
  class: "cm-tag cm-tag-muted"
}, se = { class: "cm-id" }, le = {
  key: 0,
  class: "cm-vals"
}, ae = {
  key: 1,
  class: "cm-empty"
}, ne = {
  key: 2,
  class: "cm-affected"
}, oe = {
  key: 0,
  class: "cm-chip"
}, ce = {
  key: 1,
  class: "cm-evidence"
}, ie = { class: "cm-note" }, re = {
  key: 2,
  class: "cm-warn"
}, de = { class: "cm-warn-row" }, ue = ["disabled"], me = ["disabled"], ve = {
  key: 3,
  class: "cm-primary-confirm"
}, pe = { class: "cm-warn-row" }, _e = ["disabled"], be = ["disabled"], he = {
  key: 4,
  class: "cm-error"
}, fe = {
  key: 5,
  class: "cm-actions"
}, ke = ["disabled"], ge = ["disabled"], ye = ["disabled"], Ce = {
  key: 1,
  class: "cm-fallback"
}, we = { class: "cm-fallback-msg" }, Me = { class: "cm-fallback-ref" }, Ie = {
  key: 0,
  class: "cm-fallback-raw"
}, Ve = /* @__PURE__ */ E({
  __name: "MergeReview",
  setup(xe) {
    const f = K(), x = P(), n = y(() => j(f.value.itemId ?? "", f.value.content ?? "", f.value.dataMeta)), r = _(!1), c = _(""), u = _(""), k = _(""), m = _(""), M = y(() => n.value.ok ? z(n.value.confidence) : 0), T = y(() => n.value.ok ? `tone-${D(n.value.confidence)}` : "tone-low");
    function N(v) {
      return n.value.ok && n.value.matchedAttrs.includes(v);
    }
    function g(v, t = {}) {
      if (!n.value.ok || r.value) return;
      const { form: s, error: p } = F(v, {
        leftId: n.value.left.id,
        rightId: n.value.right.id,
        winnerId: t.winnerId,
        note: k.value
      });
      if (p || !s) {
        m.value = p ?? "Could not build the decision.";
        return;
      }
      m.value = "", r.value = !0, x("inbox-resolve", { id: n.value.itemId, action: v, form: s });
    }
    function R() {
      m.value = "", n.value.ok && !u.value && (u.value = n.value.left.id), c.value = c.value === "merge" ? "" : "merge";
    }
    function V() {
      m.value = "", c.value = c.value === "separate" ? "" : "separate";
    }
    function $() {
      g("merged", { winnerId: u.value });
    }
    return (v, t) => (l(), a("div", L, [
      n.value.ok ? (l(), a(b, { key: 0 }, [
        e("div", U, [
          e("span", q, o(n.value.reasonLabel), 1),
          e("span", {
            class: C(["cm-conf", T.value])
          }, [
            e("span", G, [
              e("span", {
                class: "cm-conf-fill",
                style: S({ width: M.value + "%" })
              }, null, 4)
            ]),
            w(" " + o(M.value) + "% match ", 1)
          ], 2),
          e("span", H, o(n.value.objectType), 1)
        ]),
        n.value.content ? (l(), a("p", J, o(n.value.content), 1)) : i("", !0),
        e("div", O, [
          (l(!0), a(b, null, h({ left: n.value.left, right: n.value.right }, (s, p) => (l(), a("section", {
            key: p,
            class: C(["cm-rec", { "cm-rec-primary": c.value === "merge" && u.value === s.id }])
          }, [
            e("header", Q, [
              e("div", W, [
                c.value === "merge" ? (l(), a("label", X, [
                  I(e("input", {
                    "onUpdate:modelValue": t[0] || (t[0] = (d) => u.value = d),
                    type: "radio",
                    value: s.id
                  }, null, 8, Y), [
                    [A, u.value]
                  ]),
                  e("span", null, o(s.label), 1)
                ])) : (l(), a("span", Z, o(s.label), 1)),
                c.value === "merge" && u.value === s.id ? (l(), a("span", ee, "Keep")) : c.value === "" ? (l(), a("span", te, o(p === "left" ? "Record A" : "Record B"), 1)) : i("", !0)
              ]),
              e("code", se, o(s.id), 1)
            ]),
            s.values.length ? (l(), a("dl", le, [
              (l(!0), a(b, null, h(s.values, (d) => (l(), a("div", {
                key: d.attr,
                class: C(["cm-val", { "cm-val-match": N(d.attr) }])
              }, [
                e("dt", null, o(d.attr), 1),
                e("dd", null, o(d.value), 1)
              ], 2))), 128))
            ])) : (l(), a("p", ae, "No field values in this notice.")),
            s.aliases.length || s.activityCount !== null ? (l(), a("div", ne, [
              s.activityCount !== null ? (l(), a("span", oe, o(s.activityCount) + " activities", 1)) : i("", !0),
              (l(!0), a(b, null, h(s.aliases, (d) => (l(), a("span", {
                key: d,
                class: "cm-chip"
              }, o(d), 1))), 128))
            ])) : i("", !0)
          ], 2))), 128))
        ]),
        n.value.matched.length ? (l(), a("div", ce, [
          t[6] || (t[6] = e("span", { class: "cm-evidence-label" }, "Matched", -1)),
          (l(!0), a(b, null, h(n.value.matched, (s) => (l(), a("span", {
            key: s.attr,
            class: "cm-chip cm-chip-match"
          }, [
            e("b", null, o(s.attr), 1),
            w(o(s.value ? ": " + s.value : ""), 1)
          ]))), 128))
        ])) : i("", !0),
        e("label", ie, [
          t[7] || (t[7] = e("span", null, "Note (optional)", -1)),
          I(e("textarea", {
            "onUpdate:modelValue": t[1] || (t[1] = (s) => k.value = s),
            rows: "2",
            placeholder: "Add context for this decision"
          }, null, 512), [
            [B, k.value]
          ])
        ]),
        c.value === "separate" ? (l(), a("div", re, [
          t[8] || (t[8] = e("strong", null, "This is permanent.", -1)),
          t[9] || (t[9] = w(" Keeping these records separate stops the CRM from suggesting this pair again. ", -1)),
          e("div", de, [
            e("button", {
              class: "cm-btn cm-btn-danger",
              disabled: r.value,
              onClick: t[2] || (t[2] = (s) => g("do_not_merge"))
            }, "Confirm — keep separate", 8, ue),
            e("button", {
              class: "cm-btn cm-btn-ghost",
              disabled: r.value,
              onClick: t[3] || (t[3] = (s) => c.value = "")
            }, "Cancel", 8, me)
          ])
        ])) : i("", !0),
        c.value === "merge" ? (l(), a("div", ve, [
          t[10] || (t[10] = e("p", { class: "cm-hint" }, "Choose the record to keep. The other is merged into it.", -1)),
          e("div", pe, [
            e("button", {
              class: "cm-btn cm-btn-primary",
              disabled: r.value || !u.value,
              onClick: $
            }, "Merge, keep selected", 8, _e),
            e("button", {
              class: "cm-btn cm-btn-ghost",
              disabled: r.value,
              onClick: t[4] || (t[4] = (s) => c.value = "")
            }, "Cancel", 8, be)
          ])
        ])) : i("", !0),
        m.value ? (l(), a("p", he, o(m.value), 1)) : i("", !0),
        c.value === "" ? (l(), a("div", fe, [
          e("button", {
            class: "cm-btn cm-btn-primary",
            disabled: r.value,
            onClick: R
          }, "Merge records", 8, ke),
          e("button", {
            class: "cm-btn cm-btn-ghost cm-btn-danger-text",
            disabled: r.value,
            onClick: V
          }, "Keep separate", 8, ge),
          e("button", {
            class: "cm-btn cm-btn-ghost",
            disabled: r.value,
            onClick: t[5] || (t[5] = (s) => g("skipped"))
          }, "Skip", 8, ye)
        ])) : i("", !0)
      ], 64)) : (l(), a("div", Ce, [
        t[12] || (t[12] = e("p", { class: "cm-fallback-title" }, "This merge review could not be displayed.", -1)),
        e("p", we, o(n.value.error), 1),
        e("dl", Me, [
          e("div", null, [
            t[11] || (t[11] = e("dt", null, "Item", -1)),
            e("dd", null, [
              e("code", null, o(n.value.itemId || "(none)"), 1)
            ])
          ])
        ]),
        n.value.raw ? (l(), a("pre", Ie, o(n.value.raw), 1)) : i("", !0)
      ]))
    ]));
  }
});
export {
  Ve as default
};
//# sourceMappingURL=MergeReview-BHGEA5cF.js.map
