document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", login);
});

async function login(event) {
    event.preventDefault();
    const inputEmail = document.getElementById("email").value
    const inputPassword = document.getElementById("password").value;

    const url = "http://localhost:8080/auth/login";
    const requestBody = {
        email: inputEmail,
        password: inputPassword
    }

    try {
        const response = await fetch(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            });

        if (!response.ok) {
            // Mostra la modale errore con messaggio personalizzato
            mostraModalErrore("Email o password errati");
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        localStorage.setItem("accessToken", json.accessToken)
        localStorage.setItem("refreshToken", json.refreshToken)
        roleRedirection();
    }
    catch (error) {
        // Mostra la modale errore solo se non già mostrata
        if (!modalErroreAperta) {
            mostraModalErrore("Errore di accesso. Riprova.");
        }
        console.error(error);
    }
};

function roleRedirection() {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
        const decodedToken = jwtDecode(accessToken);

        if (decodedToken.groups.indexOf("Admin") >= 0) {
            window.location.href = "/pages/dashboardAdmin.html";
        }
        else if (decodedToken.groups.indexOf("Requester") >= 0) {
            window.location.href = "/pages/dashboardRequester.html";
        }
        else if (decodedToken.groups.indexOf("Reception") >= 0) {
            window.location.href = "/pages/dashboardReceptionist.html";
        }
        else {
            window.location.href = "index.html";
        }
    }
};

let modalErroreAperta = false;
let modalErroreKeydownHandler = null;

function mostraModalErrore(testo) {
    const overlay = document.getElementById("modal-errore-overlay");
    const modal = document.getElementById("modal-errore");
    const text = modal.querySelector(".modal-text");
    if (testo) text.textContent = testo;
    overlay.style.display = "flex";
    modalErroreAperta = true;
    
    // Chiudi la modale cliccando sull'overlay (ma non sulla modale stessa)
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            chiudiModalErrore();
        }
    };
    
    // Chiudi la modale con qualsiasi tasto
    modalErroreKeydownHandler = function(e) {
        chiudiModalErrore();
        e.preventDefault();
        e.stopPropagation();
    };
    document.addEventListener("keydown", modalErroreKeydownHandler, true);
    
    // Chiudi la modale cliccando la X
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = chiudiModalErrore;
    }
    document.body.classList.add("modal-open");
}

function chiudiModalErrore() {
    const overlay = document.getElementById("modal-errore-overlay");
    overlay.style.display = "none";
    overlay.onclick = null;  // Rimuovi handler click
    
    // Rimuovi handler X
    const modal = document.getElementById("modal-errore");
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    if (closeBtn) closeBtn.onclick = null;
    
    modalErroreAperta = false;
    if (modalErroreKeydownHandler) {
        document.removeEventListener("keydown", modalErroreKeydownHandler, true);
        modalErroreKeydownHandler = null;
    }
    document.body.classList.remove("modal-open");
}
