// ---- Config -------------------------------------------------------------
// Fallback contact used for the general "Contact Royal Auto" button when no
// specific listing is open. Update this to your real WhatsApp number.
const OWNER_WHATSAPP = '21693200539'; // country code + number, no +/spaces
const TND_TO_EUR_RATE = 0.296;

// ---- State ----------------------------------------------------------
let allListings = [];

// ---- Helpers ----------------------------------------------------------
function money(n) {
  const tnd = Number(n).toLocaleString('en-US') + ' TND';
  const eur = (Number(n) * TND_TO_EUR_RATE).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return `${tnd} <span class="price-eur">(~€${eur})</span>`;
}
function moneyPlain(n) {
  const tnd = Number(n).toLocaleString('en-US') + ' TND';
  const eur = (Number(n) * TND_TO_EUR_RATE).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return `${tnd} (~€${eur})`;
}
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => (el.className = 'toast'), 2600);
}
function waLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// ---- Fetch + render -----------------------------------------------------
async function loadListings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch('/api/listings' + (qs ? '?' + qs : ''));
  allListings = await res.json();
  renderGrid(allListings);
  populateBrandFilter(allListings);
}

function populateBrandFilter(listings) {
  const select = document.getElementById('brand');
  if (select.dataset.populated) return; // only populate once from full set
}

async function loadBrandsOnce() {
  const res = await fetch('/api/listings');
  const all = await res.json();
  const brands = [...new Set(all.map(l => l.brand).filter(Boolean))].sort();
  const select = document.getElementById('brand');
  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
  select.dataset.populated = '1';
}

function renderGrid(listings) {
  const grid = document.getElementById('grid');
  const count = document.getElementById('resultCount');
  count.textContent = listings.length + ' ' + (listings.length === 1 ? t('car_singular') : t('car_plural'));

  if (listings.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <h3>${t('empty_title')}</h3>
        <p>${t('empty_sub')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = listings.map(cardHTML).join('');
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openDetail(Number(card.dataset.id)));
  });
}

function statusLabel(status) {
  if (status === 'sold') return t('status_sold');
  if (status === 'reserved') return t('status_reserved');
  return t('status_available');
}

function cardHTML(l) {
  const img = (l.images && l.images[0]) || '';
  const statusClass = l.status === 'sold' ? 'sold' : '';
  return `
    <div class="card" data-id="${l.id}">
      <div class="card-media" style="${img ? `background-image:url('${img}')` : ''}">
        ${img ? '' : t('no_photo')}
        <span class="card-status ${statusClass}">${statusLabel(l.status)}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHTML(l.title)}</div>
        <div class="card-meta">
          <span>${l.year}</span>
          <span>&middot;</span>
          <span>${l.mileage ? l.mileage.toLocaleString() + ' km' : '—'}</span>
          <span>&middot;</span>
          <span>${escapeHTML(l.transmission || '—')}</span>
        </div>
        <div class="card-price">${money(l.price)}</div>
      </div>
    </div>`;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ---- Detail modal -----------------------------------------------------
let galleryIndex = 0;
let currentDetail = null;

function openDetail(id) {
  const l = allListings.find(x => x.id === id);
  if (!l) return;
  galleryIndex = 0;
  currentDetail = l;
  renderDetail(l);
  document.getElementById('detailOverlay').classList.add('open');
}

function renderDetail(l) {
  const modal = document.getElementById('detailModal');
  const images = l.images && l.images.length ? l.images : [];
  const bg = images[galleryIndex] || '';

  const waText = t('whatsapp_interest_msg', { title: l.title, year: l.year, price: moneyPlain(l.price) });
  const whatsappNumber = l.whatsapp || OWNER_WHATSAPP;

  modal.innerHTML = `
    <button class="modal-close" id="closeDetail" aria-label="Close">&times;</button>
    <div class="modal-gallery" style="${bg ? `background-image:url('${bg}')` : ''}">
      ${images.length > 1 ? `
        <button class="gallery-arrow gallery-arrow-left" id="galleryPrev" aria-label="Previous photo">&#10094;</button>
        <button class="gallery-arrow gallery-arrow-right" id="galleryNext" aria-label="Next photo">&#10095;</button>
        <div class="modal-gallery-nav">${images.map((_, i) => `<span class="${i === galleryIndex ? 'active' : ''}" data-i="${i}"></span>`).join('')}</div>
      ` : ''}
    </div>
    <div class="modal-body">
      <h2>${escapeHTML(l.title)}</h2>
      <div class="modal-price">${money(l.price)}</div>
      <div class="spec-grid">
        <div class="spec-item"><div class="label">${t('spec_year')}</div><div class="value">${l.year}</div></div>
        <div class="spec-item"><div class="label">${t('spec_mileage')}</div><div class="value">${l.mileage ? l.mileage.toLocaleString() + ' km' : '—'}</div></div>
        <div class="spec-item"><div class="label">${t('spec_fuel')}</div><div class="value">${escapeHTML(l.fuel || '—')}</div></div>
        <div class="spec-item"><div class="label">${t('spec_transmission')}</div><div class="value">${escapeHTML(l.transmission || '—')}</div></div>
        <div class="spec-item"><div class="label">${t('spec_color')}</div><div class="value">${escapeHTML(l.color || '—')}</div></div>
        <div class="spec-item"><div class="label">${t('spec_status')}</div><div class="value">${statusLabel(l.status)}</div></div>
      </div>
      <p class="modal-desc">${escapeHTML(l.description || t('no_description'))}</p>
      <div class="contact-row">
        <a class="btn btn-gold" target="_blank" rel="noopener" href="${waLink(whatsappNumber, waText)}">${t('btn_whatsapp')}</a>
        ${l.phone ? `<a class="btn btn-outline" href="tel:${l.phone}">${t('btn_call')} ${l.phone}</a>` : ''}
      </div>
    </div>`;

  document.getElementById('closeDetail').addEventListener('click', closeDetail);
  modal.querySelectorAll('.modal-gallery-nav span').forEach(dot => {
    dot.addEventListener('click', e => {
      galleryIndex = Number(e.target.dataset.i);
      renderDetail(l);
    });
  });

  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  if (prevBtn) prevBtn.addEventListener('click', () => stepGallery(l, -1));
  if (nextBtn) nextBtn.addEventListener('click', () => stepGallery(l, 1));
}

function stepGallery(l, direction) {
  const count = (l.images && l.images.length) || 1;
  galleryIndex = (galleryIndex + direction + count) % count;
  renderDetail(l);
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
}
document.getElementById('detailOverlay').addEventListener('click', e => {
  if (e.target.id === 'detailOverlay') closeDetail();
});
document.addEventListener('keydown', e => {
  const overlay = document.getElementById('detailOverlay');
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeDetail();
  if (currentDetail && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    stepGallery(currentDetail, e.key === 'ArrowLeft' ? -1 : 1);
  }
});

// ---- Search interactions -----------------------------------------------
document.getElementById('searchBtn').addEventListener('click', runSearch);
['q'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch();
  });
});

function runSearch() {
  const params = {};
  const q = document.getElementById('q').value.trim();
  const brand = document.getElementById('brand').value;
  const maxPrice = document.getElementById('maxPrice').value;
  const minYear = document.getElementById('minYear').value;
  if (q) params.q = q;
  if (brand) params.brand = brand;
  if (maxPrice) params.maxPrice = maxPrice;
  if (minYear) params.minYear = minYear;
  loadListings(params);
}

document.getElementById('generalContact').addEventListener('click', e => {
  e.preventDefault();
  window.open(waLink(OWNER_WHATSAPP, t('contact_general_msg')), '_blank');
});

// ---- Language switching ---------------------------------------------
function onLanguageChanged() {
  renderGrid(allListings);
  if (document.getElementById('detailOverlay').classList.contains('open') && currentDetail) {
    renderDetail(currentDetail);
  }
}

// ---- Init ---------------------------------------------------------------
initLangToggle();
loadListings();
loadBrandsOnce();
