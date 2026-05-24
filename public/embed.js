(function () {
  var script = document.currentScript;
  if (!script) return;

  var username = script.getAttribute("data-username");
  if (!username) {
    console.warn("[dailydevmatch] embed.js: missing data-username");
    return;
  }

  var base =
    script.getAttribute("data-base") ||
    (function () {
      var src = script.src || "";
      try {
        return new URL(src).origin;
      } catch {
        return "https://dailydevmatch.dev";
      }
    })();

  var src =
    base.replace(/\/$/, "") + "/embed/" + encodeURIComponent(username);

  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "Tech Identity — dailydevmatch.dev";
  iframe.width = "360";
  iframe.height = "200";
  iframe.loading = "lazy";
  iframe.setAttribute(
    "style",
    "border:0;max-width:100%;width:360px;height:200px;border-radius:16px;overflow:hidden;display:block;",
  );

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.type !== "devmatch-embed-resize" || !data.height) return;
    iframe.style.height = Math.max(120, data.height) + "px";
  });

  if (script.parentNode) {
    script.parentNode.insertBefore(iframe, script.nextSibling);
  }
})();
