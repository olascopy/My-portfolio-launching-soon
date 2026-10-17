
// ================================================================
// NK NEW CHAT JS V9 FINAL - FIX EVERYTHING
// - X icon working all (close, back, profile close) with wiggle iPhone
// - Popup centered desktop (chat-load-list area) + mobile full center
// - Search @username round no border, @ -> global, name -> local
// - Fake chat active fix: normal list clickable, group add works
// - Direct @username vs ID required flow with profile overlay
// - Backend ready: searchUsers(), getUserByUsername(), validateChatId()
// - Chocolate mobile, hide pill only mobile, lock scroll, no drag
// - All lucide icons, grey borders, 10 tiny leaves konnekting
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

  // User Profile ID Required - for @username that needs ID
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

  // Popup
  const popupOverlay = document.getElementById('nkPopupOverlay');
  const popupTitle = document.getElementById('nkPopupTitle');
  const popupDesc = document.getElementById('nkPopupDesc');
  const popupBtn = document.getElementById('nkPopupBtn');

  // ---------- FAKE MEMORY - REFRESH CLEARS ----------
  let fakeChats = [];
  let fakeMessagesMap = {};
  let selectedMembers = [];
  let currentFakeId = null;
  let selectedProfileUser = null;

  // ---------- MOCK GLOBAL USERS - FAKE DEMO BEFORE BACKEND ----------
  // Other devs: Replace with API later, keep same structure requiresId true/false
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
    let h=0; for(let i=0;i<name.length;i++) h+=name.charCodeAt(i);
    return avatarGradients[h%avatarGradients.length];
  }
  function isMobile(){ return window.innerWidth <= 768; }

  // ---------- BACKEND READY FUNCTIONS ----------
  // Other devs: Swap with fetch when backend ready
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
    const clean = username.replace("@","").toLowerCase();
    return mockGlobalUsers.find(u => u.username.toLowerCase() === clean) || null;
  }
  function validateChatId(user, enteredId){
    if(!user.requiresId) return true;
    return enteredId === user.id;
  }

  // ---------- LOCK BODY + HIDE PILL ONLY MOBILE ----------
  function lockBody(){
    document.body.classList.add('nk-lock-scroll');
    if(isMobile()){
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar, nav.mobile-nav,.start-up,.konnekt-incoming-tile').forEach(el=>{
        if(el) el.classList.add('nk-hide-pill-sidebar');
      });
    }
  }
  function unlockBody(){
    const anyOpen = document.querySelector('.nk-newchat-overlay.show');
    if(!anyOpen){
      document.body.classList.remove('nk-lock-scroll');
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar, nav.mobile-nav,.start-up,.konnekt-incoming-tile').forEach(el=>{
        if(el) el.classList.remove('nk-hide-pill-sidebar');
      });
    }
  }

  // ---------- POPUP - NICE IPHONE CLICKS - CENTERED ----------
  // Other devs: Popup works desktop + mobile, centered over your stuff on desktop
  function showPopup(title, desc){
    if(!popupOverlay) return;
    if(popupTitle) popupTitle.textContent = title;
    if(popupDesc) popupDesc.textContent = desc;
    popupOverlay.classList.remove('hidden');
    void popupOverlay.offsetWidth;
    popupOverlay.classList.add('show');
    if(window.lucide) lucide.createIcons();
  }
  function hidePopup(){
    if(!popupOverlay) return;
    popupOverlay.classList.remove('show');
    setTimeout(()=> popupOverlay.classList.add('hidden'), 240);
  }
  popupBtn?.addEventListener('click', hidePopup);
  popupOverlay?.addEventListener('click', (e)=>{ if(e.target === popupOverlay) hidePopup(); });

  function wiggleX(btn){
    if(!btn) return;
    btn.classList.remove('nk-wiggle');
    void btn.offsetWidth;
    btn.classList.add('nk-wiggle');
    setTimeout(()=> btn.classList.remove('nk-wiggle'), 450);
  }

  // ---------- RENDER CHATTED LIST + MAIN SEARCH @USERNAME ----------
  function renderChattedList(filter=''){
    if(!chattedPeopleList || !mainSearchResults) return;

    if(filter.startsWith("@")){
      // Global @username search
      const { results } = searchUsers(filter);
      mainSearchResults.classList.remove('hidden');
      chattedPeopleList.classList.add('hidden');
      if(!results.length){
        mainSearchResults.innerHTML = `<div class="nk-empty">No @username found for "${filter}"</div>`;
      } else {
        let html = '';
        results.forEach(u=>{
          const badge = u.requiresId ? `<span style="font-size:11px;color:#ff9f0a;margin-left:6px;">• Requires ID</span>` : `<span style="font-size:11px;color:#34c759;margin-left:6px;">• Direct</span>`;
          html += `
            <button class="nk-newchat-row nk-person-row" data-global-username="${u.username}">
              <div class="nk-row-icon nk-person-avatar" style="background:${u.gradient}">${u.avatar}</div>
              <div class="nk-row-info"><p class="nk-row-title">${u.name} ${badge}</p><p class="nk-row-sub">@${u.username}</p></div>
              <i data-lucide="chevron-right" class="nk-chevron"></i>
            </button>
          `;
        });
        mainSearchResults.innerHTML = html;
        mainSearchResults.querySelectorAll('[data-global-username]').forEach(btn=>{
          btn.addEventListener('click', ()=> handleGlobalUsernameClick(btn.dataset.globalUsername));
        });
      }
      if(window.lucide) lucide.createIcons();
      return;
    }

    // Local name search - chatted people
    mainSearchResults.classList.add('hidden');
    chattedPeopleList.classList.remove('hidden');

    const existingItems = document.querySelectorAll('#chatContainer .chat-item');
    let html = '';
    const lower = filter.toLowerCase();

    existingItems.forEach(item=>{
      const name = item.querySelector('.chat-name')?.textContent?.trim() || 'User';
      if(!lower || name.toLowerCase().includes(lower)){
        const avatar = item.querySelector('.chat-avatar')?.textContent || name[0];
        html += `<button class="nk-newchat-row nk-person-row" data-name="${name}"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(name)}">${avatar.slice(0,2).toUpperCase()}</div><div class="nk-row-info"><p class="nk-row-title">${name}</p></div></button>`;
      }
    });

    fakeChats.filter(c=> !lower || c.name.toLowerCase().includes(lower)).forEach(c=>{
      html += `<button class="nk-newchat-row nk-person-row" data-fake-id="${c.id}"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(c.name)}">${c.name[0]}</div><div class="nk-row-info"><p class="nk-row-title">${c.name} <span class="nk-fake-badge">FAKE</span></p></div></button>`;
    });

    if(!html){
      chattedPeopleList.innerHTML = filter ? `<div class="nk-empty">No results for "${filter}"</div>` : `<div class="nk-empty">You haven't chatted with anyone yet<br>Start with New ID or search @username</div>`;
    } else {
      chattedPeopleList.innerHTML = html;
      chattedPeopleList.querySelectorAll('[data-fake-id]').forEach(btn=>{ btn.addEventListener('click', ()=> openFakeChatBg(btn.dataset.fakeId)); });
    }
    if(window.lucide) lucide.createIcons();
  }

  // ---------- HANDLE GLOBAL @USERNAME CLICK ----------
  function handleGlobalUsernameClick(username){
    const user = getUserByUsername(username);
    if(!user) return;
    if(!user.requiresId){
      createFakeChatDirect(user);
    } else {
      openProfileIdRequired(user);
    }
  }

  function createFakeChatDirect(user){
    const id = user.id || ('u'+Date.now());
    const existing = fakeChats.find(c=> c.id===id);
    if(!existing){
      const chatObj = { id, name: user.name, username: user.username, fake:true };
      fakeChats.unshift(chatObj);
      fakeMessagesMap[id] = [{ text:`Chat with ${user.name} @${user.username} started `, sender:'other' }];
      const initials = user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const div = document.createElement('div');
      div.className = 'chat-item nk-fake';
      div.dataset.userId = id;
      div.style.pointerEvents = 'auto'; // fix block
      div.innerHTML = `<div class="chat-avatar" style="background:${user.gradient}">${initials}</div><div class="chat-info"><div class="chat-top-row"><p class="chat-name">${user.name} <span class="nk-fake-badge">FAKE</span></p><span class="chat-date">now</span></div><div class="chat-bottom-row"><p class="chat-last-message">@${user.username} - Direct chat</p></div></div>`;
      chatContainer?.prepend(div);
      div.addEventListener('click', ()=> openFakeChatBg(id));
    }
    newChatOverlay?.classList.remove('show');
    unlockBody();
    openFakeChatBg(id);
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
    if(window.lucide) lucide.createIcons();
    profileIdInput?.focus();
  }

  // ---------- PLUS SCREEN OPEN/CLOSE - X ICON WORKING ----------
  function openNewChat(){
    renderChattedList();
    if(mainSearchInput) mainSearchInput.value = '';
    if(mainSearchResults){ mainSearchResults.classList.add('hidden'); mainSearchResults.innerHTML=''; }
    chattedPeopleList?.classList.remove('hidden');
    newChatOverlay?.classList.add('show');
    lockBody();
    if(window.lucide) lucide.createIcons();
  }
  function closeNewChat(){
    // X icon working with wiggle iPhone 17
    wiggleX(newChatClose);
    wiggleX(newChatBackDesktop);
    setTimeout(()=>{
      newChatOverlay?.classList.remove('show');
      unlockBody();
    }, 180);
  }
  startChatBtn?.addEventListener('click', openNewChat);
  newChatClose?.addEventListener('click', closeNewChat);
  newChatBackDesktop?.addEventListener('click', closeNewChat);
  mainSearchInput?.addEventListener('input', (e)=>{ renderChattedList(e.target.value.trim()); });

  // ---------- NEW ID FLOW - X + BACK WORKING ----------
  newIdRow?.addEventListener('click', ()=>{
    newIdOverlay?.classList.add('show');
    lockBody();
    firstNameInput?.focus();
    if(window.lucide) lucide.createIcons();
  });
  newIdBack?.addEventListener('click', ()=>{
    wiggleX(newIdBack);
    setTimeout(()=>{
      newIdOverlay?.classList.remove('show');
      if(!newChatOverlay?.classList.contains('show')) unlockBody();
    }, 150);
  });

  function createFakeChatFromId(){
    const fn = firstNameInput?.value.trim() || 'User';
    const ln = lastNameInput?.value.trim() || '';
    const id = idInput?.value.trim();
    if(!id){ showPopup('Enter ID', 'Please enter 6 digit ID'); return; }
    if(id.length!==6 ||!/^\d+$/.test(id)){ showPopup('Invalid ID', 'ID must be 6 numbers only'); return; }
    konnektingWrap?.classList.remove('hidden');
    if(window.lucide) lucide.createIcons();
    setTimeout(()=>{
      const name = `${fn} ${ln}`.trim();
      const chatObj = { id, name, fake:true };
      fakeChats.unshift(chatObj);
      fakeMessagesMap[id] = [{ text:`Fake chat with ${name} - ID ${id} started `, sender:'other' }];
      const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const div = document.createElement('div');
      div.className = 'chat-item nk-fake';
      div.dataset.userId = id;
      div.style.pointerEvents = 'auto';
      div.innerHTML = `<div class="chat-avatar" style="background:${getGradient(name)}">${initials}</div><div class="chat-info"><div class="chat-top-row"><p class="chat-name">${name} <span class="nk-fake-badge">FAKE</span></p><span class="chat-date">now</span></div><div class="chat-bottom-row"><p class="chat-last-message">ID: ${id} - Fake test chat</p></div></div>`;
      chatContainer?.prepend(div);
      div.addEventListener('click', ()=> openFakeChatBg(id));
      konnektingWrap?.classList.add('hidden');
      newIdOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      unlockBody();
      firstNameInput.value=''; lastNameInput.value=''; idInput.value='';
      openFakeChatBg(id);
    }, 1200);
  }
  newIdMark?.addEventListener('click', createFakeChatFromId);
  idInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') createFakeChatFromId(); });
  idInput?.addEventListener('input', ()=>{ idInput.value = idInput.value.replace(/\D/g,'').slice(0,6); });

  // ---------- PROFILE ID REQUIRED FLOW - X WORKING ----------
  userProfileBack?.addEventListener('click', ()=>{
    wiggleX(userProfileBack);
    setTimeout(()=>{
      userProfileOverlay?.classList.remove('show');
      selectedProfileUser = null;
      lockBody();
    }, 150);
  });
  userProfileClose?.addEventListener('click', ()=>{
    wiggleX(userProfileClose);
    setTimeout(()=>{
      userProfileOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      selectedProfileUser = null;
      unlockBody();
    }, 150);
  });
  profileIdInput?.addEventListener('input', ()=>{ profileIdInput.value = profileIdInput.value.replace(/\D/g,'').slice(0,6); });
  profileIdInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') handleProfileNext(); });

  function handleProfileNext(){
    if(!selectedProfileUser){ showPopup('No user', 'Select user first'); return; }
    const entered = profileIdInput?.value.trim();
    if(!entered){ showPopup('Enter ID', `This user @${selectedProfileUser.username} requires 6 digit ID`); return; }
    if(entered.length!==6 ||!/^\d+$/.test(entered)){ showPopup('Invalid ID', 'ID must be 6 numbers'); return; }
    const ok = validateChatId(selectedProfileUser, entered);
    if(!ok){ showPopup('Wrong ID', `Wrong ID for @${selectedProfileUser.username}. Try ${selectedProfileUser.id}`); return; }
    profileKonnektingWrap?.classList.remove('hidden');
    if(window.lucide) lucide.createIcons();
    setTimeout(()=>{
      const id = selectedProfileUser.id;
      const existing = fakeChats.find(c=> c.id===id);
      if(!existing){
        const chatObj = { id, name: selectedProfileUser.name, username: selectedProfileUser.username, fake:true };
        fakeChats.unshift(chatObj);
        fakeMessagesMap[id] = [{ text:`Chat with ${selectedProfileUser.name} @${selectedProfileUser.username} verified ${entered} 🎉`, sender:'other' }];
        const initials = selectedProfileUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
        const div = document.createElement('div');
        div.className = 'chat-item nk-fake';
        div.dataset.userId = id;
        div.style.pointerEvents = 'auto';
        div.innerHTML = `<div class="chat-avatar" style="background:${selectedProfileUser.gradient}">${initials}</div><div class="chat-info"><div class="chat-top-row"><p class="chat-name">${selectedProfileUser.name} <span class="nk-fake-badge">FAKE</span></p><span class="chat-date">now</span></div><div class="chat-bottom-row"><p class="chat-last-message">@${selectedProfileUser.username} - ID verified</p></div></div>`;
        chatContainer?.prepend(div);
        div.addEventListener('click', ()=> openFakeChatBg(id));
      }
      profileKonnektingWrap?.classList.add('hidden');
      userProfileOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      const chatId = selectedProfileUser.id;
      selectedProfileUser = null;
      unlockBody();
      openFakeChatBg(chatId);
    }, 1200);
  }
  profileNextBtn?.addEventListener('click', handleProfileNext);

  // ---------- FAKE CHAT BACKGROUND - FIX NOT BLOCKING ----------
  function openFakeChatBg(id){
    currentFakeId = id;
    const chat = fakeChats.find(c=>c.id===id);
    if(!chat ||!chatBg) return;
    if(isMobile()){
      chatLoadList?.classList.add('mobile-hide');
      chatBg?.classList.add('mobile-show');
      document.querySelector('.sidebar-section')?.classList.add('hide-nav');
    }
    chatBg?.classList.add('active-chat');
    const headerName = chatBg.querySelector('.chat-name');
    const profileText = chatBg.querySelector('.profile-text');
    if(headerName) headerName.textContent = chat.name;
    if(profileText) profileText.textContent = chat.name[0];
    renderFakeMessages(id);
    if(window.lucide) lucide.createIcons();
  }
  function renderFakeMessages(id){
    if(!chatMessages) return;
    const msgs = fakeMessagesMap[id] || [];
    const enc = chatMessages.querySelector('.encryption-notice');
    const dateSep = chatMessages.querySelector('.date-sep');
    chatMessages.innerHTML = '';
    if(enc) chatMessages.appendChild(enc);
    if(dateSep) chatMessages.appendChild(dateSep);
    msgs.forEach(m=>{
      const row = document.createElement('div');
      row.className = `msg-row ${m.sender}`;
      row.innerHTML = `<div class="bubble ${m.sender}-bubble"><p>${m.text.replace(/\n/g,'<br>')}</p><span class="msg-meta right-meta"><span class="msg-time">now</span></span></div>`;
      chatMessages.appendChild(row);
    });
    const typing = document.getElementById('typingIndicator');
    if(typing) chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  const msgInput = document.getElementById('msgInput');
  const micSendBtn = document.getElementById('micSendBtn');
  function sendFake(){
    if(!currentFakeId ||!msgInput) return;
    const t = msgInput.value.trim(); if(!t) return;
    fakeMessagesMap[currentFakeId].push({ text:t, sender:'sender' });
    renderFakeMessages(currentFakeId);
    if(window.resetInputBar) window.resetInputBar(); else msgInput.value='';
    setTimeout(()=>{
      fakeMessagesMap[currentFakeId].push({ text:'Fake reply for testing ', sender:'receiver' });
      renderFakeMessages(currentFakeId);
    }, 800);
  }
  micSendBtn?.addEventListener('click', ()=>{ if(currentFakeId && msgInput?.value.trim()) sendFake(); });
  msgInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter' &&!e.shiftKey && currentFakeId){ e.preventDefault(); sendFake(); } });

  const origClose = window.closeChat;
  window.closeChat = function(){
    currentFakeId=null;
    if(origClose) origClose();
    else{
      if(isMobile()){
        chatLoadList?.classList.remove('mobile-hide');
        chatBg?.classList.remove('mobile-show');
      }
      chatBg?.classList.remove('active-chat');
    }
    unlockBody();
  };

  // ---------- NEW GROUP - FIX CLICK WORKING ----------
  newGroupRow?.addEventListener('click', ()=>{
    newGroupOverlay?.classList.add('show');
    lockBody();
    renderGroupPeople();
    if(window.lucide) lucide.createIcons();
  });
  newGroupBack?.addEventListener('click', ()=>{
    wiggleX(newGroupBack);
    setTimeout(()=>{
      newGroupOverlay?.classList.remove('show');
      if(!newChatOverlay?.classList.contains('show')) unlockBody();
      else lockBody();
    }, 150);
  });
  newGroupBackDesktop?.addEventListener('click', ()=>{
    wiggleX(newGroupBackDesktop);
    setTimeout(()=>{
      newGroupOverlay?.classList.remove('show');
      if(!newChatOverlay?.classList.contains('show')) unlockBody();
    }, 150);
  });

  function renderGroupPeople(filter=''){
    if(!groupPeopleResults) return;
    let html='';
    const lower = filter.toLowerCase();
    // Fake chats - now clickable fix
    fakeChats.filter(c=> c.name.toLowerCase().includes(lower) || c.id.includes(lower)).forEach(c=>{
      const selected = selectedMembers.includes(c.id);
      html+=`<button class="nk-newchat-row" data-pick-id="${c.id}" style="${selected?'opacity:0.5;background:rgba(10,132,255,0.12)':''};pointer-events:auto;"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(c.name)}">${c.name[0]}</div><div class="nk-row-info"><p class="nk-row-title">${c.name}</p><p class="nk-row-sub">${c.id}</p></div><i data-lucide="${selected?'check-circle-2':'circle'}" style="width:20px;height:20px;color:${selected?'#0a84ff':'#3a3a3c'}"></i></button>`;
    });
    const real = document.querySelectorAll('#chatContainer .chat-item');
    real.forEach(item=>{
      const name = item.querySelector('.chat-name')?.textContent?.trim()||'User';
      if(name.toLowerCase().includes(lower)){
        html+=`<button class="nk-newchat-row" data-pick-real="${name}" style="pointer-events:auto;"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(name)}">${name[0]}</div><div class="nk-row-info"><p class="nk-row-title">${name}</p></div><i data-lucide="circle" style="width:20px;height:20px;color:#3a3a3c"></i></button>`;
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
      // Real users pick also
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
    if(window.lucide) lucide.createIcons();
  }
  groupSearchInput?.addEventListener('input', (e)=> renderGroupPeople(e.target.value));

  groupNextBtn?.addEventListener('click', ()=>{
    if(selectedMembers.length===0){ showPopup('Select members', 'Please select at least 1 member'); return; }
    groupCreateOverlay?.classList.add('show');
    lockBody();
    if(window.lucide) lucide.createIcons();
  });
  groupCreateBack?.addEventListener('click', ()=>{
    wiggleX(groupCreateBack);
    setTimeout(()=>{ groupCreateOverlay?.classList.remove('show'); lockBody(); }, 150);
  });

  groupImageBtn?.addEventListener('click', ()=> groupImageInput?.click());
  groupImageInput?.addEventListener('change', (e)=>{
    const file=e.target.files[0]; if(!file) return;
    const url=URL.createObjectURL(file);
    groupImagePreview.src=url; groupImagePreview.style.display='block';
    if(window.lucide) lucide.createIcons();
  });

  permissionRow?.addEventListener('click', ()=>{
    permissionOverlay?.classList.add('show');
    lockBody();
    if(window.lucide) lucide.createIcons();
  });
  permissionBack?.addEventListener('click', ()=>{
    wiggleX(permissionBack);
    setTimeout(()=>{ permissionOverlay?.classList.remove('show'); lockBody(); }, 150);
  });
  permissionDone?.addEventListener('click', ()=>{
    wiggleX(permissionDone);
    setTimeout(()=>{ permissionOverlay?.classList.remove('show'); lockBody(); }, 150);
  });

  document.querySelectorAll('.nk-toggle').forEach(t=>{
    t.addEventListener('click', ()=>{ const on = t.dataset.on==='true'; t.dataset.on = (!on).toString(); });
  });

  finalCreateBtn?.addEventListener('click', ()=>{
    const gName = groupNameInput?.value.trim();
    if(!gName){ showPopup('Group name', 'Please enter group name'); return; }
    if(selectedMembers.length===0){ showPopup('No members', 'Select at least 1 member'); return; }
    const gid = 'g'+Date.now();
    const chatObj = { id:gid, name:gName, fake:true };
    fakeChats.unshift(chatObj);
    fakeMessagesMap[gid]=[{ text:`Group ${gName} created with ${selectedMembers.length} members `, sender:'other' }];
    const div=document.createElement('div');
    div.className='chat-item group nk-fake';
    div.dataset.groupId=gid;
    div.style.pointerEvents='auto';
    div.innerHTML=`<div class="chat-avatar group-avatar" style="background:${getGradient(gName)}">${gName[0]}</div><div class="chat-info"><div class="chat-top-row"><p class="chat-name">${gName} <span class="nk-fake-badge">FAKE</span></p><span class="chat-date">now</span></div><div class="chat-bottom-row"><p class="chat-last-message">Group with ${selectedMembers.length} members</p></div></div>`;
    chatContainer?.prepend(div);
    div.addEventListener('click', ()=> openFakeChatBg(gid));
    permissionOverlay?.classList.remove('show');
    groupCreateOverlay?.classList.remove('show');
    newGroupOverlay?.classList.remove('show');
    newChatOverlay?.classList.remove('show');
    unlockBody();
    groupNameInput.value=''; selectedMembers=[]; if(groupImagePreview){ groupImagePreview.style.display='none'; groupImagePreview.src=''; }
    openFakeChatBg(gid);
  });

  // Prevent drag up only mobile
  document.querySelectorAll('.nk-newchat-overlay').forEach(ov=>{
    ov.addEventListener('touchmove', (e)=>{
      if(!isMobile()) return;
      const sheet = ov.querySelector('.nk-newchat-sheet');
      const scrollArea = ov.querySelector('.nk-plus-scroll-area, .nk-form-wrap, .nk-profile-wrap, .nk-newchat-list, .nk-permission-list');
      if(scrollArea && scrollArea.contains(e.target)) return;
      if(sheet && sheet.contains(e.target) && scrollArea) return;
      e.preventDefault();
    }, { passive:false });
  });

  window.addEventListener('resize', ()=>{
    if(!isMobile()){
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar').forEach(el=>{
        el.classList.remove('nk-hide-pill-sidebar');
      });
    }
  });

  console.log('NK JS V9 loaded - X working all, popup centered, fake chat fix, @username flow');

  // Liquid click + wiggle follow - no glow
function nkLiquid(el){
  if(!el) return;
  el.classList.remove('nk-liquid-click');
  void el.offsetWidth; // reflow
  el.classList.add('nk-liquid-click');
  setTimeout(()=> el.classList.remove('nk-liquid-click'), 450);
}
document.addEventListener('click', (e)=>{
  const row = e.target.closest('.nk-newchat-row, .nk-next-border, .nk-popup-btn, .nk-big-circle, .nk-back-btn, .nk-close-btn');
  if(row) nkLiquid(row);
});


})();
