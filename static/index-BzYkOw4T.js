import { hasInjectionContext as pt, inject as Se, effectScope as vn, ref as oe, markRaw as Ct, toRaw as le, watch as Nn, unref as Cn, isRef as wn, isReadonly as Pn, createApp as Rn } from "vue";
import { addCollection as An } from "@iconify/vue";
import { config as _t, addIcons as kn, on as Dn, applyThemeMode as he, host as Vn, hostCss as Ln, loadCss as Un } from "@wippy-fe/proxy";
var je = "data-wippy-visible";
function ht(e) {
  const t = e.getAttribute(je);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Mn = Object.defineProperty, $n = (e, t, n) => t in e ? Mn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, I = (e, t, n) => $n(e, typeof t != "symbol" ? t + "" : t, n), xn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], jn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Et(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Hn(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [i, a] of Object.entries(o)) {
            const l = typeof a == "string" ? Et(i) : null;
            l && t.add(l);
          }
          continue;
        }
        const s = typeof o == "string" ? Et(r) : null;
        s && t.add(s);
      }
  return [...t].sort();
}
function zn(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${jn} {
${t}
}`;
}
function Gn(e, t) {
  const n = zn(t);
  n && wt(e, n, "@wippy-fe/css-variables-bridge");
}
function Fn(e, t) {
  const r = (t ?? xn).map(async (o) => {
    const s = Ln[o];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Un(s);
    } catch (i) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${s}):`, i), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const s of o) {
      if (!s)
        continue;
      const i = document.createElement("style");
      i.textContent = s, i.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(i);
    }
  });
}
function Bn(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function wt(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Kn(e, t) {
  wt(e, t, "@wippy-fe/custom-css");
}
function Pt(e) {
  return e.__wippyHost ?? null;
}
function Wn(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Yn(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const r = Number.parseFloat(t);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(t, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(t);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Le(e, t) {
  const n = {}, r = [];
  for (const [o, s] of Object.entries(t.properties)) {
    const i = e.getAttribute(o), a = Wn(o);
    if (i === null) {
      s.default !== void 0 && (n[a] = s.default);
      continue;
    }
    const l = Yn(o, i, s);
    l.error ? r.push(l.error) : n[a] = l.value;
  }
  return { props: n, errors: r };
}
var qn = class {
  constructor(e, t) {
    I(this, "_props"), I(this, "_errors"), I(this, "_content"), I(this, "_hostVisibility"), I(this, "_propsListeners", /* @__PURE__ */ new Set()), I(this, "_contentListeners", /* @__PURE__ */ new Set()), I(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), I(this, "_disposed", !1), I(this, "_emitToDom"), I(this, "props"), I(this, "events"), I(this, "content"), I(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, o) {
        return n._subscribeProps(r, o);
      }
    }, this.events = {
      emit(r, o) {
        n._disposed || n._emitToDom(r, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, o) {
        return n._subscribeContent(r, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, o) {
        return n._subscribeHostVisibility(r, o);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const n of this._propsListeners)
        n(e, t);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const t of this._contentListeners)
        t(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, t) {
    if (!(this._disposed || e === t)) {
      this._hostVisibility = e;
      for (const n of this._hostVisibilityListeners)
        n(e, t);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), t?.immediate && e(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const n = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Zn = class extends HTMLElement {
  constructor() {
    super(), I(this, "_internals"), I(this, "_contentObserver", null), I(this, "_initialized", !1), I(this, "_container", null), I(this, "_reactive", null), I(this, "_lastProps", null), I(this, "_lastErrors", []), I(this, "_lastContent", null), I(this, "_themeUnsub", null), I(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = ht(this);
  }
  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig() {
    return { propsSchema: { properties: {} } };
  }
  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes() {
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), n = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...n, je])];
  }
  /**
   * Host-owned logical activity. `null` means no host manages this element.
   * It is not CSS visibility or viewport intersection.
   */
  get hostVisible() {
    return this._hostVisible;
  }
  /**
   * Panel-scoped `host` wrapper attached by the managed-layout shell's
   * content resolvers (`ComponentResolver` / `WebComponentPackageLoader`).
   *
   * Inside a managed-layout panel, this is a wrapper around the universal
   * `host` API where context-aware calls (`layout.broadcast / send / on`)
   * are routed through the panel-bound bus — so `sourcePanelId` is
   * attributed correctly without postMessage indirection. Layout
   * mutations and other host methods pass through unchanged.
   *
   * `null` outside a managed-layout context (compat shell, chat sidebar,
   * standalone playground). Subclass code that needs a host in those
   * cases can fall back to `import { host } from '@wippy-fe/proxy'`.
   */
  get host() {
    return Pt(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, t) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: t
    }));
  }
  /**
   * Opt-in reactive adapter — framework-agnostic. Subscribe to prop
   * changes, content changes, or emit typed events from a non-Vue
   * consumer without re-rolling reactivity.
   *
   * ```ts
   * class MyEl extends WippyElement<{ count: number }, { tick: { n: number } }> {
   *   protected onMount() {
   *     const ctrl = new AbortController()
   *     this.reactive.props.subscribe(({ count }) => {
   *       this.shadowRoot!.querySelector('.n')!.textContent = String(count)
   *     }, { signal: ctrl.signal, immediate: true })
   *   }
   *   tick(n: number) { this.reactive.events.emit('tick', { n }) }
   * }
   * ```
   *
   * Allocation cost is zero unless this getter is touched. Disposed on
   * `disconnectedCallback`; a fresh adapter is allocated on the next
   * access after reconnect.
   */
  get reactive() {
    if (!this._reactive) {
      const e = this.constructor.wippyConfig, t = !!e.contentTemplate;
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const s = Le(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), n = s.props, r = s.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new qn(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let r;
      if (t)
        r = this._container;
      else {
        this.onInit(n), e.inlineCss && Bn(n, e.inlineCss);
        try {
          const u = _t?.theming, E = Hn(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          Gn(n, E);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = _t?.theming, E = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            E && Kn(n, E);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Fn(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const l = e.containerClasses ?? [];
        l.length > 0 && r.classList.add(...l), n.appendChild(r), this._container = r, kn(An);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Dn("@theme", (l) => this._applyTheme(l)));
      const { props: o, errors: s } = Le(this, e.propsSchema);
      e.validateProps && s.push(...e.validateProps(o));
      const i = o;
      this._lastProps = i, this._lastErrors = s;
      let a = null;
      e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(e.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, i, s, a, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (e) {
      this.onError(e), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: e instanceof Error ? e.message : String(e),
        error: e
      });
    }
  }
  /**
   * Applies a forced theme mode to this host element AND the shadow container.
   * The container class drives in-shadow selectors (Tailwind `dark:` utilities,
   * `.w-theme-dark &`); the host-element class drives `:host(.w-theme-*)`
   * selectors. On `@theme` broadcasts the resolved `mode` is passed in directly
   * (don't re-read `getThemeMode()` — the proxy's config-vs-emit order isn't a
   * contract); on the initial connect it defaults to the host's current mode.
   * No-op for an older proxy without `getThemeMode` — `applyThemeMode` clamps
   * `undefined` to 'auto'.
   */
  _applyTheme(e = Vn.getThemeMode?.()) {
    he(e, this), this._container && he(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), he("auto", this), this._container && he("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === je) {
      const a = this._hostVisible, l = ht(this);
      if (l === a)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, a), this.onHostVisibilityChanged(l, a));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: s } = Le(this, r.propsSchema);
    r.validateProps && s.push(...r.validateProps(o));
    const i = o;
    this._lastProps = i, this._lastErrors = s, this._reactive?.notifyProps(i, s), this.onPropsChanged(i, s);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(e) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(e) {
    console.error(`${this.constructor.name} initialization failed:`, e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, t) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, t) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(e) {
    return this.querySelector(`template[data-type="${e}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function Xn(e) {
  return e.__wippyHostBus ?? null;
}
function Jn(e) {
  return e.dataset.wippyPanelId ?? null;
}
function Qn(e) {
  const t = `[${e.name}] ${e.message}`, n = [];
  return e.fix && n.push(`fix: ${e.fix}`), e.sources?.length && n.push(`sources: ${e.sources.join(", ")}`), e.docs && n.push(`see: ${e.docs}`), n.length === 0 ? t : [t, ...n.map((r, o) => `${o < n.length - 1 ? "├▶" : "╰▶"} ${r}`)].join(`
`);
}
function Ue(e, ...t) {
  return typeof e == "function" ? e(...t) : e;
}
// @__NO_SIDE_EFFECTS__
function er({ method: e = "warn", formatter: t = Qn } = {}) {
  return (n, { method: r = e } = {}) => {
    console[r](t(n));
  };
}
const tr = Error.captureStackTrace;
var nr = class Rt extends Error {
  name;
  /**
  * The diagnostic code, e.g. `MATH_E001`.
  * Also appears as the `name` property.
  */
  code;
  /**
  * URL to extended documentation for this diagnostic code.
  * Auto-generated from {@link DefineDiagnosticsOptions.docsBase}.
  */
  docs;
  /**
  * Optional actionable instructions on how to resolve the problem.
  */
  fix;
  /**
  * Locations in user code that contributed to this diagnostic, in
  * `file:line:column` format. Relevant when the stack trace doesn't reflect
  * the user's source (e.g. compilers, bundlers), otherwise redundant with the
  * stack and should be omitted.
  */
  sources;
  /**
  * Structured information associated with this diagnostic code.
  */
  data;
  /**
  * Alias for {@link Error.message}: the reason this diagnostic was raised.
  */
  get why() {
    return this.message;
  }
  /**
  * @param init        structured initializer; `why` is required
  * @param captureFrom V8 stack-cutoff frame. Defaults to {@link Diagnostic}
  * so the top of the trace is the `new Diagnostic(...)` call site.
  * `defineDiagnostics` passes its action method to strip its own frames too.
  * Ignored on engines without `Error.captureStackTrace`.
  */
  constructor(t, n = Rt) {
    super(t.why, { cause: t.cause }), this.code = this.name = t.code, this.fix = t.fix, this.docs = t.docs, this.sources = t.sources, this.data = t.data, tr?.(this, n);
  }
  /**
  * Converts the diagnostic into a serializable structured object.
  */
  toJSON() {
    return {
      name: this.name,
      why: this.why,
      fix: this.fix,
      docs: this.docs,
      sources: this.sources,
      cause: this.cause,
      data: this.data,
      stack: this.stack
    };
  }
};
function rr(e, t) {
  return typeof e == "string" ? `${e}/${t.toLowerCase()}` : e?.(t);
}
// @__NO_SIDE_EFFECTS__
function or(e) {
  const t = e.reporters ?? [], n = {}, { docsBase: r } = e;
  for (const o of Object.keys(e.codes)) {
    const s = e.codes[o], i = s.docs === !1 ? void 0 : s.docs || rr(r, o), a = (l = {}, u = {}) => {
      const E = new nr({
        code: o,
        why: Ue(s.why, l),
        fix: Ue(s.fix, l),
        docs: i,
        cause: l.cause,
        sources: l.sources,
        data: Ue(s.data, l)
      }, a);
      for (const c of t) c(E, u);
      return E;
    };
    n[o] = a;
  }
  return n;
}
var sr = Object.create, At = Object.defineProperty, ir = Object.getOwnPropertyDescriptor, ar = Object.getOwnPropertyNames, lr = Object.getPrototypeOf, cr = Object.prototype.hasOwnProperty, ur = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), fr = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function") for (var o = ar(t), s = 0, i = o.length, a; s < i; s++)
    a = o[s], !cr.call(e, a) && a !== n && At(e, a, {
      get: ((l) => t[l]).bind(null, a),
      enumerable: !(r = ir(t, a)) || r.enumerable
    });
  return e;
}, dr = (e, t, n) => (n = e != null ? sr(lr(e)) : {}, fr(At(n, "default", {
  value: e,
  enumerable: !0
}), e));
const kt = typeof navigator < "u", d = typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : typeof global < "u" ? global : {};
typeof d.chrome < "u" && d.chrome.devtools;
kt && (d.self, d.top);
typeof navigator < "u" && navigator.userAgent?.toLowerCase().includes("electron");
var pr = /* @__PURE__ */ dr((/* @__PURE__ */ ur(((e, t) => {
  t.exports = r;
  function n(s) {
    return s instanceof Buffer ? Buffer.from(s) : new s.constructor(s.buffer.slice(), s.byteOffset, s.length);
  }
  function r(s) {
    if (s = s || {}, s.circles) return o(s);
    const i = /* @__PURE__ */ new Map();
    if (i.set(Date, (c) => new Date(c)), i.set(Map, (c, g) => new Map(l(Array.from(c), g))), i.set(Set, (c, g) => new Set(l(Array.from(c), g))), s.constructorHandlers) for (const c of s.constructorHandlers) i.set(c[0], c[1]);
    let a = null;
    return s.proto ? E : u;
    function l(c, g) {
      const f = Object.keys(c), p = new Array(f.length);
      for (let m = 0; m < f.length; m++) {
        const h = f[m], _ = c[h];
        typeof _ != "object" || _ === null ? p[h] = _ : _.constructor !== Object && (a = i.get(_.constructor)) ? p[h] = a(_, g) : ArrayBuffer.isView(_) ? p[h] = n(_) : p[h] = g(_);
      }
      return p;
    }
    function u(c) {
      if (typeof c != "object" || c === null) return c;
      if (Array.isArray(c)) return l(c, u);
      if (c.constructor !== Object && (a = i.get(c.constructor))) return a(c, u);
      const g = {};
      for (const f in c) {
        if (Object.hasOwnProperty.call(c, f) === !1) continue;
        const p = c[f];
        typeof p != "object" || p === null ? g[f] = p : p.constructor !== Object && (a = i.get(p.constructor)) ? g[f] = a(p, u) : ArrayBuffer.isView(p) ? g[f] = n(p) : g[f] = u(p);
      }
      return g;
    }
    function E(c) {
      if (typeof c != "object" || c === null) return c;
      if (Array.isArray(c)) return l(c, E);
      if (c.constructor !== Object && (a = i.get(c.constructor))) return a(c, E);
      const g = {};
      for (const f in c) {
        const p = c[f];
        typeof p != "object" || p === null ? g[f] = p : p.constructor !== Object && (a = i.get(p.constructor)) ? g[f] = a(p, E) : ArrayBuffer.isView(p) ? g[f] = n(p) : g[f] = E(p);
      }
      return g;
    }
  }
  function o(s) {
    const i = [], a = [], l = /* @__PURE__ */ new Map();
    if (l.set(Date, (f) => new Date(f)), l.set(Map, (f, p) => new Map(E(Array.from(f), p))), l.set(Set, (f, p) => new Set(E(Array.from(f), p))), s.constructorHandlers) for (const f of s.constructorHandlers) l.set(f[0], f[1]);
    let u = null;
    return s.proto ? g : c;
    function E(f, p) {
      const m = Object.keys(f), h = new Array(m.length);
      for (let _ = 0; _ < m.length; _++) {
        const b = m[_], T = f[b];
        if (typeof T != "object" || T === null) h[b] = T;
        else if (T.constructor !== Object && (u = l.get(T.constructor))) h[b] = u(T, p);
        else if (ArrayBuffer.isView(T)) h[b] = n(T);
        else {
          const V = i.indexOf(T);
          V !== -1 ? h[b] = a[V] : h[b] = p(T);
        }
      }
      return h;
    }
    function c(f) {
      if (typeof f != "object" || f === null) return f;
      if (Array.isArray(f)) return E(f, c);
      if (f.constructor !== Object && (u = l.get(f.constructor))) return u(f, c);
      const p = {};
      i.push(f), a.push(p);
      for (const m in f) {
        if (Object.hasOwnProperty.call(f, m) === !1) continue;
        const h = f[m];
        if (typeof h != "object" || h === null) p[m] = h;
        else if (h.constructor !== Object && (u = l.get(h.constructor))) p[m] = u(h, c);
        else if (ArrayBuffer.isView(h)) p[m] = n(h);
        else {
          const _ = i.indexOf(h);
          _ !== -1 ? p[m] = a[_] : p[m] = c(h);
        }
      }
      return i.pop(), a.pop(), p;
    }
    function g(f) {
      if (typeof f != "object" || f === null) return f;
      if (Array.isArray(f)) return E(f, g);
      if (f.constructor !== Object && (u = l.get(f.constructor))) return u(f, g);
      const p = {};
      i.push(f), a.push(p);
      for (const m in f) {
        const h = f[m];
        if (typeof h != "object" || h === null) p[m] = h;
        else if (h.constructor !== Object && (u = l.get(h.constructor))) p[m] = u(h, g);
        else if (ArrayBuffer.isView(h)) p[m] = n(h);
        else {
          const _ = i.indexOf(h);
          _ !== -1 ? p[m] = a[_] : p[m] = g(h);
        }
      }
      return i.pop(), a.pop(), p;
    }
  }
})))());
const _r = /(?:^|[-_/])(\w)/g;
function hr(e, t) {
  return t ? t.toUpperCase() : "";
}
function Er(e) {
  return e && `${e}`.replace(_r, hr);
}
function gr(e, t) {
  let n = e.replace(/^[a-z]:/i, "").replace(/\\/g, "/");
  n.endsWith(`index${t}`) && (n = n.replace(`/index${t}`, t));
  const r = n.lastIndexOf("/"), o = n.substring(r + 1);
  {
    const s = o.lastIndexOf(t);
    return o.substring(0, s);
  }
}
const gt = (0, pr.default)({ circles: !0 }), mr = { trailing: !0 };
function X(e, t = 25, n = {}) {
  if (n = {
    ...mr,
    ...n
  }, !Number.isFinite(t)) throw new TypeError("Expected `wait` to be a finite number");
  let r, o, s = [], i, a;
  const l = (c, g) => (i = yr(e, c, g), i.finally(() => {
    if (i = null, n.trailing && a && !o) {
      const f = l(c, a);
      return a = null, f;
    }
  }), i), u = function(...c) {
    return n.trailing && (a = c), i || new Promise((g) => {
      const f = !o && n.leading;
      clearTimeout(o), o = setTimeout(() => {
        o = null;
        const p = n.leading ? r : l(this, c);
        a = null;
        for (const m of s) m(p);
        s = [];
      }, t), f ? (r = l(this, c), g(r)) : s.push(g);
    });
  }, E = (c) => {
    c && (clearTimeout(c), o = null);
  };
  return u.isPending = () => !!o, u.cancel = () => {
    E(o), s = [], a = null;
  }, u.flush = () => {
    if (E(o), !a || i) return;
    const c = a;
    return a = null, l(this, c);
  }, u;
}
async function yr(e, t, n) {
  return await e.apply(t, n);
}
function He(e, t = {}, n) {
  for (const r in e) {
    const o = e[r], s = n ? `${n}:${r}` : r;
    typeof o == "object" && o !== null ? He(o, t, s) : typeof o == "function" && (t[s] = o);
  }
  return t;
}
const Tr = { run: (e) => e() }, Or = () => Tr, Dt = typeof console.createTask < "u" ? console.createTask : Or;
function Sr(e, t) {
  const n = t.shift(), r = Dt(n);
  return e.reduce(
    (o, s) => o.then(() => r.run(() => s(...t))),
    Promise.resolve()
  );
}
function br(e, t) {
  const n = t.shift(), r = Dt(n);
  return Promise.all(e.map((o) => r.run(() => o(...t))));
}
function Me(e, t) {
  for (const n of [...e])
    n(t);
}
class Ir {
  constructor() {
    this._hooks = {}, this._before = void 0, this._after = void 0, this._deprecatedMessages = void 0, this._deprecatedHooks = {}, this.hook = this.hook.bind(this), this.callHook = this.callHook.bind(this), this.callHookWith = this.callHookWith.bind(this);
  }
  hook(t, n, r = {}) {
    if (!t || typeof n != "function")
      return () => {
      };
    const o = t;
    let s;
    for (; this._deprecatedHooks[t]; )
      s = this._deprecatedHooks[t], t = s.to;
    if (s && !r.allowDeprecated) {
      let i = s.message;
      i || (i = `${o} hook has been deprecated` + (s.to ? `, please use ${s.to}` : "")), this._deprecatedMessages || (this._deprecatedMessages = /* @__PURE__ */ new Set()), this._deprecatedMessages.has(i) || (console.warn(i), this._deprecatedMessages.add(i));
    }
    if (!n.name)
      try {
        Object.defineProperty(n, "name", {
          get: () => "_" + t.replace(/\W+/g, "_") + "_hook_cb",
          configurable: !0
        });
      } catch {
      }
    return this._hooks[t] = this._hooks[t] || [], this._hooks[t].push(n), () => {
      n && (this.removeHook(t, n), n = void 0);
    };
  }
  hookOnce(t, n) {
    let r, o = (...s) => (typeof r == "function" && r(), r = void 0, o = void 0, n(...s));
    return r = this.hook(t, o), r;
  }
  removeHook(t, n) {
    if (this._hooks[t]) {
      const r = this._hooks[t].indexOf(n);
      r !== -1 && this._hooks[t].splice(r, 1), this._hooks[t].length === 0 && delete this._hooks[t];
    }
  }
  deprecateHook(t, n) {
    this._deprecatedHooks[t] = typeof n == "string" ? { to: n } : n;
    const r = this._hooks[t] || [];
    delete this._hooks[t];
    for (const o of r)
      this.hook(t, o);
  }
  deprecateHooks(t) {
    Object.assign(this._deprecatedHooks, t);
    for (const n in t)
      this.deprecateHook(n, t[n]);
  }
  addHooks(t) {
    const n = He(t), r = Object.keys(n).map(
      (o) => this.hook(o, n[o])
    );
    return () => {
      for (const o of r.splice(0, r.length))
        o();
    };
  }
  removeHooks(t) {
    const n = He(t);
    for (const r in n)
      this.removeHook(r, n[r]);
  }
  removeAllHooks() {
    for (const t in this._hooks)
      delete this._hooks[t];
  }
  callHook(t, ...n) {
    return n.unshift(t), this.callHookWith(Sr, t, ...n);
  }
  callHookParallel(t, ...n) {
    return n.unshift(t), this.callHookWith(br, t, ...n);
  }
  callHookWith(t, n, ...r) {
    const o = this._before || this._after ? { name: n, args: r, context: {} } : void 0;
    this._before && Me(this._before, o);
    const s = t(
      n in this._hooks ? [...this._hooks[n]] : [],
      r
    );
    return s instanceof Promise ? s.finally(() => {
      this._after && o && Me(this._after, o);
    }) : (this._after && o && Me(this._after, o), s);
  }
  beforeEach(t) {
    return this._before = this._before || [], this._before.push(t), () => {
      if (this._before !== void 0) {
        const n = this._before.indexOf(t);
        n !== -1 && this._before.splice(n, 1);
      }
    };
  }
  afterEach(t) {
    return this._after = this._after || [], this._after.push(t), () => {
      if (this._after !== void 0) {
        const n = this._after.indexOf(t);
        n !== -1 && this._after.splice(n, 1);
      }
    };
  }
}
function Vt() {
  return new Ir();
}
var vr = Object.create, Lt = Object.defineProperty, Nr = Object.getOwnPropertyDescriptor, Cr = Object.getOwnPropertyNames, wr = Object.getPrototypeOf, Pr = Object.prototype.hasOwnProperty, Ut = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Rr = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function") for (var o = Cr(t), s = 0, i = o.length, a; s < i; s++)
    a = o[s], !Pr.call(e, a) && a !== n && Lt(e, a, {
      get: ((l) => t[l]).bind(null, a),
      enumerable: !(r = Nr(t, a)) || r.enumerable
    });
  return e;
}, Ar = (e, t, n) => (n = e != null ? vr(wr(e)) : {}, Rr(Lt(n, "default", {
  value: e,
  enumerable: !0
}), e));
function kr(e) {
  if (typeof e == "function") return e.displayName || e.name || e.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ || "";
  const t = e.name || e._componentTag || e.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ || e.__name;
  return t === "index" && e.__file?.endsWith("index.vue") ? "" : t;
}
function Dr(e) {
  const t = e.__file;
  if (t) return Er(gr(t, ".vue"));
}
function mt(e, t) {
  return e.type.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ = t, t;
}
function Je(e) {
  if (e.__VUE_DEVTOOLS_NEXT_APP_RECORD__) return e.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
  if (e.root) return e.appContext.app.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
}
function Mt(e) {
  const t = e.subTree?.type, n = Je(e);
  return n ? n?.types?.Fragment === t : !1;
}
function we(e) {
  const t = kr(e?.type || {});
  if (t) return t;
  if (e?.root === e) return "Root";
  for (const r in e.parent?.type?.components) if (e.parent.type.components[r] === e?.type) return mt(e, r);
  for (const r in e.appContext?.components) if (e.appContext.components[r] === e?.type) return mt(e, r);
  const n = Dr(e?.type || {});
  return n || "Anonymous Component";
}
function Vr(e) {
  return `${e?.appContext?.app?.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__ ?? 0}:${e === e?.root ? "root" : e.uid}`;
}
function ze(e, t) {
  return t = t || `${e.id}:root`, e.instanceMap.get(t) || e.instanceMap.get(":root");
}
function Lr() {
  const e = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width() {
      return e.right - e.left;
    },
    get height() {
      return e.bottom - e.top;
    }
  };
  return e;
}
let Ee;
function Ur(e) {
  return Ee || (Ee = document.createRange()), Ee.selectNode(e), Ee.getBoundingClientRect();
}
function Mr(e) {
  const t = Lr();
  if (!e.children) return t;
  for (let n = 0, r = e.children.length; n < r; n++) {
    const o = e.children[n];
    let s;
    if (o.component) s = B(o.component);
    else if (o.el) {
      const i = o.el;
      i.nodeType === 1 || i.getBoundingClientRect ? s = i.getBoundingClientRect() : i.nodeType === 3 && i.data.trim() && (s = Ur(i));
    }
    s && $r(t, s);
  }
  return t;
}
function $r(e, t) {
  return (!e.top || t.top < e.top) && (e.top = t.top), (!e.bottom || t.bottom > e.bottom) && (e.bottom = t.bottom), (!e.left || t.left < e.left) && (e.left = t.left), (!e.right || t.right > e.right) && (e.right = t.right), e;
}
const yt = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0
};
function B(e) {
  const t = e.subTree.el;
  return typeof window > "u" ? yt : Mt(e) ? Mr(e.subTree) : t?.nodeType === 1 ? t?.getBoundingClientRect() : e.subTree.component ? B(e.subTree.component) : yt;
}
function Qe(e) {
  return Mt(e) ? xr(e.subTree) : e.subTree ? [e.subTree.el] : [];
}
function xr(e) {
  if (!e.children) return [];
  const t = [];
  return e.children.forEach((n) => {
    n.component ? t.push(...Qe(n.component)) : n?.el && t.push(n.el);
  }), t;
}
const $t = "__vue-devtools-component-inspector__", xt = "__vue-devtools-component-inspector__card__", jt = "__vue-devtools-component-inspector__name__", Ht = "__vue-devtools-component-inspector__indicator__", zt = {
  display: "block",
  zIndex: 2147483640,
  position: "fixed",
  backgroundColor: "#42b88325",
  border: "1px solid #42b88350",
  borderRadius: "5px",
  transition: "all 0.1s ease-in",
  pointerEvents: "none"
}, jr = {
  fontFamily: "Arial, Helvetica, sans-serif",
  padding: "5px 8px",
  borderRadius: "4px",
  textAlign: "left",
  position: "absolute",
  left: 0,
  color: "#e9e9e9",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "24px",
  backgroundColor: "#42b883",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
}, Hr = {
  display: "inline-block",
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: "12px",
  opacity: 0.7
};
function Q() {
  return document.getElementById($t);
}
function zr() {
  return document.getElementById(xt);
}
function Gr() {
  return document.getElementById(Ht);
}
function Fr() {
  return document.getElementById(jt);
}
function et(e) {
  return {
    left: `${Math.round(e.left * 100) / 100}px`,
    top: `${Math.round(e.top * 100) / 100}px`,
    width: `${Math.round(e.width * 100) / 100}px`,
    height: `${Math.round(e.height * 100) / 100}px`
  };
}
function tt(e) {
  const t = document.createElement("div");
  t.id = e.elementId ?? $t, Object.assign(t.style, {
    ...zt,
    ...et(e.bounds),
    ...e.style
  });
  const n = document.createElement("span");
  n.id = xt, Object.assign(n.style, {
    ...jr,
    top: e.bounds.top < 35 ? 0 : "-35px"
  });
  const r = document.createElement("span");
  r.id = jt, r.innerHTML = `&lt;${e.name}&gt;&nbsp;&nbsp;`;
  const o = document.createElement("i");
  return o.id = Ht, o.innerHTML = `${Math.round(e.bounds.width * 100) / 100} x ${Math.round(e.bounds.height * 100) / 100}`, Object.assign(o.style, Hr), n.appendChild(r), n.appendChild(o), t.appendChild(n), document.body.appendChild(t), t;
}
function nt(e) {
  const t = Q(), n = zr(), r = Fr(), o = Gr();
  t && (Object.assign(t.style, {
    ...zt,
    ...et(e.bounds)
  }), Object.assign(n.style, { top: e.bounds.top < 35 ? 0 : "-35px" }), r.innerHTML = `&lt;${e.name}&gt;&nbsp;&nbsp;`, o.innerHTML = `${Math.round(e.bounds.width * 100) / 100} x ${Math.round(e.bounds.height * 100) / 100}`);
}
function Br(e) {
  const t = B(e);
  if (!t.width && !t.height) return;
  const n = we(e);
  Q() ? nt({
    bounds: t,
    name: n
  }) : tt({
    bounds: t,
    name: n
  });
}
function Gt() {
  const e = Q();
  e && (e.style.display = "none");
}
let Ge = null;
function Fe(e) {
  const t = e.target;
  if (t) {
    const n = t.__vueParentComponent;
    if (n && (Ge = n, n.vnode.el)) {
      const r = B(n), o = we(n);
      Q() ? nt({
        bounds: r,
        name: o
      }) : tt({
        bounds: r,
        name: o
      });
    }
  }
}
function Kr(e, t) {
  e.preventDefault(), e.stopPropagation(), Ge && t(Vr(Ge));
}
let be = null;
function Wr() {
  Gt(), window.removeEventListener("mouseover", Fe), window.removeEventListener("click", be, !0), be = null;
}
function Yr() {
  return window.addEventListener("mouseover", Fe), new Promise((e) => {
    function t(n) {
      n.preventDefault(), n.stopPropagation(), Kr(n, (r) => {
        window.removeEventListener("click", t, !0), be = null, window.removeEventListener("mouseover", Fe);
        const o = Q();
        o && (o.style.display = "none"), e(JSON.stringify({ id: r }));
      });
    }
    be = t, window.addEventListener("click", t, !0);
  });
}
function qr(e) {
  const t = ze(P.value, e.id);
  if (t) {
    const [n] = Qe(t);
    if (typeof n.scrollIntoView == "function") n.scrollIntoView({ behavior: "smooth" });
    else {
      const r = B(t), o = document.createElement("div"), s = {
        ...et(r),
        position: "absolute"
      };
      Object.assign(o.style, s), document.body.appendChild(o), o.scrollIntoView({ behavior: "smooth" }), setTimeout(() => {
        document.body.removeChild(o);
      }, 2e3);
    }
    setTimeout(() => {
      const r = B(t);
      if (r.width || r.height) {
        const o = we(t), s = Q();
        s ? nt({
          ...e,
          name: o,
          bounds: r
        }) : tt({
          ...e,
          name: o,
          bounds: r
        }), setTimeout(() => {
          s && (s.style.display = "none");
        }, 1500);
      }
    }, 1200);
  }
}
d.__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__ ??= !0;
function Zr(e) {
  let t = 0;
  const n = setInterval(() => {
    d.__VUE_INSPECTOR__ && (clearInterval(n), t += 30, e()), t >= 5e3 && clearInterval(n);
  }, 30);
}
function Xr() {
  const e = d.__VUE_INSPECTOR__, t = e.openInEditor;
  e.openInEditor = async (...n) => {
    e.disable(), t(...n);
  };
}
function Jr() {
  return new Promise((e) => {
    function t() {
      Xr(), e(d.__VUE_INSPECTOR__);
    }
    d.__VUE_INSPECTOR__ ? t() : Zr(() => {
      t();
    });
  });
}
let Ie = /* @__PURE__ */ (function(e) {
  return e.SKIP = "__v_skip", e.IS_REACTIVE = "__v_isReactive", e.IS_READONLY = "__v_isReadonly", e.IS_SHALLOW = "__v_isShallow", e.RAW = "__v_raw", e;
})({});
function Qr(e) {
  return !!(e && e[Ie.IS_READONLY]);
}
function Ft(e) {
  return Qr(e) ? Ft(e[Ie.RAW]) : !!(e && e[Ie.IS_REACTIVE]);
}
function $e(e) {
  return !!(e && e.__v_isRef === !0);
}
function se(e) {
  const t = e && e[Ie.RAW];
  return t ? se(t) : e;
}
var eo = class {
  constructor() {
    this.refEditor = new to();
  }
  set(e, t, n, r) {
    const o = Array.isArray(t) ? t : t.split(".");
    for (; o.length > 1; ) {
      const a = o.shift();
      e instanceof Map ? e = e.get(a) : e instanceof Set ? e = Array.from(e.values())[a] : e = e[a], this.refEditor.isRef(e) && (e = this.refEditor.get(e));
    }
    const s = o[0], i = this.refEditor.get(e)[s];
    r ? r(e, s, n) : this.refEditor.isRef(i) ? this.refEditor.set(i, n) : e[s] = n;
  }
  get(e, t) {
    const n = Array.isArray(t) ? t : t.split(".");
    for (let r = 0; r < n.length; r++)
      if (e instanceof Map ? e = e.get(n[r]) : e = e[n[r]], this.refEditor.isRef(e) && (e = this.refEditor.get(e)), !e) return;
    return e;
  }
  has(e, t, n = !1) {
    if (typeof e > "u") return !1;
    const r = Array.isArray(t) ? t.slice() : t.split("."), o = n ? 2 : 1;
    for (; e && r.length > o; ) {
      const s = r.shift();
      e = e[s], this.refEditor.isRef(e) && (e = this.refEditor.get(e));
    }
    return e != null && Object.prototype.hasOwnProperty.call(e, r[0]);
  }
  createDefaultSetCallback(e) {
    return (t, n, r) => {
      if ((e.remove || e.newKey) && (Array.isArray(t) ? t.splice(n, 1) : se(t) instanceof Map ? t.delete(n) : se(t) instanceof Set ? t.delete(Array.from(t.values())[n]) : Reflect.deleteProperty(t, n)), !e.remove) {
        const o = t[e.newKey || n];
        this.refEditor.isRef(o) ? this.refEditor.set(o, r) : se(t) instanceof Map ? t.set(e.newKey || n, r) : se(t) instanceof Set ? t.add(r) : t[e.newKey || n] = r;
      }
    };
  }
}, to = class {
  set(e, t) {
    if ($e(e)) e.value = t;
    else {
      if (e instanceof Set && Array.isArray(t)) {
        e.clear(), t.forEach((o) => e.add(o));
        return;
      }
      const n = Object.keys(t);
      if (e instanceof Map) {
        const o = new Set(e.keys());
        n.forEach((s) => {
          e.set(s, Reflect.get(t, s)), o.delete(s);
        }), o.forEach((s) => e.delete(s));
        return;
      }
      const r = new Set(Object.keys(e));
      n.forEach((o) => {
        Reflect.set(e, o, Reflect.get(t, o)), r.delete(o);
      }), r.forEach((o) => Reflect.deleteProperty(e, o));
    }
  }
  get(e) {
    return $e(e) ? e.value : e;
  }
  isRef(e) {
    return $e(e) || Ft(e);
  }
};
const no = "__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS_STATE__";
function ro() {
  if (typeof window > "u" || !kt || typeof localStorage > "u" || localStorage === null) return {
    recordingState: !1,
    mouseEventEnabled: !1,
    keyboardEventEnabled: !1,
    componentEventEnabled: !1,
    performanceEventEnabled: !1,
    selected: ""
  };
  const e = typeof localStorage.getItem < "u" ? localStorage.getItem(no) : null;
  return e ? JSON.parse(e) : {
    recordingState: !1,
    mouseEventEnabled: !1,
    keyboardEventEnabled: !1,
    componentEventEnabled: !1,
    performanceEventEnabled: !1,
    selected: ""
  };
}
d.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS ??= [];
const oo = new Proxy(d.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS, { get(e, t, n) {
  return Reflect.get(e, t, n);
} });
function so(e, t) {
  v.timelineLayersState[t.id] = !1, oo.push({
    ...e,
    descriptorId: t.id,
    appRecord: Je(t.app)
  });
}
d.__VUE_DEVTOOLS_KIT_INSPECTOR__ ??= [];
const rt = new Proxy(d.__VUE_DEVTOOLS_KIT_INSPECTOR__, { get(e, t, n) {
  return Reflect.get(e, t, n);
} }), Bt = X(() => {
  ee.hooks.callHook(F.SEND_INSPECTOR_TO_CLIENT, Kt());
});
function io(e, t) {
  rt.push({
    options: e,
    descriptor: t,
    treeFilterPlaceholder: e.treeFilterPlaceholder ?? "Search tree...",
    stateFilterPlaceholder: e.stateFilterPlaceholder ?? "Search state...",
    treeFilter: "",
    selectedNodeId: "",
    appRecord: Je(t.app)
  }), Bt();
}
function Kt() {
  return rt.filter((e) => e.descriptor.app === P.value.app).filter((e) => e.descriptor.id !== "components").map((e) => {
    const t = e.descriptor, n = e.options;
    return {
      id: n.id,
      label: n.label,
      logo: t.logo,
      icon: `custom-ic-baseline-${n?.icon?.replace(/_/g, "-")}`,
      packageName: t.packageName,
      homepage: t.homepage,
      pluginId: t.id
    };
  });
}
function ge(e, t) {
  return rt.find((n) => n.options.id === e && (t ? n.descriptor.app === t : !0));
}
let C = /* @__PURE__ */ (function(e) {
  return e.VISIT_COMPONENT_TREE = "visitComponentTree", e.INSPECT_COMPONENT = "inspectComponent", e.EDIT_COMPONENT_STATE = "editComponentState", e.GET_INSPECTOR_TREE = "getInspectorTree", e.GET_INSPECTOR_STATE = "getInspectorState", e.EDIT_INSPECTOR_STATE = "editInspectorState", e.INSPECT_TIMELINE_EVENT = "inspectTimelineEvent", e.TIMELINE_CLEARED = "timelineCleared", e.SET_PLUGIN_SETTINGS = "setPluginSettings", e;
})({}), S = /* @__PURE__ */ (function(e) {
  return e.ADD_INSPECTOR = "addInspector", e.SEND_INSPECTOR_TREE = "sendInspectorTree", e.SEND_INSPECTOR_STATE = "sendInspectorState", e.CUSTOM_INSPECTOR_SELECT_NODE = "customInspectorSelectNode", e.TIMELINE_LAYER_ADDED = "timelineLayerAdded", e.TIMELINE_EVENT_ADDED = "timelineEventAdded", e.GET_COMPONENT_INSTANCES = "getComponentInstances", e.GET_COMPONENT_BOUNDS = "getComponentBounds", e.GET_COMPONENT_NAME = "getComponentName", e.COMPONENT_HIGHLIGHT = "componentHighlight", e.COMPONENT_UNHIGHLIGHT = "componentUnhighlight", e;
})({}), F = /* @__PURE__ */ (function(e) {
  return e.SEND_INSPECTOR_TREE_TO_CLIENT = "sendInspectorTreeToClient", e.SEND_INSPECTOR_STATE_TO_CLIENT = "sendInspectorStateToClient", e.SEND_TIMELINE_EVENT_TO_CLIENT = "sendTimelineEventToClient", e.SEND_INSPECTOR_TO_CLIENT = "sendInspectorToClient", e.SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT = "sendActiveAppUpdatedToClient", e.DEVTOOLS_STATE_UPDATED = "devtoolsStateUpdated", e.DEVTOOLS_CONNECTED_UPDATED = "devtoolsConnectedUpdated", e.ROUTER_INFO_UPDATED = "routerInfoUpdated", e;
})({});
function ao() {
  const e = Vt();
  e.hook(S.ADD_INSPECTOR, ({ inspector: r, plugin: o }) => {
    io(r, o.descriptor);
  });
  const t = X(async ({ inspectorId: r, plugin: o }) => {
    if (!r || !o?.descriptor?.app || v.highPerfModeEnabled) return;
    const s = ge(r, o.descriptor.app), i = {
      app: o.descriptor.app,
      inspectorId: r,
      filter: s?.treeFilter || "",
      rootNodes: []
    };
    await new Promise((a) => {
      e.callHookWith(async (l) => {
        await Promise.all(l.map((u) => u(i))), a();
      }, C.GET_INSPECTOR_TREE);
    }), e.callHookWith(async (a) => {
      await Promise.all(a.map((l) => l({
        inspectorId: r,
        rootNodes: i.rootNodes
      })));
    }, F.SEND_INSPECTOR_TREE_TO_CLIENT);
  }, 120);
  e.hook(S.SEND_INSPECTOR_TREE, t);
  const n = X(async ({ inspectorId: r, plugin: o }) => {
    if (!r || !o?.descriptor?.app || v.highPerfModeEnabled) return;
    const s = ge(r, o.descriptor.app), i = {
      app: o.descriptor.app,
      inspectorId: r,
      nodeId: s?.selectedNodeId || "",
      state: null
    }, a = { currentTab: `custom-inspector:${r}` };
    i.nodeId && await new Promise((l) => {
      e.callHookWith(async (u) => {
        await Promise.all(u.map((E) => E(i, a))), l();
      }, C.GET_INSPECTOR_STATE);
    }), e.callHookWith(async (l) => {
      await Promise.all(l.map((u) => u({
        inspectorId: r,
        nodeId: i.nodeId,
        state: i.state
      })));
    }, F.SEND_INSPECTOR_STATE_TO_CLIENT);
  }, 120);
  return e.hook(S.SEND_INSPECTOR_STATE, n), e.hook(S.CUSTOM_INSPECTOR_SELECT_NODE, ({ inspectorId: r, nodeId: o, plugin: s }) => {
    const i = ge(r, s.descriptor.app);
    i && (i.selectedNodeId = o);
  }), e.hook(S.TIMELINE_LAYER_ADDED, ({ options: r, plugin: o }) => {
    so(r, o.descriptor);
  }), e.hook(S.TIMELINE_EVENT_ADDED, ({ options: r, plugin: o }) => {
    v.highPerfModeEnabled || !v.timelineLayersState?.[o.descriptor.id] && ![
      "performance",
      "component-event",
      "keyboard",
      "mouse"
    ].includes(r.layerId) || e.callHookWith(async (s) => {
      await Promise.all(s.map((i) => i(r)));
    }, F.SEND_TIMELINE_EVENT_TO_CLIENT);
  }), e.hook(S.GET_COMPONENT_INSTANCES, async ({ app: r }) => {
    const o = r.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
    if (!o) return null;
    const s = o.id.toString();
    return [...o.instanceMap].filter(([i]) => i.split(":")[0] === s).map(([, i]) => i);
  }), e.hook(S.GET_COMPONENT_BOUNDS, async ({ instance: r }) => B(r)), e.hook(S.GET_COMPONENT_NAME, ({ instance: r }) => we(r)), e.hook(S.COMPONENT_HIGHLIGHT, ({ uid: r }) => {
    const o = P.value.instanceMap.get(r);
    o && Br(o);
  }), e.hook(S.COMPONENT_UNHIGHLIGHT, () => {
    Gt();
  }), e;
}
d.__VUE_DEVTOOLS_KIT_APP_RECORDS__ ??= [];
d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ ??= {};
d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ ??= "";
d.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ ??= [];
d.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ ??= [];
const ie = "__VUE_DEVTOOLS_KIT_GLOBAL_STATE__";
function lo() {
  return {
    connected: !1,
    clientConnected: !1,
    vitePluginDetected: !0,
    appRecords: [],
    activeAppRecordId: "",
    tabs: [],
    commands: [],
    highPerfModeEnabled: !0,
    devtoolsClientDetected: {},
    perfUniqueGroupId: 0,
    timelineLayersState: ro()
  };
}
d[ie] ??= lo();
const co = X((e) => {
  ee.hooks.callHook(F.DEVTOOLS_STATE_UPDATED, { state: e });
});
X((e, t) => {
  ee.hooks.callHook(F.DEVTOOLS_CONNECTED_UPDATED, {
    state: e,
    oldState: t
  });
});
const Pe = new Proxy(d.__VUE_DEVTOOLS_KIT_APP_RECORDS__, { get(e, t, n) {
  return t === "value" ? d.__VUE_DEVTOOLS_KIT_APP_RECORDS__ : d.__VUE_DEVTOOLS_KIT_APP_RECORDS__[t];
} }), P = new Proxy(d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__, { get(e, t, n) {
  return t === "value" ? d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ : t === "id" ? d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ : d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__[t];
} });
function Wt() {
  co({
    ...d[ie],
    appRecords: Pe.value,
    activeAppRecordId: P.id,
    tabs: d.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__,
    commands: d.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__
  });
}
function uo(e) {
  d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = e, Wt();
}
function fo(e) {
  d.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = e, Wt();
}
const v = new Proxy(d[ie], {
  get(e, t) {
    return t === "appRecords" ? Pe : t === "activeAppRecordId" ? P.id : t === "tabs" ? d.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ : t === "commands" ? d.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ : d[ie][t];
  },
  deleteProperty(e, t) {
    return delete e[t], !0;
  },
  set(e, t, n) {
    return e[t] = n, d[ie][t] = n, !0;
  }
});
function po(e = {}) {
  const { file: t, host: n, baseUrl: r = window.location.origin, line: o = 0, column: s = 0 } = e;
  if (t) {
    if (n === "chrome-extension") {
      const i = t.replace(/\\/g, "\\\\"), a = window.VUE_DEVTOOLS_CONFIG?.openInEditorHost ?? "/";
      fetch(`${a}__open-in-editor?file=${encodeURI(t)}`).then((l) => {
        if (!l.ok) {
          const u = `Opening component ${i} failed`;
          console.log(`%c${u}`, "color:red");
        }
      });
    } else if (v.vitePluginDetected) {
      const i = d.__VUE_DEVTOOLS_OPEN_IN_EDITOR_BASE_URL__ ?? r;
      d.__VUE_INSPECTOR__.openInEditor(i, t, o, s);
    }
  }
}
d.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__ ??= [];
const ot = new Proxy(d.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__, { get(e, t, n) {
  return Reflect.get(e, t, n);
} });
function Be(e) {
  const t = {};
  return Object.keys(e).forEach((n) => {
    t[n] = e[n].defaultValue;
  }), t;
}
function st(e) {
  return `__VUE_DEVTOOLS_NEXT_PLUGIN_SETTINGS__${e}__`;
}
function _o(e) {
  return (ot.find((t) => t[0].id === e && !!t[0]?.settings)?.[0] ?? null)?.settings ?? null;
}
function Yt(e, t) {
  const n = st(e);
  if (n) {
    const r = localStorage.getItem(n);
    if (r) return JSON.parse(r);
  }
  return Be(e ? (ot.find((r) => r[0].id === e)?.[0] ?? null)?.settings ?? {} : t);
}
function ho(e, t) {
  const n = st(e);
  localStorage.getItem(n) || localStorage.setItem(n, JSON.stringify(Be(t)));
}
function Eo(e, t, n) {
  const r = st(e), o = localStorage.getItem(r), s = JSON.parse(o || "{}"), i = {
    ...s,
    [t]: n
  };
  localStorage.setItem(r, JSON.stringify(i)), ee.hooks.callHookWith((a) => {
    a.forEach((l) => l({
      pluginId: e,
      key: t,
      oldValue: s[t],
      newValue: n,
      settings: i
    }));
  }, C.SET_PLUGIN_SETTINGS);
}
let R = /* @__PURE__ */ (function(e) {
  return e.APP_INIT = "app:init", e.APP_UNMOUNT = "app:unmount", e.COMPONENT_UPDATED = "component:updated", e.COMPONENT_ADDED = "component:added", e.COMPONENT_REMOVED = "component:removed", e.COMPONENT_EMIT = "component:emit", e.PERFORMANCE_START = "perf:start", e.PERFORMANCE_END = "perf:end", e.ADD_ROUTE = "router:add-route", e.REMOVE_ROUTE = "router:remove-route", e.RENDER_TRACKED = "render:tracked", e.RENDER_TRIGGERED = "render:triggered", e.APP_CONNECTED = "app:connected", e.SETUP_DEVTOOLS_PLUGIN = "devtools-plugin:setup", e;
})({});
const A = d.__VUE_DEVTOOLS_HOOK ??= Vt(), go = {
  vueAppInit(e) {
    A.hook(R.APP_INIT, e);
  },
  vueAppUnmount(e) {
    A.hook(R.APP_UNMOUNT, e);
  },
  vueAppConnected(e) {
    A.hook(R.APP_CONNECTED, e);
  },
  componentAdded(e) {
    return A.hook(R.COMPONENT_ADDED, e);
  },
  componentEmit(e) {
    return A.hook(R.COMPONENT_EMIT, e);
  },
  componentUpdated(e) {
    return A.hook(R.COMPONENT_UPDATED, e);
  },
  componentRemoved(e) {
    return A.hook(R.COMPONENT_REMOVED, e);
  },
  setupDevtoolsPlugin(e) {
    A.hook(R.SETUP_DEVTOOLS_PLUGIN, e);
  },
  perfStart(e) {
    return A.hook(R.PERFORMANCE_START, e);
  },
  perfEnd(e) {
    return A.hook(R.PERFORMANCE_END, e);
  }
}, qt = {
  on: go,
  setupDevToolsPlugin(e, t) {
    return A.callHook(R.SETUP_DEVTOOLS_PLUGIN, e, t);
  }
};
var mo = class {
  constructor({ plugin: e, ctx: t }) {
    this.hooks = t.hooks, this.plugin = e;
  }
  get on() {
    return {
      visitComponentTree: (e) => {
        this.hooks.hook(C.VISIT_COMPONENT_TREE, e);
      },
      inspectComponent: (e) => {
        this.hooks.hook(C.INSPECT_COMPONENT, e);
      },
      editComponentState: (e) => {
        this.hooks.hook(C.EDIT_COMPONENT_STATE, e);
      },
      getInspectorTree: (e) => {
        this.hooks.hook(C.GET_INSPECTOR_TREE, e);
      },
      getInspectorState: (e) => {
        this.hooks.hook(C.GET_INSPECTOR_STATE, e);
      },
      editInspectorState: (e) => {
        this.hooks.hook(C.EDIT_INSPECTOR_STATE, e);
      },
      inspectTimelineEvent: (e) => {
        this.hooks.hook(C.INSPECT_TIMELINE_EVENT, e);
      },
      timelineCleared: (e) => {
        this.hooks.hook(C.TIMELINE_CLEARED, e);
      },
      setPluginSettings: (e) => {
        this.hooks.hook(C.SET_PLUGIN_SETTINGS, e);
      }
    };
  }
  notifyComponentUpdate(e) {
    if (v.highPerfModeEnabled) return;
    const t = Kt().find((n) => n.packageName === this.plugin.descriptor.packageName);
    if (t?.id) {
      if (e) {
        const n = [
          e.appContext.app,
          e.uid,
          e.parent?.uid,
          e
        ];
        A.callHook(R.COMPONENT_UPDATED, ...n);
      } else A.callHook(R.COMPONENT_UPDATED);
      this.hooks.callHook(S.SEND_INSPECTOR_STATE, {
        inspectorId: t.id,
        plugin: this.plugin
      });
    }
  }
  addInspector(e) {
    this.hooks.callHook(S.ADD_INSPECTOR, {
      inspector: e,
      plugin: this.plugin
    }), this.plugin.descriptor.settings && ho(e.id, this.plugin.descriptor.settings);
  }
  sendInspectorTree(e) {
    v.highPerfModeEnabled || this.hooks.callHook(S.SEND_INSPECTOR_TREE, {
      inspectorId: e,
      plugin: this.plugin
    });
  }
  sendInspectorState(e) {
    v.highPerfModeEnabled || this.hooks.callHook(S.SEND_INSPECTOR_STATE, {
      inspectorId: e,
      plugin: this.plugin
    });
  }
  selectInspectorNode(e, t) {
    this.hooks.callHook(S.CUSTOM_INSPECTOR_SELECT_NODE, {
      inspectorId: e,
      nodeId: t,
      plugin: this.plugin
    });
  }
  visitComponentTree(e) {
    return this.hooks.callHook(C.VISIT_COMPONENT_TREE, e);
  }
  now() {
    return v.highPerfModeEnabled ? 0 : Date.now();
  }
  addTimelineLayer(e) {
    this.hooks.callHook(S.TIMELINE_LAYER_ADDED, {
      options: e,
      plugin: this.plugin
    });
  }
  addTimelineEvent(e) {
    v.highPerfModeEnabled || this.hooks.callHook(S.TIMELINE_EVENT_ADDED, {
      options: e,
      plugin: this.plugin
    });
  }
  getSettings(e) {
    return Yt(e ?? this.plugin.descriptor.id, this.plugin.descriptor.settings);
  }
  getComponentInstances(e) {
    return this.hooks.callHook(S.GET_COMPONENT_INSTANCES, { app: e });
  }
  getComponentBounds(e) {
    return this.hooks.callHook(S.GET_COMPONENT_BOUNDS, { instance: e });
  }
  getComponentName(e) {
    return this.hooks.callHook(S.GET_COMPONENT_NAME, { instance: e });
  }
  highlightElement(e) {
    const t = e.__VUE_DEVTOOLS_NEXT_UID__;
    return this.hooks.callHook(S.COMPONENT_HIGHLIGHT, { uid: t });
  }
  unhighlightElement() {
    return this.hooks.callHook(S.COMPONENT_UNHIGHLIGHT);
  }
};
const yo = mo, To = "__vue_devtool_undefined__", Oo = "__vue_devtool_infinity__", So = "__vue_devtool_negative_infinity__", bo = "__vue_devtool_nan__", Io = {
  [To]: "undefined",
  [bo]: "NaN",
  [Oo]: "Infinity",
  [So]: "-Infinity"
};
Object.entries(Io).reduce((e, [t, n]) => (e[n] = t, e), {});
d.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__ ??= /* @__PURE__ */ new Set();
function Zt(e, t) {
  return qt.setupDevToolsPlugin(e, t);
}
function vo(e, t) {
  const [n, r] = e;
  if (n.app !== t) return;
  const o = new yo({
    plugin: {
      setupFn: r,
      descriptor: n
    },
    ctx: ee
  });
  n.packageName === "vuex" && o.on.editInspectorState((s) => {
    o.sendInspectorState(s.inspectorId);
  }), r(o);
}
function Xt(e, t) {
  d.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.has(e) || v.highPerfModeEnabled && !t?.inspectingComponent || (d.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.add(e), ot.forEach((n) => {
    vo(n, e);
  }));
}
const ve = "__VUE_DEVTOOLS_ROUTER__", ce = "__VUE_DEVTOOLS_ROUTER_INFO__";
d[ce] ??= {
  currentRoute: null,
  routes: []
};
d[ve] ??= {};
new Proxy(d[ce], { get(e, t) {
  return d[ce][t];
} });
new Proxy(d[ve], { get(e, t) {
  if (t === "value") return d[ve];
} });
function No(e) {
  const t = /* @__PURE__ */ new Map();
  return (e?.getRoutes() || []).filter((n) => !t.has(n.path) && t.set(n.path, 1));
}
function it(e) {
  return e.map((t) => {
    let { path: n, name: r, children: o, meta: s } = t;
    return o?.length && (o = it(o)), {
      path: n,
      name: r,
      children: o,
      meta: s
    };
  });
}
function Co(e) {
  if (e) {
    const { fullPath: t, hash: n, href: r, path: o, name: s, matched: i, params: a, query: l } = e;
    return {
      fullPath: t,
      hash: n,
      href: r,
      path: o,
      name: s,
      params: a,
      query: l,
      matched: it(i)
    };
  }
  return e;
}
function wo(e, t) {
  function n() {
    const r = e.app?.config.globalProperties.$router, o = Co(r?.currentRoute.value), s = it(No(r)), i = console.warn;
    console.warn = () => {
    }, d[ce] = {
      currentRoute: o ? gt(o) : {},
      routes: gt(s)
    }, d[ve] = r, console.warn = i;
  }
  n(), qt.on.componentUpdated(X(() => {
    t.value?.app === e.app && (n(), !v.highPerfModeEnabled && ee.hooks.callHook(F.ROUTER_INFO_UPDATED, { state: d[ce] }));
  }, 200));
}
function Po(e) {
  return {
    async getInspectorTree(t) {
      const n = {
        ...t,
        app: P.value.app,
        rootNodes: []
      };
      return await new Promise((r) => {
        e.callHookWith(async (o) => {
          await Promise.all(o.map((s) => s(n))), r();
        }, C.GET_INSPECTOR_TREE);
      }), n.rootNodes;
    },
    async getInspectorState(t) {
      const n = {
        ...t,
        app: P.value.app,
        state: null
      }, r = { currentTab: `custom-inspector:${t.inspectorId}` };
      return await new Promise((o) => {
        e.callHookWith(async (s) => {
          await Promise.all(s.map((i) => i(n, r))), o();
        }, C.GET_INSPECTOR_STATE);
      }), n.state;
    },
    editInspectorState(t) {
      const n = new eo(), r = {
        ...t,
        app: P.value.app,
        set: (o, s = t.path, i = t.state.value, a) => {
          n.set(o, s, i, a || n.createDefaultSetCallback(t.state));
        }
      };
      e.callHookWith((o) => {
        o.forEach((s) => s(r));
      }, C.EDIT_INSPECTOR_STATE);
    },
    sendInspectorState(t) {
      const n = ge(t);
      e.callHook(S.SEND_INSPECTOR_STATE, {
        inspectorId: t,
        plugin: {
          descriptor: n.descriptor,
          setupFn: () => ({})
        }
      });
    },
    inspectComponentInspector() {
      return Yr();
    },
    cancelInspectComponentInspector() {
      return Wr();
    },
    getComponentRenderCode(t) {
      const n = ze(P.value, t);
      if (n) return typeof n?.type != "function" ? n.render.toString() : n.type.toString();
    },
    scrollToComponent(t) {
      return qr({ id: t });
    },
    openInEditor: po,
    getVueInspector: Jr,
    toggleApp(t, n) {
      const r = Pe.value.find((o) => o.id === t);
      r && (fo(t), uo(r), wo(r, P), Bt(), Xt(r.app, n));
    },
    inspectDOM(t) {
      const n = ze(P.value, t);
      if (n) {
        const [r] = Qe(n);
        r && (d.__VUE_DEVTOOLS_INSPECT_DOM_TARGET__ = r);
      }
    },
    updatePluginSettings(t, n, r) {
      Eo(t, n, r);
    },
    getPluginSettings(t) {
      return {
        options: _o(t),
        values: Yt(t)
      };
    }
  };
}
d.__VUE_DEVTOOLS_ENV__ ??= { vitePluginDetected: !1 };
const Tt = ao();
d.__VUE_DEVTOOLS_KIT_CONTEXT__ ??= {
  hooks: Tt,
  get state() {
    return {
      ...v,
      activeAppRecordId: P.id,
      activeAppRecord: P.value,
      appRecords: Pe.value
    };
  },
  api: Po(Tt)
};
const ee = d.__VUE_DEVTOOLS_KIT_CONTEXT__;
var Ro = /* @__PURE__ */ Ut(((e, t) => {
  (function(n) {
    var r = {
      À: "A",
      Á: "A",
      Â: "A",
      Ã: "A",
      Ä: "Ae",
      Å: "A",
      Æ: "AE",
      Ç: "C",
      È: "E",
      É: "E",
      Ê: "E",
      Ë: "E",
      Ì: "I",
      Í: "I",
      Î: "I",
      Ï: "I",
      Ð: "D",
      Ñ: "N",
      Ò: "O",
      Ó: "O",
      Ô: "O",
      Õ: "O",
      Ö: "Oe",
      Ő: "O",
      Ø: "O",
      Ù: "U",
      Ú: "U",
      Û: "U",
      Ü: "Ue",
      Ű: "U",
      Ý: "Y",
      Þ: "TH",
      ß: "ss",
      à: "a",
      á: "a",
      â: "a",
      ã: "a",
      ä: "ae",
      å: "a",
      æ: "ae",
      ç: "c",
      è: "e",
      é: "e",
      ê: "e",
      ë: "e",
      ì: "i",
      í: "i",
      î: "i",
      ï: "i",
      ð: "d",
      ñ: "n",
      ò: "o",
      ó: "o",
      ô: "o",
      õ: "o",
      ö: "oe",
      ő: "o",
      ø: "o",
      ù: "u",
      ú: "u",
      û: "u",
      ü: "ue",
      ű: "u",
      ý: "y",
      þ: "th",
      ÿ: "y",
      "ẞ": "SS",
      ا: "a",
      أ: "a",
      إ: "i",
      آ: "aa",
      ؤ: "u",
      ئ: "e",
      ء: "a",
      ب: "b",
      ت: "t",
      ث: "th",
      ج: "j",
      ح: "h",
      خ: "kh",
      د: "d",
      ذ: "th",
      ر: "r",
      ز: "z",
      س: "s",
      ش: "sh",
      ص: "s",
      ض: "dh",
      ط: "t",
      ظ: "z",
      ع: "a",
      غ: "gh",
      ف: "f",
      ق: "q",
      ك: "k",
      ل: "l",
      م: "m",
      ن: "n",
      ه: "h",
      و: "w",
      ي: "y",
      ى: "a",
      ة: "h",
      ﻻ: "la",
      ﻷ: "laa",
      ﻹ: "lai",
      ﻵ: "laa",
      گ: "g",
      چ: "ch",
      پ: "p",
      ژ: "zh",
      ک: "k",
      ی: "y",
      "َ": "a",
      "ً": "an",
      "ِ": "e",
      "ٍ": "en",
      "ُ": "u",
      "ٌ": "on",
      "ْ": "",
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
      က: "k",
      ခ: "kh",
      ဂ: "g",
      ဃ: "ga",
      င: "ng",
      စ: "s",
      ဆ: "sa",
      ဇ: "z",
      "စျ": "za",
      ည: "ny",
      ဋ: "t",
      ဌ: "ta",
      ဍ: "d",
      ဎ: "da",
      ဏ: "na",
      တ: "t",
      ထ: "ta",
      ဒ: "d",
      ဓ: "da",
      န: "n",
      ပ: "p",
      ဖ: "pa",
      ဗ: "b",
      ဘ: "ba",
      မ: "m",
      ယ: "y",
      ရ: "ya",
      လ: "l",
      ဝ: "w",
      သ: "th",
      ဟ: "h",
      ဠ: "la",
      အ: "a",
      "ြ": "y",
      "ျ": "ya",
      "ွ": "w",
      "ြွ": "yw",
      "ျွ": "ywa",
      "ှ": "h",
      ဧ: "e",
      "၏": "-e",
      ဣ: "i",
      ဤ: "-i",
      ဉ: "u",
      ဦ: "-u",
      ဩ: "aw",
      "သြော": "aw",
      ဪ: "aw",
      "၀": "0",
      "၁": "1",
      "၂": "2",
      "၃": "3",
      "၄": "4",
      "၅": "5",
      "၆": "6",
      "၇": "7",
      "၈": "8",
      "၉": "9",
      "္": "",
      "့": "",
      "း": "",
      č: "c",
      ď: "d",
      ě: "e",
      ň: "n",
      ř: "r",
      š: "s",
      ť: "t",
      ů: "u",
      ž: "z",
      Č: "C",
      Ď: "D",
      Ě: "E",
      Ň: "N",
      Ř: "R",
      Š: "S",
      Ť: "T",
      Ů: "U",
      Ž: "Z",
      ހ: "h",
      ށ: "sh",
      ނ: "n",
      ރ: "r",
      ބ: "b",
      ޅ: "lh",
      ކ: "k",
      އ: "a",
      ވ: "v",
      މ: "m",
      ފ: "f",
      ދ: "dh",
      ތ: "th",
      ލ: "l",
      ގ: "g",
      ޏ: "gn",
      ސ: "s",
      ޑ: "d",
      ޒ: "z",
      ޓ: "t",
      ޔ: "y",
      ޕ: "p",
      ޖ: "j",
      ޗ: "ch",
      ޘ: "tt",
      ޙ: "hh",
      ޚ: "kh",
      ޛ: "th",
      ޜ: "z",
      ޝ: "sh",
      ޞ: "s",
      ޟ: "d",
      ޠ: "t",
      ޡ: "z",
      ޢ: "a",
      ޣ: "gh",
      ޤ: "q",
      ޥ: "w",
      "ަ": "a",
      "ާ": "aa",
      "ި": "i",
      "ީ": "ee",
      "ު": "u",
      "ޫ": "oo",
      "ެ": "e",
      "ޭ": "ey",
      "ޮ": "o",
      "ޯ": "oa",
      "ް": "",
      ა: "a",
      ბ: "b",
      გ: "g",
      დ: "d",
      ე: "e",
      ვ: "v",
      ზ: "z",
      თ: "t",
      ი: "i",
      კ: "k",
      ლ: "l",
      მ: "m",
      ნ: "n",
      ო: "o",
      პ: "p",
      ჟ: "zh",
      რ: "r",
      ს: "s",
      ტ: "t",
      უ: "u",
      ფ: "p",
      ქ: "k",
      ღ: "gh",
      ყ: "q",
      შ: "sh",
      ჩ: "ch",
      ც: "ts",
      ძ: "dz",
      წ: "ts",
      ჭ: "ch",
      ხ: "kh",
      ჯ: "j",
      ჰ: "h",
      α: "a",
      β: "v",
      γ: "g",
      δ: "d",
      ε: "e",
      ζ: "z",
      η: "i",
      θ: "th",
      ι: "i",
      κ: "k",
      λ: "l",
      μ: "m",
      ν: "n",
      ξ: "ks",
      ο: "o",
      π: "p",
      ρ: "r",
      σ: "s",
      τ: "t",
      υ: "y",
      φ: "f",
      χ: "x",
      ψ: "ps",
      ω: "o",
      ά: "a",
      έ: "e",
      ί: "i",
      ό: "o",
      ύ: "y",
      ή: "i",
      ώ: "o",
      ς: "s",
      ϊ: "i",
      ΰ: "y",
      ϋ: "y",
      ΐ: "i",
      Α: "A",
      Β: "B",
      Γ: "G",
      Δ: "D",
      Ε: "E",
      Ζ: "Z",
      Η: "I",
      Θ: "TH",
      Ι: "I",
      Κ: "K",
      Λ: "L",
      Μ: "M",
      Ν: "N",
      Ξ: "KS",
      Ο: "O",
      Π: "P",
      Ρ: "R",
      Σ: "S",
      Τ: "T",
      Υ: "Y",
      Φ: "F",
      Χ: "X",
      Ψ: "PS",
      Ω: "O",
      Ά: "A",
      Έ: "E",
      Ί: "I",
      Ό: "O",
      Ύ: "Y",
      Ή: "I",
      Ώ: "O",
      Ϊ: "I",
      Ϋ: "Y",
      ā: "a",
      ē: "e",
      ģ: "g",
      ī: "i",
      ķ: "k",
      ļ: "l",
      ņ: "n",
      ū: "u",
      Ā: "A",
      Ē: "E",
      Ģ: "G",
      Ī: "I",
      Ķ: "k",
      Ļ: "L",
      Ņ: "N",
      Ū: "U",
      Ќ: "Kj",
      ќ: "kj",
      Љ: "Lj",
      љ: "lj",
      Њ: "Nj",
      њ: "nj",
      Тс: "Ts",
      тс: "ts",
      ą: "a",
      ć: "c",
      ę: "e",
      ł: "l",
      ń: "n",
      ś: "s",
      ź: "z",
      ż: "z",
      Ą: "A",
      Ć: "C",
      Ę: "E",
      Ł: "L",
      Ń: "N",
      Ś: "S",
      Ź: "Z",
      Ż: "Z",
      Є: "Ye",
      І: "I",
      Ї: "Yi",
      Ґ: "G",
      є: "ye",
      і: "i",
      ї: "yi",
      ґ: "g",
      ă: "a",
      Ă: "A",
      ș: "s",
      Ș: "S",
      ț: "t",
      Ț: "T",
      ţ: "t",
      Ţ: "T",
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "i",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "c",
      ч: "ch",
      ш: "sh",
      щ: "sh",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
      А: "A",
      Б: "B",
      В: "V",
      Г: "G",
      Д: "D",
      Е: "E",
      Ё: "Yo",
      Ж: "Zh",
      З: "Z",
      И: "I",
      Й: "I",
      К: "K",
      Л: "L",
      М: "M",
      Н: "N",
      О: "O",
      П: "P",
      Р: "R",
      С: "S",
      Т: "T",
      У: "U",
      Ф: "F",
      Х: "Kh",
      Ц: "C",
      Ч: "Ch",
      Ш: "Sh",
      Щ: "Sh",
      Ъ: "",
      Ы: "Y",
      Ь: "",
      Э: "E",
      Ю: "Yu",
      Я: "Ya",
      ђ: "dj",
      ј: "j",
      ћ: "c",
      џ: "dz",
      Ђ: "Dj",
      Ј: "j",
      Ћ: "C",
      Џ: "Dz",
      ľ: "l",
      ĺ: "l",
      ŕ: "r",
      Ľ: "L",
      Ĺ: "L",
      Ŕ: "R",
      ş: "s",
      Ş: "S",
      ı: "i",
      İ: "I",
      ğ: "g",
      Ğ: "G",
      ả: "a",
      Ả: "A",
      ẳ: "a",
      Ẳ: "A",
      ẩ: "a",
      Ẩ: "A",
      đ: "d",
      Đ: "D",
      ẹ: "e",
      Ẹ: "E",
      ẽ: "e",
      Ẽ: "E",
      ẻ: "e",
      Ẻ: "E",
      ế: "e",
      Ế: "E",
      ề: "e",
      Ề: "E",
      ệ: "e",
      Ệ: "E",
      ễ: "e",
      Ễ: "E",
      ể: "e",
      Ể: "E",
      ỏ: "o",
      ọ: "o",
      Ọ: "o",
      ố: "o",
      Ố: "O",
      ồ: "o",
      Ồ: "O",
      ổ: "o",
      Ổ: "O",
      ộ: "o",
      Ộ: "O",
      ỗ: "o",
      Ỗ: "O",
      ơ: "o",
      Ơ: "O",
      ớ: "o",
      Ớ: "O",
      ờ: "o",
      Ờ: "O",
      ợ: "o",
      Ợ: "O",
      ỡ: "o",
      Ỡ: "O",
      Ở: "o",
      ở: "o",
      ị: "i",
      Ị: "I",
      ĩ: "i",
      Ĩ: "I",
      ỉ: "i",
      Ỉ: "i",
      ủ: "u",
      Ủ: "U",
      ụ: "u",
      Ụ: "U",
      ũ: "u",
      Ũ: "U",
      ư: "u",
      Ư: "U",
      ứ: "u",
      Ứ: "U",
      ừ: "u",
      Ừ: "U",
      ự: "u",
      Ự: "U",
      ữ: "u",
      Ữ: "U",
      ử: "u",
      Ử: "ư",
      ỷ: "y",
      Ỷ: "y",
      ỳ: "y",
      Ỳ: "Y",
      ỵ: "y",
      Ỵ: "Y",
      ỹ: "y",
      Ỹ: "Y",
      ạ: "a",
      Ạ: "A",
      ấ: "a",
      Ấ: "A",
      ầ: "a",
      Ầ: "A",
      ậ: "a",
      Ậ: "A",
      ẫ: "a",
      Ẫ: "A",
      ắ: "a",
      Ắ: "A",
      ằ: "a",
      Ằ: "A",
      ặ: "a",
      Ặ: "A",
      ẵ: "a",
      Ẵ: "A",
      "⓪": "0",
      "①": "1",
      "②": "2",
      "③": "3",
      "④": "4",
      "⑤": "5",
      "⑥": "6",
      "⑦": "7",
      "⑧": "8",
      "⑨": "9",
      "⑩": "10",
      "⑪": "11",
      "⑫": "12",
      "⑬": "13",
      "⑭": "14",
      "⑮": "15",
      "⑯": "16",
      "⑰": "17",
      "⑱": "18",
      "⑲": "18",
      "⑳": "18",
      "⓵": "1",
      "⓶": "2",
      "⓷": "3",
      "⓸": "4",
      "⓹": "5",
      "⓺": "6",
      "⓻": "7",
      "⓼": "8",
      "⓽": "9",
      "⓾": "10",
      "⓿": "0",
      "⓫": "11",
      "⓬": "12",
      "⓭": "13",
      "⓮": "14",
      "⓯": "15",
      "⓰": "16",
      "⓱": "17",
      "⓲": "18",
      "⓳": "19",
      "⓴": "20",
      "Ⓐ": "A",
      "Ⓑ": "B",
      "Ⓒ": "C",
      "Ⓓ": "D",
      "Ⓔ": "E",
      "Ⓕ": "F",
      "Ⓖ": "G",
      "Ⓗ": "H",
      "Ⓘ": "I",
      "Ⓙ": "J",
      "Ⓚ": "K",
      "Ⓛ": "L",
      "Ⓜ": "M",
      "Ⓝ": "N",
      "Ⓞ": "O",
      "Ⓟ": "P",
      "Ⓠ": "Q",
      "Ⓡ": "R",
      "Ⓢ": "S",
      "Ⓣ": "T",
      "Ⓤ": "U",
      "Ⓥ": "V",
      "Ⓦ": "W",
      "Ⓧ": "X",
      "Ⓨ": "Y",
      "Ⓩ": "Z",
      "ⓐ": "a",
      "ⓑ": "b",
      "ⓒ": "c",
      "ⓓ": "d",
      "ⓔ": "e",
      "ⓕ": "f",
      "ⓖ": "g",
      "ⓗ": "h",
      "ⓘ": "i",
      "ⓙ": "j",
      "ⓚ": "k",
      "ⓛ": "l",
      "ⓜ": "m",
      "ⓝ": "n",
      "ⓞ": "o",
      "ⓟ": "p",
      "ⓠ": "q",
      "ⓡ": "r",
      "ⓢ": "s",
      "ⓣ": "t",
      "ⓤ": "u",
      "ⓦ": "v",
      "ⓥ": "w",
      "ⓧ": "x",
      "ⓨ": "y",
      "ⓩ": "z",
      "“": '"',
      "”": '"',
      "‘": "'",
      "’": "'",
      "∂": "d",
      ƒ: "f",
      "™": "(TM)",
      "©": "(C)",
      œ: "oe",
      Œ: "OE",
      "®": "(R)",
      "†": "+",
      "℠": "(SM)",
      "…": "...",
      "˚": "o",
      º: "o",
      ª: "a",
      "•": "*",
      "၊": ",",
      "။": ".",
      $: "USD",
      "€": "EUR",
      "₢": "BRN",
      "₣": "FRF",
      "£": "GBP",
      "₤": "ITL",
      "₦": "NGN",
      "₧": "ESP",
      "₩": "KRW",
      "₪": "ILS",
      "₫": "VND",
      "₭": "LAK",
      "₮": "MNT",
      "₯": "GRD",
      "₱": "ARS",
      "₲": "PYG",
      "₳": "ARA",
      "₴": "UAH",
      "₵": "GHS",
      "¢": "cent",
      "¥": "CNY",
      元: "CNY",
      円: "YEN",
      "﷼": "IRR",
      "₠": "EWE",
      "฿": "THB",
      "₨": "INR",
      "₹": "INR",
      "₰": "PF",
      "₺": "TRY",
      "؋": "AFN",
      "₼": "AZN",
      лв: "BGN",
      "៛": "KHR",
      "₡": "CRC",
      "₸": "KZT",
      ден: "MKD",
      zł: "PLN",
      "₽": "RUB",
      "₾": "GEL"
    }, o = ["်", "ް"], s = {
      "ာ": "a",
      "ါ": "a",
      "ေ": "e",
      "ဲ": "e",
      "ိ": "i",
      "ီ": "i",
      "ို": "o",
      "ု": "u",
      "ူ": "u",
      "ေါင်": "aung",
      "ော": "aw",
      "ော်": "aw",
      "ေါ": "aw",
      "ေါ်": "aw",
      "်": "်",
      "က်": "et",
      "ိုက်": "aik",
      "ောက်": "auk",
      "င်": "in",
      "ိုင်": "aing",
      "ောင်": "aung",
      "စ်": "it",
      "ည်": "i",
      "တ်": "at",
      "ိတ်": "eik",
      "ုတ်": "ok",
      "ွတ်": "ut",
      "ေတ်": "it",
      "ဒ်": "d",
      "ိုဒ်": "ok",
      "ုဒ်": "ait",
      "န်": "an",
      "ာန်": "an",
      "ိန်": "ein",
      "ုန်": "on",
      "ွန်": "un",
      "ပ်": "at",
      "ိပ်": "eik",
      "ုပ်": "ok",
      "ွပ်": "ut",
      "န်ုပ်": "nub",
      "မ်": "an",
      "ိမ်": "ein",
      "ုမ်": "on",
      "ွမ်": "un",
      "ယ်": "e",
      "ိုလ်": "ol",
      "ဉ်": "in",
      "ံ": "an",
      "ိံ": "ein",
      "ုံ": "on",
      "ައް": "ah",
      "ަށް": "ah"
    }, i = {
      en: {},
      az: {
        ç: "c",
        ə: "e",
        ğ: "g",
        ı: "i",
        ö: "o",
        ş: "s",
        ü: "u",
        Ç: "C",
        Ə: "E",
        Ğ: "G",
        İ: "I",
        Ö: "O",
        Ş: "S",
        Ü: "U"
      },
      cs: {
        č: "c",
        ď: "d",
        ě: "e",
        ň: "n",
        ř: "r",
        š: "s",
        ť: "t",
        ů: "u",
        ž: "z",
        Č: "C",
        Ď: "D",
        Ě: "E",
        Ň: "N",
        Ř: "R",
        Š: "S",
        Ť: "T",
        Ů: "U",
        Ž: "Z"
      },
      fi: {
        ä: "a",
        Ä: "A",
        ö: "o",
        Ö: "O"
      },
      hu: {
        ä: "a",
        Ä: "A",
        ö: "o",
        Ö: "O",
        ü: "u",
        Ü: "U",
        ű: "u",
        Ű: "U"
      },
      lt: {
        ą: "a",
        č: "c",
        ę: "e",
        ė: "e",
        į: "i",
        š: "s",
        ų: "u",
        ū: "u",
        ž: "z",
        Ą: "A",
        Č: "C",
        Ę: "E",
        Ė: "E",
        Į: "I",
        Š: "S",
        Ų: "U",
        Ū: "U"
      },
      lv: {
        ā: "a",
        č: "c",
        ē: "e",
        ģ: "g",
        ī: "i",
        ķ: "k",
        ļ: "l",
        ņ: "n",
        š: "s",
        ū: "u",
        ž: "z",
        Ā: "A",
        Č: "C",
        Ē: "E",
        Ģ: "G",
        Ī: "i",
        Ķ: "k",
        Ļ: "L",
        Ņ: "N",
        Š: "S",
        Ū: "u",
        Ž: "Z"
      },
      pl: {
        ą: "a",
        ć: "c",
        ę: "e",
        ł: "l",
        ń: "n",
        ó: "o",
        ś: "s",
        ź: "z",
        ż: "z",
        Ą: "A",
        Ć: "C",
        Ę: "e",
        Ł: "L",
        Ń: "N",
        Ó: "O",
        Ś: "S",
        Ź: "Z",
        Ż: "Z"
      },
      sv: {
        ä: "a",
        Ä: "A",
        ö: "o",
        Ö: "O"
      },
      sk: {
        ä: "a",
        Ä: "A"
      },
      sr: {
        љ: "lj",
        њ: "nj",
        Љ: "Lj",
        Њ: "Nj",
        đ: "dj",
        Đ: "Dj"
      },
      tr: {
        Ü: "U",
        Ö: "O",
        ü: "u",
        ö: "o"
      }
    }, a = {
      ar: {
        "∆": "delta",
        "∞": "la-nihaya",
        "♥": "hob",
        "&": "wa",
        "|": "aw",
        "<": "aqal-men",
        ">": "akbar-men",
        "∑": "majmou",
        "¤": "omla"
      },
      az: {},
      ca: {
        "∆": "delta",
        "∞": "infinit",
        "♥": "amor",
        "&": "i",
        "|": "o",
        "<": "menys que",
        ">": "mes que",
        "∑": "suma dels",
        "¤": "moneda"
      },
      cs: {
        "∆": "delta",
        "∞": "nekonecno",
        "♥": "laska",
        "&": "a",
        "|": "nebo",
        "<": "mensi nez",
        ">": "vetsi nez",
        "∑": "soucet",
        "¤": "mena"
      },
      de: {
        "∆": "delta",
        "∞": "unendlich",
        "♥": "Liebe",
        "&": "und",
        "|": "oder",
        "<": "kleiner als",
        ">": "groesser als",
        "∑": "Summe von",
        "¤": "Waehrung"
      },
      dv: {
        "∆": "delta",
        "∞": "kolunulaa",
        "♥": "loabi",
        "&": "aai",
        "|": "noonee",
        "<": "ah vure kuda",
        ">": "ah vure bodu",
        "∑": "jumula",
        "¤": "faisaa"
      },
      en: {
        "∆": "delta",
        "∞": "infinity",
        "♥": "love",
        "&": "and",
        "|": "or",
        "<": "less than",
        ">": "greater than",
        "∑": "sum",
        "¤": "currency"
      },
      es: {
        "∆": "delta",
        "∞": "infinito",
        "♥": "amor",
        "&": "y",
        "|": "u",
        "<": "menos que",
        ">": "mas que",
        "∑": "suma de los",
        "¤": "moneda"
      },
      fa: {
        "∆": "delta",
        "∞": "bi-nahayat",
        "♥": "eshgh",
        "&": "va",
        "|": "ya",
        "<": "kamtar-az",
        ">": "bishtar-az",
        "∑": "majmooe",
        "¤": "vahed"
      },
      fi: {
        "∆": "delta",
        "∞": "aarettomyys",
        "♥": "rakkaus",
        "&": "ja",
        "|": "tai",
        "<": "pienempi kuin",
        ">": "suurempi kuin",
        "∑": "summa",
        "¤": "valuutta"
      },
      fr: {
        "∆": "delta",
        "∞": "infiniment",
        "♥": "Amour",
        "&": "et",
        "|": "ou",
        "<": "moins que",
        ">": "superieure a",
        "∑": "somme des",
        "¤": "monnaie"
      },
      ge: {
        "∆": "delta",
        "∞": "usasruloba",
        "♥": "siqvaruli",
        "&": "da",
        "|": "an",
        "<": "naklebi",
        ">": "meti",
        "∑": "jami",
        "¤": "valuta"
      },
      gr: {},
      hu: {
        "∆": "delta",
        "∞": "vegtelen",
        "♥": "szerelem",
        "&": "es",
        "|": "vagy",
        "<": "kisebb mint",
        ">": "nagyobb mint",
        "∑": "szumma",
        "¤": "penznem"
      },
      it: {
        "∆": "delta",
        "∞": "infinito",
        "♥": "amore",
        "&": "e",
        "|": "o",
        "<": "minore di",
        ">": "maggiore di",
        "∑": "somma",
        "¤": "moneta"
      },
      lt: {
        "∆": "delta",
        "∞": "begalybe",
        "♥": "meile",
        "&": "ir",
        "|": "ar",
        "<": "maziau nei",
        ">": "daugiau nei",
        "∑": "suma",
        "¤": "valiuta"
      },
      lv: {
        "∆": "delta",
        "∞": "bezgaliba",
        "♥": "milestiba",
        "&": "un",
        "|": "vai",
        "<": "mazak neka",
        ">": "lielaks neka",
        "∑": "summa",
        "¤": "valuta"
      },
      my: {
        "∆": "kwahkhyaet",
        "∞": "asaonasme",
        "♥": "akhyait",
        "&": "nhin",
        "|": "tho",
        "<": "ngethaw",
        ">": "kyithaw",
        "∑": "paungld",
        "¤": "ngwekye"
      },
      mk: {},
      nl: {
        "∆": "delta",
        "∞": "oneindig",
        "♥": "liefde",
        "&": "en",
        "|": "of",
        "<": "kleiner dan",
        ">": "groter dan",
        "∑": "som",
        "¤": "valuta"
      },
      pl: {
        "∆": "delta",
        "∞": "nieskonczonosc",
        "♥": "milosc",
        "&": "i",
        "|": "lub",
        "<": "mniejsze niz",
        ">": "wieksze niz",
        "∑": "suma",
        "¤": "waluta"
      },
      pt: {
        "∆": "delta",
        "∞": "infinito",
        "♥": "amor",
        "&": "e",
        "|": "ou",
        "<": "menor que",
        ">": "maior que",
        "∑": "soma",
        "¤": "moeda"
      },
      ro: {
        "∆": "delta",
        "∞": "infinit",
        "♥": "dragoste",
        "&": "si",
        "|": "sau",
        "<": "mai mic ca",
        ">": "mai mare ca",
        "∑": "suma",
        "¤": "valuta"
      },
      ru: {
        "∆": "delta",
        "∞": "beskonechno",
        "♥": "lubov",
        "&": "i",
        "|": "ili",
        "<": "menshe",
        ">": "bolshe",
        "∑": "summa",
        "¤": "valjuta"
      },
      sk: {
        "∆": "delta",
        "∞": "nekonecno",
        "♥": "laska",
        "&": "a",
        "|": "alebo",
        "<": "menej ako",
        ">": "viac ako",
        "∑": "sucet",
        "¤": "mena"
      },
      sr: {},
      tr: {
        "∆": "delta",
        "∞": "sonsuzluk",
        "♥": "ask",
        "&": "ve",
        "|": "veya",
        "<": "kucuktur",
        ">": "buyuktur",
        "∑": "toplam",
        "¤": "para birimi"
      },
      uk: {
        "∆": "delta",
        "∞": "bezkinechnist",
        "♥": "lubov",
        "&": "i",
        "|": "abo",
        "<": "menshe",
        ">": "bilshe",
        "∑": "suma",
        "¤": "valjuta"
      },
      vn: {
        "∆": "delta",
        "∞": "vo cuc",
        "♥": "yeu",
        "&": "va",
        "|": "hoac",
        "<": "nho hon",
        ">": "lon hon",
        "∑": "tong",
        "¤": "tien te"
      }
    }, l = [
      ";",
      "?",
      ":",
      "@",
      "&",
      "=",
      "+",
      "$",
      ",",
      "/"
    ].join(""), u = [
      ";",
      "?",
      ":",
      "@",
      "&",
      "=",
      "+",
      "$",
      ","
    ].join(""), E = [
      ".",
      "!",
      "~",
      "*",
      "'",
      "(",
      ")"
    ].join(""), c = function(h, _) {
      var b = "-", T = "", V = "", Ae = !0, M = {}, ct, pe, te, ke, De, ut, ne, K, ft, $, y, _e, L, W, j = "";
      if (typeof h != "string") return "";
      if (typeof _ == "string" && (b = _), ne = a.en, K = i.en, typeof _ == "object") {
        ct = _.maintainCase || !1, M = _.custom && typeof _.custom == "object" ? _.custom : M, te = +_.truncate > 1 && _.truncate || !1, ke = _.uric || !1, De = _.uricNoSlash || !1, ut = _.mark || !1, Ae = !(_.symbols === !1 || _.lang === !1), b = _.separator || b, ke && (j += l), De && (j += u), ut && (j += E), ne = _.lang && a[_.lang] && Ae ? a[_.lang] : Ae ? a.en : {}, K = _.lang && i[_.lang] ? i[_.lang] : _.lang === !1 || _.lang === !0 ? {} : i.en, _.titleCase && typeof _.titleCase.length == "number" && Array.prototype.toString.call(_.titleCase) ? (_.titleCase.forEach(function(k) {
          M[k + ""] = k + "";
        }), pe = !0) : pe = !!_.titleCase, _.custom && typeof _.custom.length == "number" && Array.prototype.toString.call(_.custom) && _.custom.forEach(function(k) {
          M[k + ""] = k + "";
        }), Object.keys(M).forEach(function(k) {
          var re;
          k.length > 1 ? re = new RegExp("\\b" + f(k) + "\\b", "gi") : re = new RegExp(f(k), "gi"), h = h.replace(re, M[k]);
        });
        for (y in M) j += y;
      }
      for (j += b, j = f(j), h = h.replace(/(^\s+|\s+$)/g, ""), L = !1, W = !1, $ = 0, _e = h.length; $ < _e; $++)
        y = h[$], p(y, M) ? L = !1 : K[y] ? (y = L && K[y].match(/[A-Za-z0-9]/) ? " " + K[y] : K[y], L = !1) : y in r ? ($ + 1 < _e && o.indexOf(h[$ + 1]) >= 0 ? (V += y, y = "") : W === !0 ? (y = s[V] + r[y], V = "") : y = L && r[y].match(/[A-Za-z0-9]/) ? " " + r[y] : r[y], L = !1, W = !1) : y in s ? (V += y, y = "", $ === _e - 1 && (y = s[V]), W = !0) : ne[y] && !(ke && l.indexOf(y) !== -1) && !(De && u.indexOf(y) !== -1) ? (y = L || T.substr(-1).match(/[A-Za-z0-9]/) ? b + ne[y] : ne[y], y += h[$ + 1] !== void 0 && h[$ + 1].match(/[A-Za-z0-9]/) ? b : "", L = !0) : (W === !0 ? (y = s[V] + y, V = "", W = !1) : L && (/[A-Za-z0-9]/.test(y) || T.substr(-1).match(/A-Za-z0-9]/)) && (y = " " + y), L = !1), T += y.replace(new RegExp("[^\\w\\s" + j + "_-]", "g"), b);
      return pe && (T = T.replace(/(\w)(\S*)/g, function(k, re, dt) {
        var Ve = re.toUpperCase() + (dt !== null ? dt : "");
        return Object.keys(M).indexOf(Ve.toLowerCase()) < 0 ? Ve : Ve.toLowerCase();
      })), T = T.replace(/\s+/g, b).replace(new RegExp("\\" + b + "+", "g"), b).replace(new RegExp("(^\\" + b + "+|\\" + b + "+$)", "g"), ""), te && T.length > te && (ft = T.charAt(te) === b, T = T.slice(0, te), ft || (T = T.slice(0, T.lastIndexOf(b)))), !ct && !pe && (T = T.toLowerCase()), T;
    }, g = function(h) {
      return function(b) {
        return c(b, h);
      };
    }, f = function(h) {
      return h.replace(/[-\\^$*+?.()|[\]{}\/]/g, "\\$&");
    }, p = function(m, h) {
      for (var _ in h) if (h[_] === m) return !0;
    };
    if (typeof t < "u" && t.exports)
      t.exports = c, t.exports.createSlug = g;
    else if (typeof define < "u" && define.amd) define([], function() {
      return c;
    });
    else try {
      if (n.getSlug || n.createSlug) throw "speakingurl: globals exists /(getSlug|createSlug)/";
      n.getSlug = c, n.createSlug = g;
    } catch {
    }
  })(e);
}));
(/* @__PURE__ */ Ut(((e, t) => {
  t.exports = Ro();
})))();
d.__VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__ ??= {
  id: 0,
  appIds: /* @__PURE__ */ new Set()
};
function Ao(e) {
  v.highPerfModeEnabled = e ?? !v.highPerfModeEnabled, !e && P.value && Xt(P.value.app);
}
function ko(e) {
  v.devtoolsClientDetected = {
    ...v.devtoolsClientDetected,
    ...e
  }, Ao(!Object.values(v.devtoolsClientDetected).some(Boolean));
}
d.__VUE_DEVTOOLS_UPDATE_CLIENT_DETECTED__ ??= ko;
var Do = class {
  constructor() {
    this.keyToValue = /* @__PURE__ */ new Map(), this.valueToKey = /* @__PURE__ */ new Map();
  }
  set(e, t) {
    this.keyToValue.set(e, t), this.valueToKey.set(t, e);
  }
  getByKey(e) {
    return this.keyToValue.get(e);
  }
  getByValue(e) {
    return this.valueToKey.get(e);
  }
  clear() {
    this.keyToValue.clear(), this.valueToKey.clear();
  }
}, Jt = class {
  constructor(e) {
    this.generateIdentifier = e, this.kv = new Do();
  }
  register(e, t) {
    this.kv.getByValue(e) || (t || (t = this.generateIdentifier(e)), this.kv.set(t, e));
  }
  clear() {
    this.kv.clear();
  }
  getIdentifier(e) {
    return this.kv.getByValue(e);
  }
  getValue(e) {
    return this.kv.getByKey(e);
  }
}, Vo = class extends Jt {
  constructor() {
    super((e) => e.name), this.classToAllowedProps = /* @__PURE__ */ new Map();
  }
  register(e, t) {
    typeof t == "object" ? (t.allowProps && this.classToAllowedProps.set(e, t.allowProps), super.register(e, t.identifier)) : super.register(e, t);
  }
  getAllowedProps(e) {
    return this.classToAllowedProps.get(e);
  }
};
function Lo(e) {
  if ("values" in Object) return Object.values(e);
  const t = [];
  for (const n in e) e.hasOwnProperty(n) && t.push(e[n]);
  return t;
}
function Uo(e, t) {
  const n = Lo(e);
  if ("find" in n) return n.find(t);
  const r = n;
  for (let o = 0; o < r.length; o++) {
    const s = r[o];
    if (t(s)) return s;
  }
}
function J(e, t) {
  Object.entries(e).forEach(([n, r]) => t(r, n));
}
function me(e, t) {
  return e.indexOf(t) !== -1;
}
function Ot(e, t) {
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    if (t(r)) return r;
  }
}
var Mo = class {
  constructor() {
    this.transfomers = {};
  }
  register(e) {
    this.transfomers[e.name] = e;
  }
  findApplicable(e) {
    return Uo(this.transfomers, (t) => t.isApplicable(e));
  }
  findByName(e) {
    return this.transfomers[e];
  }
};
const $o = (e) => Object.prototype.toString.call(e).slice(8, -1), Qt = (e) => typeof e > "u", xo = (e) => e === null, ue = (e) => typeof e != "object" || e === null || e === Object.prototype ? !1 : Object.getPrototypeOf(e) === null ? !0 : Object.getPrototypeOf(e) === Object.prototype, Ke = (e) => ue(e) && Object.keys(e).length === 0, z = (e) => Array.isArray(e), jo = (e) => typeof e == "string", Ho = (e) => typeof e == "number" && !isNaN(e), zo = (e) => typeof e == "boolean", Go = (e) => e instanceof RegExp, fe = (e) => e instanceof Map, de = (e) => e instanceof Set, en = (e) => $o(e) === "Symbol", Fo = (e) => e instanceof Date && !isNaN(e.valueOf()), Bo = (e) => e instanceof Error, St = (e) => typeof e == "number" && isNaN(e), Ko = (e) => zo(e) || xo(e) || Qt(e) || Ho(e) || jo(e) || en(e), Wo = (e) => typeof e == "bigint", Yo = (e) => e === 1 / 0 || e === -1 / 0, qo = (e) => ArrayBuffer.isView(e) && !(e instanceof DataView), Zo = (e) => e instanceof URL, tn = (e) => e.replace(/\./g, "\\."), xe = (e) => e.map(String).map(tn).join("."), ae = (e) => {
  const t = [];
  let n = "";
  for (let o = 0; o < e.length; o++) {
    let s = e.charAt(o);
    if (s === "\\" && e.charAt(o + 1) === ".") {
      n += ".", o++;
      continue;
    }
    if (s === ".") {
      t.push(n), n = "";
      continue;
    }
    n += s;
  }
  const r = n;
  return t.push(r), t;
};
function U(e, t, n, r) {
  return {
    isApplicable: e,
    annotation: t,
    transform: n,
    untransform: r
  };
}
const nn = [
  U(Qt, "undefined", () => null, () => {
  }),
  U(Wo, "bigint", (e) => e.toString(), (e) => typeof BigInt < "u" ? BigInt(e) : (console.error("Please add a BigInt polyfill."), e)),
  U(Fo, "Date", (e) => e.toISOString(), (e) => new Date(e)),
  U(Bo, "Error", (e, t) => {
    const n = {
      name: e.name,
      message: e.message
    };
    return t.allowedErrorProps.forEach((r) => {
      n[r] = e[r];
    }), n;
  }, (e, t) => {
    const n = new Error(e.message);
    return n.name = e.name, n.stack = e.stack, t.allowedErrorProps.forEach((r) => {
      n[r] = e[r];
    }), n;
  }),
  U(Go, "regexp", (e) => "" + e, (e) => {
    const t = e.slice(1, e.lastIndexOf("/")), n = e.slice(e.lastIndexOf("/") + 1);
    return new RegExp(t, n);
  }),
  U(de, "set", (e) => [...e.values()], (e) => new Set(e)),
  U(fe, "map", (e) => [...e.entries()], (e) => new Map(e)),
  U((e) => St(e) || Yo(e), "number", (e) => St(e) ? "NaN" : e > 0 ? "Infinity" : "-Infinity", Number),
  U((e) => e === 0 && 1 / e === -1 / 0, "number", () => "-0", Number),
  U(Zo, "URL", (e) => e.toString(), (e) => new URL(e))
];
function Re(e, t, n, r) {
  return {
    isApplicable: e,
    annotation: t,
    transform: n,
    untransform: r
  };
}
const rn = Re((e, t) => en(e) ? !!t.symbolRegistry.getIdentifier(e) : !1, (e, t) => ["symbol", t.symbolRegistry.getIdentifier(e)], (e) => e.description, (e, t, n) => {
  const r = n.symbolRegistry.getValue(t[1]);
  if (!r) throw new Error("Trying to deserialize unknown symbol");
  return r;
}), Xo = [
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray
].reduce((e, t) => (e[t.name] = t, e), {}), on = Re(qo, (e) => ["typed-array", e.constructor.name], (e) => [...e], (e, t) => {
  const n = Xo[t[1]];
  if (!n) throw new Error("Trying to deserialize unknown typed array");
  return new n(e);
});
function sn(e, t) {
  return e?.constructor ? !!t.classRegistry.getIdentifier(e.constructor) : !1;
}
const an = Re(sn, (e, t) => ["class", t.classRegistry.getIdentifier(e.constructor)], (e, t) => {
  const n = t.classRegistry.getAllowedProps(e.constructor);
  if (!n) return { ...e };
  const r = {};
  return n.forEach((o) => {
    r[o] = e[o];
  }), r;
}, (e, t, n) => {
  const r = n.classRegistry.getValue(t[1]);
  if (!r) throw new Error(`Trying to deserialize unknown class '${t[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
  return Object.assign(Object.create(r.prototype), e);
}), ln = Re((e, t) => !!t.customTransformerRegistry.findApplicable(e), (e, t) => ["custom", t.customTransformerRegistry.findApplicable(e).name], (e, t) => t.customTransformerRegistry.findApplicable(e).serialize(e), (e, t, n) => {
  const r = n.customTransformerRegistry.findByName(t[1]);
  if (!r) throw new Error("Trying to deserialize unknown custom value");
  return r.deserialize(e);
}), Jo = [
  an,
  rn,
  ln,
  on
], bt = (e, t) => {
  const n = Ot(Jo, (o) => o.isApplicable(e, t));
  if (n) return {
    value: n.transform(e, t),
    type: n.annotation(e, t)
  };
  const r = Ot(nn, (o) => o.isApplicable(e, t));
  if (r) return {
    value: r.transform(e, t),
    type: r.annotation
  };
}, cn = {};
nn.forEach((e) => {
  cn[e.annotation] = e;
});
const Qo = (e, t, n) => {
  if (z(t)) switch (t[0]) {
    case "symbol":
      return rn.untransform(e, t, n);
    case "class":
      return an.untransform(e, t, n);
    case "custom":
      return ln.untransform(e, t, n);
    case "typed-array":
      return on.untransform(e, t, n);
    default:
      throw new Error("Unknown transformation: " + t);
  }
  else {
    const r = cn[t];
    if (!r) throw new Error("Unknown transformation: " + t);
    return r.untransform(e, n);
  }
}, q = (e, t) => {
  if (t > e.size) throw new Error("index out of bounds");
  const n = e.keys();
  for (; t > 0; )
    n.next(), t--;
  return n.next().value;
};
function un(e) {
  if (me(e, "__proto__")) throw new Error("__proto__ is not allowed as a property");
  if (me(e, "prototype")) throw new Error("prototype is not allowed as a property");
  if (me(e, "constructor")) throw new Error("constructor is not allowed as a property");
}
const es = (e, t) => {
  un(t);
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    if (de(e)) e = q(e, +r);
    else if (fe(e)) {
      const o = +r, s = +t[++n] == 0 ? "key" : "value", i = q(e, o);
      switch (s) {
        case "key":
          e = i;
          break;
        case "value":
          e = e.get(i);
          break;
      }
    } else e = e[r];
  }
  return e;
}, We = (e, t, n) => {
  if (un(t), t.length === 0) return n(e);
  let r = e;
  for (let s = 0; s < t.length - 1; s++) {
    const i = t[s];
    if (z(r)) {
      const a = +i;
      r = r[a];
    } else if (ue(r)) r = r[i];
    else if (de(r)) {
      const a = +i;
      r = q(r, a);
    } else if (fe(r)) {
      if (s === t.length - 2) break;
      const a = +i, l = +t[++s] == 0 ? "key" : "value", u = q(r, a);
      switch (l) {
        case "key":
          r = u;
          break;
        case "value":
          r = r.get(u);
          break;
      }
    }
  }
  const o = t[t.length - 1];
  if (z(r) ? r[+o] = n(r[+o]) : ue(r) && (r[o] = n(r[o])), de(r)) {
    const s = q(r, +o), i = n(s);
    s !== i && (r.delete(s), r.add(i));
  }
  if (fe(r)) {
    const s = +t[t.length - 2], i = q(r, s);
    switch (+o == 0 ? "key" : "value") {
      case "key": {
        const a = n(i);
        r.set(a, r.get(i)), a !== i && r.delete(i);
        break;
      }
      case "value":
        r.set(i, n(r.get(i)));
        break;
    }
  }
  return e;
};
function Ye(e, t, n = []) {
  if (!e) return;
  if (!z(e)) {
    J(e, (s, i) => Ye(s, t, [...n, ...ae(i)]));
    return;
  }
  const [r, o] = e;
  o && J(o, (s, i) => {
    Ye(s, t, [...n, ...ae(i)]);
  }), t(r, n);
}
function ts(e, t, n) {
  return Ye(t, (r, o) => {
    e = We(e, o, (s) => Qo(s, r, n));
  }), e;
}
function ns(e, t) {
  function n(r, o) {
    const s = es(e, ae(o));
    r.map(ae).forEach((i) => {
      e = We(e, i, () => s);
    });
  }
  if (z(t)) {
    const [r, o] = t;
    r.forEach((s) => {
      e = We(e, ae(s), () => e);
    }), o && J(o, n);
  } else J(t, n);
  return e;
}
const rs = (e, t) => ue(e) || z(e) || fe(e) || de(e) || sn(e, t);
function os(e, t, n) {
  const r = n.get(e);
  r ? r.push(t) : n.set(e, [t]);
}
function ss(e, t) {
  const n = {};
  let r;
  return e.forEach((o) => {
    if (o.length <= 1) return;
    t || (o = o.map((a) => a.map(String)).sort((a, l) => a.length - l.length));
    const [s, ...i] = o;
    s.length === 0 ? r = i.map(xe) : n[xe(s)] = i.map(xe);
  }), r ? Ke(n) ? [r] : [r, n] : Ke(n) ? void 0 : n;
}
const fn = (e, t, n, r, o = [], s = [], i = /* @__PURE__ */ new Map()) => {
  const a = Ko(e);
  if (!a) {
    os(e, o, t);
    const f = i.get(e);
    if (f) return r ? { transformedValue: null } : f;
  }
  if (!rs(e, n)) {
    const f = bt(e, n), p = f ? {
      transformedValue: f.value,
      annotations: [f.type]
    } : { transformedValue: e };
    return a || i.set(e, p), p;
  }
  if (me(s, e)) return { transformedValue: null };
  const l = bt(e, n), u = l?.value ?? e, E = z(u) ? [] : {}, c = {};
  J(u, (f, p) => {
    if (p === "__proto__" || p === "constructor" || p === "prototype") throw new Error(`Detected property ${p}. This is a prototype pollution risk, please remove it from your object.`);
    const m = fn(f, t, n, r, [...o, p], [...s, e], i);
    E[p] = m.transformedValue, z(m.annotations) ? c[p] = m.annotations : ue(m.annotations) && J(m.annotations, (h, _) => {
      c[tn(p) + "." + _] = h;
    });
  });
  const g = Ke(c) ? {
    transformedValue: E,
    annotations: l ? [l.type] : void 0
  } : {
    transformedValue: E,
    annotations: l ? [l.type, c] : c
  };
  return a || i.set(e, g), g;
};
function dn(e) {
  return Object.prototype.toString.call(e).slice(8, -1);
}
function It(e) {
  return dn(e) === "Array";
}
function is(e) {
  if (dn(e) !== "Object") return !1;
  const t = Object.getPrototypeOf(e);
  return !!t && t.constructor === Object && t === Object.prototype;
}
function as(e, t, n, r, o) {
  const s = {}.propertyIsEnumerable.call(r, t) ? "enumerable" : "nonenumerable";
  s === "enumerable" && (e[t] = n), o && s === "nonenumerable" && Object.defineProperty(e, t, {
    value: n,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
}
function qe(e, t = {}) {
  if (It(e)) return e.map((o) => qe(o, t));
  if (!is(e)) return e;
  const n = Object.getOwnPropertyNames(e), r = Object.getOwnPropertySymbols(e);
  return [...n, ...r].reduce((o, s) => {
    if (It(t.props) && !t.props.includes(s)) return o;
    const i = e[s];
    return as(o, s, qe(i, t), e, t.nonenumerable), o;
  }, {});
}
var O = class {
  /**
  * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
  */
  constructor({ dedupe: e = !1 } = {}) {
    this.classRegistry = new Vo(), this.symbolRegistry = new Jt((t) => t.description ?? ""), this.customTransformerRegistry = new Mo(), this.allowedErrorProps = [], this.dedupe = e;
  }
  serialize(e) {
    const t = /* @__PURE__ */ new Map(), n = fn(e, t, this, this.dedupe), r = { json: n.transformedValue };
    n.annotations && (r.meta = {
      ...r.meta,
      values: n.annotations
    });
    const o = ss(t, this.dedupe);
    return o && (r.meta = {
      ...r.meta,
      referentialEqualities: o
    }), r;
  }
  deserialize(e) {
    const { json: t, meta: n } = e;
    let r = qe(t);
    return n?.values && (r = ts(r, n.values, this)), n?.referentialEqualities && (r = ns(r, n.referentialEqualities)), r;
  }
  stringify(e) {
    return JSON.stringify(this.serialize(e));
  }
  parse(e) {
    return this.deserialize(JSON.parse(e));
  }
  registerClass(e, t) {
    this.classRegistry.register(e, t);
  }
  registerSymbol(e, t) {
    this.symbolRegistry.register(e, t);
  }
  registerCustom(e, t) {
    this.customTransformerRegistry.register({
      name: t,
      ...e
    });
  }
  allowErrorProps(...e) {
    this.allowedErrorProps.push(...e);
  }
};
O.defaultInstance = new O();
O.serialize = O.defaultInstance.serialize.bind(O.defaultInstance);
O.deserialize = O.defaultInstance.deserialize.bind(O.defaultInstance);
O.stringify = O.defaultInstance.stringify.bind(O.defaultInstance);
O.parse = O.defaultInstance.parse.bind(O.defaultInstance);
O.registerClass = O.defaultInstance.registerClass.bind(O.defaultInstance);
O.registerSymbol = O.defaultInstance.registerSymbol.bind(O.defaultInstance);
O.registerCustom = O.defaultInstance.registerCustom.bind(O.defaultInstance);
O.allowErrorProps = O.defaultInstance.allowErrorProps.bind(O.defaultInstance);
d.__VUE_DEVTOOLS_KIT_MESSAGE_CHANNELS__ ??= [];
d.__VUE_DEVTOOLS_KIT_RPC_CLIENT__ ??= null;
d.__VUE_DEVTOOLS_KIT_RPC_SERVER__ ??= null;
d.__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ ??= null;
d.__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__ ??= null;
d.__VUE_DEVTOOLS_KIT_BROADCAST_RPC_SERVER__ ??= null;
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
const Ne = typeof window < "u", ls = /* @__PURE__ */ or({
  reporters: [/* @__PURE__ */ er()],
  codes: {
    PINIA_R1001: {
      why: 'Directly pass all stores to "mapStores()" without putting them in an array. This will fail in production.',
      fix: "Replace mapStores([useAuthStore, useCartStore]) with mapStores(useAuthStore, useCartStore).",
      docs: "https://pinia.vuejs.org/cookbook/options-api.html#Giving-access-to-the-whole-store"
    },
    PINIA_R1002: {
      why: (e) => `A getter cannot have the same name as another state property. Found "${e.name}" in store "${e.id}".`,
      fix: "Rename either the getter or the state property.",
      docs: "https://pinia.vuejs.org/core-concepts/getters.html#Accessing-other-getters"
    },
    PINIA_R1003: {
      why: (e) => `The "state" must be a plain object. Found in store "${e.id}".`,
      fix: "Return a plain object, e.g. avoid state: () => new MyClass().",
      docs: "https://pinia.vuejs.org/core-concepts/state.html#State"
    },
    PINIA_R1004: {
      why: "Pinia instance not found in context. This falls back to the global activePinia, which exposes you to cross-request pollution on the server.",
      fix: '"useStore()" is a composable and follows the same rules: call it at the top of setup() (or another composable), or pass the pinia instance explicitly when used outside of a component.',
      docs: "https://pinia.vuejs.org/ssr/#Using-the-store-outside-of-setup-"
    },
    PINIA_R1005: {
      why: (e) => `The store id changed from "${e.from}" to "${e.to}", forcing a reload.`,
      docs: "https://pinia.vuejs.org/cookbook/hot-module-replacement.html#HMR-Hot-Module-Replacement-"
    },
    PINIA_R1006: {
      why: (e) => `Property "${e.key}" of store "${e.id}" is not reactive (not a ref, reactive object, or shallowRef), so storeToRefs() ignores it.`,
      fix: "If it should be reactive state, wrap it with ref(), reactive(), or shallowRef(). If it is an intentional non-reactive property, wrap it with markRaw() so storeToRefs() skips it explicitly.",
      docs: "https://pinia.vuejs.org/core-concepts/plugins.html#Adding-new-external-properties"
    },
    PINIA_R1007: {
      why: (e) => `The same callback was passed to "$subscribe()" of store "${e.id}" more than once. Subscriptions are deduplicated, so the duplicate is ignored.`,
      fix: "Subscribe each callback only once. If you need to resubscribe, call the returned function to remove the previous subscription first, or create a new function.",
      docs: "https://pinia.vuejs.org/core-concepts/state.html#Subscribing-to-the-state"
    }
  }
});
let Ze;
const pn = (e) => Ze = e, cs = process.env.NODE_ENV !== "production" ? () => {
  const e = pt() && Se(Xe);
  return !e && !Ne && ls.PINIA_R1004({}, { method: "error" }), e || Ze;
} : () => pt() && Se(Xe) || Ze, Xe = process.env.NODE_ENV !== "production" ? Symbol("pinia") : (
  /* istanbul ignore next */
  Symbol()
), vt = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function us(e, { autoBom: t = !1 } = {}) {
  return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["\uFEFF", e], { type: e.type }) : e;
}
function at(e, t, n) {
  const r = new XMLHttpRequest();
  r.open("GET", e), r.responseType = "blob", r.onload = function() {
    En(r.response, t, n);
  }, r.onerror = function() {
    console.error("could not download file");
  }, r.send();
}
function _n(e) {
  const t = new XMLHttpRequest();
  t.open("HEAD", e, !1);
  try {
    t.send();
  } catch {
  }
  return t.status >= 200 && t.status <= 299;
}
function ye(e) {
  try {
    e.dispatchEvent(new MouseEvent("click"));
  } catch {
    const n = new MouseEvent("click", {
      bubbles: !0,
      cancelable: !0,
      view: window,
      detail: 0,
      screenX: 80,
      screenY: 20,
      clientX: 80,
      clientY: 20,
      ctrlKey: !1,
      altKey: !1,
      shiftKey: !1,
      metaKey: !1,
      button: 0,
      relatedTarget: null
    });
    e.dispatchEvent(n);
  }
}
const Te = typeof navigator == "object" ? navigator : { userAgent: "" }, hn = /Macintosh/.test(Te.userAgent) && /AppleWebKit/.test(Te.userAgent) && !/Safari/.test(Te.userAgent), En = Ne ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !hn ? fs : "msSaveOrOpenBlob" in Te ? ds : ps : () => {
};
function fs(e, t = "download", n) {
  const r = document.createElement("a");
  r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin !== location.origin ? _n(r.href) ? at(e, t, n) : (r.target = "_blank", ye(r)) : ye(r)) : (r.href = URL.createObjectURL(e), setTimeout(function() {
    URL.revokeObjectURL(r.href);
  }, 4e4), setTimeout(function() {
    ye(r);
  }, 0));
}
function ds(e, t = "download", n) {
  if (typeof e == "string") if (_n(e)) at(e, t, n);
  else {
    const r = document.createElement("a");
    r.href = e, r.target = "_blank", setTimeout(function() {
      ye(r);
    });
  }
  else navigator.msSaveOrOpenBlob(us(e, n), t);
}
function ps(e, t, n, r) {
  if (r = r || open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return at(e, t, n);
  const o = e.type === "application/octet-stream", s = /constructor/i.test(String(vt.HTMLElement)) || "safari" in vt, i = /CriOS\/[\d]+/.test(navigator.userAgent);
  if ((i || o && s || hn) && typeof FileReader < "u") {
    const a = new FileReader();
    a.onloadend = function() {
      let l = a.result;
      if (typeof l != "string")
        throw r = null, new Error("Wrong reader.result type");
      l = i ? l : l.replace(/^data:[^;]*;/, "data:attachment/file;"), r ? r.location.href = l : location.assign(l), r = null;
    }, a.readAsDataURL(e);
  } else {
    const a = URL.createObjectURL(e);
    r ? r.location.assign(a) : location.href = a, r = null, setTimeout(function() {
      URL.revokeObjectURL(a);
    }, 4e4);
  }
}
function N(e, t) {
  const n = "🍍 " + e;
  t === "error" ? console.error(n) : t === "warn" ? console.warn(n) : console.debug(n);
}
function lt(e) {
  return "_a" in e && "install" in e;
}
function gn(e, t) {
  const n = le(e)[t];
  return wn(n) && !Pn(n);
}
function mn() {
  if (!("clipboard" in navigator))
    return N("Your browser doesn't support the Clipboard API", "error"), !0;
}
function yn(e) {
  return e instanceof Error && e.message.toLowerCase().includes("document is not focused") ? (N('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn"), !0) : !1;
}
async function _s(e) {
  if (!mn())
    try {
      await navigator.clipboard.writeText(JSON.stringify(e.state.value)), N("Global state copied to clipboard.");
    } catch (t) {
      if (yn(t)) return;
      N("Failed to serialize the state. Check the console for more details.", "error"), console.error(t);
    }
}
async function hs(e) {
  if (!mn())
    try {
      Tn(e, JSON.parse(await navigator.clipboard.readText())), N("Global state pasted from clipboard.");
    } catch (t) {
      if (yn(t)) return;
      N("Failed to deserialize the state from clipboard. Check the console for more details.", "error"), console.error(t);
    }
}
async function Es(e) {
  try {
    En(new Blob([JSON.stringify(e.state.value)], { type: "text/plain;charset=utf-8" }), "pinia-state.json");
  } catch (t) {
    N("Failed to export the state as JSON. Check the console for more details.", "error"), console.error(t);
  }
}
let x;
function gs() {
  x || (x = document.createElement("input"), x.type = "file", x.accept = ".json");
  function e() {
    return new Promise((t, n) => {
      x.onchange = async () => {
        const r = x.files;
        if (!r) return t(null);
        const o = r.item(0);
        return t(o ? {
          text: await o.text(),
          file: o
        } : null);
      }, x.oncancel = () => t(null), x.onerror = n, x.click();
    });
  }
  return e;
}
async function ms(e) {
  try {
    const t = await gs()();
    if (!t) return;
    const { text: n, file: r } = t;
    Tn(e, JSON.parse(n)), N(`Global state imported from "${r.name}".`);
  } catch (t) {
    N("Failed to import the state from JSON. Check the console for more details.", "error"), console.error(t);
  }
}
function Tn(e, t) {
  for (const n in t) {
    const r = e.state.value[n];
    r ? Object.assign(r, t[n]) : e.state.value[n] = t[n];
  }
}
function D(e) {
  return { _custom: { display: e } };
}
const On = "🍍 Pinia (root)", ys = "_root";
function Ts(e) {
  return lt(e) ? {
    id: ys,
    label: On
  } : {
    id: e.$id,
    label: e.$id
  };
}
function Os(e) {
  if (lt(e)) {
    const n = Array.from(e._s.keys()), r = e._s;
    return {
      state: n.map((o) => ({
        editable: !0,
        key: o,
        value: e.state.value[o]
      })),
      getters: n.filter((o) => r.get(o)._getters).map((o) => {
        const s = r.get(o);
        return {
          editable: !1,
          key: o,
          value: s._getters.reduce((i, a) => (i[a] = s[a], i), {})
        };
      })
    };
  }
  const t = { state: Object.keys(e.$state).map((n) => ({
    editable: !0,
    key: n,
    value: e.$state[n]
  })) };
  return e._getters && e._getters.length && (t.getters = e._getters.map((n) => ({
    editable: gn(e, n),
    key: n,
    value: e[n]
  }))), e._customProperties.size && (t.customProperties = Array.from(e._customProperties).map((n) => ({
    editable: !0,
    key: n,
    value: e[n]
  }))), t;
}
function Ss(e) {
  return e ? Array.isArray(e) ? e.reduce((t, n) => (t.keys.push(n.key), t.operations.push(n.type), t.oldValue[n.key] = n.oldValue, t.newValue[n.key] = n.newValue, t), {
    oldValue: {},
    keys: [],
    operations: [],
    newValue: {}
  }) : {
    operation: D(e.type),
    key: D(e.key),
    oldValue: e.oldValue,
    newValue: e.newValue
  } : {};
}
function bs(e) {
  switch (e) {
    case "direct":
      return "mutation";
    case "patch function":
      return "$patch";
    case "patch object":
      return "$patch";
    default:
      return "unknown";
  }
}
let Z = !0;
const Oe = [], G = "pinia:mutations", w = "pinia", { assign: Is } = Object, Ce = (e) => "🍍 " + e;
function vs(e, t) {
  Zt({
    id: "dev.esm.pinia",
    label: "Pinia 🍍",
    logo: "https://pinia.vuejs.org/logo.svg",
    packageName: "pinia",
    homepage: "https://pinia.vuejs.org",
    componentStateTypes: Oe,
    app: e
  }, (n) => {
    typeof n.now != "function" && N("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html."), n.addTimelineLayer({
      id: G,
      label: "Pinia 🍍",
      color: 15064968
    }), n.addInspector({
      id: w,
      label: "Pinia 🍍",
      icon: "storage",
      treeFilterPlaceholder: "Search stores",
      actions: [
        {
          icon: "content_copy",
          action: () => {
            _s(t);
          },
          tooltip: "Serialize and copy the state"
        },
        {
          icon: "content_paste",
          action: async () => {
            await hs(t), n.sendInspectorTree(w), n.sendInspectorState(w);
          },
          tooltip: "Replace the state with the content of your clipboard"
        },
        {
          icon: "save",
          action: () => {
            Es(t);
          },
          tooltip: "Save the state as a JSON file"
        },
        {
          icon: "folder_open",
          action: async () => {
            await ms(t), n.sendInspectorTree(w), n.sendInspectorState(w);
          },
          tooltip: "Import the state from a JSON file"
        }
      ],
      nodeActions: [{
        icon: "restore",
        tooltip: 'Reset the state (with "$reset")',
        action: (r) => {
          const o = t._s.get(r);
          o ? typeof o.$reset != "function" ? N(`Cannot reset "${r}" store because it doesn't have a "$reset" method implemented.`, "warn") : (o.$reset(), N(`Store "${r}" reset.`)) : N(`Cannot reset "${r}" store because it wasn't found.`, "warn");
        }
      }]
    }), n.on.inspectComponent((r) => {
      const o = r.componentInstance && r.componentInstance.proxy;
      if (o && o._pStores) {
        const s = r.componentInstance.proxy._pStores;
        Object.values(s).forEach((i) => {
          r.instanceData.state.push({
            type: Ce(i.$id),
            key: "state",
            editable: !0,
            value: i._isOptionsAPI ? { _custom: {
              value: le(i.$state),
              actions: [{
                icon: "restore",
                tooltip: "Reset the state of this store",
                action: () => i.$reset()
              }]
            } } : Object.keys(i.$state).reduce((a, l) => (a[l] = i.$state[l], a), {})
          }), i._getters && i._getters.length && r.instanceData.state.push({
            type: Ce(i.$id),
            key: "getters",
            editable: !1,
            value: i._getters.reduce((a, l) => {
              try {
                a[l] = i[l];
              } catch (u) {
                a[l] = u;
              }
              return a;
            }, {})
          });
        });
      }
    }), n.on.getInspectorTree((r) => {
      if (r.app === e && r.inspectorId === w) {
        let o = [t];
        o = o.concat(Array.from(t._s.values())), r.rootNodes = (r.filter ? o.filter((s) => "$id" in s ? s.$id.toLowerCase().includes(r.filter.toLowerCase()) : On.toLowerCase().includes(r.filter.toLowerCase())) : o).map(Ts);
      }
    }), globalThis.$pinia = t, n.on.getInspectorState((r) => {
      if (r.app === e && r.inspectorId === w) {
        const o = r.nodeId === "_root" ? t : t._s.get(r.nodeId);
        if (!o) return;
        o && (r.nodeId !== "_root" && (globalThis.$store = le(o)), r.state = Os(o));
      }
    }), n.on.editInspectorState((r) => {
      if (r.app === e && r.inspectorId === w) {
        const o = r.nodeId === "_root" ? t : t._s.get(r.nodeId);
        if (!o) return N(`store "${r.nodeId}" not found`, "error");
        const { path: s } = r;
        lt(o) ? s.unshift("state") : (s.length !== 1 || !o._customProperties.has(s[0]) && !gn(o, s[0]) || s[0] in o.$state) && s.unshift("$state"), Z = !1, r.set(o, s, r.state.value), Z = !0;
      }
    }), n.on.editComponentState((r) => {
      if (r.type.startsWith("🍍")) {
        const o = r.type.replace(/^🍍\s*/, ""), s = t._s.get(o);
        if (!s) return N(`store "${o}" not found`, "error");
        const { path: i } = r;
        if (i[0] !== "state") return N(`Invalid path for store "${o}":
${i}
Only state can be modified.`);
        i[0] = "$state", Z = !1, r.set(s, i, r.state.value), Z = !0;
      }
    });
  });
}
function Ns(e, t) {
  Oe.includes(Ce(t.$id)) || Oe.push(Ce(t.$id)), Zt({
    id: "dev.esm.pinia",
    label: "Pinia 🍍",
    logo: "https://pinia.vuejs.org/logo.svg",
    packageName: "pinia",
    homepage: "https://pinia.vuejs.org",
    componentStateTypes: Oe,
    app: e,
    settings: { logStoreChanges: {
      label: "Notify about new/deleted stores",
      type: "boolean",
      defaultValue: !0
    } }
  }, (n) => {
    const r = typeof n.now == "function" ? n.now.bind(n) : Date.now;
    t.$onAction(({ after: i, onError: a, name: l, args: u }) => {
      const E = Sn++;
      n.addTimelineEvent({
        layerId: G,
        event: {
          time: r(),
          title: "🛫 " + l,
          subtitle: "start",
          data: {
            store: D(t.$id),
            action: D(l),
            args: u
          },
          groupId: E
        }
      }), i((c) => {
        H = void 0, n.addTimelineEvent({
          layerId: G,
          event: {
            time: r(),
            title: "🛬 " + l,
            subtitle: "end",
            data: {
              store: D(t.$id),
              action: D(l),
              args: u,
              result: c
            },
            groupId: E
          }
        });
      }), a((c) => {
        H = void 0, n.addTimelineEvent({
          layerId: G,
          event: {
            time: r(),
            logType: "error",
            title: "💥 " + l,
            subtitle: "end",
            data: {
              store: D(t.$id),
              action: D(l),
              args: u,
              error: c
            },
            groupId: E
          }
        });
      });
    }, !0), t._customProperties.forEach((i) => {
      Nn(() => Cn(t[i]), (a, l) => {
        n.notifyComponentUpdate(), n.sendInspectorState(w), Z && n.addTimelineEvent({
          layerId: G,
          event: {
            time: r(),
            title: "Change",
            subtitle: i,
            data: {
              newValue: a,
              oldValue: l
            },
            groupId: H
          }
        });
      }, { deep: !0 });
    }), t.$subscribe(({ events: i, type: a }, l) => {
      if (n.notifyComponentUpdate(), n.sendInspectorState(w), !Z) return;
      const u = {
        time: r(),
        title: bs(a),
        data: Is({ store: D(t.$id) }, Ss(i)),
        groupId: H
      };
      a === "patch function" ? u.subtitle = "⤵️" : a === "patch object" ? u.subtitle = "🧩" : i && !Array.isArray(i) && (u.subtitle = i.type), i && (u.data["rawEvent(s)"] = { _custom: {
        display: "DebuggerEvent",
        type: "object",
        tooltip: "raw DebuggerEvent[]",
        value: i
      } }), n.addTimelineEvent({
        layerId: G,
        event: u
      });
    }, {
      detached: !0,
      flush: "sync"
    });
    const o = t._hotUpdate;
    t._hotUpdate = Ct((i) => {
      o(i), n.addTimelineEvent({
        layerId: G,
        event: {
          time: r(),
          title: "🔥 " + t.$id,
          subtitle: "HMR update",
          data: {
            store: D(t.$id),
            info: D("HMR update")
          }
        }
      }), n.notifyComponentUpdate(), n.sendInspectorTree(w), n.sendInspectorState(w);
    });
    const { $dispose: s } = t;
    t.$dispose = () => {
      s(), n.notifyComponentUpdate(), n.sendInspectorTree(w), n.sendInspectorState(w), n.getSettings().logStoreChanges && N(`Disposed "${t.$id}" store 🗑`);
    }, n.notifyComponentUpdate(), n.sendInspectorTree(w), n.sendInspectorState(w), n.getSettings().logStoreChanges && N(`"${t.$id}" store installed 🆕`);
  });
}
let Sn = 0, H;
function Nt(e, t, n) {
  const r = t.reduce((o, s) => (o[s] = le(e)[s], o), {});
  for (const o in r) e[o] = function() {
    const s = Sn, i = n ? new Proxy(e, {
      get(...l) {
        return H = s, Reflect.get(...l);
      },
      set(...l) {
        return H = s, Reflect.set(...l);
      }
    }) : e;
    H = s;
    const a = r[o].apply(i, arguments);
    return H = void 0, a;
  };
}
function Cs({ app: e, store: t, options: n }) {
  if (!t.$id.startsWith("__hot:")) {
    if (t._isOptionsAPI = !!n.state, !t._p._testing) {
      Nt(t, Object.keys(n.actions), t._isOptionsAPI);
      const r = t._hotUpdate;
      le(t)._hotUpdate = function(o) {
        r.apply(this, arguments), Nt(t, Object.keys(o._hmrPayload.actions), !!t._isOptionsAPI);
      };
    }
    Ns(e, t);
  }
}
function ws() {
  const e = vn(!0), t = e.run(() => oe({}));
  let n = [], r = [];
  const o = Ct({
    install(s) {
      pn(o), o._a = s, s.provide(Xe, o), s.config.globalProperties.$pinia = o, process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && Ne && vs(s, o), r.forEach((i) => n.push(i)), r = [];
    },
    use(s) {
      return this._a ? n.push(s) : r.push(s), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && Ne && typeof Proxy < "u" && o.use(Cs), o;
}
process.env.NODE_ENV !== "production" ? Symbol("pinia:skipHydration") : (
  /* istanbul ignore next */
  Symbol()
);
var Ps = Object.defineProperty, Rs = (e, t, n) => t in e ? Ps(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Y = (e, t, n) => Rs(e, typeof t != "symbol" ? t + "" : t, n), bn = /* @__PURE__ */ Symbol("wippy:emit"), In = /* @__PURE__ */ Symbol("wippy:props"), As = /* @__PURE__ */ Symbol("wippy:props_error"), ks = /* @__PURE__ */ Symbol("wippy:content"), Ds = /* @__PURE__ */ Symbol("wippy:panel-id"), Vs = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ls = /* @__PURE__ */ Symbol("wippy:host"), Us = /* @__PURE__ */ Symbol("wippy:host-visibility");
function js() {
  const e = Se(In);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Hs() {
  const e = Se(bn);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var zs = class extends Zn {
  constructor() {
    super(...arguments), Y(this, "_vueApp", null), Y(this, "_propsRef", oe({})), Y(this, "_errorsRef", oe([])), Y(this, "_contentRef", oe(null)), Y(this, "_hostVisibilityRef", oe(null)), Y(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, s) {
    const i = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((u, E) => {
      this._propsRef.value = u, this._errorsRef.value = [...E];
      for (const c of E)
        this.emitEvent("invalid", { message: c });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: a.signal });
    const l = (u) => {
      if (a.signal.aborted)
        return;
      const E = cs(), c = Rn(u.rootComponent);
      this._vueApp = c;
      const g = ws();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          g.use(f);
      if (c.use(g), u.plugins)
        for (const f of u.plugins)
          c.use(f);
      c.provide(In, this._propsRef), c.provide(As, this._errorsRef), c.provide(bn, this.emitEvent.bind(this)), c.provide(ks, this._contentRef), c.provide(Us, this._hostVisibilityRef), c.provide(Ds, Jn(this)), c.provide(Vs, Xn(this)), c.provide(Ls, Pt(this)), u.providers && u.providers(c, this), c.mount(t), E && pn(E);
    };
    if (i.rootComponent)
      l(i);
    else if (i.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), i.lazyConfig().then((E) => {
        a.signal.aborted || (u.remove(), l(E));
      }).catch((E) => {
        if (a.signal.aborted)
          return;
        const c = E instanceof Error ? E.message : String(E), g = document.createElement("wippy-error");
        g.setAttribute("title", "Failed to load"), g.setAttribute("message", c), u.replaceWith(g), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
export {
  zs as W,
  Hs as a,
  js as u
};
//# sourceMappingURL=index-BzYkOw4T.js.map
