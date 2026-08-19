(function mountViewingDatePickers() {
  const pickers = [
    {
      rootId: "add-movie-viewing-date-picker",
      toggleId: "add-movie-watch-date-toggle",
      fieldId: "add-movie-watch-date-field",
      inputId: "add-movie-watch-date",
      clearId: "add-movie-watch-date-clear",
      toggleClass: "ghost-btn add-movie-watch-date-toggle",
      fieldClass: "add-movie-watch-date",
    },
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

const addMovieWatchDateToggle = document.getElementById("add-movie-watch-date-toggle");
const addMovieWatchDateField = document.getElementById("add-movie-watch-date-field");
const addMovieWatchDate = document.getElementById("add-movie-watch-date");
const addMovieWatchDateClear = document.getElementById("add-movie-watch-date-clear");
const watchConfirmDateToggle = document.getElementById("watch-confirm-date-toggle");
const watchConfirmDateField = document.getElementById("watch-confirm-date-field");
const watchConfirmDate = document.getElementById("watch-confirm-date");
const watchConfirmDateClear = document.getElementById("watch-confirm-date-clear");
