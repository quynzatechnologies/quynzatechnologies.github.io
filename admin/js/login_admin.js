document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-admin-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("admin-usuario").value.trim();
        const password = document.getElementById("admin-contraseña").value.trim();

        const res = await fetch("https://backend-quynza-pages.vercel.app/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            document.getElementById("admin-login-error").innerText =
                data.error || "Error al iniciar sesión";
            return;
        }

        // Guardar sesión admin
        sessionStorage.setItem("admin", "true");
        sessionStorage.setItem("admin-username", data.username);

        window.location.href = "/admin/dashboard_admin.html";
    });
});
