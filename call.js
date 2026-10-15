document.addEventListener('DOMContentLoaded', function(){
  // ===== DOM =====
  var overlay = document.getElementById('callOverlay');
  var pill = document.getElementById('dynamicPill');
  var expanded = document.getElementById('expandedPill');
  var incomingList = document.getElementById('incomingTileList');
  var incomingChat = document.getElementById('incomingTileChat');
  var chatLoadList = document.getElementById('chatLoadList');
  var chatBackground = document.getElementById('chatBackground');
  var sidebarSection = document.querySelector('.sidebar-section');
  var statusEl = document.getElementById('callStatus');
  var startBtn = document.getElementById('startOutgoingCallBtn');
  var ringtone = document.getElementById('ringtoneAudio');

  if(!overlay ||!pill ||!expanded) return;

  var callState = 'idle';
  var sec = 0;
  var timer = null;
  var ringingTimer = null;
  var autoTestTimer = null;

  function setCaller(name){
    var n = name || 'Joshua dayo';
    var src = 'https://i.pravatar.cc/300?img=12';
    var names = ['callName','pillName','expandedName','incomingNameList','incomingNameChat'];
    var avas = ['callBigAva','pillAva','expandedAva','incomingAvaList','incomingAvaChat'];
    for(var i=0;i<names.length;i++){ var el=document.getElementById(names[i]); if(el) el.textContent=n; }
    for(var j=0;j<avas.length;j++){ var av=document.getElementById(avas[j]); if(av) av.src=src; }
    if(window.lucide) lucide.createIcons();
  }

  function startTimer(){
    clearInterval(timer); sec=0;
    function setT(t){
      if(statusEl) statusEl.textContent=t;
      var pt=document.getElementById('pillTime'); if(pt) pt.textContent=t;
      var et=document.getElementById('expandedTime'); if(et) et.textContent=t;
    }
    setT('00:00');
    timer=setInterval(function(){ sec++; var m=Math.floor(sec/60); var s=sec%60; setT((m<10?'0'+m:m)+':'+(s<10?'0'+s:s)); },1000);
  }
  function stopTimer(){ clearInterval(timer); timer=null; }

  function hideNavForCall(){
    // BACKEND NOTE: Hide nav when full call shows so nav no enter calling state
    document.body.classList.add('konnekt-in-call');
    var navs=document.querySelectorAll('#bottomNav,.bottom-nav,.mobile-bottom-nav,nav');
    for(var i=0;i<navs.length;i++){ navs[i].style.display='none'; }
    if(sidebarSection && window.innerWidth<=768) sidebarSection.style.display='none';
    overlay.style.zIndex='99999'; overlay.style.position='fixed'; overlay.style.inset='0';
  }
  function showNavAfterCall(){
    // BACKEND NOTE: Show nav back when minimizing
    document.body.classList.remove('konnekt-in-call');
    var navs=document.querySelectorAll('#bottomNav,.bottom-nav,.mobile-bottom-nav,nav');
    for(var i=0;i<navs.length;i++){ navs[i].style.display=''; }
    if(sidebarSection) sidebarSection.style.display='';
  }

  // ===== CHECK WHERE USER DEY CURRENTLY =====
  function isInChatBackground(){
    // BACKEND NOTE: Check if user currently dey chatBackground
    if(!chatBackground) return false;
    // If not hidden, user dey chat background
    if(chatBackground.classList.contains('mobile-hidden')) return false;
    if(chatBackground.classList.contains('hidden')) return false;
    // Also check display
    if(chatBackground.style.display==='none') return false;
    return true;
  }

  function isInChatLoadList(){
    // BACKEND NOTE: Check if user currently dey chatLoadList
    if(!chatLoadList) return false;
    if(chatLoadList.classList.contains('mobile-hidden')) return false;
    if(chatLoadList.classList.contains('hidden')) return false;
    if(chatLoadList.style.display==='none') return false;
    return true;
  }

  // ===== GO TO CHAT BACKGROUND =====
  function goToChatBackground(){
    // BACKEND NOTE: Go to chatBackground - show conversation
    console.log('KONNEKT: Going to chatBackground');
    if(chatBackground){
      chatBackground.classList.remove('mobile-hidden');
      chatBackground.classList.remove('hidden');
      chatBackground.style.display='flex';
      chatBackground.style.visibility='visible';
    }
    if(chatLoadList && window.innerWidth<=768){
      chatLoadList.classList.add('mobile-hidden');
    }
  }

  // ===== GO TO CHAT LOAD LIST =====
  function goToChatLoadList(){
    // BACKEND NOTE: Go to chatLoadList - show list of chats
    console.log('KONNEKT: Going to chatLoadList');
    if(chatLoadList){
      chatLoadList.classList.remove('mobile-hidden');
      chatLoadList.classList.remove('hidden');
      chatLoadList.style.display='flex';
      chatLoadList.style.visibility='visible';
    }
    if(chatBackground && window.innerWidth<=768){
      chatBackground.classList.add('mobile-hidden');
    }
  }

  // ===== TOGGLE LOGIC - YOUR REQUEST =====
  function toggleFromCallingState(){
    // BACKEND NOTE: THIS IS YOUR REQUESTED LOGIC
    // If m in chat background and m in calling state it shud go back to chat load list
    // If m in chat load list and min calling state it shud go back to chat background

    // Check where user dey before call
    if(isInChatBackground()){
      // User dey chatBackground before, so go to chatLoadList
      console.log('KONNEKT TOGGLE: Was in chatBackground -> Go to chatLoadList');
      goToChatLoadList();
    }else if(isInChatLoadList()){
      // User dey chatLoadList before, so go to chatBackground
      console.log('KONNEKT TOGGLE: Was in chatLoadList -> Go to chatBackground');
      goToChatBackground();
    }else{
      // Default - if we no know, go to list on mobile, chat on desktop
      if(window.innerWidth<=768){
        goToChatLoadList();
      }else{
        goToChatBackground();
      }
    }
  }

  function backToFullCall(){
    hideNavForCall();
    overlay.classList.add('show');
    overlay.classList.remove('minimized');
    pill.classList.add('hidden');
    expanded.classList.add('hidden');
  }

  function openOutgoing(n){ setCaller(n); callState='outgoing'; hideNavForCall(); overlay.classList.add('show'); overlay.classList.remove('minimized'); pill.classList.add('hidden'); expanded.classList.add('hidden'); if(statusEl) statusEl.textContent='calling...'; clearTimeout(ringingTimer); ringingTimer=setTimeout(function(){ if(callState==='outgoing') onConnected(); },2000); stopAutoTest(); }
  function onConnected(){ callState='connected'; hideNavForCall(); startTimer(); }
  function showIncoming(d){ var name='Joshua dayo'; if(d&&d.name) name=d.name; setCaller(name); callState='incoming'; if(incomingList){ incomingList.classList.add('show'); incomingList.style.display='flex'; } if(incomingChat){ incomingChat.classList.add('show'); incomingChat.style.display='flex'; } try{ if(ringtone){ ringtone.currentTime=0; ringtone.play().catch(function(){}); } }catch(e){} }
  function hideIncoming(){ if(incomingList){ incomingList.classList.remove('show'); incomingList.style.display='none'; } if(incomingChat){ incomingChat.classList.remove('show'); incomingChat.style.display='none'; } try{ if(ringtone){ ringtone.pause(); ringtone.currentTime=0; } }catch(e){} if(callState==='incoming') callState='idle'; }
  function answerIncoming(){ hideIncoming(); stopAutoTest(); hideNavForCall(); overlay.classList.add('show'); overlay.classList.remove('minimized'); onConnected(); }
  function endCall(){ clearTimeout(ringingTimer); stopTimer(); callState='idle'; overlay.classList.remove('show'); overlay.classList.remove('minimized'); pill.classList.add('hidden'); expanded.classList.add('hidden'); hideIncoming(); showNavAfterCall(); startAutoTest(); }

  if(startBtn){ startBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); var cn=document.querySelector('.chat-name'); var n=cn?cn.textContent.trim():'Joshua dayo'; openOutgoing(n); }, true); }
  var aL=document.getElementById('acceptCallList'); if(aL) aL.addEventListener('click', function(e){ e.stopPropagation(); answerIncoming(); });
  var aC=document.getElementById('acceptCallChat'); if(aC) aC.addEventListener('click', function(e){ e.stopPropagation(); answerIncoming(); });
  var dL=document.getElementById('declineCallList'); if(dL) dL.addEventListener('click', function(e){ e.stopPropagation(); hideIncoming(); });
  var dC=document.getElementById('declineCallChat'); if(dC) dC.addEventListener('click', function(e){ e.stopPropagation(); hideIncoming(); });

  // ===== ICONS NOW USE TOGGLE LOGIC =====

  var chatIcon = document.getElementById('callGoChat');
  var listIcon = document.getElementById('callGoList');

  // Clean old listeners
  if(chatIcon){
    var newChat = chatIcon.cloneNode(true);
    chatIcon.parentNode.replaceChild(newChat, chatIcon);
    chatIcon = newChat;
  }
  if(listIcon){
    var newList = listIcon.cloneNode(true);
    listIcon.parentNode.replaceChild(newList, listIcon);
    listIcon = newList;
  }

  // BOTH ICONS NOW DO TOGGLE - AS YOU REQUESTED
  // If in chatBackground + calling state -> go list
  // If in chatLoadList + calling state -> go background

  if(chatIcon){
    chatIcon.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      overlay.classList.remove('show');
      overlay.classList.add('minimized');
      pill.classList.remove('hidden');
      expanded.classList.add('hidden');
      showNavAfterCall();
      // TOGGLE LOGIC
      toggleFromCallingState();
    });
  }

  if(listIcon){
    listIcon.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      overlay.classList.remove('show');
      overlay.classList.add('minimized');
      pill.classList.remove('hidden');
      expanded.classList.remove('hidden');
      showNavAfterCall();
      // TOGGLE LOGIC - SAME AS CHAT ICON, GOES TO OPPOSITE
      toggleFromCallingState();
    });
  }

  // Pill
  pill.addEventListener('click', function(e){ e.stopPropagation(); if(expanded.classList.contains('hidden')) expanded.classList.remove('hidden'); else expanded.classList.add('hidden'); });
  function attachBack(el){ if(!el) return; el.addEventListener('click', function(e){ e.stopPropagation(); backToFullCall(); }); }
  attachBack(document.getElementById('expandBackToCall')); attachBack(document.querySelector('.konnekt-expanded-left')); attachBack(document.getElementById('expandedTime'));

  document.addEventListener('click', function(e){ if(overlay.classList.contains('show')) return; if(expanded.classList.contains('hidden')) return; if(expanded.contains(e.target)||pill.contains(e.target)) return; expanded.classList.add('hidden'); });

  var endBtn=document.getElementById('callEndBtn'); if(endBtn) endBtn.addEventListener('click', endCall);
  var pEnd=document.getElementById('pillEndBtn'); if(pEnd) pEnd.addEventListener('click', function(e){ e.stopPropagation(); endCall(); });
  var eEnd=document.getElementById('expandedEndBtn'); if(eEnd) eEnd.addEventListener('click', function(e){ e.stopPropagation(); endCall(); });

  function wiggle(btn,isMute){ if(!btn) return; btn.classList.remove('wiggle'); void btn.offsetWidth; btn.classList.add('wiggle'); if(isMute){ btn.classList.toggle('mute-active'); }else{ btn.classList.toggle('active'); } setTimeout(function(){ btn.classList.remove('wiggle'); },500); }
  var m=document.getElementById('callMuteBtn'); if(m) m.addEventListener('click', function(){ wiggle(this,true); });
  var s=document.getElementById('callSpeakerBtn'); if(s) s.addEventListener('click', function(){ wiggle(this,false); });

  window.KonnektCall={ showIncoming:showIncoming, hideIncoming:hideIncoming, openOutgoing:openOutgoing, onConnected:onConnected, end:endCall, answer:answerIncoming, backToFull:backToFullCall, goToList:goToChatLoadList, goToChat:goToChatBackground, toggle:toggleFromCallingState, getState:function(){return callState;} };
  window.showKonnektIncoming=showIncoming;

  function startAutoTest(){ stopAutoTest(); autoTestTimer=setInterval(function(){ if(callState==='idle'){ showIncoming({name:'Joshua dayo'}); setTimeout(function(){ if(callState==='incoming') hideIncoming(); },3500); } },4000); setTimeout(function(){ if(callState==='idle') showIncoming({name:'Joshua dayo'}); },600); }
  function stopAutoTest(){ clearInterval(autoTestTimer); autoTestTimer=null; }
  startAutoTest();
});