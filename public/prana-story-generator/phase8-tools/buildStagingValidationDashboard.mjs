#!/usr/bin/env node
/**
 * Builds a self-contained HTML dashboard from
 * tmp_staging_validation_report.json (produced by
 * runStagingValidationHarness.js). Run the harness first, then this.
 *
 *   node public/prana-story-generator/phase8-tools/runStagingValidationHarness.js
 *   node public/prana-story-generator/phase8-tools/buildStagingValidationDashboard.mjs
 *
 * Writes tmp_staging_dashboard.html — publish it as an Artifact, or open
 * directly in a browser (fully self-contained, no external requests).
 */
import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "tmp_staging_validation_report.json"), "utf8"));

const html = `<title>Staging Validation Harness — Prana Template Pipeline</title>
<style>
  :root {
    --bg: #F5F6F3;
    --surface: #FFFFFF;
    --surface-alt: #EDF1EC;
    --text: #1A231F;
    --text-dim: #5E6E66;
    --border: #DCE3DD;
    --accent: #2C6E63;
    --accent-soft: #DCEEE9;
    --pass: #2E7D46;
    --pass-soft: #E1F1E6;
    --warn: #A9720A;
    --warn-soft: #FBEFD8;
    --fail: #B23A22;
    --fail-soft: #FBE4DE;
    --shadow: 0 1px 2px rgba(20, 30, 25, 0.06), 0 8px 24px -12px rgba(20, 30, 25, 0.18);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #101512;
      --surface: #171E1B;
      --surface-alt: #1D2521;
      --text: #E6ECE8;
      --text-dim: #93A39B;
      --border: #29332D;
      --accent: #57D9BC;
      --accent-soft: #1B332E;
      --pass: #57C97C;
      --pass-soft: #163425;
      --warn: #E3BE5C;
      --warn-soft: #35290F;
      --fail: #EA7A67;
      --fail-soft: #3A1D17;
      --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px -12px rgba(0, 0, 0, 0.5);
    }
  }
  :root[data-theme="dark"] {
    --bg: #101512;
    --surface: #171E1B;
    --surface-alt: #1D2521;
    --text: #E6ECE8;
    --text-dim: #93A39B;
    --border: #29332D;
    --accent: #57D9BC;
    --accent-soft: #1B332E;
    --pass: #57C97C;
    --pass-soft: #163425;
    --warn: #E3BE5C;
    --warn-soft: #35290F;
    --fail: #EA7A67;
    --fail-soft: #3A1D17;
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px -12px rgba(0, 0, 0, 0.5);
  }
  :root[data-theme="light"] {
    --bg: #F5F6F3;
    --surface: #FFFFFF;
    --surface-alt: #EDF1EC;
    --text: #1A231F;
    --text-dim: #5E6E66;
    --border: #DCE3DD;
    --accent: #2C6E63;
    --accent-soft: #DCEEE9;
    --pass: #2E7D46;
    --pass-soft: #E1F1E6;
    --warn: #A9720A;
    --warn-soft: #FBEFD8;
    --fail: #B23A22;
    --fail-soft: #FBE4DE;
    --shadow: 0 1px 2px rgba(20, 30, 25, 0.06), 0 8px 24px -12px rgba(20, 30, 25, 0.18);
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }
  .mono {
    font-family: ui-monospace, "SFMono-Regular", "Cascadia Mono", Consolas, Menlo, monospace;
    font-variant-numeric: tabular-nums;
  }

  .wrap { max-width: 1180px; margin: 0 auto; padding: 40px 28px 80px; }

  header.page-head { margin-bottom: 32px; }
  .eyebrow {
    font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 0.72rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 10px;
  }
  h1 {
    font-size: clamp(1.6rem, 2.6vw, 2.15rem);
    margin: 0 0 8px;
    text-wrap: balance;
    letter-spacing: -0.01em;
  }
  .subhead { color: var(--text-dim); font-size: 0.98rem; max-width: 62ch; margin: 0; }
  .pipeline-line {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 0.82rem;
    color: var(--text-dim);
  }
  .pipeline-line b { color: var(--text); font-weight: 600; }
  .pipeline-line .arrow { color: var(--accent); }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin: 28px 0 30px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 18px;
    box-shadow: var(--shadow);
  }
  .stat-card .n {
    font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 1.7rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .stat-card .n.pass { color: var(--pass); }
  .stat-card .n.warn { color: var(--warn); }
  .stat-card .label {
    font-size: 0.75rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
  }

  .toggle-banner {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: var(--warn-soft);
    border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent);
    color: var(--text);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 0.88rem;
    margin-bottom: 28px;
  }
  .toggle-banner .dot {
    flex: none;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--warn);
    margin-top: 6px;
  }
  .toggle-banner b { color: var(--warn); }

  .filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .chip {
    font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 0.78rem;
    padding: 7px 13px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-dim);
    cursor: pointer;
    user-select: none;
    transition: border-color 0.12s ease, color 0.12s ease, background 0.12s ease;
  }
  .chip:hover { border-color: var(--accent); color: var(--text); }
  .chip.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--surface);
    font-weight: 600;
  }
  :root[data-theme="dark"] .chip.active { color: #0A130F; }
  @media (prefers-color-scheme: dark) { .chip.active { color: #0A130F; } }

  .table-shell {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow);
  }
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; min-width: 880px; }
  thead th {
    text-align: left;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-dim);
    background: var(--surface-alt);
    padding: 11px 14px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  tbody tr.row {
    cursor: pointer;
    border-bottom: 1px solid var(--border);
    transition: background 0.1s ease;
  }
  tbody tr.row:hover { background: var(--surface-alt); }
  tbody tr.row:last-child { border-bottom: none; }
  tbody td { padding: 11px 14px; font-size: 0.86rem; vertical-align: middle; }
  td.sit { font-weight: 600; }
  td.title-cell { color: var(--text-dim); max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 0.74rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 6px;
  }
  .badge.tpl { background: var(--accent-soft); color: var(--accent); }
  .badge.none { background: var(--fail-soft); color: var(--fail); }

  .gate-strip { display: inline-flex; gap: 2px; }
  .gate-dot {
    width: 7px; height: 7px; border-radius: 2px;
    background: var(--pass);
  }
  .gate-dot.fail { background: var(--fail); }
  .gate-dot.na { background: var(--border); }

  .result-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.74rem; font-weight: 700;
    padding: 3px 10px; border-radius: 999px;
    letter-spacing: 0.02em;
  }
  .result-pill.pass { background: var(--pass-soft); color: var(--pass); }
  .result-pill.fail { background: var(--fail-soft); color: var(--fail); }
  .result-pill.gap { background: var(--warn-soft); color: var(--warn); }

  .tag {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 1px 6px;
    margin-left: 6px;
  }

  tr.detail-row { display: none; }
  tr.detail-row.open { display: table-row; }
  tr.detail-row td {
    background: var(--surface-alt);
    padding: 18px 20px 22px;
    border-bottom: 1px solid var(--border);
  }
  .detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 22px;
  }
  @media (max-width: 720px) { .detail-grid { grid-template-columns: 1fr; } }
  .detail-block h4 {
    margin: 0 0 8px;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-dim);
  }
  .gate-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 5px; }
  .gate-list li {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem; padding: 5px 0; border-bottom: 1px dashed var(--border);
  }
  .gate-list li:last-child { border-bottom: none; }
  .gate-status { font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace; font-size: 0.74rem; font-weight: 600; }
  .gate-status.pass { color: var(--pass); }
  .gate-status.fail { color: var(--fail); }
  .gate-status.na { color: var(--text-dim); }
  .compression-text {
    font-size: 0.86rem;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    line-height: 1.55;
  }
  .reason-text {
    font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 0.76rem;
    color: var(--text-dim);
    line-height: 1.6;
  }
  .empty-note { color: var(--text-dim); font-size: 0.86rem; font-style: italic; }

  footer.foot {
    margin-top: 26px;
    color: var(--text-dim);
    font-size: 0.8rem;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  a { color: var(--accent); }

  .visually-hidden-focusable:focus { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>

<div class="wrap">
  <header class="page-head">
    <p class="eyebrow">Dev A — Selector / Engine Infrastructure</p>
    <h1>Staging Validation Harness</h1>
    <p class="subhead">Every row below ran through the complete template pipeline exactly as a real user would with the staging toggle on — natural <code class="mono">selectStoryTemplate</code>, never a forced QA path. This is the evidence gate before the toggle becomes default.</p>
    <div class="pipeline-line">
      <span>situation</span><span class="arrow">→</span><span>selected template</span><span class="arrow">→</span><span>realization family</span><span class="arrow">→</span><span>11 QA gates</span><span class="arrow">→</span><span>export</span><span class="arrow">→</span><b>final story</b>
    </div>
  </header>

  <div class="toggle-banner">
    <span class="dot"></span>
    <div><b>Toggle status: OFF for real users.</b> This run used <code class="mono">?templatePipeline=1</code> / <code class="mono">setTemplatePipelineEnabled(true)</code> in an isolated staging browser session only. Nothing here reflects current production behavior.</div>
  </div>

  <div class="stat-row" id="statRow"></div>

  <div class="filters" id="filters"></div>

  <div class="table-shell">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Situation</th>
            <th>Need</th>
            <th>Template</th>
            <th>Realization family</th>
            <th>Gates</th>
            <th>Result</th>
            <th>Pages</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>

  <footer class="foot">
    <span>Generated by <code class="mono">phase8-tools/runStagingValidationHarness.js</code> — rerun after any <code class="mono">storyTemplates.json</code> curation change.</span>
    <span id="genCount"></span>
  </footer>
</div>

<script>
  const DATA = ${JSON.stringify(data)};
  const rows = DATA.rows;

  function classify(row) {
    if (row.isZeroTierFallback) return "gap";
    return row.allGatesPass ? "pass" : "fail";
  }

  const passCount = rows.filter(r => classify(r) === "pass").length;
  const failCount = rows.filter(r => classify(r) === "fail").length;
  const gapCount = rows.filter(r => classify(r) === "gap").length;
  const curatedCount = rows.filter(r => r.curated).length;
  const genericCount = rows.filter(r => !r.curated && !r.isZeroTierFallback).length;

  const stats = [
    { n: rows.length, label: "Situations run", cls: "" },
    { n: passCount, label: "Full pipeline pass", cls: "pass" },
    { n: curatedCount, label: "Curated (T16/21/22/23)", cls: "" },
    { n: genericCount, label: "Generic template", cls: "" },
    { n: failCount, label: "Real QA gaps found", cls: failCount ? "warn" : "" },
    { n: gapCount, label: "No-template fallback", cls: gapCount ? "warn" : "" },
  ];
  document.getElementById("statRow").innerHTML = stats.map(s =>
    \`<div class="stat-card"><div class="n \${s.cls}">\${s.n}</div><div class="label">\${s.label}</div></div>\`
  ).join("");

  document.getElementById("genCount").textContent =
    \`\${DATA.representativeCount} of \${DATA.totalActiveSituations} active situations sampled\`;

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "curated", label: "Curated (T16/21/22/23)" },
    { id: "generic", label: "Generic template" },
    { id: "fail", label: "Real gaps" },
    { id: "gap", label: "No-template fallback" },
  ];
  let activeFilter = "all";

  function matchesFilter(row) {
    if (activeFilter === "all") return true;
    if (activeFilter === "curated") return row.curated;
    if (activeFilter === "generic") return !row.curated && !row.isZeroTierFallback;
    if (activeFilter === "fail") return classify(row) === "fail";
    if (activeFilter === "gap") return classify(row) === "gap";
    return true;
  }

  function renderFilters() {
    document.getElementById("filters").innerHTML = FILTERS.map(f =>
      \`<span class="chip \${activeFilter === f.id ? 'active' : ''}" data-filter="\${f.id}">\${f.label}</span>\`
    ).join("");
    document.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        activeFilter = chip.dataset.filter;
        renderFilters();
        renderTable();
      });
    });
  }

  function gateStripHtml(gates) {
    return '<span class="gate-strip">' + gates.map(g =>
      \`<span class="gate-dot \${g.pass ? '' : (g.status === 'N/A' ? 'na' : 'fail')}" title="\${g.label}: \${g.status}"></span>\`
    ).join('') + '</span>';
  }

  function renderTable() {
    const tbody = document.getElementById("tbody");
    const visible = rows.filter(matchesFilter);
    tbody.innerHTML = visible.map((r, i) => {
      const cls = classify(r);
      const pill = cls === "pass"
        ? '<span class="result-pill pass">PASS</span>'
        : cls === "gap"
          ? '<span class="result-pill gap">NO TEMPLATE</span>'
          : '<span class="result-pill fail">GAP FOUND</span>';
      const tplBadge = r.templateId
        ? \`<span class="badge tpl">\${r.templateId}</span>\`
        : '<span class="badge none">NONE</span>';
      const curatedTag = r.curated ? '<span class="tag">curated</span>' : '';
      const rowId = 'row-' + i;
      const detailId = 'detail-' + i;

      const gateListHtml = r.gates.map(g =>
        \`<li><span>\${g.label}</span><span class="gate-status \${g.pass ? 'pass' : (g.status === 'N/A' ? 'na' : 'fail')}">\${g.status}</span></li>\`
      ).join('');

      return \`
        <tr class="row" data-target="\${detailId}" id="\${rowId}">
          <td class="mono" style="color:var(--text-dim)">▸</td>
          <td class="sit mono">\${r.situationId}\${curatedTag}</td>
          <td class="mono" style="color:var(--text-dim)">\${(r.needId || '—').replace('NEED_', '')}</td>
          <td>\${tplBadge}</td>
          <td style="color:var(--text-dim); font-size:0.82rem;">\${r.realizationFamily.startsWith('N/A') ? '<span class="empty-note">generic — no modes yet</span>' : r.realizationFamily}</td>
          <td>\${gateStripHtml(r.gates)}</td>
          <td>\${pill}</td>
          <td class="mono">\${r.pageCount || '—'}</td>
        </tr>
        <tr class="detail-row" id="\${detailId}">
          <td colspan="8">
            <div class="detail-grid">
              <div class="detail-block">
                <h4>Situation</h4>
                <div style="margin-bottom:14px;">"\${r.title || ''}"</div>
                <h4>Selection reasoning</h4>
                <div class="reason-text">\${r.selectionReason || 'No template selected — see item 2, needs taxonomy gap.'}</div>
                \${r.buildError ? \`<h4 style="margin-top:14px;color:var(--fail);">Build error</h4><div class="reason-text">\${r.buildError}</div>\` : ''}
              </div>
              <div class="detail-block">
                <h4>All 11 QA gates</h4>
                <ul class="gate-list">\${gateListHtml}</ul>
              </div>
            </div>
            \${r.compression ? \`<h4 style="margin-top:18px;">Compression (final story summary)</h4><div class="compression-text">\${r.compression}</div>\` : ''}
          </td>
        </tr>
      \`;
    }).join("");

    tbody.querySelectorAll("tr.row").forEach(row => {
      row.addEventListener("click", () => {
        const detail = document.getElementById(row.dataset.target);
        detail.classList.toggle("open");
        const arrow = row.querySelector("td.mono");
        arrow.textContent = detail.classList.contains("open") ? "▾" : "▸";
      });
    });
  }

  renderFilters();
  renderTable();
</script>
`;

fs.writeFileSync(path.resolve(process.cwd(), "tmp_staging_dashboard.html"), html, "utf8");
console.log("written tmp_staging_dashboard.html", html.length, "bytes");
