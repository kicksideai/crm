import { api as c } from "@wippy-fe/proxy";
function d(r, t) {
  if (r instanceof Error && r.message) return r.message;
  if (typeof r == "object" && r) {
    const e = r;
    return e.response?.data?.message || e.response?.data?.error || e.message || e.error || t;
  }
  return t;
}
class _ extends Error {
  candidates;
  constructor(t) {
    super("Multiple CRM workspaces are available."), this.name = "CrmWorkspaceChoice", this.candidates = t;
  }
}
function E(r) {
  const t = r;
  if (t?.code !== "multiple_crm_components" || !Array.isArray(t.candidates)) return null;
  const e = [];
  for (const n of t.candidates) {
    const o = n;
    typeof o.crm_id == "string" && o.crm_id.trim() && typeof o.component_id == "string" && o.component_id.trim() && typeof o.label == "string" && o.label.trim() && e.push({ crm_id: o.crm_id.trim(), component_id: o.component_id.trim(), label: o.label.trim() });
  }
  return e.length ? e : null;
}
function U(r, t) {
  if (r?.success !== !0) throw new Error(r?.error || r?.message || t);
  if (!Object.prototype.hasOwnProperty.call(r, "data")) throw new Error(`${t} Response data is missing.`);
  return r.data;
}
function C(r) {
  if (typeof r != "object" || r === null || typeof r.record_id != "string" || typeof r.object_type != "string" || typeof r.values != "object" || r.values === null)
    throw new Error("CRM returned an invalid record.");
  return r;
}
function D(r) {
  const t = r;
  if (!t || !Array.isArray(t.rows) || !Number.isFinite(t.total) || !Number.isFinite(t.limit) || !Number.isFinite(t.offset)) throw new Error("CRM returned an invalid record page.");
  return { rows: t.rows.map(C), total: Number(t.total), limit: Number(t.limit), offset: Number(t.offset) };
}
function O(r) {
  const t = r;
  if (!t || !Array.isArray(t.rows) || !Number.isFinite(t.total) || !Number.isFinite(t.limit) || !Number.isFinite(t.offset)) throw new Error("CRM returned an invalid page.");
  return { rows: t.rows, total: Number(t.total), limit: Number(t.limit), offset: Number(t.offset) };
}
function h(r) {
  return typeof r == "object" && r !== null && !Array.isArray(r);
}
function L(r) {
  return h(r) && r.success === !0 && typeof r.crm_id == "string" && typeof r.workspace_label == "string" && !!r.workspace_label.trim() && typeof r.can_write == "boolean" && Array.isArray(r.objects) && Array.isArray(r.attributes) && Array.isArray(r.pipelines) && Array.isArray(r.views);
}
function nr(r) {
  return "provisioned" in r && r.provisioned === !1;
}
async function or(r = "") {
  try {
    const t = r ? `/api/v1/workspace/crm/${encodeURIComponent(r)}` : "/api/v1/workspace/crm", { data: e } = await c.get(t);
    if (!h(e)) throw new Error("CRM returned an invalid bootstrap response.");
    if (e.success === !0 && e.provisioned === !1) {
      if (typeof e.can_create != "boolean") throw new Error("CRM returned an invalid creation capability.");
      return { success: !0, provisioned: !1, can_create: e.can_create };
    }
    if (e.success === !1) {
      const n = E(e);
      throw n ? new _(n) : new Error(typeof e.error == "string" ? e.error : "CRM could not be opened.");
    }
    if (!L(e)) throw new Error("CRM returned an invalid bootstrap response.");
    return e;
  } catch (t) {
    if (t instanceof _) throw t;
    const e = h(t) && h(t.response) ? t.response.data : void 0, n = E(e);
    throw n ? new _(n) : new Error(d(t, "CRM could not be opened."));
  }
}
async function p(r, t) {
  try {
    const { data: e } = await c.post(`/api/v1/workspace/crm/${encodeURIComponent(r)}/query`, t);
    return U(e, "CRM query failed.");
  } catch (e) {
    throw new Error(d(e, "CRM query failed."));
  }
}
async function ir(r, t, e = {}) {
  const n = { kind: "records", object_type: t, filters: e.filters ?? [] };
  return e.sort && (n.sort = e.sort), e.search && e.search.trim() && (n.search = e.search.trim()), typeof e.limit == "number" && (n.limit = e.limit), typeof e.offset == "number" && (n.offset = e.offset), D(await p(r, n));
}
async function sr(r, t) {
  const e = await p(r, { kind: "count", object_type: t }), n = typeof e == "number" ? e : Number(e);
  return Number.isFinite(n) ? n : 0;
}
async function ar(r, t) {
  if (!t.length) return [];
  const e = await p(r, { kind: "records_by_ids", ids: t });
  if (!Array.isArray(e)) throw new Error("CRM returned an invalid record collection.");
  return e.map(C);
}
async function cr(r, t) {
  const e = await p(r, { kind: "record", record_id: t });
  return e === null ? null : C(e);
}
async function dr(r, t) {
  try {
    const { data: e } = await c.get(`/api/v1/workspace/crm/${encodeURIComponent(r)}/panels/${encodeURIComponent(t)}`), n = e;
    if (n?.success !== !0 || !Array.isArray(n.panels)) throw new Error(typeof n?.error == "string" ? n.error : "CRM record panels could not load.");
    const o = [];
    for (const s of n.panels) {
      const i = s;
      if (typeof i.tag != "string" || !i.tag.trim() || typeof i.title != "string" || !i.title.trim() || !Number.isFinite(i.order) || !Array.isArray(i.object_types) || !i.object_types.every((a) => typeof a == "string"))
        throw new Error("CRM returned an invalid record panel.");
      o.push({ tag: i.tag, title: i.title, order: Number(i.order), object_types: i.object_types });
    }
    return o;
  } catch (e) {
    throw new Error(d(e, "CRM record panels could not load."));
  }
}
async function fr(r, t, e = {}) {
  const n = { kind: "board", collection_id: t };
  typeof e.limit == "number" && (n.limit = e.limit), typeof e.offset == "number" && (n.offset = e.offset);
  const o = await p(r, n);
  if (typeof o != "object" || o === null || Array.isArray(o)) throw new Error("CRM returned an invalid board.");
  return o;
}
function ur(r, t, e = 100) {
  return p(r, { kind: "timeline", ...t ? { record_id: t } : {}, limit: e });
}
async function lr(r, t = {}) {
  return O(await p(r, { kind: "merge_reviews", ...t }));
}
async function pr(r, t) {
  try {
    const { data: e } = await c.post(`/api/v1/workspace/crm/${encodeURIComponent(r)}/apply`, { commands: t });
    if (e?.success !== !0) throw new Error(e?.error || "CRM write failed.");
  } catch (e) {
    throw new Error(d(e, "CRM write failed."));
  }
}
function N(r) {
  const t = r, e = t?.declaration;
  if (t?.success !== !0) throw new Error(t?.error || "CRM schema request failed.");
  if (typeof t.revision != "string" && typeof t.revision != "number" || !e || !Array.isArray(e.objects) || !Array.isArray(e.attributes) || !Array.isArray(e.pipelines) || !Array.isArray(e.views))
    throw new Error("CRM returned an invalid schema response.");
  return { revision: String(t.revision), declaration: e };
}
async function mr(r) {
  try {
    const { data: t } = await c.get(`/api/v1/workspace/crm/${encodeURIComponent(r)}/schema`);
    return N(t);
  } catch (t) {
    throw new Error(d(t, "CRM schema could not load."));
  }
}
async function yr(r, t, e) {
  try {
    const { data: n } = await c.post(`/api/v1/workspace/crm/${encodeURIComponent(r)}/schema`, { expected_revision: t, declaration: e });
    return N(n);
  } catch (n) {
    throw new Error(d(n, "CRM schema could not be saved."));
  }
}
const j = "crm", k = "list_views";
async function wr() {
  try {
    const { data: r } = await c.get(`/api/v1/profile?namespace=${j}&key=${k}`);
    if (r?.success !== !0) throw new Error("CRM list-view preferences could not load.");
    if (r.value === null) return {};
    if (typeof r.value != "object" || Array.isArray(r.value)) throw new Error("CRM returned invalid list-view preferences.");
    return r.value;
  } catch (r) {
    throw new Error(d(r, "CRM list-view preferences could not load."));
  }
}
async function gr(r) {
  try {
    const { data: t } = await c.put("/api/v1/profile", { namespace: j, key: k, value: r });
    if (t?.success !== !0) throw new Error(t?.error || "CRM list-view preferences could not save.");
  } catch (t) {
    throw new Error(d(t, "CRM list-view preferences could not save."));
  }
}
async function hr(r, t, e) {
  try {
    const { data: n } = await c.post(`/api/v1/workspace/crm/${encodeURIComponent(r)}/config/import`, { expected_revision: t, artifact: e });
    if (n?.success !== !0) throw new Error(n?.error || "Configuration import failed.");
    if (!n.result || typeof n.result.changed != "boolean" || typeof n.result.revision != "string" || typeof n.result.source_hash != "string") throw new Error("Configuration import returned an invalid result.");
    return n.result;
  } catch (n) {
    throw new Error(d(n, "Configuration import failed."));
  }
}
async function br(r) {
  try {
    const { data: t } = await c.get(`/api/v1/workspace/crm/${encodeURIComponent(r)}/config/export`);
    if (t?.success !== !0) throw new Error(t?.error || "Configuration export failed.");
    if (!t.config || typeof t.config != "object") throw new Error("Configuration export is empty.");
    return t.config;
  } catch (t) {
    throw new Error(d(t, "Configuration export failed."));
  }
}
async function _r() {
  try {
    const { data: r } = await c.get("/api/v1/settings?namespace=kickside.crm");
    if (r?.success !== !0 || !Array.isArray(r.settings)) throw new Error("CRM returned invalid settings.");
    const t = r.settings;
    return Object.fromEntries(t.map((e) => [e.key, e.value ?? e.default]));
  } catch (r) {
    throw new Error(d(r, "CRM settings could not load."));
  }
}
async function Cr(r, t) {
  try {
    const { data: e } = await c.put("/api/v1/settings", { namespace: "kickside.crm", key: r, value: t });
    if (e?.success !== !0) throw new Error(e?.error || "Setting could not be saved.");
  } catch (e) {
    throw new Error(d(e, "Setting could not be saved."));
  }
}
const b = "r~";
function M(r) {
  const t = new TextEncoder().encode(r);
  let e = "";
  for (const n of t) e += String.fromCharCode(n);
  return btoa(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function T(r) {
  if (!/^[A-Za-z0-9_-]+$/.test(r)) return;
  const t = r.replace(/-/g, "+").replace(/_/g, "/"), e = t + "=".repeat((4 - t.length % 4) % 4);
  try {
    const n = atob(e), o = Uint8Array.from(n, (s) => s.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: !0 }).decode(o);
  } catch {
    return;
  }
}
function P(r, t) {
  return `${r}/${b}${M(t)}`;
}
function x(r) {
  if (r.length !== 2 || !r[1]?.startsWith(b)) return;
  const t = r[1].slice(b.length), e = T(t);
  return e !== void 0 && M(e) === t ? e : void 0;
}
function Rr(r) {
  if (r.length < 2) return { kind: "none" };
  if (r.length > 2) return { kind: "unresolvable", segment: r.slice(1).join("/") };
  const t = r[1] ?? "";
  if (t === "") return { kind: "none" };
  if (t.startsWith(b)) {
    const e = x(r);
    return e === void 0 ? { kind: "unresolvable", segment: t } : { kind: "record", recordId: e };
  }
  try {
    const e = decodeURIComponent(t);
    return e === "" ? { kind: "none" } : { kind: "record", recordId: e };
  } catch {
    return { kind: "unresolvable", segment: t };
  }
}
function Ar(r) {
  return r.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function Er(r) {
  return l(r.type);
}
function Nr(r, t) {
  return r.filter((e) => e.object_type === t).sort((e, n) => (e.sort_order || 0) - (n.sort_order || 0));
}
function y(r) {
  return r.config?.ui || {};
}
function g(r) {
  const t = String(y(r).section ?? "").trim();
  return t === "" || t === "main" ? "main" : t === "hidden" ? "hidden" : "collapsed";
}
function jr(r) {
  const t = Number(y(r).span);
  return t === 1 || t === 2 || t === 3 || t === 4 ? t : 2;
}
function kr(r) {
  if (!r) return;
  const t = r.config?.target;
  if (t && ["record", "component", "principal"].includes(t.kind)) return t;
}
function I(r) {
  return r.find((t) => y(t).role === "title" && g(t) !== "hidden");
}
function Mr(r) {
  return r.filter((t) => y(t).role === "subtitle" && g(t) !== "hidden");
}
function Ir(r, t) {
  return r.find((e) => e.object_type === t.type || !!t.collection && e.collection_id === t.collection);
}
function Sr(r) {
  return (r?.stages || []).map((t, e) => typeof t == "string" ? { stage_id: t, label: t, order: (e + 1) * 10 } : { ...t, label: t.label || t.stage_id });
}
function u(r) {
  return typeof r == "object" && r !== null && !Array.isArray(r);
}
function $r(r, t) {
  return !(t?.data_type === "relation" || r == null || typeof r != "object" || Array.isArray(r) && r.every((e) => e === null || typeof e != "object"));
}
function m(r) {
  if (r == null || r === "") return "—";
  if (typeof r == "boolean") return r ? "Yes" : "No";
  if (Array.isArray(r)) {
    const t = r.map((e) => u(e) ? V(e).map((n) => n.text).join(" ") : m(e)).filter((e) => e && e !== "—");
    return t.length ? t.join(", ") : "—";
  }
  if (u(r)) {
    const t = Object.values(r).map((e) => m(e)).filter((e) => e && e !== "—");
    return t.length ? t.join(" ") : "—";
  }
  return String(r);
}
function V(r) {
  const t = [], e = (n, o, s) => {
    if (u(n))
      for (const [i, a] of Object.entries(n)) {
        const f = o ? `${o} · ${l(i)}` : l(i);
        (u(a) || Array.isArray(a)) && s < 1 ? e(a, f, s + 1) : t.push({ label: f, text: m(a) });
      }
    else Array.isArray(n) ? n.forEach((i, a) => {
      const f = o ? `${o} ${a + 1}` : String(a + 1);
      u(i) && s < 1 ? e(i, f, s + 1) : t.push({ label: f, text: m(i) });
    }) : t.push({ label: o || "Value", text: m(n) });
  };
  return e(r, "", 0), t;
}
function z(r, t) {
  if (r == null || r === "") return "—";
  if (Array.isArray(r)) return r.map((e) => u(e) ? m(e) : String(e)).join(", ");
  if (typeof r == "boolean") return r ? "Yes" : "No";
  if (typeof r == "number" && t?.data_type === "currency") {
    const e = String(t.config?.currency_code || "USD");
    try {
      return new Intl.NumberFormat(void 0, { style: "currency", currency: e, maximumFractionDigits: t.config?.precision ?? 0 }).format(r);
    } catch {
      return String(r);
    }
  }
  if ((t?.data_type === "date" || t?.data_type === "time" || t?.data_type === "datetime") && typeof r == "string") {
    if (t.data_type === "time") {
      const n = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(r);
      if (n) {
        const o = new Date(2e3, 0, 1, Number(n[1]), Number(n[2]), Number(n[3] || 0));
        return new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }).format(o);
      }
    }
    const e = new Date(r);
    if (!Number.isNaN(e.getTime()))
      return t.data_type === "date" ? new Intl.DateTimeFormat(void 0, { year: "numeric", month: "short", day: "numeric" }).format(e) : new Intl.DateTimeFormat(void 0, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(e);
  }
  return typeof r == "object" ? "" : typeof r == "string" && t?.data_type === "select" ? Y(r) : typeof r == "string" && t?.data_type === "text" ? G(r) : String(r);
}
function Fr(r) {
  return String(r || "?").trim().split(/\s+/).slice(0, 2).map((t) => t[0] || "").join("").toUpperCase() || "?";
}
function l(r) {
  return r.replace(/[_-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
const S = /^[A-Za-z][A-Za-z0-9_]*$/, $ = (r) => r === r.toUpperCase() || r === r.toLowerCase();
function Y(r) {
  const t = String(r ?? "").trim();
  return S.test(t) && $(t) ? l(t.toLowerCase()) : t;
}
const B = 5;
function G(r) {
  return S.test(r) ? r.includes("_") ? $(r) ? l(r.toLowerCase()) : r : r.length >= B && r === r.toUpperCase() && !/\d/.test(r) ? l(r.toLowerCase()) : r : r;
}
const K = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, q = /^[0-9A-HJKMNP-TV-Z]{26}$/i, W = /(^\d+$)|:/;
function v(r) {
  const t = String(r ?? ""), e = t.indexOf(":");
  return e > 0 ? { type: t.slice(0, e), slug: t.slice(e + 1) } : { type: "", slug: t };
}
function R(r) {
  const { type: t, slug: e } = v(r);
  return K.test(e) || q.test(e) || W.test(e) ? t ? l(t) : e : l(e);
}
function Z(r) {
  return typeof r == "string" && /^[a-z][a-z0-9_]*:[^\s]/i.test(r) && !r.includes(" ");
}
function Ur(r) {
  return r == null ? "" : Z(r) ? R(r) : String(r);
}
function Q(r, t = []) {
  const e = I(t), n = e ? r.values?.[e.attr] : void 0;
  return n != null && String(n).trim() !== "" ? z(n, e) : R(r.record_id);
}
function Dr(r, t, e = {}, n = []) {
  for (const o of r) e[o.record_id] = { name: Q(o, n.filter((s) => s.object_type === (o.object_type || t))), type: o.object_type || t };
  return e;
}
function H(r) {
  return u(r) ? ["record", "component", "principal"].includes(String(r.kind)) && typeof r.type == "string" && typeof r.id == "string" && r.id.trim() !== "" : !1;
}
function F(r) {
  return r == null || r === "" ? [] : (Array.isArray(r) ? r : [r]).filter(H);
}
function Or(r) {
  return F(r).map((t) => t.id);
}
function Lr(r, t, e) {
  return F(r).map((n) => {
    const o = n.kind === "record" ? t?.[n.id] : void 0, s = n.label || o?.name || R(n.id);
    let i, a;
    if (n.kind === "record") i = P(n.type, n.id);
    else if (e?.route) {
      const f = e.route.split("{id}").join(encodeURIComponent(n.id)).split("{type}").join(encodeURIComponent(n.type));
      /^https?:\/\//i.test(f) ? a = f : i = f.replace(/^\/+/, "");
    }
    return { ...n, label: s, route: i, href: a };
  });
}
function w(r) {
  return r == null || r === "" ? !1 : Array.isArray(r) ? r.length > 0 : u(r) ? Object.keys(r).length > 0 : !0;
}
const J = {
  email: "contact",
  phone: "contact",
  url: "contact",
  select: "status",
  boolean: "status",
  currency: "numbers",
  number: "numbers",
  date: "dates",
  datetime: "dates",
  time: "dates"
}, X = {
  profile: "Profile",
  contact: "Contact",
  status: "Status",
  numbers: "Numbers",
  dates: "Dates"
};
function rr(r) {
  const t = String(y(r).group ?? "").trim();
  return t !== "" ? `declared:${t}` : J[r.data_type] ?? "profile";
}
function tr(r) {
  return r.startsWith("declared:") ? r.slice(9) : X[r] ?? r;
}
function A(r) {
  return r.data_type === "relation";
}
function Tr(r, t, e = []) {
  const n = /* @__PURE__ */ new Map();
  for (const o of r) {
    if (A(o) || e.includes(o.attr) || !w(t[o.attr])) continue;
    const s = rr(o), i = n.get(s);
    i ? i.push(o) : n.set(s, [o]);
  }
  return [...n].map(([o, s]) => ({ key: o, label: tr(o), fields: s }));
}
function Pr(r, t, e) {
  const n = [...t, ...r.filter((o) => !w(e[o.attr]))].filter((o) => !A(o));
  return [
    ...n.filter((o) => w(e[o.attr])),
    ...n.filter((o) => !w(e[o.attr]))
  ];
}
function xr(r, t) {
  const e = r.filter((n) => g(n) !== "hidden" && w(t[n.attr]));
  return {
    relation: e.find(A),
    status: e.find((n) => n.data_type === "select")
  };
}
function Vr(r) {
  const t = [], e = [], n = [];
  for (const o of r) {
    const s = g(o);
    s === "hidden" ? n.push(o) : s === "collapsed" ? e.push(o) : t.push(o);
  }
  return { reading: t, system: e, hidden: n };
}
function zr(r) {
  const t = r.filter((o) => g(o) === "main" && y(o).list !== !1), e = I(t), n = e ? [e.attr] : [];
  for (const o of t) !n.includes(o.attr) && n.length < 6 && n.push(o.attr);
  return n;
}
function Yr(r) {
  if (!r) return "";
  const t = new Date(r);
  if (Number.isNaN(t.getTime())) return r;
  const e = Math.floor((Date.now() - t.getTime()) / 1e3);
  return e < 60 ? "just now" : e < 3600 ? `${Math.floor(e / 60)}m ago` : e < 86400 ? `${Math.floor(e / 3600)}h ago` : e < 604800 ? `${Math.floor(e / 86400)}d ago` : t.toLocaleDateString(void 0, { month: "short", day: "numeric", year: t.getFullYear() !== (/* @__PURE__ */ new Date()).getFullYear() ? "numeric" : void 0 });
}
function Br(r) {
  if (!r) return "";
  const t = new Date(r);
  return Number.isNaN(t.getTime()) ? r : new Intl.DateTimeFormat(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(t);
}
function Gr(r) {
  return `${r}:${crypto.randomUUID()}`;
}
export {
  Cr as $,
  ir as A,
  ur as B,
  fr as C,
  ar as D,
  Gr as E,
  pr as F,
  Ar as G,
  wr as H,
  Dr as I,
  Or as J,
  gr as K,
  u as L,
  Vr as M,
  Tr as N,
  Pr as O,
  Yr as P,
  Ur as Q,
  xr as R,
  w as S,
  cr as T,
  dr as U,
  g as V,
  Rr as W,
  nr as X,
  _ as Y,
  mr as Z,
  _r as _,
  lr as a,
  hr as a0,
  br as a1,
  yr as a2,
  or as b,
  sr as c,
  R as d,
  Q as e,
  kr as f,
  Lr as g,
  l as h,
  z as i,
  $r as j,
  Y as k,
  y as l,
  d as m,
  jr as n,
  Nr as o,
  Mr as p,
  Ir as q,
  F as r,
  V as s,
  I as t,
  zr as u,
  Er as v,
  P as w,
  Fr as x,
  Sr as y,
  Br as z
};
//# sourceMappingURL=crm-model-BaRhr3mT.js.map
