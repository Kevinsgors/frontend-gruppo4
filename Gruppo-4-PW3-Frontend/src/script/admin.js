// Dashboard Admin JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeMenus();
    initializeSectionNavigation();
    setupTodayVisits();
    setupFutureVisits();
    setupPeopleList();
});

// Initialize dropdown menu functionality
function initializeMenus() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(menuItem => {
        const menuContent = menuItem.querySelector('.menu-content');
        const submenu = menuItem.querySelector('.submenu');
        const arrow = menuItem.querySelector('.arrow img');
        
        // Only add click handler if menu has submenu
        if (menuContent && submenu && arrow) {
            menuContent.addEventListener('click', function(e) {
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
        homeMenuItem.addEventListener('click', function() {
            showSection('admin-home-section');
            closeAllSubmenus();
        });
    }      // Handle submenu items navigation
    const submenuItems = document.querySelectorAll('.submenu-item');
    
    submenuItems.forEach(item => {
        item.addEventListener('click', function() {
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
        'admin-visite-personali': 'admin-visualizza-elenco-visite-personali-section',
          // Storico submenu
        'storico-visite': 'admin-storico-timbrature-visite-section',
        'storico-timbrature-visitatori': 'admin-storico-timbrature-visitatori-section',
        'storico-timbrature-dipendenti': 'admin-storico-timbrature-dipendenti-section',
        'storico-timbrature-mensa': 'admin-storico-timbrature-mensa-section',
        
        // Persone submenu
        'visitatori-crea-visite': 'admin-visitatori-crea-visite-section',
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
document.addEventListener('click', function(e) {
    if (!e.target.closest('.menu-item')) {
        closeAllSubmenus();
    }
});

let todayVisitsTable = null;
let futureVisitsTable = null;
let peopleTable = null;

async function setupTodayVisits() {
    // Initialize DataTable when the visualizza-elenco-visite-odierne menu item is clicked
    document.getElementById('visualizza-elenco-visite-odierne').addEventListener('click', async function() {
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
    document.getElementById('visualizza-elenco-visite-future').addEventListener('click', async function() {
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
    document.getElementById('visualizza-elenco-persone').addEventListener('click', async function() {
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
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf'
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
        },
        order: [[1, 'asc'], [2, 'asc']], // Ordina prima per data inizio, poi per ora inizio
        columns: [
            { 
                title: 'Visitatore',
                data: null,
                render: function(data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            { 
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function(data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                title: 'Data Fine',
                data: 'dataFine',
                render: function(data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function(data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            },
            {
                title: 'Azioni',
                data: null,
                render: function(data, type, row) {
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
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
        },
        order: [[1, 'asc'], [2, 'asc']], // Ordina prima per data inizio, poi per ora inizio
        columns: [
            { 
                title: 'Visitatore',
                data: null,
                render: function(data) {
                    return `${data.personaVisitatore?.nome || ''} ${data.personaVisitatore?.cognome || ''}`;
                }
            },
            { 
                title: 'Data Inizio',
                data: 'dataInizio',
                render: function(data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Inizio',
                data: 'oraInizio',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                title: 'Data Fine',
                data: 'dataFine',
                render: function(data) {
                    return data ? new Date(data).toLocaleDateString('it-IT') : '';
                }
            },
            {
                title: 'Ora Fine',
                data: 'oraFine',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Dipendente',
                data: null,
                render: function(data) {
                    return `${data.responsabile?.nome || ''} ${data.responsabile?.cognome || ''}`;
                }
            },
            {
                title: 'Azioni',
                data: null,
                render: function(data, type, row) {
                    return `<button onclick='showFutureVisitDetails(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button">Dettagli</button>`;
                }
            }
        ]
    });
}

function initializePeopleTable() {
    peopleTable = $('#peopleTable').DataTable({
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf'
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/it-IT.json'
        },
        order: [[1, 'asc'], [0, 'asc']], // Ordina per cognome, poi per nome
        columns: [
            { 
                title: 'Nome',
                data: 'nome',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                title: 'Cognome',
                data: 'cognome',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Email',
                data: 'mail',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                title: 'Telefono',
                data: 'telefono',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Cellulare',
                data: 'cellulare',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Azienda',
                data: 'azienda',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Ruolo',
                data: 'ruolo',
                render: function(data) {
                    return data || '';
                }
            },
            {
                title: 'Azioni',
                data: null,
                render: function(data, type, row) {
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
    const startTime = visit.oraInizio || '';
    const endTime = visit.oraFine || '';

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
    const startTime = visit.oraInizio || '';
    const endTime = visit.oraFine || '';

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
    document.getElementById('personRole').textContent = person.ruolo || '';
    document.getElementById('personEmployeeId').textContent = person.idDipendente || '';

    // Show modal
    const modal = document.getElementById('personDetailsModal');
    modal.style.display = 'block';
}

// Modal close functionality for today visits, future visits, and person details
document.addEventListener('DOMContentLoaded', function() {
    // Setup modal close handlers for today visits modal
    const todayModal = document.getElementById('todayVisitDetailsModal');
    const todayCloseBtn = todayModal?.querySelector('.close-modal');

    if (todayCloseBtn) {
        todayCloseBtn.onclick = function() {
            todayModal.style.display = 'none';
        }
    }

    // Setup modal close handlers for future visits modal
    const futureModal = document.getElementById('futureVisitDetailsModal');
    const futureCloseBtn = futureModal?.querySelector('.close-modal');

    if (futureCloseBtn) {
        futureCloseBtn.onclick = function() {
            futureModal.style.display = 'none';
        }
    }

    // Setup modal close handlers for person details modal
    const personModal = document.getElementById('personDetailsModal');
    const personCloseBtn = personModal?.querySelector('.close-modal');

    if (personCloseBtn) {
        personCloseBtn.onclick = function() {
            personModal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
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
    document.addEventListener('keydown', function(event) {
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