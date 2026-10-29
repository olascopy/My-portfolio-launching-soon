lucide.createIcons({attrs:{"stroke-width":1.7}});

let campus=[
  {id:1,text:"Anyone know if library open 24/7 during finals?",time:"4m",up:128,down:3},
  {id:2,text:"POV: it is 2am and dining hall cookies are elite",time:"17m",up:92,down:1},
  {id:4,text:"That lecturer wey dey do attendance 5 mins before class ends",time:"1h",up:245,down:5}
];
let general=[
  {id:3,text:"Free iced coffee in Quad right now",time:"6m",up:203,down:12}
];
let myLoops=[], myVotes={}, rotIndex=0;
const rotData=[
  {title:"Campus Pulse", html:`<h4><span style="width:6px;height:6px;background:#34C759;border-radius:50%;display:inline-block"></span> Live now</h4><b>12 online • 89 loops today</b><p>Vibe: exam stress • 68 percent cramming • Peak: 9pm</p>`},
  {title:"Daily Prompt", html:`<h4><i data-lucide="lightbulb" style="width:12px"></i> Question of day</h4><b>What is the most annoying thing in library?</b><p>Tap answer to post anonymously — 23 people answered today</p><button id="answerPrompt" style="margin-top:12px;border:none;background:#fff;color:#000;padding:8px 14px;border-radius:999px;font-weight:700;font-size:12px;cursor:pointer">Answer anonymously</button>`},
  {title:"Campus Poll", html:`<h4><i data-lucide="bar-chart-2" style="width:12px"></i> Poll • 128 votes</h4><b>Coffee vs Energy drink for finals?</b><div class="poll-bar"><div style="width:62%;background:#fff"></div><div style="width:38%;background:rgba(255,255,255,.2)"></div></div><div class="poll-opts"><button data-poll="c">Coffee • 62 percent</button><button data-poll="e">Energy drink • 38 percent</button></div>`}
];

function renderRot(){
  const cur=rotData[rotIndex];
  document.getElementById('mobileRot').innerHTML=cur.html;
  document.getElementById('deskRot').innerHTML=cur.html;
  document.getElementById('mobileDots').innerHTML=rotData.map((_,i)=>`<span class="${i===rotIndex?'active':''}"></span>`).join('');
  document.getElementById('deskDots').innerHTML=rotData.map((_,i)=>`<span class="${i===rotIndex?'active':''}"></span>`).join('');
  lucide.createIcons({attrs:{"stroke-width":1.7}});
  const ap=document.getElementById('answerPrompt');
  if(ap) ap.onclick=()=>{openNew(); document.getElementById('postInput').value="Library ick: "; document.getElementById('char').textContent=document.getElementById('postInput').value.length; document.getElementById('openSelector').disabled=false;};
  document.querySelectorAll('[data-poll]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-poll]').forEach(x=>x.classList.remove('voted')); b.classList.add('voted');});
}
function nextRot(){rotIndex=(rotIndex+1)%3; renderRot();}
function prevRot(){rotIndex=(rotIndex-1+3)%3; renderRot();}
setInterval(nextRot,20000);
renderRot();

const feedEl=document.getElementById('feed'), myEl=document.getElementById('myPosts'), popOverlay=document.getElementById('popOverlay'), loader=document.getElementById('loader');
const viewFeed=document.getElementById('viewFeed'), viewProf=document.getElementById('viewProfile'), viewNew=document.getElementById('viewNew');

function renderFeed(){
  feedEl.innerHTML=""; let list=document.getElementById('tabCampus').classList.contains('active')?campus:general;
  list.forEach(p=>{
    let v=myVotes[p.id]; let d=document.createElement('div'); d.className="post";
    d.innerHTML=`<div class="meta"><i data-lucide="clock-3" style="width:12px"></i> anon • ${p.time}</div><div class="txt">${p.text}</div><div class="acts"><button data-up="${p.id}" class="${v==='up'?'upvoted':''}"><i data-lucide="arrow-up" style="width:16px"></i> ${p.up}</button><span class="score">${p.up-(p.down||0)}</span><button data-down="${p.id}" class="${v==='down'?'downvoted':''}"><i data-lucide="arrow-down" style="width:16px"></i></button></div>`;
    feedEl.appendChild(d);
  });
  lucide.createIcons({attrs:{"stroke-width":1.7}});
  feedEl.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{let id=parseInt(b.dataset.up), p=[...campus,...general].find(x=>x.id===id); let cur=myVotes[id]; if(cur==='up'){p.up--; delete myVotes[id];}else{if(cur==='down')p.down--; p.up++; myVotes[id]='up';} renderFeed();});
  feedEl.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{let id=parseInt(b.dataset.down), p=[...campus,...general].find(x=>x.id===id); let cur=myVotes[id]; if(cur==='down'){p.down--; delete myVotes[id];}else{if(cur==='up')p.up--; p.down++; myVotes[id]='down';} renderFeed();});
  document.getElementById('topCount').textContent=myLoops.length;
}

function renderMy(){
  if(myLoops.length===0){myEl.innerHTML=`<div style="padding:40px;text-align:center;opacity:.4">No loops yet</div>`;return;}
  myEl.innerHTML=""; myLoops.forEach((p,i)=>{let d=document.createElement('div');d.className="post";d.innerHTML=`<div class="meta">You • ${p.time} • ${p.target} <button data-del="${i}" style="margin-left:auto;border:none;background:none;color:#FF453A;display:flex;gap:4px;font-size:12px;font-weight:600;cursor:pointer"><i data-lucide="trash-2" style="width:14px"></i> Delete</button></div><div class="txt">${p.text}</div>`;myEl.appendChild(d);}); lucide.createIcons({attrs:{"stroke-width":1.7}}); myEl.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{myLoops.splice(parseInt(b.dataset.del),1); renderMy(); renderFeed();});
}

function openNew(){viewFeed.classList.remove('active');viewProf.classList.remove('active');viewNew.classList.add('active');setTimeout(()=>document.getElementById('postInput').focus(),80);}
function closeNew(){viewNew.classList.remove('active');viewFeed.classList.add('active');popOverlay.classList.remove('show');}
document.getElementById('mobNew').onclick=openNew; document.getElementById('deskNew').onclick=openNew; document.getElementById('deskNew2').onclick=openNew;
document.getElementById('closeNew').onclick=closeNew;
document.getElementById('closePop').onclick=()=>popOverlay.classList.remove('show');
popOverlay.onclick=e=>{if(e.target===popOverlay)popOverlay.classList.remove('show');};
document.getElementById('myLoopsBtn').onclick=()=>{viewFeed.classList.remove('active');viewProf.classList.add('active');renderMy();};
document.getElementById('backBtn').onclick=()=>{viewProf.classList.remove('active');viewFeed.classList.add('active');renderFeed();};
document.getElementById('nextBtn').onclick=nextRot; document.getElementById('prevBtn').onclick=prevRot;
document.getElementById('dNext').onclick=nextRot; document.getElementById('dPrev').onclick=prevRot;

let startX=0; const wrap=document.getElementById('mobileRotWrap');
wrap.addEventListener('touchstart', e=>{startX=e.touches[0].clientX;},{passive:true});
wrap.addEventListener('touchend', e=>{let dx=e.changedTouches[0].clientX-startX; if(dx<-50) nextRot(); if(dx>50) prevRot();});

document.getElementById('postInput').oninput=e=>{document.getElementById('char').textContent=e.target.value.length;document.getElementById('openSelector').disabled=!e.target.value.trim();};
document.getElementById('openSelector').onclick=()=>{popOverlay.classList.add('show');let c=document.querySelector('.pop-card');c.classList.remove('wiggle');void c.offsetWidth;c.classList.add('wiggle');lucide.createIcons({attrs:{"stroke-width":1.7}});};
function postNow(t){loader.style.display="block";document.querySelectorAll('.choice button').forEach(b=>b.classList.remove('selected'));document.getElementById(t==='campus'?'chooseCampus':'chooseGeneral').classList.add('selected');setTimeout(()=>{let txt=document.getElementById('postInput').value.trim();if(!txt)return;myLoops.unshift({text:txt,time:"now",target:t==='campus'?'Campus':'General'});if(t==='campus')campus.unshift({id:Date.now(),text:txt,time:"now",up:1,down:0});else general.unshift({id:Date.now(),text:txt,time:"now",up:1,down:0});document.getElementById('postInput').value="";document.getElementById('char').textContent="0";document.getElementById('openSelector').disabled=true;loader.style.display="none";popOverlay.classList.remove('show');closeNew();renderMy();renderFeed();},800);}
document.getElementById('chooseCampus').onclick=()=>postNow('campus');
document.getElementById('chooseGeneral').onclick=()=>postNow('general');
document.getElementById('tabCampus').onclick=e=>{e.target.classList.add('active');document.getElementById('tabGeneral').classList.remove('active');document.getElementById('herdLabel').textContent="My Herd • Campus";renderFeed();};
document.getElementById('tabGeneral').onclick=e=>{e.target.classList.add('active');document.getElementById('tabCampus').classList.remove('active');document.getElementById('herdLabel').textContent="Everywhere • General";renderFeed();};
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const go=b.dataset.go;document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));if(go==='feed'){viewFeed.classList.add('active');renderFeed();}else{viewProf.classList.add('active');renderMy();}});
renderFeed();