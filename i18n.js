const dictEnToTa = {
    // Nav & Sidebar
    "Dashboard": "முகப்பு (Dashboard)",
    "Daily Entries": "தினசரி உள்ளீடுகள்",
    "Members": "உறுப்பினர்கள்",
    "Settings & Rates": "விலை அமைப்புகள்",
    "Generate Bills": "ரசீதுகள் (Bills)",
    "Profile": "சுயவிவரம் (Profile)",
    "Logout": "வெளியேறு (Logout)",
    "Reset Data": "தரவை அழி (Reset)",
    "Search members by name or ID...": "பெயர் அல்லது எண் மூலம் தேடுக...",
    "Dash": "முகப்பு",
    "Entries": "உள்ளீடு",
    "Rates": "விலை",
    "Bills": "ரசீது",
    
    // Dashboard View
    "Total Members": "மொத்த உறுப்பினர்கள்",
    "Total Today's Weight (kg)": "இன்றைய எடை (கி.கி)",
    "Today's Rate / kg": "இன்றைய நிலை விலை / கி.கி",
    "Total Earned (Current Period)": "மொத்த வருமானம்",
    "Recent Members": "சமீபத்திய உறுப்பினர்கள்",
    "No members found.": "எந்த உறுப்பினரும் இல்லை.",
    
    // Entries View
    "Daily Data Entry": "தினசரி பதிவு",
    "Date:": "தேதி:",
    "Add / Update Entry": "பதிவு செய்",
    "Search member...": "உறுப்பினரைத் தேடுக...",
    "Net Weight (kg)": "நிகர எடை (கி.கி)",
    "Submit Multiple": "சமர்ப்பி",
    "Save Single": "சேமி",
    "Today's Entries": "இன்றைய பதிவுகள்",
    "Member": "உறுப்பினர்",
    "Quantity (kg)": "எடை (கி.கி)",
    "Amount": "தொகை (ரூ)",
    "Actions": "செயல்கள்",
    
    // Manage Rates View
    "Manage Rates - ": "விலை மேலாண்மை - ",
    "Back to Entries": "உள்ளீடுகளுக்கு திரும்புக",
    "Bulk Update": "ஒட்டுமொத்த விலை பதிவு",
    "Rate Amount": "மதிப்பு (ரூ)",
    "Apply to 1st Half (1-15)": "மாத முற்பகுதிக்கு (1-15)",
    "Apply to 2nd Half (16-End)": "மாத பிற்பகுதிக்கு (16-முடிவு)",
    "Apply to All Days": "அனைத்து நாட்களுக்கும்",
    "1st Half (1-15)": "முற்பகுதி (1-15)",
    "2nd Half (16-End)": "பிற்பகுதி (16-முடிவு)",
    "Clear Rates": "அழி",
    
    // Members View
    "Manage Members": "உறுப்பினர்கள் மேலாண்மை",
    "Add New Member": "புதிய உறுப்பினர் சேர்க்க",
    "Bulk Import (CSV)": "உள்ளேற்று (CSV)",
    "Search...": "தேடுக...",
    "Farmer ID": "விவசாயி எண்",
    "Total Supply": "மொத்த எடை",
    "Added": "சேர்க்கப்பட்ட தேதி",
    
    // Profile View
    "Update Logo/Banner": "படம் மாற்று",
    "Reset Platform Data": "அனைத்தையும் அழிக்கவும்",
    "Full Name": "முழு பெயர்",
    "Password": "கடவுச்சொல்",
    "Leave blank to keep unchanged": "மாற்ற வேண்டாமெனில் காலியாக விடவும்",
    "Update Profile": "சுயவிவரத்தைப் புதுப்பி",
    "WARNING: This will delete ALL data permanently.": "எச்சரிக்கை: இது அனைத்தையும் அழித்துவிடும்.",
    
    // Bills View
    "Generate Billing Statements": "ரசீதுகளை உருவாக்கு",
    "Month": "மாதம்",
    "Billing Period": "காலம்",
    "Generate": "உருவாக்கு",
    "Select a month and billing period to view generated bills.": "மாதம் மற்றும் காலத்தை தேர்வு செய்க.",
    "Export All to CSV": "PDF தரவிறக்கம் (CSV)",
    
    "Statement Period": "மாத காலம்",
    "Billed To": "பெயர்",
    "Farmer ID:": "உழவர் எண்:",
    "Phone:": "மொபைல்:",
    "Status": "நிலை",
    "Net Weight": "எடை (கிலோ)",
    "Rate applied": "விலை அமை (ரூ)",
    "Performance Summary": "செயல்திறன் சுருக்கம்",
    "Total Supplied": "மொத்தம்",
    "Avg. Rate / kg": "சராசரி விலை / கி.கி",
    "Authorized Signatory": "கையொப்பம்",
    "Receiver's Signature": "பெறுபவர் கையொப்பம்",
    "Subtotal (Gross)": "மொத்தம் (ரூ)",
    "Commission": "கமிஷன்",
    "Luggage Charges": "பார்சல் கட்டணம்",
    "Advance Deduction": "முன்பணம் கழிப்பு",
    "Net Payable": "நிகர தொகை (ரூ)",
    "Computer generated invoice, no signature required.": "கணினி உருவாக்கிய ரசீது."
};

function getLanguage() {
    return localStorage.getItem('app_lang') || 'en';
}

function toggleLanguage() {
    const current = getLanguage();
    const next = current === 'en' ? 'ta' : 'en';
    localStorage.setItem('app_lang', next);
    location.reload();
}

function t(englishText) {
    if (getLanguage() === 'ta' && dictEnToTa[englishText]) {
        return dictEnToTa[englishText];
    }
    return englishText;
}

function applyDOMTranslations() {
    if (getLanguage() === 'en') {
        const ind = document.getElementById('lang-indicator');
        if(ind) ind.innerText = "EN / தமிழ்";
        return; // Default is English
    }
    
    const ind = document.getElementById('lang-indicator');
    if(ind) ind.innerText = "தமிழ் / EN";

    // Text nodes replacement strategy mapping DOM elements
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToReplace = [];

    while (node = walk.nextNode()) {
        const text = node.nodeValue.trim();
        if (text && dictEnToTa[text]) {
            nodesToReplace.push({ node, translated: dictEnToTa[text] });
        }
    }

    nodesToReplace.forEach(({ node, translated }) => {
        node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translated);
    });

    // Also replace placeholders for inputs
    const inputs = document.querySelectorAll('input[placeholder]');
    inputs.forEach(input => {
        const p = input.getAttribute('placeholder');
        if (dictEnToTa[p]) {
            input.setAttribute('placeholder', dictEnToTa[p]);
        }
    });
}

// Hook into MutationObserver to catch JS generated components like Modals, dynamically loaded views (Main Content)
document.addEventListener("DOMContentLoaded", () => {
    applyDOMTranslations();

    // Re-apply translations whenever Main Content or DOM generally changes (like switchTab doing innerHTML)
    const observer = new MutationObserver(() => {
        applyDOMTranslations();
    });
    
    // Observe body for modal additions and main-content for views
    observer.observe(document.body, { childList: true, subtree: true });
});
