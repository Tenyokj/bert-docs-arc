const paths = {
  book: '<path d="M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Zm0 0v15"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  network: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  history: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6m3-4v6l4 2"/>',
  file: '<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M9 3H3v18h18v-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon: '<path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m7-11-3 3 3 3"/>',
  terminal: '<path d="m4 5 7 7-7 7m9 0h7"/>',
  rocket: '<path d="M12 15c5-2 8-6 8-12-6 0-10 3-12 8m4 4-4-4m4 4v5l-3-1M8 11H3l1-3m0 9-1 4 4-1"/><circle cx="15" cy="8" r="1.5"/>',
  users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m0-18a4 4 0 0 1 0 8m6 10v-3a7 7 0 0 0-4-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.3-1.7-1-2 4-.5 6-2 6-6 0-1.4-.5-2.5-1.5-3.5.3-1 .2-2.5-.5-3.5-1.5 0-3 1-3.5 1.5a13 13 0 0 0-7 0C7 4 5.5 3 4 3c-.7 1-.8 2.5-.5 3.5C2.5 7.5 2 8.6 2 10c0 4 2 5.5 6 6-.7.3-1 1-1 2v4"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM21 2v4m-2-2h4"/>',
  wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h15V7m0 5h-5v5h5"/>',
};

export function icon(name, className = '') {
  return `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.file}</svg>`;
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(node => {
    node.innerHTML = icon(node.dataset.icon);
  });
}
