

$(document).ready(function(){
    // Verificar si ya está logueado
    window.addEventListener('DOMContentLoaded', function() {
        const logueado = sessionStorage.getItem("logueado-logica");
        if (logueado === "true") {
            // Si ya está logueado, redirigir directo al curso
            window.location.href = "/products/curso_logica/contenido/";
        }
    });

    // --- LOGIN ---
    $("#login-form-logica").on("submit", async function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        const username = $("#usuario").val();
        const password = $("#contraseña").val();

        try {
            const res = await fetch("https://backend-quynza-pages.vercel.app/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { error: text };
            }

            if (res.ok) {
                // Guardar estado de login en sessionStorage
                sessionStorage.setItem("logueado-logica", "true");
                alert("Inicio de sesión exitoso");

                // Redirigir al curso
                window.location.href = "/products/curso_logica/contenido/";
            } else {
                alert((data.error || "Error en inicio de sesión"));
            }
        } catch(err) {
            console.error("Error en fetch:", err);
            alert("Error de red al iniciar sesión");
        }

        return false;
    });

    // --- REGISTRO ---
    $("#register-form").on("submit", async function(e){
        e.preventDefault(); 
        e.stopImmediatePropagation();
        
        const code = $("#code").val();
        const username = $("#new-usuario").val();
        const password = $("#new-contraseña").val();

        try {
            const res = await fetch("https://backend-quynza-pages.vercel.app/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, username, password })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { error: text };
            }

            if (res.ok) {
                alert("✅ " + (data.message || "Usuario registrado con éxito"));
            } else {
                alert("❌ " + (data.error || "Error al registrar usuario"));
            }
        } catch(err) {
            console.error("Error en fetch:", err);
            alert("Error de red al registrar usuario");
        }

        return false;
    });
});