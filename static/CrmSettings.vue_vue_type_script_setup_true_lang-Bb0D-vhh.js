import { openBlock as u, createElementBlock as m, mergeProps as P, createElementVNode as o, renderSlot as M, createTextVNode as I, toDisplayString as _, resolveComponent as bt, resolveDirective as Bt, withDirectives as $, createBlock as T, resolveDynamicComponent as vt, withCtx as Z, createCommentVNode as C, normalizeClass as G, computed as W, createVNode as w, Transition as ee, Fragment as K, defineComponent as pt, reactive as xt, onMounted as At, unref as y, withKeys as ne, vModelText as B, renderList as Q, vModelSelect as X, vModelCheckbox as ct, ref as V } from "vue";
import { Icon as S } from "@iconify/vue";
import { loadByTagName as oe, host as E } from "@wippy-fe/proxy";
import { G as tt, y as Ot, o as St, q as re, Z as ae, _ as ie, b as le, m as H, $ as se, a0 as de, a1 as ue, a2 as ce } from "./crm-model-BaRhr3mT.js";
import { s as mt, B as ft, l as Mt, b as Ft, c as $t, f as at, R as Tt, L as be, d as J, v as rt, e as pe, U as me, I as jt, g as fe, r as Rt, h as ge, i as ye, j as ve, C as he, k as ke, S as Ce, _ as we, x as yt, m as xe } from "./wc-runtime-DKFqZRRO.js";
var Vt = {
  name: "TimesIcon",
  extends: mt
};
function $e(t) {
  return _e(t) || Le(t) || je(t) || Se();
}
function Se() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function je(t, e) {
  if (t) {
    if (typeof t == "string") return ht(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ht(t, e) : void 0;
  }
}
function Le(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function _e(t) {
  if (Array.isArray(t)) return ht(t);
}
function ht(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ze(t, e, n, i, s, l) {
  return u(), m("svg", P({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), $e(e[0] || (e[0] = [o("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Vt.render = ze;
var Ut = {
  name: "WindowMaximizeIcon",
  extends: mt
};
function Pe(t) {
  return Be(t) || Ie(t) || Ee(t) || De();
}
function De() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ee(t, e) {
  if (t) {
    if (typeof t == "string") return kt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(t, e) : void 0;
  }
}
function Ie(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Be(t) {
  if (Array.isArray(t)) return kt(t);
}
function kt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Ae(t, e, n, i, s, l) {
  return u(), m("svg", P({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Pe(e[0] || (e[0] = [o("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ut.render = Ae;
var Nt = {
  name: "WindowMinimizeIcon",
  extends: mt
};
function Oe(t) {
  return Re(t) || Te(t) || Fe(t) || Me();
}
function Me() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fe(t, e) {
  if (t) {
    if (typeof t == "string") return Ct(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ct(t, e) : void 0;
  }
}
function Te(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Re(t) {
  if (Array.isArray(t)) return Ct(t);
}
function Ct(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Ve(t, e, n, i, s, l) {
  return u(), m("svg", P({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Oe(e[0] || (e[0] = [o("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Nt.render = Ve;
var Ht = {
  name: "SpinnerIcon",
  extends: mt
};
function Ue(t) {
  return Ke(t) || We(t) || He(t) || Ne();
}
function Ne() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function He(t, e) {
  if (t) {
    if (typeof t == "string") return wt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wt(t, e) : void 0;
  }
}
function We(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ke(t) {
  if (Array.isArray(t)) return wt(t);
}
function wt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function qe(t, e, n, i, s, l) {
  return u(), m("svg", P({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ue(e[0] || (e[0] = [o("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ht.render = qe;
var Ze = `
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
`, Ye = {
  root: function(e) {
    var n = e.props, i = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Ft(n.value) && String(n.value).length === 1,
      "p-badge-dot": Mt(n.value) && !i.$slots.default,
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
}, Xe = ft.extend({
  name: "badge",
  style: Ze,
  classes: Ye
}), Ge = {
  name: "BaseBadge",
  extends: $t,
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
  style: Xe,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function it(t) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, it(t);
}
function Lt(t, e, n) {
  return (e = Je(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Je(t) {
  var e = Qe(t, "string");
  return it(e) == "symbol" ? e : e + "";
}
function Qe(t, e) {
  if (it(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (it(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Wt = {
  name: "Badge",
  extends: Ge,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return at(Lt(Lt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, tn = ["data-p"];
function en(t, e, n, i, s, l) {
  return u(), m("span", P({
    class: t.cx("root"),
    "data-p": l.dataP
  }, t.ptmi("root")), [M(t.$slots, "default", {}, function() {
    return [I(_(t.value), 1)];
  })], 16, tn);
}
Wt.render = en;
var nn = `
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
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, lt(t);
}
function U(t, e, n) {
  return (e = on(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function on(t) {
  var e = rn(t, "string");
  return lt(e) == "symbol" ? e : e + "";
}
function rn(t, e) {
  if (lt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (lt(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var an = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-button p-component", U(U(U(U(U(U(U(U(U({
      "p-button-icon-only": n.hasIcon && !i.label && !i.badge,
      "p-button-vertical": (i.iconPos === "top" || i.iconPos === "bottom") && i.label,
      "p-button-loading": i.loading,
      "p-button-link": i.link || i.variant === "link"
    }, "p-button-".concat(i.severity), i.severity), "p-button-raised", i.raised), "p-button-rounded", i.rounded), "p-button-text", i.text || i.variant === "text"), "p-button-outlined", i.outlined || i.variant === "outlined"), "p-button-sm", i.size === "small"), "p-button-lg", i.size === "large"), "p-button-plain", i.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", U({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, ln = ft.extend({
  name: "button",
  style: nn,
  classes: an
}), sn = {
  name: "BaseButton",
  extends: $t,
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
  style: ln,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function st(t) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, st(t);
}
function O(t, e, n) {
  return (e = dn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function dn(t) {
  var e = un(t, "string");
  return st(e) == "symbol" ? e : e + "";
}
function un(t, e) {
  if (st(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (st(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Kt = {
  name: "Button",
  extends: sn,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
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
      return P(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Mt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return at(O(O(O(O(O(O(O(O(O(O({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return at(O(O({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return at(O(O({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ht,
    Badge: Wt
  },
  directives: {
    ripple: Tt
  }
}, cn = ["data-p"], bn = ["data-p"];
function pn(t, e, n, i, s, l) {
  var x = bt("SpinnerIcon"), v = bt("Badge"), r = Bt("ripple");
  return t.asChild ? M(t.$slots, "default", {
    key: 1,
    class: G(t.cx("root")),
    a11yAttrs: l.a11yAttrs
  }) : $((u(), T(vt(t.as), P({
    key: 0,
    class: t.cx("root"),
    "data-p": l.dataP
  }, l.attrs), {
    default: Z(function() {
      return [M(t.$slots, "default", {}, function() {
        return [t.loading ? M(t.$slots, "loadingicon", P({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), m("span", P({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), T(x, P({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : M(t.$slots, "icon", P({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), m("span", P({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": l.dataIconP
          }, t.ptm("icon")), null, 16, cn)) : C("", !0)];
        }), t.label ? (u(), m("span", P({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": l.dataLabelP
        }), _(t.label), 17, bn)) : C("", !0), t.badge ? (u(), T(v, {
          key: 3,
          value: t.badge,
          class: G(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : C("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[r]]);
}
Kt.render = pn;
var mn = ft.extend({
  name: "focustrap-directive"
}), fn = pe.extend({
  style: mn
});
function dt(t) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, dt(t);
}
function _t(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function zt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? _t(Object(n), !0).forEach(function(i) {
      gn(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : _t(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function gn(t, e, n) {
  return (e = yn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function yn(t) {
  var e = vn(t, "string");
  return dt(e) == "symbol" ? e : e + "";
}
function vn(t, e) {
  if (dt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (dt(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var hn = fn.extend("focustrap", {
  mounted: function(e, n) {
    var i = n.value || {}, s = i.disabled;
    s || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var i = n.value || {}, s = i.disabled;
    s && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var i = this, s = n.value || {}, l = s.onFocusIn, x = s.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(v) {
        v.forEach(function(r) {
          if (r.type === "childList" && !e.contains(document.activeElement)) {
            var h = function(g) {
              var k = jt(g) ? jt(g, i.getComputedSelector(e.$_pfocustrap_focusableselector)) ? g : rt(e, i.getComputedSelector(e.$_pfocustrap_focusableselector)) : rt(g);
              return Ft(k) ? k : g.nextSibling && h(g.nextSibling);
            };
            J(h(r.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(v) {
        return l && l(v);
      }, e.$_pfocustrap_focusoutlistener = function(v) {
        return x && x(v);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: zt(zt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var i = n.value || {}, s = i.autoFocusSelector, l = s === void 0 ? "" : s, x = i.firstFocusableSelector, v = x === void 0 ? "" : x, r = i.autoFocus, h = r === void 0 ? !1 : r, f = rt(e, "[autofocus]".concat(this.getComputedSelector(l)));
      h && !f && (f = rt(e, this.getComputedSelector(v))), J(f);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, i = e.currentTarget, s = e.relatedTarget, l = s === i.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? rt(i.parentElement, this.getComputedSelector(i.$_pfocustrap_focusableselector)) : i.$_pfocustrap_lasthiddenfocusableelement;
      J(l);
    },
    onLastHiddenElementFocus: function(e) {
      var n, i = e.currentTarget, s = e.relatedTarget, l = s === i.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? be(i.parentElement, this.getComputedSelector(i.$_pfocustrap_focusableselector)) : i.$_pfocustrap_firsthiddenfocusableelement;
      J(l);
    },
    createHiddenFocusableElements: function(e, n) {
      var i = this, s = n.value || {}, l = s.tabIndex, x = l === void 0 ? 0 : l, v = s.firstFocusableSelector, r = v === void 0 ? "" : v, h = s.lastFocusableSelector, f = h === void 0 ? "" : h, g = function(A) {
        return me("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: x,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: A?.bind(i)
        });
      }, k = g(this.onFirstHiddenElementFocus), L = g(this.onLastHiddenElementFocus);
      k.$_pfocustrap_lasthiddenfocusableelement = L, k.$_pfocustrap_focusableselector = r, k.setAttribute("data-pc-section", "firstfocusableelement"), L.$_pfocustrap_firsthiddenfocusableelement = k, L.$_pfocustrap_focusableselector = f, L.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(k), e.append(L);
    }
  }
});
function Pt() {
  ge({
    variableName: Rt("scrollbar.width").name
  });
}
function Dt() {
  fe({
    variableName: Rt("scrollbar.width").name
  });
}
var kn = `
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
`, Cn = {
  mask: function(e) {
    var n = e.position, i = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: i ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, wn = {
  mask: function(e) {
    var n = e.props, i = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], s = i.find(function(l) {
      return l === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, s ? "p-dialog-".concat(s) : ""];
  },
  root: function(e) {
    var n = e.props, i = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && i.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, xn = ft.extend({
  name: "dialog",
  style: kn,
  classes: wn,
  inlineStyles: Cn
}), $n = {
  name: "BaseDialog",
  extends: $t,
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
  style: xn,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, gt = {
  name: "Dialog",
  extends: $n,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: W(function() {
        return e._instance;
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && yt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && yt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && xe(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), J(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && yt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(s) {
        return s && s.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && J(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? Pt() : Dt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Pt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Dt();
    },
    onKeyDown: function(e) {
      e.code === "Escape" && this.closeOnEscape && !e.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(e) {
      this.container = e;
    },
    maskRef: function(e) {
      this.mask = e;
    },
    contentRef: function(e) {
      this.content = e;
    },
    headerContainerRef: function(e) {
      this.headerContainer = e;
    },
    footerContainerRef: function(e) {
      this.footerContainer = e;
    },
    maximizableRef: function(e) {
      this.maximizableButton = e ? e.$el : void 0;
    },
    closeButtonRef: function(e) {
      this.closeButton = e ? e.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var e;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", we(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var i in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(i, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[i], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(e) {
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Ce(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", e));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var e = this;
      this.documentDragListener = function(n) {
        if (e.dragging) {
          var i = ve(e.container), s = he(e.container), l = n.pageX - e.lastPageX, x = n.pageY - e.lastPageY, v = e.container.getBoundingClientRect(), r = v.left + l, h = v.top + x, f = ke(), g = getComputedStyle(e.container), k = parseFloat(g.marginLeft), L = parseFloat(g.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (r >= e.minX && r + i < f.width && (e.lastPageX = n.pageX, e.container.style.left = r - k + "px"), h >= e.minY && h + s < f.height && (e.lastPageY = n.pageY, e.container.style.top = h - L + "px")) : (e.lastPageX = n.pageX, e.container.style.left = r - k + "px", e.lastPageY = n.pageY, e.container.style.top = h - L + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var e = this;
      this.documentDragEndListener = function(n) {
        e.dragging && (e.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !e.isUnstyled && (document.body.style["user-select"] = ""), e.$emit("dragend", n));
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
      return at({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Tt,
    focustrap: hn
  },
  components: {
    Button: Kt,
    Portal: ye,
    WindowMinimizeIcon: Nt,
    WindowMaximizeIcon: Ut,
    TimesIcon: Vt
  }
};
function ut(t) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ut(t);
}
function Et(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function It(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Et(Object(n), !0).forEach(function(i) {
      Sn(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Et(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Sn(t, e, n) {
  return (e = jn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jn(t) {
  var e = Ln(t, "string");
  return ut(e) == "symbol" ? e : e + "";
}
function Ln(t, e) {
  if (ut(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ut(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _n = ["data-p"], zn = ["aria-labelledby", "aria-modal", "data-p"], Pn = ["id"], Dn = ["data-p"];
function En(t, e, n, i, s, l) {
  var x = bt("Button"), v = bt("Portal"), r = Bt("focustrap");
  return u(), T(v, {
    appendTo: t.appendTo
  }, {
    default: Z(function() {
      return [s.containerVisible ? (u(), m("div", P({
        key: 0,
        ref: l.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return l.onMaskMouseDown && l.onMaskMouseDown.apply(l, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return l.onMaskMouseUp && l.onMaskMouseUp.apply(l, arguments);
        }),
        "data-p": l.dataP
      }, t.ptm("mask")), [w(ee, P({
        name: "p-dialog",
        onEnter: l.onEnter,
        onAfterEnter: l.onAfterEnter,
        onBeforeLeave: l.onBeforeLeave,
        onLeave: l.onLeave,
        onAfterLeave: l.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: Z(function() {
          return [t.visible ? $((u(), m("div", P({
            key: 0,
            ref: l.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": l.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": l.dataP
          }, t.ptmi("root")), [t.$slots.container ? M(t.$slots, "container", {
            key: 0,
            closeCallback: l.close,
            maximizeCallback: function(f) {
              return l.maximize(f);
            },
            initDragCallback: l.initDrag
          }) : (u(), m(K, {
            key: 1
          }, [t.showHeader ? (u(), m("div", P({
            key: 0,
            ref: l.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return l.initDrag && l.initDrag.apply(l, arguments);
            })
          }, t.ptm("header")), [M(t.$slots, "header", {
            class: G(t.cx("title"))
          }, function() {
            return [t.header ? (u(), m("span", P({
              key: 0,
              id: l.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), _(t.header), 17, Pn)) : C("", !0)];
          }), o("div", P({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? M(t.$slots, "maximizebutton", {
            key: 0,
            maximized: s.maximized,
            maximizeCallback: function(f) {
              return l.maximize(f);
            }
          }, function() {
            return [w(x, P({
              ref: l.maximizableRef,
              autofocus: s.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: l.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Z(function(h) {
                return [M(t.$slots, "maximizeicon", {
                  maximized: s.maximized
                }, function() {
                  return [(u(), T(vt(l.maximizeIconComponent), P({
                    class: [h.class, s.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : C("", !0), t.closable ? M(t.$slots, "closebutton", {
            key: 1,
            closeCallback: l.close
          }, function() {
            return [w(x, P({
              ref: l.closeButtonRef,
              autofocus: s.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: l.close,
              "aria-label": l.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Z(function(h) {
                return [M(t.$slots, "closeicon", {}, function() {
                  return [(u(), T(vt(t.closeIcon ? "span" : "TimesIcon"), P({
                    class: [t.closeIcon, h.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : C("", !0)], 16)], 16)) : C("", !0), o("div", P({
            ref: l.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": l.dataP
          }, It(It({}, t.contentProps), t.ptm("content"))), [M(t.$slots, "default")], 16, Dn), t.footer || t.$slots.footer ? (u(), m("div", P({
            key: 1,
            ref: l.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [M(t.$slots, "footer", {}, function() {
            return [I(_(t.footer), 1)];
          })], 16)) : C("", !0)], 64))], 16, zn)), [[r, {
            disabled: !t.modal
          }]]) : C("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, _n)) : C("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
gt.render = En;
const In = { class: "crm-dialog-head" }, Bn = { class: "crm-dialog-body crm-form-grid" }, An = { class: "crm-field" }, On = { class: "crm-field" }, Mn = ["disabled", "placeholder"], Fn = {
  key: 0,
  class: "crm-field full"
}, Tn = { class: "crm-field full" }, Rn = ["value"], Vn = { class: "crm-dialog-foot" }, Un = ["disabled"], Nn = /* @__PURE__ */ pt({
  __name: "SettingsObjectDialog",
  props: {
    object: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = xt({ label: n.object?.label || "", type: n.object?.type || "", icon: n.object?.icon || "tabler:category", titleLabel: "" }), l = () => i("close"), x = { content: { class: "crm-dialog-content" } };
    At(() => oe("wc-icon-picker", { timeoutMs: 8e3 }));
    function v(h) {
      const f = h.detail;
      typeof f == "string" && (s.icon = f);
    }
    function r() {
      s.label.trim() && (!n.object && !s.titleLabel.trim() || i("save", { label: s.label.trim(), type: s.type.trim(), icon: s.icon.trim() || "tabler:category", titleLabel: s.titleLabel.trim() }));
    }
    return (h, f) => (u(), T(y(gt), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: x,
      "aria-label": "Object",
      "onUpdate:visible": f[3] || (f[3] = (g) => {
        g || l();
      })
    }, {
      default: Z(() => [
        o("header", In, [
          o("div", null, [
            o("h2", null, _(t.object ? "Edit object" : "New object"), 1),
            f[4] || (f[4] = o("p", null, "One reusable record type.", -1))
          ]),
          o("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: l
          }, [
            w(y(S), { icon: "tabler:x" })
          ])
        ]),
        o("div", Bn, [
          o("label", An, [
            f[5] || (f[5] = o("span", { class: "crm-field-label" }, "Name", -1)),
            $(o("input", {
              "onUpdate:modelValue": f[0] || (f[0] = (g) => s.label = g),
              class: "crm-input",
              placeholder: "Companies",
              onKeyup: ne(r, ["enter"])
            }, null, 544), [
              [B, s.label]
            ])
          ]),
          o("label", On, [
            f[6] || (f[6] = o("span", { class: "crm-field-label" }, "API name", -1)),
            $(o("input", {
              "onUpdate:modelValue": f[1] || (f[1] = (g) => s.type = g),
              class: "crm-input",
              disabled: !!t.object,
              placeholder: y(tt)(s.label)
            }, null, 8, Mn), [
              [B, s.type]
            ])
          ]),
          t.object ? C("", !0) : (u(), m("label", Fn, [
            f[7] || (f[7] = o("span", { class: "crm-field-label" }, "Record title field", -1)),
            f[8] || (f[8] = o("span", { class: "crm-field-help" }, "The field used to identify records throughout CRM.", -1)),
            $(o("input", {
              "onUpdate:modelValue": f[2] || (f[2] = (g) => s.titleLabel = g),
              class: "crm-input",
              placeholder: "Display name"
            }, null, 512), [
              [B, s.titleLabel]
            ])
          ])),
          o("label", Tn, [
            f[9] || (f[9] = o("span", { class: "crm-field-label" }, "Icon", -1)),
            o("wc-icon-picker", {
              value: s.icon,
              fallback: "tabler:category",
              onSelect: v
            }, null, 40, Rn)
          ])
        ]),
        o("footer", Vn, [
          o("button", {
            type: "button",
            class: "crm-button",
            onClick: l
          }, "Cancel"),
          o("button", {
            type: "button",
            class: "crm-button primary",
            disabled: t.busy || !s.label.trim() || !t.object && !s.titleLabel.trim(),
            onClick: r
          }, [
            w(y(S), {
              icon: t.busy ? "tabler:loader-2" : "tabler:check",
              class: G({ spin: t.busy })
            }, null, 8, ["icon", "class"]),
            I(_(t.busy ? "Saving…" : "Save"), 1)
          ], 8, Un)
        ])
      ]),
      _: 1
    }));
  }
}), Hn = { class: "crm-dialog-head" }, Wn = { class: "crm-dialog-body crm-form-grid" }, Kn = { class: "crm-field" }, qn = { class: "crm-field" }, Zn = ["disabled", "placeholder"], Yn = { class: "crm-field" }, Xn = ["disabled"], Gn = ["value"], Jn = { class: "crm-field" }, Qn = {
  key: 0,
  class: "crm-field full"
}, to = { class: "crm-field" }, eo = {
  key: 0,
  class: "crm-field"
}, no = ["value"], oo = {
  key: 1,
  class: "crm-field"
}, ro = {
  key: 2,
  class: "crm-field"
}, ao = {
  key: 3,
  class: "crm-field"
}, io = {
  key: 4,
  class: "crm-field"
}, lo = { class: "crm-field" }, so = {
  key: 2,
  class: "crm-field"
}, uo = {
  key: 3,
  class: "crm-field"
}, co = { class: "crm-field" }, bo = { class: "crm-field" }, po = { class: "crm-field" }, mo = { class: "crm-field" }, fo = { class: "crm-check" }, go = { class: "crm-check" }, yo = { class: "crm-check" }, vo = {
  key: 4,
  class: "crm-check"
}, ho = { class: "crm-dialog-foot" }, ko = ["disabled"], Co = /* @__PURE__ */ pt({
  __name: "SettingsFieldDialog",
  props: {
    field: {},
    objects: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = ["text", "email", "phone", "url", "number", "currency", "boolean", "date", "time", "datetime", "select", "multi_select", "relation", "ai"], l = n.field?.config || {}, x = l.ui || {}, v = l.target || {}, r = xt({
      label: n.field?.label || "",
      attr: n.field?.attr || "",
      data_type: n.field?.data_type || "text",
      help: String(l.help || ""),
      required: l.required === !0,
      unique: l.unique === !0,
      choices: (l.choices || []).join(`
`),
      record_type: String(v.object_type || ""),
      target_kind: String(v.kind || "record"),
      target_class: String(v.class || ""),
      target_contract: String(v.contract || ""),
      target_types: (v.kinds || ["user"]).join(", "),
      target_route: String(v.route || ""),
      cardinality: l.cardinality === "many" ? "many" : "one",
      min: l.min == null ? "" : String(l.min),
      max: l.max == null ? "" : String(l.max),
      sort_order: Number(n.field?.sort_order || 10),
      ui_section: String(x.section || "main"),
      ui_form: x.form !== !1,
      ui_list: x.list !== !1,
      ui_role: String(x.role || ""),
      ui_span: Number(x.span || 2)
    }), h = W(() => n.objects), f = W(() => ["select", "multi_select"].includes(r.data_type)), g = W(() => ["number", "currency"].includes(r.data_type)), k = W(() => r.data_type !== "relation"), L = W(() => r.label.trim() ? r.data_type !== "relation" ? !0 : r.target_kind === "record" ? r.record_type.trim() !== "" : r.target_kind === "component" ? r.target_class.trim() !== "" : r.target_types.split(",").some((R) => R.trim() !== "") : !1), D = () => i("close"), A = { content: { class: "crm-dialog-content" } };
    function N() {
      return n.field?.attr || tt(r.attr || r.label);
    }
    function et(R) {
      const a = {};
      if (r.help.trim() && (a.help = r.help.trim()), r.required && (a.required = !0), k.value && r.unique && (a.unique = !0), f.value && (a.choices = r.choices.split(/\n|,/).map((p) => p.trim()).filter(Boolean)), r.data_type === "relation") {
        let p;
        r.target_kind === "record" ? p = { kind: "record", object_type: r.record_type } : r.target_kind === "component" ? p = { kind: "component", class: r.target_class.trim(), contract: r.target_contract.trim() || void 0, route: r.target_route.trim() || void 0 } : p = { kind: "principal", kinds: r.target_types.split(",").map((Y) => Y.trim()).filter(Boolean) }, a.target = p, a.relation = `${n.selected}_${R}`, a.cardinality = r.cardinality;
      }
      return r.min !== "" && (a.min = Number(r.min)), r.max !== "" && (a.max = Number(r.max)), a.ui = {
        section: r.ui_section,
        form: r.ui_form,
        list: r.ui_list,
        span: r.ui_span,
        ...r.ui_role ? { role: r.ui_role } : {}
      }, a;
    }
    function q() {
      if (!L.value) return;
      const R = N();
      i("save", { label: r.label.trim(), attr: R, data_type: r.data_type, config: et(R), sort_order: r.sort_order });
    }
    return (R, a) => (u(), T(y(gt), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog crm-dialog-wide",
      pt: A,
      "aria-label": "Field",
      "onUpdate:visible": a[22] || (a[22] = (p) => {
        p || D();
      })
    }, {
      default: Z(() => [
        o("header", Hn, [
          o("div", null, [
            o("h2", null, _(t.field ? "Edit field" : "New field"), 1),
            a[23] || (a[23] = o("p", null, "A schema-backed value on every record.", -1))
          ]),
          o("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: D
          }, [
            w(y(S), { icon: "tabler:x" })
          ])
        ]),
        o("div", Wn, [
          o("label", Kn, [
            a[24] || (a[24] = o("span", { class: "crm-field-label" }, "Field label", -1)),
            $(o("input", {
              "onUpdate:modelValue": a[0] || (a[0] = (p) => r.label = p),
              class: "crm-input"
            }, null, 512), [
              [B, r.label]
            ])
          ]),
          o("label", qn, [
            a[25] || (a[25] = o("span", { class: "crm-field-label" }, "API name", -1)),
            $(o("input", {
              "onUpdate:modelValue": a[1] || (a[1] = (p) => r.attr = p),
              class: "crm-input",
              disabled: !!t.field,
              placeholder: y(tt)(r.label)
            }, null, 8, Zn), [
              [B, r.attr]
            ])
          ]),
          o("label", Yn, [
            a[26] || (a[26] = o("span", { class: "crm-field-label" }, "Type", -1)),
            $(o("select", {
              "onUpdate:modelValue": a[2] || (a[2] = (p) => r.data_type = p),
              class: "crm-input",
              disabled: !!t.field
            }, [
              (u(), m(K, null, Q(s, (p) => o("option", {
                key: p,
                value: p
              }, _(p.replace("_", " ")), 9, Gn)), 64))
            ], 8, Xn), [
              [X, r.data_type]
            ])
          ]),
          o("label", Jn, [
            a[27] || (a[27] = o("span", { class: "crm-field-label" }, "Help text", -1)),
            $(o("input", {
              "onUpdate:modelValue": a[3] || (a[3] = (p) => r.help = p),
              class: "crm-input"
            }, null, 512), [
              [B, r.help]
            ])
          ]),
          f.value ? (u(), m("label", Qn, [
            a[28] || (a[28] = o("span", { class: "crm-field-label" }, "Choices", -1)),
            a[29] || (a[29] = o("span", { class: "crm-field-help" }, "One per line.", -1)),
            $(o("textarea", {
              "onUpdate:modelValue": a[4] || (a[4] = (p) => r.choices = p),
              class: "crm-input crm-textarea"
            }, null, 512), [
              [B, r.choices]
            ])
          ])) : C("", !0),
          r.data_type === "relation" ? (u(), m(K, { key: 1 }, [
            o("label", to, [
              a[31] || (a[31] = o("span", { class: "crm-field-label" }, "Target kind", -1)),
              $(o("select", {
                "onUpdate:modelValue": a[5] || (a[5] = (p) => r.target_kind = p),
                class: "crm-input"
              }, [...a[30] || (a[30] = [
                o("option", { value: "record" }, "CRM record", -1),
                o("option", { value: "component" }, "Application component", -1),
                o("option", { value: "principal" }, "Person or group directory", -1)
              ])], 512), [
                [X, r.target_kind]
              ])
            ]),
            r.target_kind === "record" ? (u(), m("label", eo, [
              a[33] || (a[33] = o("span", { class: "crm-field-label" }, "Related object", -1)),
              $(o("select", {
                "onUpdate:modelValue": a[6] || (a[6] = (p) => r.record_type = p),
                class: "crm-input"
              }, [
                a[32] || (a[32] = o("option", { value: "" }, "Select…", -1)),
                (u(!0), m(K, null, Q(h.value, (p) => (u(), m("option", {
                  key: p.type,
                  value: p.type
                }, _(p.label), 9, no))), 128))
              ], 512), [
                [X, r.record_type]
              ])
            ])) : r.target_kind === "component" ? (u(), m("label", oo, [
              a[34] || (a[34] = o("span", { class: "crm-field-label" }, "Component class", -1)),
              $(o("input", {
                "onUpdate:modelValue": a[7] || (a[7] = (p) => r.target_class = p),
                class: "crm-input",
                placeholder: "knowledge_base"
              }, null, 512), [
                [B, r.target_class]
              ])
            ])) : (u(), m("label", ro, [
              a[35] || (a[35] = o("span", { class: "crm-field-label" }, "Principal kinds", -1)),
              $(o("input", {
                "onUpdate:modelValue": a[8] || (a[8] = (p) => r.target_types = p),
                class: "crm-input",
                placeholder: "user, group"
              }, null, 512), [
                [B, r.target_types]
              ])
            ])),
            r.target_kind === "component" ? (u(), m("label", ao, [
              a[36] || (a[36] = o("span", { class: "crm-field-label" }, "Required contract", -1)),
              $(o("input", {
                "onUpdate:modelValue": a[9] || (a[9] = (p) => r.target_contract = p),
                class: "crm-input",
                placeholder: "module:contract"
              }, null, 512), [
                [B, r.target_contract]
              ])
            ])) : C("", !0),
            r.target_kind === "component" ? (u(), m("label", io, [
              a[37] || (a[37] = o("span", { class: "crm-field-label" }, "Open route", -1)),
              a[38] || (a[38] = o("span", { class: "crm-field-help" }, "Use {id} for the selected component.", -1)),
              $(o("input", {
                "onUpdate:modelValue": a[10] || (a[10] = (p) => r.target_route = p),
                class: "crm-input",
                placeholder: "knowledge/{id}"
              }, null, 512), [
                [B, r.target_route]
              ])
            ])) : C("", !0),
            o("label", lo, [
              a[40] || (a[40] = o("span", { class: "crm-field-label" }, "Cardinality", -1)),
              $(o("select", {
                "onUpdate:modelValue": a[11] || (a[11] = (p) => r.cardinality = p),
                class: "crm-input"
              }, [...a[39] || (a[39] = [
                o("option", { value: "one" }, "One item", -1),
                o("option", { value: "many" }, "Many items", -1)
              ])], 512), [
                [X, r.cardinality]
              ])
            ])
          ], 64)) : C("", !0),
          g.value ? (u(), m("label", so, [
            a[41] || (a[41] = o("span", { class: "crm-field-label" }, "Minimum", -1)),
            $(o("input", {
              "onUpdate:modelValue": a[12] || (a[12] = (p) => r.min = p),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [B, r.min]
            ])
          ])) : C("", !0),
          g.value ? (u(), m("label", uo, [
            a[42] || (a[42] = o("span", { class: "crm-field-label" }, "Maximum", -1)),
            $(o("input", {
              "onUpdate:modelValue": a[13] || (a[13] = (p) => r.max = p),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [B, r.max]
            ])
          ])) : C("", !0),
          a[54] || (a[54] = o("div", { class: "crm-form-section full" }, [
            o("strong", null, "Presentation"),
            o("span", null, "Declarative placement used by every CRM surface.")
          ], -1)),
          o("label", co, [
            a[44] || (a[44] = o("span", { class: "crm-field-label" }, "Detail section", -1)),
            $(o("select", {
              "onUpdate:modelValue": a[14] || (a[14] = (p) => r.ui_section = p),
              class: "crm-input"
            }, [...a[43] || (a[43] = [
              o("option", { value: "main" }, "Main details", -1),
              o("option", { value: "collapsed" }, "Collapsed details", -1),
              o("option", { value: "hidden" }, "Hidden", -1)
            ])], 512), [
              [X, r.ui_section]
            ])
          ]),
          o("label", bo, [
            a[46] || (a[46] = o("span", { class: "crm-field-label" }, "Width", -1)),
            $(o("select", {
              "onUpdate:modelValue": a[15] || (a[15] = (p) => r.ui_span = p),
              class: "crm-input"
            }, [...a[45] || (a[45] = [
              o("option", { value: 1 }, "Quarter", -1),
              o("option", { value: 2 }, "Half", -1),
              o("option", { value: 3 }, "Three quarters", -1),
              o("option", { value: 4 }, "Full", -1)
            ])], 512), [
              [
                X,
                r.ui_span,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          o("label", po, [
            a[48] || (a[48] = o("span", { class: "crm-field-label" }, "Semantic role", -1)),
            $(o("select", {
              "onUpdate:modelValue": a[16] || (a[16] = (p) => r.ui_role = p),
              class: "crm-input"
            }, [...a[47] || (a[47] = [
              o("option", { value: "" }, "Standard field", -1),
              o("option", { value: "title" }, "Record title", -1),
              o("option", { value: "subtitle" }, "Record subtitle", -1)
            ])], 512), [
              [X, r.ui_role]
            ])
          ]),
          o("label", mo, [
            a[49] || (a[49] = o("span", { class: "crm-field-label" }, "Position", -1)),
            $(o("input", {
              "onUpdate:modelValue": a[17] || (a[17] = (p) => r.sort_order = p),
              class: "crm-input",
              type: "number",
              min: "0",
              step: "10"
            }, null, 512), [
              [
                B,
                r.sort_order,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          o("label", fo, [
            $(o("input", {
              "onUpdate:modelValue": a[18] || (a[18] = (p) => r.ui_form = p),
              type: "checkbox"
            }, null, 512), [
              [ct, r.ui_form]
            ]),
            a[50] || (a[50] = o("span", null, [
              o("strong", null, "Show in forms"),
              o("small", null, "Available while creating or editing a record.")
            ], -1))
          ]),
          o("label", go, [
            $(o("input", {
              "onUpdate:modelValue": a[19] || (a[19] = (p) => r.ui_list = p),
              type: "checkbox"
            }, null, 512), [
              [ct, r.ui_list]
            ]),
            a[51] || (a[51] = o("span", null, [
              o("strong", null, "Show in default lists"),
              o("small", null, "Eligible for the default table columns.")
            ], -1))
          ]),
          o("label", yo, [
            $(o("input", {
              "onUpdate:modelValue": a[20] || (a[20] = (p) => r.required = p),
              type: "checkbox"
            }, null, 512), [
              [ct, r.required]
            ]),
            a[52] || (a[52] = o("span", null, [
              o("strong", null, "Required"),
              o("small", null, "Records cannot omit this value.")
            ], -1))
          ]),
          k.value ? (u(), m("label", vo, [
            $(o("input", {
              "onUpdate:modelValue": a[21] || (a[21] = (p) => r.unique = p),
              type: "checkbox"
            }, null, 512), [
              [ct, r.unique]
            ]),
            a[53] || (a[53] = o("span", null, [
              o("strong", null, "Unique"),
              o("small", null, "No two records may share it.")
            ], -1))
          ])) : C("", !0)
        ]),
        o("footer", ho, [
          o("button", {
            type: "button",
            class: "crm-button",
            onClick: D
          }, "Cancel"),
          o("button", {
            type: "button",
            class: "crm-button primary",
            disabled: t.busy || !L.value,
            onClick: q
          }, [
            w(y(S), {
              icon: t.busy ? "tabler:loader-2" : "tabler:check",
              class: G({ spin: t.busy })
            }, null, 8, ["icon", "class"]),
            I(_(t.busy ? "Saving…" : "Save"), 1)
          ], 8, ko)
        ])
      ]),
      _: 1
    }));
  }
}), wo = { class: "crm-dialog-head" }, xo = { class: "crm-dialog-body" }, $o = { class: "crm-field" }, So = { class: "crm-stage-editor" }, jo = ["onUpdate:modelValue"], Lo = ["disabled", "onClick"], _o = ["disabled", "onClick"], zo = ["onClick"], Po = { class: "crm-dialog-foot" }, Do = ["disabled"], Eo = /* @__PURE__ */ pt({
  __name: "SettingsPipelineDialog",
  props: {
    pipeline: {},
    objectLabel: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = Ot(n.pipeline || void 0), l = xt({
      label: n.pipeline?.label || `${n.objectLabel} Pipeline`,
      collection_id: n.pipeline?.collection_id || `${n.selected}_pipeline`,
      stages: s.length ? s.map((g) => ({ ...g })) : [{ stage_id: "new", label: "New", order: 10 }, { stage_id: "won", label: "Won", order: 20 }, { stage_id: "lost", label: "Lost", order: 30 }]
    }), x = () => i("close"), v = { content: { class: "crm-dialog-content" } };
    function r(g, k) {
      const L = g + k;
      if (L < 0 || L >= l.stages.length) return;
      const [D] = l.stages.splice(g, 1);
      l.stages.splice(L, 0, D);
    }
    function h() {
      l.stages.push({ stage_id: "", label: "", order: (l.stages.length + 1) * 10 });
    }
    function f() {
      l.stages.some((g) => g.label.trim()) && i("save", { label: l.label.trim(), collection_id: l.collection_id, stages: l.stages });
    }
    return (g, k) => (u(), T(y(gt), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: v,
      "aria-label": "Pipeline stages",
      "onUpdate:visible": k[1] || (k[1] = (L) => {
        L || x();
      })
    }, {
      default: Z(() => [
        o("header", wo, [
          k[2] || (k[2] = o("div", null, [
            o("h2", null, "Pipeline stages"),
            o("p", null, "The stages shown in board view.")
          ], -1)),
          o("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: x
          }, [
            w(y(S), { icon: "tabler:x" })
          ])
        ]),
        o("div", xo, [
          o("label", $o, [
            k[3] || (k[3] = o("span", { class: "crm-field-label" }, "Pipeline name", -1)),
            $(o("input", {
              "onUpdate:modelValue": k[0] || (k[0] = (L) => l.label = L),
              class: "crm-input"
            }, null, 512), [
              [B, l.label]
            ])
          ]),
          o("div", So, [
            (u(!0), m(K, null, Q(l.stages, (L, D) => (u(), m("div", { key: D }, [
              w(y(S), { icon: "tabler:grip-vertical" }),
              $(o("input", {
                "onUpdate:modelValue": (A) => L.label = A,
                class: "crm-input",
                placeholder: "Stage name"
              }, null, 8, jo), [
                [B, L.label]
              ]),
              o("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: D === 0,
                "aria-label": "Move up",
                onClick: (A) => r(D, -1)
              }, [
                w(y(S), { icon: "tabler:arrow-up" })
              ], 8, Lo),
              o("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: D === l.stages.length - 1,
                "aria-label": "Move down",
                onClick: (A) => r(D, 1)
              }, [
                w(y(S), { icon: "tabler:arrow-down" })
              ], 8, _o),
              o("button", {
                type: "button",
                class: "crm-icon-button danger",
                "aria-label": "Remove stage",
                onClick: (A) => l.stages.splice(D, 1)
              }, [
                w(y(S), { icon: "tabler:x" })
              ], 8, zo)
            ]))), 128)),
            o("button", {
              type: "button",
              class: "crm-button",
              onClick: h
            }, [
              w(y(S), { icon: "tabler:plus" }),
              k[4] || (k[4] = I("Add stage", -1))
            ])
          ])
        ]),
        o("footer", Po, [
          o("button", {
            type: "button",
            class: "crm-button",
            onClick: x
          }, "Cancel"),
          o("button", {
            type: "button",
            class: "crm-button primary",
            disabled: t.busy,
            onClick: f
          }, [
            w(y(S), {
              icon: t.busy ? "tabler:loader-2" : "tabler:check",
              class: G({ spin: t.busy })
            }, null, 8, ["icon", "class"]),
            I(_(t.busy ? "Saving…" : "Save"), 1)
          ], 8, Do)
        ])
      ]),
      _: 1
    }));
  }
}), Io = {
  key: 0,
  class: "crm-state"
}, Bo = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, Ao = {
  key: 2,
  class: "crm-settings"
}, Oo = { class: "crm-page-head" }, Mo = { class: "crm-page-actions" }, Fo = {
  key: 0,
  class: "crm-pill"
}, To = ["disabled"], Ro = {
  key: 1,
  class: "crm-button"
}, Vo = { class: "crm-settings-layout" }, Uo = { class: "crm-settings-objects" }, No = ["onClick"], Ho = { class: "crm-object-icon" }, Wo = {
  key: 0,
  class: "crm-settings-main"
}, Ko = { class: "crm-settings-title" }, qo = { class: "crm-object-icon large" }, Zo = { class: "crm-card" }, Yo = { class: "crm-card-head" }, Xo = { class: "crm-field-list" }, Go = { key: 0 }, Jo = { key: 1 }, Qo = { class: "crm-type-badge" }, tr = { key: 0 }, er = { key: 1 }, nr = { key: 2 }, or = { class: "crm-type-badge" }, rr = { class: "crm-row-actions" }, ar = ["onClick"], ir = ["onClick"], lr = { class: "crm-card" }, sr = { class: "crm-card-head" }, dr = {
  key: 0,
  class: "crm-pipeline-preview"
}, ur = {
  key: 1,
  class: "crm-card-empty"
}, cr = { class: "crm-card" }, br = { class: "crm-setting-line" }, pr = ["disabled"], mr = {
  key: 1,
  class: "crm-settings-main crm-settings-empty"
}, fr = { class: "crm-empty-icon" }, Cr = /* @__PURE__ */ pt({
  __name: "CrmSettings",
  props: {
    crmId: {},
    initial: {},
    canWrite: { type: Boolean, default: !0 }
  },
  emits: ["changed"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = V(n.initial || null), l = V(""), x = V(!0), v = V(""), r = V(!1), h = V(""), f = V(null), g = V(null), k = V(365), L = V(""), D = W(() => s.value?.objects.find((b) => b.type === l.value)), A = W(() => St(s.value?.attributes || [], l.value)), N = W(() => D.value ? re(s.value?.pipelines || [], D.value) : void 0);
    async function et(b = l.value) {
      x.value = !0, v.value = "";
      try {
        const d = n.crmId || s.value?.crm_id || "", [c, j, z] = await Promise.all([ae(d), ie(), le(d)]);
        if ("provisioned" in z) throw new Error("No CRM workspace has been created yet.");
        L.value = c.revision;
        const F = { success: !0, crm_id: d, workspace_label: z.workspace_label, can_write: n.canWrite, ...c.declaration };
        s.value = F, k.value = Number(j.thread_event_retention_days || 365), l.value = F.objects.some((ot) => ot.type === b) ? b : F.objects[0]?.type || "", i("changed", F);
      } catch (d) {
        v.value = H(d, "CRM settings could not load.");
      } finally {
        x.value = !1;
      }
    }
    function q() {
      h.value = "", f.value = null, g.value = null;
    }
    function R(b) {
      f.value = b || null, h.value = "object";
    }
    function a(b) {
      g.value = b || null, h.value = "field";
    }
    function p() {
      h.value = "pipeline";
    }
    function Y() {
      if (!s.value) return { objects: [], attributes: [], pipelines: [], views: [] };
      const b = s.value;
      return {
        version: b.version,
        objects: b.objects,
        attributes: b.attributes,
        pipelines: b.pipelines,
        views: b.views,
        policies: b.policies,
        merge_config: b.merge_config
      };
    }
    async function nt(b) {
      const d = s.value;
      if (!d) throw new Error("CRM settings are not loaded.");
      const c = d.crm_id, j = await ce(c, L.value, b);
      L.value = j.revision;
      const z = { success: !0, crm_id: c, workspace_label: d.workspace_label, can_write: n.canWrite, ...j.declaration };
      return s.value = z, l.value = z.objects.some((F) => F.type === l.value) ? l.value : z.objects[0]?.type || "", i("changed", z), j;
    }
    async function qt(b) {
      const d = f.value?.type || tt(b.type || b.label);
      if (d) {
        r.value = !0;
        try {
          const c = Y(), j = { ...f.value || {}, type: d, label: b.label, icon: b.icon || void 0 }, z = [...c.objects.filter((ot) => ot.type !== d), j];
          let F = c.attributes;
          if (!f.value) {
            const ot = tt(b.titleLabel);
            F = [...F, { object_type: d, attr: ot, data_type: "text", label: b.titleLabel, sort_order: 10, system: !0, config: { ui: { role: "title", section: "main", span: 4, list: !0, form: !0 } } }];
          }
          await nt({ ...c, objects: z, attributes: F }), E.toast({ severity: "success", summary: f.value ? "Object updated" : "Object created", detail: b.label }), q(), l.value = d;
        } catch (c) {
          E.toast({ severity: "error", summary: "Could not save object", detail: H(c, "CRM write failed.") });
        } finally {
          r.value = !1;
        }
      }
    }
    async function Zt() {
      const b = D.value;
      if (!(!b || !await E.confirm({ header: `Delete ${b.label}`, message: "Delete this object, all of its fields, pipeline, views, and records? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete object", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const c = Y(), j = [
            ...c.pipelines.filter((z) => z.object_type === b.type).map((z) => ({ kind: "pipeline", id: z.collection_id })),
            ...c.views.filter((z) => z.object_type === b.type).map((z) => ({ kind: "view", id: z.view_id }))
          ];
          await nt({ ...c, remove: { objects: [{ object_id: b.id || b.type }], ...j.length ? { declarations: j } : {} } }), E.toast({ severity: "success", summary: "Object deleted", detail: b.label });
        } catch (c) {
          E.toast({ severity: "error", summary: "Could not delete object", detail: H(c, "CRM write failed.") });
        }
    }
    async function Yt(b) {
      if (b.attr) {
        r.value = !0;
        try {
          const d = Y(), c = { object_type: l.value, attr: b.attr, data_type: b.data_type, label: b.label, config: b.config, sort_order: b.sort_order || (A.value.length + 1) * 10, system: g.value?.system === !0 };
          await nt({ ...d, attributes: [...d.attributes.filter((j) => !(j.object_type === l.value && j.attr === b.attr)), c] }), E.toast({ severity: "success", summary: g.value ? "Field updated" : "Field created", detail: b.label }), q();
        } catch (d) {
          E.toast({ severity: "error", summary: "Could not save field", detail: H(d, "CRM write failed.") });
        } finally {
          r.value = !1;
        }
      }
    }
    async function Xt(b) {
      if (!(b.system || !await E.confirm({ header: `Delete ${b.label}`, message: "Delete this field and its stored values? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete field", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const c = Y();
          await nt({ ...c, remove: { attributes: [{ object_id: D.value?.id || l.value, field_id: b.id || b.attr }] } }), E.toast({ severity: "success", summary: "Field deleted", detail: b.label });
        } catch (c) {
          E.toast({ severity: "error", summary: "Could not delete field", detail: H(c, "CRM write failed.") });
        }
    }
    async function Gt(b) {
      r.value = !0;
      try {
        const d = b.stages.filter((z) => z.label.trim()).map((z, F) => ({ ...z, stage_id: tt(z.stage_id || z.label), label: z.label.trim(), order: (F + 1) * 10 })), c = Y(), j = { collection_id: b.collection_id, object_type: l.value, label: b.label, stages: d };
        await nt({ ...c, pipelines: [...c.pipelines.filter((z) => z.collection_id !== b.collection_id), j] }), E.toast({ severity: "success", summary: "Pipeline saved", detail: b.label }), q();
      } catch (d) {
        E.toast({ severity: "error", summary: "Could not save pipeline", detail: H(d, "CRM write failed.") });
      } finally {
        r.value = !1;
      }
    }
    async function Jt() {
      try {
        await se("thread_event_retention_days", k.value), E.toast({ severity: "success", summary: "Retention saved", detail: `${k.value} days` });
      } catch (b) {
        E.toast({ severity: "error", summary: "Could not save retention", detail: H(b, "Setting write failed.") });
      }
    }
    async function Qt(b) {
      const d = b.target, c = d.files?.[0];
      if (c && s.value)
        try {
          const j = await de(s.value.crm_id, L.value, JSON.parse(await c.text()));
          E.toast({ severity: "success", summary: "Configuration imported", detail: j.changed ? "The CRM schema was updated." : "The CRM schema was already current." }), await et(l.value);
        } catch (j) {
          E.toast({ severity: "error", summary: "Import failed", detail: H(j, "Configuration import failed.") });
        }
      d.value = "";
    }
    async function te() {
      if (s.value) {
        r.value = !0;
        try {
          const b = await ue(s.value.crm_id), d = new Blob([JSON.stringify(b, null, 2)], { type: "application/json" }), c = URL.createObjectURL(d), j = document.createElement("a");
          j.href = c, j.download = `crm-config-${s.value.crm_id}.json`, document.body.appendChild(j), j.click(), j.remove(), URL.revokeObjectURL(c), E.toast({ severity: "success", summary: "Configuration exported", detail: "Downloaded schema JSON" });
        } catch (b) {
          E.toast({ severity: "error", summary: "Export failed", detail: H(b, "Configuration export failed.") });
        } finally {
          r.value = !1;
        }
      }
    }
    return At(() => et()), (b, d) => x.value ? (u(), m("div", Io, [
      w(y(S), {
        icon: "tabler:loader-2",
        class: "spin"
      }),
      d[6] || (d[6] = I(" Loading CRM settings…", -1))
    ])) : v.value ? (u(), m("div", Bo, [
      w(y(S), { icon: "tabler:alert-circle" }),
      o("div", null, [
        d[7] || (d[7] = o("strong", null, "Settings could not load", -1)),
        o("span", null, _(v.value), 1)
      ]),
      o("button", {
        class: "crm-button",
        onClick: d[0] || (d[0] = (c) => et())
      }, "Try again")
    ])) : s.value ? (u(), m("section", Ao, [
      o("header", Oo, [
        d[12] || (d[12] = o("div", null, [
          o("span", { class: "crm-eyebrow" }, "CRM control"),
          o("h1", null, "Data model"),
          o("p", null, "Objects, fields, relationships, and pipelines.")
        ], -1)),
        o("div", Mo, [
          t.canWrite ? C("", !0) : (u(), m("span", Fo, [
            w(y(S), { icon: "tabler:eye" }),
            d[8] || (d[8] = I("Read-only", -1))
          ])),
          o("button", {
            class: "crm-button",
            disabled: r.value,
            onClick: te
          }, [
            w(y(S), { icon: "tabler:download" }),
            d[9] || (d[9] = I("Export JSON", -1))
          ], 8, To),
          t.canWrite ? (u(), m("label", Ro, [
            w(y(S), { icon: "tabler:upload" }),
            d[10] || (d[10] = I("Import JSON", -1)),
            o("input", {
              class: "crm-file-input",
              type: "file",
              accept: "application/json,.json",
              onChange: Qt
            }, null, 32)
          ])) : C("", !0),
          t.canWrite ? (u(), m("button", {
            key: 2,
            class: "crm-button primary",
            onClick: d[1] || (d[1] = (c) => R())
          }, [
            w(y(S), { icon: "tabler:plus" }),
            d[11] || (d[11] = I("New object", -1))
          ])) : C("", !0)
        ])
      ]),
      o("div", Vo, [
        o("aside", Uo, [
          (u(!0), m(K, null, Q(s.value.objects, (c) => (u(), m("button", {
            key: c.type,
            class: G({ active: l.value === c.type }),
            onClick: (j) => l.value = c.type
          }, [
            o("span", Ho, [
              w(y(S), {
                icon: c.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            o("span", null, [
              o("strong", null, _(c.label), 1),
              o("small", null, _(y(St)(s.value.attributes, c.type).length) + " fields", 1)
            ]),
            w(y(S), { icon: "tabler:chevron-right" })
          ], 10, No))), 128))
        ]),
        D.value ? (u(), m("main", Wo, [
          o("section", Ko, [
            o("span", qo, [
              w(y(S), {
                icon: D.value.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            o("div", null, [
              d[13] || (d[13] = o("span", null, "Object", -1)),
              o("h2", null, _(D.value.label), 1),
              o("code", null, _(D.value.type), 1)
            ]),
            t.canWrite ? (u(), m(K, { key: 0 }, [
              o("button", {
                class: "crm-button",
                onClick: d[2] || (d[2] = (c) => R(D.value))
              }, [
                w(y(S), { icon: "tabler:edit" }),
                d[14] || (d[14] = I("Edit", -1))
              ]),
              o("button", {
                class: "crm-button danger-text",
                onClick: Zt
              }, [
                w(y(S), { icon: "tabler:trash" }),
                d[15] || (d[15] = I("Delete", -1))
              ])
            ], 64)) : C("", !0)
          ]),
          o("section", Zo, [
            o("header", Yo, [
              o("div", null, [
                d[16] || (d[16] = o("h2", null, "Fields and relationships", -1)),
                o("p", null, _(A.value.length) + " fields define records of this type.", 1)
              ]),
              t.canWrite ? (u(), m("button", {
                key: 0,
                class: "crm-button primary",
                onClick: d[3] || (d[3] = (c) => a())
              }, [
                w(y(S), { icon: "tabler:plus" }),
                d[17] || (d[17] = I("New field", -1))
              ])) : C("", !0)
            ]),
            o("div", Xo, [
              d[18] || (d[18] = o("div", { class: "crm-field-row header" }, [
                o("span", null, "Field"),
                o("span", null, "API name"),
                o("span", null, "Type"),
                o("span", null, "Placement"),
                o("span")
              ], -1)),
              (u(!0), m(K, null, Q(A.value, (c) => (u(), m("div", {
                key: c.attr,
                class: "crm-field-row"
              }, [
                o("span", null, [
                  o("strong", null, _(c.label), 1),
                  c.config?.required ? (u(), m("small", Go, "Required")) : C("", !0),
                  c.system ? (u(), m("small", Jo, "System")) : C("", !0)
                ]),
                o("code", null, _(c.attr), 1),
                o("span", Qo, [
                  I(_(c.data_type.replace("_", " ")), 1),
                  c.config?.target?.kind === "record" ? (u(), m("small", tr, "→ " + _(c.config.target.object_type), 1)) : c.config?.target?.kind === "component" ? (u(), m("small", er, "→ " + _(c.config.target.class), 1)) : c.config?.target?.kind === "principal" ? (u(), m("small", nr, "→ directory")) : C("", !0)
                ]),
                o("span", or, [
                  I(_(c.config?.ui?.section || "main"), 1),
                  o("small", null, _(c.config?.ui?.span || 2) + "/4", 1)
                ]),
                o("span", rr, [
                  t.canWrite ? (u(), m("button", {
                    key: 0,
                    class: "crm-icon-button",
                    "aria-label": "Edit field",
                    onClick: (j) => a(c)
                  }, [
                    w(y(S), { icon: "tabler:edit" })
                  ], 8, ar)) : C("", !0),
                  t.canWrite && !c.system ? (u(), m("button", {
                    key: 1,
                    class: "crm-icon-button danger",
                    "aria-label": "Delete field",
                    onClick: (j) => Xt(c)
                  }, [
                    w(y(S), { icon: "tabler:trash" })
                  ], 8, ir)) : C("", !0)
                ])
              ]))), 128))
            ])
          ]),
          o("section", lr, [
            o("header", sr, [
              o("div", null, [
                d[19] || (d[19] = o("h2", null, "Pipeline", -1)),
                o("p", null, _(N.value ? N.value.label : "Optional stages for a board view."), 1)
              ]),
              t.canWrite ? (u(), m("button", {
                key: 0,
                class: "crm-button",
                onClick: p
              }, [
                w(y(S), {
                  icon: N.value ? "tabler:edit" : "tabler:plus"
                }, null, 8, ["icon"]),
                I(_(N.value ? "Edit stages" : "Add pipeline"), 1)
              ])) : C("", !0)
            ]),
            N.value ? (u(), m("div", dr, [
              (u(!0), m(K, null, Q(y(Ot)(N.value), (c) => (u(), m("span", {
                key: c.stage_id
              }, _(c.label), 1))), 128))
            ])) : (u(), m("div", ur, [
              w(y(S), { icon: "tabler:layout-kanban" }),
              d[20] || (d[20] = o("span", null, "No pipeline is configured for this object.", -1))
            ]))
          ]),
          o("section", cr, [
            d[23] || (d[23] = o("header", { class: "crm-card-head" }, [
              o("div", null, [
                o("h2", null, "Retention"),
                o("p", null, "How long CRM thread events remain available.")
              ])
            ], -1)),
            o("div", br, [
              d[21] || (d[21] = o("label", null, "Event retention", -1)),
              $(o("input", {
                "onUpdate:modelValue": d[4] || (d[4] = (c) => k.value = c),
                class: "crm-input short",
                type: "number",
                min: "1",
                disabled: !t.canWrite
              }, null, 8, pr), [
                [
                  B,
                  k.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              d[22] || (d[22] = o("span", null, "days", -1)),
              t.canWrite ? (u(), m("button", {
                key: 0,
                class: "crm-button",
                onClick: Jt
              }, "Save")) : C("", !0)
            ])
          ])
        ])) : (u(), m("main", mr, [
          o("span", fr, [
            w(y(S), { icon: "tabler:database-plus" })
          ]),
          d[25] || (d[25] = o("h2", null, "No objects yet", -1)),
          d[26] || (d[26] = o("p", null, "Define a record type and its title field to begin building this CRM.", -1)),
          t.canWrite ? (u(), m("button", {
            key: 0,
            class: "crm-button primary",
            onClick: d[5] || (d[5] = (c) => R())
          }, [
            w(y(S), { icon: "tabler:plus" }),
            d[24] || (d[24] = I("New object", -1))
          ])) : C("", !0)
        ]))
      ]),
      h.value === "object" ? (u(), T(Nn, {
        key: 0,
        object: f.value,
        busy: r.value,
        onClose: q,
        onSave: qt
      }, null, 8, ["object", "busy"])) : h.value === "field" ? (u(), T(Co, {
        key: 1,
        field: g.value,
        objects: s.value.objects,
        selected: l.value,
        busy: r.value,
        onClose: q,
        onSave: Yt
      }, null, 8, ["field", "objects", "selected", "busy"])) : h.value === "pipeline" ? (u(), T(Eo, {
        key: 2,
        pipeline: N.value,
        "object-label": D.value?.label || "CRM",
        selected: l.value,
        busy: r.value,
        onClose: q,
        onSave: Gt
      }, null, 8, ["pipeline", "object-label", "selected", "busy"])) : C("", !0)
    ])) : C("", !0);
  }
});
export {
  Cr as _,
  gt as s
};
//# sourceMappingURL=CrmSettings.vue_vue_type_script_setup_true_lang-Bb0D-vhh.js.map
