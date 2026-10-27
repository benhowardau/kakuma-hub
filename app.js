// Bitcoin Kakuma Hub. Plain JavaScript, no build step. Data lives in the data/ folder.
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (n) => Number(n).toLocaleString('en-US');


  // No orphans: the last three words of every block stay on one line, including blocks rendered later.
  const TIDY = 'p, li, .lede, .door span, .door em, .small, .notice, .cert div';
  function tidy(root) {
    (root || document).querySelectorAll(TIDY).forEach((el) => {
      if (el.dataset.tidy || el.closest('label, form .q')) return;
      el.dataset.tidy = '1';
      const nodes = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) nodes.push(w.currentNode);
      const words = el.textContent.trim().split(/\s+/).length; if (words < 4) return;
      let need = 2;
      for (let i = nodes.length - 1; i >= 0 && need > 0; i--) {
        let t = nodes[i].nodeValue;
        if (i < nodes.length - 1 && /\s$/.test(t)) { t = t.replace(/\s+$/, '\u00a0'); need--; }
        while (need > 0) { const trimmed = t.replace(/\s+$/, ''); const idx = trimmed.lastIndexOf(' '); if (idx <= 0) break; t = t.slice(0, idx) + '\u00a0' + t.slice(idx + 1); need--; }
        nodes[i].nodeValue = t;
      }
    });
  }
  tidy(document);
  let tidyTimer; new MutationObserver(() => { clearTimeout(tidyTimer); tidyTimer = setTimeout(() => tidy(document), 30); }).observe(document.body, { childList: true, subtree: true });


  // Contact buttons carry the mark of the platform they open. Icon paths: Simple Icons (CC0) for the apps, drawn here for mail, phone and link.
  const ICONS = {"whatsapp": "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z", "telegram": "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z", "signal": "m9.12.35.27 1.09a10.845 10.845 0 0 0-3.015 1.248l-.578-.964A11.955 11.955 0 0 1 9.12.35zm5.76 0-.27 1.09a10.845 10.845 0 0 1 3.015 1.248l.581-.964A11.955 11.955 0 0 0 14.88.35zM1.725 5.797A11.955 11.955 0 0 0 .351 9.119l1.09.27A10.845 10.845 0 0 1 2.69 6.374zm-.6 6.202a10.856 10.856 0 0 1 .122-1.63l-1.112-.168a12.043 12.043 0 0 0 0 3.596l1.112-.169A10.856 10.856 0 0 1 1.125 12zm17.078 10.275-.578-.964a10.845 10.845 0 0 1-3.011 1.247l.27 1.091a11.955 11.955 0 0 0 3.319-1.374zM22.875 12a10.856 10.856 0 0 1-.122 1.63l1.112.168a12.043 12.043 0 0 0 0-3.596l-1.112.169a10.856 10.856 0 0 1 .122 1.63zm.774 2.88-1.09-.27a10.845 10.845 0 0 1-1.248 3.015l.964.581a11.955 11.955 0 0 0 1.374-3.326zm-10.02 7.875a10.952 10.952 0 0 1-3.258 0l-.17 1.112a12.043 12.043 0 0 0 3.597 0zm7.125-4.303a10.914 10.914 0 0 1-2.304 2.302l.668.906a12.019 12.019 0 0 0 2.542-2.535zM18.45 3.245a10.914 10.914 0 0 1 2.304 2.304l.906-.675a12.019 12.019 0 0 0-2.535-2.535zM3.246 5.549A10.914 10.914 0 0 1 5.55 3.245l-.675-.906A12.019 12.019 0 0 0 2.34 4.874zm19.029.248-.964.577a10.845 10.845 0 0 1 1.247 3.011l1.091-.27a11.955 11.955 0 0 0-1.374-3.318zM10.371 1.246a10.952 10.952 0 0 1 3.258 0L13.8.134a12.043 12.043 0 0 0-3.597 0zM3.823 21.957 1.5 22.5l.542-2.323-1.095-.257-.542 2.323a1.125 1.125 0 0 0 1.352 1.352l2.321-.532zm-2.642-3.041 1.095.255.375-1.61a10.828 10.828 0 0 1-1.21-2.952l-1.09.27a11.91 11.91 0 0 0 1.106 2.852zm5.25 2.437-1.61.375.255 1.095 1.185-.275a11.91 11.91 0 0 0 2.851 1.106l.27-1.091a10.828 10.828 0 0 1-2.943-1.217zM12 2.25a9.75 9.75 0 0 0-8.25 14.938l-.938 4 4-.938A9.75 9.75 0 1 0 12 2.25z", "mail": "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V18h16V7.4l-8 5.2-8-5.2zM4.6 7l7.4 4.8L19.4 7H4.6z", "phone": "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z", "link": "M10.6 13.4a1 1 0 0 1 0-1.4l2.8-2.8a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zm-2.1 2.1a3 3 0 0 1 0-4.2l2.1-2.1a1 1 0 1 0-1.4-1.4L7.1 9.9a5 5 0 0 0 7 7l2.1-2.1a1 1 0 0 0-1.4-1.4l-2.1 2.1a3 3 0 0 1-4.2 0zm7-7a3 3 0 0 1 0 4.2l-2.1 2.1a1 1 0 1 0 1.4 1.4l2.1-2.1a5 5 0 0 0-7-7L7.8 9.2a1 1 0 0 0 1.4 1.4l2.1-2.1a3 3 0 0 1 4.2 0z"};
  const svg = (k) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="${ICONS[k]}"/></svg>`;
  function contactKind(url) {
    url = String(url || '');
    if (/wa\.me|whatsapp\.com/.test(url)) return ['whatsapp', 'WhatsApp'];
    if (/t\.me|telegram/.test(url)) return ['telegram', 'Telegram'];
    if (/signal\.me|signal\.group/.test(url)) return ['signal', 'Signal'];
    if (/^mailto:/.test(url)) return ['mail', 'Email'];
    if (/^tel:/.test(url)) return ['phone', 'Call'];
    return ['link', 'Contact'];
  }
  function contactBtn(url, verb) {
    if (!url) return '';
    const [k, name] = contactKind(url);
    const label = verb ? (k === 'link' ? verb : `${verb} on ${name}`) : name;
    return `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${svg(k)}<span>${label}</span></a>`;
  }

  // Nav highlight
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('nav.main a').forEach((a) => { if (a.getAttribute('href') === here) a.classList.add('on'); });

  async function load(file) {
    try { const r = await fetch(file, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    catch (e) { console.error('could not load', file, e); return []; }
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (b) { const was = b.textContent; navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).then(() => { b.textContent = 'Copied'; setTimeout(() => (b.textContent = was), 1500); }); return; }
    const p = e.target.closest('[data-pay]');
    if (p) {
      const addr = p.dataset.pay; const box = p.parentElement.querySelector('.paybox');
      if (box) { box.remove(); p.textContent = 'Pay in bitcoin'; return; }
      p.textContent = 'Hide';
      const el = document.createElement('div'); el.className = 'paybox';
      el.innerHTML = `<span>Lightning address. Paste it in any bitcoin wallet, or open one you have.</span><code>${esc(addr)}</code><div class="row"><button type="button" class="btn ghost" data-copy="${esc(addr)}">Copy address</button><a class="btn ghost" href="lightning:${esc(addr)}">Open wallet</a></div>`;
      p.parentElement.appendChild(el);
    }
  });

  // Community profiles and products published by members themselves (see nostr.js). Never blocks the page: on any failure it returns [].
  function communityListings(what) {
    const tag = new URLSearchParams(location.search).get('tag') || undefined;
    return Promise.race([
      import('./nostr.js').then((N) => N.fetchListings(what, tag ? { tag } : {})).catch(() => []),
      new Promise((r) => setTimeout(() => r([]), 8000))
    ]);
  }


  // People: an avatar (photo or initials), a link to the person's own page, and that page.
  const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const avatar = (m, big) => m.photo ? `<img class="avatar${big ? ' big' : ''}" src="${esc(m.photo)}" alt="" loading="lazy">` : `<span class="avatar${big ? ' big' : ''} ini">${esc(initials(m.name))}</span>`;
  const personHref = (m) => m.npub ? `person.html?npub=${encodeURIComponent(m.npub)}` : `person.html?v=${encodeURIComponent(m.name)}`;
  const skillChips = (m) => (m.skills || []).map((s) => `<span class="chip">${esc(s)}</span>`).join('');
  const workChips = (m) => (m.work || []).map((w) => `<a class="chip link" href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.label)} ↗</a>`).join('');
  const actions = (m, verb) => `<div class="actions">${contactBtn(m.contact, verb)}${m.lightning ? `<button type="button" class="btn ghost" data-pay="${esc(m.lightning)}">Pay in bitcoin</button>` : ''}</div>`;

  const personEl = $('#person');
  if (personEl) {
    const q = new URLSearchParams(location.search);
    Promise.all([load('data/members.json'), load('data/hub.json'), load('data/products.json')]).then(async ([verified, hub, curated]) => {
      let m = null, mine = [];
      if (q.get('v')) { m = verified.find((x) => x.name === q.get('v')); if (m) m = Object.assign({ verified: true }, m); mine = curated.filter((p) => p.maker === q.get('v')); }
      else if (q.get('npub')) {
        const npub = q.get('npub'); const hubVerified = new Set((hub && hub.verified) || []);
        try {
          const N = await import('./nostr.js'); const hex = N.hexFromNpub(npub);
          const [ms, ps] = await Promise.all([N.fetchListings('member', { authors: [hex], tag: q.get('tag') || undefined, maxWait: 5000 }), N.fetchListings('product', { authors: [hex], tag: q.get('tag') || undefined, maxWait: 5000 })]);
          if (ms[0]) m = Object.assign({}, ms[0].data, { npub, verified: hubVerified.has(npub) }); mine = ps.map((p) => p.data);
        } catch (e) {}
      }
      if (!m) { personEl.innerHTML = '<div class="hero"><h1>Not found</h1><p class="lede">This profile is not online right now. It may have been removed, or the connection dropped.</p></div>'; return; }
      document.title = m.name + ', Bitcoin Kakuma Hub';
      personEl.innerHTML = `
        <div class="hero person">
          ${avatar(m, true)}
          <h1>${esc(m.name)}${m.example ? ' <span class="eg">example</span>' : ''}</h1>
          <p class="lede">${esc(m.role)}${m.location ? ` · ${esc(m.location)}` : ''}</p>
          <p class="meta">${m.verified ? '<span class="tick">Hub verified</span>' : 'Community profile'}${m.npub ? ` · <a href="https://primal.net/p/${esc(m.npub)}" target="_blank" rel="noopener">On Nostr</a>` : ''}</p>
          ${actions(m, 'Message')}
        </div>
        <section><h2>About</h2><p>${esc(m.about)}</p><div class="chips">${skillChips(m)}${workChips(m)}</div></section>
        ${mine.length ? `<section><h2>Makes</h2><div class="grid">${mine.map(productCard).join('')}</div></section>` : ''}
        ${m.photo_credit ? `<p class="meta">${m.photo_credit_url ? `<a href="${esc(m.photo_credit_url)}" target="_blank" rel="noopener">${esc(m.photo_credit)}</a>` : esc(m.photo_credit)}</p>` : ''}`;
    });
  }

  function productCard(p) {
    return `
        <div class="card product">
          ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : '<div class="nophoto"></div>'}
          <h3>${esc(p.name)}${p.example ? ' <span class="eg">example</span>' : ''}</h3>
          <p class="price">${fmt(p.price_sats)} sats</p>
          <p>${esc(p.origin)} · made by ${p.npub || p.maker_v ? `<a href="${esc(p.npub ? 'person.html?npub=' + encodeURIComponent(p.npub) : 'person.html?v=' + encodeURIComponent(p.maker))}">${esc(p.maker)}</a>` : esc(p.maker)}</p>
          <p>${esc(p.about)}</p>
          <div class="actions">${contactBtn(p.contact, 'Order')}${p.lightning ? `<button type="button" class="btn ghost" data-pay="${esc(p.lightning)}">Pay in bitcoin</button>` : ''}</div>
          ${p.photo_credit ? `<p class="meta">${p.photo_credit_url ? `<a href="${esc(p.photo_credit_url)}" target="_blank" rel="noopener">${esc(p.photo_credit)}</a>` : esc(p.photo_credit)}</p>` : ''}
        </div>`;
  }

  // Members directory with search and skill filter
  const membersEl = $('#members');
  if (membersEl) {
    Promise.all([load('data/members.json'), load('data/hub.json')]).then(([verified, hub]) => {
      const blocked = new Set((hub && hub.blocked) || []), hubVerified = new Set((hub && hub.verified) || []);
      let members = verified.map((m) => Object.assign({ verified: true }, m));
      const chips = $('#skills');
      let active = '';
      const input = $('#search');
      const status = $('#status');
      if (status) status.innerHTML = '<span class="wait"><span class="spin"></span>Looking for new profiles…</span>';
      function renderChips() {
        const skills = Array.from(new Set(members.flatMap((m) => m.skills || []))).sort();
        chips.innerHTML = skills.map((s) => `<button type="button" class="chip${s === active ? ' on' : ''}" data-skill="${esc(s)}">${esc(s)}</button>`).join('');
      }
      // the verified list shows at once; community profiles are added when the relays answer
      communityListings('member').then((community) => {
        const seen = new Set(members.map((m) => m.npub).filter(Boolean));
        const extra = community.filter((c) => !blocked.has(c.npub) && !seen.has(c.npub)).map((c) => Object.assign({}, c.data, { npub: c.npub, verified: hubVerified.has(c.npub) }));
        if (extra.length) { members = members.concat(extra); renderChips(); render(); }
        if (status) status.textContent = '';
      });
      function render() {
        const q = (input.value || '').trim().toLowerCase();
        const list = members.filter((m) => {
          const hay = [m.name, m.role, m.about, m.location, ...(m.skills || [])].join(' ').toLowerCase();
          return (!q || hay.includes(q)) && (!active || (m.skills || []).includes(active));
        });
        $('#count').textContent = list.length === members.length ? `${members.length} ${members.length === 1 ? 'person' : 'people'}` : `${list.length} of ${members.length}`;
        membersEl.innerHTML = list.map((m) => `
          <div class="card person">
            <a class="head" href="${personHref(m)}">${avatar(m)}<span><h3>${esc(m.name)}${m.example ? ' <span class="eg">example</span>' : ''}</h3><span class="small">${esc(m.role)}${m.location ? ` · ${esc(m.location)}` : ''}</span></span></a>
            <p>${esc(m.about)}</p>
            <div class="chips">${skillChips(m)}</div>
            ${actions(m, 'Message')}
            <p class="meta">${m.verified ? '<span class="tick">Hub verified</span>' : 'Community profile'} · <a href="${personHref(m)}">Full profile</a></p>
          </div>`).join('') || '<p class="small">No one matches that. Try another word.</p>';
      }
      chips.addEventListener('click', (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        active = active === c.dataset.skill ? '' : c.dataset.skill;
        $$('.chip', chips).forEach((x) => x.classList.toggle('on', x.dataset.skill === active));
        render();
      });
      input.addEventListener('input', render);
      renderChips(); render();
    });
  }

  // Market
  const marketEl = $('#market');
  let verifiedMakers = new Set();
  if (marketEl) {
    Promise.all([load('data/products.json'), load('data/hub.json'), load('data/members.json')]).then(([curated, hub, verified]) => {
      const blocked = new Set((hub && hub.blocked) || []);
      verifiedMakers = new Set(verified.map((m) => m.name));
      renderMarket(curated);
      const status = $('#mstatus');
      if (status) status.innerHTML = '<span class="wait"><span class="spin"></span>Looking for new pieces…</span>';
      communityListings('product').then((community) => {
        const extra = community.filter((c) => !blocked.has(c.npub)).map((c) => Object.assign({}, c.data, { npub: c.npub }));
        if (extra.length) renderMarket(curated.concat(extra));
        if (status) status.textContent = '';
      });
    });
    function renderMarket(items) {
      marketEl.innerHTML = items.map((p) => productCard(Object.assign({}, p, { maker_v: !p.npub && verifiedMakers.has(p.maker) }))).join('');
    }
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
            <div class="logo"><img src="logo.svg" alt="" width="44" height="44"></div>
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
          x.strokeStyle = '#e6e6e3'; x.lineWidth = 2; x.strokeRect(40, 40, 1520, 1051);
          const finish = () => {
            x.textAlign = 'center';
            x.fillStyle = '#6e6e73'; x.font = '600 24px -apple-system, Helvetica, Arial'; x.fillText('B I T C O I N   K A K U M A   H U B', 800, 320);
            x.fillStyle = '#1d1d1f'; x.font = '36px -apple-system, Helvetica, Arial'; x.fillText('Certificate of completion', 800, 410);
            x.font = '600 88px -apple-system, Helvetica, Arial'; x.fillText(state.name, 800, 540);
            x.font = '36px -apple-system, Helvetica, Arial'; x.fillText('completed ' + C.title, 800, 630);
            x.fillText(C.lessons.length + ' lessons  ·  ' + date, 800, 690);
            x.fillStyle = '#6e6e73'; x.font = '26px -apple-system, Helvetica, Arial'; x.fillText('Kakuma Refugee Camp, Kenya  ·  Certificate ' + code, 800, 980);
            const a = document.createElement('a'); a.download = 'bitcoin-kakuma-hub-certificate.png'; a.href = cv.toDataURL('image/png'); a.click();
          };
          const logo = new Image(); logo.onload = () => { x.drawImage(logo, 740, 150, 120, 120); finish(); }; logo.onerror = finish; logo.src = 'logo.svg';
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
