const y = {
  email_exact: "Same email address",
  website_domain_exact: "Same website domain",
  domain_exact: "Same domain",
  domain_name: "Same domain and a similar name",
  value_exact: "Matching field value"
};
function b(e) {
  return e == null ? "" : typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : "";
}
function r(e) {
  return b(e).replace(/^\s+|\s+$/g, "");
}
function d(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function p(e) {
  const t = typeof e == "number" ? e : Number.parseFloat(b(e));
  return !Number.isFinite(t) || t < 0 ? 0 : t > 1 ? 1 : t;
}
function h(e) {
  const t = r(e).toLowerCase();
  return t ? y[t] ? y[t] : t.replace(/[._]+/g, " ").replace(/\b\w/g, (n) => n.toUpperCase()) : "Possible duplicate";
}
function I(e) {
  return e >= 0.85 ? "high" : e >= 0.6 ? "medium" : "low";
}
function A(e) {
  return Math.round(p(e) * 100);
}
function g(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [], n = [];
  for (const i of t) {
    if (!d(i)) continue;
    if (i.domain_attr || i.name_attr) {
      const u = r(i.domain_attr), c = r(i.domain);
      u && c && n.push({ attr: u, value: c });
      const l = r(i.name_attr), s = typeof i.name_similarity == "number" ? i.name_similarity : Number.parseFloat(b(i.name_similarity));
      l && Number.isFinite(s) && n.push({ attr: l, value: `${Math.round(s * 100)}% name match` });
      continue;
    }
    const a = r(i.attr);
    if (!a) continue;
    const o = i.value !== void 0 ? r(i.value) : r(i.domain);
    n.push({ attr: a, value: o });
  }
  return n;
}
function _(e, t) {
  const n = { id: e, label: e || "(unknown record)", values: [], aliases: [], activityCount: null };
  if (!d(t)) return n;
  const i = d(t.values) ? t.values : t, a = [];
  for (const [s, m] of Object.entries(i)) {
    if (s === "values" || s === "aliases" || s === "activity_count" || s === "activityCount" || s === "label" || s === "record_id") continue;
    const f = r(m);
    f && a.push({ attr: s, value: f });
  }
  n.values = a;
  const o = Array.isArray(t.aliases) ? t.aliases : [];
  n.aliases = o.map(r).filter((s) => s !== "");
  const u = t.activity_count !== void 0 ? t.activity_count : t.activityCount, c = typeof u == "number" ? u : Number.parseInt(b(u), 10);
  n.activityCount = Number.isFinite(c) ? c : null;
  const l = r(t.label);
  return n.label = l || w(a) || e || "(unknown record)", n;
}
function w(e) {
  const t = (n) => e.find((i) => i.attr === n)?.value;
  return t("name") || t("email") || t("website") || "";
}
function k(e, t, n) {
  const i = typeof n == "string" ? n : n == null ? "" : v(n), a = (f) => ({ ok: !1, itemId: r(e), content: r(t), raw: i, error: f });
  if (r(i) === "" && !d(n)) return a("No merge details were provided.");
  let o;
  if (d(n))
    o = n;
  else
    try {
      o = JSON.parse(i);
    } catch {
      return a("Merge details could not be read.");
    }
  if (!d(o)) return a("Merge details are not in the expected format.");
  const u = r(o.left_id), c = r(o.right_id);
  if (!u || !c) return a("Merge details are missing the records to compare.");
  const l = g(o.evidence), s = d(o.context) ? o.context : {}, m = r(o.reason);
  return {
    ok: !0,
    itemId: r(e),
    crmId: r(o.crm_id),
    objectType: r(o.object_type) || "record",
    content: r(t),
    confidence: p(o.confidence),
    reasonCode: m,
    reasonLabel: h(m),
    matched: l,
    matchedAttrs: l.map((f) => f.attr),
    left: _(u, s.left),
    right: _(c, s.right),
    workflow: {
      workflowId: r(o.workflow_id),
      runId: r(o.run_id),
      dataflowId: r(o.dataflow_id),
      signalId: r(o.signal_id)
    }
  };
}
function v(e) {
  try {
    return JSON.stringify(e);
  } catch {
    return "";
  }
}
function S(e, t) {
  const n = r(t.note), i = (a) => n ? { ...a, note: n } : a;
  switch (e) {
    case "merged": {
      const a = r(t.winnerId);
      if (a !== t.leftId && a !== t.rightId)
        return { form: null, error: "Select which record to keep." };
      const o = a === t.leftId ? t.rightId : t.leftId;
      return { form: i({ winner_id: a, loser_id: o }), error: null };
    }
    case "do_not_merge":
    case "skipped":
      return { form: i({}), error: null };
    default:
      return { form: null, error: `Unknown action: ${e}` };
  }
}
export {
  I as a,
  S as b,
  A as c,
  k as p,
  h as r
};
//# sourceMappingURL=model-COKQFUj6.js.map
