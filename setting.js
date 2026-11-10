/* ============================================================
   SETTINGS - JS - FULL - CLEAN - NO CUT
   - Every background = separate background, slide from right
   - Chevron back = go back to previous background
   - Save = spinner, frontend sends only what changed
   - QR generated once, saved to Local Storage, Reset = new QR, old link expires
   - Scanner = camera opens to scan code
   - Profile inside Settings = SAME #pageProfile, NOT a separate copy.
     BEFORE WAY: JS shows whole #pageProfile, adds .profile-in-settings.
     It never creates a new profile. It never touches main profile logic.
     Blur: #profileSettingsBlur covers Settings for back.
     When Preview / Mood / Display opens inside Profile, Profile blurs behind it.
   - Desktop: Profile takes over Settings Right
   - Mobile: Profile takes over Settings Left, swipe down = back
   - How Can People Find Me = new background findMeBg, with ID + Username borders,
     each with On/Off + Explanation + Value + Copy icon = Copied
   - Help Center: new topic How Can People Find Me on Konnekt
   - No alert() anywhere. All errors / success use iPhone popup with wiggle.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- HELPERS ---------- */
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const show = (el) => { if (el) el.hidden = false; };
  const hide = (el) => { if (el) el.hidden = true; };
  const byId = (id) => document.getElementById(id);

  /* ---------- UNIVERSAL iPHONE POPUP - REPLACES alert() ---------- */
  let popupCallback = null;
  function showAppPopup(title, message, showCancel = false, callback = null) {
    const overlay = byId("appPopupOverlay");
    const card = byId("appPopupCard");
    if (!overlay || !card) return;
    byId("appPopupTitle").textContent = title || "Notice";
    byId("appPopupMessage").textContent = message || "";
    const cancelBtn = byId("appPopupCancelBtn");
    if (cancelBtn) cancelBtn.hidden = !showCancel;
    popupCallback = callback;
    // Restart wiggle animation
    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";
    overlay.hidden = false;
  }
  function closeAppPopup(confirmed) {
    const overlay = byId("appPopupOverlay");
    if (overlay) overlay.hidden = true;
    const cb = popupCallback;
    popupCallback = null;
    if (cb) cb(confirmed);
  }
  byId("appPopupOkBtn")?.addEventListener("click", () => closeAppPopup(true));
  byId("appPopupCancelBtn")?.addEventListener("click", () => closeAppPopup(false));
  byId("appPopupOverlay")?.addEventListener("click", (e) => {
    if (e.target === byId("appPopupOverlay")) closeAppPopup(false);
  });
  // Short helpers
  const popupError = (msg) => showAppPopup("Something Went Wrong", msg);
  const popupSuccess = (msg) => showAppPopup("Done", msg);
  const popupConfirm = (title, msg, cb) => showAppPopup(title, msg, true, cb);

  /* ---------- FIELD ERROR HELPERS ---------- */
  function setFieldError(inputId, errorId, message) {
    const input = byId(inputId);
    const err = byId(errorId);
    if (input) input.classList.toggle("is-invalid", !!message);
    if (err) {
      if (message) { err.textContent = message; err.hidden = false; }
      else { err.textContent = ""; err.hidden = true; }
    }
    return !message;
  }
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
  function isValidPhone(phone) {
    // Remove spaces, dashes, plus. Must be only digits and 7 to 15 digits long.
    const cleaned = phone.replace(/[\s\-()+]/g, "");
    return /^\d{7,15}$/.test(cleaned);
  }
  function isValidOtp(code) {
    return /^\d{6}$/.test(code);
  }
  function isStrongPassword(pw) {
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  }

  /* ---------- POPUP STACK - CHEVRON BACK ---------- */
  const stack = [];
  function openPopup(id) {
    const el = byId(id);
    if (!el) return;
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
    if (stack.length) show(byId(stack[stack.length - 1]));
  }
  function closeAllPopups() {
    while (stack.length) closePopup(stack[stack.length - 1]);
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-close]");
    if (!btn) return;
    e.preventDefault();
    if (btn.dataset.close === "scannerBg") stopScanner();
    closePopup(btn.dataset.close);
  });

  /* ---------- SAVE - SPINNER - SEND ONLY WHAT CHANGED ---------- */
  window.__konnektChanged = window.__konnektChanged || {};
  function markChanged(group, field, value) {
    window.__konnektChanged[group] = window.__konnektChanged[group] || {};
    window.__konnektChanged[group][field] = value;
  }
  async function doSave(btn, payload) {
    if (!btn) return;
    const spin = btn.querySelector(".save-spinner");
    if (spin) spin.hidden = false;
    btn.disabled = true;
    try {
      // TODO BACKEND: replace with real fetch
      // await fetch("/api/settings/save", { method:"POST", body: JSON.stringify(payload) });
      await new Promise(r => setTimeout(r, 900));
      console.log("SAVE TO BACKEND:", payload);
      popupSuccess("Your changes have been saved successfully.");
    } finally {
      if (spin) spin.hidden = true;
      btn.disabled = false;
    }
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".popup-save-btn, .settings-save-btn");
    if (!btn) return;
    const key = btn.dataset.save || "settings";
    const payload = { type: key, changed: window.__konnektChanged[key] || {} };
    doSave(btn, payload).then(() => { window.__konnektChanged[key] = {}; });
  });

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

  /* ============================================================
     PROFILE INSIDE SETTINGS - BEFORE WAY - SAME #pageProfile
     DO NOT create new profile. Show existing one.
     .edit-section-profile na top bar only, so we show whole #pageProfile:
     top bar + #editBackground + Preview + Mood + Full Image viewer.
     Desktop: profile takes over Settings Right, X brings back Settings Right.
     Mobile: profile takes over Settings Left, X / swipe down brings back Settings Left.
     Blur: #profileSettingsBlur covers Settings for back.
     When Preview / Mood / Display opens inside Profile, Profile itself blurs.
     This never touches main Profile logic - profile.js still controls
     everything inside #pageProfile. Settings only opens / closes it.
     ============================================================ */
  const pageProfile = byId("pageProfile");
  const settingsRight = $(".settings-page-right");
  const settingsLeftEl = $(".settings-page-left");
  const profileBlur = byId("profileSettingsBlur");
  const isMobileProfile = () => window.innerWidth <= 768;

  function showProfileBlur() { if (profileBlur) profileBlur.hidden = false; }
  function hideProfileBlur() { if (profileBlur) profileBlur.hidden = true; }

  // Create Cancel (X) if HTML no get am - CSS already has .cancel-button
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
    closeAllPopups();
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
    pageProfile.classList.remove("is-blurred-behind");
    pageProfile.classList.toggle("profile-in-settings-mobile", isMobileProfile());
    // FIX - Blur Settings for back, Profile stays clear on top
    showProfileBlur();
    if (isMobileProfile()) { if (settingsLeftEl) settingsLeftEl.style.display = "none"; }
    else { if (settingsRight) settingsRight.style.visibility = "hidden"; }
    document.body.style.overflow = "hidden";
    console.log("PROFILE OPEN - check if you see am now");
    if (window.lucide) lucide.createIcons();
  }

  function closeProfileInSettings() {
    if (!pageProfile) return;
    pageProfile.hidden = true;
    pageProfile.classList.remove("profile-in-settings", "profile-in-settings-mobile", "is-blurred-behind");
    hideProfileBlur();
    // Bring back wetin we hide
    if (settingsLeftEl) settingsLeftEl.style.display = "";
    if (settingsRight) settingsRight.style.visibility = "";
    document.body.style.overflow = "";
  }

  // Click profile border in Settings Left -> open profile
  byId("openProfile")?.addEventListener("click", openProfileInSettings);

  // Click X (Cancel) inside profile top bar -> back to Settings
  document.addEventListener("click", (e) => {
    const cancel = e.target.closest(".cancel-button, #cancelProfileBtn");
    if (cancel && pageProfile && !pageProfile.hidden && pageProfile.classList.contains("profile-in-settings")) {
      e.preventDefault();
      closeProfileInSettings();
    }
  });

  // FIX - When Preview / Mood / Display / Full Image opens inside Profile, Profile blurs behind it.
  // profile.js opens those as .preview-background / .popup-overlay inside #pageProfile.
  // We watch for them and add .is-blurred-behind. When they close, we remove it.
  function updateProfileInnerBlur() {
    if (!pageProfile || !pageProfile.classList.contains("profile-in-settings")) return;
    const inner = pageProfile.querySelector(".preview-background:not([hidden]), .popup-overlay:not([hidden]), .full-image-viewer:not([hidden])");
    pageProfile.classList.toggle("is-blurred-behind", !!inner);
  }
  if (pageProfile) {
    const profileObserver = new MutationObserver(() => updateProfileInnerBlur());
    profileObserver.observe(pageProfile, { attributes: true, childList: true, subtree: true, attributeFilter: ["hidden", "style", "class"] });
    // Also check on any click inside Profile - in case profile.js toggles with style, not hidden
    pageProfile.addEventListener("click", () => setTimeout(updateProfileInnerBlur, 50));
  }

  // Mobile: swipe down on profile top bar = bring back Settings Left
  let profileTouchY = null;
  if (pageProfile) {
    pageProfile.addEventListener("touchstart", (e) => { profileTouchY = e.touches[0].clientY; }, { passive: true });
    pageProfile.addEventListener("touchend", (e) => {
      if (profileTouchY === null) return;
      const dy = e.changedTouches[0].clientY - profileTouchY;
      // Swipe down more than 80px, from top area, and na mobile, and profile is in Settings
      if (isMobileProfile() && pageProfile.classList.contains("profile-in-settings") && dy > 80 && e.changedTouches[0].clientY < 220) closeProfileInSettings();
      profileTouchY = null;
    }, { passive: true });
  }

  // If user resize from mobile to desktop while profile open, fix am
  window.addEventListener("resize", () => {
    if (!pageProfile || pageProfile.hidden || !pageProfile.classList.contains("profile-in-settings")) return;
    pageProfile.classList.toggle("profile-in-settings-mobile", isMobileProfile());
    if (isMobileProfile()) { if (settingsLeftEl) settingsLeftEl.style.display = "none"; if (settingsRight) settingsRight.style.visibility = ""; }
    else { if (settingsLeftEl) settingsLeftEl.style.display = ""; if (settingsRight) settingsRight.style.visibility = "hidden"; }
  });

  /* ---------- QR - GENERATE ONCE, SAVE LOCAL STORAGE ---------- */
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
    return `https://konnekt.app/u/${q.username}?id=${q.id}&k=${q.k}`;
  }
  function renderQR() {
    const link = qrLink();
    const q = getOrCreateQR();
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`;
    const small = byId("qrImageSmall");
    const big = byId("qrImageBig");
    if (small) small.src = url;
    if (big) big.src = url;
    const linkEl = $(".qr-share-link");
    if (linkEl) linkEl.textContent = link;
    // FIX - Sync Find Me texts with same QR data, so ID / Username always match
    const idText = byId("myIdText");
    if (idText) idText.textContent = q.id;
    const userText = byId("myUsernameText");
    if (userText) userText.textContent = "@" + q.username;
  }
  renderQR();

  byId("qrShareBtn")?.addEventListener("click", () => {
    const sheet = byId("qrShareSheet");
    if (sheet) sheet.hidden = !sheet.hidden;
  });
  $(".qr-copy-link-btn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(qrLink()); btn.textContent = "Copied!"; setTimeout(() => btn.textContent = "Copy Link", 1200); }
    catch { popupError("Could not copy the link. Please copy it manually."); }
  });
  byId("qrResetBtn")?.addEventListener("click", () => {
    popupConfirm("Reset QR Code", "If you reset your QR code, your old link and old QR code will stop working immediately. Do you want to continue?", (ok) => {
      if (!ok) return;
      const fresh = { username: "Faith_mike", id: "234567", k: makeToken() };
      localStorage.setItem("konnekt_qr", JSON.stringify(fresh));
      renderQR();
      popupSuccess("Your QR code has been reset. Your old link no longer works.");
    });
  });

  /* ---------- SCANNER ---------- */
  let scannerStream = null;
  async function startScanner() {
    openPopup("scannerBg");
    let v = byId("scannerVideo");
    if (!v) {
      const area = $(".scanner-area");
      if (area) { v = document.createElement("video"); v.id = "scannerVideo"; v.autoplay = true; v.playsInline = true; area.prepend(v); }
    }
    try {
      scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (v) v.srcObject = scannerStream;
    } catch (err) {
      console.log("Camera did not open:", err);
      popupError("Camera did not open. Please allow camera permission or use Pick from Gallery.");
    }
  }
  function stopScanner() {
    if (scannerStream) { scannerStream.getTracks().forEach(t => t.stop()); scannerStream = null; }
  }
  byId("openScanner")?.addEventListener("click", startScanner);
  $(".scanner-gallery-btn")?.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => { popupSuccess("Image selected. We will decode the QR code from this image."); };
    input.click();
  });

  /* ---------- ACCOUNT - OPEN SUB BACKGROUNDS ---------- */
  const accountMap = {
    openEmail: "emailBg",
    openPassword: "passwordBg",
    openChangePhone: "changePhoneBg",
    openChangeCampus: "changeCampusBg",
    openDeleteAccount: "deleteAccountBg",
    openFindMe: "findMeBg",
  };
  Object.entries(accountMap).forEach(([btnId, popupId]) => {
    const b = byId(btnId);
    if (b) b.addEventListener("click", () => openPopup(popupId));
  });

  /* ---------- HOW CAN PEOPLE FIND ME - NEW BACKGROUND ---------- */
  // Border 1 = ID, Border 2 = Username. Each: Top = Title + On/Off, Under = Explain, Under = Value + Copy
  function setupFindToggle(btnId, groupKey) {
    const btn = byId(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOn = btn.textContent.trim() === "Off";
      btn.textContent = isOn ? "On" : "Off";
      btn.classList.toggle("on", isOn);
      markChanged("findMe", groupKey, isOn);
    });
  }
  setupFindToggle("findByIdToggle", "findById");
  setupFindToggle("findByUsernameToggle", "findByUsername");

  // Helper - copy text + show Copied for 1.2s
  async function copyWithFeedback(text, copiedEl) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers - create temp textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
    if (copiedEl) {
      copiedEl.hidden = false;
      setTimeout(() => { copiedEl.hidden = true; }, 1200);
    }
  }
  // Copy ID - copies "356356", shows Copied
  byId("copyIdBtn")?.addEventListener("click", () => {
    const id = byId("myIdText")?.textContent.trim() || "356356";
    copyWithFeedback(id, byId("idCopiedText"));
  });
  // Copy Username - copies "@Faith_mike", shows Copied
  byId("copyUsernameBtn")?.addEventListener("click", () => {
    const name = byId("myUsernameText")?.textContent.trim() || "@Faith_mike";
    copyWithFeedback(name, byId("usernameCopiedText"));
  });

  /* ---------- EMAIL - STEP 1 + 2 + 3 - SEPARATE BACKGROUNDS ---------- */
  byId("openChangeEmailPopup")?.addEventListener("click", () => show(byId("changeEmailPopup")));
  byId("continueChangeEmail")?.addEventListener("click", () => {
    hide(byId("changeEmailPopup"));
    openPopup("changeEmailNewBg");
  });
  byId("confirmNewEmail")?.addEventListener("click", () => {
    const email = byId("newEmailInput")?.value.trim() || "";
    if (!email) return setFieldError("newEmailInput", "newEmailError", "Please type your new email address.");
    if (!isValidEmail(email)) return setFieldError("newEmailInput", "newEmailError", "This email address is not valid. It must look like name@example.com. Please check it and try again.");
    setFieldError("newEmailInput", "newEmailError", "");
    console.log("SEND EMAIL OTP TO BACKEND:", email);
    markChanged("newEmail", "email", email);
    closePopup("changeEmailNewBg");
    openPopup("emailVerifyBg");
    popupSuccess("We sent a 6-digit verification code to " + email + ". Please type the code below.");
  });
  byId("confirmEmailOtpBtn")?.addEventListener("click", () => {
    const otp = byId("emailOtpInput")?.value.trim() || "";
    if (!isValidOtp(otp)) return setFieldError("emailOtpInput", "emailOtpError", "This code is not valid. It must be exactly 6 numbers. Please check your email and try again.");
    setFieldError("emailOtpInput", "emailOtpError", "");
    // Token so app knows it is the same person with 2 accounts
    const token = makeToken(32);
    localStorage.setItem("konnekt_switch_token", token);
    console.log("EMAIL VERIFIED + SWITCH TOKEN:", { token });
    show(byId("switchAccountBtn"));
    closePopup("emailVerifyBg");
    closePopup("emailBg");
    popupSuccess("Your new email address has been verified and saved. You can switch between your accounts later.");
  });
  byId("resendEmailOtpBtn")?.addEventListener("click", () => popupSuccess("We sent a new verification code to your new email address."));
  byId("switchAccountBtn")?.addEventListener("click", () => popupSuccess("Switch Account: Here you will see a list of your accounts so you can switch between them."));

  /* ---------- PASSWORD - STEP 1: EMAIL ---------- */
  byId("sendOtpBtn")?.addEventListener("click", () => {
    const email = byId("resetEmailInput")?.value.trim() || "";
    if (!email) return setFieldError("resetEmailInput", "resetEmailError", "Please type your email address.");
    if (!isValidEmail(email)) return setFieldError("resetEmailInput", "resetEmailError", "This email address is not valid. It must look like name@example.com.");
    setFieldError("resetEmailInput", "resetEmailError", "");
    console.log("SEND PASSWORD OTP TO BACKEND:", email);
    openPopup("passwordOtpBg");
    popupSuccess("We sent a 6-digit verification code to " + email + ". Please type the code below.");
  });

  /* ---------- PASSWORD - STEP 2: OTP ---------- */
  byId("confirmOtpBtn")?.addEventListener("click", () => {
    const otp = byId("otpInput")?.value.trim() || "";
    if (!isValidOtp(otp)) return setFieldError("otpInput", "otpError", "This code is not valid. It must be exactly 6 numbers. Please check your email and try again.");
    setFieldError("otpInput", "otpError", "");
    console.log("PASSWORD OTP CONFIRMED");
    openPopup("passwordNewBg");
  });
  byId("resendPasswordOtpBtn")?.addEventListener("click", () => popupSuccess("We sent a new verification code to your email address."));

  /* ---------- PASSWORD - STEP 3: NEW PASSWORD ---------- */
  byId("confirmNewPassword")?.addEventListener("click", () => {
    const a = byId("newPasswordInput")?.value || "";
    const b = byId("confirmPasswordInput")?.value || "";
    if (!a || !b) return setFieldError("newPasswordInput", "newPasswordError", "Please type your new password and confirm it.");
    if (!isStrongPassword(a)) return setFieldError("newPasswordInput", "newPasswordError", "Your new password is too weak. It must be at least 8 characters long and it must include at least one letter and one number.");
    if (a !== b) return setFieldError("newPasswordInput", "newPasswordError", "Your passwords do not match. Please type the same password in both fields.");
    setFieldError("newPasswordInput", "newPasswordError", "");
    markChanged("password", "password", "changed");
    closePopup("passwordNewBg");
    closePopup("passwordOtpBg");
    closePopup("passwordBg");
    popupSuccess("Your new password has been saved successfully.");
  });

  /* ---------- CHANGE PHONE - STEP 1: NEW NUMBER ---------- */
  byId("changePhoneBtn")?.addEventListener("click", () => {
    const phone = byId("newPhoneInput")?.value.trim() || "";
    if (!phone) return setFieldError("newPhoneInput", "newPhoneError", "Please type your new phone number.");
    if (!isValidPhone(phone)) return setFieldError("newPhoneInput", "newPhoneError", "This phone number is not valid. It must contain only numbers and it must be complete. Please check it and try again.");
    setFieldError("newPhoneInput", "newPhoneError", "");
    console.log("SEND PHONE OTP TO BACKEND:", phone);
    openPopup("phoneOtpBg");
    popupSuccess("We sent a 6-digit verification code to your new phone number.");
  });

  /* ---------- CHANGE PHONE - STEP 2: OTP ---------- */
  byId("confirmPhoneOtpBtn")?.addEventListener("click", () => {
    const otp = byId("phoneOtpInput")?.value.trim() || "";
    if (!isValidOtp(otp)) return setFieldError("phoneOtpInput", "phoneOtpError", "This code is not valid. It must be exactly 6 numbers. Please check your phone and try again.");
    setFieldError("phoneOtpInput", "phoneOtpError", "");
    openPopup("phonePasswordBg");
  });
  byId("resendPhoneOtpBtn")?.addEventListener("click", () => popupSuccess("We sent a new verification code to your new phone number."));

  /* ---------- CHANGE PHONE - STEP 3: PASSWORD CONFIRM ---------- */
  byId("confirmPhonePasswordBtn")?.addEventListener("click", () => {
    const pw = byId("phoneConfirmPassword")?.value || "";
    if (!pw) return setFieldError("phoneConfirmPassword", "phonePasswordError", "Please type your current password to confirm this change.");
    setFieldError("phoneConfirmPassword", "phonePasswordError", "");
    markChanged("phone", "phone", byId("newPhoneInput")?.value.trim());
    closePopup("phonePasswordBg");
    closePopup("phoneOtpBg");
    closePopup("changePhoneBg");
    popupSuccess("Your phone number has been changed successfully.");
  });

  /* ---------- CHANGE CAMPUS - 50 REAL UNIVERSITIES ---------- */
  // 30 most popular + 20 less popular, mixed together so it feels natural.
  const CAMPUS_LIST = [
    "University of Lagos", "University of Ibadan", "Obafemi Awolowo University", "University of Nigeria, Nsukka",
    "Ahmadu Bello University", "University of Benin", "Lagos State University", "Covenant University",
    "Babcock University", "University of Ilorin", "Federal University of Technology, Akure", "University of Port Harcourt",
    "Nnamdi Azikiwe University", "Bayero University Kano", "University of Abuja", "Federal University of Technology, Minna",
    "University of Calabar", "University of Uyo", "Rivers State University", "Delta State University",
    "Redeemer's University", "Pan-Atlantic University", "Bowen University", "Afe Babalola University",
    "Lead City University", "Igbinedion University", "Wellspring University", "Veritas University",
    "Caleb University", "Chrisland University", "American University of Nigeria",
    "Federal University, Oye-Ekiti", "Osun State University", "Ekiti State University", "Kwara State University",
    "Kogi State University", "Taraba State University", "Plateau State University", "Adamawa State University",
    "Borno State University", "Yobe State University", "Nasarawa State University", "Enugu State University",
    "Imo State University", "Anambra State University", "Abia State University", "Bauchi State University",
    "Gombe State University", "Jigawa State University", "Sokoto State University",
  ];
  const campusListEl = byId("campusPickerList");
  if (campusListEl) {
    campusListEl.innerHTML = "";
    CAMPUS_LIST.forEach((name) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "campus-item"; b.textContent = name;
      b.addEventListener("click", () => {
        $$(".campus-item", campusListEl).forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        const custom = byId("customCampusInput"); if (custom) custom.value = name;
        markChanged("campus", "campus", name);
      });
      campusListEl.appendChild(b);
    });
  }
  byId("confirmCampusBtn")?.addEventListener("click", () => {
    const custom = byId("customCampusInput")?.value.trim() || "";
    const selected = $(".campus-item.selected")?.textContent || "";
    const campus = custom || selected;
    if (!campus) return setFieldError("customCampusInput", "campusError", "Please select a campus from the list or type the name of your campus.");
    setFieldError("customCampusInput", "campusError", "");
    // 30 days / twice rule
    let data = { count: 0, last: 0, campus: "" };
    try { data = JSON.parse(localStorage.getItem("konnekt_campus") || '{"count":0,"last":0}'); } catch { data = { count: 0, last: 0 }; }
    const now = Date.now();
    const days = (now - (data.last || 0)) / (1000 * 60 * 60 * 24);
    if (data.count >= 2 && days < 30) return popupError("You have already changed your campus twice. Please wait until the next 30 days before you can change it again.");
    if (data.last !== 0 && days < 30) return popupError("You can only change your campus every 30 days. Please wait a little longer before you try again.");
    data.count = data.count >= 2 ? 1 : data.count + 1;
    data.last = now; data.campus = campus;
    localStorage.setItem("konnekt_campus", JSON.stringify(data));
    markChanged("campus", "campus", campus);
    popupSuccess("Your campus has been set to " + campus + ". Click Save at the top right to save it.");
  });

  /* ---------- DELETE ACCOUNT ---------- */
  byId("deleteAccountBtn")?.addEventListener("click", () => {
    popupConfirm("Delete Account", "If you delete your account, you will lose all of your messages, Moments, Loops posts, and everything connected to your account. This cannot be undone. Do you want to continue?", (ok) => {
      if (!ok) return;
      console.log("DELETE ACCOUNT - BACKEND");
      localStorage.clear();
      popupSuccess("Your account has been deleted. You can sign up again later if you wish.");
      setTimeout(() => window.location.reload(), 1200);
    });
  });

  /* ---------- PRIVACY ---------- */
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
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".audience-item");
    if (!item) return;
    const list = item.closest(".audience-list");
    if (list) $$(".audience-item", list).forEach(x => x.classList.remove("selected"));
    item.classList.add("selected");
    const popup = item.closest(".popup-bg");
    markChanged(popup?.id || "privacy", "audience", item.dataset.value);
  });

  /* ---------- CHATS SETTINGS ---------- */
  byId("saveImagesToggle")?.addEventListener("click", () => {
    const btn = byId("saveImagesToggle");
    const on = btn.textContent.trim() === "Off";
    btn.textContent = on ? "On" : "Off";
    btn.classList.toggle("on", on);
    markChanged("chats", "saveImages", on);
  });
  byId("deleteChatsBtn")?.addEventListener("click", () => openPopup("deleteChatsBg"));
  byId("clearChatsBtn")?.addEventListener("click", () => openPopup("clearChatsBg"));
  byId("confirmDeleteChats")?.addEventListener("click", () => {
    console.log("DELETE ALL CHATS - BACKEND");
    closePopup("deleteChatsBg");
    closePopup("chatsBg");
    popupSuccess("All chats have been deleted. Your chat list is now empty.");
  });
  byId("confirmClearChats")?.addEventListener("click", () => {
    console.log("CLEAR ALL CHATS - BACKEND");
    closePopup("clearChatsBg");
    closePopup("chatsBg");
    popupSuccess("All messages have been cleared. Your chat list will still remain.");
  });

  /* ---------- APPEARANCE ---------- */
  const appearanceMap = {
    openChatTheme: "chatThemeBg",
    openAppColor: "appColorBg",
    openAppBubble: "appBubbleBg",
    openChatColor: "chatColorBg",
    openReceiverBubble: "receiverBubbleBg",
    openSenderBubble: "senderBubbleBg",
  };
  Object.entries(appearanceMap).forEach(([btnId, popupId]) => {
    const b = byId(btnId);
    if (b) b.addEventListener("click", () => openPopup(popupId));
  });
  byId("openChatBackground")?.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => { markChanged("chatTheme", "background", "gallery-image"); popupSuccess("Chat background selected. Click Save to save it."); };
    input.click();
  });
  byId("appearanceMoreBtn")?.addEventListener("click", () => {
    const pill = byId("resetThemePill");
    if (pill) pill.hidden = !pill.hidden;
  });
  byId("resetThemeBtn")?.addEventListener("click", () => {
    byId("pageSettings")?.classList.remove("app-black");
    console.log("RESET THEME - BACKEND");
    popupSuccess("Your theme has been reset to the default theme.");
  });
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
      });
      list.appendChild(b);
    });
  }
  fillColors("chatColorList", "chatColor");
  fillColors("receiverColorList", "receiverBubble");
  fillColors("senderColorList", "senderBubble");
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".app-color-item");
    if (!item) return;
    $$(".app-color-item").forEach(x => x.classList.remove("selected"));
    item.classList.add("selected");
    markChanged("appColor", "appColor", item.dataset.value);
    byId("pageSettings")?.classList.toggle("app-black", item.dataset.value === "black");
  });

  /* ---------- NOTIFICATIONS ---------- */
  byId("openInAppNotif")?.addEventListener("click", () => openPopup("inAppNotifBg"));
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".toggle-btn");
    if (!t || t.id === "saveImagesToggle" || t.id === "findByIdToggle" || t.id === "findByUsernameToggle") return;
    const on = t.textContent.trim() === "Off";
    t.textContent = on ? "On" : "Off";
    t.classList.toggle("on", on);
    markChanged("notifications", t.dataset.notif || t.closest(".notif-item")?.querySelector("span")?.textContent || "toggle", on);
    if (t.dataset.notif === "moments-read-receipt") {
      popupSuccess(on
        ? "Moments Read Receipts turned on. Other people can now see that you viewed their Moment."
        : "Moments Read Receipts turned off. Other people will not know that you viewed their Moment.");
    }
  });

  /* ---------- HELP AND FEEDBACK ---------- */
  const HELP_TEXTS = {
    moments: `<h3>Moments</h3><p>Moments are short posts that last for 24 hours, and then they disappear automatically. They are perfect for sharing what is happening in your day without keeping it on your profile forever.</p><p><strong>How to post a Moment:</strong> Go to Moments, tap the plus button, and choose a photo, a video, or a text Moment. If you post a text Moment, you can choose the colour you want for the background.</p><p><strong>Privacy:</strong> You can choose who sees your Moments in Settings, under Privacy, then Moments. You can choose Everyone, Contacts Only, or Nobody.</p><p><strong>Read Receipts:</strong> In Settings, under Notifications, you can turn Moments Read Receipts on or off. When it is on, other people can see that you viewed their Moment. When it is off, they will not know.</p><p><strong>Report and Block:</strong> If someone posts a Moment that makes you feel unsafe, you can report it and block that person directly from Moments.</p>`,
    trouble: `<h3>Troubleshooting</h3><p>If the app is hanging, close it completely and open it again. If a message is not sending, check your internet connection and check if the person blocked you. If a call is not connecting, check your microphone permission and your internet connection. If a QR code is not scanning, clean your camera, use bright light, and move your phone closer to the code. If notifications are not coming, go to Settings, then Notifications, and turn them on. If your Campus Feed is showing an old feed, remember that you can only change your campus every 30 days. If nothing works, please send feedback and tell us exactly what happened.</p>`,
    chats: `<h3>Chats</h3><p>Chats is where you connect directly with people. You can start a chat with a username or an ID, or you can scan a QR code. You can send messages, photos, videos, voice notes, and stickers. You can make a voice call with the people you chat with. Video calls are not available yet.</p><p><strong>How to reply to a message:</strong> Press and hold the message you want to reply to. A menu will appear. Tap Reply, type your message, and send it. The original message will appear above your reply so everyone knows what you are responding to. In the same menu, you can also react to a message, delete a message, and select multiple messages to delete at once.</p><p><strong>How to create a sticker:</strong> Tap the plus icon inside a chat, then tap Create Sticker. A sticker is a short 6-second video or image that you can personalise. You can add text, edit it the way you want, and use a video or an image as the base. In the sticker panel, if you tap Add Sticker, it will show you all the stickers in the chat you are in, so you can select them and add them to your favourites.</p><p><strong>Images:</strong> Images you receive in chats are saved automatically unless you turn this off in Settings, under Chats.</p>`,
    loops: `<h3>Loops</h3><p>Loops is the anonymous heart of Konnekt. It is a safe space where you can speak freely without anyone knowing who you are. Every post in Loops is 100 percent anonymous. No name, no profile picture, and no campus is shown to other users.</p><p>There are two feeds: the General Anonymous Feed, where everyone can see your post, and the Campus Anonymous Feed, which shows you posts only from people in your own campus. You can upvote posts you support, downvote posts you disagree with, and comment anonymously. You can like comments and add hashtags to your posts. If a post receives three downvotes, it is hidden to protect the community, and the author can appeal it from the Loops page.</p>`,
    profile: `<h3>Profile</h3><p>Your profile is how other people see you on Konnekt. You can edit your profile picture, your username, your About, and your mood. You can share your thought in a small bubble above your profile picture. You can connect your mood to Spotify, and you can preview your profile to see exactly how other people see it.</p>`,
    anonymous: `<h3>Anonymous Feed</h3><p>The Anonymous Feed is Loops. Your campus determines which Campus Feed you see. It is 100 percent anonymous. You can post, comment, report, and stay safe. Nobody knows who you are.</p>`,
    privacy: `<h3>Privacy, Security and Safety</h3><p>You can control who sees your Moments, your profile picture, your About, and who can add you to groups. For each one, you can choose Everyone, Contacts Only, or Nobody. You can block and report anyone who makes you feel unsafe. Never share your password, your verification code, or your location with strangers.</p>`,
    accounts: `<h3>Accounts and Account Bans</h3><p>You can change your email, password, phone number, and campus in Settings. Your phone number is only used to sync your contacts. Your campus can only be changed twice, and only every 30 days. If you delete your account, you will lose everything. If you break the rules, your account may be warned or banned. Common reasons for a ban include spam, harassment, bullying, and posting harmful content. If you believe your account was banned unfairly, you can appeal through the Help Center by contacting support.</p>`,
    spotify: `<h3>How Can I Connect Spotify to My Mood in My Chat</h3><p>Go to your Profile, then Mood, then Connect Spotify, then log in to Spotify. When you are playing music, people will see the name of the song and the artist you are playing. When you stop playing, they will see the last song you played. If you have not played anything, they will see your mood thought. Your mood appears as a mood pill in chats and on your profile. You can disconnect Spotify at any time.</p>`,
    reply: `<h3>How to Reply to Messages</h3><p>To reply to a message, press and hold the message you want to reply to. A menu will appear with options to Reply, React, Delete, and Select. Tap Reply, type your message, and send it. The original message will appear above your reply so everyone knows what you are responding to. You can do this in one-to-one chats and in groups.</p>`,
    sticker: `<h3>How to Create a Sticker</h3><p>To create a sticker, tap the plus icon inside a chat, then tap Create Sticker. A sticker is a short 6-second video or image that you can personalise. You can add text to your sticker, edit it the way you want, and use a video or an image as the base. Once you create it, you can send it in any chat. In the sticker panel, if you tap Add Sticker, it will show you all the stickers in the chat you are in, so you can select them and add them to your favourites.</p>`,
    call: `<h3>How to Make a Call</h3><p>To make a call, go to a chat with a username or an ID, then tap the call button to start a voice call. Only voice calls are available now. Video calls are not available yet. If your call does not connect, check your microphone permission and your internet connection.</p>`,
    safe: `<h3>How to Stay Safe in Konnekt</h3><p>Never share your password, your verification code, or your location with strangers. Block and report anyone who makes you feel uncomfortable. Check your privacy settings in Settings, under Privacy. Remember that Loops is anonymous, but anonymity does not give you permission to hurt others. If someone makes you feel unsafe, block them and report them immediately.</p>`,
    "anonymous-feed": `<h3>How to Use the Anonymous Feed</h3><p>Go to Loops. Choose the General Feed to see posts from everyone, or choose the Campus Feed to see posts only from your campus. Post anonymously, comment anonymously, upvote posts you support, and report posts that are harmful. Add hashtags to help people find posts about a topic they care about.</p>`,
    "music-mood": `<h3>What Does Connecting Music to Mood Mean</h3><p>Connecting music to mood means your current song becomes your mood. When you play a song on Spotify, people will see the name of the song and the artist. When you stop playing, they will see the last song you played. If you have not played anything, they will see your mood thought. People will only see your current song and mood. They will never see your full playlist or your listening history. You can turn this off at any time.</p>`,
    "get-started": `<h3>Get Started</h3><p>Welcome to Konnekt. Start with Moments, Chats, Loops, and Profile. Tap each topic for a full explanation of how it works.</p>`,
    "find-me": `<h3>How Can People Find Me on Konnekt</h3><p>You control how people can find you on Konnekt. There are 3 ways: with your ID, with your Username, or by scanning your QR code.</p><p><strong>1. With ID Only:</strong> Your ID is private. Go to Settings, then Account, then How Can People Find Me on Konnekt, then turn With ID Only On or Off. If it is On, people must know your exact ID to find you.  Tap the Copy icon beside it to copy it. If it is Off, nobody can find you with your ID.</p><p><strong>2. With Username Only:</strong> Your username is public. In the same place, turn With Username Only On or Off. If it is On, anyone can search your  and find you. Tap the Copy icon beside it to copy it. If it is Off, people can search your username but they will not find you.</p><p><strong>3. With QR Code:</strong> Anyone can scan your QR code to start a chat with you, even if ID and Username are Off. Go to Settings, tap your QR code at the top to see your full QR code.</p><p><strong>If both ID and Username are Off:</strong> Nobody can find you by searching. They can only chat with you if you start the chat or if they scan your QR code. You can change this at any time.</p>`,
  };
  // Terms and About are already full paragraphs in the HTML. JS does not overwrite them with short text.
  function openHelpDetail(title, html) {
    const detail = byId("helpDetailBg");
    if (detail) {
      const t = byId("helpDetailTitle"); if (t) t.textContent = title;
      const c = byId("helpDetailContent"); if (c) c.innerHTML = html;
      openPopup("helpDetailBg");
      return;
    }
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-help-detail]");
    if (btn) {
      const k = btn.dataset.helpDetail;
      const titles = { moments: "Moments", trouble: "Troubleshooting", chats: "Chats", loops: "Loops", profile: "Profile" };
      openHelpDetail(titles[k] || "Help", HELP_TEXTS[k] || "");
      return;
    }
    const helpBtn = e.target.closest("[data-help]");
    if (helpBtn) {
      const k = helpBtn.dataset.help;
      if (k === "get-started") { openPopup("getStartedBg"); return; }
      const titles = { chats: "Chats", anonymous: "Anonymous Feed", privacy: "Privacy, Security and Safety", accounts: "Accounts and Account Bans", spotify: "How Can I Connect Spotify to My Mood in My Chat", reply: "How to Reply to Messages", sticker: "How to Create a Sticker", "find-me": "How Can People Find Me on Konnekt" };
      openHelpDetail(titles[k] || "Help", HELP_TEXTS[k] || "");
      return;
    }
    const art = e.target.closest("[data-article]");
    if (art) {
      const k = art.dataset.article;
      const titles = { call: "How to Make a Call", safe: "How to Stay Safe in Konnekt", "anonymous-feed": "How to Use the Anonymous Feed", "music-mood": "What Does Connecting Music to Mood Mean" };
      openHelpDetail(titles[k] || "Help", HELP_TEXTS[k] || "");
    }
  });
  byId("openHelpCenter")?.addEventListener("click", () => openPopup("helpCenterBg"));
  byId("openTermsPolicy")?.addEventListener("click", () => openPopup("termsPolicyBg"));
  byId("openAboutKonnekt")?.addEventListener("click", () => openPopup("aboutKonnektBg"));
  byId("openContactSupport")?.addEventListener("click", () => openPopup("sendFeedbackBg"));
  byId("openSendFeedback")?.addEventListener("click", () => openPopup("sendFeedbackBg"));
  byId("feedbackImageBtn")?.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => { markChanged("feedback", "image", "picked"); popupSuccess("Image selected. Please write the technical issue and tap Send."); };
    input.click();
  });

  /* ---------- INVITE - REAL CONTACTS: PERMISSION -> LOADING -> LIST ---------- */
  const inviteState = { granted: false, loaded: false, contacts: [] };
  function renderInviteContacts(filter = "") {
    const list = byId("inviteContactList");
    const empty = byId("inviteEmptyBox");
    if (!list) return;
    list.innerHTML = "";
    const q = filter.trim().toLowerCase();
    const shown = inviteState.contacts.filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
    if (!shown.length) { if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    shown.forEach((c) => {
      const row = document.createElement("div");
      row.className = "invite-contact-item";
      row.innerHTML = `<span class="invite-contact-avatar">${c.name.charAt(0).toUpperCase()}</span><span class="invite-contact-info"><strong>${c.name}</strong><small>${c.phone}</small></span><button type="button" class="invite-contact-btn">Invite</button>`;
      const btn = row.querySelector(".invite-contact-btn");
      btn.addEventListener("click", () => {
        const invited = btn.classList.toggle("invited");
        btn.textContent = invited ? "Invited" : "Invite";
        if (invited) popupSuccess("Invite link sent to " + c.name + ".");
      });
      list.appendChild(row);
    });
  }
  function loadInviteContacts() {
    const perm = byId("invitePermissionBox");
    const loading = byId("inviteLoadingBox");
    const denied = byId("inviteDeniedBox");
    const wrap = byId("inviteContactsWrap");
    if (perm) perm.hidden = true;
    if (denied) denied.hidden = true;
    if (wrap) wrap.hidden = true;
    if (loading) loading.hidden = false;
    // Real app: navigator.contacts.select() / Contacts API goes here.
    // For now we simulate the real loading flow. Backend will replace the list.
    setTimeout(() => {
      if (loading) loading.hidden = true;
      if (wrap) wrap.hidden = false;
      // Demo contacts - backend will replace with real synced contacts.
      inviteState.contacts = [
        { name: "Ada Okafor", phone: "+234 801 234 5678" },
        { name: "Chiamaka Eze", phone: "+234 802 345 6789" },
        { name: "Tunde Bakare", phone: "+234 803 456 7890" },
        { name: "Emeka Obi", phone: "+234 804 567 8901" },
        { name: "Zainab Musa", phone: "+234 805 678 9012" },
      ];
      inviteState.loaded = true;
      renderInviteContacts(byId("searchContactInput")?.value || "");
    }, 1200);
  }
  byId("openInvite")?.addEventListener("click", () => {
    // Reset Invite to permission state each time, unless already granted
    const perm = byId("invitePermissionBox");
    const loading = byId("inviteLoadingBox");
    const denied = byId("inviteDeniedBox");
    const wrap = byId("inviteContactsWrap");
    if (inviteState.granted && inviteState.loaded) {
      if (perm) perm.hidden = true;
      if (loading) loading.hidden = true;
      if (denied) denied.hidden = true;
      if (wrap) wrap.hidden = false;
      renderInviteContacts("");
    } else {
      if (perm) perm.hidden = false;
      if (loading) loading.hidden = true;
      if (denied) denied.hidden = true;
      if (wrap) wrap.hidden = true;
    }
  });
  byId("inviteAllowContactsBtn")?.addEventListener("click", () => {
    // Real permission: try Contacts API if available, otherwise treat Allow as granted
    inviteState.granted = true;
    loadInviteContacts();
  });
  byId("inviteSkipContactsBtn")?.addEventListener("click", () => {
    const perm = byId("invitePermissionBox");
    const wrap = byId("inviteContactsWrap");
    if (perm) perm.hidden = true;
    if (wrap) wrap.hidden = false;
    inviteState.contacts = [];
    renderInviteContacts("");
  });
  byId("inviteTryAgainBtn")?.addEventListener("click", () => {
    inviteState.granted = true;
    loadInviteContacts();
  });
  byId("searchContactInput")?.addEventListener("input", (e) => renderInviteContacts(e.target.value));
  byId("inviteShareLink")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(qrLink()); popupSuccess("Invite link copied. Share it with anyone."); }
    catch { popupError("Could not copy the link. Please copy it manually: " + qrLink()); }
  });

  /* ---------- LOGOUT ---------- */
  byId("confirmLogoutBtn")?.addEventListener("click", () => {
    popupConfirm("Logout", "Do you want to log out? You can log back in at any time with your email address and password. Your messages and account will still be there when you return.", (ok) => {
      if (!ok) return;
      console.log("LOGOUT - BACKEND - clear session");
      localStorage.removeItem("konnekt_session");
      popupSuccess("You have been logged out. Please log back in with your email address and password.");
      closePopup("logoutBg");
    });
  });

  /* ---------- DEEP SEARCH - SETTINGS LEFT + SCROLL SEARCH ICON ---------- */
  // Search icon at top: hidden until you scroll past the Search Settings input.
  // Tap it = smooth scroll back to the Search Settings input.
  const searchInput = byId("searchSettingsInput");
  const searchIconTop = byId("searchIconTopMobile");
  const settingsLeft = $(".settings-page-left");
  if (searchInput && settingsLeft) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      $$(".settings-left-item", settingsLeft).forEach(item => {
        item.style.display = (!q || item.textContent.toLowerCase().includes(q)) ? "" : "none";
      });
      console.log("DEEP SEARCH SETTINGS:", q);
    });
    settingsLeft.addEventListener("scroll", () => {
      if (!searchIconTop) return;
      // Show icon only when the search input has scrolled out of view
      const inputRect = searchInput.getBoundingClientRect();
      const leftRect = settingsLeft.getBoundingClientRect();
      const past = inputRect.bottom < leftRect.top + 10;
      searchIconTop.classList.toggle("show", past);
      searchIconTop.hidden = !past;
    });
    searchIconTop?.addEventListener("click", () => {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    });
  }

  /* ---------- SEARCH HELP CENTER ---------- */
  byId("searchHelpInput")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("#helpCenterBg .help-item").forEach(item => {
      item.style.display = (!q || item.textContent.toLowerCase().includes(q)) ? "" : "none";
    });
  });

  /* ---------- INIT ICONS ---------- */
  if (window.lucide) lucide.createIcons();
});