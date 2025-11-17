$(document).ready(function () {

    /* ============================================================
       AUTO-REDIRECCIÓN SI YA ESTÁ LOGUEADO
       ============================================================ */
    window.addEventListener("DOMContentLoaded", function () {
        const logueado = sessionStorage.getItem("logueado-logica");
        if (logueado === "true") {
            window.location.href = "/products/curso_logica/contenido/";
        }
    });


    /* ============================================================
       LOGIN DE USUARIO (CURSO LÓGICA)
       ============================================================ */
    $("#login-form-logica").on("submit", async function (e) {
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

            // Intentar parsear JSON de la respuesta
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { error: text };
            }

            if (res.ok) {

                // --------------------------------------------------------
                // Guardar información del usuario SOLO para Curso Lógica
                // --------------------------------------------------------
                sessionStorage.setItem("logica_user_id", data.user.id);
                sessionStorage.setItem("logica_username", data.user.username);

                // Marcador de sesión por curso
                sessionStorage.setItem("logueado-logica", "true");

                alert("Inicio de sesión exitoso");

                // Redirigir al contenido del curso
                window.location.href = "/products/curso_logica/contenido/";
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
