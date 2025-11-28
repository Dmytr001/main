type StyleKey = "style-1" | "style-2" | "style-3";

interface StyleDefinition {
  key: StyleKey;
  label: string;
  file: string; 
}

const styles: Record<StyleKey, StyleDefinition> = {
  "style-1": {
    key: "style-1",
    label: "Styl_1",
    file: "/style-1.css",
  },
  "style-2": {
    key: "style-2",
    label: "Styl_2",
    file: "/style-2.css",
  },
  "style-3": {
    key: "style-3",
    label: "Styl_3",
    file: "/style-3.css",
  },
};

let currentStyleKey: StyleKey = "style-1";

const STYLE_LINK_ID = "active-theme-style";
const STYLE_SWITCHER_ID = "style-switcher";

function applyStyle(styleKey: StyleKey) {
  const styleDef = styles[styleKey];
  if (!styleDef) {
    console.warn("Nieznany styl:", styleKey);
    return;
  }

  let linkEl = document.getElementById(STYLE_LINK_ID) as HTMLLinkElement | null;

  if (linkEl) {
    linkEl.href = styleDef.file;
  } else {
    linkEl = document.createElement("link");
    linkEl.id = STYLE_LINK_ID;
    linkEl.rel = "stylesheet";
    linkEl.href = styleDef.file;

    document.head.appendChild(linkEl);
  }

  currentStyleKey = styleKey;

  markActiveLink(styleKey);
}

function styleSwitcherAppearance(container: HTMLElement) {
  container.style.position = "absolute";
  container.style.top = "10px";
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.display = "flex";
  container.style.gap = "1rem";
  container.style.padding = "0.5rem 1rem";
  container.style.background = "rgba(255,255,255,0.6)";
  container.style.borderRadius = "12px";
  container.style.backdropFilter = "blur(4px)";
  container.style.fontWeight = "bold";
}

function styleSwitcherLinkAppearance(link: HTMLAnchorElement) {
  link.style.cursor = "pointer";
  link.style.textDecoration = "underline";
}

function createStyleSwitcher() {
  const header = document.querySelector("header");
  if (!header) return;

  const container = document.createElement("nav");
  container.id = STYLE_SWITCHER_ID;
  container.setAttribute("aria-label", "Wybór stylu strony");

  styleSwitcherAppearance(container);

  const title = document.createElement("span");
  title.textContent = "Wybierz styl:";
  container.appendChild(title);

  (Object.keys(styles) as StyleKey[]).forEach((key) => {
    const styleDef = styles[key];
    const link = document.createElement("a");

    link.href = "#";
    link.textContent = styleDef.label;
    link.dataset.styleKey = styleDef.key;

    styleSwitcherLinkAppearance(link);

    link.addEventListener("click", (event) => {
      event.preventDefault();
      applyStyle(styleDef.key);
    });

    container.appendChild(link);
  });

  (header as HTMLElement).style.position = "relative";
  header.insertBefore(container, header.firstChild);
}

function markActiveLink(activeKey: StyleKey) {
  const container = document.getElementById(STYLE_SWITCHER_ID);
  if (!container) return;

  const links = container.querySelectorAll<HTMLAnchorElement>("a[data-style-key]");
  links.forEach((link) => {
    const key = link.dataset.styleKey as StyleKey | undefined;
    if (key === activeKey) {
      link.style.fontWeight = "bold";
      link.style.backgroundColor = "rgba(0,0,0,0.1)";
    } else {
      link.style.fontWeight = "normal";
      link.style.backgroundColor = "transparent";
    }
  });
}

//=========================================================

document.addEventListener("DOMContentLoaded", () => {
  createStyleSwitcher();
  applyStyle(currentStyleKey);
});
