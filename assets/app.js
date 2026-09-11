import { docs } from "./docs-data.js";

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
  const name = section.toLowerCase();
  if (name.includes("v2")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z\"/><path d=\"m4.5 7.8 7.5 4.3 7.5-4.3M12 12v8.5\"/></svg>";
  if (name.includes("v3")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M12 4V2m0 20v-2M4 12H2m20 0h-2m-2.3-5.7-1.4 1.4m-8.6 8.6-1.4 1.4m0-10.3 1.4 1.4m8.6 8.6 1.4 1.4\"/></svg>";
  if (name.includes("testnet")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7 3h10m-8 0v4.2l-4.1 7.1A4.6 4.6 0 0 0 8.9 21h6.2a4.6 4.6 0 0 0 4-6.7L15 7.2V3\"/><path d=\"M8 15h8\"/></svg>";
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3v18m9-9H3\"/><circle cx=\"12\" cy=\"12\" r=\"8\"/></svg>";
}

function chevronIcon() {
  return "<svg class=\"nav-chevron\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m9 5 7 7-7 7\"/></svg>";
}

function groupIcon(group) {
  const name = group.toLowerCase();
  if (name.includes("capital") || name.includes("grant")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 7h16v11H4z\"/><path d=\"M8 7V5h8v2m-5 4h2\"/></svg>";
  if (name.includes("security")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3 5 6v5c0 4.4 2.8 7.5 7 10 4.2-2.5 7-5.6 7-10V6z\"/><path d=\"m9 12 2 2 4-4\"/></svg>";
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 6.5h16M4 12h16M4 17.5h10\"/></svg>";
}

function pageIcon(title) {
  const name = title.toLowerCase();
  if (name.includes("quick") || name.includes("start")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m13 3-9 10h7l-1 8 10-12h-7z\"/></svg>";
  if (name.includes("reference") || name.includes("address")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z\"/><path d=\"M5 4v16a3 3 0 0 1 3-3h11\"/></svg>";
  if (name.includes("security") || name.includes("invariant")) return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3 5 6v5c0 4.4 2.8 7.5 7 10 4.2-2.5 7-5.6 7-10V6z\"/><path d=\"m9 12 2 2 4-4\"/></svg>";
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 4h9l3 3v13H6z\"/><path d=\"M9 12h6m-6 4h4m2-12v4h4\"/></svg>";
}

function renderNav() {
  const sections = docs.reduce((all, doc) => {
    if (!all.has(doc.section)) all.set(doc.section, []);
    all.get(doc.section).push(doc);
    return all;
  }, new Map());

  const activeDoc = getCurrentDoc();
  const activeSection = activeDoc.section;
  expandedSections.add(activeSection);
  if (activeDoc.group) expandedGroups.add(`${activeSection}::${activeDoc.group}`);

  navEl.innerHTML = [...sections.entries()].map(([section, sectionDocs]) => `
    <section class="nav-section ${expandedSections.has(section) ? "is-open" : ""}">
      <button class="nav-section-trigger" type="button" data-section-toggle="${escapeHtml(section)}" aria-expanded="${expandedSections.has(section)}">
        <span class="nav-icon">${sectionIcon(section)}</span><span>${escapeHtml(section)}</span>${chevronIcon()}
      </button>
      <div class="nav-section-pages"><div class="nav-section-inner">
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
            <div class="nav-group-pages"><div class="nav-group-inner">${groupDocs.map((doc) => `<a href="#${doc.slug}" data-nav-slug="${doc.slug}" class="${doc.slug === activeSlug ? "active" : ""}">${escapeHtml(doc.title)}</a>`).join("")}</div></div>
          </div>`;
        }).join("")}
      </div></div>
    </section>
  `).join("");

  navEl.querySelectorAll("[data-section-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.sectionToggle;
      if (expandedSections.has(section)) expandedSections.delete(section);
      else expandedSections.add(section);
      renderNav();
    });
  });

  navEl.querySelectorAll("[data-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.groupToggle;
      if (expandedGroups.has(group)) expandedGroups.delete(group);
      else expandedGroups.add(group);
      renderNav();
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
  });

  outlineEl.innerHTML = `<p>On this page</p>${headings.map((heading) => `<a class="${heading.tagName === "H3" ? "subheading" : ""}" href="#${activeSlug}:${heading.id}">${escapeHtml(heading.textContent || "")}</a>`).join("")}`;
}

function renderPager() {
  const index = docs.findIndex((doc) => doc.slug === activeSlug);
  const previous = index > 0 ? docs[index - 1] : null;
  const next = index < docs.length - 1 ? docs[index + 1] : null;
  pagerEl.innerHTML = `
    ${previous ? `<a href="#${previous.slug}"><span>Previous</span><strong>${escapeHtml(previous.title)} <i>←</i></strong></a>` : "<div></div>"}
    ${next ? `<a class="next" href="#${next.slug}"><span>Next</span><strong>${escapeHtml(next.title)} <i>→</i></strong></a>` : "<div></div>"}
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
    if (!code.id) code.id = `${activeSlug}-code-${index + 1}`;
    if (code.closest(".code-sample")) return;

    const pre = code.parentElement;
    const sample = document.createElement("div");
    sample.className = "code-sample";
    const header = document.createElement("div");
    header.className = "code-sample-header";
    const label = document.createElement("span");
    label.textContent = "Integration example";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "code-copy-button";
    copy.dataset.copyCode = code.id;
    copy.dataset.copyLabel = "Copy";
    copy.textContent = "Copy";

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
        button.textContent = "Copied";
        button.classList.add("copied");
      } catch {
        button.textContent = "Copy unavailable";
      }
      window.setTimeout(() => {
        button.textContent = label;
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
    document.title = `${doc.title} | BERT Docs`;
    docEl.innerHTML = `
      <div class="doc-meta"><span>${escapeHtml(doc.section)}</span><span>•</span><span>${doc.tags.slice(0, 3).map(escapeHtml).join(" / ")}</span></div>
      ${doc.content}
    `;
    enhanceCodeSamples();
    renderNav();
    renderOutline();
    renderPager();
    attachDocumentLinks();
    attachDocumentInteractions();
    requestAnimationFrame(() => docEl.focus({ preventScroll: true }));
  };

  if (typeof document.startViewTransition === "function") document.startViewTransition(render);
  else render();
}

function updateFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
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
  const body = toText(doc.content).toLowerCase();
  const score = terms.reduce((total, term) => total
    + (title.includes(term) ? 12 : 0)
    + (tags.includes(term) ? 9 : 0)
    + (section.includes(term) ? 6 : 0)
    + (summary.includes(term) ? 4 : 0)
    + (body.includes(term) ? 1 : 0), 0);
  return { doc, score };
}

function renderSearchResults() {
  const query = searchInput.value.trim();
  selectedSearchIndex = 0;
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
}

function openNavigation() {
  sidebarEl.classList.add("open");
  navBackdrop.classList.add("visible");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("bert-docs-theme", theme);
  themeToggle.textContent = theme === "dark" ? "◐" : "◑";
}

const storedTheme = localStorage.getItem("bert-docs-theme");
applyTheme(storedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
searchTrigger.addEventListener("click", openSearch);
searchInput.addEventListener("input", renderSearchResults);
searchInput.addEventListener("keydown", (event) => {
  const available = lastSearchResults.slice(0, 12);
  if (event.key === "ArrowDown" && available.length) { event.preventDefault(); selectedSearchIndex = Math.min(selectedSearchIndex + 1, available.length - 1); renderSearchResults(); }
  if (event.key === "ArrowUp" && available.length) { event.preventDefault(); selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0); renderSearchResults(); }
  if (event.key === "Enter" && available[selectedSearchIndex]) { event.preventDefault(); openSearchResult(available[selectedSearchIndex].slug); }
});
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
});
navToggle.addEventListener("click", openNavigation);
navBackdrop.addEventListener("click", closeNavigation);
window.addEventListener("hashchange", updateFromHash);
updateFromHash();
