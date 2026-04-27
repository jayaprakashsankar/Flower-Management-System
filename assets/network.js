// ── Universal Discovery (People Network) ──────────────────────────────
const PEOPLE_DATA = [
  {id:1, name:'Suresh Agencies', role:'agent', location:'Bangalore, KA', rating:4.8, typeLabel:'🤝 Wholesale Agent', focus:'Only deals in Premium Rose & Jasmine. 5% Commission', followed:false, connected:'no',
    details: '<h4>Daily Rate History</h4><ul style="margin:0 0 1rem 1.25rem;list-style:disc;"><li>Rose: ₹120/kg</li><li>Jasmine: ₹280/kg</li></ul><h4>Weight Entry Dashboard</h4><p class="text-xs text-muted">Handles 50+ farmers daily.</p>'
  },
  {id:2, name:'Velu Farm', role:'farmer', location:'Ooty, TN', rating:4.6, typeLabel:'👨‍🌾 Cultivator', focus:'Supplying Marigold and Chrysanthemum bulk orders', followed:true, connected:'yes',
    details: '<h4>Cultivation History</h4><p class="text-sm">Farming since 2012.</p><h4>Current Stock</h4><ul style="margin:0 0 1rem 1.25rem;list-style:disc;"><li>Marigold: 200kg ready</li><li>Chrysanthemum: 50kg</li></ul>'
  },
  {id:3, name:'Vinod Transport', role:'vehicle', location:'Mysuru, KA', rating:4.9, typeLabel:'🚛 Vehicle Owner', focus:'Mini Van & Tempo available. Live tracking included.', followed:false, connected:'no',
    details: '<h4>Vehicle Capacity</h4><p class="text-sm">Mini Van (1 Ton), Tempo (2.5 Ton)</p><h4>Rental Rates</h4><p class="text-sm">₹12/km (Minimum 50km)</p>'
  },
  {id:4, name:'Pooja Decorators', role:'store', location:'Mysuru, KA', rating:4.2, typeLabel:'🏪 Retail Store', focus:'Needs 100+ kg Rose daily. Fast payments.', followed:true, connected:'pending',
    details: '<h4>Product Catalog</h4><ul style="margin:0 0 1rem 1.25rem;list-style:disc;"><li>Wedding Garlands</li><li>Bouquets</li><li>Loose Flowers (Retail)</li></ul>'
  },
  {id:5, name:'Krishna Brokers', role:'agent', location:'Chennai, TN', rating:4.5, typeLabel:'🤝 Agent', focus:'All seasonal flowers. Wide network.', followed:false, connected:'no',
    details: '<h4>Daily Rate History</h4><p class="text-sm text-muted">Awaiting today\'s market rates...</p>'
  },
  {id:6, name:'Ravi', role:'driver', location:'Bangalore, KA', rating:4.7, typeLabel:'🚚 Verified Driver', focus:'Professional driver available for night routes.', followed:false, connected:'no',
    details: '<h4>Driver Profile</h4><p class="text-sm text-muted">DL: KA01-XXXX-2022. 5+ years experience in flower transport.</p>'
  },
  {id:7, name:'Asha Events', role:'customer', location:'Bangalore, KA', rating:4.9, typeLabel:'🎉 Customer (Event Planner)', focus:'Looking for wholesale roses and orchids for events.', followed:false, connected:'no',
    details: '<h4>Purchase Needs</h4><p class="text-sm text-muted">Requires reliable bulk supply every weekend.</p>'
  }
];

let globalNetFilter = 'all';

function renderPeople(tabFilter) {
  if(tabFilter) {
    globalNetFilter = tabFilter;
    const tabs = document.querySelectorAll('[data-tab^="net-"]');
    if(tabs.length) {
      tabs.forEach(b => b.classList.remove('active'));
      const activeTab = document.querySelector(`[data-tab="net-${tabFilter}"]`);
      if(activeTab) activeTab.classList.add('active');
    }
  }
  
  const searchInput = document.getElementById('netSearch');
  const roleSelect = document.getElementById('netRole');
  const grid = document.getElementById('peopleGrid');
  
  if(!grid) return; // if network section not in DOM, do nothing
  
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const role = roleSelect ? roleSelect.value : 'all';
  
  let filtered = PEOPLE_DATA.filter(p => {
    if(globalNetFilter === 'conn' && p.connected !== 'yes' && p.connected !== 'pending') return false;
    if(role !== 'all' && p.role !== role) return false;
    if(search && !p.name.toLowerCase().includes(search) && !p.location.toLowerCase().includes(search)) return false;
    return true;
  });

  grid.innerHTML = filtered.map(p => {
    let connHtml = '';
    if(p.connected === 'yes') {
      connHtml = `<button class="btn btn-outline-green btn-sm flex-1" onclick="event.stopPropagation(); openChat('${p.name}')">💬 Message</button>`;
    } else if(p.connected === 'pending') {
      connHtml = `<button class="btn btn-sm disabled flex-1" style="background:#f3f4f6;color:var(--text-3);border:none;" onclick="event.stopPropagation();">⏳ Pending</button>`;
    } else {
      connHtml = `<button class="btn btn-primary btn-sm flex-1" onclick="event.stopPropagation(); openConnectModal('${p.name}')">🤝 Connect</button>`;
    }
    
    const followHtml = p.followed 
      ? `<button class="btn btn-outline btn-sm" style="flex:0 0 auto;" onclick="event.stopPropagation(); toggleFollow(${p.id})">Following</button>`
      : `<button class="btn btn-outline btn-sm" style="flex:0 0 auto;" onclick="event.stopPropagation(); toggleFollow(${p.id})">+ Follow</button>`;

    return `<div class="card" style="padding:1.25rem; cursor:pointer;" onclick="openProfileDetail(${p.id})">
      <div class="flex justify-between items-start mb-3">
        <div class="flex gap-3">
          <div class="avatar" style="width:40px;height:40px;font-size:1rem;background:linear-gradient(135deg,var(--blue),#0D47A1);">${p.name.charAt(0)}</div>
          <div>
            <div class="font-semi">${p.name}</div>
            <div class="text-xs text-muted mb-1">📍 ${p.location}</div>
            <div class="text-xs font-bold" style="color:#f59e0b;">⭐ ${p.rating}</div>
          </div>
        </div>
      </div>
      <div class="text-xs text-muted font-semi mb-1">${p.typeLabel}</div>
      <div class="text-sm mb-4" style="line-height:1.5;">${p.focus}</div>
      <div class="flex gap-2">
        ${connHtml}
        ${followHtml}
      </div>
    </div>`;
  }).join('') || '<div class="text-muted p-4 col-span-full text-center">No people found matching filters.</div>';
}

function toggleFollow(id) {
  const p = PEOPLE_DATA.find(x => x.id === id);
  if(p) {
    p.followed = !p.followed;
    if(p.followed && typeof showToast === 'function') showToast(`You follow ${p.name}!`, 'success');
    renderPeople(); 
  }
}

function openConnectModal(name) {
  const el = document.getElementById('connectTarget');
  if(el) el.textContent = `Requesting connection with ${name}`;
  if(typeof openModal === 'function') openModal('connectModal');
}

function confirmConnection() {
  const msgInput = document.getElementById('connMsg');
  const purpose = document.getElementById('connPurpose') ? document.getElementById('connPurpose').value : 'Connection';
  if(typeof closeModal === 'function') closeModal('connectModal');
  if(typeof showToast === 'function') showToast(`✅ ${purpose} request sent! Notifications dispatched.`, 'success');
  if(msgInput) msgInput.value = '';
}

let activeChat = '';
function openChat(name) {
  activeChat = name;
  const titleEl = document.getElementById('chatTitle');
  if(titleEl) titleEl.textContent = `Chat with ${name}`;
  const msgs = document.getElementById('chatMsgs');
  if(msgs) {
    let baseMsg = '';
    if(name.includes('Velu') || name.includes('Suresh')) {
      baseMsg = `
      <div style="align-self:flex-start;background:#e5e7eb;padding:.6rem 1rem;border-radius:1rem;border-top-left-radius:0;max-width:85%;font-size:.9rem;">Hello! Are you available to discuss today's market rates?</div>
      <div style="align-self:flex-start;background:#e5e7eb;padding:.6rem 1rem;border-radius:1rem;border-top-left-radius:0;max-width:85%;font-size:.9rem;">Please let me know.</div>`;
    } else {
      baseMsg = `<div class="text-center text-xs text-muted">Say hello to ${name}!</div>`;
    }
    msgs.innerHTML = baseMsg;
  }
  if(typeof openModal === 'function') openModal('chatModal');
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if(!input) return;
  const txt = input.value.trim();
  if(!txt) return;
  const msgs = document.getElementById('chatMsgs');
  if(msgs) {
    msgs.innerHTML += `<div style="align-self:flex-end;background:var(--primary);color:#fff;padding:.6rem 1rem;border-radius:1rem;border-top-right-radius:0;max-width:85%;font-size:.9rem;">${txt}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }
  input.value = '';
}

function openProfileDetail(id) {
  const p = PEOPLE_DATA.find(x => x.id === id);
  if(!p) return;
  
  // Populate detail modal/section
  const nameEl = document.getElementById('pdName');
  const detailsEl = document.getElementById('pdDetails');
  const roleEl = document.getElementById('pdRole');
  const locEl = document.getElementById('pdLoc');
  
  if(nameEl) nameEl.textContent = p.name;
  if(roleEl) roleEl.textContent = p.typeLabel;
  if(locEl) locEl.textContent = p.location;
  if(detailsEl) detailsEl.innerHTML = p.details || '<p class="text-muted">No additional details shared yet.</p>';
  
  if(typeof openModal === 'function') openModal('profileDetailModal');
}

// Auto-init if DOM ready
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { renderPeople('all'); });
} else {
  renderPeople('all');
}
