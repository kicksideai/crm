import { hasInjectionContext as En, inject as qe, effectScope as Ln, ref as B, markRaw as An, createApp as Nn, readonly as jn, getCurrentInstance as nt, onMounted as Rn, nextTick as Vn, watch as me, reactive as In, renderSlot as Ae, openBlock as Dn, createBlock as Mn, Teleport as It, createCommentVNode as Dt, useId as Un, mergeProps as Le, h as Wn } from "vue";
import { addCollection as Bn } from "@iconify/vue";
import { config as rt, addIcons as Hn, on as Fn, applyThemeMode as Te, host as zn, hostCss as Kn, loadCss as Yn } from "@wippy-fe/proxy";
var Ue = "data-wippy-visible";
function ot(e) {
  const t = e.getAttribute(Ue);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Gn = Object.defineProperty, qn = (e, t, n) => t in e ? Gn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, x = (e, t, n) => qn(e, typeof t != "symbol" ? t + "" : t, n), Qn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Jn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function it(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Zn(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, a] of Object.entries(o)) {
            const i = typeof a == "string" ? it(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const l = typeof o == "string" ? it(r) : null;
        l && t.add(l);
      }
  return [...t].sort();
}
function Xn(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Jn} {
${t}
}`;
}
function er(e, t) {
  const n = Xn(t);
  n && Mt(e, n, "@wippy-fe/css-variables-bridge");
}
function tr(e, t) {
  const r = (t ?? Qn).map(async (o) => {
    const l = Kn[o];
    if (!l)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Yn(l);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${l}):`, s), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const l of o) {
      if (!l)
        continue;
      const s = document.createElement("style");
      s.textContent = l, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function nr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Mt(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function rr(e, t) {
  Mt(e, t, "@wippy-fe/custom-css");
}
function Ut(e) {
  return e.__wippyHost ?? null;
}
function or(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function ir(e, t, n) {
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
function Ie(e, t) {
  const n = {}, r = [];
  for (const [o, l] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), a = or(o);
    if (s === null) {
      l.default !== void 0 && (n[a] = l.default);
      continue;
    }
    const i = ir(o, s, l);
    i.error ? r.push(i.error) : n[a] = i.value;
  }
  return { props: n, errors: r };
}
var sr = class {
  constructor(e, t) {
    x(this, "_props"), x(this, "_errors"), x(this, "_content"), x(this, "_hostVisibility"), x(this, "_propsListeners", /* @__PURE__ */ new Set()), x(this, "_contentListeners", /* @__PURE__ */ new Set()), x(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), x(this, "_disposed", !1), x(this, "_emitToDom"), x(this, "props"), x(this, "events"), x(this, "content"), x(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, ar = class extends HTMLElement {
  constructor() {
    super(), x(this, "_internals"), x(this, "_contentObserver", null), x(this, "_initialized", !1), x(this, "_container", null), x(this, "_reactive", null), x(this, "_lastProps", null), x(this, "_lastErrors", []), x(this, "_lastContent", null), x(this, "_themeUnsub", null), x(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = ot(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Ue])];
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
    return Ut(this);
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
        const l = Ie(this, e.propsSchema);
        e.validateProps && l.errors.push(...e.validateProps(l.props)), n = l.props, r = l.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new sr(
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
        this.onInit(n), e.inlineCss && nr(n, e.inlineCss);
        try {
          const u = rt?.theming, d = Zn(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          er(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = rt?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && rr(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && tr(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, Hn(Bn);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Fn("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: l } = Ie(this, e.propsSchema);
      e.validateProps && l.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = l;
      let a = null;
      e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, l, a, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = zn.getThemeMode?.()) {
    Te(e, this), this._container && Te(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Te("auto", this), this._container && Te("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Ue) {
      const a = this._hostVisible, i = ot(this);
      if (i === a)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, a), this.onHostVisibilityChanged(i, a));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: l } = Ie(this, r.propsSchema);
    r.validateProps && l.push(...r.validateProps(o));
    const s = o;
    this._lastProps = s, this._lastErrors = l, this._reactive?.notifyProps(s, l), this.onPropsChanged(s, l);
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
function lr(e) {
  return e.__wippyHostBus ?? null;
}
function ur(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Wt;
const Bt = (e) => Wt = e, dr = () => En() && qe(Ht) || Wt, Ht = (
  /* istanbul ignore next */
  Symbol()
);
function cr() {
  const e = Ln(!0), t = e.run(() => B({}));
  let n = [], r = [];
  const o = An({
    install(l) {
      Bt(o), o._a = l, l.provide(Ht, o), l.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
    },
    use(l) {
      return this._a ? n.push(l) : r.push(l), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var mr = Object.defineProperty, pr = (e, t, n) => t in e ? mr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, le = (e, t, n) => pr(e, typeof t != "symbol" ? t + "" : t, n), Ft = /* @__PURE__ */ Symbol("wippy:emit"), zt = /* @__PURE__ */ Symbol("wippy:props"), fr = /* @__PURE__ */ Symbol("wippy:props_error"), hr = /* @__PURE__ */ Symbol("wippy:content"), vr = /* @__PURE__ */ Symbol("wippy:panel-id"), gr = /* @__PURE__ */ Symbol("wippy:layout-bus"), yr = /* @__PURE__ */ Symbol("wippy:host"), br = /* @__PURE__ */ Symbol("wippy:host-visibility");
function gi() {
  const e = qe(zt);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function yi() {
  const e = qe(Ft);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var bi = class extends ar {
  constructor() {
    super(...arguments), le(this, "_vueApp", null), le(this, "_propsRef", B({})), le(this, "_errorsRef", B([])), le(this, "_contentRef", B(null)), le(this, "_hostVisibilityRef", B(null)), le(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, l) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: a.signal });
    const i = (u) => {
      if (a.signal.aborted)
        return;
      const d = dr(), c = Nn(u.rootComponent);
      this._vueApp = c;
      const m = cr();
      if (u.piniaPlugins)
        for (const p of u.piniaPlugins)
          m.use(p);
      if (c.use(m), u.plugins)
        for (const p of u.plugins)
          c.use(p);
      c.provide(zt, this._propsRef), c.provide(fr, this._errorsRef), c.provide(Ft, this.emitEvent.bind(this)), c.provide(hr, this._contentRef), c.provide(br, this._hostVisibilityRef), c.provide(vr, ur(this)), c.provide(gr, lr(this)), c.provide(yr, Ut(this)), u.providers && u.providers(c, this), c.mount(t), d && Bt(d);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), s.lazyConfig().then((d) => {
        a.signal.aborted || (u.remove(), i(d));
      }).catch((d) => {
        if (a.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), m = document.createElement("wippy-error");
        m.setAttribute("title", "Failed to load"), m.setAttribute("message", c), u.replaceWith(m), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, _r = Object.defineProperty, st = Object.getOwnPropertySymbols, Sr = Object.prototype.hasOwnProperty, $r = Object.prototype.propertyIsEnumerable, at = (e, t, n) => t in e ? _r(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, wr = (e, t) => {
  for (var n in t || (t = {})) Sr.call(t, n) && at(e, n, t[n]);
  if (st) for (var n of st(t)) $r.call(t, n) && at(e, n, t[n]);
  return e;
};
function Pe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Qe(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function C(e) {
  return !Pe(e);
}
function M(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Kt(e = {}, t = {}) {
  let n = wr({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    M(t[o]) && o in e && M(e[o]) ? n[o] = Kt(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Pr(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Kt(t, n), {});
}
function N(e, ...t) {
  return Qe(e) ? e(...t) : e;
}
function A(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function D(e) {
  return A(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Je(e, t = "", n = {}) {
  let r = D(t).split("."), o = r.shift();
  if (o) {
    if (M(e)) {
      let l = Object.keys(e).find((s) => D(s) === o) || "";
      return Je(N(e[l], n), r.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function Yt(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Or(e) {
  return C(e) && !isNaN(e);
}
function te(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Tr(...e) {
  return Pr(...e);
}
function fe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Cr(e) {
  return A(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Gt(e) {
  return A(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function qt() {
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
function xr(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let l = Array.isArray(r) ? [xr(...r)] : Object.entries(r).map(([s, a]) => a ? s : void 0);
        t = l.length ? t.concat(l.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function kr(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function We(e, t) {
  if (e && t) {
    let n = (r) => {
      kr(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Er() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function _i(e) {
  typeof e == "string" ? We(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, Er() + "px"), We(document.body, e?.className || "p-overflow-hidden"));
}
function he(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Si(e) {
  typeof e == "string" ? he(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), he(document.body, e?.className || "p-overflow-hidden"));
}
function $i() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, l = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: l };
}
function lt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function wi(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function Lr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ar(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Nr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Ar(e));
}
function re(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ne(e, t = {}) {
  if (re(e)) {
    let n = (r, o) => {
      var l, s;
      let a = (l = e?.$attrs) != null && l[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([m, p]) => r === "style" && (p || p === 0) ? `${m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${p}` : p ? m : void 0);
            i = c.length ? i.concat(c.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, a);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let l = r.match(/^on(.+)/);
        l ? e.addEventListener(l[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Ne(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function jr(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Ne(r, t), r.append(...n), r;
  }
}
function Rr(e, t) {
  return re(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Vr(e, t) {
  return re(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Pi(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Ir(e, t) {
  if (re(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Qt(e, t = "") {
  let n = Rr(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Oi(e, t) {
  let n = Qt(e, t);
  return n.length > 0 ? n[0] : null;
}
function ut(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Ti(e, t) {
  let n = Qt(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Dr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || lt(document.documentElement) || lt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Mr(e, t) {
  return e ? e.offsetHeight : 0;
}
function dt(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Jt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ci(e, t = "") {
  return re(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Ur(e, t = "", n) {
  re(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Ce = {};
function Wr(e = "pui_id_") {
  return Object.hasOwn(Ce, e) || (Ce[e] = 0), Ce[e]++, `${e}${Ce[e]}`;
}
function Br() {
  let e = [], t = (s, a, i = 999) => {
    let u = o(s, a, i), d = u.value + (u.key === s ? 0 : i) + 1;
    return e.push({ key: s, value: d }), d;
  }, n = (s) => {
    e = e.filter((a) => a.value !== s);
  }, r = (s, a) => o(s).value, o = (s, a, i = 0) => [...e].reverse().find((u) => !0) || { key: s, value: i }, l = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: l, set: (s, a, i) => {
    a && (a.style.zIndex = String(t(s, !0, i)));
  }, clear: (s) => {
    s && (n(l(s)), s.style.zIndex = "");
  }, getCurrent: (s) => r(s) };
}
var xi = Br(), Hr = Object.defineProperty, Fr = Object.defineProperties, zr = Object.getOwnPropertyDescriptors, je = Object.getOwnPropertySymbols, Zt = Object.prototype.hasOwnProperty, Xt = Object.prototype.propertyIsEnumerable, ct = (e, t, n) => t in e ? Hr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) Zt.call(t, n) && ct(e, n, t[n]);
  if (je) for (var n of je(t)) Xt.call(t, n) && ct(e, n, t[n]);
  return e;
}, De = (e, t) => Fr(e, zr(t)), W = (e, t) => {
  var n = {};
  for (var r in e) Zt.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && je) for (var r of je(e)) t.indexOf(r) < 0 && Xt.call(e, r) && (n[r] = e[r]);
  return n;
}, Kr = qt(), E = Kr, ve = /{([^}]*)}/g, en = /(\d+\s+[\+\-\*\/]\s+\d+)/g, tn = /var\([^)]+\)/g;
function mt(e) {
  return A(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Yr(e) {
  return M(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Gr(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Be(e = "", t = "") {
  return Gr(`${A(e, !1) && A(t, !1) ? `${e}-` : e}${t}`);
}
function nn(e = "", t = "") {
  return `--${Be(e, t)}`;
}
function qr(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function rn(e, t = "", n = "", r = [], o) {
  if (A(e)) {
    let l = e.trim();
    if (qr(l)) return;
    if (te(l, ve)) {
      let s = l.replaceAll(ve, (a) => {
        let i = a.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => te(u, d)));
        return `var(${nn(n, Gt(i.join("-")))}${C(o) ? `, ${o}` : ""})`;
      });
      return te(s.replace(tn, "0"), en) ? `calc(${s})` : s;
    }
    return l;
  } else if (Or(e)) return e;
}
function Qr(e, t, n) {
  A(t, !1) && e.push(`${t}:${n};`);
}
function ue(e, t) {
  return e ? `${e}{${t}}` : "";
}
function on(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, a) {
    let i = [], u = 0, d = "", c = null, m = 0;
    for (; u <= s.length; ) {
      let p = s[u];
      if ((p === '"' || p === "'" || p === "`") && s[u - 1] !== "\\" && (c = c === p ? null : p), !c && (p === "(" && m++, p === ")" && m--, (p === "," || u === s.length) && m === 0)) {
        let h = d.trim();
        h.startsWith("dt(") ? i.push(on(h, a)) : i.push(r(h)), d = "", u++;
        continue;
      }
      p !== void 0 && (d += p), u++;
    }
    return i;
  }
  function r(s) {
    let a = s[0];
    if ((a === '"' || a === "'" || a === "`") && s[s.length - 1] === a) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let o = [], l = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") l.push(s), s += 2;
  else if (e[s] === ")" && l.length > 0) {
    let a = l.pop();
    l.length === 0 && o.push([a, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [a, i] = o[s], u = e.slice(a + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, a) + c + e.slice(i + 1);
  }
  return e;
}
var ki = (e) => {
  var t;
  let n = P.getTheme(), r = He(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], l = He(n, e, void 0, "value");
  return { name: o, variable: r, value: l };
}, ne = (...e) => He(P.getTheme(), ...e), He = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: l } = P.defaults || {}, { prefix: s, transform: a } = e?.options || l || {}, i = te(t, ve) ? t : `{${t}}`;
    return r === "value" || Pe(r) && a === "strict" ? P.getTokenValue(t) : rn(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function xe(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, l) => {
      var s;
      return r + o + ((s = N(t[l], { dt: ne })) != null ? s : "");
    }, "");
    return on(n, ne);
  }
  return N(e, { dt: ne });
}
function Jr(e, t = {}) {
  let n = P.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: l = n.excludedKeyRegex } = t, s = [], a = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let m in d) {
      let p = d[m], h = Yr(p), g = te(m, l) ? Be(c) : Be(c, Gt(m));
      if (M(h)) i.push({ node: h, path: g });
      else {
        let v = nn(g), y = rn(h, g, r, [l]);
        Qr(a, v, y);
        let $ = g;
        r && $.startsWith(r + "-") && ($ = $.slice(r.length + 1)), s.push($.replace(/-/g, "."));
      }
    }
  }
  let u = a.join("");
  return { value: a, tokens: s, declarations: u, css: ue(o, u) };
}
var R = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return Jr(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var l, s, a, i, u, d, c;
  let { preset: m, options: p } = t, h, g, v, y, $, O, f;
  if (C(m) && p.transform !== "strict") {
    let { primitive: _, semantic: k, extend: j } = m, H = k || {}, { colorScheme: F } = H, q = W(H, ["colorScheme"]), z = j || {}, { colorScheme: Q } = z, J = W(z, ["colorScheme"]), K = F || {}, { dark: Z } = K, oe = W(K, ["dark"]), X = Q || {}, { dark: ie } = X, se = W(X, ["dark"]), U = C(_) ? this._toVariables({ primitive: _ }, p) : {}, I = C(q) ? this._toVariables({ semantic: q }, p) : {}, ee = C(oe) ? this._toVariables({ light: oe }, p) : {}, Oe = C(Z) ? this._toVariables({ dark: Z }, p) : {}, ae = C(J) ? this._toVariables({ semantic: J }, p) : {}, et = C(se) ? this._toVariables({ light: se }, p) : {}, tt = C(ie) ? this._toVariables({ dark: ie }, p) : {}, [mn, pn] = [(l = U.declarations) != null ? l : "", U.tokens], [fn, hn] = [(s = I.declarations) != null ? s : "", I.tokens || []], [vn, gn] = [(a = ee.declarations) != null ? a : "", ee.tokens || []], [yn, bn] = [(i = Oe.declarations) != null ? i : "", Oe.tokens || []], [_n, Sn] = [(u = ae.declarations) != null ? u : "", ae.tokens || []], [$n, wn] = [(d = et.declarations) != null ? d : "", et.tokens || []], [Pn, On] = [(c = tt.declarations) != null ? c : "", tt.tokens || []];
    h = this.transformCSS(e, mn, "light", "variable", p, r, o), g = pn;
    let Tn = this.transformCSS(e, `${fn}${vn}`, "light", "variable", p, r, o), Cn = this.transformCSS(e, `${yn}`, "dark", "variable", p, r, o);
    v = `${Tn}${Cn}`, y = [.../* @__PURE__ */ new Set([...hn, ...gn, ...bn])];
    let xn = this.transformCSS(e, `${_n}${$n}color-scheme:light`, "light", "variable", p, r, o), kn = this.transformCSS(e, `${Pn}color-scheme:dark`, "dark", "variable", p, r, o);
    $ = `${xn}${kn}`, O = [.../* @__PURE__ */ new Set([...Sn, ...wn, ...On])], f = N(m.css, { dt: ne });
  }
  return { primitive: { css: h, tokens: g }, semantic: { css: v, tokens: y }, global: { css: $, tokens: O }, style: f };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: l, selector: s }) {
  var a, i, u;
  let d, c, m;
  if (C(t) && n.transform !== "strict") {
    let p = e.replace("-directive", ""), h = t, { colorScheme: g, extend: v, css: y } = h, $ = W(h, ["colorScheme", "extend", "css"]), O = v || {}, { colorScheme: f } = O, _ = W(O, ["colorScheme"]), k = g || {}, { dark: j } = k, H = W(k, ["dark"]), F = f || {}, { dark: q } = F, z = W(F, ["dark"]), Q = C($) ? this._toVariables({ [p]: V(V({}, $), _) }, n) : {}, J = C(H) ? this._toVariables({ [p]: V(V({}, H), z) }, n) : {}, K = C(j) ? this._toVariables({ [p]: V(V({}, j), q) }, n) : {}, [Z, oe] = [(a = Q.declarations) != null ? a : "", Q.tokens || []], [X, ie] = [(i = J.declarations) != null ? i : "", J.tokens || []], [se, U] = [(u = K.declarations) != null ? u : "", K.tokens || []], I = this.transformCSS(p, `${Z}${X}`, "light", "variable", n, o, l, s), ee = this.transformCSS(p, se, "dark", "variable", n, o, l, s);
    d = `${I}${ee}`, c = [.../* @__PURE__ */ new Set([...oe, ...ie, ...U])], m = N(y, { dt: ne });
  }
  return { css: d, tokens: c, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var l;
  let { preset: s, options: a } = t, i = (l = s?.components) == null ? void 0 : l[e];
  return this.getPreset({ name: e, preset: i, options: a, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var l, s;
  let a = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((l = i?.components) == null ? void 0 : l[a]) || ((s = i?.directives) == null ? void 0 : s[a]);
  return this.getPreset({ name: a, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${N(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: l }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: l }), a = Object.entries(r).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [u, d]) => {
    if (M(d) && Object.hasOwn(d, "css")) {
      let c = fe(d.css), m = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${m}" ${a}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: l }) {
  var s;
  let a = { name: e, theme: t, params: n, set: o, defaults: l }, i = (s = e.includes("-directive") ? this.getPresetD(a) : this.getPresetC(a)) == null ? void 0 : s.css, u = Object.entries(r).reduce((d, [c, m]) => d.push(`${c}="${m}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${fe(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let l = function(a, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: a, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && ve.test(this.value)) {
      let c = this.value.trim().replace(ve, (m) => {
        var p;
        let h = m.slice(1, -1), g = this.tokens[h];
        if (!g) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let v = g.computed(a, i, u);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (p = v?.value) != null ? p : "__UNRESOLVED__";
      });
      d = en.test(c.replace(tn, "0")) ? `calc(${c})` : c;
    }
    return Pe(i.binding) && delete i.binding, u.pop(), { colorScheme: a, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (a, i, u) => {
    Object.entries(a).forEach(([d, c]) => {
      let m = te(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${mt(d)}` : mt(d), p = u ? `${u}.${d}` : d;
      M(c) ? s(c, m, p) : (o[m] || (o[m] = { paths: [], computed: (h, g = {}, v = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, g.binding, v);
        if (h && h !== "none") for (let y = 0; y < o[m].paths.length; y++) {
          let $ = o[m].paths[y];
          if ($.scheme === h) return $.computed(h, g.binding, v);
        }
        return o[m].paths.map((y) => y.computed(y.scheme, g[y.scheme], v));
      } }), o[m].paths.push({ path: p, value: c, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: l, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((a) => a.split(".").filter((i) => !te(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), l = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(l)].flat().filter((a) => a);
  return s.length === 1 ? s[0].value : s.reduce((a = {}, i) => {
    let u = i, { colorScheme: d } = u, c = W(u, ["colorScheme"]);
    return a[d] = c, a;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? ue(C(t) ? `${e}${t},${e} ${t}` : e, r) : ue(e, ue(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, l, s, a) {
  if (C(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (C(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, a, c, t)), d), "") : ue(a ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      M(i) && (u.name = N(i.name, { name: e, type: r })), C(u.name) && (t = ue(`@layer ${u.name}`, t), l?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, P = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = De(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), E.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = De(V({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), E.emit("preset:change", e), E.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = De(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), E.emit("options:change", e), E.emit("theme:change", this.theme);
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
  return R.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return R.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return R.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return R.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return R.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return R.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), E.emit(`theme:${t}:load`, e), !this._loadingStyles.size && E.emit("theme:load"));
} }, L = {
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
}, Zr = `
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
function ge(e) {
  "@babel/helpers - typeof";
  return ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ge(e);
}
function pt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ft(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pt(Object(n), !0).forEach(function(r) {
      Xr(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Xr(e, t, n) {
  return (t = eo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function eo(e) {
  var t = to(e, "string");
  return ge(t) == "symbol" ? t : t + "";
}
function to(e, t) {
  if (ge(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function no(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  nt() && nt().components ? Rn(e) : t ? e() : Vn(e);
}
var ro = 0;
function oo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = B(!1), r = B(e), o = B(null), l = Jt() ? window.document : void 0, s = t.document, a = s === void 0 ? l : s, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, m = t.name, p = m === void 0 ? "style_".concat(++ro) : m, h = t.id, g = h === void 0 ? void 0 : h, v = t.media, y = v === void 0 ? void 0 : v, $ = t.nonce, O = $ === void 0 ? void 0 : $, f = t.first, _ = f === void 0 ? !1 : f, k = t.onMounted, j = k === void 0 ? void 0 : k, H = t.onUpdated, F = H === void 0 ? void 0 : H, q = t.onLoad, z = q === void 0 ? void 0 : q, Q = t.props, J = Q === void 0 ? {} : Q, K = function() {
  }, Z = function(ie) {
    var se = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (a) {
      var U = ft(ft({}, J), se), I = U.name || p, ee = U.id || g, Oe = U.nonce || O;
      o.value = a.querySelector('style[data-primevue-style-id="'.concat(I, '"]')) || a.getElementById(ee) || a.createElement("style"), o.value.isConnected || (r.value = ie || e, Ne(o.value, {
        type: "text/css",
        id: ee,
        media: y,
        nonce: Oe
      }), _ ? a.head.prepend(o.value) : a.head.appendChild(o.value), Ur(o.value, "data-primevue-style-id", I), Ne(o.value, U), o.value.onload = function(ae) {
        return z?.(ae, {
          name: I
        });
      }, j?.(I)), !n.value && (K = me(r, function(ae) {
        o.value.textContent = ae, F?.(I);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, oe = function() {
    !a || !n.value || (K(), Nr(o.value) && a.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && no(Z), {
    id: g,
    name: p,
    el: o,
    css: r,
    unload: oe,
    load: Z,
    isLoaded: jn(n)
  };
}
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ye(e);
}
var ht, vt, gt, yt;
function bt(e, t) {
  return lo(e) || ao(e, t) || so(e, t) || io();
}
function io() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function so(e, t) {
  if (e) {
    if (typeof e == "string") return _t(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(e, t) : void 0;
  }
}
function _t(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ao(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, l, s, a = [], i = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t !== 0) for (; !(i = (r = l.call(n)).done) && (a.push(r.value), a.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function lo(e) {
  if (Array.isArray(e)) return e;
}
function St(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Me(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? St(Object(n), !0).forEach(function(r) {
      uo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : St(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function uo(e, t, n) {
  return (t = co(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function co(e) {
  var t = mo(e, "string");
  return ye(t) == "symbol" ? t : t + "";
}
function mo(e, t) {
  if (ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ke(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var po = function(t) {
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
}, fo = {}, ho = {}, T = {
  name: "base",
  css: po,
  style: Zr,
  classes: fo,
  inlineStyles: ho,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(l) {
      return l;
    }, o = r(xe(ht || (ht = ke(["", ""])), t));
    return C(o) ? oo(fe(o), Me({
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
      return P.transformCSS(n.name || t.name, "".concat(o).concat(xe(vt || (vt = ke(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return P.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return P.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return P.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return P.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return P.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: ne
      }) || "", o = fe(xe(gt || (gt = ke(["", "", ""])), r, t)), l = Object.entries(n).reduce(function(s, a) {
        var i = bt(a, 2), u = i[0], d = i[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return C(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(l, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return P.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [P.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), l = xe(yt || (yt = ke(["", ""])), N(this.style, {
        dt: ne
      })), s = fe(P.transformCSS(o, l)), a = Object.entries(n).reduce(function(i, u) {
        var d = bt(u, 2), c = d[0], m = d[1];
        return i.push("".concat(c, '="').concat(m, '"')) && i;
      }, []).join(" ");
      C(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(a, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Me(Me({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, G = qt();
function be(e) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, be(e);
}
function $t(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ee(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $t(Object(n), !0).forEach(function(r) {
      vo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $t(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function vo(e, t, n) {
  return (t = go(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function go(e) {
  var t = yo(e, "string");
  return be(t) == "symbol" ? t : t + "";
}
function yo(e, t) {
  if (be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var bo = {
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
    text: [L.STARTS_WITH, L.CONTAINS, L.NOT_CONTAINS, L.ENDS_WITH, L.EQUALS, L.NOT_EQUALS],
    numeric: [L.EQUALS, L.NOT_EQUALS, L.LESS_THAN, L.LESS_THAN_OR_EQUAL_TO, L.GREATER_THAN, L.GREATER_THAN_OR_EQUAL_TO],
    date: [L.DATE_IS, L.DATE_IS_NOT, L.DATE_BEFORE, L.DATE_AFTER]
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
}, _o = Symbol();
function So(e, t) {
  var n = {
    config: In(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(_o, n), $o(), wo(e, n), n;
}
var de = [];
function $o() {
  E.clear(), de.forEach(function(e) {
    return e?.();
  }), de = [];
}
function wo(e, t) {
  var n = B(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !P.isStyleNameLoaded("common")) {
      var d, c, m = ((d = T.getCommonTheme) === null || d === void 0 ? void 0 : d.call(T)) || {}, p = m.primitive, h = m.semantic, g = m.global, v = m.style, y = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      T.load(p?.css, Ee({
        name: "primitive-variables"
      }, y)), T.load(h?.css, Ee({
        name: "semantic-variables"
      }, y)), T.load(g?.css, Ee({
        name: "global-variables"
      }, y)), T.loadStyle(Ee({
        name: "global-style"
      }, y), v), P.setLoadedStyleName("common");
    }
  };
  E.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = me(t.config, function(i, u) {
    G.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = me(function() {
    return t.config.ripple;
  }, function(i, u) {
    G.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = me(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || P.setTheme(i), t.config.unstyled || r(), n.value = !1, G.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), a = me(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), G.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  de.push(o), de.push(l), de.push(s), de.push(a);
}
var Po = {
  install: function(t, n) {
    var r = Tr(bo, n);
    So(t, r);
  }
}, sn = {
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
    this.mounted = Jt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Oo(e, t, n, r, o, l) {
  return l.inline ? Ae(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (Dn(), Mn(It, {
    key: 1,
    to: n.appendTo
  }, [Ae(e.$slots, "default")], 8, ["to"])) : Dt("", !0);
}
sn.render = Oo;
var Y = {
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
function To() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Un();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var wt = T.extend({
  name: "common"
});
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
}
function Co(e) {
  return un(e) || xo(e) || ln(e) || an();
}
function xo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ce(e, t) {
  return un(e) || ko(e, t) || ln(e, t) || an();
}
function an() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ln(e, t) {
  if (e) {
    if (typeof e == "string") return Fe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fe(e, t) : void 0;
  }
}
function Fe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ko(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, l, s, a = [], i = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = l.call(n)).done) && (a.push(r.value), a.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function un(e) {
  if (Array.isArray(e)) return e;
}
function Pt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function S(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pt(Object(n), !0).forEach(function(r) {
      pe(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function pe(e, t, n) {
  return (t = Eo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Eo(e) {
  var t = Lo(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function Lo(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ao = {
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
        E.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        E.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, r, o, l, s, a, i, u, d, c, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, h = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = h || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (l = o.onBeforeCreate) === null || l === void 0 || l.call(o);
    var g = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, v = g ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.originalValue : void 0, y = g ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || v) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = To(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Vr(re(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = S({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), r?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Qe(t) ? t.apply(void 0, r) : Le.apply(void 0, r);
    },
    _load: function() {
      Y.isStyleNameLoaded("base") || (T.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Y.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Y.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (wt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Y.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      C(t) && T.load(t, S({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!P.isStyleNameLoaded("common")) {
          var r, o, l = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = l.primitive, a = l.semantic, i = l.global, u = l.style;
          T.load(s?.css, S({
            name: "primitive-variables"
          }, this.$styleOptions)), T.load(a?.css, S({
            name: "semantic-variables"
          }, this.$styleOptions)), T.load(i?.css, S({
            name: "global-variables"
          }, this.$styleOptions)), T.loadStyle(S({
            name: "global-style"
          }, this.$styleOptions), u), P.setLoadedStyleName("common");
        }
        if (!P.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, p, h = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, g = h.css, v = h.style;
          (m = this.$style) === null || m === void 0 || m.load(g, S({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(S({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), P.setLoadedStyleName(this.$style.name);
        }
        if (!P.isStyleNameLoaded("layer-order")) {
          var y, $, O = (y = this.$style) === null || y === void 0 || ($ = y.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(y);
          T.load(O, S({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), P.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, l = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = l.css, a = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, S({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = a.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Y.clearLoadedStyleNames(), E.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      E.off("theme:change", this._loadCoreStyles), E.off("theme:change", this._load), E.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Je(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], a = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = a.mergeSections, u = i === void 0 ? !0 : i, d = a.mergeProps, c = d === void 0 ? !1 : d, m = l ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, S(S({}, o), {}, {
        global: m || {}
      })), h = this._getPTDatasets(r);
      return u || !u && p ? c ? this._mergeProps(c, m, p, h) : S(S(S({}, m), p), h) : S(S({}, p), h);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Le(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", l = r === "root" && C((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && S(S({}, r === "root" && S(S(pe({}, "".concat(o, "name"), D(l ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), l && pe({}, "".concat(o, "extend"), D(this.$.type.name))), {}, pe({}, "".concat(this.$attrSelector), ""))), {}, pe({}, "".concat(o, "section"), D(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return A(t) || Yt(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, l = function(a) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(a) : a, c = D(r), m = D(n.$name);
        return (i = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: l(t.originalValue),
        value: l(t.value)
      } : l(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var l = function(g) {
        return n(g, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, a = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = a.mergeSections, u = i === void 0 ? !0 : i, d = a.mergeProps, c = d === void 0 ? !1 : d, m = l(t.originalValue), p = l(t.value);
        return m === void 0 && p === void 0 ? void 0 : A(p) ? p : A(m) ? m : u || !u && p ? c ? this._mergeProps(c, m, p) : S(S({}, m), p) : p;
      }
      return l(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, S(S({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Le(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, S({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, S(S({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, S(S({}, this.$params), r)), l = this._getOptionValue(wt.inlineStyles, t, S(S({}, this.$params), r));
        return [l, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return N(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, S({}, n.$params)) || N(r, S({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = ce(r, 1), l = o[0];
        return n?.includes(l);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return S(S({
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
        var n = ce(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = ce(n, 2), o = r[0], l = r[1], s = o.split(":"), a = Co(s), i = Fe(a).slice(1);
        return i?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? l : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ce(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = ce(n, 2), o = r[0], l = r[1];
        return t[o] = l, t;
      }, {});
    }
  }
}, No = `
    .p-contextmenu {
        background: dt('contextmenu.background');
        color: dt('contextmenu.color');
        border: 1px solid dt('contextmenu.border.color');
        border-radius: dt('contextmenu.border.radius');
        box-shadow: dt('contextmenu.shadow');
        min-width: 12.5rem;
    }

    .p-contextmenu-root-list,
    .p-contextmenu-submenu {
        margin: 0;
        padding: dt('contextmenu.list.padding');
        list-style: none;
        outline: 0 none;
        display: flex;
        flex-direction: column;
        gap: dt('contextmenu.list.gap');
    }

    .p-contextmenu-submenu {
        position: absolute;
        display: flex;
        flex-direction: column;
        min-width: 100%;
        z-index: 1;
        background: dt('contextmenu.background');
        color: dt('contextmenu.color');
        border: 1px solid dt('contextmenu.border.color');
        border-radius: dt('contextmenu.border.radius');
        box-shadow: dt('contextmenu.shadow');
    }

    .p-contextmenu-item {
        position: relative;
    }

    .p-contextmenu-item-content {
        transition:
            background dt('contextmenu.transition.duration'),
            color dt('contextmenu.transition.duration');
        border-radius: dt('contextmenu.item.border.radius');
        color: dt('contextmenu.item.color');
    }

    .p-contextmenu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('contextmenu.item.padding');
        gap: dt('contextmenu.item.gap');
        user-select: none;
    }

    .p-contextmenu-item-label {
        line-height: 1;
    }

    .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.color');
    }

    .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.color');
        margin-left: auto;
        font-size: dt('contextmenu.submenu.icon.size');
        width: dt('contextmenu.submenu.icon.size');
        height: dt('contextmenu.submenu.icon.size');
    }

    .p-contextmenu-submenu-icon:dir(rtl) {
        margin-left: 0;
        margin-right: auto;
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {
        color: dt('contextmenu.item.focus.color');
        background: dt('contextmenu.item.focus.background');
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.focus.color');
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.focus.color');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {
        color: dt('contextmenu.item.focus.color');
        background: dt('contextmenu.item.focus.background');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.focus.color');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.focus.color');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content {
        color: dt('contextmenu.item.active.color');
        background: dt('contextmenu.item.active.background');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.active.color');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.active.color');
    }

    .p-contextmenu-separator {
        border-block-start: 1px solid dt('contextmenu.separator.border.color');
    }

    .p-contextmenu-mobile .p-contextmenu-submenu {
        position: static;
        box-shadow: none;
        border: 0 none;
        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');
        padding-inline-end: 0;
    }

    .p-contextmenu-mobile .p-contextmenu-submenu-icon {
        transition: transform 0.2s;
        transform: rotate(90deg);
    }

    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        transform: rotate(-90deg);
    }
`, jo = {
  root: function(t) {
    var n = t.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": n.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(t) {
    var n = t.instance, r = t.processedItem;
    return ["p-contextmenu-item", {
      "p-contextmenu-item-active": n.isItemActive(r),
      "p-focus": n.isItemFocused(r),
      "p-disabled": n.isItemDisabled(r)
    }];
  },
  itemContent: "p-contextmenu-item-content",
  itemLink: "p-contextmenu-item-link",
  itemIcon: "p-contextmenu-item-icon",
  itemLabel: "p-contextmenu-item-label",
  submenuIcon: "p-contextmenu-submenu-icon",
  submenu: "p-contextmenu-submenu",
  separator: "p-contextmenu-separator"
};
T.extend({
  name: "contextmenu",
  style: No,
  classes: jo
});
var Ro = `
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
`, Vo = T.extend({
  name: "baseicon",
  css: Ro
});
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function Ot(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Tt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ot(Object(n), !0).forEach(function(r) {
      Io(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Io(e, t, n) {
  return (t = Do(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Do(e) {
  var t = Mo(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function Mo(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ei = {
  name: "BaseIcon",
  extends: Ao,
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
  style: Vo,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Pe(this.label);
      return Tt(Tt({}, !this.isUnstyled && {
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
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function Ct(e, t) {
  return Ho(e) || Bo(e, t) || Wo(e, t) || Uo();
}
function Uo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wo(e, t) {
  if (e) {
    if (typeof e == "string") return xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(e, t) : void 0;
  }
}
function xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Bo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, l, s, a = [], i = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t !== 0) for (; !(i = (r = l.call(n)).done) && (a.push(r.value), a.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function Ho(e) {
  if (Array.isArray(e)) return e;
}
function kt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kt(Object(n), !0).forEach(function(r) {
      ze(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ze(e, t, n) {
  return (t = Fo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fo(e) {
  var t = zo(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function zo(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var b = {
  _getMeta: function() {
    return [M(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(M(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, l;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (l = n.ctx) === null || l === void 0 || (l = l.appContext) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.globalProperties) === null || l === void 0 ? void 0 : l.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Je,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, a = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var $ = b._getOptionValue.apply(b, arguments);
      return A($) || Yt($) ? {
        class: $
      } : $;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, p = m === void 0 ? !1 : m, h = a ? b._useDefaultPT(r, r.defaultPT(), i, l, s) : void 0, g = b._usePT(r, b._getPT(o, r.$name), i, l, w(w({}, s), {}, {
      global: h || {}
    })), v = b._getPTDatasets(r, l);
    return c || !c && g ? p ? b._mergeProps(r, p, h, g, v) : w(w(w({}, h), g), v) : w(w({}, g), v);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return w(w({}, n === "root" && ze({}, "".concat(r, "name"), D(t.$name))), {}, ze({}, "".concat(r, "section"), D(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var a, i = r ? r(s) : s, u = D(n);
      return (a = i?.[u]) !== null && a !== void 0 ? a : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, l = arguments.length > 4 ? arguments[4] : void 0, s = function(v) {
      return r(v, o, l);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var a, i = n._usept || ((a = t.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, m = c === void 0 ? !1 : c, p = s(n.originalValue), h = s(n.value);
      return p === void 0 && h === void 0 ? void 0 : A(h) ? h : A(p) ? p : d || !d && h ? m ? b._mergeProps(t, m, p, h) : w(w({}, p), h) : h;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, l = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(t, n, r, o, l);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, l = b._getConfig(r, o), s = {
      nonce: l == null || (t = l.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    b._loadCoreStyles(n, s), b._loadThemeStyles(n, s), b._loadScopedThemeStyles(n, s), b._removeThemeListeners(n), n.$loadStyles = function() {
      return b._loadThemeStyles(n, s);
    }, b._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Y.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var l;
      T.loadCSS(o), (l = r.$style) === null || l === void 0 || l.loadCSS(o), Y.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!P.isStyleNameLoaded("common")) {
        var s, a, i = ((s = o.$style) === null || s === void 0 || (a = s.getCommonTheme) === null || a === void 0 ? void 0 : a.call(s)) || {}, u = i.primitive, d = i.semantic, c = i.global, m = i.style;
        T.load(u?.css, w({
          name: "primitive-variables"
        }, l)), T.load(d?.css, w({
          name: "semantic-variables"
        }, l)), T.load(c?.css, w({
          name: "global-variables"
        }, l)), T.loadStyle(w({
          name: "global-style"
        }, l), m), P.setLoadedStyleName("common");
      }
      if (!P.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, h, g, v, y = ((p = o.$style) === null || p === void 0 || (h = p.getDirectiveTheme) === null || h === void 0 ? void 0 : h.call(p)) || {}, $ = y.css, O = y.style;
        (g = o.$style) === null || g === void 0 || g.load($, w({
          name: "".concat(o.$style.name, "-variables")
        }, l)), (v = o.$style) === null || v === void 0 || v.loadStyle(w({
          name: "".concat(o.$style.name, "-style")
        }, l), O), P.setLoadedStyleName(o.$style.name);
      }
      if (!P.isStyleNameLoaded("layer-order")) {
        var f, _, k = (f = o.$style) === null || f === void 0 || (_ = f.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(f);
        T.load(k, w({
          name: "layer-order",
          first: !0
        }, l)), P.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, l, s, a = ((o = t.$style) === null || o === void 0 || (l = o.getPresetTheme) === null || l === void 0 ? void 0 : l.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = a.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, w({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Y.clearLoadedStyleNames(), E.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    E.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, l, s) {
    var a, i, u = "on".concat(Cr(n)), d = b._getConfig(o, l), c = r?.$instance, m = b._usePT(c, b._getPT(o == null || (a = o.value) === null || a === void 0 ? void 0 : a.pt, t), b._getOptionValue, "hooks.".concat(u)), p = b._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], b._getOptionValue, "hooks.".concat(u)), h = {
      el: r,
      binding: o,
      vnode: l,
      prevVnode: s
    };
    m?.(c, h), p?.(c, h);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Qe(t) ? t.apply(void 0, r) : Le.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(a, i, u, d, c) {
      var m, p, h, g;
      i._$instances = i._$instances || {};
      var v = b._getConfig(u, d), y = i._$instances[t] || {}, $ = Pe(y) ? w(w({}, n), n?.methods) : {};
      i._$instances[t] = w(w({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
        $style: w({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: v,
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(v?.pt, void 0, function(f) {
            var _;
            return f == null || (_ = f.directives) === null || _ === void 0 ? void 0 : _[t];
          });
        },
        isUnstyled: function() {
          var f, _;
          return ((f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.unstyled) !== void 0 ? (_ = i._$instances[t]) === null || _ === void 0 || (_ = _.$binding) === null || _ === void 0 || (_ = _.value) === null || _ === void 0 ? void 0 : _.unstyled : v?.unstyled;
        },
        theme: function() {
          var f;
          return (f = i._$instances[t]) === null || f === void 0 || (f = f.$primevueConfig) === null || f === void 0 ? void 0 : f.theme;
        },
        preset: function() {
          var f;
          return (f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.dt;
        },
        /* instance's methods */
        ptm: function() {
          var f, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(i._$instances[t], (f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.pt, _, w({}, k));
        },
        ptmo: function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(i._$instances[t], f, _, k, !1);
        },
        cx: function() {
          var f, _, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (f = i._$instances[t]) !== null && f !== void 0 && f.isUnstyled() ? void 0 : b._getOptionValue((_ = i._$instances[t]) === null || _ === void 0 || (_ = _.$style) === null || _ === void 0 ? void 0 : _.classes, k, w({}, j));
        },
        sx: function() {
          var f, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, j = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? b._getOptionValue((f = i._$instances[t]) === null || f === void 0 || (f = f.$style) === null || f === void 0 ? void 0 : f.inlineStyles, _, w({}, j)) : void 0;
        }
      }, $), i.$instance = i._$instances[t], (p = (h = i.$instance)[a]) === null || p === void 0 || p.call(h, i, u, d, c), i["$".concat(t)] = i.$instance, b._hook(t, a, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = w(w({}, (g = i.$pd) === null || g === void 0 ? void 0 : g[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(a) {
      var i, u, d, c = a._$instances[t], m = c?.watch, p = function(v) {
        var y, $ = v.newValue, O = v.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(c, $, O);
      }, h = function(v) {
        var y, $ = v.newValue, O = v.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, $, O);
      };
      c.$watchersCallback = {
        config: p,
        "config.ripple": h
      }, m == null || (i = m.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), G.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), G.on("config:ripple:change", h);
    }, l = function(a) {
      var i = a._$instances[t].$watchersCallback;
      i && (G.off("config:change", i.config), G.off("config:ripple:change", i["config.ripple"]), a._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(a, i, u, d) {
        a.$pd || (a.$pd = {}), a.$pd[t] = {
          name: t,
          attrSelector: Wr("pd")
        }, r("created", a, i, u, d);
      },
      beforeMount: function(a, i, u, d) {
        var c;
        b._loadStyles((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", a, i, u, d), o(a);
      },
      mounted: function(a, i, u, d) {
        var c;
        b._loadStyles((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", a, i, u, d);
      },
      beforeUpdate: function(a, i, u, d) {
        r("beforeUpdate", a, i, u, d);
      },
      updated: function(a, i, u, d) {
        var c;
        b._loadStyles((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", a, i, u, d);
      },
      beforeUnmount: function(a, i, u, d) {
        var c;
        l(a), b._removeThemeListeners((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", a, i, u, d);
      },
      unmounted: function(a, i, u, d) {
        var c;
        (c = a.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", a, i, u, d);
      }
    };
  },
  extend: function() {
    var t = b._getMeta.apply(b, arguments), n = Ct(t, 2), r = n[0], o = n[1];
    return w({
      extend: function() {
        var s = b._getMeta.apply(b, arguments), a = Ct(s, 2), i = a[0], u = a[1];
        return b.extend(i, w(w(w({}, o), o?.methods), u));
      }
    }, b._extend(r, o));
  }
}, Ko = `
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
`, Yo = {
  root: "p-ink"
}, Go = T.extend({
  name: "ripple-directive",
  style: Ko,
  classes: Yo
}), qo = b.extend({
  style: Go
});
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
function Qo(e) {
  return ei(e) || Xo(e) || Zo(e) || Jo();
}
function Jo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zo(e, t) {
  if (e) {
    if (typeof e == "string") return Ke(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ke(e, t) : void 0;
  }
}
function Xo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ei(e) {
  if (Array.isArray(e)) return Ke(e);
}
function Ke(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Et(e, t, n) {
  return (t = ti(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ti(e) {
  var t = ni(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function ni(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (we(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Li = qo.extend("ripple", {
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
      n || (n = jr("span", Et(Et({
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
      var n = this, r = t.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && he(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !ut(o) && !dt(o)) {
          var l = Math.max(Lr(r), Mr(r));
          o.style.height = l + "px", o.style.width = l + "px";
        }
        var s = Dr(r), a = t.pageX - s.left + document.body.scrollTop - dt(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - ut(o) / 2;
        o.style.top = i + "px", o.style.left = a + "px", !this.isUnstyled() && We(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && he(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && he(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Qo(t.children).find(function(n) {
        return Ir(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), ri = `
    .p-menu {
        background: dt('menu.background');
        color: dt('menu.color');
        border: 1px solid dt('menu.border.color');
        border-radius: dt('menu.border.radius');
        min-width: 12.5rem;
    }

    .p-menu-list {
        margin: 0;
        padding: dt('menu.list.padding');
        outline: 0 none;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('menu.list.gap');
    }

    .p-menu-item-content {
        transition:
            background dt('menu.transition.duration'),
            color dt('menu.transition.duration');
        border-radius: dt('menu.item.border.radius');
        color: dt('menu.item.color');
        overflow: hidden;
    }

    .p-menu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('menu.item.padding');
        gap: dt('menu.item.gap');
        user-select: none;
        outline: 0 none;
    }

    .p-menu-item-label {
        line-height: 1;
    }

    .p-menu-item-icon {
        color: dt('menu.item.icon.color');
    }

    .p-menu-item.p-focus .p-menu-item-content {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item.p-focus .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-overlay {
        box-shadow: dt('menu.shadow');
    }

    .p-menu-submenu-label {
        background: dt('menu.submenu.label.background');
        padding: dt('menu.submenu.label.padding');
        color: dt('menu.submenu.label.color');
        font-weight: dt('menu.submenu.label.font.weight');
    }

    .p-menu-separator {
        border-block-start: 1px solid dt('menu.separator.border.color');
    }
`, oi = {
  root: function(t) {
    var n = t.props;
    return ["p-menu p-component", {
      "p-menu-overlay": n.popup
    }];
  },
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: function(t) {
    var n = t.instance;
    return ["p-menu-item", {
      "p-focus": n.id === n.focusedOptionId,
      "p-disabled": n.disabled()
    }];
  },
  itemContent: "p-menu-item-content",
  itemLink: "p-menu-item-link",
  itemIcon: "p-menu-item-icon",
  itemLabel: "p-menu-item-label"
};
T.extend({
  name: "menu",
  style: ri,
  classes: oi
});
const ii = "data-wippy-overlay-layer";
function dn() {
  return typeof window < "u" && typeof window.document < "u";
}
function cn() {
  return dn() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function si() {
  return cn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ai = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let li = 0;
const Re = /* @__PURE__ */ new WeakMap();
function Lt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ui(e, t) {
  if (!ai.test(e.className))
    return;
  const n = e.style.cssText;
  Lt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Re.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Lt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Re.set(e, r);
  }
}
function Ze(e) {
  const t = Re.get(e);
  t && (t.disconnect(), Re.delete(e));
}
function di(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ye(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ve = /* @__PURE__ */ new Set(), Xe = /* @__PURE__ */ new WeakMap();
let At = !1, Ge = !1;
function ci() {
  Ge = !1;
  for (const e of Ve) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && Ze(t);
      Ve.delete(e), Xe.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ye(e);
  }
}
function Nt() {
  Ge || (Ge = !0, requestAnimationFrame(ci));
}
function mi(e) {
  const t = document.createElement("div");
  t.setAttribute(ii, "");
  const n = cn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ye(t);
  const r = new MutationObserver((o) => {
    const l = t.__wippyAnchorName;
    for (const s of o) {
      if (l)
        for (const a of Array.from(s.addedNodes))
          a instanceof HTMLElement && ui(a, l);
      for (const a of Array.from(s.removedNodes))
        a instanceof HTMLElement && Ze(a);
    }
    t.isConnected && t.childElementCount > 0 && Ye(t);
  });
  return r.observe(t, { childList: !0 }), Xe.set(t, r), Ve.add(t), At || (At = !0, window.addEventListener("scroll", Nt, { capture: !0, passive: !0 }), window.addEventListener("resize", Nt, { passive: !0 })), t;
}
function jt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = mi(e.hostRoot), si())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++li}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Rt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && Ze(t);
    Ve.delete(e.layer), Xe.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Vt = !1;
function pi() {
  if (Vt)
    return;
  Vt = !0;
  const e = sn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    dn() && (this.hostRoot = di(this.$el), this.mounted = !0, this.hostRoot && (this.inline || jt(this), this.$watch("inline", (t) => {
      t ? Rt(this) : jt(this);
    })));
  }, e.render = function() {
    return this.inline ? Ae(this.$slots, "default", { key: 0 }) : this.mounted ? Wn(It, { key: 1, to: this.resolvedTarget || document.body }, [
      Ae(this.$slots, "default")
    ]) : Dt("", !0);
  }, e.unmounted = function() {
    Rt(this);
  };
}
const Ai = {
  install: (e) => {
    pi(), e.use(Po, { theme: "none" });
  }
};
export {
  T as B,
  Mr as C,
  Ci as I,
  Ti as L,
  Ai as P,
  Li as R,
  wi as S,
  jr as U,
  bi as W,
  Ur as _,
  gi as a,
  C as b,
  Ao as c,
  Pi as d,
  b as e,
  xr as f,
  Si as g,
  _i as h,
  sn as i,
  Lr as j,
  $i as k,
  Pe as l,
  We as m,
  ki as r,
  Ei as s,
  yi as u,
  Oi as v,
  xi as x
};
//# sourceMappingURL=wc-runtime-DKFqZRRO.js.map
