import { useId as Fe, mergeProps as I, openBlock as y, createElementBlock as S, createElementVNode as l, renderSlot as K, createTextVNode as R, toDisplayString as B, resolveComponent as Ot, resolveDirective as me, withDirectives as E, createBlock as G, resolveDynamicComponent as Vt, withCtx as it, createCommentVNode as O, normalizeClass as lt, computed as tt, createVNode as T, Transition as He, Fragment as et, defineComponent as Lt, reactive as qt, onMounted as fe, unref as P, withKeys as We, vModelText as H, renderList as ut, vModelSelect as at, vModelCheckbox as xt, ref as Y } from "vue";
import { Icon as D } from "@iconify/vue";
import { loadByTagName as Ke, host as N } from "@wippy-fe/proxy";
import { G as dt, y as ge, o as Zt, q as qe, Z as Ze, _ as Ge, b as Ye, m as Q, $ as Xe, a0 as Je, a1 as Qe, a2 as tn } from "./crm-model-BaRhr3mT.js";
import { m as Mt, a as ct, C as ve, s as Tt, g as ot, F as ye, N as nt, S as Z, B as U, c as he, z as en, b as nn, l as Et, n as on, i as Gt, d as Pt, Q as rn, e as zt, T as Yt, R as Xt, v as $e, f as ke, K as an, W as Se, U as _e, L as ln, h as st, j as mt, I as Jt, k as sn, r as Ce, o as un, p as dn, q as cn, t as pn, _ as bn } from "./primevue-plugin-BK4VDKFT.js";
function pt(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let i = typeof o;
      if (i === "string" || i === "number") t.push(o);
      else if (i === "object") {
        let a = Array.isArray(o) ? [pt(...o)] : Object.entries(o).map(([d, u]) => u ? d : void 0);
        t = a.length ? t.concat(a.filter((d) => !!d)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
var jt = {};
function mn(e = "pui_id_") {
  return Object.hasOwn(jt, e) || (jt[e] = 0), jt[e]++, `${e}${jt[e]}`;
}
function fn() {
  let e = [], t = (d, u, r = 999) => {
    let b = i(d, u, r), c = b.value + (b.key === d ? 0 : r) + 1;
    return e.push({ key: d, value: c }), c;
  }, n = (d) => {
    e = e.filter((u) => u.value !== d);
  }, o = (d, u) => i(d).value, i = (d, u, r = 0) => [...e].reverse().find((b) => !0) || { key: d, value: r }, a = (d) => d && parseInt(d.style.zIndex, 10) || 0;
  return { get: a, set: (d, u, r) => {
    u && (u.style.zIndex = String(t(d, !0, r)));
  }, clear: (d) => {
    d && (n(a(d)), d.style.zIndex = "");
  }, getCurrent: (d) => o(d) };
}
var Bt = fn(), rt = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(t) {
    return this._loadedStyleNames.has(t);
  },
  setLoadedStyleName: function(t) {
    this._loadedStyleNames.add(t);
  },
  deleteLoadedStyleName: function(t) {
    this._loadedStyleNames.delete(t);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function gn() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Fe();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Qt = U.extend({
  name: "common"
});
function vt(e) {
  "@babel/helpers - typeof";
  return vt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vt(e);
}
function vn(e) {
  return Pe(e) || yn(e) || xe(e) || we();
}
function yn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ft(e, t) {
  return Pe(e) || hn(e, t) || xe(e, t) || we();
}
function we() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xe(e, t) {
  if (e) {
    if (typeof e == "string") return Ut(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ut(e, t) : void 0;
  }
}
function Ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function hn(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, i, a, d, u = [], r = !0, b = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        r = !1;
      } else for (; !(r = (o = a.call(n)).done) && (u.push(o.value), u.length !== t); r = !0) ;
    } catch (c) {
      b = !0, i = c;
    } finally {
      try {
        if (!r && n.return != null && (d = n.return(), Object(d) !== d)) return;
      } finally {
        if (b) throw i;
      }
    }
    return u;
  }
}
function Pe(e) {
  if (Array.isArray(e)) return e;
}
function te(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function x(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? te(Object(n), !0).forEach(function(o) {
      gt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : te(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function gt(e, t, n) {
  return (t = $n(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $n(e) {
  var t = kn(e, "string");
  return vt(t) == "symbol" ? t : t + "";
}
function kn(e, t) {
  if (vt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (vt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Dt = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    },
    dt: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(t) {
        nt.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        nt.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, o, i, a, d, u, r, b, c, p, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, v = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, k = f ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (i = k || v) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (a = i.onBeforeCreate) === null || a === void 0 || a.call(i);
    var C = (d = this.$primevueConfig) === null || d === void 0 || (d = d.pt) === null || d === void 0 ? void 0 : d._usept, w = C ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.originalValue : void 0, A = C ? (r = this.$primevue) === null || r === void 0 || (r = r.config) === null || r === void 0 || (r = r.pt) === null || r === void 0 ? void 0 : r.value : (b = this.$primevue) === null || b === void 0 || (b = b.config) === null || b === void 0 ? void 0 : b.pt;
    (c = A || w) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (p = c.onBeforeCreate) === null || p === void 0 || p.call(c), this.$attrSelector = gn(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = en(nn(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = x({
      name: this.$.type.name,
      attrSelector: this.$attrSelector
    }, this.$params)), this._loadStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._removeThemeListeners(), this._unloadScopedThemeStyles(), this._hook("onUnmounted");
  },
  methods: {
    _hook: function(t) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        o[i - 1] = arguments[i];
      return he(t) ? t.apply(void 0, o) : I.apply(void 0, o);
    },
    _load: function() {
      rt.isStyleNameLoaded("base") || (U.loadCSS(this.$styleOptions), this._loadGlobalStyles(), rt.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !rt.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Qt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), rt.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      Tt(t) && U.load(t, x({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!Z.isStyleNameLoaded("common")) {
          var o, i, a = ((o = this.$style) === null || o === void 0 || (i = o.getCommonTheme) === null || i === void 0 ? void 0 : i.call(o)) || {}, d = a.primitive, u = a.semantic, r = a.global, b = a.style;
          U.load(d?.css, x({
            name: "primitive-variables"
          }, this.$styleOptions)), U.load(u?.css, x({
            name: "semantic-variables"
          }, this.$styleOptions)), U.load(r?.css, x({
            name: "global-variables"
          }, this.$styleOptions)), U.loadStyle(x({
            name: "global-style"
          }, this.$styleOptions), b), Z.setLoadedStyleName("common");
        }
        if (!Z.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, p, f, v, k = ((c = this.$style) === null || c === void 0 || (p = c.getComponentTheme) === null || p === void 0 ? void 0 : p.call(c)) || {}, C = k.css, w = k.style;
          (f = this.$style) === null || f === void 0 || f.load(C, x({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (v = this.$style) === null || v === void 0 || v.loadStyle(x({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), w), Z.setLoadedStyleName(this.$style.name);
        }
        if (!Z.isStyleNameLoaded("layer-order")) {
          var A, M, L = (A = this.$style) === null || A === void 0 || (M = A.getLayerOrderThemeCSS) === null || M === void 0 ? void 0 : M.call(A);
          U.load(L, x({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), Z.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, i, a = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, d = a.css, u = (i = this.$style) === null || i === void 0 ? void 0 : i.load(d, x({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = u.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      rt.clearLoadedStyleNames(), nt.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      nt.off("theme:change", this._loadCoreStyles), nt.off("theme:change", this._load), nt.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return ye(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, d = /./g.test(o) && !!i[o.split(".")[0]], u = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, r = u.mergeSections, b = r === void 0 ? !0 : r, c = u.mergeProps, p = c === void 0 ? !1 : c, f = a ? d ? this._useGlobalPT(this._getPTClassValue, o, i) : this._useDefaultPT(this._getPTClassValue, o, i) : void 0, v = d ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, x(x({}, i), {}, {
        global: f || {}
      })), k = this._getPTDatasets(o);
      return b || !b && v ? p ? this._mergeProps(p, f, v, k) : x(x(x({}, f), v), k) : x(x({}, v), k);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        o[i - 1] = arguments[i];
      return I(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", a = o === "root" && Tt((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && x(x({}, o === "root" && x(x(gt({}, "".concat(i, "name"), ot(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && gt({}, "".concat(i, "extend"), ot(this.$.type.name))), {}, gt({}, "".concat(this.$attrSelector), ""))), {}, gt({}, "".concat(i, "section"), ot(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return ct(t) || ve(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, a = function(u) {
        var r, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = i ? i(u) : u, p = ot(o), f = ot(n.$name);
        return (r = b ? p !== f ? c?.[p] : void 0 : c?.[p]) !== null && r !== void 0 ? r : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, o, i) {
      var a = function(C) {
        return n(C, o, i);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var d, u = t._usept || ((d = this.$primevueConfig) === null || d === void 0 ? void 0 : d.ptOptions) || {}, r = u.mergeSections, b = r === void 0 ? !0 : r, c = u.mergeProps, p = c === void 0 ? !1 : c, f = a(t.originalValue), v = a(t.value);
        return f === void 0 && v === void 0 ? void 0 : ct(v) ? v : ct(f) ? f : b || !b && v ? p ? this._mergeProps(p, f, v) : x(x({}, f), v) : v;
      }
      return a(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, x(x({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = I(this.$_attrsWithoutPT, this.ptm(n, o));
      return i?.hasOwnProperty("id") && ((t = i.id) !== null && t !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, x({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, x(x({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, t, x(x({}, this.$params), o)), a = this._getOptionValue(Qt.inlineStyles, t, x(x({}, this.$params), o));
        return [a, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return Mt(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, x({}, n.$params)) || Mt(o, x({}, n.$params));
      });
    },
    isUnstyled: function() {
      var t;
      return this.unstyled !== void 0 ? this.unstyled : (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var t, n = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var i = ft(o, 1), a = i[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return x(x({
        classes: void 0,
        inlineStyles: void 0,
        load: function() {
        },
        loadCSS: function() {
        },
        loadStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $styleOptions: function() {
      var t;
      return {
        nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
      };
    },
    $primevueConfig: function() {
      var t;
      return (t = this.$primevue) === null || t === void 0 ? void 0 : t.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var t = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: t,
          props: t?.$props,
          state: t?.$data,
          attrs: t?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ft(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = ft(n, 2), i = o[0], a = o[1], d = i.split(":"), u = vn(d), r = Ut(u).slice(1);
        return r?.reduce(function(b, c, p, f) {
          return !b[c] && (b[c] = p === f.length - 1 ? a : {}), b[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ft(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = ft(n, 2), i = o[0], a = o[1];
        return t[i] = a, t;
      }, {});
    }
  }
}, Sn = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
    flex-shrink: 0;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, _n = U.extend({
  name: "baseicon",
  css: Sn
});
function yt(e) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yt(e);
}
function ee(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ee(Object(n), !0).forEach(function(o) {
      Cn(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ee(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Cn(e, t, n) {
  return (t = wn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wn(e) {
  var t = xn(e, "string");
  return yt(t) == "symbol" ? t : t + "";
}
function xn(e, t) {
  if (yt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (yt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var It = {
  name: "BaseIcon",
  extends: Dt,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: _n,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Et(this.label);
      return ne(ne({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: t ? void 0 : "img",
        "aria-label": t ? void 0 : this.label,
        "aria-hidden": t
      });
    }
  }
};
function ht(e) {
  "@babel/helpers - typeof";
  return ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ht(e);
}
function oe(e, t) {
  return Tn(e) || On(e, t) || jn(e, t) || Pn();
}
function Pn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jn(e, t) {
  if (e) {
    if (typeof e == "string") return re(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? re(e, t) : void 0;
  }
}
function re(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function On(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, i, a, d, u = [], r = !0, b = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(r = (o = a.call(n)).done) && (u.push(o.value), u.length !== t); r = !0) ;
    } catch (c) {
      b = !0, i = c;
    } finally {
      try {
        if (!r && n.return != null && (d = n.return(), Object(d) !== d)) return;
      } finally {
        if (b) throw i;
      }
    }
    return u;
  }
}
function Tn(e) {
  if (Array.isArray(e)) return e;
}
function ie(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function j(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ie(Object(n), !0).forEach(function(o) {
      Nt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ie(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Nt(e, t, n) {
  return (t = Ln(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ln(e) {
  var t = En(e, "string");
  return ht(t) == "symbol" ? t : t + "";
}
function En(e, t) {
  if (ht(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ht(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _ = {
  _getMeta: function() {
    return [Gt(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Mt(Gt(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, i, a;
    return (o = (t == null || (i = t.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: ye,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", d = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, u = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, r = function() {
      var M = _._getOptionValue.apply(_, arguments);
      return ct(M) || ve(M) ? {
        class: M
      } : M;
    }, b = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = b.mergeSections, p = c === void 0 ? !0 : c, f = b.mergeProps, v = f === void 0 ? !1 : f, k = u ? _._useDefaultPT(o, o.defaultPT(), r, a, d) : void 0, C = _._usePT(o, _._getPT(i, o.$name), r, a, j(j({}, d), {}, {
      global: k || {}
    })), w = _._getPTDatasets(o, a);
    return p || !p && C ? v ? _._mergeProps(o, v, k, C, w) : j(j(j({}, k), C), w) : j(j({}, C), w);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return j(j({}, n === "root" && Nt({}, "".concat(o, "name"), ot(t.$name))), {}, Nt({}, "".concat(o, "section"), ot(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(d) {
      var u, r = o ? o(d) : d, b = ot(n);
      return (u = r?.[b]) !== null && u !== void 0 ? u : r;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: i(t.originalValue),
      value: i(t.value)
    } : i(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, d = function(w) {
      return o(w, i, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var u, r = n._usept || ((u = t.$primevueConfig) === null || u === void 0 ? void 0 : u.ptOptions) || {}, b = r.mergeSections, c = b === void 0 ? !0 : b, p = r.mergeProps, f = p === void 0 ? !1 : p, v = d(n.originalValue), k = d(n.value);
      return v === void 0 && k === void 0 ? void 0 : ct(k) ? k : ct(v) ? v : c || !c && k ? f ? _._mergeProps(t, f, v, k) : j(j({}, v), k) : k;
    }
    return d(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return _._usePT(t, n, o, i, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, a = _._getConfig(o, i), d = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    _._loadCoreStyles(n, d), _._loadThemeStyles(n, d), _._loadScopedThemeStyles(n, d), _._removeThemeListeners(n), n.$loadStyles = function() {
      return _._loadThemeStyles(n, d);
    }, _._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!rt.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var a;
      U.loadCSS(i), (a = o.$style) === null || a === void 0 || a.loadCSS(i), rt.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (t = i.theme) === null || t === void 0 ? void 0 : t.call(i)) === "none")) {
      if (!Z.isStyleNameLoaded("common")) {
        var d, u, r = ((d = i.$style) === null || d === void 0 || (u = d.getCommonTheme) === null || u === void 0 ? void 0 : u.call(d)) || {}, b = r.primitive, c = r.semantic, p = r.global, f = r.style;
        U.load(b?.css, j({
          name: "primitive-variables"
        }, a)), U.load(c?.css, j({
          name: "semantic-variables"
        }, a)), U.load(p?.css, j({
          name: "global-variables"
        }, a)), U.loadStyle(j({
          name: "global-style"
        }, a), f), Z.setLoadedStyleName("common");
      }
      if (!Z.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (o = i.$style) !== null && o !== void 0 && o.name) {
        var v, k, C, w, A = ((v = i.$style) === null || v === void 0 || (k = v.getDirectiveTheme) === null || k === void 0 ? void 0 : k.call(v)) || {}, M = A.css, L = A.style;
        (C = i.$style) === null || C === void 0 || C.load(M, j({
          name: "".concat(i.$style.name, "-variables")
        }, a)), (w = i.$style) === null || w === void 0 || w.loadStyle(j({
          name: "".concat(i.$style.name, "-style")
        }, a), L), Z.setLoadedStyleName(i.$style.name);
      }
      if (!Z.isStyleNameLoaded("layer-order")) {
        var s, m, F = (s = i.$style) === null || s === void 0 || (m = s.getLayerOrderThemeCSS) === null || m === void 0 ? void 0 : m.call(s);
        U.load(F, j({
          name: "layer-order",
          first: !0
        }, a)), Z.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var i, a, d, u = ((i = t.$style) === null || i === void 0 || (a = i.getPresetTheme) === null || a === void 0 ? void 0 : a.call(i, o, "[".concat(t.$attrSelector, "]"))) || {}, r = u.css, b = (d = t.$style) === null || d === void 0 ? void 0 : d.load(r, j({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = b.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    rt.clearLoadedStyleNames(), nt.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    nt.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, i, a, d) {
    var u, r, b = "on".concat(on(n)), c = _._getConfig(i, a), p = o?.$instance, f = _._usePT(p, _._getPT(i == null || (u = i.value) === null || u === void 0 ? void 0 : u.pt, t), _._getOptionValue, "hooks.".concat(b)), v = _._useDefaultPT(p, c == null || (r = c.pt) === null || r === void 0 || (r = r.directives) === null || r === void 0 ? void 0 : r[t], _._getOptionValue, "hooks.".concat(b)), k = {
      el: o,
      binding: i,
      vnode: a,
      prevVnode: d
    };
    f?.(p, k), v?.(p, k);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      o[i - 2] = arguments[i];
    return he(t) ? t.apply(void 0, o) : I.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(u, r, b, c, p) {
      var f, v, k, C;
      r._$instances = r._$instances || {};
      var w = _._getConfig(b, c), A = r._$instances[t] || {}, M = Et(A) ? j(j({}, n), n?.methods) : {};
      r._$instances[t] = j(j({}, A), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: r,
        $binding: b,
        $modifiers: b?.modifiers,
        $value: b?.value,
        $el: A.$el || r || void 0,
        $style: j({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: w,
        $attrSelector: (f = r.$pd) === null || f === void 0 || (f = f[t]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return _._getPT(w?.pt, void 0, function(s) {
            var m;
            return s == null || (m = s.directives) === null || m === void 0 ? void 0 : m[t];
          });
        },
        isUnstyled: function() {
          var s, m;
          return ((s = r._$instances[t]) === null || s === void 0 || (s = s.$binding) === null || s === void 0 || (s = s.value) === null || s === void 0 ? void 0 : s.unstyled) !== void 0 ? (m = r._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled : w?.unstyled;
        },
        theme: function() {
          var s;
          return (s = r._$instances[t]) === null || s === void 0 || (s = s.$primevueConfig) === null || s === void 0 ? void 0 : s.theme;
        },
        preset: function() {
          var s;
          return (s = r._$instances[t]) === null || s === void 0 || (s = s.$binding) === null || s === void 0 || (s = s.value) === null || s === void 0 ? void 0 : s.dt;
        },
        /* instance's methods */
        ptm: function() {
          var s, m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return _._getPTValue(r._$instances[t], (s = r._$instances[t]) === null || s === void 0 || (s = s.$binding) === null || s === void 0 || (s = s.value) === null || s === void 0 ? void 0 : s.pt, m, j({}, F));
        },
        ptmo: function() {
          var s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", F = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return _._getPTValue(r._$instances[t], s, m, F, !1);
        },
        cx: function() {
          var s, m, F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", J = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (s = r._$instances[t]) !== null && s !== void 0 && s.isUnstyled() ? void 0 : _._getOptionValue((m = r._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.classes, F, j({}, J));
        },
        sx: function() {
          var s, m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, J = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return F ? _._getOptionValue((s = r._$instances[t]) === null || s === void 0 || (s = s.$style) === null || s === void 0 ? void 0 : s.inlineStyles, m, j({}, J)) : void 0;
        }
      }, M), r.$instance = r._$instances[t], (v = (k = r.$instance)[u]) === null || v === void 0 || v.call(k, r, b, c, p), r["$".concat(t)] = r.$instance, _._hook(t, u, r, b, c, p), r.$pd || (r.$pd = {}), r.$pd[t] = j(j({}, (C = r.$pd) === null || C === void 0 ? void 0 : C[t]), {}, {
        name: t,
        instance: r._$instances[t]
      });
    }, i = function(u) {
      var r, b, c, p = u._$instances[t], f = p?.watch, v = function(w) {
        var A, M = w.newValue, L = w.oldValue;
        return f == null || (A = f.config) === null || A === void 0 ? void 0 : A.call(p, M, L);
      }, k = function(w) {
        var A, M = w.newValue, L = w.oldValue;
        return f == null || (A = f["config.ripple"]) === null || A === void 0 ? void 0 : A.call(p, M, L);
      };
      p.$watchersCallback = {
        config: v,
        "config.ripple": k
      }, f == null || (r = f.config) === null || r === void 0 || r.call(p, p?.$primevueConfig), Pt.on("config:change", v), f == null || (b = f["config.ripple"]) === null || b === void 0 || b.call(p, p == null || (c = p.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), Pt.on("config:ripple:change", k);
    }, a = function(u) {
      var r = u._$instances[t].$watchersCallback;
      r && (Pt.off("config:change", r.config), Pt.off("config:ripple:change", r["config.ripple"]), u._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(u, r, b, c) {
        u.$pd || (u.$pd = {}), u.$pd[t] = {
          name: t,
          attrSelector: mn("pd")
        }, o("created", u, r, b, c);
      },
      beforeMount: function(u, r, b, c) {
        var p;
        _._loadStyles((p = u.$pd[t]) === null || p === void 0 ? void 0 : p.instance, r, b), o("beforeMount", u, r, b, c), i(u);
      },
      mounted: function(u, r, b, c) {
        var p;
        _._loadStyles((p = u.$pd[t]) === null || p === void 0 ? void 0 : p.instance, r, b), o("mounted", u, r, b, c);
      },
      beforeUpdate: function(u, r, b, c) {
        o("beforeUpdate", u, r, b, c);
      },
      updated: function(u, r, b, c) {
        var p;
        _._loadStyles((p = u.$pd[t]) === null || p === void 0 ? void 0 : p.instance, r, b), o("updated", u, r, b, c);
      },
      beforeUnmount: function(u, r, b, c) {
        var p;
        a(u), _._removeThemeListeners((p = u.$pd[t]) === null || p === void 0 ? void 0 : p.instance), o("beforeUnmount", u, r, b, c);
      },
      unmounted: function(u, r, b, c) {
        var p;
        (p = u.$pd[t]) === null || p === void 0 || (p = p.instance) === null || p === void 0 || (p = p.scopedStyleEl) === null || p === void 0 || (p = p.value) === null || p === void 0 || p.remove(), o("unmounted", u, r, b, c);
      }
    };
  },
  extend: function() {
    var t = _._getMeta.apply(_, arguments), n = oe(t, 2), o = n[0], i = n[1];
    return j({
      extend: function() {
        var d = _._getMeta.apply(_, arguments), u = oe(d, 2), r = u[0], b = u[1];
        return _.extend(r, j(j(j({}, i), i?.methods), b));
      }
    }, _._extend(o, i));
  }
}, Dn = `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`, In = {
  root: "p-ink"
}, An = U.extend({
  name: "ripple-directive",
  style: Dn,
  classes: In
}), zn = _.extend({
  style: An
});
function $t(e) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $t(e);
}
function Bn(e) {
  return Nn(e) || Un(e) || Mn(e) || Vn();
}
function Vn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mn(e, t) {
  if (e) {
    if (typeof e == "string") return Rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rt(e, t) : void 0;
  }
}
function Un(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Nn(e) {
  if (Array.isArray(e)) return Rt(e);
}
function Rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ae(e, t, n) {
  return (t = Rn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Rn(e) {
  var t = Fn(e, "string");
  return $t(t) == "symbol" ? t : t + "";
}
function Fn(e, t) {
  if ($t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if ($t(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var je = zn.extend("ripple", {
  watch: {
    "config.ripple": function(t) {
      t ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(t) {
    this.remove(t);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(t) {
      t.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(t) {
      t.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(t) {
      var n = this.getInk(t);
      n || (n = _e("span", ae(ae({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(n), this.$el = n);
    },
    remove: function(t) {
      var n = this.getInk(t);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(t) {
      var n = this, o = t.currentTarget, i = this.getInk(o);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && zt(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !Yt(i) && !Xt(i)) {
          var a = Math.max($e(o), ke(o));
          i.style.height = a + "px", i.style.width = a + "px";
        }
        var d = an(o), u = t.pageX - d.left + document.body.scrollTop - Xt(i) / 2, r = t.pageY - d.top + document.body.scrollLeft - Yt(i) / 2;
        i.style.top = r + "px", i.style.left = u + "px", !this.isUnstyled() && Se(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && zt(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && zt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Bn(t.children).find(function(n) {
        return rn(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Oe = {
  name: "TimesIcon",
  extends: It
};
function Hn(e) {
  return Zn(e) || qn(e) || Kn(e) || Wn();
}
function Wn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kn(e, t) {
  if (e) {
    if (typeof e == "string") return Ft(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(e, t) : void 0;
  }
}
function qn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Zn(e) {
  if (Array.isArray(e)) return Ft(e);
}
function Ft(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Gn(e, t, n, o, i, a) {
  return y(), S("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Hn(t[0] || (t[0] = [l("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Oe.render = Gn;
var Te = {
  name: "WindowMaximizeIcon",
  extends: It
};
function Yn(e) {
  return to(e) || Qn(e) || Jn(e) || Xn();
}
function Xn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jn(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function Qn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function to(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function eo(e, t, n, o, i, a) {
  return y(), S("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Yn(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Te.render = eo;
var Le = {
  name: "WindowMinimizeIcon",
  extends: It
};
function no(e) {
  return ao(e) || io(e) || ro(e) || oo();
}
function oo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ro(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function io(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ao(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function lo(e, t, n, o, i, a) {
  return y(), S("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), no(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Le.render = lo;
var Ee = {
  name: "SpinnerIcon",
  extends: It
};
function so(e) {
  return bo(e) || po(e) || co(e) || uo();
}
function uo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function co(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function po(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function bo(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function mo(e, t, n, o, i, a) {
  return y(), S("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), so(t[0] || (t[0] = [l("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ee.render = mo;
var fo = `
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`, go = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Tt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Et(n.value) && !o.$slots.default,
      "p-badge-sm": n.size === "small",
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warn": n.severity === "warn",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, vo = U.extend({
  name: "badge",
  style: fo,
  classes: go
}), yo = {
  name: "BaseBadge",
  extends: Dt,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: vo,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function kt(e) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kt(e);
}
function le(e, t, n) {
  return (t = ho(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ho(e) {
  var t = $o(e, "string");
  return kt(t) == "symbol" ? t : t + "";
}
function $o(e, t) {
  if (kt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (kt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var De = {
  name: "Badge",
  extends: yo,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return pt(le(le({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, ko = ["data-p"];
function So(e, t, n, o, i, a) {
  return y(), S("span", I({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [K(e.$slots, "default", {}, function() {
    return [R(B(e.value), 1)];
  })], 16, ko);
}
De.render = So;
var _o = `
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: " ";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;
function St(e) {
  "@babel/helpers - typeof";
  return St = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, St(e);
}
function X(e, t, n) {
  return (t = Co(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Co(e) {
  var t = wo(e, "string");
  return St(t) == "symbol" ? t : t + "";
}
function wo(e, t) {
  if (St(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (St(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var xo = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", X(X(X(X(X(X(X(X(X({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", X({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Po = U.extend({
  name: "button",
  style: _o,
  classes: xo
}), jo = {
  name: "BaseButton",
  extends: Dt,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: [String, Object],
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: [String, Object],
      default: null
    },
    badgeSeverity: {
      type: String,
      default: "secondary"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: Po,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function _t(e) {
  "@babel/helpers - typeof";
  return _t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _t(e);
}
function W(e, t, n) {
  return (t = Oo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Oo(e) {
  var t = To(e, "string");
  return _t(t) == "symbol" ? t : t + "";
}
function To(e, t) {
  if (_t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (_t(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ie = {
  name: "Button",
  extends: jo,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    },
    attrs: function() {
      return I(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        "aria-label": this.defaultAriaLabel,
        "data-pc-name": "button",
        "data-p-disabled": this.disabled,
        "data-p-severity": this.severity
      };
    },
    hasFluid: function() {
      return Et(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return pt(W(W(W(W(W(W(W(W(W(W({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return pt(W(W({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return pt(W(W({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ee,
    Badge: De
  },
  directives: {
    ripple: je
  }
}, Lo = ["data-p"], Eo = ["data-p"];
function Do(e, t, n, o, i, a) {
  var d = Ot("SpinnerIcon"), u = Ot("Badge"), r = me("ripple");
  return e.asChild ? K(e.$slots, "default", {
    key: 1,
    class: lt(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : E((y(), G(Vt(e.as), I({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: it(function() {
      return [K(e.$slots, "default", {}, function() {
        return [e.loading ? K(e.$slots, "loadingicon", I({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (y(), S("span", I({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (y(), G(d, I({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : K(e.$slots, "icon", I({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (y(), S("span", I({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Lo)) : O("", !0)];
        }), e.label ? (y(), S("span", I({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), B(e.label), 17, Eo)) : O("", !0), e.badge ? (y(), G(u, {
          key: 3,
          value: e.badge,
          class: lt(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : O("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[r]]);
}
Ie.render = Do;
var Io = U.extend({
  name: "focustrap-directive"
}), Ao = _.extend({
  style: Io
});
function Ct(e) {
  "@babel/helpers - typeof";
  return Ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ct(e);
}
function se(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ue(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? se(Object(n), !0).forEach(function(o) {
      zo(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : se(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function zo(e, t, n) {
  return (t = Bo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bo(e) {
  var t = Vo(e, "string");
  return Ct(t) == "symbol" ? t : t + "";
}
function Vo(e, t) {
  if (Ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ct(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Mo = Ao.extend("focustrap", {
  mounted: function(t, n) {
    var o = n.value || {}, i = o.disabled;
    i || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var o = n.value || {}, i = o.disabled;
    i && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var o = this, i = n.value || {}, a = i.onFocusIn, d = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(u) {
        u.forEach(function(r) {
          if (r.type === "childList" && !t.contains(document.activeElement)) {
            var b = function(p) {
              var f = Jt(p) ? Jt(p, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? p : mt(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : mt(p);
              return Tt(f) ? f : p.nextSibling && b(p.nextSibling);
            };
            st(b(r.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(u) {
        return a && a(u);
      }, t.$_pfocustrap_focusoutlistener = function(u) {
        return d && d(u);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: ue(ue({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var o = n.value || {}, i = o.autoFocusSelector, a = i === void 0 ? "" : i, d = o.firstFocusableSelector, u = d === void 0 ? "" : d, r = o.autoFocus, b = r === void 0 ? !1 : r, c = mt(t, "[autofocus]".concat(this.getComputedSelector(a)));
      b && !c && (c = mt(t, this.getComputedSelector(u))), st(c);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, i = t.relatedTarget, a = i === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? mt(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      st(a);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, i = t.relatedTarget, a = i === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? ln(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      st(a);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, i = n.value || {}, a = i.tabIndex, d = a === void 0 ? 0 : a, u = i.firstFocusableSelector, r = u === void 0 ? "" : u, b = i.lastFocusableSelector, c = b === void 0 ? "" : b, p = function(C) {
        return _e("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: d,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: C?.bind(o)
        });
      }, f = p(this.onFirstHiddenElementFocus), v = p(this.onLastHiddenElementFocus);
      f.$_pfocustrap_lasthiddenfocusableelement = v, f.$_pfocustrap_focusableselector = r, f.setAttribute("data-pc-section", "firstfocusableelement"), v.$_pfocustrap_firsthiddenfocusableelement = f, v.$_pfocustrap_focusableselector = c, v.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(f), t.append(v);
    }
  }
});
function de() {
  un({
    variableName: Ce("scrollbar.width").name
  });
}
function ce() {
  sn({
    variableName: Ce("scrollbar.width").name
  });
}
var Uo = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, No = {
  mask: function(t) {
    var n = t.position, o = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, Ro = {
  mask: function(t) {
    var n = t.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = o.find(function(a) {
      return a === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, i ? "p-dialog-".concat(i) : ""];
  },
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Fo = U.extend({
  name: "dialog",
  style: Uo,
  classes: Ro,
  inlineStyles: No
}), Ho = {
  name: "BaseDialog",
  extends: Dt,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: Fo,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, At = {
  name: "Dialog",
  extends: Ho,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: tt(function() {
        return t._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Bt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Bt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Se(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), st(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Bt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(i) {
        return i && i.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && st(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? de() : ce());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && de();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ce();
    },
    onKeyDown: function(t) {
      t.code === "Escape" && this.closeOnEscape && !t.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(t) {
      this.container = t;
    },
    maskRef: function(t) {
      this.mask = t;
    },
    contentRef: function(t) {
      this.content = t;
    },
    headerContainerRef: function(t) {
      this.headerContainer = t;
    },
    footerContainerRef: function(t) {
      this.footerContainer = t;
    },
    maximizableRef: function(t) {
      this.maximizableButton = t ? t.$el : void 0;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var t;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", bn(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(t) {
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && pn(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", t));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var t = this;
      this.documentDragListener = function(n) {
        if (t.dragging) {
          var o = $e(t.container), i = ke(t.container), a = n.pageX - t.lastPageX, d = n.pageY - t.lastPageY, u = t.container.getBoundingClientRect(), r = u.left + a, b = u.top + d, c = cn(), p = getComputedStyle(t.container), f = parseFloat(p.marginLeft), v = parseFloat(p.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (r >= t.minX && r + o < c.width && (t.lastPageX = n.pageX, t.container.style.left = r - f + "px"), b >= t.minY && b + i < c.height && (t.lastPageY = n.pageY, t.container.style.top = b - v + "px")) : (t.lastPageX = n.pageX, t.container.style.left = r - f + "px", t.lastPageY = n.pageY, t.container.style.top = b - v + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var t = this;
      this.documentDragEndListener = function(n) {
        t.dragging && (t.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !t.isUnstyled && (document.body.style["user-select"] = ""), t.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return pt({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: je,
    focustrap: Mo
  },
  components: {
    Button: Ie,
    Portal: dn,
    WindowMinimizeIcon: Le,
    WindowMaximizeIcon: Te,
    TimesIcon: Oe
  }
};
function wt(e) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wt(e);
}
function pe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function be(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pe(Object(n), !0).forEach(function(o) {
      Wo(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pe(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Wo(e, t, n) {
  return (t = Ko(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ko(e) {
  var t = qo(e, "string");
  return wt(t) == "symbol" ? t : t + "";
}
function qo(e, t) {
  if (wt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (wt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Zo = ["data-p"], Go = ["aria-labelledby", "aria-modal", "data-p"], Yo = ["id"], Xo = ["data-p"];
function Jo(e, t, n, o, i, a) {
  var d = Ot("Button"), u = Ot("Portal"), r = me("focustrap");
  return y(), G(u, {
    appendTo: e.appendTo
  }, {
    default: it(function() {
      return [i.containerVisible ? (y(), S("div", I({
        key: 0,
        ref: a.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, e.ptm("mask")), [T(He, I({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: it(function() {
          return [e.visible ? E((y(), S("div", I({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? K(e.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(c) {
              return a.maximize(c);
            },
            initDragCallback: a.initDrag
          }) : (y(), S(et, {
            key: 1
          }, [e.showHeader ? (y(), S("div", I({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [K(e.$slots, "header", {
            class: lt(e.cx("title"))
          }, function() {
            return [e.header ? (y(), S("span", I({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), B(e.header), 17, Yo)) : O("", !0)];
          }), l("div", I({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? K(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(c) {
              return a.maximize(c);
            }
          }, function() {
            return [T(d, I({
              ref: a.maximizableRef,
              autofocus: i.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: it(function(b) {
                return [K(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(y(), G(Vt(a.maximizeIconComponent), I({
                    class: [b.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : O("", !0), e.closable ? K(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [T(d, I({
              ref: a.closeButtonRef,
              autofocus: i.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: it(function(b) {
                return [K(e.$slots, "closeicon", {}, function() {
                  return [(y(), G(Vt(e.closeIcon ? "span" : "TimesIcon"), I({
                    class: [e.closeIcon, b.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : O("", !0)], 16)], 16)) : O("", !0), l("div", I({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, be(be({}, e.contentProps), e.ptm("content"))), [K(e.$slots, "default")], 16, Xo), e.footer || e.$slots.footer ? (y(), S("div", I({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [K(e.$slots, "footer", {}, function() {
            return [R(B(e.footer), 1)];
          })], 16)) : O("", !0)], 64))], 16, Go)), [[r, {
            disabled: !e.modal
          }]]) : O("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Zo)) : O("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
At.render = Jo;
const Qo = { class: "crm-dialog-head" }, tr = { class: "crm-dialog-body crm-form-grid" }, er = { class: "crm-field" }, nr = { class: "crm-field" }, or = ["disabled", "placeholder"], rr = {
  key: 0,
  class: "crm-field full"
}, ir = { class: "crm-field full" }, ar = ["value"], lr = { class: "crm-dialog-foot" }, sr = ["disabled"], ur = /* @__PURE__ */ Lt({
  __name: "SettingsObjectDialog",
  props: {
    object: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = qt({ label: n.object?.label || "", type: n.object?.type || "", icon: n.object?.icon || "tabler:category", titleLabel: "" }), a = () => o("close"), d = { content: { class: "crm-dialog-content" } };
    fe(() => Ke("wc-icon-picker", { timeoutMs: 8e3 }));
    function u(b) {
      const c = b.detail;
      typeof c == "string" && (i.icon = c);
    }
    function r() {
      i.label.trim() && (!n.object && !i.titleLabel.trim() || o("save", { label: i.label.trim(), type: i.type.trim(), icon: i.icon.trim() || "tabler:category", titleLabel: i.titleLabel.trim() }));
    }
    return (b, c) => (y(), G(P(At), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: d,
      "aria-label": "Object",
      "onUpdate:visible": c[3] || (c[3] = (p) => {
        p || a();
      })
    }, {
      default: it(() => [
        l("header", Qo, [
          l("div", null, [
            l("h2", null, B(e.object ? "Edit object" : "New object"), 1),
            c[4] || (c[4] = l("p", null, "One reusable record type.", -1))
          ]),
          l("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: a
          }, [
            T(P(D), { icon: "tabler:x" })
          ])
        ]),
        l("div", tr, [
          l("label", er, [
            c[5] || (c[5] = l("span", { class: "crm-field-label" }, "Name", -1)),
            E(l("input", {
              "onUpdate:modelValue": c[0] || (c[0] = (p) => i.label = p),
              class: "crm-input",
              placeholder: "Companies",
              onKeyup: We(r, ["enter"])
            }, null, 544), [
              [H, i.label]
            ])
          ]),
          l("label", nr, [
            c[6] || (c[6] = l("span", { class: "crm-field-label" }, "API name", -1)),
            E(l("input", {
              "onUpdate:modelValue": c[1] || (c[1] = (p) => i.type = p),
              class: "crm-input",
              disabled: !!e.object,
              placeholder: P(dt)(i.label)
            }, null, 8, or), [
              [H, i.type]
            ])
          ]),
          e.object ? O("", !0) : (y(), S("label", rr, [
            c[7] || (c[7] = l("span", { class: "crm-field-label" }, "Record title field", -1)),
            c[8] || (c[8] = l("span", { class: "crm-field-help" }, "The field used to identify records throughout CRM.", -1)),
            E(l("input", {
              "onUpdate:modelValue": c[2] || (c[2] = (p) => i.titleLabel = p),
              class: "crm-input",
              placeholder: "Display name"
            }, null, 512), [
              [H, i.titleLabel]
            ])
          ])),
          l("label", ir, [
            c[9] || (c[9] = l("span", { class: "crm-field-label" }, "Icon", -1)),
            l("wc-icon-picker", {
              value: i.icon,
              fallback: "tabler:category",
              onSelect: u
            }, null, 40, ar)
          ])
        ]),
        l("footer", lr, [
          l("button", {
            type: "button",
            class: "crm-button",
            onClick: a
          }, "Cancel"),
          l("button", {
            type: "button",
            class: "crm-button primary",
            disabled: e.busy || !i.label.trim() || !e.object && !i.titleLabel.trim(),
            onClick: r
          }, [
            T(P(D), {
              icon: e.busy ? "tabler:loader-2" : "tabler:check",
              class: lt({ spin: e.busy })
            }, null, 8, ["icon", "class"]),
            R(B(e.busy ? "Saving…" : "Save"), 1)
          ], 8, sr)
        ])
      ]),
      _: 1
    }));
  }
}), dr = { class: "crm-dialog-head" }, cr = { class: "crm-dialog-body crm-form-grid" }, pr = { class: "crm-field" }, br = { class: "crm-field" }, mr = ["disabled", "placeholder"], fr = { class: "crm-field" }, gr = ["disabled"], vr = ["value"], yr = { class: "crm-field" }, hr = {
  key: 0,
  class: "crm-field full"
}, $r = { class: "crm-field" }, kr = {
  key: 0,
  class: "crm-field"
}, Sr = ["value"], _r = {
  key: 1,
  class: "crm-field"
}, Cr = {
  key: 2,
  class: "crm-field"
}, wr = {
  key: 3,
  class: "crm-field"
}, xr = {
  key: 4,
  class: "crm-field"
}, Pr = { class: "crm-field" }, jr = {
  key: 2,
  class: "crm-field"
}, Or = {
  key: 3,
  class: "crm-field"
}, Tr = { class: "crm-field" }, Lr = { class: "crm-field" }, Er = { class: "crm-field" }, Dr = { class: "crm-field" }, Ir = { class: "crm-check" }, Ar = { class: "crm-check" }, zr = { class: "crm-check" }, Br = {
  key: 4,
  class: "crm-check"
}, Vr = { class: "crm-dialog-foot" }, Mr = ["disabled"], Ur = /* @__PURE__ */ Lt({
  __name: "SettingsFieldDialog",
  props: {
    field: {},
    objects: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = ["text", "email", "phone", "url", "number", "currency", "boolean", "date", "time", "datetime", "select", "multi_select", "relation", "ai"], a = n.field?.config || {}, d = a.ui || {}, u = a.target || {}, r = qt({
      label: n.field?.label || "",
      attr: n.field?.attr || "",
      data_type: n.field?.data_type || "text",
      help: String(a.help || ""),
      required: a.required === !0,
      unique: a.unique === !0,
      choices: (a.choices || []).join(`
`),
      record_type: String(u.object_type || ""),
      target_kind: String(u.kind || "record"),
      target_class: String(u.class || ""),
      target_contract: String(u.contract || ""),
      target_types: (u.kinds || ["user"]).join(", "),
      target_route: String(u.route || ""),
      cardinality: a.cardinality === "many" ? "many" : "one",
      min: a.min == null ? "" : String(a.min),
      max: a.max == null ? "" : String(a.max),
      sort_order: Number(n.field?.sort_order || 10),
      ui_section: String(d.section || "main"),
      ui_form: d.form !== !1,
      ui_list: d.list !== !1,
      ui_role: String(d.role || ""),
      ui_span: Number(d.span || 2)
    }), b = tt(() => n.objects), c = tt(() => ["select", "multi_select"].includes(r.data_type)), p = tt(() => ["number", "currency"].includes(r.data_type)), f = tt(() => r.data_type !== "relation"), v = tt(() => r.label.trim() ? r.data_type !== "relation" ? !0 : r.target_kind === "record" ? r.record_type.trim() !== "" : r.target_kind === "component" ? r.target_class.trim() !== "" : r.target_types.split(",").some((L) => L.trim() !== "") : !1), k = () => o("close"), C = { content: { class: "crm-dialog-content" } };
    function w() {
      return n.field?.attr || dt(r.attr || r.label);
    }
    function A(L) {
      const s = {};
      if (r.help.trim() && (s.help = r.help.trim()), r.required && (s.required = !0), f.value && r.unique && (s.unique = !0), c.value && (s.choices = r.choices.split(/\n|,/).map((m) => m.trim()).filter(Boolean)), r.data_type === "relation") {
        let m;
        r.target_kind === "record" ? m = { kind: "record", object_type: r.record_type } : r.target_kind === "component" ? m = { kind: "component", class: r.target_class.trim(), contract: r.target_contract.trim() || void 0, route: r.target_route.trim() || void 0 } : m = { kind: "principal", kinds: r.target_types.split(",").map((F) => F.trim()).filter(Boolean) }, s.target = m, s.relation = `${n.selected}_${L}`, s.cardinality = r.cardinality;
      }
      return r.min !== "" && (s.min = Number(r.min)), r.max !== "" && (s.max = Number(r.max)), s.ui = {
        section: r.ui_section,
        form: r.ui_form,
        list: r.ui_list,
        span: r.ui_span,
        ...r.ui_role ? { role: r.ui_role } : {}
      }, s;
    }
    function M() {
      if (!v.value) return;
      const L = w();
      o("save", { label: r.label.trim(), attr: L, data_type: r.data_type, config: A(L), sort_order: r.sort_order });
    }
    return (L, s) => (y(), G(P(At), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog crm-dialog-wide",
      pt: C,
      "aria-label": "Field",
      "onUpdate:visible": s[22] || (s[22] = (m) => {
        m || k();
      })
    }, {
      default: it(() => [
        l("header", dr, [
          l("div", null, [
            l("h2", null, B(e.field ? "Edit field" : "New field"), 1),
            s[23] || (s[23] = l("p", null, "A schema-backed value on every record.", -1))
          ]),
          l("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: k
          }, [
            T(P(D), { icon: "tabler:x" })
          ])
        ]),
        l("div", cr, [
          l("label", pr, [
            s[24] || (s[24] = l("span", { class: "crm-field-label" }, "Field label", -1)),
            E(l("input", {
              "onUpdate:modelValue": s[0] || (s[0] = (m) => r.label = m),
              class: "crm-input"
            }, null, 512), [
              [H, r.label]
            ])
          ]),
          l("label", br, [
            s[25] || (s[25] = l("span", { class: "crm-field-label" }, "API name", -1)),
            E(l("input", {
              "onUpdate:modelValue": s[1] || (s[1] = (m) => r.attr = m),
              class: "crm-input",
              disabled: !!e.field,
              placeholder: P(dt)(r.label)
            }, null, 8, mr), [
              [H, r.attr]
            ])
          ]),
          l("label", fr, [
            s[26] || (s[26] = l("span", { class: "crm-field-label" }, "Type", -1)),
            E(l("select", {
              "onUpdate:modelValue": s[2] || (s[2] = (m) => r.data_type = m),
              class: "crm-input",
              disabled: !!e.field
            }, [
              (y(), S(et, null, ut(i, (m) => l("option", {
                key: m,
                value: m
              }, B(m.replace("_", " ")), 9, vr)), 64))
            ], 8, gr), [
              [at, r.data_type]
            ])
          ]),
          l("label", yr, [
            s[27] || (s[27] = l("span", { class: "crm-field-label" }, "Help text", -1)),
            E(l("input", {
              "onUpdate:modelValue": s[3] || (s[3] = (m) => r.help = m),
              class: "crm-input"
            }, null, 512), [
              [H, r.help]
            ])
          ]),
          c.value ? (y(), S("label", hr, [
            s[28] || (s[28] = l("span", { class: "crm-field-label" }, "Choices", -1)),
            s[29] || (s[29] = l("span", { class: "crm-field-help" }, "One per line.", -1)),
            E(l("textarea", {
              "onUpdate:modelValue": s[4] || (s[4] = (m) => r.choices = m),
              class: "crm-input crm-textarea"
            }, null, 512), [
              [H, r.choices]
            ])
          ])) : O("", !0),
          r.data_type === "relation" ? (y(), S(et, { key: 1 }, [
            l("label", $r, [
              s[31] || (s[31] = l("span", { class: "crm-field-label" }, "Target kind", -1)),
              E(l("select", {
                "onUpdate:modelValue": s[5] || (s[5] = (m) => r.target_kind = m),
                class: "crm-input"
              }, [...s[30] || (s[30] = [
                l("option", { value: "record" }, "CRM record", -1),
                l("option", { value: "component" }, "Application component", -1),
                l("option", { value: "principal" }, "Person or group directory", -1)
              ])], 512), [
                [at, r.target_kind]
              ])
            ]),
            r.target_kind === "record" ? (y(), S("label", kr, [
              s[33] || (s[33] = l("span", { class: "crm-field-label" }, "Related object", -1)),
              E(l("select", {
                "onUpdate:modelValue": s[6] || (s[6] = (m) => r.record_type = m),
                class: "crm-input"
              }, [
                s[32] || (s[32] = l("option", { value: "" }, "Select…", -1)),
                (y(!0), S(et, null, ut(b.value, (m) => (y(), S("option", {
                  key: m.type,
                  value: m.type
                }, B(m.label), 9, Sr))), 128))
              ], 512), [
                [at, r.record_type]
              ])
            ])) : r.target_kind === "component" ? (y(), S("label", _r, [
              s[34] || (s[34] = l("span", { class: "crm-field-label" }, "Component class", -1)),
              E(l("input", {
                "onUpdate:modelValue": s[7] || (s[7] = (m) => r.target_class = m),
                class: "crm-input",
                placeholder: "knowledge_base"
              }, null, 512), [
                [H, r.target_class]
              ])
            ])) : (y(), S("label", Cr, [
              s[35] || (s[35] = l("span", { class: "crm-field-label" }, "Principal kinds", -1)),
              E(l("input", {
                "onUpdate:modelValue": s[8] || (s[8] = (m) => r.target_types = m),
                class: "crm-input",
                placeholder: "user, group"
              }, null, 512), [
                [H, r.target_types]
              ])
            ])),
            r.target_kind === "component" ? (y(), S("label", wr, [
              s[36] || (s[36] = l("span", { class: "crm-field-label" }, "Required contract", -1)),
              E(l("input", {
                "onUpdate:modelValue": s[9] || (s[9] = (m) => r.target_contract = m),
                class: "crm-input",
                placeholder: "module:contract"
              }, null, 512), [
                [H, r.target_contract]
              ])
            ])) : O("", !0),
            r.target_kind === "component" ? (y(), S("label", xr, [
              s[37] || (s[37] = l("span", { class: "crm-field-label" }, "Open route", -1)),
              s[38] || (s[38] = l("span", { class: "crm-field-help" }, "Use {id} for the selected component.", -1)),
              E(l("input", {
                "onUpdate:modelValue": s[10] || (s[10] = (m) => r.target_route = m),
                class: "crm-input",
                placeholder: "knowledge/{id}"
              }, null, 512), [
                [H, r.target_route]
              ])
            ])) : O("", !0),
            l("label", Pr, [
              s[40] || (s[40] = l("span", { class: "crm-field-label" }, "Cardinality", -1)),
              E(l("select", {
                "onUpdate:modelValue": s[11] || (s[11] = (m) => r.cardinality = m),
                class: "crm-input"
              }, [...s[39] || (s[39] = [
                l("option", { value: "one" }, "One item", -1),
                l("option", { value: "many" }, "Many items", -1)
              ])], 512), [
                [at, r.cardinality]
              ])
            ])
          ], 64)) : O("", !0),
          p.value ? (y(), S("label", jr, [
            s[41] || (s[41] = l("span", { class: "crm-field-label" }, "Minimum", -1)),
            E(l("input", {
              "onUpdate:modelValue": s[12] || (s[12] = (m) => r.min = m),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [H, r.min]
            ])
          ])) : O("", !0),
          p.value ? (y(), S("label", Or, [
            s[42] || (s[42] = l("span", { class: "crm-field-label" }, "Maximum", -1)),
            E(l("input", {
              "onUpdate:modelValue": s[13] || (s[13] = (m) => r.max = m),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [H, r.max]
            ])
          ])) : O("", !0),
          s[54] || (s[54] = l("div", { class: "crm-form-section full" }, [
            l("strong", null, "Presentation"),
            l("span", null, "Declarative placement used by every CRM surface.")
          ], -1)),
          l("label", Tr, [
            s[44] || (s[44] = l("span", { class: "crm-field-label" }, "Detail section", -1)),
            E(l("select", {
              "onUpdate:modelValue": s[14] || (s[14] = (m) => r.ui_section = m),
              class: "crm-input"
            }, [...s[43] || (s[43] = [
              l("option", { value: "main" }, "Main details", -1),
              l("option", { value: "collapsed" }, "Collapsed details", -1),
              l("option", { value: "hidden" }, "Hidden", -1)
            ])], 512), [
              [at, r.ui_section]
            ])
          ]),
          l("label", Lr, [
            s[46] || (s[46] = l("span", { class: "crm-field-label" }, "Width", -1)),
            E(l("select", {
              "onUpdate:modelValue": s[15] || (s[15] = (m) => r.ui_span = m),
              class: "crm-input"
            }, [...s[45] || (s[45] = [
              l("option", { value: 1 }, "Quarter", -1),
              l("option", { value: 2 }, "Half", -1),
              l("option", { value: 3 }, "Three quarters", -1),
              l("option", { value: 4 }, "Full", -1)
            ])], 512), [
              [
                at,
                r.ui_span,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          l("label", Er, [
            s[48] || (s[48] = l("span", { class: "crm-field-label" }, "Semantic role", -1)),
            E(l("select", {
              "onUpdate:modelValue": s[16] || (s[16] = (m) => r.ui_role = m),
              class: "crm-input"
            }, [...s[47] || (s[47] = [
              l("option", { value: "" }, "Standard field", -1),
              l("option", { value: "title" }, "Record title", -1),
              l("option", { value: "subtitle" }, "Record subtitle", -1)
            ])], 512), [
              [at, r.ui_role]
            ])
          ]),
          l("label", Dr, [
            s[49] || (s[49] = l("span", { class: "crm-field-label" }, "Position", -1)),
            E(l("input", {
              "onUpdate:modelValue": s[17] || (s[17] = (m) => r.sort_order = m),
              class: "crm-input",
              type: "number",
              min: "0",
              step: "10"
            }, null, 512), [
              [
                H,
                r.sort_order,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          l("label", Ir, [
            E(l("input", {
              "onUpdate:modelValue": s[18] || (s[18] = (m) => r.ui_form = m),
              type: "checkbox"
            }, null, 512), [
              [xt, r.ui_form]
            ]),
            s[50] || (s[50] = l("span", null, [
              l("strong", null, "Show in forms"),
              l("small", null, "Available while creating or editing a record.")
            ], -1))
          ]),
          l("label", Ar, [
            E(l("input", {
              "onUpdate:modelValue": s[19] || (s[19] = (m) => r.ui_list = m),
              type: "checkbox"
            }, null, 512), [
              [xt, r.ui_list]
            ]),
            s[51] || (s[51] = l("span", null, [
              l("strong", null, "Show in default lists"),
              l("small", null, "Eligible for the default table columns.")
            ], -1))
          ]),
          l("label", zr, [
            E(l("input", {
              "onUpdate:modelValue": s[20] || (s[20] = (m) => r.required = m),
              type: "checkbox"
            }, null, 512), [
              [xt, r.required]
            ]),
            s[52] || (s[52] = l("span", null, [
              l("strong", null, "Required"),
              l("small", null, "Records cannot omit this value.")
            ], -1))
          ]),
          f.value ? (y(), S("label", Br, [
            E(l("input", {
              "onUpdate:modelValue": s[21] || (s[21] = (m) => r.unique = m),
              type: "checkbox"
            }, null, 512), [
              [xt, r.unique]
            ]),
            s[53] || (s[53] = l("span", null, [
              l("strong", null, "Unique"),
              l("small", null, "No two records may share it.")
            ], -1))
          ])) : O("", !0)
        ]),
        l("footer", Vr, [
          l("button", {
            type: "button",
            class: "crm-button",
            onClick: k
          }, "Cancel"),
          l("button", {
            type: "button",
            class: "crm-button primary",
            disabled: e.busy || !v.value,
            onClick: M
          }, [
            T(P(D), {
              icon: e.busy ? "tabler:loader-2" : "tabler:check",
              class: lt({ spin: e.busy })
            }, null, 8, ["icon", "class"]),
            R(B(e.busy ? "Saving…" : "Save"), 1)
          ], 8, Mr)
        ])
      ]),
      _: 1
    }));
  }
}), Nr = { class: "crm-dialog-head" }, Rr = { class: "crm-dialog-body" }, Fr = { class: "crm-field" }, Hr = { class: "crm-stage-editor" }, Wr = ["onUpdate:modelValue"], Kr = ["disabled", "onClick"], qr = ["disabled", "onClick"], Zr = ["onClick"], Gr = { class: "crm-dialog-foot" }, Yr = ["disabled"], Xr = /* @__PURE__ */ Lt({
  __name: "SettingsPipelineDialog",
  props: {
    pipeline: {},
    objectLabel: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = ge(n.pipeline || void 0), a = qt({
      label: n.pipeline?.label || `${n.objectLabel} Pipeline`,
      collection_id: n.pipeline?.collection_id || `${n.selected}_pipeline`,
      stages: i.length ? i.map((p) => ({ ...p })) : [{ stage_id: "new", label: "New", order: 10 }, { stage_id: "won", label: "Won", order: 20 }, { stage_id: "lost", label: "Lost", order: 30 }]
    }), d = () => o("close"), u = { content: { class: "crm-dialog-content" } };
    function r(p, f) {
      const v = p + f;
      if (v < 0 || v >= a.stages.length) return;
      const [k] = a.stages.splice(p, 1);
      a.stages.splice(v, 0, k);
    }
    function b() {
      a.stages.push({ stage_id: "", label: "", order: (a.stages.length + 1) * 10 });
    }
    function c() {
      a.stages.some((p) => p.label.trim()) && o("save", { label: a.label.trim(), collection_id: a.collection_id, stages: a.stages });
    }
    return (p, f) => (y(), G(P(At), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: u,
      "aria-label": "Pipeline stages",
      "onUpdate:visible": f[1] || (f[1] = (v) => {
        v || d();
      })
    }, {
      default: it(() => [
        l("header", Nr, [
          f[2] || (f[2] = l("div", null, [
            l("h2", null, "Pipeline stages"),
            l("p", null, "The stages shown in board view.")
          ], -1)),
          l("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: d
          }, [
            T(P(D), { icon: "tabler:x" })
          ])
        ]),
        l("div", Rr, [
          l("label", Fr, [
            f[3] || (f[3] = l("span", { class: "crm-field-label" }, "Pipeline name", -1)),
            E(l("input", {
              "onUpdate:modelValue": f[0] || (f[0] = (v) => a.label = v),
              class: "crm-input"
            }, null, 512), [
              [H, a.label]
            ])
          ]),
          l("div", Hr, [
            (y(!0), S(et, null, ut(a.stages, (v, k) => (y(), S("div", { key: k }, [
              T(P(D), { icon: "tabler:grip-vertical" }),
              E(l("input", {
                "onUpdate:modelValue": (C) => v.label = C,
                class: "crm-input",
                placeholder: "Stage name"
              }, null, 8, Wr), [
                [H, v.label]
              ]),
              l("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: k === 0,
                "aria-label": "Move up",
                onClick: (C) => r(k, -1)
              }, [
                T(P(D), { icon: "tabler:arrow-up" })
              ], 8, Kr),
              l("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: k === a.stages.length - 1,
                "aria-label": "Move down",
                onClick: (C) => r(k, 1)
              }, [
                T(P(D), { icon: "tabler:arrow-down" })
              ], 8, qr),
              l("button", {
                type: "button",
                class: "crm-icon-button danger",
                "aria-label": "Remove stage",
                onClick: (C) => a.stages.splice(k, 1)
              }, [
                T(P(D), { icon: "tabler:x" })
              ], 8, Zr)
            ]))), 128)),
            l("button", {
              type: "button",
              class: "crm-button",
              onClick: b
            }, [
              T(P(D), { icon: "tabler:plus" }),
              f[4] || (f[4] = R("Add stage", -1))
            ])
          ])
        ]),
        l("footer", Gr, [
          l("button", {
            type: "button",
            class: "crm-button",
            onClick: d
          }, "Cancel"),
          l("button", {
            type: "button",
            class: "crm-button primary",
            disabled: e.busy,
            onClick: c
          }, [
            T(P(D), {
              icon: e.busy ? "tabler:loader-2" : "tabler:check",
              class: lt({ spin: e.busy })
            }, null, 8, ["icon", "class"]),
            R(B(e.busy ? "Saving…" : "Save"), 1)
          ], 8, Yr)
        ])
      ]),
      _: 1
    }));
  }
}), Jr = {
  key: 0,
  class: "crm-state"
}, Qr = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, ti = {
  key: 2,
  class: "crm-settings"
}, ei = { class: "crm-page-head" }, ni = { class: "crm-page-actions" }, oi = {
  key: 0,
  class: "crm-pill"
}, ri = ["disabled"], ii = {
  key: 1,
  class: "crm-button"
}, ai = { class: "crm-settings-layout" }, li = { class: "crm-settings-objects" }, si = ["onClick"], ui = { class: "crm-object-icon" }, di = {
  key: 0,
  class: "crm-settings-main"
}, ci = { class: "crm-settings-title" }, pi = { class: "crm-object-icon large" }, bi = { class: "crm-card" }, mi = { class: "crm-card-head" }, fi = { class: "crm-field-list" }, gi = { key: 0 }, vi = { key: 1 }, yi = { class: "crm-type-badge" }, hi = { key: 0 }, $i = { key: 1 }, ki = { key: 2 }, Si = { class: "crm-type-badge" }, _i = { class: "crm-row-actions" }, Ci = ["onClick"], wi = ["onClick"], xi = { class: "crm-card" }, Pi = { class: "crm-card-head" }, ji = {
  key: 0,
  class: "crm-pipeline-preview"
}, Oi = {
  key: 1,
  class: "crm-card-empty"
}, Ti = { class: "crm-card" }, Li = { class: "crm-setting-line" }, Ei = ["disabled"], Di = {
  key: 1,
  class: "crm-settings-main crm-settings-empty"
}, Ii = { class: "crm-empty-icon" }, Ui = /* @__PURE__ */ Lt({
  __name: "CrmSettings",
  props: {
    crmId: {},
    initial: {},
    canWrite: { type: Boolean, default: !0 }
  },
  emits: ["changed"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = Y(n.initial || null), a = Y(""), d = Y(!0), u = Y(""), r = Y(!1), b = Y(""), c = Y(null), p = Y(null), f = Y(365), v = Y(""), k = tt(() => i.value?.objects.find(($) => $.type === a.value)), C = tt(() => Zt(i.value?.attributes || [], a.value)), w = tt(() => k.value ? qe(i.value?.pipelines || [], k.value) : void 0);
    async function A($ = a.value) {
      d.value = !0, u.value = "";
      try {
        const g = n.crmId || i.value?.crm_id || "", [h, z, V] = await Promise.all([Ze(g), Ge(), Ye(g)]);
        if ("provisioned" in V) throw new Error("No CRM workspace has been created yet.");
        v.value = h.revision;
        const q = { success: !0, crm_id: g, workspace_label: V.workspace_label, can_write: n.canWrite, ...h.declaration };
        i.value = q, f.value = Number(z.thread_event_retention_days || 365), a.value = q.objects.some((bt) => bt.type === $) ? $ : q.objects[0]?.type || "", o("changed", q);
      } catch (g) {
        u.value = Q(g, "CRM settings could not load.");
      } finally {
        d.value = !1;
      }
    }
    function M() {
      b.value = "", c.value = null, p.value = null;
    }
    function L($) {
      c.value = $ || null, b.value = "object";
    }
    function s($) {
      p.value = $ || null, b.value = "field";
    }
    function m() {
      b.value = "pipeline";
    }
    function F() {
      if (!i.value) return { objects: [], attributes: [], pipelines: [], views: [] };
      const $ = i.value;
      return {
        version: $.version,
        objects: $.objects,
        attributes: $.attributes,
        pipelines: $.pipelines,
        views: $.views,
        policies: $.policies,
        merge_config: $.merge_config
      };
    }
    async function J($) {
      const g = i.value;
      if (!g) throw new Error("CRM settings are not loaded.");
      const h = g.crm_id, z = await tn(h, v.value, $);
      v.value = z.revision;
      const V = { success: !0, crm_id: h, workspace_label: g.workspace_label, can_write: n.canWrite, ...z.declaration };
      return i.value = V, a.value = V.objects.some((q) => q.type === a.value) ? a.value : V.objects[0]?.type || "", o("changed", V), z;
    }
    async function Ae($) {
      const g = c.value?.type || dt($.type || $.label);
      if (g) {
        r.value = !0;
        try {
          const h = F(), z = { ...c.value || {}, type: g, label: $.label, icon: $.icon || void 0 }, V = [...h.objects.filter((bt) => bt.type !== g), z];
          let q = h.attributes;
          if (!c.value) {
            const bt = dt($.titleLabel);
            q = [...q, { object_type: g, attr: bt, data_type: "text", label: $.titleLabel, sort_order: 10, system: !0, config: { ui: { role: "title", section: "main", span: 4, list: !0, form: !0 } } }];
          }
          await J({ ...h, objects: V, attributes: q }), N.toast({ severity: "success", summary: c.value ? "Object updated" : "Object created", detail: $.label }), M(), a.value = g;
        } catch (h) {
          N.toast({ severity: "error", summary: "Could not save object", detail: Q(h, "CRM write failed.") });
        } finally {
          r.value = !1;
        }
      }
    }
    async function ze() {
      const $ = k.value;
      if (!(!$ || !await N.confirm({ header: `Delete ${$.label}`, message: "Delete this object, all of its fields, pipeline, views, and records? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete object", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const h = F(), z = [
            ...h.pipelines.filter((V) => V.object_type === $.type).map((V) => ({ kind: "pipeline", id: V.collection_id })),
            ...h.views.filter((V) => V.object_type === $.type).map((V) => ({ kind: "view", id: V.view_id }))
          ];
          await J({ ...h, remove: { objects: [{ object_id: $.id || $.type }], ...z.length ? { declarations: z } : {} } }), N.toast({ severity: "success", summary: "Object deleted", detail: $.label });
        } catch (h) {
          N.toast({ severity: "error", summary: "Could not delete object", detail: Q(h, "CRM write failed.") });
        }
    }
    async function Be($) {
      if ($.attr) {
        r.value = !0;
        try {
          const g = F(), h = { object_type: a.value, attr: $.attr, data_type: $.data_type, label: $.label, config: $.config, sort_order: $.sort_order || (C.value.length + 1) * 10, system: p.value?.system === !0 };
          await J({ ...g, attributes: [...g.attributes.filter((z) => !(z.object_type === a.value && z.attr === $.attr)), h] }), N.toast({ severity: "success", summary: p.value ? "Field updated" : "Field created", detail: $.label }), M();
        } catch (g) {
          N.toast({ severity: "error", summary: "Could not save field", detail: Q(g, "CRM write failed.") });
        } finally {
          r.value = !1;
        }
      }
    }
    async function Ve($) {
      if (!($.system || !await N.confirm({ header: `Delete ${$.label}`, message: "Delete this field and its stored values? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete field", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const h = F();
          await J({ ...h, remove: { attributes: [{ object_id: k.value?.id || a.value, field_id: $.id || $.attr }] } }), N.toast({ severity: "success", summary: "Field deleted", detail: $.label });
        } catch (h) {
          N.toast({ severity: "error", summary: "Could not delete field", detail: Q(h, "CRM write failed.") });
        }
    }
    async function Me($) {
      r.value = !0;
      try {
        const g = $.stages.filter((V) => V.label.trim()).map((V, q) => ({ ...V, stage_id: dt(V.stage_id || V.label), label: V.label.trim(), order: (q + 1) * 10 })), h = F(), z = { collection_id: $.collection_id, object_type: a.value, label: $.label, stages: g };
        await J({ ...h, pipelines: [...h.pipelines.filter((V) => V.collection_id !== $.collection_id), z] }), N.toast({ severity: "success", summary: "Pipeline saved", detail: $.label }), M();
      } catch (g) {
        N.toast({ severity: "error", summary: "Could not save pipeline", detail: Q(g, "CRM write failed.") });
      } finally {
        r.value = !1;
      }
    }
    async function Ue() {
      try {
        await Xe("thread_event_retention_days", f.value), N.toast({ severity: "success", summary: "Retention saved", detail: `${f.value} days` });
      } catch ($) {
        N.toast({ severity: "error", summary: "Could not save retention", detail: Q($, "Setting write failed.") });
      }
    }
    async function Ne($) {
      const g = $.target, h = g.files?.[0];
      if (h && i.value)
        try {
          const z = await Je(i.value.crm_id, v.value, JSON.parse(await h.text()));
          N.toast({ severity: "success", summary: "Configuration imported", detail: z.changed ? "The CRM schema was updated." : "The CRM schema was already current." }), await A(a.value);
        } catch (z) {
          N.toast({ severity: "error", summary: "Import failed", detail: Q(z, "Configuration import failed.") });
        }
      g.value = "";
    }
    async function Re() {
      if (i.value) {
        r.value = !0;
        try {
          const $ = await Qe(i.value.crm_id), g = new Blob([JSON.stringify($, null, 2)], { type: "application/json" }), h = URL.createObjectURL(g), z = document.createElement("a");
          z.href = h, z.download = `crm-config-${i.value.crm_id}.json`, document.body.appendChild(z), z.click(), z.remove(), URL.revokeObjectURL(h), N.toast({ severity: "success", summary: "Configuration exported", detail: "Downloaded schema JSON" });
        } catch ($) {
          N.toast({ severity: "error", summary: "Export failed", detail: Q($, "Configuration export failed.") });
        } finally {
          r.value = !1;
        }
      }
    }
    return fe(() => A()), ($, g) => d.value ? (y(), S("div", Jr, [
      T(P(D), {
        icon: "tabler:loader-2",
        class: "spin"
      }),
      g[6] || (g[6] = R(" Loading CRM settings…", -1))
    ])) : u.value ? (y(), S("div", Qr, [
      T(P(D), { icon: "tabler:alert-circle" }),
      l("div", null, [
        g[7] || (g[7] = l("strong", null, "Settings could not load", -1)),
        l("span", null, B(u.value), 1)
      ]),
      l("button", {
        class: "crm-button",
        onClick: g[0] || (g[0] = (h) => A())
      }, "Try again")
    ])) : i.value ? (y(), S("section", ti, [
      l("header", ei, [
        g[12] || (g[12] = l("div", null, [
          l("span", { class: "crm-eyebrow" }, "CRM control"),
          l("h1", null, "Data model"),
          l("p", null, "Objects, fields, relationships, and pipelines.")
        ], -1)),
        l("div", ni, [
          e.canWrite ? O("", !0) : (y(), S("span", oi, [
            T(P(D), { icon: "tabler:eye" }),
            g[8] || (g[8] = R("Read-only", -1))
          ])),
          l("button", {
            class: "crm-button",
            disabled: r.value,
            onClick: Re
          }, [
            T(P(D), { icon: "tabler:download" }),
            g[9] || (g[9] = R("Export JSON", -1))
          ], 8, ri),
          e.canWrite ? (y(), S("label", ii, [
            T(P(D), { icon: "tabler:upload" }),
            g[10] || (g[10] = R("Import JSON", -1)),
            l("input", {
              class: "crm-file-input",
              type: "file",
              accept: "application/json,.json",
              onChange: Ne
            }, null, 32)
          ])) : O("", !0),
          e.canWrite ? (y(), S("button", {
            key: 2,
            class: "crm-button primary",
            onClick: g[1] || (g[1] = (h) => L())
          }, [
            T(P(D), { icon: "tabler:plus" }),
            g[11] || (g[11] = R("New object", -1))
          ])) : O("", !0)
        ])
      ]),
      l("div", ai, [
        l("aside", li, [
          (y(!0), S(et, null, ut(i.value.objects, (h) => (y(), S("button", {
            key: h.type,
            class: lt({ active: a.value === h.type }),
            onClick: (z) => a.value = h.type
          }, [
            l("span", ui, [
              T(P(D), {
                icon: h.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            l("span", null, [
              l("strong", null, B(h.label), 1),
              l("small", null, B(P(Zt)(i.value.attributes, h.type).length) + " fields", 1)
            ]),
            T(P(D), { icon: "tabler:chevron-right" })
          ], 10, si))), 128))
        ]),
        k.value ? (y(), S("main", di, [
          l("section", ci, [
            l("span", pi, [
              T(P(D), {
                icon: k.value.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            l("div", null, [
              g[13] || (g[13] = l("span", null, "Object", -1)),
              l("h2", null, B(k.value.label), 1),
              l("code", null, B(k.value.type), 1)
            ]),
            e.canWrite ? (y(), S(et, { key: 0 }, [
              l("button", {
                class: "crm-button",
                onClick: g[2] || (g[2] = (h) => L(k.value))
              }, [
                T(P(D), { icon: "tabler:edit" }),
                g[14] || (g[14] = R("Edit", -1))
              ]),
              l("button", {
                class: "crm-button danger-text",
                onClick: ze
              }, [
                T(P(D), { icon: "tabler:trash" }),
                g[15] || (g[15] = R("Delete", -1))
              ])
            ], 64)) : O("", !0)
          ]),
          l("section", bi, [
            l("header", mi, [
              l("div", null, [
                g[16] || (g[16] = l("h2", null, "Fields and relationships", -1)),
                l("p", null, B(C.value.length) + " fields define records of this type.", 1)
              ]),
              e.canWrite ? (y(), S("button", {
                key: 0,
                class: "crm-button primary",
                onClick: g[3] || (g[3] = (h) => s())
              }, [
                T(P(D), { icon: "tabler:plus" }),
                g[17] || (g[17] = R("New field", -1))
              ])) : O("", !0)
            ]),
            l("div", fi, [
              g[18] || (g[18] = l("div", { class: "crm-field-row header" }, [
                l("span", null, "Field"),
                l("span", null, "API name"),
                l("span", null, "Type"),
                l("span", null, "Placement"),
                l("span")
              ], -1)),
              (y(!0), S(et, null, ut(C.value, (h) => (y(), S("div", {
                key: h.attr,
                class: "crm-field-row"
              }, [
                l("span", null, [
                  l("strong", null, B(h.label), 1),
                  h.config?.required ? (y(), S("small", gi, "Required")) : O("", !0),
                  h.system ? (y(), S("small", vi, "System")) : O("", !0)
                ]),
                l("code", null, B(h.attr), 1),
                l("span", yi, [
                  R(B(h.data_type.replace("_", " ")), 1),
                  h.config?.target?.kind === "record" ? (y(), S("small", hi, "→ " + B(h.config.target.object_type), 1)) : h.config?.target?.kind === "component" ? (y(), S("small", $i, "→ " + B(h.config.target.class), 1)) : h.config?.target?.kind === "principal" ? (y(), S("small", ki, "→ directory")) : O("", !0)
                ]),
                l("span", Si, [
                  R(B(h.config?.ui?.section || "main"), 1),
                  l("small", null, B(h.config?.ui?.span || 2) + "/4", 1)
                ]),
                l("span", _i, [
                  e.canWrite ? (y(), S("button", {
                    key: 0,
                    class: "crm-icon-button",
                    "aria-label": "Edit field",
                    onClick: (z) => s(h)
                  }, [
                    T(P(D), { icon: "tabler:edit" })
                  ], 8, Ci)) : O("", !0),
                  e.canWrite && !h.system ? (y(), S("button", {
                    key: 1,
                    class: "crm-icon-button danger",
                    "aria-label": "Delete field",
                    onClick: (z) => Ve(h)
                  }, [
                    T(P(D), { icon: "tabler:trash" })
                  ], 8, wi)) : O("", !0)
                ])
              ]))), 128))
            ])
          ]),
          l("section", xi, [
            l("header", Pi, [
              l("div", null, [
                g[19] || (g[19] = l("h2", null, "Pipeline", -1)),
                l("p", null, B(w.value ? w.value.label : "Optional stages for a board view."), 1)
              ]),
              e.canWrite ? (y(), S("button", {
                key: 0,
                class: "crm-button",
                onClick: m
              }, [
                T(P(D), {
                  icon: w.value ? "tabler:edit" : "tabler:plus"
                }, null, 8, ["icon"]),
                R(B(w.value ? "Edit stages" : "Add pipeline"), 1)
              ])) : O("", !0)
            ]),
            w.value ? (y(), S("div", ji, [
              (y(!0), S(et, null, ut(P(ge)(w.value), (h) => (y(), S("span", {
                key: h.stage_id
              }, B(h.label), 1))), 128))
            ])) : (y(), S("div", Oi, [
              T(P(D), { icon: "tabler:layout-kanban" }),
              g[20] || (g[20] = l("span", null, "No pipeline is configured for this object.", -1))
            ]))
          ]),
          l("section", Ti, [
            g[23] || (g[23] = l("header", { class: "crm-card-head" }, [
              l("div", null, [
                l("h2", null, "Retention"),
                l("p", null, "How long CRM thread events remain available.")
              ])
            ], -1)),
            l("div", Li, [
              g[21] || (g[21] = l("label", null, "Event retention", -1)),
              E(l("input", {
                "onUpdate:modelValue": g[4] || (g[4] = (h) => f.value = h),
                class: "crm-input short",
                type: "number",
                min: "1",
                disabled: !e.canWrite
              }, null, 8, Ei), [
                [
                  H,
                  f.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              g[22] || (g[22] = l("span", null, "days", -1)),
              e.canWrite ? (y(), S("button", {
                key: 0,
                class: "crm-button",
                onClick: Ue
              }, "Save")) : O("", !0)
            ])
          ])
        ])) : (y(), S("main", Di, [
          l("span", Ii, [
            T(P(D), { icon: "tabler:database-plus" })
          ]),
          g[25] || (g[25] = l("h2", null, "No objects yet", -1)),
          g[26] || (g[26] = l("p", null, "Define a record type and its title field to begin building this CRM.", -1)),
          e.canWrite ? (y(), S("button", {
            key: 0,
            class: "crm-button primary",
            onClick: g[5] || (g[5] = (h) => L())
          }, [
            T(P(D), { icon: "tabler:plus" }),
            g[24] || (g[24] = R("New object", -1))
          ])) : O("", !0)
        ]))
      ]),
      b.value === "object" ? (y(), G(ur, {
        key: 0,
        object: c.value,
        busy: r.value,
        onClose: M,
        onSave: Ae
      }, null, 8, ["object", "busy"])) : b.value === "field" ? (y(), G(Ur, {
        key: 1,
        field: p.value,
        objects: i.value.objects,
        selected: a.value,
        busy: r.value,
        onClose: M,
        onSave: Be
      }, null, 8, ["field", "objects", "selected", "busy"])) : b.value === "pipeline" ? (y(), G(Xr, {
        key: 2,
        pipeline: w.value,
        "object-label": k.value?.label || "CRM",
        selected: a.value,
        busy: r.value,
        onClose: M,
        onSave: Me
      }, null, 8, ["pipeline", "object-label", "selected", "busy"])) : O("", !0)
    ])) : O("", !0);
  }
});
export {
  Ui as _,
  At as s
};
//# sourceMappingURL=CrmSettings.vue_vue_type_script_setup_true_lang-BKAWI-EU.js.map
