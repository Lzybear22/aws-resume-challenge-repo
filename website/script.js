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
  const roles = ['Cloud Engineering Student','Building on AWS','Writing Terraform'];
  let ri=0, ci=0, deleting=false;
  function tick() {
    const word = roles[ri];
    if (!deleting) { el.textContent=word.slice(0,++ci); if(ci===word.length){deleting=true;setTimeout(tick,1800);return;} }
    else { el.textContent=word.slice(0,--ci); if(ci===0){deleting=false;ri=(ri+1)%roles.length;} }
    setTimeout(tick, deleting?40:75);
  }
  setTimeout(tick, 900);
})();

// DEPLOY STATUS
(function () {
  const el = document.getElementById('deploy-status');
  const dot = el.querySelector('.status-dot');
  const label = el.querySelector('.visitor-label');
  const RUNS_URL = 'https://api.github.com/repos/Lzybear22/aws-resume-challenge-repo/actions/workflows/deploy.yaml/runs?branch=main&event=push&per_page=1';
  const fmt = d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function show(text, state, title) {
    label.textContent = text;
    if (state) dot.classList.add(state);
    el.title = title;
    el.style.display = '';
  }

  // fallback: deploy time written into config.js by GitHub Actions
  function fallback() {
    if (typeof CONFIG === 'undefined' || !CONFIG.LAST_DEPLOY || isNaN(new Date(CONFIG.LAST_DEPLOY))) return;
    show('Last deployed ' + fmt(CONFIG.LAST_DEPLOY), '',
      'Deployed by GitHub Actions' + (CONFIG.COMMIT ? ' (commit ' + CONFIG.COMMIT + ')' : ''));
  }

  fetch(RUNS_URL)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const run = data.workflow_runs && data.workflow_runs[0];
      if (!run) return fallback();
      const title = 'GitHub Actions run for commit ' + run.head_sha.slice(0, 7);
      if (run.status !== 'completed') show('Deploying now...', 'is-running', title);
      else if (run.conclusion === 'success') show('Last deployed ' + fmt(run.updated_at), '', title);
      else show('Last deploy failed ' + fmt(run.updated_at), 'is-failed', title);
    })
    .catch(fallback);
})();

// VISITOR COUNTER
(function () {
  const el = document.getElementById('visitor-count');
  const COUNTER_URL = typeof CONFIG !== 'undefined' && CONFIG.COUNTER_URL ? CONFIG.COUNTER_URL : '';
  if (!COUNTER_URL) { el.textContent = '...'; return; }
  fetch(COUNTER_URL, { method: 'GET' })
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
    .catch(() => { el.textContent = '...'; });
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

// MOBILE MENU
const navToggle = document.querySelector('.nav-toggle');
function setMenu(open) {
  navbar.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
navToggle.addEventListener('click', () => setMenu(!navbar.classList.contains('menu-open')));
navLinks.forEach(l => l.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (!navbar.contains(e.target)) setMenu(false); });

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
    title: 'You',
    body: 'That\'s you. When you go to hunterulrich.dev, DNS sends your browser to CloudFront.'
  },
  cloudfront: {
    title: 'Amazon CloudFront',
    body: 'AWS\'s content delivery network. It serves the site over HTTPS and caches the files in locations around the world so the pages load fast.'
  },
  s3: {
    title: 'Amazon S3',
    body: 'Holds the site\'s files: HTML, CSS, JavaScript, and images. The bucket isn\'t public. Only CloudFront can read from it.'
  },
  apigw: {
    title: 'Amazon API Gateway',
    body: 'Gives the site a URL to call for the visitor counter and the chatbot. It handles CORS and passes each request to Lambda, so I don\'t need to run a server.'
  },
  lambda: {
    title: 'AWS Lambda',
    body: 'Two small JavaScript functions. One updates the visitor count in DynamoDB, and the other answers chatbot messages. They only run when someone uses them, so they cost almost nothing.'
  },
  dynamo: {
    title: 'Amazon DynamoDB',
    body: 'A NoSQL database that stores the visitor count. It\'s one small table, and there\'s no server for me to manage.'
  },
  gha: {
    title: 'GitHub Actions',
    body: 'Runs every time I push to main. It runs Terraform, uploads the site files to S3, and clears the CloudFront cache so changes show up right away. It signs in to AWS with OIDC, so no AWS keys are stored in GitHub.'
  },
  terraform: {
    title: 'Terraform',
    body: 'Every AWS resource for this site is written in Terraform: the S3 bucket, CloudFront, the Lambda functions, API Gateway, DynamoDB, and the IAM roles. I can see each change before it happens, and the whole setup is saved in Git.'
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
// On phones the diagram becomes a tap-to-expand list (see style.css)
const archMobile = window.matchMedia('(max-width: 600px)');
document.querySelectorAll('.arch-node').forEach(node => {
  const info = NODE_INFO[node.dataset.node];
  if (info) {
    const desc = document.createElement('p');
    desc.className = 'arch-node-desc';
    desc.textContent = info.body;
    node.appendChild(desc);
  }
  node.addEventListener('click', e => {
    const key = node.dataset.node;
    const info = NODE_INFO[key];
    if (!info) return;
    if (archMobile.matches && node.classList.contains('active')) {
      if (!e.target.closest('.arch-node-desc')) node.classList.remove('active');
      return;
    }
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
  const div = document.createElement('div');
  div.className = cls;
  div.innerHTML = `<span class="msg-label">${label}</span><div class="msg-text">${formatMsg(text)}</div>`;
  chatbotMsgs.appendChild(div);
  scrollToBottom();
}

const LOCAL_RESPONSES = { help: `Here's what you can type:\n- resume: get my resume\n- skills: see what I work with\n- projects: hear about my projects\n- email: send me a message` };
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
  } catch { addMsg('bot', 'I couldn\'t reach the chatbot right now. Try again in a bit.'); }
});

function openChatbot() {
  chatbotModal.style.display = 'flex';
  if (chatbotMsgs.innerHTML.trim()==='') addMsg('bot', 'Hi! I\'m Hunter\'s chatbot.\nType "help" to see available commands.');
}
chatbotBtn.addEventListener('click', openChatbot);
chatbotClose.addEventListener('click', () => { chatbotModal.style.display='none'; });
document.querySelectorAll('.open-chatbot').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); openChatbot(); }));
// FAILURE SIMULATOR
// Everything here is a scripted simulation in the browser. It doesn't call AWS.
(function () {
  const runBtn = document.getElementById('sim-run');
  if (!runBtn) return;
  const select     = document.getElementById('sim-scenario');
  const recoverBtn = document.getElementById('sim-recover');
  const resetBtn   = document.getElementById('sim-reset');
  const banner     = document.getElementById('sim-banner');
  const nodesEl    = document.getElementById('sim-nodes');
  const metricsEl  = document.getElementById('sim-metrics');
  const logEl      = document.getElementById('sim-log');
  const explainEl  = document.getElementById('sim-explain');
  const tabsEl     = document.getElementById('sim-tabs');
  const tabBody    = document.getElementById('sim-tab-body');
  const footerEl   = document.getElementById('sim-footer');
  const footerText = document.getElementById('sim-footer-status');

  const NODES = [
    ['user', 'You', null],
    ['cloudfront', 'CloudFront', 'cloudfront'],
    ['s3', 'S3', 's3'],
    ['apigw', 'API Gateway', 'apigateway'],
    ['lambda', 'Lambda', 'lambda'],
    ['dynamo', 'DynamoDB', 'dynamodb'],
    ['gha', 'GitHub Actions', 'github'],
    ['terraform', 'Terraform', 'terraform'],
  ];
  const STATE_WORD = { ok: 'Healthy', warn: 'Degraded', down: 'Down', skip: 'Skipped' };
  const STATE_ICON = { ok: '✓', warn: '!', down: '✕', skip: '–' };
  const HEALTHY = { availability: 100, errors: 0, cache: 85, pipeline: ['Passing', 'ok'] };

  const SCENARIOS = {
    s3: {
      banner: 'Incident: S3 origin not responding',
      nodes: {
        user: ['warn', 'Some pages fail'],
        cloudfront: ['warn', 'Serving from cache'],
        s3: ['down', 'Not responding'],
        gha: ['warn', 'Next deploy would fail'],
      },
      metrics: { availability: 78, errors: 22, cache: 78, pipeline: ['Idle', 'ok'] },
      log: [
        ['+0s', 'error', 's3: GetObject requests to the site bucket timing out (us-west-2)'],
        ['+2s', 'warn', 'cloudfront: origin returned 503 for /resume.pdf (not in edge cache)'],
        ['+3s', 'info', 'cloudfront: /index.html served from edge cache (Hit from cloudfront)'],
        ['+5s', 'info', 'visitor counter + chatbot: 200 OK, API path does not use S3'],
        ['+60s', 'warn', 'cloudwatch: CloudFront 5xxErrorRate climbing past 20%'],
      ],
      cause: '<p>The bucket that holds this site\'s HTML, CSS, JavaScript, images and resume stops answering. That could be an S3 problem in <code>us-west-2</code>, or the bucket being deleted or emptied by mistake. CloudFront itself is fine, but it can\'t fetch anything new from its origin.</p>',
      impact: '<p>CloudFront keeps copies of my files at edge locations for up to 24 hours (<code>default_ttl = 86400</code> in my Terraform). Anything already cached near you keeps loading. Anything that isn\'t, like an expired file or a page nobody nearby has requested yet, comes back as a 5xx error.</p><p>The visitor counter and chatbot keep working because they go through API Gateway and Lambda, not S3.</p><p>The worst time for this outage is right after a deploy: my pipeline clears the whole CloudFront cache (<code>/*</code>), so there\'s nothing left to serve.</p>',
      detect: '<ul><li><strong>CloudWatch:</strong> CloudFront\'s <code>5xxErrorRate</code> metric. This is the first thing I\'d put an alarm on.</li><li><strong>AWS Health Dashboard:</strong> shows whether S3 has a known issue in my region.</li><li><strong>Response headers:</strong> <code>x-cache: Hit from cloudfront</code> vs <code>Error from cloudfront</code> tells you whether a file came from the cache or failed at the origin.</li><li><strong>Pipeline smoke test:</strong> the curl of the homepage would fail on the next deploy.</li></ul>',
      steps: [
        { title: 'Confirm the origin is the problem', detail: 'Check the AWS Health Dashboard and try reading an object from the bucket with the AWS CLI. If S3 fails but CloudFront answers, it\'s the origin, not the CDN.',
          log: ['info', 'aws s3 ls on the bucket: timeout. S3 confirmed as the cause.'] },
        { title: 'Protect the cache', detail: 'Pause deploys and don\'t run a CloudFront invalidation. Right now the cache is the only thing keeping pages up.',
          log: ['info', 'Deploys paused, cache left intact'], nodes: { gha: ['skip', 'Paused'] } },
        { title: 'Restore the bucket', detail: 'If S3 recovered on its own, there\'s nothing to rebuild. If the bucket was deleted or emptied, <code>terraform apply</code> recreates it with its policy and the pipeline re-uploads every file from Git, which is the source of truth.',
          log: ['info', 'terraform apply: bucket + policy in place. aws s3 sync: files uploaded'], heal: 0.6, nodes: { s3: ['ok', 'Healthy'], cloudfront: ['warn', 'Refilling cache'], user: ['warn', 'Recovering'] } },
        { title: 'Refresh the cache and verify', detail: 'Invalidate the CloudFront cache so edges pull fresh copies, then run the smoke test against the homepage, visitor counter and chatbot.',
          log: ['ok', 'Invalidation /* complete. Smoke test passed.'] },
      ],
      next: 'What I\'d add next: a copy of the bucket in a second region using S3 replication, and a CloudFront origin group that fails over to it automatically.',
    },

    deploy: {
      banner: 'Incident: deployment failed (live site not affected)',
      nodes: {
        gha: ['down', 'Build failed'],
        terraform: ['skip', 'Apply skipped'],
        s3: ['ok', 'Previous version'],
        lambda: ['ok', 'Previous version'],
        user: ['ok', 'No impact'],
      },
      metrics: { availability: 100, errors: 0, cache: 85, pipeline: ['Failed', 'down'] },
      log: [
        ['+0s', 'info', 'git push origin main (commit 9f2c1ab "update chatbot replies")'],
        ['+8s', 'info', 'GitHub Actions: "Deploy Resume Website" started'],
        ['+21s', 'error', 'Check Lambda code: node --check ../lambda/chatbot.js'],
        ['+21s', 'error', 'chatbot.js:42  SyntaxError: Unexpected token \'}\''],
        ['+22s', 'error', 'Process completed with exit code 1'],
        ['+22s', 'warn', 'Terraform Apply: skipped'],
        ['+22s', 'warn', 'Deploy Website Files: skipped (needs: terraform)'],
        ['+23s', 'info', 'Production is still serving the last good commit'],
      ],
      cause: '<p>I push a change to the chatbot Lambda that has a syntax error. My pipeline runs <code>node --check</code> on both Lambda functions before Terraform touches anything, and that check fails.</p>',
      impact: '<p><strong>None.</strong> The Terraform job stops before <code>terraform apply</code>, and the "Deploy Website Files" job never starts because it depends on the Terraform job (<code>needs: terraform</code>). The live site keeps running the last version that passed.</p><p>That\'s the point of running checks before the deploy step: a broken build fails in the pipeline, not in front of visitors.</p>',
      detect: '<ul><li><strong>GitHub Actions</strong> marks the run as failed and emails me.</li><li><strong>This page:</strong> the deploy status in the header reads the latest run from the GitHub API and switches to "Last deploy failed".</li><li><strong>The step log</strong> points to the exact file and line.</li></ul><p class="sim-note">The limit: <code>node --check</code> only catches syntax errors. A logic bug or a broken <code>index.html</code> would still deploy. My smoke test catches a site that\'s completely down, but only after it\'s live. Next step: unit tests for the Lambdas and a staging environment that gets tested first.</p>',
      steps: [
        { title: 'Read the failing step', detail: 'Open the failed run in GitHub Actions and find the step and line that broke.',
          log: ['info', 'Run log: chatbot.js line 42, extra closing brace'] },
        { title: 'Fix it or revert it', detail: 'Fix the bug locally and run <code>node --check</code> before pushing. If the fix isn\'t obvious, <code>git revert</code> the commit so main is back to a known-good state.',
          log: ['info', 'Fixed locally, node --check passes'], pipeline: ['Fix ready', 'warn'] },
        { title: 'Push and redeploy', detail: 'Pushing to main runs the whole pipeline again: checks, <code>terraform apply</code>, S3 sync and a CloudFront invalidation.',
          log: ['info', 'Checks passed, terraform apply, s3 sync, CloudFront invalidation'], nodes: { gha: ['warn', 'Running'], terraform: ['ok', 'Applied'] }, pipeline: ['Running', 'warn'] },
        { title: 'Confirm with the smoke test', detail: 'The last step of the pipeline curls the homepage, the visitor counter API and the chatbot API.',
          log: ['ok', 'Smoke test: website, visitor counter and chatbot all respond'] },
      ],
      next: 'What I\'d add next: Lambda unit tests in the pipeline, and a staging stage that must pass before production.',
    },

    denied: {
      banner: 'Incident: S3 returning 403 Access Denied',
      nodes: {
        user: ['down', 'Seeing 403 errors'],
        cloudfront: ['warn', 'Origin refusing'],
        s3: ['down', 'Denying CloudFront'],
        gha: ['warn', 'Smoke test failed'],
        terraform: ['warn', 'Policy changed'],
      },
      metrics: { availability: 4, errors: 96, cache: 0, pipeline: ['Failed', 'down'] },
      log: [
        ['+0s', 'info', 'terraform apply: aws_s3_bucket_policy.private_bucket_policy updated'],
        ['+4s', 'info', 'pipeline: CloudFront invalidation /* created'],
        ['+9s', 'error', 'cloudfront to s3: 403 AccessDenied for /index.html'],
        ['+9s', 'error', 'cloudfront to s3: 403 AccessDenied for /style.css'],
        ['+12s', 'error', 'Smoke test: curl -sf https://hunterulrich.dev/ failed (403)'],
        ['+12s', 'info', 'visitor counter + chatbot: 200 OK, they don\'t read from S3'],
      ],
      cause: '<p>My bucket is private. Its policy lets exactly one principal read it: CloudFront\'s Origin Access Identity, with <code>s3:GetObject</code>. If that policy changes by mistake, like a wrong principal ARN in Terraform or the identity being recreated without updating the policy, S3 rejects every request from CloudFront.</p>',
      impact: '<p>Normally the cache would hide a problem for a while, but this one comes in through a deploy, and my pipeline clears the whole CloudFront cache right after <code>terraform apply</code>. So within seconds, every page shows an S3 <code>AccessDenied</code> XML error instead of the site.</p><p>The visitor counter and chatbot keep working because they don\'t read from S3.</p>',
      detect: '<ul><li><strong>Pipeline smoke test:</strong> curls the homepage after every deploy, so a 403 fails the run right away.</li><li><strong>CloudWatch:</strong> CloudFront\'s <code>4xxErrorRate</code> jumps.</li><li><strong>CloudTrail:</strong> the <code>PutBucketPolicy</code> event shows who changed the policy and when.</li><li><strong>The error body:</strong> <code>&lt;Code&gt;AccessDenied&lt;/Code&gt;</code> from S3 means CloudFront is up and reaching the bucket, but the bucket is saying no.</li></ul><p class="sim-note">Something I found while building this: S3 also returns 403 instead of 404 for files that don\'t exist, because my CloudFront identity isn\'t allowed to list the bucket. So my "send 404s to index.html" rule never runs, and a mistyped URL on this site shows the same AccessDenied error.</p>',
      steps: [
        { title: 'Confirm it\'s a permissions problem', detail: 'curl the site. An XML body with <code>AccessDenied</code> means CloudFront can reach S3, but S3 is refusing it.',
          log: ['info', 'curl -i: 403, body <Code>AccessDenied</Code> from S3'] },
        { title: 'Find what changed', detail: 'Look up the <code>PutBucketPolicy</code> event in CloudTrail and the latest change to <code>infra/s3.tf</code> in git log.',
          log: ['info', 'git log infra/s3.tf: principal ARN edited in last commit'] },
        { title: 'Fix the policy', detail: 'Make the policy\'s Principal match the Origin Access Identity in <code>cloudfront.tf</code>, revert the bad change, and let the pipeline run <code>terraform apply</code>.',
          log: ['info', 'terraform apply: bucket policy restored'], heal: 0.6, nodes: { s3: ['ok', 'Healthy'], terraform: ['ok', 'Applied'], cloudfront: ['warn', 'Refilling cache'], user: ['warn', 'Recovering'] }, pipeline: ['Running', 'warn'] },
        { title: 'Verify', detail: 'Invalidate the cache and run the smoke test again.',
          log: ['ok', 'Invalidation /* complete. Smoke test passed.'] },
      ],
      next: 'What I\'d add next: a CloudWatch alarm on 4xxErrorRate, and moving from the older Origin Access Identity to Origin Access Control (OAC), which AWS now recommends.',
    },

    counter: {
      banner: 'Incident: visitor counter API returning errors',
      severity: 'warn',
      nodes: {
        user: ['warn', 'Counter shows 0'],
        apigw: ['warn', 'Returning 500s'],
        lambda: ['down', 'AccessDenied on write'],
        dynamo: ['warn', 'Rejecting UpdateItem'],
        gha: ['ok', 'Smoke test still passes'],
      },
      metrics: { availability: 99, errors: 1, cache: 85, pipeline: ['Passing', 'ok'] },
      log: [
        ['+0s', 'info', 'terraform apply: visitor-lambda-dynamodb-policy updated'],
        ['+30s', 'error', 'lambda visitor-counter: AccessDeniedException, not authorized to perform dynamodb:UpdateItem'],
        ['+30s', 'warn', 'api gateway: GET /visitor-count 500 {"error":"Failed to update visitor count"}'],
        ['+31s', 'info', 'browser: counter animates to "0 site visits" (response status not checked)'],
        ['+32s', 'info', 'cloudwatch: Lambda Errors metric = 0, the function caught the error itself'],
        ['+5m', 'info', 'pipeline smoke test (GET ?peek=1, read-only): passed'],
      ],
      cause: '<p>The visitor counter Lambda has an IAM role with a policy listing exactly which DynamoDB actions it can use on the table. If a change removes <code>dynamodb:UpdateItem</code> from that policy, the function can still read the count but can\'t increase it.</p><p>This is a different kind of permission problem from the 403 scenario. There, S3\'s <em>bucket policy</em> (attached to the resource) blocked CloudFront. Here, the <em>Lambda role\'s policy</em> (attached to the identity) is missing an action.</p>',
      impact: '<ul><li><strong>The site works.</strong> Pages load from CloudFront and S3, and the chatbot keeps working because it\'s a separate Lambda that doesn\'t use DynamoDB.</li><li><strong>New visitors see "0 site visits".</strong> The function returns a 500, but my front-end doesn\'t check the status code, so it reads the error body and animates to 0 instead of showing "...".</li><li><strong>Returning visitors still see the right number.</strong> Their visit was already recorded today, so the function only reads the count, and reads still work.</li><li><strong>Visits during the outage are lost.</strong> The function records the hashed visitor before trying to increase the count, so those visitors won\'t be counted again until their record expires a day later.</li></ul>',
      detect: '<ul><li><strong>API Gateway <code>5XXError</code> metric:</strong> the clearest signal, since API Gateway sees the 500s.</li><li><strong>CloudWatch Logs:</strong> the function logs <code>Error: AccessDeniedException</code> with the exact action and role.</li><li><strong>Not Lambda\'s <code>Errors</code> metric:</strong> it stays at 0 because my code catches the error and returns a normal response.</li></ul><p class="sim-note">The honest part: my pipeline\'s smoke test would <strong>not</strong> catch this. It calls the counter with <code>?peek=1</code> so deploys don\'t add fake visits, and that only reads the count. A failure that only breaks writes slips straight past it.</p>',
      steps: [
        { title: 'Find which part is failing', detail: 'The page loads and the chatbot works, so it\'s the counter API. Calling the endpoint directly returns HTTP 500 with <code>Failed to update visitor count</code>.',
          log: ['info', 'curl /visitor-count: 500. ?peek=1: 200. Reads work, writes fail.'] },
        { title: 'Read the Lambda logs', detail: 'CloudWatch Logs for the function show <code>AccessDeniedException</code> on <code>dynamodb:UpdateItem</code> for <code>visitor-counter-lambda-role</code>.',
          log: ['info', 'Logs: role visitor-counter-lambda-role missing dynamodb:UpdateItem'] },
        { title: 'Restore the permission', detail: 'Put <code>dynamodb:UpdateItem</code> back in the role\'s policy in Terraform and let the pipeline run <code>terraform apply</code>. Only that one table\'s ARN, nothing wider.',
          log: ['info', 'terraform apply: UpdateItem restored on the visitor-counter table'], heal: 0.8,
          nodes: { lambda: ['ok', 'Healthy'], dynamo: ['ok', 'Healthy'], apigw: ['ok', 'Healthy'], user: ['warn', 'Refresh to see count'] } },
        { title: 'Verify the write path', detail: 'Call the endpoint <em>without</em> <code>?peek=1</code> and confirm the count comes back, then watch API Gateway\'s 5XX metric return to zero.',
          log: ['ok', 'GET /visitor-count: 200 with count. 5XXError back to 0.'] },
      ],
      next: 'What I\'d add next: check the response status in the front-end so a failure shows "..." instead of 0, an alarm on API Gateway 5XXError, and a smoke test that exercises the write path.',
    },

    spike: {
      banner: 'Traffic spike: 100x normal visitors',
      severity: 'warn',
      nodes: {
        user: ['ok', 'Pages loading fast'],
        cloudfront: ['ok', 'Absorbing load, 97% cached'],
        s3: ['ok', 'Only cache misses reach it'],
        apigw: ['warn', '100x counter requests'],
        lambda: ['warn', 'Scaling up, cold starts'],
        dynamo: ['warn', 'Some writes throttled'],
      },
      metrics: { availability: 99.6, errors: 0.4, cache: 97, pipeline: ['Passing', 'ok'] },
      log: [
        ['+0s', 'info', 'cloudfront: requests up from ~20/min to ~2,000/min (link shared on LinkedIn)'],
        ['+1s', 'info', 'cloudfront: 97% of page requests served from edge cache'],
        ['+5s', 'info', 'lambda visitor-counter: concurrency rising, new instances starting (cold starts add latency)'],
        ['+40s', 'warn', 'dynamodb: some writes throttled while on-demand capacity scales up'],
        ['+40s', 'info', 'aws sdk: most throttled writes succeed on automatic retry'],
        ['+41s', 'warn', 'api gateway: a few 500s from the visitor counter (retries ran out)'],
      ],
      cause: '<p>Someone shares my portfolio on LinkedIn and traffic jumps to about 100 times normal for an hour. The same thing could also be a bot hammering the visitor counter API.</p>',
      impact: '<ul><li><strong>Pages stay fast.</strong> CloudFront serves almost every page from its edge cache, so S3 barely notices. More visitors actually means a higher cache hit rate.</li><li><strong>Lambda scales by running more copies.</strong> New copies take a moment to start (cold starts), so some counter calls are a bit slower.</li><li><strong>DynamoDB on-demand scales automatically,</strong> but a jump far above its recent peak can briefly throttle writes. The AWS SDK retries automatically, so only a few requests fail, and those visitors see "0 site visits".</li><li><strong>Cost.</strong> I pay per request, and my APIs have no rate limit of their own. My counter ignores repeat visits from the same IP, so a bot can\'t inflate the number, but every request still costs a Lambda run and a DynamoDB write attempt.</li></ul>',
      detect: '<ul><li><strong>CloudFront:</strong> <code>Requests</code> and cache hit rate, plus the top-referrers report to see where traffic is coming from.</li><li><strong>API Gateway:</strong> <code>Count</code> and <code>5XXError</code> for the counter API.</li><li><strong>Lambda:</strong> <code>ConcurrentExecutions</code> and <code>Duration</code>.</li><li><strong>DynamoDB:</strong> <code>ThrottledRequests</code>.</li><li><strong>AWS Budgets:</strong> an alert if the month\'s bill is heading past what I expect.</li></ul>',
      steps: [
        { title: 'Check whether it\'s real visitors', detail: 'CloudFront\'s top-referrers report shows where traffic comes from. Lots of different visitors from linkedin.com is good news. One IP making thousands of requests is a bot.',
          log: ['info', 'Top referrer: linkedin.com, thousands of different visitors. Real traffic.'] },
        { title: 'Let it scale', detail: 'Page loads never broke, so there\'s nothing to fix there. Watch DynamoDB\'s throttling drop as on-demand capacity catches up.',
          log: ['info', 'dynamodb: throttling stopped, capacity caught up'], heal: 0.7,
          nodes: { dynamo: ['ok', 'Scaled up'], lambda: ['ok', 'Handling load'], apigw: ['ok', 'Healthy'] } },
        { title: 'Put limits in place', detail: 'Set throttling on the API stages (a requests-per-second rate and burst limit) so a bot can\'t run up the bill. A rate-based rule in AWS WAF on CloudFront could block a single noisy IP.',
          log: ['info', 'API stage throttling set (example: 100 req/s, burst 200)'], heal: 0.9 },
        { title: 'Watch the bill and the traffic', detail: 'Check AWS Budgets and Cost Explorer once the spike passes to confirm the cost stayed small.',
          log: ['ok', 'Traffic back to normal. Spike cost: well under a dollar.'] },
      ],
      next: 'What I\'d add next: throttling on both API stages, a WAF rate-based rule, and a budget alarm, so a traffic spike or a bot can\'t turn into a surprise bill.',
    },
  };

  let current = null, step = 0, timers = [];
  let tab = 'cause';

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function renderNodes(overrides) {
    nodesEl.innerHTML = NODES.map(([key, name, img]) => {
      const [state, note] = overrides[key] || ['ok', 'Healthy'];
      const icon = img ? `<img src="images/${img}.svg" alt="">` : '<span class="sim-node-emoji">👤</span>';
      return `<div class="sim-node is-${state}">
        <div class="sim-node-icon">${icon}</div>
        <div class="sim-node-text"><span class="sim-node-name">${name}</span><span class="sim-node-note">${note}</span></div>
        <span class="sim-state is-${state}" title="${STATE_WORD[state]}"><span aria-hidden="true">${STATE_ICON[state]}</span><span class="sim-sr">${STATE_WORD[state]}</span></span>
      </div>`;
    }).join('');
  }

  function metricState(key, v) {
    if (key === 'availability') return v >= 99.9 ? 'ok' : v >= 50 ? 'warn' : 'down';
    if (key === 'errors') return v <= 0.1 ? 'ok' : v <= 50 ? 'warn' : 'down';
    return v >= 60 ? 'ok' : v >= 20 ? 'warn' : 'down';
  }

  function renderMetrics(m) {
    const tile = (label, value, state, note) => `<div class="sim-metric">
      <span class="sim-metric-label">${label}</span>
      <span class="sim-metric-value">${value}</span>
      <span class="sim-metric-foot"><span class="sim-state is-${state}" aria-hidden="true">${STATE_ICON[state]}</span>${note || STATE_WORD[state]}</span>
    </div>`;
    const pct = v => (Math.round(v * 10) / 10).toFixed(1) + '%';
    metricsEl.innerHTML =
      tile('Availability', pct(m.availability), metricState('availability', m.availability)) +
      tile('Error rate', pct(m.errors), metricState('errors', m.errors)) +
      tile('Cache hit rate', pct(m.cache), metricState('cache', m.cache), m.cache === 0 ? 'Cache cleared' : null) +
      tile('Pipeline', m.pipeline[0], m.pipeline[1], m.pipeline[1] === 'ok' ? 'No failures' : null);
  }

  function setBanner(state, text) {
    banner.className = 'sim-banner is-' + state;
    banner.querySelector('.sim-banner-icon').textContent = STATE_ICON[state];
    banner.querySelector('.sim-banner-text').textContent = text;
  }

  function addLog(time, level, text, delay) {
    const write = () => {
      const line = document.createElement('div');
      line.className = 'sim-log-line is-' + level;
      const tag = { info: 'INFO', warn: 'WARN', error: 'ERROR', ok: 'OK' }[level];
      line.innerHTML = '<span class="sim-log-time"></span><span class="sim-log-level"></span><span class="sim-log-msg"></span>';
      line.children[0].textContent = time;
      line.children[1].textContent = tag;
      line.children[2].textContent = text;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    };
    if (delay) timers.push(setTimeout(write, delay));
    else write();
  }

  function renderTab() {
    tabsEl.querySelectorAll('button').forEach(b => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    const s = SCENARIOS[current];
    const n = s.steps.length;
    const items = s.steps.map((st, i) => {
      const cls = i < step ? 'is-done' : (i === step && step > 0 && step < n) ? 'is-next' : '';
      return `<li class="${cls}"><span class="sim-step-num">${i < step ? '✓' : i + 1}</span><div><strong>${st.title}</strong><p>${st.detail}</p></div></li>`;
    }).join('');
    const hint = step === 0 ? 'Press <strong>Recover system</strong> below to work through these steps one at a time.'
      : step === n ? '<strong>All steps complete.</strong> The system is back to normal.'
      : `<strong>Step ${step} of ${n} done.</strong> Press <strong>Next step</strong> below to continue.`;
    tabBody.innerHTML = tab !== 'recover' ? s[tab]
      : `<p class="sim-note">${hint}</p><ol class="sim-steps">${items}</ol><p class="sim-note">${s.next}</p>`;
  }

  // one-line summary next to the Recover button, so you can follow along without scrolling up
  function setFooter(m) {
    const n = SCENARIOS[current].steps.length;
    const pct = v => (Math.round(v * 10) / 10).toFixed(1) + '%';
    const where = step === 0 ? 'Not started' : step === n ? 'Recovered' : `Step ${step} of ${n} done`;
    footerText.innerHTML = `<strong>${where}</strong> · Availability ${pct(m.availability)} · Error rate ${pct(m.errors)} · Pipeline ${m.pipeline[0]}`;
  }

  function reset() {
    clearTimers();
    current = null; step = 0;
    setBanner('ok', 'All systems operational');
    renderNodes({});
    renderMetrics(HEALTHY);
    logEl.innerHTML = '';
    addLog('', 'info', 'Monitoring. Pick a failure above and press "Simulate failure".');
    explainEl.hidden = true;
    footerEl.hidden = true;
    runBtn.disabled = false;
    select.disabled = false;
    recoverBtn.disabled = true;
    recoverBtn.textContent = 'Recover system';
    resetBtn.disabled = true;
  }

  function run() {
    clearTimers();
    current = select.value; step = 0; tab = 'cause';
    const s = SCENARIOS[current];
    logEl.innerHTML = '';
    s.log.forEach(([t, lvl, msg], i) => addLog(t, lvl, msg, i * 350));
    const worst = s.severity || (Object.values(s.nodes).some(([st]) => st === 'down') && s.metrics.availability < 100 ? 'down' : 'warn');
    setBanner(worst, s.banner);
    renderNodes(s.nodes);
    renderMetrics(s.metrics);
    explainEl.hidden = false;
    footerEl.hidden = false;
    setFooter(s.metrics);
    renderTab();
    runBtn.disabled = true;
    select.disabled = true;
    recoverBtn.disabled = false;
    recoverBtn.textContent = 'Recover system';
    resetBtn.disabled = false;
  }

  function recover() {
    const s = SCENARIOS[current];
    if (!s || step >= s.steps.length) return;
    // remember where the button is on screen so we can keep it there after the content above changes
    const btnTop = recoverBtn.getBoundingClientRect().top;
    // if the failure log is still typing out, finish it first so fix lines come after it
    if (step === 0) {
      clearTimers();
      logEl.innerHTML = '';
      s.log.forEach(([t, lvl, msg]) => addLog(t, lvl, msg));
    }
    const st = s.steps[step];
    step++;
    const done = step === s.steps.length;
    addLog('fix ' + step, st.log[0], st.log[1]);

    // merge node overrides from every completed step
    let nodes = Object.assign({}, s.nodes);
    s.steps.slice(0, step).forEach(x => Object.assign(nodes, x.nodes || {}));
    if (done) nodes = {};
    renderNodes(nodes);

    let f = 0;
    s.steps.slice(0, step).forEach(x => { if (x.heal) f = x.heal; });
    if (done) f = 1;
    const lerp = k => s.metrics[k] + (HEALTHY[k] - s.metrics[k]) * f;
    let pipeline = s.metrics.pipeline;
    s.steps.slice(0, step).forEach(x => { if (x.pipeline) pipeline = x.pipeline; });
    if (done) pipeline = HEALTHY.pipeline;
    const m = { availability: lerp('availability'), errors: lerp('errors'), cache: lerp('cache'), pipeline };
    renderMetrics(m);
    setFooter(m);

    if (done) {
      setBanner('ok', 'Recovered: all systems operational');
      recoverBtn.disabled = true;
      recoverBtn.textContent = 'Recovered';
      runBtn.disabled = false;
      select.disabled = false;
    } else {
      recoverBtn.textContent = `Next step (${step + 1}/${s.steps.length})`;
    }
    tab = 'recover';
    renderTab();
    // switching to the Recovery tab changes the height of the content above the button.
    // Shift the page by the same amount, instantly, so the button stays under your finger.
    const shift = recoverBtn.getBoundingClientRect().top - btnTop;
    if (shift) {
      const root = document.documentElement;
      root.style.scrollBehavior = 'auto';
      window.scrollBy(0, shift);
      root.style.scrollBehavior = '';
    }
  }

  tabsEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-tab]');
    if (!b || !current) return;
    tab = b.dataset.tab;
    renderTab();
  });
  // move the floating chat button out of the way while the simulator's bottom bar is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      document.body.classList.toggle('sim-footer-in-view', e.isIntersecting);
    }).observe(footerEl);
  }

  runBtn.addEventListener('click', run);
  recoverBtn.addEventListener('click', recover);
  resetBtn.addEventListener('click', reset);
  reset();
})();
