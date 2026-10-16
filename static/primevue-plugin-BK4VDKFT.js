import { ref as me, readonly as Mt, getCurrentInstance as Ae, onMounted as Dt, nextTick as It, watch as ne, reactive as Wt, renderSlot as fe, openBlock as Ft, createBlock as Ht, Teleport as tt, createCommentVNode as nt, h as Bt } from "vue";
var Ut = Object.defineProperty, Ce = Object.getOwnPropertySymbols, Vt = Object.prototype.hasOwnProperty, zt = Object.prototype.propertyIsEnumerable, xe = (e, t, n) => t in e ? Ut(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Kt = (e, t) => {
  for (var n in t || (t = {})) Vt.call(t, n) && xe(e, n, t[n]);
  if (Ce) for (var n of Ce(t)) zt.call(t, n) && xe(e, n, t[n]);
  return e;
};
function Ne(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function qt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function v(e) {
  return !Ne(e);
}
function j(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function rt(e = {}, t = {}) {
  let n = Kt({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    j(t[o]) && o in e && j(e[o]) ? n[o] = rt(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Yt(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : rt(t, n), {});
}
function N(e, ...t) {
  return qt(e) ? e(...t) : e;
}
function R(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Ee(e) {
  return R(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Qt(e, t = "", n = {}) {
  let r = Ee(t).split("."), o = r.shift();
  if (o) {
    if (j(e)) {
      let u = Object.keys(e).find((i) => Ee(i) === o) || "";
      return Qt(N(e[u], n), r.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function Zn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Gt(e) {
  return v(e) && !isNaN(e);
}
function z(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Zt(...e) {
  return Yt(...e);
}
function re(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Jn(e) {
  return R(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function ot(e) {
  return R(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function at() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function Jt(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function je(e, t) {
  if (e && t) {
    let n = (r) => {
      Jt(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Xt() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Xn(e) {
  typeof e == "string" ? je(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, Xt() + "px"), je(document.body, e?.className || "p-overflow-hidden"));
}
function Re(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function er(e) {
  typeof e == "string" ? Re(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Re(document.body, e?.className || "p-overflow-hidden"));
}
function tr() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, u = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: u };
}
function Me(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function nr(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function rr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function en(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function tn(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && en(e));
}
function te(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function he(e, t = {}) {
  if (te(e)) {
    let n = (r, o) => {
      var u, i;
      let s = (u = e?.$attrs) != null && u[r] ? [(i = e?.$attrs) == null ? void 0 : i[r]] : [];
      return [o].flat().reduce((a, l) => {
        if (l != null) {
          let c = typeof l;
          if (c === "string" || c === "number") a.push(l);
          else if (c === "object") {
            let m = Array.isArray(l) ? n(r, l) : Object.entries(l).map(([p, d]) => r === "style" && (d || d === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${d}` : d ? p : void 0);
            a = m.length ? a.concat(m.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let u = r.match(/^on(.+)/);
        u ? e.addEventListener(u[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? he(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function or(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return he(r, t), r.append(...n), r;
  }
}
function nn(e, t) {
  return te(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function ar(e, t) {
  return te(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ir(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function sr(e, t) {
  if (te(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function it(e, t = "") {
  let n = nn(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function lr(e, t) {
  let n = it(e, t);
  return n.length > 0 ? n[0] : null;
}
function ur(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function cr(e, t) {
  let n = it(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function dr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Me(document.documentElement) || Me(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function pr(e, t) {
  return e ? e.offsetHeight : 0;
}
function mr(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function st() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function fr(e, t = "") {
  return te(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function rn(e, t = "", n) {
  te(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var on = Object.defineProperty, an = Object.defineProperties, sn = Object.getOwnPropertyDescriptors, ye = Object.getOwnPropertySymbols, lt = Object.prototype.hasOwnProperty, ut = Object.prototype.propertyIsEnumerable, De = (e, t, n) => t in e ? on(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, T = (e, t) => {
  for (var n in t || (t = {})) lt.call(t, n) && De(e, n, t[n]);
  if (ye) for (var n of ye(t)) ut.call(t, n) && De(e, n, t[n]);
  return e;
}, be = (e, t) => an(e, sn(t)), k = (e, t) => {
  var n = {};
  for (var r in e) lt.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && ye) for (var r of ye(e)) t.indexOf(r) < 0 && ut.call(e, r) && (n[r] = e[r]);
  return n;
}, ln = at(), P = ln, oe = /{([^}]*)}/g, ct = /(\d+\s+[\+\-\*\/]\s+\d+)/g, dt = /var\([^)]+\)/g;
function Ie(e) {
  return R(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function un(e) {
  return j(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function cn(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function we(e = "", t = "") {
  return cn(`${R(e, !1) && R(t, !1) ? `${e}-` : e}${t}`);
}
function pt(e = "", t = "") {
  return `--${we(e, t)}`;
}
function dn(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function mt(e, t = "", n = "", r = [], o) {
  if (R(e)) {
    let u = e.trim();
    if (dn(u)) return;
    if (z(u, oe)) {
      let i = u.replaceAll(oe, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((l) => !r.some((c) => z(l, c)));
        return `var(${pt(n, ot(a.join("-")))}${v(o) ? `, ${o}` : ""})`;
      });
      return z(i.replace(dt, "0"), ct) ? `calc(${i})` : i;
    }
    return u;
  } else if (Gt(e)) return e;
}
function pn(e, t, n) {
  R(t, !1) && e.push(`${t}:${n};`);
}
function X(e, t) {
  return e ? `${e}{${t}}` : "";
}
function ft(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(i, s) {
    let a = [], l = 0, c = "", m = null, p = 0;
    for (; l <= i.length; ) {
      let d = i[l];
      if ((d === '"' || d === "'" || d === "`") && i[l - 1] !== "\\" && (m = m === d ? null : d), !m && (d === "(" && p++, d === ")" && p--, (d === "," || l === i.length) && p === 0)) {
        let f = c.trim();
        f.startsWith("dt(") ? a.push(ft(f, s)) : a.push(r(f)), c = "", l++;
        continue;
      }
      d !== void 0 && (c += d), l++;
    }
    return a;
  }
  function r(i) {
    let s = i[0];
    if ((s === '"' || s === "'" || s === "`") && i[i.length - 1] === s) return i.slice(1, -1);
    let a = Number(i);
    return isNaN(a) ? i : a;
  }
  let o = [], u = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") u.push(i), i += 2;
  else if (e[i] === ")" && u.length > 0) {
    let s = u.pop();
    u.length === 0 && o.push([s, i]);
  }
  if (!o.length) return e;
  for (let i = o.length - 1; i >= 0; i--) {
    let [s, a] = o[i], l = e.slice(s + 3, a), c = n(l, t), m = t(...c);
    e = e.slice(0, s) + m + e.slice(a + 1);
  }
  return e;
}
var hr = (e) => {
  var t;
  let n = b.getTheme(), r = Oe(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], u = Oe(n, e, void 0, "value");
  return { name: o, variable: r, value: u };
}, K = (...e) => Oe(b.getTheme(), ...e), Oe = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: u } = b.defaults || {}, { prefix: i, transform: s } = e?.options || u || {}, a = z(t, oe) ? t : `{${t}}`;
    return r === "value" || Ne(r) && s === "strict" ? b.getTokenValue(t) : mt(a, void 0, i, [o.excludedKeyRegex], n);
  }
  return "";
};
function ue(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, u) => {
      var i;
      return r + o + ((i = N(t[u], { dt: K })) != null ? i : "");
    }, "");
    return ft(n, K);
  }
  return N(e, { dt: K });
}
function mn(e, t = {}) {
  let n = b.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: u = n.excludedKeyRegex } = t, i = [], s = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: c, path: m } = a.pop();
    for (let p in c) {
      let d = c[p], f = un(d), h = z(p, u) ? we(m) : we(m, ot(p));
      if (j(f)) a.push({ node: f, path: h });
      else {
        let y = pt(h), g = mt(f, h, r, [u]);
        pn(s, y, g);
        let S = h;
        r && S.startsWith(r + "-") && (S = S.slice(r.length + 1)), i.push(S.replace(/-/g, "."));
      }
    }
  }
  let l = s.join("");
  return { value: s, tokens: i, declarations: l, css: X(o, l) };
}
var O = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: `:root${e},:host${e}`, matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: !0 };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [e].flat().map((n) => {
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return mn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var u, i, s, a, l, c, m;
  let { preset: p, options: d } = t, f, h, y, g, S, M, D;
  if (v(p) && d.transform !== "strict") {
    let { primitive: q, semantic: I, extend: L } = p, A = I || {}, { colorScheme: C } = A, W = k(A, ["colorScheme"]), x = L || {}, { colorScheme: F } = x, H = k(x, ["colorScheme"]), E = C || {}, { dark: B } = E, Y = k(E, ["dark"]), U = F || {}, { dark: Q } = U, G = k(U, ["dark"]), _ = v(q) ? this._toVariables({ primitive: q }, d) : {}, $ = v(W) ? this._toVariables({ semantic: W }, d) : {}, V = v(Y) ? this._toVariables({ light: Y }, d) : {}, le = v(B) ? this._toVariables({ dark: B }, d) : {}, Z = v(H) ? this._toVariables({ semantic: H }, d) : {}, Pe = v(G) ? this._toVariables({ light: G }, d) : {}, Le = v(Q) ? this._toVariables({ dark: Q }, d) : {}, [vt, bt] = [(u = _.declarations) != null ? u : "", _.tokens], [St, wt] = [(i = $.declarations) != null ? i : "", $.tokens || []], [Ot, Tt] = [(s = V.declarations) != null ? s : "", V.tokens || []], [$t, Nt] = [(a = le.declarations) != null ? a : "", le.tokens || []], [_t, kt] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [Pt, Lt] = [(c = Pe.declarations) != null ? c : "", Pe.tokens || []], [At, Ct] = [(m = Le.declarations) != null ? m : "", Le.tokens || []];
    f = this.transformCSS(e, vt, "light", "variable", d, r, o), h = bt;
    let xt = this.transformCSS(e, `${St}${Ot}`, "light", "variable", d, r, o), Et = this.transformCSS(e, `${$t}`, "dark", "variable", d, r, o);
    y = `${xt}${Et}`, g = [.../* @__PURE__ */ new Set([...wt, ...Tt, ...Nt])];
    let jt = this.transformCSS(e, `${_t}${Pt}color-scheme:light`, "light", "variable", d, r, o), Rt = this.transformCSS(e, `${At}color-scheme:dark`, "dark", "variable", d, r, o);
    S = `${jt}${Rt}`, M = [.../* @__PURE__ */ new Set([...kt, ...Lt, ...Ct])], D = N(p.css, { dt: K });
  }
  return { primitive: { css: f, tokens: h }, semantic: { css: y, tokens: g }, global: { css: S, tokens: M }, style: D };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: u, selector: i }) {
  var s, a, l;
  let c, m, p;
  if (v(t) && n.transform !== "strict") {
    let d = e.replace("-directive", ""), f = t, { colorScheme: h, extend: y, css: g } = f, S = k(f, ["colorScheme", "extend", "css"]), M = y || {}, { colorScheme: D } = M, q = k(M, ["colorScheme"]), I = h || {}, { dark: L } = I, A = k(I, ["dark"]), C = D || {}, { dark: W } = C, x = k(C, ["dark"]), F = v(S) ? this._toVariables({ [d]: T(T({}, S), q) }, n) : {}, H = v(A) ? this._toVariables({ [d]: T(T({}, A), x) }, n) : {}, E = v(L) ? this._toVariables({ [d]: T(T({}, L), W) }, n) : {}, [B, Y] = [(s = F.declarations) != null ? s : "", F.tokens || []], [U, Q] = [(a = H.declarations) != null ? a : "", H.tokens || []], [G, _] = [(l = E.declarations) != null ? l : "", E.tokens || []], $ = this.transformCSS(d, `${B}${U}`, "light", "variable", n, o, u, i), V = this.transformCSS(d, G, "dark", "variable", n, o, u, i);
    c = `${$}${V}`, m = [.../* @__PURE__ */ new Set([...Y, ...Q, ..._])], p = N(g, { dt: K });
  }
  return { css: c, tokens: m, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var u;
  let { preset: i, options: s } = t, a = (u = i?.components) == null ? void 0 : u[e];
  return this.getPreset({ name: e, preset: a, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var u, i;
  let s = e.replace("-directive", ""), { preset: a, options: l } = t, c = ((u = a?.components) == null ? void 0 : u[s]) || ((i = a?.directives) == null ? void 0 : i[s]);
  return this.getPreset({ name: s, preset: c, options: l, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${N(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: u }) {
  let i = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: u }), s = Object.entries(r).reduce((a, [l, c]) => a.push(`${l}="${c}"`) && a, []).join(" ");
  return Object.entries(i || {}).reduce((a, [l, c]) => {
    if (j(c) && Object.hasOwn(c, "css")) {
      let m = re(c.css), p = `${l}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${m}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: u }) {
  var i;
  let s = { name: e, theme: t, params: n, set: o, defaults: u }, a = (i = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : i.css, l = Object.entries(r).reduce((c, [m, p]) => c.push(`${m}="${p}"`) && c, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${l}>${re(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let u = function(s, a = {}, l = []) {
    if (l.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    l.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && oe.test(this.value)) {
      let m = this.value.trim().replace(oe, (p) => {
        var d;
        let f = p.slice(1, -1), h = this.tokens[f];
        if (!h) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let y = h.computed(s, a, l);
        return Array.isArray(y) && y.length === 2 ? `light-dark(${y[0].value},${y[1].value})` : (d = y?.value) != null ? d : "__UNRESOLVED__";
      });
      c = ct.test(m.replace(dt, "0")) ? `calc(${m})` : m;
    }
    return Ne(a.binding) && delete a.binding, l.pop(), { colorScheme: s, path: this.path, paths: a, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, i = (s, a, l) => {
    Object.entries(s).forEach(([c, m]) => {
      let p = z(c, t.variable.excludedKeyRegex) ? a : a ? `${a}.${Ie(c)}` : Ie(c), d = l ? `${l}.${c}` : c;
      j(m) ? i(m, p, d) : (o[p] || (o[p] = { paths: [], computed: (f, h = {}, y = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, h.binding, y);
        if (f && f !== "none") for (let g = 0; g < o[p].paths.length; g++) {
          let S = o[p].paths[g];
          if (S.scheme === f) return S.computed(f, h.binding, y);
        }
        return o[p].paths.map((g) => g.computed(g.scheme, h[g.scheme], y));
      } }), o[p].paths.push({ path: d, value: m, scheme: d.includes("colorScheme.light") ? "light" : d.includes("colorScheme.dark") ? "dark" : "none", computed: u, tokens: o }));
    });
  };
  return i(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((a) => !z(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), u = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(r = e[o]) == null ? void 0 : r.computed(u)].flat().filter((s) => s);
  return i.length === 1 ? i[0].value : i.reduce((s = {}, a) => {
    let l = a, { colorScheme: c } = l, m = k(l, ["colorScheme"]);
    return s[c] = m, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? X(v(t) ? `${e}${t},${e} ${t}` : e, r) : X(e, X(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, u, i, s) {
  if (v(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let l = this.getColorSchemeOption(o, i);
      t = n === "dark" ? l.reduce((c, { type: m, selector: p }) => (v(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, s, m, t)), c), "") : X(s ?? ":root,:host", t);
    }
    if (a) {
      let l = { name: "primeui" };
      j(a) && (l.name = N(a.name, { name: e, type: r })), v(l.name) && (t = X(`@layer ${l.name}`, t), u?.layerNames(l.name));
    }
    return t;
  }
  return "";
} }, b = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = be(T({}, t), { options: T(T({}, this.defaults.options), t.options) }), this._tokens = O.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.preset) || {};
}, get options() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(e) {
  this.update({ theme: e }), P.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = be(T({}, this.theme), { preset: e }), this._tokens = O.createTokens(e, this.defaults), this.clearLoadedStyleNames(), P.emit("preset:change", e), P.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = be(T({}, this.theme), { options: e }), this.clearLoadedStyleNames(), P.emit("options:change", e), P.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(e) {
  this._layerNames.add(e);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(e) {
  return this._loadedStyleNames.has(e);
}, setLoadedStyleName(e) {
  this._loadedStyleNames.add(e);
}, deleteLoadedStyleName(e) {
  this._loadedStyleNames.delete(e);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(e) {
  return O.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return O.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return O.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return O.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return O.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return O.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), P.emit(`theme:${t}:load`, e), !this._loadingStyles.size && P.emit("theme:load"));
} }, w = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
}, fn = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
function ae(e) {
  "@babel/helpers - typeof";
  return ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ae(e);
}
function We(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Fe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? We(Object(n), !0).forEach(function(r) {
      hn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : We(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function hn(e, t, n) {
  return (t = yn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function yn(e) {
  var t = gn(e, "string");
  return ae(t) == "symbol" ? t : t + "";
}
function gn(e, t) {
  if (ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ae(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function vn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Ae() && Ae().components ? Dt(e) : t ? e() : It(e);
}
var bn = 0;
function Sn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = me(!1), r = me(e), o = me(null), u = st() ? window.document : void 0, i = t.document, s = i === void 0 ? u : i, a = t.immediate, l = a === void 0 ? !0 : a, c = t.manual, m = c === void 0 ? !1 : c, p = t.name, d = p === void 0 ? "style_".concat(++bn) : p, f = t.id, h = f === void 0 ? void 0 : f, y = t.media, g = y === void 0 ? void 0 : y, S = t.nonce, M = S === void 0 ? void 0 : S, D = t.first, q = D === void 0 ? !1 : D, I = t.onMounted, L = I === void 0 ? void 0 : I, A = t.onUpdated, C = A === void 0 ? void 0 : A, W = t.onLoad, x = W === void 0 ? void 0 : W, F = t.props, H = F === void 0 ? {} : F, E = function() {
  }, B = function(Q) {
    var G = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var _ = Fe(Fe({}, H), G), $ = _.name || d, V = _.id || h, le = _.nonce || M;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat($, '"]')) || s.getElementById(V) || s.createElement("style"), o.value.isConnected || (r.value = Q || e, he(o.value, {
        type: "text/css",
        id: V,
        media: g,
        nonce: le
      }), q ? s.head.prepend(o.value) : s.head.appendChild(o.value), rn(o.value, "data-primevue-style-id", $), he(o.value, _), o.value.onload = function(Z) {
        return x?.(Z, {
          name: $
        });
      }, L?.($)), !n.value && (E = ne(r, function(Z) {
        o.value.textContent = Z, C?.($);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Y = function() {
    !s || !n.value || (E(), tn(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return l && !m && vn(B), {
    id: h,
    name: d,
    el: o,
    css: r,
    unload: Y,
    load: B,
    isLoaded: Mt(n)
  };
}
function ie(e) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ie(e);
}
var He, Be, Ue, Ve;
function ze(e, t) {
  return $n(e) || Tn(e, t) || On(e, t) || wn();
}
function wn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function On(e, t) {
  if (e) {
    if (typeof e == "string") return Ke(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ke(e, t) : void 0;
  }
}
function Ke(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Tn(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, u, i, s = [], a = !0, l = !1;
    try {
      if (u = (n = n.call(e)).next, t !== 0) for (; !(a = (r = u.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (c) {
      l = !0, o = c;
    } finally {
      try {
        if (!a && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (l) throw o;
      }
    }
    return s;
  }
}
function $n(e) {
  if (Array.isArray(e)) return e;
}
function qe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Se(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? qe(Object(n), !0).forEach(function(r) {
      Nn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qe(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Nn(e, t, n) {
  return (t = _n(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _n(e) {
  var t = kn(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function kn(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ie(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ce(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Pn = function(t) {
  var n = t.dt;
  return `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: `.concat(n("scrollbar.width"), `;
}
`);
}, Ln = {}, An = {}, J = {
  name: "base",
  css: Pn,
  style: fn,
  classes: Ln,
  inlineStyles: An,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(u) {
      return u;
    }, o = r(ue(He || (He = ce(["", ""])), t));
    return v(o) ? Sn(re(o), Se({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return b.transformCSS(n.name || t.name, "".concat(o).concat(ue(Be || (Be = ce(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return b.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return b.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return b.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return b.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return b.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: K
      }) || "", o = re(ue(Ue || (Ue = ce(["", "", ""])), r, t)), u = Object.entries(n).reduce(function(i, s) {
        var a = ze(s, 2), l = a[0], c = a[1];
        return i.push("".concat(l, '="').concat(c, '"')) && i;
      }, []).join(" ");
      return v(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(u, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return b.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [b.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), u = ue(Ve || (Ve = ce(["", ""])), N(this.style, {
        dt: K
      })), i = re(b.transformCSS(o, u)), s = Object.entries(n).reduce(function(a, l) {
        var c = ze(l, 2), m = c[0], p = c[1];
        return a.push("".concat(m, '="').concat(p, '"')) && a;
      }, []).join(" ");
      v(i) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(i, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Se(Se({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, de = at();
function se(e) {
  "@babel/helpers - typeof";
  return se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, se(e);
}
function Ye(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function pe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ye(Object(n), !0).forEach(function(r) {
      Cn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ye(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Cn(e, t, n) {
  return (t = xn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xn(e) {
  var t = En(e, "string");
  return se(t) == "symbol" ? t : t + "";
}
function En(e, t) {
  if (se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jn = {
  ripple: !1,
  inputStyle: null,
  inputVariant: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    fileChosenMessage: "{0} files",
    noFileChosenMessage: "No file chosen",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [w.STARTS_WITH, w.CONTAINS, w.NOT_CONTAINS, w.ENDS_WITH, w.EQUALS, w.NOT_EQUALS],
    numeric: [w.EQUALS, w.NOT_EQUALS, w.LESS_THAN, w.LESS_THAN_OR_EQUAL_TO, w.GREATER_THAN, w.GREATER_THAN_OR_EQUAL_TO],
    date: [w.DATE_IS, w.DATE_IS_NOT, w.DATE_BEFORE, w.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  theme: void 0,
  unstyled: !1,
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  csp: {
    nonce: void 0
  }
}, Rn = Symbol();
function Mn(e, t) {
  var n = {
    config: Wt(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Rn, n), Dn(), In(e, n), n;
}
var ee = [];
function Dn() {
  P.clear(), ee.forEach(function(e) {
    return e?.();
  }), ee = [];
}
function In(e, t) {
  var n = me(!1), r = function() {
    var l;
    if (((l = t.config) === null || l === void 0 ? void 0 : l.theme) !== "none" && !b.isStyleNameLoaded("common")) {
      var c, m, p = ((c = J.getCommonTheme) === null || c === void 0 ? void 0 : c.call(J)) || {}, d = p.primitive, f = p.semantic, h = p.global, y = p.style, g = {
        nonce: (m = t.config) === null || m === void 0 || (m = m.csp) === null || m === void 0 ? void 0 : m.nonce
      };
      J.load(d?.css, pe({
        name: "primitive-variables"
      }, g)), J.load(f?.css, pe({
        name: "semantic-variables"
      }, g)), J.load(h?.css, pe({
        name: "global-variables"
      }, g)), J.loadStyle(pe({
        name: "global-style"
      }, g), y), b.setLoadedStyleName("common");
    }
  };
  P.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = ne(t.config, function(a, l) {
    de.emit("config:change", {
      newValue: a,
      oldValue: l
    });
  }, {
    immediate: !0,
    deep: !0
  }), u = ne(function() {
    return t.config.ripple;
  }, function(a, l) {
    de.emit("config:ripple:change", {
      newValue: a,
      oldValue: l
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = ne(function() {
    return t.config.theme;
  }, function(a, l) {
    n.value || b.setTheme(a), t.config.unstyled || r(), n.value = !1, de.emit("config:theme:change", {
      newValue: a,
      oldValue: l
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ne(function() {
    return t.config.unstyled;
  }, function(a, l) {
    !a && t.config.theme && r(), de.emit("config:unstyled:change", {
      newValue: a,
      oldValue: l
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ee.push(o), ee.push(u), ee.push(i), ee.push(s);
}
var Wn = {
  install: function(t, n) {
    var r = Zt(jn, n);
    Mn(t, r);
  }
}, ht = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = st();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Fn(e, t, n, r, o, u) {
  return u.inline ? fe(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (Ft(), Ht(tt, {
    key: 1,
    to: n.appendTo
  }, [fe(e.$slots, "default")], 8, ["to"])) : nt("", !0);
}
ht.render = Fn;
const Hn = "data-wippy-overlay-layer";
function yt() {
  return typeof window < "u" && typeof window.document < "u";
}
function gt() {
  return yt() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Bn() {
  return gt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Un = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Vn = 0;
const ge = /* @__PURE__ */ new WeakMap();
function Qe(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function zn(e, t) {
  if (!Un.test(e.className))
    return;
  const n = e.style.cssText;
  Qe(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!ge.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Qe(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), ge.set(e, r);
  }
}
function _e(e) {
  const t = ge.get(e);
  t && (t.disconnect(), ge.delete(e));
}
function Kn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Te(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const ve = /* @__PURE__ */ new Set(), ke = /* @__PURE__ */ new WeakMap();
let Ge = !1, $e = !1;
function qn() {
  $e = !1;
  for (const e of ve) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && _e(t);
      ve.delete(e), ke.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Te(e);
  }
}
function Ze() {
  $e || ($e = !0, requestAnimationFrame(qn));
}
function Yn(e) {
  const t = document.createElement("div");
  t.setAttribute(Hn, "");
  const n = gt();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Te(t);
  const r = new MutationObserver((o) => {
    const u = t.__wippyAnchorName;
    for (const i of o) {
      if (u)
        for (const s of Array.from(i.addedNodes))
          s instanceof HTMLElement && zn(s, u);
      for (const s of Array.from(i.removedNodes))
        s instanceof HTMLElement && _e(s);
    }
    t.isConnected && t.childElementCount > 0 && Te(t);
  });
  return r.observe(t, { childList: !0 }), ke.set(t, r), ve.add(t), Ge || (Ge = !0, window.addEventListener("scroll", Ze, { capture: !0, passive: !0 }), window.addEventListener("resize", Ze, { passive: !0 })), t;
}
function Je(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Yn(e.hostRoot), Bn())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++Vn}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Xe(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && _e(t);
    ve.delete(e.layer), ke.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let et = !1;
function Qn() {
  if (et)
    return;
  et = !0;
  const e = ht;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    yt() && (this.hostRoot = Kn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Je(this), this.$watch("inline", (t) => {
      t ? Xe(this) : Je(this);
    })));
  }, e.render = function() {
    return this.inline ? fe(this.$slots, "default", { key: 0 }) : this.mounted ? Bt(tt, { key: 1, to: this.resolvedTarget || document.body }, [
      fe(this.$slots, "default")
    ]) : nt("", !0);
  }, e.unmounted = function() {
    Xe(this);
  };
}
const yr = {
  install: (e) => {
    Qn(), e.use(Wn, { theme: "none" });
  }
};
export {
  J as B,
  Zn as C,
  Qt as F,
  fr as I,
  dr as K,
  cr as L,
  P as N,
  yr as P,
  sr as Q,
  mr as R,
  b as S,
  ur as T,
  or as U,
  je as W,
  rn as _,
  R as a,
  te as b,
  qt as c,
  de as d,
  Re as e,
  pr as f,
  Ee as g,
  ir as h,
  j as i,
  lr as j,
  er as k,
  Ne as l,
  N as m,
  Jn as n,
  Xn as o,
  ht as p,
  tr as q,
  hr as r,
  v as s,
  nr as t,
  rr as v,
  ar as z
};
//# sourceMappingURL=primevue-plugin-BK4VDKFT.js.map
