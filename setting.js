/* ============================================================
   SETTINGS - JS - FULL - CLEAN - NO CUT
   - Every background = new background, slide from right
   - Chevron back = go back to previous background
   - Save = rolls circle, frontend send, backend save, only wetin change
   - QR generate once, save Local Storage, Reset = new QR, old link expire
   - Scanner = camera open to scan code
   - Profile UI = whole #pageProfile, NOT top bar only
   - Desktop: profile take over Settings Right
   - Mobile: profile take over Settings Left, swipe down = back
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- HELPERS ---------- */
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const show = (el) => { if (el) el.hidden = false; };
  const hide = (el) => { if (el) el.hidden = true; };
  const byId = (id) => document.getElementById(id);

  /* ---------- POPUP STACK - CHEVRON BACK ---------- */
  // Stack = list of open backgrounds. Chevron go pop last one.
  const stack = [];
  function openPopup(id) {
    const el = byId(id);
    if (!el) return;
    // Hide current top, push new one
    if (stack.length) hide(byId(stack[stack.length - 1]));
    stack.push(id);
    show(el);
    el.scrollTop = 0;
    if (window.lucide) lucide.createIcons();
  }
  function closePopup(id) {
    const el = byId(id);
    if (!el) return;
    hide(el);
    const i = stack.indexOf(id);
    if (i > -1) stack.splice(i, 1);
    // Show previous background
    if (stack.length) show(byId(stack[stack.length - 1]));
  }
  function closeTop() {
    if (!stack.length) return;
    closePopup(stack[stack.length - 1]);
  }
  // Chevron - data-close = id to close
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-close]");
    if (btn) {
      e.preventDefault();
      // Scanner - stop camera first
      if (btn.dataset.close === "scannerBg") stopScanner();
      closePopup(btn.dataset.close);
    }
  });

  /* ---------- SAVE - ROLLS CIRCLE - FRONTEND SEND BACKEND ---------- */
  // Only backgrounds wey get change get Save. Click Save = spinner roll, send only wetin change.
  async function doSave(btn, payload) {
    if (!btn) return;
    const spin = btn.querySelector(".save-spinner");
    if (spin) spin.hidden = false;
    btn.disabled = true;
    try {
      // TODO BACKEND: replace with real fetch
      // await fetch("/api/settings/save", { method:"POST", body: JSON.stringify(payload) });
      await new Promise(r => setTimeout(r, 900)); // fake backend delay
      console.log("SAVE TO BACKEND:", payload);
    } finally {
      if (spin) spin.hidden = true;
      btn.disabled = false;
    }
  }
  // Any .popup-save-btn + .settings-save-btn
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".popup-save-btn, .settings-save-btn");
    if (!btn) return;
    const key = btn.dataset.save || "settings";
    // Collect only changed values for this background
    const payload = { type: key, changed: window.__konnektChanged?.[key] || {} };
    doSave(btn, payload).then(() => { window.__konnektChanged = window.__konnektChanged || {}; window.__konnektChanged[key] = {}; });
  });
  // Mark change - call this when user change anything
  window.__konnektChanged = {};
  function markChanged(group, field, value) {
    window.__konnektChanged[group] = window.__konnektChanged[group] || {};
    window.__konnektChanged[group][field] = value;
  }

  /* ---------- SETTINGS LEFT - OPEN BACKGROUNDS ---------- */
  const openMap = {
    openAccount: "accountBg",
    openChats: "chatsBg",
    openNotifications: "notificationsBg",
    openAppearance: "appearanceBg",
    openPrivacy: "privacyBg",
    openHelp: "helpBg",
    openLogout: "logoutBg",
    openInvite: "inviteBg",
    openFullQR: "fullQRBg",
  };
  Object.entries(openMap).forEach(([btnId, popupId]) => {
    const b = byId(btnId);
    if (b) b.addEventListener("click", () => openPopup(popupId));
  });

  /* ---------- PROFILE - SHOW WHOLE #pageProfile IN SETTINGS ---------- */
  // DO NOT create new profile. Show existing one.
  // .edit-section-profile na top bar only, so we show whole #pageProfile:
  // top bar + #editBackground + Preview + Mood + Full Image viewer.
  // Desktop: profile take over Settings Right, X go bring back Settings Right.
  // Mobile: profile take over Settings Left, X / swipe down go bring back Settings Left.
  const pageProfile = byId("pageProfile");
  const settingsRight = $(".settings-page-right");
  const settingsLeftEl = $(".settings-page-left");

  function isMobileProfile() { return window.innerWidth <= 768; }

  // Create Cancel (X) if HTML no get am - CSS already get .cancel-button
  function ensureCancelBtn() {
    if (!pageProfile) return null;
    let btn = pageProfile.querySelector(".cancel-button");
    if (btn) return btn;
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cancel-button";
    btn.id = "cancelProfileBtn";
    btn.setAttribute("aria-label", "Back to Settings");
    btn.innerHTML = '<i data-lucide="x" class="edit-section-cancel"></i>';
    const topBar = pageProfile.querySelector(".edit-section-profile");
    if (topBar) topBar.prepend(btn);
    return btn;
  }

  function openProfileInSettings() {
  if (!pageProfile) { console.log("pageProfile NO DEY for this page"); openPopup("accountBg"); return; }
  while (stack.length) closePopup(stack[stack.length - 1]);
  ensureCancelBtn();
  // FORCE SHOW - remove hidden from parent + children
  pageProfile.hidden = false;
  pageProfile.removeAttribute("hidden");
  pageProfile.style.display = "block";
  const topBar = pageProfile.querySelector(".edit-section-profile");
  if (topBar) { topBar.hidden = false; topBar.removeAttribute("hidden"); topBar.style.display = "flex"; }
  const body = pageProfile.querySelector("#editBackground");
  if (body) { body.hidden = false; body.removeAttribute("hidden"); body.style.display = "block"; }

  pageProfile.classList.add("profile-in-settings");
  pageProfile.classList.toggle("profile-in-settings-mobile", isMobileProfile());
  if (isMobileProfile()) { if (settingsLeftEl) settingsLeftEl.style.display = "none"; }
  else { if (settingsRight) settingsRight.style.visibility = "hidden"; }
  document.body.style.overflow = "hidden";
  console.log("PROFILE OPEN - check if you see am now");
  if (window.lucide) lucide.createIcons();
}

  function closeProfileInSettings() {
    if (!pageProfile) return;
    pageProfile.hidden = true;
    pageProfile.classList.remove("profile-in-settings", "profile-in-settings-mobile");
    // Bring back wetin we hide
    if (settingsLeftEl) settingsLeftEl.style.display = "";
    if (settingsRight) settingsRight.style.visibility = "";
    document.body.style.overflow = "";
  }

  // Click profile border for Settings Left -> open profile
  const openProfileBtn = byId("openProfile");
  if (openProfileBtn) openProfileBtn.addEventListener("click", openProfileInSettings);

  // Click X (Cancel) inside profile top bar -> back to Settings
  document.addEventListener("click", (e) => {
    const cancel = e.target.closest(".cancel-button, #cancelProfileBtn");
    if (cancel && pageProfile && !pageProfile.hidden) {
      e.preventDefault();
      closeProfileInSettings();
    }
  });

  // Mobile: swipe down on profile top bar = bring back Settings Left
  let profileTouchY = null;
  if (pageProfile) {
    pageProfile.addEventListener("touchstart", (e) => { profileTouchY = e.touches[0].clientY; }, { passive: true });
    pageProfile.addEventListener("touchend", (e) => {
      if (profileTouchY === null) return;
      const dy = e.changedTouches[0].clientY - profileTouchY;
      // Swipe down more than 80px, from top area, and na mobile
      if (isMobileProfile() && dy > 80 && e.changedTouches[0].clientY < 220) closeProfileInSettings();
      profileTouchY = null;
    }, { passive: true });
  }

  // If user resize from mobile to desktop while profile open, fix am
  window.addEventListener("resize", () => {
    if (!pageProfile || pageProfile.hidden) return;
    pageProfile.classList.toggle("profile-in-settings-mobile", isMobileProfile());
    if (isMobileProfile()) { if (settingsLeftEl) settingsLeftEl.style.display = "none"; if (settingsRight) settingsRight.style.visibility = ""; }
    else { if (settingsLeftEl) settingsLeftEl.style.display = ""; if (settingsRight) settingsRight.style.visibility = "hidden"; }
  });

  /* ---------- QR - GENERATE ONCE, SAVE LOCAL STORAGE ---------- */
  // Link = https://yourapp.com/u/username?id=xxx&k=token
  function makeToken(len = 24) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function getOrCreateQR() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("konnekt_qr") || "null"); } catch { saved = null; }
    if (!saved) {
      saved = { username: "Faith_mike", id: "234567", k: makeToken() };
      localStorage.setItem("konnekt_qr", JSON.stringify(saved));
    }
    return saved;
  }
  function qrLink() {
    const q = getOrCreateQR();
    return `https://yourapp.com/u/${q.username}?id=${q.id}&k=${q.k}`;
  }
  function renderQR() {
    const link = qrLink();
    // Use QR API image - backend later go generate real QR
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`;
    const small = byId("qrImageSmall");
    const big = byId("qrImageBig");
    if (small) small.src = url;
    if (big) big.src = url;
    const linkEl = $(".qr-share-link");
    if (linkEl) linkEl.textContent = link;
  }
  renderQR();

  /* QR - Share sheet + Copy Link */
  const qrShareBtn = byId("qrShareBtn");
  if (qrShareBtn) qrShareBtn.addEventListener("click", () => {
    const sheet = byId("qrShareSheet");
    if (sheet) sheet.hidden = !sheet.hidden;
  });
  const copyBtn = $(".qr-copy-link-btn");
  if (copyBtn) copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(qrLink()); copyBtn.textContent = "Copied!"; setTimeout(() => copyBtn.textContent = "Copy Link", 1200); } catch {}
  });

  /* ---------- SCANNER - CAMERA OPEN TO SCAN CODE ---------- */
  let scannerStream = null;
  async function startScanner() {
    openPopup("scannerBg");
    const video = byId("scannerVideo") || $(".scanner-area video");
    // If HTML no get video tag, create one inside .scanner-area
    let v = video;
    if (!v) {
      const area = $(".scanner-area");
      if (area) { v = document.createElement("video"); v.id = "scannerVideo"; v.autoplay = true; v.playsInline = true; area.prepend(v); }
    }
    try {
      scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (v) v.srcObject = scannerStream;
    } catch (err) {
      console.log("Camera no open:", err);
      alert("Camera no open. Allow camera permission or use Pick from Gallery.");
    }
  }
  function stopScanner() {
    if (scannerStream) { scannerStream.getTracks().forEach(t => t.stop()); scannerStream = null; }
  }
  const openScannerBtn = byId("openScanner");
  if (openScannerBtn) openScannerBtn.addEventListener("click", startScanner);
  // Pick from Gallery - scan QR from image
  const galleryBtn = $(".scanner-gallery-btn");
  if (galleryBtn) galleryBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => { alert("Image picked. Backend go decode QR from image."); };
    input.click();
  });

  /* ---------- ACCOUNT - OPEN SUB BACKGROUNDS ---------- */
  const accountMap = {
    openEmail: "emailBg",
    openPassword: "passwordBg",
    openChangePhone: "changePhoneBg",
    openChangeCampus: "changeCampusBg",
    openDeleteAccount: "deleteAccountBg",
  };
  Object.entries(accountMap).forEach(([btnId, popupId]) => {
    const b = byId(btnId);
    if (b) b.addEventListener("click", () => openPopup(popupId));
  });

  /* ---------- EMAIL - CHANGE EMAIL = NEW ACCOUNT + TOKEN ---------- */
  const openChangeEmailPopup = byId("openChangeEmailPopup");
  if (openChangeEmailPopup) openChangeEmailPopup.addEventListener("click", () => show(byId("changeEmailPopup")));
  const continueChangeEmail = byId("continueChangeEmail");
  if (continueChangeEmail) continueChangeEmail.addEventListener("click", () => {
    hide(byId("changeEmailPopup"));
    openPopup("changeEmailNewBg");
  });
  const confirmNewEmail = byId("confirmNewEmail");
  if (confirmNewEmail) confirmNewEmail.addEventListener("click", () => {
    const email = byId("newEmailInput")?.value.trim();
    if (!email) return alert("Type new email");
    // Token so app know say na same person with 2 accounts
    const token = makeToken(32);
    localStorage.setItem("konnekt_switch_token", token);
    console.log("NEW EMAIL + TOKEN FOR BACKEND:", { email, token });
    alert("New email saved. Go normal signup process. You fit switch account later.");
    show(byId("switchAccountBtn"));
    closePopup("changeEmailNewBg");
    closePopup("emailBg");
  });
  const switchBtn = byId("switchAccountBtn");
  if (switchBtn) switchBtn.addEventListener("click", () => alert("Switch Account - show list of your accounts to switch."));

  /* ---------- PASSWORD - EMAIL + OTP + NEW PASSWORD ---------- */
  const sendOtpBtn = byId("sendOtpBtn");
  if (sendOtpBtn) sendOtpBtn.addEventListener("click", () => {
    const email = byId("resetEmailInput")?.value.trim();
    if (!email) return alert("Type your email");
    console.log("SEND OTP TO BACKEND:", email);
    alert("OTP sent to " + email);
  });
  const confirmOtpBtn = byId("confirmOtpBtn");
  if (confirmOtpBtn) confirmOtpBtn.addEventListener("click", () => {
    const otp = byId("otpInput")?.value.trim();
    if (!otp) return alert("Type OTP");
    console.log("CONFIRM OTP BACKEND:", otp);
    show(byId("resetPasswordArea"));
  });
  const confirmNewPassword = byId("confirmNewPassword");
  if (confirmNewPassword) confirmNewPassword.addEventListener("click", () => {
    const a = byId("newPasswordInput")?.value;
    const b = byId("confirmPasswordInput")?.value;
    if (!a || a !== b) return alert("Passwords no match");
    markChanged("password", "password", "changed");
    console.log("NEW PASSWORD FOR BACKEND - send on Save");
    alert("Password ready. Click Save for top right to save.");
  });

  /* ---------- CHANGE PHONE - PASSWORD CONFIRM ---------- */
  const changePhoneBtn = byId("changePhoneBtn");
  if (changePhoneBtn) changePhoneBtn.addEventListener("click", () => {
    if (!byId("newPhoneInput")?.value.trim()) return alert("Type new phone number");
    show(byId("confirmPhonePasswordPopup"));
  });
  const confirmPhonePasswordBtn = byId("confirmPhonePasswordBtn");
  if (confirmPhonePasswordBtn) confirmPhonePasswordBtn.addEventListener("click", () => {
    const pw = byId("phoneConfirmPassword")?.value;
    if (!pw) return alert("Type password to confirm");
    markChanged("phone", "phone", byId("newPhoneInput").value);
    alert("Phone ready. Click Save for top right to save.");
  });

  /* ---------- CHANGE CAMPUS - 30 DAYS / TWICE RULE ---------- */
  // Campus list - 30 campus - JS go load full list
  const campusList = byId("campusPickerList");
  if (campusList) {
    campusList.innerHTML = "";
    for (let i = 1; i <= 30; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "campus-item"; b.textContent = "Campus " + i;
      b.addEventListener("click", () => {
        $$(".campus-item", campusList).forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        const custom = byId("customCampusInput"); if (custom) custom.value = b.textContent;
        markChanged("campus", "campus", b.textContent);
      });
      campusList.appendChild(b);
    }
  }
  const confirmCampusBtn = byId("confirmCampusBtn");
  if (confirmCampusBtn) confirmCampusBtn.addEventListener("click", () => {
    const custom = byId("customCampusInput")?.value.trim();
    const selected = $(".campus-item.selected")?.textContent;
    const campus = custom || selected;
    if (!campus) return alert("Pick campus or type campus name");
    // 30 days / twice rule - check Local Storage
    const data = JSON.parse(localStorage.getItem("konnekt_campus") || '{"count":0,"last":0}');
    const now = Date.now();
    const days = (now - data.last) / (1000 * 60 * 60 * 24);
    if (data.count >= 2 && days < 30) return alert("You don change campus twice. Wait next 30 days.");
    if (days < 30 && data.last !== 0) return alert("You fit change campus only every 30 days.");
    data.count = data.count >= 2 ? 1 : data.count + 1;
    data.last = now; data.campus = campus;
    localStorage.setItem("konnekt_campus", JSON.stringify(data));
    markChanged("campus", "campus", campus);
    alert("Campus ready: " + campus + ". Click Save for top right to save.");
  });

  /* ---------- DELETE ACCOUNT ---------- */
  const deleteAccountBtn = byId("deleteAccountBtn");
  if (deleteAccountBtn) deleteAccountBtn.addEventListener("click", () => {
    if (!confirm("If you delete account you will lose all messages and everything. Continue?")) return;
    console.log("DELETE ACCOUNT - BACKEND");
    localStorage.clear();
    alert("Account deleted. You fit signup back later.");
    window.location.reload();
  });

  /* ---------- PRIVACY - MOMENTS / PIC / ABOUT / GROUPS ---------- */
  const privacyMap = {
    openMoments: "momentsBg",
    openProfilePicPrivacy: "profilePicPrivacyBg",
    openAboutPrivacy: "aboutPrivacyBg",
    openGroupsPrivacy: "groupsPrivacyBg",
  };
  Object.entries(privacyMap).forEach(([btnId, popupId]) => {
    const b = byId(btnId);
    if (b) b.addEventListener("click", () => openPopup(popupId));
  });
  // Audience pick - Everyone / Contact / Nobody
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".audience-item");
    if (!item) return;
    const list = item.closest(".audience-list");
    if (list) $$(".audience-item", list).forEach(x => x.classList.remove("selected"));
    item.classList.add("selected");
    const popup = item.closest(".popup-bg");
    const key = popup?.id || "privacy";
    markChanged(key, "audience", item.dataset.value);
  });

  /* ---------- CHATS - SAVE IMAGES / DELETE / CLEAR ---------- */
  const saveImagesToggle = byId("saveImagesToggle");
  if (saveImagesToggle) saveImagesToggle.addEventListener("click", () => {
    const on = saveImagesToggle.textContent.trim() === "Off";
    saveImagesToggle.textContent = on ? "On" : "Off";
    saveImagesToggle.classList.toggle("on", on);
    markChanged("chats", "saveImages", on);
  });
  const deleteChatsBtn = byId("deleteChatsBtn");
  if (deleteChatsBtn) deleteChatsBtn.addEventListener("click", () => show(byId("deleteChatsPopup")));
  const clearChatsBtn = byId("clearChatsBtn");
  if (clearChatsBtn) clearChatsBtn.addEventListener("click", () => show(byId("clearChatsPopup")));
  const confirmDeleteChats = byId("confirmDeleteChats");
  if (confirmDeleteChats) confirmDeleteChats.addEventListener("click", () => {
    console.log("DELETE ALL CHATS - BACKEND - chat load list go empty");
    hide(byId("deleteChatsPopup"));
    alert("All chats deleted.");
  });
  const confirmClearChats = byId("confirmClearChats");
  if (confirmClearChats) confirmClearChats.addEventListener("click", () => {
    console.log("CLEAR ALL CHATS - BACKEND - messages clear, chat list still dey");
    hide(byId("clearChatsPopup"));
    alert("All messages cleared.");
  });

  /* ---------- APPEARANCE - THEME / COLOR / BUBBLE ---------- */
  const appearanceMap = {
    openChatTheme: "chatThemeBg",
    openAppColor: "appColorBg",
    openAppBubble: "appBubbleBg",
    openChatColor: "chatColorBg",
    openReceiverBubble: "receiverBubbleBg",
    openSenderBubble: "senderBubbleBg",
  };
  // openAppTheme - no separate background, e be same as Chat theme for now
  const openAppTheme = byId("openAppTheme");
  if (openAppTheme) openAppTheme.addEventListener("click", () => openPopup("chatThemeBg"));
  Object.entries(appearanceMap).forEach(([btnId, popupId]) => {
    const b = byId(btnId);
    if (b) b.addEventListener("click", () => openPopup(popupId));
  });
  // Chat background - pick image from gallery
  const openChatBackground = byId("openChatBackground");
  if (openChatBackground) openChatBackground.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => { markChanged("chatTheme", "background", "gallery-image"); alert("Chat background picked. Click Save to save."); };
    input.click();
  });
  // ... button - Reset Theme pill
  const appearanceMoreBtn = byId("appearanceMoreBtn");
  if (appearanceMoreBtn) appearanceMoreBtn.addEventListener("click", () => {
    const pill = byId("resetThemePill");
    if (pill) pill.hidden = !pill.hidden;
  });
  const resetThemeBtn = byId("resetThemeBtn");
  if (resetThemeBtn) resetThemeBtn.addEventListener("click", () => {
    document.getElementById("pageSettings")?.classList.remove("app-black");
    console.log("RESET THEME - BACKEND - clear all theme");
    alert("Theme reset to default.");
  });
  // Colors - 30 colors in circle - JS go fill lists
  const COLORS = ["#ff3b30","#ff9500","#ffcc00","#34c759","#00c7be","#32ade6","#007aff","#5856d6","#af52de","#ff2d55","#000000","#8e8e93","#ff6b6b","#ffa94d","#ffd43b","#69db7c","#38d9a9","#4dabf7","#748ffc","#b197fc","#f783ac","#e599f7","#63e6be","#ffa8a8","#ffc9c9","#d0bfff","#a5d8ff","#99e9f5","#b2f2bb","#ffe8cc"];
  function fillColors(listId, group) {
    const list = byId(listId);
    if (!list) return;
    list.innerHTML = "";
    COLORS.forEach(c => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "color-circle"; b.style.background = c; b.setAttribute("aria-label", c);
      b.addEventListener("click", () => {
        $$(".color-circle", list).forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        markChanged(group, "color", c);
        if (group === "appColor" || group === "chatColor") document.getElementById("pageSettings").style.setProperty("--blue", c);
      });
      list.appendChild(b);
    });
  }
  fillColors("chatColorList", "chatColor");
  fillColors("receiverColorList", "receiverBubble");
  fillColors("senderColorList", "senderBubble");
  // App color - White or Black
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".app-color-item");
    if (!item) return;
    $$(".app-color-item").forEach(x => x.classList.remove("selected"));
    item.classList.add("selected");
    markChanged("appColor", "appColor", item.dataset.value);
    byId("pageSettings")?.classList.toggle("app-black", item.dataset.value === "black");
  });

  /* ---------- NOTIFICATIONS - TOGGLES + IN-APP ---------- */
  const openInAppNotif = byId("openInAppNotif");
  if (openInAppNotif) openInAppNotif.addEventListener("click", () => openPopup("inAppNotifBg"));
  // All toggle-btn (except saveImages) - On / Off
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".toggle-btn");
    if (!t || t.id === "saveImagesToggle") return;
    const on = t.textContent.trim() === "Off";
    t.textContent = on ? "On" : "Off";
    t.classList.toggle("on", on);
    markChanged("notifications", t.dataset.notif || t.closest(".notif-item")?.querySelector("span")?.textContent || "toggle", on);
  });

  /* ---------- HELP AND FEEDBACK - FULL ---------- */
  // Help texts - each click = new background + full explanation
  const HELP_TEXTS = {
    "moments": `<h3>Moments</h3><p>Moments na your Status for Konnekt. E dey last 24 hours.</p><p>How to post: Go Moments, click +, pick photo / video / text.</p><p>How to see who view, reply, delete before 24 hours, mute, privacy - Everyone / Contact / Nobody.</p><p><b>No Like, No Share for Moments.</b></p>`,
    "trouble": `<h3>Trouble shooting</h3><p>App dey hang - close app, open again.</p><p>Message no dey send - check internet, check if person block you.</p><p>Call no dey connect - check mic permission, check internet.</p><p>QR no dey scan - clean camera, bright light, move phone near.</p><p>Notification no dey come - go Settings > Notifications, turn On.</p><p>Campus feed dey show old feed - campus na 30 days rule.</p><p>Last option - Send feedback.</p>`,
    "chats": `<h3>Chats</h3><p>Start chat with <b>username or ID</b>, or scan QR Code.</p><p>Send message, photo, voice note, video.</p><p>Call - <b>only voice call dey available now, video call is NOT available now.</b></p><p>React, reply, forward, delete, pin, mute, archive.</p><p>Connect Spotify to mood inside chat.</p>`,
    "loops": `<h3>Loops</h3><p>Loops na anonymous feed, na your campus feed.</p><p>100% anonymous - no name, no pic, no campus show for others.</p><p>How to post, comment, report bad post.</p>`,
    "profile": `<h3>Profile</h3><p>Profile na your edit-section-profile.</p><p>Change profile picture, username @Faith_mike, About, privacy, share via QR.</p>`,
    "anonymous": `<h3>Anonymous feed</h3><p>Anonymous feed na Loops. Campus dey determine feed. 100% anonymous. Post, comment, report. Stay safe.</p>`,
    "privacy": `<h3>Privacy security and safety</h3><p>Moments / Profile pic / About / Groups - Everyone / Contact / Nobody.</p><p>Block, report, stay safe - no share password, OTP, location.</p>`,
    "accounts": `<h3>Accounts and accounts bans</h3><p>Email, password OTP, phone, campus 30 days / twice, delete account = lose everything.</p><p>Why ban - spam, harass, bad post. Appeal via Contact us.</p>`,
    "spotify": `<h3>Connect Spotify to mood</h3><p>Go Chat > name > Mood > Connect Spotify > login.</p><p>Current song = mood. Change song = mood change. Disconnect anytime.</p>`,
    "call": `<h3>How to make call</h3><p>Go chat with username or ID, click call for voice call.</p><p><b>Video call is NOT available now.</b> If call no connect, check mic + internet.</p>`,
    "safe": `<h3>How to stay safe in konnekt</h3><p>No share password, OTP, location. Block / report. Check privacy. Campus anonymous.</p>`,
    "anonymous-feed": `<h3>How to use anonymous feed</h3><p>Loops - campus feed, anonymous, post, comment, report.</p>`,
    "music-mood": `<h3>What does connect music to mood mean</h3><p>Music na mood. Happy song = happy mood, sad song = sad / calm.</p><p>People go only see current song / mood, no see full playlist. Fit turn Off anytime.</p>`,
    "get-started": `<h3>Get started</h3><p>Moments, Trouble shooting, Chats, Loops, Profile - click each for full explanation.</p>`,
  };
  const TERMS_TEXT = `<h3>How to use Konnekt correct</h3><p>Respect others, no harass, no spam, no post bad thing. Moments last 24 hours. Loops anonymous no mean say you fit insult person. Only voice call dey available now, video call NOT available now.</p><h3>What we take from you</h3><p>Email, username, profile picture, About, campus, phone number. Phone na only to sync contact. Campus na only to show Loops feed, 100% anonymous. Spotify - only current song / mood, no full playlist.</p><h3>What you need to do</h3><p>Real person, keep password safe, no share OTP, no share private info, if break rule - warn / ban, delete account = lose everything, Konnekt fit update Terms anytime.</p>`;
  const ABOUT_TEXT = `<h3>About Konnekt</h3><p>Konnekt na app for campus + chats + Moments + Loops.</p><p>Campus feed anonymous, chats with username or ID, Moments 24 hours, voice call only for now.</p><p>©️ 2026 Konnekt</p>`;

  // Help center placeholders - in your HTML helpBg is placeholder, JS go build full help if no helpCenterBg
  // If helpCenterBg exists (new HTML), use it. If not, use helpBg as Help center.
  function openHelpDetail(title, html) {
    // If helpDetailBg exists, use it
    const detail = byId("helpDetailBg");
    if (detail) {
      const t = byId("helpDetailTitle"); if (t) t.textContent = title;
      const c = byId("helpDetailContent"); if (c) c.innerHTML = html;
      openPopup("helpDetailBg");
      return;
    }
    // Fallback - reuse helpBg as detail
    const hb = byId("helpBg");
    if (hb) { hb.innerHTML = `<button type="button" class="popup-chevron" data-close="helpBg"><i data-lucide="chevron-left"></i></button><p class="popup-title">${title}</p><div class="help-detail-content">${html}</div>`; openPopup("helpBg"); }
  }
  // Get started list - data-help-detail
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-help-detail]");
    if (btn) { const k = btn.dataset.helpDetail; const titles = { moments: "Moments", trouble: "Trouble shooting", chats: "Chats", loops: "Loops", profile: "Profile" }; openHelpDetail(titles[k] || "Help", HELP_TEXTS[k] || ""); }
    const helpBtn = e.target.closest("[data-help]");
    if (helpBtn) {
      const k = helpBtn.dataset.help;
      if (k === "get-started") { const gs = byId("getStartedBg"); if (gs) openPopup("getStartedBg"); else openHelpDetail("Get started", HELP_TEXTS["get-started"]); return; }
      const titles = { chats: "Chats", anonymous: "Anonymous feed", privacy: "Privacy security and safety", accounts: "Accounts and accounts bans", spotify: "How can I connect Spotify to my mood in my chat" };
      openHelpDetail(titles[k] || "Help", HELP_TEXTS[k] || "");
    }
    const art = e.target.closest("[data-article]");
    if (art) {
      const k = art.dataset.article;
      const titles = { call: "How to make call", safe: "How to stay safe in konnekt", "anonymous-feed": "How to use anonymous feed", "music-mood": "What does connect music to mood mean" };
      openHelpDetail(titles[k] || "Help", HELP_TEXTS[k] || "");
    }
  });
  // Help center open - if new HTML get helpCenterBg, open am, else open helpBg
  const openHelpCenter = byId("openHelpCenter");
  if (openHelpCenter) openHelpCenter.addEventListener("click", () => openPopup("helpCenterBg"));
  // Terms + About
  const openTerms = byId("openTermsPolicy");
  if (openTerms) openTerms.addEventListener("click", () => {
    const t = byId("termsContent"); if (t) t.innerHTML = TERMS_TEXT;
    const bg = byId("termsPolicyBg"); if (bg) openPopup("termsPolicyBg"); else openHelpDetail("Terms and policy", TERMS_TEXT);
  });
  const openAbout = byId("openAboutKonnekt");
  if (openAbout) openAbout.addEventListener("click", () => {
    const t = byId("aboutKonnektContent"); if (t) t.innerHTML = ABOUT_TEXT;
    const bg = byId("aboutKonnektBg"); if (bg) openPopup("aboutKonnektBg"); else openHelpDetail("About konnekt", ABOUT_TEXT);
  });
  // Contact for support - Need more help ? - go to Send feedback to type issues
  const contactSupport = byId("openContactSupport");
  if (contactSupport) contactSupport.addEventListener("click", () => {
    const fb = byId("sendFeedbackBg");
    if (fb) openPopup("sendFeedbackBg"); else alert("Go to Send feedback to type issues.");
  });
  // Send feedback - open
  const openSendFeedback = byId("openSendFeedback");
  if (openSendFeedback) openSendFeedback.addEventListener("click", () => {
    const fb = byId("sendFeedbackBg");
    if (fb) openPopup("sendFeedbackBg"); else alert("Send feedback - Help us to build Konnekt");
  });
  // Feedback image - pick image + write technical issue
  const feedbackImageBtn = byId("feedbackImageBtn");
  if (feedbackImageBtn) feedbackImageBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => { markChanged("feedback", "image", "picked"); alert("Image picked. Write technical issue and click Send."); };
    input.click();
  });

  /* ---------- INVITE - SEARCH CONTACT + SHARE LINK ---------- */
  const searchContactInput = byId("searchContactInput");
  if (searchContactInput) searchContactInput.addEventListener("input", () => {
    console.log("SEARCH CONTACT:", searchContactInput.value);
    // Backend go filter contact list here
  });
  const inviteShareLink = byId("inviteShareLink");
  if (inviteShareLink) inviteShareLink.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(qrLink()); alert("Link copied: " + qrLink()); } catch { alert(qrLink()); }
  });
  // Fake contact list - backend go replace with synced contacts
  const inviteList = byId("inviteContactList");
  if (inviteList) {
    const names = ["Ada", "Chiamaka", "Tunde", "Emeka", "Zainab"];
    inviteList.innerHTML = "";
    names.forEach(n => {
      const div = document.createElement("div");
      div.className = "invite-contact-item";
      div.textContent = n;
      inviteList.appendChild(div);
    });
  }

  /* ---------- LOGOUT - NEW BACKGROUND ---------- */
  const confirmLogoutBtn = byId("confirmLogoutBtn");
  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener("click", () => {
    if (!confirm("Do you want to log out? You can login back with your email and password back.")) return;
    console.log("LOGOUT - BACKEND - clear session");
    localStorage.removeItem("konnekt_session");
    alert("Logged out. Login back with email and password.");
    closePopup("logoutBg");
  });

  /* ---------- DEEP SEARCH - SETTINGS LEFT ---------- */
  // Deep search - type to search all Settings things
  const searchInput = byId("searchSettingsInput");
  const searchIconTop = byId("searchIconTopMobile");
  const settingsLeft = $(".settings-page-left");
  if (searchInput && settingsLeft) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      // Simple deep search - hide / show settings items wey no match
      $$(".settings-left-item", settingsLeft).forEach(item => {
        const txt = item.textContent.toLowerCase();
        item.style.display = (!q || txt.includes(q)) ? "" : "none";
      });
      // If q match password / campus / etc, user fit click Account to see am - backend deep search later
      console.log("DEEP SEARCH SETTINGS:", q);
    });
    // Scroll - show search icon when search input pass
    settingsLeft.addEventListener("scroll", () => {
      if (!searchIconTop) return;
      const rect = searchInput.getBoundingClientRect();
      const topRect = settingsLeft.getBoundingClientRect();
      searchIconTop.classList.toggle("show", rect.bottom < topRect.top + 10);
    });
    if (searchIconTop) searchIconTop.addEventListener("click", () => {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    });
  }

  /* ---------- SEARCH HELP CENTER ---------- */
  const searchHelpInput = byId("searchHelpInput");
  if (searchHelpInput) searchHelpInput.addEventListener("input", () => {
    const q = searchHelpInput.value.trim().toLowerCase();
    $$("#helpCenterBg .help-item").forEach(item => {
      item.style.display = (!q || item.textContent.toLowerCase().includes(q)) ? "" : "none";
    });
  });

  /* ---------- INIT ICONS ---------- */
  if (window.lucide) lucide.createIcons();
});