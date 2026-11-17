(function () {
  const CV = (window.CV = window.CV || {});
  CV.render = CV.render || {};

  function evidenceKind(item) {
    if (item.type === "image" || item.type === "pdf" || item.type === "document") return item.type;
    const filePath = String(item.filePath || item.image || "");
    if (/\.pdf$/i.test(filePath)) return "pdf";
    if (/\.(?:jpg|jpeg|png|webp)$/i.test(filePath)) return "image";
    return "document";
  }

  function typeLabel(item) {
    if (item.type && typeof item.type === "object") return CV.tx(item.type);
    return CV.i18n.t("evidence.type." + evidenceKind(item));
  }

  function altText(item) {
    return CV.text(item.altText) || CV.text(item.title) || CV.esc(typeLabel(item));
  }

  function labeled(labelKey, value) {
    if (value == null || value === "" || (typeof value === "object" && !CV.tx(value))) return "";
    return "<p><strong>" + CV.esc(CV.i18n.t(labelKey)) + "</strong> " + CV.text(value) + "</p>";
  }

  function statusLine(item) {
    if (item.verificationStatus === "self-reported") return CV.i18n.t("evidence.status.selfReported");
    if (item.verificationStatus === "verified") return CV.i18n.t("evidence.status.verified");
    return "";
  }

  function thumbnail(item) {
    const thumb = CV.safeImage(item.thumbnailPath);
    if (thumb) return thumb;
    if (evidenceKind(item) === "pdf") return "";
    return CV.safeImage(item.filePath) || CV.safeImage(item.image);
  }

  function media(item) {
    const source = thumbnail(item);
    if (!source) return '<div class="evidence-fallback" aria-hidden="true">' + CV.icon("document", 28) + "</div>";
    return '<div class="evidence-media"><img src="' + CV.esc(source) + '" alt="' + altText(item) + '" width="640" height="360" decoding="async" data-fallback="evidence"></div>';
  }

  function fileAction(item) {
    const filePath = CV.safeAsset(item.filePath) || CV.safeAsset(item.image);
    if (!filePath) return "";
    const kind = evidenceKind(item);
    const key = kind === "pdf" ? "evidence.openPdf" : "evidence.openImage";
    if (kind === "pdf" || kind === "image") {
      const note = CV.esc(CV.i18n.t("common.newTab"));
      return '<p><a class="text-link" href="' + CV.esc(filePath) + '" target="_blank" rel="noopener noreferrer">' + CV.esc(CV.i18n.t(key)) + '<span class="visually-hidden"> (' + note + ")</span></a></p>";
    }
    return "";
  }

  CV.render.evidenceCard = function (item) {
    const id = item.evidenceId || item.id;
    const date = CV.tx(item.date);
    const eyebrow = CV.esc(typeLabel(item)) + (date ? " · " + CV.text(item.date) : "");
    const claim = item.supportedClaim != null && item.supportedClaim !== "" ? item.supportedClaim : item.demonstrates;
    return '<article class="evidence-card">' + media(item) + '<div class="evidence-copy"><p class="eyebrow">' + eyebrow + "</p><h3>" + CV.text(item.title) + "</h3>" + (item.description ? "<p>" + CV.text(item.description) + "</p>" : "") + labeled("evidence.contribution", item.contribution) + labeled("evidence.supports", claim) + '<button type="button" class="text-button" data-open-evidence="' + CV.esc(id) + '">' + CV.esc(CV.i18n.t("evidence.view")) + "</button></div></article>";
  };

  CV.render.evidenceCards = function (items, options) {
    const list = items || [];
    if (!list.length) {
      const prominent = options && options.prominent;
      const className = prominent ? "empty" : "evidence-note";
      const key = prominent ? "case.evidenceEmpty" : "evidence.empty";
      return '<p class="' + className + '">' + CV.esc(CV.i18n.t(key)) + "</p>";
    }
    const grid = options && options.prominent ? "evidence-grid" : "evidence-grid evidence-stack";
    return '<div class="' + grid + '">' + list.map(CV.render.evidenceCard).join("") + "</div>";
  };

  CV.render.evidenceBlock = function (record, recordType) {
    const items = CV.evidenceForRecord(record, recordType);
    return '<div class="evidence-block"><h4>' + CV.esc(CV.i18n.t("evidence.title")) + "</h4>" + CV.render.evidenceCards(items) + "</div>";
  };

  CV.render.evidenceDialog = function (evidenceId) {
    const item = CV.findEvidence(evidenceId);
    if (!item) return "";
    const kind = evidenceKind(item);
    const filePath = CV.safeImage(item.filePath) || CV.safeImage(item.image);
    const date = CV.tx(item.date);
    const claim = item.supportedClaim != null && item.supportedClaim !== "" ? item.supportedClaim : item.demonstrates;
    const status = statusLine(item);
    let figure = '<div class="evidence-fallback evidence-figure" aria-hidden="true">' + CV.icon("document", 36) + "</div>";
    if (kind === "image" && filePath) {
      figure = '<figure class="evidence-figure"><img src="' + CV.esc(filePath) + '" alt="' + altText(item) + '" data-fallback="evidence"></figure>';
    }
    const closeLabel = CV.esc(CV.i18n.t("evidence.close"));
    return '<div class="evidence-layer" id="evidence-dialog"><button type="button" class="evidence-backdrop" data-close-evidence><span class="visually-hidden">' + closeLabel + '</span></button><div class="evidence-dialog" role="dialog" aria-modal="false" aria-label="' + CV.esc(CV.i18n.t("evidence.dialog")) + '" aria-labelledby="evidence-dialog-title"><article><div class="evidence-dialog-head"><div><p class="eyebrow">' + CV.esc(typeLabel(item)) + (date ? " · " + CV.text(item.date) : "") + '</p><h2 id="evidence-dialog-title">' + CV.text(item.title) + '</h2></div><button type="button" class="text-button" data-close-evidence data-evidence-dismiss>' + closeLabel + '</button></div>' + figure + (item.description ? "<p>" + CV.text(item.description) + "</p>" : "") + labeled("evidence.contribution", item.contribution) + labeled("evidence.supports", claim) + (status ? '<p class="fine-print">' + CV.esc(status) + "</p>" : "") + fileAction(item) + "</article></div></div>";
  };
})();
