import { defineComponent as ue, ref as A, computed as $, watch as ve, onMounted as Ne, openBlock as n, createElementBlock as r, createElementVNode as a, createVNode as j, unref as p, createTextVNode as Y, toDisplayString as d, Fragment as F, renderList as W, normalizeClass as Z, createCommentVNode as N, createBlock as le, withDirectives as qe, vModelSelect as va, withKeys as Je, withModifiers as Ke, vModelText as Xe, useId as Vt, reactive as ma, withCtx as Mt, onBeforeUnmount as At, resolveDynamicComponent as Nt, normalizeStyle as ba } from "vue";
import { Icon as x } from "@iconify/vue";
import { host as ae, loadByTagName as fa, api as ht, on as ya } from "@wippy-fe/proxy";
import { u as pa, a as ha } from "./index-BzYkOw4T.js";
import { c as Tt, a as Lt, r as at, h as oe, d as ga, e as xe, o as Se, f as Ve, g as lt, i as nt, j as Ot, s as Et, k as ka, l as Ft, n as _a, t as rt, p as $a, q as wa, u as Ca, v as ye, w as $e, x as Me, y as gt, z as ja, A as kt, B as Ze, m as se, C as _t, D as Ie, E as Ia, F as We, G as Sa, H as Ra, I as Ue, J as xa, K as Va, L as $t, M as Ma, N as Aa, O as Na, P as Bt, Q as st, R as Ta, S as La, T as Oa, U as Ea, V as Fa, W as Ba, b as wt, X as Ct, Y as Da } from "./crm-model-BaRhr3mT.js";
import { _ as Pa } from "./RecordPickerControl.vue_vue_type_script_setup_true_lang-DqL5RXQ_.js";
import { s as qa, _ as Wa } from "./CrmSettings.vue_vue_type_script_setup_true_lang-BKAWI-EU.js";
import { c as Ua, a as za, r as Ka } from "./model-COKQFUj6.js";
import { _ as Ya } from "./CrmCreate.vue_vue_type_script_setup_true_lang-C0vvaoVz.js";
function Ha(e, o) {
  let t, l = 0;
  function s() {
    t = void 0, l = 0, e();
  }
  return {
    signal() {
      const u = Date.now();
      t ? clearTimeout(t) : l = u + o.maxWaitMs, t = setTimeout(s, Math.max(0, Math.min(o.quietMs, l - u)));
    },
    cancel() {
      t && clearTimeout(t), t = void 0, l = 0;
    }
  };
}
const Ga = { class: "crm-rail" }, Qa = { class: "crm-brand" }, Ja = { class: "crm-brand-mark" }, Xa = { class: "crm-rail-scope" }, Za = {
  class: "crm-rail-nav",
  "aria-label": "CRM objects"
}, el = ["onClick"], tl = {
  key: 0,
  class: "crm-rail-count"
}, al = {
  class: "crm-rail-nav",
  "aria-label": "CRM queues"
}, ll = {
  key: 0,
  class: "crm-rail-badge"
}, nl = {
  class: "crm-rail-nav",
  "aria-label": "CRM data model"
}, rl = /* @__PURE__ */ ue({
  __name: "CrmSidebar",
  props: {
    crmId: {},
    objects: {},
    activeObject: {},
    activeSurface: {},
    workspaceLabel: {},
    canWrite: { type: Boolean },
    revision: {}
  },
  emits: ["navigate"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = A({}), u = A(0), h = $(() => t.activeSurface || "records");
    function C(g) {
      return g >= 1e3 ? `${(g / 1e3).toFixed(g >= 1e4 ? 0 : 1)}k` : String(g);
    }
    async function I() {
      const g = await Promise.all(t.objects.map(async (y) => {
        try {
          return [y.type, await Tt(t.crmId, y.type)];
        } catch {
          return null;
        }
      })), i = {};
      for (const y of g) y && (i[y[0]] = y[1]);
      s.value = i;
    }
    async function k() {
      try {
        u.value = (await Lt(t.crmId, { limit: 1 })).total;
      } catch {
        u.value = 0;
      }
    }
    function V() {
      I(), k();
    }
    return ve(() => [t.crmId, t.objects, t.revision], V), Ne(V), (g, i) => (n(), r("aside", Ga, [
      a("div", Qa, [
        a("span", Ja, [
          j(p(x), {
            icon: "tabler:address-book",
            "aria-hidden": "true"
          })
        ]),
        i[3] || (i[3] = a("div", { class: "crm-brand-text" }, [
          a("strong", null, "CRM"),
          a("small", null, "Workbench")
        ], -1))
      ]),
      a("div", Xa, [
        a("span", null, [
          i[4] || (i[4] = Y("Workspace ", -1)),
          a("strong", null, d(e.workspaceLabel || "CRM"), 1)
        ])
      ]),
      i[8] || (i[8] = a("div", { class: "crm-rail-label" }, "Objects", -1)),
      a("nav", Za, [
        (n(!0), r(F, null, W(e.objects, (y) => (n(), r("button", {
          key: y.type,
          class: Z({ active: h.value === "records" && e.activeObject === y.type }),
          onClick: (v) => l("navigate", y.type)
        }, [
          j(p(x), {
            icon: y.icon || "tabler:category",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          a("span", null, d(y.label || y.type), 1),
          s.value[y.type] !== void 0 ? (n(), r("b", tl, d(C(s.value[y.type])), 1)) : N("", !0)
        ], 10, el))), 128)),
        e.canWrite ? (n(), r("button", {
          key: 0,
          class: "crm-rail-add",
          onClick: i[0] || (i[0] = (y) => l("navigate", "model"))
        }, [
          j(p(x), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          i[5] || (i[5] = a("span", null, "New object", -1))
        ])) : N("", !0)
      ]),
      i[9] || (i[9] = a("div", { class: "crm-rail-label" }, "Queues", -1)),
      a("nav", al, [
        a("button", {
          class: Z({ active: h.value === "review" }),
          onClick: i[1] || (i[1] = (y) => l("navigate", "review"))
        }, [
          j(p(x), {
            icon: "tabler:git-merge",
            "aria-hidden": "true"
          }),
          i[6] || (i[6] = a("span", null, "Needs review", -1)),
          u.value ? (n(), r("b", ll, d(u.value), 1)) : N("", !0)
        ], 2)
      ]),
      i[10] || (i[10] = a("div", { class: "crm-rail-label" }, "Model", -1)),
      a("nav", nl, [
        a("button", {
          class: Z({ active: h.value === "model" }),
          onClick: i[2] || (i[2] = (y) => l("navigate", "model"))
        }, [
          j(p(x), {
            icon: "tabler:table-options",
            "aria-hidden": "true"
          }),
          i[7] || (i[7] = a("span", null, "Objects & fields", -1))
        ], 2)
      ])
    ]));
  }
}), we = {
  recordCreated: "kickside.crm.events:record.created",
  recordUpdated: "kickside.crm.events:record.updated",
  recordDeleted: "kickside.crm.events:record.deleted",
  relationLinked: "kickside.crm.events:relation.linked",
  relationUnlinked: "kickside.crm.events:relation.unlinked",
  membershipSet: "kickside.crm.events:membership.set",
  activityLogged: "kickside.crm.events:activity.logged"
};
function De(e) {
  return `${e.kind}\0${e.type}\0${e.id}`;
}
function sl(e) {
  return { kind: e.kind, type: e.type, id: e.id };
}
function et(e, o, t, l, s) {
  return {
    type: e,
    body: {
      record_id: o,
      object_type: t,
      attr: l.attr,
      reference: sl(s),
      ...l.config?.relation ? { relation: l.config.relation } : {}
    }
  };
}
function tt(e, o) {
  const t = /* @__PURE__ */ new Map(), l = new Set(e.filter((u) => u.data_type === "relation").map((u) => u.attr)), s = {};
  for (const [u, h] of Object.entries(o))
    l.has(u) ? t.set(u, at(h)) : s[u] = h;
  for (const u of l) t.has(u) || t.set(u, []);
  return { scalars: s, relations: t };
}
function ol(e, o, t, l) {
  const s = tt(t, l), u = [{ type: we.recordCreated, body: { record_id: e, object_type: o, values: s.scalars } }];
  for (const h of t)
    if (h.data_type === "relation")
      for (const C of s.relations.get(h.attr) || [])
        u.push(et(we.relationLinked, e, o, h, C));
  return u;
}
function il(e, o, t, l, s) {
  const u = tt(t, l), h = tt(t, s), C = {}, I = [], k = /* @__PURE__ */ new Set([...Object.keys(u.scalars), ...Object.keys(h.scalars)]);
  for (const g of k)
    JSON.stringify(u.scalars[g]) !== JSON.stringify(h.scalars[g]) && (h.scalars[g] === void 0 ? I.push(g) : C[g] = h.scalars[g]);
  const V = [];
  (Object.keys(C).length || I.length) && V.push({
    type: we.recordUpdated,
    body: { record_id: e, object_type: o, ...Object.keys(C).length ? { set: C } : {}, ...I.length ? { unset: I } : {} }
  });
  for (const g of t) {
    if (g.data_type !== "relation") continue;
    const i = u.relations.get(g.attr) || [], y = h.relations.get(g.attr) || [], v = new Set(i.map(De)), f = new Set(y.map(De));
    for (const R of i)
      f.has(De(R)) || V.push(et(we.relationUnlinked, e, o, g, R));
    for (const R of y)
      v.has(De(R)) || V.push(et(we.relationLinked, e, o, g, R));
  }
  return V;
}
const pe = {
  eq: { label: "is", arity: "one" },
  neq: { label: "is not", arity: "one" },
  contains: { label: "contains", arity: "one" },
  any_of: { label: "is any of", arity: "list" },
  gt: { label: "greater than", arity: "one" },
  gte: { label: "at least", arity: "one" },
  lt: { label: "less than", arity: "one" },
  lte: { label: "at most", arity: "one" },
  between: { label: "between", arity: "two" },
  before: { label: "before", arity: "one" },
  after: { label: "after", arity: "one" },
  is_empty: { label: "is empty", arity: "none" },
  is_set: { label: "is set", arity: "none" }
};
function ul(e) {
  return !0;
}
function Dt(e) {
  return e.filter(ul);
}
const _e = ["is_set", "is_empty"];
function Pt(e) {
  switch (e) {
    case "number":
    case "currency":
      return ["eq", "neq", "gt", "gte", "lt", "lte", "between", ..._e];
    case "date":
      return ["before", "after", "between", ..._e];
    case "boolean":
      return ["eq", ..._e];
    case "select":
      return ["eq", "any_of", "neq", ..._e];
    case "multi_select":
      return ["any_of", "eq", ..._e];
    case "relation":
      return ["eq", ..._e];
    default:
      return ["contains", "eq", "neq", ..._e];
  }
}
function cl(e) {
  return Pt(e)[0];
}
function ze(e, o) {
  return e.find((t) => t.attr === o);
}
let jt = 0;
function qt() {
  return jt += 1, `fc_${jt}_${Math.random().toString(36).slice(2, 8)}`;
}
function ot(e, o) {
  return pe[o].arity === "list" ? [] : e === "boolean" ? !0 : "";
}
function It(e) {
  const o = cl(e.data_type);
  return { id: qt(), attr: e.attr, op: o, value: ot(e.data_type, o) };
}
function dl(e, o, t) {
  const l = t?.data_type || "text";
  return { ...e, op: o, value: ot(l, o), value2: void 0 };
}
function He(e) {
  return e == null ? !1 : typeof e == "string" ? e.trim() !== "" : Array.isArray(e) ? e.length > 0 : !0;
}
function Wt(e) {
  const o = pe[e.op]?.arity;
  return !e.attr || !o ? !1 : o === "none" ? !0 : o === "list" ? Array.isArray(e.value) && e.value.length > 0 : o === "two" ? He(e.value) && He(e.value2) : He(e.value);
}
function be(e, o) {
  if (e == null) return "";
  if (o === "number" || o === "currency") {
    const t = typeof e == "number" ? e : Number(String(e));
    return Number.isFinite(t) ? t : "";
  }
  return o === "boolean" ? typeof e == "boolean" ? e : String(e) === "true" : e;
}
function vl(e) {
  return e === null || ["string", "number", "boolean"].includes(typeof e);
}
function ml(e, o) {
  const t = [];
  for (const l of e) {
    if (!Wt(l)) continue;
    const s = ze(o, l.attr)?.data_type || "text", u = pe[l.op].arity;
    if (u === "none") {
      t.push({ attr: l.attr, op: l.op, value: null });
      continue;
    }
    if (u === "two") {
      t.push({ attr: l.attr, op: l.op, value: [be(l.value, s), be(l.value2, s)] });
      continue;
    }
    if (u === "list") {
      const h = Array.isArray(l.value) ? l.value : [l.value];
      t.push({ attr: l.attr, op: l.op, value: h.map((C) => be(C, s)) });
      continue;
    }
    t.push({ attr: l.attr, op: l.op, value: be(l.value, s) });
  }
  return t;
}
function bl(e, o) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const l of e) {
    if (!l || typeof l.attr != "string" || typeof l.op != "string") throw new Error("Invalid saved-view filter");
    const s = l.op;
    if (!pe[s]) throw new Error("Unknown saved-view filter operator: " + l.op);
    const u = ze(o, l.attr)?.data_type || "text", h = pe[s].arity, C = { id: qt(), attr: l.attr, op: s, value: ot(u, s) };
    if (h === "two" && Array.isArray(l.value))
      C.value = be(l.value[0], u), C.value2 = be(l.value[1], u);
    else if (h === "list") {
      if (!Array.isArray(l.value)) throw new Error("Saved-view list filter requires an array");
      const I = l.value;
      C.value = I.map((k) => be(k, u)).filter(vl);
    } else h === "one" && (C.value = be(l.value, u));
    t.push(C);
  }
  return t;
}
function fl(e, o) {
  const t = e.toLowerCase();
  return Dt(o).find(
    (l) => l.attr.toLowerCase() === t || (l.label || "").toLowerCase() === t || oe(l.attr).toLowerCase() === t
  );
}
function yl(e, o) {
  const t = [], l = [];
  for (const s of String(e || "").split(/\s+/)) {
    if (!s) continue;
    const u = /^([A-Za-z][\w]*):(.+)$/.exec(s), h = u ? fl(u[1], o) : void 0;
    u && h ? t.push({ attr: h.attr, op: "eq", value: be(u[2], h.data_type) }) : l.push(s);
  }
  return { filters: t, text: l.join(" ") };
}
function Pe(e, o) {
  return e == null || e === "" ? "" : typeof e == "boolean" ? e ? "Yes" : "No" : o?.data_type === "relation" ? ga(String(e)) : String(e);
}
function pl(e, o) {
  const t = pe[e.op], l = o?.label || oe(e.attr);
  return t ? t.arity === "none" ? { field: l, op: t.label, value: "" } : t.arity === "two" ? { field: l, op: t.label, value: `${Pe(e.value, o)} – ${Pe(e.value2, o)}` } : t.arity === "list" ? { field: l, op: t.label, value: (Array.isArray(e.value) ? e.value : []).map((s) => Pe(s, o)).join(", ") } : { field: l, op: t.label, value: Pe(e.value, o) } : { field: l, op: e.op, value: "" };
}
const hl = { class: "crm-reference-input" }, gl = {
  key: 0,
  class: "crm-reference-values",
  "aria-label": "Selected references"
}, kl = ["aria-label", "onClick"], _l = {
  key: 2,
  class: "crm-reference-compose"
}, $l = ["disabled"], wl = ["value"], Cl = ["disabled", "placeholder", "aria-label", "onKeyup"], jl = ["disabled"], Ut = /* @__PURE__ */ ue({
  __name: "ReferenceInput",
  props: {
    crmId: {},
    target: {},
    cardinality: {},
    modelValue: { type: [String, Number, Boolean, null, Array, Object] },
    attributes: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = $(() => at(t.modelValue)), u = A(""), h = A(""), C = $(() => t.target.kind === "principal" ? t.target.kinds || [] : []), I = $(() => t.target.kind === "component" ? String(t.target.class || "") : ""), k = $(() => I.value || h.value || C.value[0] || "");
    function V(v) {
      if (t.cardinality === "many") {
        const f = s.value.filter((R) => !(R.kind === v.kind && R.type === v.type && R.id === v.id));
        l("update:modelValue", [...f, v]);
      } else l("update:modelValue", v);
    }
    function g(v) {
      if (!v) {
        t.cardinality === "one" && l("update:modelValue", void 0);
        return;
      }
      const f = String(t.target.object_type || v.object_type);
      V({ kind: "record", type: f, id: v.record_id, label: xe(v, Se(t.attributes || [], f)) });
    }
    function i() {
      const v = u.value.trim(), f = k.value.trim();
      !v || !f || t.target.kind === "record" || (V({ kind: t.target.kind, type: f, id: v }), u.value = "");
    }
    function y(v) {
      const f = s.value.filter((R, E) => E !== v);
      l("update:modelValue", t.cardinality === "many" ? f : void 0);
    }
    return (v, f) => (n(), r("div", hl, [
      s.value.length ? (n(), r("div", gl, [
        (n(!0), r(F, null, W(s.value, (R, E) => (n(), r("span", {
          key: `${R.kind}:${R.type}:${R.id}`,
          class: "crm-reference-chip"
        }, [
          a("span", null, d(R.label || p(oe)(R.id)), 1),
          a("small", null, d(p(oe)(R.type)), 1),
          e.disabled ? N("", !0) : (n(), r("button", {
            key: 0,
            type: "button",
            "aria-label": `Remove ${R.label || R.id}`,
            onClick: (T) => y(E)
          }, [
            j(p(x), { icon: "tabler:x" })
          ], 8, kl))
        ]))), 128))
      ])) : N("", !0),
      e.target.kind === "record" && (e.cardinality === "many" || !s.value.length) ? (n(), le(Pa, {
        key: 1,
        "crm-id": e.crmId,
        "object-type": e.target.object_type,
        attributes: e.attributes,
        disabled: e.disabled,
        "model-value": e.cardinality === "one" ? s.value[0]?.id : "",
        placeholder: `Search ${p(oe)(e.target.object_type || "records")}…`,
        onSelect: g
      }, null, 8, ["crm-id", "object-type", "attributes", "disabled", "model-value", "placeholder"])) : e.target.kind !== "record" && (e.cardinality === "many" || !s.value.length) ? (n(), r("div", _l, [
        e.target.kind === "principal" && C.value.length > 1 ? qe((n(), r("select", {
          key: 0,
          "onUpdate:modelValue": f[0] || (f[0] = (R) => h.value = R),
          class: "crm-input",
          disabled: e.disabled,
          "aria-label": "Principal type"
        }, [
          f[2] || (f[2] = a("option", { value: "" }, "Choose type…", -1)),
          (n(!0), r(F, null, W(C.value, (R) => (n(), r("option", {
            key: R,
            value: R
          }, d(p(oe)(R)), 9, wl))), 128))
        ], 8, $l)), [
          [va, h.value]
        ]) : N("", !0),
        qe(a("input", {
          "onUpdate:modelValue": f[1] || (f[1] = (R) => u.value = R),
          class: "crm-input",
          disabled: e.disabled,
          placeholder: e.target.kind === "component" ? "Component ID" : "Directory ID",
          "aria-label": e.target.kind === "component" ? "Component ID" : "Directory ID",
          onKeyup: Je(Ke(i, ["prevent"]), ["enter"])
        }, null, 40, Cl), [
          [Xe, u.value]
        ]),
        a("button", {
          type: "button",
          class: "crm-button",
          disabled: e.disabled || !u.value.trim() || !k.value,
          onClick: i
        }, [
          j(p(x), { icon: "tabler:plus" }),
          f[3] || (f[3] = Y("Add", -1))
        ], 8, jl)
      ])) : N("", !0)
    ]));
  }
}), Il = { class: "crm-filterbar" }, Sl = ["aria-expanded", "aria-controls"], Rl = {
  key: 0,
  class: "crm-filter-count"
}, xl = ["id"], Vl = {
  key: 0,
  class: "crm-filter-empty"
}, Ml = ["value", "onChange"], Al = ["value"], Nl = ["value", "onChange"], Tl = ["value"], Ll = {
  key: 0,
  class: "crm-filter-novalue"
}, Ol = ["value", "onChange"], El = ["value", "onChange"], Fl = ["value"], Bl = ["onChange"], Dl = ["value", "selected"], Pl = ["type", "value", "onInput"], ql = ["type", "value", "onInput"], Wl = ["type", "value", "onInput"], Ul = ["onClick"], zl = { class: "crm-filter-actions" }, Kl = { class: "crm-filter-chips" }, Yl = ["onClick"], Hl = { class: "crm-filter-chip-field" }, Gl = { class: "crm-filter-chip-op" }, Ql = {
  key: 0,
  class: "crm-filter-chip-value"
}, Jl = /* @__PURE__ */ ue({
  __name: "CrmFilterBar",
  props: {
    crmId: {},
    fields: {},
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = A(!1), u = Vt(), h = $(() => Dt(t.fields)), C = $(() => t.modelValue.filter(Wt)), I = $(() => C.value.length);
    function k(w) {
      return ze(t.fields, w.attr);
    }
    function V(w) {
      return Pt(k(w)?.data_type || "text");
    }
    function g(w) {
      return k(w)?.config?.choices || [];
    }
    function i(w) {
      return Array.isArray(w) ? w.map(String) : [];
    }
    function y(w) {
      return pl(w, k(w));
    }
    function v(w) {
      const O = k(w)?.data_type || "text", _ = pe[w.op].arity;
      return _ === "none" ? "none" : O === "boolean" ? "bool" : O === "select" || O === "multi_select" ? _ === "list" ? "choices-multi" : "choices-single" : O === "relation" ? "relation" : O === "number" || O === "currency" ? _ === "two" ? "number-range" : "number" : O === "date" ? _ === "two" ? "date-range" : "date" : "text";
    }
    function f(w) {
      l("update:modelValue", w);
    }
    function R(w, O) {
      f(t.modelValue.map((_) => _.id === w ? { ..._, ...O } : _));
    }
    function E(w, O) {
      const _ = ze(t.fields, O);
      if (!_) return;
      const M = It(_);
      f(t.modelValue.map((B) => B.id === w ? { ...M, id: w } : B));
    }
    function T(w, O) {
      const _ = t.modelValue.find((M) => M.id === w);
      _ && R(w, dl(_, O, k(_)));
    }
    function z(w, O) {
      R(w, { value: O });
    }
    function K(w, O) {
      R(w, { value2: O });
    }
    function J(w, O) {
      const _ = O.target;
      R(w, { value: [..._.selectedOptions].map((M) => M.value) });
    }
    function ee() {
      const w = h.value[0];
      w && (f([...t.modelValue, It(w)]), s.value = !0);
    }
    function H(w) {
      f(t.modelValue.filter((O) => O.id !== w));
    }
    function U() {
      f([]);
    }
    function X(w, O) {
      w.currentTarget.contains(w.relatedTarget) || O();
    }
    return (w, O) => (n(), r("div", Il, [
      a("div", {
        class: "crm-filter-add",
        onFocusout: O[1] || (O[1] = (_) => X(_, () => s.value = !1))
      }, [
        a("button", {
          class: Z(["crm-button", { active: s.value || I.value > 0 }]),
          "aria-expanded": s.value,
          "aria-controls": p(u),
          onClick: O[0] || (O[0] = (_) => s.value = !s.value)
        }, [
          j(p(x), { icon: "tabler:filter" }),
          O[2] || (O[2] = Y("Filter", -1)),
          I.value ? (n(), r("b", Rl, d(I.value), 1)) : N("", !0)
        ], 10, Sl),
        s.value ? (n(), r("div", {
          key: 0,
          id: p(u),
          class: "crm-filter-menu",
          role: "group",
          "aria-label": "Filter conditions"
        }, [
          e.modelValue.length ? N("", !0) : (n(), r("div", Vl, "No conditions yet.")),
          (n(!0), r(F, null, W(e.modelValue, (_) => (n(), r("div", {
            key: _.id,
            class: "crm-filter-row"
          }, [
            a("select", {
              class: "crm-input",
              value: _.attr,
              "aria-label": "Filter field",
              onChange: (M) => E(_.id, M.target.value)
            }, [
              (n(!0), r(F, null, W(h.value, (M) => (n(), r("option", {
                key: M.attr,
                value: M.attr
              }, d(M.label || p(oe)(M.attr)), 9, Al))), 128))
            ], 40, Ml),
            a("select", {
              class: "crm-input",
              value: _.op,
              "aria-label": "Filter operator",
              onChange: (M) => T(_.id, M.target.value)
            }, [
              (n(!0), r(F, null, W(V(_), (M) => (n(), r("option", {
                key: M,
                value: M
              }, d(p(pe)[M].label), 9, Tl))), 128))
            ], 40, Nl),
            v(_) === "none" ? (n(), r("span", Ll)) : v(_) === "bool" ? (n(), r("select", {
              key: 1,
              class: "crm-input",
              value: String(_.value === !0),
              "aria-label": "Filter value",
              onChange: (M) => z(_.id, M.target.value === "true")
            }, [...O[3] || (O[3] = [
              a("option", { value: "true" }, "Yes", -1),
              a("option", { value: "false" }, "No", -1)
            ])], 40, Ol)) : v(_) === "choices-single" ? (n(), r("select", {
              key: 2,
              class: "crm-input",
              value: String(_.value ?? ""),
              "aria-label": "Filter value",
              onChange: (M) => z(_.id, M.target.value)
            }, [
              O[4] || (O[4] = a("option", {
                value: "",
                disabled: ""
              }, "Select…", -1)),
              (n(!0), r(F, null, W(g(_), (M) => (n(), r("option", {
                key: M,
                value: M
              }, d(M), 9, Fl))), 128))
            ], 40, El)) : v(_) === "choices-multi" ? (n(), r("select", {
              key: 3,
              class: "crm-input crm-multi",
              multiple: "",
              "aria-label": "Filter values",
              onChange: (M) => J(_.id, M)
            }, [
              (n(!0), r(F, null, W(g(_), (M) => (n(), r("option", {
                key: M,
                value: M,
                selected: i(_.value).includes(M)
              }, d(M), 9, Dl))), 128))
            ], 40, Bl)) : v(_) === "relation" && p(Ve)(k(_)) ? (n(), le(Ut, {
              key: 4,
              class: "crm-filter-relation",
              "crm-id": e.crmId,
              target: p(Ve)(k(_)),
              cardinality: "one",
              "model-value": _.value,
              attributes: e.fields,
              "onUpdate:modelValue": (M) => z(_.id, M ?? "")
            }, null, 8, ["crm-id", "target", "model-value", "attributes", "onUpdate:modelValue"])) : v(_) === "number-range" || v(_) === "date-range" ? (n(), r(F, { key: 5 }, [
              a("input", {
                class: "crm-input",
                type: v(_) === "date-range" ? "date" : "number",
                value: _.value ?? "",
                "aria-label": "Filter range start",
                onInput: (M) => z(_.id, M.target.value)
              }, null, 40, Pl),
              O[5] || (O[5] = a("span", { class: "crm-filter-dash" }, "–", -1)),
              a("input", {
                class: "crm-input",
                type: v(_) === "date-range" ? "date" : "number",
                value: _.value2 ?? "",
                "aria-label": "Filter range end",
                onInput: (M) => K(_.id, M.target.value)
              }, null, 40, ql)
            ], 64)) : (n(), r("input", {
              key: 6,
              class: "crm-input",
              type: v(_) === "number" ? "number" : v(_) === "date" ? "date" : "text",
              value: _.value ?? "",
              placeholder: "Value",
              "aria-label": "Filter value",
              onInput: (M) => z(_.id, M.target.value)
            }, null, 40, Wl)),
            a("button", {
              class: "crm-icon-button danger",
              title: "Remove condition",
              "aria-label": "Remove condition",
              onClick: (M) => H(_.id)
            }, [
              j(p(x), { icon: "tabler:x" })
            ], 8, Ul)
          ]))), 128)),
          a("div", zl, [
            a("button", {
              class: "crm-button",
              onClick: ee
            }, [
              j(p(x), { icon: "tabler:plus" }),
              O[6] || (O[6] = Y("Add condition", -1))
            ]),
            e.modelValue.length ? (n(), r("button", {
              key: 0,
              class: "crm-button danger-text",
              onClick: U
            }, "Clear all")) : N("", !0)
          ])
        ], 8, xl)) : N("", !0)
      ], 32),
      a("div", Kl, [
        (n(!0), r(F, null, W(C.value, (_) => (n(), r("button", {
          key: _.id,
          class: "crm-filter-chip",
          onClick: (M) => H(_.id)
        }, [
          a("span", Hl, d(y(_).field), 1),
          a("span", Gl, d(y(_).op), 1),
          y(_).value ? (n(), r("span", Ql, d(y(_).value), 1)) : N("", !0),
          j(p(x), { icon: "tabler:x" })
        ], 8, Yl))), 128))
      ])
    ]));
  }
}), Xl = {
  key: 0,
  class: "crm-rels"
}, Zl = ["href"], en = ["onClick"], tn = {
  key: 2,
  class: "crm-rel plain"
}, an = {
  key: 1,
  class: "crm-muted"
}, ln = {
  key: 1,
  class: "crm-muted",
  "aria-hidden": "true"
}, nn = {
  key: 2,
  class: "crm-struct"
}, rn = { class: "crm-struct-grid" }, sn = {
  key: 0,
  class: "crm-flag"
}, on = {
  key: 1,
  class: "crm-flag-blank",
  "aria-hidden": "true"
}, un = {
  key: 4,
  class: "crm-chips"
}, cn = ["href"], dn = ["href"], Ae = /* @__PURE__ */ ue({
  __name: "ValueDisplay",
  props: {
    value: { type: [String, Number, Boolean, null, Array, Object], default: void 0 },
    attribute: { default: void 0 },
    compact: { type: Boolean },
    names: { default: void 0 }
  },
  emits: ["navigate"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = $(() => t.attribute?.data_type === "relation"), u = $(() => s.value ? lt(t.value, t.names, Ve(t.attribute)) : []), h = $(() => t.attribute?.data_type === "boolean"), C = $(() => nt(t.value, t.attribute)), I = $(() => Array.isArray(t.value) && t.value.every((y) => y === null || typeof y != "object")), k = $(() => Ot(t.value, t.attribute)), V = $(() => k.value ? Et(t.value) : []), g = $(() => {
      const y = `${V.value.length} field${V.value.length === 1 ? "" : "s"}`, v = t.attribute?.label?.trim();
      return v ? `${v} — ${y}` : y;
    }), i = $(() => (!s.value && I.value ? t.value : t.attribute?.data_type === "select" && t.value ? [t.value] : []).map((v) => ({ key: String(v), label: ka(v) })));
    return (y, v) => s.value ? (n(), r("span", Xl, [
      u.value.length ? (n(!0), r(F, { key: 0 }, W(u.value, (f) => (n(), r(F, {
        key: `${f.kind}:${f.type}:${f.id}`
      }, [
        f.href ? (n(), r("a", {
          key: 0,
          class: "crm-rel",
          href: f.href,
          target: "_blank",
          rel: "noopener"
        }, d(f.label), 9, Zl)) : f.route ? (n(), r("button", {
          key: 1,
          type: "button",
          class: "crm-rel",
          onClick: Ke((R) => l("navigate", f.route), ["stop"])
        }, d(f.label), 9, en)) : (n(), r("span", tn, d(f.label), 1))
      ], 64))), 128)) : (n(), r("span", an, "—"))
    ])) : k.value && e.compact ? (n(), r("span", ln, "—")) : k.value ? (n(), r("details", nn, [
      a("summary", null, d(g.value), 1),
      a("dl", rn, [
        (n(!0), r(F, null, W(V.value, (f) => (n(), r("div", {
          key: f.label
        }, [
          a("dt", null, d(f.label), 1),
          a("dd", null, d(f.text), 1)
        ]))), 128))
      ])
    ])) : h.value && e.compact ? (n(), r(F, { key: 3 }, [
      e.value === !0 ? (n(), r("span", sn, d(e.attribute?.label || "Yes"), 1)) : (n(), r("span", on))
    ], 64)) : i.value.length ? (n(), r("span", un, [
      (n(!0), r(F, null, W(i.value, (f) => (n(), r("span", {
        key: f.key,
        class: "crm-chip"
      }, d(f.label), 1))), 128))
    ])) : e.attribute?.data_type === "email" && e.value ? (n(), r("a", {
      key: 5,
      class: "crm-link",
      href: `mailto:${e.value}`
    }, d(C.value), 9, cn)) : e.attribute?.data_type === "url" && e.value ? (n(), r("a", {
      key: 6,
      class: "crm-link",
      href: String(e.value),
      target: "_blank",
      rel: "noopener"
    }, d(C.value), 9, dn)) : h.value && typeof e.value == "boolean" ? (n(), r("span", {
      key: 7,
      class: Z(["crm-boolean", { on: e.value === !0 }])
    }, [
      v[0] || (v[0] = a("span", null, null, -1)),
      Y(d(C.value), 1)
    ], 2)) : (n(), r("span", {
      key: 8,
      class: Z({ "crm-muted": C.value === "—", "crm-value-compact": e.compact })
    }, d(C.value), 3));
  }
}), vn = { class: "crm-field" }, mn = { class: "crm-field-label" }, bn = {
  key: 0,
  "aria-label": "required"
}, fn = {
  key: 0,
  class: "crm-field-help"
}, yn = ["value", "disabled"], pn = ["value"], hn = ["value", "disabled"], gn = ["value"], kn = {
  key: 3,
  class: "crm-switch"
}, _n = ["checked", "disabled"], $n = {
  key: 5,
  class: "crm-inline-error",
  role: "alert"
}, wn = ["type", "value", "required", "min", "max", "minlength", "maxlength", "pattern", "disabled"], Cn = /* @__PURE__ */ ue({
  __name: "FieldInput",
  props: {
    crmId: {},
    attribute: {},
    attributes: {},
    modelValue: { type: [String, Number, Boolean, null, Array, Object] },
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = $(() => t.attribute.config || {});
    function u(V) {
      const g = V.target;
      t.attribute.data_type === "number" || t.attribute.data_type === "currency" ? l("update:modelValue", g.value === "" ? void 0 : Number(g.value)) : t.attribute.data_type === "datetime" ? l("update:modelValue", g.value === "" ? void 0 : `${g.value}:00`) : l("update:modelValue", g.value);
    }
    function h(V) {
      const g = V.target;
      l("update:modelValue", [...g.selectedOptions].map((i) => i.value));
    }
    const C = $(() => Ve(t.attribute)), I = $(() => t.attribute.data_type === "email" ? "email" : t.attribute.data_type === "url" ? "url" : t.attribute.data_type === "date" ? "date" : t.attribute.data_type === "time" ? "time" : t.attribute.data_type === "datetime" ? "datetime-local" : t.attribute.data_type === "number" || t.attribute.data_type === "currency" ? "number" : "text"), k = $(() => t.attribute.data_type === "datetime" && typeof t.modelValue == "string" ? t.modelValue.slice(0, 16) : t.modelValue ?? "");
    return (V, g) => (n(), r("label", vn, [
      a("span", mn, [
        Y(d(e.attribute.label || e.attribute.attr), 1),
        s.value.required ? (n(), r("b", bn, "*")) : N("", !0)
      ]),
      s.value.help || s.value.description ? (n(), r("span", fn, d(s.value.help || s.value.description), 1)) : N("", !0),
      e.attribute.data_type === "select" ? (n(), r("select", {
        key: 1,
        class: "crm-input",
        value: e.modelValue ?? "",
        disabled: e.disabled,
        onChange: u
      }, [
        g[2] || (g[2] = a("option", { value: "" }, "Select…", -1)),
        (n(!0), r(F, null, W(s.value.choices || [], (i) => (n(), r("option", {
          key: i,
          value: i
        }, d(i), 9, pn))), 128))
      ], 40, yn)) : e.attribute.data_type === "multi_select" ? (n(), r("select", {
        key: 2,
        class: "crm-input crm-multi",
        multiple: "",
        value: Array.isArray(e.modelValue) ? e.modelValue : [],
        disabled: e.disabled,
        onChange: h
      }, [
        (n(!0), r(F, null, W(s.value.choices || [], (i) => (n(), r("option", {
          key: i,
          value: i
        }, d(i), 9, gn))), 128))
      ], 40, hn)) : e.attribute.data_type === "boolean" ? (n(), r("label", kn, [
        a("input", {
          type: "checkbox",
          checked: e.modelValue === !0,
          disabled: e.disabled,
          onChange: g[0] || (g[0] = (i) => l("update:modelValue", i.target.checked))
        }, null, 40, _n),
        g[3] || (g[3] = a("span", null, null, -1)),
        a("em", null, d(e.modelValue === !0 ? "Yes" : "No"), 1)
      ])) : e.attribute.data_type === "relation" && C.value ? (n(), le(Ut, {
        key: 4,
        "crm-id": e.crmId,
        target: C.value,
        cardinality: s.value.cardinality === "many" ? "many" : "one",
        "model-value": e.modelValue,
        attributes: e.attributes,
        disabled: e.disabled,
        "onUpdate:modelValue": g[1] || (g[1] = (i) => l("update:modelValue", i))
      }, null, 8, ["crm-id", "target", "cardinality", "model-value", "attributes", "disabled"])) : e.attribute.data_type === "relation" ? (n(), r("span", $n, "This relation has no typed target.")) : (n(), r("input", {
        key: 6,
        class: "crm-input",
        type: I.value,
        value: k.value,
        placeholder: "",
        required: s.value.required,
        min: s.value.min,
        max: s.value.max,
        minlength: s.value.min_length,
        maxlength: s.value.max_length,
        pattern: s.value.pattern,
        disabled: e.disabled,
        onInput: u
      }, null, 40, wn))
    ]));
  }
}), jn = { class: "crm-dialog-head" }, In = {
  key: 0,
  class: "crm-inline-error",
  role: "alert"
}, Sn = { class: "crm-dialog-foot" }, Rn = ["disabled"], xn = ["disabled"], zt = /* @__PURE__ */ ue({
  __name: "RecordEditor",
  props: {
    crmId: {},
    title: {},
    attributes: {},
    schema: {},
    record: {},
    saving: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = ma({ ...t.record?.values || {} }), u = A(""), h = () => l("close"), C = { content: { class: "crm-dialog-content" } }, I = $(() => t.attributes.filter((g) => Ft(g).form !== !1));
    function k(g, i) {
      i === void 0 || i === "" ? delete s[g] : s[g] = i;
    }
    function V() {
      const g = I.value.find((i) => i.config?.required && (s[i.attr] === void 0 || s[i.attr] === ""));
      if (g) {
        u.value = `${g.label || g.attr} is required.`;
        return;
      }
      u.value = "", l("save", { ...s });
    }
    return (g, i) => (n(), le(p(qa), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog crm-dialog-wide",
      pt: C,
      "aria-label": e.title,
      "onUpdate:visible": i[0] || (i[0] = (y) => {
        y || h();
      })
    }, {
      default: Mt(() => [
        a("header", jn, [
          a("div", null, [
            a("h2", null, d(e.title), 1),
            i[1] || (i[1] = a("p", null, "Fields follow this object’s CRM schema.", -1))
          ]),
          a("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: h
          }, [
            j(p(x), { icon: "tabler:x" })
          ])
        ]),
        a("form", {
          class: "crm-dialog-body crm-form-grid crm-record-form",
          onSubmit: Ke(V, ["prevent"])
        }, [
          (n(!0), r(F, null, W(I.value, (y) => (n(), le(Cn, {
            key: y.attr,
            class: Z(`crm-field-span-${p(_a)(y)}`),
            "crm-id": e.crmId,
            attribute: y,
            attributes: e.schema,
            "model-value": s[y.attr],
            "onUpdate:modelValue": (v) => k(y.attr, v)
          }, null, 8, ["class", "crm-id", "attribute", "attributes", "model-value", "onUpdate:modelValue"]))), 128))
        ], 32),
        u.value ? (n(), r("div", In, d(u.value), 1)) : N("", !0),
        a("footer", Sn, [
          a("button", {
            type: "button",
            class: "crm-button",
            disabled: e.saving,
            onClick: h
          }, "Cancel", 8, Rn),
          a("button", {
            type: "button",
            class: "crm-button primary",
            disabled: e.saving,
            onClick: V
          }, [
            j(p(x), {
              icon: e.saving ? "tabler:loader-2" : "tabler:check",
              class: Z({ spin: e.saving })
            }, null, 8, ["icon", "class"]),
            Y(d(e.saving ? "Saving…" : "Save"), 1)
          ], 8, xn)
        ])
      ]),
      _: 1
    }, 8, ["aria-label"]));
  }
}), Vn = { class: "crm-page" }, Mn = { class: "crm-page-head" }, An = { class: "crm-page-title" }, Nn = { class: "crm-page-actions" }, Tn = {
  key: 0,
  class: "crm-search crm-command"
}, Ln = ["placeholder"], On = {
  key: 0,
  class: "crm-command-scoped",
  title: "Typed scope tokens are applied as filters"
}, En = ["title"], Fn = ["aria-expanded", "aria-controls"], Bn = ["id"], Dn = ["checked", "disabled", "onChange"], Pn = {
  class: "crm-segment",
  "aria-label": "View layout"
}, qn = ["aria-pressed"], Wn = ["aria-pressed"], Un = ["aria-pressed"], zn = {
  class: "crm-viewsbar",
  role: "tablist",
  "aria-label": "Saved views"
}, Kn = ["aria-selected"], Yn = ["aria-selected", "onClick"], Hn = { class: "crm-vtab-save" }, Gn = ["disabled"], Qn = {
  key: 0,
  class: "crm-state"
}, Jn = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, Xn = { class: "crm-table-wrap" }, Zn = { class: "crm-table" }, er = ["onClick"], tr = ["onClick"], ar = { class: "crm-avatar" }, lr = {
  key: 1,
  class: "crm-cell"
}, nr = ["aria-label", "onClick"], rr = {
  key: 0,
  class: "crm-empty"
}, sr = { class: "crm-empty-icon" }, or = {
  key: 0,
  class: "crm-gridfoot"
}, ir = { class: "crm-mono" }, ur = ["disabled"], cr = { class: "crm-foot-meta" }, dr = { class: "crm-mono" }, vr = {
  key: 3,
  class: "crm-board"
}, mr = ["onDrop"], br = { class: "crm-board-cards" }, fr = ["draggable", "onDragstart", "onClick"], yr = { class: "crm-avatar" }, pr = { key: 0 }, hr = { key: 0 }, gr = ["onClick"], kr = {
  key: 4,
  class: "crm-feed"
}, _r = { class: "crm-activity-icon" }, $r = ["onClick"], wr = ["datetime"], Cr = {
  key: 0,
  class: "crm-empty"
}, jr = { class: "crm-empty-icon" }, je = 50, Ge = 30, Ir = /* @__PURE__ */ ue({
  __name: "RecordsView",
  props: {
    crmId: {},
    object: {},
    objects: {},
    attributes: {},
    pipelines: {},
    views: {},
    canWrite: { type: Boolean, default: !0 },
    revision: { default: 0 }
  },
  emits: ["navigate", "changed"],
  setup(e, { emit: o }) {
    const t = ["updated_at", "created_at", "record_id"], l = e, s = o, u = A([]), h = A({}), C = A([]), I = A({}), k = A("table"), V = A(""), g = A(""), i = A([]), y = A(!0), v = A(!1), f = A(""), R = A(!1), E = A(!1), T = A(!1), z = Vt(), K = A(!1), J = A(""), ee = A(""), H = A([]), U = A({ attr: "", dir: "asc" }), X = A([]), w = A(0), O = A(0), _ = A(0);
    let M = {};
    const B = $(() => Se(l.attributes, l.object.type)), S = $(() => rt(B.value)), P = $(() => $a(B.value)), me = $(() => [...l.views.filter((m) => m.object_type === l.object.type), ...H.value]), re = $(() => [...ml(X.value, B.value), ...i.value]), G = $(() => wa(l.pipelines, l.object)), Le = $(() => Object.fromEntries(B.value.map((m) => [m.attr, m]))), Ce = $(() => new Set(B.value.map((m) => m.attr))), q = $(() => l.views.find((m) => m.object_type === l.object.type && (m.layout === "table" || !m.layout) && Array.isArray(m.spec?.columns) && (m.spec?.columns?.length || 0) > 0)), L = $(() => {
      const m = q.value?.spec?.columns?.filter((c) => Ce.value.has(c));
      return m && m.length ? m : Ca(B.value);
    }), te = A(null), he = $(() => {
      const m = te.value ? te.value.filter((c) => Ce.value.has(c)) : [];
      return m.length ? m : L.value;
    }), Oe = $(() => Object.fromEntries(u.value.map((m) => [m.record_id, m]))), Ee = $(() => re.value.length > 0 || g.value.trim() !== ""), Fe = $(() => u.value.length), ct = $(() => Fe.value < w.value), Jt = $(() => Object.values(I.value).reduce((m, c) => m + c.total, 0)), dt = $(() => {
      const m = (c) => c === 1 ? ye(l.object).toLowerCase() : l.object.label.toLowerCase();
      return k.value === "board" ? `${Jt.value} in ${G.value?.label || "pipeline"}` : Ee.value ? `${w.value} of ${O.value} ${m(w.value)}` : `${O.value} ${m(O.value)}`;
    }), Xt = $(() => `${Fe.value ? 1 : 0}–${Fe.value} of ${w.value}`);
    function vt() {
      const c = (M[l.crmId] || {})[l.object.type];
      return c && typeof c == "object" ? c : {};
    }
    async function Ye(m) {
      const c = { ...M[l.crmId] || {} };
      c[l.object.type] = { ...vt(), ...m }, M = { ...M, [l.crmId]: c }, await Va(M);
    }
    async function mt(m) {
      try {
        await Ye(m);
      } catch (c) {
        ae.toast({ severity: "error", summary: "Could not save view preferences", detail: se(c, "Profile write failed.") });
      }
    }
    function Zt(m) {
      if (m === S.value?.attr) return;
      const c = te.value ? [...te.value] : [...he.value], b = c.indexOf(m);
      b >= 0 ? c.splice(b, 1) : c.push(m), te.value = c, mt({ columns: c });
    }
    function ea(m) {
      m.currentTarget.contains(m.relatedTarget) || (T.value = !1);
    }
    function bt(m) {
      if (!m) return "";
      for (const c of P.value) {
        const b = m.values[c.attr];
        if (!(b == null || b === "")) {
          if (c.data_type === "relation") {
            const D = lt(b, h.value, c.config?.target);
            if (D.length) return D.map((Q) => Q.label).join(", ");
          }
          return nt(b, c);
        }
      }
      return "";
    }
    function ge(m, c = "") {
      return m ? xe(m, B.value) : c;
    }
    async function Be(m, c) {
      Ue(m, l.object.type, c, l.attributes);
      const b = B.value.filter((Q) => Q.data_type === "relation"), D = /* @__PURE__ */ new Set();
      for (const Q of m) for (const de of b) for (const ie of xa(Q.values[de.attr])) c[ie] || D.add(ie);
      D.size && Ue(await Ie(l.crmId, [...D]), "", c, l.attributes);
    }
    async function ce(m = {}) {
      const c = m.background ? Math.max(je, u.value.length) : je;
      m.background || (y.value = !0, f.value = "", _.value = 0);
      try {
        const [b, D, Q] = await Promise.all([
          kt(l.crmId, l.object.type, { filters: re.value, sort: U.value.attr ? U.value : void 0, search: g.value, limit: c, offset: 0 }),
          Tt(l.crmId, l.object.type),
          Ze(l.crmId, void 0, 100)
        ]);
        u.value = b.rows, w.value = b.total, O.value = D, C.value = Q, _.value = Math.max(0, b.rows.length - je), f.value = "";
        const de = {};
        await Be(b.rows, de), h.value = de, k.value === "board" && await ft();
      } catch (b) {
        m.background || (f.value = se(b, `${l.object.label} could not load.`));
      } finally {
        m.background || (y.value = !1);
      }
    }
    async function ta() {
      if (!(v.value || !ct.value)) {
        v.value = !0;
        try {
          _.value += je;
          const m = await kt(l.crmId, l.object.type, { filters: re.value, sort: U.value.attr ? U.value : void 0, search: g.value, limit: je, offset: _.value });
          u.value = [...u.value, ...m.rows], w.value = m.total;
          const c = { ...h.value };
          await Be(m.rows, c), h.value = c;
        } catch (m) {
          ae.toast({ severity: "error", summary: "Could not load more", detail: se(m, "CRM query failed.") });
        } finally {
          v.value = !1;
        }
      }
    }
    async function ft() {
      if (!G.value) {
        I.value = {};
        return;
      }
      const m = await _t(l.crmId, G.value.collection_id, { limit: Ge, offset: 0 }), c = Object.values(m).flatMap((ie) => ie.records.map((ke) => ke.record_id)), b = c.length ? await Ie(l.crmId, c) : [], D = Object.fromEntries(b.map((ie) => [ie.record_id, ie])), Q = {};
      for (const ie of gt(G.value)) {
        const ke = m[ie.stage_id] || { records: [], total: 0 };
        Q[ie.stage_id] = { rows: ke.records.map((fe) => D[fe.record_id]).filter(Boolean), total: ke.total };
      }
      const de = { ...h.value };
      await Be(b, de), I.value = Q, h.value = de;
    }
    async function aa(m) {
      const c = I.value[m.stage_id];
      if (!G.value || !c || c.rows.length >= c.total) return;
      const b = await _t(l.crmId, G.value.collection_id, { limit: Ge, offset: c.rows.length }), D = (b[m.stage_id]?.records || []).map((fe) => fe.record_id), Q = D.length ? await Ie(l.crmId, D) : [], de = Object.fromEntries(Q.map((fe) => [fe.record_id, fe])), ie = D.map((fe) => de[fe]).filter(Boolean), ke = { ...h.value };
      await Be(ie, ke), I.value = { ...I.value, [m.stage_id]: { rows: [...c.rows, ...ie], total: b[m.stage_id]?.total || c.total } }, h.value = ke;
    }
    function la(m) {
      U.value = { attr: m, dir: U.value.attr === m && U.value.dir === "asc" ? "desc" : "asc" }, mt({ sort: U.value }), ce();
    }
    async function na(m) {
      E.value = !0;
      const c = Ia(l.object.type);
      try {
        await We(l.crmId, ol(c, l.object.type, B.value, m)), ae.toast({ severity: "success", summary: `${ye(l.object)} created`, detail: xe({ record_id: c, values: m }, B.value) }), R.value = !1, await ce(), s("changed"), s("navigate", $e(l.object.type, c));
      } catch (b) {
        ae.toast({ severity: "error", summary: "Could not create record", detail: se(b, "CRM write failed.") });
      } finally {
        E.value = !1;
      }
    }
    async function ra(m, c) {
      if (!G.value) return;
      const b = Object.entries(I.value).find(([, D]) => D.rows.some((Q) => Q.record_id === m.record_id))?.[0];
      if (b !== c.stage_id)
        try {
          await We(l.crmId, [{ type: we.membershipSet, body: { collection_id: G.value.collection_id, record_id: m.record_id, stage_id: c.stage_id, position: (I.value[c.stage_id]?.total || 0) + 1, ...b ? { from_stage_id: b } : {} } }]), ae.toast({ severity: "success", summary: "Stage updated", detail: ge(m) }), await ce(), s("changed");
        } catch (D) {
          ae.toast({ severity: "error", summary: "Could not move record", detail: se(D, "CRM write failed.") });
        }
    }
    function sa(m) {
      return String(m.payload?.title || m.activity_type || "Activity");
    }
    function oa(m) {
      ee.value = m.view_id, V.value = "", i.value = [], g.value = "", X.value = m.layout === "board" ? [] : bl(m.spec?.filters, B.value);
      const c = Array.isArray(m.spec?.columns) ? m.spec.columns.filter((b) => Ce.value.has(b)) : [];
      c.length && (te.value = c.slice(), Ye({ columns: c })), m.spec?.sort?.attr && (U.value = { attr: m.spec.sort.attr, dir: m.spec.sort.dir === "desc" ? "desc" : "asc" }), m.layout === "board" && G.value ? k.value = "board" : m.layout === "timeline" ? k.value = "timeline" : k.value = "table", ce();
    }
    function ia() {
      ee.value = "", X.value = [], V.value = "", i.value = [], g.value = "", ce();
    }
    function yt() {
      const m = J.value.trim();
      m && (ua(m), J.value = "", K.value = !1);
    }
    async function ua(m) {
      const c = `private:${l.object.type}:${Sa(m) || "view"}`, b = k.value === "board" ? { columns: he.value, sort: U.value } : { filters: re.value, columns: he.value, sort: U.value }, D = { view_id: c, object_type: l.object.type, name: m, layout: k.value, spec: b };
      k.value === "board" && G.value && (D.collection_id = G.value.collection_id);
      try {
        const Q = [...H.value.filter((de) => de.view_id !== c), D];
        H.value = Q, await Ye({ views: Q }), ae.toast({ severity: "success", summary: "View saved", detail: m });
      } catch (Q) {
        ae.toast({ severity: "error", summary: "Could not save view", detail: se(Q, "CRM write failed.") });
      }
    }
    async function pt() {
      try {
        M = await Ra();
      } catch (b) {
        M = {}, ae.toast({ severity: "error", summary: "Could not load view preferences", detail: se(b, "Profile read failed.") });
      }
      const m = vt();
      H.value = Array.isArray(m.views) ? m.views.filter((b) => b && b.object_type === l.object.type && b.view_id.startsWith(`private:${l.object.type}:`)) : [], Array.isArray(m.columns) && m.columns.length && (te.value = m.columns.slice());
      const c = q.value?.spec?.sort;
      m.sort?.attr ? U.value = { attr: m.sort.attr, dir: m.sort.dir === "desc" ? "desc" : "asc" } : c?.attr && (Ce.value.has(c.attr) || t.includes(c.attr)) ? U.value = { attr: c.attr, dir: c.dir === "desc" ? "desc" : "asc" } : U.value = { attr: S.value?.attr || "", dir: "asc" };
    }
    function ca() {
      const { filters: m, text: c } = yl(V.value, B.value);
      i.value = m, g.value = c;
    }
    function da() {
      ca(), ce();
    }
    ve(() => k.value, (m) => {
      m === "board" && ft();
    }), ve(() => l.object.type, async () => {
      k.value = "table", V.value = "", g.value = "", i.value = [], T.value = !1, X.value = [], te.value = null, ee.value = "", await pt(), await ce();
    }), ve(() => JSON.stringify(re.value), () => ce()), ve(() => l.revision, () => {
      ce({ background: !0 });
    });
    let Re;
    return ve(V, () => {
      Re && clearTimeout(Re), Re = setTimeout(da, 250);
    }), At(() => {
      Re && clearTimeout(Re);
    }), Ne(async () => {
      await pt(), await ce();
    }), (m, c) => (n(), r("section", Vn, [
      a("header", Mn, [
        a("div", An, [
          c[16] || (c[16] = a("span", { class: "crm-eyebrow" }, "Records", -1)),
          a("h1", null, d(e.object.label), 1)
        ]),
        a("div", Nn, [
          k.value !== "board" ? (n(), r("label", Tn, [
            j(p(x), { icon: "tabler:search" }),
            qe(a("input", {
              "onUpdate:modelValue": c[0] || (c[0] = (b) => V.value = b),
              type: "search",
              placeholder: `Search ${e.object.label.toLowerCase()} · attr:value…`,
              "aria-label": "Search and scope"
            }, null, 8, Ln), [
              [Xe, V.value]
            ]),
            i.value.length ? (n(), r("kbd", On, d(i.value.length) + " scoped", 1)) : N("", !0)
          ])) : N("", !0),
          k.value !== "board" ? (n(), le(Jl, {
            key: 1,
            modelValue: X.value,
            "onUpdate:modelValue": c[1] || (c[1] = (b) => X.value = b),
            "crm-id": e.crmId,
            fields: B.value
          }, null, 8, ["modelValue", "crm-id", "fields"])) : N("", !0),
          a("span", {
            class: "crm-count",
            title: dt.value
          }, d(dt.value), 9, En),
          k.value === "table" ? (n(), r("div", {
            key: 2,
            class: "crm-colpicker",
            onFocusout: ea
          }, [
            a("button", {
              class: Z(["crm-icon-button", { active: T.value }]),
              title: "Columns",
              "aria-label": "Columns",
              "aria-expanded": T.value,
              "aria-controls": p(z),
              onClick: c[2] || (c[2] = (b) => T.value = !T.value)
            }, [
              j(p(x), { icon: "tabler:columns-3" })
            ], 10, Fn),
            T.value ? (n(), r("div", {
              key: 0,
              id: p(z),
              class: "crm-colmenu",
              role: "group",
              "aria-label": "Visible columns"
            }, [
              c[17] || (c[17] = a("span", { class: "crm-colmenu-label" }, "Columns", -1)),
              (n(!0), r(F, null, W(B.value, (b) => (n(), r("label", {
                key: b.attr,
                class: "crm-colopt"
              }, [
                a("input", {
                  type: "checkbox",
                  checked: he.value.includes(b.attr),
                  disabled: b.attr === S.value?.attr,
                  onChange: (D) => Zt(b.attr)
                }, null, 40, Dn),
                a("span", null, d(b.label || b.attr), 1)
              ]))), 128))
            ], 8, Bn)) : N("", !0)
          ], 32)) : N("", !0),
          a("div", Pn, [
            a("button", {
              class: Z({ active: k.value === "table" }),
              "aria-label": "Table view",
              "aria-pressed": k.value === "table",
              onClick: c[3] || (c[3] = (b) => k.value = "table")
            }, [
              j(p(x), { icon: "tabler:table" })
            ], 10, qn),
            G.value ? (n(), r("button", {
              key: 0,
              class: Z({ active: k.value === "board" }),
              "aria-label": "Board view",
              "aria-pressed": k.value === "board",
              onClick: c[4] || (c[4] = (b) => k.value = "board")
            }, [
              j(p(x), { icon: "tabler:layout-kanban" })
            ], 10, Wn)) : N("", !0),
            a("button", {
              class: Z({ active: k.value === "timeline" }),
              "aria-label": "Timeline view",
              "aria-pressed": k.value === "timeline",
              onClick: c[5] || (c[5] = (b) => k.value = "timeline")
            }, [
              j(p(x), { icon: "tabler:timeline-event" })
            ], 10, Un)
          ]),
          e.canWrite ? (n(), r("button", {
            key: 3,
            class: "crm-button primary",
            onClick: c[6] || (c[6] = (b) => R.value = !0)
          }, [
            j(p(x), { icon: "tabler:plus" }),
            Y("New " + d(p(ye)(e.object)), 1)
          ])) : N("", !0)
        ])
      ]),
      a("div", zn, [
        a("button", {
          class: Z(["crm-vtab", { active: !ee.value }]),
          role: "tab",
          "aria-selected": !ee.value,
          onClick: ia
        }, "All " + d(e.object.label.toLowerCase()), 11, Kn),
        (n(!0), r(F, null, W(me.value, (b) => (n(), r("button", {
          key: b.view_id,
          class: Z(["crm-vtab", { active: ee.value === b.view_id }]),
          role: "tab",
          "aria-selected": ee.value === b.view_id,
          onClick: (D) => oa(b)
        }, d(b.name), 11, Yn))), 128)),
        a("div", Hn, [
          K.value ? (n(), r(F, { key: 1 }, [
            qe(a("input", {
              "onUpdate:modelValue": c[8] || (c[8] = (b) => J.value = b),
              class: "crm-input",
              placeholder: "Name this view",
              "aria-label": "View name",
              onKeyup: [
                Je(yt, ["enter"]),
                c[9] || (c[9] = Je((b) => K.value = !1, ["esc"]))
              ]
            }, null, 544), [
              [Xe, J.value]
            ]),
            a("button", {
              class: "crm-button primary small",
              disabled: !J.value.trim(),
              onClick: yt
            }, [
              j(p(x), { icon: "tabler:device-floppy" }),
              c[19] || (c[19] = Y("Save", -1))
            ], 8, Gn),
            a("button", {
              class: "crm-button small",
              onClick: c[10] || (c[10] = (b) => K.value = !1)
            }, "Cancel")
          ], 64)) : (n(), r("button", {
            key: 0,
            class: "crm-vtab add",
            onClick: c[7] || (c[7] = (b) => K.value = !0)
          }, [
            j(p(x), { icon: "tabler:plus" }),
            c[18] || (c[18] = Y("Save view", -1))
          ]))
        ])
      ]),
      y.value ? (n(), r("div", Qn, [
        j(p(x), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        Y(" Loading " + d(e.object.label.toLowerCase()) + "…", 1)
      ])) : f.value ? (n(), r("div", Jn, [
        j(p(x), { icon: "tabler:alert-circle" }),
        a("div", null, [
          a("strong", null, d(e.object.label) + " could not load", 1),
          a("span", null, d(f.value), 1)
        ]),
        a("button", {
          class: "crm-button",
          onClick: c[11] || (c[11] = (b) => ce())
        }, "Try again")
      ])) : k.value === "table" ? (n(), r(F, { key: 2 }, [
        a("div", Xn, [
          a("table", Zn, [
            a("thead", null, [
              a("tr", null, [
                (n(!0), r(F, null, W(he.value, (b) => (n(), r("th", { key: b }, [
                  a("button", {
                    onClick: (D) => la(b)
                  }, [
                    Y(d(Le.value[b]?.label || b), 1),
                    U.value.attr === b ? (n(), le(p(x), {
                      key: 0,
                      icon: U.value.dir === "asc" ? "tabler:chevron-up" : "tabler:chevron-down"
                    }, null, 8, ["icon"])) : N("", !0)
                  ], 8, er)
                ]))), 128)),
                c[20] || (c[20] = a("th", { "aria-label": "Open" }, null, -1))
              ])
            ]),
            a("tbody", null, [
              (n(!0), r(F, null, W(u.value, (b) => (n(), r("tr", {
                key: b.record_id
              }, [
                (n(!0), r(F, null, W(he.value, (D) => (n(), r("td", { key: D }, [
                  D === S.value?.attr ? (n(), r("button", {
                    key: 0,
                    type: "button",
                    class: "crm-name-cell crm-row-link",
                    onClick: (Q) => s("navigate", p($e)(e.object.type, b.record_id))
                  }, [
                    a("span", ar, d(p(Me)(ge(b))), 1),
                    a("strong", null, d(ge(b)), 1)
                  ], 8, tr)) : (n(), r("span", lr, [
                    j(Ae, {
                      value: b.values[D],
                      attribute: Le.value[D],
                      names: h.value,
                      compact: "",
                      onNavigate: c[12] || (c[12] = (Q) => s("navigate", Q))
                    }, null, 8, ["value", "attribute", "names"])
                  ]))
                ]))), 128)),
                a("td", null, [
                  a("button", {
                    type: "button",
                    class: "crm-row-open",
                    "aria-label": `Open ${ge(b)}`,
                    onClick: (D) => s("navigate", p($e)(e.object.type, b.record_id))
                  }, [
                    j(p(x), {
                      icon: "tabler:chevron-right",
                      class: "crm-row-arrow"
                    })
                  ], 8, nr)
                ])
              ]))), 128))
            ])
          ]),
          u.value.length ? N("", !0) : (n(), r("div", rr, [
            a("span", sr, [
              j(p(x), { icon: "tabler:address-book-off" })
            ]),
            a("h2", null, d(Ee.value ? "No matching records" : `No ${e.object.label.toLowerCase()} yet`), 1),
            a("p", null, d(Ee.value ? "Try a different search or clear the filters." : `Create the first ${p(ye)(e.object).toLowerCase()} to get started.`), 1),
            !Ee.value && e.canWrite ? (n(), r("button", {
              key: 0,
              class: "crm-button primary",
              onClick: c[13] || (c[13] = (b) => R.value = !0)
            }, [
              j(p(x), { icon: "tabler:plus" }),
              Y("New " + d(p(ye)(e.object)), 1)
            ])) : N("", !0)
          ]))
        ]),
        u.value.length ? (n(), r("footer", or, [
          a("span", ir, d(Xt.value), 1),
          ct.value ? (n(), r("button", {
            key: 0,
            class: "crm-button",
            disabled: v.value,
            onClick: ta
          }, [
            v.value ? (n(), le(p(x), {
              key: 0,
              icon: "tabler:loader-2",
              class: "spin"
            })) : N("", !0),
            Y("Load " + d(Math.min(je, w.value - Fe.value)) + " more", 1)
          ], 8, ur)) : N("", !0),
          c[22] || (c[22] = a("span", { class: "crm-grow" }, null, -1)),
          a("span", cr, [
            c[21] || (c[21] = Y("sorted by ", -1)),
            a("span", dr, d(U.value.attr) + " " + d(U.value.dir), 1)
          ])
        ])) : N("", !0)
      ], 64)) : k.value === "board" && G.value ? (n(), r("div", vr, [
        (n(!0), r(F, null, W(p(gt)(G.value), (b) => (n(), r("section", {
          key: b.stage_id,
          class: "crm-board-column",
          onDragover: c[14] || (c[14] = Ke(() => {
          }, ["prevent"])),
          onDrop: (D) => e.canWrite && D.dataTransfer?.getData("text/plain") && Oe.value[D.dataTransfer.getData("text/plain")] && ra(Oe.value[D.dataTransfer.getData("text/plain")], b)
        }, [
          a("header", null, [
            a("span", null, d(b.label), 1),
            a("b", null, d(I.value[b.stage_id]?.total ?? 0), 1)
          ]),
          a("div", br, [
            (n(!0), r(F, null, W(I.value[b.stage_id]?.rows || [], (D) => (n(), r("button", {
              key: D.record_id,
              class: "crm-board-card",
              draggable: e.canWrite,
              onDragstart: (Q) => e.canWrite && Q.dataTransfer?.setData("text/plain", D.record_id),
              onClick: (Q) => s("navigate", p($e)(e.object.type, D.record_id))
            }, [
              a("span", yr, d(p(Me)(ge(D))), 1),
              a("span", null, [
                a("strong", null, d(ge(D)), 1),
                bt(D) ? (n(), r("small", pr, d(bt(D)), 1)) : N("", !0)
              ])
            ], 40, fr))), 128)),
            (I.value[b.stage_id]?.rows || []).length ? (I.value[b.stage_id]?.total ?? 0) > (I.value[b.stage_id]?.rows.length ?? 0) ? (n(), r("button", {
              key: 1,
              class: "crm-button ghost small crm-lane-more",
              onClick: (D) => aa(b)
            }, "Load " + d(Math.min(Ge, (I.value[b.stage_id]?.total ?? 0) - (I.value[b.stage_id]?.rows.length ?? 0))) + " more", 9, gr)) : N("", !0) : (n(), r("p", hr, "No records in " + d(b.label), 1))
          ])
        ], 40, mr))), 128))
      ])) : (n(), r("div", kr, [
        (n(!0), r(F, null, W(C.value, (b) => (n(), r("article", {
          key: b.activity_id,
          class: "crm-feed-item"
        }, [
          a("span", _r, [
            j(p(x), {
              icon: b.activity_type === "call" ? "tabler:phone" : b.activity_type === "email" ? "tabler:mail" : b.activity_type === "meeting" ? "tabler:calendar" : "tabler:note"
            }, null, 8, ["icon"])
          ]),
          a("div", null, [
            a("strong", null, d(sa(b)), 1),
            a("p", null, [
              b.record_id && Oe.value[b.record_id] ? (n(), r("button", {
                key: 0,
                onClick: (D) => s("navigate", p($e)(e.object.type, b.record_id))
              }, d(ge(Oe.value[b.record_id], b.record_id)), 9, $r)) : N("", !0),
              a("span", null, d(b.activity_type), 1)
            ])
          ]),
          a("time", {
            datetime: b.occurred_at
          }, d(p(ja)(b.occurred_at)), 9, wr)
        ]))), 128)),
        C.value.length ? N("", !0) : (n(), r("div", Cr, [
          a("span", jr, [
            j(p(x), { icon: "tabler:timeline-event" })
          ]),
          c[23] || (c[23] = a("h2", null, "No activity yet", -1)),
          c[24] || (c[24] = a("p", null, "Calls, emails, meetings, and notes will appear here.", -1))
        ]))
      ])),
      R.value ? (n(), le(zt, {
        key: 5,
        "crm-id": e.crmId,
        title: `New ${p(ye)(e.object)}`,
        attributes: B.value,
        schema: e.attributes,
        saving: E.value,
        onClose: c[15] || (c[15] = (b) => R.value = !1),
        onSave: na
      }, null, 8, ["crm-id", "title", "attributes", "schema", "saving"])) : N("", !0)
    ]));
  }
}), Sr = 8e3, St = /* @__PURE__ */ new Map();
function Rr(e) {
  if (customElements.get(e)) return Promise.resolve();
  const o = St.get(e);
  if (o) return o;
  const t = Promise.resolve().then(() => fa(e, { timeoutMs: Sr })).then(() => {
  }).catch((l) => {
    console.warn(`CRM record panel <${e}> is unavailable.`, l);
  });
  return St.set(e, t), t;
}
const xr = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  note: "Note",
  task: "Task"
}, Vr = {
  meeting: "tabler:calendar-event",
  call: "tabler:phone",
  email: "tabler:mail",
  note: "tabler:note",
  task: "tabler:checkbox"
}, Mr = {
  in: "Inbound",
  inbound: "Inbound",
  out: "Outbound",
  outbound: "Outbound"
}, Ar = {
  scheduled: "Scheduled",
  completed: "Completed",
  rescheduled: "Rescheduled",
  no_show: "No show",
  canceled: "Canceled",
  cancelled: "Canceled"
}, Nr = "meeting";
function ne(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Te(e) {
  return ne(e).toLowerCase();
}
function it(e) {
  return xr[Te(e)] || oe(ne(e)) || "Activity";
}
function Tr(e) {
  return Vr[Te(e)] || "tabler:point";
}
function Lr(e) {
  const o = Te(e);
  return o ? Mr[o] || oe(o) : "";
}
function Or(e) {
  const o = Te(e);
  return o ? Ar[o] || oe(o) : "";
}
function Er(e) {
  const o = typeof e == "number" ? e : Number.parseFloat(ne(e));
  if (!Number.isFinite(o) || o <= 0) return "";
  const t = Math.round(o / 60);
  if (t < 1) return "Under a minute";
  if (t < 60) return `${t} min`;
  const l = Math.floor(t / 60), s = t % 60;
  return s === 0 ? `${l} hr` : `${l} hr ${s} min`;
}
function Fr(e) {
  return ne(e.payload?.title) || it(e.activity_type);
}
function Br(e) {
  const t = (ne(e).split("@")[0] ?? "").split(/[._+-]+/).filter((l) => l !== "");
  return t.length ? t.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(" ") : ne(e);
}
function Dr(e, o = "") {
  const t = e.payload?.attendee_emails, l = Array.isArray(t) ? t : [], s = ne(o).toLowerCase(), u = /* @__PURE__ */ new Set(), h = [];
  for (const C of l) {
    const I = ne(typeof C == "string" ? C : C?.email), k = I.toLowerCase();
    !I || k === s || u.has(k) || (u.add(k), h.push({ name: Br(I), email: I }));
  }
  return h;
}
function Kt(e) {
  const o = e, t = ne(o.external_id);
  if (!t) return "";
  const l = ne(o.source);
  return l && t.startsWith(`${l}:`) ? t.slice(l.length + 1) : t;
}
function ut(e) {
  return Te(e.activity_type) === Nr;
}
function Pr(e) {
  const o = [];
  for (const t of e) {
    if (!ut(t)) continue;
    const l = Kt(t);
    l && !o.includes(l) && o.push(l);
  }
  return o;
}
function qr(e, o) {
  const t = Math.max(1, Math.floor(o)), l = [];
  for (let s = 0; s < e.length; s += t) l.push(e.slice(s, s + t));
  return l;
}
function Wr(e) {
  const o = {};
  if (!Array.isArray(e)) return o;
  for (const t of e) {
    const l = t ?? {}, s = ne(l.meeting_id);
    if (!s) continue;
    const u = Array.isArray(l.refs) ? l.refs : [];
    for (const h of u) {
      const C = ne(h?.external_id);
      C && (o[C] = s);
    }
  }
  return o;
}
function Ur(e) {
  const o = ne(e);
  return o ? `/meetings/${encodeURIComponent(o)}` : "";
}
function zr(e, o) {
  if (!ut(e)) return "";
  const t = Kt(e);
  return t ? Ur(o[t] || "") : "";
}
function Kr(e) {
  const o = e, t = [{ key: "type", label: it(e.activity_type) }], l = Er(o.duration_sec);
  l && t.push({ key: "duration", label: l, icon: "tabler:clock" });
  const s = Lr(o.direction);
  s && t.push({ key: "direction", label: s, icon: "tabler:arrows-left-right" });
  const u = Or(o.outcome);
  return u && t.push({ key: "outcome", label: u, icon: "tabler:flag" }), o.has_transcript === !0 && t.push({ key: "transcript", label: "Transcript", icon: "tabler:file-text" }), e.due_at && e.done !== !0 && t.push({ key: "due", label: "Open", icon: "tabler:hourglass" }), t;
}
function Yr(e) {
  const o = ne(e.source);
  return o ? oe(o.toLowerCase()) : "";
}
const Hr = ["title", "attendee_emails"];
function Gr(e) {
  const o = e.payload;
  if (!$t(o)) return [];
  const t = {};
  for (const [l, s] of Object.entries(o))
    Hr.includes(l) || s == null || s === "" || Array.isArray(s) && s.length === 0 || $t(s) && Object.keys(s).length === 0 || (t[l] = s);
  return Object.keys(t).length ? Et(t).filter((l) => l.text !== "" && l.text !== "—") : [];
}
function Yt(e, o) {
  const t = ne(e.record_id);
  return t && t !== ne(o) ? t : "";
}
function Qr(e) {
  for (const o of e) {
    const t = ne(o.occurred_at);
    if (t) return t;
  }
  return "";
}
function Qe(e, o, t) {
  if (!t.id || !t.type) return;
  const l = `${t.direction}|${t.attr}|${t.id}`;
  o.has(l) || (o.add(l), e.push(t));
}
function Ht(e, o = []) {
  if (!e) return [];
  const t = [], l = /* @__PURE__ */ new Set();
  for (const s of e.associations?.outgoing || [])
    Qe(t, l, { id: s.target.id, type: s.target.type, attr: s.attr, direction: "outgoing" });
  for (const s of o)
    if (s.data_type === "relation")
      for (const u of at(e.values[s.attr]))
        u.kind === "record" && Qe(t, l, { id: u.id, type: u.type, attr: s.attr, direction: "outgoing" });
  for (const s of e.associations?.incoming || [])
    Qe(t, l, { id: s.source.id, type: s.source.type, attr: s.attr, direction: "incoming" });
  return t;
}
function Jr(e, o, t) {
  const l = e.direction === "outgoing" ? t : e.type;
  return Se(o, l).find((u) => u.attr === e.attr)?.label?.trim() || oe(e.attr);
}
function Gt(e, o) {
  const t = /* @__PURE__ */ new Map();
  for (const u of e) {
    const h = t.get(u.type);
    h ? h.push(u) : t.set(u.type, [u]);
  }
  const l = o.map((u) => u.type).filter((u) => t.has(u)), s = [...t.keys()].filter((u) => !l.includes(u));
  return [...l, ...s].map((u) => ({
    type: u,
    label: o.find((h) => h.type === u)?.label || oe(u),
    rows: t.get(u) || []
  }));
}
const Qt = 5;
function Xr(e, o, t = Qt) {
  const l = [];
  for (const s of Gt(e, o))
    for (const u of s.rows.slice(0, t)) l.includes(u.id) || l.push(u.id);
  return l;
}
const Zr = {
  key: 0,
  class: "crm-card crm-fields-card"
}, es = { class: "crm-fields-kind" }, ts = { class: "crm-fields" }, as = {
  key: 1,
  class: "crm-card crm-more-card"
}, ls = { class: "crm-more-summary" }, ns = { class: "crm-fields" }, rs = /* @__PURE__ */ ue({
  __name: "RecordFields",
  props: {
    record: {},
    fields: {},
    names: {},
    stated: { default: () => [] }
  },
  emits: ["navigate"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = $(() => Ma(t.fields)), u = $(() => Aa(s.value.reading, t.record.values, t.stated)), h = $(() => Na(s.value.reading, s.value.system, t.record.values));
    function C(I) {
      return Ot(t.record.values[I.attr], I);
    }
    return (I, k) => (n(), r(F, null, [
      u.value.length ? (n(), r("section", Zr, [
        (n(!0), r(F, null, W(u.value, (V) => (n(), r("div", {
          key: V.key,
          class: "crm-fields-group"
        }, [
          a("p", es, d(V.label), 1),
          a("dl", ts, [
            (n(!0), r(F, null, W(V.fields, (g) => (n(), r("div", {
              key: g.attr,
              class: Z({ stacked: C(g) })
            }, [
              a("dt", null, d(g.label || g.attr), 1),
              a("dd", null, [
                j(Ae, {
                  value: e.record.values[g.attr],
                  attribute: g,
                  names: e.names,
                  onNavigate: k[0] || (k[0] = (i) => l("navigate", i))
                }, null, 8, ["value", "attribute", "names"])
              ])
            ], 2))), 128))
          ])
        ]))), 128))
      ])) : N("", !0),
      h.value.length ? (n(), r("section", as, [
        a("details", null, [
          a("summary", ls, [
            j(p(x), {
              icon: "tabler:chevron-right",
              class: "crm-more-caret",
              "aria-hidden": "true"
            }),
            k[2] || (k[2] = a("span", null, "More fields", -1)),
            a("small", null, d(h.value.length), 1)
          ]),
          a("dl", ns, [
            (n(!0), r(F, null, W(h.value, (V) => (n(), r("div", {
              key: V.attr,
              class: Z({ stacked: C(V) })
            }, [
              a("dt", null, d(V.label || V.attr), 1),
              a("dd", null, [
                j(Ae, {
                  value: e.record.values[V.attr],
                  attribute: V,
                  names: e.names,
                  onNavigate: k[1] || (k[1] = (g) => l("navigate", g))
                }, null, 8, ["value", "attribute", "names"])
              ])
            ], 2))), 128))
          ])
        ])
      ])) : N("", !0)
    ], 64));
  }
}), ss = { class: "crm-card crm-timeline-card" }, os = { class: "crm-card-head" }, is = { key: 0 }, us = {
  key: 0,
  class: "crm-inline-error",
  role: "status",
  "data-test": "link-error"
}, cs = {
  key: 1,
  class: "crm-timeline"
}, ds = { class: "crm-activity-icon" }, vs = { class: "crm-timeline-body" }, ms = { class: "crm-timeline-head" }, bs = ["datetime"], fs = { class: "crm-timeline-facts" }, ys = {
  key: 0,
  class: "crm-fact",
  "data-test": "activity-source"
}, ps = {
  key: 0,
  class: "crm-timeline-people"
}, hs = ["title"], gs = {
  key: 0,
  class: "crm-muted"
}, ks = {
  key: 0,
  class: "crm-timeline-anchor",
  "data-test": "activity-anchor"
}, _s = ["onClick"], $s = { key: 1 }, ws = {
  key: 1,
  class: "crm-timeline-details",
  "data-test": "activity-details"
}, Cs = {
  key: 2,
  class: "crm-empty-copy"
}, js = ["disabled"], Is = 100, Rt = 3, Ss = /* @__PURE__ */ ue({
  __name: "RecordActivity",
  props: {
    activities: {},
    selfEmail: { default: "" },
    hasMore: { type: Boolean, default: !1 },
    loadingMore: { type: Boolean, default: !1 },
    recordId: { default: "" },
    names: { default: () => ({}) }
  },
  emits: ["more", "navigate"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = A({}), u = A("");
    let h = 0;
    function C(i) {
      const y = Yt(i, t.recordId);
      if (!y) return { name: "", route: "" };
      const v = t.names[y];
      return { name: v?.name || st(y), route: v?.type ? $e(v.type, y) : "" };
    }
    const I = $(() => t.activities.map((i) => {
      const y = Dr(i, t.selfEmail), v = C(i);
      return {
        id: i.activity_id,
        title: Fr(i),
        icon: Tr(i.activity_type),
        occurredAt: i.occurred_at || "",
        when: Bt(i.occurred_at) || "Date unavailable",
        facts: Kr(i),
        people: y.slice(0, Rt),
        hidden: Math.max(0, y.length - Rt),
        href: zr(i, s.value),
        source: Yr(i),
        details: Gr(i),
        anchorName: v.name,
        anchorRoute: v.route
      };
    })), k = $(() => {
      const i = t.activities.length;
      if (!i) return "";
      const y = new Set(t.activities.map((f) => f.activity_type)), v = y.size === 1 ? it([...y][0]).toLowerCase() : "activity";
      return v === "activity" ? `${i} ${i === 1 ? "entry" : "entries"}` : `${i} ${v}${i === 1 ? "" : "s"}`;
    });
    async function V(i) {
      const y = ++h;
      u.value = "";
      const v = Pr(i);
      if (!v.length || !ht) {
        s.value = {};
        return;
      }
      try {
        const f = {};
        for (const R of qr(v, Is)) {
          const { data: E } = await ht.get(`/api/v1/meetings?limit=${R.length}&external_ids=${encodeURIComponent(R.join(","))}`);
          if (E?.success !== !0) throw new Error(typeof E?.error == "string" && E.error ? E.error : "The meetings behind these calls could not be read.");
          Object.assign(f, Wr(E.items));
        }
        if (y !== h) return;
        s.value = f;
      } catch (f) {
        if (y !== h) return;
        s.value = {}, u.value = f instanceof Error && f.message ? f.message : "The meetings behind these calls could not be read.";
      }
    }
    ve(() => t.activities, (i) => {
      i.some(ut) ? V(i) : (h++, s.value = {}, u.value = "");
    }, { immediate: !0 });
    function g(i, y) {
      if (!(y.button !== 0 || y.metaKey || y.ctrlKey || y.shiftKey || y.altKey))
        try {
          ae.navigate(i), y.preventDefault();
        } catch {
        }
    }
    return (i, y) => (n(), r("section", ss, [
      a("header", os, [
        a("div", null, [
          y[1] || (y[1] = a("h2", null, "Activity", -1)),
          k.value ? (n(), r("p", is, d(k.value), 1)) : N("", !0)
        ])
      ]),
      u.value ? (n(), r("p", us, d(u.value) + " The history below is the CRM's own record, without the links that open each call. ", 1)) : N("", !0),
      I.value.length ? (n(), r("ol", cs, [
        (n(!0), r(F, null, W(I.value, (v) => (n(), r("li", {
          key: v.id
        }, [
          (n(), le(Nt(v.href ? "a" : "div"), {
            class: Z(["crm-timeline-row", { open: !!v.href }]),
            href: v.href || void 0,
            onClick: (f) => v.href && g(v.href, f)
          }, {
            default: Mt(() => [
              a("span", ds, [
                j(p(x), {
                  icon: v.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("span", vs, [
                a("span", ms, [
                  a("strong", null, d(v.title), 1),
                  a("time", {
                    datetime: v.occurredAt
                  }, d(v.when), 9, bs)
                ]),
                a("span", fs, [
                  (n(!0), r(F, null, W(v.facts, (f) => (n(), r("span", {
                    key: f.key,
                    class: "crm-fact"
                  }, [
                    f.icon ? (n(), le(p(x), {
                      key: 0,
                      icon: f.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])) : N("", !0),
                    Y(d(f.label), 1)
                  ]))), 128)),
                  v.source ? (n(), r("span", ys, [
                    j(p(x), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    Y(d(v.source), 1)
                  ])) : N("", !0)
                ]),
                v.people.length ? (n(), r("span", ps, [
                  (n(!0), r(F, null, W(v.people, (f) => (n(), r("span", {
                    key: f.email,
                    title: f.email
                  }, d(f.name), 9, hs))), 128)),
                  v.hidden ? (n(), r("span", gs, "+" + d(v.hidden) + " more", 1)) : N("", !0)
                ])) : N("", !0)
              ]),
              v.href ? (n(), le(p(x), {
                key: 0,
                icon: "tabler:arrow-up-right",
                class: "crm-timeline-go",
                "aria-hidden": "true"
              })) : N("", !0)
            ]),
            _: 2
          }, 1032, ["class", "href", "onClick"])),
          v.anchorName ? (n(), r("p", ks, [
            j(p(x), {
              icon: "tabler:corner-down-right",
              "aria-hidden": "true"
            }),
            v.anchorRoute ? (n(), r("button", {
              key: 0,
              type: "button",
              onClick: (f) => l("navigate", v.anchorRoute)
            }, d(v.anchorName), 9, _s)) : (n(), r("span", $s, d(v.anchorName), 1))
          ])) : N("", !0),
          v.details.length ? (n(), r("details", ws, [
            a("summary", null, [
              j(p(x), {
                icon: "tabler:chevron-right",
                class: "crm-more-caret",
                "aria-hidden": "true"
              }),
              y[2] || (y[2] = a("span", null, "Details", -1))
            ]),
            a("dl", null, [
              (n(!0), r(F, null, W(v.details, (f) => (n(), r("div", {
                key: f.label
              }, [
                a("dt", null, d(f.label), 1),
                a("dd", null, d(f.text), 1)
              ]))), 128))
            ])
          ])) : N("", !0)
        ]))), 128))
      ])) : (n(), r("p", Cs, "Nothing has been logged against this record yet.")),
      e.hasMore ? (n(), r("button", {
        key: 3,
        class: "crm-button crm-timeline-more",
        type: "button",
        disabled: e.loadingMore,
        onClick: y[0] || (y[0] = (v) => l("more"))
      }, d(e.loadingMore ? "Loading…" : "Show earlier activity"), 9, js)) : N("", !0)
    ]));
  }
}), Rs = {
  key: 0,
  class: "crm-card crm-related-card"
}, xs = { class: "crm-card-head" }, Vs = { class: "crm-related-kind" }, Ms = ["onClick"], As = { class: "crm-avatar" }, Ns = ["onClick"], Ts = /* @__PURE__ */ ue({
  __name: "RecordRelated",
  props: {
    record: {},
    fields: {},
    attributes: {},
    objects: {},
    names: {},
    objectType: {}
  },
  emits: ["navigate", "hydrate"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = Qt, u = A(/* @__PURE__ */ new Set()), h = $(() => Gt(Ht(t.record, t.fields), t.objects).map((i) => ({
      ...i,
      visible: u.value.has(i.type) ? i.rows : i.rows.slice(0, s),
      hidden: u.value.has(i.type) ? 0 : Math.max(0, i.rows.length - s)
    }))), C = $(() => h.value.reduce((i, y) => i + y.rows.length, 0));
    function I(i) {
      return t.objects.find((y) => y.type === i)?.label || oe(i);
    }
    function k(i) {
      return t.names[i.id]?.name || I(i.type);
    }
    function V(i) {
      return Jr(i, t.attributes, t.objectType);
    }
    function g(i) {
      u.value = new Set(u.value).add(i);
      const y = h.value.find((v) => v.type === i);
      y && l("hydrate", y.rows.map((v) => v.id));
    }
    return (i, y) => C.value ? (n(), r("section", Rs, [
      a("header", xs, [
        a("div", null, [
          y[0] || (y[0] = a("h2", null, "Related", -1)),
          a("p", null, d(C.value) + " connected record" + d(C.value === 1 ? "" : "s"), 1)
        ])
      ]),
      (n(!0), r(F, null, W(h.value, (v) => (n(), r("div", {
        key: v.type,
        class: "crm-related-group"
      }, [
        a("p", Vs, [
          Y(d(v.label), 1),
          a("span", null, d(v.rows.length), 1)
        ]),
        (n(!0), r(F, null, W(v.visible, (f) => (n(), r("button", {
          key: `${f.direction}:${f.attr}:${f.id}`,
          class: "crm-related",
          type: "button",
          onClick: (R) => l("navigate", p($e)(f.type, f.id))
        }, [
          a("span", As, d(p(Me)(k(f))), 1),
          a("span", null, [
            a("strong", null, d(k(f)), 1),
            a("small", null, d(V(f)), 1)
          ]),
          j(p(x), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 8, Ms))), 128)),
        v.hidden ? (n(), r("button", {
          key: 0,
          class: "crm-related-more",
          type: "button",
          onClick: (f) => g(v.type)
        }, " Show " + d(v.hidden) + " more ", 9, Ns)) : N("", !0)
      ]))), 128))
    ])) : N("", !0);
  }
}), Ls = {
  key: 0,
  class: "crm-state"
}, Os = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, Es = {
  key: 2,
  class: "crm-state"
}, Fs = {
  key: 3,
  class: "crm-record"
}, Bs = { class: "crm-record-hero" }, Ds = { class: "crm-avatar large" }, Ps = { class: "crm-record-title" }, qs = { class: "crm-eyebrow" }, Ws = { class: "crm-hero-facts" }, Us = {
  key: 0,
  class: "crm-hero-fact"
}, zs = {
  key: 1,
  class: "crm-hero-fact"
}, Ks = {
  key: 2,
  class: "crm-hero-fact"
}, Ys = { class: "crm-record-actions" }, Hs = {
  key: 1,
  class: "crm-pill"
}, Gs = { class: "crm-record-layout" }, Qs = { class: "crm-record-main" }, Js = { class: "crm-card-head" }, Xs = { class: "crm-record-side" }, xt = 50, Zs = /* @__PURE__ */ ue({
  __name: "RecordDetail",
  props: {
    crmId: {},
    recordId: {},
    object: {},
    objects: {},
    attributes: {},
    canWrite: { type: Boolean, default: !0 },
    revision: { default: 0 }
  },
  emits: ["back", "navigate", "changed"],
  setup(e, { emit: o }) {
    const t = e, l = o, s = A(null), u = A([]), h = A(xt), C = A(!1), I = A([]), k = A({}), V = A(!0), g = A(!1), i = A(!1), y = A(""), v = $(() => Se(t.attributes, t.object.type)), f = $(() => s.value ? xe(s.value, v.value) : st(t.recordId)), R = $(() => s.value ? Ta(v.value, s.value.values) : {}), E = $(() => Bt(Qr(u.value))), T = $(() => [rt(v.value)?.attr, R.value.status?.attr].filter((B) => !!B)), z = $(() => u.value.length >= h.value), K = $(() => {
      const B = s.value?.values || {}, S = v.value.find((P) => P.data_type === "email" && La(B[P.attr]));
      return S ? String(B[S.attr] ?? "") : "";
    }), J = A(/* @__PURE__ */ new Set()), ee = $(() => I.value.filter((B) => J.value.has(B.tag)));
    async function H(B) {
      await Promise.all(B.map(async (S) => {
        await Rr(S.tag), customElements.get(S.tag) && J.value.add(S.tag);
      }));
    }
    async function U(B, S) {
      const P = Xr(Ht(B, v.value), t.objects);
      for (const re of S) {
        const G = Yt(re, t.recordId);
        G && !P.includes(G) && P.push(G);
      }
      const me = {};
      P.length && Ue(await Ie(t.crmId, P), t.object.type, me, t.attributes), k.value = me;
    }
    async function X(B) {
      const S = B.filter((P) => !k.value[P]);
      if (S.length)
        try {
          const P = { ...k.value };
          Ue(await Ie(t.crmId, S), t.object.type, P, t.attributes), k.value = P;
        } catch (P) {
          ae.toast({ severity: "error", summary: "Could not read connected record names", detail: se(P, "CRM query failed.") });
        }
    }
    async function w(B = {}) {
      B.background || (V.value = !0, y.value = "");
      try {
        const [S, P, me] = await Promise.all([
          Oa(t.crmId, t.recordId),
          Ze(t.crmId, t.recordId, h.value),
          Ea(t.crmId, t.object.type)
        ]);
        s.value = S, u.value = P, I.value = me, H(me), await U(S, P), y.value = "";
      } catch (S) {
        B.background || (y.value = se(S, "Record could not load."));
      } finally {
        B.background || (V.value = !1);
      }
    }
    async function O() {
      if (C.value) return;
      C.value = !0;
      const B = h.value + xt;
      try {
        u.value = await Ze(t.crmId, t.recordId, B), h.value = B, await U(s.value, u.value);
      } catch (S) {
        ae.toast({ severity: "error", summary: "Could not load earlier activity", detail: se(S, "CRM query failed.") });
      } finally {
        C.value = !1;
      }
    }
    async function _(B) {
      if (!s.value) return;
      const S = il(t.recordId, t.object.type, v.value, s.value.values, B);
      if (!S.length) {
        i.value = !1;
        return;
      }
      g.value = !0;
      try {
        await We(t.crmId, S), ae.toast({ severity: "success", summary: "Record saved", detail: f.value }), i.value = !1, await w(), l("changed");
      } catch (P) {
        ae.toast({ severity: "error", summary: "Could not save record", detail: se(P, "CRM write failed.") });
      } finally {
        g.value = !1;
      }
    }
    async function M() {
      if (await ae.confirm({ header: `Delete ${ye(t.object).toLowerCase()}`, message: `Delete ${f.value}? This cannot be undone.`, icon: "tabler:trash", acceptLabel: "Delete", rejectLabel: "Cancel", acceptClass: "p-button-danger" }))
        try {
          await We(t.crmId, [{ type: we.recordDeleted, body: { record_id: t.recordId, object_type: t.object.type } }]), ae.toast({ severity: "success", summary: "Record deleted", detail: f.value }), l("changed"), l("back");
        } catch (S) {
          ae.toast({ severity: "error", summary: "Could not delete record", detail: se(S, "CRM write failed.") });
        }
    }
    return ve(() => t.revision, () => {
      w({ background: !0 });
    }), Ne(() => w()), (B, S) => V.value ? (n(), r("div", Ls, [
      j(p(x), {
        icon: "tabler:loader-2",
        class: "spin"
      }),
      S[9] || (S[9] = Y(" Loading record…", -1))
    ])) : y.value ? (n(), r("div", Os, [
      j(p(x), { icon: "tabler:alert-circle" }),
      a("div", null, [
        S[10] || (S[10] = a("strong", null, "Record could not load", -1)),
        a("span", null, d(y.value), 1)
      ]),
      a("button", {
        class: "crm-button",
        onClick: S[0] || (S[0] = (P) => w())
      }, "Try again")
    ])) : s.value ? (n(), r("article", Fs, [
      a("header", Bs, [
        a("button", {
          class: "crm-icon-button",
          "aria-label": "Back",
          onClick: S[2] || (S[2] = (P) => l("back"))
        }, [
          j(p(x), {
            icon: "tabler:arrow-left",
            "aria-hidden": "true"
          })
        ]),
        a("span", Ds, d(p(Me)(f.value)), 1),
        a("div", Ps, [
          a("span", qs, d(p(ye)(e.object)), 1),
          a("h1", null, d(f.value), 1),
          a("div", Ws, [
            R.value.relation ? (n(), r("span", Us, [
              a("small", null, d(R.value.relation.label || R.value.relation.attr), 1),
              j(Ae, {
                value: s.value.values[R.value.relation.attr],
                attribute: R.value.relation,
                names: k.value,
                onNavigate: S[3] || (S[3] = (P) => l("navigate", P))
              }, null, 8, ["value", "attribute", "names"])
            ])) : N("", !0),
            R.value.status ? (n(), r("span", zs, [
              a("small", null, d(R.value.status.label || R.value.status.attr), 1),
              j(Ae, {
                value: s.value.values[R.value.status.attr],
                attribute: R.value.status,
                names: k.value
              }, null, 8, ["value", "attribute", "names"])
            ])) : N("", !0),
            E.value ? (n(), r("span", Ks, [
              S[12] || (S[12] = a("small", null, "Last touch", -1)),
              a("span", null, d(E.value), 1)
            ])) : N("", !0)
          ])
        ]),
        a("div", Ys, [
          e.canWrite ? (n(), r(F, { key: 0 }, [
            a("button", {
              class: "crm-button danger-text",
              onClick: M
            }, [
              j(p(x), {
                icon: "tabler:trash",
                "aria-hidden": "true"
              }),
              S[13] || (S[13] = Y("Delete", -1))
            ]),
            a("button", {
              class: "crm-button primary",
              onClick: S[4] || (S[4] = (P) => i.value = !0)
            }, [
              j(p(x), {
                icon: "tabler:edit",
                "aria-hidden": "true"
              }),
              S[14] || (S[14] = Y("Edit", -1))
            ])
          ], 64)) : (n(), r("span", Hs, [
            j(p(x), {
              icon: "tabler:eye",
              "aria-hidden": "true"
            }),
            S[15] || (S[15] = Y("Read-only", -1))
          ]))
        ])
      ]),
      a("div", Gs, [
        a("div", Qs, [
          j(rs, {
            record: s.value,
            fields: v.value,
            names: k.value,
            stated: T.value,
            onNavigate: S[5] || (S[5] = (P) => l("navigate", P))
          }, null, 8, ["record", "fields", "names", "stated"]),
          j(Ts, {
            record: s.value,
            fields: v.value,
            attributes: e.attributes,
            objects: e.objects,
            names: k.value,
            "object-type": e.object.type,
            onNavigate: S[6] || (S[6] = (P) => l("navigate", P)),
            onHydrate: X
          }, null, 8, ["record", "fields", "attributes", "objects", "names", "object-type"]),
          (n(!0), r(F, null, W(ee.value, (P) => (n(), r("section", {
            key: P.tag,
            class: "crm-card crm-panel-card"
          }, [
            a("header", Js, [
              a("div", null, [
                a("h2", null, d(P.title), 1)
              ])
            ]),
            (n(), le(Nt(P.tag), {
              class: "crm-panel-body",
              "record-id": e.recordId,
              "crm-id": e.crmId,
              "object-type": e.object.type
            }, null, 8, ["record-id", "crm-id", "object-type"]))
          ]))), 128))
        ]),
        a("div", Xs, [
          j(Ss, {
            activities: u.value,
            "self-email": K.value,
            "record-id": e.recordId,
            names: k.value,
            "has-more": z.value,
            "loading-more": C.value,
            onMore: O,
            onNavigate: S[7] || (S[7] = (P) => l("navigate", P))
          }, null, 8, ["activities", "self-email", "record-id", "names", "has-more", "loading-more"])
        ])
      ]),
      i.value ? (n(), le(zt, {
        key: 0,
        "crm-id": e.crmId,
        title: `Edit ${f.value}`,
        attributes: v.value,
        schema: e.attributes,
        record: s.value,
        saving: g.value,
        onClose: S[8] || (S[8] = (P) => i.value = !1),
        onSave: _
      }, null, 8, ["crm-id", "title", "attributes", "schema", "record", "saving"])) : N("", !0)
    ])) : (n(), r("div", Es, [
      j(p(x), { icon: "tabler:file-off" }),
      S[11] || (S[11] = a("div", null, [
        a("strong", null, "Record not found"),
        a("span", null, "It may have been removed.")
      ], -1)),
      a("button", {
        class: "crm-button",
        onClick: S[1] || (S[1] = (P) => l("back"))
      }, "Back to " + d(e.object.label), 1)
    ]));
  }
}), eo = { class: "crm-page crm-review" }, to = { class: "crm-review-bar" }, ao = { class: "crm-chip" }, lo = {
  key: 0,
  class: "crm-state"
}, no = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, ro = {
  key: 2,
  class: "crm-empty"
}, so = { class: "crm-empty-icon" }, oo = {
  key: 3,
  class: "crm-review-wrap"
}, io = {
  key: 0,
  class: "crm-review-group"
}, uo = { class: "crm-card-head" }, co = { class: "crm-merge-grid" }, vo = { class: "crm-merge-who" }, mo = { class: "crm-avatar small" }, bo = { class: "crm-flag" }, fo = { class: "crm-merge-id" }, yo = { class: "crm-merge-vals" }, po = {
  key: 0,
  class: "crm-muted"
}, ho = { class: "crm-conf-line" }, go = ["disabled"], ko = { class: "crm-review-foot" }, _o = 50, $o = /* @__PURE__ */ ue({
  __name: "ReviewQueue",
  props: {
    crmId: {},
    objects: {},
    attributes: {},
    canWrite: { type: Boolean }
  },
  setup(e) {
    const o = e, t = A([]), l = A({}), s = A(!0), u = A(""), h = $(() => Object.fromEntries(o.objects.map((E) => [E.type, E.label]))), C = $(() => {
      const E = t.value.length;
      return `${E} merge suggestion${E === 1 ? "" : "s"}`;
    }), I = $(() => !t.value.length);
    function k(E) {
      const T = l.value[E];
      return T ? xe(T, Se(o.attributes, T.object_type)) : st(E);
    }
    function V(E) {
      const T = l.value[E];
      if (!T) return [];
      const z = Se(o.attributes, T.object_type), K = rt(z)?.attr, J = z.filter((H) => H.attr !== K && Fa(H) === "main" && Ft(H).list !== !1), ee = [];
      for (const H of J) {
        const U = T.values[H.attr];
        if (U == null || U === "") continue;
        const X = H.data_type === "relation" ? lt(U, void 0, Ve(H)).map((w) => w.label).join(", ") : nt(U, H);
        if (X && X !== "—" && ee.push({ attr: H.attr, label: H.label, value: X }), ee.length === 4) break;
      }
      return ee;
    }
    function g(E) {
      return Ua(E.confidence ?? 0);
    }
    function i(E) {
      return za(E.confidence ?? 0);
    }
    function y(E) {
      return `${i(E)} confidence`;
    }
    function v(E) {
      return Ka(E.reason || "");
    }
    async function f() {
      s.value = !0, u.value = "";
      try {
        const E = await Lt(o.crmId, { limit: _o });
        t.value = E.rows;
        const T = /* @__PURE__ */ new Set();
        for (const K of E.rows)
          T.add(K.left_id), T.add(K.right_id);
        const z = {};
        if (T.size) for (const K of await Ie(o.crmId, [...T])) z[K.record_id] = K;
        l.value = z;
      } catch (E) {
        u.value = se(E, "Review queue could not load.");
      } finally {
        s.value = !1;
      }
    }
    function R() {
      ae.navigate("/inbox");
    }
    return ve(() => o.crmId, f), Ne(f), (E, T) => (n(), r("section", eo, [
      a("header", to, [
        T[1] || (T[1] = a("div", null, [
          a("span", { class: "crm-eyebrow" }, "Queues"),
          a("h1", null, "Needs review")
        ], -1)),
        a("span", ao, d(C.value), 1),
        T[2] || (T[2] = a("span", { class: "crm-grow" }, null, -1)),
        a("button", {
          class: "crm-button",
          onClick: R
        }, [
          j(p(x), { icon: "tabler:inbox" }),
          T[0] || (T[0] = Y("Open review inbox", -1))
        ])
      ]),
      s.value ? (n(), r("div", lo, [
        j(p(x), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        T[3] || (T[3] = Y(" Loading review queue…", -1))
      ])) : u.value ? (n(), r("div", no, [
        j(p(x), { icon: "tabler:alert-circle" }),
        a("div", null, [
          T[4] || (T[4] = a("strong", null, "Review queue could not load", -1)),
          a("span", null, d(u.value), 1)
        ]),
        a("button", {
          class: "crm-button",
          onClick: f
        }, "Try again")
      ])) : I.value ? (n(), r("div", ro, [
        a("span", so, [
          j(p(x), { icon: "tabler:checks" })
        ]),
        T[5] || (T[5] = a("h2", null, "Nothing to review", -1)),
        T[6] || (T[6] = a("p", null, "Possible duplicate records appear here when identity resolution finds a match.", -1))
      ])) : (n(), r("div", oo, [
        t.value.length ? (n(), r("section", io, [
          T[10] || (T[10] = a("h2", { class: "crm-review-h" }, "Merge suggestions", -1)),
          (n(!0), r(F, null, W(t.value, (z) => (n(), r("article", {
            key: `${z.left_id}:${z.right_id}`,
            class: "crm-card crm-merge"
          }, [
            a("header", uo, [
              a("div", null, [
                T[7] || (T[7] = a("h2", null, "Possible duplicate", -1)),
                a("p", null, d(h.value[z.object_type] || z.object_type), 1)
              ]),
              a("span", {
                class: Z(["crm-pill", `tone-${i(z)}`])
              }, d(g(z)) + "% · " + d(v(z)), 3)
            ]),
            a("div", co, [
              (n(!0), r(F, null, W([{ id: z.left_id, tag: "Record A" }, { id: z.right_id, tag: "Record B" }], (K) => (n(), r("div", {
                key: K.id,
                class: "crm-merge-col"
              }, [
                a("div", vo, [
                  a("span", mo, d(p(Me)(k(K.id))), 1),
                  a("strong", null, d(k(K.id)), 1),
                  a("span", bo, d(K.tag), 1)
                ]),
                a("code", fo, d(K.id), 1),
                a("dl", yo, [
                  (n(!0), r(F, null, W(V(K.id), (J) => (n(), r("div", {
                    key: J.attr
                  }, [
                    a("dt", null, d(J.label), 1),
                    a("dd", null, d(J.value), 1)
                  ]))), 128)),
                  V(K.id).length ? N("", !0) : (n(), r("p", po, "No hydrated field values."))
                ])
              ]))), 128))
            ]),
            a("div", ho, [
              a("span", {
                class: Z(["crm-meter", `tone-${i(z)}`])
              }, [
                a("i", {
                  style: ba({ width: g(z) + "%" })
                }, null, 4)
              ], 2),
              a("span", null, d(y(z)), 1),
              T[9] || (T[9] = a("span", { class: "crm-grow" }, null, -1)),
              a("button", {
                class: "crm-button primary",
                disabled: !e.canWrite,
                onClick: R
              }, [
                j(p(x), { icon: "tabler:external-link" }),
                T[8] || (T[8] = Y("Resolve in inbox", -1))
              ], 8, go)
            ])
          ]))), 128))
        ])) : N("", !0),
        a("p", ko, [
          j(p(x), { icon: "tabler:info-circle" }),
          T[11] || (T[11] = Y(" Decisions are recorded through the review inbox so the durable Block resumes correctly.", -1))
        ])
      ]))
    ]));
  }
}), wo = ["data-route", "data-record-id"], Co = {
  key: 0,
  class: "crm-state full"
}, jo = {
  key: 1,
  class: "crm-chooser full",
  "aria-label": "Create your CRM workspace"
}, Io = { class: "crm-chooser-card" }, So = { class: "crm-chooser-mark" }, Ro = { key: 1 }, xo = {
  key: 2,
  class: "crm-chooser full",
  role: "dialog",
  "aria-label": "Choose a CRM workspace"
}, Vo = { class: "crm-chooser-card" }, Mo = { class: "crm-chooser-mark" }, Ao = { class: "crm-chooser-list" }, No = ["onClick"], To = { class: "crm-object-icon" }, Lo = {
  key: 3,
  class: "crm-state full error",
  role: "alert"
}, Oo = { class: "crm-content" }, Eo = {
  key: 2,
  class: "crm-state full",
  "data-test": "unresolved-record"
}, Fo = {
  key: 5,
  class: "crm-state full",
  "data-test": "unknown-object"
}, Bo = {
  key: 6,
  class: "crm-state full"
}, Do = 300, Po = 2e3, qo = 3e4, Xo = /* @__PURE__ */ ue({
  __name: "CrmSurface",
  setup(e) {
    const o = pa(), t = ha(), l = A(null), s = A(!0), u = A(""), h = A(!1), C = A(!1), I = A(!0), k = A(null), V = A(""), g = A(0);
    let i, y = null, v, f = 0, R = Date.now();
    function E(q) {
      return q ? JSON.stringify([q.crm_id, q.workspace_label, q.can_write, q.objects, q.attributes, q.pipelines, q.views]) : "";
    }
    async function T() {
      const q = f;
      try {
        const L = await wt(P.value);
        if (q !== f) return;
        if (Ct(L)) {
          h.value = !0, C.value = L.can_create, l.value = null, i?.();
          return;
        }
        if (E(L) === E(l.value)) return;
        l.value = L, I.value = L.can_write;
      } catch {
      }
    }
    const z = Ha(() => {
      g.value++;
      const q = Date.now();
      q - R < qo || (R = q, T());
    }, { quietMs: Do, maxWaitMs: Po }), K = /* @__PURE__ */ new Set(["review", "model"]), J = A(null);
    ve(() => o.value?.route, (q) => {
      const L = String(q ?? "").replace(/^\/+|\/+$/g, "");
      y && L !== y || (J.value = L, y = null);
    });
    const ee = $(() => {
      const q = String(J.value ?? o.value?.route ?? "").replace(/^\/+|\/+$/g, "");
      return q === o.value?.entryId ? "" : q;
    }), H = $(() => ee.value.split("/").filter(Boolean)), U = $(() => K.has(H.value[0]) ? H.value[0] : "records"), X = $(() => U.value === "records" ? H.value[0] ?? "" : ""), w = $(() => {
      const q = l.value?.objects || [];
      return U.value !== "records" || X.value === "" ? q[0] : q.find((L) => L.type === X.value);
    }), O = $(() => X.value !== "" && (l.value?.objects || []).length > 0 && !w.value ? X.value : ""), _ = $(() => w.value !== void 0 && w.value.type === X.value ? Ba(H.value) : { kind: "none" }), M = $(() => _.value.kind === "record" ? _.value.recordId : void 0), B = $(() => _.value.kind === "unresolvable" ? _.value.segment : ""), S = $(() => String(o.value?.entryId || "").trim() || String(o.value?.componentId || "").trim()), P = $(() => V.value || S.value), me = $(() => l.value?.workspace_label || "");
    function re(q) {
      const L = q.replace(/^\//, "");
      y = L, o.value?.entryId || t("navigate", { route: L }), J.value = L, v && clearTimeout(v), v = setTimeout(() => {
        y = null;
      }, 1e3);
    }
    async function G() {
      const q = ++f;
      s.value = !0, u.value = "", k.value = null, h.value = !1;
      try {
        const L = await wt(P.value);
        if (q !== f) return;
        if (Ct(L)) {
          h.value = !0, C.value = L.can_create, l.value = null, i?.();
          return;
        }
        l.value = L, I.value = L.can_write, i?.(), i = ya(`kickside.thread.${L.crm_id}.projection.kickside.crm:read_model`, () => z.signal());
      } catch (L) {
        if (q !== f) return;
        L instanceof Da ? (k.value = L.candidates, l.value = null) : u.value = se(L, "CRM could not be opened.");
      } finally {
        q === f && (s.value = !1);
      }
    }
    function Le(q) {
      V.value = q.id, G();
    }
    function Ce(q) {
      q.crm_id !== l.value?.crm_id && (V.value = q.crm_id, G());
    }
    return Ne(G), At(() => {
      f++, i?.(), z.cancel(), v && clearTimeout(v);
    }), (q, L) => (n(), r("main", {
      class: "crm-app",
      "data-route": ee.value,
      "data-record-id": M.value || ""
    }, [
      s.value ? (n(), r("div", Co, [
        j(p(x), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        L[4] || (L[4] = Y(" Opening CRM…", -1))
      ])) : h.value ? (n(), r("section", jo, [
        a("div", Io, [
          a("span", So, [
            j(p(x), {
              icon: "tabler:address-book",
              "aria-hidden": "true"
            })
          ]),
          a("h1", null, d(C.value ? "Create your CRM" : "No CRM workspace is available"), 1),
          C.value ? (n(), r(F, { key: 0 }, [
            L[5] || (L[5] = a("p", null, "Start with one workspace. Its objects, fields, and pipelines stay configuration-driven.", -1)),
            j(Ya, {
              mode: "initial",
              onCreated: Le
            })
          ], 64)) : (n(), r("p", Ro, "An administrator can create a CRM workspace and share it with you."))
        ])
      ])) : k.value ? (n(), r("section", xo, [
        a("div", Vo, [
          a("span", Mo, [
            j(p(x), {
              icon: "tabler:versions",
              "aria-hidden": "true"
            })
          ]),
          L[6] || (L[6] = a("h1", null, "Choose a workspace", -1)),
          L[7] || (L[7] = a("p", null, "You can reach more than one CRM. Pick which one to open.", -1)),
          a("div", Ao, [
            (n(!0), r(F, null, W(k.value, (te) => (n(), r("button", {
              key: te.crm_id,
              onClick: (he) => Ce(te)
            }, [
              a("span", To, [
                j(p(x), {
                  icon: "tabler:address-book",
                  "aria-hidden": "true"
                })
              ]),
              a("span", null, [
                a("strong", null, d(te.label), 1),
                a("small", null, d(te.component_id), 1)
              ]),
              j(p(x), {
                icon: "tabler:chevron-right",
                "aria-hidden": "true"
              })
            ], 8, No))), 128))
          ])
        ])
      ])) : u.value || !l.value ? (n(), r("div", Lo, [
        j(p(x), { icon: "tabler:alert-circle" }),
        a("div", null, [
          L[8] || (L[8] = a("strong", null, "CRM could not open", -1)),
          a("span", null, d(u.value || "No CRM data was returned."), 1)
        ]),
        a("button", {
          class: "crm-button",
          onClick: G
        }, "Try again")
      ])) : (n(), r(F, { key: 4 }, [
        j(rl, {
          "crm-id": l.value.crm_id,
          objects: l.value.objects,
          "active-object": w.value?.type,
          "active-surface": U.value,
          "workspace-label": me.value,
          "can-write": I.value,
          revision: g.value,
          onNavigate: re
        }, null, 8, ["crm-id", "objects", "active-object", "active-surface", "workspace-label", "can-write", "revision"]),
        a("section", Oo, [
          U.value === "review" ? (n(), le($o, {
            key: 0,
            "crm-id": l.value.crm_id,
            objects: l.value.objects,
            attributes: l.value.attributes,
            "can-write": I.value
          }, null, 8, ["crm-id", "objects", "attributes", "can-write"])) : U.value === "model" ? (n(), le(Wa, {
            key: 1,
            "crm-id": l.value.crm_id,
            initial: l.value,
            "can-write": I.value,
            onChanged: L[0] || (L[0] = (te) => l.value = te)
          }, null, 8, ["crm-id", "initial", "can-write"])) : w.value && B.value ? (n(), r("div", Eo, [
            j(p(x), { icon: "tabler:file-off" }),
            a("div", null, [
              L[9] || (L[9] = a("strong", null, "Record not found", -1)),
              a("span", null, "This address does not name a record in " + d(w.value.label) + ".", 1)
            ]),
            a("button", {
              class: "crm-button",
              onClick: L[1] || (L[1] = (te) => re(w.value.type))
            }, "Back to " + d(w.value.label), 1)
          ])) : w.value && M.value ? (n(), le(Zs, {
            key: M.value,
            "crm-id": l.value.crm_id,
            "record-id": M.value,
            object: w.value,
            objects: l.value.objects,
            attributes: l.value.attributes,
            "can-write": I.value,
            revision: g.value,
            onBack: L[2] || (L[2] = (te) => re(w.value.type)),
            onNavigate: re,
            onChanged: G
          }, null, 8, ["crm-id", "record-id", "object", "objects", "attributes", "can-write", "revision"])) : w.value ? (n(), le(Ir, {
            key: w.value.type,
            "crm-id": l.value.crm_id,
            object: w.value,
            objects: l.value.objects,
            attributes: l.value.attributes,
            pipelines: l.value.pipelines,
            views: l.value.views,
            "can-write": I.value,
            revision: g.value,
            onNavigate: re,
            onChanged: G
          }, null, 8, ["crm-id", "object", "objects", "attributes", "pipelines", "views", "can-write", "revision"])) : O.value ? (n(), r("div", Fo, [
            j(p(x), { icon: "tabler:category-off" }),
            a("div", null, [
              L[10] || (L[10] = a("strong", null, "Not found", -1)),
              a("span", null, "This CRM has nothing called “" + d(O.value) + "”.", 1)
            ]),
            l.value.objects[0] ? (n(), r("button", {
              key: 0,
              class: "crm-button",
              onClick: L[3] || (L[3] = (te) => re(l.value.objects[0].type))
            }, "Back to " + d(l.value.objects[0].label), 1)) : N("", !0)
          ])) : (n(), r("div", Bo, [
            j(p(x), { icon: "tabler:category-off" }),
            L[11] || (L[11] = a("div", null, [
              a("strong", null, "No CRM objects"),
              a("span", null, "Define objects in System settings under CRM to begin.")
            ], -1))
          ]))
        ])
      ], 64))
    ], 8, wo));
  }
});
export {
  Xo as default
};
//# sourceMappingURL=CrmSurface-93gpdwog.js.map
