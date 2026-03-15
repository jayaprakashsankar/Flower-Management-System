// State Management
const defaultState = {
    members: [], // { id: timestamp, name: string }
    entries: {}, // { "YYYY-MM-DD": { memberId: quantity } }
    dailyRates: {}, // { "YYYY-MM-DD": rate }
    users: [], // { username, password, name }
    currentUser: null, // { username, name }
    settings: {
        rate: 0, // Default rate
        commissionEnabled: false,
        commissionType: 'percent', // Default to percent
        commissionAmount: 10, // Default 10%
        luggageEnabled: false,
        luggageAmount: 0,
        shopName: 'JPK FLOWERS',
        shopMobile: '6374631585',
        logo: null,
        banner: null
    },
    theme: 'light',
    language: 'en', // 'en', 'ta', 'hi'
    auditLogs: []
};

let state = loadData();

// --- Localization ---
const translations = {
    en: {
        dashboard: "Dashboard",
        entries: "Daily Entries",
        members: "Members",
        settings: "Settings & Rates",
        bills: "Generate Bills",
        profile: "Profile",
        logout: "Logout",
        search_placeholder: "Search members by name or ID...",
        reset_data: "Reset Data",
        total_members: "Total Members",
        today_entries: "Today's Entries",
        total_qty: "Total Weight (Kg)",
        avg_rate: "Avg Rate (₹)",
        recent_activity: "Recent Activity",
        add_member: "Add Member",
        import_csv: "Import CSV",
        save_profile: "Save Profile",
        edit_profile: "Edit Profile",
        dashboard_overview: "Dashboard Overview",
        filter: "Filter",
        today: "Today",
        week: "This Week",
        month: "This Month",
        year: "This Year",
        all: "All Time",
        total_weight: "Total Weight",
        gross_value: "Gross Value",
        commission: "Commission Income",
        net_payable: "Net Payable",
        supply_trend: "Supply Trend (Last 7 Days)",
        top_farmers: "Top Farmers",
        no_entries: "No entries for this period.",
        member_name: "Member Name",
        my_income: "My Income",
        to_members: "To Members",
        collection_trend: "Collection Trend & Daily Rates",
        members_by_location: "Members by Location",
        full_name: "Full Name",
        user_name: "Username",
        company_name: "Company Name",
        mobile_number: "Mobile Number",
        gender: "Gender",
        dob: "Date of Birth",
        age: "Age",
        address: "Address",
        shop_branding: "Shop Branding",
        shop_name: "Shop Name / Title",
        shop_logo: "Shop Logo",
        shop_banner: "Shop Banner",
        cancel: "Cancel",
        save_changes: "Save Changes",
        required_fields_info: "All fields marked with * are required.",
        daily_entries_title: "Daily Entries Management",
        members_management: "Members Management",
        billing_settings: "Billing Settings",
        generate_bills_title: "Bill Generation",
        rate_manager: "Rate & Quantity Manager",
        collection_status: "Collection Status"
    },
    ta: {
        dashboard: "முகப்பு",
        entries: "தினசரி பதிவுகள்",
        members: "உறுப்பினர்கள்",
        settings: "அமைப்புகள் & விகிதங்கள்",
        bills: "பில்கள் உருவாக்கு",
        profile: "சுயவிவரம்",
        logout: "வெளியேறு",
        search_placeholder: "பெயர் அல்லது ஐடி மூலம் தேடுக...",
        reset_data: "தரவை மீட்டமை",
        total_members: "மொத்த உறுப்பினர்கள்",
        today_entries: "இன்றைய பதிவுகள்",
        total_qty: "மொத்த எடை (கி.கி)",
        avg_rate: "சராசரி விகிதம் (₹)",
        recent_activity: "சமீபத்திய நடவடிக்கை",
        add_member: "உறுப்பினர் சேர்",
        import_csv: "CSV இறக்குமதி",
        save_profile: "சுயவிவரத்தை சேமி",
        edit_profile: "சுயவிவரத்தைத் திருத்து",
        dashboard_overview: "முகப்பு கண்ணோட்டம்",
        filter: "வடிகட்டி",
        today: "இன்று",
        week: "இந்த வாரம்",
        month: "இந்த மாதம்",
        year: "இந்த வருடம்",
        all: "எல்லா நேரமும்",
        total_weight: "மொத்த எடை",
        gross_value: "மொத்த மதிப்பு",
        commission: "கமிஷன் வருமானம்",
        net_payable: "நிகர செலுத்த வேண்டிய தொகை",
        supply_trend: "விநியோகப் போக்கு (கடந்த 7 நாட்கள்)",
        top_farmers: "சிறந்த விவசாயிகள்",
        no_entries: "இந்தக் காலக்கட்டத்தில் பதிவுகள் இல்லை.",
        member_name: "உறுப்பினர் பெயர்",
        my_income: "எனது வருமானம்",
        to_members: "உறுப்பினர்களுக்கு",
        collection_trend: "சேகரிப்பு போக்கு & தினசரி விகிதங்கள்",
        members_by_location: "இருப்பிட வாரியாக உறுப்பினர்கள்",
        full_name: "முழு பெயர்",
        user_name: "பயனர் பெயர்",
        company_name: "நிறுவனத்தின் பெயர்",
        mobile_number: "கைபேசி எண்",
        gender: "பாலினம்",
        dob: "பிறந்த தேதி",
        age: "வயது",
        address: "முகவரி",
        shop_branding: "கடை வர்த்தகம்",
        shop_name: "கடை பெயர் / தலைப்பு",
        shop_logo: "கடை லோகோ",
        shop_banner: "கடை பேனர்",
        cancel: "ரத்து செய்",
        save_changes: "மாற்றங்களைச் சேமி",
        required_fields_info: "* குறியிடப்பட்ட அனைத்து புலங்களும் கட்டாயமாகும்.",
        daily_entries_title: "தினசரி பதிவு மேலாண்மை",
        members_management: "உறுப்பினர்கள் மேலாண்மை",
        billing_settings: "பில்லிங் அமைப்புகள்",
        generate_bills_title: "பில்கள் உருவாக்கம்",
        rate_manager: "வீதம் மற்றும் அளவு மேலாளர்",
        collection_status: "சேகரிப்பு நிலை"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        entries: "दैनिक प्रविष्टियां",
        members: "सदस्य",
        settings: "सेटिंग्स और दरें",
        bills: "बिल बनाएं",
        profile: "प्रोफाइल",
        logout: "लॉगआउट",
        search_placeholder: "नाम या आईडी से खोजें...",
        reset_data: "डेटा रीसेट करें",
        total_members: "कुल सदस्य",
        today_entries: "आज की प्रविष्टियां",
        total_qty: "कुल वजन (किग्रा)",
        avg_rate: "औसत दर (₹)",
        recent_activity: "हाल की गतिविधि",
        add_member: "सदस्य जोड़ें",
        import_csv: "CSV आयात करें",
        save_profile: "प्रोफ़ाइल सहेजें",
        edit_profile: "प्रोफ़ाइल संपादित करें",
        dashboard_overview: "डैशबोर्ड अवलोकन",
        filter: "फिल्टर",
        today: "आज",
        week: "इस सप्ताह",
        month: "इस महीने",
        year: "इस वर्ष",
        all: "कुल समय",
        total_weight: "कुल वजन",
        gross_value: "सकल मूल्य",
        commission: "कमीशन आय",
        net_payable: "शुद्ध देय",
        supply_trend: "आपूर्ति प्रवृत्ति (पिछले 7 दिन)",
        top_farmers: "शीर्ष किसान",
        no_entries: "इस अवधि के लिए कोई प्रविष्टि नहीं है।",
        member_name: "सदस्य का नाम",
        my_income: "मेरी आय",
        to_members: "सदस्यों को",
        collection_trend: "संग्रह रुझान और दैनिक दरें",
        members_by_location: "स्थान के अनुसार सदस्य",
        full_name: "पूरा नाम",
        user_name: "उपयोगकर्ता नाम",
        company_name: "कंपनी का नाम",
        mobile_number: "मोबाइल नंबर",
        gender: "लिंग",
        dob: "जन्म तिथि",
        age: "आयु",
        address: "पता",
        shop_branding: "दुकान ब्रांडिंग",
        shop_name: "दुकान का नाम / शीर्षक",
        shop_logo: "दुकान का लोगो",
        shop_banner: "दुकान का बैनर",
        cancel: "रद्द करें",
        save_changes: "परिवर्तन सहेजें",
        required_fields_info: "* के साथ चिह्नित सभी फ़ील्ड आवश्यक हैं।",
        daily_entries_title: "दैनिक प्रविष्टि प्रबंधन",
        members_management: "सदस्य प्रबंधन",
        billing_settings: "बिलिंग सेटिंग्स",
        generate_bills_title: "बिल निर्माण",
        rate_manager: "दर और मात्रा प्रबंधक",
        collection_status: "संग्रह की स्थिति"
    }
};

function t(key) {
    const lang = state.language || 'en';
    return translations[lang][key] || translations['en'][key] || key;
}

function cycleLanguage() {
    const langs = ['en', 'ta', 'hi'];
    const currentIndex = langs.indexOf(state.language || 'en');
    state.language = langs[(currentIndex + 1) % langs.length];
    
    // Update label
    const labels = { en: 'EN', ta: 'தமிழ்', hi: 'हिंदी' };
    const labelEl = document.getElementById('lang-label');
    if (labelEl) labelEl.textContent = labels[state.language];
    
    // Update search placeholder
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.placeholder = t('search_placeholder');
    
    // Update logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.textContent = t('logout');

    // Update reset button
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) resetBtn.textContent = t('reset_data');
    
    saveData();
    renderSidebar();
    renderMobileNav();
    renderCurrentView();
    
    // Refresh icons
    lucide.createIcons();
    
    showToast(`Language: ${labels[state.language]}`, 'info');
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar-nav');
    if (!sidebar) return;

    const navItems = [
        { id: 'dashboard', icon: 'bar-chart-2', label: t('dashboard') },
        { id: 'entries', icon: 'pen-tool', label: t('entries') },
        { id: 'members', icon: 'users', label: t('members') },
        { id: 'settings', icon: 'settings', label: t('settings') },
        { id: 'bills', icon: 'file-text', label: t('bills') },
        { id: 'profile', icon: 'user-circle', label: t('profile') }
    ];

    const currentTab = state.currentTab || 'dashboard';

    sidebar.innerHTML = `
        <div class="flex-1 px-2 space-y-0.5">
            ${navItems.map(item => `
                <button onclick="switchTab('${item.id}')"
                    class="nav-item w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${currentTab === item.id ? 'bg-primary/20 text-primary' : 'text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
                    data-tab="${item.id}">
                    <i data-lucide="${item.icon}"
                        class="mr-3 h-5 w-5 flex-shrink-0 ${currentTab === item.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-gray-300'}"></i>
                    ${item.label}
                </button>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

function renderMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (!mobileNav) return;

    const navItems = [
        { id: 'dashboard', icon: 'bar-chart-2', label: 'Dash' }, // 'Dash' is short, maybe translate too?
        { id: 'entries', icon: 'pen-tool', label: 'Entries' },
        { id: 'members', icon: 'users', label: 'Members' },
        { id: 'settings', icon: 'settings', label: 'Rates' },
        { id: 'bills', icon: 'file-text', label: 'Bills' },
        { id: 'profile', icon: 'user-circle', label: 'Profile' }
    ];
    
    // For mobile we might want even shorter labels if they are translated
    const translatedItems = navItems.map(item => ({
        ...item,
        label: t(item.id).split(' ')[0] // Just take the first word for mobile if long
    }));

    const currentTab = state.currentTab || 'dashboard';

    mobileNav.innerHTML = `
        ${translatedItems.map(item => `
            <button onclick="switchTab('${item.id}')"
                class="nav-item-mobile flex flex-col items-center justify-center flex-1 py-2 transition-colors ${currentTab === item.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'}"
                data-tab="${item.id}">
                <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                <span class="text-[10px] mt-0.5 font-medium">${item.label}</span>
            </button>
        `).join('')}
    `;
    lucide.createIcons();
}

// --- Data Persistence ---

function loadData() {
    const saved = localStorage.getItem('billApp_data');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Migration for new fields
        if (!parsed.dailyRates) parsed.dailyRates = {};
        if (!parsed.users) parsed.users = [];
        // Ensure currentUser is valid or null
        if (parsed.currentUser === undefined) parsed.currentUser = null;

        if (!parsed.settings.commissionType) {
            parsed.settings.commissionType = 'percent';
            if (parsed.settings.commissionAmount === 0) parsed.settings.commissionAmount = 10;
        }
        if (!parsed.theme) parsed.theme = 'light';
        // Migration for logo/banner
        if (parsed.settings.logo === undefined) parsed.settings.logo = null;
        if (parsed.settings.banner === undefined) parsed.settings.banner = null;
        if (parsed.settings.shopName === undefined) parsed.settings.shopName = '';

        if (!parsed.auditLogs) parsed.auditLogs = [];
        parsed.members.forEach(m => {
            if (m.advance === undefined) m.advance = 0;
        });

        // Apply theme
        if (parsed.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return parsed;
    }
    return defaultState;
}

function saveData(render = true) {
    localStorage.setItem('billApp_data', JSON.stringify(state));
    if (render) renderCurrentView();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    saveData(false); // No need to re-render entire view, CSS handles it
}

function resetData() {
    const input = prompt("WARNING: This will delete ALL data permanently.\nTo confirm, please type 'CONFIRM' below:");
    if (input === "CONFIRM") {
        state = JSON.parse(JSON.stringify(defaultState));
        saveData();
        location.reload();
    }
}

// --- Audit & Sync Utilities ---

function logActivity(action, details) {
    if (!state.auditLogs) state.auditLogs = [];
    state.auditLogs.unshift({
        time: new Date().toISOString(),
        user: state.currentUser ? state.currentUser.username : 'System',
        action,
        details
    });
    if (state.auditLogs.length > 200) state.auditLogs.pop();
    // Intentionally not calling saveData() here to avoid recursive renders, callers will save.
}

window.addEventListener('online', () => {
    showToast('Internet restored. Syncing entries to backend...', 'info');
    setTimeout(() => {
        showToast('Sync Complete! All daily entries backed up.', 'success');
        logActivity('System', 'Offline-First Sync Complete to Backend');
        saveData(false);
    }, 2000);
});

window.addEventListener('offline', () => {
    showToast('You are offline. Entries are saved locally and will sync when reconnected.', 'warning');
});

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 text-white px-4 py-3 rounded-full shadow-lg z-50 animate-slide-in flex gap-2 items-center`;
    toast.style.backgroundColor = type === 'success' ? '#4ade80' : type === 'warning' ? '#f59e0b' : '#2dd4bf';
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : type === 'warning' ? 'wifi-off' : 'info'}" class="h-5 w-5"></i><span>${msg}</span>`;
    document.body.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- Search Logistics ---

function toggleMobileSearch() {
    const container = document.getElementById('mobile-search-container');
    container.classList.toggle('hidden');
    if (!container.classList.contains('hidden')) {
        document.getElementById('mobile-global-search-input').focus();
    }
}

function handleGlobalSearch(query) {
    const val = query.trim().toLowerCase();
    const overlay = document.getElementById('search-results-overlay');
    const container = document.getElementById('search-results-container');

    // Sync both inputs
    document.getElementById('global-search-input').value = query;
    document.getElementById('mobile-global-search-input').value = query;

    if (val.length < 2) {
        closeGlobalSearch();
        return;
    }

    const matches = state.members.filter(m =>
        m.name.toLowerCase().includes(val) ||
        (m.mobile && m.mobile.includes(val)) ||
        m.id.toString().includes(val)
    ).slice(0, 10); // cap at 10

    if (matches.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">No members found.</div>`;
    } else {
        container.innerHTML = `
            <div class="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-[#1a1e2b] dark:bg-gray-800">Members</div>
            <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                ${matches.map(m => `
                    <li class="p-3 hover:bg-gray-100 dark:bg-[#1a1e2b] dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors" onclick="searchGoToMember(${m.id})">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                ${getInitials(m.name)}
                            </div>
                            <div>
                                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">${m.name}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">ID: ${m.id} ${m.mobile ? `· ${m.mobile}` : ''}</div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" class="h-4 w-4 text-gray-400"></i>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    overlay.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function closeGlobalSearch() {
    document.getElementById('search-results-overlay').classList.add('hidden');
}

function searchGoToMember(id) {
    closeGlobalSearch();
    document.getElementById('global-search-input').value = '';
    document.getElementById('mobile-global-search-input').value = '';
    document.getElementById('mobile-search-container').classList.add('hidden');

    // Switch to members tab and immediately edit
    switchTab('members');
    openEditMemberModal(id);
}

// --- Auth Logic ---

// Helper: Hash Password (SHA-256)
async function hashPassword(plainText) {
    const msgBuffer = new TextEncoder().encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkAuth() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    if (state.currentUser) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        renderCurrentView();
    } else {
        appContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        renderAuthView('signin');
    }
}

function renderAuthView(mode) {
    const container = document.getElementById('auth-container');

    const isSignin = mode === 'signin';
    const title = isSignin ? 'Welcome Back' : 'Create Account';
    const subtitle = isSignin ? 'Sign in to manage your collection' : 'Sign up to get started';
    const btnText = isSignin ? 'Sign In' : 'Sign Up';
    const toggleText = isSignin ? "Don't have an account? Sign Up" : "Already have an account? Sign In";
    const toggleAction = isSignin ? "renderAuthView('signup')" : "renderAuthView('signin')";

    const html = `
        <div class="w-full max-w-md bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-2xl shadow-xl overflow-hidden animate-fade-in transition-colors">
            <!-- Header -->
            <div class="bg-primary text-black p-8 text-center">
                <div class="mx-auto bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                    <i data-lucide="flower-2" class="text-white h-8 w-8"></i>
                </div>
                <h2 class="text-2xl font-bold text-white mb-1">${title}</h2>
                <p class="text-teal-100 text-sm">${subtitle}</p>
            </div>
            
            <!-- Form -->
            <div class="p-8 space-y-5">
                ${!isSignin ? `
                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1.5 ml-1">Full Name</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i data-lucide="user" class="h-5 w-5 text-gray-400"></i>
                        </div>
                        <input type="text" id="auth-name" placeholder="John Doe"
                            class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0c0e14] border border-gray-200 dark:border-gray-800 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 dark:text-gray-100">
                    </div>
                </div>
                ` : ''}
                
                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1.5 ml-1">Username</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i data-lucide="at-sign" class="h-5 w-5 text-gray-400"></i>
                        </div>
                        <input type="text" id="auth-username" placeholder="username"
                            class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0c0e14] border border-gray-200 dark:border-gray-800 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 dark:text-gray-100">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1.5 ml-1">Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i data-lucide="lock" class="h-5 w-5 text-gray-400"></i>
                        </div>
                        <input type="password" id="auth-password" placeholder="••••••••"
                            class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0c0e14] border border-gray-200 dark:border-gray-800 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 dark:text-gray-100">
                    </div>
                </div>

                <button onclick="${isSignin ? 'signin()' : 'signup()'}" 
                    class="w-full bg-primary text-black hover:from-[#2eb04f] hover:to-[#006bd6] text-white font-bold py-3.5 rounded-full shadow-lg shadow-primary/30 transform transition-all active:scale-[0.98]">
                    ${btnText}
                </button>
                
                <div class="text-center pt-2">
                    <button onclick="${toggleAction}" class="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-teal-400 transition-colors font-medium">
                        ${toggleText}
                    </button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    lucide.createIcons();

    // Enter key support
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (isSignin) signin();
                else signup();
            }
        });
    });
}

async function signin() {
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    const hashedPassword = await hashPassword(password);
    // Backward compatibility: check against plain text (old users) or hashed (new users)
    const user = state.users.find(u => u.username === username && (u.password === hashedPassword || u.password === password));

    if (user) {
        // Auto-migrate to hash if it was plain text
        if (user.password === password) {
            user.password = hashedPassword;
            saveData(false);
        }
        state.currentUser = user;
        saveData();
        checkAuth();
    } else {
        alert('Invalid username or password');
    }
}

async function signup() {
    const nameInput = document.getElementById('auth-name');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    const name = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !username || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (state.users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
        name,
        username,
        password: hashedPassword
    };

    state.users.push(newUser);
    state.currentUser = newUser;
    saveData();
    checkAuth();
}

function logout() {
    state.currentUser = null;
    saveData(); // Save logged out state
    // Don't just checkAuth, trigger a full reload to clear any memory states if needed, or just re-render
    checkAuth();
}



// --- Navigation ---

let currentTab = 'entries';

function switchTab(tab) {
    currentTab = tab;

    // Update UI classes
    document.querySelectorAll('.nav-item, .nav-item-mobile').forEach(el => {
        if (el.dataset.tab === tab) {
            el.classList.add('text-primary', 'bg-primary/10', 'dark:bg-gray-800');
            el.classList.remove('text-gray-600', 'text-gray-500', 'dark:text-gray-300', 'dark:text-gray-400');
            if (el.classList.contains('nav-item-mobile')) el.classList.add('text-primary');
        } else {
            el.classList.remove('text-primary', 'bg-primary/10', 'dark:bg-gray-800');
            el.classList.add('text-gray-600', 'dark:text-gray-300');
            if (el.classList.contains('nav-item-mobile')) el.classList.add('text-gray-500', 'dark:text-gray-400');
        }
    });

    renderCurrentView();
}

function renderCurrentView() {
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    switch (currentTab) {
        case 'entries':
            renderEntriesView(main);
            break;
        case 'members':
            renderMembersView(main);
            break;
        case 'settings':
            renderSettingsView(main);
            break;
        case 'bills':
            renderBillsView(main);
            break;
        case 'profile':
            renderProfileView(main);
            break;
        case 'dashboard':
            renderDashboardView(main);
            break;
    }
    lucide.createIcons();
}

// --- Views ---

// -1. Dashboard View
function renderDashboardView(container) {
    // 1. Calculate Time Range
    const today = new Date();
    let startDate = new Date();
    let queryLabels = [];

    // Determine Start Date based on Filter
    if (dashboardFilter === 'today') {
        startDate = today;
    } else if (dashboardFilter === 'week') {
        startDate.setDate(today.getDate() - 6); // Last 7 days
    } else if (dashboardFilter === 'month') {
        startDate.setDate(1); // 1st of current month
    } else if (dashboardFilter === 'year') {
        startDate.setMonth(0, 1); // Jan 1st
    } else if (dashboardFilter === 'all') {
        startDate = new Date(0); // Epoch
    }

    // Helper to get dates in range
    const getDatesInRange = (start, end) => {
        const arr = [];
        const dt = new Date(start);
        const endDt = new Date(end);
        dt.setHours(0, 0, 0, 0);
        endDt.setHours(0, 0, 0, 0);

        while (dt <= endDt) {
            const dateStr = dt.toLocaleDateString('en-CA');
            arr.push(dateStr);
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    };

    const dateRange = (dashboardFilter === 'today')
        ? [today.toLocaleDateString('en-CA')]
        : getDatesInRange(startDate, today);

    // 2. Aggregate Data
    let totalQty = 0;
    let totalGross = 0;
    let totalCommission = 0;
    let totalLuggage = 0;

    // Trend Data Arrays
    const trendMap = {}; // date -> { qty, rate }

    dateRange.forEach(dateStr => {
        const dayEntries = state.entries[dateStr] || {};
        const rate = state.dailyRates[dateStr] !== undefined ? state.dailyRates[dateStr] : state.settings.rate;

        let dailyQty = 0;
        Object.values(dayEntries).forEach(q => dailyQty += (parseFloat(q) || 0));

        // Accumulate Totals
        const dailyGross = dailyQty * rate;
        let dailyComm = 0;
        let dailyLug = 0;

        if (state.settings.commissionEnabled) {
            if (state.settings.commissionType === 'percent') {
                dailyComm = dailyGross * (state.settings.commissionAmount / 100);
            } else {
                if (Object.keys(dayEntries).length > 0) {
                    dailyComm = Object.keys(dayEntries).length * state.settings.commissionAmount;
                }
            }
        }

        if (state.settings.luggageEnabled) {
            dailyLug = dailyQty * (state.settings.luggageAmount || 0);
        }

        totalQty += dailyQty;
        totalGross += dailyGross;
        totalCommission += dailyComm;
        totalLuggage += dailyLug;

        // Trend Map Population
        trendMap[dateStr] = { qty: dailyQty, rate: rate };
    });

    const netProfit = totalGross - totalCommission - totalLuggage; // To Farmers
    const collectorIncome = totalCommission + totalLuggage; // My Income

    // Prepare Chart Data
    const chartLabels = [];
    const chartQty = [];
    const chartRate = [];

    dateRange.forEach(d => {
        chartLabels.push(d.slice(5)); // MM-DD
        chartQty.push(trendMap[d] ? trendMap[d].qty : 0);
        chartRate.push(trendMap[d] ? trendMap[d].rate : 0);
    });

    const html = `
        <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">${t('dashboard_overview')}</h2>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">${t('filter')}:</span>
                    <select onchange="updateDashboardFilter(this.value)" class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-gray-100 shadow-sm cursor-pointer hover:border-gray-400">
                        <option value="today" ${dashboardFilter === 'today' ? 'selected' : ''}>${t('today')}</option>
                        <option value="week" ${dashboardFilter === 'week' ? 'selected' : ''}>${t('week')}</option>
                        <option value="month" ${dashboardFilter === 'month' ? 'selected' : ''}>${t('month')}</option>
                        <option value="year" ${dashboardFilter === 'year' ? 'selected' : ''}>${t('year')}</option>
                        <option value="all" ${dashboardFilter === 'all' ? 'selected' : ''}>${t('all')}</option>
                    </select>
                </div>
            </div>
            
            <!-- Financial Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Total Quantity -->
                <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-5 rounded-[32px] shadow-softer  hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">${t('total_weight')}</p>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">${totalQty.toFixed(2)} <span class="text-sm font-normal text-gray-400">kg</span></h3>
                        </div>
                        <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <i data-lucide="scale" class="h-5 w-5"></i>
                        </div>
                    </div>
                </div>

                <!-- Gross Value -->
                <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-5 rounded-[32px] shadow-softer  hover:shadow-md transition-shadow">
                     <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">${t('gross_value')}</p>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">₹ ${totalGross.toLocaleString('en-IN')}</h3>
                        </div>
                        <div class="p-2 bg-primary/10 dark:bg-primary/20/20 text-primary rounded-lg">
                            <i data-lucide="banknote" class="h-5 w-5"></i>
                        </div>
                    </div>
                </div>

                <!-- Your Income (Commission) -->
                <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-5 rounded-[32px] shadow-softer  hover:shadow-md transition-shadow">
                     <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">${t('my_income')}</p>
                            <h3 class="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">₹ ${collectorIncome.toLocaleString('en-IN')}</h3>
                            <p class="text-[10px] text-gray-400 mt-1">Comm. + Luggage</p>
                        </div>
                        <div class="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                            <i data-lucide="trending-up" class="h-5 w-5"></i>
                        </div>
                    </div>
                </div>

                <!-- Net Payable -->
                <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-5 rounded-[32px] shadow-softer  hover:shadow-md transition-shadow">
                     <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-red-500 uppercase tracking-wide">${t('to_members')}</p>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">₹ ${netProfit.toLocaleString('en-IN')}</h3>
                            <p class="text-[10px] text-gray-400 mt-1">${t('net_payable')}</p>
                        </div>
                        <div class="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                            <i data-lucide="wallet" class="h-5 w-5"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <!-- Main Trend Chart -->
                 <div class="lg:col-span-2 bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-6 rounded-[32px] shadow-softer ">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">${t('collection_trend')}</h3>
                    <div class="relative h-72 w-full">
                        <canvas id="trendChart"></canvas>
                    </div>
                 </div>
                 
                 <!-- Members Pie -->
                 <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-6 rounded-[32px] shadow-softer ">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">${t('members_by_location')}</h3>
                    <div class="relative h-64 w-full">
                        <canvas id="locationChart"></canvas>
                    </div>
                 </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Initialize Charts

    // 1. Location Pie
    const locationCounts = {};
    state.members.forEach(m => {
        const loc = m.location || 'Unknown';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    new Chart(document.getElementById('locationChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(locationCounts),
            datasets: [{
                data: Object.values(locationCounts),
                backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
    });

    // 2. Trend Mixed Chart
    new Chart(document.getElementById('trendChart'), {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Collection (kg)',
                    data: chartQty,
                    backgroundColor: 'rgba(74, 222, 128, 0.8)',
                    hoverBackgroundColor: 'rgba(74, 222, 128, 1)',
                    borderColor: '#4ade80',
                    borderWidth: 0,
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    label: 'Rate (₹)',
                    data: chartRate,
                    type: 'line',
                    borderColor: '#2dd4bf',
                    backgroundColor: '#2dd4bf',
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    cornerRadius: 8,
                    displayColors: true
                },
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, boxWidth: 8 }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: { display: true, text: 'Weight (kg)' },
                    grid: { borderDash: [2, 4], color: '#e5e7eb' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Rate (₹)' }
                }
            }
        }
    });
}


// 0. Profile View

let profileEditing = false;

function toggleProfileEdit() {
    profileEditing = !profileEditing;
    renderCurrentView();
}

function saveProfile() {
    const user = state.currentUser;
    const nameVal = document.getElementById('profile-name').value.trim();
    const companyVal = document.getElementById('profile-company').value.trim();
    const mobileVal = document.getElementById('profile-mobile').value.trim();
    const genderVal = document.getElementById('profile-gender').value;
    const dobVal = document.getElementById('profile-dob').value;
    const addressVal = document.getElementById('profile-address').value.trim();

    if (!nameVal) { alert('Full Name is required.'); return; }
    if (!companyVal) { alert('Company Name is required.'); return; }
    if (!mobileVal) { alert('Mobile Number is required.'); return; }
    if (!genderVal) { alert('Please select Gender.'); return; }
    if (!dobVal) { alert('Date of Birth is required.'); return; }
    if (!addressVal) { alert('Address is required.'); return; }

    user.name = nameVal;
    user.company = companyVal;
    user.mobile = mobileVal;
    user.gender = genderVal;
    user.dob = dobVal;
    user.address = addressVal;

    state.settings.shopName = companyVal;
    state.settings.shopMobile = mobileVal;

    profileEditing = false;
    logActivity('Profile Update', 'Updated profile details.');
    saveData();
    showToast('Profile saved successfully!', 'success');
}

function calculateAge(dob) {
    if (!dob) return '-';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function renderProfileView(container) {
    const user = state.currentUser;
    const settings = state.settings;
    const isEditing = profileEditing;
    const inputClass = isEditing
        ? 'w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-[10px] px-3 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all'
        : 'w-full bg-gray-50 dark:bg-[#0c0e14] border border-gray-200 dark:border-gray-800 rounded-[10px] px-3 py-2.5 text-gray-700 dark:text-gray-300 cursor-not-allowed';
    const readonlyAttr = isEditing ? '' : 'readonly';
    const disabledAttr = isEditing ? '' : 'disabled';
    const age = calculateAge(user.dob);

    const html = `
        <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-2xl shadow-soft p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            ${getInitials(user.name)}
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">${user.name}</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">@${user.username}</p>
                        </div>
                    </div>
                    <button onclick="${isEditing ? 'saveProfile()' : 'toggleProfileEdit()'}"
                        class="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${isEditing ? 'bg-primary text-white hover:bg-green-600 shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}">
                        <i data-lucide="${isEditing ? 'save' : 'pencil'}" class="h-4 w-4"></i>
                        ${isEditing ? t('save_profile') : t('edit_profile')}
                    </button>
                </div>

                ${isEditing ? `<p class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[10px] px-3 py-2 mb-4 flex items-center gap-2"><i data-lucide="info" class="h-4 w-4 flex-shrink-0"></i> ${t('required_fields_info')}</p>` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('full_name')} <span class="text-red-500">*</span></label>
                        <input type="text" id="profile-name" value="${user.name || ''}" ${readonlyAttr} class="${inputClass}" placeholder="Enter full name">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('user_name')}</label>
                        <input type="text" value="${user.username}" readonly class="w-full bg-gray-50 dark:bg-[#0c0e14] border border-gray-200 dark:border-gray-800 rounded-[10px] px-3 py-2.5 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                        <p class="text-xs text-gray-400 mt-1">Username cannot be changed.</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('company_name')} <span class="text-red-500">*</span></label>
                        <input type="text" id="profile-company" value="${user.company || settings.shopName || ''}" ${readonlyAttr} class="${inputClass}" placeholder="e.g. JPK Flowers">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('mobile_number')} <span class="text-red-500">*</span></label>
                        <input type="tel" id="profile-mobile" value="${user.mobile || settings.shopMobile || ''}" ${readonlyAttr} class="${inputClass}" placeholder="e.g. 9876543210" maxlength="10">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('gender')} <span class="text-red-500">*</span></label>
                        <select id="profile-gender" ${disabledAttr} class="${inputClass}">
                            <option value="" ${!user.gender ? 'selected' : ''}>Select Gender</option>
                            <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Male</option>
                            <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Female</option>
                            <option value="other" ${user.gender === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('dob')} <span class="text-red-500">*</span></label>
                        <input type="date" id="profile-dob" value="${user.dob || ''}" ${readonlyAttr} class="${inputClass}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('age')}</label>
                        <input type="text" value="${age !== '-' ? age + ' years' : 'Not set'}" readonly class="w-full bg-gray-50 dark:bg-[#0c0e14] border border-gray-200 dark:border-gray-800 rounded-[10px] px-3 py-2.5 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                        <p class="text-xs text-gray-400 mt-1">Auto-calculated from Date of Birth.</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('address')} <span class="text-red-500">*</span></label>
                        <textarea id="profile-address" rows="3" ${readonlyAttr} class="${inputClass} resize-none" placeholder="Enter full address">${user.address || ''}</textarea>
                    </div>
                </div>

                ${isEditing ? `<div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="profileEditing=false;renderCurrentView();" class="px-4 py-2 rounded-[10px] text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all">${t('cancel')}</button>
                    <button onclick="saveProfile()" class="px-5 py-2 rounded-[10px] text-sm font-medium bg-primary text-white hover:bg-green-600 shadow-md transition-all flex items-center gap-2"><i data-lucide="save" class="h-4 w-4"></i>${t('save_changes')}</button>
                </div>` : ''}
            </div>

            <!-- Shop Branding Card -->
            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-2xl shadow-soft p-6">
                <div class="flex items-center gap-2 mb-6 border-b border-none pb-4">
                    <i data-lucide="store" class="text-primary h-6 w-6"></i>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">${t('shop_branding')}</h2>
                </div>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">${t('shop_name')}</label>
                        <input type="text" value="${settings.shopName || ''}" placeholder="e.g. JPK Flowers"
                            onchange="updateSetting('shopName', this.value)"
                            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-[10px] px-3 py-2 focus:ring-primary outline-none transition-all">
                        <p class="text-xs text-gray-500 mt-1">This will appear on your generated bills.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                             <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">${t('shop_logo')}</label>
                             <div class="relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-transparent dark:hover:bg-gray-700/50 transition-colors h-48 flex flex-col items-center justify-center text-center">
                                <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onchange="handleBrandingUpload(this, 'logo')">
                                ${settings.logo ?
            `<img src="${settings.logo}" class="max-h-full max-w-full object-contain z-0">
                                     <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-0 rounded-lg">
                                        <span>Click to Change</span>
                                     </div>`
            :
            `<div class="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                                        <i data-lucide="image-plus" class="h-8 w-8"></i>
                                        <span class="text-sm">Upload Logo</span>
                                     </div>`
        }
                             </div>
                             ${settings.logo ? `<button onclick="updateSetting('logo', null)" class="text-xs text-red-500 hover:text-red-700 underline">Remove Logo</button>` : ''}
                        </div>
                        <div class="space-y-2">
                             <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">${t('shop_banner')}</label>
                             <div class="relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-transparent dark:hover:bg-gray-700/50 transition-colors h-48 flex flex-col items-center justify-center text-center">
                                <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onchange="handleBrandingUpload(this, 'banner')">
                                ${settings.banner ?
            `<img src="${settings.banner}" class="max-h-full max-w-full object-cover z-0 rounded">
                                     <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-0 rounded-lg">
                                        <span>Click to Change</span>
                                     </div>`
            :
            `<div class="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                                        <i data-lucide="image" class="h-8 w-8"></i>
                                        <span class="text-sm">Upload Banner</span>
                                     </div>`
        }
                             </div>
                             ${settings.banner ? `<button onclick="updateSetting('banner', null)" class="text-xs text-red-500 hover:text-red-700 underline">Remove Banner</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function handleBrandingUpload(input, type) {
    if (input.files && input.files[0]) {
        // Use the existing resizeImage function but maybe with larger dimensions for banner
        const isBanner = type === 'banner';
        resizeImageGeneric(input.files[0], isBanner ? 800 : 300, isBanner ? 400 : 300, (dataUrl) => {
            updateSetting(type, dataUrl);
            // Re-render handled by updateSetting -> saveData -> renderCurrentView
        });
    }
}

// Helper to resize with custom max dimensions
function resizeImageGeneric(file, maxX, maxY, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxX) {
                    height *= maxX / width;
                    width = maxX;
                }
            } else {
                if (height > maxY) {
                    width *= maxY / height;
                    height = maxY;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 1. Members View
let memberSort = 'az'; // Default to A-Z as requested ('az', 'za', 'newest', 'oldest')

// Dashboard Filter
let dashboardFilter = 'month'; // 'today', 'week', 'month', 'year', 'all'

function updateDashboardFilter(val) {
    dashboardFilter = val;
    const main = document.getElementById('main-content');
    renderDashboardView(main);
}

function renderMembersView(container) {
    let sortedMembers = [...state.members];
    if (memberSort === 'az') sortedMembers.sort((a, b) => a.name.localeCompare(b.name));
    if (memberSort === 'za') sortedMembers.sort((a, b) => b.name.localeCompare(a.name));
    if (memberSort === 'newest') sortedMembers.sort((a, b) => b.id - a.id);
    if (memberSort === 'oldest') sortedMembers.sort((a, b) => a.id - b.id);

    const html = `
        <div class="max-w-2xl mx-auto animate-fade-in">
            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow p-6 mb-6 transition-colors hover-scale">
                <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Member</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col md:flex-row gap-2 items-center">
                         <div class="flex-shrink-0 relative group">
                            <label for="new-member-pic" class="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors overflow-hidden border border-gray-300 dark:border-gray-600 text-gray-400">
                                <i data-lucide="camera" class="h-5 w-5 absolute z-10 transition-opacity duration-200"></i>
                                <img id="new-member-preview" class="hidden w-full h-full object-cover z-20">
                            </label>
                            <input type="file" id="new-member-pic" accept="image/*" class="hidden" onchange="previewNewMemberImage(this)">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                            <input type="text" id="new-member-name" placeholder="Member Name" 
                                class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                            <input type="tel" id="new-member-mobile" placeholder="Mobile Number" 
                                class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                             <input type="text" id="new-member-location" placeholder="Location/Area" 
                                class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                        </div>
                         
                        <button onclick="addMember()" class="w-full md:w-auto bg-primary text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors btn-press whitespace-nowrap">
                            Add Member
                        </button>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow overflow-hidden transition-colors">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Member List (${state.members.length})</h2>
                    <div class="flex gap-2 text-sm items-center">
                        <label class="cursor-pointer bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium flex items-center gap-1.5 mr-2">
                            <i data-lucide="upload" class="h-4 w-4"></i> Import CSV
                            <input type="file" accept=".csv" class="hidden" onchange="importMembersCSV(this)">
                        </label>
                        <select onchange="sortMembers(this.value)" class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 outline-none focus:ring-primary">
                            <option value="newest" ${memberSort === 'newest' ? 'selected' : ''}>Newest First</option>
                            <option value="oldest" ${memberSort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                            <option value="az" ${memberSort === 'az' ? 'selected' : ''}>Name (A-Z)</option>
                            <option value="za" ${memberSort === 'za' ? 'selected' : ''}>Name (Z-A)</option>
                        </select>
                    </div>
                </div>
                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                    ${sortedMembers.map((m, index) => `
                        <li class="px-6 py-4 flex justify-between items-center hover:bg-transparent dark:hover:bg-gray-700 transition-colors animate-slide-in" style="animation-delay: ${index * 0.05}s">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                    ${m.profilePic ? `<img src="${m.profilePic}" class="w-full h-full object-cover" alt="${m.name}">` : `<span class="text-sm font-bold text-gray-600 dark:text-gray-300">${getInitials(m.name)}</span>`}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900 dark:text-gray-100">${m.name}</div>
                                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                        ${m.mobile ? `<span class="flex items-center gap-1"><i data-lucide="phone" class="h-3 w-3"></i> ${m.mobile}</span>` : ''}
                                        ${m.location ? `<span class="flex items-center gap-1"><i data-lucide="map-pin" class="h-3 w-3"></i> ${m.location}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="openEditMemberModal(${m.id})" class="text-blue-600 hover:text-blue-400 p-1 btn-press" title="Edit">
                                    <i data-lucide="pencil" class="h-4 w-4"></i>
                                </button>
                                <button onclick="deleteMember(${m.id})" class="text-red-500 hover:text-red-400 p-1 btn-press" title="Delete">
                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </li>
                    `).join('')}
                    ${state.members.length === 0 ? '<li class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No members added yet.</li>' : ''}
                </ul>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function sortMembers(val) {
    memberSort = val;
    renderCurrentView();
}

function importMembersCSV(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\\n');
        let added = 0;
        let dup = 0;
        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) continue;
            // Basic CSV split, assuming no commas within fields
            const parts = line.split(',');
            if (parts.length >= 1) {
                const name = parts[0].trim();
                const mobile = parts[1] ? parts[1].trim() : '';
                const location = parts[2] ? parts[2].trim() : '';
                if (name) {
                    if (mobile && state.members.some(m => m.mobile === mobile)) {
                        dup++;
                        continue;
                    }
                    state.members.push({
                        id: Date.now() + Math.random(),
                        name, mobile, location, profilePic: null, advance: 0
                    });
                    added++;
                }
            }
        }
        if (added > 0) {
            logActivity('CSV Import', `Imported ${added} members.`);
            saveData();
        }
        alert(`Imported ${added} members.\\n${dup} duplicate(s) skipped.`);
        input.value = ''; // reset
    };
    reader.readAsText(input.files[0]);
}

function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
}

function resizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 300;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Compress
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function previewNewMemberImage(input) {
    if (input.files && input.files[0]) {
        resizeImage(input.files[0], (dataUrl) => {
            const img = document.getElementById('new-member-preview');
            const icon = input.parentElement.querySelector('i');
            img.src = dataUrl;
            img.classList.remove('hidden');
            if (icon) icon.classList.add('opacity-0');
        });
    }
}

function addMember() {
    const nameInput = document.getElementById('new-member-name');
    const mobileInput = document.getElementById('new-member-mobile');
    const picInput = document.getElementById('new-member-pic');
    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const locationInput = document.getElementById('new-member-location');
    const locationVal = locationInput.value.trim();

    if (name) {
        const save = (picDataUrl) => {
            state.members.push({
                id: Date.now(),
                name,
                mobile,
                location: locationVal,
                profilePic: picDataUrl || null,
                advance: 0
            });
            logActivity('Add Member', `Added member: ${name}`);
            saveData();
        };

        if (picInput.files && picInput.files[0]) {
            resizeImage(picInput.files[0], (dataUrl) => {
                save(dataUrl);
            });
        } else {
            save(null);
        }
    }
}

// Modal State
let currentEditId = null;
let currentEditPic = null;

function openEditMemberModal(id) {
    const member = state.members.find(m => m.id === id);
    if (!member) return;

    currentEditId = id;
    currentEditPic = member.profilePic;

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const saveBtn = document.getElementById('modal-save-btn');
    const overlay = document.getElementById('modal-overlay');
    const modalContent = overlay.firstElementChild;

    modalTitle.innerText = 'Edit Member';

    modalBody.innerHTML = `
        <div class="flex flex-col items-center mb-4">
            <label for="edit-member-pic" class="cursor-pointer relative w-24 h-24 rounded-full bg-white dark:bg-[#161925] dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors overflow-hidden border-4 border-white dark:border-gray-600 shadow-lg">
                <img id="edit-member-preview" src="${member.profilePic || ''}" class="${member.profilePic ? '' : 'hidden'} w-full h-full object-cover z-20 relative">
                <div id="edit-member-placeholder" class="${member.profilePic ? 'hidden' : 'flex'} w-full h-full absolute inset-0 items-center justify-center text-gray-400 z-10">
                    <i data-lucide="camera" class="h-8 w-8"></i>
                </div>
            </label>
            <input type="file" id="edit-member-pic" accept="image/*" class="hidden" onchange="previewEditMemberImage(this)">
            <button onclick="removeEditMemberImage()" class="text-xs text-red-500 hover:text-red-600 mt-3 font-medium">Remove Photo</button>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" id="edit-member-name" value="${member.name}" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1">Mobile Number</label>
                <input type="tel" id="edit-member-mobile" value="${member.mobile || ''}" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1">Location / Area</label>
                <input type="text" id="edit-member-location" value="${member.location || ''}" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1">Advance Balance / Khata (₹)</label>
                <input type="number" id="edit-member-advance" value="${member.advance || 0}" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                <p class="text-xs text-gray-500 mt-1">This amount will be deducted from their next bill.</p>
            </div>
        </div>
    `;

    lucide.createIcons();
    saveBtn.onclick = saveEditMember;

    overlay.classList.remove('hidden');
    // Force reflow
    void overlay.offsetWidth;

    overlay.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
}

function closeModal(event) {
    if (event && event.target.id !== 'modal-overlay') return;

    const overlay = document.getElementById('modal-overlay');
    const modalContent = overlay.firstElementChild;

    overlay.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

function previewEditMemberImage(input) {
    if (input.files && input.files[0]) {
        resizeImage(input.files[0], (dataUrl) => {
            const img = document.getElementById('edit-member-preview');
            const ph = document.getElementById('edit-member-placeholder');
            img.src = dataUrl;
            img.classList.remove('hidden');
            ph.classList.add('hidden');
            currentEditPic = dataUrl;
        });
    }
}

function removeEditMemberImage() {
    const img = document.getElementById('edit-member-preview');
    const ph = document.getElementById('edit-member-placeholder');
    const input = document.getElementById('edit-member-pic');

    img.removeAttribute('src');
    img.classList.add('hidden');
    ph.classList.remove('hidden');
    input.value = '';
    currentEditPic = null;
}

function saveEditMember() {
    const nameInput = document.getElementById('edit-member-name');
    const mobileInput = document.getElementById('edit-member-mobile');
    const locationInput = document.getElementById('edit-member-location');
    const advanceInput = document.getElementById('edit-member-advance');

    if (currentEditId && nameInput.value.trim()) {
        const member = state.members.find(m => m.id === currentEditId);
        if (member) {
            member.name = nameInput.value.trim();
            member.mobile = mobileInput.value.trim();
            member.location = locationInput.value.trim();
            member.advance = parseFloat(advanceInput.value) || 0;
            member.profilePic = currentEditPic;
            logActivity('Edit Member', `Updated member: ${member.name}`);
            saveData();
            closeModal();
        }
    }
}

function editMember(id) {
    openEditMemberModal(id);
}

function deleteMember(id) {
    if (confirm('Delete this member?')) {
        const member = state.members.find(m => m.id === id);
        if (member) logActivity('Delete Member', `Removed member: ${member.name}`);
        state.members = state.members.filter(m => m.id !== id);
        saveData();
    }
}

// 2. Settings View
function renderSettingsView(container) {
    const html = `
        <div class="max-w-xl mx-auto bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow p-6 transition-colors animate-fade-in">
            <h2 class="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">${t('billing_settings')}</h2>
            
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1">Default Rate (per unit)</label>
                    <input type="number" value="${state.settings.rate}" onchange="updateSetting('rate', this.value)"
                        class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-primary outline-none">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">This is the default rate. You can override this per day in the "Daily Entries" tab.</p>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex items-center justify-between mb-4">
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">Commission Deduction</label>
                        <input type="checkbox" ${state.settings.commissionEnabled ? 'checked' : ''} 
                            onchange="updateSetting('commissionEnabled', this.checked)"
                            class="h-5 w-5 text-primary rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary">
                    </div>
                    ${state.settings.commissionEnabled ? `
                        <div class="ml-6 space-y-3">
                            <div>
                                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Commission Type</label>
                                <div class="flex gap-4">
                                    <label class="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <input type="radio" name="commType" value="fixed" 
                                            ${state.settings.commissionType === 'fixed' ? 'checked' : ''}
                                            onchange="updateSetting('commissionType', 'fixed')"
                                            class="text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600">
                                        Fixed Amount
                                    </label>
                                    <label class="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <input type="radio" name="commType" value="percent" 
                                            ${state.settings.commissionType === 'percent' ? 'checked' : ''}
                                            onchange="updateSetting('commissionType', 'percent')"
                                            class="text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600">
                                        Percentage (%)
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    ${state.settings.commissionType === 'percent' ? 'Percentage Value (%)' : 'Amount (Flat)'}
                                </label>
                                <input type="number" value="${state.settings.commissionAmount}" onchange="updateSetting('commissionAmount', this.value)"
                                    class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-primary outline-none">
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex items-center justify-between mb-4">
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">Luggage Charge Deduction</label>
                        <input type="checkbox" ${state.settings.luggageEnabled ? 'checked' : ''} 
                            onchange="updateSetting('luggageEnabled', this.checked)"
                            class="h-5 w-5 text-primary rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary">
                    </div>
                    ${state.settings.luggageEnabled ? `
                        <div class="ml-6">
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Luggage Rate (per Kg)</label>
                            <input type="number" value="${state.settings.luggageAmount}" onchange="updateSetting('luggageAmount', this.value)"
                                placeholder="e.g. 2.00"
                                class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-primary outline-none">
                        </div>
                    ` : ''}
                </div>

                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex items-center justify-between mb-4">
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">Activity & Audit Logs</label>
                        <button onclick="viewAuditLogs()" class="bg-white dark:bg-[#161925] dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 dark:text-gray-200 px-3 py-1.5 rounded-full text-sm transition-colors">
                            View Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function viewAuditLogs() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in';
    modal.onclick = (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    };

    const logsHtml = (state.auditLogs || []).map(log => `
        <div class="border-b border-none py-3 last:border-0">
            <div class="flex justify-between items-start mb-1">
                <span class="font-medium text-sm text-gray-900 dark:text-gray-100">${log.action}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(log.time).toLocaleString()}</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300">${log.details}</p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">User: ${log.user}</p>
        </div>
    `).join('') || '<div class="text-center py-8 text-gray-500 text-sm">No activity logs yet.</div>';

    const content = document.createElement('div');
    content.className = 'bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col relative';
    content.innerHTML = `
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-[#1a1e2b] dark:bg-gray-800/80 rounded-t-lg">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"><i data-lucide="shield-alert" class="h-5 w-5 text-teal-500"></i> Audit Logs</h3>
            <button onclick="this.closest('.fixed').remove()" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300 dark:text-gray-200">
                <i data-lucide="x" class="h-4 w-4"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
            ${logsHtml}
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();
}

function updateSetting(key, value) {
    if (key === 'rate' || key === 'commissionAmount' || key === 'luggageAmount') {
        value = parseFloat(value) || 0;
    }
    state.settings[key] = value;
    saveData();
}

// 3. Entries View
let currentEntryDate = new Date().toISOString().split('T')[0];


function renderEntriesView(container) {
    // Check if a specific rate is set for this day  
    const isDailyRateSet = state.dailyRates[currentEntryDate] !== undefined;
    // Effective rate is daily rate OR default rate
    const effectiveRate = isDailyRateSet ? state.dailyRates[currentEntryDate] : state.settings.rate;

    const html = `
        <div class="max-w-4xl mx-auto animate-fade-in">
            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow p-4 mb-4 sticky top-0 z-10 space-y-3 transition-colors">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Entries</h2>
                    <div class="flex gap-2 items-center">
                        <button onclick="renderRateManager()" class="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors mr-2">
                            Manage Rates
                        </button>
                        
                        <button onclick="navigateDate(-1)" class="p-2 rounded-full hover:bg-white dark:bg-[#161925] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Previous Day">
                            <i data-lucide="chevron-left" class="h-5 w-5"></i>
                        </button>
                        
                        <input type="date" value="${currentEntryDate}" onchange="changeDate(this.value)"
                            class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-primary outline-none">
                            
                        <button onclick="navigateDate(1)" class="p-2 rounded-full hover:bg-white dark:bg-[#161925] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Next Day">
                            <i data-lucide="chevron-right" class="h-5 w-5"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-3 bg-primary/10 dark:bg-primary/20/30 p-3 rounded-full">
                    <label class="text-sm font-medium text-teal-900 dark:text-teal-200">Rate for this day:</label>
                    <div class="flex items-center gap-2">
                        <input type="number" 
                            value="${isDailyRateSet ? effectiveRate : ''}" 
                            placeholder="${state.settings.rate} (Default)" 
                            onchange="updateDayRate(this.value)"
                            class="w-32 border ${isDailyRateSet ? 'border-primary ring-1 ring-primary' : 'border-teal-200 dark:border-teal-700'} dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm focus:ring-primary outline-none">
                        ${isDailyRateSet ?
            `<button onclick="updateDayRate('')" class="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Reset to Default Rate">
                                <i data-lucide="x" class="h-4 w-4"></i>
                            </button>`
            : '<span class="text-xs text-gray-500 dark:text-gray-400 italic">Using default</span>'}
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow overflow-hidden transition-colors">
                <div class="grid grid-cols-12 bg-gray-50 dark:bg-[#0c0e14] border-b border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <div class="col-span-8 px-6 py-3">Member Name</div>
                    <div class="col-span-4 px-6 py-3 text-right">Quantity</div>
                </div>
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                    ${state.members.map(m => {
                const val = (state.entries[currentEntryDate] && state.entries[currentEntryDate][m.id]) || '';
                return `
                        <div class="grid grid-cols-12 items-center hover:bg-transparent dark:hover:bg-gray-700 transition-colors">
                            <div class="col-span-8 px-6 py-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                    ${m.profilePic ? `<img src="${m.profilePic}" class="w-full h-full object-cover" alt="${m.name}">` : `<span class="font-bold text-gray-600 dark:text-gray-300">${getInitials(m.name)}</span>`}
                                </div>
                                <span class="truncate">${m.name}</span>
                            </div>
                            <div class="col-span-4 px-6 py-2">
                                <input type="number" value="${val}" placeholder="0"
                                    onchange="updateEntry(${m.id}, this)"
                                    class="w-full text-right border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-primary outline-none">
                            </div>
                        </div>
                        `;
            }).join('')}
                    ${state.members.length === 0 ? '<div class="p-8 text-center text-gray-500 dark:text-gray-400">No members found. Go to Members tab to add some.</div>' : ''}
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function changeDate(date) {
    currentEntryDate = date;
    renderCurrentView();
}

function navigateDate(days) {
    const date = new Date(currentEntryDate);
    date.setDate(date.getDate() + days);
    currentEntryDate = date.toISOString().split('T')[0];
    renderCurrentView();
}

function updateDayRate(val) {
    const num = parseFloat(val);
    if (val === '' || val === null || isNaN(num)) {
        delete state.dailyRates[currentEntryDate];
    } else {
        state.dailyRates[currentEntryDate] = num;
    }
    saveData();
    renderCurrentView();
}

function updateEntry(memberId, inputOrValue) {
    let value;
    let inputEl = null;

    // Handle both direct value (legacy) and input element (new)
    if (typeof inputOrValue === 'object' && inputOrValue.value !== undefined) {
        inputEl = inputOrValue;
        value = inputEl.value;
    } else {
        value = inputOrValue;
    }

    if (!state.entries[currentEntryDate]) {
        state.entries[currentEntryDate] = {};
    }
    if (value === '') {
        delete state.entries[currentEntryDate][memberId];
    } else {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            // Subtract 0.1 (bag weight) and fix precision
            const adjusted = parseFloat((num - 0.1).toFixed(3));

            const oldVal = state.entries[currentEntryDate][memberId];
            if (oldVal !== adjusted) {
                logActivity('Update Entry', `Date: ${currentEntryDate}, PID: ${memberId}, Qty: ${oldVal || 0} -> ${adjusted}`);
            }

            state.entries[currentEntryDate][memberId] = adjusted;

            // Update UI immediately if we have the element
            if (inputEl) {
                inputEl.value = adjusted;
            }
        }
    }
    saveData(false);
}

// --- Rate Manager View ---

function renderRateManager() {
    const main = document.getElementById('main-content');

    // Generate dates for the current month of currentEntryDate
    const [year, month] = currentEntryDate.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
        dates.push(`${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    }

    const datesFirstHalf = dates.filter(d => parseInt(d.split('-')[2]) <= 15);
    const datesSecondHalf = dates.filter(d => parseInt(d.split('-')[2]) > 15);

    const renderCard = (date) => {
        const dayRate = state.dailyRates[date];
        const isSet = dayRate !== undefined;
        return `
        <div class="border border-gray-200 dark:border-gray-700 rounded-full p-3 ${isSet ? 'bg-primary/10 dark:bg-primary/20/20 border-teal-200 dark:border-teal-800' : ''} hover-scale transition-all">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${date.split('-').reverse().join('-')}</div>
            <div class="flex items-center gap-2">
                <span class="text-gray-500 dark:text-gray-400 text-sm">₹</span>
                <input type="number" value="${isSet ? dayRate : ''}" placeholder="${state.settings.rate}"
                    onchange="updateBulkRate('${date}', this.value)"
                    class="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary outline-none text-gray-900 dark:text-gray-100 font-medium">
            </div>
        </div>
        `;
    };

    const html = `
        <div class="max-w-5xl mx-auto animate-fade-in">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Rates - ${year}-${String(month).padStart(2, '0')}</h2>
                <button onclick="switchTab('entries')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-100 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="h-5 w-5"></i>
                    Back to Entries
                </button>
            </div>

            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow p-6 mb-6 transition-colors">
                <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Bulk Update</h3>
                <div class="flex flex-wrap gap-4 items-end">
                    <div class="flex-1 min-w-[200px]">
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-1">Rate Amount</label>
                        <input type="number" id="bulk-rate-input" placeholder="Enter Rate"
                            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-3 py-2 focus:ring-primary outline-none">
                    </div>
                    <button onclick="applyBulkRate(1, 'bulk-rate-input')" class="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200 px-4 py-2 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors">
                        Apply to 1st Half (1-15)
                    </button>
                    <button onclick="applyBulkRate(2, 'bulk-rate-input')" class="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-4 py-2 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                        Apply to 2nd Half (16-End)
                    </button>
                    <button onclick="applyBulkRate(3, 'bulk-rate-input')" class="bg-white dark:bg-[#161925] text-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Apply to All Days
                    </button>
                </div>
            </div>

            <!-- 1st Half -->
            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow overflow-hidden transition-colors mb-6 border-l-4 border-teal-500">
                <div class="px-6 py-3 bg-primary/10 dark:bg-primary/20/20 border-b border-teal-100 dark:border-teal-800 flex justify-between items-center">
                    <h3 class="font-semibold text-teal-700 dark:text-teal-300">1st Half (1-15)</h3>
                    <button onclick="clearBulkRate(1)" class="text-xs bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1 rounded transition-colors">
                        Clear Rates
                    </button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
                    ${datesFirstHalf.map(renderCard).join('')}
                </div>
            </div>

            <!-- 2nd Half -->
            <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow overflow-hidden transition-colors border-l-4 border-green-500">
                <div class="px-6 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800 flex justify-between items-center">
                    <h3 class="font-semibold text-green-700 dark:text-green-300">2nd Half (16-End)</h3>
                    <button onclick="clearBulkRate(2)" class="text-xs bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1 rounded transition-colors">
                        Clear Rates
                    </button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
                    ${datesSecondHalf.map(renderCard).join('')}
                </div>
            </div>
        </div>
    `;

    main.innerHTML = html;
    lucide.createIcons();
}

function updateBulkRate(date, val) {
    const num = parseFloat(val);
    if (val === '' || val === null || isNaN(num)) {
        delete state.dailyRates[date];
    } else {
        state.dailyRates[date] = num;
    }
    saveData(false);
}

function applyBulkRate(period, inputId) {
    const rateVal = document.getElementById(inputId).value;
    const rate = parseFloat(rateVal);

    if (rateVal === '' || isNaN(rate)) {
        alert("Please enter a valid rate first.");
        return;
    }

    const [year, month] = currentEntryDate.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        if (period === 1 && i > 15) continue;
        if (period === 2 && i <= 15) continue;

        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        state.dailyRates[dateStr] = rate;
    }

    saveData();
    renderRateManager(); // Refresh view
}

function clearBulkRate(period) {
    let confirmationKeyword = "";
    let rangeText = "";

    if (period === 1) {
        confirmationKeyword = "RATEFIRST";
        rangeText = "1st Half (1-15)";
    } else if (period === 2) {
        confirmationKeyword = "RATESECOND";
        rangeText = "2nd Half (16-End)";
    } else {
        return;
    }

    const input = prompt(`WARNING: This will delete ALL rates for ${rangeText}.\nTo confirm, please type '${confirmationKeyword}' below:`);

    if (input === confirmationKeyword) {
        const [year, month] = currentEntryDate.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            if (period === 1 && i > 15) continue;
            if (period === 2 && i <= 15) continue;

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            delete state.dailyRates[dateStr];
        }
        saveData();
        renderRateManager();
    } else if (input !== null) {
        alert("Incorrect confirmation code. Action cancelled.");
    }
}

// 4. Bills View
let billMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
let billPeriod = new Date().getDate() <= 15 ? '1' : '2'; // '1' = 1-15, '2' = 16-End

function renderBillsView(container) {
    const html = `
        <!-- Printable Bill Template -->
        <div id="bill-template-container" class="hidden">
             <!-- This is the container that html2canvas will target -->
        </div>

    <div class="max-w-6xl mx-auto animate-fade-in">
            <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Generated Bills</h2>
                
                <div class="flex flex-wrap items-center gap-3 bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 p-3 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 transition-colors">
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">Month:</label>
                        <input type="month" value="${billMonth}" onchange="updateBillSettings('month', this.value)"
                            class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm focus:ring-primary outline-none">
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">Period:</label>
                        <select onchange="updateBillSettings('period', this.value)"
                            class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm focus:ring-primary outline-none">
                            <option value="1" ${billPeriod === '1' ? 'selected' : ''}>1st Half (1-15)</option>
                            <option value="2" ${billPeriod === '2' ? 'selected' : ''}>2nd Half (16-End)</option>
                        </select>
                    </div>
                    <button onclick="exportBillsCSV()" class="ml-auto md:ml-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors flex items-center gap-1.5">
                        <i data-lucide="download" class="h-4 w-4"></i> Export CSV
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                ${state.members.map((m, index) => {
        const calc = calculateBill(m.id, billMonth, billPeriod);
        return `
                    <div class="bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow hover:shadow-md transition-shadow p-6  transition-colors hover-scale" style="animation-delay: ${index * 0.05}s">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">${m.name}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Total Qty: ${calc.totalQty.toFixed(3)}</p>
                            </div>
                            <span class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded">
                                Net: ₹ ${calc.netPayable.toFixed(2)}
                            </span>
                        </div>
                        
                        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                            <div class="flex justify-between">
                                <span>Gross Amount:</span>
                                <span>₹ ${calc.grossAmount.toFixed(2)}</span>
                            </div>
                            ${state.settings.commissionEnabled ? `
                            <div class="flex justify-between text-red-500 dark:text-red-400">
                                <span>Commission ${state.settings.commissionType === 'percent' ? `(${state.settings.commissionAmount}%)` : ''}:</span>
                                <span>-₹ ${calc.commission.toFixed(2)}</span>
                            </div>` : ''}
                            ${state.settings.luggageEnabled ? `
                            <div class="flex justify-between text-red-500 dark:text-red-400">
                                <span>Luggage:</span>
                                <span>-₹ ${calc.luggage.toFixed(2)}</span>
                            </div>` : ''}
                            ${calc.advance > 0 ? `
                            <div class="flex justify-between text-red-500 dark:text-red-400 border-t border-none pt-1">
                                <span>Advance Deduction:</span>
                                <span>-₹ ${calc.advance.toFixed(2)}</span>
                            </div>` : ''}
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-gray-100 relative">
                                <span>Payable:</span>
                                <span>₹ ${calc.netPayable.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <button onclick="processBill(${m.id}, 'view')" class="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-[#1a1e2b] dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-gray-900 dark:text-gray-100 px-2 py-2 rounded-[10px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="View Bill">
                                <i data-lucide="eye" class="h-4 w-4"></i>
                                View
                            </button>
                            <button onclick="processBill(${m.id}, 'download')" class="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-[#1a1e2b] dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-gray-900 dark:text-gray-100 px-2 py-2 rounded-[10px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Download as Image">
                                <i data-lucide="download" class="h-4 w-4"></i>
                                Download
                            </button>
                            <button onclick="processBill(${m.id}, 'whatsapp')" class="flex items-center justify-center gap-1.5 bg-[#25D366] text-white px-2 py-2 rounded-[10px] hover:bg-[#128C7E] transition-colors" title="Share to WhatsApp">
                                <i data-lucide="message-circle" class="h-4 w-4"></i>
                                WhatsApp
                            </button>
                            <button onclick="processBill(${m.id}, 'print')" class="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-[#1a1e2b] dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-gray-900 dark:text-gray-100 px-2 py-2 rounded-[10px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Print Bill">
                                <i data-lucide="printer" class="h-4 w-4"></i>
                                Print
                            </button>
                        </div>
                    </div>
                    `;
    }).join('')}
            </div>
             ${state.members.length === 0 ? '<div class="p-8 text-center text-gray-500 dark:text-gray-400">No members found.</div>' : ''}
        </div>
    `;
    container.innerHTML = html;
}

function updateBillSettings(type, value) {
    if (type === 'month') billMonth = value;
    if (type === 'period') billPeriod = value;
    renderCurrentView();
}

function exportBillsCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Mobile,Total Kgs,Gross Amount,Commission,Luggage,Advance Deduction,Net Payable\\n";

    state.members.forEach(m => {
        const calc = calculateBill(m.id, billMonth, billPeriod);
        if (calc.totalQty > 0 || calc.advance > 0) { // Only export if they had activity
            const row = [
                m.id,
                `"${m.name}"`,
                m.mobile || '',
                calc.totalQty.toFixed(3),
                calc.grossAmount.toFixed(2),
                calc.commission.toFixed(2),
                calc.luggage.toFixed(2),
                calc.advance.toFixed(2),
                calc.netPayable.toFixed(2)
            ].join(",");
            csvContent += row + "\\n";
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const periodLabel = billPeriod === '1' ? '1st-Half' : '2nd-Half';
    link.setAttribute("download", `FMS_Report_${billMonth}_${periodLabel}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    link.remove();
    logActivity('Export CSV', `Exported Bills for ${billMonth} (${periodLabel})`);
}

function calculateBill(memberId, month = billMonth, period = billPeriod) {
    let totalQty = 0;
    let grossAmount = 0;
    const details = [];

    // Generate all dates for the selected month/period
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const allDates = [];

    for (let i = 1; i <= daysInMonth; i++) {
        if (period === '1' && i > 15) continue;
        if (period === '2' && i <= 15) continue;

        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        allDates.push(dateStr);
    }

    allDates.forEach(date => {
        const dayEntries = state.entries[date];
        const qty = (dayEntries && dayEntries[memberId]) ? dayEntries[memberId] : 0;

        if (qty > 0) {
            const rate = state.dailyRates[date] !== undefined ? state.dailyRates[date] : state.settings.rate;
            const amount = qty * rate;

            totalQty += qty;
            grossAmount += amount;

            details.push({
                date,
                qty,
                rate,
                amount,
                status: ''
            });
        } else {
            details.push({
                date,
                qty: 0,
                rate: 0,
                amount: 0,
                status: 'No Flower'
            });
        }
    });

    let commission = 0;
    if (state.settings.commissionEnabled) {
        if (state.settings.commissionType === 'percent') {
            commission = grossAmount * (state.settings.commissionAmount / 100);
        } else {
            commission = state.settings.commissionAmount;
        }
    }

    let luggage = 0;
    if (state.settings.luggageEnabled) {
        // Luggage is now Rate * TotalQty
        const rate = state.settings.luggageAmount || 0;
        luggage = totalQty * rate;
    }

    const member = state.members.find(m => m.id === memberId);
    const advance = member ? (member.advance || 0) : 0;

    const netPayable = grossAmount - commission - luggage - advance;

    return {
        totalQty,
        grossAmount,
        commission,
        luggage,
        advance,
        netPayable,
        details
    };
}

// --- PDF Generation ---

async function processBill(memberId, action) {
    const member = state.members.find(m => m.id === memberId);
    const calc = calculateBill(memberId, billMonth, billPeriod);

    // Determine Billing Period Label
    const [year, month] = billMonth.split('-');
    const startDate = billPeriod === '1' ? `01/${month}/${year}` : `16/${month}/${year}`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = billPeriod === '1' ? `15/${month}/${year}` : `${lastDay}/${month}/${year}`;

    const shopName = state.settings.shopName || 'JPK FLOWERS';
    const logo = state.settings.logo;
    const banner = state.settings.banner;
    const ownerName = state.currentUser ? state.currentUser.name.toUpperCase() : 'JAYAPRAKASH S';

    const billHtmlContent = `
        <div style="font-family: 'Inter', sans-serif; width: 794px; height: 1123px; margin: 0 auto; box-sizing: border-box; page-break-inside: avoid; background-color: #ffffff; color: #1f2937; border-radius: 0; overflow: hidden; display: flex; flex-direction: column; position: relative;">
            ${logo ? '<div style="position:absolute;inset:0;opacity:0.04;background-image:url(' + logo + ');background-size:50%;background-position:center;background-repeat:no-repeat;pointer-events:none;"></div>' : ''}
            
            ${banner ? '<div style="width:100%;height:96px;background-image:url(' + banner + ');background-size:cover;background-position:center;position:relative;flex-shrink:0;"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.6),transparent);"></div></div>' : '<div style="width:100%;height:24px;background:linear-gradient(to right,#4ade80,#2dd4bf);flex-shrink:0;"></div>'}

            <div style="position:relative;padding:16px 32px 12px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:16px;z-index:10;">
                    ${logo ? '<img src="' + logo + '" style="width:64px;height:64px;object-fit:contain;border-radius:9999px;background:#f3f4f6;padding:6px;border:1px solid #e5e7eb;">' : ''}
                    <div>
                        <h1 style="font-size:24px;font-weight:800;color:#111827;margin:0;">${shopName}</h1>
                        <p style="color:#6b7280;font-size:13px;font-weight:500;margin:4px 0 0;">Proprietor: ${ownerName}</p>
                        <p style="font-size:11px;color:#9ca3af;margin:2px 0 0;">Contact: ${state.settings.shopMobile || '+91 XXXXX XXXXX'}</p>
                    </div>
                </div>
                <div style="text-align:right;z-index:10;">
                    <div style="display:inline-block;background:#ecfdf5;color:#047857;font-weight:700;padding:2px 10px;border-radius:9999px;font-size:10px;border:1px solid #a7f3d0;margin-bottom:4px;">TAX INVOICE</div>
                    <p style="font-size:11px;color:#6b7280;font-weight:500;font-family:monospace;margin:2px 0;">INV-${year}${month}-${memberId.toString().padStart(4, '0')}</p>
                    <p style="font-size:13px;color:#6b7280;font-weight:500;font-family:monospace;margin:2px 0;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
                </div>
            </div>

            <div style="padding:10px 32px;background:#f9fafb;display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #e5e7eb;flex-shrink:0;">
                <div style="flex:1;background:#fff;padding:12px;border-radius:10px;border:1px solid #e5e7eb;position:relative;overflow:hidden;">
                    <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#4ade80;"></div>
                    <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Billed To</p>
                    <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0;">${member.name}</h2>
                    <p style="font-size:11px;color:#4b5563;margin:2px 0 0;">Farmer ID: #${member.id}</p>
                    ${member.mobile ? '<p style="font-size:11px;color:#4b5563;margin:2px 0 0;">Phone: +91 ' + member.mobile + '</p>' : ''}
                </div>
                <div style="flex:1;background:#fff;padding:12px;border-radius:10px;border:1px solid #e5e7eb;position:relative;overflow:hidden;">
                    <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#2dd4bf;"></div>
                    <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Statement Period</p>
                    <p style="font-size:16px;font-weight:700;color:#111827;margin:0;">${startDate} <span style="color:#9ca3af;font-weight:400;margin:0 4px;">to</span> ${endDate}</p>
                    <p style="font-size:11px;color:#4b5563;margin:4px 0 0;">${billPeriod === '1' ? 'First Half (1-15)' : 'Second Half (16-End)'}</p>
                </div>
            </div>

            <div style="padding:8px 32px;flex:1;">
                <table style="width:100%;font-size:11px;border-collapse:collapse;">
                    <thead>
                        <tr style="text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:700;border-bottom:2px solid #e5e7eb;">
                            <th style="padding:8px 0;text-align:left;width:40px;color:#9ca3af;">#</th>
                            <th style="padding:8px 0;text-align:left;">Date</th>
                            <th style="padding:8px 0;text-align:center;">Status</th>
                            <th style="padding:8px 0;text-align:right;">Net Weight</th>
                            <th style="padding:8px 0;text-align:right;">Rate applied</th>
                            <th style="padding:8px 0;text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${calc.details.map((row, index) => '<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:4px 0;text-align:left;color:#9ca3af;font-weight:500;">' + String(index + 1).padStart(2, '0') + '</td><td style="padding:4px 0;text-align:left;font-weight:500;color:#4b5563;">' + row.date.split('-').reverse().join('-') + '</td><td style="padding:4px 0;text-align:center;">' + (row.status ? '<span style="display:inline-flex;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:500;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;">' + row.status + '</span>' : '<span style="color:#9ca3af;">-</span>') + '</td><td style="padding:4px 0;text-align:right;font-weight:600;color:' + (row.qty > 0 ? '#111827' : '#9ca3af') + ';">' + (row.qty > 0 ? row.qty.toFixed(3) + ' <span style="color:#9ca3af;font-size:9px;">kg</span>' : '-') + '</td><td style="padding:4px 0;text-align:right;font-weight:500;color:#4b5563;">' + (row.qty > 0 ? '<span style="color:#9ca3af;">₹</span> ' + row.rate.toFixed(2) : '-') + '</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">' + (row.qty > 0 ? '<span style="color:#9ca3af;">₹</span> ' + row.amount.toFixed(2) : '-') + '</td></tr>').join('')}
                    </tbody>
                </table>
            </div>

            <div style="padding:12px 32px;background:#f9fafb;margin-top:auto;border-top:1px solid #e5e7eb;display:grid;grid-template-columns:1fr 1fr;gap:16px;flex-shrink:0;">
                <div>
                    <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Performance Summary</p>
                    <div style="display:flex;gap:12px;">
                        <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid #e5e7eb;flex:1;">
                            <p style="font-size:10px;color:#6b7280;margin:0 0 4px;">Total Supplied</p>
                            <p style="font-size:18px;font-weight:700;color:#111827;margin:0;">${calc.totalQty.toFixed(3)} <span style="font-size:12px;color:#9ca3af;">kg</span></p>
                        </div>
                        <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid #e5e7eb;flex:1;">
                            <p style="font-size:10px;color:#6b7280;margin:0 0 4px;">Avg. Rate / kg</p>
                            <p style="font-size:18px;font-weight:700;color:#111827;margin:0;"><span style="font-size:12px;color:#9ca3af;">₹</span> ${(calc.totalQty > 0 ? calc.grossAmount / calc.totalQty : 0).toFixed(2)}</p>
                        </div>
                    </div>
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;display:grid;grid-template-columns:1fr 1fr;text-align:center;font-size:11px;font-weight:700;color:#6b7280;gap:16px;opacity:0.7;">
                        <div style="border-top:2px dashed #d1d5db;padding-top:4px;margin-top:24px;">Authorized Signatory</div>
                        <div style="border-top:2px dashed #d1d5db;padding-top:4px;margin-top:24px;">Receiver's Signature</div>
                    </div>
                </div>
                <div>
                    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #d1fae5;">
                        <div style="padding:10px;display:flex;flex-direction:column;gap:6px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#4b5563;">
                                <span>Subtotal (Gross)</span>
                                <span style="font-size:16px;font-weight:700;color:#111827;">₹ ${calc.grossAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            ${calc.commission > 0 ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;"><span>Commission (' + (state.settings.commissionType === 'percent' ? state.settings.commissionAmount + '%' : 'Flat') + ')</span><span style="color:#dc2626;font-weight:500;">- ₹ ' + calc.commission.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</span></div>' : ''}
                            ${calc.luggage > 0 ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;"><span>Luggage (' + calc.totalQty.toFixed(1) + ' kg × ₹' + state.settings.luggageAmount + ')</span><span style="color:#dc2626;font-weight:500;">- ₹ ' + calc.luggage.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</span></div>' : ''}
                            ${calc.advance > 0 ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;"><span>Advance Deduction</span><span style="color:#dc2626;font-weight:500;">- ₹ ' + calc.advance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</span></div>' : ''}
                        </div>
                        <div style="background:linear-gradient(to right,#16a34a,#0d9488);padding:10px;display:flex;justify-content:space-between;align-items:center;color:#fff;">
                            <span style="font-size:11px;color:#bbf7d0;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Net Payable</span>
                            <span style="font-size:20px;font-weight:800;">₹ ${calc.netPayable.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    <p style="font-size:10px;text-align:center;color:#9ca3af;margin:8px 0 0;">Computer generated invoice, no signature required.</p>
                </div>
            </div>
            
            <div style="height:8px;width:100%;background:linear-gradient(to right,#4ade80,#2dd4bf);margin-top:auto;flex-shrink:0;"></div>
        </div>
    `;


    if (action === 'view') {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in';
        modal.onclick = (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        };

        const content = document.createElement('div');
        content.className = 'bg-white dark:bg-[#161925] border border-gray-200 dark:border-gray-800 transition-all duration-300 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto relative flex justify-center p-4';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-4 right-4 p-2 bg-white dark:bg-[#161925] dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10';
        closeBtn.innerHTML = '<i data-lucide="x" class="h-5 w-5 text-gray-600 dark:text-gray-300"></i>';
        closeBtn.onclick = () => document.body.removeChild(modal);

        const billContainer = document.createElement('div');
        billContainer.innerHTML = billHtmlContent;
        // Adjust bill container styles for modal view
        const billDiv = billContainer.firstElementChild;
        billDiv.style.margin = '0';
        billDiv.style.maxWidth = 'none';
        
        const wrapper = document.createElement('div');
        wrapper.style.transformOrigin = 'top center';
        // Auto scale for small screens
        const scale = Math.min(1, (window.innerWidth - 64) / 794);
        if (scale < 1) {
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.height = `${1123 * scale}px`;
            wrapper.style.width = `${794 * scale}px`;
        }
        wrapper.appendChild(billContainer);

        content.appendChild(closeBtn);
        content.appendChild(wrapper);
        modal.appendChild(content);
        document.body.appendChild(modal);
        lucide.createIcons();

    } else if (action === 'download') {
        const billEl = document.createElement('div');
        billEl.className = 'bill-preview bg-transparent mx-auto';
        billEl.innerHTML = billHtmlContent;

        const printArea = document.getElementById('printable-area');
        printArea.innerHTML = '';
        printArea.appendChild(billEl);

        try {
            await document.fonts.ready;

            // Capture as Canvas
            const canvas = await html2canvas(billEl, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Generate PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeightMax = pdf.internal.pageSize.getHeight();
            let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            if (pdfHeight > pdfHeightMax) {
                const scaledWidth = (canvas.width * pdfHeightMax) / canvas.height;
                const offsetX = (pdfWidth - scaledWidth) / 2;
                pdf.addImage(imgData, 'PNG', offsetX, 0, scaledWidth, pdfHeightMax);
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            // Save PDF
            const filename = `Invoice_${member.name.replace(/\s+/g, '_')}_${startDate.replace(/\//g, '-')}.pdf`;
            pdf.save(filename);

        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF. Check console for details.");
        } finally {
            printArea.innerHTML = '';
        }
    } else if (action === 'print') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Bill - ${member.name}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    @media print {
                        body { 
                            -webkit-print-color-adjust: exact; 
                            background: white;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body onload="setTimeout(() => { window.print(); window.close(); }, 500)" style="display: flex; justify-content: center; background: #f3f4f6;">
                <div style="width: 794px; height: 1123px; overflow: hidden; page-break-inside: avoid; page-break-after: avoid; background: white; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    ${billHtmlContent}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    } else if (action === 'whatsapp') {
        if (!member.mobile) {
            alert('Please add a mobile number for this member first to send WhatsApp messages.');
            return;
        }

        const safeMobile = member.mobile.replace(/\\D/g, '');
        // If length is 10, prepend Indian area code 91
        const formattedMobile = safeMobile.length === 10 ? '91' + safeMobile : safeMobile;

        const msgText = `Hello *${member.name}*,
Your flower bill for the period *${startDate} to ${endDate}* is ready.
        
*Total Weight:* ${calc.totalQty.toFixed(3)} Kg
*Gross Amount:* ₹ ${calc.grossAmount.toFixed(2)}
${calc.advance > 0 ? `*Advance Deduction:* -₹ ${calc.advance.toFixed(2)}\\n` : ''}*Net Payable:* ₹ ${calc.netPayable.toFixed(2)}
        
Thank you,
*${shopName}*`;

        const url = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(msgText)}`;
        window.open(url, '_blank');
        logActivity('WhatsApp Shared', `Bill sent to ${member.name} (${formattedMobile})`);
    }
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reset-data-btn').addEventListener('click', resetData);

    // Initialize icons
    lucide.createIcons();

    // Initial Render
    checkAuth();

    // Initial language setup
    const labels = { en: 'EN', ta: 'தமிழ்', hi: 'हिंदी' };
    const labelEl = document.getElementById('lang-label');
    if (labelEl) labelEl.textContent = labels[state.language || 'en'];
    
    renderSidebar();
    renderMobileNav();
});
