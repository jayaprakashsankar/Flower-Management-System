/* ─── FloraChain Dashboard Shared Utilities v2 ─── */

/* ─── Chart defaults (light theme) ─── */
function getChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#424242', font: { family: 'Inter', size: 12 }, boxWidth: 12 } },
      tooltip: {
        backgroundColor: '#fff', titleColor: '#212121', bodyColor: '#424242',
        borderColor: '#E0E0E0', borderWidth: 1, cornerRadius: 10,
        padding: 12,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9E9E9E', font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#9E9E9E', font: { size: 11 } } }
    }
  };
}

/* ─── Doughnut / no-axes chart ─── */
function getNoAxisDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#424242', font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 14 } },
      tooltip: { backgroundColor: '#fff', titleColor: '#212121', bodyColor: '#424242', borderColor: '#E0E0E0', borderWidth: 1, cornerRadius: 10, padding: 10 }
    }
  };
}

/* ─── Colour palette ─── */
const C = {
  green:   '#4CAF50', greenDk: '#388E3C', greenLt: 'rgba(76,175,80,0.15)',
  coral:   '#FF7043', coralDk: '#E64A19', coralLt: 'rgba(255,112,67,0.15)',
  blue:    '#1976D2', blueLt:  'rgba(25,118,210,0.15)',
  orange:  '#FF9800', orangeLt:'rgba(255,152,0,0.15)',
  purple:  '#7B1FA2', purpleLt:'rgba(123,31,162,0.15)',
};

/* ─── Random data helpers ─── */
function randArr(n, min, max) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
function last6Months() {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = new Date(); const res = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (d.getMonth() - i + 12) % 12; res.push(m[idx]);
  }
  return res;
}
function last12Months() {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = new Date(); const res = [];
  for (let i = 11; i >= 0; i--) {
    const idx = (d.getMonth() - i + 12) % 12; res.push(m[idx]);
  }
  return res;
}

/* ─── Toast ─── */
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icons = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 3000);
  setTimeout(() => t.remove(), 3500);
}

/* ─── Modal ─── */
function openModal(id)  { const m = document.getElementById(id); if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { const m = document.getElementById(id); if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

/* ─── Toggle switches ─── */
function initToggles() {
  document.querySelectorAll('.toggle-switch[data-on]').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('active');
      const lbl = sw.nextElementSibling;
      if (lbl && lbl.classList.contains('toggle-label')) {
        lbl.textContent = sw.classList.contains('active') ? sw.dataset.on : sw.dataset.off;
        lbl.style.color = sw.classList.contains('active') ? 'var(--green-dark)' : 'var(--text-3)';
      }
    });
  });
}

/* ─── Tab switching ─── */
function initTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector || '.tabs');
  containers.forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        const allContent = document.querySelectorAll('.tab-content');
        allContent.forEach(c => { c.classList.remove('active'); if (c.id === target) c.classList.add('active'); });
      });
    });
  });
}

/* ─── Sidebar toggle (mobile) ─── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      sidebar.classList.toggle('mobile-open');
      if (overlay) overlay.classList.toggle('hidden');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (sidebar)  sidebar.classList.remove('mobile-open');
      if (toggle)   toggle.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }

  initToggles();
  initTabs();
});

/* ─── Section switcher ─── */
function switchSection(name) {
  if (!window.sections) return;
  window.sections.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
  // update sidebar active
  document.querySelectorAll('.sidebar-item').forEach(item => {
    const fn = item.getAttribute('onclick') || '';
    item.classList.toggle('active', fn.includes("'" + name + "'") || fn.includes('"' + name + '"'));
  });
  // update bottom nav active
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    const fn = item.getAttribute('onclick') || '';
    item.classList.toggle('active', fn.includes("'" + name + "'") || fn.includes('"' + name + '"'));
  });
}

/* ─── Number formatter ─── */
function fmtMoney(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n;
}

/* ─── Animate counter ─── */
function animateCount(el, target, prefix = '₹', suffix = '') {
  const dur = 1200; const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(ease * target).toLocaleString('en-IN') + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
