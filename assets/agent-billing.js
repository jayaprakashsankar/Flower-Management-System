/* ════════════════════════════════════════════
   FloraChain — Agent Billing Engine
   agent-billing.js  (localStorage-backed)
   ════════════════════════════════════════════ */

'use strict';

/* ─── State ─── */
let DB = {
  settings: {
    shopName:'Suresh Agencies', ownerName:'Suresh Kumar',
    address:'#12, Market Road, Jayanagar, Bangalore – 560041',
    phone:'+91 98765 43210', gstNumber:'29AAAAA0000A1Z5',
    defaultFlower:'Rose', defaultRate:120,
    commissionPct:5, billingPref:'monthly', upi:'suresh.agency@upi'
  },
  members:[
    {id:1,storeName:'Ramesh Kumar',ownerName:'Ramesh Kumar',phone:'9876543210',address:'Hosur, Krishnagiri, TN',location:'Hosur, Krishnagiri',status:'active',billingCycle:'monthly',commType:'percent',commValue:5},
    {id:2,storeName:'Kavitha Sundaram',ownerName:'Kavitha Sundaram',phone:'9823456789',address:'Mysuru, KA',location:'Mysuru, KA',status:'active',billingCycle:'first_half',commType:'percent',commValue:4},
    {id:3,storeName:'Velu Farm',ownerName:'Velu Swamy',phone:'9712345678',address:'Madurai, TN',location:'Madurai, TN',status:'active',billingCycle:'monthly',commType:'percent',commValue:5},
    {id:4,storeName:'Anitha Rose Farm',ownerName:'Anitha R',phone:'9611234567',address:'Coimbatore, TN',location:'Coimbatore, TN',status:'inactive',billingCycle:'second_half',commType:'percent',commValue:6},
  ],
  defaultRates:{Rose:120,Marigold:45,Jasmine:280,Gerbera:18,Lotus:95},
  // Per-flower commission overrides: {flower, commType, commValue}
  flowerCommissions:{Rose:{commType:'percent',commValue:5},Marigold:{commType:'percent',commValue:4},Jasmine:{commType:'percent',commValue:6},Gerbera:{commType:'percent',commValue:5},Lotus:{commType:'percent',commValue:5}},
  // Monthly rate history: {month:'2026-03', flower, rate}
  rateHistory:[],
  overrides:[],
  entries:[],  // {id, memberId, date, flower, qty, luggageCharge, notes, workStatus}
  bills:[],    // {id, billNo, memberId, flower, period, from, to, totalQty, gross, commission, luggage, net, status, createdAt}
  farmerDayStatus:{}, // key: memberId+'_'+date => 'started'|'completed'
  nextMemberId:5,
  nextBillId:1,
  nextEntryId:1,
};

/* ─── Persistence ─── */
function saveDB(){ try{ localStorage.setItem('floraAgentDB', JSON.stringify(DB)); } catch(e){} }
function loadDB(){
  try{
    const raw = localStorage.getItem('floraAgentDB');
    if(raw){ DB = Object.assign(DB, JSON.parse(raw)); }
  } catch(e){}
}

/* ─── Utility ─── */
function fmtMoney(n){ return '₹' + Number(n||0).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fmtQty(n){ return Number(n||0).toFixed(2) + ' kg'; }
function today(){ return new Date().toISOString().split('T')[0]; }
function daysInMonth(year, month){ return new Date(year, month, 0).getDate(); }
function pad(n){ return String(n).padStart(2,'0'); }
function initials(s){ return s.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function getMonthName(m){ return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]; }
function genBillNo(){ const d=new Date(); return `FC-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(DB.nextBillId)}`; }

function showToast(msg, type='success'){
  const c=document.getElementById('toastContainer');
  if(!c) return;
  const icons={success:'✅',info:'ℹ️',warning:'⚠️',error:'❌'};
  const t=document.createElement('div');
  t.className='toast '+type;
  t.innerHTML=`<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .4s'; }, 3000);
  setTimeout(()=>t.remove(), 3500);
}

/* ─── Section Navigation ─── */
const ALL_SECTIONS=['dashboard','members','entries','rates','bills','history','settings'];
function showSection(name){
  ALL_SECTIONS.forEach(s=>{
    const el=document.getElementById('sec-'+s);
    if(el) el.style.display = s===name ? 'block' : 'none';
  });
  document.querySelectorAll('.sidebar-item').forEach(item=>{
    const fn=item.getAttribute('onclick')||'';
    item.classList.toggle('active', fn.includes("'"+name+"'") || fn.includes('"'+name+'"'));
  });
  document.querySelectorAll('.bottom-nav-item').forEach(item=>{
    const fn=item.getAttribute('onclick')||'';
    item.classList.toggle('active', fn.includes("'"+name+"'") || fn.includes('"'+name+'"'));
  });
  if(name==='dashboard') renderDashboard();
  if(name==='members')   renderMembers();
  if(name==='entries')   renderEntryGrid();
  if(name==='rates')     renderRates();
  if(name==='bills')     initBillForm();
  if(name==='history')   renderBillHistory();
  if(name==='settings')  loadSettings();
}

/* ─── Modal helpers ─── */
function openModal(id){ const m=document.getElementById(id); if(m){ m.classList.add('open'); document.body.style.overflow='hidden'; populateModalDropdowns(); } }
function closeModal(id){ const m=document.getElementById(id); if(m){ m.classList.remove('open'); document.body.style.overflow=''; } }
document.addEventListener('click', e=>{ if(e.target.classList.contains('modal-overlay')) closeModal(e.target.id); });

function populateModalDropdowns(){
  ['orMember'].forEach(selId=>{
    const sel=document.getElementById(selId);
    if(!sel) return;
    sel.innerHTML='<option value="">— Select —</option>'+DB.members.filter(m=>m.status==='active').map(m=>`<option value="${m.id}">${m.storeName}</option>`).join('');
  });
  // Default rate form
  const drf=document.getElementById('defaultRateForm');
  if(drf){
    drf.innerHTML=Object.entries(DB.defaultRates).map(([f,r])=>`
      <div class="form-row"><div class="form-group"><label class="form-label">${f}</label><div class="input-group"><span class="input-icon">₹</span><input type="number" class="form-input" id="dr_${f}" value="${r}" step="0.5"/></div></div></div>`).join('');
  }
}

/* ─── DASHBOARD ─── */
function renderDashboard(){
  const currentMonth = new Date().getMonth()+1;
  const currentYear  = new Date().getFullYear();
  const monthStr = `${currentYear}-${pad(currentMonth)}`;

  const monthEntries = DB.entries.filter(e=>e.date.startsWith(monthStr));
  let totalGross=0, totalComm=0;
  monthEntries.forEach(e=>{
    const rate = resolveRate(e.memberId, e.flower, e.date);
    const gross = e.qty * rate;
    const member = DB.members.find(m=>m.id===e.memberId);
    const comm = member ? calcCommission(gross, member) : 0;
    totalGross += gross;
    totalComm += comm;
  });
  const net = totalGross - totalComm;
  const activeM = DB.members.filter(m=>m.status==='active').length;
  const pendingBills = DB.bills.filter(b=>b.status==='draft'||b.status==='overdue').length;

  setEl('dashIncome', fmtMoney(totalGross));
  setEl('dashComm', fmtMoney(totalComm));
  setEl('dashNet', fmtMoney(net));
  setEl('dashMembers', activeM);
  setEl('memberCountBadge', DB.members.length);
  setEl('qsBills', DB.bills.length);
  setEl('qsPending', pendingBills);
  setEl('qsEntries', DB.entries.length);
  setEl('qsRate', '₹'+DB.defaultRates[DB.settings.defaultFlower]+'/kg');
  setEl('qsComm', DB.settings.commissionPct+'%');
  setEl('shopSubtitle', DB.settings.shopName+' · '+DB.settings.address.split(',').slice(-1)[0].trim());

  // Avg daily qty
  if(monthEntries.length){
    const days=new Set(monthEntries.map(e=>e.date)).size;
    const avgQty=(monthEntries.reduce((s,e)=>s+e.qty,0)/days).toFixed(1);
    setEl('qsAvgQty', avgQty+' kg/day');
  }

  // Recent entries table
  const tbody=document.getElementById('recentEntriesTable');
  if(tbody){
    const recents=[...DB.entries].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
    tbody.innerHTML = recents.length ? recents.map(e=>{
      const m = DB.members.find(x=>x.id===e.memberId);
      const rate = resolveRate(e.memberId, e.flower, e.date);
      const amt = e.qty * rate;
      return `<tr>
        <td class="text-sm text-muted">${e.date}</td>
        <td class="font-medium">${m?m.storeName:'—'}</td>
        <td>${e.flower}</td>
        <td>${e.qty} kg</td>
        <td class="text-sm">₹${rate}</td>
        <td class="font-bold text-green">${fmtMoney(amt)}</td>
        <td class="text-sm">${e.luggageCharge?fmtMoney(e.luggageCharge):'—'}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="7" class="text-muted text-center" style="padding:2rem;">No entries yet. Start adding daily entries.</td></tr>';
  }

  // Revenue chart
  renderDashChart();
}

function renderDashChart(){
  const ctx=document.getElementById('dashRevenueChart');
  if(!ctx) return;
  if(ctx._chart){ ctx._chart.destroy(); }
  const months=[];const data=[];
  for(let i=5;i>=0;i--){
    const d=new Date(); d.setMonth(d.getMonth()-i);
    const mStr=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
    months.push(getMonthName(d.getMonth()+1));
    const mEntries=DB.entries.filter(e=>e.date.startsWith(mStr));
    let gross=0;
    mEntries.forEach(e=>{ gross+= e.qty * resolveRate(e.memberId, e.flower, e.date); });
    data.push(Math.round(gross));
  }
  ctx._chart = new Chart(ctx.getContext('2d'),{
    type:'bar',
    data:{labels:months,datasets:[{label:'Revenue',data,backgroundColor:'rgba(76,175,80,0.2)',borderColor:'#4CAF50',borderWidth:2,borderRadius:6}]},
    options:{...getChartDefaults(), responsive:true, maintainAspectRatio:false}
  });
}

function setEl(id,val){ const el=document.getElementById(id); if(el) el.textContent=val; }

/* ─── MEMBERS ─── */
function renderMembers(){
  const grid=document.getElementById('membersGrid');
  if(!grid) return;
  const search=(document.getElementById('memberSearch')||{value:''}).value.toLowerCase();
  const filter=(document.getElementById('memberFilter')||{value:'all'}).value;
  let list=DB.members;
  if(filter!=='all') list=list.filter(m=>m.status===filter);
  if(search) list=list.filter(m=>m.storeName.toLowerCase().includes(search)||m.phone.includes(search)||(m.location||'').toLowerCase().includes(search));
  document.getElementById('memberCountBadge').textContent=DB.members.length;
  if(!list.length){ grid.innerHTML='<div class="text-muted text-sm" style="padding:2rem;">No farmers found.</div>'; return; }
  grid.innerHTML=list.map(m=>{
    const todayEntries=DB.entries.filter(e=>e.memberId===m.id&&e.date===today());
    const totalToday=todayEntries.reduce((s,e)=>s+e.qty,0);
    return `
    <div class="member-card">
      <div class="flex gap-3 items-center mb-3">
        <div class="member-avatar" style="background:${m.status==='active'?'linear-gradient(135deg,var(--green),var(--green-dark))':'#BDBDBD'};">${initials(m.storeName)}</div>
        <div style="flex:1;min-width:0;">
          <div class="font-semi truncate">${m.storeName}</div>
          <div class="text-xs text-muted">📞 ${m.phone}</div>
        </div>
        <span class="${m.status==='active'?'status-active':'status-inactive'}">${m.status}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:.4rem;" class="text-sm">
        <div class="flex gap-2"><span class="text-muted">📍</span><span class="truncate">${m.location||m.address||'—'}</span></div>
        <div class="flex gap-2"><span class="text-muted">⚖️</span><span>Today: <strong>${totalToday>0?totalToday.toFixed(1)+' kg':'No entries'}</strong></span></div>
        <div class="flex gap-2"><span class="text-muted">🔄</span><span>Billing: ${m.billingCycle.replace('_',' ')}</span></div>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="btn btn-outline-green btn-sm flex-1" onclick="openEditMember(${m.id})">✏️ Edit</button>
        <button class="btn btn-sm flex-1" style="background:#FBE9E7;color:var(--coral);border:1px solid var(--coral-light);" onclick="showSection('bills');prefillBillMember(${m.id})">🧾 Bill</button>
      </div>
    </div>`;
  }).join('');
}


function saveMember(){
  const storeName=document.getElementById('mStoreName').value.trim();
  const phone=document.getElementById('mPhone').value.trim();
  const location=(document.getElementById('mLocation')||{value:''}).value.trim();
  if(!storeName||!phone){ showToast('Farmer name and mobile are required','warning'); return; }
  if(DB.members.find(m=>m.phone===phone)){ showToast('Mobile number already registered','error'); return; }
  DB.members.push({
    id:DB.nextMemberId++, storeName, ownerName:storeName, phone, location,
    address:document.getElementById('mAddress').value.trim()||location,
    status:document.getElementById('mStatus').value,
    billingCycle:document.getElementById('mBillingCycle').value,
    commType:'percent',
    commValue:parseFloat(document.getElementById('mCommValue').value)||5,
  });
  saveDB(); closeModal('addMemberModal'); renderMembers(); renderDashboard();
  showToast('Farmer added successfully!');
  ['mStoreName','mPhone','mAddress'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
}

function openEditMember(id){
  const m=DB.members.find(x=>x.id===id); if(!m) return;
  document.getElementById('eMemberId').value=m.id;
  document.getElementById('eStoreName').value=m.storeName;
  document.getElementById('ePhone').value=m.phone;
  const eLoc=document.getElementById('eLocation'); if(eLoc) eLoc.value=m.location||'';
  document.getElementById('eAddress').value=m.address||'';
  document.getElementById('eStatus').value=m.status;
  document.getElementById('eBillingCycle').value=m.billingCycle;
  document.getElementById('eCommValue').value=m.commValue;
  openModal('editMemberModal');
}
function updateMember(){
  const id=parseInt(document.getElementById('eMemberId').value);
  const idx=DB.members.findIndex(x=>x.id===id); if(idx<0) return;
  const loc=(document.getElementById('eLocation')||{value:''}).value.trim();
  DB.members[idx]={...DB.members[idx],
    storeName:document.getElementById('eStoreName').value.trim(),
    ownerName:document.getElementById('eStoreName').value.trim(),
    phone:document.getElementById('ePhone').value.trim(),
    location:loc,
    address:document.getElementById('eAddress').value.trim()||loc,
    status:document.getElementById('eStatus').value,
    billingCycle:document.getElementById('eBillingCycle').value,
    commType:'percent',
    commValue:parseFloat(document.getElementById('eCommValue').value)||5,
  };
  saveDB(); closeModal('editMemberModal'); renderMembers(); showToast('Farmer updated!');
}
function deleteMember(){
  if(!confirm('Delete this member? All their entries will remain.')) return;
  const id=parseInt(document.getElementById('eMemberId').value);
  DB.members=DB.members.filter(m=>m.id!==id);
  saveDB(); closeModal('editMemberModal'); renderMembers(); showToast('Member deleted','warning');
}

/* ─── DAILY ENTRIES ─── */
function toggleFarmerStatus(memberId, dateStr){
  const key = memberId+'_'+dateStr;
  const cur = DB.farmerDayStatus[key]||'pending';
  const next = cur==='pending'?'started': cur==='started'?'completed':'started';
  DB.farmerDayStatus[key]=next;
  saveDB();
  // Re-render just this cell
  const cell=document.getElementById('fstatus_'+memberId);
  if(cell) cell.outerHTML=farmerStatusBadge(memberId,dateStr);
}
function farmerStatusBadge(memberId,dateStr){
  const key=memberId+'_'+dateStr;
  const st=DB.farmerDayStatus[key]||'pending';
  const map={pending:{cls:'status-pending',icon:'⏳',label:'Pending'},started:{cls:'status-started',icon:'▶️',label:'Process Started'},completed:{cls:'status-completed',icon:'✅',label:'Work Completed'}};
  const m=map[st];
  return `<span id="fstatus_${memberId}" class="${m.cls}" onclick="toggleFarmerStatus(${memberId},'${dateStr}')">${m.icon} ${m.label}</span>`;
}

function renderEntryGrid(){
  const dateEl=document.getElementById('entryDate');
  if(!dateEl.value) dateEl.value=today();
  const selDate=dateEl.value;
  const flower=(document.getElementById('entryFlower')||{value:'Rose'}).value;
  const activeMembers=DB.members.filter(m=>m.status==='active');

  const thead=document.getElementById('entryHead');
  const tbody=document.getElementById('entryBody');
  const tfoot=document.getElementById('entryFoot');
  if(!thead||!tbody||!tfoot) return;

  // Only show: Farmer info | Status | Weight | Notes
  thead.innerHTML=`<tr>
    <th style="text-align:left;">Farmer</th>
    <th>Status</th>
    <th>Weight (kg)</th>
    <th>Notes</th>
  </tr>`;

  let totalQty=0;
  tbody.innerHTML=activeMembers.map(m=>{
    const existing=DB.entries.find(e=>e.memberId===m.id && e.date===selDate && e.flower===flower)||{qty:0,notes:''};
    totalQty+=existing.qty||0;
    const av=initials(m.storeName);
    return `<tr>
      <td>
        <div class="farmer-cell">
          <div class="farmer-cell-avatar">${av}</div>
          <div>
            <div class="font-semi text-sm">${m.storeName}</div>
            <div class="text-xs text-muted">📍 ${m.location||m.address||'—'} · 📞 ${m.phone}</div>
          </div>
        </div>
      </td>
      <td style="white-space:nowrap;">${farmerStatusBadge(m.id,selDate)}</td>
      <td><input type="number" class="entry-input ${existing.qty>0?'has-value':''}" id="qty_${m.id}" value="${existing.qty||''}" placeholder="0" min="0" step="0.5" oninput="updateEntryRow(${m.id})"/></td>
      <td><input type="text" class="form-input" id="note_${m.id}" value="${existing.notes||''}" placeholder="Optional note" style="font-size:.78rem;padding:.3rem .5rem;min-width:120px;"/></td>
    </tr>`;
  }).join('');

  // Only total weight in footer
  tfoot.innerHTML=`<tr style="background:#E8F5E9;">
    <td class="font-bold">TOTAL</td>
    <td></td>
    <td id="totalQtyCell" class="entry-total text-center">${totalQty.toFixed(1)} kg</td>
    <td></td>
  </tr>`;
  updateDayWeightBadge();
}

function updateEntryRow(memberId){
  const qtyEl=document.getElementById('qty_'+memberId);
  const qty=parseFloat(qtyEl.value)||0;
  qtyEl.classList.toggle('has-value', qty>0);
  updateDayWeightBadge();
}

function updateDayWeightBadge(){
  let tQty=0;
  DB.members.filter(m=>m.status==='active').forEach(m=>{
    tQty+=parseFloat((document.getElementById('qty_'+m.id)||{}).value)||0;
  });
  const badge=document.getElementById('dayWeightBadge');
  if(badge) badge.textContent='Total: '+tQty.toFixed(1)+' kg';
  setEl('totalQtyCell',tQty.toFixed(1)+' kg');
}

function updateEntryFooter(){ updateDayWeightBadge(); }

function saveAllEntries(){
  const selDate=document.getElementById('entryDate').value;
  const flower=(document.getElementById('entryFlower')||{value:'Rose'}).value;
  const activeMembers=DB.members.filter(m=>m.status==='active');
  let saved=0;
  activeMembers.forEach(m=>{
    const qty=parseFloat((document.getElementById('qty_'+m.id)||{}).value)||0;
    const note=(document.getElementById('note_'+m.id)||{}).value||'';
    const statusKey=m.id+'_'+selDate;
    // Auto-set status to 'started' if qty > 0 and still pending
    if(qty>0 && !DB.farmerDayStatus[statusKey]) DB.farmerDayStatus[statusKey]='started';
    DB.entries=DB.entries.filter(e=>!(e.memberId===m.id && e.date===selDate && e.flower===flower));
    if(qty>0){
      DB.entries.push({id:DB.nextEntryId++, memberId:m.id, date:selDate, flower, qty, luggageCharge:0, notes:note});
      saved++;
    }
  });
  saveDB(); showToast(`✅ Saved weight entries for ${saved} farmers on ${selDate}`);
}

function autoFillZero(){
  DB.members.filter(m=>m.status==='active').forEach(m=>{
    const qtyEl=document.getElementById('qty_'+m.id);
    if(qtyEl && !qtyEl.value) { qtyEl.value=0; }
  });
  showToast('Auto-filled blank entries with 0','info');
}

/* ─── RATE RESOLUTION ─── */
function resolveRate(memberId, flower, dateStr){
  const override=DB.overrides.find(o=>
    o.memberId===memberId && o.flower===flower &&
    o.fromDate<=dateStr && (!o.toDate || o.toDate>=dateStr)
  );
  return override ? override.rate : (DB.defaultRates[flower]||DB.settings.defaultRate||120);
}

function calcCommission(gross, member){
  if(member.commType==='percent') return gross*(member.commValue/100);
  return member.commValue||0;
}

/* ─── RATES ─── */
function renderRates(){
  const list=document.getElementById('defaultRatesList');
  if(list){
    list.innerHTML=Object.entries(DB.defaultRates).map(([f,r])=>`
      <div class="rate-card">
        <div class="flex items-center gap-2"><span style="font-size:1.3rem;">${flowerEmoji(f)}</span><span class="font-semi">${f}</span></div>
        <div class="font-bold" style="color:var(--green-dark);">₹${r}<span class="text-muted text-xs">/kg</span></div>
      </div>`).join('');
  }
  renderFlowerCommTable();
  // Populate farmer dropdown for override
  const orMSel=document.getElementById('orMember');
  if(orMSel) orMSel.innerHTML='<option value="">— Select Farmer —</option>'+DB.members.filter(m=>m.status==='active').map(m=>`<option value="${m.id}">${m.storeName}</option>`).join('');
  const otbl=document.getElementById('overridesTable');
  const msg=document.getElementById('noOverrideMsg');
  if(otbl){
    if(!DB.overrides.length){ otbl.innerHTML='<tr><td colspan="6" style="padding:1rem;text-align:center;color:var(--text-3);">No overrides yet</td></tr>'; if(msg) msg.style.display='block'; }
    else{
      if(msg) msg.style.display='none';
      otbl.innerHTML=DB.overrides.map((o,i)=>{
        const m=DB.members.find(x=>x.id===o.memberId);
        return `<tr>
          <td class="font-medium">${m?m.storeName:'Deleted'}</td>
          <td>${flowerEmoji(o.flower)} ${o.flower}</td>
          <td class="font-bold" style="color:var(--green-dark);">₹${o.rate}/kg</td>
          <td class="text-sm">${o.fromDate}</td>
          <td class="text-sm">${o.toDate||'No end'}</td>
          <td><button class="btn btn-sm btn-danger-ghost" onclick="deleteOverride(${i})">Delete</button></td>
        </tr>`;
      }).join('');
    }
  }
}

function renderFlowerCommTable(){
  const tbl=document.getElementById('flowerCommTable');
  if(!tbl) return;
  if(!DB.flowerCommissions) DB.flowerCommissions={};
  tbl.innerHTML=Object.entries(DB.defaultRates).map(([f,r])=>{
    const fc=DB.flowerCommissions[f]||{commType:'percent',commValue:5};
    const commAmt=fc.commType==='percent'?(r*fc.commValue/100).toFixed(2):fc.commValue;
    return `<tr style="${Object.keys(DB.defaultRates).indexOf(f)%2===0?'background:#FAFAFA':''}">
      <td style="padding:.5rem .75rem;font-weight:600;">${flowerEmoji(f)} ${f}</td>
      <td style="text-align:center;padding:.5rem;">₹${r}/kg</td>
      <td style="text-align:center;padding:.5rem;">
        <select class="form-select" style="font-size:.75rem;padding:.2rem .4rem;" onchange="DB.flowerCommissions['${f}'].commType=this.value;saveDB();renderFlowerCommTable();">
          <option value="percent" ${fc.commType==='percent'?'selected':''}>Percentage (%)</option>
          <option value="fixed" ${fc.commType==='fixed'?'selected':''}>Fixed (₹/kg)</option>
        </select>
      </td>
      <td style="text-align:center;padding:.5rem;">
        <input type="number" class="entry-input" value="${fc.commValue}" step="0.5" style="width:60px;" onchange="DB.flowerCommissions['${f}']={commType:'${fc.commType}',commValue:parseFloat(this.value)||5};saveDB();renderFlowerCommTable();"/>
      </td>
      <td style="text-align:center;padding:.5rem;font-weight:700;color:var(--danger);">₹${commAmt}</td>
      <td style="text-align:center;padding:.5rem;">
        <button class="btn btn-primary btn-sm" onclick="saveFlowerComm('${f}',this)">Save</button>
      </td>
    </tr>`;
  }).join('');
}

function saveFlowerComm(flower, btn){
  btn.textContent='✓ Saved';
  setTimeout(()=>btn.textContent='Save',1500);
  // Archive to rate history
  const monthStr=new Date().toISOString().slice(0,7);
  DB.rateHistory=DB.rateHistory.filter(r=>!(r.month===monthStr&&r.flower===flower));
  DB.rateHistory.push({month:monthStr,flower,rate:DB.defaultRates[flower],comm:DB.flowerCommissions[flower]});
  saveDB();
  showToast(flower+' commission saved!');
}

function openFarmerMap(){
  // Build a list of all farmer locations and open Google Maps search
  const locations=DB.members.filter(m=>m.status==='active').map(m=>encodeURIComponent(m.location||m.address)).filter(Boolean);
  if(!locations.length){ showToast('No farmer locations available','warning'); return; }
  // Show a modal-style overlay with location cards
  const existing=document.getElementById('farmerMapOverlay');
  if(existing) existing.remove();
  const overlay=document.createElement('div');
  overlay.id='farmerMapOverlay';
  overlay.className='modal-overlay open';
  overlay.innerHTML=`<div class="modal" style="max-width:520px;">
    <div class="modal-header"><div class="modal-title">📍 Farmer Locations</div><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button></div>
    <div style="display:flex;flex-direction:column;gap:.75rem;max-height:400px;overflow-y:auto;">
      ${DB.members.filter(m=>m.status==='active').map(m=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.6rem;background:#FAFAFA;border-radius:8px;border:1px solid var(--border);">
          <div>
            <div class="font-semi text-sm">${m.storeName}</div>
            <div class="text-xs text-muted">📍 ${m.location||m.address||'Location not set'} · 📞 ${m.phone}</div>
          </div>
          <a href="https://maps.google.com?q=${encodeURIComponent(m.location||m.address||'')}" target="_blank" class="btn btn-outline-green btn-sm">🗺️ Map</a>
        </div>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function renderMonthlyRates(){
  const m=parseInt((document.getElementById('mrMonth')||{value:new Date().getMonth()+1}).value);
  const y=parseInt((document.getElementById('mrYear')||{value:new Date().getFullYear()}).value);
  const mStr=y+'-'+pad(m);
  const el=document.getElementById('monthlyRateContent');
  if(!el) return;
  const flowers=Object.keys(DB.defaultRates);
  let rows='<table style="width:100%;border-collapse:collapse;font-size:.82rem;">';
  rows+='<thead><tr style="background:var(--green-dark);color:#fff;"><th style="padding:.5rem;">Date</th>'+flowers.map(f=>`<th style="padding:.5rem;text-align:center;">${flowerEmoji(f)} ${f}</th>`).join('')+'</tr></thead><tbody>';
  const daysInM=daysInMonth(y,m);
  for(let d=1;d<=daysInM;d++){
    const dateStr=mStr+'-'+pad(d);
    const hist=DB.rateHistory.find(r=>r.month===mStr&&r.date===dateStr);
    rows+=`<tr style="${d%2===0?'background:#FAFAFA':''}">`;
    rows+=`<td style="padding:.4rem .6rem;font-weight:600;">${dateStr}</td>`;
    flowers.forEach(f=>{
      const dayEntry=DB.entries.filter(e=>e.date===dateStr&&e.flower===f);
      const totalKg=dayEntry.reduce((s,e)=>s+e.qty,0);
      rows+=`<td style="text-align:center;padding:.4rem;">₹${resolveRate(0,f,dateStr)}/kg${totalKg>0?'<br/><small style="color:var(--green-dark);font-weight:700;">'+totalKg.toFixed(1)+'kg</small>':''}</td>`;
    });
    rows+='</tr>';
  }
  rows+='</tbody></table>';
  el.innerHTML=rows;
}

function saveDefaultRates(){
  Object.keys(DB.defaultRates).forEach(f=>{
    const el=document.getElementById('dr_'+f); if(el) DB.defaultRates[f]=parseFloat(el.value)||120;
  });
  saveDB(); closeModal('editDefaultRateModal'); renderRates(); showToast('Default rates saved!');
}

function saveRateOverride(){
  const memberId=parseInt(document.getElementById('orMember').value);
  const flower=document.getElementById('orFlower').value;
  const rate=parseFloat(document.getElementById('orRate').value);
  const fromDate=document.getElementById('orFrom').value;
  const toDate=document.getElementById('orTo').value||null;
  if(!memberId||!rate||!fromDate){ showToast('Fill all required fields','warning'); return; }
  DB.overrides.push({memberId,flower,rate,fromDate,toDate});
  saveDB(); closeModal('addRateModal'); renderRates(); showToast('Rate override saved!');
}

function deleteOverride(i){ DB.overrides.splice(i,1); saveDB(); renderRates(); showToast('Override removed','warning'); }

function saveGlobalComm(){
  DB.settings.commissionType=document.getElementById('globalCommType').value;
  DB.settings.commissionPct=parseFloat(document.getElementById('globalCommValue').value)||5;
  saveDB(); showToast('Commission settings saved!');
}

/* ─── BILL GENERATION ─── */
function initBillForm(){
  const mSel=document.getElementById('billMember');
  if(!mSel) return;
  mSel.innerHTML='<option value="">— Choose Member —</option>'+DB.members.filter(m=>m.status==='active').map(m=>`<option value="${m.id}">${m.storeName} (${m.ownerName})</option>`).join('');

  const now=new Date();
  const monthSel=document.getElementById('billMonth');
  const yearSel=document.getElementById('billYear');
  if(monthSel){
    monthSel.innerHTML=['January','February','March','April','May','June','July','August','September','October','November','December'].map((mn,i)=>`<option value="${i+1}" ${i+1===now.getMonth()+1?'selected':''}>${mn}</option>`).join('');
  }
  if(yearSel){
    [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].forEach(y=>{ yearSel.innerHTML+=`<option value="${y}" ${y===now.getFullYear()?'selected':''}>${y}</option>`; });
  }
  updateBillDates();
}

function prefillBillMember(id){
  const sel=document.getElementById('billMember');
  if(sel){ sel.value=id; previewBill(); }
}

function updateBillDates(){
  const period=document.getElementById('billPeriod').value;
  const month=parseInt(document.getElementById('billMonth').value);
  const year=parseInt(document.getElementById('billYear').value);
  const cdRow=document.getElementById('customDateRow');
  if(cdRow) cdRow.style.display = period==='custom'?'grid':'none';
  if(period!=='custom'){
    const days=daysInMonth(year,month);
    let from='',to='';
    if(period==='monthly')     { from=`${year}-${pad(month)}-01`; to=`${year}-${pad(month)}-${pad(days)}`; }
    if(period==='first_half')  { from=`${year}-${pad(month)}-01`; to=`${year}-${pad(month)}-15`; }
    if(period==='second_half') { from=`${year}-${pad(month)}-16`; to=`${year}-${pad(month)}-${pad(days)}`; }
    const bf=document.getElementById('billFrom'), bt=document.getElementById('billTo');
    if(bf) bf.value=from; if(bt) bt.value=to;
  }
}

function previewBill(){
  const memberId=parseInt(document.getElementById('billMember').value);
  const from=document.getElementById('billFrom').value;
  const to=document.getElementById('billTo').value;
  const box=document.getElementById('billPreviewBox');
  if(!box) return;
  if(!memberId||!from||!to){ box.innerHTML='<div style="text-align:center;color:var(--text-3);padding:3rem 0;">Select member and dates</div>'; return; }
  const calc=computeBill(memberId,from,to);
  box.innerHTML=renderBillHTML(memberId,from,to,calc);
}

function computeBill(memberId,from,to){
  const member=DB.members.find(m=>m.id===memberId);
  const entries=DB.entries.filter(e=>e.memberId===memberId && e.date>=from && e.date<=to);
  const extraLug=parseFloat((document.getElementById('billLuggage')||{value:0}).value)||0;
  const commOverride=(document.getElementById('billCommOverride')||{}).value;

  let totalQty=0,gross=0,totalLug=extraLug;
  const lineItems=[];

  entries.forEach(e=>{
    const rate=resolveRate(memberId,e.flower,e.date);
    const amt=e.qty*rate;
    totalQty+=e.qty; gross+=amt; totalLug+=e.luggageCharge||0;
    lineItems.push({date:e.date,flower:e.flower,qty:e.qty,rate,amt,lug:e.luggageCharge||0});
  });

  let commission;
  if(commOverride && commOverride!==''){
    commission=gross*(parseFloat(commOverride)/100);
  } else if(member){
    commission=calcCommission(gross,member);
  } else { commission=0; }

  const net=gross-commission+totalLug;
  return {lineItems,totalQty,gross,commission,luggage:totalLug,net,entries:entries.length};
}

function renderBillHTML(memberId,from,to,calc){
  const member=DB.members.find(m=>m.id===memberId);
  const shop=DB.settings;
  const mn=member||{storeName:'—',ownerName:'—',address:'—',phone:'—'};
  const period=document.getElementById('billPeriod').value;
  const notes=(document.getElementById('billNotes')||{}).value||'';
  const periodLabel={monthly:'Monthly',first_half:'1st Half (1–15)',second_half:'2nd Half (16–End)',custom:'Custom'}[period]||period;

  let rows='';
  if(calc.lineItems.length){
    rows=calc.lineItems.map(l=>`
      <div class="bill-row"><span>${l.date} — ${l.flower} ${l.qty}kg @ ₹${l.rate}</span><span>${fmtMoney(l.amt)}</span></div>`).join('');
  } else {
    rows='<div class="bill-row" style="color:#888;"><span>No entries found for this period</span><span>₹0.00</span></div>';
  }

  return `<div class="bill-preview">
    <div class="bill-header">
      <div style="font-size:1rem;font-weight:900;">${shop.shopName}</div>
      <div style="font-size:.75rem;">${shop.address}</div>
      <div style="font-size:.75rem;">📞 ${shop.phone} &nbsp;|&nbsp; GST: ${shop.gstNumber||'N/A'}</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:.75rem;">
      <div>
        <div><strong>Bill To:</strong> ${mn.storeName}</div>
        <div>${mn.ownerName}</div>
        <div style="font-size:.75rem;">${mn.address} · ${mn.phone}</div>
      </div>
      <div class="text-right">
        <div><strong>Period:</strong> ${periodLabel}</div>
        <div style="font-size:.75rem;">${from} to ${to}</div>
        <div style="font-size:.75rem;">Generated: ${today()}</div>
      </div>
    </div>
    <div style="border-top:1px dashed #999;border-bottom:1px dashed #999;padding:.5rem 0;margin:.5rem 0;">
      <div class="bill-row"><strong>Item / Date</strong><strong>Amount</strong></div>
      ${rows}
    </div>
    <div class="bill-row"><span>Total Quantity</span><span>${calc.totalQty.toFixed(2)} kg</span></div>
    <div class="bill-row"><span>Gross Amount</span><span>${fmtMoney(calc.gross)}</span></div>
    <div class="bill-row" style="color:#E64A19;"><span>(-) Commission</span><span>${fmtMoney(calc.commission)}</span></div>
    <div class="bill-row"><span>(+) Luggage / Extra</span><span>${fmtMoney(calc.luggage)}</span></div>
    <div class="bill-total bill-row"><span>NET PAYABLE</span><span style="font-size:1rem;">${fmtMoney(calc.net)}</span></div>
    ${notes?`<div style="margin-top:.75rem;font-size:.75rem;color:#555;">Note: ${notes}</div>`:''}
    <div style="margin-top:1rem;font-size:.7rem;text-align:center;color:#888;">Pay via UPI: ${shop.upi||'—'} &nbsp;|&nbsp; Thank you for your business!</div>
  </div>`;
}

function generateAndSaveBill(){
  const memberId=parseInt(document.getElementById('billMember').value);
  const from=document.getElementById('billFrom').value;
  const to=document.getElementById('billTo').value;
  if(!memberId||!from||!to){ showToast('Select member and date range','warning'); return; }
  const calc=computeBill(memberId,from,to);
  const period=document.getElementById('billPeriod').value;
  const billNo=genBillNo();
  DB.bills.push({
    id:DB.nextBillId, billNo, memberId, period, from, to,
    totalQty:calc.totalQty, gross:calc.gross, commission:calc.commission,
    luggage:calc.luggage, net:calc.net, status:'draft',
    createdAt:today(), notes:(document.getElementById('billNotes')||{}).value||''
  });
  DB.nextBillId++;
  saveDB();
  showToast(`Bill ${billNo} saved successfully!`);
}

function printBill(){
  const memberId=parseInt(document.getElementById('billMember').value);
  const from=document.getElementById('billFrom').value;
  const to=document.getElementById('billTo').value;
  if(!memberId||!from||!to){ showToast('Select member and dates first','warning'); return; }
  const calc=computeBill(memberId,from,to);
  const html=renderBillHTML(memberId,from,to,calc);
  const win=window.open('','_blank','width=600,height=700');
  win.document.write(`<!DOCTYPE html><html><head><title>Bill</title><style>body{font-family:'Courier New',monospace;margin:2rem;font-size:13px;}.bill-preview{max-width:480px;margin:auto;}.bill-header{text-align:center;border-bottom:2px solid #000;padding-bottom:.5rem;margin-bottom:.75rem;}.bill-row{display:flex;justify-content:space-between;margin:.15rem 0;}.bill-total{border-top:2px solid #000;padding-top:.4rem;margin-top:.4rem;font-weight:900;font-size:1rem;}</style></head><body>${html}<script>window.print();<\/script></body></html>`);
  win.document.close();
}

/* ─── BILL HISTORY ─── */
function renderBillHistory(){
  const tbody=document.getElementById('billHistoryTable');
  if(!tbody) return;
  const search=(document.getElementById('billSearch')||{value:''}).value.toLowerCase();
  const stFilter=(document.getElementById('billStatusFilter')||{value:'all'}).value;
  const flowerFilter=(document.getElementById('billFlowerFilter')||{value:'all'}).value;
  const monthFilter=(document.getElementById('billHistoryMonthFilter')||{value:''}).value;
  let list=[...DB.bills].sort((a,b)=>b.id-a.id);
  if(stFilter!=='all') list=list.filter(b=>b.status===stFilter);
  if(flowerFilter!=='all') list=list.filter(b=>!b.flower||b.flower===flowerFilter);
  if(monthFilter) list=list.filter(b=>b.from&&b.from.startsWith(monthFilter));
  if(search) list=list.filter(b=>{ const m=DB.members.find(x=>x.id===b.memberId); return b.billNo.toLowerCase().includes(search)||(m&&m.storeName.toLowerCase().includes(search)); });
  if(!list.length){ tbody.innerHTML='<tr><td colspan="7" class="text-muted text-center" style="padding:2rem;">No bills found.</td></tr>'; return; }
  const stColors={paid:'badge-green',draft:'badge-grey',overdue:'badge-coral',sent:'badge-blue'};
  tbody.innerHTML=list.map(b=>{
    const m=DB.members.find(x=>x.id===b.memberId);
    const flowerLabel=b.flower?`${flowerEmoji(b.flower)} ${b.flower}`:'All';
    return `<tr>
      <td class="font-semi text-sm">${b.billNo}</td>
      <td>
        <div class="flex gap-2 items-center">
          <div class="farmer-cell-avatar" style="width:26px;height:26px;font-size:.55rem;background:linear-gradient(135deg,var(--green),var(--green-dark));border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;flex-shrink:0;">${m?initials(m.storeName):'?'}</div>
          <div>
            <div class="font-semi text-sm">${m?m.storeName:'—'}</div>
            <div class="text-xs text-muted">${m?m.phone:''}</div>
          </div>
        </div>
      </td>
      <td class="text-sm">${b.from} to ${b.to}</td>
      <td class="text-sm">${flowerLabel}</td>
      <td class="font-bold" style="color:var(--green-dark);">${b.totalQty.toFixed(1)} kg</td>
      <td><select class="form-select" style="font-size:.75rem;padding:.2rem .5rem;border-radius:var(--radius-full);" onchange="updateBillStatus(${b.id},this.value)">
        ${['draft','sent','paid','overdue'].map(s=>`<option value="${s}" ${b.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
      </select></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-sm" style="background:var(--green-xlight);color:var(--green-dark);border:1px solid var(--green-light);" onclick="reprintBillFiltered(${b.id},'${b.flower||'all'}')">🖨️ Print</button>
          <button class="btn btn-sm btn-danger-ghost" onclick="deleteBill(${b.id})">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function updateBillStatus(id,status){
  const b=DB.bills.find(x=>x.id===id); if(b){ b.status=status; if(status==='paid') b.paidAt=today(); saveDB(); showToast('Bill status updated!'); }
}
function deleteBill(id){ if(!confirm('Delete this bill?')) return; DB.bills=DB.bills.filter(b=>b.id!==id); saveDB(); renderBillHistory(); showToast('Bill deleted','warning'); }
function reprintBillFiltered(id, flowerFilter){
  const b=DB.bills.find(x=>x.id===id); if(!b) return;
  let entries=DB.entries.filter(e=>e.memberId===b.memberId&&e.date>=b.from&&e.date<=b.to);
  if(flowerFilter&&flowerFilter!=='all') entries=entries.filter(e=>e.flower===flowerFilter);
  let totalQty=0,gross=0;
  const lineItems=entries.map(e=>{
    const rate=resolveRate(e.memberId,e.flower,e.date);
    const amt=e.qty*rate;
    totalQty+=e.qty; gross+=amt;
    return {date:e.date,flower:e.flower,qty:e.qty,rate,amt,notes:e.notes||''};
  });
  const member=DB.members.find(m=>m.id===b.memberId)||{storeName:'—',phone:'—',location:'—'};
  const shop=DB.settings;
  const flowerTitle=flowerFilter&&flowerFilter!=='all'?`${flowerEmoji(flowerFilter)} ${flowerFilter} Only`:'All Flowers';
  const rows=lineItems.length?lineItems.map(l=>`<tr><td>${l.date}</td><td>${flowerEmoji(l.flower)} ${l.flower}</td><td style="text-align:right;">${l.qty.toFixed(2)} kg</td><td style="text-align:right;">${l.notes}</td></tr>`).join(''):'<tr><td colspan="4" style="text-align:center;color:#888;">No entries for this period/flower</td></tr>';
  const html=`<div style="max-width:560px;margin:auto;font-family:'Courier New',monospace;font-size:12px;">
    <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:.5rem;margin-bottom:.75rem;">
      <div style="font-size:1.1rem;font-weight:900;">${shop.shopName}</div>
      <div style="font-size:.75rem;">${shop.address}</div>
      <div style="font-size:.75rem;">📞 ${shop.phone} | UPI: ${shop.upi||'—'}</div>
      <div style="font-size:.75rem;font-weight:700;margin-top:.5rem;">RECEIPT — ${flowerTitle}</div>
    </div>
    <table style="width:100%;margin-bottom:.75rem;font-size:.78rem;">
      <tr><td><strong>Farmer:</strong> ${member.storeName}</td><td style="text-align:right;"><strong>Period:</strong> ${b.from} to ${b.to}</td></tr>
      <tr><td>📞 ${member.phone}</td><td style="text-align:right;">📍 ${member.location||'—'}</td></tr>
      <tr><td><strong>Bill No:</strong> ${b.billNo}</td><td style="text-align:right;"><strong>Date:</strong> ${today()}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:.78rem;margin-bottom:1rem;">
      <thead><tr style="background:#f0f0f0;"><th style="border:1px solid #333;padding:4px 6px;text-align:left;">Date</th><th style="border:1px solid #333;padding:4px 6px;text-align:left;">Flower</th><th style="border:1px solid #333;padding:4px 6px;text-align:right;">Weight</th><th style="border:1px solid #333;padding:4px 6px;text-align:right;">Notes</th></tr></thead>
      <tbody>${rows.replace(/<tr>/g,'<tr>').replace(/<td>/g,'<td style="border:1px solid #ccc;padding:3px 6px;">').replace(/<td style="text-align:right;">/g,'<td style="border:1px solid #ccc;padding:3px 6px;text-align:right;">')}</tbody>
    </table>
    <div style="border-top:2px solid #000;padding-top:.5rem;display:flex;justify-content:space-between;font-weight:900;font-size:1rem;">
      <span>TOTAL WEIGHT</span><span>${totalQty.toFixed(2)} kg</span>
    </div>
    <div style="margin-top:1rem;text-align:center;font-size:.7rem;color:#888;">Thank you! Pay via UPI: ${shop.upi||'—'}</div>
  </div>`;
  const win=window.open('','_blank','width=640,height=800');
  win.document.write(`<!DOCTYPE html><html><head><title>Bill ${b.billNo} — ${flowerTitle}</title></head><body style="margin:2rem;">${html}<script>window.onload=()=>window.print();<\/script></body></html>`);
  win.document.close();
}

function reprintBill(id){ reprintBillFiltered(id,'all'); }

function exportAllBills(){
  let txt=`FloraChain Bill Report — ${DB.settings.shopName}\nGenerated: ${today()}\n${'='.repeat(60)}\n\n`;
  DB.bills.forEach(b=>{
    const m=DB.members.find(x=>x.id===b.memberId);
    txt+=`Bill: ${b.billNo}\nMember: ${m?m.storeName:'—'}\nPeriod: ${b.from} to ${b.to}\nGross: ${fmtMoney(b.gross)} | Commission: ${fmtMoney(b.commission)} | Net: ${fmtMoney(b.net)} | Status: ${b.status}\n${'-'.repeat(40)}\n`;
  });
  const blob=new Blob([txt],{type:'text/plain'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='FloraChain_Bills.txt'; a.click();
  showToast('Bills exported as text file!');
}

/* ─── SETTINGS ─── */
function loadSettings(){
  const s=DB.settings;
  ['shopName','ownerName','address','phone','gstNumber','defaultFlower','defaultRate','commissionPct','upi'].forEach(k=>{
    const el=document.getElementById('sett'+k.charAt(0).toUpperCase()+k.slice(1));
    if(el) el.value=s[k]||'';
  });
  const bp=document.getElementById('settBillPref'); if(bp) bp.value=s.billingPref||'monthly';
}
function saveSettings(){
  DB.settings.shopName=document.getElementById('settShopName').value||DB.settings.shopName;
  DB.settings.ownerName=document.getElementById('settOwnerName').value||DB.settings.ownerName;
  DB.settings.address=document.getElementById('settAddress').value||DB.settings.address;
  DB.settings.phone=document.getElementById('settPhone').value||DB.settings.phone;
  DB.settings.gstNumber=document.getElementById('settGST').value;
  DB.settings.defaultFlower=document.getElementById('settDefaultFlower').value;
  DB.settings.defaultRate=parseFloat(document.getElementById('settDefaultRate').value)||120;
  DB.settings.commissionPct=parseFloat(document.getElementById('settCommPct').value)||5;
  DB.settings.billingPref=document.getElementById('settBillPref').value;
  DB.settings.upi=document.getElementById('settUPI').value;
  saveDB();
  setEl('profileName', DB.settings.shopName);
  setEl('shopSubtitle', DB.settings.shopName+' · '+DB.settings.address.split(',').slice(-1)[0].trim());
  showToast('Settings saved successfully!');
}
function resetToDefaults(){
  if(!confirm('Reset all settings to defaults?')) return;
  DB.settings.defaultRate=120; DB.settings.commissionPct=5; DB.settings.billingPref='monthly';
  saveDB(); loadSettings(); showToast('Settings reset','warning');
}

/* ─── HELPERS ─── */
function flowerEmoji(f){ return {Rose:'🌸',Marigold:'🌼',Jasmine:'⚪',Gerbera:'🌺',Lotus:'🪷',Sunflower:'🌻',Tuberose:'🌷'}[f]||'🌸'; }

/* ─── SEED sample data ─── */
function seedSampleEntries(){
  if(DB.entries.length) return;
  const flowers=['Rose','Marigold'];
  const memberIds=[1,2,3];
  const now=new Date();
  for(let d=1;d<=15;d++){
    const date=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(d)}`;
    memberIds.forEach(mid=>{
      flowers.forEach(fl=>{
        if(Math.random()>0.3){
          DB.entries.push({id:DB.nextEntryId++,memberId:mid,date,flower:fl,qty:Math.round(Math.random()*50+5),luggageCharge:Math.random()>0.7?50:0,notes:''});
        }
      });
    });
  }
  DB.bills=[
    {id:1,billNo:'FC-2026-03-0001',memberId:1,period:'first_half',from:`${now.getFullYear()}-${pad(now.getMonth()+1)}-01`,to:`${now.getFullYear()}-${pad(now.getMonth()+1)}-15`,totalQty:240,gross:28800,commission:1440,luggage:100,net:27460,status:'paid',createdAt:today(),notes:''},
    {id:2,billNo:'FC-2026-03-0002',memberId:2,period:'first_half',from:`${now.getFullYear()}-${pad(now.getMonth()+1)}-01`,to:`${now.getFullYear()}-${pad(now.getMonth()+1)}-15`,totalQty:180,gross:8100,commission:324,luggage:0,net:7776,status:'draft',createdAt:today(),notes:''},
  ];
  DB.nextBillId=3;
  saveDB();
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded',()=>{
  const todayEl=document.getElementById('todayDate');
  if(todayEl) todayEl.textContent=new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  const entryDateEl=document.getElementById('entryDate');
  if(entryDateEl) entryDateEl.value=today();
  loadDB();
  if(!DB.flowerCommissions) DB.flowerCommissions={Rosa:{commType:'percent',commValue:5}};
  Object.keys(DB.defaultRates).forEach(f=>{ if(!DB.flowerCommissions[f]) DB.flowerCommissions[f]={commType:'percent',commValue:5}; });
  if(!DB.farmerDayStatus) DB.farmerDayStatus={};
  if(!DB.rateHistory) DB.rateHistory=[];
  seedSampleEntries();
  // Populate Monthly Rate modal dropdowns
  const mrM=document.getElementById('mrMonth');
  const mrY=document.getElementById('mrYear');
  if(mrM) mrM.innerHTML=['January','February','March','April','May','June','July','August','September','October','November','December'].map((n,i)=>`<option value="${i+1}" ${i+1===new Date().getMonth()+1?'selected':''}>${n}</option>`).join('');
  if(mrY){
    const y=new Date().getFullYear();
    [y-1,y,y+1].forEach(yr=>mrY.innerHTML+=`<option value="${yr}" ${yr===y?'selected':''}>${yr}</option>`);
  }
  showSection('dashboard');
  const bp=document.getElementById('billPeriod');
  if(bp) bp.addEventListener('change',function(){ const cdr=document.getElementById('customDateRow'); if(cdr) cdr.style.display=this.value==='custom'?'grid':'none'; });
});
