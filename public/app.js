const state = {
  user: null,
  meta: null,
  users: [],
  vehicles: [],
  customers: [],
  offers: [],
  currentView: 'dashboard',
};

const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'same-origin',
    ...options,
  });
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.blob();
  if (!res.ok) throw new Error(contentType.includes('application/json') ? (data.error || 'İşlem başarısız.') : 'İşlem başarısız.');
  return data;
}

function showToast(message, isError = false) {
  const toast = qs('#toast');
  toast.textContent = message;
  toast.style.borderColor = isError ? 'rgba(239,68,68,.4)' : 'rgba(34,197,94,.35)';
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('tr-TR').format(new Date(value));
}

function formatMoney(value, currency) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${currency || ''}`;
}

function statusClass(status) {
  return `status-${status}`;
}

function label(mapName, value) {
  return state.meta?.labels?.[mapName]?.[value] || value || '-';
}

function switchView(view) {
  state.currentView = view;
  qsa('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  qsa('[id^="view-"]').forEach(section => section.classList.add('hidden'));
  qs(`#view-${view}`).classList.remove('hidden');
  const activeBtn = qs(`.nav-btn[data-view="${view}"]`);
  qs('#view-title').textContent = activeBtn ? activeBtn.textContent : 'TeklifTakip';

  if (view === 'dashboard') loadDashboard();
  if (view === 'customers') loadCustomers();
  if (view === 'offers') loadOffers();
  if (view === 'users' && state.user.role === 'admin') loadUsers();
  if (view === 'vehicles' && state.user.role === 'admin') loadVehicles();
  if (view === 'reports' && state.user.role === 'admin') loadReports();
  if (view === 'logs' && state.user.role === 'admin') loadLogs();
}

function serializeForm(form) {
  const fd = new FormData(form);
  return Object.fromEntries(fd.entries());
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  });
}

function clearForm(form, defaults = {}) {
  form.reset();
  Object.entries(defaults).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value;
  });
}

function fillSelect(select, items, { valueKey = 'value', labelKey = 'label', includeEmpty = false, emptyLabel = 'Hepsi' } = {}) {
  if (!select) return;
  select.innerHTML = '';
  if (includeEmpty) {
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = emptyLabel;
    select.appendChild(empty);
  }
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueKey];
    option.textContent = item[labelKey];
    select.appendChild(option);
  });
}

function populateMetaSelects() {
  fillSelect(qs('#offer-type'), state.meta.offerTypes.map(v => ({ value: v, label: label('offerTypes', v) })));
  fillSelect(qs('#channel'), state.meta.channels.map(v => ({ value: v, label: label('channels', v) })));
  fillSelect(qs('#currency'), state.meta.currencies.map(v => ({ value: v, label: v })));
  fillSelect(qs('#price-type'), state.meta.priceTypes.map(v => ({ value: v, label: label('priceTypes', v) })));
  fillSelect(qs('#offer-status'), state.meta.offerStatuses.map(v => ({ value: v, label: label('offerStatuses', v) })));
  fillSelect(qs('#trip-type-select'), state.meta.tripTypes.map(v => ({ value: v, label: label('tripTypes', v) })));
  fillSelect(qs('#user-role-select'), state.meta.roles.map(v => ({ value: v, label: label('roles', v) })));
  fillSelect(qs('#offer-filter-status'), state.meta.offerStatuses.map(v => ({ value: v, label: label('offerStatuses', v) })), { includeEmpty: true });
  fillSelect(qs('#offer-filter-type'), state.meta.offerTypes.map(v => ({ value: v, label: label('offerTypes', v) })), { includeEmpty: true });
  fillSelect(qs('#export-filter-status'), state.meta.offerStatuses.map(v => ({ value: v, label: label('offerStatuses', v) })), { includeEmpty: true });
  fillSelect(qs('#export-filter-type'), state.meta.offerTypes.map(v => ({ value: v, label: label('offerTypes', v) })), { includeEmpty: true });
}

function applyRoleVisibility() {
  qs('#current-user').textContent = `${state.user.display_name} • ${label('roles', state.user.role)}`;
  qsa('.admin-only').forEach(el => {
    if (state.user.role === 'admin') el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}

function applyLoginState(loggedIn) {
  qs('#login-screen').classList.toggle('hidden', loggedIn);
  qs('#app-shell').classList.toggle('hidden', !loggedIn);
  if (!loggedIn) qs('#login-error').textContent = '';
}

async function loadMetaAndLists() {
  const [meta, vehicles, customers] = await Promise.all([
    api('/api/meta'),
    api('/api/vehicles'),
    api('/api/customers'),
  ]);
  state.meta = meta;
  state.vehicles = vehicles;
  state.customers = customers;
  populateMetaSelects();
  renderVehicleSelects();
}

function getVehiclesByScope(scope) {
  return state.vehicles.filter(v => v.is_active && v.scope === scope);
}

function renderVehicleSelects() {
  fillSelect(qs('#vehicle-select'), getVehiclesByScope('vehicle').map(v => ({ value: v.id, label: v.name })));
  fillSelect(qs('#transfer-vehicle-select'), getVehiclesByScope('transfer').map(v => ({ value: v.id, label: v.name })));
  fillSelect(qs('#offer-filter-vehicle'), state.vehicles.filter(v => v.is_active).map(v => ({ value: v.id, label: v.name })), { includeEmpty: true });
}

function applyOfferTypeVisibility(type) {
  qs('#vehicle-fields').classList.toggle('hidden', type !== 'vehicle');
  qs('#transfer-fields').classList.toggle('hidden', type !== 'transfer');
  qs('#tour-fields').classList.toggle('hidden', type !== 'tour');
}

function compute30DayRentalDays(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const startDay = Math.min(sd, 30);
  const endDay = Math.min(ed, 30);
  const total = ((ey - sy) * 360) + ((em - sm) * 30) + (endDay - startDay) + 1;
  return total > 0 ? total : '';
}

function updateTotalDays() {
  qs('#total-days').value = compute30DayRentalDays(qs('#pickup-date').value, qs('#return-date').value);
}

function clearOfferForm() {
  clearForm(qs('#offer-form'), {
    offer_date: new Date().toISOString().slice(0, 10),
    status: 'quoted',
    currency: 'TL',
    price_type: 'total',
    channel: 'whatsapp',
    offer_type: 'vehicle',
  });
  applyOfferTypeVisibility('vehicle');
  qs('#total-days').value = '';
}

function clearCustomerForm() {
  clearForm(qs('#customer-form'), { is_active: true });
}

function clearUserForm() {
  clearForm(qs('#user-form'), { is_active: true, role: 'user' });
  qs('#user-form [name="username"]').disabled = false;
}

function clearVehicleForm() {
  clearForm(qs('#vehicle-form'), { is_active: true, scope: 'vehicle' });
}

function offerSummary(row) {
  if (row.offer_type === 'vehicle') {
    return `${row.vehicle_name || '-'}<br><span class="muted">${formatDate(row.pickup_date)} → ${formatDate(row.return_date)} / ${row.total_days || '-'} gün</span>`;
  }
  if (row.offer_type === 'transfer') {
    const vehicle = row.transfer_vehicle_name ? `${row.transfer_vehicle_name} • ` : '';
    return `${vehicle}${row.transfer_pickup || '-'} → ${row.transfer_dropoff || '-'}<br><span class="muted">${label('tripTypes', row.trip_type)} / ${formatDate(row.transfer_date)}</span>`;
  }
  if (row.offer_type === 'tour') {
    return `${row.tour_name || '-'}<br><span class="muted">${row.participant_count || 0} kişi / ${formatDate(row.tour_date)}</span>`;
  }
  return '-';
}

async function loadDashboard() {
  const data = await api('/api/dashboard');
  qs('#stat-today-offers').textContent = data.todayOffers;
  qs('#stat-waiting-offers').textContent = data.waitingOffers;
  qs('#stat-won-offers').textContent = data.wonOffers;
  qs('#stat-lost-offers').textContent = data.lostOffers;
  qs('#dashboard-offers').innerHTML = data.latestOffers.map(row => `
    <tr class="clickable-row" data-dashboard-offer="${row.id}">
      <td>${row.id}</td>
      <td>${row.customer_name}</td>
      <td>${label('offerTypes', row.offer_type)}</td>
      <td><span class="status-chip ${statusClass(row.status)}">${label('offerStatuses', row.status)}</span></td>
      <td>${formatMoney(row.price_amount, row.currency)}</td>
      <td>${row.created_by_name}</td>
    </tr>
  `).join('') || '<tr><td colspan="6">Kayıt yok.</td></tr>';
  qs('#dashboard-customers').innerHTML = data.latestCustomers.map(row => `
    <tr><td>${row.id}</td><td>${row.full_name}</td><td>${row.phone}</td><td>${formatDate(row.created_at)}</td></tr>
  `).join('') || '<tr><td colspan="4">Kayıt yok.</td></tr>';
}

async function loadCustomers() {
  const search = qs('#customer-search').value.trim();
  state.customers = await api(`/api/customers?search=${encodeURIComponent(search)}`);
  qs('#customers-table').innerHTML = state.customers.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.full_name}</td>
      <td>${c.phone}</td>
      <td>${c.offers_count}</td>
      <td>${c.latest_offer_date ? formatDate(c.latest_offer_date) : '-'}</td>
      <td>
        <div class="button-row">
          <button class="ghost-btn" data-customer-edit="${c.id}">Düzenle</button>
          <button class="ghost-btn" data-customer-history="${c.id}">Geçmiş</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6">Kayıt yok.</td></tr>';
}

async function loadCustomerHistory(customerId) {
  const rows = await api(`/api/customers/${customerId}/offers`);
  qs('#customer-history-empty').classList.toggle('hidden', rows.length > 0);
  qs('#customer-history-wrap').classList.toggle('hidden', rows.length === 0);
  qs('#customer-history-table').innerHTML = rows.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${label('offerTypes', o.offer_type)}</td>
      <td><span class="status-chip ${statusClass(o.status)}">${label('offerStatuses', o.status)}</span></td>
      <td>${formatMoney(o.price_amount, o.currency)}</td>
      <td>${formatDate(o.offer_date)}</td>
      <td>${o.created_by_name}</td>
    </tr>
  `).join('');
}

async function saveCustomer(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = serializeForm(form);
  payload.is_active = form.elements.is_active.checked ? 1 : 0;
  try {
    if (payload.id) {
      await api(`/api/customers/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Müşteri güncellendi.');
    } else {
      await api('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Müşteri kaydedildi.');
    }
    clearCustomerForm();
    await Promise.all([loadCustomers(), loadDashboard()]);
  } catch (error) {
    showToast(error.message, true);
  }
}

function editCustomer(id) {
  const row = state.customers.find(item => item.id === id);
  if (!row) return;
  setFormValues(qs('#customer-form'), row);
  switchView('customers');
}

async function loadOffers() {
  const params = new URLSearchParams({
    search: qs('#offer-search').value.trim(),
    status: qs('#offer-filter-status').value,
    offer_type: qs('#offer-filter-type').value,
    created_by_user_id: qs('#offer-filter-user').value,
    vehicle_id: qs('#offer-filter-vehicle').value,
    from: qs('#offer-filter-from').value,
    to: qs('#offer-filter-to').value,
  });
  state.offers = await api(`/api/offers?${params.toString()}`);
  qs('#offers-table').innerHTML = state.offers.map(row => `
    <tr>
      <td>${row.id}</td>
      <td>${row.customer_name}<br><span class="muted">${row.customer_phone}</span></td>
      <td>${label('offerTypes', row.offer_type)}</td>
      <td>${offerSummary(row)}</td>
      <td>${label('channels', row.request_channel)}</td>
      <td><span class="status-chip ${statusClass(row.status)}">${label('offerStatuses', row.status)}</span></td>
      <td>${formatMoney(row.price_amount, row.currency)}</td>
      <td class="action-cell">
        <button class="ghost-btn" data-offer-edit="${row.id}">Görüntüle</button>
        <button class="danger-btn" data-offer-delete="${row.id}">Sil</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8">Kayıt yok.</td></tr>';
}

async function saveOffer(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = serializeForm(form);
  payload.total_days = qs('#total-days').value;
  try {
    if (payload.id) {
      await api(`/api/offers/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Teklif güncellendi.');
    } else {
      await api('/api/offers', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Teklif kaydedildi.');
    }
    clearOfferForm();
    await Promise.all([loadOffers(), loadDashboard(), loadCustomers()]);
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteOffer(id) {
  const row = state.offers.find(item => item.id === id);
  const title = row ? `${row.customer_name} / #${row.id}` : `#${id}`;
  if (!window.confirm(`Bu teklifi silmek istediğine emin misin?
${title}`)) return;
  try {
    await api(`/api/offers/${id}`, { method: 'DELETE' });
    const currentFormId = qs('#offer-form [name="id"]').value;
    if (String(currentFormId) === String(id)) clearOfferForm();
    await Promise.all([loadOffers(), loadDashboard(), loadCustomers()]);
    showToast('Teklif silindi.');
  } catch (error) {
    showToast(error.message, true);
  }
}

async function editOffer(id) {
  try {
    const row = await api(`/api/offers/${id}`);
    const form = qs('#offer-form');
    setFormValues(form, {
      id: row.id,
      customer_full_name: row.customer_name,
      customer_phone: row.customer_phone,
      customer_note: row.customer_note,
      offer_type: row.offer_type,
      channel: row.request_channel,
      offer_date: row.offer_date,
      currency: row.currency,
      price_type: row.price_type,
      price_amount: row.price_amount,
      status: row.status,
      note: row.note,
    });
    applyOfferTypeVisibility(row.offer_type);
    if (row.offer_type === 'vehicle' && row.detail) {
      setFormValues(form, {
        vehicle_id: row.detail.vehicle_id,
        pickup_date: row.detail.pickup_date,
        return_date: row.detail.return_date,
        total_days: row.detail.total_days,
        pickup_location: row.detail.pickup_location,
        return_location: row.detail.return_location,
      });
      qs('#total-days').value = row.detail.total_days || '';
    }
    if (row.offer_type === 'transfer' && row.detail) {
      setFormValues(form, {
        transfer_vehicle_id: row.detail.vehicle_id,
        trip_type: row.detail.trip_type,
        transfer_date: row.detail.transfer_date,
        transfer_pickup_location: row.detail.pickup_location,
        transfer_dropoff_location: row.detail.dropoff_location,
      });
    }
    if (row.offer_type === 'tour' && row.detail) {
      setFormValues(form, {
        tour_name: row.detail.tour_name,
        participant_count: row.detail.participant_count,
        tour_date: row.detail.tour_date,
      });
    }
    switchView('offers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    showToast(error.message, true);
  }
}

async function loadUsers() {
  state.users = await api('/api/users');
  fillSelect(qs('#offer-filter-user'), state.users.map(u => ({ value: u.id, label: u.display_name })), { includeEmpty: true });
  qs('#users-table').innerHTML = state.users.map(row => `
    <tr>
      <td>${row.id}</td>
      <td>${row.username}</td>
      <td>${row.display_name}</td>
      <td>${label('roles', row.role)}</td>
      <td>${row.is_active ? 'Aktif' : 'Pasif'}</td>
      <td><button class="ghost-btn" data-user-edit="${row.id}">Düzenle</button></td>
    </tr>
  `).join('');
}

function editUser(id) {
  const row = state.users.find(item => item.id === id);
  if (!row) return;
  setFormValues(qs('#user-form'), row);
  qs('#user-form [name="username"]').disabled = true;
  qs('#user-form [name="password"]').value = '';
}

async function saveUser(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = serializeForm(form);
  payload.is_active = form.elements.is_active.checked ? 1 : 0;
  try {
    if (payload.id) {
      await api(`/api/users/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Kullanıcı güncellendi.');
    } else {
      await api('/api/users', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Kullanıcı oluşturuldu.');
    }
    clearUserForm();
    await loadUsers();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function resetUserPassword() {
  const id = qs('#user-form [name="id"]').value;
  const password = qs('#user-form [name="password"]').value;
  if (!id) return showToast('Önce bir kullanıcı seç.', true);
  if (!password) return showToast('Yeni şifreyi yaz.', true);
  try {
    await api(`/api/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) });
    qs('#user-form [name="password"]').value = '';
    showToast('Şifre sıfırlandı.');
  } catch (error) {
    showToast(error.message, true);
  }
}

async function loadVehicles() {
  state.vehicles = await api('/api/vehicles');
  renderVehicleSelects();
  qs('#vehicles-table').innerHTML = state.vehicles.map(row => `
    <tr>
      <td>${row.id}</td>
      <td>${row.name}</td>
      <td>${row.scope === 'transfer' ? 'Transfer' : 'Araç Kiralama'}</td>
      <td>${row.is_active ? 'Aktif' : 'Pasif'}</td>
      <td><button class="ghost-btn" data-vehicle-edit="${row.id}">Düzenle</button></td>
    </tr>
  `).join('');
}

function editVehicle(id) {
  const row = state.vehicles.find(item => item.id === id);
  if (!row) return;
  setFormValues(qs('#vehicle-form'), row);
}

async function saveVehicle(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = serializeForm(form);
  payload.is_active = form.elements.is_active.checked ? 1 : 0;
  try {
    if (payload.id) {
      await api(`/api/vehicles/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Araç güncellendi.');
    } else {
      await api('/api/vehicles', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Araç eklendi.');
    }
    clearVehicleForm();
    await loadVehicles();
  } catch (error) {
    showToast(error.message, true);
  }
}

function renderSimpleList(container, rows, labelValue) {
  container.innerHTML = rows.map(row => `
    <div class="simple-list-item"><span>${labelValue(row)}</span><strong>${row.count}</strong></div>
  `).join('') || '<div class="empty-state">Kayıt yok.</div>';
}

async function loadReports() {
  const data = await api('/api/reports/summary');
  qs('#report-total-offers').textContent = data.summary.totalOffers;
  qs('#report-won-offers').textContent = data.summary.wonOffers;
  qs('#report-lost-offers').textContent = data.summary.lostOffers;
  qs('#report-no-reply-offers').textContent = data.summary.noReplyOffers;
  qs('#report-waiting-offers').textContent = data.summary.waitingOffers;
  renderSimpleList(qs('#report-by-type'), data.byType, row => label('offerTypes', row.offer_type));
  renderSimpleList(qs('#report-by-user'), data.byUser, row => row.display_name || '-');
  renderSimpleList(qs('#report-by-channel'), data.byChannel, row => label('channels', row.request_channel));
}

async function loadLogs() {
  const data = await api('/api/audit-logs');
  qs('#logs-table').innerHTML = data.map(row => `
    <tr>
      <td>${row.id}</td>
      <td>${row.user_name || '-'}</td>
      <td>${row.entity_type} #${row.entity_id}</td>
      <td>${row.action}</td>
      <td>${formatDate(row.created_at)}</td>
    </tr>
  `).join('') || '<tr><td colspan="5">Kayıt yok.</td></tr>';
}

function buildExportUrl(base) {
  const params = new URLSearchParams({
    status: qs('#export-filter-status').value,
    offer_type: qs('#export-filter-type').value,
    from: qs('#export-filter-from').value,
    to: qs('#export-filter-to').value,
  });
  return `${base}?${params.toString()}`;
}

function download(url) {
  window.location.href = url;
}

async function importBackup(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const fd = new FormData(form);
  try {
    await api('/api/backup/import', { method: 'POST', body: fd });
    showToast('Yedek içeri alındı. Sayfa yenileniyor.');
    setTimeout(() => window.location.reload(), 900);
  } catch (error) {
    showToast(error.message, true);
  }
}

async function login(e) {
  e.preventDefault();
  const payload = serializeForm(e.currentTarget);
  try {
    const data = await api('/api/login', { method: 'POST', body: JSON.stringify(payload) });
    state.user = data.user;
    await initAfterLogin();
  } catch (error) {
    qs('#login-error').textContent = error.message;
  }
}

async function logout() {
  await api('/api/logout', { method: 'POST' });
  window.location.reload();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

function bindEvents() {
  qs('#login-form').addEventListener('submit', login);
  qs('#logout-btn').addEventListener('click', logout);
  qsa('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  qsa('[data-switch-view]').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.switchView)));

  qs('#customer-form').addEventListener('submit', saveCustomer);
  qs('#customer-reset').addEventListener('click', clearCustomerForm);
  qs('#customer-search-btn').addEventListener('click', loadCustomers);

  qs('#offer-form').addEventListener('submit', saveOffer);
  qs('#offer-reset').addEventListener('click', clearOfferForm);
  qs('#offer-search-btn').addEventListener('click', loadOffers);
  qs('#offer-type').addEventListener('change', e => applyOfferTypeVisibility(e.target.value));
  qs('#pickup-date').addEventListener('change', updateTotalDays);
  qs('#return-date').addEventListener('change', updateTotalDays);

  qs('#user-form').addEventListener('submit', saveUser);
  qs('#user-reset').addEventListener('click', clearUserForm);
  qs('#reset-password-btn').addEventListener('click', resetUserPassword);

  qs('#vehicle-form').addEventListener('submit', saveVehicle);
  qs('#vehicle-reset').addEventListener('click', clearVehicleForm);

  qs('#export-offers-btn').addEventListener('click', () => download(buildExportUrl('/api/reports/offers.xlsx')));
  qs('#export-customers-btn').addEventListener('click', () => download('/api/reports/customers.xlsx'));
  qs('#backup-export-btn').addEventListener('click', () => download('/api/backup/export.json'));
  qs('#backup-import-form').addEventListener('submit', importBackup);

  document.addEventListener('click', async (e) => {
    const customerEditId = e.target.dataset.customerEdit;
    const customerHistoryId = e.target.dataset.customerHistory;
    const offerEditId = e.target.dataset.offerEdit;
    const offerDeleteId = e.target.dataset.offerDelete;
    const dashboardOfferId = e.target.closest('[data-dashboard-offer]')?.dataset.dashboardOffer;
    const userEditId = e.target.dataset.userEdit;
    const vehicleEditId = e.target.dataset.vehicleEdit;

    if (customerEditId) editCustomer(Number(customerEditId));
    if (customerHistoryId) loadCustomerHistory(Number(customerHistoryId));
    if (offerEditId) editOffer(Number(offerEditId));
    if (offerDeleteId) deleteOffer(Number(offerDeleteId));
    if (dashboardOfferId) editOffer(Number(dashboardOfferId));
    if (userEditId) editUser(Number(userEditId));
    if (vehicleEditId) editVehicle(Number(vehicleEditId));
  });
}

async function initAfterLogin() {
  await loadMetaAndLists();
  applyRoleVisibility();
  applyLoginState(true);
  clearCustomerForm();
  clearOfferForm();
  if (state.user.role === 'admin') {
    await loadUsers();
    await loadVehicles();
    clearUserForm();
    clearVehicleForm();
  } else {
    state.users = await api('/api/users');
    fillSelect(qs('#offer-filter-user'), state.users.map(u => ({ value: u.id, label: u.display_name })), { includeEmpty: true });
  }
  switchView('dashboard');
}

(async function init() {
  bindEvents();
  registerServiceWorker();
  try {
    const session = await api('/api/session');
    if (session.user) {
      state.user = session.user;
      await initAfterLogin();
    } else {
      applyLoginState(false);
    }
  } catch {
    applyLoginState(false);
  }
})();
