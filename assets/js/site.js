(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("#site-navigation");
  const icon = document.querySelector("[data-menu-icon]");
  const label = document.querySelector("[data-menu-label]");
  const root = document.documentElement;
  const labels = {
    en: { open: "Open menu", close: "Close menu", menu: "Menu" },
    ja: { open: "メニューを開く", close: "メニューを閉じる", menu: "メニュー" },
  };

  if (!toggle || !navigation || !icon || !label) return;

  const languageLabels = labels[root.lang] || labels.en;
  const setOpen = (open) => {
    navigation.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? languageLabels.close : languageLabels.open);
    toggle.setAttribute("title", open ? languageLabels.close : languageLabels.open);
    icon.textContent = open ? "×" : "☰";
    label.textContent = languageLabels.menu;
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header-controls")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 721px)").addEventListener?.("change", () => setOpen(false));
})();
