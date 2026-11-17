(function () {
  const CV = (window.CV = window.CV || {});

  CV.esc = function (value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  };

  CV.text = function (value) {
    return CV.esc(CV.tx(value));
  };

  CV.safeLink = function (value) {
    if (typeof value !== "string") return "";
    let url;
    try {
      url = new URL(value);
    } catch (error) {
      return "";
    }
    if (url.protocol !== "https:") return "";
    const host = url.hostname.toLowerCase();
    const allowed = host === "linkedin.com" || host === "www.linkedin.com" || host === "github.com" || host === "www.github.com";
    return allowed ? url.href : "";
  };

  CV.safeAsset = function (value) {
    return typeof value === "string" && /^assets\/evidence\/[A-Za-z0-9._-]+$/.test(value) ? value : "";
  };

  CV.visibleEvidence = function (projectId) {
    return (CV.evidence || []).filter(function (item) {
      return item && item.projectId === projectId && item.approved === true;
    });
  };

  CV.externalLink = function (url, label) {
    const safe = CV.safeLink(url);
    if (!safe) return "";
    const note = CV.esc(CV.i18n.t("common.newTab"));
    return '<a class="text-link" href="' + CV.esc(safe) + '" target="_blank" rel="noopener noreferrer me">' + CV.esc(label) + '<span class="visually-hidden"> (' + note + ")</span></a>";
  };

  CV.evidenceLabel = function (count) {
    if (count === 1) return CV.i18n.t("projects.evidenceOne");
    if (count > 1) return CV.i18n.t("projects.evidenceMany").replace("{n}", String(count));
    return CV.i18n.t("projects.evidenceNone");
  };

  CV.list = function (items) {
    if (!items || !items.length) return "";
    return "<ul>" + items.map(function (item) {
      return "<li>" + CV.text(item) + "</li>";
    }).join("") + "</ul>";
  };
})();
