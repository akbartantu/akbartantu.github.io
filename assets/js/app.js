(function () {
  const CV = (window.CV = window.CV || {});
  let menuOpen = false;

  function main() {
    return document.getElementById("content");
  }

  function currentHash() {
    return decodeURIComponent(location.hash.replace(/^#/, ""));
  }

  function applyChrome() {
    const lang = CV.i18n.lang();
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.textContent = CV.i18n.t(element.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
      element.setAttribute("aria-label", CV.i18n.t(element.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (button) {
      const active = button.getAttribute("data-set-lang") === lang;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.classList.toggle("is-active", active);
    });
    document.title = CV.i18n.t("meta.title");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", CV.i18n.t("meta.description"));
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogTitle) ogTitle.setAttribute("content", CV.i18n.t("meta.title"));
    if (ogDescription) ogDescription.setAttribute("content", CV.i18n.t("meta.description"));
    if (ogLocale) ogLocale.setAttribute("content", lang === "id" ? "id_ID" : "en_US");
    syncMenu();
  }

  function syncMenu() {
    const nav = document.getElementById("site-nav");
    const button = document.querySelector(".menu-toggle");
    if (!nav || !button) return;
    nav.classList.toggle("is-open", menuOpen);
    button.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    button.setAttribute("aria-label", CV.i18n.t(menuOpen ? "nav.menuClose" : "nav.menuOpen"));
  }

  function markCurrent() {
    const hash = currentHash();
    let current = "";
    if (hash.startsWith("case/")) current = "projects";
    else if (document.getElementById("home")) {
      const marker = window.scrollY + 140;
      document.querySelectorAll("main section[id]").forEach(function (section) {
        if (section.offsetTop <= marker) current = section.id;
      });
      if (!current) current = "home";
    }
    document.querySelectorAll("#site-nav a").forEach(function (link) {
      const id = (link.getAttribute("href") || "").slice(1);
      if (id && id === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function scrollToHash() {
    const hash = currentHash();
    if (!hash || hash.startsWith("case/")) return;
    const target = document.getElementById(hash);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "instant" });
  }

  function paint(preserveScroll) {
    const hash = currentHash();
    const caseId = hash.startsWith("case/") ? hash.slice(5) : "";
    const y = window.scrollY;
    if (caseId) {
      main().innerHTML = CV.render.caseStudy(caseId);
      CV.mode = "case";
      if (!preserveScroll) window.scrollTo(0, 0);
      else window.scrollTo(0, y);
    } else {
      if (/^(EXP|ORG|VOL)-[0-9]+$/.test(hash)) CV.openIds.add(hash);
      main().innerHTML = CV.render.page();
      CV.mode = "page";
      if (preserveScroll) window.scrollTo(0, y);
      else scrollToHash();
    }
    markCurrent();
  }

  function setLanguage(next) {
    const hash = currentHash();
    const sectionIds = ["home", "about", "experience", "education", "skills", "organizations", "volunteering", "licenses", "projects", "contact"];
    const keepPlace = !(sectionIds.indexOf(hash) !== -1 || hash.startsWith("case/"));
    CV.i18n.setLang(next);
    applyChrome();
    paint(keepPlace);
    const status = document.getElementById("lang-status");
    if (status) status.textContent = CV.i18n.t(CV.i18n.lang() === "id" ? "lang.changedId" : "lang.changedEn");
  }

  document.addEventListener("click", function (event) {
    const langButton = event.target.closest("[data-set-lang]");
    if (langButton) {
      setLanguage(langButton.getAttribute("data-set-lang"));
      return;
    }
    const toggle = event.target.closest("[data-expand]");
    if (toggle) {
      const id = toggle.getAttribute("data-expand");
      if (CV.openIds.has(id)) CV.openIds.delete(id);
      else CV.openIds.add(id);
      const open = CV.openIds.has(id);
      const panel = document.getElementById("panel-" + id);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = CV.i18n.t(open ? "experience.hide" : "experience.show");
      if (panel) panel.hidden = !open;
      return;
    }
    if (event.target.closest(".menu-toggle")) {
      menuOpen = !menuOpen;
      syncMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuOpen) {
      menuOpen = false;
      syncMenu();
      const button = document.querySelector(".menu-toggle");
      if (button) button.focus();
    }
  });

  window.addEventListener("hashchange", function () {
    menuOpen = false;
    syncMenu();
    paint(false);
  });

  window.addEventListener("scroll", markCurrent, { passive: true });

  CV.i18n.init();
  CV.openIds = new Set();
  applyChrome();
  paint(false);
  window.addEventListener("load", scrollToHash);
})();
