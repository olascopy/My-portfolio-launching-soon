// ================================================================
// NK NEW CHAT JS V5 FINAL - FULL FIX
// - Covers everything including pill + sidebar for mobile
// - No drag up - lock body scroll
// - Popup not alert for validation
// - 10 tiny leaves rotating circle close to each other
// - Fake chat memory only, refresh clears
// - OLED, lucide only, iPhone 17 wiggle/bubble
// ================================================================
(function(){
  // ---------- DOM ELEMENTS ----------
  const chatLoadList = document.querySelector('.chat-load-list');
  const chatContainer = document.getElementById('chatContainer');
  const chatBg = document.getElementById('chatBackground');
  const chatMessages = document.getElementById('chatMessages');

  // Plus screen
  const newChatOverlay = document.getElementById('nkNewChatOverlay');
  const chattedPeopleList = document.getElementById('nkChattedPeopleList');

  // New ID
  const newIdOverlay = document.getElementById('nkNewIdOverlay');
  const newIdRow = document.getElementById('nkNewIdRow');
  const newIdBack = document.getElementById('nkNewIdBack');
  const newIdMark = document.getElementById('nkNewIdMark');
  const firstNameInput = document.getElementById('nkFirstName');
  const lastNameInput = document.getElementById('nkLastName');
  const idInput = document.getElementById('nkIdInput');
  const konnektingWrap = document.getElementById('nkKonnektingWrap');

  // New Group search
  const newGroupOverlay = document.getElementById('nkNewGroupOverlay');
  const newGroupRow = document.getElementById('nkNewGroupRow');
  const newGroupBack = document.getElementById('nkNewGroupBack');
  const groupSearchInput = document.getElementById('nkGroupSearchInput');
  const groupPeopleResults = document.getElementById('nkGroupPeopleResults');
  const groupNextBtn = document.getElementById('nkGroupNextBtn');

  // Group create
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

  // Popup - not alert
  const popupOverlay = document.getElementById('nkPopupOverlay');
  const popupTitle = document.getElementById('nkPopupTitle');
  const popupDesc = document.getElementById('nkPopupDesc');
  const popupBtn = document.getElementById('nkPopupBtn');

  // ---------- FAKE MEMORY ONLY - REFRESH CLEARS ----------
  let fakeChats = [];
  let fakeMessagesMap = {};
  let selectedMembers = [];
  let currentFakeId = null;

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

  // ---------- LOCK BODY + HIDE PILL + SIDEBAR + NO DRAG ----------
  function lockBody(){
    document.body.classList.add('nk-lock-scroll');
    // Hide pill nav and sidebar section for mobile
    document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar, nav,.mobile-nav,.konnekt-incoming-tile,.start-up').forEach(el=>{
      if(el) el.classList.add('nk-hide-pill-sidebar');
    });
    // Prevent touchmove drag on chat-load-list
    if(chatLoadList){
      chatLoadList.style.overscrollBehavior = 'none';
      chatLoadList.style.touchAction = 'none';
    }
  }
  function unlockBody(){
    // Only unlock if no overlay is open
    const anyOpen = document.querySelector('.nk-newchat-overlay.show');
    if(!anyOpen){
      document.body.classList.remove('nk-lock-scroll');
      document.querySelectorAll('.sidebar-section,.bottom-nav,.nav-pill,.pill-nav,.sidebar, nav,.mobile-nav,.konnekt-incoming-tile,.start-up').forEach(el=>{
        if(el) el.classList.remove('nk-hide-pill-sidebar');
      });
      if(chatLoadList){
        chatLoadList.style.overscrollBehavior = '';
        chatLoadList.style.touchAction = '';
      }
    }
  }

  // ---------- POPUP NOT ALERT ----------
  function showPopup(title, desc){
    if(!popupOverlay) return;
    if(popupTitle) popupTitle.textContent = title;
    if(popupDesc) popupDesc.textContent = desc;
    popupOverlay.classList.remove('hidden');
    // Force reflow
    void popupOverlay.offsetWidth;
    popupOverlay.classList.add('show');
    if(window.lucide) lucide.createIcons();
  }
  function hidePopup(){
    if(!popupOverlay) return;
    popupOverlay.classList.remove('show');
    setTimeout(()=> popupOverlay.classList.add('hidden'), 220);
  }
  popupBtn?.addEventListener('click', hidePopup);
  popupOverlay?.addEventListener('click', (e)=>{
    if(e.target === popupOverlay) hidePopup();
  });

  // ---------- WIGGLE X LIKE IPHONE ----------
  function wiggleX(btn){
    if(!btn) return;
    btn.classList.remove('nk-wiggle');
    void btn.offsetWidth;
    btn.classList.add('nk-wiggle');
    setTimeout(()=> btn.classList.remove('nk-wiggle'), 400);
  }

  // ---------- RENDER CHATTED PEOPLE LIST - PLUS SCREEN DOWN ----------
  function renderChattedList(){
    if(!chattedPeopleList) return;
    const existingItems = document.querySelectorAll('#chatContainer.chat-item');
    let html = '';

    // Real chats from your existing DOM
    existingItems.forEach(item=>{
      const name = item.querySelector('.chat-name')?.textContent?.trim() || 'User';
      const avatar = item.querySelector('.chat-avatar')?.textContent || name[0];
      html += `
        <button class="nk-newchat-row nk-person-row" data-name="${name}">
          <div class="nk-row-icon nk-person-avatar" style="background:${getGradient(name)}">${avatar.slice(0,2).toUpperCase()}</div>
          <div class="nk-row-info"><p class="nk-row-title">${name}</p></div>
        </button>
      `;
    });

    // Fake chats added
    fakeChats.forEach(c=>{
      html += `
        <button class="nk-newchat-row nk-person-row" data-fake-id="${c.id}">
          <div class="nk-row-icon nk-person-avatar" style="background:${getGradient(c.name)}">${c.name[0]}</div>
          <div class="nk-row-info"><p class="nk-row-title">${c.name} <span class="nk-fake-badge">FAKE</span></p></div>
        </button>
      `;
    });

    if(!html){
      chattedPeopleList.innerHTML = `<div class="nk-empty">You haven't chatted with anyone yet<br>Start with New ID</div>`;
    } else {
      chattedPeopleList.innerHTML = html;
      // Click to open fake chat background
      chattedPeopleList.querySelectorAll('[data-fake-id]').forEach(btn=>{
        btn.addEventListener('click', ()=> openFakeChatBg(btn.dataset.fakeId));
      });
    }
    if(window.lucide) lucide.createIcons();
  }

  // ---------- OPEN / CLOSE PLUS SCREEN - COVER EVERYTHING ----------
  function openNewChat(){
    renderChattedList();
    newChatOverlay?.classList.add('show');
    lockBody(); // Hide pill + sidebar + lock drag
    if(window.lucide) lucide.createIcons();
  }
  function closeNewChat(){
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

  // ---------- NEW ID FLOW ----------
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
      // Don't unlock yet if plus screen still open
      if(!newChatOverlay?.classList.contains('show')) unlockBody();
    }, 150);
  });

  function createFakeChatFromId(){
    const fn = firstNameInput?.value.trim() || 'User';
    const ln = lastNameInput?.value.trim() || '';
    const id = idInput?.value.trim();

    // Validation with popup not alert
    if(!id){
      showPopup('Enter 6 digit ID', 'Please enter your 6 digit ID to continue');
      return;
    }
    if(id.length!==6 ||!/^\d+$/.test(id)){
      showPopup('Invalid ID', 'ID must be exactly 6 numbers only, e.g. 123456');
      return;
    }

    // Show Konnekting with 10 tiny leaves rotating circle close
    konnektingWrap?.classList.remove('hidden');
    if(window.lucide) lucide.createIcons();

    setTimeout(()=>{
      const name = `${fn} ${ln}`.trim();
      const chatObj = { id, name, fake:true };
      fakeChats.unshift(chatObj);
      fakeMessagesMap[id] = [{ text:`Fake chat with ${name} - ID ${id} started 🎉\nThis is test chat`, sender:'other' }];

      // Add to chatContainer top for real list
      const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const div = document.createElement('div');
      div.className = 'chat-item nk-fake';
      div.dataset.userId = id;
      div.innerHTML = `
        <div class="chat-avatar" style="background:${getGradient(name)}">${initials}</div>
        <div class="chat-info">
          <div class="chat-top-row"><p class="chat-name">${name} <span class="nk-fake-badge">FAKE</span></p><span class="chat-date">now</span></div>
          <div class="chat-bottom-row"><p class="chat-last-message">ID: ${id} - Fake test chat</p></div>
        </div>
      `;
      chatContainer?.prepend(div);
      div.addEventListener('click', ()=> openFakeChatBg(id));

      // Close all overlays
      konnektingWrap?.classList.add('hidden');
      newIdOverlay?.classList.remove('show');
      newChatOverlay?.classList.remove('show');
      unlockBody();
      firstNameInput.value=''; lastNameInput.value=''; idInput.value='';

      openFakeChatBg(id);
    }, 1300);
  }
  newIdMark?.addEventListener('click', createFakeChatFromId);
  idInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') createFakeChatFromId(); });
  // Only numbers for ID
  idInput?.addEventListener('input', ()=>{
    idInput.value = idInput.value.replace(/\D/g,'').slice(0,6);
  });

  // ---------- FAKE CHAT OPEN - BACKGROUND ----------
  function openFakeChatBg(id){
    currentFakeId = id;
    const chat = fakeChats.find(c=>c.id===id);
    if(!chat ||!chatBg) return;

    // Mobile: hide chat-load-list, show chat-background
    if(window.innerWidth <=768){
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

  // Send fake message using your msgInput + micSendBtn
  const msgInput = document.getElementById('msgInput');
  const micSendBtn = document.getElementById('micSendBtn');
  function sendFake(){
    if(!currentFakeId ||!msgInput) return;
    const t = msgInput.value.trim(); if(!t) return;
    fakeMessagesMap[currentFakeId].push({ text:t, sender:'sender' });
    renderFakeMessages(currentFakeId);
    if(window.resetInputBar) window.resetInputBar(); else msgInput.value='';
    // Fake reply
    setTimeout(()=>{
      fakeMessagesMap[currentFakeId].push({ text:'Fake reply for testing 😎', sender:'receiver' });
      renderFakeMessages(currentFakeId);
    }, 800);
  }
  micSendBtn?.addEventListener('click', ()=>{ if(currentFakeId && msgInput?.value.trim()) sendFake(); });
  msgInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter' &&!e.shiftKey && currentFakeId){ e.preventDefault(); sendFake(); } });

  // Hook closeChat to clear fake id and unlock
  const origClose = window.closeChat;
  window.closeChat = function(){
    currentFakeId=null;
    if(origClose) origClose();
    else{
      if(window.innerWidth <=768){
        chatLoadList?.classList.remove('mobile-hide');
        chatBg?.classList.remove('mobile-show');
      }
      chatBg?.classList.remove('active-chat');
    }
    unlockBody();
  };

  // ---------- NEW GROUP - SEARCH PEOPLE - COVER EVERYTHING ----------
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

  function renderGroupPeople(filter=''){
    if(!groupPeopleResults) return;
    let html='';
    const lower = filter.toLowerCase();

    // Filter fake chats
    fakeChats.filter(c=> c.name.toLowerCase().includes(lower) || c.id.includes(lower)).forEach(c=>{
      const selected = selectedMembers.includes(c.id);
      html+=`<button class="nk-newchat-row" data-pick-id="${c.id}" style="${selected?'opacity:0.5;background:rgba(10,132,255,0.15)':''}"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(c.name)}">${c.name[0]}</div><div class="nk-row-info"><p class="nk-row-title">${c.name}</p><p class="nk-row-sub">${c.id}</p></div><i data-lucide="${selected?'check-circle-2':'circle'}" style="width:20px;height:20px;color:${selected?'#0a84ff':'#3a3a3c'}"></i></button>`;
    });

    // Real chats
    const real = document.querySelectorAll('#chatContainer.chat-item');
    real.forEach(item=>{
      const name = item.querySelector('.chat-name')?.textContent?.trim()||'User';
      if(name.toLowerCase().includes(lower)){
        html+=`<button class="nk-newchat-row" data-pick-real="${name}"><div class="nk-row-icon nk-person-avatar" style="background:${getGradient(name)}">${name[0]}</div><div class="nk-row-info"><p class="nk-row-title">${name}</p></div><i data-lucide="circle" style="width:20px;height:20px;color:#3a3a3c"></i></button>`;
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
    }
    if(window.lucide) lucide.createIcons();
  }
  groupSearchInput?.addEventListener('input', (e)=> renderGroupPeople(e.target.value));

  // Next border for down - not mark icon - validation popup
  groupNextBtn?.addEventListener('click', ()=>{
    if(selectedMembers.length===0){
      showPopup('Select members', 'Please select at least 1 member to create group');
      return;
    }
    groupCreateOverlay?.classList.add('show');
    lockBody();
    if(window.lucide) lucide.createIcons();
  });
  groupCreateBack?.addEventListener('click', ()=>{
    wiggleX(groupCreateBack);
    setTimeout(()=>{
      groupCreateOverlay?.classList.remove('show');
      lockBody();
    }, 150);
  });

  // Group image upload
  groupImageBtn?.addEventListener('click', ()=> groupImageInput?.click());
  groupImageInput?.addEventListener('change', (e)=>{
    const file=e.target.files[0]; if(!file) return;
    const url=URL.createObjectURL(file);
    groupImagePreview.src=url; groupImagePreview.style.display='block';
    if(window.lucide) lucide.createIcons();
  });

  // Permissions open
  permissionRow?.addEventListener('click', ()=>{
    permissionOverlay?.classList.add('show');
    lockBody();
    if(window.lucide) lucide.createIcons();
  });
  permissionBack?.addEventListener('click', ()=>{
    wiggleX(permissionBack);
    setTimeout(()=>{
      permissionOverlay?.classList.remove('show');
      lockBody();
    }, 150);
  });
  permissionDone?.addEventListener('click', ()=>{
    wiggleX(permissionDone);
    setTimeout(()=>{
      permissionOverlay?.classList.remove('show');
      lockBody();
    }, 150);
  });

  // Toggles
  document.querySelectorAll('.nk-toggle').forEach(t=>{
    t.addEventListener('click', ()=>{
      const on = t.dataset.on==='true';
      t.dataset.on = (!on).toString();
    });
  });

  // Final create group - fake - popup validation
  finalCreateBtn?.addEventListener('click', ()=>{
    const gName = groupNameInput?.value.trim();
    if(!gName){
      showPopup('Group name', 'Please enter group name');
      return;
    }
    if(selectedMembers.length===0){
      showPopup('No members', 'Please select at least 1 member from previous screen');
      return;
    }
    const gid = 'g'+Date.now();
    const chatObj = { id:gid, name:gName, fake:true };
    fakeChats.unshift(chatObj);
    fakeMessagesMap[gid]=[{ text:`Group ${gName} created with ${selectedMembers.length} members 🎉`, sender:'other' }];

    // Add to list top
    const div=document.createElement('div');
    div.className='chat-item group nk-fake';
    div.dataset.groupId=gid;
    div.innerHTML=`<div class="chat-avatar group-avatar" style="background:${getGradient(gName)}">${gName[0]}</div><div class="chat-info"><div class="chat-top-row"><p class="chat-name">${gName} <span class="nk-fake-badge">FAKE</span></p><span class="chat-date">now</span></div><div class="chat-bottom-row"><p class="chat-last-message">Group created with ${selectedMembers.length} members</p></div></div>`;
    chatContainer?.prepend(div);
    div.addEventListener('click', ()=> openFakeChatBg(gid));

    // Close all and unlock
    permissionOverlay?.classList.remove('show');
    groupCreateOverlay?.classList.remove('show');
    newGroupOverlay?.classList.remove('show');
    newChatOverlay?.classList.remove('show');
    unlockBody();
    groupNameInput.value=''; selectedMembers=[]; if(groupImagePreview){ groupImagePreview.style.display='none'; groupImagePreview.src=''; }

    openFakeChatBg(gid);
  });

  // Prevent drag up on overlays - no bounce
  document.querySelectorAll('.nk-newchat-overlay').forEach(ov=>{
    ov.addEventListener('touchmove', (e)=>{
      // Allow scroll inside sheet lists but not drag body
      const sheet = ov.querySelector('.nk-newchat-sheet');
      if(sheet && sheet.contains(e.target)){
        // Let inner scroll work
        return;
      }
      e.preventDefault();
    }, { passive:false });
  });

  console.log('NK New Chat JS V5 loaded - hide pill+sidebar, lock scroll, popup not alert, 10 leaves');
})();