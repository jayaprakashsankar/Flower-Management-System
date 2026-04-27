import glob

network_html = """
<!-- ═══ NETWORK ═══ -->
<div id="sec-network" style="display:none;">
  <div class="page-header"><div class="page-title">🌐 Universal Discovery</div><div class="page-subtitle">Search, follow, and connect with everyone across FloraChain</div></div>
  <div class="card mb-4">
    <div class="flex gap-3 mb-2" style="flex-wrap:wrap;">
      <div class="input-group" style="flex:1;min-width:200px;"><span class="input-icon">🔍</span><input class="form-input" id="netSearch" placeholder="Search by name, role, or location..." oninput="renderPeople()"/></div>
      <select class="form-select" style="width:auto;" id="netRole" onchange="renderPeople()">
        <option value="all">All Roles</option>
        <option value="farmer">👨‍🌾 Farmers</option>
        <option value="agent">🤝 Agents</option>
        <option value="store">🏪 Store Owners</option>
        <option value="vehicle">🚛 Vehicles & Drivers</option>
        <option value="customer">👥 Customers</option>
      </select>
    </div>
  </div>
  <div class="tabs mb-4">
    <button class="tab-btn active" data-tab="net-all" onclick="renderPeople('all')">Discover People</button>
    <button class="tab-btn" data-tab="net-conn" onclick="renderPeople('conn')">My Connections</button>
  </div>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1rem;" id="peopleGrid"></div>
</div>
"""

modals_html = """
<!-- Profile Detail Modal -->
<div class="modal-overlay" id="profileDetailModal" onclick="if(event.target===this) closeModal('profileDetailModal')">
  <div class="modal" style="max-width:550px;">
    <div class="modal-header"><div class="modal-title">👤 Profile Showcase</div><button class="modal-close" onclick="closeModal('profileDetailModal')">✕</button></div>
    <div class="text-center mb-4">
      <div class="avatar" style="width:72px;height:72px;font-size:1.5rem;margin:0 auto .75rem;background:linear-gradient(135deg,var(--blue),#0D47A1);" id="pdAvatar">P</div>
      <div class="font-bold text-xl" id="pdName">Name</div>
      <div class="text-sm text-muted"><span id="pdRole">Role</span> · <span id="pdLoc">Location</span></div>
    </div>
    <div style="background:#f9fafb;border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;" id="pdDetails">
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary flex-1" onclick="closeModal('profileDetailModal');openModal('connectModal')">🤝 Request Connection</button>
      <button class="btn btn-outline flex-1" onclick="closeModal('profileDetailModal')">Back</button>
    </div>
  </div>
</div>

<!-- Connect Modal -->
<div class="modal-overlay" id="connectModal">
  <div class="modal">
    <div class="modal-header"><div class="modal-title">🤝 Send Connection Request</div><button class="modal-close" onclick="closeModal('connectModal')">✕</button></div>
    <div style="display:flex;flex-direction:column;gap:1rem;">
      <div id="connectTarget" class="font-semi text-center pb-2 border-b border-gray">Connecting...</div>
      <div class="form-group"><label class="form-label">Purpose of Connection</label>
        <select class="form-select" id="connPurpose">
          <option value="buying">Buying / Sourcing Flowers</option>
          <option value="selling">Selling / Supplying Flowers</option>
          <option value="transport">Booking Transport</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Requested Settlement Cycle</label>
        <select class="form-select" id="connBilling">
          <option value="daily">Daily Settlement</option>
          <option value="half_month">15-Day (Half-Month)</option>
          <option value="monthly">Monthly Settlement</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Message (Optional)</label>
        <textarea class="form-input" id="connMsg" rows="2" placeholder="Let's do business together..."></textarea>
      </div>
      <button class="btn btn-primary btn-lg w-full" onclick="confirmConnection()">Send Request</button>
    </div>
  </div>
</div>

<!-- Chat Modal -->
<div class="modal-overlay" id="chatModal">
  <div class="modal" style="width:400px;padding:0;overflow:hidden;display:flex;flex-direction:column;height:80vh;max-height:600px;">
    <div style="padding:1rem 1.5rem;background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
      <div class="font-semi" id="chatTitle">Direct Message</div>
      <button class="modal-close" onclick="closeModal('chatModal')">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:1rem;background:#f9fafb;display:flex;flex-direction:column;gap:1rem;" id="chatMsgs">
      <div class="text-center text-xs text-muted mb-2">Today</div>
    </div>
    <div style="padding:1rem;border-top:1px solid var(--border);background:#fff;display:flex;gap:.5rem;">
      <input type="text" class="form-input" style="flex:1;" id="chatInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter') sendChat()"/>
      <button class="btn btn-primary" onclick="sendChat()">Send</button>
    </div>
  </div>
</div>
"""

script_tag = '<script src="assets/network.js"></script>\n</body>\n</html>'

files = glob.glob('dashboard-*.html')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    dirty = False

    # Add Sidebar Network Link
    if '<a class="sidebar-item" onclick="switchSection(\'network\')">' not in content and '<a class="sidebar-item" onclick="showSection(\'network\')">' not in content:
        sidebar_pos1 = content.find('Dashboard</a>')
        sidebar_pos2 = content.find('Overview</a>')
        if sidebar_pos1 != -1:
            fn = 'showSection' if "showSection('dashboard')" in content else 'switchSection'
            content = content.replace('Dashboard</a>', f'Dashboard</a>\n    <a class="sidebar-item" onclick="{fn}(\'network\')"><span class="s-icon">🌐</span>People (Network)</a>')
            dirty = True
        elif sidebar_pos2 != -1:
            fn = 'showSection' if "showSection('overview')" in content else 'switchSection'
            content = content.replace('Overview</a>', f'Overview</a>\n    <a class="sidebar-item" onclick="{fn}(\'network\')"><span class="s-icon">🌐</span>People (Network)</a>')
            dirty = True

    # Add Network section
    if 'id="sec-network"' not in content:
        # insert before first modal or settings
        if '<!-- SETTINGS -->' in content:
            content = content.replace('<!-- SETTINGS -->', network_html + '\n<!-- SETTINGS -->')
            dirty = True
        elif 'id="sec-settings"' in content:
            content = content.replace('<div id="sec-settings"', network_html + '\n<div id="sec-settings"')
            dirty = True

    # Add Modals
    if 'id="profileDetailModal"' not in content:
        content = content.replace('<div class="toast-container"', modals_html + '\n<div class="toast-container"')
        dirty = True

    # Add Script tag
    if 'assets/network.js' not in content:
        content = content.replace('</body>', '<script src="assets/network.js"></script>\n</body>')
        dirty = True
        
    # Append to sections array if possible
    if "sections.push('network');" not in content and 'assets/network.js' not in content:
        if 'window.sections=[' in content:
            content = content.replace('window.sections=[', 'if(!window.sections) window.sections=[]; window.sections=[')
            content = content.replace("['overview',", "['overview','network',")
            content = content.replace("['dashboard',", "['dashboard','network',")
        else:
            if "window.sections.push('network');" not in content:
                content = content.replace('<script src="assets/network.js"></script>', '<script src="assets/network.js"></script>\n<script>if(!window.sections) window.sections=[]; window.sections.push("network");</script>')

    if dirty:
        with open(f, 'w', encoding='utf-8') as out:
            out.write(content)
        print(f"Patched {f}")
    else:
        print(f"Skipped {f}")
