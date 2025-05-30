// Dashboard Requester JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeRequesterMenus();
    initializeRequesterSectionNavigation();
    setupEmployeePhoneDirectory();
    setupTodayVisits();
    setupFutureVisits();
    initializeHomeTables();
    setupHomeNavigationButtons(); // Setup navigation buttons for home tables
    setupCreateVisitForm(); // Setup create visit form functionality
    initializeDropdownArrows(); // Initialize dropdown arrow toggle functionality
});

// Initialize menu functionality for Requester
function initializeRequesterMenus() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(menuItem => {
        const menuContent = menuItem.querySelector('.menu-content');
        const submenu = menuItem.querySelector('.submenu');
        const arrow = menuItem.querySelector('.arrow img');
        const menuId = menuItem.id;

        if (menuContent) {
            menuContent.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Se il menu ha un submenu, gestiscilo come dropdown
                if (submenu && arrow) {
                    toggleRequesterSubmenu(submenu, arrow);                } else {
                    // Se non ha submenu, è un'azione diretta
                    handleDirectMenuAction(menuId);
                    closeAllRequesterSubmenus();
                }
            });
        }
    });
}

// Toggle submenu visibility and arrow direction for Requester
function toggleRequesterSubmenu(submenu, arrowImg) {
    const isActive = submenu.classList.contains('active');
    
    if (!isActive) {
        // Close all other submenus first (but not this one)
        closeAllRequesterSubmenus(submenu);
        
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

// Handle direct menu actions (menus without submenus)
async function handleDirectMenuAction(menuId) {
    const sectionMapping = {
        'elenco-telefonico': 'admin-visualizza-elenco-tel-sm-section',
        'crea-visita': 'admin-visitatori-crea-visite-section'
    };
    
    const sectionId = sectionMapping[menuId];
    if (sectionId) {
        showRequesterSection(sectionId);
          // Handle phone directory initialization
        if (menuId === 'elenco-telefonico' && !employeePhoneDirectoryTable) {
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
        
        // Handle create visit form initialization
        if (menuId === 'crea-visita') {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }

                await refreshJwt(); // Refresh JWT if needed
                await createVisitForm(); // Initialize form data
            } catch (error) {
                console.error('Error setting up create visit form:', error);
                alert('Errore durante il caricamento del form visita. Riprova più tardi.');
            }
        }
    }
}

// Close all submenus and reset arrows for Requester
function closeAllRequesterSubmenus(exceptSubmenu = null) {
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

// Initialize section navigation for Requester
function initializeRequesterSectionNavigation() {
    // Handle Home menu item
    const homeMenuItem = document.getElementById('home');
    if (homeMenuItem) {
        homeMenuItem.addEventListener('click', function() {
            showRequesterSection('admin-home-section');
            closeAllRequesterSubmenus();
        });
    }
    
    // Handle submenu items navigation
    const submenuItems = document.querySelectorAll('.submenu-item');
    
    submenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemId = this.id;
            const sectionId = getRequesterSectionIdFromMenuItem(itemId);
            
            if (sectionId) {
                showRequesterSection(sectionId);
                // Il submenu rimane aperto per permettere altre selezioni
            }
        });
    });
}

// Map menu item IDs to section IDs for Requester
function getRequesterSectionIdFromMenuItem(menuItemId) {
    const mapping = {
        // Visite submenu
        'visualizza-elenco-visite-odierne': 'admin-visualizza-elenco-visite-odierne-section',
        'visualizza-elenco-visite-future': 'admin-visualizza-elenco-visite-future-section'
    };
    
    return mapping[menuItemId] || null;
}

// Show specific section and hide others for Requester
function showRequesterSection(sectionId) {
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

// Close submenus when clicking outside for Requester
document.addEventListener('click', function(e) {
    if (!e.target.closest('.menu-item')) {
        closeAllRequesterSubmenus();
    }
});

let employeePhoneDirectoryTable = null;
let todayVisitsTable = null;
let futureVisitsTable = null;
let homeTodayVisitsTable = null;
let homeFutureVisitsTable = null;

async function setupEmployeePhoneDirectory() {
    document.getElementById('elenco-telefonico').addEventListener('click', async function () {
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

// Initialize home tables
async function initializeHomeTables() {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.log('No access token found for home tables');
            return;
        }

        await refreshJwt(); // Refresh JWT if needed
        initializeHomeTodayVisitsTable();
        initializeHomeFutureVisitsTable();
        await fetchAndPopulateHomeTodayVisits();
        await fetchAndPopulateHomeFutureVisits();
    } catch (error) {
        console.error('Error setting up home tables:', error);
    }
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

function initializeTodayVisitsTable() {
    todayVisitsTable = $('#todayVisitsTable').DataTable({
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
        order: [[1, 'asc'], [2, 'asc']], // Ordina prima per data inizio, poi per ora inizio
        columns: [            {
                title: 'Visitatore',
                data: null,
                render: function (data) {
                    return `${data.visitatore?.nome || ''} ${data.visitatore?.cognome || ''}`;
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
                    return formatTimeToHourMinute(data);
                }
            },
            {
                title: 'Data Fine',
                data: 'dataFine',
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data);
                }
            },            {
                title: 'Dettagli',
                data: null,
                render: function (data, type, row) {
                    return `<button onclick='showTodayVisitDetails(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button">Dettagli</button>`;
                }
            },
            {
                title: 'Modifica',
                data: null,
                render: function (data, type, row) {
                    return `<button onclick='showTodayVisitEditModal(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button edit-button">Modifica</button>`;
                }
            }
        ]
    });
}

function initializeFutureVisitsTable() {
    futureVisitsTable = $('#futureVisitsTable').DataTable({
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
        columns: [            {
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
                    return formatTimeToHourMinute(data);
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
                    return formatTimeToHourMinute(data);
                }
            },
            {
                title: 'Azioni',
                data: null,
                render: function (data, type, row) {
                    return `<button onclick='showFutureVisitDetails(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button">Dettagli</button>`;
                }
            }
        ]
    });
}

function initializeHomeTodayVisitsTable() {
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
            },            {
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

function initializeHomeFutureVisitsTable() {
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
            },            {
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

async function fetchAndPopulateTodayVisits() {
    try {
        // Get current user ID from JWT token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        if (!userId) {
            throw new Error('User ID not found in token');
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // Fetch visits using the by-date endpoint
        const response = await fetch(`http://localhost:8080/visit/by-date/${userId}?fromDate=${todayString}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const todayVisits = await response.json();
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
        // Get current user ID from JWT token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        if (!userId) {
            throw new Error('User ID not found in token');
        }

        // Fetch visits using the visit endpoint with user ID as query param
        const response = await fetch(`http://localhost:8080/visit?id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allVisits = await response.json();

        // Filter visits for future dates (from tomorrow onwards)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0]; // Get YYYY-MM-DD format

        const futureVisits = allVisits.filter(visit => {
            if (!visit.dataInizio) return false;
            const visitDate = new Date(visit.dataInizio).toISOString().split('T')[0];
            return visitDate >= tomorrowString;
        });

        futureVisitsTable.clear().rows.add(futureVisits).draw();

        // Show message if no future visits
        if (futureVisits.length === 0) {
            console.log('Nessuna visita programmata per il futuro');
        }

    } catch (error) {
        console.error('Error fetching future visits:', error);
        alert('Errore durante il recupero delle visite future.');
    }
}

async function fetchAndPopulateHomeTodayVisits() {
    try {
        // Get current user ID from JWT token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        if (!userId) {
            throw new Error('User ID not found in token');
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // Fetch visits using the by-date endpoint
        const response = await fetch(`http://localhost:8080/visit/by-date/${userId}?fromDate=${todayString}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const todayVisits = await response.json();
        
        // Limit to first 5 visits for home table
        const limitedVisits = todayVisits.slice(0, 5);
        
        if (homeTodayVisitsTable) {
            homeTodayVisitsTable.clear().rows.add(limitedVisits).draw();
        }

    } catch (error) {
        console.error('Error fetching home today visits:', error);
    }
}

async function fetchAndPopulateHomeFutureVisits() {
    try {
        // Get current user ID from JWT token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        if (!userId) {
            throw new Error('User ID not found in token');
        }

        // Fetch visits using the visit endpoint with user ID as query param
        const response = await fetch(`http://localhost:8080/visit?id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allVisits = await response.json();

        // Filter visits for future dates (from tomorrow onwards)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0]; // Get YYYY-MM-DD format

        const futureVisits = allVisits.filter(visit => {
            if (!visit.dataInizio) return false;
            const visitDate = new Date(visit.dataInizio).toISOString().split('T')[0];
            return visitDate >= tomorrowString;
        });

        // Limit to first 5 visits for home table
        const limitedVisits = futureVisits.slice(0, 5);
        
        if (homeFutureVisitsTable) {
            homeFutureVisitsTable.clear().rows.add(limitedVisits).draw();
        }

    } catch (error) {
        console.error('Error fetching home future visits:', error);
    }
}

function showTodayVisitDetails(visit) {
    // Populate visitor information
    document.getElementById('todayVisitorName').textContent = visit.visitatore?.nome || '';
    document.getElementById('todayVisitorSurname').textContent = visit.visitatore?.cognome || '';
    document.getElementById('todayVisitorEmail').textContent = visit.visitatore?.mail || '';
    document.getElementById('todayVisitorPhone').textContent = visit.visitatore?.telefono || visit.visitatore?.cellulare || '';

    // Format and populate dates
    const startDate = visit.dataInizio ? new Date(visit.dataInizio) : null;
    const endDate = visit.dataFine ? new Date(visit.dataFine) : null;
    const startTime = formatTimeToHourMinute(visit.oraInizio);
    const endTime = formatTimeToHourMinute(visit.oraFine);

    document.getElementById('todayStartDate').textContent = startDate ?
        `${startDate.toLocaleDateString('it-IT')} ${startTime}` : '';
    document.getElementById('todayEndDate').textContent = endDate ?
        `${endDate.toLocaleDateString('it-IT')} ${endTime}` : '';

    // Populate additional details
    document.getElementById('todayVisitReason').textContent = visit.motivo || '';
    document.getElementById('todayVisitDPI').textContent = visit.flagDPI ? 'Sì' : 'No';
    document.getElementById('todayVisitCar').textContent = visit.accessoConAutomezzo ? 'Sì' : 'No';

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

    // Format and populate dates
    const startDate = visit.dataInizio ? new Date(visit.dataInizio) : null;
    const endDate = visit.dataFine ? new Date(visit.dataFine) : null;
    const startTime = formatTimeToHourMinute(visit.oraInizio);
    const endTime = formatTimeToHourMinute(visit.oraFine);

    document.getElementById('futureStartDate').textContent = startDate ?
        `${startDate.toLocaleDateString('it-IT')} ${startTime}` : '';
    document.getElementById('futureEndDate').textContent = endDate ?
        `${endDate.toLocaleDateString('it-IT')} ${endTime}` : '';

    // Populate additional details
    document.getElementById('futureVisitReason').textContent = visit.motivo || '';
    document.getElementById('futureVisitDPI').textContent = visit.flagDPI ? 'Sì' : 'No';
    document.getElementById('futureVisitCar').textContent = visit.accessoConAutomezzo ? 'Sì' : 'No';

    // Show modal
    const modal = document.getElementById('futureVisitDetailsModal');
    modal.style.display = 'block';
}

// Show the edit modal and populate fields
function showTodayVisitEditModal(visit) {
    populateEditVisitSelects(visit);
 
    document.getElementById('editStartDate').value = visit.dataInizio ? visit.dataInizio.split('T')[0] : '';
    document.getElementById('editStartTime').value = visit.oraInizio || '';
    document.getElementById('editVisitReason').value = visit.motivo || '';
    document.getElementById('editVisitDPI').checked = !!visit.flagDPI;
    document.getElementById('editVisitCar').checked = !!visit.accessoConAutomezzo;
 
    document.getElementById('editVisitId').value = visit.id || '';
    document.getElementById('todayVisitEditModal').style.display = 'block';
}
 
// Popola i select del modal di modifica visita odierna
async function populateEditVisitSelects(selectedVisit) {
    const peopleUrl = "http://localhost:8080/people";
    const itProvisionUrl = "http://localhost:8080/it-provision";
    const accessToken = localStorage.getItem("accessToken");
    const visitors = [];
    const employees = [];
 
    try {
        // Persone
        const peopleResponse = await fetch(peopleUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        });
 
        if (!peopleResponse.ok) {
            throw new Error(`Errore nel recupero dei dati: ${peopleResponse.status}`);
        }
 
        const peopleData = await peopleResponse.json();
 
        peopleData.forEach(person => {
            if (person.azienda === "Secondo Mona") {
                employees.push(person);
            } else {
                visitors.push(person);
            }
        });
 
        // Popola select visitatore
        const visitorSelect = document.getElementById("editVisitIdPersona");
        if (visitorSelect) {
            visitorSelect.innerHTML = "<option></option>";
            visitors.forEach(visitor => {
                const option = document.createElement("option");
                option.innerHTML = `${visitor.nome} ${visitor.cognome} - ${visitor.azienda} - ${(visitor.email || visitor.mail || '')}`;
                option.value = visitor.idPersona;
                if (selectedVisit?.visitatore?.idPersona === visitor.idPersona) {
                    option.selected = true;
                }
                visitorSelect.appendChild(option);
            });
        }
 
        // Popola select responsabile
        const employeeSelect = document.getElementById("editVisitIdResponsabile");
        if (employeeSelect) {
            employeeSelect.innerHTML = "<option></option>";
            employees.forEach(employee => {
                const option = document.createElement("option");
                option.innerHTML = `${employee.nome} ${employee.cognome} - ${employee.azienda} - ${(employee.email || employee.mail || '')}`;
                option.value = employee.idPersona;
                if (selectedVisit?.responsabile?.idPersona === employee.idPersona) {
                    option.selected = true;
                }
                employeeSelect.appendChild(option);
            });
        }
 
        // Materiale informatico
        const itProvisionResponse = await fetch(itProvisionUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        });
 
        if (!itProvisionResponse.ok) {
            throw new Error(`Errore nel recupero dei dati: ${itProvisionResponse.status}`);
        }
 
        const itProvisionData = await itProvisionResponse.json();
 
        const itProvisionSelect = document.getElementById("editVisitIdMaterialeInformatico");
        if (itProvisionSelect) {
            itProvisionSelect.innerHTML = "<option></option>";
            itProvisionData.forEach(itProvision => {
                const option = document.createElement("option");
                option.innerHTML = `${itProvision.tipologia} - ${itProvision.marca} - ${itProvision.seriale}`;
                option.value = itProvision.id;
                if (selectedVisit?.materialeInformatico?.id === itProvision.id) {
                    option.selected = true;
                }
                itProvisionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Errore nel popolamento dei select del modal di modifica visita:", error.message);
        showVisitErrorModal("Errore durante il caricamento dei dati per la modifica della visita");
    }
}
 
// Modal close functionality
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

    // Setup modal close handlers for visit success modal
    const visitSuccessModal = document.getElementById('visitSuccessModal');
    const visitSuccessCloseBtn = visitSuccessModal?.querySelector('.close-modal');

    if (visitSuccessCloseBtn) {
        visitSuccessCloseBtn.onclick = function () {
            visitSuccessModal.style.display = 'none';
        }
    }    // Setup modal close handlers for visit error modal
    const visitErrorModal = document.getElementById('visitErrorModal');
    const visitErrorCloseBtn = visitErrorModal?.querySelector('.close-modal');

    if (visitErrorCloseBtn) {
        visitErrorCloseBtn.onclick = function () {
            visitErrorModal.style.display = 'none';
        }
    }

    // Setup modal close handlers for validation modal
    const validationModal = document.getElementById('validationModal');
    const validationCloseBtn = validationModal?.querySelector('.close-modal');

    if (validationCloseBtn) {
        validationCloseBtn.onclick = function () {
            validationModal.style.display = 'none';
        }
    }    // Setup modal close handlers for today visit edit modal
    const editModal = document.getElementById('todayVisitEditModal');
    const editCloseBtns = editModal?.querySelectorAll('.close-modal');
    if (editCloseBtns) {
        editCloseBtns.forEach(btn => {
            btn.onclick = function () {
                editModal.style.display = 'none';
            }
        });
    }

    // Handle clicking outside modal to close it
    window.onclick = function (event) {
        if (event.target === todayModal) {
            todayModal.style.display = 'none';
        }
        if (event.target === futureModal) {
            futureModal.style.display = 'none';
        }
        if (event.target === visitSuccessModal) {
            visitSuccessModal.style.display = 'none';
        }
        if (event.target === visitErrorModal) {
            visitErrorModal.style.display = 'none';
        }
        if (event.target === validationModal) {
            validationModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    }    // Add escape key handler for modals
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (todayModal && todayModal.style.display === 'block') {
                todayModal.style.display = 'none';
            }
            if (futureModal && futureModal.style.display === 'block') {
                futureModal.style.display = 'none';
            }
            if (visitSuccessModal && visitSuccessModal.style.display === 'block') {
                visitSuccessModal.style.display = 'none';
            }
            if (visitErrorModal && visitErrorModal.style.display === 'block') {
                visitErrorModal.style.display = 'none';
            }
            if (validationModal && validationModal.style.display === 'block') {
                validationModal.style.display = 'none';
            }
            if (editModal && editModal.style.display === 'block') {
                editModal.style.display = 'none';
            }
        }
    });
});

// Setup navigation buttons for home tables
function setupHomeNavigationButtons() {
    // Setup "Vai a Visitatori Oggi" button
    const viewAllTodayBtn = document.getElementById('viewAllTodayBtn');
    if (viewAllTodayBtn) {
        viewAllTodayBtn.addEventListener('click', async function() {
            showRequesterSection('admin-visualizza-elenco-visite-odierne-section');
            // Initialize and fetch data for today visits table
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
                    alert('Errore durante il caricamento delle visite odierne. Riprova più tardi.');
                }
            } else {
                // Refresh data if table already exists
                await fetchAndPopulateTodayVisits();
            }
        });
    }

    // Setup "Vai a Visitatori Futuri" button
    const viewAllFutureBtn = document.getElementById('viewAllFutureBtn');
    if (viewAllFutureBtn) {
        viewAllFutureBtn.addEventListener('click', async function() {
            showRequesterSection('admin-visualizza-elenco-visite-future-section');
            // Initialize and fetch data for future visits table
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
                    alert('Errore durante il caricamento delle visite future. Riprova più tardi.');
                }
            } else {
                // Refresh data if table already exists
                await fetchAndPopulateFutureVisits();
            }
        });
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

// Setup create visit form functionality
function setupCreateVisitForm() {
    // Add event listener to the create visit button
    const createVisitButton = document.getElementById('crea-visita-button');
    if (createVisitButton) {
        createVisitButton.addEventListener('click', createVisit);
    }
}

// Function to create the visit form for Requester
async function createVisitForm() {
    console.log("Inizializzazione form visita");
    const peopleUrl = "http://localhost:8080/people";
    const itProvisionUrl = "http://localhost:8080/it-provision";
    const accessToken = localStorage.getItem("accessToken");
    const visitors = new Array();
    const employees = new Array();

    try {
        // Fetch people data
        const peopleResponse = await fetch(peopleUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        });

        if (!peopleResponse.ok) {
            throw new Error(`Errore nel recupero dei dati people: ${peopleResponse.status}`);
        }

        const peopleData = await peopleResponse.json();
        console.log('peopleData:', peopleData);

        // Separate visitors and employees
        peopleData.forEach(person => {
            if (person.azienda === "Secondo Mona") {
                employees.push(person);
            } else {
                visitors.push(person);
            }
        });

        // Populate visitor select
        const visitorSelect = document.getElementById("idVisitatore-crea-visita");
        if (visitorSelect) {
            visitorSelect.innerHTML = "<option value=''>Seleziona visitatore</option>";
            visitors.forEach(visitor => {
                const option = document.createElement("option");
                option.innerHTML = `${visitor.nome} ${visitor.cognome} - ${visitor.azienda} - ${visitor.email || visitor.mail || ''}`;
                option.value = visitor.idPersona;
                visitorSelect.appendChild(option);
            });
        }

        // Populate employee select
        const employeeSelect = document.getElementById("idResponsabile-crea-visita");
        if (employeeSelect) {
            employeeSelect.innerHTML = "<option value=''>Seleziona responsabile</option>";
            employees.forEach(employee => {
                const option = document.createElement("option");
                option.innerHTML = `${employee.nome} ${employee.cognome} - ${employee.azienda} - ${employee.email || employee.mail || ''}`;
                option.value = employee.idPersona;
                employeeSelect.appendChild(option);
            });
        }

        // Fetch IT provision data
        const itProvisionResponse = await fetch(itProvisionUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        });

        if (!itProvisionResponse.ok) {
            throw new Error(`Errore nel recupero dei dati IT provision: ${itProvisionResponse.status}`);
        }

        const itProvisionData = await itProvisionResponse.json();
        console.log('itProvisionData:', itProvisionData);

        // Populate IT provision select
        const itProvisionSelect = document.getElementById("materiale-informatico-crea-visita");
        if (itProvisionSelect) {
            itProvisionSelect.innerHTML = "<option value=''>Seleziona materiale informatico</option>";
            itProvisionData.forEach(itProvision => {
                const option = document.createElement("option");
                option.innerHTML = `${itProvision.tipologia} - ${itProvision.marca} - ${itProvision.seriale}`;
                option.value = itProvision.id;
                itProvisionSelect.appendChild(option);
            });
        }

        console.log("Form visita inizializzato con successo");
    } catch (error) {
        console.error("Errore nella creazione del form visita:", error.message);
        alert('Errore nel caricamento dei dati del form. Riprova più tardi.');
    }
}

// Function to create a new visit
function createVisit(event) {
    event.preventDefault();
    console.log("Inizio creazione visita");

    // Get form values
    const idVisitatore = document.getElementById("idVisitatore-crea-visita").value;
    const idResponsabile = document.getElementById("idResponsabile-crea-visita").value;
    const idMaterialeInformatico = document.getElementById("materiale-informatico-crea-visita").value;
    const dataInizio = document.getElementById("data-inizio").value;
    const oraInizio = document.getElementById("ora-inizio").value;
    const motivo = document.getElementById("motivo").value;
    const flagAccessoConAutomezzo = document.getElementById("automezzo").checked;
    const flagDPI = document.getElementById("dpi").checked;    // Validate required fields
    if (!idVisitatore) {
        showValidationModal("Seleziona un visitatore");
        return;
    }
    if (!idResponsabile) {
        showValidationModal("Seleziona un responsabile");
        return;
    }
    if (!dataInizio) {
        showValidationModal("Inserisci la data di inizio");
        return;
    }
    if (!oraInizio) {
        showValidationModal("Inserisci l'ora di inizio");
        return;
    }
    if (!motivo.trim()) {
        showValidationModal("Inserisci il motivo della visita");
        return;
    }

    // Prepare request body
    const requestBody = {
        "dataInizio": dataInizio,
        "oraInizio": oraInizio,
        "dataFine": null,
        "oraFine": null,
        "motivo": motivo,
        "idVisitatore": parseInt(idVisitatore),
        "idResponsabile": parseInt(idResponsabile),
        "flagDPI": flagDPI,
        "idMaterialeInformatico": idMaterialeInformatico ? parseInt(idMaterialeInformatico) : null,
        "vincolo": null,
        "flagAccessoConAutomezzo": flagAccessoConAutomezzo
    };

    console.log("Request body:", requestBody);
    createVisitFetch(requestBody);
}

// Performs the fetch function to create a new visit
async function createVisitFetch(requestBody) {
    try {
        await refreshJwt(); // Refresh JWT if needed
        const url = "http://localhost:8080/visit";
        const accessToken = localStorage.getItem("accessToken");

        console.log("Invio richiesta creazione visita...");        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Errore nella creazione della visita: ${response.status} - ${errorData}`);
        }

        // Check if response has content before trying to parse JSON
        let responseData = null;
        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");
        
        if (contentType && contentType.includes("application/json") && contentLength !== "0") {
            try {
                responseData = await response.json();
                console.log("Visita creata con successo:", responseData);
            } catch (jsonError) {
                console.warn("Response is not valid JSON, but request was successful");
                responseData = { success: true, message: "Visita creata con successo" };
            }
        } else {
            // Response is empty or not JSON, but status is OK
            console.log("Visita creata con successo (risposta vuota dal server)");
            responseData = { success: true, message: "Visita creata con successo" };
        }          // Show success modal
        showVisitSuccessModal();
        
        // Reset form
        resetCreateVisitForm();
        
        // Refresh home tables if they exist (without reinitializing)
        if (homeTodayVisitsTable && homeFutureVisitsTable) {
            try {
                await fetchAndPopulateHomeTodayVisits();
                await fetchAndPopulateHomeFutureVisits();
            } catch (refreshError) {
                console.error('Error refreshing home tables:', refreshError);
            }
        }    } catch (error) {
        console.error("Errore nella creazione della visita:", error.message);
        showVisitErrorModal(`Errore nella creazione della visita: ${error.message}`);
    }
}

// Reset the create visit form
function resetCreateVisitForm() {
    // Reset all select elements
    const selects = ['idVisitatore-crea-visita', 'idResponsabile-crea-visita', 'materiale-informatico-crea-visita'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.selectedIndex = 0;
        }
    });

    // Reset input fields
    const inputs = ['data-inizio', 'ora-inizio', 'motivo'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });

    // Reset checkboxes
    const checkboxes = ['automezzo', 'dpi', 'prima-visita'];
    checkboxes.forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
}

// Function to initialize dropdown arrow toggle functionality
function initializeDropdownArrows() {
    // Get all select elements in form groups
    const selects = document.querySelectorAll('.form-group select, select');
    
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
            if (!event.target.closest('select')) {
                selects.forEach(s => s.classList.remove('opened'));
            }
        });
    });
}

// Show success modal for visit creation
function showVisitSuccessModal() {
    const modal = document.getElementById('visitSuccessModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Show error modal for visit creation
function showVisitErrorModal(errorMessage) {
    const modal = document.getElementById('visitErrorModal');
    const messageElement = document.getElementById('visitErrorMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = errorMessage || 'Si è verificato un errore durante la creazione della visita.';
        modal.style.display = 'block';
    }
}

// Hide visit modals
function hideVisitModals() {
    const successModal = document.getElementById('visitSuccessModal');
    const errorModal = document.getElementById('visitErrorModal');
    const validationModal = document.getElementById('validationModal');
    
    if (successModal) {
        successModal.style.display = 'none';
    }
    if (errorModal) {
        errorModal.style.display = 'none';
    }
    if (validationModal) {
        validationModal.style.display = 'none';
    }
}

// Show validation modal
function showValidationModal(message) {
    const modal = document.getElementById('validationModal');
    const messageElement = document.getElementById('validationMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'block';
    }
}

// Performs the fetch function to update an existing visit
async function updateVisitFetch(requestBody) {
    console.log('updateVisitFetch called');
    const visitId = document.getElementById('editVisitId')?.value || '';
    const url = "http://localhost:8080/visit/" + visitId;
    const accessToken = localStorage.getItem("accessToken");
 
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            body: JSON.stringify(requestBody)
        });
 
        if (!response.ok) {
            throw new Error(`Errore nell'aggiornamento della visita: ${response.status}`);
        }

        // Show success and close modal
        showVisitSuccessModal();
        document.getElementById('todayVisitEditModal').style.display = 'none';
        
        // Refresh the visits table
        if (typeof fetchAndPopulateTodayVisits === 'function') {
            await fetchAndPopulateTodayVisits();
        }
    }
    catch (error) {
        console.error("Errore nell'aggiornamento della visita:", error.message);
        showVisitErrorModal("Errore durante l'aggiornamento della visita. Riprova più tardi.");
    }
}

// Handle edit visit form submission
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('todayVisitEditForm');
    if (editForm) {
        editForm.onsubmit = async function (e) {
            e.preventDefault();
 
            // Validate required fields
            const idMaterialeInformatico = document.getElementById('editVisitIdMaterialeInformatico')?.value || '';
            if (!idMaterialeInformatico) {
                showValidationModal("Seleziona un materiale informatico!");
                return;
            }

            const visitId = document.getElementById('editVisitId')?.value || '';
            const idVisitatore = document.getElementById('editVisitIdPersona')?.value || '';
            const idResponsabile = document.getElementById('editVisitIdResponsabile')?.value || '';
            const dataInizio = document.getElementById('editStartDate')?.value || '';
            const oraInizio = document.getElementById('editStartTime')?.value || '';
            const motivo = document.getElementById('editVisitReason')?.value || '';

            // Additional validation
            if (!idVisitatore) {
                showValidationModal("Seleziona un visitatore!");
                return;
            }
            if (!idResponsabile) {
                showValidationModal("Seleziona un responsabile!");
                return;
            }
            if (!dataInizio) {
                showValidationModal("Inserisci la data di inizio!");
                return;
            }
            if (!oraInizio) {
                showValidationModal("Inserisci l'ora di inizio!");
                return;
            }
            if (!motivo.trim()) {
                showValidationModal("Inserisci il motivo della visita!");
                return;
            }

            const flagDPI = document.getElementById('editVisitDPI')?.checked || false;
            const flagAccessoConAutomezzo = document.getElementById('editVisitCar')?.checked || false;
 
            console.log('Form values:', {
                visitId, idVisitatore, idResponsabile, idMaterialeInformatico, dataInizio, oraInizio, motivo, flagDPI, flagAccessoConAutomezzo
            });
 
            const requestBody = {
                id: visitId,
                idVisitatore: idVisitatore,
                idResponsabile: idResponsabile,
                idMaterialeInformatico: idMaterialeInformatico,
                dataInizio: dataInizio,
                oraInizio: oraInizio,
                motivo: motivo,
                flagDPI: flagDPI,
                flagAccessoConAutomezzo: flagAccessoConAutomezzo
            };
 
            console.log('Calling updateVisitFetch');
            await updateVisitFetch(requestBody);
        };
    }
});
