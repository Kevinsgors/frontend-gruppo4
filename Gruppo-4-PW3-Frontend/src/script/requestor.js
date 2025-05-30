// Dashboard Requester JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeRequesterMenus();
    initializeRequesterSectionNavigation();
    setupEmployeePhoneDirectory();
    setupTodayVisits();
    setupFutureVisits();
    initializeHomeTables();
    setupHomeNavigationButtons(); // Setup navigation buttons for home tables
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
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf'
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
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
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf'
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
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
                    return `<button onclick='showTodayVisitDetails(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button">Dettagli</button>`;
                }
            }
        ]
    });
}

function initializeFutureVisitsTable() {
    futureVisitsTable = $('#futureVisitsTable').DataTable({
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf'
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
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
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        ordering: true,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
        },
        order: [[1, 'asc'], [2, 'asc']], // Ordina prima per data inizio, poi per ora inizio
        columns: [
            {
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
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function (data) {
                    return formatTimeToHourMinute(data);
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
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        ordering: true,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
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

    // Handle clicking outside modal to close it
    window.onclick = function (event) {
        if (event.target === todayModal) {
            todayModal.style.display = 'none';
        }
        if (event.target === futureModal) {
            futureModal.style.display = 'none';
        }
    }
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
