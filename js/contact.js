document.getElementById("contact-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const errorBox = document.getElementById("contact-response");
    const submitBtn = document.getElementById("contact-submit-btn");
    errorBox.innerHTML = "";
    errorBox.style.display = "none";

    // Anti-bot honeypot
    if (document.getElementById("hp").value !== "") {
        return; // bot detected, silently ignore
    }

    const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        company: document.getElementById("company").value.trim(),
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value.trim(),
        privacyAccepted: document.getElementById("privacy").checked,
        source_page: window.location.pathname,
    };

    // Validaciones robustas
    const validationError = validateContactData(data);
    if (validationError) {
        errorBox.innerHTML = `<div class="alert alert-danger">${validationError}</div>`;
        errorBox.style.display = "block";
        return;
    }

    // Anti-Flood: 1 envío cada 30 segundos
    const lastSent = localStorage.getItem("last_contact_time");
    if (lastSent && Date.now() - lastSent < 30000) {
        errorBox.innerHTML =
            `<div class="alert alert-warning">Debes esperar unos segundos antes de enviar otro mensaje.</div>`;
        errorBox.style.display = "block";
        return;
    }

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
        const res = await fetch("https://backend-quynza-pages.vercel.app/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } 
        catch { json = { error: text }; }

        if (res.ok) {
            localStorage.setItem("last_contact_time", Date.now());

            errorBox.innerHTML =
                `<div class="alert alert-success">
                    Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.
                </div>`;
            errorBox.style.display = "block";

            document.getElementById("contact-form").reset();
        } else {
            errorBox.innerHTML =
                `<div class="alert alert-danger">Error: ${json.error || "No se pudo enviar el mensaje"}</div>`;
            errorBox.style.display = "block";
        }

    } catch (err) {
        console.error(err);
        errorBox.innerHTML =
            `<div class="alert alert-danger">No se pudo conectar con el servidor.</div>`;
        errorBox.style.display = "block";
    }

    // Restaurar botón
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Mensaje";
});


// ---------------------------------------------------------------
// VALIDADOR GENERAL (Robusto)
// ---------------------------------------------------------------
function validateContactData(data) {

    if (data.name.length < 3) {
        return "El nombre debe tener al menos 3 caracteres.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return "Ingresa un correo electrónico válido.";
    }

    if (!data.subject || data.subject === "") {
        return "Debes seleccionar un motivo de contacto.";
    }

    if (data.message.length < 10) {
        return "El mensaje debe tener al menos 10 caracteres.";
    }

    if (data.message.length > 2000) {
        return "El mensaje es demasiado largo (máximo 2000 caracteres).";
    }

    if (!data.privacyAccepted) {
        return "Debes aceptar la política de tratamiento de datos.";
    }

    if (data.phone.length > 0) {
        const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
        if (!phoneRegex.test(data.phone)) {
            return "El teléfono contiene un formato inválido.";
        }
    }

    const forbidden = /<script|<\/script|javascript:/i;
    if (forbidden.test(data.message)) {
        return "El mensaje contiene contenido no permitido.";
    }

    if (/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(data.message)) {
        return "El mensaje debe contener contenido significativo.";
    }

    return null; // Todo OK
}
