// ================================================================
// NK NEW CHAT JS - CLEAN - NO CUT - NO DUPLICATE
// No wiggle, No liquid click, No duplicate Toggle / Mic / Gallery / Sticker / Voice / Hold
// Main JS owns: openChat, closeChat, toggles, mic send, gallery, hold, reaction
// Reaction JS owns: sticker, voice, preview, FFmpeg, plus pill, input limit
// This file ONLY owns: New Chat / New ID / Profile ID / New Group / Permissions / Recent Chats Scroll
// ================================================================
(function(){
  // ---------- DOM - PLUS SCREEN ----------
  const chatLoadList = document.querySelector('.chat-load-list');
  const chatContainer = document.getElementById('chatContainer');
  const chatBg = document.getElementById('chatBackground');
  const chatMessages = document.getElementById('chatMessages');

  const newChatOverlay = document.getElementById('nkNewChatOverlay');
  const chattedPeopleList = document.getElementById('nkChattedPeopleList');
  const mainSearchInput = document.getElementById('nkMainSearchInput');
  const mainSearchResults = document.getElementById('nkMainSearchResults');

  // New ID
  const newIdOverlay = document.getElementById('nkNewIdOverlay');
  const newIdRow = document.getElementById('nkNewIdRow');
  const newIdBack = document.getElementById('nkNewIdBack');
  const newIdMark = document.getElementById('nkNewIdMark');
  const firstNameInput = document.getElementById('nkFirstName');
  const lastNameInput = document.getElementById('nkLastName');
  const idInput = document.getElementById('nkIdInput');
  const konnektingWrap = document.getElementById('nkKonnektingWrap');

  // User Profile ID Required
  const userProfileOverlay = document.getElementById('nkUserProfileOverlay');
  const userProfileBack = document.getElementById('nkUserProfileBack');
  const userProfileClose = document.getElementById('nkUserProfileClose');
  const userProfileHeaderTitle = document.getElementById('nkUserProfileHeaderTitle');
  const profileBigCircle = document.getElementById('nkProfileBigCircle');
  const profileInitial = document.getElementById('nkProfileInitial');
  const profileName = document.getElementById('nkProfileName');
  const profileUsername = document.getElementById('nkProfileUsername');
  const profileIdInput = document.getElementById('nkProfileIdInput');
  const profileKonnektingWrap = document.getElementById('nkProfileKonnektingWrap');
  const profileNextBtn = document.getElementById('nkProfileNextBtn');

  // New Group
  const newGroupOverlay = document.getElementById('nkNewGroupOverlay');
  const newGroupRow = document.getElementById('nkNewGroupRow');
  const newGroupBack = document.getElementById('nkNewGroupBack');
  const newGroupBackDesktop = document.getElementById('nkNewGroupBackDesktop');
  const groupSearchInput = document.getElementById('nkGroupSearchInput');
  const groupPeopleResults = document.getElementById('nkGroupPeopleResults');
  const groupNextBtn = document.getElementById('nkGroupNextBtn');

  // Group Create
  const groupCreateOverlay = document.getElementById('nkGroupCreateOverlay');
  const groupCreateBack = document.getElementById('nkGroupCreateBack');
  const groupNameInput = document.getElementById('nkGroupNameInput');
  const groupImageBtn = document.getElementById('nkGroupImageBtn');
  const groupImageInput = document.getElementById('nkGroupImageInput');
  const groupImagePreview = document.getElementById('nkGroupImagePreview');
  const permissionRow = document.getElementById('nkGroupPermissionRow');
  const finalCreateBtn = document.getElementById('nkGroupFinalCreateBtn');

  // Permissions
  const permissionOverlay = document.getElementById('nkGroupPermissionOverlay');
  const permissionBack = document.getElementById('nkPermissionBack');
  const permissionDone = document.getElementById('nkPermissionDoneBtn');

  // Buttons
  const startChatBtn = document.querySelector('.start-chat-btn');
  const newChatClose = document.getElementById('nkNewChatClose');
  const newChatBackDesktop = document.getElementById('nkNewChatBackDesktop');

  // Popup - Scoped to New Chat, Main popup is separate
  const popupOverlay = document.getElementById('nkPopupOverlay');
  const popupTitle = document.getElementById('nkPopupTitle');
  const popupDesc = document.getElementById('nkPopupDesc');
  const popupBtn = document.getElementById('nkPopupBtn');

  // ---------- STATE ----------
  let fakeChats = [];
  let fakeMessagesMap = {};
  let selectedMembers = [];
  let selectedProfileUser = null;

  // ---------- MOCK GLOBAL USERS - Backend will replace ----------
  const mockGlobalUsers = [
    { username: "ola", name: "Ola John", requiresId: false, avatar: "O", id: "111111", gradient: "linear-gradient(135deg, #FF6B6B, #EE5A24)" },
    { username: "king", name: "King David", requiresId: true, avatar: "K", id: "123456", gradient: "linear-gradient(135deg, #70A1FF, #1E90FF)" },
    { username: "testuser", name: "Test User", requiresId: false, avatar: "T", id: "222222", gradient: "linear-gradient(135deg, #7BED9F, #2ED573)" },
    { username: "joshua", name: "joshua", requiresId: true, avatar: "j", id: "333333", gradient: "linear-gradient(135deg, #FFA502, #FF7F50)" },
    { username: "olarenwaju", name: "olarenwaju", requiresId: false, avatar: "o", id: "444444", gradient: "linear-gradient(135deg, #A29BFE, #6C5CE7)" },
  ];
  const avatarGradients = [
    "linear-gradient(135deg, #FF6B6B, #EE5A24)",
    "linear-gradient(135deg, #70A1FF, #1E90FF)",
    "linear-gradient(135deg, #7BED9F, #2ED573)",
    "linear-gradient(135deg, #FFA502, #FF7F50)",
    "linear-gradient(135deg, #A29BFE, #6C5CE7)"
  ];
  function getGradient(name){
    let h=0; const n=name||'User'; for(let i=0;i<n.length;i++) h+=n.charCodeAt(i);
    return avatarGradients[h%avatarGradients.length];
  }
  function isMobile(){ return window.innerWidth <= 768; }
  function refreshIcons(){ if(window.lucide) lucide.createIcons(); }
  // FIX: Avatar from real chat-item - image OR initials + colour, NOT blue
  function nkAvatarFromItem(item){
    if(!item) return {hasImage:false,src:'',initials:'U',bg:'#2a2a2a'};
    const av = item.querySelector('.chat-avatar');
    const name = item.querySelector('.chat-name')?.textContent || 'User';
    const parts = name.trim().split(/\s+/);
    const initials = (parts.length===1 ? parts[0][0] : parts[0][0]+parts[parts.length-1][0]).toUpperCase().slice(0,2);
    const img = av?.querySelector('img');
    const hasImage = !!(av?.classList.contains('has-image') && img?.src);
    const bg = av?.style.background || getGradient(name);
    return {hasImage, src: img?.src || '', initials, bg, name};
  }

  // ---------- BACKEND READY ----------
  function searchUsers(query){
    if(!query) return { type: "none", results: [] };
    if(query.startsWith("@")){
      const q = query.slice(1).toLowerCase();
      const results = mockGlobalUsers.filter(u => u.username.toLowerCase().includes(q));
      return { type: "global", results };
    }
    return { type: "local", query };
  }
  function getUserByUsername(username){
    const clean = (username||'').replace("@","").toLowerCase();
    return mockGlobalUsers.find(u => u.username.toLowerCase() === clean) || null;
  }
  function validateChatId(user, enteredId){
    if(!user.requiresId) return true;
    return enteredId === user.id;
  }
  window.nkSearchUsers = searchUsers;
  window.nkGetUserByUsername = getUserByUsername;

  // ---------- LOCK BODY + HIDE PILL ONLY MOBILE ----------
  function anyNewChatOpen(){
    return !!document.querySelector('.nk-newchat-overlay.show, .nk-newchat-overlay.open');
  }
  function lockBody(){
    document.body.classList.add('nk-lock-scroll');
    if(isMobile()){
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar, nav.mobile-nav,.start-up,.konnekt-incoming-tile').forEach(el=>{ if(el) el.classList.add('nk-hide-pill-sidebar'); });
    }
  }
  function unlockBody(){
    if(!anyNewChatOpen()){
      document.body.classList.remove('nk-lock-scroll');
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar, nav.mobile-nav,.start-up,.konnekt-incoming-tile').forEach(el=>{ if(el) el.classList.remove('nk-hide-pill-sidebar'); });
    }
  }
  window.nkLockBody = lockBody;
  window.nkUnlockBody = unlockBody;

  // ---------- POPUP ----------
  function showPopup(title, desc){
    if(!popupOverlay) return;
    if(popupTitle) popupTitle.textContent = title;
    if(popupDesc) popupDesc.textContent = desc;
    popupOverlay.classList.remove('hidden');
    popupOverlay.classList.add('show');
    refreshIcons();
  }
  function hidePopup(){
    if(!popupOverlay) return;
    popupOverlay.classList.remove('show');
    popupOverlay.classList.add('hidden');
  }
  window.nkShowPopup = showPopup;
  if(popupBtn && !popupBtn.dataset.nkBound){ popupBtn.dataset.nkBound='1'; popupBtn.addEventListener('click', hidePopup); }
  if(popupOverlay && !popupOverlay.dataset.nkBound){ popupOverlay.dataset.nkBound='1'; popupOverlay.addEventListener('click', (e)=>{ if(e.target === popupOverlay) hidePopup(); }); }

  // ---------- OPEN FAKE CHAT - Use Main JS openChat if available ----------
  function openChatForElement(el){
    if(!el) return;
    if(window.openChat && el.classList.contains('chat-item')){ window.openChat(el); return; }
    const fakeId = el.dataset.userId || el.dataset.groupId || el.dataset.fakeId;
    if(fakeId) openFakeChatBg(fakeId);
  }
  function openFakeChatBg(id){
    const chat = fakeChats.find(c=>c.id===id);
    if(!chat) return;
    const realItem = chatContainer?.querySelector(`.chat-item[data-user-id="${id}"], .chat-item[data-group-id="${id}"]`);
    if(realItem && window.openChat){ window.openChat(realItem); return; }
    if(chatBg && !window.openChat){
      if(isMobile()){ chatLoadList?.classList.add('mobile-hide'); chatBg?.classList.add('mobile-show'); }
      chatBg?.classList.add('active-chat');
      const headerName = chatBg.querySelector('.chat-name');
      if(headerName) headerName.textContent = chat.name;
      renderFakeMessages(id);
    }
    refreshIcons();
  }
  function renderFakeMessages(id){
    if(!chatMessages || window.openChat) return;
    const msgs = fakeMessagesMap[id] || [];
    const enc = chatMessages.querySelector('.encryption-notice');
    const dateSep = chatMessages.querySelector('.date-sep');
    chatMessages.innerHTML = '';
    if(enc) chatMessages.appendChild(enc);
    if(dateSep) chatMessages.appendChild(dateSep);
    msgs.forEach(m=>{
      const row = document.createElement('div');
      row.className = `msg-row ${m.sender}`;
      row.innerHTML = `<div class="bubble ${m.sender}-bubble"><p></p><span class="msg-meta right-meta"><span class="msg-time">now</span></span></div>`;
      row.querySelector('p').textContent = m.text;
      chatMessages.appendChild(row);
    });
    const typing = document.getElementById('typingIndicator');
    if(typing) chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function createFakeChatElement(chatObj, subText){
    const initials = (chatObj.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const div = document.createElement('div');
    div.className = 'chat-item nk-fake' + (chatObj.isGroup ? ' group' : '');
    div.dataset.chat = chatObj.id;
    div.dataset.type = chatObj.isGroup ? 'group' : 'chat';
    div.dataset.userId = chatObj.id;
    // FIX: Avatar - use gradient, initials, NOT blue. If image later, Main JS will sync it.
    div.innerHTML = `<div class="chat-avatar" style="background:${chatObj.gradient||getGradient(chatObj.name)};--ava-bg:${chatObj.gradient||getGradient(chatObj.name)}"><span class="avatar-initials">${initials}</span></div><div class="chat-info"><div class="chat-top-row"><p class="chat-name">${chatObj.name}</p><span class="chat-date">now</span></div><div class="chat-bottom-row"><p class="chat-last-message">${subText||''}</p></div></div>`;
    div.addEventListener('click', ()=>{ if(window.openChat) window.openChat(div); else openFakeChatBg(chatObj.id); });
    chatContainer?.prepend(div);
    return div;
  }

  // ---------- RENDER CHATTED LIST + MAIN SEARCH @USERNAME - Like Add Member ----------
  function renderChattedList(filter=''){
    if(!chattedPeopleList || !mainSearchResults) return;
    const f = (filter||'').trim();

    if(f.startsWith("@")){
      const { results } = searchUsers(f);
      mainSearchResults.classList.remove('hidden');
      chattedPeopleList.classList.add('hidden');
      if(!results.length){
        mainSearchResults.innerHTML = `<div class="nk-empty">No @username found for "${f}"</div>`;
      } else {
        let html = '';
        results.forEach(u=>{
          // FIX: Direct = blue, NOT green. Requires ID = orange.
          const badge = u.requiresId ? `<span style="font-size:11px;color:#ff9f0a;margin-left:6px;">• Requires ID</span>` : `<span style="font-size:11px;color:#0a84ff;margin-left:6px;">• Direct</span>`;
          html += `<button class="nk-newchat-row nk-person-row" data-global-username="${u.username}"><div class="nk-row-icon nk-person-avatar" style="background:${u.gradient};--ava-bg:${u.gradient}"><span>${u.avatar}</span></div><div class="nk-row-info"><p class="nk-row-title">${u.name} ${badge}</p><p class="nk-row-sub">@${u.username}</p></div><i data-lucide="chevron-right" class="nk-chevron"></i></button>`;
        });
        mainSearchResults.innerHTML = html;
        mainSearchResults.querySelectorAll('[data-global-username]').forEach(btn=>{
          if(btn.dataset.nkBound) return; btn.dataset.nkBound='1';
          btn.addEventListener('click', ()=> handleGlobalUsernameClick(btn.dataset.globalUsername));
        });
      }
      refreshIcons();
      fixNewChatScroll();
      return;
    }

    mainSearchResults.classList.add('hidden');
    chattedPeopleList.classList.remove('hidden');
    const existingItems = document.querySelectorAll('#chatContainer .chat-item');
    let html = '';
    const lower = f.toLowerCase();
    // FIX: Recent Chats - Like Add Member: Round avatar (image OR initials + colour), Name, Last msg, Blocked = blur + tag
    existingItems.forEach(item=>{
      const name = item.querySelector('.chat-name')?.textContent?.trim() || 'User';
      const blocked = item.classList.contains('blocked-item');
      if(!lower || name.toLowerCase().includes(lower)){
        const av = nkAvatarFromItem(item);
        const last = item.querySelector('.chat-last-message')?.textContent || '';
        const isDraft = item.querySelector('.chat-last-message')?.classList.contains('is-draft');
        const avHtml = av.hasImage ? `<div class="nk-recent-ava has-image" style="--ava-bg:${av.bg};background:${av.bg}"><img src="${av.src}"><span>${av.initials}</span></div>` : `<div class="nk-recent-ava" style="--ava-bg:${av.bg};background:${av.bg}"><span>${av.initials}</span></div>`;
        html += `<button class="nk-recent-row ${blocked?'blocked-row':''}" data-chat-name="${name}" data-blocked="${blocked?'true':'false'}">${avHtml}<div class="nk-recent-info"><p class="nk-recent-name">${name}</p><p class="nk-recent-sub">${blocked?'Blocked':(isDraft?last:last)}</p></div><span class="nk-recent-blocked">Blocked</span></button>`;
      }
    });
    fakeChats.filter(c=> !lower || c.name.toLowerCase().includes(lower)).forEach(c=>{
      html += `<button class="nk-recent-row" data-fake-id="${c.id}"><div class="nk-recent-ava" style="--ava-bg:${c.gradient||getGradient(c.name)};background:${c.gradient||getGradient(c.name)}"><span>${c.name[0].toUpperCase()}</span></div><div class="nk-recent-info"><p class="nk-recent-name">${c.name}</p></div></button>`;
    });
    if(!html){
      // FIX: New Chat empty = only Konnekt encryption notice, no fake rows
      chattedPeopleList.innerHTML = f ? `<div class="nk-empty">No results for "${f}"</div>` : `<div class="nk-encryption-only"><p>Messages are end-to-end encrypted. No one outside of this chat, not even Konnekt, can read or listen to them.</p></div>`;
    } else {
      chattedPeopleList.innerHTML = html;
      chattedPeopleList.querySelectorAll('[data-chat-name]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const name = btn.dataset.chatName;
          let found = null;
          document.querySelectorAll('#chatContainer .chat-item').forEach(it=>{ if((it.querySelector('.chat-name')?.textContent||'').trim()===name) found=it; });
          if(!found) return;
          if(found.classList.contains('blocked-item')){
            const pop = document.getElementById('unblockPopup'); if(pop){ pop.classList.remove('hidden'); pop.classList.add('show'); }
            return;
          }
          closeAllNewChat();
          if(window.openChat) window.openChat(found); else openFakeChatBg(found.dataset.userId);
        });
      });
      chattedPeopleList.querySelectorAll('[data-fake-id]').forEach(btn=>{ btn.addEventListener('click', ()=>{ closeAllNewChat(); openFakeChatBg(btn.dataset.fakeId); }); });
    }
    refreshIcons();
    fixNewChatScroll();
  }
  window.nkRenderChattedList = renderChattedList;

  // ---------- HANDLE GLOBAL @USERNAME CLICK ----------
  function handleGlobalUsernameClick(username){
    const user = getUserByUsername(username);
    if(!user) return;
    if(!user.requiresId) createFakeChatDirect(user);
    else openProfileIdRequired(user);
  }
  function createFakeChatDirect(user){
    const id = user.id || ('u'+Date.now());
    const existing = fakeChats.find(c=> c.id===id);
    if(!existing){
      const chatObj = { id, name: user.name, username: user.username, fake:true, gradient: user.gradient };
      fakeChats.unshift(chatObj);
      fakeMessagesMap[id] = [{ text:`Chat with ${user.name} @${user.username} started`, sender:'other' }];
      createFakeChatElement(chatObj, `@${user.username} - Direct chat`);
    }
    closeAllNewChat();
    const el = chatContainer?.querySelector(`.chat-item[data-user-id="${id}"]`);
    if(el && window.openChat) window.openChat(el); else openFakeChatBg(id);
  }
  function openProfileIdRequired(user){
    selectedProfileUser = user;
    if(userProfileHeaderTitle) userProfileHeaderTitle.textContent = `New @${user.username}`;
    if(profileName) profileName.textContent = user.name;
    if(profileUsername) profileUsername.textContent = `@${user.username}`;
    if(profileInitial) profileInitial.textContent = user.avatar;
    if(profileBigCircle) profileBigCircle.style.background = user.gradient;
    if(profileIdInput) profileIdInput.value = '';
    profileKonnektingWrap?.classList.add('hidden');
    userProfileOverlay?.classList.add('show');
    lockBody();
    refreshIcons();
    profileIdInput?.focus();
  }

  // ---------- PLUS SCREEN OPEN / CLOSE - X Icon Instant, No Wiggle ----------
  function openNewChat(){
    renderChattedList();
    if(mainSearchInput) mainSearchInput.value = '';
    if(mainSearchResults){ mainSearchResults.classList.add('hidden'); mainSearchResults.innerHTML=''; }
    chattedPeopleList?.classList.remove('hidden');
    newChatOverlay?.classList.add('show');
    lockBody();
    refreshIcons();
    fixNewChatScroll();
  }
  function closeAllNewChat(){
    document.querySelectorAll('.nk-newchat-overlay').forEach(o=>o.classList.remove('show','open'));
    unlockBody();
  }
  function closeNewChat(){
    newChatOverlay?.classList.remove('show');
    unlockBody();
  }
  window.openNewChat = openNewChat;
  window.closeNewChat = closeAllNewChat;
  window.openAddMember = function(){ newGroupOverlay?.classList.add('show'); lockBody(); renderGroupPeople(); refreshIcons(); };
  if(startChatBtn && !startChatBtn.dataset.nkBound){ startChatBtn.dataset.nkBound='1'; startChatBtn.addEventListener('click', openNewChat); }
  if(newChatClose && !newChatClose.dataset.nkBound){ newChatClose.dataset.nkBound='1'; newChatClose.addEventListener('click', closeNewChat); }
  if(newChatBackDesktop && !newChatBackDesktop.dataset.nkBound){ newChatBackDesktop.dataset.nkBound='1'; newChatBackDesktop.addEventListener('click', closeNewChat); }
  if(mainSearchInput && !mainSearchInput.dataset.nkBound){ mainSearchInput.dataset.nkBound='1'; mainSearchInput.addEventListener('input', (e)=>{ renderChattedList(e.target.value); }); }

  // ---------- NEW ID FLOW ----------
  if(newIdRow && !newIdRow.dataset.nkBound){
    newIdRow.dataset.nkBound='1';
    newIdRow.addEventListener('click', ()=>{
      newIdOverlay?.classList.add('show');
      lockBody();
      firstNameInput?.focus();
      refreshIcons();
    });
  }
  if(newIdBack && !newIdBack.dataset.nkBound){
    newIdBack.dataset.nkBound='1';
    newIdBack.addEventListener('click', ()=>{
      newIdOverlay?.classList.remove('show');
      if(!newChatOverlay?.classList.contains('show')) unlockBody();
    });
  }
  function createFakeChatFromId(){
    const fn = firstNameInput?.value.trim() || 'User';
    const ln = lastNameInput?.value.trim() || '';
    const id = idInput?.value.trim();
    if(!id){ showPopup('Enter ID', 'Please enter 6 digit ID'); return; }
    if(id.length!==6 ||!/^\d+$/.test(id)){ showPopup('Invalid ID', 'ID must be 6 numbers only'); return; }
    konnektingWrap?.classList.remove('hidden');
    refreshIcons();
    setTimeout(()=>{
      const name = `${fn} ${ln}`.trim();
      const chatObj = { id, name, fake:true, gradient: getGradient(name) };
      fakeChats.unshift(chatObj);
      fakeMessagesMap[id] = [{ text:`Fake chat with ${name} - ID ${id} started`, sender:'other' }];
      createFakeChatElement(chatObj, `ID: ${id} - Fake test chat`);
      konnektingWrap?.classList.add('hidden');
      newIdOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      unlockBody();
      if(firstNameInput) firstNameInput.value=''; if(lastNameInput) lastNameInput.value=''; if(idInput) idInput.value='';
      const el = chatContainer?.querySelector(`.chat-item[data-user-id="${id}"]`);
      if(el && window.openChat) window.openChat(el); else openFakeChatBg(id);
    }, 1200);
  }
  if(newIdMark && !newIdMark.dataset.nkBound){ newIdMark.dataset.nkBound='1'; newIdMark.addEventListener('click', createFakeChatFromId); }
  if(idInput && !idInput.dataset.nkBound){
    idInput.dataset.nkBound='1';
    idInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') createFakeChatFromId(); });
    idInput.addEventListener('input', ()=>{ idInput.value = idInput.value.replace(/\D/g,'').slice(0,6); });
  }

  // ---------- PROFILE ID REQUIRED FLOW ----------
  if(userProfileBack && !userProfileBack.dataset.nkBound){
    userProfileBack.dataset.nkBound='1';
    userProfileBack.addEventListener('click', ()=>{
      userProfileOverlay?.classList.remove('show');
      selectedProfileUser = null;
      lockBody();
    });
  }
  if(userProfileClose && !userProfileClose.dataset.nkBound){
    userProfileClose.dataset.nkBound='1';
    userProfileClose.addEventListener('click', ()=>{
      userProfileOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      selectedProfileUser = null;
      unlockBody();
    });
  }
  if(profileIdInput && !profileIdInput.dataset.nkBound){
    profileIdInput.dataset.nkBound='1';
    profileIdInput.addEventListener('input', ()=>{ profileIdInput.value = profileIdInput.value.replace(/\D/g,'').slice(0,6); });
    profileIdInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') handleProfileNext(); });
  }
  function handleProfileNext(){
    if(!selectedProfileUser){ showPopup('No user', 'Select user first'); return; }
    const entered = profileIdInput?.value.trim();
    if(!entered){ showPopup('Enter ID', `This user @${selectedProfileUser.username} requires 6 digit ID`); return; }
    if(entered.length!==6 ||!/^\d+$/.test(entered)){ showPopup('Invalid ID', 'ID must be 6 numbers'); return; }
    const ok = validateChatId(selectedProfileUser, entered);
    if(!ok){ showPopup('Wrong ID', `Wrong ID for @${selectedProfileUser.username}. Try ${selectedProfileUser.id}`); return; }
    profileKonnektingWrap?.classList.remove('hidden');
    refreshIcons();
    setTimeout(()=>{
      const id = selectedProfileUser.id;
      const existing = fakeChats.find(c=> c.id===id);
      if(!existing){
        const chatObj = { id, name: selectedProfileUser.name, username: selectedProfileUser.username, fake:true, gradient: selectedProfileUser.gradient };
        fakeChats.unshift(chatObj);
        fakeMessagesMap[id] = [{ text:`Chat with ${selectedProfileUser.name} @${selectedProfileUser.username} verified ${entered}`, sender:'other' }];
        createFakeChatElement(chatObj, `@${selectedProfileUser.username} - ID verified`);
      }
      profileKonnektingWrap?.classList.add('hidden');
      userProfileOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      const chatId = selectedProfileUser.id;
      selectedProfileUser = null;
      unlockBody();
      const el = chatContainer?.querySelector(`.chat-item[data-user-id="${chatId}"]`);
      if(el && window.openChat) window.openChat(el); else openFakeChatBg(chatId);
    }, 1200);
  }
  if(profileNextBtn && !profileNextBtn.dataset.nkBound){ profileNextBtn.dataset.nkBound='1'; profileNextBtn.addEventListener('click', handleProfileNext); }

  // ---------- NEW GROUP ----------
  if(newGroupRow && !newGroupRow.dataset.nkBound){
    newGroupRow.dataset.nkBound='1';
    newGroupRow.addEventListener('click', ()=>{
      newGroupOverlay?.classList.add('show');
      lockBody();
      renderGroupPeople();
      refreshIcons();
    });
  }
  function closeGroupOverlay(){
    newGroupOverlay?.classList.remove('show');
    if(!newChatOverlay?.classList.contains('show')) unlockBody(); else lockBody();
  }
  if(newGroupBack && !newGroupBack.dataset.nkBound){ newGroupBack.dataset.nkBound='1'; newGroupBack.addEventListener('click', closeGroupOverlay); }
  if(newGroupBackDesktop && !newGroupBackDesktop.dataset.nkBound){ newGroupBackDesktop.dataset.nkBound='1'; newGroupBackDesktop.addEventListener('click', closeGroupOverlay); }

  // FIX: Group Add Members search must filter - name + ID + username
  function renderGroupPeople(filter=''){
    if(!groupPeopleResults) return;
    let html='';
    const lower = (filter||'').toLowerCase();
    fakeChats.filter(c=> c.name.toLowerCase().includes(lower) || (c.id||'').includes(lower) || (c.username||'').toLowerCase().includes(lower)).forEach(c=>{
      const selected = selectedMembers.includes(c.id);
      html+=`<button class="nk-newchat-row" data-pick-id="${c.id}" style="${selected?'opacity:0.5;background:rgba(10,132,255,0.12)':''};pointer-events:auto;"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(c.name)};--ava-bg:${getGradient(c.name)}"><span>${(c.name||'U')[0]}</span></div><div class="nk-row-info"><p class="nk-row-title">${c.name}</p><p class="nk-row-sub">${c.id}</p></div><i data-lucide="${selected?'check-circle-2':'circle'}" style="width:20px;height:20px;color:${selected?'#0a84ff':'#3a3a3c'}"></i></button>`;
    });
    const real = document.querySelectorAll('#chatContainer .chat-item');
    real.forEach(item=>{
      const name = item.querySelector('.chat-name')?.textContent?.trim()||'User';
      if(name.toLowerCase().includes(lower)){
        const selId = 'real_'+name;
        const selected = selectedMembers.includes(selId);
        const av = nkAvatarFromItem(item);
        const avHtml = av.hasImage ? `<div class="nk-row-icon nk-person-avatar has-image" style="background:${av.bg};--ava-bg:${av.bg}"><img src="${av.src}" style="width:100%;height:100%;object-fit:cover;border-radius:999px;"><span style="display:none">${av.initials}</span></div>` : `<div class="nk-row-icon nk-person-avatar" style="background:${av.bg};--ava-bg:${av.bg}"><span>${av.initials}</span></div>`;
        html+=`<button class="nk-newchat-row" data-pick-real="${name}" style="pointer-events:auto;${selected?'opacity:0.5;background:rgba(10,132,255,0.12)':''}">${avHtml}<div class="nk-row-info"><p class="nk-row-title">${name}</p></div><i data-lucide="${selected?'check-circle-2':'circle'}" style="width:20px;height:20px;color:${selected?'#0a84ff':'#3a3a3c'}"></i></button>`;
      }
    });
    if(!html) groupPeopleResults.innerHTML=`<div class="nk-empty">No results for "${filter}"<br>You haven't chatted with anyone yet</div>`;
    else{
      groupPeopleResults.innerHTML=html;
      groupPeopleResults.querySelectorAll('[data-pick-id]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const id=btn.dataset.pickId;
          if(selectedMembers.includes(id)){ selectedMembers=selectedMembers.filter(x=>x!==id); }
          else{ selectedMembers.push(id); }
          renderGroupPeople(groupSearchInput?.value||'');
        });
      });
      groupPeopleResults.querySelectorAll('[data-pick-real]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const name=btn.dataset.pickReal;
          const id='real_'+name;
          if(selectedMembers.includes(id)){ selectedMembers=selectedMembers.filter(x=>x!==id); }
          else{ selectedMembers.push(id); }
          renderGroupPeople(groupSearchInput?.value||'');
        });
      });
    }
    refreshIcons();
    fixNewChatScroll();
  }
  window.nkRenderGroupPeople = renderGroupPeople;
  if(groupSearchInput && !groupSearchInput.dataset.nkBound){ groupSearchInput.dataset.nkBound='1'; groupSearchInput.addEventListener('input', (e)=> renderGroupPeople(e.target.value)); }

  if(groupNextBtn && !groupNextBtn.dataset.nkBound){
    groupNextBtn.dataset.nkBound='1';
    groupNextBtn.addEventListener('click', ()=>{
      if(selectedMembers.length===0){ showPopup('Select members', 'Please select at least 1 member'); return; }
      groupCreateOverlay?.classList.add('show');
      lockBody();
      refreshIcons();
    });
  }
  if(groupCreateBack && !groupCreateBack.dataset.nkBound){
    groupCreateBack.dataset.nkBound='1';
    groupCreateBack.addEventListener('click', ()=>{ groupCreateOverlay?.classList.remove('show'); lockBody(); });
  }
  if(groupImageBtn && !groupImageBtn.dataset.nkBound){ groupImageBtn.dataset.nkBound='1'; groupImageBtn.addEventListener('click', ()=> groupImageInput?.click()); }
  if(groupImageInput && !groupImageInput.dataset.nkBound){
    groupImageInput.dataset.nkBound='1';
    groupImageInput.addEventListener('change', (e)=>{
      const file=e.target.files[0]; if(!file) return;
      const url=URL.createObjectURL(file);
      if(groupImagePreview){ groupImagePreview.src=url; groupImagePreview.style.display='block'; }
      refreshIcons();
    });
  }
  if(permissionRow && !permissionRow.dataset.nkBound){
    permissionRow.dataset.nkBound='1';
    permissionRow.addEventListener('click', ()=>{
      permissionOverlay?.classList.add('show');
      lockBody();
      refreshIcons();
    });
  }
  if(permissionBack && !permissionBack.dataset.nkBound){
    permissionBack.dataset.nkBound='1';
    permissionBack.addEventListener('click', ()=>{ permissionOverlay?.classList.remove('show'); lockBody(); });
  }
  if(permissionDone && !permissionDone.dataset.nkBound){
    permissionDone.dataset.nkBound='1';
    permissionDone.addEventListener('click', ()=>{ permissionOverlay?.classList.remove('show'); lockBody(); });
  }
  // NOTE: .nk-toggle - Main JS owns it, DO NOT bind here. No duplicate.

  if(finalCreateBtn && !finalCreateBtn.dataset.nkBound){
    finalCreateBtn.dataset.nkBound='1';
    finalCreateBtn.addEventListener('click', ()=>{
      const gName = groupNameInput?.value.trim();
      if(!gName){ showPopup('Group name', 'Please enter group name'); return; }
      if(selectedMembers.length===0){ showPopup('No members', 'Select at least 1 member'); return; }
      const gid = 'g'+Date.now();
      const chatObj = { id:gid, name:gName, fake:true, isGroup:true, gradient: getGradient(gName) };
      fakeChats.unshift(chatObj);
      fakeMessagesMap[gid]=[{ text:`Group ${gName} created with ${selectedMembers.length} members`, sender:'other' }];
      createFakeChatElement(chatObj, `Group with ${selectedMembers.length} members`);
      permissionOverlay?.classList.remove('show');
      groupCreateOverlay?.classList.remove('show');
      newGroupOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      unlockBody();
      if(groupNameInput) groupNameInput.value=''; selectedMembers=[];
      if(groupImagePreview){ groupImagePreview.style.display='none'; groupImagePreview.src=''; }
      const el = chatContainer?.querySelector(`.chat-item[data-user-id="${gid}"]`);
      if(el && window.openChat) window.openChat(el); else openFakeChatBg(gid);
    });
  }

  // ---------- FIX: Recent Chats + List Scroll ----------
  function fixNewChatScroll(){
    document.querySelectorAll('.nk-down-section, .nk-results, .nk-plus-scroll-area, .nk-newchat-list, #nkChattedPeopleList, #nkMainSearchResults, #nkGroupPeopleResults').forEach(function(el){
      el.style.overflowY = 'auto';
      el.style.touchAction = 'pan-y';
      el.style.webkitOverflowScrolling = 'touch';
    });
  }
  window.nkFixNewChatScroll = fixNewChatScroll;
  document.querySelectorAll('.nk-newchat-overlay').forEach(ov=>{
    if(ov.dataset.nkScrollBound) return; ov.dataset.nkScrollBound='1';
    ov.addEventListener('touchmove', (e)=>{
      if(!isMobile()) return;
      const scrollArea = e.target.closest('.nk-plus-scroll-area, .nk-form-wrap, .nk-profile-wrap, .nk-newchat-list, .nk-permission-list, .nk-down-section, .nk-results, #nkChattedPeopleList, #nkMainSearchResults, #nkGroupPeopleResults');
      if(scrollArea) return;
      e.preventDefault();
    }, { passive:false });
  });
  new MutationObserver(fixNewChatScroll).observe(document.body, {childList:true, subtree:true});
  fixNewChatScroll();

  window.addEventListener('resize', ()=>{
    if(!isMobile()){
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar').forEach(el=>{ el.classList.remove('nk-hide-pill-sidebar'); });
    }
  });

  console.log('NK NEW CHAT JS loaded - No wiggle, No duplicate, Scroll fixed');
})();