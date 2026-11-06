/* ============================================================
   PROFILE PAGE - JAVASCRIPT - CLEAN - FULL FILE
   Matches HTML V4 + CSS V4:
   1. Profile pic FULL inside #profileImage (not small dot)
   2. Thought + Edit = Original position, JS just toggles
   3. Preview = POPUP like before (overlay + card), not separate background
   4. Preview icons SHOW but INACTIVE - click does nothing
   5. Save ACTIVE = white (JS removes .is-inactive, CSS makes it white)
   6. All scroll = CSS own (.custom-scroll) - no JS needed for scroll
   ============================================================ */

// Wait until page don load finish before running JS
document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------
     HELPER: Refresh Lucide Icons
     Lucide needs to re-draw icons after we change DOM
     ------------------------------------------------------------ */
  const refreshIcons = () => {
    if (window.lucide) window.lucide.createIcons();
  };
  refreshIcons();

  /* ============================================================
     ELEMENTS - GET ALL FROM HTML
     ============================================================ */

  // Top Bar
  const topBarTitle = document.getElementById('topBarTitle');
  const mainSaveBtn = document.getElementById('mainSaveBtn');
  const cancelButton = document.querySelector('.cancel-button');

  // Edit Background - Only full background (Preview is now popup)
  const editBackground = document.getElementById('editBackground');

  // Profile Images - FULL inside round-profile
  // NOT inside first-circle / second-circle (those are decoration only)
  const profileImage = document.getElementById('profileImage');
  const previewProfileImage = document.getElementById('previewProfileImage');
  const roundProfileBox = document.getElementById('roundProfileBox');
  const previewRoundProfileBox = document.getElementById('previewRoundProfileBox');

  // About Me
  const aboutInput = document.getElementById('aboutInput');

  // Mood
  const moodPopup = document.getElementById('moodPopup');
  const openMoodBtn = document.getElementById('openMoodBtn');
  const closeMoodBtn = document.getElementById('closeMoodBtn');
  const moodInput = document.getElementById('moodInput');
  const moodPillText = document.getElementById('moodPillText');
  const moodSaveBtn = document.getElementById('moodSaveBtn');
  const moodSelectBtn = document.getElementById('moodSelectBtn');
  const moodSelectList = document.getElementById('moodSelectList');
  const moodSelectLabel = document.getElementById('moodSelectLabel');

  // Photo Pill
  const editPhotoBtn = document.getElementById('editPhotoBtn');
  const photoPill = document.getElementById('photoPill');
  const takePhotoBtn = document.getElementById('takePhotoBtn');
  const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const uploadPhotoInput = document.getElementById('uploadPhotoInput');

  // Spotify
  const spotifyConnectBtn = document.getElementById('spotifyConnectBtn');
  const spotifyNowPlaying = document.getElementById('spotifyNowPlaying');
  const spotifySongName = document.getElementById('spotifySongName');
  const spotifyArtistName = document.getElementById('spotifyArtistName');

  // Preview Popup - LIKE BEFORE
  // .preview-background = Overlay, .preview-popup-card = Card inside it
  const previewBackground = document.getElementById('previewBackground');
  const openPreviewBtn = document.getElementById('openPreviewBtn');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  const previewMoodBorder = document.getElementById('previewMoodBorder');
  const previewMoodText = document.getElementById('previewMoodText');
  const previewAboutText = document.getElementById('previewAboutText');
  const previewSpotify = document.getElementById('previewSpotify');
  const previewSongName = document.getElementById('previewSongName');
  const previewArtistName = document.getElementById('previewArtistName');
  const previewActionBtns = document.querySelectorAll('.preview-action-btn');

  // Full Image Viewer
  const fullImageViewer = document.getElementById('fullImageViewer');
  const fullImage = document.getElementById('fullImage');
  const closeFullImageBtn = document.getElementById('closeFullImageBtn');

  /* ============================================================
     1. SAVE BUTTON LOGIC - MAIN SAVE
     Rule: Save starts INACTIVE (grey).
     When user edits anything, we remove .is-inactive -> CSS makes it WHITE.
     Hover does NOT change it. Only active/inactive changes it.
     ============================================================ */

  // Track if user has edited anything
  let hasEditedProfile = false;
  let hasEditedMood = false;

  // Activate Main Save -> Remove inactive -> CSS shows WHITE
  function activateMainSave() {
    hasEditedProfile = true;
    if (mainSaveBtn) {
      mainSaveBtn.classList.remove('is-inactive');
    }
  }

  // Deactivate Main Save -> Add inactive -> CSS shows GREY
  function deactivateMainSave() {
    hasEditedProfile = false;
    if (mainSaveBtn) {
      mainSaveBtn.classList.add('is-inactive');
    }
  }

  // Activate Mood Save (inside Mood Popup)
  function activateMoodSave() {
    hasEditedMood = true;
    if (moodSaveBtn) {
      moodSaveBtn.classList.remove('is-inactive');
    }
  }

  // Deactivate Mood Save
  function deactivateMoodSave() {
    hasEditedMood = false;
    if (moodSaveBtn) {
      moodSaveBtn.classList.add('is-inactive');
    }
  }

  // Main Save Click: Only work if ACTIVE
  if (mainSaveBtn) {
    mainSaveBtn.addEventListener('click', () => {
      // If inactive, do nothing (CSS shows not-allowed cursor)
      if (mainSaveBtn.classList.contains('is-inactive')) {
        return;
      }
      // If active, save profile
      alert('Profile saved! ✅'); // Replace with real save / API later
      deactivateMainSave(); // After save, go back to inactive (grey) until next edit
    });
  }

  /* ============================================================
     2. ABOUT ME INPUT
     Rule: As soon as user starts typing, Main Save becomes ACTIVE (white)
     Also update Preview About text live
     ============================================================ */
  if (aboutInput) {
    aboutInput.addEventListener('input', () => {
      // Activate Main Save
      activateMainSave();
      // Update Preview About live
      if (previewAboutText) {
        previewAboutText.textContent = aboutInput.value.trim() === '' ? 'No description yet' : aboutInput.value;
      }
    });
  }

  /* ============================================================
     3. MOOD POPUP - OPEN / CLOSE
     Click Mood Pill (.thought) -> Open Mood Popup
     Click X -> Close
     Click dark background -> Close
     ============================================================ */
  if (openMoodBtn && moodPopup) {
    openMoodBtn.addEventListener('click', () => {
      moodPopup.hidden = false;
      refreshIcons();
    });
  }

  if (closeMoodBtn && moodPopup) {
    closeMoodBtn.addEventListener('click', () => {
      moodPopup.hidden = true;
    });
  }

  if (moodPopup) {
    moodPopup.addEventListener('click', (e) => {
      // Only close if user clicked the dark overlay, not the card
      if (e.target === moodPopup) {
        moodPopup.hidden = true;
      }
    });
  }

  // Typing in Mood Input -> Activate Mood Save
  if (moodInput) {
    moodInput.addEventListener('input', () => {
      activateMoodSave();
    });
  }

  /* ------------------------------------------------------------
     3A. MOOD POPUP - SELECT OPTION DROPDOWN
     Click Select -> Show/Hide list
     Click item -> Set label + Activate Save
     ------------------------------------------------------------ */
  if (moodSelectBtn && moodSelectList) {
    moodSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't close immediately
      moodSelectList.hidden = !moodSelectList.hidden;
    });

    // Close dropdown when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!moodSelectBtn.contains(e.target) && !moodSelectList.contains(e.target)) {
        moodSelectList.hidden = true;
      }
    });
  }

  // Select Option items
  const moodSelectItems = document.querySelectorAll('.mood-select-item');
  moodSelectItems.forEach(item => {
    item.addEventListener('click', () => {
      // Set label to picked option
      if (moodSelectLabel) moodSelectLabel.textContent = item.dataset.value;
      // Hide list
      if (moodSelectList) moodSelectList.hidden = true;
      // Activate Save
      activateMoodSave();
    });
  });

  /* ------------------------------------------------------------
     3B. MOOD POPUP - DURATION PILLS
     Options: 1 hour, 2 hours, 24 hours, 3 days, 1 week
     ------------------------------------------------------------ */
  const durationBtns = document.querySelectorAll('.duration-btn');
  let selectedDuration = '24 hours'; // Default (matches HTML active)

  durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      durationBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked one
      btn.classList.add('active');
      selectedDuration = btn.dataset.duration;
      activateMoodSave();
    });
  });

  /* ------------------------------------------------------------
     3C. MOOD POPUP - WHO CAN SEE MY MOOD
     Options: Contacts / Everyone
     ------------------------------------------------------------ */
  const visibilityBtns = document.querySelectorAll('.visibility-btn');
  let selectedVisibility = 'Contacts'; // Default

  visibilityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      visibilityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedVisibility = btn.dataset.visibility;
      activateMoodSave();
    });
  });

  /* ------------------------------------------------------------
     3D. MOOD POPUP - SUGGESTIONS (7 Pills)
     Rule: Click suggestion -> That text goes into Mood Input + Mood Pill
     ------------------------------------------------------------ */
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');

  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      suggestionBtns.forEach(b => b.classList.remove('active'));
      // Mark clicked one as active
      btn.classList.add('active');

      // Put suggestion text into Mood Input
      const suggestionText = btn.textContent.trim();
      if (moodInput) {
        moodInput.value = suggestionText;
      }

      // Activate Save
      activateMoodSave();
    });
  });

  /* ------------------------------------------------------------
     3E. MOOD POPUP - SAVE MOOD BUTTON
     After save:
     - Mood Pill shows mood text
     - Preview Mood Border will show it too
     - Main Save becomes ACTIVE (white)
     - Mood Popup closes
     ------------------------------------------------------------ */
  if (moodSaveBtn) {
    moodSaveBtn.addEventListener('click', () => {
      // If inactive, do nothing
      if (moodSaveBtn.classList.contains('is-inactive')) {
        return;
      }

      // Get mood text
      const moodText = moodInput ? moodInput.value.trim() : '';

      // Update Mood Pill text (top of profile)
      if (moodPillText) {
        moodPillText.textContent = moodText === '' ? 'share your mood' : moodText;
      }

      // Update Preview Mood Border
      if (previewMoodBorder && previewMoodText) {
        if (moodText === '') {
          // If no mood, hide preview border
          previewMoodBorder.hidden = true;
        } else {
          previewMoodBorder.hidden = false;
          previewMoodText.textContent = moodText;
        }
      }

      // Activate Main Save (profile changed)
      activateMainSave();

      // Close Mood Popup
      if (moodPopup) moodPopup.hidden = true;

      // Reset Mood Save to inactive until next edit
      deactivateMoodSave();
    });
  }

  /* ============================================================
     4. PROFILE IMAGE - FULL INSIDE ROUND PROFILE
     Rule: If NO pic, clicking does NOTHING
     If pic dey, clicking opens Full Image Viewer
     FIX: We use #profileImage <img> directly, NOT first-circle / second-circle
     ============================================================ */

  // Function: Update clickable state based on whether image exists
  function updateProfileClickable() {
    // Check if profileImage has src and is visible
    const hasImage = profileImage && profileImage.src !== '' && !profileImage.hidden;

    // Round Profile Box (Edit)
    if (roundProfileBox) {
      if (hasImage) {
        roundProfileBox.classList.add('is-clickable');
      } else {
        roundProfileBox.classList.remove('is-clickable');
      }
    }
    // Round Profile Box (Preview)
    if (previewRoundProfileBox) {
      if (hasImage) {
        previewRoundProfileBox.classList.add('is-clickable');
      } else {
        previewRoundProfileBox.classList.remove('is-clickable');
      }
    }
  }
  updateProfileClickable();

  // Click Round Profile (Edit) -> If image dey, open Full Image
  if (roundProfileBox) {
    roundProfileBox.addEventListener('click', (e) => {
      // Don't open full image if user clicked Edit button or Mood Pill or Photo Pill
      if (e.target.closest('#editPhotoBtn') || e.target.closest('#photoPill') || e.target.closest('#openMoodBtn')) {
        return;
      }
      if (!profileImage || profileImage.hidden || !profileImage.src) {
        // No image -> Do nothing
        return;
      }
      openFullImage(profileImage.src);
    });
  }

  // Click Preview Round Profile -> If image dey, open Full Image
  if (previewRoundProfileBox) {
    previewRoundProfileBox.addEventListener('click', (e) => {
      // Don't open if clicked mood border
      if (e.target.closest('#previewMoodBorder')) return;
      if (!previewProfileImage || previewProfileImage.hidden || !previewProfileImage.src) {
        return;
      }
      openFullImage(previewProfileImage.src);
    });
  }

  /* ============================================================
     5. EDIT BUTTON + PHOTO PILL
     Rule: Click Edit -> Pill shows (Take / Upload / Remove)
     Click Edit again -> Pill hides (Toggle)
     Edit button position is YOUR ORIGINAL (bottom -10, right 20) - JS no change am
     ============================================================ */
  if (editPhotoBtn && photoPill) {
    editPhotoBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't close immediately
      photoPill.hidden = !photoPill.hidden;
    });

    // Close Photo Pill when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!photoPill.contains(e.target) && !editPhotoBtn.contains(e.target)) {
        photoPill.hidden = true;
      }
    });
  }

  /* ------------------------------------------------------------
     Helper: Set Profile Image - FULL inside circle
     Sets BOTH Edit image and Preview image to same src
     ------------------------------------------------------------ */
  function setProfileImage(imageSrc) {
    // 1. Set Edit Profile Image (FULL)
    if (profileImage) {
      profileImage.src = imageSrc;
      profileImage.hidden = false;
    }
    // 2. Set Preview Profile Image (FULL)
    if (previewProfileImage) {
      previewProfileImage.src = imageSrc;
      previewProfileImage.hidden = false;
    }
    // 3. Update clickable state
    updateProfileClickable();
    // 4. Activate Main Save (profile changed -> white)
    activateMainSave();
  }

  // TAKE PHOTO: Opens camera on mobile, file picker on desktop
  if (takePhotoBtn && uploadPhotoInput) {
    takePhotoBtn.addEventListener('click', () => {
      uploadPhotoInput.setAttribute('capture', 'user');
      uploadPhotoInput.click();
      if (photoPill) photoPill.hidden = true;
    });
  }

  // UPLOAD PHOTO: Opens file picker
  if (uploadPhotoBtn && uploadPhotoInput) {
    uploadPhotoBtn.addEventListener('click', () => {
      uploadPhotoInput.removeAttribute('capture');
      uploadPhotoInput.click();
      if (photoPill) photoPill.hidden = true;
    });
  }

  // When user picks a file (from Take or Upload)
  if (uploadPhotoInput) {
    uploadPhotoInput.addEventListener('change', () => {
      const file = uploadPhotoInput.files[0];
      if (!file) return;
      // Read file as Data URL and show it FULL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be picked again
      uploadPhotoInput.value = '';
    });
  }

  // REMOVE PHOTO: Clears image, makes profile NOT clickable again
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      if (profileImage) {
        profileImage.src = '';
        profileImage.hidden = true;
      }
      if (previewProfileImage) {
        previewProfileImage.src = '';
        previewProfileImage.hidden = true;
      }
      updateProfileClickable();
      activateMainSave();
      if (photoPill) photoPill.hidden = true;
    });
  }

  /* ============================================================
     6. SPOTIFY CONNECT / DISCONNECT
     Rule: Click Connect -> Becomes Disconnect + Show music + Animation starts
     Click Disconnect -> Becomes Connect + Hide music + Animation pauses
     ============================================================ */
  // Demo song - Replace with real Spotify API later
  const demoSong = 'Calm Down';
  const demoArtist = 'Rema';
  let isSpotifyConnected = false;

  if (spotifyConnectBtn) {
    spotifyConnectBtn.addEventListener('click', () => {
      isSpotifyConnected = !isSpotifyConnected; // Toggle

      if (isSpotifyConnected) {
        // CONNECTED STATE
        spotifyConnectBtn.textContent = 'Disconnect';
        spotifyConnectBtn.classList.add('is-connected');

        // Show Now Playing in Connect box
        if (spotifyNowPlaying) {
          spotifyNowPlaying.hidden = false;
          if (spotifySongName) spotifySongName.textContent = demoSong;
          if (spotifyArtistName) spotifyArtistName.textContent = demoArtist;
        }

        // Show Spotify in Preview Popup
        if (previewSpotify) {
          previewSpotify.hidden = false;
          if (previewSongName) previewSongName.textContent = demoSong;
          if (previewArtistName) previewArtistName.textContent = demoArtist;
        }

        // Start music bars animation (remove paused)
        document.querySelectorAll('.music-bars').forEach(bars => {
          bars.classList.remove('paused');
        });

      } else {
        // DISCONNECTED STATE
        spotifyConnectBtn.textContent = 'Connect';
        spotifyConnectBtn.classList.remove('is-connected');

        // Hide Now Playing
        if (spotifyNowPlaying) spotifyNowPlaying.hidden = true;
        if (previewSpotify) previewSpotify.hidden = true;

        // Pause music bars animation
        document.querySelectorAll('.music-bars').forEach(bars => {
          bars.classList.add('paused');
        });
      }

      // Connecting Spotify is an edit -> Activate Main Save (white)
      activateMainSave();
    });
  }

  // At start, music bars are paused (not connected)
  document.querySelectorAll('.music-bars').forEach(bars => {
    bars.classList.add('paused');
  });

  /* ============================================================
     7. PREVIEW POPUP - LIKE BEFORE - FIXED
     Click Preview Profile -> Open Preview Popup (overlay + card)
     Click Back Chevron -> Close Preview Popup
     Click dark background (overlay) -> Close Preview Popup
     Rules:
     - If mood not written, mood border HIDDEN in preview
     - If mood written, mood border SHOWS
     - 3 icons SHOW but INACTIVE (small 20px rounds, faint)
     - About text shows what user typed
     - Spotify shows only if connected
     ============================================================ */

  // Function: Open Preview Popup
  function openPreviewPopup() {
    // Before opening, sync About text
    if (previewAboutText && aboutInput) {
      previewAboutText.textContent = aboutInput.value.trim() === '' ? 'No description yet' : aboutInput.value;
    }

    // Sync Mood: If mood is default/empty, hide border
    if (previewMoodBorder && previewMoodText && moodPillText) {
      const currentMood = moodPillText.textContent.trim();
      if (currentMood === '' || currentMood === 'share your mood') {
        previewMoodBorder.hidden = true;
      } else {
        previewMoodBorder.hidden = false;
        previewMoodText.textContent = currentMood;
      }
    }

    // Show Preview Popup (overlay)
    if (previewBackground) {
      previewBackground.hidden = false;
    }

    // Scroll Preview Card to top (custom scroll)
    const previewCard = document.querySelector('.preview-popup-card');
    if (previewCard) previewCard.scrollTop = 0;

    refreshIcons();
  }

  // Function: Close Preview Popup
  function closePreviewPopup() {
    if (previewBackground) {
      previewBackground.hidden = true;
    }
  }

  // Open Preview
  if (openPreviewBtn) {
    openPreviewBtn.addEventListener('click', openPreviewPopup);
  }

  // Close Preview with Chevron Back
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', closePreviewPopup);
  }

  // Close Preview when clicking dark background (overlay), not card
  if (previewBackground) {
    previewBackground.addEventListener('click', (e) => {
      if (e.target === previewBackground) {
        closePreviewPopup();
      }
    });
  }

  // Preview Action Buttons (Call / Video / Message) - SHOW BUT INACTIVE
  // They have .is-inactive in CSS + HTML, small 20px rounds, faint
  // Clicking does nothing
  previewActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      return; // Do nothing - inactive in preview, as you requested
    });
  });

  /* ============================================================
     8. FULL IMAGE VIEWER
     Click profile pic -> Show full image
     Click X or background -> Close
     ============================================================ */

  // Open Full Image
  function openFullImage(src) {
    if (!fullImageViewer || !fullImage) return;
    fullImage.src = src;
    fullImageViewer.hidden = false;
  }

  // Close Full Image with X
  if (closeFullImageBtn && fullImageViewer) {
    closeFullImageBtn.addEventListener('click', () => {
      fullImageViewer.hidden = true;
      if (fullImage) fullImage.src = '';
    });
  }

  // Close Full Image when clicking background
  if (fullImageViewer) {
    fullImageViewer.addEventListener('click', (e) => {
      if (e.target === fullImageViewer) {
        fullImageViewer.hidden = true;
        if (fullImage) fullImage.src = '';
      }
    });
  }

  /* ------------------------------------------------------------
     OPTIONAL: Cancel Button - Close Profile Page
     Change this to your own navigation logic
     ------------------------------------------------------------ */
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      // For now, just log. Replace with your back navigation.
      // window.history.back();
      console.log('Cancel clicked - go back');
    });
  }

});