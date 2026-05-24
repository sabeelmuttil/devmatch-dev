(function () {
  "use strict";

  var MOUNTED = "data-dailydevmatch-mounted";

  function findEmbedScript() {
    if (document.currentScript) return document.currentScript;
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      if (s.src && /\/embed\.js(\?|$)/.test(s.src)) return s;
    }
    return null;
  }

  function defaultBase() {
    var script = findEmbedScript();
    if (!script || !script.src) return "https://dailydevmatch.dev";
    try {
      return new URL(script.src).origin;
    } catch {
      return "https://dailydevmatch.dev";
    }
  }

  function resolveBase(script, slot) {
    var fromScript = script && script.getAttribute("data-base");
    if (fromScript) return fromScript.replace(/\/$/, "");
    var fromSlot = slot && slot.getAttribute("data-dailydevmatch-base");
    if (fromSlot) return fromSlot.replace(/\/$/, "");
    return defaultBase();
  }

  function createIframe(base, username) {
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
    return iframe;
  }

  function wireResize(base, iframe) {
    window.addEventListener("message", function (event) {
      if (!event.data || event.data.type !== "devmatch-embed-resize") return;
      if (event.source !== iframe.contentWindow) return;
      try {
        if (event.origin !== new URL(base).origin) return;
      } catch {
        return;
      }
      var height = Number(event.data.height);
      if (!height || height < 120) return;
      iframe.style.height = Math.ceil(height) + "px";
    });
  }

  function mountSlot(slot, script) {
    if (slot.getAttribute(MOUNTED) === "true") return;

    var username =
      slot.getAttribute("data-dailydevmatch-username") ||
      slot.getAttribute("data-username");
    if (!username || !username.trim()) {
      console.warn(
        "[dailydevmatch] embed: missing data-dailydevmatch-username on container.",
      );
      return;
    }
    username = username.trim();

    var base = resolveBase(script, slot);
    var iframe = createIframe(base, username);
    slot.innerHTML = "";
    slot.appendChild(iframe);
    slot.setAttribute(MOUNTED, "true");
    wireResize(base, iframe);
  }

  function mountLegacy(script) {
    if (!script || script.getAttribute(MOUNTED) === "true") return;

    var username = script.getAttribute("data-username");
    if (!username || !username.trim()) {
      console.warn("[dailydevmatch] embed: missing data-username on script.");
      return;
    }
    username = username.trim();

    var base = resolveBase(script, null);
    var iframe = createIframe(base, username);
    wireResize(base, iframe);

    var parent = script.parentNode;
    if (!parent || parent.nodeName === "HEAD") {
      document.body.appendChild(iframe);
    } else {
      parent.insertBefore(iframe, script.nextSibling);
    }
    script.setAttribute(MOUNTED, "true");
  }

  function mount() {
    var script = findEmbedScript();
    var slots = document.querySelectorAll("[data-dailydevmatch-username]");

    if (slots.length > 0) {
      for (var i = 0; i < slots.length; i++) {
        mountSlot(slots[i], script);
      }
      return;
    }

    if (script) {
      mountLegacy(script);
      return;
    }

    console.warn(
      "[dailydevmatch] embed.js: add a container div with data-dailydevmatch-username, then load this script.",
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
