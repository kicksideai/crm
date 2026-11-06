import Oe from "primevue/config";
import Me from "primevue/contextmenu";
import Te from "primevue/menu";
import Ne from "primevue/portal";
import { renderSlot as ce, createCommentVNode as C, h as Ue, Teleport as Ve, defineComponent as ee, reactive as ie, onMounted as he, openBlock as d, createBlock as H, unref as f, withCtx as oe, createElementVNode as e, toDisplayString as $, createVNode as y, withDirectives as h, withKeys as Ae, vModelText as O, createElementBlock as m, normalizeClass as te, createTextVNode as M, computed as F, Fragment as W, renderList as z, vModelSelect as B, vModelCheckbox as Q, ref as A } from "vue";
import { Icon as v } from "@iconify/vue";
import { loadByTagName as Ee, host as R } from "@wippy-fe/proxy";
import { G as J, y as ke, o as ue, q as De, Z as qe, _ as Fe, b as We, m as D, $ as Ie, a0 as Be, a1 as He, a2 as ze } from "./crm-model-BaRhr3mT.js";
import se from "primevue/dialog";
const Je = "data-wippy-overlay-layer";
function we() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ce() {
  return we() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Ye() {
  return Ce() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Ke = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Ge = 0;
const X = /* @__PURE__ */ new WeakMap();
function de(l, c) {
  const p = l.style;
  p.setProperty("position", "fixed", "important"), p.setProperty("inset", "auto", "important"), p.setProperty("margin", "0", "important"), p.setProperty("position-anchor", c), p.setProperty("position-area", "bottom span-right"), p.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), p.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), p.setProperty("max-width", "stretch", "important");
}
function Qe(l, c) {
  if (!Ke.test(l.className))
    return;
  const p = l.style.cssText;
  de(l, c), l.getAttribute("popover") !== "manual" && l.setAttribute("popover", "manual");
  try {
    l.matches(":popover-open") || l.showPopover();
  } catch {
  }
  if (!l.matches(":popover-open")) {
    l.removeAttribute("popover"), l.style.cssText = p;
    return;
  }
  if (!X.has(l)) {
    const j = new MutationObserver(() => {
      const r = l.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && de(l, c);
    });
    j.observe(l, { attributes: !0, attributeFilter: ["style"] }), X.set(l, j);
  }
}
function ae(l) {
  const c = X.get(l);
  c && (c.disconnect(), X.delete(l));
}
function Xe(l) {
  const c = l && typeof l.getRootNode == "function" ? l.getRootNode() : null;
  return c instanceof ShadowRoot ? c : null;
}
function le(l) {
  l.style.top = "0px", l.style.left = "0px";
  const c = l.getBoundingClientRect();
  l.style.top = `${-window.scrollY - c.top}px`, l.style.left = `${-window.scrollX - c.left}px`;
}
const Z = /* @__PURE__ */ new Set(), re = /* @__PURE__ */ new WeakMap();
let pe = !1, ne = !1;
function Ze() {
  ne = !1;
  for (const l of Z) {
    if (!l.isConnected) {
      for (const c of Array.from(l.children))
        c instanceof HTMLElement && ae(c);
      Z.delete(l), re.get(l)?.disconnect();
      continue;
    }
    l.childElementCount > 0 && le(l);
  }
}
function me() {
  ne || (ne = !0, requestAnimationFrame(Ze));
}
function et(l) {
  const c = document.createElement("div");
  c.setAttribute(Je, "");
  const p = Ce();
  if (c.style.cssText = p ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", p && c.setAttribute("popover", "manual"), l.appendChild(c), p) {
    try {
      c.showPopover();
    } catch {
    }
    c.matches(":popover-open") || (c.removeAttribute("popover"), c.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  le(c);
  const j = new MutationObserver((r) => {
    const u = c.__wippyAnchorName;
    for (const P of r) {
      if (u)
        for (const S of Array.from(P.addedNodes))
          S instanceof HTMLElement && Qe(S, u);
      for (const S of Array.from(P.removedNodes))
        S instanceof HTMLElement && ae(S);
    }
    c.isConnected && c.childElementCount > 0 && le(c);
  });
  return j.observe(c, { childList: !0 }), re.set(c, j), Z.add(c), pe || (pe = !0, window.addEventListener("scroll", me, { capture: !0, passive: !0 }), window.addEventListener("resize", me, { passive: !0 })), c;
}
function be(l) {
  if (!(!l.hostRoot || l.layer) && (l.layer = et(l.hostRoot), Ye())) {
    const c = l.$el ? l.$el.parentElement : null;
    c && (l.anchorName = `--wippy-a-${++Ge}`, l.anchorTrigger = c, c.style.setProperty("anchor-name", l.anchorName), l.layer.__wippyAnchorName = l.anchorName);
  }
}
function fe(l) {
  if (l.anchorTrigger && (l.anchorTrigger.style.removeProperty("anchor-name"), l.anchorTrigger = null), l.anchorName = null, l.layer) {
    for (const c of Array.from(l.layer.children))
      c instanceof HTMLElement && ae(c);
    Z.delete(l.layer), re.get(l.layer)?.disconnect(), l.layer.remove(), l.layer = null;
  }
}
let ye = !1;
function tt() {
  if (ye)
    return;
  const l = Te;
  !l.methods || typeof l.methods.bindOutsideClickListener != "function" || (l.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (c) => {
      const p = c.composedPath(), j = this.container && !p.includes(this.container), r = !(this.target && p.includes(this.target));
      this.overlayVisible && j && r ? this.hide() : !this.popup && j && r && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, ye = !0);
}
let ve = !1;
function lt() {
  if (ve)
    return;
  const l = Me;
  !l.methods || typeof l.methods.bindOutsideClickListener != "function" || (l.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (c) => {
      const p = c.composedPath(), j = this.container && !p.includes(this.container), r = this.visible ? !(this.target && p.includes(this.target)) : !0;
      j && r && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, ve = !0);
}
let ge = !1;
function nt() {
  if (ge)
    return;
  ge = !0;
  const l = Ne;
  l.computed = l.computed || {}, l.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, l.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, l.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, l.mounted = function() {
    we() && (this.hostRoot = Xe(this.$el), this.mounted = !0, this.hostRoot && (this.inline || be(this), this.$watch("inline", (c) => {
      c ? fe(this) : be(this);
    })));
  }, l.render = function() {
    return this.inline ? ce(this.$slots, "default", { key: 0 }) : this.mounted ? Ue(Ve, { key: 1, to: this.resolvedTarget || document.body }, [
      ce(this.$slots, "default")
    ]) : C("", !0);
  }, l.unmounted = function() {
    fe(this);
  };
}
const Kl = {
  install: (l) => {
    tt(), lt(), nt(), l.use(Oe, { theme: "none" });
  }
}, it = { class: "crm-dialog-head" }, ot = { class: "crm-dialog-body crm-form-grid" }, st = { class: "crm-field" }, at = { class: "crm-field" }, rt = ["disabled", "placeholder"], ct = {
  key: 0,
  class: "crm-field full"
}, ut = { class: "crm-field full" }, dt = ["value"], pt = { class: "crm-dialog-foot" }, mt = ["disabled"], bt = /* @__PURE__ */ ee({
  __name: "SettingsObjectDialog",
  props: {
    object: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(l, { emit: c }) {
    const p = l, j = c, r = ie({ label: p.object?.label || "", type: p.object?.type || "", icon: p.object?.icon || "tabler:category", titleLabel: "" }), u = () => j("close"), P = { content: { class: "crm-dialog-content" } };
    he(() => Ee("wc-icon-picker", { timeoutMs: 8e3 }));
    function S(T) {
      const b = T.detail;
      typeof b == "string" && (r.icon = b);
    }
    function n() {
      r.label.trim() && (!p.object && !r.titleLabel.trim() || j("save", { label: r.label.trim(), type: r.type.trim(), icon: r.icon.trim() || "tabler:category", titleLabel: r.titleLabel.trim() }));
    }
    return (T, b) => (d(), H(f(se), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: P,
      "aria-label": "Object",
      "onUpdate:visible": b[3] || (b[3] = (w) => {
        w || u();
      })
    }, {
      default: oe(() => [
        e("header", it, [
          e("div", null, [
            e("h2", null, $(l.object ? "Edit object" : "New object"), 1),
            b[4] || (b[4] = e("p", null, "One reusable record type.", -1))
          ]),
          e("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: u
          }, [
            y(f(v), { icon: "tabler:x" })
          ])
        ]),
        e("div", ot, [
          e("label", st, [
            b[5] || (b[5] = e("span", { class: "crm-field-label" }, "Name", -1)),
            h(e("input", {
              "onUpdate:modelValue": b[0] || (b[0] = (w) => r.label = w),
              class: "crm-input",
              placeholder: "Companies",
              onKeyup: Ae(n, ["enter"])
            }, null, 544), [
              [O, r.label]
            ])
          ]),
          e("label", at, [
            b[6] || (b[6] = e("span", { class: "crm-field-label" }, "API name", -1)),
            h(e("input", {
              "onUpdate:modelValue": b[1] || (b[1] = (w) => r.type = w),
              class: "crm-input",
              disabled: !!l.object,
              placeholder: f(J)(r.label)
            }, null, 8, rt), [
              [O, r.type]
            ])
          ]),
          l.object ? C("", !0) : (d(), m("label", ct, [
            b[7] || (b[7] = e("span", { class: "crm-field-label" }, "Record title field", -1)),
            b[8] || (b[8] = e("span", { class: "crm-field-help" }, "The field used to identify records throughout CRM.", -1)),
            h(e("input", {
              "onUpdate:modelValue": b[2] || (b[2] = (w) => r.titleLabel = w),
              class: "crm-input",
              placeholder: "Display name"
            }, null, 512), [
              [O, r.titleLabel]
            ])
          ])),
          e("label", ut, [
            b[9] || (b[9] = e("span", { class: "crm-field-label" }, "Icon", -1)),
            e("wc-icon-picker", {
              value: r.icon,
              fallback: "tabler:category",
              onSelect: S
            }, null, 40, dt)
          ])
        ]),
        e("footer", pt, [
          e("button", {
            type: "button",
            class: "crm-button",
            onClick: u
          }, "Cancel"),
          e("button", {
            type: "button",
            class: "crm-button primary",
            disabled: l.busy || !r.label.trim() || !l.object && !r.titleLabel.trim(),
            onClick: n
          }, [
            y(f(v), {
              icon: l.busy ? "tabler:loader-2" : "tabler:check",
              class: te({ spin: l.busy })
            }, null, 8, ["icon", "class"]),
            M($(l.busy ? "Saving…" : "Save"), 1)
          ], 8, mt)
        ])
      ]),
      _: 1
    }));
  }
}), ft = { class: "crm-dialog-head" }, yt = { class: "crm-dialog-body crm-form-grid" }, vt = { class: "crm-field" }, gt = { class: "crm-field" }, ht = ["disabled", "placeholder"], kt = { class: "crm-field" }, wt = ["disabled"], Ct = ["value"], _t = { class: "crm-field" }, $t = {
  key: 0,
  class: "crm-field full"
}, jt = { class: "crm-field" }, St = {
  key: 0,
  class: "crm-field"
}, xt = ["value"], Pt = {
  key: 1,
  class: "crm-field"
}, Lt = {
  key: 2,
  class: "crm-field"
}, Rt = {
  key: 3,
  class: "crm-field"
}, Ot = {
  key: 4,
  class: "crm-field"
}, Mt = { class: "crm-field" }, Tt = {
  key: 2,
  class: "crm-field"
}, Nt = {
  key: 3,
  class: "crm-field"
}, Ut = { class: "crm-field" }, Vt = { class: "crm-field" }, At = { class: "crm-field" }, Et = { class: "crm-field" }, Dt = { class: "crm-check" }, qt = { class: "crm-check" }, Ft = { class: "crm-check" }, Wt = {
  key: 4,
  class: "crm-check"
}, It = { class: "crm-dialog-foot" }, Bt = ["disabled"], Ht = /* @__PURE__ */ ee({
  __name: "SettingsFieldDialog",
  props: {
    field: {},
    objects: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(l, { emit: c }) {
    const p = l, j = c, r = ["text", "email", "phone", "url", "number", "currency", "boolean", "date", "time", "datetime", "select", "multi_select", "relation", "ai"], u = p.field?.config || {}, P = u.ui || {}, S = u.target || {}, n = ie({
      label: p.field?.label || "",
      attr: p.field?.attr || "",
      data_type: p.field?.data_type || "text",
      help: String(u.help || ""),
      required: u.required === !0,
      unique: u.unique === !0,
      choices: (u.choices || []).join(`
`),
      record_type: String(S.object_type || ""),
      target_kind: String(S.kind || "record"),
      target_class: String(S.class || ""),
      target_contract: String(S.contract || ""),
      target_types: (S.kinds || ["user"]).join(", "),
      target_route: String(S.route || ""),
      cardinality: u.cardinality === "many" ? "many" : "one",
      min: u.min == null ? "" : String(u.min),
      max: u.max == null ? "" : String(u.max),
      sort_order: Number(p.field?.sort_order || 10),
      ui_section: String(P.section || "main"),
      ui_form: P.form !== !1,
      ui_list: P.list !== !1,
      ui_role: String(P.role || ""),
      ui_span: Number(P.span || 2)
    }), T = F(() => p.objects), b = F(() => ["select", "multi_select"].includes(n.data_type)), w = F(() => ["number", "currency"].includes(n.data_type)), x = F(() => n.data_type !== "relation"), L = F(() => n.label.trim() ? n.data_type !== "relation" ? !0 : n.target_kind === "record" ? n.record_type.trim() !== "" : n.target_kind === "component" ? n.target_class.trim() !== "" : n.target_types.split(",").some((U) => U.trim() !== "") : !1), _ = () => j("close"), V = { content: { class: "crm-dialog-content" } };
    function E() {
      return p.field?.attr || J(n.attr || n.label);
    }
    function Y(U) {
      const t = {};
      if (n.help.trim() && (t.help = n.help.trim()), n.required && (t.required = !0), x.value && n.unique && (t.unique = !0), b.value && (t.choices = n.choices.split(/\n|,/).map((a) => a.trim()).filter(Boolean)), n.data_type === "relation") {
        let a;
        n.target_kind === "record" ? a = { kind: "record", object_type: n.record_type } : n.target_kind === "component" ? a = { kind: "component", class: n.target_class.trim(), contract: n.target_contract.trim() || void 0, route: n.target_route.trim() || void 0 } : a = { kind: "principal", kinds: n.target_types.split(",").map((I) => I.trim()).filter(Boolean) }, t.target = a, t.relation = `${p.selected}_${U}`, t.cardinality = n.cardinality;
      }
      return n.min !== "" && (t.min = Number(n.min)), n.max !== "" && (t.max = Number(n.max)), t.ui = {
        section: n.ui_section,
        form: n.ui_form,
        list: n.ui_list,
        span: n.ui_span,
        ...n.ui_role ? { role: n.ui_role } : {}
      }, t;
    }
    function q() {
      if (!L.value) return;
      const U = E();
      j("save", { label: n.label.trim(), attr: U, data_type: n.data_type, config: Y(U), sort_order: n.sort_order });
    }
    return (U, t) => (d(), H(f(se), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog crm-dialog-wide",
      pt: V,
      "aria-label": "Field",
      "onUpdate:visible": t[22] || (t[22] = (a) => {
        a || _();
      })
    }, {
      default: oe(() => [
        e("header", ft, [
          e("div", null, [
            e("h2", null, $(l.field ? "Edit field" : "New field"), 1),
            t[23] || (t[23] = e("p", null, "A schema-backed value on every record.", -1))
          ]),
          e("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: _
          }, [
            y(f(v), { icon: "tabler:x" })
          ])
        ]),
        e("div", yt, [
          e("label", vt, [
            t[24] || (t[24] = e("span", { class: "crm-field-label" }, "Field label", -1)),
            h(e("input", {
              "onUpdate:modelValue": t[0] || (t[0] = (a) => n.label = a),
              class: "crm-input"
            }, null, 512), [
              [O, n.label]
            ])
          ]),
          e("label", gt, [
            t[25] || (t[25] = e("span", { class: "crm-field-label" }, "API name", -1)),
            h(e("input", {
              "onUpdate:modelValue": t[1] || (t[1] = (a) => n.attr = a),
              class: "crm-input",
              disabled: !!l.field,
              placeholder: f(J)(n.label)
            }, null, 8, ht), [
              [O, n.attr]
            ])
          ]),
          e("label", kt, [
            t[26] || (t[26] = e("span", { class: "crm-field-label" }, "Type", -1)),
            h(e("select", {
              "onUpdate:modelValue": t[2] || (t[2] = (a) => n.data_type = a),
              class: "crm-input",
              disabled: !!l.field
            }, [
              (d(), m(W, null, z(r, (a) => e("option", {
                key: a,
                value: a
              }, $(a.replace("_", " ")), 9, Ct)), 64))
            ], 8, wt), [
              [B, n.data_type]
            ])
          ]),
          e("label", _t, [
            t[27] || (t[27] = e("span", { class: "crm-field-label" }, "Help text", -1)),
            h(e("input", {
              "onUpdate:modelValue": t[3] || (t[3] = (a) => n.help = a),
              class: "crm-input"
            }, null, 512), [
              [O, n.help]
            ])
          ]),
          b.value ? (d(), m("label", $t, [
            t[28] || (t[28] = e("span", { class: "crm-field-label" }, "Choices", -1)),
            t[29] || (t[29] = e("span", { class: "crm-field-help" }, "One per line.", -1)),
            h(e("textarea", {
              "onUpdate:modelValue": t[4] || (t[4] = (a) => n.choices = a),
              class: "crm-input crm-textarea"
            }, null, 512), [
              [O, n.choices]
            ])
          ])) : C("", !0),
          n.data_type === "relation" ? (d(), m(W, { key: 1 }, [
            e("label", jt, [
              t[31] || (t[31] = e("span", { class: "crm-field-label" }, "Target kind", -1)),
              h(e("select", {
                "onUpdate:modelValue": t[5] || (t[5] = (a) => n.target_kind = a),
                class: "crm-input"
              }, [...t[30] || (t[30] = [
                e("option", { value: "record" }, "CRM record", -1),
                e("option", { value: "component" }, "Application component", -1),
                e("option", { value: "principal" }, "Person or group directory", -1)
              ])], 512), [
                [B, n.target_kind]
              ])
            ]),
            n.target_kind === "record" ? (d(), m("label", St, [
              t[33] || (t[33] = e("span", { class: "crm-field-label" }, "Related object", -1)),
              h(e("select", {
                "onUpdate:modelValue": t[6] || (t[6] = (a) => n.record_type = a),
                class: "crm-input"
              }, [
                t[32] || (t[32] = e("option", { value: "" }, "Select…", -1)),
                (d(!0), m(W, null, z(T.value, (a) => (d(), m("option", {
                  key: a.type,
                  value: a.type
                }, $(a.label), 9, xt))), 128))
              ], 512), [
                [B, n.record_type]
              ])
            ])) : n.target_kind === "component" ? (d(), m("label", Pt, [
              t[34] || (t[34] = e("span", { class: "crm-field-label" }, "Component class", -1)),
              h(e("input", {
                "onUpdate:modelValue": t[7] || (t[7] = (a) => n.target_class = a),
                class: "crm-input",
                placeholder: "knowledge_base"
              }, null, 512), [
                [O, n.target_class]
              ])
            ])) : (d(), m("label", Lt, [
              t[35] || (t[35] = e("span", { class: "crm-field-label" }, "Principal kinds", -1)),
              h(e("input", {
                "onUpdate:modelValue": t[8] || (t[8] = (a) => n.target_types = a),
                class: "crm-input",
                placeholder: "user, group"
              }, null, 512), [
                [O, n.target_types]
              ])
            ])),
            n.target_kind === "component" ? (d(), m("label", Rt, [
              t[36] || (t[36] = e("span", { class: "crm-field-label" }, "Required contract", -1)),
              h(e("input", {
                "onUpdate:modelValue": t[9] || (t[9] = (a) => n.target_contract = a),
                class: "crm-input",
                placeholder: "module:contract"
              }, null, 512), [
                [O, n.target_contract]
              ])
            ])) : C("", !0),
            n.target_kind === "component" ? (d(), m("label", Ot, [
              t[37] || (t[37] = e("span", { class: "crm-field-label" }, "Open route", -1)),
              t[38] || (t[38] = e("span", { class: "crm-field-help" }, "Use {id} for the selected component.", -1)),
              h(e("input", {
                "onUpdate:modelValue": t[10] || (t[10] = (a) => n.target_route = a),
                class: "crm-input",
                placeholder: "knowledge/{id}"
              }, null, 512), [
                [O, n.target_route]
              ])
            ])) : C("", !0),
            e("label", Mt, [
              t[40] || (t[40] = e("span", { class: "crm-field-label" }, "Cardinality", -1)),
              h(e("select", {
                "onUpdate:modelValue": t[11] || (t[11] = (a) => n.cardinality = a),
                class: "crm-input"
              }, [...t[39] || (t[39] = [
                e("option", { value: "one" }, "One item", -1),
                e("option", { value: "many" }, "Many items", -1)
              ])], 512), [
                [B, n.cardinality]
              ])
            ])
          ], 64)) : C("", !0),
          w.value ? (d(), m("label", Tt, [
            t[41] || (t[41] = e("span", { class: "crm-field-label" }, "Minimum", -1)),
            h(e("input", {
              "onUpdate:modelValue": t[12] || (t[12] = (a) => n.min = a),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [O, n.min]
            ])
          ])) : C("", !0),
          w.value ? (d(), m("label", Nt, [
            t[42] || (t[42] = e("span", { class: "crm-field-label" }, "Maximum", -1)),
            h(e("input", {
              "onUpdate:modelValue": t[13] || (t[13] = (a) => n.max = a),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [O, n.max]
            ])
          ])) : C("", !0),
          t[54] || (t[54] = e("div", { class: "crm-form-section full" }, [
            e("strong", null, "Presentation"),
            e("span", null, "Declarative placement used by every CRM surface.")
          ], -1)),
          e("label", Ut, [
            t[44] || (t[44] = e("span", { class: "crm-field-label" }, "Detail section", -1)),
            h(e("select", {
              "onUpdate:modelValue": t[14] || (t[14] = (a) => n.ui_section = a),
              class: "crm-input"
            }, [...t[43] || (t[43] = [
              e("option", { value: "main" }, "Main details", -1),
              e("option", { value: "collapsed" }, "Collapsed details", -1),
              e("option", { value: "hidden" }, "Hidden", -1)
            ])], 512), [
              [B, n.ui_section]
            ])
          ]),
          e("label", Vt, [
            t[46] || (t[46] = e("span", { class: "crm-field-label" }, "Width", -1)),
            h(e("select", {
              "onUpdate:modelValue": t[15] || (t[15] = (a) => n.ui_span = a),
              class: "crm-input"
            }, [...t[45] || (t[45] = [
              e("option", { value: 1 }, "Quarter", -1),
              e("option", { value: 2 }, "Half", -1),
              e("option", { value: 3 }, "Three quarters", -1),
              e("option", { value: 4 }, "Full", -1)
            ])], 512), [
              [
                B,
                n.ui_span,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e("label", At, [
            t[48] || (t[48] = e("span", { class: "crm-field-label" }, "Semantic role", -1)),
            h(e("select", {
              "onUpdate:modelValue": t[16] || (t[16] = (a) => n.ui_role = a),
              class: "crm-input"
            }, [...t[47] || (t[47] = [
              e("option", { value: "" }, "Standard field", -1),
              e("option", { value: "title" }, "Record title", -1),
              e("option", { value: "subtitle" }, "Record subtitle", -1)
            ])], 512), [
              [B, n.ui_role]
            ])
          ]),
          e("label", Et, [
            t[49] || (t[49] = e("span", { class: "crm-field-label" }, "Position", -1)),
            h(e("input", {
              "onUpdate:modelValue": t[17] || (t[17] = (a) => n.sort_order = a),
              class: "crm-input",
              type: "number",
              min: "0",
              step: "10"
            }, null, 512), [
              [
                O,
                n.sort_order,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e("label", Dt, [
            h(e("input", {
              "onUpdate:modelValue": t[18] || (t[18] = (a) => n.ui_form = a),
              type: "checkbox"
            }, null, 512), [
              [Q, n.ui_form]
            ]),
            t[50] || (t[50] = e("span", null, [
              e("strong", null, "Show in forms"),
              e("small", null, "Available while creating or editing a record.")
            ], -1))
          ]),
          e("label", qt, [
            h(e("input", {
              "onUpdate:modelValue": t[19] || (t[19] = (a) => n.ui_list = a),
              type: "checkbox"
            }, null, 512), [
              [Q, n.ui_list]
            ]),
            t[51] || (t[51] = e("span", null, [
              e("strong", null, "Show in default lists"),
              e("small", null, "Eligible for the default table columns.")
            ], -1))
          ]),
          e("label", Ft, [
            h(e("input", {
              "onUpdate:modelValue": t[20] || (t[20] = (a) => n.required = a),
              type: "checkbox"
            }, null, 512), [
              [Q, n.required]
            ]),
            t[52] || (t[52] = e("span", null, [
              e("strong", null, "Required"),
              e("small", null, "Records cannot omit this value.")
            ], -1))
          ]),
          x.value ? (d(), m("label", Wt, [
            h(e("input", {
              "onUpdate:modelValue": t[21] || (t[21] = (a) => n.unique = a),
              type: "checkbox"
            }, null, 512), [
              [Q, n.unique]
            ]),
            t[53] || (t[53] = e("span", null, [
              e("strong", null, "Unique"),
              e("small", null, "No two records may share it.")
            ], -1))
          ])) : C("", !0)
        ]),
        e("footer", It, [
          e("button", {
            type: "button",
            class: "crm-button",
            onClick: _
          }, "Cancel"),
          e("button", {
            type: "button",
            class: "crm-button primary",
            disabled: l.busy || !L.value,
            onClick: q
          }, [
            y(f(v), {
              icon: l.busy ? "tabler:loader-2" : "tabler:check",
              class: te({ spin: l.busy })
            }, null, 8, ["icon", "class"]),
            M($(l.busy ? "Saving…" : "Save"), 1)
          ], 8, Bt)
        ])
      ]),
      _: 1
    }));
  }
}), zt = { class: "crm-dialog-head" }, Jt = { class: "crm-dialog-body" }, Yt = { class: "crm-field" }, Kt = { class: "crm-stage-editor" }, Gt = ["onUpdate:modelValue"], Qt = ["disabled", "onClick"], Xt = ["disabled", "onClick"], Zt = ["onClick"], el = { class: "crm-dialog-foot" }, tl = ["disabled"], ll = /* @__PURE__ */ ee({
  __name: "SettingsPipelineDialog",
  props: {
    pipeline: {},
    objectLabel: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(l, { emit: c }) {
    const p = l, j = c, r = ke(p.pipeline || void 0), u = ie({
      label: p.pipeline?.label || `${p.objectLabel} Pipeline`,
      collection_id: p.pipeline?.collection_id || `${p.selected}_pipeline`,
      stages: r.length ? r.map((w) => ({ ...w })) : [{ stage_id: "new", label: "New", order: 10 }, { stage_id: "won", label: "Won", order: 20 }, { stage_id: "lost", label: "Lost", order: 30 }]
    }), P = () => j("close"), S = { content: { class: "crm-dialog-content" } };
    function n(w, x) {
      const L = w + x;
      if (L < 0 || L >= u.stages.length) return;
      const [_] = u.stages.splice(w, 1);
      u.stages.splice(L, 0, _);
    }
    function T() {
      u.stages.push({ stage_id: "", label: "", order: (u.stages.length + 1) * 10 });
    }
    function b() {
      u.stages.some((w) => w.label.trim()) && j("save", { label: u.label.trim(), collection_id: u.collection_id, stages: u.stages });
    }
    return (w, x) => (d(), H(f(se), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: S,
      "aria-label": "Pipeline stages",
      "onUpdate:visible": x[1] || (x[1] = (L) => {
        L || P();
      })
    }, {
      default: oe(() => [
        e("header", zt, [
          x[2] || (x[2] = e("div", null, [
            e("h2", null, "Pipeline stages"),
            e("p", null, "The stages shown in board view.")
          ], -1)),
          e("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: P
          }, [
            y(f(v), { icon: "tabler:x" })
          ])
        ]),
        e("div", Jt, [
          e("label", Yt, [
            x[3] || (x[3] = e("span", { class: "crm-field-label" }, "Pipeline name", -1)),
            h(e("input", {
              "onUpdate:modelValue": x[0] || (x[0] = (L) => u.label = L),
              class: "crm-input"
            }, null, 512), [
              [O, u.label]
            ])
          ]),
          e("div", Kt, [
            (d(!0), m(W, null, z(u.stages, (L, _) => (d(), m("div", { key: _ }, [
              y(f(v), { icon: "tabler:grip-vertical" }),
              h(e("input", {
                "onUpdate:modelValue": (V) => L.label = V,
                class: "crm-input",
                placeholder: "Stage name"
              }, null, 8, Gt), [
                [O, L.label]
              ]),
              e("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: _ === 0,
                "aria-label": "Move up",
                onClick: (V) => n(_, -1)
              }, [
                y(f(v), { icon: "tabler:arrow-up" })
              ], 8, Qt),
              e("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: _ === u.stages.length - 1,
                "aria-label": "Move down",
                onClick: (V) => n(_, 1)
              }, [
                y(f(v), { icon: "tabler:arrow-down" })
              ], 8, Xt),
              e("button", {
                type: "button",
                class: "crm-icon-button danger",
                "aria-label": "Remove stage",
                onClick: (V) => u.stages.splice(_, 1)
              }, [
                y(f(v), { icon: "tabler:x" })
              ], 8, Zt)
            ]))), 128)),
            e("button", {
              type: "button",
              class: "crm-button",
              onClick: T
            }, [
              y(f(v), { icon: "tabler:plus" }),
              x[4] || (x[4] = M("Add stage", -1))
            ])
          ])
        ]),
        e("footer", el, [
          e("button", {
            type: "button",
            class: "crm-button",
            onClick: P
          }, "Cancel"),
          e("button", {
            type: "button",
            class: "crm-button primary",
            disabled: l.busy,
            onClick: b
          }, [
            y(f(v), {
              icon: l.busy ? "tabler:loader-2" : "tabler:check",
              class: te({ spin: l.busy })
            }, null, 8, ["icon", "class"]),
            M($(l.busy ? "Saving…" : "Save"), 1)
          ], 8, tl)
        ])
      ]),
      _: 1
    }));
  }
}), nl = {
  key: 0,
  class: "crm-state"
}, il = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, ol = {
  key: 2,
  class: "crm-settings"
}, sl = { class: "crm-page-head" }, al = { class: "crm-page-actions" }, rl = {
  key: 0,
  class: "crm-pill"
}, cl = ["disabled"], ul = {
  key: 1,
  class: "crm-button"
}, dl = { class: "crm-settings-layout" }, pl = { class: "crm-settings-objects" }, ml = ["onClick"], bl = { class: "crm-object-icon" }, fl = {
  key: 0,
  class: "crm-settings-main"
}, yl = { class: "crm-settings-title" }, vl = { class: "crm-object-icon large" }, gl = { class: "crm-card" }, hl = { class: "crm-card-head" }, kl = { class: "crm-field-list" }, wl = { key: 0 }, Cl = { key: 1 }, _l = { class: "crm-type-badge" }, $l = { key: 0 }, jl = { key: 1 }, Sl = { key: 2 }, xl = { class: "crm-type-badge" }, Pl = { class: "crm-row-actions" }, Ll = ["onClick"], Rl = ["onClick"], Ol = { class: "crm-card" }, Ml = { class: "crm-card-head" }, Tl = {
  key: 0,
  class: "crm-pipeline-preview"
}, Nl = {
  key: 1,
  class: "crm-card-empty"
}, Ul = { class: "crm-card" }, Vl = { class: "crm-setting-line" }, Al = ["disabled"], El = {
  key: 1,
  class: "crm-settings-main crm-settings-empty"
}, Dl = { class: "crm-empty-icon" }, Gl = /* @__PURE__ */ ee({
  __name: "CrmSettings",
  props: {
    crmId: {},
    initial: {},
    canWrite: { type: Boolean, default: !0 }
  },
  emits: ["changed"],
  setup(l, { emit: c }) {
    const p = l, j = c, r = A(p.initial || null), u = A(""), P = A(!0), S = A(""), n = A(!1), T = A(""), b = A(null), w = A(null), x = A(365), L = A(""), _ = F(() => r.value?.objects.find((s) => s.type === u.value)), V = F(() => ue(r.value?.attributes || [], u.value)), E = F(() => _.value ? De(r.value?.pipelines || [], _.value) : void 0);
    async function Y(s = u.value) {
      P.value = !0, S.value = "";
      try {
        const i = p.crmId || r.value?.crm_id || "", [o, g, k] = await Promise.all([qe(i), Fe(), We(i)]);
        if ("provisioned" in k) throw new Error("No CRM workspace has been created yet.");
        L.value = o.revision;
        const N = { success: !0, crm_id: i, workspace_label: k.workspace_label, can_write: p.canWrite, ...o.declaration };
        r.value = N, x.value = Number(g.thread_event_retention_days || 365), u.value = N.objects.some((G) => G.type === s) ? s : N.objects[0]?.type || "", j("changed", N);
      } catch (i) {
        S.value = D(i, "CRM settings could not load.");
      } finally {
        P.value = !1;
      }
    }
    function q() {
      T.value = "", b.value = null, w.value = null;
    }
    function U(s) {
      b.value = s || null, T.value = "object";
    }
    function t(s) {
      w.value = s || null, T.value = "field";
    }
    function a() {
      T.value = "pipeline";
    }
    function I() {
      if (!r.value) return { objects: [], attributes: [], pipelines: [], views: [] };
      const s = r.value;
      return {
        version: s.version,
        objects: s.objects,
        attributes: s.attributes,
        pipelines: s.pipelines,
        views: s.views,
        policies: s.policies,
        merge_config: s.merge_config
      };
    }
    async function K(s) {
      const i = r.value;
      if (!i) throw new Error("CRM settings are not loaded.");
      const o = i.crm_id, g = await ze(o, L.value, s);
      L.value = g.revision;
      const k = { success: !0, crm_id: o, workspace_label: i.workspace_label, can_write: p.canWrite, ...g.declaration };
      return r.value = k, u.value = k.objects.some((N) => N.type === u.value) ? u.value : k.objects[0]?.type || "", j("changed", k), g;
    }
    async function _e(s) {
      const i = b.value?.type || J(s.type || s.label);
      if (i) {
        n.value = !0;
        try {
          const o = I(), g = { ...b.value || {}, type: i, label: s.label, icon: s.icon || void 0 }, k = [...o.objects.filter((G) => G.type !== i), g];
          let N = o.attributes;
          if (!b.value) {
            const G = J(s.titleLabel);
            N = [...N, { object_type: i, attr: G, data_type: "text", label: s.titleLabel, sort_order: 10, system: !0, config: { ui: { role: "title", section: "main", span: 4, list: !0, form: !0 } } }];
          }
          await K({ ...o, objects: k, attributes: N }), R.toast({ severity: "success", summary: b.value ? "Object updated" : "Object created", detail: s.label }), q(), u.value = i;
        } catch (o) {
          R.toast({ severity: "error", summary: "Could not save object", detail: D(o, "CRM write failed.") });
        } finally {
          n.value = !1;
        }
      }
    }
    async function $e() {
      const s = _.value;
      if (!(!s || !await R.confirm({ header: `Delete ${s.label}`, message: "Delete this object, all of its fields, pipeline, views, and records? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete object", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const o = I(), g = [
            ...o.pipelines.filter((k) => k.object_type === s.type).map((k) => ({ kind: "pipeline", id: k.collection_id })),
            ...o.views.filter((k) => k.object_type === s.type).map((k) => ({ kind: "view", id: k.view_id }))
          ];
          await K({ ...o, remove: { objects: [{ object_id: s.id || s.type }], ...g.length ? { declarations: g } : {} } }), R.toast({ severity: "success", summary: "Object deleted", detail: s.label });
        } catch (o) {
          R.toast({ severity: "error", summary: "Could not delete object", detail: D(o, "CRM write failed.") });
        }
    }
    async function je(s) {
      if (s.attr) {
        n.value = !0;
        try {
          const i = I(), o = { object_type: u.value, attr: s.attr, data_type: s.data_type, label: s.label, config: s.config, sort_order: s.sort_order || (V.value.length + 1) * 10, system: w.value?.system === !0 };
          await K({ ...i, attributes: [...i.attributes.filter((g) => !(g.object_type === u.value && g.attr === s.attr)), o] }), R.toast({ severity: "success", summary: w.value ? "Field updated" : "Field created", detail: s.label }), q();
        } catch (i) {
          R.toast({ severity: "error", summary: "Could not save field", detail: D(i, "CRM write failed.") });
        } finally {
          n.value = !1;
        }
      }
    }
    async function Se(s) {
      if (!(s.system || !await R.confirm({ header: `Delete ${s.label}`, message: "Delete this field and its stored values? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete field", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const o = I();
          await K({ ...o, remove: { attributes: [{ object_id: _.value?.id || u.value, field_id: s.id || s.attr }] } }), R.toast({ severity: "success", summary: "Field deleted", detail: s.label });
        } catch (o) {
          R.toast({ severity: "error", summary: "Could not delete field", detail: D(o, "CRM write failed.") });
        }
    }
    async function xe(s) {
      n.value = !0;
      try {
        const i = s.stages.filter((k) => k.label.trim()).map((k, N) => ({ ...k, stage_id: J(k.stage_id || k.label), label: k.label.trim(), order: (N + 1) * 10 })), o = I(), g = { collection_id: s.collection_id, object_type: u.value, label: s.label, stages: i };
        await K({ ...o, pipelines: [...o.pipelines.filter((k) => k.collection_id !== s.collection_id), g] }), R.toast({ severity: "success", summary: "Pipeline saved", detail: s.label }), q();
      } catch (i) {
        R.toast({ severity: "error", summary: "Could not save pipeline", detail: D(i, "CRM write failed.") });
      } finally {
        n.value = !1;
      }
    }
    async function Pe() {
      try {
        await Ie("thread_event_retention_days", x.value), R.toast({ severity: "success", summary: "Retention saved", detail: `${x.value} days` });
      } catch (s) {
        R.toast({ severity: "error", summary: "Could not save retention", detail: D(s, "Setting write failed.") });
      }
    }
    async function Le(s) {
      const i = s.target, o = i.files?.[0];
      if (o && r.value)
        try {
          const g = await Be(r.value.crm_id, L.value, JSON.parse(await o.text()));
          R.toast({ severity: "success", summary: "Configuration imported", detail: g.changed ? "The CRM schema was updated." : "The CRM schema was already current." }), await Y(u.value);
        } catch (g) {
          R.toast({ severity: "error", summary: "Import failed", detail: D(g, "Configuration import failed.") });
        }
      i.value = "";
    }
    async function Re() {
      if (r.value) {
        n.value = !0;
        try {
          const s = await He(r.value.crm_id), i = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" }), o = URL.createObjectURL(i), g = document.createElement("a");
          g.href = o, g.download = `crm-config-${r.value.crm_id}.json`, document.body.appendChild(g), g.click(), g.remove(), URL.revokeObjectURL(o), R.toast({ severity: "success", summary: "Configuration exported", detail: "Downloaded schema JSON" });
        } catch (s) {
          R.toast({ severity: "error", summary: "Export failed", detail: D(s, "Configuration export failed.") });
        } finally {
          n.value = !1;
        }
      }
    }
    return he(() => Y()), (s, i) => P.value ? (d(), m("div", nl, [
      y(f(v), {
        icon: "tabler:loader-2",
        class: "spin"
      }),
      i[6] || (i[6] = M(" Loading CRM settings…", -1))
    ])) : S.value ? (d(), m("div", il, [
      y(f(v), { icon: "tabler:alert-circle" }),
      e("div", null, [
        i[7] || (i[7] = e("strong", null, "Settings could not load", -1)),
        e("span", null, $(S.value), 1)
      ]),
      e("button", {
        class: "crm-button",
        onClick: i[0] || (i[0] = (o) => Y())
      }, "Try again")
    ])) : r.value ? (d(), m("section", ol, [
      e("header", sl, [
        i[12] || (i[12] = e("div", null, [
          e("span", { class: "crm-eyebrow" }, "CRM control"),
          e("h1", null, "Data model"),
          e("p", null, "Objects, fields, relationships, and pipelines.")
        ], -1)),
        e("div", al, [
          l.canWrite ? C("", !0) : (d(), m("span", rl, [
            y(f(v), { icon: "tabler:eye" }),
            i[8] || (i[8] = M("Read-only", -1))
          ])),
          e("button", {
            class: "crm-button",
            disabled: n.value,
            onClick: Re
          }, [
            y(f(v), { icon: "tabler:download" }),
            i[9] || (i[9] = M("Export JSON", -1))
          ], 8, cl),
          l.canWrite ? (d(), m("label", ul, [
            y(f(v), { icon: "tabler:upload" }),
            i[10] || (i[10] = M("Import JSON", -1)),
            e("input", {
              class: "crm-file-input",
              type: "file",
              accept: "application/json,.json",
              onChange: Le
            }, null, 32)
          ])) : C("", !0),
          l.canWrite ? (d(), m("button", {
            key: 2,
            class: "crm-button primary",
            onClick: i[1] || (i[1] = (o) => U())
          }, [
            y(f(v), { icon: "tabler:plus" }),
            i[11] || (i[11] = M("New object", -1))
          ])) : C("", !0)
        ])
      ]),
      e("div", dl, [
        e("aside", pl, [
          (d(!0), m(W, null, z(r.value.objects, (o) => (d(), m("button", {
            key: o.type,
            class: te({ active: u.value === o.type }),
            onClick: (g) => u.value = o.type
          }, [
            e("span", bl, [
              y(f(v), {
                icon: o.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            e("span", null, [
              e("strong", null, $(o.label), 1),
              e("small", null, $(f(ue)(r.value.attributes, o.type).length) + " fields", 1)
            ]),
            y(f(v), { icon: "tabler:chevron-right" })
          ], 10, ml))), 128))
        ]),
        _.value ? (d(), m("main", fl, [
          e("section", yl, [
            e("span", vl, [
              y(f(v), {
                icon: _.value.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            e("div", null, [
              i[13] || (i[13] = e("span", null, "Object", -1)),
              e("h2", null, $(_.value.label), 1),
              e("code", null, $(_.value.type), 1)
            ]),
            l.canWrite ? (d(), m(W, { key: 0 }, [
              e("button", {
                class: "crm-button",
                onClick: i[2] || (i[2] = (o) => U(_.value))
              }, [
                y(f(v), { icon: "tabler:edit" }),
                i[14] || (i[14] = M("Edit", -1))
              ]),
              e("button", {
                class: "crm-button danger-text",
                onClick: $e
              }, [
                y(f(v), { icon: "tabler:trash" }),
                i[15] || (i[15] = M("Delete", -1))
              ])
            ], 64)) : C("", !0)
          ]),
          e("section", gl, [
            e("header", hl, [
              e("div", null, [
                i[16] || (i[16] = e("h2", null, "Fields and relationships", -1)),
                e("p", null, $(V.value.length) + " fields define records of this type.", 1)
              ]),
              l.canWrite ? (d(), m("button", {
                key: 0,
                class: "crm-button primary",
                onClick: i[3] || (i[3] = (o) => t())
              }, [
                y(f(v), { icon: "tabler:plus" }),
                i[17] || (i[17] = M("New field", -1))
              ])) : C("", !0)
            ]),
            e("div", kl, [
              i[18] || (i[18] = e("div", { class: "crm-field-row header" }, [
                e("span", null, "Field"),
                e("span", null, "API name"),
                e("span", null, "Type"),
                e("span", null, "Placement"),
                e("span")
              ], -1)),
              (d(!0), m(W, null, z(V.value, (o) => (d(), m("div", {
                key: o.attr,
                class: "crm-field-row"
              }, [
                e("span", null, [
                  e("strong", null, $(o.label), 1),
                  o.config?.required ? (d(), m("small", wl, "Required")) : C("", !0),
                  o.system ? (d(), m("small", Cl, "System")) : C("", !0)
                ]),
                e("code", null, $(o.attr), 1),
                e("span", _l, [
                  M($(o.data_type.replace("_", " ")), 1),
                  o.config?.target?.kind === "record" ? (d(), m("small", $l, "→ " + $(o.config.target.object_type), 1)) : o.config?.target?.kind === "component" ? (d(), m("small", jl, "→ " + $(o.config.target.class), 1)) : o.config?.target?.kind === "principal" ? (d(), m("small", Sl, "→ directory")) : C("", !0)
                ]),
                e("span", xl, [
                  M($(o.config?.ui?.section || "main"), 1),
                  e("small", null, $(o.config?.ui?.span || 2) + "/4", 1)
                ]),
                e("span", Pl, [
                  l.canWrite ? (d(), m("button", {
                    key: 0,
                    class: "crm-icon-button",
                    "aria-label": "Edit field",
                    onClick: (g) => t(o)
                  }, [
                    y(f(v), { icon: "tabler:edit" })
                  ], 8, Ll)) : C("", !0),
                  l.canWrite && !o.system ? (d(), m("button", {
                    key: 1,
                    class: "crm-icon-button danger",
                    "aria-label": "Delete field",
                    onClick: (g) => Se(o)
                  }, [
                    y(f(v), { icon: "tabler:trash" })
                  ], 8, Rl)) : C("", !0)
                ])
              ]))), 128))
            ])
          ]),
          e("section", Ol, [
            e("header", Ml, [
              e("div", null, [
                i[19] || (i[19] = e("h2", null, "Pipeline", -1)),
                e("p", null, $(E.value ? E.value.label : "Optional stages for a board view."), 1)
              ]),
              l.canWrite ? (d(), m("button", {
                key: 0,
                class: "crm-button",
                onClick: a
              }, [
                y(f(v), {
                  icon: E.value ? "tabler:edit" : "tabler:plus"
                }, null, 8, ["icon"]),
                M($(E.value ? "Edit stages" : "Add pipeline"), 1)
              ])) : C("", !0)
            ]),
            E.value ? (d(), m("div", Tl, [
              (d(!0), m(W, null, z(f(ke)(E.value), (o) => (d(), m("span", {
                key: o.stage_id
              }, $(o.label), 1))), 128))
            ])) : (d(), m("div", Nl, [
              y(f(v), { icon: "tabler:layout-kanban" }),
              i[20] || (i[20] = e("span", null, "No pipeline is configured for this object.", -1))
            ]))
          ]),
          e("section", Ul, [
            i[23] || (i[23] = e("header", { class: "crm-card-head" }, [
              e("div", null, [
                e("h2", null, "Retention"),
                e("p", null, "How long CRM thread events remain available.")
              ])
            ], -1)),
            e("div", Vl, [
              i[21] || (i[21] = e("label", null, "Event retention", -1)),
              h(e("input", {
                "onUpdate:modelValue": i[4] || (i[4] = (o) => x.value = o),
                class: "crm-input short",
                type: "number",
                min: "1",
                disabled: !l.canWrite
              }, null, 8, Al), [
                [
                  O,
                  x.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              i[22] || (i[22] = e("span", null, "days", -1)),
              l.canWrite ? (d(), m("button", {
                key: 0,
                class: "crm-button",
                onClick: Pe
              }, "Save")) : C("", !0)
            ])
          ])
        ])) : (d(), m("main", El, [
          e("span", Dl, [
            y(f(v), { icon: "tabler:database-plus" })
          ]),
          i[25] || (i[25] = e("h2", null, "No objects yet", -1)),
          i[26] || (i[26] = e("p", null, "Define a record type and its title field to begin building this CRM.", -1)),
          l.canWrite ? (d(), m("button", {
            key: 0,
            class: "crm-button primary",
            onClick: i[5] || (i[5] = (o) => U())
          }, [
            y(f(v), { icon: "tabler:plus" }),
            i[24] || (i[24] = M("New object", -1))
          ])) : C("", !0)
        ]))
      ]),
      T.value === "object" ? (d(), H(bt, {
        key: 0,
        object: b.value,
        busy: n.value,
        onClose: q,
        onSave: _e
      }, null, 8, ["object", "busy"])) : T.value === "field" ? (d(), H(Ht, {
        key: 1,
        field: w.value,
        objects: r.value.objects,
        selected: u.value,
        busy: n.value,
        onClose: q,
        onSave: je
      }, null, 8, ["field", "objects", "selected", "busy"])) : T.value === "pipeline" ? (d(), H(ll, {
        key: 2,
        pipeline: E.value,
        "object-label": _.value?.label || "CRM",
        selected: u.value,
        busy: n.value,
        onClose: q,
        onSave: xe
      }, null, 8, ["pipeline", "object-label", "selected", "busy"])) : C("", !0)
    ])) : C("", !0);
  }
});
export {
  Kl as P,
  Gl as _
};
//# sourceMappingURL=CrmSettings.vue_vue_type_script_setup_true_lang-vvRk7aa4.js.map
