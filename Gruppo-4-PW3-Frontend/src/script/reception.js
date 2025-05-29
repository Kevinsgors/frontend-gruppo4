// Dashboard Admin JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeMenus();
    initializeSectionNavigation();
    setupVisitsHistory();
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
document.addEventListener('click', function(e) {
    if (!e.target.closest('.menu-item')) {
        closeAllSubmenus();
    }
});

let visitsTable = null;

async function setupVisitsHistory() {
    // Initialize DataTable when the storico-visite menu item is clicked
    document.getElementById('storico-visite').addEventListener('click', async function() {
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

function initializeVisitsTable() {    visitsTable = $('#visitsTable').DataTable({
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
                    // Pass the entire row data to showVisitDetails
                    return `<button onclick='showVisitDetails(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="action-button">Dettagli</button>`;
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

function showVisitDetails(visit) {
    // Populate visitor information
    document.getElementById('visitorName').textContent = visit.personaVisitatore?.nome || '';
    document.getElementById('visitorSurname').textContent = visit.personaVisitatore?.cognome || '';
    document.getElementById('visitorEmail').textContent = visit.personaVisitatore?.mail || '';
    document.getElementById('visitorPhone').textContent = visit.personaVisitatore?.telefono || visit.personaVisitatore?.cellulare || '';
    
    // Populate employee information
    document.getElementById('employeeName').textContent = visit.responsabile?.nome || '';
    document.getElementById('employeeSurname').textContent = visit.responsabile?.cognome || '';
    document.getElementById('employeeEmail').textContent = visit.responsabile?.mail || '';

    // Format and populate dates
    const startDate = visit.dataInizio ? new Date(visit.dataInizio) : null;
    const endDate = visit.dataFine ? new Date(visit.dataFine) : null;
    const startTime = visit.oraInizio || '';
    const endTime = visit.oraFine || '';

    document.getElementById('startDate').textContent = startDate ? 
        `${startDate.toLocaleDateString('it-IT')} ${startTime}` : '';
    document.getElementById('endDate').textContent = endDate ? 
        `${endDate.toLocaleDateString('it-IT')} ${endTime}` : '';

    // Populate additional details
    document.getElementById('visitReason').textContent = visit.motivo || '';
    document.getElementById('visitDPI').textContent = visit.flagDPI ? 'Sì' : 'No';
    document.getElementById('visitCar').textContent = visit.flagAccessoConAutomezzo ? 'Sì' : 'No';

    // Show modal
    const modal = document.getElementById('visitDetailsModal');
    modal.style.display = 'block';
}

// Modal close functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup modal close handlers
    const modal = document.getElementById('visitDetailsModal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    // Add escape key handler for modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});
