/**
 * FloraChain — Profile Utilities
 * • Role-based profile images
 * • Role-based login redirect
 * • Location sharing preferences
 */

// ─── Role → Profile Image Map ────────────────────────────────────────────────
const ROLE_IMAGES = {
  farmer:       'assets/profile_farmer.png',
  agent:        'assets/profile_agent.png',
  storeowner:   'assets/profile_store_owner.png',
  store_owner:  'assets/profile_store_owner.png',
  driver:       'assets/profile_driver.png',
  vehicleowner: 'assets/profile_agent.png',
  customer:     'assets/profile_customer.png',
};

// ─── Role → Dashboard Map ────────────────────────────────────────────────────
const ROLE_DASHBOARDS = {
  farmer:       'dashboard-farmer.html',
  agent:        'dashboard-agent.html',
  storeowner:   'dashboard-store.html',
  store_owner:  'dashboard-store.html',
  vehicleowner: 'dashboard-vehicle.html',
  driver:       'dashboard-driver.html',
  customer:     'dashboard-customer.html',
};

// ─── Get / Set current user from localStorage ─────────────────────────────────
function getFCUser() {
  try { return JSON.parse(localStorage.getItem('fc_user') || 'null'); } catch { return null; }
}
function setFCUser(data) {
  localStorage.setItem('fc_user', JSON.stringify(data));
}

// ─── Apply profile image to ALL img[data-profile-img] on the page ─────────────
function applyProfileImages() {
  const user = getFCUser();
  const role = user?.role || detectRoleFromPage();
  const imgSrc = ROLE_IMAGES[role] || 'assets/profile_agent.png';

  // Replace <img data-profile-img> elements
  document.querySelectorAll('[data-profile-img]').forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = imgSrc;
      el.alt = (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User') + ' Profile';
      el.style.width = el.dataset.profileSize || '100%';
      el.style.height = el.dataset.profileSize || '100%';
      el.style.objectFit = 'cover';
      el.style.borderRadius = '50%';
    }
  });

  // Replace avatar divs that show initials → swap to img
  document.querySelectorAll('[data-profile-avatar]').forEach(el => {
    const size = el.dataset.profileAvatar || '44px';
    el.style.backgroundImage  = `url('${imgSrc}')`;
    el.style.backgroundSize   = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.color = 'transparent';
    el.style.fontSize = '0';
  });

  // Update profile modal avatar if it exists
  const modalAvatar = document.getElementById('profileModalAvatar');
  if (modalAvatar) {
    modalAvatar.innerHTML = `<img src="${imgSrc}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
  }

  // Update topbar avatar
  document.querySelectorAll('.avatar[data-role-avatar]').forEach(el => {
    el.innerHTML = `<img src="${imgSrc}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
    el.style.padding = '0';
    el.style.overflow = 'hidden';
  });
}

// ─── Detect role from current page filename ────────────────────────────────────
function detectRoleFromPage() {
  const page = location.pathname.split('/').pop();
  if (page.includes('farmer'))   return 'farmer';
  if (page.includes('agent'))    return 'agent';
  if (page.includes('store'))    return 'storeowner';
  if (page.includes('driver'))   return 'driver';
  if (page.includes('vehicle'))  return 'vehicleowner';
  if (page.includes('customer')) return 'customer';
  return 'agent';
}

// ─── Role-based redirect after login ──────────────────────────────────────────
function redirectToRoleDashboard(role, userData = {}) {
  setFCUser({ role, ...userData });
  const dest = ROLE_DASHBOARDS[role] || 'dashboard-agent.html';
  window.location.href = dest;
}

// ─── Guard: redirect away if wrong role ───────────────────────────────────────
function guardDashboard(expectedRole) {
  const user = getFCUser();
  if (!user) {
    // Not logged in → go to auth
    window.location.href = 'auth.html?mode=login';
    return false;
  }
  if (expectedRole && user.role !== expectedRole) {
    // Wrong role → redirect to their dashboard
    const dest = ROLE_DASHBOARDS[user.role] || 'auth.html?mode=login';
    window.location.href = dest;
    return false;
  }
  return true;
}

// ─── Location Sharing Preferences ─────────────────────────────────────────────
const LOC_PREF_KEY = 'fc_location_prefs';

const DEFAULT_LOC_PREFS = {
  shareEnabled:      true,
  shareWith:         'connected',   // 'all' | 'connected' | 'none'
  shareLive:         true,          // live GPS vs pinned
  shareWithAgents:   true,
  shareWithStores:   false,
  shareWithDrivers:  false,
  shareWithFarmers:  false,
  pinnedLat:         null,
  pinnedLng:         null,
  pinnedLabel:       '',
};

function getLocPrefs() {
  try { return { ...DEFAULT_LOC_PREFS, ...JSON.parse(localStorage.getItem(LOC_PREF_KEY) || '{}') }; }
  catch { return { ...DEFAULT_LOC_PREFS }; }
}

function saveLocPrefs(prefs) {
  localStorage.setItem(LOC_PREF_KEY, JSON.stringify(prefs));
  if (typeof showToast === 'function') showToast('📍 Location preferences saved!', 'success');
}

function canShareLocationWith(role) {
  const p = getLocPrefs();
  if (!p.shareEnabled) return false;
  if (p.shareWith === 'none') return false;
  if (p.shareWith === 'all') return true;
  // 'connected' → check specific role toggles
  const map = { agent: p.shareWithAgents, store_owner: p.shareWithStores, driver: p.shareWithDrivers, farmer: p.shareWithFarmers };
  return map[role] ?? false;
}

// ─── Render Location Preference Panel ─────────────────────────────────────────
function renderLocationPrefsPanel(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const p = getLocPrefs();
  el.innerHTML = `
  <div style="display:flex;flex-direction:column;gap:1rem;">
    <div style="background:var(--green-xlight);border:1px solid var(--green-light);border-radius:var(--radius-lg);padding:1rem;">
      <div class="flex justify-between items-center mb-2">
        <div><div class="font-semi text-sm">📍 Location Sharing</div><div class="text-xs text-muted">Control who can see your location</div></div>
        <div class="toggle-switch ${p.shareEnabled ? 'active' : ''}" id="locShareToggle" onclick="toggleLocPref('shareEnabled',this)"></div>
      </div>
    </div>

    <div id="locPrefDetails" style="display:${p.shareEnabled ? 'flex' : 'none'};flex-direction:column;gap:.85rem;">
      <div class="form-group">
        <label class="form-label">Share Location With</label>
        <select class="form-select" id="locShareWith" onchange="updateLocShareWith(this.value)">
          <option value="all"       ${p.shareWith==='all'       ? 'selected' : ''}>Everyone</option>
          <option value="connected" ${p.shareWith==='connected' ? 'selected' : ''}>Connected People Only</option>
          <option value="none"      ${p.shareWith==='none'      ? 'selected' : ''}>Nobody (Private)</option>
        </select>
      </div>

      <div id="roleShareToggles" style="display:${p.shareWith==='connected' ? 'flex' : 'none'};flex-direction:column;gap:.6rem;padding:.75rem;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);">
        <div class="text-xs font-semi text-muted mb-1">Share specifically with:</div>
        ${renderLocRoleToggle('Agents 🤝',      'shareWithAgents',  p.shareWithAgents)}
        ${renderLocRoleToggle('Store Owners 🏪', 'shareWithStores',  p.shareWithStores)}
        ${renderLocRoleToggle('Drivers 🚚',      'shareWithDrivers', p.shareWithDrivers)}
        ${renderLocRoleToggle('Farmers 🌾',      'shareWithFarmers', p.shareWithFarmers)}
      </div>

      <div class="form-group">
        <label class="form-label">Location Type</label>
        <div style="display:flex;gap:.75rem;">
          <label style="display:flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.85rem;">
            <input type="radio" name="locType" value="live" ${p.shareLive ? 'checked' : ''} onchange="updateLocType(true)"/> 🔴 Live GPS (Real-time)
          </label>
          <label style="display:flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.85rem;">
            <input type="radio" name="locType" value="pinned" ${!p.shareLive ? 'checked' : ''} onchange="updateLocType(false)"/> 📌 Pinned Location
          </label>
        </div>
      </div>

      <div id="pinnedLocRow" style="display:${!p.shareLive ? 'block' : 'none'};">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Pinned Label</label>
            <input class="form-input" id="pinnedLabel" value="${p.pinnedLabel || ''}" placeholder="e.g. My Farm HQ"/></div>
          <div class="form-group"><label class="form-label">GPS Coordinate</label>
            <div class="flex gap-2">
              <input class="form-input" id="pinnedCoord" readonly value="${p.pinnedLat ? p.pinnedLat+', '+p.pinnedLng : ''}" placeholder="Click ↓ to detect"/>
              <button class="btn btn-outline btn-sm" onclick="pinCurrentLocation()">📡</button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" onclick="saveLocationPrefs()">💾 Save Location Preferences</button>
    </div>
  </div>`;
}

function renderLocRoleToggle(label, key, value) {
  return `<div class="flex justify-between items-center">
    <span class="text-sm">${label}</span>
    <div class="toggle-switch ${value ? 'active' : ''}" id="toggle_${key}" onclick="toggleLocRole('${key}',this)"></div>
  </div>`;
}

function toggleLocPref(key, el) {
  el.classList.toggle('active');
  const p = getLocPrefs();
  p[key] = el.classList.contains('active');
  localStorage.setItem(LOC_PREF_KEY, JSON.stringify(p));
  const details = document.getElementById('locPrefDetails');
  if (details) details.style.display = p[key] ? 'flex' : 'none';
}

function toggleLocRole(key, el) {
  el.classList.toggle('active');
  const p = getLocPrefs();
  p[key] = el.classList.contains('active');
  localStorage.setItem(LOC_PREF_KEY, JSON.stringify(p));
}

function updateLocShareWith(val) {
  const p = getLocPrefs();
  p.shareWith = val;
  localStorage.setItem(LOC_PREF_KEY, JSON.stringify(p));
  const rt = document.getElementById('roleShareToggles');
  if (rt) rt.style.display = val === 'connected' ? 'flex' : 'none';
}

function updateLocType(isLive) {
  const p = getLocPrefs();
  p.shareLive = isLive;
  localStorage.setItem(LOC_PREF_KEY, JSON.stringify(p));
  const row = document.getElementById('pinnedLocRow');
  if (row) row.style.display = isLive ? 'none' : 'block';
}

function pinCurrentLocation() {
  if (!navigator.geolocation) { if (typeof showToast === 'function') showToast('Geolocation not supported', 'error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(5);
    const lng = pos.coords.longitude.toFixed(5);
    const coordEl = document.getElementById('pinnedCoord');
    if (coordEl) coordEl.value = `${lat}, ${lng}`;
    const p = getLocPrefs();
    p.pinnedLat = lat; p.pinnedLng = lng;
    localStorage.setItem(LOC_PREF_KEY, JSON.stringify(p));
    if (typeof showToast === 'function') showToast('📍 Location pinned!', 'success');
  }, () => { if (typeof showToast === 'function') showToast('Location permission denied', 'warning'); });
}

function saveLocationPrefs() {
  const p = getLocPrefs();
  p.shareEnabled = document.getElementById('locShareToggle')?.classList.contains('active') ?? p.shareEnabled;
  p.shareWith    = document.getElementById('locShareWith')?.value ?? p.shareWith;
  p.shareLive    = document.querySelector('input[name="locType"][value="live"]')?.checked ?? p.shareLive;
  p.pinnedLabel  = document.getElementById('pinnedLabel')?.value ?? p.pinnedLabel;
  const coord    = document.getElementById('pinnedCoord')?.value?.split(',') ?? [];
  if (coord.length === 2) { p.pinnedLat = coord[0].trim(); p.pinnedLng = coord[1].trim(); }
  saveLocPrefs(p);
}

// ─── Auto-init on DOMContentLoaded ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', applyProfileImages);
