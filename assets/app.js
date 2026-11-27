import { docs } from "./docs-data.js";
import { icon, hydrateIcons } from "./icons.js";

hydrateIcons();
document.querySelectorAll('.site-footer a:not(.wordmark)').forEach(link => {
  const label = link.textContent.replace(/\s*↗$/, '');
  const name = /github/i.test(label) ? 'github' : /console|indexing/i.test(label) ? 'terminal' : /whitepaper/i.test(label) ? 'file' : /security|disclosure/i.test(label) ? 'shield' : /history/i.test(label) ? 'history' : /website/i.test(label) ? 'globe' : /contract|architecture/i.test(label) ? 'layers' : /contribut/i.test(label) ? 'users' : /quick|first/i.test(label) ? 'rocket' : 'book';
  link.innerHTML = `${icon(name)}<span>${label}</span>${/^https?:/.test(link.getAttribute('href')) ? icon('external', 'external-icon') : ''}`;
});

const navEl = document.getElementById("nav");
const docEl = document.getElementById("doc");
const pagerEl = document.getElementById("pager");
const outlineEl = document.getElementById("outline");
const sidebarEl = document.getElementById("sidebar");
const navToggle = document.getElementById("navToggle");
const navBackdrop = document.getElementById("navBackdrop");
const themeToggle = document.getElementById("themeToggle");
const searchDialog = document.getElementById("searchDialog");
const searchTrigger = document.getElementById("searchTrigger");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]));
let activeSlug = docs[0]?.slug || "";
let selectedSearchIndex = 0;
let lastSearchResults = [];
const expandedSections = new Set();
const expandedGroups = new Set();
const searchBodies = new Map(docs.map((doc) => [doc.slug, toText(doc.content).toLowerCase()]));
let headingObserver;

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character]));
}

function toText(html) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent || "";
}

function getCurrentDoc() {
  return docsBySlug.get(activeSlug) || docs[0];
}

function getDocFromHash() {
  return docsBySlug.get(window.location.hash.replace(/^#/, ""));
}

function sectionIcon(section) {
  return icon({
    "Getting started": "book", "Using the app": "rocket", "V2 global funding": "wallet",
    "V3 Communities": "users", "Developers": "code", "Contract reference": "layers",
    "Security & operations": "shield", "Versions & direction": "history", "Source guides": "file",
  }[section]);
}

function chevronIcon() { return icon("chevron", "nav-chevron"); }

function groupIcon(group) {
  return icon(/security/i.test(group) ? "shield" : /capital|grant/i.test(group) ? "wallet" : "layers");
}

function pageIcon(title) {
  return icon(/quick|start/i.test(title) ? "rocket" : /security|invariant/i.test(title) ? "shield" : /history|release/i.test(title) ? "history" : "file");
}

function renderNav() {
  const sections = docs.reduce((all, doc) => {
    if (!all.has(doc.section)) all.set(doc.section, []);
    all.get(doc.section).push(doc);
    return all;
  }, new Map());

  navEl.innerHTML = [...sections.entries()].map(([section, sectionDocs]) => `
    <section class="nav-section ${expandedSections.has(section) ? "is-open" : ""}">
      <button class="nav-section-trigger" type="button" data-section-toggle="${escapeHtml(section)}" aria-expanded="${expandedSections.has(section)}">
        <span class="nav-icon">${sectionIcon(section)}</span><span class="nav-label">${escapeHtml(section)}</span><small class="nav-count">${sectionDocs.length}</small>${chevronIcon()}
      </button>
      <div class="nav-section-pages" ${expandedSections.has(section) ? '' : 'inert'}><div class="nav-section-inner">
        ${sectionDocs.filter((doc) => !doc.group).map((doc) => `<a class="nav-direct-link ${doc.slug === activeSlug ? "active" : ""}" href="#${doc.slug}" data-nav-slug="${doc.slug}"><span class="nav-sub-icon">${pageIcon(doc.title)}</span>${escapeHtml(doc.title)}</a>`).join("")}
        ${[...sectionDocs.filter((doc) => doc.group).reduce((all, doc) => {
          if (!all.has(doc.group)) all.set(doc.group, []);
          all.get(doc.group).push(doc);
          return all;
        }, new Map()).entries()].map(([group, groupDocs]) => {
          if (groupDocs.length === 1) {
            const doc = groupDocs[0];
            return `<a class="nav-direct-link ${doc.slug === activeSlug ? "active" : ""}" href="#${doc.slug}" data-nav-slug="${doc.slug}"><span class="nav-sub-icon">${groupIcon(group)}</span>${escapeHtml(doc.title)}</a>`;
          }
          const groupKey = `${section}::${group}`;
          const groupOpen = expandedGroups.has(groupKey);
          return `<div class="nav-group ${groupOpen ? "is-open" : ""}">
            <button class="nav-group-trigger" type="button" data-group-toggle="${escapeHtml(groupKey)}" aria-expanded="${groupOpen}">
              <span class="nav-sub-icon">${groupIcon(group)}</span><span>${escapeHtml(group)}</span>${chevronIcon()}
            </button>
            <div class="nav-group-pages" ${groupOpen ? '' : 'inert'}><div class="nav-group-inner">${groupDocs.map((doc) => `<a href="#${doc.slug}" data-nav-slug="${doc.slug}" class="${doc.slug === activeSlug ? "active" : ""}"><span class="nav-sub-icon">${pageIcon(doc.title)}</span><span>${escapeHtml(doc.title)}</span></a>`).join("")}</div></div>
          </div>`;
        }).join("")}
      </div></div>
    </section>
  `).join("");

  navEl.querySelectorAll("[data-section-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.sectionToggle;
      const open = !expandedSections.has(section);
      if (open) expandedSections.add(section); else expandedSections.delete(section);
      button.closest('.nav-section').classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.nextElementSibling.inert = !open;
    });
  });

  navEl.querySelectorAll("[data-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.groupToggle;
      const open = !expandedGroups.has(group);
      if (open) expandedGroups.add(group); else expandedGroups.delete(group);
      button.closest('.nav-group').classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.nextElementSibling.inert = !open;
    });
  });

  navEl.querySelectorAll("[data-nav-slug]").forEach((link) => {
    link.addEventListener("click", () => closeNavigation());
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderOutline() {
  const headings = [...docEl.querySelectorAll("h2, h3")];
  if (!headings.length) {
    outlineEl.innerHTML = "";
    return;
  }

  const usedIds = new Set();
  headings.forEach((heading) => {
    const base = slugify(heading.textContent || "section") || "section";
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    heading.id = id;
    const link = document.createElement("a");
    link.className = "heading-link";
    link.href = `#${activeSlug}:${id}`;
    link.textContent = "#";
    link.setAttribute("aria-label", `Link to ${heading.textContent}`);
    heading.append(link);
  });

  outlineEl.innerHTML = `<p>${icon('list')}On this page</p>${headings.map((heading) => `<a class="${heading.tagName === "H3" ? "subheading" : ""}" href="#${activeSlug}:${heading.id}">${escapeHtml(heading.firstChild?.textContent || "")}</a>`).join("")}`;
  headingObserver?.disconnect();
  headingObserver = new IntersectionObserver((entries) => {
    const visible = entries.find((entry) => entry.isIntersecting);
    if (visible) outlineEl.querySelectorAll("a").forEach((link) => link.classList.toggle("current", link.hash.endsWith(`:${visible.target.id}`)));
  }, { rootMargin: "-90px 0px -65% 0px" });
  headings.forEach((heading) => headingObserver.observe(heading));
}

function renderPager() {
  const index = docs.findIndex((doc) => doc.slug === activeSlug);
  const previous = index > 0 ? docs[index - 1] : null;
  const next = index < docs.length - 1 ? docs[index + 1] : null;
  pagerEl.innerHTML = `
    ${previous ? `<a href="#${previous.slug}"><span>${icon('arrow', 'arrow-back')}Previous</span><strong>${escapeHtml(previous.title)}</strong></a>` : "<div></div>"}
    ${next ? `<a class="next" href="#${next.slug}"><span>Next${icon('arrow')}</span><strong>${escapeHtml(next.title)}</strong></a>` : "<div></div>"}
  `;
}

function attachDocumentLinks() {
  docEl.querySelectorAll("[data-doc-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const slug = link.getAttribute("href")?.replace(/^#/, "");
      if (!slug || !docsBySlug.has(slug)) return;
      event.preventDefault();
      window.location.hash = slug;
    });
  });
}

function enhanceCodeSamples() {
  docEl.querySelectorAll("pre > code").forEach((code, index) => {
    const raw = code.textContent;
    if (raw.length < 25000 && !code.dataset.highlighted) {
      code.innerHTML = (raw.match(/\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:function|const|let|return|import|from|export|async|await|contract|interface|struct|enum|event|error|public|external|view|pure|uint256|address|bool|if|else|true|false|npm|node|git)\b|\b\d+(?:\.\d+)?\b|[\s\S]/g) || []).map((token) => {
        const kind = /^(\/\/|#)/.test(token) ? "comment" : /^["']/.test(token) ? "string" : /^\d/.test(token) ? "number" : token.length > 1 && /^\w/.test(token) ? "keyword" : "";
        return kind ? `<span class="token-${kind}">${escapeHtml(token)}</span>` : escapeHtml(token);
      }).join("");
      code.dataset.highlighted = "true";
    }
    if (!code.id) code.id = `${activeSlug}-code-${index + 1}`;
    if (code.closest(".code-sample")) return;

    const pre = code.parentElement;
    const sample = document.createElement("div");
    sample.className = "code-sample";
    const header = document.createElement("div");
    header.className = "code-sample-header";
    const label = document.createElement("span");
    label.textContent = code.dataset.language || "Code example";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "code-copy-button";
    copy.dataset.copyCode = code.id;
    copy.dataset.copyLabel = "Copy";
    copy.innerHTML = `${icon('copy')}Copy`;

    header.append(label, copy);
    pre.before(sample);
    sample.append(header, pre);
  });
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  if (!copied) throw new Error("Clipboard is unavailable");
}

function attachDocumentInteractions() {
  docEl.querySelectorAll("[data-copy-code]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = document.getElementById(button.dataset.copyCode)?.textContent;
      if (!code) return;
      const label = button.dataset.copyLabel || "Copy";
      try {
        await copyText(code.trim());
        button.innerHTML = `${icon('check')}Copied`;
        button.classList.add("copied");
      } catch {
        button.textContent = "Copy unavailable";
      }
      window.setTimeout(() => {
        button.innerHTML = `${icon('copy')}${escapeHtml(label)}`;
        button.classList.remove("copied");
      }, 1800);
    });
  });

  docEl.querySelectorAll("[data-code-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.codeGroup;
      const activePanel = button.dataset.codeTab;
      docEl.querySelectorAll("[data-code-tab]").forEach((tab) => {
        if (tab.dataset.codeGroup === group) {
          const selected = tab === button;
          tab.classList.toggle("active", selected);
          tab.setAttribute("aria-selected", String(selected));
        }
      });
      docEl.querySelectorAll("[data-code-panel]").forEach((panel) => {
        if (panel.dataset.codeGroup === group) {
          const selected = panel.dataset.codePanel === activePanel;
          panel.classList.toggle("active", selected);
          panel.hidden = !selected;
          if (selected) {
            const copyButton = panel.closest(".code-sample")?.querySelector("[data-copy-code]");
            const code = panel.querySelector("code[id]");
            if (copyButton && code) copyButton.dataset.copyCode = code.id;
          }
        }
      });
    });
  });
}

function renderDocument(doc) {
  if (!doc) return;
  const render = () => {
    activeSlug = doc.slug;
    expandedSections.add(doc.section);
    if (doc.group) expandedGroups.add(`${doc.section}::${doc.group}`);
    document.title = `${doc.title} | BERT Docs`;
    docEl.innerHTML = `
      <div class="doc-meta"><a href="#docs-home">BERT Docs</a>${icon('chevron')}<span>${escapeHtml(doc.section)}</span></div>
      ${doc.content}
    `;
    docEl.classList.toggle('doc-home', doc.slug === 'docs-home');
    if (doc.slug === 'docs-home') docEl.querySelector('h1').innerHTML = 'BERT<span>documentation.</span>';
    docEl.querySelectorAll('.doc-card').forEach((card, index) => {
      const target = card.getAttribute('href') || '';
      const name = /security|trust/i.test(target) ? 'shield' : /integrat|develop/i.test(target) ? 'code' : /protocol|account/i.test(target) ? 'layers' : /community|v3/i.test(target) ? 'users' : 'rocket';
      card.dataset.tone = String(index % 4);
      const mark = document.createElement('span'); mark.className = 'card-symbol'; mark.innerHTML = icon(name); card.prepend(mark);
    });
    if (doc.slug === 'docs-home') docEl.querySelector('.lead').after(docEl.querySelector('.doc-cards'));
    docEl.querySelectorAll('[data-copy-code]').forEach(button => { button.innerHTML = `${icon('copy')}${escapeHtml(button.dataset.copyLabel || 'Copy')}`; });
    document.querySelectorAll('[data-shortcut]').forEach(link => {
      const selected = link.dataset.shortcut === doc.section || (link.hash === '#docs-home' && doc.section === 'Using the app');
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    enhanceCodeSamples();
    docEl.querySelectorAll('.code-sample-header > span').forEach(label => { label.innerHTML = `${icon('code')}${escapeHtml(label.textContent)}`; });
    renderNav();
    renderOutline();
    renderPager();
    attachDocumentLinks();
    attachDocumentInteractions();
    requestAnimationFrame(() => docEl.focus({ preventScroll: true }));
  };

  render();
}

function updateFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "doc") { docEl.focus(); return; }
  const [pageSlug, headingId] = hash.split(":");
  const doc = docsBySlug.get(pageSlug) || docs[0];
  renderDocument(doc);
  if (headingId) {
    requestAnimationFrame(() => document.getElementById(headingId)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function scoreDocument(doc, query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const title = doc.title.toLowerCase();
  const summary = doc.summary.toLowerCase();
  const section = doc.section.toLowerCase();
  const tags = doc.tags.join(" ").toLowerCase();
  const body = searchBodies.get(doc.slug) || "";
  if (!terms.every((term) => `${title} ${summary} ${section} ${tags} ${body}`.includes(term))) return { doc, score: 0 };
  const score = terms.reduce((total, term) => total
    + (title.includes(term) ? 12 : 0)
    + (tags.includes(term) ? 9 : 0)
    + (section.includes(term) ? 6 : 0)
    + (summary.includes(term) ? 4 : 0)
    + (body.includes(term) ? 1 : 0), 0);
  return { doc, score };
}

function renderSearchResults(resetSelection = true) {
  const query = searchInput.value.trim();
  if (resetSelection) selectedSearchIndex = 0;
  if (!query) {
    lastSearchResults = docs.slice(0, 6);
    searchResults.innerHTML = `<p class="search-label">Suggested reading</p>${lastSearchResults.map((doc, index) => searchItem(doc, index)).join("")}`;
    bindSearchResults();
    return;
  }
  lastSearchResults = docs.map((doc) => scoreDocument(doc, query)).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).map((result) => result.doc);
  searchResults.innerHTML = lastSearchResults.length
    ? `<p class="search-label">${lastSearchResults.length} matching ${lastSearchResults.length === 1 ? "page" : "pages"}</p>${lastSearchResults.slice(0, 12).map((doc, index) => searchItem(doc, index)).join("")}`
    : `<div class="empty-search"><strong>No documentation page matches “${escapeHtml(query)}”.</strong><span>Try a module, contract, role, flow or invariant.</span></div>`;
  bindSearchResults();
  const selected = searchResults.querySelector(".selected");
  selected?.scrollIntoView({ block: "nearest" });
}

function searchItem(doc, index) {
  return `<button type="button" class="search-result ${index === selectedSearchIndex ? "selected" : ""}" data-search-slug="${doc.slug}"><span><small>${escapeHtml(doc.section)}</small><strong>${escapeHtml(doc.title)}</strong><em>${escapeHtml(doc.summary)}</em></span><i>→</i></button>`;
}

function bindSearchResults() {
  searchResults.querySelectorAll("[data-search-slug]").forEach((button) => {
    button.addEventListener("click", () => openSearchResult(button.dataset.searchSlug));
  });
}

function openSearchResult(slug) {
  if (!docsBySlug.has(slug)) return;
  searchDialog.close();
  searchInput.value = "";
  window.location.hash = slug;
}

function openSearch() {
  if (!searchDialog.open) searchDialog.showModal();
  renderSearchResults();
  requestAnimationFrame(() => searchInput.focus());
}

function closeNavigation() {
  sidebarEl.classList.remove("open");
  navBackdrop.classList.remove("visible");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", String(!matchMedia("(max-width: 760px)").matches && !document.body.classList.contains("nav-collapsed")));
  sidebarEl.inert = matchMedia('(max-width: 760px)').matches || document.body.classList.contains('nav-collapsed');
}

function openNavigation() {
  sidebarEl.inert = false;
  sidebarEl.classList.add("open");
  navBackdrop.classList.add("visible");
  document.body.classList.add("nav-open");
  navToggle.setAttribute("aria-expanded", "true");
  document.getElementById("navClose").focus();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("bert-docs-theme", theme); } catch { /* Reading docs must work with blocked storage. */ }
  themeToggle.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
}

let storedTheme;
try { storedTheme = localStorage.getItem("bert-docs-theme"); } catch { /* Use system preference. */ }
applyTheme(storedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
searchTrigger.addEventListener("click", openSearch);
searchInput.addEventListener("input", () => renderSearchResults());
document.getElementById("searchClose").addEventListener("click", () => searchDialog.close());
searchDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    searchDialog.close();
  }
});
searchInput.addEventListener("keydown", (event) => {
  const available = lastSearchResults.slice(0, 12);
  if (event.key === "ArrowDown" && available.length) { event.preventDefault(); selectedSearchIndex = Math.min(selectedSearchIndex + 1, available.length - 1); renderSearchResults(false); }
  if (event.key === "ArrowUp" && available.length) { event.preventDefault(); selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0); renderSearchResults(false); }
  if (event.key === "Enter" && available[selectedSearchIndex]) { event.preventDefault(); openSearchResult(available[selectedSearchIndex].slug); }
});
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
});
navToggle.addEventListener("click", () => {
  if (matchMedia("(max-width: 760px)").matches) return sidebarEl.classList.contains("open") ? closeNavigation() : openNavigation();
  document.body.classList.toggle("nav-collapsed");
  sidebarEl.inert = document.body.classList.contains('nav-collapsed');
  navToggle.setAttribute("aria-expanded", String(!document.body.classList.contains("nav-collapsed")));
});
document.getElementById("navClose").addEventListener("click", () => { closeNavigation(); navToggle.focus(); });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebarEl.classList.contains("open")) { closeNavigation(); navToggle.focus(); }
  if (event.key === "Tab" && sidebarEl.classList.contains("open")) {
    const nodes = [...sidebarEl.querySelectorAll("a,button")].filter((node) => node.getClientRects().length);
    if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1).focus(); }
    if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); }
  }
});
matchMedia("(max-width: 760px)").addEventListener("change", closeNavigation);
closeNavigation();
navBackdrop.addEventListener("click", closeNavigation);
window.addEventListener("hashchange", updateFromHash);
updateFromHash();
