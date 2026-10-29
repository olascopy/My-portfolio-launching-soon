document.addEventListener('DOMContentLoaded', ()=>{
  const UNLOCK_AT = 5; // change to 50 for backend
  let campus = JSON.parse(localStorage.getItem('loop_campus')||'[]');
  let general = JSON.parse(localStorage.getItem('loop_general')||'[]');
  let myLoops = JSON.parse(localStorage.getItem('loop_my')||'[]');
  let myVotes = JSON.parse(localStorage.getItem('loop_votes')||'{}');
  let commentsData = JSON.parse(localStorage.getItem('loop_comments')||'{}');
  let currentCommentPostId = null;
  let rotIndex = 0;
  let activeType = localStorage.getItem('loop_active')||'campus';

  const $ = id => document.getElementById(id);
  const feedEl = $('feed'), myEl = $('myPosts'), emptyState = $('emptyState');
  const viewFeed = $('viewFeed'), viewProf = $('viewProfile'), viewNew = $('viewNew');
  const popOverlay = $('popOverlay'), commentOverlay = $('commentOverlay'), loader = $('loader');
  const inputWrap = $('inputWrap');

  const save = ()=>{ 
    localStorage.setItem('loop_campus',JSON.stringify(campus));
    localStorage.setItem('loop_general',JSON.stringify(general));
    localStorage.setItem('loop_my',JSON.stringify(myLoops));
    localStorage.setItem('loop_votes',JSON.stringify(myVotes));
    localStorage.setItem('loop_comments',JSON.stringify(commentsData));
    localStorage.setItem('loop_active',activeType);
  };
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const icon = ()=>{ if(typeof lucide!=='undefined') lucide.createIcons({attrs:{"stroke-width":1.7}}); };

  // ROTATING DATA
  const rotData=[
    {html:`<h4><i data-lucide="activity"></i> LIVE NOW</h4><b>12 online • 89 loops today</b><p>Anonymous herd active — 100% anon</p>`},
    {html:`<h4><i data-lucide="lightbulb"></i> QUESTION</h4><b>What is most annoying in library?</b><p>Answer anonymously</p><button id="answerPrompt" style="margin-top:10px;border:none;background:#fff;color:#000;padding:8px 14px;border-radius:999px;font-weight:700;font-size:12px;cursor:pointer;display:flex;gap:6px;align-items:center"><i data-lucide="pen-line"></i> Answer</button>`},
    {html:`<h4><i data-lucide="bar-chart-3"></i> POLL • 128 votes</h4><b>Coffee vs Energy for finals?</b><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px"><button data-poll="c" style="display:flex;justify-content:space-between;width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-weight:600;cursor:pointer"><span>Coffee</span><span>62%</span></button><button data-poll="e" style="display:flex;justify-content:space-between;width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-weight:600;cursor:pointer"><span>Energy</span><span>38%</span></button></div>`}
  ];

  function renderRot(){
    if(!$('mobileRot')||!$('deskRot')) return;
    const cur=rotData[rotIndex];
    $('mobileRot').innerHTML=cur.html; $('deskRot').innerHTML=cur.html;
    const dots=rotData.map((_,i)=>`<span class="${i===rotIndex?'active':''}"></span>`).join('');
    if($('mobileDots')) $('mobileDots').innerHTML=dots;
    if($('deskDots')) $('deskDots').innerHTML=dots;
    icon();
    const ap=$('answerPrompt'); if(ap) ap.onclick=()=>{ openNew(); const inp=$('postInput'); if(inp){ inp.value="Library ick: "; $('char').textContent=String(inp.value.length); $('openSelector').disabled=false; } };
    document.querySelectorAll('[data-poll]').forEach(b=>{ b.onclick=()=>{ document.querySelectorAll('[data-poll]').forEach(x=>{ x.style.background='rgba(255,255,255,.06)'; x.style.color='#fff'; }); b.style.background='#fff'; b.style.color='#000'; }});
  }
  const nextRot=()=>{ rotIndex=(rotIndex+1)%3; renderRot(); };
  const prevRot=()=>{ rotIndex=(rotIndex-1+3)%3; renderRot(); };
  setInterval(nextRot,20000); renderRot();

  function checkUnlock(){
    const total=campus.length+general.length;
    const mW=$('mobileRotWrap'), dW=$('deskWrap');
    if(total>=UNLOCK_AT){ if(mW) mW.classList.remove('hidden'); if(dW) dW.classList.remove('hidden'); }
    else{ if(mW) mW.classList.add('hidden'); if(dW) dW.classList.add('hidden'); }
  }

  function setActiveType(type){
    activeType=type; save();
    const isCampus=type==='campus';
    $('tabCampus')?.classList.toggle('active',isCampus);
    $('tabGeneral')?.classList.toggle('active',!isCampus);
    const dot=$('dotType'); if(dot){ dot.className='dot '+(isCampus?'campus':'general'); }
    if($('herdLabel')) $('herdLabel').textContent = isCampus ? 'My Herd • Campus' : 'Everywhere • General';
    if($('newTitle')) $('newTitle').textContent = isCampus ? 'New Loop • Campus' : 'New Loop • General';
    const inp=$('postInput'); if(inp) inp.placeholder = isCampus ? "What's happening in campus? Anonymous..." : "What's happening everywhere? Anonymous...";
    if(emptyState){ emptyState.className = 'empty ' + (isCampus?'campus':'general'); if($('emptyTitle')) $('emptyTitle').textContent = isCampus ? 'Your herd is quiet' : 'General is quiet'; if($('emptyText')) $('emptyText').innerHTML = isCampus ? 'No loops yet in Campus.<br>Be first to break the silence.' : 'No loops yet in General.<br>Be first to post everywhere.'; }
  }

  function renderFeed(){
    if(!feedEl) return;
    const list = activeType==='campus'?campus:general;
    feedEl.querySelectorAll('.post').forEach(p=>p.remove());
    
    if(list.length===0){
      if(emptyState) emptyState.style.display='flex';
    }else{
      if(emptyState) emptyState.style.display='none';
      list.forEach(p=>{
        let v=myVotes[p.id]; let cCount=(commentsData[p.id]||[]).length;
        let d=document.createElement('div'); d.className='post '+(activeType==='campus'?'campus':'general');
        d.innerHTML=`<div class="meta"><i data-lucide="clock-3" style="width:12px"></i> anon • ${p.time} • <span class="dot ${activeType==='campus'?'campus':'general'}" style="width:6px;height:6px"></span> ${activeType}</div><div class="txt">${esc(p.text)}</div><div class="acts"><button data-up="${p.id}" class="${v==='up'?'upvoted':''}"><i data-lucide="arrow-up" style="width:16px"></i> ${p.up}</button><span class="score">${p.up-(p.down||0)}</span><button data-down="${p.id}" class="${v==='down'?'downvoted':''}"><i data-lucide="arrow-down" style="width:16px"></i></button><button data-comment="${p.id}" style="margin-left:auto"><i data-lucide="message-circle" style="width:16px"></i> ${cCount}</button><button data-share="${p.id}"><i data-lucide="share-2" style="width:16px"></i></button></div>`;
        feedEl.appendChild(d);
      });
    }

    feedEl.querySelectorAll('[data-up]').forEach(b=>{ b.onclick=()=>{ let id=parseInt(b.dataset.up); let arr=activeType==='campus'?campus:general; let p=[...campus,...general].find(x=>x.id===id); if(!p) return; let cur=myVotes[id]; if(cur==='up'){ p.up--; delete myVotes[id]; } else { if(cur==='down') p.down--; p.up++; myVotes[id]='up'; } save(); renderFeed(); }; });
    feedEl.querySelectorAll('[data-down]').forEach(b=>{ b.onclick=()=>{ let id=parseInt(b.dataset.down); let p=[...campus,...general].find(x=>x.id===id); if(!p) return; let cur=myVotes[id]; if(cur==='down'){ p.down--; delete myVotes[id]; } else { if(cur==='up') p.up--; p.down=(p.down||0)+1; myVotes[id]='down'; } save(); renderFeed(); }; });
    feedEl.querySelectorAll('[data-comment]').forEach(b=>{ b.onclick=()=>openComments(parseInt(b.dataset.comment)); });

    if($('topCount')) $('topCount').textContent=String(myLoops.length);
    if($('deskCount')) $('deskCount').textContent=String(myLoops.length);
    if($('rightCount')) $('rightCount').textContent=String(myLoops.length);
    checkUnlock(); icon();
  }

  function renderMy(){
    if(!myEl) return;
    if(myLoops.length===0){ myEl.innerHTML=`<div style="padding:40px;text-align:center;opacity:.4;font-size:13px;display:flex;flex-direction:column;gap:10px;align-items:center"><i data-lucide="inbox"></i> No loops yet — only you see this<br><small style="opacity:.6">100% anon • local only</small></div>`; if($('count')) $('count').textContent='0 posts'; icon(); return; }
    myEl.innerHTML=''; myLoops.forEach((p,i)=>{ let d=document.createElement('div'); d.className='post '+ (p.target==='Campus'?'campus':'general'); d.innerHTML=`<div class="meta">You • ${p.time} • <span class="dot ${p.target==='Campus'?'campus':'general'}" style="width:6px;height:6px"></span> ${p.target} <button data-del="${i}" style="margin-left:auto;border:none;background:rgba(255,255,255,.08);color:#FF453A;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;cursor:pointer"><i data-lucide="trash-2" style="width:14px"></i></button></div><div class="txt">${esc(p.text)}</div>`; myEl.appendChild(d); });
    if($('count')) $('count').textContent=`${myLoops.length} posts`;
    myEl.querySelectorAll('[data-del]').forEach(b=>{ b.onclick=()=>{ let idx=parseInt(b.dataset.del); let t=myLoops[idx]; myLoops.splice(idx,1); if(t.target==='Campus') campus=campus.filter(x=>x.text!==t.text); else general=general.filter(x=>x.text!==t.text); save(); renderMy(); renderFeed(); }; });
    icon();
  }

  function openNew(){ viewFeed?.classList.remove('active'); viewProf?.classList.remove('active'); viewNew?.classList.add('active'); setTimeout(()=>$('postInput')?.focus(),80); }
  function closeNew(){ viewNew?.classList.remove('active'); viewFeed?.classList.add('active'); popOverlay?.classList.remove('show'); }

  const bind=(id,fn)=>{ const el=$(id); if(el) el.onclick=fn; };
  bind('mobNew',openNew); bind('deskNew',openNew); bind('deskNew2',openNew); bind('emptyPostBtn',openNew);
  bind('emptyExplore',()=>{ setActiveType('general'); renderFeed(); });
  bind('closeNew',closeNew); bind('closePop',()=>popOverlay?.classList.remove('show'));
  if(popOverlay) popOverlay.onclick=e=>{ if(e.target===popOverlay) popOverlay.classList.remove('show'); };

  // COMMENTS
  function openComments(id){
    currentCommentPostId=id;
    if($('commentTitle')) $('commentTitle').innerHTML=`<i data-lucide="message-circle" style="width:18px"></i> Comments • ${(commentsData[id]||[]).length}`;
    renderComments(); commentOverlay?.classList.add('show'); setTimeout(()=>$('commentInput')?.focus(),100); icon();
  }
  function renderComments(){
    const list=$('commentList'); if(!list) return; list.innerHTML='';
    const arr=commentsData[currentCommentPostId]||[];
    if(arr.length===0){ list.innerHTML=`<div style="padding:30px;text-align:center;opacity:.4;font-size:13px;display:flex;flex-direction:column;gap:8px;align-items:center"><i data-lucide="message-circle"></i> No comments yet. Be first.</div>`; icon(); return; }
    arr.forEach(c=>{ let d=document.createElement('div'); d.className='comment-item'; d.innerHTML=`<div class="meta"><i data-lucide="clock-3" style="width:12px"></i> anon • ${c.time}</div><div class="txt">${esc(c.text)}</div>`; list.appendChild(d); });
    list.scrollTop=list.scrollHeight; icon();
  }
  function sendComment(){
    const inp=$('commentInput'); if(!inp) return; let txt=inp.value.trim(); if(!txt||!currentCommentPostId) return;
    if(!commentsData[currentCommentPostId]) commentsData[currentCommentPostId]=[];
    commentsData[currentCommentPostId].push({text:txt,time:'now'}); inp.value=''; save(); renderComments(); renderFeed();
    if($('commentTitle')) $('commentTitle').innerHTML=`<i data-lucide="message-circle" style="width:18px"></i> Comments • ${commentsData[currentCommentPostId].length}`;
    if(inputWrap) inputWrap.style.transform='translateY(0px)';
    const card=$('commentCard'); if(card) card.style.transform='translateY(0px)';
    icon();
  }
  bind('closeComment',()=>{ commentOverlay?.classList.remove('show'); if(inputWrap) inputWrap.style.transform='translateY(0px)'; const card=$('commentCard'); if(card) card.style.transform='translateY(0px)'; });
  if(commentOverlay) commentOverlay.onclick=e=>{ if(e.target===commentOverlay){ commentOverlay.classList.remove('show'); if(inputWrap) inputWrap.style.transform='translateY(0px)'; const card=$('commentCard'); if(card) card.style.transform='translateY(0px)'; } };
  bind('sendComment',sendComment);
  const cIn=$('commentInput'); if(cIn) cIn.onkeydown=e=>{ if(e.key==='Enter') sendComment(); };

  // KEYBOARD FOLLOW - only input follows, not whole background
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', ()=>{
      if(!commentOverlay?.classList.contains('show')) return;
      const vv=window.visualViewport;
      const kb = window.innerHeight - vv.height - vv.offsetTop;
      if(inputWrap){
        if(kb>100){
          inputWrap.style.transform=`translateY(-${kb}px)`;
          const card=$('commentCard'); if(card) card.style.transform=`translateY(-${kb/3}px)`;
        }else{
          inputWrap.style.transform='translateY(0px)';
          const card=$('commentCard'); if(card) card.style.transform='translateY(0px)';
        }
      }
    });
  }

  // NAV
  bind('myLoopsBtn',()=>{ viewFeed?.classList.remove('active'); viewProf?.classList.add('active'); renderMy(); });
  bind('goProfileDesk',()=>{ viewFeed?.classList.remove('active'); viewProf?.classList.add('active'); renderMy(); });
  bind('rightMyBtn',()=>{ viewFeed?.classList.remove('active'); viewProf?.classList.add('active'); renderMy(); });
  bind('backBtn',()=>{ viewProf?.classList.remove('active'); viewFeed?.classList.add('active'); renderFeed(); });
  bind('goFeedDesk',()=>{ viewProf?.classList.remove('active'); viewFeed?.classList.add('active'); renderFeed(); });
  bind('nextBtn',nextRot); bind('prevBtn',prevRot); bind('dNext',nextRot); bind('dPrev',prevRot);
  const mWrap=$('mobileRotWrap'); if(mWrap){ let sx=0; mWrap.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true}); mWrap.addEventListener('touchend',e=>{ let dx=e.changedTouches[0].clientX-sx; if(dx<-50) nextRot(); if(dx>50) prevRot(); }); }

  // POST FLOW
  const postInput=$('postInput'), charEl=$('char'), openSel=$('openSelector');
  if(postInput) postInput.oninput=e=>{ if(charEl) charEl.textContent=String(e.target.value.length); if(openSel) openSel.disabled=!e.target.value.trim(); };
  if(openSel) openSel.onclick=()=>{ if(popOverlay) popOverlay.classList.add('show'); const card=document.querySelector('#pageLoops .pop-card'); if(card){ card.classList.remove('wiggle'); void card.offsetWidth; card.classList.add('wiggle'); } icon(); };

  function postNow(t){
    if(loader) loader.style.display='block';
    document.querySelectorAll('#pageLoops .choice button').forEach(b=>b.classList.remove('selected'));
    const b=$(t==='campus'?'chooseCampus':'chooseGeneral'); if(b) b.classList.add('selected');
    setTimeout(()=>{
      const te=$('postInput'); if(!te) return; let txt=te.value.trim(); if(!txt) return;
      let obj={id:Date.now(),text:txt,time:'now',up:1,down:0};
      myLoops.unshift({text:txt,time:'now',target:t==='campus'?'Campus':'General'});
      if(t==='campus'){ campus.unshift(obj); setActiveType('campus'); } else { general.unshift(obj); setActiveType('general'); }
      te.value=''; if(charEl) charEl.textContent='0'; if(openSel) openSel.disabled=true;
      if(loader) loader.style.display='none'; if(popOverlay) popOverlay.classList.remove('show'); closeNew(); save(); renderMy(); renderFeed();
      // fake others after first post to show refresh pill
      if(campus.length===1 && t==='campus'){
        setTimeout(()=>{
          campus.push({id:Date.now()+1,text:'Anyone knows if library open till 2am?',time:'2m',up:12,down:1});
          campus.push({id:Date.now()+2,text:'dining hall cookies elite at 2am',time:'5m',up:34,down:0});
          save();
          const np=$('newPill'), npD=$('newPillDesk');
          if(np){ np.classList.remove('hidden'); if($('newCount')) $('newCount').textContent='2 new loops'; }
          if(npD){ npD.classList.remove('hidden'); if($('newCountDesk')) $('newCountDesk').textContent='2 new loops • tap to refresh'; }
          icon();
        },2000);
      }
    },700);
  }
  bind('chooseCampus',()=>postNow('campus')); bind('chooseGeneral',()=>postNow('general'));

  const tabC=$('tabCampus'), tabG=$('tabGeneral');
  if(tabC) tabC.onclick=()=>{ setActiveType('campus'); renderFeed(); };
  if(tabG) tabG.onclick=()=>{ setActiveType('general'); renderFeed(); };
  document.querySelectorAll('[data-tab]').forEach(b=>{ b.onclick=()=>{ document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); setActiveType(b.dataset.tab); renderFeed(); }; });

  const np=$('newPill'), npD=$('newPillDesk');
  if(np) np.onclick=()=>{ np.classList.add('hidden'); npD?.classList.add('hidden'); renderFeed(); const pf=$('viewFeed'); if(pf) pf.scrollTo({top:0,behavior:'smooth'}); };
  if(npD) npD.onclick=()=>{ npD.classList.add('hidden'); np?.classList.add('hidden'); renderFeed(); const pf=$('viewFeed'); if(pf) pf.scrollTo({top:0,behavior:'smooth'}); };

  // INIT
  setActiveType(activeType); renderFeed(); renderMy(); icon();
});