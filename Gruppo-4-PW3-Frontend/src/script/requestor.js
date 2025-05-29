// Dashboard Requester JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeRequesterMenus();
    initializeRequesterSectionNavigation();
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
                    toggleRequesterSubmenu(submenu, arrow);
                } else {
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
function handleDirectMenuAction(menuId) {
    const sectionMapping = {
        'elenco-telefonico': 'admin-visualizza-elenco-tel-sm-section',
        'crea-visita': 'admin-visitatori-crea-visite-section'
    };
    
    const sectionId = sectionMapping[menuId];
    if (sectionId) {
        showRequesterSection(sectionId);
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