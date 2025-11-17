document.addEventListener("DOMContentLoaded", () => {

    // Seguridad redundante: evitar acceso sin login administrativo
    const isAdmin = localStorage.getItem("logueado-admin");
    const adminName = localStorage.getItem("admin-username");

    if (isAdmin !== "true") {
        window.location.href = "/admin/login_admin.html";
        return;
    }

    // Mostrar nombre del administrador
    if (adminName) {
        const nameEl = document.getElementById("admin-name");
        if (nameEl) nameEl.textContent = adminName;
    }

    // Cargar estadísticas iniciales
    cargarEstadisticas();

    // Mostrar nombre de usuario en el dashboard
    const el = document.getElementById("usuario-admin");
    if (!el) return;

    const username = localStorage.getItem("admin-username");
    if (username) {
        el.textContent = "👤 " + username;
    }
});

/**
 * Cargar estadísticas globales del sistema desde el backend
 * Este endpoint lo implementaremos luego: /api/admin/stats
 */
async function cargarEstadisticas() {
    const statsContainer = document.getElementById("stats");

    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <p>Cargando estadísticas...</p>
    `;

    try {
        // Llamada al futuro endpoint de estadísticas
        const res = await fetch("https://backend-quynza-pages.vercel.app/api/admin/stats");

        if (!res.ok) {
            statsContainer.innerHTML = `<p>Error al obtener estadísticas.</p>`;
            return;
        }

        const data = await res.json();

        // Renderizar estadísticas recibidas
        statsContainer.innerHTML = `
            <div class="panel panel-default">
                <div class="panel-heading"><h3 class="panel-title">Estadísticas Globales</h3></div>
                <div class="panel-body">

                    <p><strong>Usuarios registrados:</strong> ${data.usersCount}</p>
                    <p><strong>Mensajes de contacto:</strong> ${data.messagesCount}</p>
                    <p><strong>Cursos activos:</strong> ${data.coursesCount}</p>
                    <p><strong>Sesiones totales:</strong> ${data.sessionsCount}</p>

                </div>
            </div>
        `;
    }
    catch (err) {
        console.error("Error obteniendo estadísticas:", err);
        statsContainer.innerHTML = `<p>Error cargando estadísticas.</p>`;
    }
}
