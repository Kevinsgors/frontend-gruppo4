class InvalidTokenError extends Error {}

function b64DecodeUnicode(e) {
    return decodeURIComponent(atob(e).replace(/(.)/g, ((e, r) => {
        let o = r.charCodeAt(0).toString(16).toUpperCase();
        return o.length < 2 && (o = "0" + o),
            "%" + o
    }
    )))
}

function base64UrlDecode(e) {
    let r = e.replace(/-/g, "+").replace(/_/g, "/");
    switch (r.length % 4) {
        case 0:
            break;
        case 2:
            r += "==";
            break;
        case 3:
            r += "=";
            break;
        default:
            throw new Error("base64 string is not of the correct length")
    }
    try {
        return b64DecodeUnicode(r)
    } catch (e) {
        return atob(r)
    }
}

function jwtDecode(e, r) {
    if ("string" != typeof e)
        throw new InvalidTokenError("Invalid token specified: must be a string");
    r || (r = {});
    const o = !0 === r.header ? 0 : 1
        , t = e.split(".")[o];
    if ("string" != typeof t)
        throw new InvalidTokenError(`Invalid token specified: missing part #${o + 1}`);
    let n;
    try {
        n = base64UrlDecode(t)
    } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${o + 1} (${e.message})`)
    }
    try {
        return JSON.parse(n)
    } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${o + 1} (${e.message})`)
    }
};

async function refreshJwt() {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
        const decodedAccessToken = jwtDecode(accessToken);
        const now = Math.floor(Date.now() / 1000);

        if (now > decodedAccessToken.exp) {
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                const decodedRefreshToken = jwtDecode(refreshToken);

                if (now < decodedRefreshToken.exp) {
                     refreshLogin(refreshToken);
                } 
                else {
                    window.location.href = "/index.html";
                }
            } 
            else {
                window.location.href = "/index.html";
            }
        } else {
            return;
        }
    } else {
        window.location.href = "/index.html";
    }
};

async function refreshLogin(refreshToken) {
    const url = "http://localhost:8080/auth/refresh";

    const response = await fetch(url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + refreshToken
            },
        });

    if (!response.ok) {
        window.location.href = "index.html"
    }
    else {
        const json = await response.json();
        localStorage.setItem("accessToken", json.accessToken);
    }
};