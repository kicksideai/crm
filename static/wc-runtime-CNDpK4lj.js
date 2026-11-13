import { ref as f, createApp as A, inject as S } from "vue";
import { addCollection as I } from "@iconify/vue";
import { config as g, addIcons as O, on as L, applyThemeMode as b, host as T, hostCss as N, loadCss as $ } from "@wippy-fe/proxy";
import { getActivePinia as H, createPinia as U, setActivePinia as x } from "pinia";
var y = "data-wippy-visible";
function C(t) {
  const e = t.getAttribute(y);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var D = Object.defineProperty, W = (t, e, s) => e in t ? D(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, l = (t, e, s) => W(t, typeof e != "symbol" ? e + "" : e, s), j = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], B = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function E(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function z(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, r] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && r && typeof r == "object") {
          for (const [h, c] of Object.entries(r)) {
            const a = typeof c == "string" ? E(h) : null;
            a && e.add(a);
          }
          continue;
        }
        const n = typeof r == "string" ? E(i) : null;
        n && e.add(n);
      }
  return [...e].sort();
}
function F(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${B} {
${e}
}`;
}
function K(t, e) {
  const s = F(e);
  s && w(t, s, "@wippy-fe/css-variables-bridge");
}
function M(t, e) {
  const i = (e ?? j).map(async (r) => {
    const n = N[r];
    if (!n)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await $(n);
    } catch (h) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${n}):`, h), null;
    }
  });
  return Promise.all(i).then((r) => {
    for (const n of r) {
      if (!n)
        continue;
      const h = document.createElement("style");
      h.textContent = n, h.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(h);
    }
  });
}
function Y(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function w(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, r];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function J(t, e) {
  w(t, e, "@wippy-fe/custom-css");
}
function V(t) {
  return t.__wippyHost ?? null;
}
function q(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function G(t, e, s) {
  switch (s.type) {
    case "string":
      return { value: e };
    case "number": {
      const i = Number.parseFloat(e);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(e, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(e);
        return s.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function v(t, e) {
  const s = {}, i = [];
  for (const [r, n] of Object.entries(e.properties)) {
    const h = t.getAttribute(r), c = q(r);
    if (h === null) {
      n.default !== void 0 && (s[c] = n.default);
      continue;
    }
    const a = G(r, h, n);
    a.error ? i.push(a.error) : s[c] = a.value;
  }
  return { props: s, errors: i };
}
var k = class {
  constructor(t, e) {
    l(this, "_props"), l(this, "_errors"), l(this, "_content"), l(this, "_hostVisibility"), l(this, "_propsListeners", /* @__PURE__ */ new Set()), l(this, "_contentListeners", /* @__PURE__ */ new Set()), l(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), l(this, "_disposed", !1), l(this, "_emitToDom"), l(this, "props"), l(this, "events"), l(this, "content"), l(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, r) {
        return s._subscribeProps(i, r);
      }
    }, this.events = {
      emit(i, r) {
        s._disposed || s._emitToDom(i, r);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, r) {
        return s._subscribeContent(i, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, r) {
        return s._subscribeHostVisibility(i, r);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const s of this._propsListeners)
        s(t, e);
    }
  }
  /** @internal */
  notifyContent(t) {
    if (!this._disposed) {
      this._content = t;
      for (const e of this._contentListeners)
        e(t);
    }
  }
  /** @internal */
  notifyHostVisibility(t, e) {
    if (!(this._disposed || t === e)) {
      this._hostVisibility = t;
      for (const s of this._hostVisibilityListeners)
        s(t, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(t), e?.immediate && t(this._props, this._errors);
    const s = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const s = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const s = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
}, Q = class extends HTMLElement {
  constructor() {
    super(), l(this, "_internals"), l(this, "_contentObserver", null), l(this, "_initialized", !1), l(this, "_container", null), l(this, "_reactive", null), l(this, "_lastProps", null), l(this, "_lastErrors", []), l(this, "_lastContent", null), l(this, "_themeUnsub", null), l(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = C(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), s = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...s, y])];
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
    return V(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(t, e) {
    this.dispatchEvent(new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      detail: e
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
      const t = this.constructor.wippyConfig, e = !!t.contentTemplate;
      let s, i;
      if (this._lastProps !== null)
        s = this._lastProps, i = this._lastErrors;
      else {
        const n = v(this, t.propsSchema);
        t.validateProps && n.errors.push(...t.validateProps(n.props)), s = n.props, i = n.errors, this._lastProps = s, this._lastErrors = i;
      }
      const r = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = r), this._reactive = new k(
        { props: s, errors: i, content: r, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, s = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(s), t.inlineCss && Y(s, t.inlineCss);
        try {
          const o = g?.theming, u = z(
            o?.global?.cssVariables,
            o?.children?.cssVariables
          );
          K(s, u);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const o = g?.theming, u = [o?.global?.customCSS, o?.children?.customCSS].filter(Boolean).join(`
`);
            u && J(s, u);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && M(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const a = t.containerClasses ?? [];
        a.length > 0 && i.classList.add(...a), s.appendChild(i), this._container = i, O(I);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = L("@theme", (a) => this._applyTheme(a)));
      const { props: r, errors: n } = v(this, t.propsSchema);
      t.validateProps && n.push(...t.validateProps(r));
      const h = r;
      this._lastProps = h, this._lastErrors = n;
      let c = null;
      t.contentTemplate && (c = this._extractContent(t.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(t.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, h, n, c, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (t) {
      this.onError(t), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: t instanceof Error ? t.message : String(t),
        error: t
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
  _applyTheme(t = T.getThemeMode?.()) {
    b(t, this), this._container && b(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), b("auto", this), this._container && b("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === y) {
      const c = this._hostVisible, a = C(this);
      if (a === c)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, c), this.onHostVisibilityChanged(a, c));
      return;
    }
    const i = this.constructor.wippyConfig, { props: r, errors: n } = v(this, i.propsSchema);
    i.validateProps && n.push(...i.validateProps(r));
    const h = r;
    this._lastProps = h, this._lastErrors = n, this._reactive?.notifyProps(h, n), this.onPropsChanged(h, n);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(t) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(t) {
    console.error(`${this.constructor.name} initialization failed:`, t);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(t, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(t, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(t) {
    return this.querySelector(`template[data-type="${t}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
function X(t) {
  return t.__wippyHostBus ?? null;
}
function Z(t) {
  return t.dataset.wippyPanelId ?? null;
}
var tt = Object.defineProperty, et = (t, e, s) => e in t ? tt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, _ = (t, e, s) => et(t, typeof e != "symbol" ? e + "" : e, s), P = /* @__PURE__ */ Symbol("wippy:emit"), R = /* @__PURE__ */ Symbol("wippy:props"), st = /* @__PURE__ */ Symbol("wippy:props_error"), it = /* @__PURE__ */ Symbol("wippy:content"), rt = /* @__PURE__ */ Symbol("wippy:panel-id"), nt = /* @__PURE__ */ Symbol("wippy:layout-bus"), ot = /* @__PURE__ */ Symbol("wippy:host"), at = /* @__PURE__ */ Symbol("wippy:host-visibility");
function ut() {
  const t = S(R);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function dt() {
  const t = S(P);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var _t = class extends Q {
  constructor() {
    super(...arguments), _(this, "_vueApp", null), _(this, "_propsRef", f({})), _(this, "_errorsRef", f([])), _(this, "_contentRef", f(null)), _(this, "_hostVisibilityRef", f(null)), _(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, s, i, r, n) {
    const h = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const o of i)
      this.emitEvent("invalid", { message: o });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((o, u) => {
      this._propsRef.value = o, this._errorsRef.value = [...u];
      for (const p of u)
        this.emitEvent("invalid", { message: p });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((o) => {
      this._contentRef.value = o;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((o) => {
      this._hostVisibilityRef.value = o;
    }, { signal: c.signal });
    const a = (o) => {
      if (c.signal.aborted)
        return;
      const u = H(), p = A(o.rootComponent);
      this._vueApp = p;
      const d = U();
      if (o.piniaPlugins)
        for (const m of o.piniaPlugins)
          d.use(m);
      if (p.use(d), o.plugins)
        for (const m of o.plugins)
          p.use(m);
      p.provide(R, this._propsRef), p.provide(st, this._errorsRef), p.provide(P, this.emitEvent.bind(this)), p.provide(it, this._contentRef), p.provide(at, this._hostVisibilityRef), p.provide(rt, Z(this)), p.provide(nt, X(this)), p.provide(ot, V(this)), o.providers && o.providers(p, this), p.mount(e), u && x(u);
    };
    if (h.rootComponent)
      a(h);
    else if (h.lazyConfig) {
      const o = document.createElement("wippy-loading");
      o.setAttribute("no-bg", ""), e.appendChild(o), h.lazyConfig().then((u) => {
        c.signal.aborted || (o.remove(), a(u));
      }).catch((u) => {
        if (c.signal.aborted)
          return;
        const p = u instanceof Error ? u.message : String(u), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", p), o.replaceWith(d), this.emitEvent("error", { message: p });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
export {
  _t as W,
  ut as a,
  dt as u
};
//# sourceMappingURL=wc-runtime-CNDpK4lj.js.map
