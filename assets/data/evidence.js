(function () {
  const CV = (window.CV = window.CV || {});

  /*
   * Public evidence only. Leave this list empty until a file is approved
   * for this repository. A record is shown only when publicationApproved
   * is the boolean true. The file must already live under assets/images/.
   * Setting publicationApproved to false does not hide a committed file.
   *
   * evidenceId, relatedRecordType, and relatedRecordId are stable strings.
   * title, description, date, contribution, supportedClaim, and altText
   * use { en, id }. type is image, pdf, or document.
   * relatedRecordType is experience, education, organization, volunteering,
   * project, or certification. Do not translate organization names.
   */
  CV.evidence = [];
})();
