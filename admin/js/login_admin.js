document.addEventListener("readystatechange", function () {
    if (document.readyState === "complete") {
        const logueado = localStorage.getItem("logueado-admin");
        if (logueado === "true") {
            // Redirección inmediata si ya está logueado
            window.location.replace("/admin/dashboard_admin.html");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-admin-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        const username = document.getElementById("admin-usuario").value.trim();
        const password = document.getElementById("admin-contraseña").value.trim();
        const errorBox = document.getElementById("admin-login-error");

        // Validación básica
        if (username === "" || password === "") {
            errorBox.innerText = "Debe completar todos los campos.";
            return;
        }

        try {
            const res = await fetch("https://backend-quynza-pages.vercel.app/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            // Intentar parseo robusto
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { error: text };
            }

            if (!res.ok) {
                errorBox.innerText = data.error || "Error al iniciar sesión";
                return;
            }

            // Guardar sesión admin (persistente)
            localStorage.setItem("logueado-admin", "true");
            localStorage.setItem("admin-username", data.username);

            // Redirección definitiva (evita botón atrás)
            window.location.replace("/admin/dashboard_admin.html");

        } catch (err) {
            console.error("Error de red:", err);
            errorBox.innerText = "Error de red al intentar iniciar sesión";
        }
    });
});