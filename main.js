// Edit public text and links here. Leave private API credentials out of this file.
const SITE_CONFIG = {
  robloxUsername: 'ykad_x', robloxUserId: 850300549, ownerName: 'ykad_x',
  avatarFallbackImage: 'assets/ykad_x-avatar.png',
  steam: { name: 'ykad_x', profileUrl: 'https://steamcommunity.com/id/Ykad_x/', avatarImage: 'assets/steam-avatar.jpg' },
  bio: [
    'I’m into games, aviation, and figuring out how things work. I like having something new to learn or an idea to mess around with, even when I don’t quite know where it’s going yet.',
    'A lot of my free time goes into gaming with friends and flight and train simulators. Aviation is a big interest of mine.'
  ],
  facts: { Interests: 'Aviation & simulation', Currently: '—' },
  skills: ['Roblox Studio', 'Unity', 'Luau', 'C#', 'Gameplay systems', 'UI design'],
  interests: { 'most played game': 'Roblox', 'other interests': 'Aviation & simulators' },
  links: { Roblox: 'https://www.roblox.com/users/850300549/profile', Discord: 'https://discord.com/users/519173172348583947' },
  // Deploy api/worker.js separately, then put its HTTPS URL here. Empty means use same-origin /api.
  apiBaseUrl: '', discordUserId: '519173172348583947'
};

const $ = id => document.getElementById(id);
const api = path => `${SITE_CONFIG.apiBaseUrl.replace(/\/$/, '')}/api/${path}`;
const safeUrl = (raw, allowed = ['https:', 'http:']) => { if (!raw) return ''; try { const u = new URL(raw, location.href); return allowed.includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const setText = (id, value) => { $(id).textContent = value; };
const getJson = async (url, timeout = 8000) => { const response = await fetch(url, { signal: AbortSignal.timeout(timeout), cache: 'no-store' }); if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); };

function renderProfile() {
  setText('steam-name', SITE_CONFIG.steam.name);
  $('steam-profile-link').href = safeUrl(SITE_CONFIG.steam.profileUrl);
  $('steam-avatar').src = SITE_CONFIG.steam.avatarImage;
  $('steam-avatar').alt = `Steam avatar of ${SITE_CONFIG.steam.name}`;
  $('bio').replaceChildren();
  for (const text of SITE_CONFIG.bio) { const paragraph = document.createElement('p'); paragraph.textContent = text; $('bio').append(paragraph); }
  for (const [name, value] of Object.entries(SITE_CONFIG.facts)) { const wrap = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = name; dd.textContent = value; if (name === 'Currently') { dd.id = 'current-game-fact'; dd.setAttribute('aria-live', 'polite'); } wrap.append(dt, dd); $('facts').append(wrap); }
  for (const skill of SITE_CONFIG.skills) { const span = document.createElement('span'); span.textContent = skill; $('skills').append(span); }
  for (const [name, value] of Object.entries(SITE_CONFIG.interests)) { const card = document.createElement('div'); const small = document.createElement('small'); const strong = document.createElement('strong'); small.textContent = name; strong.textContent = value; card.append(small, strong); $('interests').append(card); }
  for (const [name, url] of Object.entries(SITE_CONFIG.links)) { for (const id of ['about-socials', 'footer-socials']) { const href = safeUrl(url); const item = document.createElement(href ? 'a' : 'span'); if (href) { item.href = href; item.target = '_blank'; item.rel = 'noopener noreferrer'; } else { item.title = `${name} link coming soon`; item.className = 'social-unset'; } const label = name === 'Discord' && href ? 'message me on Discord' : name; item.textContent = `${label}${href ? ' ↗' : ''}`; $(id).append(item); } }
}

// Bundled creation entry keeps the devlog visible when local file fetching is blocked.
const FALLBACK_DEVLOG = "# Your devlog updates\n\nCopy the entry below, including its POST marker, to add another update.\nChange the title, date, tags, summary, and message, then save and refresh.\nNewest dates appear first. Push changes to GitHub to update the live website.\n\n<!-- POST -->\ntitle: Making my personal page\ndate: 2026-11-02\ntags: devlog, update\nsummary: Putting together a personal page with a black and pink style, my avatar, and a little more about me.\n---\n# Making my personal page\n\nToday I started putting this page together. I wanted somewhere that feels more like me, with a black and pink style and a bit about who I am.\n\n## How it came together\n\nThe first version was a bit too gothic for what I wanted, so I went with a simpler egirl style: mostly black, softer pink details, a few hearts, and a clean, readable font.\n\nI added matching Roblox and Steam profile cards next to the about me, changed the bio to focus more on my interests, and set up this devlog so I can share updates here.\n\n## Still sorting out\n\nThe Spotify and game cards are set up, but the presence bot is down at the moment. They’ll show my activity when that’s available again.\n\nFor now, I’m happy with the direction this is going. More updates when there’s something to share.\n";
let posts = [], activeTag = 'all', activePost = -1;
const TAGS = ['all', 'devlog', 'roblox', 'game design', 'update', 'thoughts', 'art', 'music', 'life'];
function renderTags() { for (const tag of TAGS) { const b = document.createElement('button'); b.type = 'button'; b.textContent = tag; b.setAttribute('aria-pressed', String(activeTag === tag)); b.addEventListener('click', () => { activeTag = tag; for (const button of $('tag-filters').children) button.setAttribute('aria-pressed', String(button.textContent === tag)); renderPosts(); }); $('tag-filters').append(b); } }
function renderPosts() {
  const query = $('post-search').value.trim().toLowerCase();
  const filtered = posts.filter(p => (activeTag === 'all' || p.tags.includes(activeTag)) && [p.title, p.excerpt, ...p.tags].join(' ').toLowerCase().includes(query));
  $('post-list').replaceChildren();
  if (!filtered.length) { const p = document.createElement('p'); p.className = 'empty-state'; p.textContent = 'No entries yet.'; $('post-list').append(p); return; }
  for (const post of filtered) { const card = document.createElement('article'); card.className = 'post-card'; const time = document.createElement('time'); time.dateTime = post.date; time.textContent = new Date(`${post.date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); const h = document.createElement('h3'); h.textContent = post.title; const p = document.createElement('p'); p.textContent = post.excerpt; const tags = document.createElement('div'); tags.className = 'tags'; for (const tag of post.tags) { const s = document.createElement('span'); s.textContent = tag; tags.append(s); } const button = document.createElement('button'); button.type = 'button'; button.textContent = 'read entry ↗'; button.addEventListener('click', () => openPost(posts.indexOf(post))); card.append(time, h, p, tags, button); $('post-list').append(card); }
}
function parseDevlog(source) {
  return source.replace(/^\uFEFF/, '').split(/^<!-- POST -->\s*$/m).slice(1).flatMap((entry, index) => {
    const divider = /^---\s*$/m.exec(entry);
    if (!divider) return [];
    const metadata = {};
    for (const line of entry.slice(0, divider.index).split(/\r?\n/)) {
      const match = /^([a-z]+):\s*(.*)$/i.exec(line.trim());
      if (match) metadata[match[1].toLowerCase()] = match[2].trim();
    }
    const title = metadata.title;
    const date = metadata.date;
    const timestamp = new Date(date + 'T12:00:00Z');
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !Number.isFinite(timestamp.getTime()) || timestamp.toISOString().slice(0, 10) !== date) return [];
    const markdown = entry.slice(divider.index + divider[0].length).trim();
    return [{ slug: 'entry-' + index, title, date,
      tags: (metadata.tags || 'devlog').split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
      excerpt: metadata.summary || markdown.replace(/[#*_>\x60]/g, '').replace(/\s+/g, ' ').slice(0, 150), markdown }];
  }).sort((a, b) => b.date.localeCompare(a.date));
}

async function openPost(index) {
  const post = posts[index]; if (!post) return; activePost = index;
  setText('post-dialog-title', post.title); setText('post-dialog-meta', `${post.date} / ${post.tags.join(' · ')}`); setText('post-dialog-body', 'opening entry...');
  $('previous-post').disabled = index === 0; $('next-post').disabled = index === posts.length - 1;
  if (!$('post-dialog').open) $('post-dialog').showModal();
  try { let markdown = post.markdown; if (markdown === undefined) { const response = await fetch(post.contentFile); if (!response.ok) throw Error('Entry unavailable'); markdown = (await response.text()).replace(/^---\s*\n[\s\S]*?\n---\s*\n/, ''); } const [{ marked }, { default: DOMPurify }] = await Promise.all([import('https://cdn.jsdelivr.net/npm/marked@15.0.12/lib/marked.esm.js'), import('https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.es.mjs')]); if (activePost !== index) return; $('post-dialog-body').innerHTML = DOMPurify.sanitize(marked.parse(markdown), { USE_PROFILES: { html: true } }); for (const a of $('post-dialog-body').querySelectorAll('a')) { const url = safeUrl(a.href); if (!url) a.removeAttribute('href'); else { a.href = url; a.rel = 'noopener noreferrer'; } } for (const img of $('post-dialog-body').querySelectorAll('img')) { img.alt ||= 'Devlog illustration'; img.loading = 'lazy'; const url = safeUrl(img.src); if (!url) img.remove(); } } catch { setText('post-dialog-body', 'This entry could not be loaded. Please try again.'); }
}
async function initPosts() { renderTags(); $('post-search').addEventListener('input', renderPosts); $('dialog-close').addEventListener('click', () => $('post-dialog').close()); $('post-dialog').addEventListener('click', e => { if (e.target === $('post-dialog')) $('post-dialog').close(); }); $('previous-post').addEventListener('click', () => openPost(activePost - 1)); $('next-post').addEventListener('click', () => openPost(activePost + 1)); try { const response = await fetch('DEVLOG.md', { cache: 'no-store' }); if (response.ok) { posts = parseDevlog(await response.text()); } else { const data = await getJson('posts/posts.json'); posts = data.filter(p => /^[a-z0-9-]+$/.test(p.slug) && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Array.isArray(p.tags) && /^posts\/[a-z0-9-]+\.md$/.test(p.contentFile)).sort((a,b) => b.date.localeCompare(a.date)); } } catch { posts = parseDevlog(FALLBACK_DEVLOG); } renderPosts(); }

async function initActivity() {
  let updating = false;
  const hasDiscord = /^\d{15,22}$/.test(SITE_CONFIG.discordUserId);
  const hasBackend = Boolean(SITE_CONFIG.apiBaseUrl);
  async function update() {
    if (updating || document.hidden) return;
    updating = true;
    try {
      const [backend, presence] = await Promise.allSettled([
        hasBackend ? getJson(api('activity')) : Promise.resolve(null),
        hasDiscord ? getJson('https://api.lanyard.rest/v1/users/' + SITE_CONFIG.discordUserId) : Promise.resolve(null)
      ]);
      let music = backend.status === 'fulfilled' ? backend.value?.music : null;
      let game = backend.status === 'fulfilled' ? backend.value?.game : null;
      const discord = presence.status === 'fulfilled' && presence.value?.success ? presence.value.data : null;
      if (discord) {
        const playing = discord.activities?.find(activity => activity.type === 0);
        game = playing ? { name: playing.name, active: true } : null;
        if (discord.listening_to_spotify && discord.spotify) {
          music = { title: discord.spotify.song, artist: discord.spotify.artist, url: 'https://open.spotify.com/track/' + discord.spotify.track_id, isPlaying: true };
        }
      }
      setText('music-title', music?.title || '—');
      setText('music-detail', music ? (music.isPlaying ? 'now playing' : 'top track') + (music.artist ? ' · ' + music.artist : '') : '');
      const musicUrl = safeUrl(music?.url);
      $('music-link').hidden = !musicUrl;
      if (musicUrl) $('music-link').href = musicUrl;
      else $('music-link').removeAttribute('href');
      setText('game-title', game?.name || '—');
      setText('current-game-fact', game?.active ? game.name : '—');
      setText('game-detail', game ? (game.active ? 'playing now' : 'last played') : '');
    } finally { updating = false; }
  }
  if (!hasDiscord && !hasBackend) {
    console.info('Live activity needs SITE_CONFIG.discordUserId (Lanyard) or apiBaseUrl.');
    return;
  }
  await update();
  setInterval(update, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

async function initAvatar() {
  const username = SITE_CONFIG.robloxUsername;
  showAvatarFallback();
  $('avatar-fallback').addEventListener('error', () => { $('avatar-fallback').src = SITE_CONFIG.avatarFallbackImage; $('avatar-fallback').alt = 'Saved Roblox avatar of ykad_x'; }, { once: true });
  let identity;
  try { identity = await getJson(api(`roblox/identity?username=${encodeURIComponent(username)}`)); } catch { try { const data = await getJson(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`); identity = data.data?.find(user => user.name?.toLowerCase() === username.toLowerCase()); } catch { /* Identity lookup may be blocked by CORS. */ } }
  if (!identity?.id && SITE_CONFIG.robloxUserId) identity = { id: SITE_CONFIG.robloxUserId, name: username, displayName: SITE_CONFIG.ownerName };
  if (!identity?.id) { showAvatarFallback(); return; }
  setText('roblox-display', identity.displayName || SITE_CONFIG.ownerName); setText('roblox-username', `@${identity.name || username}`); setText('roblox-id', `ID: ${identity.id}`); setText('roblox-verified', identity.hasVerifiedBadge ? '✓ verified' : 'not verified'); $('roblox-profile').href = `https://www.roblox.com/users/${identity.id}/profile`;
  let thumbnail = '';
  try { const data = await getJson(api(`roblox/thumbnail?userId=${identity.id}`)); thumbnail = data.imageUrl || ''; } catch { try { const data = await getJson(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${identity.id}&size=420x420&format=Png&isCircular=false`); thumbnail = data.data?.[0]?.imageUrl || ''; } catch { /* Keep local fallback. */ } }
  if (thumbnail) { $('avatar-fallback').src = safeUrl(thumbnail); $('avatar-fallback').alt = `Roblox avatar of ${identity.name || username}`; $('avatar-fallback').hidden = false; }
  try { const manifest = await getAvatarManifest(identity.id); await buildViewer(manifest); $('viewer-loading').hidden = true; $('avatar-fallback').hidden = true; $('avatar').dataset.interactive = 'true'; for (const button of document.querySelectorAll('.viewer-controls button')) button.disabled = false; document.querySelector('.viewer-hint').textContent = 'drag to rotate · scroll / pinch to zoom'; } catch { $('avatar-viewer').replaceChildren(); showAvatarFallback(); }
}
async function getAvatarManifest(userId) { for (let i = 0; i < 6; i++) { let data; try { data = await getJson(api(`roblox/avatar-3d?userId=${userId}`)); } catch { data = await getJson(`https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${userId}`); } if (data.state === 'Completed' && data.imageUrl) { try { return await getJson(api(`roblox/manifest?url=${encodeURIComponent(data.imageUrl)}`)); } catch { return getJson(data.imageUrl); } } if (data.state !== 'Pending' && data.state !== 'InProgress') throw Error('3D avatar unavailable'); await new Promise(r => setTimeout(r, 1500)); } throw Error('3D avatar timed out'); }
function showAvatarFallback() { $('avatar').dataset.interactive = 'false'; $('viewer-loading').hidden = true; $('avatar-fallback').hidden = false; $('avatar-viewer').setAttribute('aria-label', 'Roblox avatar image preview'); document.querySelector('.viewer-hint').textContent = ''; for (const button of document.querySelectorAll('.viewer-controls button')) button.disabled = true; }
async function buildViewer(manifest) {
  const [THREE, { OrbitControls }, { OBJLoader }, { MTLLoader }] = await Promise.all([import('three'), import('three/addons/controls/OrbitControls.js'), import('three/addons/loaders/OBJLoader.js'), import('three/addons/loaders/MTLLoader.js')]);
  const container = $('avatar-viewer'), scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x100914,.055);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.set(0, 2.1, 7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; container.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 2; controls.maxDistance = 12; controls.target.set(0, 1.5, 0); controls.autoRotate = false; controls.autoRotateSpeed = .5;
  const key = new THREE.DirectionalLight(0xfff6f8, 2.6); key.position.set(3,6,5); scene.add(key); const pink = new THREE.PointLight(0xff4fa3, 55); pink.position.set(-3,3,2); scene.add(pink); const red = new THREE.PointLight(0xb3123c, 40); red.position.set(3,1,-3); scene.add(red); scene.add(new THREE.AmbientLight(0xc9a7ff,.85));
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.4,.17,80),new THREE.MeshStandardMaterial({color:0x120c16,metalness:.7,roughness:.25})); floor.position.y=-.18; scene.add(floor); const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05,.014,5,90),new THREE.MeshBasicMaterial({color:0xff4fa3})); ring.rotation.x=Math.PI/2; ring.position.y=-.08; scene.add(ring);
  const points = Array.from({length:90},()=>[(Math.random()-.5)*7,Math.random()*5,(Math.random()-.5)*7]).flat(); const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3)); const particles = new THREE.Points(geometry,new THREE.PointsMaterial({color:0xff7cbb,size:.035,transparent:true,opacity:.65})); scene.add(particles);
  const proxyAsset = url => api(`roblox/asset?url=${encodeURIComponent(url)}`);
  const assets = new Map((manifest.textures || []).map(t => [t.name, t.url])); const manager = new THREE.LoadingManager(); manager.setURLModifier(url => proxyAsset(assets.get(url) || url));
  const objUrl = manifest.obj, mtlUrl = manifest.mtl; if (!objUrl || !mtlUrl) throw Error('Incomplete avatar manifest');
  const [objText, mtlText] = await Promise.all([fetch(proxyAsset(objUrl)).then(r=>{if(!r.ok)throw Error('OBJ unavailable');return r.text()}),fetch(proxyAsset(mtlUrl)).then(r=>{if(!r.ok)throw Error('MTL unavailable');return r.text()})]);
  const textureLoader = new THREE.TextureLoader(manager); if (manifest.textures?.[0]?.url) textureLoader.load(manifest.textures[0].url, texture => { texture.dispose(); }, undefined, () => {});
  const materials = new MTLLoader(manager).parse(mtlText, ''); materials.preload(); const object = new OBJLoader(manager).setMaterials(materials).parse(objText); const box = new THREE.Box3().setFromObject(object); const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3()); if (!size.y || !Number.isFinite(size.y)) throw Error('Invalid model'); const scale = 3.2 / size.y; object.scale.setScalar(scale); object.position.copy(center).multiplyScalar(-scale); object.position.y += 1.6; scene.add(object);
  const resize = () => { const w=container.clientWidth,h=container.clientHeight; if(!w||!h)return; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false); }; new ResizeObserver(resize).observe(container); resize();
  let running = false; const draw = () => { if (!running) return; controls.update(); renderer.render(scene,camera); requestAnimationFrame(draw); }; const visibility = () => { if (document.hidden) running=false; else if(!running){running=true;draw();} }; document.addEventListener('visibilitychange',visibility); visibility();
  $('rotate-toggle').setAttribute('aria-pressed',String(controls.autoRotate)); $('rotate-toggle').onclick=()=>{ controls.autoRotate=!controls.autoRotate; $('rotate-toggle').setAttribute('aria-pressed',String(controls.autoRotate)); }; $('reset-camera').onclick=()=>{camera.position.set(0,2.1,7);controls.target.set(0,1.5,0);controls.update();}; $('particles-toggle').onclick=()=>{particles.visible=!particles.visible;$('particles-toggle').setAttribute('aria-pressed',String(particles.visible));}; $('mood-toggle').onclick=()=>{const moon=$('mood-toggle').getAttribute('aria-pressed')!=='true';pink.intensity=moon?15:55;red.intensity=moon?10:40;key.intensity=moon?1.2:2.6;$('mood-toggle').setAttribute('aria-pressed',String(moon));};
}

renderProfile(); initPosts(); initActivity(); initAvatar();
