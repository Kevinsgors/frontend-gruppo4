// Dashboard Admin JavaScript Functions

// Main initialization
document.addEventListener('DOMContentLoaded', function () {
    initializeMenus();
    initializeSectionNavigation();
    setupHomeDashboard();
    setupVisitsHistory();
    setupEmployeeBadgesHistory();
    setupVisitorBadgesHistory();
    setupLunchAreaBadgesHistory();
    setupEmployeePhoneDirectory();
    setupTodayVisits();
    setupFutureVisits();
    setupPeopleList();
    updatePeopleCount();    
    setupPresentPeopleTables(); // Initialize present people tables on load
    setupPresentPeople(); // Initialize present people section

    // Initialize dropdown arrow toggle functionality
    initializeDropdownArrows();

    // Attach the create person form submit handler here!
    const createPersonForm = document.getElementById('createPersonForm');
    if (createPersonForm) {        createPersonForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                const nome = String(document.getElementById("nome-crea-persona").value);
                const cognome = String(document.getElementById("cognome-crea-persona").value);
                const azienda = String(document.getElementById("azienda-crea-persona").value);
                const indirizzo = String(document.getElementById("indirizzo").value);
                const citta = String(document.getElementById("citta").value);
                const provincia = String(document.getElementById("provincia").value);
                const nazione = String(document.getElementById("nazione").value);
                const telefono = String(document.getElementById("telefono").value);
                const cellulare = String(document.getElementById("cellulare").value);
                let fax = String(document.getElementById("fax").value);
                fax = fax === "" ? null : fax;
 
                let pIva = String(document.getElementById("pIva").value);
                pIva = pIva === "" ? null : pIva;
 
                const cf = String(document.getElementById("cf").value);
                const mail = String(document.getElementById("mail-crea-persona").value);
                let dataAssunzione = document.getElementById("dataAssunzione").value;
 
                if (dataAssunzione === null || dataAssunzione === "") {
                    dataAssunzione = "1970-01-01";
                }
 
                const luogoNascita = String(document.getElementById("luogoNascita").value);
                const dataNascita = document.getElementById("dataNascita").value;
                const tipoDocumento = String(document.getElementById("tipoDocumento").value);
                const numeroDocumento = String(document.getElementById("numeroDocumento").value);
                const dataScadenzaDoc = document.getElementById("dataScadenzaDoc").value;
                const duvri = String(document.getElementById("duvri").checked);
                let numCentriCosto = Number(document.getElementById("numCentriCosto").value);
                numCentriCosto = numCentriCosto === 0 ? null : numCentriCosto;
 
                const flagDocPrivacy = document.getElementById("flagDocPrivacy").checked;
                const dataConsegnaDocPrivacy = document.getElementById("dataConsegnaDocPrivacy").value;
                const idRuolo = Number(document.getElementById("idRuolo").value);
 
                const requestBody = {
                    "idRuna": null,
                    "nome": nome,
                    "cognome": cognome,
                    "diminutivo": null,
                    "azienda": azienda,
                    "indirizzo": indirizzo,
                    "citta": citta,
                    "provincia": provincia,
                    "nazione": nazione,
                    "telefono": telefono,
                    "cellulare": cellulare,
                    "fax": fax,
                    "pIva": pIva,
                    "cf": cf,
                    "mail": mail,
                    "foto": null,
                    "dataAssunzione": dataAssunzione,
                    "matricola": null,
                    "idFiliale": null,
                    "idMansione": null,
                    "idDeposito": null,
                    "idRiferimento": null,
                    "visitatore": false,
                    "accessNumber": null,
                    "accessCount": null,
                    "accessUpdate": null,
                    "luogoNascita": luogoNascita,
                    "dataNascita": dataNascita,
                    "dataScadCertificato": null,
                    "preposto": null,
                    "antincendio": null,
                    "primoSoccorso": null,
                    "tipoDocumento": tipoDocumento,
                    "numeroDocumento": numeroDocumento,
                    "dataScadenzaDoc": dataScadenzaDoc,
                    "duvri": duvri,
                    "numCentriCosto": numCentriCosto,
                    "flagDocPrivacy": flagDocPrivacy,
                    "dataConsegnaDocPrivacy": dataConsegnaDocPrivacy,
                    "idRuolo": idRuolo
                };
 
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }
 
                const response = await fetch('http://localhost:8080/people', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
               
                // Show success message
                showPersonSuccessModal();
               
                // Reset form
                this.reset();
               
            } catch (error) {
                console.error('Error creating person:', error);
                showPersonErrorModal('Errore durante la creazione della persona. Per favore riprova.');
            }
        });
    }
});


// Setup Home Dashboard functionality
async function setupHomeDashboard() {
    try {
        // Initialize home dashboard tables
        initializeHomeDashboardTables();

        // Initialize present people tables
        setupPresentPeopleTables();
        
        // Setup navigation buttons
        setupHomeDashboardNavigation();
        
        // Load initial data if home section is visible
        const homeSection = document.getElementById('admin-home-section');
        if (homeSection && homeSection.classList.contains('active')) {
            await loadHomeDashboard();
        }
    } catch (error) {
        console.error('Error setting up home dashboard:', error);
    }
}

function initializeHomeDashboardTables() {
    // Initialize home today visits table (summary version)
    homeTodayVisitsTable = $('#homeTodayVisitsTable').DataTable({
       lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        searching: false,
        paging: false,
        info: false,
        ordering: false,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        columns: [
            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            {
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Data Fine',
                data: 'dataFine',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function (data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            }
        ]
    });

    // Initialize home future visits table (summary version)
    homeFutureVisitsTable = $('#homeFutureVisitsTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        searching: false,
        paging: false,
        info: false,
        ordering: false,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        columns: [
            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            {
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Data Fine',
                data: 'dataFine',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function (data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            }
        ]
    });
}

function setupHomeDashboardNavigation() {
    // Navigation for "Visualizza tutto" buttons
    const viewAllTodayBtn = document.getElementById('viewAllTodayBtn');
    const viewAllFutureBtn = document.getElementById('viewAllFutureBtn');
    const createUserBtn = document.getElementById('createUserBtn');

    if (viewAllTodayBtn) {
        viewAllTodayBtn.addEventListener('click', function() {
            // Navigate to today visits section
            showSection('admin-visualizza-elenco-visite-odierne-section');
            // Trigger the menu item click to load data
            const todayVisitsMenuItem = document.getElementById('visualizza-elenco-visite-odierne');
            if (todayVisitsMenuItem) {
                todayVisitsMenuItem.click();
            }
        });
    }

    if (viewAllFutureBtn) {
        viewAllFutureBtn.addEventListener('click', function() {
            // Navigate to future visits section
            showSection('admin-visualizza-elenco-visite-future-section');
            // Trigger the menu item click to load data
            const futureVisitsMenuItem = document.getElementById('visualizza-elenco-visite-future');
            if (futureVisitsMenuItem) {
                futureVisitsMenuItem.click();
            }
        });
    }

    if (createUserBtn) {
        createUserBtn.addEventListener('click', function() {
            // Navigate to create people section
            showSection('admin-visitatori-crea-persone-section');
        });
    }
}

async function loadHomeDashboard() {
    try {
        await Promise.all([
            loadHomeDashboardData()
        ]);
    } catch (error) {
        console.error('Error loading home dashboard:', error);
    }
}

async function loadHomeDashboardData() {
    try {
        const response = await fetch('http://localhost:8080/visit', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allVisits = await response.json();

        // Filter visits for today
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const todayVisits = allVisits.filter(visit => {
            if (!visit.dataInizio) return false;
            const visitDate = new Date(visit.dataInizio).toISOString().split('T')[0];
            return visitDate === todayString;
        });

        // Filter visits for future dates
        const futureVisits = allVisits.filter(visit => {
            if (!visit.dataInizio) return false;
            const visitDate = new Date(visit.dataInizio).toISOString().split('T')[0];
            return visitDate > todayString;
        });

        // Populate home tables with limited data (first 5 entries)
        homeTodayVisitsTable.clear().rows.add(todayVisits.slice(0, 5)).draw();
        homeFutureVisitsTable.clear().rows.add(futureVisits.slice(0, 5)).draw();

    } catch (error) {
        console.error('Error loading home dashboard data:', error);
    }
}

// Initialize dropdown menu functionality
function initializeMenus() {
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(menuItem => {
        const menuContent = menuItem.querySelector('.menu-content');
        const submenu = menuItem.querySelector('.submenu');
        const arrow = menuItem.querySelector('.arrow img');

        // Only add click handler if menu has submenu
        if (menuContent && submenu && arrow) {
            menuContent.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleSubmenu(submenu, arrow);
            });
        }
    });
}

// Toggle submenu visibility and arrow direction
function toggleSubmenu(submenu, arrowImg) {
    const isActive = submenu.classList.contains('active');

    if (!isActive) {
        // Close all other submenus first (but not this one)
        closeAllSubmenus(submenu);

        // Open this submenu
        submenu.classList.add('active');
        // Change arrow from down to up
        arrowImg.src = '/src/assets/up_arrow_white_icon.png';
        arrowImg.setAttribute('data-submenu-open', 'true');
    } else {
        // If clicking on the same menu that's already open, close it
        submenu.classList.remove('active');
        arrowImg.src = '/src/assets/down_arrow_white_icon.png';
        arrowImg.removeAttribute('data-submenu-open');
    }
}

// Close all submenus and reset arrows
function closeAllSubmenus(exceptSubmenu = null) {
    const allSubmenus = document.querySelectorAll('.submenu');
    const allArrows = document.querySelectorAll('.arrow img');

    allSubmenus.forEach(submenu => {
        if (submenu !== exceptSubmenu) {
            submenu.classList.remove('active');
        }
    });

    allArrows.forEach(arrow => {
        // Solo resetta le frecce dei submenu che non sono l'eccezione
        const parentMenuItem = arrow.closest('.menu-item');
        const parentSubmenu = parentMenuItem ? parentMenuItem.querySelector('.submenu') : null;

        if (parentSubmenu !== exceptSubmenu) {
            arrow.src = '/src/assets/down_arrow_white_icon.png';
            arrow.removeAttribute('data-submenu-open');
        }
    });
}

// Initialize section navigation
function initializeSectionNavigation() {
    // Handle Home menu item
    const homeMenuItem = document.getElementById('home');
    if (homeMenuItem) {
        homeMenuItem.addEventListener('click', function () {
            showSection('admin-home-section');
            closeAllSubmenus();
        });
    }      // Handle submenu items navigation
    const submenuItems = document.querySelectorAll('.submenu-item');

    submenuItems.forEach(item => {
        item.addEventListener('click', function () {
            const itemId = this.id;
            const sectionId = getSectionIdFromMenuItem(itemId);

            if (sectionId) {
                showSection(sectionId);
                // Non chiudere i submenu quando si seleziona un elemento
                // Il submenu rimane aperto per permettere altre selezioni
            }
        });
    });
}

// Map menu item IDs to section IDs
function getSectionIdFromMenuItem(menuItemId) {
    const mapping = {
        // Visite submenu
        'visualizza-elenco-visite-odierne': 'admin-visualizza-elenco-visite-odierne-section',
        'visualizza-elenco-visite-future': 'admin-visualizza-elenco-visite-future-section',
        // Storico submenu
        'storico-visite': 'admin-storico-timbrature-visite-section',
        'storico-timbrature-visitatori': 'admin-storico-timbrature-visitatori-section',
        'storico-timbrature-dipendenti': 'admin-storico-timbrature-dipendenti-section',
        'storico-timbrature-mensa': 'admin-storico-timbrature-mensa-section',

        // Persone submenu
        'visitatori-crea-persone': 'admin-visitatori-crea-persone-section',
        'visitatori-elenco-presenti': 'admin-visitatori-elenco-presenti-section',
        'visualizza-elenco-persone': 'admin-visualizza-elenco-persone-section',
        'visualizza-elenco-tel-sm': 'admin-visualizza-elenco-tel-sm-section'
    };

    return mapping[menuItemId] || null;
}

// Show specific section and hide others
function showSection(sectionId) {
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Close submenus when clicking outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu-item')) {
        closeAllSubmenus();
    }
});

let visitsTable = null;

async function setupVisitsHistory() {
    // Initialize DataTable when the storico-visite menu item is clicked
    document.getElementById('storico-visite').addEventListener('click', async function () {
        if (!visitsTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeVisitsTable();
                await fetchAndPopulateVisits();
            } catch (error) {
                console.error('Error setting up visits table:', error);
                // You might want to show an error message to the user here
            }
        }
    });
}

function initializeVisitsTable() {
    visitsTable = $('#visitsTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        order: [[1, 'asc'], [2, 'asc']], // Ordina prima per data inizio, poi per ora inizio
        columns: [
            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            {
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Data Fine',
                data: 'dataFine',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function (data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            }
        ]
    });
}

async function fetchAndPopulateVisits() {
    try {
        const response = await fetch('http://localhost:8080/visit', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const visits = await response.json();
        visitsTable.clear().rows.add(visits).draw();

    } catch (error) {
        console.error('Error fetching visits:', error);
        // Handle error appropriately
    }
}


// Modal close functionality
document.addEventListener('DOMContentLoaded', function () {
    // Setup modal close handlers for visit details
    const visitModal = document.getElementById('visitDetailsModal');
    const visitCloseBtn = visitModal.querySelector('.close-modal');

    visitCloseBtn.onclick = function () {
        visitModal.style.display = 'none';
    }    // Setup modal close handlers for badge details
    const badgeModal = document.getElementById('badgeDetailsModal');
    const badgeCloseBtn = badgeModal.querySelector('.close-modal');

    badgeCloseBtn.onclick = function () {
        badgeModal.style.display = 'none';
    }

    // Setup modal close handlers for person success modal
    const personSuccessModal = document.getElementById('personSuccessModal');
    const personSuccessCloseBtn = personSuccessModal?.querySelector('.close-modal');

    if (personSuccessCloseBtn) {
        personSuccessCloseBtn.onclick = function () {
            personSuccessModal.style.display = 'none';
        }
    }

    // Setup modal close handlers for person error modal
    const personErrorModal = document.getElementById('personErrorModal');
    const personErrorCloseBtn = personErrorModal?.querySelector('.close-modal');

    if (personErrorCloseBtn) {
        personErrorCloseBtn.onclick = function () {
            personErrorModal.style.display = 'none';
        }
    }    // Handle clicking outside any modal to close it
    window.onclick = function (event) {
        if (event.target === visitModal) {
            visitModal.style.display = 'none';
        }
        if (event.target === badgeModal) {
            badgeModal.style.display = 'none';
        }
        if (event.target === personSuccessModal) {
            personSuccessModal.style.display = 'none';
        }
        if (event.target === personErrorModal) {
            personErrorModal.style.display = 'none';
        }
    }    // Add escape key handler for modals
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (visitModal.style.display === 'block') {
                visitModal.style.display = 'none';
            }
            if (badgeModal.style.display === 'block') {
                badgeModal.style.display = 'none';
            }
            if (personSuccessModal && personSuccessModal.style.display === 'block') {
                personSuccessModal.style.display = 'none';
            }
            if (personErrorModal && personErrorModal.style.display === 'block') {
                personErrorModal.style.display = 'none';
            }
        }
    });
});

let employeeBadgesTable = null;

async function setupEmployeeBadgesHistory() {
    document.getElementById('storico-timbrature-dipendenti').addEventListener('click', async function () {
        if (!employeeBadgesTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeEmployeeBadgesTable();
                await fetchAndPopulateEmployeeBadges();
            } catch (error) {
                console.error('Error setting up employee badges table:', error);
            }
        }
    });
}

function initializeEmployeeBadgesTable() {
    employeeBadgesTable = $('#employeeBadgesTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        order: [[1, 'desc'], [2, 'desc']], // Ordina per data e ora decrescente
        columns: [
            {
                title: 'Dipendente',
                data: null,
                render: function (data) {
                    return `${data.nome || ''} ${data.cognome || ''}`;
                }
            },
            {
                title: 'Data',
                data: 'dataTimbratura',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora',
                data: 'oraTimbrature',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Tipo',
                data: 'descrizioneTimbratrice',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Badge',
                data: 'codiceBadge',
                render: function (data) {
                    return data || '';
                }
            }
        ]
    });
}

async function fetchAndPopulateEmployeeBadges() {
    try {
        const response = await fetch('http://localhost:8080/badge-record-history/secondo-mona', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const badges = await response.json();
        employeeBadgesTable.clear().rows.add(badges).draw();

    } catch (error) {
        console.error('Error fetching employee badges:', error);
    }
}

let visitorBadgesTable = null;

async function setupVisitorBadgesHistory() {
    document.getElementById('storico-timbrature-visitatori').addEventListener('click', async function () {
        if (!visitorBadgesTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeVisitorBadgesTable();
                await fetchAndPopulateVisitorBadges();
            } catch (error) {
                console.error('Error setting up visitor badges table:', error);
            }
        }
    });
}

function initializeVisitorBadgesTable() {
    visitorBadgesTable = $('#visitorBadgesTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        order: [[2, 'desc'], [3, 'desc']], // Ordina per data e ora decrescente
        columns: [
            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.nome || ''} ${data.cognome || ''}`;
                }
            },
            {
                title: 'Azienda',
                data: 'azienda',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Data',
                data: 'dataTimbratura',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora',
                data: 'oraTimbrature',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Tipo',
                data: 'descrizioneTimbratrice',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Badge',
                data: 'codiceBadge',
                render: function (data) {
                    return data || '';
                }
            }
        ]
    });
}

async function fetchAndPopulateVisitorBadges() {
    try {
        const response = await fetch('http://localhost:8080/badge-record-history/visitors', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const badges = await response.json();
        visitorBadgesTable.clear().rows.add(badges).draw();

    } catch (error) {
        console.error('Error fetching visitor badges:', error);
    }
}

let lunchAreaBadgesTable = null;

async function setupLunchAreaBadgesHistory() {
    document.getElementById('storico-timbrature-mensa').addEventListener('click', async function () {
        if (!lunchAreaBadgesTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeLunchAreaBadgesTable();
                await fetchAndPopulateLunchAreaBadges();
            } catch (error) {
                console.error('Error setting up lunch area badges table:', error);
            }
        }
    });
}

function initializeLunchAreaBadgesTable() {
    lunchAreaBadgesTable = $('#lunchAreaBadgesTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        order: [[2, 'desc'], [3, 'desc']], // Ordina per data e ora decrescente
        columns: [
            {
                title: 'Persona',
                data: null,
                render: function (data) {
                    return `${data.nome || ''} ${data.cognome || ''}`;
                }
            },
            {
                title: 'Azienda',
                data: 'azienda',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Data',
                data: 'dataTimbratura',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora',
                data: 'oraTimbrature',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Tipo',
                data: 'descrizioneTimbratrice',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Badge',
                data: 'codiceBadge',
                render: function (data) {
                    return data || '';
                }
            }
        ]
    });
}

async function fetchAndPopulateLunchAreaBadges() {
    try {
        const response = await fetch('http://localhost:8080/badge-record-history/lunch-area', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const badges = await response.json();
        lunchAreaBadgesTable.clear().rows.add(badges).draw();

    } catch (error) {
        console.error('Error fetching lunch area badges:', error);
    }
}

let employeePhoneDirectoryTable = null;

async function setupEmployeePhoneDirectory() {
    document.getElementById('visualizza-elenco-tel-sm').addEventListener('click', async function () {
        if (!employeePhoneDirectoryTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeEmployeePhoneDirectoryTable();
                await fetchAndPopulatePhoneDirectory();
            } catch (error) {
                console.error('Error setting up phone directory table:', error);
            }
        }
    });
}

function initializeEmployeePhoneDirectoryTable() {
    employeePhoneDirectoryTable = $('#employeePhoneDirectoryTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        order: [[1, 'asc'], [0, 'asc']], // Ordina per cognome, poi per nome
        columns: [
            {
                title: 'Nome',
                data: 'nome',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Cognome',
                data: 'cognome',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Email',
                data: 'email',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Telefono',
                data: 'telefono',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Cellulare',
                data: 'cellulare',
                render: function (data) {
                    return data || '';
                }
            }
        ]
    });
}

async function fetchAndPopulatePhoneDirectory() {
    try {
        const response = await fetch('http://localhost:8080/employee-contact-list', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contacts = await response.json();
        employeePhoneDirectoryTable.clear().rows.add(contacts).draw();

    } catch (error) {
        console.error('Error fetching phone directory:', error);
    }
}


let todayVisitsTable = null;
let futureVisitsTable = null;
let peopleTable = null;

async function setupTodayVisits() {
    // Initialize DataTable when the visualizza-elenco-visite-odierne menu item is clicked
    document.getElementById('visualizza-elenco-visite-odierne').addEventListener('click', async function () {
        if (!todayVisitsTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeTodayVisitsTable();
                await fetchAndPopulateTodayVisits();
            } catch (error) {
                console.error('Error setting up today visits table:', error);
                // Show error message to the user
                alert('Errore durante il caricamento delle visite odierne. Riprova più tardi.');
            }
        } else {
            // Refresh data if table already exists
            await fetchAndPopulateTodayVisits();
        }
    });
}

async function setupFutureVisits() {
    // Initialize DataTable when the visualizza-elenco-visite-future menu item is clicked
    document.getElementById('visualizza-elenco-visite-future').addEventListener('click', async function () {
        if (!futureVisitsTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializeFutureVisitsTable();
                await fetchAndPopulateFutureVisits();
            } catch (error) {
                console.error('Error setting up future visits table:', error);
                // Show error message to the user
                alert('Errore durante il caricamento delle visite future. Riprova più tardi.');
            }
        } else {
            // Refresh data if table already exists
            await fetchAndPopulateFutureVisits();
        }
    });
}

async function setupPeopleList() {
    // Initialize DataTable when the visualizza-elenco-persone menu item is clicked
    document.getElementById('visualizza-elenco-persone').addEventListener('click', async function () {
        if (!peopleTable) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                initializePeopleTable();
                await fetchAndPopulatePeople();
            } catch (error) {
                console.error('Error setting up people table:', error);
                // Show error message to the user
                alert('Errore durante il caricamento dell\'elenco persone. Riprova più tardi.');
            }
        } else {
            // Refresh data if table already exists
            await fetchAndPopulatePeople();
        }
    });
}

function initializeTodayVisitsTable() {
    todayVisitsTable = $('#todayVisitsTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        searching: false,
        paging: false,
        info: false,
        ordering: false,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        columns: [
            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            {
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Data Fine',
                data: 'dataFine',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function (data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            },
            {
                title: 'Stato Visita',
                data: 'stato',
                render: function (data) {
                    return data || 'Da Iniziare';
                }
            },
            {
                title: 'Dettagli',
                data: null,
                render: function (data) {
                    return `<button onclick='showTodayVisitDetails(${JSON.stringify(data)})' class="action-button">Dettagli</button>`;
                }
            },
            {
                title: 'Azioni Visita',
                data: null,
                render: function (data) {
                    if (data.status === 'Iniziata') {
                        // Se la visita è in corso o ha data inizio ma non fine
                        return `<button onclick='endVisit(${data.id})' class="action-button">Termina Visita</button>`;
                    } else if (data.status === "Da Iniziare" || !data.dataInizio) {
                        // Se la visita non è iniziata (status null o PROGRAMMATA) o non ha data inizio
                        return `<button onclick='startVisit(${data.id})' class="action-button">Inizia Visita</button>`;
                    }
                    return ''; // Non mostrare bottoni se la visita è terminata
                }
            },
            {
                title: 'Elimina',
                data: null,
                render: function (data) {
                    return `<button onclick="deleteVisit(${data.id})" class="action-button delete-button">Elimina</button>`;
                }
            }
        ]
    });
    
    // Fetch initial data
    fetchAndPopulateTodayVisits();
}

function initializeFutureVisitsTable() {
    futureVisitsTable = $('#futureVisitsTable').DataTable({
        lengthChange: false,
        pageLength: 8,
        autoWidth: false,
        responsive: true,
        searching: false,
        paging: false,
        info: false,
        ordering: false,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        columns: [
            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            {
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Data Fine',
                data: 'dataFine',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data) || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function (data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            },
            {
                title: 'Stato Visita',
                data: 'stato',
                render: function (data) {
                    return data || 'Da Iniziare';
                }
            },
            {
                title: 'Dettagli',
                data: null,
                render: function (data) {
                    return `<button onclick='showFutureVisitDetails(${JSON.stringify(data)})' class="action-button">Dettagli</button>`;
                }
            },
            {
                title: 'Elimina',
                data: null,
                render: function (data) {
                    return `<button onclick="deleteVisit(${data.id})" class="action-button delete-button">Elimina</button>`;
                }
            }
        ]
    });
    
    // Fetch initial data
    fetchAndPopulateFutureVisits();
}

function initializePeopleTable() {
    peopleTable = $('#peopleTable').DataTable({
        lengthChange: false,
        pageLength: 6,
        autoWidth: false,
        responsive: true,
        language: {
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessun elemento disponibile",
            infoFiltered: "(filtrati da _MAX_ elementi totali)",
            search: "Cerca:",
            paginate: {
                next: ">",
                previous: "<"
            },
            emptyTable: "Nessun dato presente nella tabella",
            zeroRecords: "Nessun risultato trovato"
        },
        order: [[1, 'asc'], [0, 'asc']], // Ordina per cognome, poi per nome
        columns: [
            {
                title: 'Nome',
                data: 'nome',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Cognome',
                data: 'cognome',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Email',
                data: 'mail',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Telefono',
                data: 'telefono',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Cellulare',
                data: 'cellulare',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Azienda',
                data: 'azienda',
                render: function (data) {
                    return data || '';
                }
            },
            {
                title: 'Ruolo',
                data: 'ruolo',
                render: function (data) {
                    return data?.descrizione || '';
                }
            },
            {
                title: 'Azioni',
                data: null,
                render: function (data, type, row) {
                    return `<button onclick='showPersonDetails(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button">Dettagli</button>`;
                }
            }
        ]
    });
}

async function fetchAndPopulateTodayVisits() {
    try {
        const response = await fetch('http://localhost:8080/visit', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allVisits = await response.json();

        // Filter visits for today
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format

        const todayVisits = allVisits.filter(visit => {
            if (!visit.dataInizio) return false;
            const visitDate = new Date(visit.dataInizio).toISOString().split('T')[0];
            return visitDate === todayString;
        });

        todayVisitsTable.clear().rows.add(todayVisits).draw();

        // Show message if no visits today
        if (todayVisits.length === 0) {
            console.log('Nessuna visita programmata per oggi');
        }

    } catch (error) {
        console.error('Error fetching today visits:', error);
        alert('Errore durante il recupero delle visite odierne.');
    }
}

async function fetchAndPopulateFutureVisits() {
    try {
        const response = await fetch('http://localhost:8080/visit', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allVisits = await response.json();

        // Filter visits for future dates (after today)
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format

        const futureVisits = allVisits.filter(visit => {
            if (!visit.dataInizio) return false;
            const visitDate = new Date(visit.dataInizio).toISOString().split('T')[0];
            return visitDate > todayString;
        });

        futureVisitsTable.clear().rows.add(futureVisits).draw();

        // Show message if no future visits
        if (futureVisits.length === 0) {
            console.log('Nessuna visita futura programmata');
        }

    } catch (error) {
        console.error('Error fetching future visits:', error);
        alert('Errore durante il recupero delle visite future.');
    }
}

async function fetchAndPopulatePeople() {
    try {
        const response = await fetch('http://localhost:8080/people', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const people = await response.json();

        peopleTable.clear().rows.add(people).draw();

        // Show message if no people found
        if (people.length === 0) {
            console.log('Nessuna persona trovata nel database');
        }

    } catch (error) {
        console.error('Error fetching people:', error);
        alert('Errore durante il recupero dell\'elenco persone.');
    }
}

// Setup present people tables
function setupPresentPeople() {
    // Initialize section when the menu item is clicked
    document.getElementById('visitatori-elenco-presenti').addEventListener('click', async function () {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            await refreshJwt();

            if (!presentEmployeesTable || !presentVisitorsTable) {
                setupPresentPeopleTables();
            } else {
                // If tables are already initialized, just refresh the data
                await fetchAndPopulatePresentPeople();
            }
        } catch (error) {
            console.error('Error setting up present people section:', error);
        }
    });
}

function setupPresentPeopleTables() {
    // Check if tables are already initialized
    if ($.fn.DataTable.isDataTable('#table-presenti-dipendeti')) {
        presentEmployeesTable = $('#table-presenti-dipendeti').DataTable();
    } else {        // Initialize employees table
        presentEmployeesTable = $('#table-presenti-dipendeti').DataTable({
            lengthChange: false,
            pageLength: 6,
            autoWidth: false,
            responsive: true,
            buttons: [
                'pdf'
            ],
            dom: 'Bfrtip',
            language: {
                info: "Pagina _PAGE_ di _PAGES_",
                infoEmpty: "Nessun elemento disponibile",
                infoFiltered: "(filtrati da _MAX_ elementi totali)",
                search: "Cerca:",
                paginate: {
                    next: ">",
                    previous: "<"
                },
                emptyTable: "Nessun dato presente nella tabella",
                zeroRecords: "Nessun risultato trovato"
            },
            columns: [
                {
                    title: 'Nome',
                    data: 'nome',
                    render: function (data) {
                        return data || 'N/A';
                    }
                },
                {
                    title: 'Cognome',
                    data: 'cognome',
                    render: function (data) {
                        return data || 'N/A';
                    }
                },
                {
                    title: 'Email',
                    data: 'mail',
                    render: function (data) {
                        return data || 'N/A';
                    }
                }
            ]
        });    // Check if visitors table is already initialized
        if ($.fn.DataTable.isDataTable('#table-presenti-visitatori')) {
            presentVisitorsTable = $('#table-presenti-visitatori').DataTable();
        } else {            // Initialize visitors table (including maintenance)
            presentVisitorsTable = $('#table-presenti-visitatori').DataTable({
                lengthChange: false,
                pageLength: 6,
                autoWidth: false,
                responsive: true,
                buttons: [
                    'pdf'
                ],
                dom: 'Bfrtip',
                language: {
                    info: "Pagina _PAGE_ di _PAGES_",
                    infoEmpty: "Nessun elemento disponibile",
                    infoFiltered: "(filtrati da _MAX_ elementi totali)",
                    search: "Cerca:",
                    paginate: {
                        next: ">",
                        previous: "<"
                    },
                    emptyTable: "Nessun dato presente nella tabella",
                    zeroRecords: "Nessun risultato trovato"
                },
                columns: [
                    {
                        title: 'Nome',
                        data: 'nome',
                        render: function (data) {
                            return data || 'N/A';
                        }
                    },
                    {
                        title: 'Cognome',
                        data: 'cognome',
                        render: function (data) {
                            return data || 'N/A';
                        }
                    },
                    {
                        title: 'Email',
                        data: 'mail',
                        render: function (data) {
                            return data || 'N/A';
                        }
                    }
                ]
            });

            // Load initial data
            fetchAndPopulatePresentPeople();

            // Set up auto-refresh every 30 seconds
            setInterval(fetchAndPopulatePresentPeople, 30000);
        }
    }
}
async function fetchAndPopulatePresentPeople() {
    try {
        const response = await fetch('http://localhost:8080/list/people', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update employees table
        if (data.Employees && Array.isArray(data.Employees)) {
            presentEmployeesTable.clear().rows.add(data.Employees).draw();
        }

        // Combine visitors and maintenance personnel for visitors table
        const allVisitors = [
            ...(data.Visitors || []),
            ...(data.Maintenance || [])
        ];
        presentVisitorsTable.clear().rows.add(allVisitors).draw();

    } catch (error) {
        console.error('Error loading present people:', error);
        presentEmployeesTable.clear().draw();
        presentVisitorsTable.clear().draw();

        // Show error in counts
        document.querySelectorAll('.employeesCount, .visitorsCount, .totalPresent').forEach(el => {
            el.textContent = '-';
        });
    }
}

function showTodayVisitDetails(visit) {
    // Populate visitor information
    document.getElementById('todayVisitorName').textContent = visit.personaVisitatore?.nome || '';
    document.getElementById('todayVisitorSurname').textContent = visit.personaVisitatore?.cognome || '';
    document.getElementById('todayVisitorEmail').textContent = visit.personaVisitatore?.mail || '';
    document.getElementById('todayVisitorPhone').textContent = visit.personaVisitatore?.telefono || visit.personaVisitatore?.cellulare || '';

    // Populate employee information
    document.getElementById('todayEmployeeName').textContent = visit.responsabile?.nome || '';
    document.getElementById('todayEmployeeSurname').textContent = visit.responsabile?.cognome || '';
    document.getElementById('todayEmployeeEmail').textContent = visit.responsabile?.mail || '';

    // Format and populate dates
    const startDate = visit.dataInizio ? new Date(visit.dataInizio) : null;
    const endDate = visit.dataFine ? new Date(visit.dataFine) : null;
    const startTime = formatTimeToHourMinute(visit.oraInizio) || '';
    const endTime = formatTimeToHourMinute(visit.oraFine) || '';

    document.getElementById('todayStartDate').textContent = startDate ?
        `${startDate.toLocaleDateString('it-IT')} ${startTime}` : '';
    document.getElementById('todayEndDate').textContent = endDate ?
        `${endDate.toLocaleDateString('it-IT')} ${endTime}` : '';

    // Populate additional details
    document.getElementById('todayVisitReason').textContent = visit.motivo || '';
    document.getElementById('todayVisitDPI').textContent = visit.flagDPI ? 'Sì' : 'No';
    document.getElementById('todayVisitCar').textContent = visit.flagAccessoConAutomezzo ? 'Sì' : 'No';

    // Show modal
    const modal = document.getElementById('todayVisitDetailsModal');
    modal.style.display = 'block';
}

function showFutureVisitDetails(visit) {
    // Populate visitor information
    document.getElementById('futureVisitorName').textContent = visit.personaVisitatore?.nome || '';
    document.getElementById('futureVisitorSurname').textContent = visit.personaVisitatore?.cognome || '';
    document.getElementById('futureVisitorEmail').textContent = visit.personaVisitatore?.mail || '';
    document.getElementById('futureVisitorPhone').textContent = visit.personaVisitatore?.telefono || visit.personaVisitatore?.cellulare || '';

    // Populate employee information
    document.getElementById('futureEmployeeName').textContent = visit.responsabile?.nome || '';
    document.getElementById('futureEmployeeSurname').textContent = visit.responsabile?.cognome || '';
    document.getElementById('futureEmployeeEmail').textContent = visit.responsabile?.mail || '';

    // Format and populate dates
    const startDate = visit.dataInizio ? new Date(visit.dataInizio) : null;
    const endDate = visit.dataFine ? new Date(visit.dataFine) : null;
    const startTime = formatTimeToHourMinute(visit.oraInizio) || '';
    const endTime = formatTimeToHourMinute(visit.oraFine) || '';

    document.getElementById('futureStartDate').textContent = startDate ?
        `${startDate.toLocaleDateString('it-IT')} ${startTime}` : '';
    document.getElementById('futureEndDate').textContent = endDate ?
        `${endDate.toLocaleDateString('it-IT')} ${endTime}` : '';

    // Populate additional details
    document.getElementById('futureVisitReason').textContent = visit.motivo || '';
    document.getElementById('futureVisitDPI').textContent = visit.flagDPI ? 'Sì' : 'No';
    document.getElementById('futureVisitCar').textContent = visit.flagAccessoConAutomezzo ? 'Sì' : 'No';

    // Show modal
    const modal = document.getElementById('futureVisitDetailsModal');
    modal.style.display = 'block';
}

function showPersonDetails(person) {
    // Populate personal information
    document.getElementById('personName').textContent = person.nome || '';
    document.getElementById('personSurname').textContent = person.cognome || '';
    document.getElementById('personEmail').textContent = person.mail || '';
    document.getElementById('personPhone').textContent = person.telefono || '';
    document.getElementById('personMobile').textContent = person.cellulare || '';

    // Populate work information
    document.getElementById('personCompany').textContent = person.azienda || '';
    document.getElementById('personRole').textContent = person.ruolo.descrizione || '';
    document.getElementById('personEmployeeId').textContent = person.idPersona || '';

    // Show modal
    const modal = document.getElementById('personDetailsModal');
    modal.style.display = 'block';
}

// Modal close functionality for today visits, future visits, and person details
document.addEventListener('DOMContentLoaded', function () {
    // Setup modal close handlers for today visits modal
    const todayModal = document.getElementById('todayVisitDetailsModal');
    const todayCloseBtn = todayModal?.querySelector('.close-modal');

    if (todayCloseBtn) {
        todayCloseBtn.onclick = function () {
            todayModal.style.display = 'none';
        }
    }

    // Setup modal close handlers for future visits modal
    const futureModal = document.getElementById('futureVisitDetailsModal');
    const futureCloseBtn = futureModal?.querySelector('.close-modal');

    if (futureCloseBtn) {
        futureCloseBtn.onclick = function () {
            futureModal.style.display = 'none';
        }
    }

    // Setup modal close handlers for person details modal
    const personModal = document.getElementById('personDetailsModal');
    const personCloseBtn = personModal?.querySelector('.close-modal');

    if (personCloseBtn) {
        personCloseBtn.onclick = function () {
            personModal.style.display = 'none';
        }
    }

    window.onclick = function (event) {
        if (event.target === todayModal) {
            todayModal.style.display = 'none';
        }
        if (event.target === futureModal) {
            futureModal.style.display = 'none';
        }
        if (event.target === personModal) {
            personModal.style.display = 'none';
        }
    }

    // Add escape key handler for modals
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (todayModal && todayModal.style.display === 'block') {
                todayModal.style.display = 'none';
            }
            if (futureModal && futureModal.style.display === 'block') {
                futureModal.style.display = 'none';
            }
            if (personModal && personModal.style.display === 'block') {
                personModal.style.display = 'none';
            }
        }
    });
});

// Handle create person form submission
document.getElementById('createPersonForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const nome = String(document.getElementById("nome-crea-persona").value);
        const cognome = String(document.getElementById("cognome-crea-persona").value);
        const azienda = String(document.getElementById("azienda-crea-persona").value);
        const indirizzo = String(document.getElementById("indirizzo").value);
        const citta = String(document.getElementById("citta").value);
        const provincia = String(document.getElementById("provincia").value);
        const nazione = String(document.getElementById("nazione").value);
        const telefono = String(document.getElementById("telefono").value);
        const cellulare = String(document.getElementById("cellulare").value);
        let fax = String(document.getElementById("fax").value);
        fax = fax === "" ? null : fax;

        let pIva = String(document.getElementById("pIva").value);
        pIva = pIva === "" ? null : pIva;

        const cf = String(document.getElementById("cf").value);
        const mail = String(document.getElementById("mail-crea-persona").value);
        let dataAssunzione = document.getElementById("dataAssunzione").value;

        if (dataAssunzione === null || dataAssunzione === "") {
            dataAssunzione = "1970-01-01";
        }

        const luogoNascita = String(document.getElementById("luogoNascita").value);
        const dataNascita = document.getElementById("dataNascita").value;
        const tipoDocumento = String(document.getElementById("tipoDocumento").value);
        const numeroDocumento = String(document.getElementById("numeroDocumento").value);
        const dataScadenzaDoc = document.getElementById("dataScadenzaDoc").value;
        const duvri = String(document.getElementById("duvri").checked);
        let numCentriCosto = Number(document.getElementById("numCentriCosto").value);
        numCentriCosto = numCentriCosto === 0 ? null : numCentriCosto;

        const flagDocPrivacy = document.getElementById("flagDocPrivacy").checked;
        const dataConsegnaDocPrivacy = document.getElementById("dataConsegnaDocPrivacy").value;
        const idRuolo = Number(document.getElementById("idRuolo").value);

        const requestBody = {
            "idRuna": null,
            "nome": nome,
            "cognome": cognome,
            "diminutivo": null,
            "azienda": azienda,
            "indirizzo": indirizzo,
            "citta": citta,
            "provincia": provincia,
            "nazione": nazione,
            "telefono": telefono,
            "cellulare": cellulare,
            "fax": fax,
            "pIva": pIva,
            "cf": cf,
            "mail": mail,
            "foto": null,
            "dataAssunzione": dataAssunzione,
            "matricola": null,
            "idFiliale": null,
            "idMansione": null,
            "idDeposito": null,
            "idRiferimento": null,
            "visitatore": false,
            "accessNumber": null,
            "accessCount": null,
            "accessUpdate": null,
            "luogoNascita": luogoNascita,
            "dataNascita": dataNascita,
            "dataScadCertificato": null,
            "preposto": null,
            "antincendio": null,
            "primoSoccorso": null,
            "tipoDocumento": tipoDocumento,
            "numeroDocumento": numeroDocumento,
            "dataScadenzaDoc": dataScadenzaDoc,
            "duvri": duvri,
            "numCentriCosto": numCentriCosto,
            "flagDocPrivacy": flagDocPrivacy,
            "dataConsegnaDocPrivacy": dataConsegnaDocPrivacy,
            "idRuolo": idRuolo
        };

        console.log('Creating person:', requestBody);

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8080/people', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }        const result = await response.json();
        
        // Show success message
        showPersonSuccessModal();
        
        // Reset form
        this.reset();
        
    } catch (error) {
        console.error('Error creating person:', error);
        showPersonErrorModal('Errore durante la creazione della persona. Per favore riprova.');
    }
});

// Function to update people counts in the home section
async function updatePeopleCount() {
    try {
        const response = await fetch('http://localhost:8080/list/count', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Calculate total present (sum of all values)
        const totalPresent = Object.values(data).reduce((sum, count) => sum + count, 0);
        
        // Get employees count directly
        const employeesCount = data.Employees;
        
        // Calculate visitors count (Visitors + Maintenance)
        const visitorsCount = (data.Visitors || 0) + (data.Maintenance || 0);

        // Update all elements with these classes
        document.querySelectorAll('.totalPresent').forEach(element => {
            element.textContent = totalPresent;
        });
        
        document.querySelectorAll('.employeesCount').forEach(element => {
            element.textContent = employeesCount;
        });
        
        document.querySelectorAll('.visitorsCount').forEach(element => {
            element.textContent = visitorsCount;
        });

    } catch (error) {
        console.error('Error fetching people count:', error);
    }
}

// Utility function to format time to HH:MM format
function formatTimeToHourMinute(timeString) {
    if (!timeString || timeString.trim() === '') {
        return '';
    }

    try {
        // Handle different time formats
        let cleanTime = timeString.trim();
        
        // If it's in HH:MM format already, return as is
        if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
            const [hours, minutes] = cleanTime.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        
        // If it's in HH:MM:SS format, extract hours and minutes
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(cleanTime)) {
            const [hours, minutes] = cleanTime.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        
        // If it's in HH:MM:SS.mmm format (with milliseconds), extract hours and minutes
        if (/^\d{1,2}:\d{2}:\d{2}\.\d+$/.test(cleanTime)) {
            const [hours, minutes] = cleanTime.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        
        // Try to parse as Date object if it's a full datetime string
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        
        // If nothing matches, return the original string
        return timeString;
        
    } catch (error) {
        console.warn('Error formatting time:', timeString, error);
        return timeString;
    }
}

// Function to initialize dropdown arrow toggle functionality
function initializeDropdownArrows() {
    // Get all select elements in form groups
    const selects = document.querySelectorAll('.form-group select');
    
    selects.forEach(select => {
        // Add event listeners for focus and blur
        select.addEventListener('focus', function() {
            this.classList.add('opened');
        });
        
        select.addEventListener('blur', function() {
            this.classList.remove('opened');
        });
        
        // Also handle mousedown/mouseup for better UX
        select.addEventListener('mousedown', function() {
            this.classList.add('opened');
        });
        
        // Remove opened class when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.form-group select')) {
                selects.forEach(s => s.classList.remove('opened'));
            }
        });
    });
}

// Close all selects and reset arrows
function closeAllSelects(exceptSelect = null) {
    const allSelects = document.querySelectorAll('.form-select');
    const allArrows = document.querySelectorAll('.arrow img');

    allSelects.forEach(select => {
        if (select !== exceptSelect) {
            select.classList.remove('open');
        }
    });

    allArrows.forEach(arrow => {
        // Solo resetta le frecce dei select che non sono l'eccezione
        const parentSelect = arrow.closest('.form-select');

        if (parentSelect !== exceptSelect) {
            arrow.src = '/src/assets/down_arrow_white_icon.png';
        }
    });
}

// Show success modal for person creation
function showPersonSuccessModal() {
    const modal = document.getElementById('personSuccessModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Show error modal for person creation
function showPersonErrorModal(errorMessage) {
    const modal = document.getElementById('personErrorModal');
    const messageElement = document.getElementById('personErrorMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = errorMessage || 'Si è verificato un errore durante la creazione della persona.';
        modal.style.display = 'block';
    }
}

// Hide person modals
function hidePersonModals() {
    const successModal = document.getElementById('personSuccessModal');
    const errorModal = document.getElementById('personErrorModal');
    
    if (successModal) {
        successModal.style.display = 'none';
    }
    if (errorModal) {
        errorModal.style.display = 'none';
    }
}

// Delete a visit with confirmation
async function deleteVisit(visitId) {
    showConfirmationModal('Sei sicuro di voler eliminare questa visita?', async function() {
        await performDeleteVisit(visitId);
    });
}

// Perform the actual visit deletion
async function performDeleteVisit(visitId) {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Token di autenticazione non trovato');
        }

        const response = await fetch(`http://localhost:8080/visit/${visitId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Refresh both tables to show the updated data
        await fetchAndPopulateTodayVisits();
        await fetchAndPopulateFutureVisits();        alert('Visita eliminata con successo');
    } catch (error) {
        console.error('Errore durante l\'eliminazione della visita:', error);
        alert('Errore durante l\'eliminazione della visita');
    }
}

// Assign a badge to a visit
async function assignBadge(visitId) {
    const badgeNumber = prompt('Inserisci il numero del badge:');
    if (!badgeNumber) {
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Token di autenticazione non trovato');
        }

        const response = await fetch(`http://localhost:8080/visit/assign_badge/${visitId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ badgeNumber: badgeNumber })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Refresh the tables to show the updated data
        await fetchAndPopulateTodayVisits();
        await fetchAndPopulateFutureVisits();
        alert('Badge assegnato con successo');
    } catch (error) {
        console.error('Errore durante l\'assegnazione del badge:', error);
        alert('Errore durante l\'assegnazione del badge');
    }
}

// Show confirmation modal for dangerous operations
function showConfirmationModal(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    
    if (modal && messageElement && confirmButton && cancelButton) {
        messageElement.textContent = message || 'Sei sicuro di voler procedere?';
        modal.style.display = 'block';
        
        // Remove any existing event listeners
        confirmButton.replaceWith(confirmButton.cloneNode(true));
        cancelButton.replaceWith(cancelButton.cloneNode(true));
        
        // Get the new button references after cloning
        const newConfirmButton = document.getElementById('confirmButton');
        const newCancelButton = document.getElementById('cancelButton');
        
        // Add event listeners
        newConfirmButton.addEventListener('click', function() {
            modal.style.display = 'none';
            if (onConfirm) onConfirm();
        });
        
        newCancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking the X button
        const closeButton = modal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}
