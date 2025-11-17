$(document).ready(function () {

    /* ============================================================
       AUTO-REDIRECCIÓN SI YA ESTÁ LOGUEADO (CURSO MICROPYTHON)
       ============================================================ */
    window.addEventListener("DOMContentLoaded", function () {
        const logueado = sessionStorage.getItem("logueado-micropython");
        if (logueado === "true") {
            window.location.href = "/products/curso_micropython/contenido/";
        }
    });


    /* ============================================================
       LOGIN DE USUARIO (CURSO MICROPYTHON)
       ============================================================ */
    $("#login-form-micropython").on("submit", async function (e) {
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

            // Parsear JSON
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { error: text };
            }

            if (res.ok) {

                // --------------------------------------------------------
                // Guardar información de usuario SOLO para este curso
                // --------------------------------------------------------
                sessionStorage.setItem("micropython_user_id", data.user.id);
                sessionStorage.setItem("micropython_username", data.user.username);

                // Marcador de login por curso
                sessionStorage.setItem("logueado-micropython", "true");

                alert("Inicio de sesión exitoso");

                // Redirigir directamente al contenido
                window.location.href = "/products/curso_micropython/contenido/";
            }
            else {
                alert(data.error || "Error en inicio de sesión");
            }

        } catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de red al iniciar sesión");
        }

        return false;
    });


    /* ============================================================
       REGISTRO DE NUEVO USUARIO
       ============================================================ */
    $("#register-form").on("submit", async function (e) {
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
        }
        catch (err) {
            console.error("Error en fetch:", err);
            alert("Error de red al registrar usuario");
        }

        return false;
    });

});
