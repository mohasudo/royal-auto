let listings = [];
let editingId = null;
let removedImages = [];

function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => (el.className = 'toast'), 2600);
}
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function money(n) {
  return Number(n).toLocaleString('en-US') + ' TND';
}

// ---- Auth --------------------------------------------------------------
async function checkSession() {
  const res = await fetch('/api/session');
  const data = await res.json();
  if (data.isAdmin) {
    document.getElementById('loginOverlay').classList.remove('open');
    document.getElementById('adminShell').classList.add('visible');
    loadListings();
  }
}

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (res.ok) {
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginOverlay').classList.remove('open');
    document.getElementById('adminShell').classList.add('visible');
    loadListings();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
});

// ---- Load + render table ------------------------------------------------
async function loadListings() {
  const [available, reserved, sold] = await Promise.all([
    fetch('/api/listings?status=available').then(r => r.json()),
    fetch('/api/listings?status=reserved').then(r => r.json()),
    fetch('/api/listings?status=sold').then(r => r.json()),
  ]);
  listings = [...available, ...reserved, ...sold].sort((a, b) => b.id - a.id);
  renderTable();
}

function statusLabel(status) {
  if (status === 'sold') return t('status_sold');
  if (status === 'reserved') return t('status_reserved');
  return t('status_available');
}

function renderTable() {
  const body = document.getElementById('listingsTableBody');
  if (listings.length === 0) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">${t('admin_no_listings')}</td></tr>`;
    return;
  }
  body.innerHTML = listings
    .map(
      l => `
    <tr>
      <td><div class="thumb" style="${l.images && l.images[0] ? `background-image:url('${l.images[0]}')` : ''}"></div></td>
      <td>${escapeHTML(l.title)}</td>
      <td>${l.year}</td>
      <td>${money(l.price)}</td>
      <td><span class="status-pill ${l.status}">${statusLabel(l.status)}</span></td>
      <td>${new Date(l.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" data-edit="${l.id}">${t('admin_edit_btn')}</button>
          <button class="btn btn-danger btn-sm" data-delete="${l.id}">${t('admin_delete_btn')}</button>
        </div>
      </td>
    </tr>`
    )
    .join('');

  body.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => openForm(Number(btn.dataset.edit)))
  );
  body.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', () => deleteListing(Number(btn.dataset.delete)))
  );
}

// ---- Form handling -------------------------------------------------------
const form = document.getElementById('listingForm');

document.getElementById('newListingBtn').addEventListener('click', () => openForm(null));
document.getElementById('cancelFormBtn').addEventListener('click', closeForm);

function openForm(id) {
  editingId = id;
  removedImages = [];
  form.style.display = 'block';
  document.getElementById('formTitle').textContent = id ? t('admin_edit_title') : t('admin_add_title');
  document.getElementById('existingImages').innerHTML = '';

  if (id) {
    const l = listings.find(x => x.id === id);
    document.getElementById('title').value = l.title;
    document.getElementById('brand').value = l.brand;
    document.getElementById('model').value = l.model;
    document.getElementById('year').value = l.year;
    document.getElementById('price').value = l.price;
    document.getElementById('mileage').value = l.mileage || '';
    document.getElementById('fuel').value = l.fuel || '';
    document.getElementById('transmission').value = l.transmission || '';
    document.getElementById('color').value = l.color || '';
    document.getElementById('status').value = l.status || 'available';
    document.getElementById('phone').value = l.phone || '';
    document.getElementById('whatsapp').value = l.whatsapp || '';
    document.getElementById('description').value = l.description || '';
    renderExistingImages(l.images || []);
  } else {
    form.reset();
    document.getElementById('status').value = 'available';
  }
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderExistingImages(images) {
  const wrap = document.getElementById('existingImages');
  wrap.innerHTML = images
    .map(
      img => `
    <div class="image-preview" data-src="${img}">
      <img src="${img}" alt="" />
      <button type="button" class="remove-img" title="Remove">&times;</button>
    </div>`
    )
    .join('');
  wrap.querySelectorAll('.remove-img').forEach(btn =>
    btn.addEventListener('click', e => {
      const preview = e.target.closest('.image-preview');
      removedImages.push(preview.dataset.src);
      preview.remove();
    })
  );
}

function closeForm() {
  form.style.display = 'none';
  form.reset();
  editingId = null;
  removedImages = [];
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData();
  fd.append('title', document.getElementById('title').value);
  fd.append('brand', document.getElementById('brand').value);
  fd.append('model', document.getElementById('model').value);
  fd.append('year', document.getElementById('year').value);
  fd.append('price', document.getElementById('price').value);
  fd.append('mileage', document.getElementById('mileage').value);
  fd.append('fuel', document.getElementById('fuel').value);
  fd.append('transmission', document.getElementById('transmission').value);
  fd.append('color', document.getElementById('color').value);
  fd.append('status', document.getElementById('status').value);
  fd.append('phone', document.getElementById('phone').value);
  fd.append('whatsapp', document.getElementById('whatsapp').value);
  fd.append('description', document.getElementById('description').value);
  if (editingId) fd.append('removedImages', JSON.stringify(removedImages));

  const files = document.getElementById('images').files;
  for (const file of files) fd.append('images', file);

  const url = editingId ? `/api/listings/${editingId}` : '/api/listings';
  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, { method, body: fd });
  if (res.ok) {
    toast(editingId ? t('admin_toast_updated') : t('admin_toast_added'));
    closeForm();
    loadListings();
  } else {
    const err = await res.json().catch(() => ({}));
    toast(err.error || t('admin_toast_error'), true);
  }
});

async function deleteListing(id) {
  if (!confirm(t('admin_delete_confirm'))) return;
  const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
  if (res.ok) {
    toast(t('admin_toast_deleted'));
    loadListings();
  } else {
    toast(t('admin_toast_delete_error'), true);
  }
}

function onLanguageChanged() {
  renderTable();
}

initLangToggle();
checkSession();
