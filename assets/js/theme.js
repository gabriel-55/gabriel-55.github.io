(() => {
  const storageKey = "portfolio-theme";
  const toggle = document.querySelector("[data-theme-toggle]");
  const icon = document.querySelector("[data-theme-icon]");
  const root = document.documentElement;
  const labels = {
    en: { dark: "Switch to light mode", light: "Switch to dark mode" },
    ja: { dark: "ライトモードに切り替え", light: "ダークモードに切り替え" },
  };

  if (!toggle || !icon) return;

  const apply = (theme) => {
    root.dataset.theme = theme;
    icon.textContent = theme === "dark" ? "☀️" : "🌙";
    const label = (labels[root.lang] || labels.en)[theme];
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("title", label);
  };

  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch {}
    apply(nextTheme);
  });

  apply(root.dataset.theme === "dark" ? "dark" : "light");
})();
