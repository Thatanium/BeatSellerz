// BeatSellerz proto (sans services tiers)
// - Navigation: hash router (#/beat/:id, #/dashboard, #/admin, etc.)
// - Persistance: localStorage (db + session + cart)

const LS = {
  db: "bs_db_v1",
  session: "bs_session_v1",
  cart: "bs_cart_v1",
};

function isAdmin(u) {
  return u?.role === "admin";
}
function isSeller(u) {
  return Boolean(u?.sellerId) || isAdmin(u);
}

const LICENSES = [
  { id: "mp3", label: "MP3 (lease)", priceMult: 1.0 },
  { id: "wav", label: "WAV (lease)", priceMult: 1.3 },
  { id: "stems", label: "Stems (lease)", priceMult: 1.8 },
  { id: "exclusive", label: "Exclusive", priceMult: 8.0 },
];

const SUBSCRIPTIONS = {
  rapper: {
    title: "Les différents abonnements",
    role: "Rappeur",
    plans: [
      {
        name: "Gratuit",
        price: "0€",
        bullets: ["2 playlists de prods (10) max", "Pubs"],
      },
      {
        name: "Or",
        price: "5€",
        bullets: ["Pas de limite pour les playlists de prods", "Suppression des pubs", "Pouvoir télécharger des prods avec tag (5 par mois)", "Badge “vérifié”"],
      },
      {
        name: "Platine",
        price: "8€",
        bullets: [
          "Mise en avant sur le site",
          "Poster des maquettes",
          "Suppression des pubs",
          "Pouvoir télécharger des prods avec tag et les différentes pistes (10 / mois)",
          "Badge “vérifié”",
          "Accès à certaines prod 24h en avance",
        ],
      },
      {
        name: "Platine +",
        price: "15€",
        bullets: [
          "Tout Platine",
          "Mise en avant sur insta",
          "Mise en avant sur TikTok",
        ],
      },
    ],
    footer: "",
  },
  beatmaker: {
    title: "Les différents abonnements",
    role: "Beatmaker",
    plans: [
      {
        name: "Gratuit",
        price: "0€",
        bullets: ["10 uploads (comptabilisés même si supprimés)", "10% de commission par vente", "Pubs", "Que par mp3"],
      },
      {
        name: "Or",
        price: "10€",
        bullets: [
          "5% de commission par vente",
          "Suppression des pubs",
          "15 uploads par mois (comptabilisés même si supprimés)",
          "Possibilité de vendre des drumkits (5% de com)",
          "Que par mp3 et wav",
          "Badge “vérifié”",
        ],
      },
      {
        name: "Platine",
        price: "15€",
        bullets: [
          "Pas de commission par vente",
          "Suppression des pubs",
          "Plus de limite d’upload",
          "Une mise en avant sur le site",
          "Possibilité de vendre des drumkits",
          "Mp3 wav et stems (pistes)",
        ],
      },
      {
        name: "Platine +",
        price: "20€",
        bullets: [
          "Tout Platine",
          "Mise en avant sur insta",
          "Mise en avant sur TikTok",
          "Accès stats",
        ],
      },
    ],
    footer: "",
  },
};

function parseEuro(priceLabel) {
  const n = Number(String(priceLabel).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function seedDb() {
  const sellers = [
    { id: "s1", displayName: "7AM Beats", bio: "Trap / Drill. Payout rapide, vibes sombres.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20 },
    { id: "s2", displayName: "Neon Keys", bio: "New Jazz & vibes smooth. Propre et moderne.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12 },
    { id: "s3", displayName: "Dusty Tape", bio: "Boom bap vintage. Samples & drums qui claquent.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
  ];

  const beats = [
    { id: "b1", sellerId: "s1", title: "Midnight Run", genre: "Trap", bpm: 142, key: "F#m", basePrice: 29, likes: 1284, approved: true, tags: ["dark", "808", "club"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8 },
    { id: "b2", sellerId: "s1", title: "Cold Streets", genre: "Drill", bpm: 140, key: "Dm", basePrice: 35, likes: 980, approved: true, tags: ["uk", "aggressive"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10 },
    { id: "b3", sellerId: "s3", title: "Dusty Tape", genre: "Boom Bap", bpm: 92, key: "Am", basePrice: 25, likes: 756, approved: true, tags: ["vintage", "samples"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15 },
    { id: "b4", sellerId: "s2", title: "Night Bloom", genre: "Jazz", bpm: 84, key: "Cmaj", basePrice: 30, likes: 611, approved: true, tags: ["smooth", "keys"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
    { id: "b5", sellerId: "s2", title: "Neon Keys", genre: "New Jazz", bpm: 98, key: "Gm", basePrice: 33, likes: 544, approved: true, tags: ["modern", "chill"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
    { id: "b6", sellerId: "s1", title: "Stadium Heat", genre: "Rock", bpm: 120, key: "E", basePrice: 29, likes: 512, approved: false, tags: ["guitar", "energy"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1 },
  ];

  const playlists = [
    { id: "p1", title: "Les plus upvotés (Trap)", genre: "Trap", vibe: "Aggressive", beatIds: ["b1"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4 },
    { id: "p2", title: "Drill Essentials", genre: "Drill", vibe: "Dark", beatIds: ["b2"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6 },
    { id: "p3", title: "Boom Bap Classics", genre: "Boom Bap", vibe: "Vintage", beatIds: ["b3"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 11 },
    { id: "p4", title: "Jazz Rap Nights", genre: "Jazz", vibe: "Smooth", beatIds: ["b4"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
    { id: "p5", title: "New Jazz Waves", genre: "New Jazz", vibe: "Modern", beatIds: ["b5"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
  ];

  // Users: proto only (password stored in plain text; do not do this in production)
  const users = [
    { id: "u_admin", email: "admin@beatsellerz.local", password: "admin", displayName: "Admin", role: "admin", sellerId: null, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, purchases: [], favorites: [] },
    { id: "u_seller1", email: "seller@beatsellerz.local", password: "seller", displayName: "7AM Beats", role: "buyer", sellerId: "s1", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22, purchases: [], favorites: [] },
    { id: "u_buyer1", email: "buyer@beatsellerz.local", password: "buyer", displayName: "Buyer", role: "buyer", sellerId: null, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9, purchases: [], favorites: [] },
  ];

  const orders = [];
  const payouts = []; // simulated payouts / earnings
  const notifications = [
    { id: "n1", userId: "u_buyer1", message: "Bienvenue sur BeatSellerz (proto) — teste le panier et la bibliothèque.", createdAt: Date.now() - 1000 * 60 * 60 * 6, read: false },
    { id: "n2", userId: "u_seller1", message: "Astuce: crée un beat puis demande à l’admin de l’approuver.", createdAt: Date.now() - 1000 * 60 * 60 * 5, read: false },
    { id: "n3", userId: "u_admin", message: "Modération: un beat est en review (teste #/admin).", createdAt: Date.now() - 1000 * 60 * 60 * 4, read: false },
  ];

  return { sellers, beats, playlists, users, orders, payouts, notifications };
}

function loadDb() {
  const raw = localStorage.getItem(LS.db);
  if (!raw) {
    const db = seedDb();
    localStorage.setItem(LS.db, JSON.stringify(db));
    return db;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const db = seedDb();
    localStorage.setItem(LS.db, JSON.stringify(db));
    return db;
  }
}

function saveDb(db) {
  localStorage.setItem(LS.db, JSON.stringify(db));
}

function addNotification(db, userId, message) {
  if (!db.notifications) db.notifications = [];
  db.notifications.push({ id: uid("n"), userId, message, createdAt: Date.now(), read: false });
}

function loadSession() {
  const raw = localStorage.getItem(LS.session);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session) localStorage.removeItem(LS.session);
  else localStorage.setItem(LS.session, JSON.stringify(session));
}

function loadCart() {
  const raw = localStorage.getItem(LS.cart);
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(LS.cart, JSON.stringify(cart));
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function $(sel) {
  return document.querySelector(sel);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(n) {
  try {
    return new Intl.NumberFormat("fr-FR").format(n);
  } catch {
    return String(n);
  }
}

function moneyEUR(n) {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
  } catch {
    return `${n}€`;
  }
}

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-on");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("is-on"), 1300);
}

function iconUpvote() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 3 12h6v10h6V12h6L12 2Z"></path>
    </svg>
  `;
}

function route() {
  const h = (location.hash || "#/").slice(1); // "/..."
  const [pathPart, queryPart] = h.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const query = new URLSearchParams(queryPart || "");
  return { parts, query, raw: h };
}

function setTitle(t) {
  const el = $("#pageTitle");
  if (el) el.textContent = t;
}

function updateCartBadge() {
  const cart = loadCart();
  const el = $("#cartBadge");
  if (el) el.textContent = String(cart.length);
}

function getSessionUser(db) {
  const s = loadSession();
  if (!s?.userId) return null;
  return db.users.find((u) => u.id === s.userId) || null;
}

function requireAuth(db) {
  const u = getSessionUser(db);
  if (!u) {
    openAuthModal("login");
    throw new Error("AUTH_REQUIRED");
  }
  return u;
}

function findSeller(db, sellerId) {
  return db.sellers.find((s) => s.id === sellerId) || null;
}

function findBeat(db, beatId) {
  return db.beats.find((b) => b.id === beatId) || null;
}

function calcLicensePrice(beat, licenseId) {
  const lic = LICENSES.find((l) => l.id === licenseId) || LICENSES[0];
  const raw = Math.round(beat.basePrice * lic.priceMult);
  return Math.max(5, raw);
}

function cartTotal(db, cart) {
  return cart.reduce((sum, it) => {
    const beat = findBeat(db, it.beatId);
    if (!beat) return sum;
    return sum + calcLicensePrice(beat, it.licenseId);
  }, 0);
}

function renderHome(db, ui) {
  setTitle("Sellerz");
  const beats = db.beats
    .filter((b) => b.approved)
    .filter((b) => (!ui.genre ? true : b.genre === ui.genre))
    .filter((b) => {
      const q = ui.query.trim().toLowerCase();
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        String(b.bpm).includes(q) ||
        b.key.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 12);

  const playlists = db.playlists
    .filter((p) => (!ui.genre ? true : p.genre === ui.genre))
    .filter((p) => {
      const q = ui.query.trim().toLowerCase();
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.vibe.toLowerCase().includes(q);
    })
    .slice(0, 12);

  return `
    <div class="view">
      <div class="section">
        <div class="section__header">
          <h2 class="section__title">Les plus upvotés</h2>
          <div class="section__actions">
            <button class="chev" data-scroll="upvoted" data-dir="-1" aria-label="Scroll gauche"><span aria-hidden="true">‹‹</span></button>
            <button class="chev" data-scroll="upvoted" data-dir="1" aria-label="Scroll droite"><span aria-hidden="true">››</span></button>
          </div>
        </div>
        <div class="rail" id="rail-upvoted">${beats.map((b) => renderBeatCard(db, b)).join("")}</div>
      </div>

      <div class="section">
        <div class="section__header">
          <h2 class="section__title">Playlists</h2>
          <div class="section__actions">
            <button class="chev" data-scroll="playlists" data-dir="-1" aria-label="Scroll gauche"><span aria-hidden="true">‹‹</span></button>
            <button class="chev" data-scroll="playlists" data-dir="1" aria-label="Scroll droite"><span aria-hidden="true">››</span></button>
          </div>
        </div>
        <div class="rail" id="rail-playlists">${playlists.map((p) => renderPlaylistCard(p)).join("")}</div>
      </div>

      <div class="section">
        <div class="section__header">
          <h2 class="section__title">Le feed</h2>
          <div class="section__actions">
            <button class="chev" data-scroll="feed" data-dir="-1" aria-label="Scroll gauche"><span aria-hidden="true">‹‹</span></button>
            <button class="chev" data-scroll="feed" data-dir="1" aria-label="Scroll droite"><span aria-hidden="true">››</span></button>
          </div>
        </div>
        <div class="rail" id="rail-upvoted">${beats.map((b) => renderBeatCard(db, b)).join("")}</div>
      </div>

    </div>
  `;
}

function renderBeatCard(db, b) {
  const seller = findSeller(db, b.sellerId);
  const sellerName = seller ? seller.displayName : "Seller";
  return `
    <a class="card" href="#/beat/${encodeURIComponent(b.id)}" aria-label="Ouvrir beat ${escapeHtml(b.title)}">
      <div class="card__glow"></div>
      <div class="card__body">
        <div>
          <div class="card__title">${escapeHtml(b.genre)} — ${escapeHtml(b.title)}</div>
          <div class="card__meta">
            <span>${escapeHtml(sellerName)}</span>
            <span>${b.bpm} BPM</span>
            <span>${escapeHtml(b.key)}</span>
          </div>
        </div>
        <div class="card__meta" style="justify-content:space-between; align-items:center">
          <span class="badge">${iconUpvote()} ${formatNumber(b.likes)}</span>
          <span class="badge">À partir de ${moneyEUR(b.basePrice)}</span>
        </div>
      </div>
    </a>
  `;
}

function renderPlaylistCard(p) {
  return `
    <a class="card" href="#/playlist/${encodeURIComponent(p.id)}" aria-label="Ouvrir playlist ${escapeHtml(p.title)}">
      <div class="card__glow"></div>
      <div class="card__body">
        <div>
          <div class="card__title">${escapeHtml(p.title)}</div>
          <div class="card__meta">
            <span>${escapeHtml(p.genre)}</span>
            <span>${escapeHtml(p.vibe)}</span>
            <span>${p.beatIds.length} beats</span>
          </div>
        </div>
        <div class="card__meta" style="justify-content:flex-end"><span class="badge">Ouvrir</span></div>
      </div>
    </a>
  `;
}

function renderBeatPage(db, beatId) {
  const beat = findBeat(db, beatId);
  if (!beat || (!beat.approved && !isAdmin(getSessionUser(db)) && getSessionUser(db)?.sellerId !== beat.sellerId)) {
    setTitle("Beat introuvable");
    return `
      <div class="view">
        <div class="panel">
          <div class="crumbs"><a href="#/">Accueil</a> / Beat</div>
          <div class="h1">Introuvable</div>
          <p class="sub">Ce beat n’existe pas (ou n’est pas encore approuvé).</p>
          <div class="stack"><a class="btn btn--primary" href="#/">Retour</a></div>
        </div>
      </div>
    `;
  }
  const seller = findSeller(db, beat.sellerId);
  const sellerName = seller ? seller.displayName : "Seller";
  const u = getSessionUser(db);
  const isFav = u?.favorites?.includes?.(beat.id);
  setTitle(beat.title);
  const licenseOptions = LICENSES.map((l) => {
    const price = calcLicensePrice(beat, l.id);
    return `<option value="${l.id}">${escapeHtml(l.label)} — ${moneyEUR(price)}</option>`;
  }).join("");
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / <span>${escapeHtml(beat.genre)}</span> / Beat</div>
          <div class="h1">${escapeHtml(beat.title)}</div>
          <p class="sub">
            Par <a href="#/seller/${encodeURIComponent(beat.sellerId)}"><b>${escapeHtml(sellerName)}</b></a>
            · ${beat.bpm} BPM · ${escapeHtml(beat.key)} · ${iconUpvote()} ${formatNumber(beat.likes)}
          </p>
          <div class="stack" style="margin-top:10px">
            ${beat.tags.map((t) => `<span class="pillTag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
        <div class="stack">
          <button class="btn" data-like="${beat.id}">Upvote</button>
          <button class="btn" data-fav="${beat.id}">${isFav ? "Unfav" : "Favori"}</button>
          <a class="btn" href="#/cart">Voir panier</a>
        </div>
      </div>

      <div class="grid2">
        <div class="panel">
          <div class="panel__title">Preview (proto)</div>
          <p class="sub" style="margin-top:0">
            Ici, dans la vraie version, on met un lecteur audio + waveform + markers.
          </p>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Licences disponibles</div>
              <div class="row__meta">Prix calculés depuis le “base price”</div>
            </div>
            <div class="stack">
              <select class="select" id="licenseSelect">${licenseOptions}</select>
              <button class="btn btn--primary" data-add-to-cart="${beat.id}">Ajouter au panier</button>
            </div>
          </div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Base price</div>
              <div class="row__meta">Le seller règle ce prix dans le dashboard</div>
            </div>
            <div class="pillTag">${moneyEUR(beat.basePrice)}</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel__title">Infos seller</div>
          <p class="sub" style="margin-top:0">${escapeHtml(seller?.bio || "—")}</p>
          <div class="stack">
            <a class="btn btn--primary" href="#/seller/${encodeURIComponent(beat.sellerId)}">Voir profil</a>
            <button class="btn" data-toast="Contact (à faire)">Contacter</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSellerPage(db, sellerId) {
  const seller = findSeller(db, sellerId);
  if (!seller) {
    setTitle("Seller introuvable");
    return `<div class="view"><div class="panel"><div class="h1">Seller introuvable</div><a class="btn btn--primary" href="#/">Retour</a></div></div>`;
  }
  setTitle(seller.displayName);
  const beats = db.beats
    .filter((b) => b.sellerId === sellerId)
    .filter((b) => (b.approved ? true : isAdmin(getSessionUser(db)) || getSessionUser(db)?.sellerId === sellerId))
    .sort((a, b) => b.createdAt - a.createdAt);

  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Seller</div>
          <div class="h1">${escapeHtml(seller.displayName)}</div>
          <p class="sub">${escapeHtml(seller.bio)}</p>
        </div>
        <div class="stack">
          <button class="btn" data-toast="Follow (proto)">Suivre</button>
          <button class="btn btn--primary" data-toast="Message (proto)">Message</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">Beats</div>
        <div class="rail">
          ${beats.map((b) => renderBeatCard(db, b)).join("") || `<p class="sub">Aucun beat pour l’instant.</p>`}
        </div>
      </div>
    </div>
  `;
}

function renderPlaylistPage(db, playlistId) {
  const pl = db.playlists.find((p) => p.id === playlistId) || null;
  if (!pl) {
    setTitle("Playlist introuvable");
    return `<div class="view"><div class="panel"><div class="h1">Playlist introuvable</div><a class="btn btn--primary" href="#/">Retour</a></div></div>`;
  }
  setTitle(pl.title);
  const beats = pl.beatIds.map((id) => findBeat(db, id)).filter(Boolean).filter((b) => b.approved);
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Playlist</div>
          <div class="h1">${escapeHtml(pl.title)}</div>
          <p class="sub">${escapeHtml(pl.genre)} · ${escapeHtml(pl.vibe)} · ${beats.length} beats</p>
        </div>
        <div class="stack">
          <button class="btn" data-toast="Lecture (proto)">Lecture</button>
          <a class="btn btn--primary" href="#/">Explorer</a>
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">Beats</div>
        <div class="rail">${beats.map((b) => renderBeatCard(db, b)).join("")}</div>
      </div>
    </div>
  `;
}

function renderCartPage(db) {
  setTitle("Panier");
  const cart = loadCart();
  const rows = cart
    .map((it) => {
      const beat = findBeat(db, it.beatId);
      if (!beat) return "";
      const seller = findSeller(db, beat.sellerId);
      const price = calcLicensePrice(beat, it.licenseId);
      const lic = LICENSES.find((l) => l.id === it.licenseId);
      return `
        <tr>
          <td>
            <div style="display:flex; flex-direction:column; gap:4px">
              <b>${escapeHtml(beat.title)}</b>
              <span class="muted">${escapeHtml(beat.genre)} · ${beat.bpm} BPM · ${escapeHtml(beat.key)} · ${escapeHtml(seller?.displayName || "Seller")}</span>
            </div>
          </td>
          <td><span class="pillTag">${escapeHtml(lic?.label || it.licenseId)}</span></td>
          <td><b>${moneyEUR(price)}</b></td>
          <td><button class="btn btn--small btn--danger" data-remove-cart="${escapeHtml(it.id)}">Retirer</button></td>
        </tr>
      `;
    })
    .filter(Boolean)
    .join("");

  const total = cartTotal(db, cart);
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Panier</div>
          <div class="h1">Panier</div>
          <p class="sub">Proto: le checkout génère une commande locale (pas de paiement réel).</p>
        </div>
        <div class="stack">
          <a class="btn" href="#/">Continuer</a>
          <a class="btn btn--primary" href="#/checkout">Checkout</a>
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">Articles</div>
        ${
          cart.length
            ? `<table class="table"><thead><tr><th>Beat</th><th>Licence</th><th>Prix</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
            : `<p class="sub">Ton panier est vide. Ajoute un beat depuis l’accueil.</p>`
        }
      </div>

      <div class="panel">
        <div class="row">
          <div class="row__main">
            <div class="row__title">Total</div>
            <div class="row__meta">Hors frais (proto)</div>
          </div>
          <div class="stack">
            <span class="pillTag">${moneyEUR(total)}</span>
            <a class="btn btn--primary" href="#/checkout">Payer (simulé)</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCheckoutPage(db) {
  setTitle("Checkout");
  const cart = loadCart();
  const total = cartTotal(db, cart);
  const u = getSessionUser(db);
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Checkout</div>
          <div class="h1">Checkout</div>
          <p class="sub">Paiement simulé. En prod: Stripe + Stripe Connect.</p>
        </div>
        <div class="stack">
          <a class="btn" href="#/cart">Retour panier</a>
        </div>
      </div>

      <div class="grid2">
        <div class="panel">
          <div class="panel__title">Acheteur</div>
          ${
            u
              ? `<p class="sub" style="margin-top:0">Connecté en tant que <b>${escapeHtml(u.displayName)}</b> (${escapeHtml(u.email)}).</p>
                 <div class="stack"><button class="btn" data-open-auth>Gérer compte</button></div>`
              : `<p class="sub" style="margin-top:0">Connecte-toi pour “acheter” et voir l’historique.</p>
                 <div class="stack"><button class="btn btn--primary" data-open-auth>Se connecter</button></div>`
          }
        </div>
        <div class="panel">
          <div class="panel__title">Résumé</div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Articles</div>
              <div class="row__meta">${cart.length} item(s)</div>
            </div>
            <span class="pillTag">${moneyEUR(total)}</span>
          </div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Paiement</div>
              <div class="row__meta">Simulé</div>
            </div>
            <button class="btn btn--primary" data-place-order ${cart.length ? "" : "disabled"}>Valider</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLibraryPage(db) {
  const u = requireAuth(db);
  setTitle("Bibliothèque");
  const purchases = (u.purchases || []).slice().reverse();
  const items = purchases
    .map((p) => {
      const beat = findBeat(db, p.beatId);
      const lic = LICENSES.find((l) => l.id === p.licenseId);
      if (!beat) return "";
      const seller = findSeller(db, beat.sellerId);
      return `
        <tr>
          <td><a href="#/beat/${encodeURIComponent(beat.id)}"><b>${escapeHtml(beat.title)}</b></a><div class="muted">${escapeHtml(beat.genre)} · ${beat.bpm} BPM · ${escapeHtml(beat.key)}</div></td>
          <td>${escapeHtml(seller?.displayName || "Seller")}</td>
          <td><span class="pillTag">${escapeHtml(lic?.label || p.licenseId)}</span></td>
          <td style="white-space:nowrap">
            <button class="btn btn--small btn--primary" data-download="${escapeHtml(beat.id)}" data-license="${escapeHtml(p.licenseId)}">Download</button>
          </td>
        </tr>
      `;
    })
    .filter(Boolean)
    .join("");

  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Bibliothèque</div>
          <div class="h1">Bibliothèque</div>
          <p class="sub">Tes achats (proto). En prod: liens signés + reçus + factures.</p>
        </div>
        <div class="stack">
          <a class="btn" href="#/">Explorer</a>
        </div>
      </div>
      <div class="panel">
        <div class="panel__title">Achats</div>
        ${
          purchases.length
            ? `<table class="table"><thead><tr><th>Beat</th><th>Seller</th><th>Licence</th><th></th></tr></thead><tbody>${items}</tbody></table>`
            : `<p class="sub">Aucun achat. Fais un checkout pour remplir ta bibliothèque.</p>`
        }
      </div>
    </div>
  `;
}

function renderFavoritesPage(db) {
  const u = requireAuth(db);
  setTitle("Favoris");
  const fav = (u.favorites || []).slice().reverse();
  const beats = fav.map((id) => findBeat(db, id)).filter(Boolean).filter((b) => b.approved);
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Favoris</div>
          <div class="h1">Favoris</div>
          <p class="sub">Beats que tu as mis en favoris (proto).</p>
        </div>
        <div class="stack">
          <a class="btn" href="#/">Explorer</a>
        </div>
      </div>
      <div class="panel">
        <div class="panel__title">Beats</div>
        <div class="rail">
          ${beats.map((b) => renderBeatCard(db, b)).join("") || `<p class="sub">Aucun favori. Ajoute-en depuis une fiche beat.</p>`}
        </div>
      </div>
    </div>
  `;
}

function renderClientPage(db) {
  const u = requireAuth(db);
  setTitle("Espace client");
  const seller = u.sellerId ? findSeller(db, u.sellerId) : null;
  const sub = u.subscription?.status === "active_simulated" ? `${u.subscription.type} — ${u.subscription.plan}` : "Aucun";
  const purchases = (u.purchases || []).length;
  const favorites = (u.favorites || []).length;

  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Espace client</div>
          <div class="h1">Espace client</div>
          <p class="sub">Infos générales de ton compte + actions rapides.</p>
        </div>
        <div class="stack">
          <button class="btn" data-open-auth>Gérer compte</button>
          <button class="btn btn--danger" data-logout>Déconnexion</button>
        </div>
      </div>

      <div class="grid2">
        <div class="panel">
          <div class="panel__title">Profil</div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">${escapeHtml(u.displayName)}</div>
              <div class="row__meta">${escapeHtml(u.email)}</div>
            </div>
            <button class="btn btn--small" data-edit-profile>Modifier</button>
          </div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Abonnement</div>
              <div class="row__meta">${escapeHtml(sub)}</div>
            </div>
            <a class="btn btn--small btn--primary" href="#/subscriptions">Voir offres</a>
          </div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Bibliothèque</div>
              <div class="row__meta">${purchases} achat(s)</div>
            </div>
            <a class="btn btn--small" href="#/library">Ouvrir</a>
          </div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">Favoris</div>
              <div class="row__meta">${favorites} beat(s)</div>
            </div>
            <a class="btn btn--small" href="#/favorites">Ouvrir</a>
          </div>
        </div>

        <div class="panel">
          <div class="panel__title">Seller</div>
          ${
            isSeller(u)
              ? `
                <p class="sub" style="margin-top:0">Statut: <b>seller actif</b></p>
                <div class="row">
                  <div class="row__main">
                    <div class="row__title">${escapeHtml(seller?.displayName || "Profil seller")}</div>
                    <div class="row__meta">${escapeHtml(seller?.bio || "—")}</div>
                  </div>
                  <a class="btn btn--small btn--primary" href="#/dashboard">Dashboard</a>
                </div>
              `
              : `
                <p class="sub" style="margin-top:0">Active le mode seller pour vendre avec le même compte.</p>
                <div class="stack">
                  <button class="btn btn--primary" data-enable-seller>Activer seller</button>
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function renderNotificationsPage(db) {
  const u = requireAuth(db);
  setTitle("Notifications");
  const list = (db.notifications || [])
    .filter((n) => n.userId === u.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const rows = list
    .map(
      (n) => `
        <tr>
          <td>
            <div style="display:flex; flex-direction:column; gap:4px">
              <b>${escapeHtml(n.message)}</b>
              <span class="muted">${new Date(n.createdAt).toLocaleString("fr-FR")}</span>
            </div>
          </td>
          <td style="white-space:nowrap">
            <button class="btn btn--small" data-mark-read="${escapeHtml(n.id)}">${n.read ? "Lu" : "Marquer lu"}</button>
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Notifications</div>
          <div class="h1">Notifications</div>
          <p class="sub">Achats, modération, ventes (simulés).</p>
        </div>
        <div class="stack">
          <button class="btn" data-mark-all-read>Tout marquer lu</button>
        </div>
      </div>
      <div class="panel">
        <div class="panel__title">Inbox</div>
        ${
          list.length
            ? `<table class="table"><thead><tr><th>Notification</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
            : `<p class="sub">Aucune notification.</p>`
        }
      </div>
    </div>
  `;
}

function renderWaveformPage() {
  setTitle("Waveform");
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Waveform</div>
          <div class="h1">Waveform</div>
          <p class="sub">Démo: waveform animée (proto). En prod: vraie waveform sur l’audio.</p>
        </div>
        <div class="stack">
          <button class="btn btn--primary" data-wave-toggle>Play / Pause</button>
          <button class="btn" data-wave-random>Randomiser</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">Lecteur (proto)</div>
        <canvas id="waveCanvas" width="1100" height="220" style="width:100%; height:220px; border-radius:18px; background: rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.08)"></canvas>
        <div class="row" style="margin-top:10px">
          <div class="row__main">
            <div class="row__title">Position</div>
            <div class="row__meta">Glisse pour simuler</div>
          </div>
          <input id="waveSeek" type="range" min="0" max="1000" value="120" style="width:min(520px, 100%)" />
        </div>
      </div>
    </div>
  `;
}

function renderSubscriptionsPage(db, type = "beatmaker") {
  setTitle("Abonnements");
  const t = type === "rapper" ? "rapper" : "beatmaker";
  const model = SUBSCRIPTIONS[t];
  const featuredIdx = 2;
  const featuredLabels = { rapper: "Populaire", beatmaker: "Meilleur deal" };

  const tabs = `
    <div class="subTabs" role="tablist" aria-label="Choisir type d’abonnement">
      <div class="subTabsInner">
        <a class="tab ${t === "rapper" ? "is-on" : ""}" role="tab" href="#/subscriptions?type=rapper">Rappeur</a>
        <a class="tab ${t === "beatmaker" ? "is-on" : ""}" role="tab" href="#/subscriptions?type=beatmaker">Beatmaker</a>
      </div>
    </div>
  `;

  const cols = model.plans.map((p, i) => {
    const isFeatured = i === featuredIdx;
    const priceNum = p.price.replace("€", "");
    return `
      <div class="subCol${isFeatured ? " is-featured" : ""}">
        ${isFeatured ? `<div class="subBadge">${escapeHtml(featuredLabels[t])}</div>` : ""}
        <div class="subPlan">${escapeHtml(p.name)}</div>
        <div class="subPriceNum">${escapeHtml(priceNum)}€</div>
        <div class="subPriceUnit">/mois</div>
        <div class="subDivider"></div>
        <ul class="subList">
          ${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
        </ul>
        <a class="subPrice priceBtn" href="#/subscribe-checkout?type=${encodeURIComponent(t)}&plan=${encodeURIComponent(p.name)}" aria-label="Choisir ${escapeHtml(p.name)} ${escapeHtml(p.price)}">
          ${isFeatured ? `Choisir ${escapeHtml(p.name)}` : "S’abonner"}
        </a>
      </div>
    `;
  }).join("");

  return `
    <div class="view">
      <div class="subWrap">
        <h2 class="subTitle">${escapeHtml(model.title)}</h2>
        ${tabs}
        <div class="subCols">${cols}</div>
      </div>
      ${model.footer ? `<div class="subFooter">${escapeHtml(model.footer)}</div>` : ``}
    </div>
  `;
}

function renderSubscribeCheckoutPage(db, type, planName) {
  const u = requireAuth(db);
  setTitle("Paiement");
  const t = type === "rapper" ? "rapper" : "beatmaker";
  const model = SUBSCRIPTIONS[t];
  const plan = model.plans.find((p) => p.name === planName) || model.plans[0];
  const amount = parseEuro(plan.price);
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / <a href="#/subscriptions?type=${encodeURIComponent(t)}">Abonnements</a> / Paiement</div>
          <div class="h1>Paiement abonnement (simulé)</div>
          <p class="sub">Connecté: <b>${escapeHtml(u.displayName)}</b> · En prod: Stripe abonnement.</p>
        </div>
      </div>

      <div class="grid2">
        <div class="panel">
          <div class="panel__title">Offre</div>
          <div class="row">
            <div class="row__main">
              <div class="row__title">${escapeHtml(model.role)} — ${escapeHtml(plan.name)}</div>
              <div class="row__meta">${plan.bullets.map(escapeHtml).join(" · ")}</div>
            </div>
            <span class="pillTag">${escapeHtml(plan.price)}/mois</span>
          </div>
          <p class="sub" style="margin-top:10px">Proto: ce bouton enregistre l’abonnement sur ton compte.</p>
        </div>
        <div class="panel">
          <div class="panel__title">Résumé</div>
          <div class="row">
            <div class="row__main">
              <div class="row__title>Total</div>
              <div class="row__meta">Mensuel</div>
            </div>
            <span class="pillTag">${moneyEUR(amount)}</span>
          </div>
          <div class="row">
            <div class="row__main">
              <div class="row__title>Paiement</div>
              <div class="row__meta">Simulé</div>
            </div>
            <button class="btn btn--primary" data-subscribe type="button" data-sub-type="${escapeHtml(t)}" data-sub-plan="${escapeHtml(plan.name)}">Valider</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBecomeSeller(db) {
  setTitle("Devenir seller");
  return `
    <div class="view">
      <div class="panel">
        <div class="crumbs"><a href="#/">Accueil</a> / Devenir seller</div>
        <div class="h1">Devenir seller</div>
        <p class="sub">
          Proto sans tiers: on crée un compte “seller” local et un profil public.
          En prod: onboarding Stripe Connect + KYC + payouts.
        </p>
        <div class="stack">
          <button class="btn btn--primary" data-open-seller-modal>Créer un profil seller</button>
          <button class="btn" data-open-auth>Créer un compte / se connecter</button>
        </div>
        <p class="sub" style="margin-top:10px">
          Comptes de test: <b>seller@beatsellerz.local</b> / <b>seller</b> · <b>buyer@beatsellerz.local</b> / <b>buyer</b> · <b>admin@beatsellerz.local</b> / <b>admin</b>
        </p>
      </div>
    </div>
  `;
}

function renderDashboard(db) {
  const u = requireAuth(db);
  if (!isSeller(u)) {
    setTitle("Dashboard");
    return `<div class="view"><div class="panel"><div class="h1">Accès refusé</div><p class="sub">Le dashboard est réservé aux sellers.</p><a class="btn btn--primary" href="#/">Retour</a></div></div>`;
  }
  const sellerId = u.sellerId;
  const seller = sellerId ? findSeller(db, sellerId) : null;
  const beats = db.beats
    .filter((b) => (isAdmin(u) ? true : b.sellerId === sellerId))
    .sort((a, b) => b.createdAt - a.createdAt);

  const orders = db.orders.filter((o) => (isAdmin(u) ? true : o.sellerId === sellerId));
  const revenue = orders.reduce((sum, o) => sum + o.sellerNet, 0);

  setTitle("Dashboard");
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Dashboard</div>
          <div class="h1">Dashboard seller</div>
          <p class="sub">
            ${seller ? `Profil: <b>${escapeHtml(seller.displayName)}</b>` : `Aucun profil seller lié.`}
            · Revenu (simulé): <b>${moneyEUR(revenue)}</b>
          </p>
        </div>
        <div class="stack">
          <button class="btn btn--primary" data-open-create-beat>Ajouter un beat</button>
          <button class="btn" data-toast="Payouts (proto)">Payouts</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">Mes beats</div>
        <table class="table">
          <thead><tr><th>Titre</th><th>Genre</th><th>Prix base</th><th>Upvotes</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            ${
              beats.length
                ? beats
                    .map((b) => {
                      const status = b.approved ? "Publié" : "En review";
                      return `
                        <tr>
                          <td><a href="#/beat/${encodeURIComponent(b.id)}"><b>${escapeHtml(b.title)}</b></a></td>
                          <td>${escapeHtml(b.genre)}</td>
                          <td>${moneyEUR(b.basePrice)}</td>
                          <td>${formatNumber(b.likes)}</td>
                          <td><span class="pillTag">${status}</span></td>
                          <td style="white-space:nowrap">
                            <button class="btn btn--small" data-edit-beat="${escapeHtml(b.id)}">Éditer</button>
                            <button class="btn btn--small btn--danger" data-delete-beat="${escapeHtml(b.id)}">Suppr.</button>
                          </td>
                        </tr>
                      `;
                    })
                    .join("")
                : `<tr><td colspan="6"><p class="muted">Aucun beat. Clique “Ajouter un beat”.</p></td></tr>`
            }
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panel__title">Ventes (simulées)</div>
        ${
          orders.length
            ? `<table class="table"><thead><tr><th>Beat</th><th>Licence</th><th>Montant</th><th>Net seller</th><th>Date</th></tr></thead>
                <tbody>
                  ${orders
                    .slice()
                    .reverse()
                    .slice(0, 8)
                    .map((o) => {
                      const beat = findBeat(db, o.beatId);
                      const lic = LICENSES.find((l) => l.id === o.licenseId);
                      return `
                        <tr>
                          <td>${escapeHtml(beat?.title || o.beatId)}</td>
                          <td>${escapeHtml(lic?.label || o.licenseId)}</td>
                          <td>${moneyEUR(o.amount)}</td>
                          <td>${moneyEUR(o.sellerNet)}</td>
                          <td>${new Date(o.createdAt).toLocaleString("fr-FR")}</td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>`
            : `<p class="sub">Pas encore de ventes. (Teste en ajoutant un beat au panier + checkout).</p>`
        }
      </div>
    </div>
  `;
}

function renderAdmin(db) {
  const u = requireAuth(db);
  if (!isAdmin(u)) {
    setTitle("Admin");
    return `<div class="view"><div class="panel"><div class="h1">Accès refusé</div><p class="sub">Réservé à l’admin.</p><p class="sub">Compte de test: <b>admin@beatsellerz.local</b> / <b>admin</b></p><a class="btn btn--primary" href="#/">Retour</a></div></div>`;
  }
  setTitle("Admin");
  const pending = db.beats.filter((b) => !b.approved);
  const all = db.beats.slice().sort((a, b) => b.createdAt - a.createdAt);
  return `
    <div class="view">
      <div class="view__header">
        <div>
          <div class="crumbs"><a href="#/">Accueil</a> / Admin</div>
          <div class="h1">Admin</div>
          <p class="sub">Modération beats + gestion sellers (proto).</p>
        </div>
        <div class="stack">
          <button class="btn" data-export-db>Exporter DB</button>
          <button class="btn btn--danger" data-reset-db>Reset DB</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">En attente (${pending.length})</div>
        ${
          pending.length
            ? `<table class="table"><thead><tr><th>Beat</th><th>Seller</th><th>Prix</th><th>Action</th></tr></thead><tbody>
                ${pending
                  .map((b) => {
                    const s = findSeller(db, b.sellerId);
                    return `<tr>
                      <td><a href="#/beat/${encodeURIComponent(b.id)}"><b>${escapeHtml(b.title)}</b></a><div class="muted">${escapeHtml(b.genre)} · ${b.bpm} BPM</div></td>
                      <td>${escapeHtml(s?.displayName || b.sellerId)}</td>
                      <td>${moneyEUR(b.basePrice)}</td>
                      <td style="white-space:nowrap">
                        <button class="btn btn--small btn--primary" data-approve="${escapeHtml(b.id)}">Approuver</button>
                        <button class="btn btn--small btn--danger" data-reject="${escapeHtml(b.id)}">Rejeter</button>
                      </td>
                    </tr>`;
                  })
                  .join("")}
              </tbody></table>`
            : `<p class="sub">Rien à modérer.</p>`
        }
      </div>

      <div class="panel">
        <div class="panel__title">Tous les beats</div>
        <table class="table">
          <thead><tr><th>Beat</th><th>Seller</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            ${all
              .slice(0, 25)
              .map((b) => {
                const s = findSeller(db, b.sellerId);
                return `<tr>
                  <td><a href="#/beat/${encodeURIComponent(b.id)}"><b>${escapeHtml(b.title)}</b></a><div class="muted">${escapeHtml(b.genre)} · ${b.bpm} BPM</div></td>
                  <td>${escapeHtml(s?.displayName || b.sellerId)}</td>
                  <td><span class="pillTag">${b.approved ? "Publié" : "Review"}</span></td>
                  <td style="white-space:nowrap">
                    <button class="btn btn--small" data-toggle-approve="${escapeHtml(b.id)}">${b.approved ? "Unpublish" : "Publish"}</button>
                    <button class="btn btn--small btn--danger" data-admin-delete="${escapeHtml(b.id)}">Suppr.</button>
                  </td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderNotFound() {
  setTitle("Introuvable");
  return `<div class="view"><div class="panel"><div class="h1">Introuvable</div><p class="sub">Cette page n’existe pas.</p><a class="btn btn--primary" href="#/">Retour</a></div></div>`;
}

// Seller profile creation modal (existing dialog)
function openSellerModal() {
  const modal = $("#sellerModal");
  if (!modal) return;
  if (typeof modal.showModal === "function") modal.showModal();
  else toast("Modal non supportée");
}
function closeSellerModal() {
  const modal = $("#sellerModal");
  if (!modal) return;
  if (typeof modal.close === "function") modal.close();
}

// Auth modal
let authMode = "login"; // login | register
function openAuthModal(mode = "login") {
  authMode = mode;
  const modal = $("#authModal");
  if (!modal) return;
  syncAuthModal();
  if (typeof modal.showModal === "function") modal.showModal();
  else toast("Modal non supportée");
}
function closeAuthModal() {
  const modal = $("#authModal");
  if (!modal) return;
  if (typeof modal.close === "function") modal.close();
}

function syncAuthModal() {
  const db = loadDb();
  const u = getSessionUser(db);
  const title = $("#authTitle");
  const hint = $("#authHint");
  const toggle = $("#toggleAuthMode");
  const submit = $("#submitAuth");
  const logout = $("#logoutBtn");
  const nameWrap = $("#authDisplayNameWrap");
  const alsoSellerWrap = $("#authAlsoSellerWrap");

  if (u) {
    title.textContent = "Compte";
    hint.textContent = `Connecté: ${u.displayName} (${isSeller(u) ? "buyer + seller" : "buyer"}).`;
    toggle.style.display = "none";
    submit.style.display = "none";
    logout.style.display = "inline-flex";
    nameWrap.style.display = "none";
    alsoSellerWrap.style.display = "none";
    return;
  }

  toggle.style.display = "inline-flex";
  submit.style.display = "inline-flex";
  logout.style.display = "none";

  if (authMode === "login") {
    title.textContent = "Connexion";
    hint.textContent = "Proto local: connecte-toi pour accéder au checkout/dashboard/admin.";
    toggle.textContent = "Créer un compte";
    submit.textContent = "Se connecter";
    nameWrap.style.display = "none";
    alsoSellerWrap.style.display = "none";
  } else {
    title.textContent = "Créer un compte";
    hint.textContent = "Proto local: crée un compte buyer ou seller.";
    toggle.textContent = "J’ai déjà un compte";
    submit.textContent = "Créer";
    nameWrap.style.display = "grid";
    alsoSellerWrap.style.display = "grid";
  }
}

function handleAuthSubmit() {
  const db = loadDb();
  const u = getSessionUser(db);
  if (u) return;

  const email = ($("#authEmail").value || "").trim().toLowerCase();
  const password = ($("#authPassword").value || "").trim();
  if (!email || !password) return toast("Email + mot de passe requis");

  if (authMode === "login") {
    const user = db.users.find((x) => x.email.toLowerCase() === email && x.password === password);
    if (!user) return toast("Identifiants invalides");
    saveSession({ userId: user.id });
    toast(`Connecté: ${user.displayName}`);
    syncAccountBtn();
    closeAuthModal();
    render();
    return;
  }

  // register
  const displayName = ($("#authDisplayName").value || "").trim();
  if (!displayName) return toast("Nom requis");
  if (db.users.some((x) => x.email.toLowerCase() === email)) return toast("Email déjà utilisé");

  const alsoSeller = Boolean($("#authAlsoSeller")?.checked);
  let sellerId = null;
  if (alsoSeller) {
    sellerId = uid("s");
    db.sellers.push({ id: sellerId, displayName, bio: "Bio à compléter depuis l’espace client.", createdAt: Date.now() });
  }
  const user = { id: uid("u"), email, password, displayName, role: "buyer", sellerId, createdAt: Date.now(), purchases: [], favorites: [] };
  db.users.push(user);
  saveDb(db);
  saveSession({ userId: user.id });
  toast("Compte créé");
  syncAccountBtn();
  closeAuthModal();
  location.hash = alsoSeller ? "#/client" : "#/client";
}

function handleLogout() {
  saveSession(null);
  toast("Déconnecté");
  syncAccountBtn();
  closeAuthModal();
  window.location.hash = "#/";
  render();
}

function syncAccountBtn() {
  const db = loadDb();
  const u = getSessionUser(db);
  const btn = $("#accountBtn");
  if (!btn) return;
  // icon button, no text needed; keep for a11y only
}

function addToCart(beatId, licenseId) {
  const cart = loadCart();
  cart.push({ id: uid("c"), beatId, licenseId, createdAt: Date.now() });
  saveCart(cart);
  updateCartBadge();
  toast("Ajouté au panier");
}

function removeFromCart(cartItemId) {
  const cart = loadCart().filter((it) => it.id !== cartItemId);
  saveCart(cart);
  updateCartBadge();
  toast("Retiré");
  render();
}

function placeOrder() {
  const db = loadDb();
  const buyer = requireAuth(db);
  const cart = loadCart();
  if (!cart.length) return toast("Panier vide");

  // Simulated fee model: platform takes 5% + €0 (net)
  const platformFeeRate = 0.05;

  for (const it of cart) {
    const beat = findBeat(db, it.beatId);
    if (!beat || !beat.approved) continue;
    const amount = calcLicensePrice(beat, it.licenseId);
    const platformFee = Math.round(amount * platformFeeRate * 100) / 100;
    const sellerNet = Math.round((amount - platformFee) * 100) / 100;
    db.orders.push({
      id: uid("o"),
      buyerId: buyer.id,
      sellerId: beat.sellerId,
      beatId: beat.id,
      licenseId: it.licenseId,
      amount,
      platformFee,
      sellerNet,
      createdAt: Date.now(),
      status: "paid_simulated",
    });
    buyer.purchases.push({ orderId: db.orders.at(-1).id, beatId: beat.id, licenseId: it.licenseId, createdAt: Date.now() });
    if (!Array.isArray(buyer.favorites)) buyer.favorites = [];
    db.payouts.push({ id: uid("p"), sellerId: beat.sellerId, amount: sellerNet, createdAt: Date.now(), status: "pending_simulated" });

    const sellerUser = db.users.find((u) => u.sellerId === beat.sellerId);
    if (sellerUser) addNotification(db, sellerUser.id, `Nouvelle vente (simulée): ${beat.title} — ${moneyEUR(amount)}.`);
  }

  addNotification(db, buyer.id, `Achat confirmé (simulé): ${cart.length} item(s). Va dans Bibliothèque pour télécharger.`);

  saveDb(db);
  saveCart([]);
  updateCartBadge();
  toast("Commande créée (simulé)");
  location.hash = "#/dashboard";
}

function toggleFavorite(beatId) {
  const db = loadDb();
  const u = requireAuth(db);
  if (!Array.isArray(u.favorites)) u.favorites = [];
  const idx = u.favorites.indexOf(beatId);
  if (idx >= 0) u.favorites.splice(idx, 1);
  else u.favorites.push(beatId);
  saveDb(db);
  toast(idx >= 0 ? "Retiré des favoris" : "Ajouté aux favoris");
  render();
}

function downloadSimulated(db, beatId, licenseId) {
  const u = requireAuth(db);
  const beat = findBeat(db, beatId);
  if (!beat) return toast("Beat introuvable");
  const ok = (u.purchases || []).some((p) => p.beatId === beatId && p.licenseId === licenseId);
  if (!ok) return toast("Achat requis");
  const lic = LICENSES.find((l) => l.id === licenseId);
  const content = [
    `BeatSellerz — Download (PROTO)`,
    ``,
    `Beat: ${beat.title}`,
    `SellerId: ${beat.sellerId}`,
    `Genre: ${beat.genre}`,
    `BPM: ${beat.bpm}`,
    `Key: ${beat.key}`,
    `Licence: ${lic?.label || licenseId}`,
    `Date: ${new Date().toISOString()}`,
    ``,
    `Ceci est un fichier simulé. En prod: WAV/MP3 + stems + PDF licence.`,
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${beat.title.replaceAll(" ", "_")}-${licenseId}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
  toast("Download lancé");
}

function handleLike(beatId) {
  const db = loadDb();
  const beat = findBeat(db, beatId);
  if (!beat) return;
  beat.likes += 1;
  saveDb(db);
  toast("Upvoté");
  render();
}

function approveBeat(beatId, approved) {
  const db = loadDb();
  const u = requireAuth(db);
  if (!isAdmin(u)) return toast("Admin only");
  const beat = findBeat(db, beatId);
  if (!beat) return;
  beat.approved = approved;
  const sellerUser = db.users.find((x) => x.sellerId === beat.sellerId);
  if (sellerUser) addNotification(db, sellerUser.id, approved ? `Beat approuvé: ${beat.title} est maintenant publié.` : `Beat rejeté: ${beat.title}.`);
  saveDb(db);
  toast(approved ? "Publié" : "Rejeté");
  render();
}

function toggleApprove(beatId) {
  const db = loadDb();
  const u = requireAuth(db);
  if (!isAdmin(u)) return toast("Admin only");
  const beat = findBeat(db, beatId);
  if (!beat) return;
  beat.approved = !beat.approved;
  saveDb(db);
  toast(beat.approved ? "Publié" : "Unpublished");
  render();
}

function deleteBeat(beatId, mode = "seller") {
  const db = loadDb();
  const u = requireAuth(db);
  const beat = findBeat(db, beatId);
  if (!beat) return;
  if (mode === "admin") {
    if (!isAdmin(u)) return toast("Admin only");
  } else {
    if (!isSeller(u)) return toast("Seller only");
    if (!isAdmin(u) && u.sellerId !== beat.sellerId) return toast("Pas ton beat");
  }
  db.beats = db.beats.filter((b) => b.id !== beatId);
  saveDb(db);
  toast("Supprimé");
  render();
}

function exportDb() {
  const db = loadDb();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `beatsellers-db-${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function resetDb() {
  localStorage.removeItem(LS.db);
  localStorage.removeItem(LS.session);
  localStorage.removeItem(LS.cart);
  toast("DB reset");
  syncAccountBtn();
  updateCartBadge();
  location.hash = "#/";
  render();
}

// Beat creation/editing: lightweight prompt-based editor (fast for proto)
function openBeatModal(mode, beatId = null) {
  const db = loadDb();
  const u = requireAuth(db);
  if (!isSeller(u)) return toast("Seller only");
  const modal = $("#beatModal");
  if (!modal) return;

  const beat = beatId ? findBeat(db, beatId) : null;
  if (beat && !isAdmin(u) && beat.sellerId !== u.sellerId) return toast("Pas ton beat");

  $("#beatModalTitle").textContent = mode === "edit" ? "Éditer beat" : "Nouveau beat";
  $("#beatModalHint").textContent = mode === "edit" ? "Les modifications repassent en review (proto)." : "Le beat sera en review jusqu’à validation admin (proto).";
  $("#beatId").value = beat?.id || "";
  $("#beatTitle").value = beat?.title || "";
  $("#beatGenre").value = beat?.genre || (window.__uiState?.genre || "Trap");
  $("#beatBpm").value = String(beat?.bpm ?? 140);
  $("#beatKey").value = beat?.key || "F#m";
  $("#beatBasePrice").value = String(beat?.basePrice ?? 29);
  $("#beatTags").value = (beat?.tags || []).join(", ");

  if (typeof modal.showModal === "function") modal.showModal();
  else toast("Modal non supportée");
}

function closeBeatModal() {
  const modal = $("#beatModal");
  if (!modal) return;
  if (typeof modal.close === "function") modal.close();
}

function submitBeatForm() {
  const db = loadDb();
  const u = requireAuth(db);
  if (!isSeller(u)) return;
  const sellerId = u.sellerId;
  if (!sellerId) return toast("Compte seller requis");

  const id = ($("#beatId").value || "").trim();
  const title = ($("#beatTitle").value || "").trim();
  const genre = ($("#beatGenre").value || "").trim();
  const bpm = Number(($("#beatBpm").value || "").trim());
  const key = ($("#beatKey").value || "").trim();
  const basePrice = Number(($("#beatBasePrice").value || "").trim());
  const tags = ($("#beatTags").value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (!title) return toast("Titre requis");
  if (!genre) return toast("Genre requis");
  if (!Number.isFinite(bpm) || bpm <= 0) return toast("BPM invalide");
  if (!key) return toast("Key requis");
  if (!Number.isFinite(basePrice) || basePrice <= 0) return toast("Prix invalide");

  if (id) {
    const beat = findBeat(db, id);
    if (!beat) return toast("Beat introuvable");
    if (!isAdmin(u) && beat.sellerId !== u.sellerId) return toast("Pas ton beat");
    beat.title = title;
    beat.genre = genre;
    beat.bpm = Math.round(bpm);
    beat.key = key;
    beat.basePrice = Math.round(basePrice);
    beat.tags = tags;
    beat.approved = isAdmin(u) ? beat.approved : false;
    if (!isAdmin(u)) addNotification(db, "u_admin", `Beat modifié en review: ${beat.title} (seller ${beat.sellerId}).`);
    saveDb(db);
    closeBeatModal();
    toast("Beat mis à jour");
    render();
    return;
  }

  db.beats.push({
    id: uid("b"),
    sellerId,
    title,
    genre,
    bpm: Math.round(bpm),
    key,
    basePrice: Math.round(basePrice),
    likes: 0,
    approved: isAdmin(u),
    tags,
    createdAt: Date.now(),
  });
  if (!isAdmin(u)) addNotification(db, "u_admin", `Nouveau beat en review: ${title} (seller ${sellerId}).`);
  saveDb(db);
  closeBeatModal();
  toast("Beat créé");
  location.hash = "#/dashboard";
  render();
}

function render() {
  const db = loadDb();
  const ui = window.__uiState || (window.__uiState = { genre: "Trap", query: "" });
  const { parts, query } = route();
  const outlet = $("#outlet");
  if (!outlet) return;

  // keep search visible always; it filters home only
  const search = $("#searchInput");
  if (search) search.value = ui.query;

  let html = "";
  try {
    if (parts.length === 0) html = renderHome(db, ui);
    else if (parts[0] === "beat" && parts[1]) html = renderBeatPage(db, parts[1]);
    else if (parts[0] === "playlist" && parts[1]) html = renderPlaylistPage(db, parts[1]);
    else if (parts[0] === "seller" && parts[1]) html = renderSellerPage(db, parts[1]);
    else if (parts[0] === "cart") html = renderCartPage(db);
    else if (parts[0] === "checkout") html = renderCheckoutPage(db);
    else if (parts[0] === "library") html = renderLibraryPage(db);
    else if (parts[0] === "favorites") html = renderFavoritesPage(db);
    else if (parts[0] === "client") html = renderClientPage(db);
    else if (parts[0] === "notifications") html = renderNotificationsPage(db);
    else if (parts[0] === "subscriptions") html = renderSubscriptionsPage(db, query.get("type") || "beatmaker");
    else if (parts[0] === "subscribe-checkout") html = renderSubscribeCheckoutPage(db, query.get("type") || "beatmaker", query.get("plan") || "Gratuit");
    else if (parts[0] === "waveform") html = renderWaveformPage();
    else if (parts[0] === "become-seller") html = renderBecomeSeller(db);
    else if (parts[0] === "dashboard") html = renderDashboard(db);
    else if (parts[0] === "admin") html = renderAdmin(db);
    else html = renderNotFound();
  } catch (e) {
    if (String(e?.message) === "AUTH_REQUIRED") return;
    html = `<div class="view"><div class="panel"><div class="h1">Erreur</div><p class="sub">${escapeHtml(e?.message || "Erreur inconnue")}</p></div></div>`;
  }

  outlet.innerHTML = html;
  updateCartBadge();
  syncAccountBtn();
  postRender();
}

let waveState = { playing: false, seed: 1, raf: 0, t: 0 };
function waveRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function drawWave(seed, phase, seek01) {
  const canvas = document.getElementById("waveCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const bars = 140;
  const gap = 3;
  const barW = Math.max(1, Math.floor((w - (bars - 1) * gap) / bars));
  const mid = Math.floor(h / 2);

  for (let i = 0; i < bars; i++) {
    const r = waveRand(seed * 999 + i * 13.37);
    const wobble = 0.55 + 0.45 * Math.sin(phase + i * 0.16);
    const amp = Math.max(0.08, r * wobble);
    const barH = Math.floor(10 + amp * (h * 0.78));
    const x = i * (barW + gap);
    const y = mid - Math.floor(barH / 2);

    const isPast = i / bars <= seek01;
    ctx.fillStyle = isPast ? "rgba(240,210,125,.95)" : "rgba(255,255,255,.20)";
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "rgba(0,0,0,.08)";
    ctx.fillRect(x, y + Math.floor(barH * 0.72), barW, Math.floor(barH * 0.28));
  }
}
function startWave() {
  waveState.playing = true;
  const seek = document.getElementById("waveSeek");
  const loop = () => {
    if (!waveState.playing) return;
    waveState.t += 0.05;
    const seek01 = seek ? Number(seek.value) / 1000 : 0.12;
    drawWave(waveState.seed, waveState.t, seek01);
    waveState.raf = requestAnimationFrame(loop);
  };
  loop();
}
function stopWave() {
  waveState.playing = false;
  if (waveState.raf) cancelAnimationFrame(waveState.raf);
  waveState.raf = 0;
}
function postRender() {
  const { parts } = route();
  if (parts[0] === "waveform") {
    const seek = document.getElementById("waveSeek");
    seek?.addEventListener("input", () => {
      const seek01 = Number(seek.value) / 1000;
      drawWave(waveState.seed, waveState.t, seek01);
    });
    drawWave(waveState.seed, waveState.t, Number(seek?.value || 120) / 1000);
  } else {
    stopWave();
  }
}

function bindGlobalUI() {
  // Genres (sidebar)
  document.querySelectorAll(".genre").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.hash = "#/";
      document.querySelectorAll(".genre").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const ui = window.__uiState || (window.__uiState = { genre: "Trap", query: "" });
      ui.genre = btn.getAttribute("data-genre") || "";
      toast(`Genre: ${ui.genre}`);
      if ((route().parts || []).length === 0) render();
    });
  });

  // Search: only affects home
  const search = $("#searchInput");
  search?.addEventListener("input", (e) => {
    const ui = window.__uiState || (window.__uiState = { genre: "Trap", query: "" });
    ui.query = e.target.value || "";
    if ((route().parts || []).length === 0) render();
  });

  // Account button: if logged -> client space, else auth
  $("#accountBtn")?.addEventListener("click", () => {
    const db = loadDb();
    const u = getSessionUser(db);
    if (u) location.hash = "#/client";
    else openAuthModal("login");
  });

  // Beat modal
  $("#closeBeatModal")?.addEventListener("click", closeBeatModal);
  $("#cancelBeatModal")?.addEventListener("click", closeBeatModal);
  $("#beatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitBeatForm();
  });

  // Seller modal hooks (existing dialog)
  $("#closeSellerModal")?.addEventListener("click", closeSellerModal);
  $("#cancelSeller")?.addEventListener("click", closeSellerModal);
  $("#confirmSeller")?.addEventListener("click", () => {
    const db = loadDb();
    const name = ($("#sellerName").value || "").trim();
    const email = ($("#sellerEmail").value || "").trim().toLowerCase();
    if (!name || !email) return toast("Remplis nom + email");

    // Create local seller + user seller
    if (db.users.some((u) => u.email.toLowerCase() === email)) return toast("Email déjà utilisé (utilise la modal Compte)");
    const sellerId = uid("s");
    db.sellers.push({ id: sellerId, displayName: name, bio: "Bio à compléter depuis le dashboard.", createdAt: Date.now() });
    const user = { id: uid("u"), email, password: "seller", displayName: name, role: "buyer", sellerId, createdAt: Date.now(), purchases: [], favorites: [] };
    db.users.push(user);
    saveDb(db);
    saveSession({ userId: user.id });
    closeSellerModal();
    toast("Seller créé (mdp: seller)");
    location.hash = "#/client";
    render();
  });

  // Auth modal hooks
  $("#closeAuthModal")?.addEventListener("click", closeAuthModal);
  $("#toggleAuthMode")?.addEventListener("click", () => {
    const db = loadDb();
    if (getSessionUser(db)) return;
    authMode = authMode === "login" ? "register" : "login";
    syncAuthModal();
  });
  $("#submitAuth")?.addEventListener("click", handleAuthSubmit);
  $("#logoutBtn")?.addEventListener("click", handleLogout);

  // Generic toasts
  document.querySelectorAll("[data-toast]").forEach((btn) => btn.addEventListener("click", () => toast(btn.getAttribute("data-toast"))));

  // Hash route changes
  window.addEventListener("hashchange", () => render());

  // Delegate actions inside outlet
  document.addEventListener("click", (e) => {
    const t = e.target;

    const toastBtn = t.closest?.("[data-toast]");
    if (toastBtn) {
      toast(toastBtn.getAttribute("data-toast"));
      return;
    }

    const actionBtn = t.closest?.("[data-action]");
    if (actionBtn) {
      const action = actionBtn.getAttribute("data-action");
      if (action === "create") {
        try {
          openBeatModal("create");
        } catch {}
      }
      return;
    }

    const scrollBtn = t.closest?.("[data-scroll]");
    if (scrollBtn) {
      const id = scrollBtn.getAttribute("data-scroll");
      const dir = Number(scrollBtn.getAttribute("data-dir") || "1");
      const rail = $(`#rail-${id}`);
      rail?.scrollBy({ left: dir * 480, behavior: "smooth" });
      return;
    }

    const addBtn = t.closest?.("[data-add-to-cart]");
    if (addBtn) {
      const beatId = addBtn.getAttribute("data-add-to-cart");
      const licSel = $("#licenseSelect");
      const licenseId = (licSel?.value || "mp3").trim();
      addToCart(beatId, licenseId);
      return;
    }

    const likeBtn = t.closest?.("[data-like]");
    if (likeBtn) return handleLike(likeBtn.getAttribute("data-like"));

    const favBtn = t.closest?.("[data-fav]");
    if (favBtn) return toggleFavorite(favBtn.getAttribute("data-fav"));

    const removeBtn = t.closest?.("[data-remove-cart]");
    if (removeBtn) return removeFromCart(removeBtn.getAttribute("data-remove-cart"));

    const openAuth = t.closest?.("[data-open-auth]");
    if (openAuth) return openAuthModal("login");

    const logout = t.closest?.("[data-logout]");
    if (logout) return handleLogout();

    const editProfile = t.closest?.("[data-edit-profile]");
    if (editProfile) {
      const db = loadDb();
      const u = requireAuth(db);
      const name = window.prompt("Nouveau nom / pseudo", u.displayName);
      if (name === null) return;
      if (!name.trim()) return toast("Nom invalide");
      u.displayName = name.trim();
      saveDb(db);
      toast("Profil mis à jour");
      render();
      return;
    }

    const enableSeller = t.closest?.("[data-enable-seller]");
    if (enableSeller) {
      const db = loadDb();
      const u = requireAuth(db);
      if (u.sellerId) return toast("Déjà seller");
      const sellerId = uid("s");
      u.sellerId = sellerId;
      db.sellers.push({ id: sellerId, displayName: u.displayName, bio: "Bio à compléter depuis l’espace client.", createdAt: Date.now() });
      addNotification(db, u.id, "Mode seller activé (proto). Tu peux maintenant publier des beats.");
      saveDb(db);
      toast("Seller activé");
      render();
      return;
    }

    const openSeller = t.closest?.("[data-open-seller-modal]");
    if (openSeller) return openSellerModal();

    const place = t.closest?.("[data-place-order]");
    if (place) return placeOrder();

    const dl = t.closest?.("[data-download]");
    if (dl) {
      const db = loadDb();
      return downloadSimulated(db, dl.getAttribute("data-download"), dl.getAttribute("data-license"));
    }

    const markRead = t.closest?.("[data-mark-read]");
    if (markRead) {
      const db = loadDb();
      const u = requireAuth(db);
      const id = markRead.getAttribute("data-mark-read");
      const n = (db.notifications || []).find((x) => x.id === id && x.userId === u.id);
      if (n) n.read = true;
      saveDb(db);
      toast("OK");
      render();
      return;
    }
    const markAll = t.closest?.("[data-mark-all-read]");
    if (markAll) {
      const db = loadDb();
      const u = requireAuth(db);
      (db.notifications || []).forEach((n) => {
        if (n.userId === u.id) n.read = true;
      });
      saveDb(db);
      toast("Tout lu");
      render();
      return;
    }

    const waveToggle = t.closest?.("[data-wave-toggle]");
    if (waveToggle) {
      if (waveState.playing) stopWave();
      else startWave();
      return;
    }
    const waveRandom = t.closest?.("[data-wave-random]");
    if (waveRandom) {
      waveState.seed = Math.floor(Math.random() * 9999) + 1;
      const seek = document.getElementById("waveSeek");
      const seek01 = seek ? Number(seek.value) / 1000 : 0.12;
      drawWave(waveState.seed, waveState.t, seek01);
      toast("Wave random");
      return;
    }

    const subBtn = t.closest?.("[data-subscribe]");
    if (subBtn) {
      const db = loadDb();
      const u = requireAuth(db);
      const subType = subBtn.getAttribute("data-sub-type") || "beatmaker";
      const subPlan = subBtn.getAttribute("data-sub-plan") || "Gratuit";
      u.subscription = { type: subType, plan: subPlan, startedAt: Date.now(), status: "active_simulated" };
      addNotification(db, u.id, `Abonnement activé (simulé): ${subType} — ${subPlan}.`);
      saveDb(db);
      toast("Abonnement activé");
      location.hash = "#/library";
      return;
    }

    const approve = t.closest?.("[data-approve]");
    if (approve) return approveBeat(approve.getAttribute("data-approve"), true);
    const reject = t.closest?.("[data-reject]");
    if (reject) return approveBeat(reject.getAttribute("data-reject"), false);
    const toggle = t.closest?.("[data-toggle-approve]");
    if (toggle) return toggleApprove(toggle.getAttribute("data-toggle-approve"));

    const openCreateBeat = t.closest?.("[data-open-create-beat]");
    if (openCreateBeat) {
      return openBeatModal("create");
    }
    const editBeat = t.closest?.("[data-edit-beat]");
    if (editBeat) {
      return openBeatModal("edit", editBeat.getAttribute("data-edit-beat"));
    }
    const delBeat = t.closest?.("[data-delete-beat]");
    if (delBeat) return deleteBeat(delBeat.getAttribute("data-delete-beat"), "seller");
    const adminDel = t.closest?.("[data-admin-delete]");
    if (adminDel) return deleteBeat(adminDel.getAttribute("data-admin-delete"), "admin");

    const exportBtn = t.closest?.("[data-export-db]");
    if (exportBtn) return exportDb();
    const resetBtn = t.closest?.("[data-reset-db]");
    if (resetBtn) return resetDb();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const statusbar = document.getElementById('statusbar');
  
    // On cible les icônes sociales, les icônes du haut, les genres et les boutons pilules
    const targets = document.querySelectorAll('.icon-btn, .topicon, .genre, .pill, .bsMark');

    targets.forEach(target => {
      target.addEventListener('mouseenter', () => {
      // On récupère le nom dans l'ordre de priorité : aria-label, title, ou le texte du bouton
      const name = target.getAttribute('aria-label') || target.getAttribute('title') || target.innerText;
      
      if (name) {
        statusbar.textContent = name;
        statusbar.classList.add('is-visible');
      }
    });

    target.addEventListener('mouseleave', () => {
      statusbar.classList.remove('is-visible');
    });
  });

  // Imaginons que 'allBeats' est ton tableau d'objets contenant tes prods
  function renderHome(allBeats) {
    // 1. Trier par date pour "Les derniers uploads" (les 4 ou 8 plus récents)
    const recentBeats = [...allBeats]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

    // 2. Afficher tout pour "Le Feed"
    const feedBeats = allBeats;

    // Injection dans les grids respectifs
    const recentGrid = document.getElementById('recentUploadsGrid');
    const feedGrid = document.getElementById('fullFeedGrid');

    // Utilise ta fonction de création de carte de beat habituelle
    recentBeats.forEach(beat => recentGrid.appendChild(createBeatCard(beat)));
    feedBeats.forEach(beat => feedGrid.appendChild(createBeatCard(beat)));
  }

  function saveBeatOnline(newBeat) {
    const beatId = Date.now().toString();
    // On envoie les données sur le serveur Firebase
    db.ref('beats/' + beatId).set({
      ...newBeat,
      id: beatId,
      createdAt: new Date().toISOString(),
      upvotes: 0
    }).then(() => {
      showToast("Beat mis en ligne !");
    });
  }

  function syncBeats() {
    db.ref('beats').on('value', (snapshot) => {
      const data = snapshot.val();
      const allBeats = data ? Object.values(data) : [];
      
      // On met à jour tes carrousels avec les données d'internet
      renderHomeWithData(allBeats);
    });
  }
  
});
}

// Boot
updateCartBadge();
syncAccountBtn();
bindGlobalUI();
if (!location.hash) location.hash = "#/";
render();
