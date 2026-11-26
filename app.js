/* Beyond The Color — site app (no build step) */
(() => {
'use strict';

/* ================= data & rules ================= */
const P = window.PRODUCTS || [];
const BY = Object.fromEntries(P.map(p => [p.id, p]));
const TOTAL = P.length;
const TYPE = { '바지': '하의', '상의': '상의', '아우터': '아우터' };
const AGES = [
  { k: '3-5', l: '3~5세', sizes: [100, 110] },
  { k: '6-8', l: '6~8세', sizes: [120, 130] },
  { k: '9', l: '9세 이상', sizes: [140, 150, 160] },
];
const SITS = ['운동장에서 뛰어놀아요', '자전거·킥보드를 타요', '실내에서 쉬거나 놀아요', '어린이 학예회·발표회에 가요',
  '가족 모임·기념사진이 있어요', '소풍·현장학습을 가요', '바람이 많이 부는 날이에요', '추운 날 등하교해요', '더운 날 밖에서 놀아요'];
const SKIN = ['까끌거리는 옷을 싫어해요', '피부가 예민해요', '땀을 많이 흘려요'];
const MATS = ['면 비율이 높은 옷', '부드러운 소재(모달·텐셀 등)', '합성 섬유는 피하고 싶어요'];
const MAT_SHORT = ['면 비율 높음', '부드러운 소재', '합성 섬유 피하기'];

const K = {
  tee: ['티셔츠', '롱슬리브', '긴소매', '긴팔티', '반팔', 't(', 't)', '나시'], short_tee: ['반팔', '숏슬리브', '나시'],
  sweat: ['맨투맨', '스웨트셔츠', '후디', '후드티'], jogger: ['조거', '조깅', '스웨트팬츠', '트레이닝'],
  sweatpants: ['스웨트팬츠', '스웨트쇼츠'], active_pants: ['조거', '조깅', '카고', '나일론팬', '파라슈트', '트레킹'],
  cargo: ['카고'], shirt: ['셔츠'], collar_knit: ['카라', '칼라드', '폴로'], knit: ['니트', '스웨터'],
  cardigan: ['가디건', '카디건'], chino: ['치노', '코튼팬츠', '턴업'], corduroy: ['코듀로이'], denim: ['데님', '진', '청바지'],
  zipup: ['집업', '풀집'], fleece: ['플리스', '후리스', '덤블'],
  windbreaker: ['바람막이', '윈드브레이커', '윈드', '발수재킷', '패커블'], jacket: ['재킷', '자켓', '블루종', '보머'],
  light_padding: ['경량', '씬라이트', '라이트다운', '라이트웨이트'], padding: ['패딩', '다운', '파카', '퍼퍼', 'puff'],
  long_padding: ['롱패딩', '롱다운', '벤치파카'], coat: ['코트', '트렌치', '더플'],
  thick_pants: ['기모', '웜라인', '플리스', '후리스', '코듀로이', '덤블'], shorts: ['쇼츠', '반바지', '버뮤다', '쇼트팬츠', '스윔'],
};
const norm = s => (s || '').replace(/\s+/g, '').toLowerCase();
const txtOf = p => p._t || (p._t = norm(p.detail) + '|' + norm(p.name));
function has(p, key) {
  if (key === 'thick_pants' && p.type !== '하의') return false;
  if (key === 'knit' && has(p, 'tee')) return false;
  const t = txtOf(p);
  return K[key].some(k => t.includes(k));
}
const anyOf = (p, keys) => keys.some(k => has(p, k));
const mat = (p, f) => p.mat.includes(f);
const RULES = {
  '운동장에서 뛰어놀아요': { prefer: ['tee', 'sweat', 'jogger', 'sweatpants'], also: ['zipup', 'fleece', 'windbreaker'], penalty: ['coat', 'long_padding'], material: p => p.cotton >= 50, stretch: true },
  '자전거·킥보드를 타요': { prefer: ['tee', 'sweat', 'jogger', 'active_pants'], also: ['windbreaker', 'jacket', 'fleece'], penalty: ['long_padding', 'coat'], stretch: true },
  '실내에서 쉬거나 놀아요': { prefer: ['tee', 'sweat', 'sweatpants', 'jogger'], also: ['zipup', 'fleece'], penalty: ['denim'], material: p => p.cotton >= 80 },
  '어린이 학예회·발표회에 가요': { prefer: ['shirt', 'collar_knit', 'knit', 'cardigan', 'chino'], also: ['corduroy', 'denim', 'coat'], penalty: ['long_padding'], material: p => p.cotton >= 95 || mat(p, '울') || /(^|[^가-힣])모\s*[:\d]/.test(p.mat) },
  '가족 모임·기념사진이 있어요': { prefer: ['shirt', 'knit', 'collar_knit', 'cardigan', 'chino', 'corduroy'], also: ['coat', 'denim', 'jacket'], penalty: ['long_padding'] },
  '소풍·현장학습을 가요': { prefer: ['tee', 'sweat', 'jogger', 'cargo', 'active_pants'], also: ['windbreaker', 'light_padding', 'fleece'], penalty: ['coat', 'long_padding'], pocket: true },
  '바람이 많이 부는 날이에요': { prefer: ['windbreaker', 'jacket'], also: ['tee', 'sweat', 'jogger', 'active_pants', 'cardigan'], penalty: [], material: p => p.type === '아우터' && (mat(p, '나일론') || mat(p, '폴리에스터')) },
  '추운 날 등하교해요': { prefer: ['padding', 'long_padding', 'fleece', 'knit'], also: ['coat', 'thick_pants', 'shirt', 'tee'], penalty: ['short_tee', 'shorts'], material: p => mat(p, '울') || mat(p, '다운') || mat(p, '충전재') || /(^|[^가-힣])모\s*[:\d]/.test(p.mat) },
  '더운 날 밖에서 놀아요': { prefer: ['short_tee', 'tee', 'shorts'], also: ['shirt'], penalty: ['padding', 'long_padding', 'coat', 'fleece', 'knit'], material: p => p.cotton >= 50 && !mat(p, '기모') },
};
function sitScore(p, name) {
  const r = RULES[name]; let s = 0;
  if (anyOf(p, r.prefer)) s += 2; else if (anyOf(p, r.also)) s += 1;
  if (r.material && r.material(p)) s += 1;
  if (r.pocket && p.pockets >= 1) s += 1;
  if (r.stretch && p.stretch) s += 1;
  if (anyOf(p, r.penalty)) s -= 2;
  return s;
}
const SOFT = /모달|텐셀|리오셀|레이온|비스코스|modal|tencel|lyocell/i;
const ITCHY = /울|아크릴|앙고라|알파카|모헤어|캐시미어/;
const SKIN_FN = [
  p => !ITCHY.test(p.mat) && !/(^|[^가-힣])모\s*[:\d]/.test(p.mat),
  p => (p.cotton >= 95 || SOFT.test(p.mat)) && p.syn.length === 0,
  p => p.cotton >= 50,
];
const MAT_FN = [p => p.cotton >= 80, p => SOFT.test(p.mat), p => p.syn.length === 0];

function sizeFor(h) { const n = Number(h); if (!n || n < 70 || n > 190) return null; return Math.min(170, Math.max(90, Math.ceil(n / 10) * 10)); }

/* ================= state ================= */
const KEY = 'btc:v1';
const blank = () => ({ age: null, height: '', type: null, sit: [], skin: [], mat: [], pocket: null, compare: [], revealed: false, gender: 'boy' });
let S = blank();
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

function checksFor(p) {
  const c = [];
  const sz = sizeFor(S.height);
  if (sz) c.push({ l: `키 ${S.height}cm · ${sz} 사이즈`, ok: p.sizes.includes(sz) });
  else if (S.age) { const a = AGES.find(x => x.k === S.age); c.push({ l: a.l, ok: a.sizes.some(s => p.sizes.includes(s)) }); }
  if (S.type) c.push({ l: S.type, ok: TYPE[S.type] === p.type });
  S.sit.forEach(i => c.push({ l: SITS[i], ok: sitScore(p, SITS[i]) >= 2 }));
  S.skin.forEach(i => c.push({ l: SKIN[i], ok: SKIN_FN[i](p) }));
  S.mat.forEach(i => c.push({ l: MAT_SHORT[i], ok: MAT_FN[i](p) }));
  if (S.pocket === 'need') c.push({ l: '주머니 1개 이상', ok: p.pockets >= 1 });
  return c;
}
function evaluate(p) {
  const c = checksFor(p);
  const hits = c.filter(x => x.ok).length;
  const sit = S.sit.reduce((a, i) => a + sitScore(p, SITS[i]), 0);
  return { p, c, hits, n: c.length, sit, rate: c.length ? Math.round(hits / c.length * 100) : 100 };
}
function ranked(typeOverride) {
  const t = typeOverride !== undefined ? typeOverride : (S.type ? TYPE[S.type] : null);
  return P.filter(p => !t || p.type === t).map(evaluate)
    .sort((a, b) => b.hits - a.hits || b.sit - a.sit || b.p.sizes.length - a.p.sizes.length || a.p.price - b.p.price);
}

/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => '₩' + n.toLocaleString('ko-KR');
const img = id => `/img/${id}.webp`;
const isMobile = () => matchMedia('(max-width: 860px)').matches;
const typeWord = t => ({ '하의': '하의', '상의': '상의', '아우터': '아우터' }[t] || '옷');
const ICON = {
  left: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="#3a230a" stroke-width="1.5"/></svg>',
  right: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" stroke="#3a230a" stroke-width="1.5"/></svg>',
  pocket: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.6" y="2.6" width="10.8" height="10.8" stroke="#3A230A" stroke-width="1.25"/><rect x="2" y="6" width="12" height="1.25" fill="#3A230A"/></svg>',
  stretch: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="7.4" width="12" height="1.25" fill="#3A230A"/><rect x="1" y="4" width="1.25" height="8" fill="#3A230A"/><rect x="13.75" y="4" width="1.25" height="8" fill="#3A230A"/></svg>',
  boy: '<svg width="12" height="9" viewBox="0 0 12 9" aria-hidden="true"><rect x="7.07" width="1.5" height="10" transform="rotate(45 7.07 0)" fill="#3A230A"/></svg>',
  girl: '<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="3" fill="#3A230A"/></svg>',
  uni: '<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><rect x="1" y="3.25" width="6" height="1.5" fill="#3A230A"/></svg>',
};
const GT = { '남아': ['boy', '남아용'], '여아': ['girl', '여아용'], '공용': ['uni', '공용'] };
const gtag = c => `<span class="gtag ${GT[c][0]}">${ICON[GT[c][0]]}${GT[c][1]}</span>`;
const pocketLabel = p => p.pockets >= 1 ? `${p.pockets}개` : '없음';
const stretchLabel = p => p.stretch ? ('있음' + (/폴리우레탄|스판덱스|엘라스테인/.test(p.mat) ? ' · ' + (p.mat.match(/폴리우레탄|스판덱스|엘라스테인/)[0]) : '')) : '없음';
const sizeLabel = p => `${Math.min(...p.sizes)}–${Math.max(...p.sizes)}`;

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `<span aria-hidden="true">✓</span>${esc(msg)}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
function modal(html, label) {
  const layer = $('#layer');
  const prev = document.activeElement;
  layer.innerHTML = `<div class="scrim" role="dialog" aria-modal="true" aria-label="${esc(label || '')}">${html}</div>`;
  const scrim = layer.firstElementChild;
  const close = () => { layer.innerHTML = ''; document.removeEventListener('keydown', onKey); prev && prev.focus && prev.focus(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  scrim.addEventListener('click', e => { if (e.target === scrim || e.target.closest('[data-close]')) close(); });
  const f = scrim.querySelector('button,a'); f && f.focus();
  return close;
}

/* compare */
function toggleCompare(id) {
  const i = S.compare.indexOf(id);
  if (i >= 0) S.compare.splice(i, 1);
  else { if (S.compare.length >= 3) { toast('비교함에는 3벌까지 담을 수 있어요'); return false; } S.compare.push(id); }
  save(); return true;
}
const inCmp = id => S.compare.includes(id);

/* ================= router ================= */
const ROUTES = {
  '/': { r: intro, theme: 'brown', act: 1, title: '' },
  '/situation': { r: situation, theme: 'blue', act: 2, title: '아이에 대해 알려 주세요' },
  '/finder/material': { r: finderMat, theme: 'blue', act: 2, title: '소재' },
  '/finder/pocket': { r: finderPocket, theme: 'blue', act: 2, title: '주머니' },
  '/preparing': { r: preparing, theme: 'blue', act: 2, title: '옷을 고르는 중' },
  '/results': { r: results, theme: 'blue', act: 2, title: '아이에게 잘 맞는 옷' },
  '/legacy': { r: legacy, theme: 'brown', act: 1, title: '익숙한 방식' },
  '/compare': { r: compare, theme: 'cream', act: 3, title: '고른 옷 비교하기' },
  '/card': { r: card, theme: 'brown', act: 3, title: '우리 아이의 옷장 카드' },
  '/about': { r: about, theme: 'cream', act: 0, title: '이 사이트에 대해' },
};
let timer = null;
function path() { let p = location.pathname.replace(/\/+$/, '') || '/'; if (p === '/index.html' || p === '/404.html') p = '/'; return p; }
function go(to, replace) {
  if (replace) history.replaceState({}, '', to); else history.pushState({}, '', to);
  render(); window.scrollTo(0, 0);
}
function render() {
  clearTimeout(timer);
  const p = path();
  const route = ROUTES[p] || { r: notFound, theme: 'blue', act: 0, title: '페이지를 찾을 수 없어요' };
  document.title = (route.title ? route.title + ' · ' : '') + 'Beyond The Color';
  header(route);
  const main = $('#main');
  main.innerHTML = route.r() || '';
  if (route.after) route.after();
  const after = AFTER[route.r.name]; after && after(main);
  $('#layer').innerHTML = '';
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const u = new URL(a.href, location.href);
  if (!/^https?:$/.test(u.protocol) || u.origin !== location.origin) return;
  if (!(u.pathname in ROUTES) && /\.[a-z0-9]+$/i.test(u.pathname)) return;
  if (u.hash && u.pathname === location.pathname) return;
  e.preventDefault(); go(u.pathname + u.search + u.hash);
  if (u.hash) setTimeout(() => { const t = document.getElementById(u.hash.slice(1)); t && t.scrollIntoView(); }, 30);
});
addEventListener('popstate', render);

function header(route) {
  const h = $('#site-header');
  h.dataset.theme = route.theme;
  const acts = [['01', '익숙한 방식', '/legacy'], ['02', '아이 기준', '/situation'], ['03', '차이 확인', '/compare']];
  h.innerHTML = `<a class="logo" href="/">Beyond The Color</a>
  <nav class="prog" aria-label="진행 단계">${acts.map((a, i) => `${i ? '<span class="sep" aria-hidden="true"></span>' : ''}<a class="act${route.act === i + 1 ? ' on' : ''}" href="${a[2]}"${route.act === i + 1 ? ' aria-current="step"' : ''}><span class="n">${a[0]}</span>${a[1]}</a>`).join('')}</nav>
  <a class="about" href="/about">About</a>`;
}

/* ================= screens ================= */
function intro() {
  return `<section class="hero tex-brown">
    <img class="tag-deco palette" src="/img/tag_8alette.svg" alt="">
    <img class="tag-deco kids" src="/img/tag_kids.svg" alt="">
    <div class="hero-copy">
      <p class="hero-eyebrow">더 많은 선택, 더 많은 가능성</p>
      <h1 class="wordmark">Beyond<br>The Color</h1>
      <p class="hero-sub">아이의 다양한 일상을 위한 경계 없는 아동복 탐색 서비스</p>
    </div>
  </section>
  <div class="arc sm tex-brown" style="--arc-to:var(--cream)" aria-hidden="true"></div>
  <section class="how">
    <h2>우리 아이에게 딱 맞는 옷을 찾고 싶다면?</h2>
    <div class="steps">
      <div class="step"><span class="num">1</span><h3>아이의 하루</h3><p>아이가 운동장에서 뛰어노는지, 피부가 예민한지 등 알려주세요.</p></div>
      <div class="step"><span class="num">2</span><h3>꼭 필요한 기능</h3><p>실제 주머니, 신축성, 소재처럼 아이에게 필요한 것을 골라요.</p></div>
      <div class="step"><span class="num">3</span><h3>우리 아이에게 맞는 옷 확인</h3><p>여러 판매처의 옷을 한곳에서 비교하고, 마음에 드는 옷은 판매처로 연결해드릴게요.</p></div>
    </div>
    <a class="btn btn-dark btn-lg" href="/situation">옷 찾으러 가기</a>
  </section>`;
}

const chip = (group, i, label, on, radio) => `<button type="button" class="chip${radio ? ' radio' : ''}" data-g="${group}" data-i="${i}" ${radio ? `role="radio" aria-checked="${on}"` : `aria-pressed="${on}"`}><span class="box" aria-hidden="true"></span>${esc(label)}</button>`;
const pill = (group, k, label, on) => `<button type="button" class="pill" data-g="${group}" data-k="${k}" aria-pressed="${on}">${esc(label)}</button>`;
const qrow = (prev, next, inner) => `<div class="qrow"><a class="circ" href="${prev}" aria-label="이전">${ICON.left}</a><div class="qhead">${inner}</div><a class="circ" href="${next}" aria-label="다음">${ICON.right}</a></div>`;

function situation() {
  return `<section class="stage tex-blue"><div class="qcard">
    ${qrow('/', '/finder/material', `<span class="k" aria-hidden="true">✶</span><h1>아이에 대해 알려 주세요</h1>`)}
    <div class="basics">
      <div class="bgroup"><span class="flabel" id="lb-age">나이</span><div class="pills" role="group" aria-labelledby="lb-age">${AGES.map(a => pill('age', a.k, a.l, S.age === a.k)).join('')}</div></div>
      <div class="bgroup"><label class="flabel" for="h">키</label><div class="hfield"><input id="h" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="예: 123" value="${esc(S.height || '')}" autocomplete="off"><span>cm</span></div><span class="helper" id="h-help">키를 적으면 아이에게 맞는 사이즈로 찾아 드려요</span></div>
      <div class="bgroup"><span class="flabel" id="lb-type">옷 종류</span><div class="pills" role="group" aria-labelledby="lb-type">${Object.keys(TYPE).map(t => pill('type', t, t, S.type === t)).join('')}</div></div>
    </div>
    <div class="divider"></div>
    <p class="sec-label">아이는 어떤 하루를 보내나요?</p>
    <div class="chips">${SITS.map((s, i) => chip('sit', i, s, S.sit.includes(i))).join('')}</div>
    <p class="sec-label">아이의 피부에 맞는 소재를 찾아볼까요?</p>
    <div class="chips">${SKIN.map((s, i) => chip('skin', i, s, S.skin.includes(i))).join('')}</div>
    <div class="qfoot"><span class="meta">Beyond the Color</span><div class="acts"><a class="btn btn-text" href="/finder/material">건너뛰기</a><a class="btn btn-dark" href="/finder/material">아이 옷 찾기</a></div></div>
  </div></section>`;
}
function finderMat() {
  return `<section class="stage tex-blue"><div class="qcard sm">
    ${qrow('/situation', '/finder/pocket', `<span class="k">1 / 2 · 소재</span><h1 class="big">피부에 닿는 소재, 어떤 게 좋을까요?</h1>`)}
    <div class="chips">${MATS.map((s, i) => chip('mat', i, s, S.mat.includes(i))).join('')}</div>
    <p class="qnote">선호하는 소재를 자유롭게 골라주세요. 특별히 선호하는 소재가 없다면 앞서 알려주신 피부 특성을 통해 옷을 추천해드려요.</p>
    <div class="qfoot"><div class="acts"><a class="btn btn-text" href="/finder/pocket">건너뛰기</a><a class="btn btn-dark" href="/finder/pocket">다음</a></div></div>
  </div></section>`;
}
function finderPocket() {
  return `<section class="stage tex-blue"><div class="qcard sm">
    ${qrow('/finder/material', '/preparing', `<span class="k">2 / 2 · 주머니</span><h1 class="big">아이의 하루에 주머니가 필요한가요? <button type="button" class="info-i" data-evidence="pocket" aria-label="이 질문의 근거 보기">i</button></h1>`)}
    <div class="chips" role="radiogroup" aria-label="주머니">${[['any', '상관없어요'], ['need', '1개 이상 필요해요']].map(([k, l]) => chip('pocket', k, l, S.pocket === k, true)).join('')}</div>
    <p class="qnote">실제로 사용할 수 있는 주머니만 반영하며, 장식용 주머니는 제외해요.</p>
    <div class="qfoot"><div class="acts"><a class="btn btn-text" href="/preparing">건너뛰고 결과 보기</a><a class="btn btn-dark" href="/preparing">결과 보기</a></div></div>
  </div></section>`;
}
function bindChoices(main) {
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    const g = b.dataset.g;
    if (g === 'age' || g === 'type') { const k = b.dataset.k; S[g] = S[g] === k ? null : k; main.querySelectorAll(`[data-g=${g}]`).forEach(x => x.setAttribute('aria-pressed', String(S[g] === x.dataset.k))); }
    else if (g === 'pocket') { const k = b.dataset.i; S.pocket = S.pocket === k ? null : k; main.querySelectorAll('[data-g=pocket]').forEach(x => x.setAttribute('aria-checked', String(S.pocket === x.dataset.i))); }
    else { const i = Number(b.dataset.i); const arr = S[g]; const at = arr.indexOf(i); at >= 0 ? arr.splice(at, 1) : arr.push(i); arr.sort((a, c) => a - c); b.setAttribute('aria-pressed', String(arr.includes(i))); }
    save();
  });
  const h = $('#h', main);
  if (h) h.addEventListener('input', () => {
    h.value = h.value.replace(/\D/g, '').slice(0, 3); S.height = h.value; save();
    const help = $('#h-help', main); const sz = sizeFor(h.value);
    help.classList.toggle('err', !!h.value && !sz && h.value.length >= 2);
    help.textContent = !h.value ? '키를 적으면 아이에게 맞는 사이즈로 찾아 드려요' : sz ? `${sz} 사이즈로 찾아 드려요` : (h.value.length >= 2 ? '70~190cm 사이로 적어 주세요' : '키를 적으면 아이에게 맞는 사이즈로 찾아 드려요');
  });
  main.addEventListener('click', e => { if (e.target.closest('[data-evidence]')) evidenceModal(); });
}
function evidenceModal() {
  modal(`<div class="modal" style="max-width:420px"><div class="top"><span></span><button class="btn btn-line btn-sq" data-close>닫기</button></div>
    <div class="ecard" style="background:var(--surface)"><span class="k">Research</span><p>아동 바지 901벌을 분석했더니, 실제 주머니와 무릎 보강은 남아 바지에 더 자주 들어가 있었어요.</p><span class="src">McKinney, Martindale &amp; Miller (2023)</span><span class="src2">미국 아동 기성복 바지 901벌 분석</span></div></div>`, '주머니 질문의 근거');
}

function preparing() {
  const list = ranked().map(e => e.p);
  const pool = (list.length >= 36 ? list : list.concat(P.filter(p => !list.includes(p)))).slice(0, 36);
  const mob = isMobile();
  const ring = (cls, items, R, size) => `<div class="ring ${cls}" style="width:${R * 2}px;height:${R * 2}px" aria-hidden="true">${items.map((p, i) => {
    const a = i * 360 / items.length;
    return `<div class="tile" style="width:${size}px;height:${size}px;transform:translate(-50%,-50%) rotate(${a}deg) translateY(-${R}px) rotate(180deg)"><img src="${img(p.id)}" alt="" loading="eager"></div>`;
  }).join('')}</div>`;
  return `<section class="prep tex-blue">
    ${ring('outer', pool.slice(0, 22), mob ? 180 : 300, mob ? 44 : 72)}
    ${ring('inner', pool.slice(22, 36), mob ? 132 : 210, mob ? 38 : 64)}
    <div class="prep-msg" role="status"><b>아이에게 맞는 옷을 고르는 중이에요</b><span id="prep-n">${TOTAL}벌을 살펴보는 중</span></div>
  </section>`;
}

let heroIdx = 0, gridShown = 0;
function condSummary() {
  const parts = [];
  if (S.type) parts.push(S.type);
  const sz = sizeFor(S.height);
  if (sz) parts.push(`키 ${S.height}cm`); else if (S.age) parts.push(AGES.find(a => a.k === S.age).l);
  S.sit.forEach(i => parts.push(SITS[i])); S.skin.forEach(i => parts.push(SKIN[i])); S.mat.forEach(i => parts.push(MAT_SHORT[i]));
  if (S.pocket === 'need') parts.push('주머니 1개 이상');
  return parts.length ? parts : ['조건 없이 전체'];
}
function legacyPrompt(extra) {
  return `<a class="lprompt ${extra || ''}" href="/legacy"><div><b>성별 카테고리를 왜 없앴을까요?</b><span>아이에게 정말 필요한 것이 무엇인지, 새로운 기준으로 옷을 바라보세요.</span></div><span class="switch" aria-hidden="true"></span><span class="sr">기존 쇼핑몰 방식으로 보기</span></a>`;
}
function badgesFor(p) {
  const b = [];
  if (p.pockets >= 1) b.push(`<span class="badge${S.pocket === 'need' ? ' hl' : ''}">${ICON.pocket}실제 주머니</span>`);
  if (p.stretch) b.push(`<span class="badge">${ICON.stretch}신축성</span>`);
  if (p.cotton >= 95) b.push(`<span class="badge${S.mat.includes(0) ? ' hl' : ''}">면 ${p.cotton >= 100 ? '100%' : '95% 이상'}</span>`);
  else if (SOFT.test(p.mat)) b.push(`<span class="badge${S.mat.includes(1) ? ' hl' : ''}">부드러운 소재</span>`);
  return b.join('');
}
function cardHTML(e, opt = {}) {
  const p = e.p; const on = inCmp(p.id);
  const seg = e.n ? Math.round(e.hits / e.n * 5) : 5;
  return `<article class="card${e.n && e.hits / e.n < .5 ? ' dim' : ''}">
    <div class="ph"><img src="${img(p.id)}" alt="${esc(p.brand + ' ' + p.name)}" loading="lazy" width="480" height="600"><a href="${esc(p.link)}" target="_blank" rel="noopener" aria-label="${esc(p.name)} 판매처에서 보기 (새 탭)"></a></div>
    <div class="inf">
      ${opt.head || ''}<span class="brand">${esc(p.brand)}</span><h3 class="name">${esc(p.name)}</h3><span class="price">${won(p.price)}</span>
      <div class="badges">${badgesFor(p)}</div>
      <div class="cfoot"><span class="match"><span class="meter" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i class="${i < seg ? 'on' : ''}"></i>`).join('')}</span>${e.n ? `조건 ${e.hits}/${e.n} 일치` : '조건 없이 전체'}</span>
      <button type="button" class="cmpbtn${on ? ' on' : ''}" data-cmp="${p.id}" aria-pressed="${on}">${on ? '✓ 비교함에 담김' : '+ 비교함'}</button></div>
    </div></article>`;
}
function results() {
  const R = ranked();
  if (!R.length) return `<section class="stage tex-blue"><div class="qcard sm"><h1>조건에 맞는 옷이 없어요</h1><a class="btn btn-dark" href="/situation">조건 바꾸기</a></div></section>`;
  heroIdx = Math.min(heroIdx, Math.min(3, R.length) - 1);
  const step = isMobile() ? [2, 4] : [8, 8];
  if (!gridShown) gridShown = step[0];
  return `<section class="tex-blue"><div class="res-stage">
    <div class="res-head"><h1>아이에게 잘 맞는 옷</h1><p>성별이 아닌 아이의 일상과 필요를 기준으로 골랐어요.</p></div>
    <div id="rhero">${heroHTML(R)}</div>
    <div class="dock"><div class="conds"><span class="k">고른 조건</span><div class="row"><b>${esc(condSummary().join(' · '))}</b><a href="/situation">바꾸기</a></div></div>${legacyPrompt()}</div>
  </div></section>
  <div class="arc tex-blue" style="--arc-to:var(--cream)" aria-hidden="true"></div>
  <section class="gridsec" aria-labelledby="g-h">
    <div class="ghead"><h2 id="g-h">아이에게 잘 맞는 순서로 전체 보기</h2><span>조건 일치 순 정렬 · ${R.length}벌</span></div>
    <div class="pgrid" id="pgrid">${R.slice(0, gridShown).map(e => `<div class="cell">${cardHTML(e)}</div>`).join('')}</div>
    ${gridShown < R.length ? `<button type="button" class="btn btn-line btn-sq more" id="more">${Math.min(step[1], R.length - gridShown)}벌 더 보기</button>` : ''}
  </section>
  <div class="lp-mobile">${legacyPrompt()}</div>
  ${cbarHTML()}`;
}
function heroHTML(R) {
  const e = R[heroIdx]; const p = e.p; const on = inCmp(p.id);
  const total = Math.min(3, R.length);
  const lines = e.c.map(x => `<li>${x.ok ? '✓' : '–'}&nbsp; ${esc(x.l)}</li>`);
  if (!sizeFor(S.height) && !S.age) lines.unshift('<li>–&nbsp; 키를 적지 않아 모든 사이즈를 봤어요</li>');
  return `<div class="rhero">
    <div class="rnav"><button type="button" class="circ" data-hero="-1" aria-label="이전 추천">${ICON.left}</button><div class="dots" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<i class="${i === heroIdx ? 'on' : ''}"></i>`).join('')}</div><button type="button" class="circ" data-hero="1" aria-label="다음 추천">${ICON.right}</button></div>
    <button type="button" class="circ" data-hero="-1" aria-label="이전 추천">${ICON.left}</button>
    <div class="rate"><span class="k">조건 일치율</span><span class="v">${e.rate}%</span><span class="s">${e.n ? `고른 조건 ${e.n}개 중 ${e.hits}개가 맞아요` : '고른 조건이 없어 모든 옷을 봤어요'}</span><span class="t">이 사이트 데이터 · ${TOTAL}벌 중 계산</span></div>
    <div class="rimg"><img src="${img(p.id)}" alt="${esc(p.brand + ' ' + p.name)}" width="480" height="600"></div>
    <div class="rinfo"><span class="k">추천 top ${heroIdx + 1}</span><h2>${esc(p.name)}</h2><span class="bp">${esc(p.brand)} · ${won(p.price)}</span>
      <ul>${lines.slice(0, 6).join('')}</ul>
      <div class="acts"><a class="btn btn-dark btn-sq" href="${esc(p.link)}" target="_blank" rel="noopener">판매처에서 보기 ↗</a><button type="button" class="btn btn-line btn-sq" data-cmp="${p.id}" aria-pressed="${on}">${on ? '비교함에 담김 ✓' : '비교함에 담기'}</button></div>
    </div>
    <button type="button" class="circ" data-hero="1" aria-label="다음 추천">${ICON.right}</button>
  </div>`;
}
function cbarHTML() {
  const items = S.compare.map(id => BY[id]).filter(Boolean);
  return `<div class="cbar-wrap" id="cbar"><div class="cbar" role="region" aria-label="비교함">
    <span class="cnt">비교함 ${items.length}/3</span>
    <div class="slots">${[0, 1, 2].map(i => items[i] ? `<div class="slot"><img src="${img(items[i].id)}" alt="${esc(items[i].name)}"><button type="button" data-cmp="${items[i].id}" aria-label="${esc(items[i].name)} 빼기">빼기</button></div>` : '<div class="slot" aria-hidden="true"></div>').join('')}</div>
    <span class="sp"></span>
    ${items.length ? '<button type="button" class="clear" data-clear>비우기</button>' : ''}
    <a class="go" href="/compare"${items.length ? '' : ' aria-disabled="true"'}>비교하기</a>
  </div></div>`;
}
function refreshCompareUI(main) {
  main.querySelectorAll('[data-cmp]').forEach(b => {
    const on = inCmp(b.dataset.cmp);
    b.setAttribute('aria-pressed', String(on));
    if (b.classList.contains('cmpbtn')) { b.classList.toggle('on', on); b.textContent = on ? '✓ 비교함에 담김' : '+ 비교함'; }
    else if (b.classList.contains('btn')) b.textContent = on ? '비교함에 담김 ✓' : '비교함에 담기';
  });
  const cb = $('#cbar', main); if (cb) cb.outerHTML = cbarHTML();
}
function bindResults(main) {
  const R = ranked();
  main.addEventListener('click', e => {
    const h = e.target.closest('[data-hero]');
    if (h) { const n = Math.min(3, R.length); heroIdx = (heroIdx + Number(h.dataset.hero) + n) % n; $('#rhero', main).innerHTML = heroHTML(R); return; }
    const c = e.target.closest('[data-cmp]');
    if (c) { toggleCompare(c.dataset.cmp); refreshCompareUI(main); return; }
    if (e.target.closest('[data-clear]')) { S.compare = []; save(); refreshCompareUI(main); return; }
    if (e.target.closest('#more')) {
      const step = isMobile() ? 4 : 8; const from = gridShown; gridShown = Math.min(R.length, gridShown + step);
      $('#pgrid', main).insertAdjacentHTML('beforeend', R.slice(from, gridShown).map(x => `<div class="cell">${cardHTML(x)}</div>`).join(''));
      const m = $('#more', main);
      if (gridShown >= R.length) m.remove(); else m.textContent = `${Math.min(step, R.length - gridShown)}벌 더 보기`;
      const first = $('#pgrid', main).children[from]; first && first.querySelector('a,button') && first.querySelector('button').focus({ preventScroll: true });
    }
    const go2 = e.target.closest('.go[aria-disabled=true]'); if (go2) { e.preventDefault(); e.stopPropagation(); toast('결과 목록에서 ‘+ 비교함’을 눌러 담아 보세요'); }
  });
}

/* ---- legacy ---- */
const COLOR_GROUPS = [
  ['neutral', '뉴트럴', ['GRAY', 'BLACK', 'BEIGE', 'WHITE']], ['red', '레드·핑크·퍼플', ['PINK', 'RED', 'BURGUNDY', 'PURPLE']],
  ['blue', '블루·네이비', ['NAVY', 'BLUE', 'LIGHT BLUE']], ['green', '그린·카키', ['GREEN', 'KHAKI']], ['yellow', '옐로·오렌지·브라운', ['BROWN', 'YELLOW', 'ORANGE']],
];
function colorStats() {
  const cats = [['남아', 'boy'], ['여아', 'girl'], ['공용', 'uni']];
  let options = 0;
  P.forEach(p => options += p.colors.filter(c => c !== 'RAINBOW').length);
  return {
    options, rows: cats.map(([c, k]) => {
      const items = P.filter(p => p.cat.includes(c));
      const counts = COLOR_GROUPS.map(g => items.reduce((a, p) => a + p.colors.filter(x => g[2].includes(x)).length, 0));
      const sum = counts.reduce((a, b) => a + b, 0) || 1;
      return { c, k, items: items.length, counts, pct: counts.map(n => n / sum * 100) };
    })
  };
}
function legacy() {
  const typeKey = S.type || '바지'; const T = TYPE[typeKey]; const tw = typeWord(T);
  const g = S.gender === 'girl' ? 'girl' : 'boy';
  const gname = g === 'boy' ? '남아' : '여아'; const other = g === 'boy' ? '여아' : '남아';
  const R = ranked(T);
  const legacySet = R.filter(e => e.p.cat.includes(gname) || e.p.cat.includes('공용'));
  const hidden = R.filter(e => !legacySet.includes(e));
  const full = e => e.n ? e.hits === e.n : true;
  const metric = set => [[`조건을 모두 충족하는 ${tw}는`, set.filter(full).length], [`주머니 1개 이상인 ${tw}는`, set.filter(e => e.p.pockets >= 1).length], [`면 95% 이상인 ${tw}는`, set.filter(e => e.p.cotton >= 95).length]]
    .map(([l, n]) => `<div class="r"><span>${l}</span><b>${n}벌</b></div>`).join('');
  const thumbs = (set, mark) => `<div class="thumbs">${set.map(e => `<div class="t${mark && hidden.includes(e) ? ' hid' : ''}"><img src="${img(e.p.id)}" alt="${esc(e.p.name)}" loading="lazy"></div>`).join('')}</div>`;
  const cs = colorStats();
  return `<section class="lg-intro tex-brown">
    <h1>성별을 선택하면 얼마나 많은 옷을 놓치게 될까요?</h1>
    <p>기존 쇼핑몰처럼 남아복 또는 여아복을 선택해 보세요. 얼마나 많은 옷이 제외되는지 확인할 수 있어요.</p>
    <div class="chooser" role="group" aria-label="카테고리 선택">
      <button type="button" data-gender="boy" aria-pressed="${g === 'boy'}">${gtag('남아')} 남아 카테고리로 보기</button>
      <button type="button" data-gender="girl" aria-pressed="${g === 'girl'}">${gtag('여아')} 여아 카테고리로 보기</button>
    </div>
  </section>
  <div class="arc tex-brown" style="--arc-to:var(--cream)" aria-hidden="true"></div>
  <section style="background:var(--cream)"><div class="split">
    <div class="panel">
      <div class="ph-head">${gtag(gname)} 기존 쇼핑몰 · ${gname} + 공용 카테고리 [${tw} 기준]</div>
      <div class="count"><b>${legacySet.length}</b><span>벌</span></div>
      <span class="cap">같은 조건에서 보이는 옷 · 이 사이트의 옷 ${TOTAL}벌 ${tw} 기준</span>
      ${thumbs(legacySet)}
      <div class="metrics">${metric(legacySet)}</div>
    </div>
    <div><div class="gap-badge"><b>${hidden.length}벌</b><span>안 보였어요</span></div></div>
    <div class="panel beyond">
      <div class="ph-head">Beyond The Color · 성별의 경계를 없애면</div>
      <div class="count"><b>${R.length}</b><span>벌</span></div>
      <span class="cap">같은 조건에서 보이는 옷 · 이 사이트의 옷 ${TOTAL}벌 ${tw} 기준</span>
      ${thumbs(R, true)}
      ${hidden.length ? '<div class="legend"><i aria-hidden="true"></i>기존 방식에서는 보이지 않았던 옷</div>' : ''}
      <div class="metrics">${metric(R)}</div>
    </div>
  </div></section>
  ${hidden.length ? `<section class="hidden-items">
    <h2>성별의 구분을 없앴을 뿐인데, 아이에게 잘 맞는 옷이 ${hidden.length}벌 더 늘어났어요.</h2>
    <p class="sub">아래의 ${tw}들은 모두 ${other} 카테고리에 속해 있지만, 아이가 선택한 조건에도 잘 맞는 옷이에요.</p>
    <div class="hgrid" id="hgrid">${hidden.slice(0, 4).map(e => cardHTML(e, { head: `<span class="hcard-k">판매처 분류 ${e.p.cat.map(gtag).join('')}</span>` })).join('')}</div>
    ${hidden.length > 4 ? `<button type="button" class="btn btn-line btn-sq more" id="hmore">${hidden.length - 4}벌 더 보기</button>` : ''}
  </section>` : ''}
  <div class="arc" style="background:var(--cream);--arc-to:var(--blue)" aria-hidden="true"></div>
  <section class="colors tex-blue" aria-labelledby="c-h">
    <h2 id="c-h">성별에 따라 나뉘는 아동복의 색상</h2>
    <p class="sub">판매처의 기존 성별 분류를 기준으로, 각 카테고리에서 판매되는 색상 옵션의 분포를 살펴봤어요.</p>
    <div class="bands">${cs.rows.map(r => `<div class="band"><span class="lb">${gtag(r.c)} ${r.c} 카테고리 ${r.items}벌</span><div class="bar" role="img" aria-label="${r.c} 카테고리 색상 분포: ${COLOR_GROUPS.map((g2, i) => `${g2[1]} ${Math.round(r.pct[i])}%`).join(', ')}">${r.pct.map((w, i) => `<i class="sw-${COLOR_GROUPS[i][0]}" style="width:${w}%"></i>`).join('')}</div></div>`).join('')}</div>
    <div class="clegend">${COLOR_GROUPS.map(g2 => `<span><i class="sw-${g2[0]}"></i>${g2[1]}</span>`).join('')}<button type="button" class="btn btn-text" data-ctable>표로 보기</button></div>
    <div class="note"><b>‘남아는 파랑, 여아는 분홍’이라는 전통적인 성별 고정관념이 반영되고 있음을 보여줘요.</b><span>이 사이트의 옷 ${TOTAL}벌 · 색 옵션 ${cs.options}개 기준 · 2026. 11. 22 · 남아·공용으로 함께 분류된 옷은 두 분류에 모두 셌어요</span></div>
  </section>
  <div class="arc tex-blue" style="--arc-to:var(--brown)" aria-hidden="true"></div>
  ${researchHTML()}`;
}
function researchHTML() {
  return `<section class="research tex-brown" aria-labelledby="r-h">
    <h2 id="r-h">아동복 속 젠더 규범, 연구자료 살펴보기</h2>
    <div class="ecards">
      <div class="ecard"><span class="k">Research</span><span class="big">37%</span><p>아동 그래픽 티셔츠 240점 중 37%에서 성별 고정관념 요소가 발견됐어요. 남아용은 47%, 여아용은 28%였어요.</p><span class="src">Rosseel &amp; Bouko (2026)</span><span class="src2">벨기에 6개 브랜드 · 2~7세 그래픽 티셔츠 240점</span></div>
      <div class="ecard"><span class="k">Research</span><span class="big">4%</span><p>조사 표본에서 여아복이 남아복보다 평균 4% 비쌌어요.</p><span class="src">NYC DCA (2015), From Cradle to Cane</span><span class="src2">뉴욕시 매장 표본 조사 · 아동복 부문</span></div>
      <div class="ecard"><span class="k">Research</span><p>아동 바지 901벌을 분석했더니, 실제 주머니와 무릎 보강은 남아 바지에 더 자주 들어가 있었어요.</p><span class="src">McKinney, Martindale &amp; Miller (2023)</span><span class="src2">미국 아동 기성복 바지 901벌 분석</span></div>
    </div>
    <div class="ctas"><a class="btn btn-cream btn-lg" href="/card">우리 아이 옷장 카드 만들기</a><a class="btn btn-mocha btn-lg" href="/compare">고른 옷 비교하기</a></div>
  </section>`;
}
function colorTableModal() {
  const cs = colorStats();
  modal(`<div class="modal"><div class="top"><h2>성별 카테고리별 아동복 색상 분포</h2><button class="btn btn-line btn-sq" data-close>닫기</button></div>
    <div class="tscroll"><table class="ctab"><thead><tr><th>분류</th>${COLOR_GROUPS.map(g => `<th>${g[1]}</th>`).join('')}</tr></thead>
    <tbody>${cs.rows.map(r => `<tr><td>${gtag(r.c)}</td>${r.counts.map((n, i) => `<td>${n} (${Math.round(r.pct[i])}%)</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <small>이 사이트의 옷 ${TOTAL}벌 · 색 옵션 기준 · 2026. 11. 22 · 남아·공용으로 함께 분류된 옷은 두 분류에 모두 셌어요. 무지개(멀티 컬러)는 계열 구분에서 뺐어요.</small></div>`, '색상 분포 표');
}
function bindLegacy(main) {
  main.addEventListener('click', e => {
    const gb = e.target.closest('[data-gender]');
    if (gb) { S.gender = gb.dataset.gender; save(); const y = scrollY; render(); scrollTo(0, y); return; }
    if (e.target.closest('[data-ctable]')) { colorTableModal(); return; }
    const c = e.target.closest('[data-cmp]'); if (c) { toggleCompare(c.dataset.cmp); refreshCompareUI(main); return; }
    const hm = e.target.closest('#hmore');
    if (hm) {
      const T = TYPE[S.type || '바지']; const R = ranked(T); const gname = S.gender === 'girl' ? '여아' : '남아';
      const hidden = R.filter(x => !(x.p.cat.includes(gname) || x.p.cat.includes('공용')));
      $('#hgrid', main).insertAdjacentHTML('beforeend', hidden.slice(4).map(x => cardHTML(x, { head: `<span class="hcard-k">판매처 분류 ${x.p.cat.map(gtag).join('')}</span>` })).join(''));
      hm.remove();
    }
  });
}

/* ---- compare ---- */
function compare() {
  const items = S.compare.map(id => BY[id]).filter(Boolean);
  const rows = [
    ['소재', p => esc(p.mat || '–'), p => S.mat.includes(2) && p.syn.length === 0],
    ['실제 주머니', pocketLabel, p => S.pocket === 'need' && p.pockets >= 1],
    ['신축성', stretchLabel, () => false],
    ['면 비율', p => `${p.cotton}%${S.mat.includes(0) && p.cotton >= 80 ? '<span class="mt">조건 일치</span>' : ''}`, p => S.mat.includes(0) && p.cotton >= 80],
    ['옷 종류', p => esc(p.detail || p.type), () => false],
    ['사이즈', sizeLabel, p => { const sz = sizeFor(S.height); return !!sz && p.sizes.includes(sz); }],
  ];
  const table = items.length ? `<div class="tscroll"><table class="ctable">
    <thead><tr><th scope="col"><span class="sr">항목</span></th>${items.map(p => `<td><div class="prod"><div class="ph"><img src="${img(p.id)}" alt="${esc(p.name)}"></div><span class="brand" style="font-size:12px;color:var(--ink-2)">${esc(p.brand)}</span><b>${esc(p.name)}</b><span>${won(p.price)}</span><a class="btn btn-text" style="padding:0;min-height:0;justify-content:flex-start" href="${esc(p.link)}" target="_blank" rel="noopener">판매처에서 보기 ↗</a><button type="button" class="rm" data-cmp="${p.id}">비교함에서 빼기</button></div></td>`).join('')}</tr></thead>
    <tbody>${rows.map(([l, f, hl]) => `<tr><th scope="row">${l}</th>${items.map(p => `<td class="${hl(p) ? 'hl' : ''}">${f(p)}</td>`).join('')}</tr>`).join('')}
    <tr class="reveal"><th scope="row"><div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">판매처의 기존 성별 분류<button type="button" class="btn ${S.revealed ? 'btn-cream' : 'btn-cream'} btn-sq" data-reveal>${S.revealed ? '다시 가리기' : '공개하기'}</button></div></th>
      ${items.map(p => `<td>${S.revealed ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${p.cat.map(gtag).join('')}</div>` : '<span class="muted">가려 둠</span>'}</td>`).join('')}</tr>
    </tbody></table></div>
    ${S.revealed ? '<div class="after"><span>공개됨</span><b>아이에게 필요한 기능을 기준으로 고른 옷들이지만, 판매처에서는 서로 다른 성별 카테고리로 나뉘어 있었을 수 있어요.</b></div>' : '<div class="after"><span>공개하면</span><b>성별을 모르고 고른 옷은 원래 어떤 카테고리에 있었을까요? 위 버튼을 눌러 확인해 보세요.</b></div>'}`
    : `<p class="empty">아직 비교함이 비어 있어요. <a href="/results">결과 목록</a>에서 ‘+ 비교함’을 눌러 3벌까지 담아 보세요.</p>`;
  return `<section class="cmp">
    <div class="cmp-intro"><div><h1>옷의 기능을 기준으로 골라 보세요.</h1><p>판매처의 기존 성별 분류는 잠시 가려두었어요. 옷을 모두 고른 뒤, 하단에서 확인해 보세요.</p></div>${legacyPrompt('top')}</div>
    ${table}
    ${legacyPrompt('lp-bottom" style="display:none')}
  </section>`;
}
function bindCompare(main) {
  main.addEventListener('click', e => {
    const c = e.target.closest('[data-cmp]'); if (c) { toggleCompare(c.dataset.cmp); render(); return; }
    if (e.target.closest('[data-reveal]')) { S.revealed = !S.revealed; save(); const y = scrollY; render(); scrollTo(0, y); }
  });
}

/* ---- card ---- */
function cardPills() {
  const basics = [];
  const sz = sizeFor(S.height);
  if (sz) basics.push(`키 ${S.height}cm · ${sz} 사이즈`); else if (S.age) basics.push(AGES.find(a => a.k === S.age).l);
  if (S.type) basics.push(S.type);
  const conds = [...S.sit.map(i => SITS[i]), ...S.skin.map(i => SKIN[i]), ...S.mat.map(i => MATS[i])];
  if (S.pocket === 'need') conds.push('주머니 1개 이상');
  return { basics, conds };
}
function card() {
  const { basics, conds } = cardPills();
  return `<section class="tex-brown"><div class="mc-hero">
    <div><h1>우리 아이의 옷장 카드</h1><p>성별의 경계를 넘어 발견한 새로운 선택을 한 장에 담았어요.<br>오늘의 경험을 저장하고 공유하며, 작은 변화를 함께 만들어 보세요.</p>
      <div class="ctas"><button type="button" class="btn btn-cream btn-lg btn-sq" data-save>이미지로 저장</button><button type="button" class="btn btn-mocha btn-lg btn-sq" data-copy>링크 복사</button></div></div>
    <div class="share-card" id="share-card" aria-label="우리 아이의 옷장 카드 미리보기">
      <div><div class="wm">Beyond The Color</div><h2>우리 아이의 옷 기준</h2>
        ${basics.length ? `<div class="pills2 basic">${basics.map(b => `<span>${esc(b)}</span>`).join('')}</div>` : ''}
        ${conds.length ? `<div class="pills2">${conds.map(b => `<span>${esc(b)}</span>`).join('')}</div>` : (basics.length ? '' : '<p style="margin:16px 0 0;font-size:14px;color:var(--ink-2)">아직 고른 조건이 없어요. <a href="/situation">아이 기준 고르기</a></p>')}
      </div>
      <span class="foot">더 넓은 옷장을 만드는 첫걸음</span>
    </div>
  </div></section>
  <div class="arc tex-brown" style="--arc-to:var(--cream)" aria-hidden="true"></div>
  <section class="manifesto">
    <p class="disp">아이를 <i aria-hidden="true"></i> 있는 그대로,</p>
    <div class="txt"><p>옷에는 성별이 없습니다.<br>주머니는 누구의 손에도 필요하고, 핑크와 리본도 누구나 좋아할 수 있어요.<br>우리가 바꾸려는 건 색이 아니라, 색이 정해 놓은 칸입니다.</p>
    <p>모든 아이가 성별이라는 기준을 넘어<br>자신의 취향과 필요에 따라 옷을 선택할 수 있도록.</p></div>
    <p class="sig">Beyond the Color.</p><p class="sig2">색의 경계를 넘어, 아이만의 가능성으로.</p>
  </section>
  <div class="arc" style="background:var(--cream);--arc-to:var(--brown)" aria-hidden="true"></div>
  <section class="cases tex-brown"><h2>옷을 나누는 기준, 달라질 수 있어요.</h2>
    <p class="sub">남아복과 여아복이라는 구분은 반드시 지켜야 할 기준이 아니에요. 이미 성별 대신 아이의 취향과 필요를 중심으로 옷을 제안하는 곳들이 있어요.</p>
    <div class="ecards">
      <div class="ecard"><span class="k">Case</span><span class="ttl">Let Girls Be Girls</span><p>아동 상품에 성적 의미를 덧씌우는 디자인을 멈춰 달라는 캠페인이에요.</p><span class="src">Mumsnet (2010)</span></div>
      <div class="ecard"><span class="k">Case</span><span class="ttl">Let Clothes Be Clothes</span><p>영국에서 아동복의 성별 고정관념과 불필요한 성별 구분을 비판해 온 캠페인이에요.</p><span class="src">letclothesbeclothes.co.uk</span></div>
      <div class="ecard"><span class="k">Case</span><span class="ttl">John Lewis, 2017</span><p>영국 백화점이 아동복 라벨에서 ‘남아’ ‘여아’ 표기를 없앴어요.</p><span class="src">British Vogue (2017)</span></div>
    </div></section>
  <div class="arc tex-brown" style="--arc-to:var(--blue)" aria-hidden="true"></div>
  <section class="actions tex-blue"><h2>더 넓은 옷장을 만드는 첫걸음</h2>
    <div class="acards">
      <div class="acard"><b>성별 탭 대신 기능으로 찾기</b><p>쇼핑몰 검색창에 ‘주머니’ ‘스판’ ‘면 100%’처럼 아이에게 필요한 기능을 먼저 넣어 보세요.</p></div>
      <div class="acard"><b>판매처에 물어보기</b><p>‘공용’ 표기나 기능 필터가 있으면 좋겠다고 판매처에 의견을 남겨 보세요.</p></div>
      <div class="acard"><b>문제 인식 나누기</b><p>아이를 키우는 주변 사람에게 여아/남아 구분 없이도 아이에게 딱 맞는 옷을 찾을 수 있다고 말해보세요!</p></div>
    </div>
    <div class="ctas"><button type="button" class="btn btn-dark btn-lg btn-sq" data-restart>처음부터 다시 해 보기</button><a class="btn btn-text" href="/about#refs">근거 자료 전체 보기</a></div>
  </section>
  ${footerHTML('tex-blue')}`;
}
function footerHTML(cls) {
  return `<footer class="foot-site ${cls || ''}"><a class="logo" href="/">Beyond The Color</a><nav aria-label="사이트 정보"><a href="/about">About</a><a href="/about#refs">근거 자료</a><a href="/about#data">데이터 수집 방법</a></nav><small>© 2026 Beyond The Color 팀</small></footer>`;
}
const b64e = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
function shareURL() { return location.origin + '/card?c=' + b64e({ a: S.age, h: S.height, t: S.type, s: S.sit, k: S.skin, m: S.mat, p: S.pocket }); }
async function copyLink() {
  const url = shareURL();
  try { await navigator.clipboard.writeText(url); toast('공유 링크를 복사했어요'); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('공유 링크를 복사했어요'); } catch (e2) { prompt('이 링크를 복사해 주세요', url); }
    ta.remove();
  }
}
function wrapPills(ctx, list, x, y, maxW, fill) {
  const H = 64, PX = 32, G = 16; let cx = x, cy = y;
  ctx.font = '500 28px "Pretendard Variable", Pretendard, sans-serif';
  for (const t of list) {
    const w = Math.min(maxW, ctx.measureText(t).width + PX * 2);
    if (cx + w > x + maxW) { cx = x; cy += H + G; }
    ctx.beginPath(); ctx.roundRect(cx, cy, w, H, H / 2);
    if (fill) { ctx.fillStyle = '#3a230a'; ctx.fill(); ctx.fillStyle = '#fffdf5'; } else { ctx.lineWidth = 2; ctx.strokeStyle = '#3a230a'; ctx.stroke(); ctx.fillStyle = '#3a230a'; }
    ctx.textBaseline = 'middle'; ctx.fillText(t, cx + PX, cy + H / 2 + 1, maxW - PX * 2);
    cx += w + G;
  }
  return cy + H;
}
async function saveImage() {
  try {
    await Promise.all([document.fonts.load('48px "Henny Penny"'), document.fonts.load('700 56px "Pretendard Variable"'), document.fonts.load('500 28px "Pretendard Variable"')]);
  } catch (e) { }
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#f1eccf'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#3a230a'; x.textBaseline = 'top';
  x.font = '104px "Henny Penny", serif'; x.fillText('Beyond The Color', 88, 96, W - 176);
  x.font = '700 60px "Pretendard Variable", Pretendard, sans-serif'; x.fillText('우리 아이의 옷 기준', 88, 236);
  const { basics, conds } = cardPills();
  let y = 360;
  if (basics.length) y = wrapPills(x, basics, 88, y, W - 176, true) + 24;
  if (conds.length) y = wrapPills(x, conds, 88, y, W - 176, false);
  x.textBaseline = 'alphabetic'; x.fillStyle = '#6b5a43'; x.font = '400 30px "Pretendard Variable", Pretendard, sans-serif';
  x.fillText('더 넓은 옷장을 만드는 첫걸음', 88, H - 96);
  x.textAlign = 'right'; x.fillText(location.host || 'Beyond The Color', W - 88, H - 96);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'beyond-the-color-card.png', { type: 'image/png' });
  if (isMobile() && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: '우리 아이의 옷장 카드' }); toast('기준 카드 이미지를 저장했어요'); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  modal(`<div class="modal" style="max-width:460px"><div class="top"><h2>우리 아이의 옷장 카드</h2><button class="btn btn-line btn-sq" data-close>닫기</button></div>
    <img src="${url}" alt="우리 아이의 옷장 카드 이미지" style="width:100%;border-radius:8px;box-shadow:var(--shadow)">
    <a class="btn btn-dark btn-sq" href="${url}" download="${file.name}" id="dl-card">이미지 내려받기</a>
    <small>휴대폰에서는 이미지를 길게 눌러 사진에 저장할 수도 있어요.</small></div>`, '옷장 카드 이미지');
  const dl = document.getElementById('dl-card');
  dl && dl.addEventListener('click', () => setTimeout(() => toast('기준 카드 이미지를 저장했어요'), 300));
}
function bindCard(main) {
  main.addEventListener('click', e => {
    if (e.target.closest('[data-save]')) saveImage();
    else if (e.target.closest('[data-copy]')) copyLink();
    else if (e.target.closest('[data-restart]')) { const cmp = S.compare; S = blank(); S.compare = cmp; heroIdx = 0; gridShown = 0; save(); go('/situation'); }
  });
}

/* ---- about ---- */
function about() {
  const ref = (t, url) => `<li>${esc(t)}${url ? ` <a href="${url}" target="_blank" rel="noopener">${esc(url.replace(/^https?:\/\//, ''))}</a>` : ''}</li>`;
  return `<section class="aboutpg">
    <h1>이 사이트에 대해</h1>
    <p class="lead">Beyond the Color는 남아복·여아복·공용으로 판매되는 실제 아동복을 성별 구분 없이 탐색하고 비교할 수 있도록 기획한
숙명여자대학교 홍보광고학과 ‘광고와 대중문화’ 8조 8alette의 프로젝트 캠페인 사이트입니다.
본 프로젝트는 아동복의 성별 구분이 아이의 선택지를 제한하고 성별 고정관념의 형성에 영향을 미칠 수 있다는 문제의식에서 출발했습니다. 이러한 문제를 단순히 설명하는 데 그치지 않고, 이용자가 직접 옷을 탐색하고 비교하는 과정에서 인식할 수 있도록 기획했습니다.
궁극적으로 성별이 아닌 아이의 취향과 일상, 필요를 중심으로 옷을 선택하는 문화를 제안하고자 합니다.</p>
    <div class="facts" id="data">
      <div class="fact"><h2>상품 데이터</h2><p>7개 판매처가 설정한 남아·여아·공용 분류에 기반하여 제품을 수집했습니다. 판매처 카테고리의 인기순 상위 상품을 먼저 가져왔습니다. 상품 정보 기준일은 2026년 11월 22일입니다.</p></div>
      <div class="fact"><h2>근거 데이터</h2><p>시장에 대한 자료는 하단에 표기한 연구와 조사의 수치를 참고했습니다. 수치마다 표본과 연도를 함께 적고, 직접 수집한 제품을 기반으로 수집한 데이터를 분류하여 표기했습니다.</p></div>
      <div class="fact"><h2>이 사이트 수치의 한계</h2><p>이 사이트의 비교 수치는 7개 브랜드 ${TOTAL}벌의 작은 표본에서 계산합니다. 시장 전체의 비율이 아니라, 이 사이트 안에서 직접 확인하는 체험입니다. 상품 이미지는 저작권 보호를 위해 AI로 재현한 참고 이미지입니다.</p></div>
    </div>
  </section>
  <div class="arc" style="background:var(--cream);--arc-to:var(--blue)" aria-hidden="true"></div>
  <section class="refs tex-blue" id="refs"><h2>참고문헌과 출처</h2>
    <div class="refgrp"><h3>연구·조사</h3><ul>
      ${ref('Rosseel, H., & Bouko, C. (2026). Persistent but recalibrated: gender stereotypes in early childhood clothing. International Journal of Fashion Design, Technology and Education.')}
      ${ref('Lapierre, M. A., Ashtaputre, A., & Stevens Aubrey, J. (2022). Boys Go, Girls Go Along: exploring gender and price differences regarding themes present on children’s graphic t-shirts. Young Consumers, 23(3).')}
      ${ref('McKinney, E., Martindale, A., & Miller, M. (2023). Inclusion of functional design characteristics in current children’s pants: differences by gender. International Journal of Fashion Design, Technology and Education.')}
      ${ref('New York City Department of Consumer Affairs. (2015). From Cradle to Cane: The Cost of Being a Female Consumer.')}
      ${ref('Goodin, S. M., Van Denburg, A., Murnen, S. K., & Smolak, L. (2011). “Putting on” sexiness: A content analysis of the presence of sexualizing characteristics in girls’ clothing. Sex Roles.')}
    </ul></div>
    <div class="refgrp"><h3>변화 사례</h3><ul>
      ${ref('Mumsnet. (2010). Let Girls Be Girls.')}${ref('Let Clothes Be Clothes.', 'https://letclothesbeclothes.co.uk')}${ref('British Vogue. (2017). John Lewis Genderless Children’s Wear.')}
    </ul></div>
    <div class="refgrp"><h3>관찰 사례</h3><ul>
      ${ref('TikTok @phoebeisginger1 영상')}${ref('네이버 스마트스토어 mellis 상품 페이지')}${ref('TikTok @hackorwackofficial 영상')}${ref('Collective Shout. Win! Shein pulls tween cherry ad.')}${ref('Sky News. H&M pulls school uniform ad over complaints it sexualises children.')}
    </ul></div>
    <div class="refgrp"><h3>상품·이미지 출처</h3><ul>
      ${ref('유니클로 키즈 (UNIQLO Kids). 상품 정보 및 참고 이미지.', 'https://www.uniqlo.com/kr')}
      ${ref('자라 키즈 (ZARA Kids). 상품 정보 및 참고 이미지.', 'https://www.zara.com/kr')}
      ${ref('스파오 키즈 (SPAO Kids). 상품 정보 및 참고 이미지.', 'https://www.spao.com')}
      ${ref('무신사 스탠다드 키즈 (MUSINSA STANDARD Kids). 상품 정보 및 참고 이미지.', 'https://www.musinsa.com')}
      ${ref('랄프로렌 키즈 (Ralph Lauren Kids). 상품 정보 및 참고 이미지.', 'https://www.ralphlauren.co.kr')}
      ${ref('몽클레어 키즈 (Moncler Enfant). 상품 정보 및 참고 이미지.', 'https://www.moncler.com/ko-kr')}
      ${ref('버버리 칠드런 (Burberry Children). 상품 정보 및 참고 이미지.', 'https://kr.burberry.com')}
      ${ref('상품 정보 기준일 2026년 11월 22일. 상품명·가격·소재·이미지에 대한 권리는 각 브랜드에 있으며, 이 사이트는 비영리 수업 과제로 출처를 밝혀 참고합니다.')}
    </ul></div>
    <p class="refnote">모든 출처는 링크와 함께 표기하고, 판매처 링크는 정기적으로 확인합니다.</p>
  </section>`;
}

/* ---- 404 ---- */
function notFound() {
  return `<section class="tex-blue"><div class="nf">
    <div><h1>찾는 페이지가<br>없어요.</h1><p>주소가 바뀌었거나 사라진 페이지예요. 아이에게 맞는 옷은 여기서 다시 찾을 수 있어요.</p>
      <div class="ctas"><a class="btn btn-dark btn-lg btn-sq" href="/situation">아이 기준으로 찾기</a><a class="btn btn-text" href="/">처음 화면으로</a></div></div>
    <div class="art" aria-hidden="true"><div class="orbit"></div><div class="disc">404</div><span class="dot" style="left:88%;top:8%"></span><span class="dot b" style="left:97%;top:54%"></span><span class="dot" style="left:65%;top:93%"></span></div>
  </div></section>`;
}

/* ================= after-render hooks ================= */
const AFTER = {
  situation: bindChoices, finderMat: bindChoices, finderPocket: bindChoices,
  preparing: () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let n = TOTAL; const el = $('#prep-n');
    const cnt = setInterval(() => { n = Math.max(0, n - 7); if (el) el.textContent = n ? `${TOTAL}벌을 살펴보는 중` : '거의 다 골랐어요'; }, 180);
    heroIdx = 0; gridShown = 0;
    timer = setTimeout(() => { clearInterval(cnt); go('/results', true); }, reduce ? 700 : 2600);
  },
  results: bindResults, legacy: bindLegacy, compare: bindCompare, card: bindCard,
};

/* shared link → apply state, then render */
(function applyShared() {
  const q = new URLSearchParams(location.search).get('c');
  if (!q) return;
  try {
    const o = b64d(q);
    Object.assign(S, { age: o.a ?? null, height: o.h || '', type: o.t ?? null, sit: o.s || [], skin: o.k || [], mat: o.m || [], pocket: o.p ?? null });
    save();
  } catch (e) { /* ignore bad link */ }
})();
let lastMobile = isMobile();
addEventListener('resize', () => { const m = isMobile(); if (m !== lastMobile) { lastMobile = m; if (path() === '/results') { gridShown = 0; } if (['/preparing', '/results'].includes(path())) render(); } });
render();
})();
