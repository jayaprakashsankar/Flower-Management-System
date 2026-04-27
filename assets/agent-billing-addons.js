/* ────────────────────────────────────────────────────────
   ADDONS — appended to agent-billing.js
   New features: date nav, bill cards, bill detail modal,
   WhatsApp share, CSV import/export, quick-add member,
   settings radio, audit log
   ──────────────────────────────────────────────────────── */

/* ─── Date Navigation ─── */
function changeEntryDate(delta) {
  const el = document.getElementById('entryDate');
  const d = new Date(el.value || today());
  d.setDate(d.getDate() + delta);
  el.value = d.toISOString().split('T')[0];
  renderEntryGrid();
}

/* Override resolveRate to also check daily rate input */
const _origResolveRate = resolveRate;
resolveRate = function(memberId, flower, dateStr) {
  const drInput = document.getElementById('dailyRateInput');
  if (drInput && drInput.value && parseFloat(drInput.value) > 0) {
    const hint = document.getElementById('dailyRateHint');
    if (hint) hint.textContent = 'Custom rate';
    return parseFloat(drInput.value);
  }
  const hint = document.getElementById('dailyRateHint');
  if (hint) hint.textContent = 'Using default';
  return _origResolveRate(memberId, flower, dateStr);
}

/* ─── Quick-add member (inline strip) ─── */
function quickAddMember() {
  const storeName = (document.getElementById('qaStoreName') || {}).value.trim();
  const phone     = (document.getElementById('qaPhone')     || {}).value.trim();
  const location  = (document.getElementById('qaLocation')  || {}).value.trim();
  if (!storeName || !phone) { showToast('Store Name and Mobile are required', 'warning'); return; }
  if (DB.members.find(m => m.phone === phone)) { showToast('Phone already registered', 'error'); return; }
  DB.members.push({
    id: DB.nextMemberId++,
    storeName, ownerName: storeName,
    phone, address: location,
    status: 'active',
    billingCycle: DB.settings.billingPref || 'monthly',
    commType: 'percent',
    commValue: DB.settings.commissionPct || 5,
  });
  saveDB();
  addAuditLog(`Member added: ${storeName} (${phone})`);
  document.getElementById('qaStoreName').value = '';
  document.getElementById('qaPhone').value = '';
  document.getElementById('qaLocation').value = '';
  renderMembers();
  showToast(`✅ ${storeName} added as member!`);
}

/* ─── Import CSV for members ─── */
function importMembersCSV(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').filter(l => l.trim());
    let added = 0, skipped = 0;
    lines.slice(1).forEach(line => {  // skip header
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const [storeName, phone, address, commValue] = cols;
      if (!storeName || !phone) { skipped++; return; }
      if (DB.members.find(m => m.phone === phone)) { skipped++; return; }
      DB.members.push({
        id: DB.nextMemberId++, storeName, ownerName: storeName,
        phone, address: address || '', status: 'active',
        billingCycle: 'monthly', commType: 'percent',
        commValue: parseFloat(commValue) || 5,
      });
      added++;
    });
    saveDB(); renderMembers();
    addAuditLog(`CSV import: ${added} members added, ${skipped} skipped`);
    showToast(`Imported ${added} members (${skipped} skipped)`);
    input.value = '';
  };
  reader.readAsText(file);
}

/* ─── Bill Cards (Generate Bills section) ─── */
function renderBillCards() {
  const grid = document.getElementById('billCardsGrid');
  if (!grid) return;

  const mp  = document.getElementById('billMonthPicker');
  const pp  = document.getElementById('billPeriodPicker');
  if (!mp || !pp) return;

  // Default to current month
  if (!mp.value) {
    const now = new Date();
    mp.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  }

  const [year, month] = mp.value.split('-').map(Number);
  const period = pp.value;
  const days   = daysInMonth(year, month);

  let from, to;
  if (period === 'monthly')      { from = `${year}-${pad(month)}-01`; to = `${year}-${pad(month)}-${pad(days)}`; }
  else if (period === 'first_half')  { from = `${year}-${pad(month)}-01`; to = `${year}-${pad(month)}-15`; }
  else { from = `${year}-${pad(month)}-16`; to = `${year}-${pad(month)}-${pad(days)}`; }

  const members = DB.members.filter(m => m.status === 'active');
  if (!members.length) {
    grid.innerHTML = '<div class="text-muted text-sm" style="padding:2rem;">No active members. Add members first.</div>';
    return;
  }

  grid.innerHTML = members.map(m => {
    const calc = computeBill(m.id, from, to);
    const existingBill = DB.bills.find(b => b.memberId === m.id && b.from === from && b.to === to);
    const saved = existingBill ? `<span class="badge badge-green" style="font-size:.65rem;">Saved</span>` : '';
    return `
    <div class="bill-member-card">
      <div class="bmc-header">
        <div>
          <div class="bmc-name">${m.storeName} ${saved}</div>
          <div class="text-xs text-muted">Total Qty: ${calc.totalQty.toFixed(2)}</div>
        </div>
        <div class="bmc-net">Net: ${fmtMoney(calc.net)}</div>
      </div>
      <div class="bmc-row"><span>Gross Amount:</span><span>${fmtMoney(calc.gross)}</span></div>
      <div class="bmc-row bmc-comm"><span>Commission (${m.commType === 'percent' ? m.commValue + '%' : '₹' + m.commValue}):</span><span>-${fmtMoney(calc.commission)}</span></div>
      <div class="bmc-row bmc-lug"><span>Luggage:</span><span>+${fmtMoney(calc.luggage)}</span></div>
      <div class="bmc-payable"><span>Payable:</span><span>${fmtMoney(calc.net)}</span></div>
      <div class="bmc-actions">
        <button class="btn btn-outline btn-sm" onclick="openBillDetail(${m.id},'${from}','${to}')">👁 View</button>
        <button class="btn btn-outline btn-sm" onclick="downloadBillText(${m.id},'${from}','${to}')">⬇ Download</button>
        <button class="btn btn-sm btn-wa" onclick="shareWhatsApp(${m.id},'${from}','${to}')">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.374 0 0 5.373 0 12c0 2.126.553 4.127 1.526 5.865L.057 23.995l6.335-1.602A11.944 11.944 0 0012 24c6.626 0 12-5.374 12-12S18.626 0 12 0zm0 21.818a9.778 9.778 0 01-5.012-1.38l-.36-.214-3.715.975.992-3.63-.234-.372A9.778 9.778 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
          WhatsApp
        </button>
        <button class="btn btn-outline btn-sm" onclick="quickSaveAndPrint(${m.id},'${from}','${to}')">🖨 Print</button>
      </div>
    </div>`;
  }).join('');
}

/* ─── Bill Detail Modal ─── */
let _currentBillDetail = null;

function openBillDetail(memberId, from, to) {
  const member = DB.members.find(m => m.id === memberId);
  if (!member) return;
  const calc   = computeBill(memberId, from, to);
  const shop   = DB.settings;

  // Build date-by-date rows for the entire range
  const d1 = new Date(from), d2 = new Date(to);
  const allDates = [];
  for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
    allDates.push(d.toISOString().split('T')[0]);
  }

  const flower = (document.getElementById('billPeriodPicker') ? DB.settings.defaultFlower : DB.settings.defaultFlower) || 'Rose';
  let rowsHTML = '';
  let rowNum = 1;
  allDates.forEach(dt => {
    // Find all entries for this member on this date
    const dayEntries = DB.entries.filter(e => e.memberId === memberId && e.date === dt);
    if (dayEntries.length) {
      dayEntries.forEach(e => {
        const rate = resolveRate(memberId, e.flower, e.date);
        const amt  = e.qty * rate;
        rowsHTML += `<tr>
          <td>${rowNum++}</td>
          <td>${dt}</td>
          <td><span class="has-entry-pill">${e.flower}</span></td>
          <td style="text-align:right;font-weight:600;">${e.qty.toFixed(2)} kg</td>
          <td style="text-align:right;">₹${rate}</td>
          <td style="text-align:right;font-weight:600;color:var(--green-dark);">₹${amt.toFixed(2)}</td>
        </tr>`;
      });
    } else {
      rowsHTML += `<tr>
        <td>${rowNum++}</td>
        <td>${dt}</td>
        <td><span class="no-entry-pill">No Entry</span></td>
        <td style="text-align:right;color:var(--text-4);">—</td>
        <td style="text-align:right;color:var(--text-4);">—</td>
        <td style="text-align:right;color:var(--text-4);">—</td>
      </tr>`;
    }
  });

  const periodLabel = {monthly:'Monthly', first_half:'1st Half (1–15)', second_half:'2nd Half (16–End)', custom:'Custom'}[
    from.endsWith('-01') && to.endsWith('-15') ? 'first_half' :
    from.match(/-16$/) ? 'second_half' : 'monthly'
  ] || 'Custom';

  const html = `
    <!-- Bill header like reference -->
    <div style="background:#F9FBE7;border-radius:var(--radius-lg);padding:1.25rem;margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.75rem;">
        <div>
          <div style="font-weight:900;font-size:1.15rem;color:var(--green-dark);">${shop.shopName}</div>
          <div class="text-xs text-muted">Proprietor: ${shop.ownerName}</div>
          <div class="text-xs text-muted">${shop.address}</div>
          <div class="text-xs text-muted">📞 ${shop.phone} &nbsp;|&nbsp; GST: ${shop.gstNumber || 'N/A'}</div>
        </div>
        <div style="text-align:right;">
          <div class="text-xs text-muted">Invoice Period</div>
          <div style="font-weight:700;font-size:.9rem;">${from} to ${to}</div>
          <div class="text-xs text-muted">${periodLabel}</div>
        </div>
      </div>
      <div style="margin-top:.85rem;border-top:1.5px solid var(--green-light);padding-top:.75rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;">
        <div><div class="text-xs text-muted">Bill To</div><div style="font-weight:700;">${member.storeName}</div><div class="text-xs text-muted">${member.phone} · ${member.address || ''}</div></div>
        <div style="text-align:right;"><div class="text-xs text-muted">Commission</div><div style="font-weight:600;">${member.commType==='percent'?member.commValue+'%':'₹'+member.commValue}</div></div>
      </div>
    </div>

    <!-- Date-wise detail table -->
    <div style="overflow-x:auto;margin-bottom:1rem;">
      <table class="bill-detail-table">
        <thead><tr><th>#</th><th>Date</th><th>Status / Flower</th><th style="text-align:right;">Net Weight</th><th style="text-align:right;">Rate Applied</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>

    <!-- Performance Summary (like reference bottom) -->
    <div style="background:#F1F8E9;border-radius:var(--radius-lg);padding:1rem 1.25rem;">
      <div class="font-semi text-sm mb-2">Performance Summary</div>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;margin-bottom:.75rem;">
        <div><div class="text-xs text-muted">Total Amount</div><div style="font-weight:800;font-size:1rem;">${calc.totalQty.toFixed(3)} kg</div></div>
        <div><div class="text-xs text-muted">Avg Rate/kg</div><div style="font-weight:700;">₹${calc.totalQty > 0 ? (calc.gross / calc.totalQty).toFixed(2) : 0}</div></div>
        <div><div class="text-xs text-muted">Subtotal (Gross)</div><div style="font-weight:700;">${fmtMoney(calc.gross)}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:.3rem .75rem;font-size:.82rem;">
        <span>Gross Amount:</span><span style="text-align:right;">${fmtMoney(calc.gross)}</span>
        <span style="color:var(--danger);">(-) Commission:</span><span style="text-align:right;color:var(--danger);">-${fmtMoney(calc.commission)}</span>
        <span style="color:var(--warning);">(+) Luggage/Extra:</span><span style="text-align:right;color:var(--warning);">+${fmtMoney(calc.luggage)}</span>
      </div>
      <div style="border-top:2px solid var(--green-light);margin-top:.6rem;padding-top:.6rem;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:900;font-size:.9rem;">NET PAYABLE</span>
        <span style="font-weight:900;font-size:1.2rem;color:var(--green-dark);background:var(--green);color:#fff;padding:.25rem .85rem;border-radius:var(--radius-full);">${fmtMoney(calc.net)}</span>
      </div>
    </div>

    <!-- Signatures -->
    <div style="display:flex;justify-content:space-around;margin-top:1.5rem;padding-top:1rem;border-top:2px dashed var(--border);">
      <div style="text-align:center;"><div style="width:120px;border-bottom:1px solid #999;margin:0 auto 4px;"></div><div class="text-xs text-muted">Authorized Signatory</div></div>
      <div style="text-align:center;"><div style="width:120px;border-bottom:1px solid #999;margin:0 auto 4px;"></div><div class="text-xs text-muted">Receiver's Signature</div></div>
    </div>
    <div class="text-xs text-muted text-center mt-2">Computer generated invoice. No signature required.</div>
    <div style="text-align:center;margin-top:.5rem;font-size:.75rem;color:var(--text-4);">Pay via UPI: ${shop.upi || '—'}</div>
  `;

  document.getElementById('bdTitle').textContent = `Invoice — ${member.storeName}`;
  document.getElementById('bdPeriod').textContent = `${from} to ${to} | ${periodLabel}`;
  document.getElementById('billDetailContent').innerHTML = html;
  _currentBillDetail = { memberId, from, to, member, calc };
  openModal('billDetailModal');
}

function printCurrentBillDetail() {
  if (!_currentBillDetail) return;
  const { memberId, from, to } = _currentBillDetail;
  const content = document.getElementById('billDetailContent').innerHTML;
  const win = window.open('', '_blank', 'width=680,height=800');
  win.document.write(`<!DOCTYPE html><html><head><title>Bill</title><style>
    body{font-family:sans-serif;margin:1.5rem;font-size:13px;color:#212121;}
    table{width:100%;border-collapse:collapse;}th{background:#2E7D32;color:#fff;padding:6px 8px;text-align:left;font-size:11px;}
    td{padding:5px 8px;border-bottom:1px solid #eee;}tr:nth-child(even) td{background:#fafafa;}
    .no-entry-pill{background:#FFEBEE;color:#c62828;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:700;}
    .has-entry-pill{background:#E8F5E9;color:#1b5e20;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:700;}
  </style></head><body>${content}<script>window.print();<\/script></body></html>`);
  win.document.close();
}

/* ─── WhatsApp Share ─── */
function shareWhatsApp(memberId, from, to) {
  const member = DB.members.find(m => m.id === memberId);
  if (!member) return;
  const calc = computeBill(memberId, from, to);
  const shop = DB.settings;
  const msg = `🌸 *${shop.shopName}*
📋 Bill for *${member.storeName}*
📅 Period: ${from} to ${to}
━━━━━━━━━━━━━━━━
📦 Total Qty: ${calc.totalQty.toFixed(2)} kg
💰 Gross: ${fmtMoney(calc.gross)}
📉 Commission: -${fmtMoney(calc.commission)}
🔖 Luggage: +${fmtMoney(calc.luggage)}
━━━━━━━━━━━━━━━━
✅ *NET PAYABLE: ${fmtMoney(calc.net)}*
Pay via UPI: ${shop.upi || '—'}
Thank you! 🌺`;
  const url = `https://wa.me/${member.phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  addAuditLog(`WhatsApp bill sent to ${member.storeName}`);
}

/* ─── Download Bill as Text ─── */
function downloadBillText(memberId, from, to) {
  const member = DB.members.find(m => m.id === memberId);
  if (!member) return;
  const calc = computeBill(memberId, from, to);
  const shop = DB.settings;
  let txt = `${'='.repeat(48)}\n  ${shop.shopName}\n  ${shop.address}\n  ${shop.phone} | GST: ${shop.gstNumber || 'N/A'}\n${'='.repeat(48)}\n`;
  txt += `  Bill To: ${member.storeName} (${member.owner_name || member.ownerName})\n  Period: ${from} to ${to}\n${'-'.repeat(48)}\n`;
  const entries = DB.entries.filter(e => e.memberId === memberId && e.date >= from && e.date <= to);
  entries.forEach(e => {
    const rate = resolveRate(memberId, e.flower, e.date);
    txt += `  ${e.date}  ${e.flower}  ${e.qty}kg @ ₹${rate} = ₹${(e.qty * rate).toFixed(2)}\n`;
  });
  txt += `${'-'.repeat(48)}\n  Gross: ${fmtMoney(calc.gross)}\n  Commission: -${fmtMoney(calc.commission)}\n  Luggage: +${fmtMoney(calc.luggage)}\n${'='.repeat(48)}\n  NET PAYABLE: ${fmtMoney(calc.net)}\n  UPI: ${shop.upi || '—'}\n`;
  const blob = new Blob([txt], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Bill_${member.storeName}_${from}.txt`;
  a.click();
  addAuditLog(`Bill downloaded for ${member.storeName}`);
}

function quickSaveAndPrint(memberId, from, to) {
  const calc = computeBill(memberId, from, to);
  const period = from.endsWith('-16') ? 'second_half' : from.endsWith('-01') && to.endsWith('-15') ? 'first_half' : 'monthly';
  const billNo = genBillNo();
  DB.bills.push({ id: DB.nextBillId, billNo, memberId, period, from, to, totalQty: calc.totalQty, gross: calc.gross, commission: calc.commission, luggage: calc.luggage, net: calc.net, status: 'draft', createdAt: today(), notes: '' });
  DB.nextBillId++;
  saveDB();
  renderBillCards();
  openBillDetail(memberId, from, to);
  showToast('Bill saved and opened!');
}

/* ─── Export CSV (all bills) ─── */
function exportAllBills() {
  let csv = 'Bill No,Member,Period From,Period To,Qty (kg),Gross (₹),Commission (₹),Luggage (₹),Net Payable (₹),Status\n';
  DB.bills.forEach(b => {
    const m = DB.members.find(x => x.id === b.memberId);
    csv += `"${b.billNo}","${m ? m.storeName : '—'}","${b.from}","${b.to}","${b.totalQty}","${b.gross}","${b.commission}","${b.luggage}","${b.net}","${b.status}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FloraChain_Bills_${today()}.csv`;
  a.click();
  showToast('Bills exported as CSV!');
}

/* ─── Settings — radio and commission toggle ─── */
function toggleCommSection() {
  const enabled = document.getElementById('settCommEnabled').checked;
  const section = document.getElementById('commSection');
  if (section) section.style.opacity = enabled ? '1' : '0.4';
}
function updateCommIcon() {
  const isFixed = document.getElementById('settCommFixed') && document.getElementById('settCommFixed').checked;
  const label = document.getElementById('commValueLabel');
  if (label) label.textContent = isFixed ? 'Fixed Amount (₹)' : 'Percentage Value (%)';
}

/* ─── Audit Log ─── */
const AUDIT_KEY = 'floraAuditLog';
function addAuditLog(text) {
  try {
    const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    logs.unshift({ text, time: new Date().toLocaleString('en-IN') });
    if (logs.length > 50) logs.splice(50);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
  } catch (e) {}
}
function renderAuditLog() {
  const el = document.getElementById('auditLog');
  if (!el) return;
  try {
    const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    el.innerHTML = logs.length ? logs.map(l => `
      <div class="audit-item">
        <div class="audit-icon">📝</div>
        <div><div class="audit-text">${l.text}</div><div class="audit-time">${l.time}</div></div>
      </div>`).join('') : '<div class="text-muted text-sm p-3">No activity recorded yet.</div>';
  } catch (e) {}
}

/* ─── Override showSection to init new sections ─── */
const _origShowSection = showSection;
showSection = function(name) {
  _origShowSection(name);
  if (name === 'bills') {
    const mp = document.getElementById('billMonthPicker');
    if (mp && !mp.value) {
      const now = new Date();
      mp.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    }
    initBillForm();
    renderBillCards();
  }
  if (name === 'settings') renderAuditLog();
}

/* ─── Override saveSettings to handle new fields ─── */
const _origSaveSettings = saveSettings;
saveSettings = function() {
  _origSaveSettings();
  // Save new fields
  const commFixed = document.getElementById('settCommFixed');
  const commValue = document.getElementById('settCommValue');
  const lugRate   = document.getElementById('settLugRate');
  if (commFixed) DB.settings.commissionType = commFixed.checked ? 'fixed' : 'percent';
  if (commValue) DB.settings.commissionPct = parseFloat(commValue.value) || 5;
  if (lugRate)   DB.settings.luggageRate = parseFloat(lugRate.value) || 0;
  saveDB();
  addAuditLog('Settings saved');
}

/* ─── Override loadSettings to populate new fields ─── */
const _origLoadSettings = loadSettings;
loadSettings = function() {
  _origLoadSettings();
  const commValue = document.getElementById('settCommValue');
  const lugRate   = document.getElementById('settLugRate');
  const commPct   = document.getElementById('settCommPct');
  const commFixed = document.getElementById('settCommFixed');
  if (commValue) commValue.value = DB.settings.commissionPct || 5;
  if (lugRate)   lugRate.value   = DB.settings.luggageRate   || 0;
  if (DB.settings.commissionType === 'fixed' && commFixed) { commFixed.checked = true; updateCommIcon(); }
  else if (commPct) { commPct.checked = true; }
}
