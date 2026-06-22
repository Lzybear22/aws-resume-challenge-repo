// PARTICLE
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COUNT = 55, MAX_DIST = 130, ACCENT = '79,142,247';
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function mkParticle() { return { x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:Math.random()*1.5+.8 }; }
  function init() { resize(); particles = Array.from({length:COUNT}, mkParticle); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if (d<MAX_DIST) { ctx.beginPath(); ctx.strokeStyle=`rgba(${ACCENT},${(1-d/MAX_DIST)*.18})`; ctx.lineWidth=.6; ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); }
    }
    particles.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${ACCENT},.45)`;ctx.fill();});
  }
  function update() { particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;}); }
  function loop() { update(); draw(); requestAnimationFrame(loop); }
  window.addEventListener('resize', resize);
  init(); loop();
})();

// TYPEWRITER
(function () {
  const el = document.getElementById('typewriter');
  const roles = ['Cloud Engineer','AWS Architect','Terraform Builder','DevOps Enthusiast'];
  let ri=0, ci=0, deleting=false;
  function tick() {
    const word = roles[ri];
    if (!deleting) { el.textContent=word.slice(0,++ci); if(ci===word.length){deleting=true;setTimeout(tick,1800);return;} }
    else { el.textContent=word.slice(0,--ci); if(ci===0){deleting=false;ri=(ri+1)%roles.length;} }
    setTimeout(tick, deleting?40:75);
  }
  setTimeout(tick, 900);
})();

// VISITOR COUNTER
(function () {
  const el = document.getElementById('visitor-count');
  const COUNTER_URL = typeof CONFIG !== 'undefined' && CONFIG.COUNTER_URL ? CONFIG.COUNTER_URL : '';
  if (!COUNTER_URL) { el.textContent = '—'; return; }
  fetch(COUNTER_URL, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      const count = data.count || data.visitor_count || data.visits || 0;
      // animate count up
      let current = 0;
      const target = parseInt(count, 10);
      const step = Math.max(1, Math.floor(target / 40));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 30);
    })
    .catch(() => { el.textContent = '—'; });
})();

// NAVBAR
const navbar   = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar nav ul li a');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('fixed-top', window.scrollY > 20);
  const navH = navbar.offsetHeight;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    if (window.scrollY >= section.offsetTop - navH - 10 && window.scrollY < section.offsetTop - navH - 10 + section.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector(`.navbar nav ul li a[href="#${id}"]`)?.classList.add('active');
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href==='#') return;
    const target = document.getElementById(href.substring(1));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - navbar.offsetHeight, behavior: 'smooth' });
  });
});

// SCROLL REVEAL
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

// SKILL POP-IN
const skillEls = document.querySelectorAll('.skill-pop');
const skillGrid = document.querySelector('.skill-grid');
if (skillGrid) {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ skillEls.forEach((s,i)=>setTimeout(()=>s.classList.add('popped'),i*50)); } });
  }, { threshold: 0.2 }).observe(skillGrid);
}

// ARCHITECTURE DIAGRAM
const NODE_INFO = {
  user: {
    title: 'Visitor',
    body: 'You! Every request starts here. Your browser resolves the domain via DNS, which points to a CloudFront distribution serving the site globally.'
  },
  cloudfront: {
    title: 'Amazon CloudFront',
    body: 'AWS\'s global CDN with 400+ edge locations. Serves the static site with low latency worldwide, handles HTTPS termination, and caches assets so S3 is rarely hit directly.'
  },
  s3: {
    title: 'Amazon S3',
    body: 'Stores all the static files — HTML, CSS, JS, images. S3 is never exposed publicly; CloudFront is the only origin. Costs cents per month for a static site.'
  },
  apigw: {
    title: 'Amazon API Gateway',
    body: 'The HTTP endpoint that the frontend calls for the visitor counter and chatbot. Provides a stable public URL, handles CORS, and routes requests to Lambda — no server needed.'
  },
  lambda: {
    title: 'AWS Lambda',
    body: 'Python functions that run on-demand. One handles the visitor counter (read + write DynamoDB), another handles chatbot responses. Zero cost when idle, scales automatically under load.'
  },
  dynamo: {
    title: 'Amazon DynamoDB',
    body: 'Serverless NoSQL database storing the visitor count. Single-digit millisecond reads/writes, no infrastructure to manage, and the free tier covers this workload entirely.'
  },
  gha: {
    title: 'GitHub Actions',
    body: 'CI/CD pipeline that runs on every git push. Syncs updated files to S3 and invalidates the CloudFront cache automatically — no manual deploys ever needed.'
  },
  terraform: {
    title: 'Terraform',
    body: 'Every AWS resource — S3 bucket, CloudFront distribution, Lambda functions, API Gateway, DynamoDB table, IAM roles — is defined as code. Infrastructure is reproducible, version-controlled, and destroyable in one command.'
  }
};

// Connection pairs [from, to]
const CONNECTIONS = [
  ['user','cloudfront'],
  ['cloudfront','s3'],
  ['cloudfront','apigw'],
  ['apigw','lambda'],
  ['lambda','dynamo'],
  ['gha','s3'],
  ['terraform','cloudfront'],
];

function drawArchLines() {
  const svg = document.getElementById('arch-lines');
  if (!svg) return;
  const diagram = document.getElementById('arch-diagram');
  const dRect = diagram.getBoundingClientRect();
  svg.innerHTML = '';

  CONNECTIONS.forEach(([fromId, toId]) => {
    const fromEl = diagram.querySelector(`[data-node="${fromId}"]`);
    const toEl   = diagram.querySelector(`[data-node="${toId}"]`);
    if (!fromEl || !toEl) return;
    const fR = fromEl.getBoundingClientRect();
    const tR = toEl.getBoundingClientRect();
    const x1 = fR.left + fR.width/2  - dRect.left;
    const y1 = fR.top  + fR.height/2 - dRect.top;
    const x2 = tR.left + tR.width/2  - dRect.left;
    const y2 = tR.top  + tR.height/2 - dRect.top;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#2a3347');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);
  });
}

window.addEventListener('load', drawArchLines);
window.addEventListener('resize', drawArchLines);

const infoPanel = document.getElementById('arch-info-panel');
document.querySelectorAll('.arch-node').forEach(node => {
  node.addEventListener('click', () => {
    const key = node.dataset.node;
    const info = NODE_INFO[key];
    if (!info) return;
    document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('active'));
    node.classList.add('active');
    infoPanel.classList.add('active');
    infoPanel.innerHTML = `<p class="arch-info-title">${info.title}</p><p class="arch-info-body">${info.body}</p>`;
  });
});

// CERT BADGE
const certBadge = document.getElementById('cert-badge');
if (certBadge) {
  certBadge.addEventListener('click', () => certBadge.classList.toggle('active'));
  document.addEventListener('click', e => { if (!certBadge.contains(e.target)) certBadge.classList.remove('active'); });
}
// CHATBOT
const chatbotBtn   = document.getElementById('chatbot-button');
const chatbotModal = document.getElementById('chatbot-modal');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMsgs  = document.getElementById('chatbot-messages');
const API_URL      = typeof CONFIG !== 'undefined' ? CONFIG.API_URL : '';

function scrollToBottom() { setTimeout(() => { chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight; }, 50); }
function formatMsg(text) { return text.replace(/\n/g, '<br>'); }
function addMsg(role, text) {
  const cls = role==='user'?'user-msg':'bot-msg', label=role==='user'?'You':'Chatbot';
  chatbotMsgs.innerHTML += `<div class="${cls}"><span class="msg-label">${label}</span><div class="msg-text">${formatMsg(text)}</div></div>`;
  scrollToBottom();
}

const LOCAL_RESPONSES = { help: `Available commands:\n- resume   — get my resume link\n- skills   — see my skills\n- projects — learn about my projects\n- email    — send me a message` };
const RECOGNIZED = new Set(['help','resume','skills','projects','email']);

chatbotInput.addEventListener('keydown', async e => {
  if (e.key !== 'Enter') return;
  const raw = chatbotInput.value.trim(); if (!raw) return;
  const lower = raw.toLowerCase(); chatbotInput.value = '';
  addMsg('user', raw);
  if (LOCAL_RESPONSES[lower]) { addMsg('bot', LOCAL_RESPONSES[lower]); return; }
  if (!RECOGNIZED.has(lower)) { addMsg('bot', 'I didn\'t recognize that.\nType "help" to see what I can do.'); return; }
  try {
    const res = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:raw}) });
    const data = await res.json();
    addMsg('bot', data.reply?.trim() || 'No response received.');
  } catch { addMsg('bot', 'Could not reach the server. Please try again later.'); }
});

function openChatbot() {
  chatbotModal.style.display = 'flex';
  if (chatbotMsgs.innerHTML.trim()==='') addMsg('bot', 'Hi! I\'m Hunter\'s chatbot.\nType "help" to see available commands.');
}
chatbotBtn.addEventListener('click', openChatbot);
chatbotClose.addEventListener('click', () => { chatbotModal.style.display='none'; });
document.querySelectorAll('.open-chatbot').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); openChatbot(); }));