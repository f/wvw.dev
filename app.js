(function () {
  var saved = localStorage.getItem("theme");
  if (!saved) saved = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", saved);
})();

(function () {
  "use strict";

  let data = null;
  let currentView = "discover";
  let currentApp = null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const icons = {
    discover: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    macos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    "developer-tools": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    cli: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    productivity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    utilities: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    education: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>`,
    entertainment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>`,
    games: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="3"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="4" y1="12" x2="8" y2="12"/><circle cx="16" cy="10" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    "photo-video": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    "graphics-design": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    "social-networking": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    finance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    "health-fitness": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    lifestyle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    news: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="10" y1="6" x2="18" y2="6"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
    business: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
    reference: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    travel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    "food-drink": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    navigation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
    sports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20"/><path d="M2 12h20"/><path d="M12 2c2.5 3.5 4 7.5 4 10s-1.5 6.5-4 10"/></svg>`,
    weather: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
    shopping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
    books: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    medical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
    stores: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  };

  const cardGradientsDark = [
    ["#1a1a2e", "#16213e", "#0f3460"],
    ["#1a1a1a", "#2d132c", "#3a1c3f"],
    ["#0d1117", "#161b22", "#1a2332"],
    ["#1a1a2e", "#0a3d62", "#1e5f74"],
    ["#1a0a2e", "#2b1055", "#3c1053"],
    ["#0a2e1a", "#0b4228", "#165a3a"],
  ];

  const cardGradientsLight = [
    ["#d4e4f7", "#c5d8f0", "#a8c4e0"],
    ["#e8daf0", "#dcc8e8", "#ccb0dc"],
    ["#d6e2ef", "#c8d8e8", "#b8cade"],
    ["#d0e8ee", "#b8dce6", "#a0d0dc"],
    ["#ddd4f0", "#cec0e8", "#baa8dc"],
    ["#d0ead8", "#b8dcc4", "#a0d0b0"],
  ];

  function getCardGradients() {
    return document.documentElement.getAttribute("data-theme") === "light"
      ? cardGradientsLight
      : cardGradientsDark;
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function iconStyle(app) {
    const s = app.iconStyle || {};
    const parts = [];
    if (s.scale) parts.push(`transform:scale(${s.scale})`);
    if (s.objectFit) parts.push(`object-fit:${s.objectFit}`);
    if (s.padding) parts.push(`padding:${s.padding}`);
    return parts.join(";");
  }

  function iconContainerStyle(app) {
    const s = app.iconStyle || {};
    const parts = [];
    if (s.bgColor) parts.push(`background:${s.bgColor}`);
    if (s.borderRadius) parts.push(`border-radius:${s.borderRadius}`);
    return parts.length ? ` style="${parts.join(";")}"` : "";
  }

  function renderIcon(app) {
    if (app.icon) {
      const imgSt = iconStyle(app);
      const st = imgSt ? ` style="${imgSt}"` : "";
      return `<img src="${app.icon}" alt="${app.name}"${st} onerror="this.parentElement.innerHTML='${app.iconEmoji || "📦"}'">`;
    }
    return app.iconEmoji || "📦";
  }

  function smartMedia(url, cls, alt) {
    const isLikelyImage = /\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(url);
    if (isLikelyImage) {
      return `<img class="${cls}" src="${url}" alt="${alt}" loading="lazy">`;
    }
    const isLikelyVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
    if (isLikelyVideo) {
      return `<video class="${cls}" src="${url}" autoplay loop muted playsinline></video>`;
    }
    return `<img class="${cls}" src="${url}" alt="${alt}" loading="lazy" onerror="var v=document.createElement('video');v.className=this.className;v.src=this.src;v.autoplay=v.loop=v.muted=v.playsInline=true;this.replaceWith(v)">`;
  }

  function starBadge(stars) {
    return `<span class="star-count"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${formatNumber(stars)}</span>`;
  }

  function ownerBadge(app) {
    const label = app.developer || app._owner;
    if (!label) return "";
    return `<span class="owner-badge">${label}</span>`;
  }

  function isPaidApp(app) {
    return app.price && app.price !== "Free" && app.price !== "free";
  }

  function getBuyUrl(app) {
    return app.buyUrl || app.homepage || app.github;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "w", seconds: 604800 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "m", seconds: 60 },
    ];
    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1) return count + i.label + " ago";
    }
    return "just now";
  }

  function renderReviews(app) {
    const comments = app._comments || [];
    const hasGithub = app.github && app.github.includes("github.com");
    if (comments.length === 0 && !hasGithub) return "";

    const issuesUrl = hasGithub ? app.github + "/issues" : "";
    const newIssueUrl = hasGithub ? app.github + "/issues/new" : "";

    const clickToRate = hasGithub ? `
      <div class="reviews-actions">
        <div class="click-to-rate">
          <span class="click-to-rate-label">Click to Rate:</span>
          <a href="${newIssueUrl}" target="_blank" rel="noopener" class="rate-stars">
            ${[1,2,3,4,5].map(() => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`).join("")}
          </a>
        </div>
        <div class="review-links">
          <a href="${newIssueUrl}" target="_blank" rel="noopener" class="review-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Write a Review
          </a>
          <a href="${issuesUrl}" target="_blank" rel="noopener" class="review-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            App Support
          </a>
        </div>
      </div>` : "";

    const reactionEmojis = {thumbsUp:"\u{1F44D}",thumbsDown:"\u{1F44E}",laugh:"\u{1F604}",hooray:"\u{1F389}",confused:"\u{1F615}",heart:"\u2764\uFE0F",rocket:"\u{1F680}",eyes:"\u{1F440}"};

    const reviewCards = comments.map((c) => {
      const timeAgo = getTimeAgo(new Date(c.created_at));
      const body = escapeHtml(c.body || "");
      const truncated = body.length > 200 ? body.substring(0, 200) + "\u2026" : body;
      const reactions = c.reactions ? Object.entries(reactionEmojis)
        .filter(([key]) => c.reactions[key] > 0)
        .map(([key, emoji]) => `<span class="review-reaction">${emoji} ${c.reactions[key]}</span>`)
        .join("") : "";

      return `
        <div class="review-card">
          <div class="review-card-header">
            <img class="review-avatar" src="${c.avatar}" alt="" onerror="this.style.display='none'">
            <div class="review-header-info">
              <span class="review-author">${escapeHtml(c.user)}</span>
              <span class="review-time">${timeAgo}</span>
            </div>
          </div>
          <div class="review-card-title">${escapeHtml(c.title)}</div>
          <div class="review-card-body">${truncated}</div>
          ${reactions ? `<div class="review-reactions">${reactions}</div>` : ""}
          ${c.url ? `<a href="${c.url}" target="_blank" rel="noopener" class="review-more">more</a>` : ""}
        </div>`;
    }).join("");

    return `
      <div class="detail-section reviews-section">
        <div class="section-header">
          <h3 style="font-size:22px;margin-bottom:0">Ratings &amp; Reviews</h3>
          ${hasGithub ? `<a href="${issuesUrl}" target="_blank" rel="noopener" class="see-all-link">See All</a>` : ""}
        </div>
        ${clickToRate}
        ${reviewCards ? `
        <div class="review-cards-wrapper">
          <button class="review-scroll-btn review-scroll-left" aria-label="Scroll left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="review-cards">${reviewCards}</div>
          <button class="review-scroll-btn review-scroll-right" aria-label="Scroll right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 6 15 12 9 18"/></svg>
          </button>
        </div>` : ""}
      </div>`;
  }

  function getButtonLabel(app) {
    if (isPaidApp(app)) return app.price;
    if (app.brew || app.downloadUrl || app.installCommand) return "Get";
    return "View";
  }

  function getAppPublisherTerms(app) {
    return [app.developer, app._developer, app._owner, data.store.developer]
      .filter(Boolean)
      .map((value) => value.toLowerCase());
  }

  function getPublisherMatchType(app, query) {
    if (!query) return 0;
    const terms = getAppPublisherTerms(app);
    if (terms.some((value) => value === query)) return 2;
    if (terms.some((value) => value.includes(query))) return 1;
    return 0;
  }

  function matchesSearchText(app, query) {
    if (!query) return true;
    return (
      app.name.toLowerCase().includes(query) ||
      app.subtitle.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      (app.features && app.features.some((f) => f.toLowerCase().includes(query)))
    );
  }

  function parseSearchQuery(query) {
    const byMatch = query.match(/(?:^|\s)by:(?:"([^"]+)"|(.+?))(?=\s+\w+:|$)/i);
    const publisherQuery = byMatch ? (byMatch[1] || byMatch[2] || "").trim().toLowerCase() : "";
    const textQuery = (byMatch ? query.replace(byMatch[0], " ") : query).trim().toLowerCase();
    return { publisherQuery, textQuery };
  }

  function appRow(app) {
    return `
      <div class="app-row" data-app="${app.id}">
        <div class="app-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
        <div class="app-info">
          <div class="app-name"><span class="app-name-text">${app.name}</span>${ownerBadge(app)}</div>
          <div class="app-subtitle">${app.subtitle}</div>
          <div class="app-meta">
            <span class="app-meta-tag">${app.platform}</span>
            ${app.stars ? starBadge(app.stars) : ""}
          </div>
        </div>
        <button class="get-btn${isPaidApp(app) ? " buy-btn" : ""}" data-action="get" data-app="${app.id}">${getButtonLabel(app)}</button>
      </div>`;
  }

  function appCard(app, index) {
    const grads = getCardGradients();
    const g = grads[index % grads.length];
    const hasScreenshot = app.screenshots && app.screenshots.length > 0;
    const screenshotImg = hasScreenshot
      ? smartMedia(app.screenshots[0], "card-screenshot", app.name)
      : "";
    return `
      <div class="card" data-app="${app.id}">
        <div class="card-image">
          <div class="card-image-bg" style="background:linear-gradient(135deg, ${g[0]}, ${g[1]}, ${g[2]})">
            ${screenshotImg}
            <div class="card-icon-fallback">${app.icon ? `<img src="${app.icon}" style="width:80px;height:80px;border-radius:18px;${iconStyle(app)}" onerror="this.outerHTML='📦'">` : (app.iconEmoji || "📦")}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-label">${app.platform === "macOS" ? "macOS APP" : app.platform === "Web" ? "WEB APP" : "TOOL"}</div>
          <div class="card-title">${app.name}</div>
          <div class="card-subtitle">${app.subtitle}</div>
        </div>
      </div>`;
  }

  // Sidebar
  function buildSidebar() {
    const nav = $("#sidebarNav");
    const items = [
      { id: "discover", name: "Discover", icon: icons.discover },
      { id: "stores", name: "Stores", icon: icons.stores },
    ];

    let html = "";
    items.forEach((item) => {
      html += `<div class="nav-item${currentView === item.id ? " active" : ""}" data-view="${item.id}">
        <span class="nav-icon">${item.icon}</span>${item.name}
      </div>`;
    });

    html += `<div class="nav-separator"></div>`;
    html += `<div class="nav-section-label">Categories</div>`;

    const defaultIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
    const categories = (data.categories || [])
      .filter((c) => c.id !== "all")
      .filter((c) => data.apps.some((a) => a.category && a.category.includes(c.id)))
      .map((c) => ({ id: c.id, name: c.name, icon: icons[c.id] || defaultIcon }));

    categories.forEach((cat) => {
      html += `<div class="nav-item${currentView === cat.id ? " active" : ""}" data-view="${cat.id}">
        <span class="nav-icon">${cat.icon}</span>${cat.name}
      </div>`;
    });

    html += `<div class="nav-separator"></div>`;
    html += `<div class="nav-item" data-view="github">
      <span class="nav-icon">${icons.github}</span>GitHub
    </div>`;

    nav.innerHTML = html;
  }

  function renderFeaturedBanner(f) {
    const app = data.apps.find((a) => a.id === f.id);
    return `
      <div class="featured-banner" data-app="${f.id}">
        <div class="featured-content">
          <div class="featured-label">${f.headline}</div>
          <div class="featured-title">${f.title}</div>
          <div class="featured-subtitle">${f.subtitle}</div>
          ${app ? `
          <div class="featured-app-row">
            <div class="featured-app-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
            <div class="featured-app-info">
              <div class="featured-app-name">${app.name}</div>
              <div class="featured-app-sub">${app.subtitle}</div>
            </div>
            <button class="featured-get-btn${isPaidApp(app) ? " buy-btn" : ""}" data-action="get" data-app="${app.id}">${getButtonLabel(app)}</button>
          </div>` : ""}
        </div>
      </div>`;
  }

  function pickMustTry(apps, count) {
    const withScreenshots = apps.filter((a) => a.screenshots && a.screenshots.length > 0);
    const without = apps.filter((a) => !a.screenshots || a.screenshots.length === 0);
    const stores = [...new Set(withScreenshots.map((a) => a._source))];
    const picked = [];
    const usedIds = new Set();
    stores.forEach((store) => {
      const fromStore = withScreenshots.filter((a) => a._source === store && !usedIds.has(a.id));
      if (fromStore.length > 0) {
        picked.push(fromStore[0]);
        usedIds.add(fromStore[0].id);
      }
    });
    withScreenshots.forEach((a) => {
      if (picked.length >= count) return;
      if (!usedIds.has(a.id)) { picked.push(a); usedIds.add(a.id); }
    });
    without.forEach((a) => {
      if (picked.length >= count) return;
      if (!usedIds.has(a.id)) { picked.push(a); usedIds.add(a.id); }
    });
    return picked.slice(0, count);
  }

  // Discover Page
  function renderDiscover() {
    const apps = data.apps;
    const featuredList = Array.isArray(data.featured) ? data.featured : [data.featured];

    const activeCats = (data.categories || [])
      .filter((c) => c.id !== "all")
      .filter((c) => apps.some((a) => a.category && a.category.includes(c.id)));

    const dots = featuredList.length > 1
      ? `<div class="carousel-dots">${featuredList.map((_, i) => `<button class="carousel-dot${i === 0 ? " active" : ""}" data-slide="${i}"></button>`).join("")}</div>`
      : "";

    let html = `
      <div class="carousel">
        <div class="carousel-track">
          ${featuredList.map((f) => renderFeaturedBanner(f)).join("")}
        </div>
        ${dots}
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Best New Apps and Updates</h2>
        </div>
        <div class="app-list">
          ${apps.slice(0, 6).map((a) => appRow(a)).join("")}
        </div>
      </div>

      ${(() => {
        const paidApps = apps.filter((a) => isPaidApp(a));
        if (paidApps.length === 0) return "";
        return `
      <div class="section">
        <div class="section-header">
          <h2>Best Paid Apps</h2>
        </div>
        <div class="app-list">
          ${paidApps.map((a) => appRow(a)).join("")}
        </div>
      </div>`;
      })()}

      <div class="section">
        <div class="section-header">
          <h2>The Latest Must-Try Apps</h2>
        </div>
        <div class="cards-grid">
          ${pickMustTry(apps, 4).map((a, i) => appCard(a, i)).join("")}
        </div>
      </div>

      ${activeCats.map((cat) => {
        const catApps = apps.filter((a) => a.category && a.category.includes(cat.id));
        const showAll = catApps.length > 6;
        return `
      <div class="section">
        <div class="section-header">
          <h2>${cat.name}</h2>
          ${showAll ? `<span class="see-all" data-view="${cat.id}">See All</span>` : ""}
        </div>
        <div class="app-list">
          ${catApps.slice(0, 6).map((a) => appRow(a)).join("")}
        </div>
      </div>`;
      }).join("")}
    `;

    return html;
  }

  // Category Page
  function renderCategory(categoryId) {
    const cat = data.categories.find((c) => c.id === categoryId);
    const apps = data.apps.filter((a) => a.category.includes(categoryId));

    if (apps.length === 0) {
      return `
        <div class="page-header"><h1>${cat ? cat.name : "Category"}</h1></div>
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>No apps yet</h3>
          <p>Check back later for new apps in this category.</p>
        </div>`;
    }

    return `
      <div class="page-header"><h1>${cat ? cat.name : "Category"}</h1></div>
      <div class="app-list">
        ${apps.map((a) => appRow(a)).join("")}
      </div>`;
  }

  // App Detail Page
  function renderAppDetail(appId) {
    const app = data.apps.find((a) => a.id === appId);
    if (!app) return `<div class="empty-state"><h3>App not found</h3></div>`;

    return `
      <div class="app-detail">
        <div class="back-btn" data-action="back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </div>

        <div class="app-detail-header">
          <div class="app-detail-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
          <div class="app-detail-title-area">
            <div class="app-detail-title">${app.name}</div>
            ${app._owner ? `<div class="app-detail-owner">by <a href="https://github.com/${app._owner}" target="_blank" rel="noopener">${app._owner}</a></div>` : ""}
            <div class="app-detail-subtitle">${app.subtitle}</div>
            <div class="app-detail-actions">
              <button class="app-detail-get-btn${isPaidApp(app) ? " buy-btn" : ""}" data-action="get" data-app="${app.id}">
                ${getButtonLabel(app)}
              </button>
              <a href="${app.github}" target="_blank" rel="noopener" class="github-link">
                ${icons.github} View on GitHub
              </a>
            </div>
          </div>
        </div>

        <div class="app-detail-stats">
          ${app.stars !== undefined ? `<div class="stat"><div class="stat-value">${formatNumber(app.stars)}</div><div class="stat-label">Stars</div></div>` : ""}
          ${app.forks !== undefined ? `<div class="stat"><div class="stat-value">${formatNumber(app.forks)}</div><div class="stat-label">Forks</div></div>` : ""}
          <div class="stat"><div class="stat-value">${app.price}</div><div class="stat-label">Price</div></div>
          <div class="stat"><div class="stat-value">${app.platform}</div><div class="stat-label">Platform</div></div>
          <div class="stat"><div class="stat-value">${app.language}</div><div class="stat-label">Language</div></div>
        </div>

        ${app.screenshots && app.screenshots.length > 0 ? `
        <div class="detail-section">
          <h3>Preview</h3>
          <div class="screenshots-scroll">
            ${app.screenshots.map((s) => smartMedia(s, "screenshot-img", app.name)).join("")}
          </div>
        </div>` : ""}

        <div class="detail-section">
          <h3>Description</h3>
          <p>${app.longDescription || app.description}</p>
        </div>

        ${app.features && app.features.length > 0 ? `
        <div class="detail-section">
          <h3>What's New</h3>
          <ul class="features-list">
            ${app.features.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>` : ""}

        ${app.brew ? `
        <div class="detail-section">
          <div class="brew-section">
            <div class="brew-section-title">Install with Homebrew</div>
            <div class="brew-command" data-copy="${app.brew}">
              <span class="prompt">$</span>
              <span class="cmd">${app.brew}</span>
              <span class="copy-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
            </div>
          </div>
        </div>` : ""}

        ${app.installCommand ? `
        <div class="detail-section">
          <div class="brew-section">
            <div class="brew-section-title">Quick Install</div>
            <div class="brew-command" data-copy="${app.installCommand}">
              <span class="prompt">$</span>
              <span class="cmd">${app.installCommand}</span>
              <span class="copy-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
            </div>
          </div>
        </div>` : ""}

        ${renderReviews(app)}

        <div class="detail-section">
          <h3>Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Developer</span>
              <span class="info-value">${app.developer || data.store.developer}</span>
            </div>
            ${app._owner ? `<div class="info-item">
              <span class="info-label">Published by</span>
              <span class="info-value"><a href="https://github.com/${app._owner}" target="_blank" rel="noopener">${app._owner}</a></span>
            </div>` : ""}
            ${app._source ? `<div class="info-item">
              <span class="info-label">Source Store</span>
              <span class="info-value"><a href="${app._storeUrl || 'https://github.com/' + app._source}" target="_blank" rel="noopener">${app._store || app._source}</a></span>
            </div>` : ""}
            <div class="info-item">
              <span class="info-label">Compatibility</span>
              <span class="info-value">${app.requirements}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Language</span>
              <span class="info-value">${app.language}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Price</span>
              <span class="info-value">${app.price}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Source Code</span>
              <span class="info-value"><a href="${app.github}" target="_blank" rel="noopener">${app.github.replace("https://github.com/", "")}</a></span>
            </div>
            ${app.homepage ? `
            <div class="info-item">
              <span class="info-label">Website</span>
              <span class="info-value"><a href="${app.homepage}" target="_blank" rel="noopener">${app.homepage.replace("https://", "")}</a></span>
            </div>` : ""}
          </div>
        </div>

        ${(() => {
          const sameStore = data.apps.filter(
            (a) => a.id !== app.id && a._store && app._store && a._store === app._store
          ).slice(0, 6);
          if (sameStore.length === 0) return "";
          return `
        <div class="detail-section">
          <div class="section-header">
            <h3 style="font-size:22px;margin-bottom:0">More by ${app._store}</h3>
          </div>
          <div class="app-list">
            ${sameStore.map((a) => appRow(a)).join("")}
          </div>
        </div>`;
        })()}

        ${(() => {
          const related = data.apps.filter(
            (a) => a.id !== app.id &&
            a.category && app.category &&
            a.category.some((c) => app.category.includes(c))
          ).slice(0, 6);
          if (related.length === 0) return "";
          return `
        <div class="detail-section">
          <div class="section-header">
            <h3 style="font-size:22px;margin-bottom:0">You Might Also Like</h3>
          </div>
          <div class="app-list">
            ${related.map((a) => appRow(a)).join("")}
          </div>
        </div>`;
        })()}
      </div>`;
  }

  // Search results
  function renderSearch(query) {
    const { publisherQuery, textQuery } = parseSearchQuery(query);
    const matchingApps = data.apps
      .map((app) => ({
        app,
        publisherMatchType: publisherQuery ? getPublisherMatchType(app, publisherQuery) : 0,
      }))
      .filter(({ app, publisherMatchType }) =>
        (!publisherQuery || publisherMatchType > 0) && matchesSearchText(app, textQuery)
      );

    const exactPublisherMatches = publisherQuery
      ? matchingApps.filter(({ publisherMatchType }) => publisherMatchType === 2).map(({ app }) => app)
      : [];
    const partialPublisherMatches = publisherQuery
      ? matchingApps.filter(({ publisherMatchType }) => publisherMatchType === 1).map(({ app }) => app)
      : [];
    const results = !publisherQuery ? matchingApps.map(({ app }) => app) : exactPublisherMatches.concat(partialPublisherMatches);

    if (results.length === 0) {
      return `
        <div class="page-header"><h1>Search: "${query}"</h1></div>
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No results</h3>
          <p>Try a different search term.</p>
        </div>`;
    }

    return `
      <div class="page-header"><h1>Search: "${query}"</h1></div>
      ${publisherQuery ? `
      <div class="app-list">
        ${exactPublisherMatches.map((a) => appRow(a)).join("")}
      </div>
      ${partialPublisherMatches.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <h2>Related Publisher Matches</h2>
        </div>
        <div class="app-list">
          ${partialPublisherMatches.map((a) => appRow(a)).join("")}
        </div>
      </div>` : ""}` : `
      <div class="app-list">
        ${results.map((a) => appRow(a)).join("")}
      </div>`}`;
  }

  // Stores Page
  function renderStores() {
    if (storesData.length === 0) {
      return `
        <div class="page-header"><h1>Stores</h1></div>
        <div class="empty-state">
          <div class="empty-state-icon">🏪</div>
          <h3>No stores yet</h3>
          <p>Stores will appear here once the catalog is built.</p>
        </div>`;
    }

    return `
      <div class="page-header"><h1>Stores</h1></div>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px;line-height:1.5">
        World Vibe Web aggregates apps from independent stores. Each store maintains its own <code style="font-size:12px;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">apps.json</code> and contributes to the unified catalog.
      </p>
      <div class="stores-list">
        ${storesData.map((s) => {
          const iconStack = (s.icons || []).slice(0, 4).map((ic, i) =>
            `<img src="${ic.icon}" class="store-stack-icon" style="z-index:${4-i};margin-left:${i ? '-10px' : '0'};${ic.iconStyle && ic.iconStyle.borderRadius ? 'border-radius:'+ic.iconStyle.borderRadius : 'border-radius:22%'}" onerror="this.style.display='none'">`
          ).join("");
          const fallbackAvatar = !s.icons || s.icons.length === 0
            ? `<div class="store-card-avatar-letter">${s.name.charAt(0).toUpperCase()}</div>` : "";
          const isUrl = s.source.startsWith("http");
          const sourceLink = isUrl ? s.source : `https://github.com/${s.source}`;
          const sourceLabel = isUrl ? s.source.replace(/^https?:\/\//, "").replace(/\/+$/, "") : s.owner;
          return `
          <div class="store-card">
            <div class="store-card-header">
              <div class="store-icon-stack">${iconStack}${fallbackAvatar}</div>
              <div class="store-card-info">
                <div class="store-card-name">${s.name}</div>
                <div class="store-card-developer">by ${s.developer}</div>
              </div>
            </div>
            <div class="store-card-stats">
              <div class="store-card-stat"><span class="store-stat-value">${s.appCount}</span><span class="store-stat-label">Apps</span></div>
              <div class="store-card-stat"><span class="store-stat-value">${formatNumber(s.totalStars)}</span><span class="store-stat-label">Stars</span></div>
            </div>
            <div class="store-card-actions">
              ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener" class="store-card-btn primary">Visit Store</a>` : ""}
              <a href="${sourceLink}" target="_blank" rel="noopener" class="store-card-btn secondary">${icons.github} View Repo</a>
            </div>
          </div>`;
        }).join("")}
      </div>`;
  }

  // Router
  function buildPath(view, appId) {
    if (appId) return `/${view}/${appId}`;
    if (view === "discover") return `/`;
    return `/${view}`;
  }

  function parsePath() {
    const path = location.pathname.replace(/^\//, "");
    if (!path) return { view: "discover", appId: null };
    const parts = path.split("/");
    if (parts.length >= 2) return { view: parts[0], appId: parts[1] };
    return { view: parts[0], appId: null };
  }

  function parseHash() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash) return null;
    const parts = hash.split("/");
    if (parts.length >= 2) return { view: parts[0], appId: parts[1] };
    return { view: parts[0], appId: null };
  }

  function navigate(view, appId, skipPush) {
    if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
    const scroll = $("#contentScroll");
    scroll.scrollTop = 0;

    if (view === "github") {
      window.open(data.store.github, "_blank");
      return;
    }

    if (appId) {
      currentApp = appId;
      currentView = view;
      scroll.innerHTML = renderAppDetail(appId);
    } else if (view === "discover") {
      currentApp = null;
      currentView = view;
      scroll.innerHTML = renderDiscover();
    } else if (view === "stores") {
      currentApp = null;
      currentView = view;
      scroll.innerHTML = renderStores();
    } else {
      currentApp = null;
      currentView = view;
      scroll.innerHTML = renderCategory(view);
    }

    if (!skipPush) {
      history.pushState(null, "", buildPath(currentView, currentApp));
    }

    buildSidebar();
    bindEvents();
    updateMobileTopbar();
  }

  function onPopState() {
    const { view, appId } = parsePath();
    navigate(view || "discover", appId || null, true);
  }

  // Modal
  function showBrewModal(app) {
    const overlay = $("#modalOverlay");
    const modal = $("#modal");
    const command = app.brew || app.installCommand;

    modal.innerHTML = `
      <button class="modal-close" data-action="close-modal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="modal-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
      <h3>Install ${app.name}</h3>
      <p>${app.brew ? "Install via Homebrew with a single command. Make sure you have Homebrew installed on your Mac." : "Run this command to get started."}</p>
      <div class="modal-brew-command" data-copy="${command}">
        <span class="prompt">$</span>
        <span class="cmd">${command}</span>
        <span class="copy-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" data-action="copy-and-close" data-copy="${command}">Copy Command</button>
        ${app.downloadUrl ? `<a class="btn-secondary" href="${app.downloadUrl}" target="_blank" rel="noopener">${app.downloadUrl.endsWith(".dmg") || app.downloadUrl.includes(".dmg") ? "Download .dmg" : "Download"}</a>` : ""}
      </div>
      ${app.downloadUrl && (app.downloadUrl.endsWith(".dmg") || app.downloadUrl.includes(".dmg")) ? `
      <div style="margin-top:14px;font-size:12px;color:var(--text-tertiary);line-height:1.5">
        If macOS blocks the app on first launch, run:
        <div class="brew-command" style="margin-top:8px;font-size:12px;padding:8px 12px" data-copy="xattr -cr /Applications/${app.name}.app">
          <span class="prompt">$</span>
          <span class="cmd">xattr -cr /Applications/${app.name}.app</span>
          <span class="copy-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
        </div>
      </div>` : ""}
    `;

    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("visible"));

    overlay.onclick = (e) => {
      if (e.target === overlay || e.target.closest("[data-action='close-modal']")) {
        closeModal();
      }
      if (e.target.closest("[data-copy]")) {
        const cmd = e.target.closest("[data-copy]").dataset.copy;
        copyToClipboard(cmd);
      }
      if (e.target.closest("[data-action='copy-and-close']")) {
        const cmd = e.target.closest("[data-action='copy-and-close']").dataset.copy;
        copyToClipboard(cmd);
        closeModal();
      }
    };
  }

  function showBuyModal(app) {
    const overlay = $("#modalOverlay");
    const modal = $("#modal");
    const url = getBuyUrl(app);

    modal.innerHTML = `
      <button class="modal-close" data-action="close-modal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="modal-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
      <h3>${app.name}</h3>
      <div class="buy-modal-price">${app.price}</div>
      <p>This is a paid app. You will be redirected to the developer's page to complete your purchase.</p>
      <div class="buy-modal-link">
        <a href="${url}" target="_blank" rel="noopener">${url}</a>
      </div>
      <div class="modal-actions">
        <a class="btn-primary buy-modal-btn" href="${url}" target="_blank" rel="noopener">Go to Purchase Page</a>
      </div>
      <div class="buy-modal-disclaimer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>wvw.dev does not process payments or receive any commission from this purchase. All transactions occur directly on the developer's platform. Responsibility for the product, pricing, refunds, and support belongs entirely to the app owner.</span>
      </div>
    `;

    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("visible"));

    overlay.onclick = (e) => {
      if (e.target === overlay || e.target.closest("[data-action='close-modal']")) {
        closeModal();
      }
    };
  }

  function closeModal() {
    const overlay = $("#modalOverlay");
    overlay.classList.remove("visible");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 300);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast();
    });
  }

  function showToast() {
    const toast = $("#brewToast");
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2000);
  }

  // Event binding
  function bindEvents() {
    $$("[data-app]").forEach((el) => {
      if (el.dataset.boundNav) return;
      el.dataset.boundNav = "1";
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-action='get']")) return;
        if (e.target.closest("a")) return;
        navigate(currentView, el.dataset.app);
      });
    });

    $$("[data-action='get']").forEach((btn) => {
      if (btn.dataset.boundGet) return;
      btn.dataset.boundGet = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const appId = btn.dataset.app;
        const app = data.apps.find((a) => a.id === appId);
        if (!app) return;
        if (isPaidApp(app)) {
          showBuyModal(app);
        } else if (app.brew || app.installCommand) {
          showBrewModal(app);
        } else if (app.homepage) {
          window.open(app.homepage, "_blank");
        } else {
          window.open(app.github, "_blank");
        }
      });
    });

    $$("[data-action='back']").forEach((btn) => {
      if (btn.dataset.boundBack) return;
      btn.dataset.boundBack = "1";
      btn.addEventListener("click", () => navigate(currentView));
    });

    $$("[data-copy]").forEach((el) => {
      if (el.dataset.boundCopy) return;
      el.dataset.boundCopy = "1";
      el.addEventListener("click", () => copyToClipboard(el.dataset.copy));
    });

    $$(".see-all").forEach((el) => {
      if (el.dataset.boundSeeAll) return;
      el.dataset.boundSeeAll = "1";
      el.addEventListener("click", () => navigate(el.dataset.view));
    });

    bindCarousel();
    bindReviewScroll();
  }

  let carouselTimer = null;

  function bindCarousel() {
    const track = $(".carousel-track");
    if (!track) return;
    const slides = $$(".featured-banner", track);
    const dots = $$(".carousel-dot");
    if (slides.length <= 1) return;

    let current = 0;

    function goTo(i) {
      current = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("active", j === current));
    }

    dots.forEach((d) => {
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(parseInt(d.dataset.slide, 10));
        resetAutoplay();
      });
    });

    function resetAutoplay() {
      clearInterval(carouselTimer);
      carouselTimer = setInterval(() => goTo(current + 1), 5000);
    }
    resetAutoplay();

    let touchStartX = 0;
    let touchDeltaX = 0;
    let dragging = false;

    track.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
      dragging = true;
      track.style.transition = "none";
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
      const offset = -(current * 100) + (touchDeltaX / track.offsetWidth) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }, { passive: true });

    track.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
      if (touchDeltaX < -50) goTo(current + 1);
      else if (touchDeltaX > 50) goTo(current - 1);
      else goTo(current);
      resetAutoplay();
    });
  }

  function bindReviewScroll() {
    const wrapper = $(".review-cards-wrapper");
    if (!wrapper) return;
    const track = $(".review-cards", wrapper);
    const leftBtn = $(".review-scroll-left", wrapper);
    const rightBtn = $(".review-scroll-right", wrapper);
    if (!track || !leftBtn || !rightBtn) return;

    function updateButtons() {
      leftBtn.disabled = track.scrollLeft <= 1;
      rightBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    }

    leftBtn.addEventListener("click", () => {
      const card = track.querySelector(".review-card");
      const step = card ? card.offsetWidth + 16 : 300;
      track.scrollBy({ left: -step, behavior: "smooth" });
    });

    rightBtn.addEventListener("click", () => {
      const card = track.querySelector(".review-card");
      const step = card ? card.offsetWidth + 16 : 300;
      track.scrollBy({ left: step, behavior: "smooth" });
    });

    track.addEventListener("scroll", updateButtons, { passive: true });
    updateButtons();
  }

  // Sidebar click
  function bindSidebar() {
    $("#sidebarNav").addEventListener("click", (e) => {
      const item = e.target.closest(".nav-item");
      if (!item) return;
      navigate(item.dataset.view);
      $("#sidebar").classList.remove("open");
      $("#sidebarOverlay").classList.remove("open");
    });
  }

  // Search
  function bindSearch() {
    const input = $("#searchInput");
    let timeout;
    input.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const q = input.value.trim();
        if (q.length > 0) {
          const scroll = $("#contentScroll");
          scroll.scrollTop = 0;
          scroll.innerHTML = renderSearch(q);
          currentApp = null;
          $$(".nav-item").forEach((n) => n.classList.remove("active"));
          bindEvents();
        } else {
          navigate(currentView);
        }
      }, 250);
    });
  }

  // Keyboard shortcuts
  function bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        if (currentApp) navigate(currentView);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        $("#searchInput").focus();
      }
    });
  }

  let storesData = [];

  // Init
  async function init() {
    try {
      const cacheBust = Math.floor(Date.now() / 300000);
      const [appsResp, storesResp] = await Promise.all([
        fetch("apps.json?v=" + cacheBust),
        fetch("stores.json?v=" + cacheBust).catch(() => null),
      ]);
      data = await appsResp.json();
      if (storesResp && storesResp.ok) {
        const rawStores = await storesResp.json();
        const storeMap = {};
        (data.apps || []).forEach((app) => {
          if (!app._source) return;
          const key = app._source;
          if (!storeMap[key]) {
            storeMap[key] = {
              source: key,
              name: app._store || key,
              developer: app._developer || app._owner || "Unknown",
              owner: app._owner || "",
              url: app._storeUrl || "",
              appCount: 0,
              totalStars: 0,
            };
          }
          storeMap[key].appCount++;
          storeMap[key].totalStars += (app.stars || 0);
          if (!storeMap[key].icons) storeMap[key].icons = [];
          if (app.icon && storeMap[key].icons.length < 4) {
            storeMap[key].icons.push({ icon: app.icon, iconStyle: app.iconStyle });
          }
        });
        storesData = Object.values(storeMap);
      }
    } catch {
      $("#contentScroll").innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Failed to load apps</h3>
          <p>Could not fetch apps.json. Make sure the file exists.</p>
        </div>`;
      return;
    }

    buildSidebar();
    window.addEventListener("popstate", onPopState);

    const hashRoute = parseHash();
    if (hashRoute) {
      history.replaceState(null, "", buildPath(hashRoute.view, hashRoute.appId));
      navigate(hashRoute.view || "discover", hashRoute.appId || null, true);
    } else {
      const initial = parsePath();
      navigate(initial.view || "discover", initial.appId || null, true);
    }

    bindSidebar();
    bindSearch();
    bindKeyboard();
    bindThemeToggle();
    bindAbout();
    bindMobileMenu();
  }

  function updateMobileTopbar() {
    const menuBtn = $("#mobileMenuBtn");
    const backBtn = $("#mobileBackBtn");
    if (!menuBtn || !backBtn) return;

    if (currentApp) {
      menuBtn.style.display = "none";
      backBtn.style.display = "flex";
    } else {
      menuBtn.style.display = "flex";
      backBtn.style.display = "none";
    }
  }

  function bindMobileMenu() {
    const menuBtn = $("#mobileMenuBtn");
    const backBtn = $("#mobileBackBtn");
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");
    if (!menuBtn || !sidebar || !overlay) return;

    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("open");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    });

    backBtn.addEventListener("click", () => {
      navigate(currentView);
    });
  }

  function bindThemeToggle() {
    const btn = $("#themeToggle");
    const label = btn.querySelector(".theme-label");

    function updateLabel() {
      const current = document.documentElement.getAttribute("data-theme");
      label.textContent = current === "dark" ? "Light Mode" : "Dark Mode";
    }
    updateLabel();

    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateLabel();
      navigate(currentView, currentApp);
    });
  }

  function bindAbout() {
    $("#aboutBtn").addEventListener("click", () => {
      const overlay = $("#modalOverlay");
      const modal = $("#modal");
      const repoCount = data._sources ? data._sources.length : "multiple";
      const appCount = data.apps ? data.apps.length : 0;

      modal.innerHTML = `
        <button class="modal-close" data-action="close-modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <img src="logo.png" style="width:64px;height:64px;border-radius:16px">
          <div>
            <h3 style="margin:0">World Vibe Web</h3>
            <div style="font-size:13px;color:var(--text-secondary)">The distributed app store</div>
          </div>
        </div>
        <p>World Vibe Web aggregates vibe-coded apps from across GitHub into one browsable catalog. Anyone with an <a href="https://github.com/f/appetit" target="_blank" rel="noopener" style="color:var(--accent)">Appétit</a>-compatible <code style="font-size:12px;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">apps.json</code> in their repo can be listed.</p>
        <p style="margin-bottom:20px">Currently serving <strong>${appCount} apps</strong> from community repos. A GitHub Action rebuilds the catalog every 6 hours.</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <a href="https://github.com/f/wvw.dev" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            View on GitHub
          </a>
          <a href="https://github.com/f/appetit" target="_blank" rel="noopener" class="btn-secondary" style="text-decoration:none">
            Add your apps with Appétit
          </a>
        </div>`;

      overlay.style.display = "flex";
      requestAnimationFrame(() => overlay.classList.add("visible"));

      overlay.onclick = (e) => {
        if (e.target === overlay || e.target.closest("[data-action='close-modal']")) {
          closeModal();
        }
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
