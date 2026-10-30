
document.addEventListener('DOMContentLoaded', ()=>{
  // ===== STORAGE =====
  let campus = JSON.parse(localStorage.getItem('loop_campus')||'[]');
  let general = JSON.parse(localStorage.getItem('loop_general')||'[]');
  let myLoops = JSON.parse(localStorage.getItem('loop_my')||'[]');
  let myVotes = JSON.parse(localStorage.getItem('loop_votes')||'{}');
  let commentsData = JSON.parse(localStorage.getItem('loop_comments')||'{}');
  let appeals = JSON.parse(localStorage.getItem('loop_appeals')||'[]');
  let currentCommentPostId = null;
  let rotIndex = 0;
  let activeType = localStorage.getItem('loop_active')||'campus';
  let selectedTag = null;
  // test flag - only once first posted loop hides after 1 downvote
  let firstTestPostId = JSON.parse(localStorage.getItem('loop_first_test')||'null');

  const $ = id => document.getElementById(id);
  const feedEl = $('feed'), myEl = $('myPosts'), emptyState = $('emptyState');
  const viewFeed = $('viewFeed'), viewProf = $('viewProfile'), viewNew = $('viewNew');
  const popOverlay = $('popOverlay'), commentOverlay = $('commentOverlay'), loader = $('loader');
  const inputWrap = $('inputWrap');
  const shareOverlay = $('shareOverlay'), appealOverlay = $('appealOverlay');

  // save all to local
  const save = ()=>{ 
    localStorage.setItem('loop_campus',JSON.stringify(campus));
    localStorage.setItem('loop_general',JSON.stringify(general));
    localStorage.setItem('loop_my',JSON.stringify(myLoops));
    localStorage.setItem('loop_votes',JSON.stringify(myVotes));
    localStorage.setItem('loop_comments',JSON.stringify(commentsData));
    localStorage.setItem('loop_appeals',JSON.stringify(appeals));
    localStorage.setItem('loop_active',activeType);
    localStorage.setItem('loop_first_test',JSON.stringify(firstTestPostId));
  };
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const icon = ()=>{ if(typeof lucide!=='undefined') lucide.createIcons({attrs:{"stroke-width":1.7}}); };
  const bind = (id,fn)=>{ const el=$(id); if(el) el.onclick=fn; };

  // ===== TAG PICKER =====
  document.querySelectorAll('.tag-opt').forEach(btn=>{
    btn.onclick=()=>{
      const tag = btn.dataset.tag;
      if(selectedTag===tag){ selectedTag=null; btn.classList.remove('selected'); }
      else { selectedTag=tag; document.querySelectorAll('.tag-opt').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }
    };
  });

  // ===== TOP 7 DAYS WINNER =====
  // backend later will decide, now: post with 0 downvotes and highest up
  function getTopWinner(list){ 
    if(list.length===0) return null; 
    let cands = list.filter(p=> (p.down||0)===0 && (p.up||0)>=1);
    if(cands.length===0) return null;
    let max=cands[0]; cands.forEach(p=>{ if(p.up>max.up) max=p; });
    return max;
  }

  // ===== ROTATING 4 CARDS =====
  // Live, Question, Poll, Top 7 days
  function buildRotData(){
    const list = activeType==='campus'?campus:general;
    const topPost = getTopWinner(list);
    let base = [
      {html:`<h4><i data-lucide="activity"></i> LIVE NOW</h4><b>12 online • 89 loops today</b><p>Anonymous herd active</p>`},
      {html:`<h4><i data-lucide="lightbulb"></i> QUESTION</h4><b>Most annoying in library?</b><p>Answer anonymously</p><button id="answerPrompt" style="margin-top:10px;border:none;background:#fff;color:#000;padding:8px 14px;border-radius:999px;font-weight:700;font-size:12px;cursor:pointer;display:flex;gap:6px;align-items:center"><i data-lucide="pen-line"></i> Answer</button>`},
      {html:`<h4><i data-lucide="bar-chart-3"></i> POLL</h4><b>Coffee vs Energy?</b><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px"><button data-poll="c" style="display:flex;justify-content:space-between;width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-weight:600;cursor:pointer"><span>Coffee</span><span>62%</span></button><button data-poll="e" style="display:flex;justify-content:space-between;width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-weight:600;cursor:pointer"><span>Energy</span><span>38%</span></button></div>`}
    ];
    if(topPost){
      base.push({html:`<h4><i data-lucide="trophy"></i> TOP 7 DAYS • ${topPost.up} up</h4><b>${esc(topPost.text.slice(0,60))}...</b><p>#${esc(topPost.tag||'top')} • No downvotes</p><button data-view-top="${topPost.id}" style="margin-top:10px;border:none;background:#fff;color:#000;padding:8px 14px;border-radius:999px;font-weight:700;font-size:12px;cursor:pointer"><i data-lucide="eye"></i> View</button>`});
    }else{
      base.push({html:`<h4><i data-lucide="trophy"></i> TOP 7 DAYS</h4><b>No winner yet</b><p>Only upvotes for 7 days enters here</p>`});
    }
    return base;
  }

  function renderRot(){
    if(!$('mobileRot')||!$('deskRot')) return;
    const rotData = buildRotData();
    if(rotIndex>=rotData.length) rotIndex=0;
    const cur=rotData[rotIndex];
    $('mobileRot').innerHTML=cur.html; $('deskRot').innerHTML=cur.html;
    const dots=rotData.map((_,i)=>`<span class="${i===rotIndex?'active':''}"></span>`).join('');
    if($('mobileDots')) $('mobileDots').innerHTML=dots;
    if($('deskDots')) $('deskDots').innerHTML=dots;
    icon();
    const ap=$('answerPrompt'); if(ap) ap.onclick=()=>{ openNew(); const inp=$('postInput'); if(inp){ inp.value="Library ick: "; $('char').textContent=String(inp.value.length); $('openSelector').disabled=false; } };
    document.querySelectorAll('[data-poll]').forEach(b=>{ b.onclick=()=>{ document.querySelectorAll('[data-poll]').forEach(x=>{ x.style.background='rgba(255,255,255,.06)'; x.style.color='#fff'; }); b.style.background='#fff'; b.style.color='#000'; }});
    document.querySelectorAll('[data-view-top]').forEach(b=>{ b.onclick=()=>{ const id=parseInt(b.dataset.viewTop); const el=document.querySelector(`[data-post-id="${id}"]`); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); }});
  }
  const nextRot=()=>{ const len=buildRotData().length; rotIndex=(rotIndex+1)%len; renderRot(); };
  const prevRot=()=>{ const len=buildRotData().length; rotIndex=(rotIndex-1+len)%len; renderRot(); };
  setInterval(nextRot,20000);

  // unlock rotating after 5 posts
  function checkUnlock(){
    const total=campus.length+general.length;
    const mW=$('mobileRotWrap'), dW=$('deskWrap');
    if(total>=5){ if(mW) mW.classList.remove('hidden'); if(dW) dW.classList.remove('hidden'); }
    else{ if(mW) mW.classList.add('hidden'); if(dW) dW.classList.add('hidden'); }
  }

  function setActiveType(type){
    activeType=type; save();
    const isCampus=type==='campus';
    $('tabCampus')?.classList.toggle('active',isCampus);
    $('tabGeneral')?.classList.toggle('active',!isCampus);
    const dot=$('dotType'); if(dot) dot.className='dot '+(isCampus?'campus':'general');
    if($('herdLabel')) $('herdLabel').textContent = isCampus ? 'My Herd • Campus' : 'Everywhere • General';
    if($('newTitle')) $('newTitle').textContent = isCampus ? 'New Loop • Campus' : 'New Loop • General';
    renderRot();
  }

  function isOwner(postId){ return myLoops.some(m=>m.id===postId); }

  // ===== FEED =====
  function renderFeed(){
    if(!feedEl) return;
    const list = activeType==='campus'?campus:general;
    const topWinner = getTopWinner(list);
    const topId = topWinner ? topWinner.id : null;
    feedEl.querySelectorAll('.post').forEach(p=>p.remove());
    if(list.length===0){
      if(emptyState) emptyState.style.display='flex';
    }else{
      if(emptyState) emptyState.style.display='none';
      list.forEach(p=>{
        // normal hide: 5 downvotes and not owner hides from feed
        // test hide: if this id == firstTestPostId and down >=1, also hide from feed for testing
        const isTestHide = firstTestPostId && p.id===firstTestPostId && (p.down||0)>=1;
        if(((p.down||0)>=5 || isTestHide) && !isOwner(p.id)) return;
        // even owner sees hide in feed? No, owner still sees in feed until 5? For test we hide even for owner to show hidden state in My Loops
        // but we keep showing in feed for owner if normal 5? For test we still hide from feed to simulate
        if(isTestHide){ /* will still hide from feed to test appeal */ }
        if((p.down||0)>=5 && isOwner(p.id) && !isTestHide){ /* still show? No, hide from feed too, show only in My Loops */ return; }

        let v=myVotes[p.id]; let cCount=(commentsData[p.id]||[]).length;
        let isTop = p.id===topId;
        let d=document.createElement('div'); 
        d.className='post '+(activeType==='campus'?'campus':'general') + (isTop ? ' top-winner-border':'');
        d.setAttribute('data-post-id', p.id);
        const tagHtml = p.tag ? `<span class="loop-tag">#${esc(p.tag)}</span>` : '';
        d.innerHTML=`
          <div class="loop-top">${tagHtml}<button data-share="${p.id}" class="share-btn"><i data-lucide="share-2" style="width:14px"></i></button></div>
          <div class="meta"><i data-lucide="clock-3" style="width:12px"></i> anon • ${p.time} • <span class="dot ${activeType==='campus'?'campus':'general'}" style="width:6px;height:6px"></span> ${activeType}</div>
          <div class="txt">${esc(p.text)}</div>
          <div class="acts">
            <button data-up="${p.id}" class="${v==='up'?'upvoted':''}"><i data-lucide="arrow-up" style="width:16px"></i> ${p.up}</button>
            <span class="score">${p.up-(p.down||0)}</span>
            <button data-down="${p.id}" class="${v==='down'?'downvoted':''}"><i data-lucide="arrow-down" style="width:16px"></i> ${p.down||0}</button>
            <button data-comment="${p.id}" style="margin-left:auto"><i data-lucide="message-circle" style="width:16px"></i> ${cCount}</button>
          </div>`;
        // if test post, show helper text
        if(p.id===firstTestPostId){
          d.querySelector('.txt').innerHTML += `<div style="margin-top:8px;font-size:11px;opacity:.5">Test: 1 downvote will hide this for appeal</div>`;
        }
        feedEl.appendChild(d);
      });
    }
    // bind votes
    feedEl.querySelectorAll('[data-up]').forEach(b=>{ b.onclick=()=>{ let id=parseInt(b.dataset.up); let p=[...campus,...general].find(x=>x.id===id); if(!p) return; let cur=myVotes[id]; if(cur==='up'){ p.up--; delete myVotes[id]; } else { if(cur==='down') p.down--; p.up++; myVotes[id]='up'; } save(); renderFeed(); renderMy(); renderRot(); }; });
    feedEl.querySelectorAll('[data-down]').forEach(b=>{ 
      b.onclick=()=>{ 
        let id=parseInt(b.dataset.down); 
        let p=[...campus,...general].find(x=>x.id===id); 
        if(!p) return; 
        let cur=myVotes[id]; 
        if(cur==='down'){ p.down--; delete myVotes[id]; } 
        else { if(cur==='up') p.up--; p.down=(p.down||0)+1; myVotes[id]='down'; } 
        save(); renderFeed(); renderMy(); renderRot(); 
      }; 
    });
    feedEl.querySelectorAll('[data-comment]').forEach(b=>{ b.onclick=()=>openComments(parseInt(b.dataset.comment)); });
    feedEl.querySelectorAll('[data-share]').forEach(b=>{ b.onclick=()=>openShare(parseInt(b.dataset.share)); });
    if($('topCount')) $('topCount').textContent=String(myLoops.length);
    if($('deskCount')) $('deskCount').textContent=String(myLoops.length);
    if($('rightCount')) $('rightCount').textContent=String(myLoops.length);
    checkUnlock(); icon();
  }

  // ===== MY LOOPS =====
  function renderMy(){
    if(!myEl) return;
    if(myLoops.length===0){ myEl.innerHTML=`<div style="padding:40px;text-align:center;opacity:.4">No loops</div>`; updateTopStats(); return; }
    myEl.innerHTML=''; 
    myLoops.forEach((p,i)=>{ 
      let full = [...campus,...general].find(x=>x.id===p.id) || {up:0,down:0};
      let cCount=(commentsData[p.id]||[]).length;
      // hidden if normal 5 down OR test 1 down for firstTestPostId
      let isTestHidden = firstTestPostId && p.id===firstTestPostId && (full.down||0)>=1;
      let isHidden = (full.down||0)>=5 || isTestHidden;
      let d=document.createElement('div'); d.className='post '+ (p.target==='Campus'?'campus':'general');
      const tagHtml = p.tag ? `<span class="loop-tag">#${esc(p.tag)}</span>` : '';
      const hiddenHtml = isHidden ? `<div class="hidden-state"><b>${isTestHidden?'HIDDEN (TEST - 1 down)':'HIDDEN - 5 down'}</b><p>${isTestHidden?'Test appeal: this hid after 1 downvote':'Community hid this'} - only you see</p><div class="hidden-actions"><button data-del="${i}">Delete</button><button data-appeal="${p.id}">Appeal</button></div></div>` : '';
      d.innerHTML=`
        <div class="loop-top">${tagHtml}<button data-del="${i}" style="border:none;background:rgba(255,255,255,.08);color:#FF453A;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;cursor:pointer"><i data-lucide="trash-2" style="width:14px"></i></button></div>
        <div class="meta">You • ${p.time} • ${p.target} ${isHidden?'<span style="background:#FF453A;color:#fff;font-size:8px;padding:2px 6px;border-radius:999px">HIDDEN</span>':''}</div>
        <div class="txt">${esc(p.text)}</div>
        <div class="my-stats">
          <span><i data-lucide="arrow-up" style="width:12px"></i> ${full.up||0}</span>
          <span><i data-lucide="arrow-down" style="width:12px"></i> ${full.down||0}</span>
          <span data-mycomment="${p.id}" style="cursor:pointer"><i data-lucide="message-circle" style="width:12px"></i> ${cCount}</span>
        </div>
        ${hiddenHtml}`;
      myEl.appendChild(d); 
    });
    if($('count')) $('count').textContent=`${myLoops.length} posts`;
    myEl.querySelectorAll('[data-del]').forEach(b=>{ b.onclick=()=>{ let idx=parseInt(b.dataset.del); let t=myLoops[idx]; if(firstTestPostId===t.id) firstTestPostId=null; myLoops.splice(idx,1); if(t.target==='Campus') campus=campus.filter(x=>x.id!==t.id); else general=general.filter(x=>x.id!==t.id); save(); renderMy(); renderFeed(); renderRot(); }; });
    myEl.querySelectorAll('[data-appeal]').forEach(b=>{ b.onclick=()=>openAppeal(parseInt(b.dataset.appeal)); });
    myEl.querySelectorAll('[data-mycomment]').forEach(b=>{ b.onclick=()=>openComments(parseInt(b.dataset.mycomment)); });
    updateTopStats(); icon();
  }

  function updateTopStats(){
    let up=0, down=0, comm=0;
    myLoops.forEach(p=>{
      let f=[...campus,...general].find(x=>x.id===p.id);
      if(f){ up+=f.up||0; down+=f.down||0; }
      comm+=(commentsData[p.id]||[]).length;
    });
    if($('statUp')) $('statUp').textContent=String(up);
    if($('statDown')) $('statDown').textContent=String(down);
    if($('statComment')) $('statComment').textContent=String(comm);
  }

  // ===== SHARE WITH ICON konnect2.png =====
  function openShare(postId){
    const post=[...campus,...general].find(x=>x.id===postId);
    if(!post) return;
    if($('shareText')) $('shareText').textContent=post.text;
    if($('shareTag')){ if(post.tag){ $('shareTag').textContent='#'+post.tag; $('shareTag').style.display='block'; } else { $('shareTag').style.display='none'; } }
    if($('shareUp')) $('shareUp').textContent='↑'+(post.up||0);
    if($('shareDown')) $('shareDown').textContent='↓'+(post.down||0);
    const iconImg=$('shareAppIcon'); 
    if(iconImg){ 
      iconImg.src='knnockt.png'; 
      iconImg.crossOrigin='anonymous';
      iconImg.style.display='block';
    }
    shareOverlay?.classList.add('show');
    const saveBtn=$('saveShareImage');
    if(saveBtn){ saveBtn.classList.remove('saved'); saveBtn.innerHTML='<i data-lucide="download" style="width:18px"></i>'; icon(); }
  }
  function closeShare(){ shareOverlay?.classList.remove('show'); }

  async function saveShareImage(){
    const card=$('shareImageCard'); 
    if(!card) return;
    const btn=$('saveShareImage');
    if(btn){ btn.innerHTML='<i data-lucide="loader-2" style="width:18px"></i>'; icon(); }
    try{
      const img=$('shareAppIcon');
      if(img){
        await new Promise(res=>{
          if(img.complete && img.naturalWidth>0) res();
          else { img.onload=res; img.onerror=res; setTimeout(res,1000); }
        });
      }
      const canvas = await html2canvas(card, {backgroundColor:'#0A0A0A', scale:2, useCORS:true, allowTaint:false, logging:false});
      const link=document.createElement('a');
      link.download=`konnect-loop-${Date.now()}.png`;
      link.href=canvas.toDataURL('image/png');
      link.click();
      if(btn){ btn.classList.add('saved'); btn.innerHTML='<i data-lucide="check" style="width:18px"></i>'; icon(); setTimeout(closeShare,800); }
    }catch(e){
      console.warn('save failed', e);
      // fallback without icon
      const iconImg=$('shareAppIcon');
      if(iconImg) iconImg.style.display='none';
      try{
        const canvas2 = await html2canvas(card, {backgroundColor:'#0A0A0A', scale:2});
        const link=document.createElement('a');
        link.download=`konnect-loop-${Date.now()}.png`;
        link.href=canvas2.toDataURL('image/png');
        link.click();
        if(btn){ btn.classList.add('saved'); btn.innerHTML='<i data-lucide="check" style="width:18px"></i>'; icon(); setTimeout(closeShare,800); }
      }catch(e2){
        alert('Add html2canvas script in head: <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>');
        if(btn){ btn.innerHTML='<i data-lucide="download" style="width:18px"></i>'; icon(); }
      }
      if(iconImg) iconImg.style.display='block';
    }
  }

  // ===== APPEAL =====
  let appealPostId=null;
  function openAppeal(postId){ appealPostId=postId; if($('appealInput')) $('appealInput').value=''; appealOverlay?.classList.add('show'); icon(); }
  function closeAppeal(){ appealOverlay?.classList.remove('show'); appealPostId=null; }
  function sendAppeal(){
    const txt=$('appealInput')?.value.trim(); if(!txt || !appealPostId) return;
    appeals.push({postId:appealPostId, text:txt, time:new Date().toISOString()});
    save(); closeAppeal(); alert('Appeal sent - we will review');
  }

  // ===== NEW POST =====
  function openNew(){ viewFeed?.classList.remove('active'); viewProf?.classList.remove('active'); viewNew?.classList.add('active'); setTimeout(()=>$('postInput')?.focus(),80); }
  function closeNew(){ viewNew?.classList.remove('active'); viewFeed?.classList.add('active'); popOverlay?.classList.remove('show'); }
  bind('mobNew',openNew); bind('deskNew',openNew); bind('deskNew2',openNew); bind('emptyPostBtn',openNew);
  bind('emptyExplore',()=>{ setActiveType('general'); renderFeed(); });
  bind('closeNew',closeNew); bind('closePop',()=>popOverlay?.classList.remove('show'));
  bind('closeShare',closeShare); bind('saveShareImage',saveShareImage);
  bind('closeAppeal',closeAppeal); bind('sendAppeal',sendAppeal);
  if(popOverlay) popOverlay.onclick=e=>{ if(e.target===popOverlay) popOverlay.classList.remove('show'); };
  if(shareOverlay) shareOverlay.onclick=e=>{ if(e.target===shareOverlay) closeShare(); };
  if(appealOverlay) appealOverlay.onclick=e=>{ if(e.target===appealOverlay) closeAppeal(); };

  // ===== COMMENTS =====
  function openComments(id){
    currentCommentPostId=id;
    if($('commentTitle')) $('commentTitle').innerHTML=`<i data-lucide="message-circle" style="width:18px"></i> Comments • ${(commentsData[id]||[]).length}`;
    renderComments(); commentOverlay?.classList.add('show'); setTimeout(()=>$('commentInput')?.focus(),100); icon();
  }
  function renderComments(){
    const list=$('commentList'); if(!list) return; list.innerHTML='';
    const arr=commentsData[currentCommentPostId]||[];
    if(arr.length===0){ list.innerHTML=`<div style="padding:30px;text-align:center;opacity:.4">No comments</div>`; return; }
    arr.forEach(c=>{ 
      let d=document.createElement('div'); d.className='comment-item'; 
      const opHtml = c.isOwner ? `<span class="op-badge">OP</span>` : '';
      d.innerHTML=`<div class="meta">anon ${opHtml} • ${c.time}</div><div class="txt">${esc(c.text)}</div>`; 
      list.appendChild(d); 
    });
    list.scrollTop=list.scrollHeight; icon();
  }
  function sendComment(){
    const inp=$('commentInput'); if(!inp) return; let txt=inp.value.trim(); if(!txt||!currentCommentPostId) return;
    if(!commentsData[currentCommentPostId]) commentsData[currentCommentPostId]=[];
    const isOwnerComment = isOwner(currentCommentPostId);
    commentsData[currentCommentPostId].push({text:txt,time:'now', isOwner:isOwnerComment}); 
    inp.value=''; save(); renderComments(); renderFeed(); renderMy();
  }
  bind('closeComment',()=>{ commentOverlay?.classList.remove('show'); });
  bind('sendComment',sendComment);
  const cIn=$('commentInput'); if(cIn) cIn.onkeydown=e=>{ if(e.key==='Enter') sendComment(); };

  // ===== NAV =====
  bind('myLoopsBtn',()=>{ viewFeed?.classList.remove('active'); viewProf?.classList.add('active'); renderMy(); });
  bind('goProfileDesk',()=>{ viewFeed?.classList.remove('active'); viewProf?.classList.add('active'); renderMy(); });
  bind('backBtn',()=>{ viewProf?.classList.remove('active'); viewFeed?.classList.add('active'); renderFeed(); });
  bind('goFeedDesk',()=>{ viewProf?.classList.remove('active'); viewFeed?.classList.add('active'); renderFeed(); });
  bind('nextBtn',nextRot); bind('prevBtn',prevRot); bind('dNext',nextRot); bind('dPrev',prevRot);

  const postInput=$('postInput'), charEl=$('char'), openSel=$('openSelector');
  if(postInput) postInput.oninput=e=>{ if(charEl) charEl.textContent=String(e.target.value.length); if(openSel) openSel.disabled=!e.target.value.trim(); };
  if(openSel) openSel.onclick=()=>{ if(popOverlay) popOverlay.classList.add('show'); icon(); };

  // post now - mark first posted as test for 1 downvote hide
  function postNow(t){
    if(loader) loader.style.display='block';
    setTimeout(()=>{
      const te=$('postInput'); if(!te) return; let txt=te.value.trim(); if(!txt) return;
      let id=Date.now();
      let obj={id,text:txt,time:'now',up:1,down:0, tag:selectedTag};
      myLoops.unshift({id,text:txt,time:'now',target:t==='campus'?'Campus':'General', tag:selectedTag});
      if(t==='campus'){ campus.unshift(obj); setActiveType('campus'); } else { general.unshift(obj); setActiveType('general'); }
      // mark this as first test post if none exists yet
      if(!firstTestPostId){
        firstTestPostId=id;
      }
      te.value=''; if(charEl) charEl.textContent='0'; if(openSel) openSel.disabled=true;
      selectedTag=null; document.querySelectorAll('.tag-opt').forEach(b=>b.classList.remove('selected'));
      if(loader) loader.style.display='none'; if(popOverlay) popOverlay.classList.remove('show'); closeNew(); save(); renderMy(); renderFeed(); renderRot();
    },700);
  }
  bind('chooseCampus',()=>postNow('campus')); bind('chooseGeneral',()=>postNow('general'));
  const tabC=$('tabCampus'), tabG=$('tabGeneral');
  if(tabC) tabC.onclick=()=>{ setActiveType('campus'); renderFeed(); };
  if(tabG) tabG.onclick=()=>{ setActiveType('general'); renderFeed(); };

  // ===== INIT =====
  setActiveType(activeType); renderFeed(); renderMy(); renderRot(); icon();
});
