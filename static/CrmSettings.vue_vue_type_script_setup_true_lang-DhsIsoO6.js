import { openBlock as c, createElementBlock as m, mergeProps as z, createElementVNode as o, renderSlot as T, createTextVNode as B, toDisplayString as j, resolveComponent as vt, resolveDirective as Ut, withDirectives as $, createBlock as U, resolveDynamicComponent as jt, withCtx as G, createCommentVNode as h, normalizeClass as tt, computed as K, createVNode as w, Transition as ne, Fragment as q, defineComponent as ht, reactive as Dt, onMounted as Nt, unref as v, withKeys as oe, vModelText as A, renderList as Q, vModelSelect as X, vModelCheckbox as yt, ref as H } from "vue";
import { Icon as S } from "@iconify/vue";
import { loadByTagName as re, host as I } from "@wippy-fe/proxy";
import { G as rt, y as Ht, o as It, q as ie, Z as ae, _ as le, b as se, m as Z, $ as de, a0 as ue, a1 as ce, a2 as be } from "./crm-model-BAtPi1Pd.js";
import { s as kt, B as Ct, b as Wt, c as Kt, d as Et, f as dt, R as qt, L as pe, e as ot, v as st, g as me, U as fe, I as Bt, h as ge, r as Zt, i as ye, j as ve, k as he, C as ke, m as Ce, S as we, _ as xe, x as St, n as $e } from "./wc-runtime-Be-ICKk2.js";
var Yt = {
  name: "TimesIcon",
  extends: kt
};
function Se(t) {
  return Pe(t) || Le(t) || _e(t) || je();
}
function je() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _e(t, e) {
  if (t) {
    if (typeof t == "string") return _t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(t, e) : void 0;
  }
}
function Le(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Pe(t) {
  if (Array.isArray(t)) return _t(t);
}
function _t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ze(t, e, n, i, s, a) {
  return c(), m("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Se(e[0] || (e[0] = [o("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Yt.render = ze;
var Xt = {
  name: "WindowMaximizeIcon",
  extends: kt
};
function De(t) {
  return Ae(t) || Be(t) || Ie(t) || Ee();
}
function Ee() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ie(t, e) {
  if (t) {
    if (typeof t == "string") return Lt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(t, e) : void 0;
  }
}
function Be(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ae(t) {
  if (Array.isArray(t)) return Lt(t);
}
function Lt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Oe(t, e, n, i, s, a) {
  return c(), m("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), De(e[0] || (e[0] = [o("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xt.render = Oe;
var Gt = {
  name: "WindowMinimizeIcon",
  extends: kt
};
function Me(t) {
  return Ve(t) || Re(t) || Te(t) || Fe();
}
function Fe() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Te(t, e) {
  if (t) {
    if (typeof t == "string") return Pt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(t, e) : void 0;
  }
}
function Re(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ve(t) {
  if (Array.isArray(t)) return Pt(t);
}
function Pt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Ue(t, e, n, i, s, a) {
  return c(), m("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Me(e[0] || (e[0] = [o("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Gt.render = Ue;
var Jt = {
  name: "SpinnerIcon",
  extends: kt
};
function Ne(t) {
  return qe(t) || Ke(t) || We(t) || He();
}
function He() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function We(t, e) {
  if (t) {
    if (typeof t == "string") return zt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(t, e) : void 0;
  }
}
function Ke(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function qe(t) {
  if (Array.isArray(t)) return zt(t);
}
function zt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Ze(t, e, n, i, s, a) {
  return c(), m("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ne(e[0] || (e[0] = [o("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jt.render = Ze;
var Ye = `
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
`, Xe = {
  root: function(e) {
    var n = e.props, i = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Kt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Wt(n.value) && !i.$slots.default,
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
}, Ge = Ct.extend({
  name: "badge",
  style: Ye,
  classes: Xe
}), Je = {
  name: "BaseBadge",
  extends: Et,
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
  style: Ge,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
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
function At(t, e, n) {
  return (e = Qe(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Qe(t) {
  var e = tn(t, "string");
  return ut(e) == "symbol" ? e : e + "";
}
function tn(t, e) {
  if (ut(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ut(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qt = {
  name: "Badge",
  extends: Je,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return dt(At(At({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, en = ["data-p"];
function nn(t, e, n, i, s, a) {
  return c(), m("span", z({
    class: t.cx("root"),
    "data-p": a.dataP
  }, t.ptmi("root")), [T(t.$slots, "default", {}, function() {
    return [B(j(t.value), 1)];
  })], 16, en);
}
Qt.render = nn;
var on = `
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
function ct(t) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ct(t);
}
function W(t, e, n) {
  return (e = rn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function rn(t) {
  var e = an(t, "string");
  return ct(e) == "symbol" ? e : e + "";
}
function an(t, e) {
  if (ct(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ct(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ln = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-button p-component", W(W(W(W(W(W(W(W(W({
      "p-button-icon-only": n.hasIcon && !i.label && !i.badge,
      "p-button-vertical": (i.iconPos === "top" || i.iconPos === "bottom") && i.label,
      "p-button-loading": i.loading,
      "p-button-link": i.link || i.variant === "link"
    }, "p-button-".concat(i.severity), i.severity), "p-button-raised", i.raised), "p-button-rounded", i.rounded), "p-button-text", i.text || i.variant === "text"), "p-button-outlined", i.outlined || i.variant === "outlined"), "p-button-sm", i.size === "small"), "p-button-lg", i.size === "large"), "p-button-plain", i.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", W({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, sn = Ct.extend({
  name: "button",
  style: on,
  classes: ln
}), dn = {
  name: "BaseButton",
  extends: Et,
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
  style: sn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function bt(t) {
  "@babel/helpers - typeof";
  return bt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, bt(t);
}
function F(t, e, n) {
  return (e = un(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function un(t) {
  var e = cn(t, "string");
  return bt(e) == "symbol" ? e : e + "";
}
function cn(t, e) {
  if (bt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (bt(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var te = {
  name: "Button",
  extends: dn,
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
      return z(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Wt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return dt(F(F(F(F(F(F(F(F(F(F({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return dt(F(F({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return dt(F(F({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Jt,
    Badge: Qt
  },
  directives: {
    ripple: qt
  }
}, bn = ["data-p"], pn = ["data-p"];
function mn(t, e, n, i, s, a) {
  var x = vt("SpinnerIcon"), k = vt("Badge"), g = Ut("ripple");
  return t.asChild ? T(t.$slots, "default", {
    key: 1,
    class: tt(t.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : $((c(), U(jt(t.as), z({
    key: 0,
    class: t.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: G(function() {
      return [T(t.$slots, "default", {}, function() {
        return [t.loading ? T(t.$slots, "loadingicon", z({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (c(), m("span", z({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (c(), U(x, z({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : T(t.$slots, "icon", z({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (c(), m("span", z({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": a.dataIconP
          }, t.ptm("icon")), null, 16, bn)) : h("", !0)];
        }), t.label ? (c(), m("span", z({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": a.dataLabelP
        }), j(t.label), 17, pn)) : h("", !0), t.badge ? (c(), U(k, {
          key: 3,
          value: t.badge,
          class: tt(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : h("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[g]]);
}
te.render = mn;
var fn = Ct.extend({
  name: "focustrap-directive"
}), gn = me.extend({
  style: fn
});
function pt(t) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, pt(t);
}
function Ot(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Mt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ot(Object(n), !0).forEach(function(i) {
      yn(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function yn(t, e, n) {
  return (e = vn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function vn(t) {
  var e = hn(t, "string");
  return pt(e) == "symbol" ? e : e + "";
}
function hn(t, e) {
  if (pt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (pt(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var kn = gn.extend("focustrap", {
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
      var i = this, s = n.value || {}, a = s.onFocusIn, x = s.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(k) {
        k.forEach(function(g) {
          if (g.type === "childList" && !e.contains(document.activeElement)) {
            var l = function(y) {
              var C = Bt(y) ? Bt(y, i.getComputedSelector(e.$_pfocustrap_focusableselector)) ? y : st(e, i.getComputedSelector(e.$_pfocustrap_focusableselector)) : st(y);
              return Kt(C) ? C : y.nextSibling && l(y.nextSibling);
            };
            ot(l(g.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(k) {
        return a && a(k);
      }, e.$_pfocustrap_focusoutlistener = function(k) {
        return x && x(k);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Mt(Mt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var i = n.value || {}, s = i.autoFocusSelector, a = s === void 0 ? "" : s, x = i.firstFocusableSelector, k = x === void 0 ? "" : x, g = i.autoFocus, l = g === void 0 ? !1 : g, f = st(e, "[autofocus]".concat(this.getComputedSelector(a)));
      l && !f && (f = st(e, this.getComputedSelector(k))), ot(f);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, i = e.currentTarget, s = e.relatedTarget, a = s === i.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? st(i.parentElement, this.getComputedSelector(i.$_pfocustrap_focusableselector)) : i.$_pfocustrap_lasthiddenfocusableelement;
      ot(a);
    },
    onLastHiddenElementFocus: function(e) {
      var n, i = e.currentTarget, s = e.relatedTarget, a = s === i.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? pe(i.parentElement, this.getComputedSelector(i.$_pfocustrap_focusableselector)) : i.$_pfocustrap_firsthiddenfocusableelement;
      ot(a);
    },
    createHiddenFocusableElements: function(e, n) {
      var i = this, s = n.value || {}, a = s.tabIndex, x = a === void 0 ? 0 : a, k = s.firstFocusableSelector, g = k === void 0 ? "" : k, l = s.lastFocusableSelector, f = l === void 0 ? "" : l, y = function(D) {
        return fe("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: x,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: D?.bind(i)
        });
      }, C = y(this.onFirstHiddenElementFocus), L = y(this.onLastHiddenElementFocus);
      C.$_pfocustrap_lasthiddenfocusableelement = L, C.$_pfocustrap_focusableselector = g, C.setAttribute("data-pc-section", "firstfocusableelement"), L.$_pfocustrap_firsthiddenfocusableelement = C, L.$_pfocustrap_focusableselector = f, L.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(C), e.append(L);
    }
  }
});
function Ft() {
  ye({
    variableName: Zt("scrollbar.width").name
  });
}
function Tt() {
  ge({
    variableName: Zt("scrollbar.width").name
  });
}
var Cn = `
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
`, wn = {
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
}, xn = {
  mask: function(e) {
    var n = e.props, i = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], s = i.find(function(a) {
      return a === n.position;
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
}, $n = Ct.extend({
  name: "dialog",
  style: Cn,
  classes: xn,
  inlineStyles: wn
}), Sn = {
  name: "BaseDialog",
  extends: Et,
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
  style: $n,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, wt = {
  name: "Dialog",
  extends: Sn,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: K(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && St.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && St.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && $e(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), ot(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && St.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
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
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && ot(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? Ft() : Tt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Ft();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Tt();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", xe(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
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
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && we(document.body, {
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
          var i = he(e.container), s = ke(e.container), a = n.pageX - e.lastPageX, x = n.pageY - e.lastPageY, k = e.container.getBoundingClientRect(), g = k.left + a, l = k.top + x, f = Ce(), y = getComputedStyle(e.container), C = parseFloat(y.marginLeft), L = parseFloat(y.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (g >= e.minX && g + i < f.width && (e.lastPageX = n.pageX, e.container.style.left = g - C + "px"), l >= e.minY && l + s < f.height && (e.lastPageY = n.pageY, e.container.style.top = l - L + "px")) : (e.lastPageX = n.pageX, e.container.style.left = g - C + "px", e.lastPageY = n.pageY, e.container.style.top = l - L + "px");
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
      return dt({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: qt,
    focustrap: kn
  },
  components: {
    Button: te,
    Portal: ve,
    WindowMinimizeIcon: Gt,
    WindowMaximizeIcon: Xt,
    TimesIcon: Yt
  }
};
function mt(t) {
  "@babel/helpers - typeof";
  return mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, mt(t);
}
function Rt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Vt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Rt(Object(n), !0).forEach(function(i) {
      jn(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function jn(t, e, n) {
  return (e = _n(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _n(t) {
  var e = Ln(t, "string");
  return mt(e) == "symbol" ? e : e + "";
}
function Ln(t, e) {
  if (mt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (mt(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Pn = ["data-p"], zn = ["aria-labelledby", "aria-modal", "data-p"], Dn = ["id"], En = ["data-p"];
function In(t, e, n, i, s, a) {
  var x = vt("Button"), k = vt("Portal"), g = Ut("focustrap");
  return c(), U(k, {
    appendTo: t.appendTo
  }, {
    default: G(function() {
      return [s.containerVisible ? (c(), m("div", z({
        key: 0,
        ref: a.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, t.ptm("mask")), [w(ne, z({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: G(function() {
          return [t.visible ? $((c(), m("div", z({
            key: 0,
            ref: a.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": a.dataP
          }, t.ptmi("root")), [t.$slots.container ? T(t.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(f) {
              return a.maximize(f);
            },
            initDragCallback: a.initDrag
          }) : (c(), m(q, {
            key: 1
          }, [t.showHeader ? (c(), m("div", z({
            key: 0,
            ref: a.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, t.ptm("header")), [T(t.$slots, "header", {
            class: tt(t.cx("title"))
          }, function() {
            return [t.header ? (c(), m("span", z({
              key: 0,
              id: a.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), j(t.header), 17, Dn)) : h("", !0)];
          }), o("div", z({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? T(t.$slots, "maximizebutton", {
            key: 0,
            maximized: s.maximized,
            maximizeCallback: function(f) {
              return a.maximize(f);
            }
          }, function() {
            return [w(x, z({
              ref: a.maximizableRef,
              autofocus: s.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: G(function(l) {
                return [T(t.$slots, "maximizeicon", {
                  maximized: s.maximized
                }, function() {
                  return [(c(), U(jt(a.maximizeIconComponent), z({
                    class: [l.class, s.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : h("", !0), t.closable ? T(t.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [w(x, z({
              ref: a.closeButtonRef,
              autofocus: s.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: G(function(l) {
                return [T(t.$slots, "closeicon", {}, function() {
                  return [(c(), U(jt(t.closeIcon ? "span" : "TimesIcon"), z({
                    class: [t.closeIcon, l.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : h("", !0)], 16)], 16)) : h("", !0), o("div", z({
            ref: a.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": a.dataP
          }, Vt(Vt({}, t.contentProps), t.ptm("content"))), [T(t.$slots, "default")], 16, En), t.footer || t.$slots.footer ? (c(), m("div", z({
            key: 1,
            ref: a.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [T(t.$slots, "footer", {}, function() {
            return [B(j(t.footer), 1)];
          })], 16)) : h("", !0)], 64))], 16, zn)), [[g, {
            disabled: !t.modal
          }]]) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Pn)) : h("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
wt.render = In;
const Bn = { class: "crm-dialog-head" }, An = { class: "crm-dialog-body crm-form-grid" }, On = { class: "crm-field" }, Mn = { class: "crm-field" }, Fn = ["disabled", "placeholder"], Tn = {
  key: 0,
  class: "crm-field full"
}, Rn = { class: "crm-field full" }, Vn = ["value"], Un = { class: "crm-dialog-foot" }, Nn = ["disabled"], Hn = /* @__PURE__ */ ht({
  __name: "SettingsObjectDialog",
  props: {
    object: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = Dt({ label: n.object?.label || "", type: n.object?.type || "", icon: n.object?.icon || "tabler:category", titleLabel: "" }), a = () => i("close"), x = { content: { class: "crm-dialog-content" } };
    Nt(() => re("wc-icon-picker", { timeoutMs: 8e3 }));
    function k(l) {
      const f = l.detail;
      typeof f == "string" && (s.icon = f);
    }
    function g() {
      s.label.trim() && (!n.object && !s.titleLabel.trim() || i("save", { label: s.label.trim(), type: s.type.trim(), icon: s.icon.trim() || "tabler:category", titleLabel: s.titleLabel.trim() }));
    }
    return (l, f) => (c(), U(v(wt), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: x,
      "aria-label": "Object",
      "onUpdate:visible": f[3] || (f[3] = (y) => {
        y || a();
      })
    }, {
      default: G(() => [
        o("header", Bn, [
          o("div", null, [
            o("h2", null, j(t.object ? "Edit object" : "New object"), 1),
            f[4] || (f[4] = o("p", null, "One reusable record type.", -1))
          ]),
          o("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: a
          }, [
            w(v(S), { icon: "tabler:x" })
          ])
        ]),
        o("div", An, [
          o("label", On, [
            f[5] || (f[5] = o("span", { class: "crm-field-label" }, "Name", -1)),
            $(o("input", {
              "onUpdate:modelValue": f[0] || (f[0] = (y) => s.label = y),
              class: "crm-input",
              placeholder: "Companies",
              onKeyup: oe(g, ["enter"])
            }, null, 544), [
              [A, s.label]
            ])
          ]),
          o("label", Mn, [
            f[6] || (f[6] = o("span", { class: "crm-field-label" }, "API name", -1)),
            $(o("input", {
              "onUpdate:modelValue": f[1] || (f[1] = (y) => s.type = y),
              class: "crm-input",
              disabled: !!t.object,
              placeholder: v(rt)(s.label)
            }, null, 8, Fn), [
              [A, s.type]
            ])
          ]),
          t.object ? h("", !0) : (c(), m("label", Tn, [
            f[7] || (f[7] = o("span", { class: "crm-field-label" }, "Record title field", -1)),
            f[8] || (f[8] = o("span", { class: "crm-field-help" }, "The field used to identify records throughout CRM.", -1)),
            $(o("input", {
              "onUpdate:modelValue": f[2] || (f[2] = (y) => s.titleLabel = y),
              class: "crm-input",
              placeholder: "Display name"
            }, null, 512), [
              [A, s.titleLabel]
            ])
          ])),
          o("label", Rn, [
            f[9] || (f[9] = o("span", { class: "crm-field-label" }, "Icon", -1)),
            o("wc-icon-picker", {
              value: s.icon,
              fallback: "tabler:category",
              onSelect: k
            }, null, 40, Vn)
          ])
        ]),
        o("footer", Un, [
          o("button", {
            type: "button",
            class: "crm-button",
            onClick: a
          }, "Cancel"),
          o("button", {
            type: "button",
            class: "crm-button primary",
            disabled: t.busy || !s.label.trim() || !t.object && !s.titleLabel.trim(),
            onClick: g
          }, [
            w(v(S), {
              icon: t.busy ? "tabler:loader-2" : "tabler:check",
              class: tt({ spin: t.busy })
            }, null, 8, ["icon", "class"]),
            B(j(t.busy ? "Saving…" : "Save"), 1)
          ], 8, Nn)
        ])
      ]),
      _: 1
    }));
  }
}), Wn = { class: "crm-dialog-head" }, Kn = { class: "crm-dialog-body crm-form-grid" }, qn = { class: "crm-field" }, Zn = { class: "crm-field" }, Yn = ["disabled", "placeholder"], Xn = { class: "crm-field" }, Gn = ["disabled"], Jn = ["value"], Qn = { class: "crm-field" }, to = {
  key: 0,
  class: "crm-field"
}, eo = ["value"], no = ["value"], oo = {
  key: 0,
  class: "crm-field-help"
}, ro = {
  key: 1,
  class: "crm-field full"
}, io = { class: "crm-field" }, ao = {
  key: 0,
  class: "crm-field"
}, lo = ["value"], so = {
  key: 1,
  class: "crm-field"
}, uo = {
  key: 2,
  class: "crm-field"
}, co = {
  key: 3,
  class: "crm-field"
}, bo = {
  key: 4,
  class: "crm-field"
}, po = { class: "crm-field" }, mo = {
  key: 3,
  class: "crm-field"
}, fo = {
  key: 4,
  class: "crm-field"
}, go = { class: "crm-field" }, yo = { class: "crm-field" }, vo = { class: "crm-field" }, ho = { class: "crm-field" }, ko = { class: "crm-check" }, Co = { class: "crm-check" }, wo = { class: "crm-check" }, xo = {
  key: 5,
  class: "crm-check"
}, $o = { class: "crm-dialog-foot" }, So = ["disabled"], jo = /* @__PURE__ */ ht({
  __name: "SettingsFieldDialog",
  props: {
    field: {},
    objects: {},
    selected: {},
    attachmentProviders: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = ["text", "email", "phone", "url", "number", "currency", "boolean", "date", "time", "datetime", "select", "multi_select", "relation", "ai"], a = n.field?.config || {}, x = a.ui || {}, k = a.target || {}, g = {
      label: n.field?.label || "",
      attr: n.field?.attr || "",
      data_type: n.field?.data_type || "text",
      help: String(a.help || ""),
      required: a.required === !0,
      unique: a.unique === !0,
      choices: (a.choices || []).join(`
`),
      record_type: String(k.object_type || ""),
      target_kind: String(k.kind || "record"),
      target_class: String(k.class || ""),
      target_contract: String(k.contract || ""),
      target_types: (k.kinds || ["user"]).join(", "),
      target_route: String(k.route || ""),
      cardinality: a.cardinality === "many" ? "many" : "one",
      min: a.min == null ? "" : String(a.min),
      max: a.max == null ? "" : String(a.max),
      attachment_provider: a.attachment?.provider || "",
      sort_order: Number(n.field?.sort_order || 10),
      ui_section: String(x.section || "main"),
      ui_form: x.form !== !1,
      ui_list: x.list !== !1,
      ui_role: String(x.role || ""),
      ui_span: Number(x.span || 2)
    }, l = Dt({ ...g }), f = (E) => E === "text" || E === "url", y = K(() => g.attachment_provider && !n.attachmentProviders.includes(g.attachment_provider) ? g.attachment_provider : ""), C = K(() => n.objects), L = K(() => ["select", "multi_select"].includes(l.data_type)), O = K(() => ["number", "currency"].includes(l.data_type)), D = K(() => l.data_type !== "relation"), et = K(() => l.label.trim() ? l.data_type !== "relation" ? !0 : l.target_kind === "record" ? l.record_type.trim() !== "" : l.target_kind === "component" ? l.target_class.trim() !== "" : l.target_types.split(",").some((E) => E.trim() !== "") : !1), N = () => i("close"), it = { content: { class: "crm-dialog-content" } };
    function Y() {
      return n.field?.attr || rt(l.attr || l.label);
    }
    function nt(E, r) {
      const u = {};
      if (r.help.trim() && (u.help = r.help.trim()), r.required && (u.required = !0), r.data_type !== "relation" && r.unique && (u.unique = !0), ["select", "multi_select"].includes(r.data_type) && (u.choices = r.choices.split(/\n|,/).map((M) => M.trim()).filter(Boolean)), r.data_type === "relation") {
        let M;
        r.target_kind === "record" ? M = { kind: "record", object_type: r.record_type } : r.target_kind === "component" ? M = { kind: "component", class: r.target_class.trim(), contract: r.target_contract.trim() || void 0, route: r.target_route.trim() || void 0 } : M = { kind: "principal", kinds: r.target_types.split(",").map((R) => R.trim()).filter(Boolean) }, u.target = M, u.relation = `${n.selected}_${E}`, u.cardinality = r.cardinality;
      }
      return r.min !== "" && (u.min = Number(r.min)), r.max !== "" && (u.max = Number(r.max)), f(r.data_type) && r.attachment_provider && (u.attachment = { provider: r.attachment_provider }), u.ui = {
        section: r.ui_section,
        form: r.ui_form,
        list: r.ui_list,
        span: r.ui_span,
        ...r.ui_role ? { role: r.ui_role } : {}
      }, u;
    }
    function at(E, r, u) {
      const M = { ...E };
      for (const R of Object.keys({ ...r, ...u }))
        JSON.stringify(r[R]) !== JSON.stringify(u[R]) && (u[R] === void 0 ? delete M[R] : M[R] = u[R]);
      return M;
    }
    function xt(E) {
      const r = nt(E, l);
      if (!n.field) return r;
      const { ui: u, ...M } = nt(E, g), { ui: R, ...$t } = r, ft = at(a, M, $t), gt = at(x, u || {}, R || {});
      return (a.ui || Object.keys(gt).length) && (ft.ui = gt), ft;
    }
    function J() {
      if (!et.value) return;
      const E = Y();
      i("save", { label: l.label.trim(), attr: E, data_type: l.data_type, config: xt(E), sort_order: l.sort_order });
    }
    return (E, r) => (c(), U(v(wt), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog crm-dialog-wide",
      pt: it,
      "aria-label": "Field",
      "onUpdate:visible": r[23] || (r[23] = (u) => {
        u || N();
      })
    }, {
      default: G(() => [
        o("header", Wn, [
          o("div", null, [
            o("h2", null, j(t.field ? "Edit field" : "New field"), 1),
            r[24] || (r[24] = o("p", null, "A schema-backed value on every record.", -1))
          ]),
          o("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: N
          }, [
            w(v(S), { icon: "tabler:x" })
          ])
        ]),
        o("div", Kn, [
          o("label", qn, [
            r[25] || (r[25] = o("span", { class: "crm-field-label" }, "Field label", -1)),
            $(o("input", {
              "onUpdate:modelValue": r[0] || (r[0] = (u) => l.label = u),
              class: "crm-input"
            }, null, 512), [
              [A, l.label]
            ])
          ]),
          o("label", Zn, [
            r[26] || (r[26] = o("span", { class: "crm-field-label" }, "API name", -1)),
            $(o("input", {
              "onUpdate:modelValue": r[1] || (r[1] = (u) => l.attr = u),
              class: "crm-input",
              disabled: !!t.field,
              placeholder: v(rt)(l.label)
            }, null, 8, Yn), [
              [A, l.attr]
            ])
          ]),
          o("label", Xn, [
            r[27] || (r[27] = o("span", { class: "crm-field-label" }, "Type", -1)),
            $(o("select", {
              "onUpdate:modelValue": r[2] || (r[2] = (u) => l.data_type = u),
              class: "crm-input",
              disabled: !!t.field
            }, [
              (c(), m(q, null, Q(s, (u) => o("option", {
                key: u,
                value: u
              }, j(u.replace("_", " ")), 9, Jn)), 64))
            ], 8, Gn), [
              [X, l.data_type]
            ])
          ]),
          o("label", Qn, [
            r[28] || (r[28] = o("span", { class: "crm-field-label" }, "Help text", -1)),
            $(o("input", {
              "onUpdate:modelValue": r[3] || (r[3] = (u) => l.help = u),
              class: "crm-input"
            }, null, 512), [
              [A, l.help]
            ])
          ]),
          f(l.data_type) ? (c(), m("label", to, [
            r[30] || (r[30] = o("span", { class: "crm-field-label" }, "Holds files from", -1)),
            $(o("select", {
              "onUpdate:modelValue": r[4] || (r[4] = (u) => l.attachment_provider = u),
              class: "crm-input"
            }, [
              r[29] || (r[29] = o("option", { value: "" }, "None", -1)),
              y.value ? (c(), m("option", {
                key: 0,
                value: y.value
              }, j(y.value) + " (unavailable)", 9, eo)) : h("", !0),
              (c(!0), m(q, null, Q(t.attachmentProviders, (u) => (c(), m("option", {
                key: u,
                value: u
              }, j(u), 9, no))), 128))
            ], 512), [
              [X, l.attachment_provider]
            ]),
            t.attachmentProviders.length ? h("", !0) : (c(), m("small", oo, "No attachment providers are available."))
          ])) : h("", !0),
          L.value ? (c(), m("label", ro, [
            r[31] || (r[31] = o("span", { class: "crm-field-label" }, "Choices", -1)),
            r[32] || (r[32] = o("span", { class: "crm-field-help" }, "One per line.", -1)),
            $(o("textarea", {
              "onUpdate:modelValue": r[5] || (r[5] = (u) => l.choices = u),
              class: "crm-input crm-textarea"
            }, null, 512), [
              [A, l.choices]
            ])
          ])) : h("", !0),
          l.data_type === "relation" ? (c(), m(q, { key: 2 }, [
            o("label", io, [
              r[34] || (r[34] = o("span", { class: "crm-field-label" }, "Target kind", -1)),
              $(o("select", {
                "onUpdate:modelValue": r[6] || (r[6] = (u) => l.target_kind = u),
                class: "crm-input"
              }, [...r[33] || (r[33] = [
                o("option", { value: "record" }, "CRM record", -1),
                o("option", { value: "component" }, "Application component", -1),
                o("option", { value: "principal" }, "Person or group directory", -1)
              ])], 512), [
                [X, l.target_kind]
              ])
            ]),
            l.target_kind === "record" ? (c(), m("label", ao, [
              r[36] || (r[36] = o("span", { class: "crm-field-label" }, "Related object", -1)),
              $(o("select", {
                "onUpdate:modelValue": r[7] || (r[7] = (u) => l.record_type = u),
                class: "crm-input"
              }, [
                r[35] || (r[35] = o("option", { value: "" }, "Select…", -1)),
                (c(!0), m(q, null, Q(C.value, (u) => (c(), m("option", {
                  key: u.type,
                  value: u.type
                }, j(u.label), 9, lo))), 128))
              ], 512), [
                [X, l.record_type]
              ])
            ])) : l.target_kind === "component" ? (c(), m("label", so, [
              r[37] || (r[37] = o("span", { class: "crm-field-label" }, "Component class", -1)),
              $(o("input", {
                "onUpdate:modelValue": r[8] || (r[8] = (u) => l.target_class = u),
                class: "crm-input",
                placeholder: "knowledge_base"
              }, null, 512), [
                [A, l.target_class]
              ])
            ])) : (c(), m("label", uo, [
              r[38] || (r[38] = o("span", { class: "crm-field-label" }, "Principal kinds", -1)),
              $(o("input", {
                "onUpdate:modelValue": r[9] || (r[9] = (u) => l.target_types = u),
                class: "crm-input",
                placeholder: "user, group"
              }, null, 512), [
                [A, l.target_types]
              ])
            ])),
            l.target_kind === "component" ? (c(), m("label", co, [
              r[39] || (r[39] = o("span", { class: "crm-field-label" }, "Required contract", -1)),
              $(o("input", {
                "onUpdate:modelValue": r[10] || (r[10] = (u) => l.target_contract = u),
                class: "crm-input",
                placeholder: "module:contract"
              }, null, 512), [
                [A, l.target_contract]
              ])
            ])) : h("", !0),
            l.target_kind === "component" ? (c(), m("label", bo, [
              r[40] || (r[40] = o("span", { class: "crm-field-label" }, "Open route", -1)),
              r[41] || (r[41] = o("span", { class: "crm-field-help" }, "Use {id} for the selected component.", -1)),
              $(o("input", {
                "onUpdate:modelValue": r[11] || (r[11] = (u) => l.target_route = u),
                class: "crm-input",
                placeholder: "knowledge/{id}"
              }, null, 512), [
                [A, l.target_route]
              ])
            ])) : h("", !0),
            o("label", po, [
              r[43] || (r[43] = o("span", { class: "crm-field-label" }, "Cardinality", -1)),
              $(o("select", {
                "onUpdate:modelValue": r[12] || (r[12] = (u) => l.cardinality = u),
                class: "crm-input"
              }, [...r[42] || (r[42] = [
                o("option", { value: "one" }, "One item", -1),
                o("option", { value: "many" }, "Many items", -1)
              ])], 512), [
                [X, l.cardinality]
              ])
            ])
          ], 64)) : h("", !0),
          O.value ? (c(), m("label", mo, [
            r[44] || (r[44] = o("span", { class: "crm-field-label" }, "Minimum", -1)),
            $(o("input", {
              "onUpdate:modelValue": r[13] || (r[13] = (u) => l.min = u),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [A, l.min]
            ])
          ])) : h("", !0),
          O.value ? (c(), m("label", fo, [
            r[45] || (r[45] = o("span", { class: "crm-field-label" }, "Maximum", -1)),
            $(o("input", {
              "onUpdate:modelValue": r[14] || (r[14] = (u) => l.max = u),
              class: "crm-input",
              type: "number"
            }, null, 512), [
              [A, l.max]
            ])
          ])) : h("", !0),
          r[57] || (r[57] = o("div", { class: "crm-form-section full" }, [
            o("strong", null, "Presentation"),
            o("span", null, "Declarative placement used by every CRM surface.")
          ], -1)),
          o("label", go, [
            r[47] || (r[47] = o("span", { class: "crm-field-label" }, "Detail section", -1)),
            $(o("select", {
              "onUpdate:modelValue": r[15] || (r[15] = (u) => l.ui_section = u),
              class: "crm-input"
            }, [...r[46] || (r[46] = [
              o("option", { value: "main" }, "Main details", -1),
              o("option", { value: "collapsed" }, "Collapsed details", -1),
              o("option", { value: "hidden" }, "Hidden", -1)
            ])], 512), [
              [X, l.ui_section]
            ])
          ]),
          o("label", yo, [
            r[49] || (r[49] = o("span", { class: "crm-field-label" }, "Width", -1)),
            $(o("select", {
              "onUpdate:modelValue": r[16] || (r[16] = (u) => l.ui_span = u),
              class: "crm-input"
            }, [...r[48] || (r[48] = [
              o("option", { value: 1 }, "Quarter", -1),
              o("option", { value: 2 }, "Half", -1),
              o("option", { value: 3 }, "Three quarters", -1),
              o("option", { value: 4 }, "Full", -1)
            ])], 512), [
              [
                X,
                l.ui_span,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          o("label", vo, [
            r[51] || (r[51] = o("span", { class: "crm-field-label" }, "Semantic role", -1)),
            $(o("select", {
              "onUpdate:modelValue": r[17] || (r[17] = (u) => l.ui_role = u),
              class: "crm-input"
            }, [...r[50] || (r[50] = [
              o("option", { value: "" }, "Standard field", -1),
              o("option", { value: "title" }, "Record title", -1),
              o("option", { value: "subtitle" }, "Record subtitle", -1)
            ])], 512), [
              [X, l.ui_role]
            ])
          ]),
          o("label", ho, [
            r[52] || (r[52] = o("span", { class: "crm-field-label" }, "Position", -1)),
            $(o("input", {
              "onUpdate:modelValue": r[18] || (r[18] = (u) => l.sort_order = u),
              class: "crm-input",
              type: "number",
              min: "0",
              step: "10"
            }, null, 512), [
              [
                A,
                l.sort_order,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          o("label", ko, [
            $(o("input", {
              "onUpdate:modelValue": r[19] || (r[19] = (u) => l.ui_form = u),
              type: "checkbox"
            }, null, 512), [
              [yt, l.ui_form]
            ]),
            r[53] || (r[53] = o("span", null, [
              o("strong", null, "Show in forms"),
              o("small", null, "Available while creating or editing a record.")
            ], -1))
          ]),
          o("label", Co, [
            $(o("input", {
              "onUpdate:modelValue": r[20] || (r[20] = (u) => l.ui_list = u),
              type: "checkbox"
            }, null, 512), [
              [yt, l.ui_list]
            ]),
            r[54] || (r[54] = o("span", null, [
              o("strong", null, "Show in default lists"),
              o("small", null, "Eligible for the default table columns.")
            ], -1))
          ]),
          o("label", wo, [
            $(o("input", {
              "onUpdate:modelValue": r[21] || (r[21] = (u) => l.required = u),
              type: "checkbox"
            }, null, 512), [
              [yt, l.required]
            ]),
            r[55] || (r[55] = o("span", null, [
              o("strong", null, "Required"),
              o("small", null, "Records cannot omit this value.")
            ], -1))
          ]),
          D.value ? (c(), m("label", xo, [
            $(o("input", {
              "onUpdate:modelValue": r[22] || (r[22] = (u) => l.unique = u),
              type: "checkbox"
            }, null, 512), [
              [yt, l.unique]
            ]),
            r[56] || (r[56] = o("span", null, [
              o("strong", null, "Unique"),
              o("small", null, "No two records may share it.")
            ], -1))
          ])) : h("", !0)
        ]),
        o("footer", $o, [
          o("button", {
            type: "button",
            class: "crm-button",
            onClick: N
          }, "Cancel"),
          o("button", {
            type: "button",
            class: "crm-button primary",
            disabled: t.busy || !et.value,
            onClick: J
          }, [
            w(v(S), {
              icon: t.busy ? "tabler:loader-2" : "tabler:check",
              class: tt({ spin: t.busy })
            }, null, 8, ["icon", "class"]),
            B(j(t.busy ? "Saving…" : "Save"), 1)
          ], 8, So)
        ])
      ]),
      _: 1
    }));
  }
}), _o = { class: "crm-dialog-head" }, Lo = { class: "crm-dialog-body" }, Po = { class: "crm-field" }, zo = { class: "crm-stage-editor" }, Do = ["onUpdate:modelValue"], Eo = ["disabled", "onClick"], Io = ["disabled", "onClick"], Bo = ["onClick"], Ao = { class: "crm-dialog-foot" }, Oo = ["disabled"], Mo = /* @__PURE__ */ ht({
  __name: "SettingsPipelineDialog",
  props: {
    pipeline: {},
    objectLabel: {},
    selected: {},
    busy: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = Ht(n.pipeline || void 0), a = Dt({
      label: n.pipeline?.label || `${n.objectLabel} Pipeline`,
      collection_id: n.pipeline?.collection_id || `${n.selected}_pipeline`,
      stages: s.length ? s.map((y) => ({ ...y })) : [{ stage_id: "new", label: "New", order: 10 }, { stage_id: "won", label: "Won", order: 20 }, { stage_id: "lost", label: "Lost", order: 30 }]
    }), x = () => i("close"), k = { content: { class: "crm-dialog-content" } };
    function g(y, C) {
      const L = y + C;
      if (L < 0 || L >= a.stages.length) return;
      const [O] = a.stages.splice(y, 1);
      a.stages.splice(L, 0, O);
    }
    function l() {
      a.stages.push({ stage_id: "", label: "", order: (a.stages.length + 1) * 10 });
    }
    function f() {
      a.stages.some((y) => y.label.trim()) && i("save", { label: a.label.trim(), collection_id: a.collection_id, stages: a.stages });
    }
    return (y, C) => (c(), U(v(wt), {
      visible: !0,
      modal: "",
      "dismissable-mask": !0,
      "show-header": !1,
      class: "crm-dialog",
      pt: k,
      "aria-label": "Pipeline stages",
      "onUpdate:visible": C[1] || (C[1] = (L) => {
        L || x();
      })
    }, {
      default: G(() => [
        o("header", _o, [
          C[2] || (C[2] = o("div", null, [
            o("h2", null, "Pipeline stages"),
            o("p", null, "The stages shown in board view.")
          ], -1)),
          o("button", {
            type: "button",
            class: "crm-icon-button",
            "aria-label": "Close",
            onClick: x
          }, [
            w(v(S), { icon: "tabler:x" })
          ])
        ]),
        o("div", Lo, [
          o("label", Po, [
            C[3] || (C[3] = o("span", { class: "crm-field-label" }, "Pipeline name", -1)),
            $(o("input", {
              "onUpdate:modelValue": C[0] || (C[0] = (L) => a.label = L),
              class: "crm-input"
            }, null, 512), [
              [A, a.label]
            ])
          ]),
          o("div", zo, [
            (c(!0), m(q, null, Q(a.stages, (L, O) => (c(), m("div", { key: O }, [
              w(v(S), { icon: "tabler:grip-vertical" }),
              $(o("input", {
                "onUpdate:modelValue": (D) => L.label = D,
                class: "crm-input",
                placeholder: "Stage name"
              }, null, 8, Do), [
                [A, L.label]
              ]),
              o("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: O === 0,
                "aria-label": "Move up",
                onClick: (D) => g(O, -1)
              }, [
                w(v(S), { icon: "tabler:arrow-up" })
              ], 8, Eo),
              o("button", {
                type: "button",
                class: "crm-icon-button",
                disabled: O === a.stages.length - 1,
                "aria-label": "Move down",
                onClick: (D) => g(O, 1)
              }, [
                w(v(S), { icon: "tabler:arrow-down" })
              ], 8, Io),
              o("button", {
                type: "button",
                class: "crm-icon-button danger",
                "aria-label": "Remove stage",
                onClick: (D) => a.stages.splice(O, 1)
              }, [
                w(v(S), { icon: "tabler:x" })
              ], 8, Bo)
            ]))), 128)),
            o("button", {
              type: "button",
              class: "crm-button",
              onClick: l
            }, [
              w(v(S), { icon: "tabler:plus" }),
              C[4] || (C[4] = B("Add stage", -1))
            ])
          ])
        ]),
        o("footer", Ao, [
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
            w(v(S), {
              icon: t.busy ? "tabler:loader-2" : "tabler:check",
              class: tt({ spin: t.busy })
            }, null, 8, ["icon", "class"]),
            B(j(t.busy ? "Saving…" : "Save"), 1)
          ], 8, Oo)
        ])
      ]),
      _: 1
    }));
  }
}), Fo = {
  key: 0,
  class: "crm-state"
}, To = {
  key: 1,
  class: "crm-state error",
  role: "alert"
}, Ro = {
  key: 2,
  class: "crm-settings"
}, Vo = { class: "crm-page-head" }, Uo = { class: "crm-page-actions" }, No = {
  key: 0,
  class: "crm-pill"
}, Ho = ["disabled"], Wo = {
  key: 1,
  class: "crm-button"
}, Ko = { class: "crm-settings-layout" }, qo = { class: "crm-settings-objects" }, Zo = ["onClick"], Yo = { class: "crm-object-icon" }, Xo = {
  key: 0,
  class: "crm-settings-main"
}, Go = { class: "crm-settings-title" }, Jo = { class: "crm-object-icon large" }, Qo = { class: "crm-card" }, tr = { class: "crm-card-head" }, er = { class: "crm-field-list" }, nr = { key: 0 }, or = { key: 1 }, rr = { class: "crm-type-badge" }, ir = { key: 0 }, ar = { key: 1 }, lr = { key: 2 }, sr = { class: "crm-type-badge" }, dr = { class: "crm-row-actions" }, ur = ["onClick"], cr = ["onClick"], br = { class: "crm-card" }, pr = { class: "crm-card-head" }, mr = {
  key: 0,
  class: "crm-pipeline-preview"
}, fr = {
  key: 1,
  class: "crm-card-empty"
}, gr = { class: "crm-card" }, yr = { class: "crm-setting-line" }, vr = ["disabled"], hr = {
  key: 1,
  class: "crm-settings-main crm-settings-empty"
}, kr = { class: "crm-empty-icon" }, jr = /* @__PURE__ */ ht({
  __name: "CrmSettings",
  props: {
    crmId: {},
    initial: {},
    canWrite: { type: Boolean, default: !0 }
  },
  emits: ["changed"],
  setup(t, { emit: e }) {
    const n = t, i = e, s = H(n.initial || null), a = H(""), x = H(!0), k = H(""), g = H(!1), l = H(""), f = H(null), y = H(null), C = H(365), L = H(""), O = H([]), D = K(() => s.value?.objects.find((p) => p.type === a.value)), et = K(() => It(s.value?.attributes || [], a.value)), N = K(() => D.value ? ie(s.value?.pipelines || [], D.value) : void 0);
    async function it(p = a.value) {
      x.value = !0, k.value = "";
      try {
        const d = n.crmId || s.value?.crm_id || "", [b, _, P] = await Promise.all([ae(d), le(), se(d)]);
        if ("provisioned" in P) throw new Error("No CRM workspace has been created yet.");
        L.value = b.revision, O.value = b.attachmentProviders;
        const V = { success: !0, crm_id: d, workspace_label: P.workspace_label, can_write: n.canWrite, ...b.declaration };
        s.value = V, C.value = Number(_.thread_event_retention_days || 365), a.value = V.objects.some((lt) => lt.type === p) ? p : V.objects[0]?.type || "", i("changed", V);
      } catch (d) {
        k.value = Z(d, "CRM settings could not load.");
      } finally {
        x.value = !1;
      }
    }
    function Y() {
      l.value = "", f.value = null, y.value = null;
    }
    function nt(p) {
      f.value = p || null, l.value = "object";
    }
    function at(p) {
      y.value = p || null, l.value = "field";
    }
    function xt() {
      l.value = "pipeline";
    }
    function J() {
      if (!s.value) return { objects: [], attributes: [], pipelines: [], views: [] };
      const p = s.value;
      return {
        version: p.version,
        objects: p.objects,
        attributes: p.attributes,
        pipelines: p.pipelines,
        views: p.views,
        policies: p.policies,
        merge_config: p.merge_config
      };
    }
    async function E(p) {
      const d = s.value;
      if (!d) throw new Error("CRM settings are not loaded.");
      const b = d.crm_id, _ = await be(b, L.value, p);
      L.value = _.revision;
      const P = { success: !0, crm_id: b, workspace_label: d.workspace_label, can_write: n.canWrite, ..._.declaration };
      return s.value = P, a.value = P.objects.some((V) => V.type === a.value) ? a.value : P.objects[0]?.type || "", i("changed", P), _;
    }
    async function r(p) {
      const d = f.value?.type || rt(p.type || p.label);
      if (d) {
        g.value = !0;
        try {
          const b = J(), _ = { ...f.value || {}, type: d, label: p.label, icon: p.icon || void 0 }, P = [...b.objects.filter((lt) => lt.type !== d), _];
          let V = b.attributes;
          if (!f.value) {
            const lt = rt(p.titleLabel);
            V = [...V, { object_type: d, attr: lt, data_type: "text", label: p.titleLabel, sort_order: 10, system: !0, config: { ui: { role: "title", section: "main", span: 4, list: !0, form: !0 } } }];
          }
          await E({ ...b, objects: P, attributes: V }), I.toast({ severity: "success", summary: f.value ? "Object updated" : "Object created", detail: p.label }), Y(), a.value = d;
        } catch (b) {
          I.toast({ severity: "error", summary: "Could not save object", detail: Z(b, "CRM write failed.") });
        } finally {
          g.value = !1;
        }
      }
    }
    async function u() {
      const p = D.value;
      if (!(!p || !await I.confirm({ header: `Delete ${p.label}`, message: "Delete this object, all of its fields, pipeline, views, and records? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete object", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const b = J(), _ = [
            ...b.pipelines.filter((P) => P.object_type === p.type).map((P) => ({ kind: "pipeline", id: P.collection_id })),
            ...b.views.filter((P) => P.object_type === p.type).map((P) => ({ kind: "view", id: P.view_id }))
          ];
          await E({ ...b, remove: { objects: [{ object_id: p.id || p.type }], ..._.length ? { declarations: _ } : {} } }), I.toast({ severity: "success", summary: "Object deleted", detail: p.label });
        } catch (b) {
          I.toast({ severity: "error", summary: "Could not delete object", detail: Z(b, "CRM write failed.") });
        }
    }
    async function M(p) {
      if (p.attr) {
        g.value = !0;
        try {
          const d = J(), b = { object_type: a.value, attr: p.attr, data_type: p.data_type, label: p.label, config: p.config, sort_order: p.sort_order || (et.value.length + 1) * 10, system: y.value?.system === !0 };
          await E({ ...d, attributes: [...d.attributes.filter((_) => !(_.object_type === a.value && _.attr === p.attr)), b] }), I.toast({ severity: "success", summary: y.value ? "Field updated" : "Field created", detail: p.label }), Y();
        } catch (d) {
          I.toast({ severity: "error", summary: "Could not save field", detail: Z(d, "CRM write failed.") });
        } finally {
          g.value = !1;
        }
      }
    }
    async function R(p) {
      if (!(p.system || !await I.confirm({ header: `Delete ${p.label}`, message: "Delete this field and its stored values? This cannot be undone.", icon: "tabler:trash", acceptLabel: "Delete field", rejectLabel: "Cancel", acceptClass: "p-button-danger" })))
        try {
          const b = J();
          await E({ ...b, remove: { attributes: [{ object_id: D.value?.id || a.value, field_id: p.id || p.attr }] } }), I.toast({ severity: "success", summary: "Field deleted", detail: p.label });
        } catch (b) {
          I.toast({ severity: "error", summary: "Could not delete field", detail: Z(b, "CRM write failed.") });
        }
    }
    async function $t(p) {
      g.value = !0;
      try {
        const d = p.stages.filter((P) => P.label.trim()).map((P, V) => ({ ...P, stage_id: rt(P.stage_id || P.label), label: P.label.trim(), order: (V + 1) * 10 })), b = J(), _ = { collection_id: p.collection_id, object_type: a.value, label: p.label, stages: d };
        await E({ ...b, pipelines: [...b.pipelines.filter((P) => P.collection_id !== p.collection_id), _] }), I.toast({ severity: "success", summary: "Pipeline saved", detail: p.label }), Y();
      } catch (d) {
        I.toast({ severity: "error", summary: "Could not save pipeline", detail: Z(d, "CRM write failed.") });
      } finally {
        g.value = !1;
      }
    }
    async function ft() {
      try {
        await de("thread_event_retention_days", C.value), I.toast({ severity: "success", summary: "Retention saved", detail: `${C.value} days` });
      } catch (p) {
        I.toast({ severity: "error", summary: "Could not save retention", detail: Z(p, "Setting write failed.") });
      }
    }
    async function gt(p) {
      const d = p.target, b = d.files?.[0];
      if (b && s.value)
        try {
          const _ = await ue(s.value.crm_id, L.value, JSON.parse(await b.text()));
          I.toast({ severity: "success", summary: "Configuration imported", detail: _.changed ? "The CRM schema was updated." : "The CRM schema was already current." }), await it(a.value);
        } catch (_) {
          I.toast({ severity: "error", summary: "Import failed", detail: Z(_, "Configuration import failed.") });
        }
      d.value = "";
    }
    async function ee() {
      if (s.value) {
        g.value = !0;
        try {
          const p = await ce(s.value.crm_id), d = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }), b = URL.createObjectURL(d), _ = document.createElement("a");
          _.href = b, _.download = `crm-config-${s.value.crm_id}.json`, document.body.appendChild(_), _.click(), _.remove(), URL.revokeObjectURL(b), I.toast({ severity: "success", summary: "Configuration exported", detail: "Downloaded schema JSON" });
        } catch (p) {
          I.toast({ severity: "error", summary: "Export failed", detail: Z(p, "Configuration export failed.") });
        } finally {
          g.value = !1;
        }
      }
    }
    return Nt(() => it()), (p, d) => x.value ? (c(), m("div", Fo, [
      w(v(S), {
        icon: "tabler:loader-2",
        class: "spin"
      }),
      d[6] || (d[6] = B(" Loading CRM settings…", -1))
    ])) : k.value ? (c(), m("div", To, [
      w(v(S), { icon: "tabler:alert-circle" }),
      o("div", null, [
        d[7] || (d[7] = o("strong", null, "Settings could not load", -1)),
        o("span", null, j(k.value), 1)
      ]),
      o("button", {
        class: "crm-button",
        onClick: d[0] || (d[0] = (b) => it())
      }, "Try again")
    ])) : s.value ? (c(), m("section", Ro, [
      o("header", Vo, [
        d[12] || (d[12] = o("div", null, [
          o("span", { class: "crm-eyebrow" }, "CRM control"),
          o("h1", null, "Data model"),
          o("p", null, "Objects, fields, relationships, and pipelines.")
        ], -1)),
        o("div", Uo, [
          t.canWrite ? h("", !0) : (c(), m("span", No, [
            w(v(S), { icon: "tabler:eye" }),
            d[8] || (d[8] = B("Read-only", -1))
          ])),
          o("button", {
            class: "crm-button",
            disabled: g.value,
            onClick: ee
          }, [
            w(v(S), { icon: "tabler:download" }),
            d[9] || (d[9] = B("Export JSON", -1))
          ], 8, Ho),
          t.canWrite ? (c(), m("label", Wo, [
            w(v(S), { icon: "tabler:upload" }),
            d[10] || (d[10] = B("Import JSON", -1)),
            o("input", {
              class: "crm-file-input",
              type: "file",
              accept: "application/json,.json",
              onChange: gt
            }, null, 32)
          ])) : h("", !0),
          t.canWrite ? (c(), m("button", {
            key: 2,
            class: "crm-button primary",
            onClick: d[1] || (d[1] = (b) => nt())
          }, [
            w(v(S), { icon: "tabler:plus" }),
            d[11] || (d[11] = B("New object", -1))
          ])) : h("", !0)
        ])
      ]),
      o("div", Ko, [
        o("aside", qo, [
          (c(!0), m(q, null, Q(s.value.objects, (b) => (c(), m("button", {
            key: b.type,
            class: tt({ active: a.value === b.type }),
            onClick: (_) => a.value = b.type
          }, [
            o("span", Yo, [
              w(v(S), {
                icon: b.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            o("span", null, [
              o("strong", null, j(b.label), 1),
              o("small", null, j(v(It)(s.value.attributes, b.type).length) + " fields", 1)
            ]),
            w(v(S), { icon: "tabler:chevron-right" })
          ], 10, Zo))), 128))
        ]),
        D.value ? (c(), m("main", Xo, [
          o("section", Go, [
            o("span", Jo, [
              w(v(S), {
                icon: D.value.icon || "tabler:category"
              }, null, 8, ["icon"])
            ]),
            o("div", null, [
              d[13] || (d[13] = o("span", null, "Object", -1)),
              o("h2", null, j(D.value.label), 1),
              o("code", null, j(D.value.type), 1)
            ]),
            t.canWrite ? (c(), m(q, { key: 0 }, [
              o("button", {
                class: "crm-button",
                onClick: d[2] || (d[2] = (b) => nt(D.value))
              }, [
                w(v(S), { icon: "tabler:edit" }),
                d[14] || (d[14] = B("Edit", -1))
              ]),
              o("button", {
                class: "crm-button danger-text",
                onClick: u
              }, [
                w(v(S), { icon: "tabler:trash" }),
                d[15] || (d[15] = B("Delete", -1))
              ])
            ], 64)) : h("", !0)
          ]),
          o("section", Qo, [
            o("header", tr, [
              o("div", null, [
                d[16] || (d[16] = o("h2", null, "Fields and relationships", -1)),
                o("p", null, j(et.value.length) + " fields define records of this type.", 1)
              ]),
              t.canWrite ? (c(), m("button", {
                key: 0,
                class: "crm-button primary",
                onClick: d[3] || (d[3] = (b) => at())
              }, [
                w(v(S), { icon: "tabler:plus" }),
                d[17] || (d[17] = B("New field", -1))
              ])) : h("", !0)
            ]),
            o("div", er, [
              d[18] || (d[18] = o("div", { class: "crm-field-row header" }, [
                o("span", null, "Field"),
                o("span", null, "API name"),
                o("span", null, "Type"),
                o("span", null, "Placement"),
                o("span")
              ], -1)),
              (c(!0), m(q, null, Q(et.value, (b) => (c(), m("div", {
                key: b.attr,
                class: "crm-field-row"
              }, [
                o("span", null, [
                  o("strong", null, j(b.label), 1),
                  b.config?.required ? (c(), m("small", nr, "Required")) : h("", !0),
                  b.system ? (c(), m("small", or, "System")) : h("", !0)
                ]),
                o("code", null, j(b.attr), 1),
                o("span", rr, [
                  B(j(b.data_type.replace("_", " ")), 1),
                  b.config?.target?.kind === "record" ? (c(), m("small", ir, "→ " + j(b.config.target.object_type), 1)) : b.config?.target?.kind === "component" ? (c(), m("small", ar, "→ " + j(b.config.target.class), 1)) : b.config?.target?.kind === "principal" ? (c(), m("small", lr, "→ directory")) : h("", !0)
                ]),
                o("span", sr, [
                  B(j(b.config?.ui?.section || "main"), 1),
                  o("small", null, j(b.config?.ui?.span || 2) + "/4", 1)
                ]),
                o("span", dr, [
                  t.canWrite ? (c(), m("button", {
                    key: 0,
                    class: "crm-icon-button",
                    "aria-label": "Edit field",
                    onClick: (_) => at(b)
                  }, [
                    w(v(S), { icon: "tabler:edit" })
                  ], 8, ur)) : h("", !0),
                  t.canWrite && !b.system ? (c(), m("button", {
                    key: 1,
                    class: "crm-icon-button danger",
                    "aria-label": "Delete field",
                    onClick: (_) => R(b)
                  }, [
                    w(v(S), { icon: "tabler:trash" })
                  ], 8, cr)) : h("", !0)
                ])
              ]))), 128))
            ])
          ]),
          o("section", br, [
            o("header", pr, [
              o("div", null, [
                d[19] || (d[19] = o("h2", null, "Pipeline", -1)),
                o("p", null, j(N.value ? N.value.label : "Optional stages for a board view."), 1)
              ]),
              t.canWrite ? (c(), m("button", {
                key: 0,
                class: "crm-button",
                onClick: xt
              }, [
                w(v(S), {
                  icon: N.value ? "tabler:edit" : "tabler:plus"
                }, null, 8, ["icon"]),
                B(j(N.value ? "Edit stages" : "Add pipeline"), 1)
              ])) : h("", !0)
            ]),
            N.value ? (c(), m("div", mr, [
              (c(!0), m(q, null, Q(v(Ht)(N.value), (b) => (c(), m("span", {
                key: b.stage_id
              }, j(b.label), 1))), 128))
            ])) : (c(), m("div", fr, [
              w(v(S), { icon: "tabler:layout-kanban" }),
              d[20] || (d[20] = o("span", null, "No pipeline is configured for this object.", -1))
            ]))
          ]),
          o("section", gr, [
            d[23] || (d[23] = o("header", { class: "crm-card-head" }, [
              o("div", null, [
                o("h2", null, "Retention"),
                o("p", null, "How long CRM thread events remain available.")
              ])
            ], -1)),
            o("div", yr, [
              d[21] || (d[21] = o("label", null, "Event retention", -1)),
              $(o("input", {
                "onUpdate:modelValue": d[4] || (d[4] = (b) => C.value = b),
                class: "crm-input short",
                type: "number",
                min: "1",
                disabled: !t.canWrite
              }, null, 8, vr), [
                [
                  A,
                  C.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              d[22] || (d[22] = o("span", null, "days", -1)),
              t.canWrite ? (c(), m("button", {
                key: 0,
                class: "crm-button",
                onClick: ft
              }, "Save")) : h("", !0)
            ])
          ])
        ])) : (c(), m("main", hr, [
          o("span", kr, [
            w(v(S), { icon: "tabler:database-plus" })
          ]),
          d[25] || (d[25] = o("h2", null, "No objects yet", -1)),
          d[26] || (d[26] = o("p", null, "Define a record type and its title field to begin building this CRM.", -1)),
          t.canWrite ? (c(), m("button", {
            key: 0,
            class: "crm-button primary",
            onClick: d[5] || (d[5] = (b) => nt())
          }, [
            w(v(S), { icon: "tabler:plus" }),
            d[24] || (d[24] = B("New object", -1))
          ])) : h("", !0)
        ]))
      ]),
      l.value === "object" ? (c(), U(Hn, {
        key: 0,
        object: f.value,
        busy: g.value,
        onClose: Y,
        onSave: r
      }, null, 8, ["object", "busy"])) : l.value === "field" ? (c(), U(jo, {
        key: 1,
        field: y.value,
        objects: s.value.objects,
        selected: a.value,
        "attachment-providers": O.value,
        busy: g.value,
        onClose: Y,
        onSave: M
      }, null, 8, ["field", "objects", "selected", "attachment-providers", "busy"])) : l.value === "pipeline" ? (c(), U(Mo, {
        key: 2,
        pipeline: N.value,
        "object-label": D.value?.label || "CRM",
        selected: a.value,
        busy: g.value,
        onClose: Y,
        onSave: $t
      }, null, 8, ["pipeline", "object-label", "selected", "busy"])) : h("", !0)
    ])) : h("", !0);
  }
});
export {
  jr as _,
  wt as s
};
//# sourceMappingURL=CrmSettings.vue_vue_type_script_setup_true_lang-DhsIsoO6.js.map
