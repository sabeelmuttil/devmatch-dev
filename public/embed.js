(function () {
  "use strict";

  function findEmbedScript() {
    if (document.currentScript) return document.currentScript;
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      if (s.src && /\/embed\.js(\?|$)/.test(s.src)) return s;
    }
    return null;
  }

  function getBaseUrl(script) {
    var fromAttr = script.getAttribute("data-base");
    if (fromAttr) return fromAttr.replace(/\/$/, "");
    try {
      return new URL(script.src).origin;
    } catch {
      return "https://dailydevmatch.dev";
    }
  }

  function getUsername(script) {
    var fromAttr = script.getAttribute("data-username");
    if (fromAttr && fromAttr.trim()) return fromAttr.trim();
    try {
      var q = new URL(script.src).searchParams.get("username");
      if (q && q.trim()) return q.trim();
    } catch {
      /* ignore */
    }
    return null;
  }

  function insertIframe(script, iframe) {
    var parent = script.parentNode;
    if (!parent) {
      document.body.appendChild(iframe);
      return;
    }
    if (parent.nodeName === "HEAD") {
      document.body.appendChild(iframe);
      return;
    }
    parent.insertBefore(iframe, script.nextSibling);
  }

  function mount() {
    var script = findEmbedScript();
    if (!script) {
      console.warn(
        "[dailydevmatch] embed.js: could not find script tag. Use defer or place the script in the page body.",
      );
      return;
    }

    var username = getUsername(script);
    if (!username) {
      console.warn(
        "[dailydevmatch] embed.js: set data-username on the script tag.",
      );
      return;
    }

    var base = getBaseUrl(script);
    var embedSrc = base + "/embed/" + encodeURIComponent(username);

    var iframe = document.createElement("iframe");
    iframe.src = embedSrc;
    iframe.title = "Tech Identity — dailydevmatch.dev";
    iframe.width = "360";
    iframe.height = "200";
    iframe.loading = "lazy";
    iframe.setAttribute("allow", "fullscreen");
    iframe.setAttribute(
      "style",
      "border:0;max-width:100%;width:360px;height:200px;border-radius:16px;overflow:hidden;display:block;",
    );

    window.addEventListener("message", function (event) {
      if (!event.data || event.data.type !== "devmatch-embed-resize") return;
      try {
        var allowed = new URL(base).origin;
        if (event.origin !== allowed) return;
      } catch {
        return;
      }
      var height = Number(event.data.height);
      if (!height || height < 120) return;
      iframe.style.height = Math.ceil(height) + "px";
    });

    insertIframe(script, iframe);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
