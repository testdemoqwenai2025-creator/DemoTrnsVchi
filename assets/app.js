// AV/Robotics Operations Center — shared app JS for the public MPA.
// Handles: header/footer injection, theme toggle, search, login session,
// mobile nav, and a small rule-based chat responder for /chat.html.

(function (global) {
  'use strict';

  // ============================== UTILITIES ==============================
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (k === 'dataset') for (const dk in attrs[k]) e.dataset[dk] = attrs[k][k];
      else e.setAttribute(k, attrs[k]);
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        if (typeof c === 'string' || typeof c === 'number' || typeof c === 'boolean') {
          // Detect HTML strings (contain a tag) and route through innerHTML
          // so they render as elements instead of literal text. Plain text
          // strings without tags go through createTextNode to stay safe.
          const str = String(c);
          if (str.includes('<') && str.includes('>') && /<\/?[a-z][\s\S]*>/i.test(str)) {
            e.insertAdjacentHTML('beforeend', str);
          } else {
            e.appendChild(document.createTextNode(str));
          }
        } else {
          e.appendChild(c);
        }
      });
    }
    return e;
  }
  function qs(name) {
    return new URLSearchParams(global.location.search).get(name);
  }

  // ============================== SESSION (Phase 10d: RBAC) ==============================
  const SESSION_KEY = 'avops.session';
  // Credentials: admin/admin → role admin; testdemo/demo → role testdemo
  const CREDENTIALS = {
    admin:    { password: 'admin', role: 'admin',    email: 'admin@av-robotics.demo' },
    testdemo: { password: 'demo',  role: 'testdemo', email: 'testdemo@av-robotics.demo' },
  };
  function getUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  }
  function authenticate(username, password) {
    const cred = CREDENTIALS[username];
    if (!cred || cred.password !== password) return null;
    return { email: cred.email, role: cred.role, signedInAt: Date.now() };
  }
  function signIn(username, password) {
    const u = authenticate(username, password);
    if (!u) return false;
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    global.location.reload();
    return true;
  }
  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    global.location.reload();
  }
  global.AVops = { signIn, signOut, getUser };

  // ============================== THEME ==============================
  function getStoredTheme() { return localStorage.getItem('avops.theme') || 'dark'; }
  function setStoredTheme(t) {
    localStorage.setItem('avops.theme', t);
    applyTheme(t);
  }
  function applyTheme(t) {
    let resolved = t;
    if (t === 'system') {
      resolved = global.matchMedia && global.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    const btn = $('#theme-toggle');
    if (btn) {
      btn.textContent = resolved === 'light' ? '☀' : '☾';
      btn.setAttribute('aria-label', 'Toggle theme (currently ' + resolved + ')');
    }
  }

  // ============================== HEADER ==============================
  function buildHeader(activeRoute) {
    const header = el('header', { class: 'site-header', role: 'banner' });
    const brand = el('a', { class: 'brand', href: 'index.html', 'aria-label': 'AV/Robotics Operations Center — home' }, [
      el('span', { class: 'brand-icon', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>' }),
      el('div', {}, [
        el('div', { class: 'brand-name' }, 'AV / Robotics'),
        el('div', { class: 'brand-sub' }, 'Ops Center'),
      ]),
    ]);
    header.appendChild(brand);

    // Desktop nav
    const nav = el('nav', { class: 'nav-links', 'aria-label': 'Main navigation' });
    const primary = [
      { href: 'fleet.html', label: 'Fleet' },
      { href: 'telemetry.html', label: 'Telemetry' },
      { href: 'missions.html', label: 'Missions' },
      { href: 'robotics.html', label: 'Robotics' },
      { href: 'diagnostics.html', label: 'Diagnostics' },
      { href: 'knowledge.html', label: 'Knowledge' },
      { href: 'chat.html', label: 'AI Chat' },
    ];
    primary.forEach(p => {
      const a = el('a', { href: p.href }, p.label);
      if (p.href === activeRoute) a.classList.add('active');
      nav.appendChild(a);
    });

    // Deep stack dropdown
    const dropdown = el('div', { class: 'dropdown', id: 'deep-stack-dropdown' });
    const trigger = el('button', { class: 'dropdown-trigger', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' }, 'Deep Stack');
    trigger.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    });
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
    const menu = el('div', { class: 'dropdown-menu' });
    menu.appendChild(el('div', { class: 'dropdown-label' }, 'AV subsystems (M7–M14)'));
    menu.appendChild(el('div', { class: 'dropdown-sep' }));
    const deep = [
      { href: 'perception.html', label: 'Perception', icon: '👁' },
      { href: 'localization.html', label: 'Localization', icon: '📍' },
      { href: 'prediction.html', label: 'Prediction', icon: '🧠' },
      { href: 'planning.html', label: 'Planning', icon: '🌿' },
      { href: 'trajectory.html', label: 'Trajectory', icon: '🛣' },
      { href: 'v2x.html', label: 'V2X', icon: '📡' },
      { href: 'safety.html', label: 'Safety', icon: '🛡' },
      { href: 'simulation.html', label: 'Simulation', icon: '🧪' },
    ];
    deep.forEach(d => menu.appendChild(el('a', { href: d.href }, [d.icon + ' ', d.label])));
    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);
    nav.appendChild(dropdown);
    header.appendChild(nav);

    // Spacer + search + buttons
    header.appendChild(el('div', { class: 'header-spacer' }));

    const search = el('form', { class: 'search-form', role: 'search', action: 'search.html', method: 'get' });
    search.appendChild(el('span', { class: 'search-icon', html: '🔍' }));
    const searchInput = el('input', {
      class: 'search-input', type: 'search', name: 'q',
      placeholder: 'Search fleet, missions, knowledge…',
      'aria-label': 'Search the operations center',
    });
    search.appendChild(searchInput);
    header.appendChild(search);

    // Home button
    const homeBtn = el('a', { class: 'btn btn-ghost', href: 'index.html' }, '🏠 Home');
    header.appendChild(homeBtn);

    // Get Started button
    const startBtn = el('a', { class: 'btn btn-primary', href: 'fleet.html' }, '🚀 Get Started');
    header.appendChild(startBtn);

    // Auth (Phase 10d: RBAC — shows role badge)
    const user = getUser();
    if (user) {
      // Show role badge
      const roleBadge = el('span', {
        class: 'text-[9px] uppercase tracking-wider rounded-md px-1.5 py-0.5',
        style: user.role === 'admin'
          ? 'background:rgba(16,185,129,0.15); color:var(--accent);'
          : 'background:rgba(245,158,11,0.15); color:var(--warn);',
      }, user.role);
      header.appendChild(roleBadge);
      const signOutBtn = el('button', { class: 'btn', type: 'button' }, '↪ Sign out');
      signOutBtn.addEventListener('click', signOut);
      header.appendChild(signOutBtn);
    } else {
      const loginBtn = el('a', { class: 'btn', href: 'login.html' }, '→ Login');
      header.appendChild(loginBtn);
    }

    // Theme toggle
    const themeBtn = el('button', { class: 'btn btn-icon', id: 'theme-toggle', type: 'button', 'aria-label': 'Toggle theme' }, '☾');
    themeBtn.addEventListener('click', () => {
      const cur = getStoredTheme();
      const next = cur === 'dark' ? 'light' : cur === 'light' ? 'system' : 'dark';
      setStoredTheme(next);
    });
    header.appendChild(themeBtn);

    // Mobile nav toggle
    const mobileToggle = el('button', { class: 'mobile-nav-toggle', type: 'button', 'aria-label': 'Open navigation' }, '☰');
    mobileToggle.addEventListener('click', () => {
      const m = $('#mobile-nav');
      if (m) m.classList.toggle('open');
    });
    header.appendChild(mobileToggle);

    return header;
  }

  function buildMobileNav() {
    const nav = el('div', { class: 'mobile-nav', id: 'mobile-nav' });
    nav.appendChild(el('div', { class: 'mobile-nav-label' }, 'Operational modules'));
    ['Fleet', 'Telemetry', 'Missions', 'Robotics', 'Diagnostics', 'Knowledge'].forEach((label, i) => {
      const href = ['fleet.html', 'telemetry.html', 'missions.html', 'robotics.html', 'diagnostics.html', 'knowledge.html'][i];
      nav.appendChild(el('a', { href }, label));
    });
    nav.appendChild(el('div', { class: 'mobile-nav-label' }, 'Deep AV subsystems (M7–M14)'));
    ['Perception', 'Localization', 'Prediction', 'Planning', 'Trajectory', 'V2X', 'Safety', 'Simulation'].forEach((label, i) => {
      const href = ['perception', 'localization', 'prediction', 'planning', 'trajectory', 'v2x', 'safety', 'simulation'][i] + '.html';
      nav.appendChild(el('a', { href }, label));
    });
    nav.appendChild(el('div', { class: 'mobile-nav-label' }, 'Cross-cutting'));
    [['Login', 'login.html'], ['Search', 'search.html'], ['AI Chat', 'chat.html'], ['Privacy', 'privacy.html']].forEach(([label, href]) => {
      nav.appendChild(el('a', { href }, label));
    });
    return nav;
  }

  // ============================== FOOTER ==============================
  function buildFooter() {
    const footer = el('footer', { class: 'site-footer', role: 'contentinfo' });
    const left = el('div', { class: 'footer-left' });
    left.appendChild(el('span', { html: '🛡 GDPR: We use only essential cookies. No tracking, analytics, or advertising.' }));
    left.appendChild(el('a', { href: 'privacy.html' }, 'Privacy notice'));
    footer.appendChild(left);
    const right = el('div', { class: 'footer-right' });
    const email = (global.MockData && global.MockData.contactEmail) || 'testdemoqwenai2025-creator@users.noreply.github.com';
    right.appendChild(el('a', { href: 'mailto:' + email, html: '✉ ' + email }));
    right.appendChild(el('span', {}, '© ' + new Date().getFullYear() + ' AV/Robotics Ops Center · v0.10.0'));
    footer.appendChild(right);
    return footer;
  }

  // ============================== CHAT RESPONDER ==============================
  const SYSTEM_SCOPE = 'I am the AV/Robotics Operations Center assistant. I only answer questions about autonomous vehicles, robotics, fleet operations, sensors, missions, diagnostics, and the AV/Robotics knowledge domain.';
  const OFF_TOPIC = ['weather', 'politics', 'religion', 'sports', 'celebrity', 'movie', 'song', 'recipe', 'cook', 'stock market', 'crypto', 'lottery'];

  function respondTo(userText) {
    const q = (userText || '').toLowerCase().trim();
    if (!q) {
      return { content: SYSTEM_SCOPE + '\n\nWhat would you like to know?', insight: 'This chat is intentionally scoped. Next phase: wire it to a free LLM endpoint (DuckDuckGo AI Chat or HuggingChat).' };
    }
    if (OFF_TOPIC.some(kw => q.includes(kw))) {
      return { content: 'That question is outside my scope. ' + SYSTEM_SCOPE + '\n\nTry asking about LiDAR fusion, joint thermal limits, or what GPS_DROP means.', insight: 'Scope discipline keeps the assistant trustworthy. Next phase: add a role-gated "go off-topic anyway" toggle for power users.' };
    }
    if (global.MockData) {
      const codeMatch = global.MockData.knowledge.find(e => e.relatedCodes.some(c => q.includes(c.toLowerCase())));
      if (codeMatch) {
        return { content: codeMatch.title + ' — ' + codeMatch.summary + '\n\nRelated codes: ' + (codeMatch.relatedCodes.join(', ') || 'none') + '.', insight: 'KB entry ' + codeMatch.id + ' was a hit. Next phase: auto-link the chat answer to a "Open in Knowledge Vault" button.' };
      }
      const titleMatch = global.MockData.knowledge.find(e => e.title.toLowerCase().split(/\W+/).some(w => w.length > 3 && q.includes(w)));
      if (titleMatch) {
        return { content: titleMatch.title + ' — ' + titleMatch.summary, insight: 'Topic matched by keyword. Next phase: embedding-based retrieval over the knowledge vault for semantic matches.' };
      }
    }
    return {
      content: 'I can help with AV/Robotics topics only. ' + SYSTEM_SCOPE + '\n\nTry: "What is LIDAR_DRIFT?", "Explain battery DoD limits", "How does MPC compare to PID?", or paste a diagnostic code.',
      insight: 'Fallback is the most common path right now. Next phase: add a "Did you mean…?" suggestion list drawn from knowledge vault titles.'
    };
  }

  // Generate "Did you mean...?" suggestions from knowledge vault titles
  function getSuggestions(query) {
    var q = (query || '').toLowerCase().trim();
    if (!q || q.length < 3) return [];
    return global.MockData.knowledge
      .filter(function(k) { return k.title.toLowerCase().includes(q.slice(0, 4)) || k.relatedCodes.some(function(c) { return c.toLowerCase().includes(q); }); })
      .slice(0, 3)
      .map(function(k) { return k.title; });
  }

  function initChat() {
    const form = $('#chat-form');
    const input = $('#chat-input');
    const messages = $('#chat-messages');
    if (!form || !input || !messages) return;

    // Greeting
    messages.appendChild(chatMsg('assistant', SYSTEM_SCOPE + '\n\nAsk me about a diagnostic code (e.g. LIDAR_DRIFT), a sensor concept (LiDAR fusion, IMU saturation), or a robotics topic (joint thermal limits, MPC vs PID).',
      'This chat uses a local rule-based responder so it works offline. Next phase: wire it to a free LLM endpoint for generative answers.'));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      messages.appendChild(chatMsg('user', text));
      input.value = '';
      const r = respondTo(text);
      // Check for "Did you mean...?" suggestions
      var suggestions = getSuggestions(text);
      var content = r.content;
      if (suggestions.length > 0) {
        content += '\n\nDid you mean: ' + suggestions.map(function(s) { return '"' + s + '"'; }).join(', ') + '?';
      }
      messages.appendChild(chatMsg('assistant', content, r.insight));
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function chatMsg(role, content, insight) {
    const msg = el('div', { class: 'chat-msg ' + role });
    msg.appendChild(el('div', { html: content.replace(/\n/g, '<br>') }));
    if (insight) {
      const ins = el('div', { class: 'insight' });
      ins.appendChild(el('strong', {}, 'Insight · '));
      ins.appendChild(document.createTextNode(insight));
      msg.appendChild(ins);
    }
    return msg;
  }

  // ============================== STREAM INDICATOR (Phase 8) ==============================
  // Visible on every page so the operator always knows whether they're
  // viewing production telemetry, synthetic test scenarios, or a replay.
  // Stored in localStorage so the choice persists across pages.
  const STREAM_KEY = 'avops.dataStream';
  function getStream() {
    return localStorage.getItem(STREAM_KEY) || 'production';
  }
  function setStream(s) {
    localStorage.setItem(STREAM_KEY, s);
    applyStreamIndicator();
  }
  function applyStreamIndicator() {
    let indicator = $('#stream-indicator');
    if (!indicator) {
      indicator = el('div', { id: 'stream-indicator', role: 'status', 'aria-live': 'polite', 'aria-label': 'Data stream' });
      indicator.style.cssText = 'position:fixed; bottom:60px; right:16px; z-index:30; display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:6px; font-size:11px; font-family:ui-monospace,monospace; backdrop-filter:blur(8px); box-shadow:0 2px 8px rgba(0,0,0,0.3);';
      document.body.appendChild(indicator);
    }
    const s = getStream();
    const labels = {
      production: { label: 'PRODUCTION', tone: 'var(--accent)', bg: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' },
      synthetic:  { label: 'SYNTHETIC',  tone: 'var(--warn)',   bg: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' },
      replay:     { label: 'REPLAY',     tone: 'var(--info)',   bg: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)' },
    };
    const meta = labels[s] || labels.production;
    indicator.style.color = meta.tone;
    indicator.style.background = meta.bg;
    indicator.style.border = meta.border;
    // RBAC: check if user can switch to each stream
    const user = getUser();
    const role = user ? user.role : null;
    const canSwitch = function(target) {
      if (!role) return false;       // not signed in → no switching
      if (role === 'admin') return true;  // admin can switch to any
      return target === 'production';     // testdemo can only view production
    };
    // If current stream is not allowed for this role, force back to production
    if (!canSwitch(s)) {
      localStorage.setItem(STREAM_KEY, 'production');
      s = 'production';
    }
    const roleBadge = role
      ? '<span style="background:' + (role === 'admin' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)') + '; color:' + (role === 'admin' ? 'var(--accent)' : 'var(--warn)') + '; padding:1px 4px; border-radius:3px; font-size:9px; text-transform:uppercase; letter-spacing:0.5px;">' + role + '</span>'
      : '';
    const streamButtons = ['production', 'synthetic', 'replay'].map(function(target) {
      const allowed = canSwitch(target);
      const isCurrent = s === target;
      return '<button onclick="AVops.setStream(\'' + target + '\')" ' +
        (allowed ? '' : 'disabled ') +
        'style="background:none; border:none; color:inherit; cursor:' + (allowed ? 'pointer' : 'not-allowed') + '; padding:0 4px; font-size:10px;' + (allowed ? '' : 'opacity:0.3;') + (isCurrent ? ' text-decoration:underline;' : '') + '" ' +
        'title="' + (allowed ? 'Switch to ' + target : 'Locked — ' + (role || 'not signed in') + ' role cannot access ' + target) + '">' +
        (allowed ? '' : '🔒 ') + target.slice(0, 4).toUpperCase() +
        '</button>';
    }).join('');
    indicator.innerHTML = '<strong>' + meta.label + '</strong>' +
      ' <span style="opacity:0.6;">·</span> ' +
      '<span style="opacity:0.8;">' + (s === 'production' ? 'live_telemetry_feed' : s === 'synthetic' ? 'synth_scenario_007' : 'replay_session_2026_09_22') + '</span>' +
      (s === 'synthetic' ? ' <span style="color:var(--warn);" title="Synthetic data — not for live operational decisions">⚠</span>' : '') +
      (roleBadge ? ' ' + roleBadge : '') +
      ' <span style="margin-left:8px; padding-left:8px; border-left:1px solid currentColor; opacity:0.6;">' +
        streamButtons +
      '</span>';
  }

  // ============================== REGULATORY FLOATING BUTTON (Phase 9c) ==============================
  // A second floating button (above the Dynamic Demo FAB) that opens regulatory.html
  // in a new tab. The user requested this so regulatory compliance is always one click
  // away without navigating through the Deep Stack dropdown.
  // Not shown on regulatory.html itself (no point popping out of the page you're on).
  function applyRegulatoryButton(activeRoute) {
    if (activeRoute === 'regulatory.html') return;
    const existing = $('#regulatory-fab');
    if (existing) return;
    const fab = el('a', {
      id: 'regulatory-fab',
      href: 'regulatory.html',
      target: '_blank',
      rel: 'noopener',
      'aria-label': 'Open Regulatory Compliance in a new tab',
      title: 'Regulatory Compliance (opens in new tab)',
    });
    fab.style.cssText = 'position:fixed; bottom:104px; left:16px; z-index:30; display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; background:var(--panel); color:var(--accent); font-size:11px; font-weight:500; text-decoration:none; border:1px solid var(--accent); box-shadow:0 2px 8px rgba(0,0,0,0.3); transition:transform 0.15s, box-shadow 0.15s; cursor:pointer; backdrop-filter:blur(8px);';
    fab.innerHTML = '🛡 <span>Regulatory</span>';
    fab.addEventListener('mouseenter', () => { fab.style.transform = 'translateY(-2px)'; fab.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'; });
    fab.addEventListener('mouseleave', () => { fab.style.transform = ''; fab.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'; });
    document.body.appendChild(fab);
  }

  // ============================== LIVE DEMO FLOATING BUTTON (Phase 9) ==============================
  // A floating "Launch Live Demo" button on every page (bottom-left, complementing
  // the stream indicator at bottom-right). Opens /live.html in a NEW TAB so the
  // operator keeps their current context — the dynamic page is a pop-out, not a
  // navigation. Not shown on /live.html itself (no point popping out of the live page).
  function applyLiveDemoButton(activeRoute) {
    if (activeRoute === 'live.html') return; // don't show on the live page itself
    const existing = $('#live-demo-fab');
    if (existing) return; // already injected
    const fab = el('a', {
      id: 'live-demo-fab',
      href: 'live.html',
      target: '_blank',
      rel: 'noopener',
      'aria-label': 'Launch dynamic demo in a new tab',
      title: 'Dynamic Demo (opens in new tab — 5 Hz real-time simulation)',
    });
    fab.style.cssText = 'position:fixed; bottom:60px; left:16px; z-index:30; display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:999px; background:var(--accent); color:#0a0e0d; font-size:12px; font-weight:600; text-decoration:none; box-shadow:0 4px 12px rgba(16,185,129,0.4); transition:transform 0.15s, box-shadow 0.15s; cursor:pointer;';
    fab.innerHTML = '▶ <span>Dynamic Demo</span>';
    fab.addEventListener('mouseenter', () => { fab.style.transform = 'translateY(-2px)'; fab.style.boxShadow = '0 6px 16px rgba(16,185,129,0.5)'; });
    fab.addEventListener('mouseleave', () => { fab.style.transform = ''; fab.style.boxShadow = '0 4px 12px rgba(16,185,129,0.4)'; });
    document.body.appendChild(fab);
  }

  // ============================== INIT ==============================
  function init(activeRoute) {
    applyTheme(getStoredTheme());

    // Inject header into placeholder
    const headerHost = $('#site-header');
    if (headerHost) headerHost.appendChild(buildHeader(activeRoute));

    // Inject mobile nav
    const mobileHost = $('#mobile-nav-host');
    if (mobileHost) mobileHost.appendChild(buildMobileNav());

    // Inject footer
    const footerHost = $('#site-footer');
    if (footerHost) footerHost.appendChild(buildFooter());

    // Inject stream indicator (Phase 8)
    applyStreamIndicator();

    // Inject floating Live Demo button (Phase 9)
    applyLiveDemoButton(activeRoute);

    // Inject floating Regulatory button (Phase 9c — above the Dynamic Demo FAB)
    applyRegulatoryButton(activeRoute);

    // Init chat if on chat page
    initChat();

    // Mark body as initialised (for any CSS that waits)
    document.body.classList.add('avops-ready');
  }

  global.AVops = Object.assign(global.AVops || {}, {
    init,
    el,
    $,
    $$,
    qs,
    respondTo,
    setStoredTheme,
    getStoredTheme,
    getStream,
    setStream,
  });
})(window);
