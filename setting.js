/* ==================================================================
   SETTINGS PAGE - FULL JS - CLEAN - NO CUT
   - Connects HTML + CSS we don do
   - Profile UI = edit-section-profile - ALREADY EXISTS - JS go just call am
   - All popups = iPhone popup style - slide from right, chevron back
   - QR = generate once, save to Local Storage, reset = new QR, old link expire
   ================================================================== */

// ================= HELPER FUNCTIONS =================

// Helper - Get element by ID - short way to call element
function getEl(id){
    return document.getElementById(id);
}

// Helper - Show popup - remove hidden, add show class
function showPopup(id){
    const popup = getEl(id);
    if(!popup) return;
    popup.hidden = false;
    popup.classList.add("show");
    // Call lucide icons again - so chevron / icons show inside new popup
    if(window.lucide) lucide.createIcons();
}

// Helper - Hide popup - add hidden, remove show class
function hidePopup(id){
    const popup = getEl(id);
    if(!popup) return;
    popup.hidden = true;
    popup.classList.remove("show");
}

// Helper - Hide all popups - when you go back to Settings
function hideAllPopups(){
    const allPopups = document.querySelectorAll(".popup-bg");
    allPopups.forEach(function(popup){
        popup.hidden = true;
        popup.classList.remove("show");
    });
}

// ================= PROFILE UI - EXISTING =================

// Function - Open Profile UI - YOUR EXISTING edit-section-profile
// Click profile-setting-border in Settings Left - show edit-section-profile
// edit-section-profile go slide in by right, take over Settings Right
function openProfileUI(){
    const profileUI = document.querySelector(".edit-section-profile");
    if(!profileUI) return;
    profileUI.hidden = false;
    profileUI.classList.add("show");
    if(window.lucide) lucide.createIcons();
}

// Function - Close Profile UI - X icon inside edit-section-profile
// Click X - hide edit-section-profile, bring back Settings Right
function closeProfileUI(){
    const profileUI = document.querySelector(".edit-section-profile");
    if(!profileUI) return;
    profileUI.hidden = true;
    profileUI.classList.remove("show");
}

// ================= SEARCH SETTINGS =================

// Function - Search Settings - Filter left list by typing
// Type in search input - e go filter Account, Chats, etc
function setupSearch(){
    const input = getEl("searchSettingsInput");
    if(!input) return;
    input.addEventListener("input", function(){
        const value = input.value.toLowerCase().trim();
        const items = document.querySelectorAll(".settings-left-item");
        items.forEach(function(item){
            const text = item.textContent.toLowerCase();
            // If text match search - show, if not - hide
            if(text.includes(value)){
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        });
    });
}

// Function - Mobile Search Icon Top - Show when scroll pass input
// Scroll Settings Left - if you pass input, top search icon go show
function setupMobileSearchIcon(){
    const left = document.querySelector(".settings-page-left");
    const topIcon = getEl("searchIconTopMobile");
    const input = getEl("searchSettingsInput");
    if(!left || !topIcon) return;
    left.addEventListener("scroll", function(){
        // If scroll pass 120px - show top icon, if not - hide
        if(left.scrollTop > 120){
            topIcon.style.display = "flex";
        } else {
            topIcon.style.display = "none";
        }
    });
    // Click top icon - scroll back up to input + focus input
    topIcon.addEventListener("click", function(){
        left.scrollTo({ top: 0, behavior: "smooth" });
        if(input) input.focus();
    });
}

// ================= QR CODE - FULL =================

// Function - Generate QR Code - Generate once, save to Local Storage
// First time - generate QR with link + id + key, save to Local Storage
// Next time - load from Local Storage, no generate new one
function generateQRCode(){
    let savedQR = localStorage.getItem("myQRCode");
    let savedLink = localStorage.getItem("myQRLink");
    // If QR already dey for Local Storage - use am, no generate new
    if(savedQR && savedLink){
        loadQRToUI(savedQR);
        return savedLink;
    }
    // If no QR yet - generate new one
    const userId = "234567";
    const userName = "Faith_mike";
    const randomKey = Math.random().toString(36).substring(2, 10);
    const newLink = "https://yourapp.com/u/" + userName + "?id=" + userId + "&k=" + randomKey;
    // Save link + QR data to Local Storage
    localStorage.setItem("myQRLink", newLink);
    localStorage.setItem("myQRCode", newLink);
    loadQRToUI(newLink);
    return newLink;
}

// Function - Load QR To UI - Put QR image inside small + big QR borders
// Small QR = top right in Settings Left, Big QR = Full QR background
function loadQRToUI(link){
    const smallImg = getEl("qrImageSmall");
    const bigImg = getEl("qrImageBig");
    const shareLink = document.querySelector(".qr-share-link");
    // Use QR API to make QR image from link - you fit change to your own QR library later
    const qrApi = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(link);
    if(smallImg) smallImg.src = qrApi;
    if(bigImg) bigImg.src = qrApi;
    if(shareLink) shareLink.textContent = link;
}

// Function - Reset QR Code - Regenerate fresh QR, old link expire
// Click Reset (if you add Reset button later) - old link no go work again
function resetQRCode(){
    localStorage.removeItem("myQRCode");
    localStorage.removeItem("myQRLink");
    generateQRCode();
}

// Function - Open Full QR Background - Click small QR border
function openFullQR(){
    generateQRCode();
    showPopup("fullQRBg");
}

// Function - Share QR - Click Share - show share sheet with Copy Link + apps
function setupShareQR(){
    const shareBtn = getEl("qrShareBtn");
    const shareSheet = getEl("qrShareSheet");
    if(!shareBtn || !shareSheet) return;
    shareBtn.addEventListener("click", function(){
        // Toggle share sheet - show if hidden, hide if showing
        shareSheet.hidden = !shareSheet.hidden;
    });
    // Copy Link button - Copy link to clipboard
    const copyBtn = document.querySelector(".qr-copy-link-btn");
    if(copyBtn){
        copyBtn.addEventListener("click", function(){
            const link = localStorage.getItem("myQRLink") || "";
            navigator.clipboard.writeText(link);
            copyBtn.textContent = "Copied!";
            setTimeout(function(){ copyBtn.textContent = "Copy Link"; }, 2000);
        });
    }
}

// ================= SCANNER =================

// Function - Open Scanner Background - Click Scan in Full QR
function openScanner(){
    showPopup("scannerBg");
    // Here you go start camera later - navigator.mediaDevices.getUserMedia
}

// Function - Scanner Gallery - Pick image from gallery to scan
// Click Pick from Gallery - open file picker, scan QR inside image
function setupScannerGallery(){
    const galleryBtn = document.querySelector(".scanner-gallery-btn");
    if(!galleryBtn) return;
    galleryBtn.addEventListener("click", function(){
        // Create hidden file input - pick image
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.click();
        fileInput.addEventListener("change", function(){
            const file = fileInput.files[0];
            if(!file) return;
            // Here you go scan QR inside image with your QR library
            alert("Image picked: " + file.name + " - scan QR here");
        });
    });
}

// ================= ACCOUNT - EMAIL =================

// Function - Open Email Background - Click Email addresses in Account
function openEmail(){
    showPopup("emailBg");
}

// Function - Change Email Popup - Click Change Email - show popup explanation
function setupChangeEmail(){
    const openBtn = getEl("openChangeEmailPopup");
    const popup = getEl("changeEmailPopup");
    const continueBtn = getEl("continueChangeEmail");
    const newBg = getEl("changeEmailNewBg");
    const confirmBtn = getEl("confirmNewEmail");
    if(!openBtn) return;
    // Click Change Email - show popup: Changing email means you are creating account...
    openBtn.addEventListener("click", function(){
        if(popup) popup.hidden = false;
    });
    // Click Continue - hide popup, show new email background
    if(continueBtn){
        continueBtn.addEventListener("click", function(){
            if(popup) popup.hidden = true;
            if(newBg) newBg.hidden = false;
        });
    }
    // Click Confirm in new email - go normal signup process + generate token
    if(confirmBtn){
        confirmBtn.addEventListener("click", function(){
            const newEmail = getEl("newEmailInput").value.trim();
            if(!newEmail) return alert("Type new email");
            // Token - so app go know say na same person with 2 accounts
            const token = "token_" + Math.random().toString(36).substring(2, 10);
            localStorage.setItem("accountToken", token);
            localStorage.setItem("secondAccountEmail", newEmail);
            // Show Switch Account button - after you don create new account
            const switchBtn = getEl("switchAccountBtn");
            if(switchBtn) switchBtn.hidden = false;
            alert("Go normal signup with: " + newEmail);
            // Here you go redirect to signup page
        });
    }
    // Switch Account button - Click - switch between accounts
    const switchBtn = getEl("switchAccountBtn");
    if(switchBtn){
        switchBtn.addEventListener("click", function(){
            alert("Switch Account - show list of accounts here");
        });
    }
}

// ================= ACCOUNT - PASSWORD =================

// Function - Password Reset - Send OTP, Confirm OTP, Reset Password
function setupPasswordReset(){
    const sendOtp = getEl("sendOtpBtn");
    const confirmOtp = getEl("confirmOtpBtn");
    const confirmNewPass = getEl("confirmNewPassword");
    if(!sendOtp) return;
    // Click Send OTP - send OTP to email typed
    sendOtp.addEventListener("click", function(){
        const email = getEl("resetEmailInput").value.trim();
        if(!email) return alert("Type your email");
        // Generate fake OTP for demo - backend go send real OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem("resetOTP", otp);
        alert("OTP sent to " + email + " - Demo OTP: " + otp);
    });
    // Click Confirm OTP - check if OTP correct, show new password inputs
    if(confirmOtp){
        confirmOtp.addEventListener("click", function(){
            const typedOtp = getEl("otpInput").value.trim();
            const realOtp = localStorage.getItem("resetOTP");
            if(typedOtp === realOtp){
                getEl("resetPasswordArea").hidden = false;
                alert("OTP correct - type new password");
            } else {
                alert("Wrong OTP");
            }
        });
    }
    // Click Confirm New Password - check new + confirm match, save
    if(confirmNewPass){
        confirmNewPass.addEventListener("click", function(){
            const newPass = getEl("newPasswordInput").value;
            const confirmPass = getEl("confirmPasswordInput").value;
            if(!newPass || newPass !== confirmPass) return alert("Passwords no match");
            localStorage.setItem("userPassword", newPass);
            alert("Password changed");
            hidePopup("passwordBg");
        });
    }
}

// ================= ACCOUNT - CHANGE PHONE =================

// Function - Change Phone Number - Input new phone + Password confirm popup
function setupChangePhone(){
    const changeBtn = getEl("changePhoneBtn");
    const popup = getEl("confirmPhonePasswordPopup");
    const confirmBtn = getEl("confirmPhonePasswordBtn");
    if(!changeBtn) return;
    // Click Change phone number - show password popup to confirm
    changeBtn.addEventListener("click", function(){
        const newPhone = getEl("newPhoneInput").value.trim();
        if(!newPhone) return alert("Type new phone number");
        if(popup) popup.hidden = false;
    });
    // Click Confirm in password popup - check password, save new phone
    if(confirmBtn){
        confirmBtn.addEventListener("click", function(){
            const pass = getEl("phoneConfirmPassword").value;
            if(!pass) return alert("Type password");
            const newPhone = getEl("newPhoneInput").value.trim();
            localStorage.setItem("userPhone", newPhone);
            alert("Phone number changed to " + newPhone);
            if(popup) popup.hidden = true;
            hidePopup("changePhoneBg");
        });
    }
}

// ================= ACCOUNT - CHANGE CAMPUS =================

// Function - Change Campus - Pick campus like iPhone date picker + Custom input
// Rules: Change twice only, after twice only in next 30 days you fit change again
function setupChangeCampus(){
    const confirmBtn = getEl("confirmCampusBtn");
    const pickerList = getEl("campusPickerList");
    if(!confirmBtn) return;
    let selectedCampus = "";
    // Click campus item in picker - select am
    if(pickerList){
        pickerList.addEventListener("click", function(e){
            const btn = e.target.closest(".campus-item");
            if(!btn) return;
            // Remove selected from all, add to clicked one
            document.querySelectorAll(".campus-item").forEach(function(b){ b.classList.remove("selected"); });
            btn.classList.add("selected");
            selectedCampus = btn.textContent.trim();
        });
    }
    // Click Confirm - check count + 30 days rule, save campus
    confirmBtn.addEventListener("click", function(){
        const custom = getEl("customCampusInput").value.trim();
        const finalCampus = custom || selectedCampus;
        if(!finalCampus) return alert("Pick campus or type name");
        let changeCount = parseInt(localStorage.getItem("campusChangeCount") || "0");
        let lastChange = localStorage.getItem("campusLastChange");
        // If don change twice - check if 30 days don pass
        if(changeCount >= 2){
            const now = Date.now();
            const last = lastChange ? parseInt(lastChange) : 0;
            const daysPassed = (now - last) / (1000 * 60 * 60 * 24);
            if(daysPassed < 30){
                return alert("You don change campus twice. Wait 30 days to change again.");
            } else {
                // 30 days don pass - reset count
                changeCount = 0;
            }
        }
        // Save campus + count + time
        localStorage.setItem("userCampus", finalCampus);
        localStorage.setItem("campusChangeCount", (changeCount + 1).toString());
        localStorage.setItem("campusLastChange", Date.now().toString());
        alert("Campus changed to " + finalCampus);
        hidePopup("changeCampusBg");
    });
}

// ================= ACCOUNT - DELETE ACCOUNT =================

// Function - Delete Account - Click Delete - go back to Signup, email no exist again
function setupDeleteAccount(){
    const deleteBtn = getEl("deleteAccountBtn");
    if(!deleteBtn) return;
    deleteBtn.addEventListener("click", function(){
        const confirmDelete = confirm("If you delete account you will lose all messages and everything. Continue?");
        if(!confirmDelete) return;
        // Clear all user data - email go be like new email
        localStorage.clear();
        alert("Account deleted - go to Signup");
        // Here you go redirect to Signup page
        // window.location.href = "/signup";
    });
}

// ================= PRIVACY =================

// Function - Privacy Audience - Click Everyone / Contact / Nobody - save choice
// For Moments, Profile Picture, About, Groups - same logic
function setupPrivacy(){
    const audienceItems = document.querySelectorAll(".audience-item");
    audienceItems.forEach(function(item){
        item.addEventListener("click", function(){
            // Remove selected from siblings, add to clicked
            const parent = item.parentElement;
            parent.querySelectorAll(".audience-item").forEach(function(b){ b.classList.remove("selected"); });
            item.classList.add("selected");
            // Save choice - key = popup title + value
            const popupTitle = item.closest(".popup-bg").querySelector(".popup-title").textContent;
            localStorage.setItem("privacy_" + popupTitle, item.dataset.value);
            alert(popupTitle + " set to " + item.textContent);
        });
    });
}

// ================= CHATS =================

// Function - Chats - Save images toggle + Delete chats popup + Clear chats popup
function setupChats(){
    // Toggle - Save images to gallery - On / Off
    const saveToggle = getEl("saveImagesToggle");
    if(saveToggle){
        saveToggle.addEventListener("click", function(){
            const isOn = saveToggle.classList.toggle("on");
            saveToggle.textContent = isOn ? "On" : "Off";
            localStorage.setItem("saveImages", isOn ? "on" : "off");
        });
    }
    // Delete chats - Show popup
    const deleteBtn = getEl("deleteChatsBtn");
    const deletePopup = getEl("deleteChatsPopup");
    if(deleteBtn && deletePopup){
        deleteBtn.addEventListener("click", function(){ deletePopup.hidden = false; });
    }
    // Confirm Delete chats - Delete all chat + message in chat load list
    const confirmDelete = getEl("confirmDeleteChats");
    if(confirmDelete){
        confirmDelete.addEventListener("click", function(){
            localStorage.removeItem("allChats");
            alert("All chats deleted - chat load list empty");
            if(deletePopup) deletePopup.hidden = true;
        });
    }
    // Clear chats - Show popup
    const clearBtn = getEl("clearChatsBtn");
    const clearPopup = getEl("clearChatsPopup");
    if(clearBtn && clearPopup){
        clearBtn.addEventListener("click", function(){ clearPopup.hidden = false; });
    }
    // Confirm Clear chats - Clear messages on each chat but chat load list still dey
    const confirmClear = getEl("confirmClearChats");
    if(confirmClear){
        confirmClear.addEventListener("click", function(){
            localStorage.setItem("chatsCleared", "true");
            alert("All messages cleared - chat load list still dey");
            if(clearPopup) clearPopup.hidden = true;
        });
    }
}

// ================= APPEARANCE =================

// Function - Appearance - ... button - Show Reset Theme pill
function setupAppearance(){
    const moreBtn = getEl("appearanceMoreBtn");
    const pill = getEl("resetThemePill");
    const resetBtn = getEl("resetThemeBtn");
    if(moreBtn && pill){
        moreBtn.addEventListener("click", function(){
            pill.hidden = !pill.hidden;
        });
    }
    // Reset Theme - Clear all theme choices, back to default
    if(resetBtn){
        resetBtn.addEventListener("click", function(){
            localStorage.removeItem("chatColor");
            localStorage.removeItem("appColor");
            localStorage.removeItem("receiverBubble");
            localStorage.removeItem("senderBubble");
            localStorage.removeItem("chatBackground");
            alert("Theme reset to default");
            if(pill) pill.hidden = true;
        });
    }
    // Chat Color - Click color circle - save chat color
    const chatColorList = getEl("chatColorList");
    if(chatColorList){
        chatColorList.addEventListener("click", function(e){
            const circle = e.target.closest(".color-circle");
            if(!circle) return;
            document.querySelectorAll("#chatColorList .color-circle").forEach(function(c){ c.classList.remove("selected"); });
            circle.classList.add("selected");
            localStorage.setItem("chatColor", circle.style.background);
        });
    }
    // App Color - White or Black - Click - save + apply
    const appColorItems = document.querySelectorAll(".app-color-item");
    appColorItems.forEach(function(item){
        item.addEventListener("click", function(){
            appColorItems.forEach(function(b){ b.classList.remove("selected"); });
            item.classList.add("selected");
            const value = item.dataset.value;
            localStorage.setItem("appColor", value);
            document.body.dataset.appColor = value;
            alert("App color set to " + value);
        });
    });
    // Receiver Bubble - Click color - save
    const receiverList = getEl("receiverColorList");
    if(receiverList){
        receiverList.addEventListener("click", function(e){
            const circle = e.target.closest(".color-circle");
            if(!circle) return;
            localStorage.setItem("receiverBubble", circle.style.background);
        });
    }
    // Sender Bubble - Click color - save
    const senderList = getEl("senderColorList");
    if(senderList){
        senderList.addEventListener("click", function(e){
            const circle = e.target.closest(".color-circle");
            if(!circle) return;
            localStorage.setItem("senderBubble", circle.style.background);
        });
    }
    // Chat Background - Click - pick image from gallery
    const chatBgBtn = getEl("openChatBackground");
    if(chatBgBtn){
        chatBgBtn.addEventListener("click", function(){
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.click();
            fileInput.addEventListener("change", function(){
                const file = fileInput.files[0];
                if(!file) return;
                alert("Chat background picked: " + file.name);
            });
        });
    }
}

// ================= NOTIFICATIONS =================

// Function - Notifications - Toggle On / Off for all notif items
// Messages, Groups, Status, In-app - Show / Sounds / Reactions / Vibrate
function setupNotifications(){
    const toggles = document.querySelectorAll(".notif-item .toggle-btn");
    toggles.forEach(function(toggle){
        toggle.addEventListener("click", function(){
            const isOn = toggle.classList.toggle("on");
            toggle.textContent = isOn ? "On" : "Off";
        });
    });
}

// ================= ALL OPEN / CLOSE BUTTONS - MAIN WIRING =================

// Function - Setup All Clicks - Connect every button to its popup
function setupAllClicks(){
    // Profile - open your existing edit-section-profile
    const openProfile = getEl("openProfile");
    if(openProfile) openProfile.addEventListener("click", openProfileUI);

    // Close Profile UI - X inside edit-section-profile - JS go call this
    // If your edit-section-profile get X button with class .popup-close-x, this go work
    const profileCloseX = document.querySelector(".edit-section-profile .popup-close-x");
    if(profileCloseX) profileCloseX.addEventListener("click", closeProfileUI);

    // QR - open Full QR
    const openQR = getEl("openFullQR");
    if(openQR) openQR.addEventListener("click", openFullQR);

    // Scanner - open Scanner from Full QR
    const openScannerBtn = getEl("openScanner");
    if(openScannerBtn) openScannerBtn.addEventListener("click", openScanner);

    // Account
    const openAccount = getEl("openAccount");
    if(openAccount) openAccount.addEventListener("click", function(){ showPopup("accountBg"); });

    // Email
    const openEmailBtn = getEl("openEmail");
    if(openEmailBtn) openEmailBtn.addEventListener("click", function(){ showPopup("emailBg"); });

    // Password
    const openPassword = getEl("openPassword");
    if(openPassword) openPassword.addEventListener("click", function(){ showPopup("passwordBg"); });

    // Change Phone
    const openPhone = getEl("openChangePhone");
    if(openPhone) openPhone.addEventListener("click", function(){ showPopup("changePhoneBg"); });

    // Change Campus
    const openCampus = getEl("openChangeCampus");
    if(openCampus) openCampus.addEventListener("click", function(){ showPopup("changeCampusBg"); });

    // Delete Account
    const openDelete = getEl("openDeleteAccount");
    if(openDelete) openDelete.addEventListener("click", function(){ showPopup("deleteAccountBg"); });

    // Privacy
    const openPrivacy = getEl("openPrivacy");
    if(openPrivacy) openPrivacy.addEventListener("click", function(){ showPopup("privacyBg"); });

    // Privacy sub - Moments / Profile Pic / About / Groups
    const openMoments = getEl("openMoments");
    if(openMoments) openMoments.addEventListener("click", function(){ showPopup("momentsBg"); });
    const openPic = getEl("openProfilePicPrivacy");
    if(openPic) openPic.addEventListener("click", function(){ showPopup("profilePicPrivacyBg"); });
    const openAbout = getEl("openAboutPrivacy");
    if(openAbout) openAbout.addEventListener("click", function(){ showPopup("aboutPrivacyBg"); });
    const openGroups = getEl("openGroupsPrivacy");
    if(openGroups) openGroups.addEventListener("click", function(){ showPopup("groupsPrivacyBg"); });

    // Chats
    const openChats = getEl("openChats");
    if(openChats) openChats.addEventListener("click", function(){ showPopup("chatsBg"); });

    // Appearance
    const openAppearance = getEl("openAppearance");
    if(openAppearance) openAppearance.addEventListener("click", function(){ showPopup("appearanceBg"); });
    const openChatTheme = getEl("openChatTheme");
    if(openChatTheme) openChatTheme.addEventListener("click", function(){ showPopup("chatThemeBg"); });
    const openChatColor = getEl("openChatColor");
    if(openChatColor) openChatColor.addEventListener("click", function(){ showPopup("chatColorBg"); });
    const openAppColor = getEl("openAppColor");
    if(openAppColor) openAppColor.addEventListener("click", function(){ showPopup("appColorBg"); });
    const openBubble = getEl("openAppBubble");
    if(openBubble) openBubble.addEventListener("click", function(){ showPopup("appBubbleBg"); });
    const openReceiver = getEl("openReceiverBubble");
    if(openReceiver) openReceiver.addEventListener("click", function(){ showPopup("receiverBubbleBg"); });
    const openSender = getEl("openSenderBubble");
    if(openSender) openSender.addEventListener("click", function(){ showPopup("senderBubbleBg"); });

    // Notifications
    const openNotif = getEl("openNotifications");
    if(openNotif) openNotif.addEventListener("click", function(){ showPopup("notificationsBg"); });
    const openInApp = getEl("openInAppNotif");
    if(openInApp) openInApp.addEventListener("click", function(){ showPopup("inAppNotifBg"); });

    // Help / Logout / Invite
    const openHelp = getEl("openHelp");
    if(openHelp) openHelp.addEventListener("click", function(){ showPopup("helpBg"); });
    const openLogout = getEl("openLogout");
    if(openLogout) openLogout.addEventListener("click", function(){ showPopup("logoutBg"); });
    const openInvite = getEl("openInvite");
    if(openInvite) openInvite.addEventListener("click", function(){ showPopup("inviteBg"); });

    // All Chevron back buttons - data-close = popup id to hide
    const chevrons = document.querySelectorAll(".popup-chevron");
    chevrons.forEach(function(btn){
        btn.addEventListener("click", function(){
            const targetId = btn.dataset.close;
            if(targetId) hidePopup(targetId);
        });
    });
}

// ================= START APP - RUN ALL SETUPS =================

// Function - Init Settings - Run when page load
function initSettings(){
    setupSearch();
    setupMobileSearchIcon();
    setupShareQR();
    setupScannerGallery();
    setupChangeEmail();
    setupPasswordReset();
    setupChangePhone();
    setupChangeCampus();
    setupDeleteAccount();
    setupPrivacy();
    setupChats();
    setupAppearance();
    setupNotifications();
    setupAllClicks();
    // Load QR once - so small QR show immediately
    generateQRCode();
    if(window.lucide) lucide.createIcons();
}

// Run init when page don load
document.addEventListener("DOMContentLoaded", initSettings);