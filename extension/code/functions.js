// functions.js:
// Functions that return the same value regardless of the environment
// in which they are called (in order to make them testable).
// So for instance, access to the user's bookmarks is forbidden.
function escapeHtml(unsafe) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}