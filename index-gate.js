/* ==================================================================
   INDEX-GATE.JS - GATE FOR WHOLE APP - CONNECTS signup.html <-> index.html
   File: index-gate.js
   Put in BOTH files before </body>:
   <script src="index-gate.js"></script>
   signup.html saves: localStorage konnekt_signup_progress = { loggedIn: true, step: "main" }
   index.html checks that. If no signup -> go signup.html. If signup done -> stay index.html.
   signup.html checks that. If signup done -> return index.html. If no signup -> stay signup.html.
   First Splash: cannot copy text or image.
   Sidebar-section: hidden first, show only after gate passes.
   PWA: after 30s in index.html only, show slide up, only if not installed.
   No backend now - localStorage fakes backend. Backend later will replace loadProgress().
   ================================================================== */

(function () {
  "use strict";

  /* ================= 0. HELPERS ================= */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // What page are we on? index.html or signup.html?
  // FILE NAME IS signup.html - as it is here. No sign-up.html.
  const currentPage = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
  const isIndexPage = currentPage === "" || currentPage === "index.html" || currentPage === "index.htm";
  const isSignupPage = currentPage === "signup.html" || currentPage === "sign.html" || currentPage === "sign-up.html";

  /* ================= 1. NO STRETCHING / ZOOMING - FOR ALL ================= */
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturechange", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gestureend", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("wheel", function (e) {
    if (e.ctrlKey) { e.preventDefault(); }
  }, { passive: false });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && ["+", "-", "0", "=", "_"].includes(e.key)) {
      e.preventDefault();
    }
  });
  let lastTouchEnd = 0;
  document.addEventListener("touchend", function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) { e.preventDefault(); }
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });

  /* ================= 2. FIRST SPLASH + ALL IMAGES - CANNOT COPY - FIX 5 ================= */
  // Works for BOTH: #indexFirstSplash in index.html + #firstSplash in signup.html
  // FIX 5: No image can be copied - iPhone long-press / Android long-press / right-click / drag / copy all blocked
  function lockSplash(splashId) {
    const splash = $(splashId);
    if (!splash) return;
    splash.style.userSelect = "none";
    splash.style.webkitUserSelect = "none";
    splash.style.webkitTouchCallout = "none"; // No iPhone long-press menu
    splash.style.webkitTapHighlightColor = "transparent";
    splash.style.touchAction = "none";
    splash.querySelectorAll("*").forEach(function (el) {
      el.style.userSelect = "none";
      el.style.webkitUserSelect = "none";
      el.style.webkitTouchCallout = "none";
      el.style.webkitTapHighlightColor = "transparent";
      if (el.tagName === "IMG") {
        el.draggable = false;
        el.style.pointerEvents = "none"; // Image cannot be touched / dragged
        el.style.webkitUserDrag = "none";
        el.setAttribute("oncontextmenu", "return false");
      }
    });
    ["copy", "cut", "paste"].forEach(function (type) {
      splash.addEventListener(type, function (e) { e.preventDefault(); return false; });
    });
    splash.addEventListener("selectstart", function (e) { e.preventDefault(); return false; });
    splash.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
    splash.addEventListener("dragstart", function (e) { e.preventDefault(); return false; });
    let splashTouchTimer = null;
    splash.addEventListener("touchstart", function () {
      splashTouchTimer = setTimeout(function () {
        if (window.getSelection) window.getSelection().removeAllRanges();
      }, 400);
    }, { passive: true });
    splash.addEventListener("touchend", function () {
      if (splashTouchTimer) clearTimeout(splashTouchTimer);
      if (window.getSelection) window.getSelection().removeAllRanges();
    }, { passive: true });
    splash.addEventListener("touchmove", function () {
      if (splashTouchTimer) clearTimeout(splashTouchTimer);
    }, { passive: true });
    splash.addEventListener("mousedown", function (e) { e.preventDefault(); });
  }

  function lockAllSplashes() {
    lockSplash("indexFirstSplash"); // index.html splash - FIX 2: shows FIRST
    lockSplash("firstSplash"); // signup.html splash
  }

  // FIX 5: Global - any image, any page, no copy menu
  document.addEventListener("contextmenu", function (e) {
    if (e.target && (e.target.tagName === "IMG" || e.target.closest(".no-copy"))) { e.preventDefault(); return false; }
  });
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") { e.preventDefault(); return false; }
  });
  document.addEventListener("copy", function (e) {
    const sel = window.getSelection();
    if (sel && sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest(".no-copy")) {
      e.preventDefault();
    }
  });

  function fixImagesNoStretch() {
    document.querySelectorAll("img").forEach(function (img) {
      img.draggable = false;
      img.style.userSelect = "none";
      img.style.webkitUserDrag = "none";
      img.style.webkitTouchCallout = "none";
      // Logo / splash / PWA / profile logo - contain, no stretch, no crop
      // FIX 2: Profile logo in index.html fixed here too
      if (
        img.classList.contains("index-splash-image") ||
        img.classList.contains("pwa-icon") ||
        img.classList.contains("konnekt-image") ||
        img.classList.contains("konnekt-image-small") ||
        img.classList.contains("profile-logo") ||
        img.classList.contains("app-logo") ||
        img.classList.contains("no-copy-img")
      ) {
        img.style.objectFit = "contain";
        img.style.objectPosition = "center";
        img.style.pointerEvents = "none"; // FIX 5: viewing only
      }
    });
  }
  fixImagesNoStretch();
  const imgObserver = new MutationObserver(fixImagesNoStretch);
  if (document.body) imgObserver.observe(document.body, { childList: true, subtree: true });

  /* ================= 3. SIDEBAR + MAIN APP - HIDDEN FIRST - index.html ONLY ================= */
  function hideGate() {
    document.body.classList.remove("gate-passed");
    $$(".sidebar-section").forEach(function (el) {
      el.style.display = "none";
      el.style.visibility = "hidden";
    });
    const main = $("mainApp");
    if (main) {
      main.style.display = "none";
      main.style.visibility = "hidden";
    }
  }
  function showGate() {
    document.body.classList.add("gate-passed");
    $$(".sidebar-section").forEach(function (el) {
      el.style.display = "";
      el.style.visibility = "";
    });
    const main = $("mainApp");
    if (main) {
      main.style.display = "";
      main.style.visibility = "";
    }
  }

  /* ================= 4. CHECK SIGNUP - CONNECT signup.html <-> index.html ================= */
  const PROGRESS_KEY = "konnekt_signup_progress";
  const PWA_NOTNOW_KEY = "konnekt_pwa_notnow";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null"); } catch (e) { return null; }
  }
  function saveProgress(data) {
    try {
      const old = loadProgress() || {};
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...old, ...data }));
    } catch (e) {}
  }
  function hasFinishedSignup() {
    const p = loadProgress();
    // Must be loggedIn = true + step = main
    // If OTP not verified, or step not main, or loggedIn false -> not finished
    if (!p) return false;
    if (p.loggedIn !== true) return false;
    if (p.step !== "main") return false;
    return true;
  }

  /* ================= 5. PWA - index.html ONLY ================= */
  function isInstalled() {
    if (window.navigator.standalone === true) return true;
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
    return false;
  }
  function wasNotNowRecently() {
    try {
      const t = parseInt(localStorage.getItem(PWA_NOTNOW_KEY) || "0", 10);
      if (!t) return false;
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      return (Date.now() - t) < twoDays;
    } catch (e) { return false; }
  }
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hidePwa();
  });
  function showPwa() {
    // PWA only in index.html, never in signup.html
    if (!isIndexPage) return;
    const overlay = $("pwaOverlay");
    if (!overlay) return;
    if (isInstalled()) return;
    if (wasNotNowRecently()) return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const iphoneSteps = $("pwaIphoneSteps");
    const androidSteps = $("pwaAndroidSteps");
    if (iphoneSteps) iphoneSteps.hidden = !isIOS;
    if (androidSteps) androidSteps.hidden = isIOS;
    overlay.hidden = false;
    const installBtn = $("pwaInstallBtn");
    if (installBtn) installBtn.focus();
  }
  function hidePwa() {
    const overlay = $("pwaOverlay");
    if (overlay) overlay.hidden = true;
  }
  if ($("pwaInstallBtn")) $("pwaInstallBtn").addEventListener("click", function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === "accepted") hidePwa();
        deferredPrompt = null;
      });
      return;
    }
    if (isInstalled()) hidePwa();
  });
  if ($("pwaNotNowBtn")) $("pwaNotNowBtn").addEventListener("click", function () {
    try { localStorage.setItem(PWA_NOTNOW_KEY, String(Date.now())); } catch (e) {}
    hidePwa();
  });
  if ($("pwaOverlay")) $("pwaOverlay").addEventListener("click", function (e) {
    if (e.target === this) {
      try { localStorage.setItem(PWA_NOTNOW_KEY, String(Date.now())); } catch (e2) {}
      hidePwa();
    }
  });
  let pwaTouchY = 0;
  const pwaSheet = $("pwaSheet");
  if (pwaSheet) {
    pwaSheet.addEventListener("touchstart", function (e) { pwaTouchY = e.touches[0].clientY; }, { passive: true });
    pwaSheet.addEventListener("touchend", function (e) {
      const dy = e.changedTouches[0].clientY - pwaTouchY;
      if (dy > 80) {
        try { localStorage.setItem(PWA_NOTNOW_KEY, String(Date.now())); } catch (err) {}
        hidePwa();
      }
    }, { passive: true });
  }

  /* ================= 6. GATE - CONNECTED FLOW - FIX 2 ================= */
  let pwaTimer = null;
  let gateStarted = false;
  function startGate() {
    if (gateStarted) return;
    gateStarted = true;
    lockAllSplashes();
    fixImagesNoStretch();

    // ----- CASE A: WE ARE IN index.html - FIX 2 -----
    if (isIndexPage) {
      hideGate(); // Hide sidebar + main app first - no flash
      hidePwa(); // Hide PWA first - shows only after 30s
      const splash = $("indexFirstSplash");
      if (splash) {
        splash.hidden = false;
        splash.style.display = "flex";
        lockSplash("indexFirstSplash");
      }
      // Splash 1.5s, then check signup - index gate shows FIRST before anything
      setTimeout(function () {
        // If user have NOT signup -> take them to signup.html
        if (!hasFinishedSignup()) {
          window.location.href = "signup.html";
          return;
        }
        // If user HAVE signup already -> stay in index.html, show main app
        // No signup splash again - only index gate splash, then main app
        if (splash) {
          splash.style.display = "none";
          splash.hidden = true;
        }
        showGate(); // Adds gate-passed -> sidebar + main app show
        // PWA: wait 30s after landing, then show slide up
        clearTimeout(pwaTimer);
        pwaTimer = setTimeout(function () {
          showPwa();
        }, 30000); // 30 seconds
      }, 1500);
      return;
    }

    // ----- CASE B: WE ARE IN signup.html -----
    if (isSignupPage) {
      // If user HAVE signup already -> return to index.html, don't show signup again
      // FIX 2: After signup, no signup splash again
      if (hasFinishedSignup()) {
        window.location.href = "index.html";
        return;
      }
      // If user have NOT signup -> stay in signup.html, let signup flow run
      // signup flow is in signup.js / sign-up.js - this gate does NOT block it, it just lets it run
      const splash2 = $("firstSplash");
      if (splash2) lockSplash("firstSplash");
      return;
    }

    // ----- CASE C: Other page - do nothing, don't block -----
  }

  /* ================= 7. EXPOSE ================= */
  window.KonnektGate = {
    hasFinishedSignup: hasFinishedSignup,
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    isInstalled: isInstalled,
    showPwa: showPwa,
    hidePwa: hidePwa,
    showGate: showGate,
    hideGate: hideGate,
    isIndexPage: isIndexPage,
    isSignupPage: isSignupPage
  };
  // Also expose for signup flow - signup.html uses same key
  window.KonnektSignup = { saveProgress: saveProgress, loadProgress: loadProgress };

  /* ================= 8. START ================= */
  lockAllSplashes();
  if (isIndexPage) hideGate(); // Hide sidebar immediately, no flash
  document.addEventListener("DOMContentLoaded", startGate);
  if (document.readyState !== "loading") startGate();
})();