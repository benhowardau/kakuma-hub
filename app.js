// Bitcoin Kakuma Hub. Plain JavaScript, no build step. Data lives in the data/ folder.
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (n) => Number(n).toLocaleString('en-US');

  // Nav highlight
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('nav.main a').forEach((a) => { if (a.getAttribute('href') === here) a.classList.add('on'); });

  async function load(file) {
    try { const r = await fetch(file, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    catch (e) { console.error('could not load', file, e); return []; }
  }

  function payBlock(addr) {
    if (!addr) return '';
    return `<div class="pay">Pay in bitcoin: <code>${esc(addr)}</code><button type="button" data-copy="${esc(addr)}">copy</button></div>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).then(() => { b.textContent = 'copied'; setTimeout(() => (b.textContent = 'copy'), 1500); });
  });


  // Community profiles and products published by members themselves (see nostr.js). Never blocks the page: on any failure it returns [].
  function communityListings(what) {
    const tag = new URLSearchParams(location.search).get('tag') || undefined;
    return Promise.race([
      import('./nostr.js').then((N) => N.fetchListings(what, tag ? { tag } : {})).catch(() => []),
      new Promise((r) => setTimeout(() => r([]), 8000))
    ]);
  }

  // Members directory with search and skill filter
  const membersEl = $('#members');
  if (membersEl) {
    Promise.all([load('data/members.json'), load('data/hub.json'), communityListings('member')]).then(([verified, hub, community]) => {
      const blocked = new Set((hub && hub.blocked) || []), hubVerified = new Set((hub && hub.verified) || []);
      const members = verified.map((m) => Object.assign({ verified: true }, m)).concat(
        community.filter((c) => !blocked.has(c.npub)).map((c) => Object.assign({}, c.data, { npub: c.npub, verified: hubVerified.has(c.npub) })));
      const skills = Array.from(new Set(members.flatMap((m) => m.skills || []))).sort();
      const chips = $('#skills');
      chips.innerHTML = skills.map((s) => `<button type="button" class="chip" data-skill="${esc(s)}">${esc(s)}</button>`).join('');
      let active = '';
      const input = $('#search');
      function render() {
        const q = (input.value || '').trim().toLowerCase();
        const list = members.filter((m) => {
          const hay = [m.name, m.role, m.about, m.location, ...(m.skills || [])].join(' ').toLowerCase();
          return (!q || hay.includes(q)) && (!active || (m.skills || []).includes(active));
        });
        $('#count').textContent = list.length === members.length ? `${members.length} members` : `${list.length} of ${members.length} members`;
        membersEl.innerHTML = list.map((m) => `
          <div class="card">
            <h3>${esc(m.name)}</h3>
            <p><b>${esc(m.role)}</b>${m.location ? ` · ${esc(m.location)}` : ''} · <span class="${m.verified ? 'ok' : 'small'}">${m.verified ? 'Hub verified' : 'Community profile'}</span></p>
            <p>${esc(m.about)}</p>
            <div class="chips">${(m.skills || []).map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
            <div class="links">${(m.work || []).map((w) => `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.label)}</a>`).join('')}${m.contact ? `<a href="${esc(m.contact)}" target="_blank" rel="noopener">Contact</a>` : ''}${m.npub ? `<a href="https://primal.net/p/${esc(m.npub)}" target="_blank" rel="noopener">Nostr</a>` : ''}</div>
            ${payBlock(m.lightning)}
          </div>`).join('') || '<p class="small">No one matches that yet.</p>';
      }
      chips.addEventListener('click', (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        active = active === c.dataset.skill ? '' : c.dataset.skill;
        $$('.chip', chips).forEach((x) => x.classList.toggle('on', x.dataset.skill === active));
        render();
      });
      input.addEventListener('input', render);
      render();
    });
  }

  // Market
  const marketEl = $('#market');
  if (marketEl) {
    Promise.all([load('data/products.json'), load('data/hub.json'), communityListings('product')]).then(([curated, hub, community]) => {
      const blocked = new Set((hub && hub.blocked) || []);
      const items = curated.concat(community.filter((c) => !blocked.has(c.npub)).map((c) => Object.assign({}, c.data, { npub: c.npub })));
      marketEl.innerHTML = items.map((p) => `
        <div class="card">
          ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" style="border-radius:10px;margin-bottom:10px">` : ''}
          <h3>${esc(p.name)}</h3>
          <p><b>${fmt(p.price_sats)} sats</b> · ${esc(p.origin)}</p>
          <p>${esc(p.about)}</p>
          <p>Made by ${esc(p.maker)}${p.contact ? ` · <a href="${esc(p.contact)}" target="_blank" rel="noopener">Order</a>` : ''}</p>
          ${payBlock(p.lightning)}
        </div>`).join('');
    });
  }

  // Events
  const eventsEl = $('#events');
  if (eventsEl) {
    load('data/events.json').then((events) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const up = events.filter((e) => new Date(e.date + 'T00:00:00') >= today).sort((a, b) => a.date.localeCompare(b.date));
      const show = up.length ? up : events.slice(-3);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      eventsEl.innerHTML = show.map((e) => { const d = new Date(e.date + 'T00:00:00'); return `
        <div class="event">
          <div class="d"><b>${d.getDate()}</b>${months[d.getMonth()]}</div>
          <div><b>${esc(e.title)}</b><br><span class="small">${esc(e.time)} · ${esc(e.where)}</span>${e.note ? `<br><span class="small">${esc(e.note)}</span>` : ''}</div>
        </div>`; }).join('') || '<p class="small">Nothing scheduled yet.</p>';
    });
  }

  // Course engine
  const courseEl = $('#course');
  if (courseEl && window.COURSE) {
    const C = window.COURSE;
    const KEY = 'bkh-course-' + C.id;
    let state = {};
    try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { state = {}; }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
    let cur = Math.min(Object.keys(state.done || {}).length, C.lessons.length);
    state.done = state.done || {};

    function render() {
      const doneCount = Object.keys(state.done).length;
      const all = doneCount === C.lessons.length;
      $('#bar').style.width = Math.round((doneCount / C.lessons.length) * 100) + '%';
      $('#steps').innerHTML = C.lessons.map((l, i) => `<button type="button" data-i="${i}" class="${state.done[i] ? 'done' : ''} ${i === cur && !all ? 'on' : ''}">${i + 1}</button>`).join('') + `<button type="button" data-i="cert" class="${all ? 'done' : ''} ${all && cur === 'cert' ? 'on' : ''}">Certificate</button>`;
      if (cur === 'cert' || (all && cur >= C.lessons.length)) { cur = 'cert'; return renderCert(); }
      const l = C.lessons[cur];
      courseEl.innerHTML = `
        <div class="lesson">
          <span class="small">Lesson ${cur + 1} of ${C.lessons.length}</span>
          <h3>${esc(l.title)}</h3>
          <div class="body">${l.body}</div>
          ${l.read ? `<p class="small">Read more: <a href="${esc(l.read.url)}" target="_blank" rel="noopener">${esc(l.read.label)}</a></p>` : ''}
          <h3 style="margin-top:18px">Check what you learned</h3>
          <form id="quiz">${l.quiz.map((q, qi) => `
            <div class="q"><p>${esc(q.q)}</p>${q.a.map((a, ai) => `<label><input type="radio" name="q${qi}" value="${ai}">${esc(a)}</label>`).join('')}</div>`).join('')}
            <p id="result"></p>
            <button class="btn" type="submit">Check answers</button>
          </form>
        </div>`;
      $('#quiz').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        let right = 0, answered = 0;
        l.quiz.forEach((q, qi) => { const v = fd.get('q' + qi); if (v !== null) answered++; if (Number(v) === q.correct) right++; });
        const res = $('#result');
        if (answered < l.quiz.length) { res.innerHTML = '<span class="bad">Answer every question first.</span>'; return; }
        if (right === l.quiz.length) {
          state.done[cur] = true; save();
          res.innerHTML = '<span class="ok">All correct. Lesson complete.</span>';
          setTimeout(() => { cur = cur + 1; if (cur >= C.lessons.length) cur = 'cert'; render(); window.scrollTo({ top: courseEl.offsetTop - 20, behavior: 'smooth' }); }, 700);
        } else {
          res.innerHTML = `<span class="bad">${right} of ${l.quiz.length} correct. Read the lesson again and try once more.</span>`;
        }
      });
    }

    function certCode(name, date) {
      let h = 0; const s = (name + '|' + date + '|' + C.id).toLowerCase();
      for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
      return 'BKH-' + h.toString(16).toUpperCase().padStart(8, '0');
    }

    function renderCert() {
      const all = Object.keys(state.done).length === C.lessons.length;
      if (!all) { courseEl.innerHTML = `<div class="lesson"><h3>Certificate</h3><p>Finish all ${C.lessons.length} lessons to earn your certificate.</p></div>`; return; }
      const name = state.name || '';
      const date = state.date || new Date().toISOString().slice(0, 10);
      courseEl.innerHTML = `
        <div class="lesson">
          <h3>You finished ${esc(C.title)}</h3>
          <p>Type your name as you want it on the certificate.</p>
          <form id="nameform" class="noprint"><input class="search" id="name" placeholder="Your full name" value="${esc(name)}" maxlength="60"><button class="btn" type="submit">Make my certificate</button></form>
          <div id="certwrap"></div>
        </div>`;
      const draw = () => {
        if (!state.name) return;
        const code = certCode(state.name, date);
        $('#certwrap').innerHTML = `
          <div class="cert" id="cert">
            <div class="t">Bitcoin Kakuma Hub</div>
            <div class="c" style="margin-top:14px">Certificate of completion</div>
            <div class="n">${esc(state.name)}</div>
            <div class="c">completed <b>${esc(C.title)}</b></div>
            <div class="c">${C.lessons.length} lessons · ${esc(date)}</div>
            <div class="s">Kakuma Refugee Camp, Kenya · Certificate ${code}</div>
          </div>
          <p class="noprint"><button class="btn" type="button" id="dl">Download as image</button><button class="btn ghost" type="button" onclick="window.print()">Print</button></p>
          <p class="small noprint">Anyone can check this certificate: the same name and date always produce code ${code}.</p>`;
        $('#dl').addEventListener('click', () => {
          const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 1131; const x = cv.getContext('2d');
          x.fillStyle = '#ffffff'; x.fillRect(0, 0, 1600, 1131);
          x.strokeStyle = '#f7931a'; x.lineWidth = 12; x.strokeRect(40, 40, 1520, 1051);
          x.fillStyle = '#f7931a'; x.beginPath(); x.arc(800, 190, 54, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#fff'; x.font = 'bold 64px Helvetica, Arial'; x.textAlign = 'center'; x.fillText('₿', 800, 213);
          x.fillStyle = '#8a4c00'; x.font = '600 28px Helvetica, Arial'; x.fillText('B I T C O I N   K A K U M A   H U B', 800, 300);
          x.fillStyle = '#161412'; x.font = '36px Helvetica, Arial'; x.fillText('Certificate of completion', 800, 400);
          x.font = 'bold 84px Helvetica, Arial'; x.fillText(state.name, 800, 530);
          x.font = '36px Helvetica, Arial'; x.fillText('completed ' + C.title, 800, 620);
          x.fillText(C.lessons.length + ' lessons  ·  ' + date, 800, 680);
          x.fillStyle = '#6b6560'; x.font = '26px Helvetica, Arial'; x.fillText('Kakuma Refugee Camp, Kenya  ·  Certificate ' + code, 800, 980);
          const a = document.createElement('a'); a.download = 'bitcoin-kakuma-hub-certificate.png'; a.href = cv.toDataURL('image/png'); a.click();
        });
      };
      $('#nameform').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#name').value.trim(); if (!v) return; state.name = v; state.date = date; save(); draw(); });
      draw();
    }

    $('#steps').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      cur = b.dataset.i === 'cert' ? 'cert' : Number(b.dataset.i); render();
    });
    $('#reset') && $('#reset').addEventListener('click', () => { if (confirm('Start the course again from lesson 1?')) { state = { done: {} }; save(); cur = 0; render(); } });
    render();
  }
})();
