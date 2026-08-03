// i18n.js — simple two-language dictionary + helpers.
// Add data-i18n="key" to any element's text, or data-i18n-placeholder="key"
// for input placeholders, and applyTranslations() will fill them in.

const TRANSLATIONS = {
  en: {
    // Nav / header
    nav_inventory: 'Inventory',
    nav_contact: 'Contact',
    nav_admin: 'Admin',
    nav_view_site: 'View site ↗',
    admin_tagline: 'Admin Panel',

    // Hero
    hero_eyebrow: 'Curated Pre-Owned & New Arrivals',
    hero_title_1: 'Find your next car,',
    hero_title_2: 'fit for royalty.',
    hero_sub: "Every listing is handled personally — browse the inventory, then reach out directly to talk details and make the deal.",

    // Search panel
    search_label: 'Search',
    search_placeholder: 'Brand, model, keyword…',
    brand_label: 'Brand',
    brand_all: 'All brands',
    maxprice_label: 'Max price',
    minyear_label: 'Min year',
    search_btn: 'Search',
    any: 'Any',

    // Listings section
    current_inventory: 'Current Inventory',
    car_singular: 'car',
    car_plural: 'cars',
    no_photo: 'No photo yet',
    status_available: 'Available',
    status_reserved: 'Reserved',
    status_sold: 'Sold',
    empty_title: 'No cars match that search',
    empty_sub: 'Try widening your filters or check back soon — new arrivals are posted regularly.',

    // Contact section
    contact_title: 'Looking for something specific?',
    contact_sub: "Message Royal Auto directly and we'll help you track down the right car.",
    contact_btn: 'Contact Royal Auto',
    contact_general_msg: "Hi! I'd like to know more about Royal Auto's inventory.",

    // Detail modal
    spec_year: 'Year',
    spec_mileage: 'Mileage',
    spec_fuel: 'Fuel',
    spec_transmission: 'Transmission',
    spec_color: 'Color',
    spec_status: 'Status',
    no_description: 'No additional description provided.',
    btn_whatsapp: 'Message on WhatsApp',
    btn_call: 'Call',
    whatsapp_interest_msg: "Hi! I'm interested in the {title} ({year}) listed for {price} on Royal Auto.",

    // Admin — login
    admin_signin_title: 'Admin sign-in',
    admin_signin_sub: 'Manage Royal Auto listings.',
    admin_username: 'Username',
    admin_password: 'Password',
    admin_signin_btn: 'Sign in',
    admin_login_error: 'Invalid username or password.',
    admin_logout: 'Log out',

    // Admin — listings
    admin_listings_title: 'Listings',
    admin_add_new: '+ Add new car',
    admin_edit_title: 'Edit car',
    admin_add_title: 'Add new car',
    admin_field_title: 'Listing title',
    admin_field_brand: 'Brand',
    admin_field_model: 'Model',
    admin_field_year: 'Year',
    admin_field_price: 'Price (TND)',
    admin_field_mileage: 'Mileage (km)',
    admin_field_fuel: 'Fuel',
    admin_field_transmission: 'Transmission',
    admin_field_color: 'Color',
    admin_field_status: 'Status',
    admin_field_phone: 'Phone (for calls)',
    admin_field_whatsapp: 'WhatsApp number',
    admin_field_description: 'Description',
    admin_field_photos: 'Photos',
    admin_select: 'Select…',
    admin_fuel_petrol: 'Petrol',
    admin_fuel_diesel: 'Diesel',
    admin_fuel_hybrid: 'Hybrid',
    admin_fuel_electric: 'Electric',
    admin_trans_manual: 'Manual',
    admin_trans_auto: 'Automatic',
    admin_save: 'Save listing',
    admin_cancel: 'Cancel',
    admin_table_year: 'Year',
    admin_table_price: 'Price',
    admin_table_status: 'Status',
    admin_table_posted: 'Posted',
    admin_edit_btn: 'Edit',
    admin_delete_btn: 'Delete',
    admin_no_listings: 'No listings yet — add your first car above.',
    admin_delete_confirm: 'Delete this listing? This cannot be undone.',
    admin_toast_added: 'Listing added',
    admin_toast_updated: 'Listing updated',
    admin_toast_deleted: 'Listing deleted',
    admin_toast_error: 'Something went wrong',
    admin_toast_delete_error: 'Could not delete listing',
  },
  fr: {
    nav_inventory: 'Véhicules',
    nav_contact: 'Contact',
    nav_admin: 'Admin',
    nav_view_site: 'Voir le site ↗',
    admin_tagline: 'Panneau Admin',

    hero_eyebrow: 'Sélection de véhicules d\u2019occasion et nouveautés',
    hero_title_1: 'Trouvez votre prochaine voiture,',
    hero_title_2: 'digne d\u2019un roi.',
    hero_sub: "Chaque annonce est gérée personnellement — parcourez le catalogue, puis contactez-nous directement pour discuter et conclure la vente.",

    search_label: 'Recherche',
    search_placeholder: 'Marque, modèle, mot-clé…',
    brand_label: 'Marque',
    brand_all: 'Toutes les marques',
    maxprice_label: 'Prix max',
    minyear_label: 'Année min',
    search_btn: 'Rechercher',
    any: 'Peu importe',

    current_inventory: 'Véhicules disponibles',
    car_singular: 'voiture',
    car_plural: 'voitures',
    no_photo: 'Aucune photo',
    status_available: 'Disponible',
    status_reserved: 'Réservée',
    status_sold: 'Vendue',
    empty_title: 'Aucun véhicule ne correspond',
    empty_sub: 'Essayez d\u2019élargir vos filtres, ou revenez bientôt — de nouvelles annonces sont ajoutées régulièrement.',

    contact_title: 'Vous cherchez un modèle précis ?',
    contact_sub: 'Contactez Royal Auto directement et nous vous aiderons à trouver la voiture idéale.',
    contact_btn: 'Contacter Royal Auto',
    contact_general_msg: "Bonjour ! J'aimerais en savoir plus sur les véhicules disponibles chez Royal Auto.",

    spec_year: 'Année',
    spec_mileage: 'Kilométrage',
    spec_fuel: 'Carburant',
    spec_transmission: 'Transmission',
    spec_color: 'Couleur',
    spec_status: 'Statut',
    no_description: 'Aucune description supplémentaire.',
    btn_whatsapp: 'Contacter sur WhatsApp',
    btn_call: 'Appeler',
    whatsapp_interest_msg: "Bonjour ! Je suis intéressé(e) par la {title} ({year}) affichée à {price} sur Royal Auto.",

    admin_signin_title: 'Connexion admin',
    admin_signin_sub: 'Gérez les annonces de Royal Auto.',
    admin_username: 'Nom d\u2019utilisateur',
    admin_password: 'Mot de passe',
    admin_signin_btn: 'Se connecter',
    admin_login_error: 'Nom d\u2019utilisateur ou mot de passe invalide.',
    admin_logout: 'Déconnexion',

    admin_listings_title: 'Annonces',
    admin_add_new: '+ Ajouter une voiture',
    admin_edit_title: 'Modifier la voiture',
    admin_add_title: 'Ajouter une voiture',
    admin_field_title: 'Titre de l\u2019annonce',
    admin_field_brand: 'Marque',
    admin_field_model: 'Modèle',
    admin_field_year: 'Année',
    admin_field_price: 'Prix (TND)',
    admin_field_mileage: 'Kilométrage (km)',
    admin_field_fuel: 'Carburant',
    admin_field_transmission: 'Transmission',
    admin_field_color: 'Couleur',
    admin_field_status: 'Statut',
    admin_field_phone: 'Téléphone (appels)',
    admin_field_whatsapp: 'Numéro WhatsApp',
    admin_field_description: 'Description',
    admin_field_photos: 'Photos',
    admin_select: 'Choisir…',
    admin_fuel_petrol: 'Essence',
    admin_fuel_diesel: 'Diesel',
    admin_fuel_hybrid: 'Hybride',
    admin_fuel_electric: 'Électrique',
    admin_trans_manual: 'Manuelle',
    admin_trans_auto: 'Automatique',
    admin_save: 'Enregistrer',
    admin_cancel: 'Annuler',
    admin_table_year: 'Année',
    admin_table_price: 'Prix',
    admin_table_status: 'Statut',
    admin_table_posted: 'Publiée',
    admin_edit_btn: 'Modifier',
    admin_delete_btn: 'Supprimer',
    admin_no_listings: 'Aucune annonce pour l\u2019instant — ajoutez votre première voiture ci-dessus.',
    admin_delete_confirm: 'Supprimer cette annonce ? Cette action est irréversible.',
    admin_toast_added: 'Annonce ajoutée',
    admin_toast_updated: 'Annonce mise à jour',
    admin_toast_deleted: 'Annonce supprimée',
    admin_toast_error: 'Une erreur est survenue',
    admin_toast_delete_error: 'Impossible de supprimer l\u2019annonce',
  },
};

function getLang() {
  return localStorage.getItem('royalAutoLang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('royalAutoLang', lang);
  document.documentElement.lang = lang;
}

function t(key, vars) {
  const lang = getLang();
  let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

// Fills in every element tagged with data-i18n / data-i18n-placeholder
// based on the current language. Call again after switching languages.
function applyTranslations() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === getLang());
  });
}

function initLangToggle() {
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.getAttribute('data-lang-btn'));
      applyTranslations();
      if (typeof onLanguageChanged === 'function') onLanguageChanged();
    });
  });
  applyTranslations();
}
