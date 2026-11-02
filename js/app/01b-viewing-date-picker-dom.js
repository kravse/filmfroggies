(function mountViewingDatePickers() {
  const pickers = [
    {
      rootId: "watch-confirm-viewing-date-picker",
      toggleId: "watch-confirm-date-toggle",
      fieldId: "watch-confirm-date-field",
      inputId: "watch-confirm-date",
      clearId: "watch-confirm-date-clear",
      toggleClass: "ghost-btn watch-confirm-date-toggle",
      fieldClass: "watch-confirm-date",
    },
  ];
  for (const picker of pickers) {
    const root = document.getElementById(picker.rootId);
    if (root) {
      root.innerHTML = appCardHtml.viewingDatePickerHtml(picker);
    }
  }
})();

const watchConfirmDateToggle = document.getElementById("watch-confirm-date-toggle");
const watchConfirmDateField = document.getElementById("watch-confirm-date-field");
const watchConfirmDate = document.getElementById("watch-confirm-date");
const watchConfirmDateClear = document.getElementById("watch-confirm-date-clear");
