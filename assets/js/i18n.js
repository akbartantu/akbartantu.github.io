(function () {
  const CV = (window.CV = window.CV || {});
  const STORAGE_KEY = "portfolio-language";

  function readStored() {
    try {
      if (typeof localStorage === "undefined") return "";
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function writeStored(value) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* The visit can continue even when storage is blocked. */
    }
  }

  CV.i18n = {
    lang() {
      return CV._lang === "id" ? "id" : "en";
    },
    init() {
      let next = "en";
      const stored = readStored();
      if (stored === "en" || stored === "id") next = stored;
      if (typeof location !== "undefined") {
        const query = new URLSearchParams(location.search).get("lang");
        if (query === "en" || query === "id") next = query;
      }
      CV._lang = next;
    },
    setLang(next) {
      CV._lang = next === "id" ? "id" : "en";
      writeStored(CV._lang);
      if (typeof history !== "undefined" && typeof location !== "undefined") {
        const url = new URL(location.href);
        url.searchParams.set("lang", CV._lang);
        history.replaceState(null, "", url);
      }
    },
    t(key) {
      const pack = (CV.ui && CV.ui[this.lang()]) || {};
      const fallback = (CV.ui && CV.ui.en) || {};
      return Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : (fallback[key] || key);
    }
  };

  CV.tx = function (value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    const lang = CV.i18n.lang();
    return value[lang] || value.en || value.id || "";
  };
})();
