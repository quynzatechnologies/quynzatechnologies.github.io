let mensajesOriginales = [];   // Lista original desde backend

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("admin") !== "true") {
        window.location.href = "/admin/login_admin.html";
        return;
    }

    cargarMensajes();

    // Filtros dinámicos
    document.getElementById("search-input").addEventListener("input", filtrarMensajes);
    document.getElementById("filter-subject").addEventListener("change", filtrarMensajes);
    document.getElementById("filter-date-from").addEventListener("change", filtrarMensajes);
    document.getElementById("filter-date-to").addEventListener("change", filtrarMensajes);
});

// ==========================
// CARGAR MENSAJES
// ==========================
async function cargarMensajes() {
    const container = document.getElementById("messages-container");
    container.innerHTML = "Cargando mensajes...";

    try {
        const res = await fetch("https://backend-quynza-pages.vercel.app/api/admin/messages/list");
        const data = await res.json();

        mensajesOriginales = data;
        renderizarTabla(mensajesOriginales);

    } catch (err) {
        console.error(err);
        container.innerHTML = "Error al cargar mensajes.";
    }
}

// ==========================
// FILTRADO Y BÚSQUEDA
// ==========================
function filtrarMensajes() {
    const texto = document.getElementById("search-input").value.toLowerCase();
    const motivo = document.getElementById("filter-subject").value;
    const desde = document.getElementById("filter-date-from").value;
    const hasta = document.getElementById("filter-date-to").value;

    let filtrados = mensajesOriginales.filter(msg => {
        let coincideTexto =
            msg.name.toLowerCase().includes(texto) ||
            msg.email.toLowerCase().includes(texto) ||
            msg.message.toLowerCase().includes(texto);

        let coincideMotivo = motivo ? msg.subject === motivo : true;

        let fecha = new Date(msg.created_at);

        let coincideFechaDesde = desde ? fecha >= new Date(desde) : true;

        let coincideFechaHasta = hasta ? fecha <= new Date(hasta) : true;

        return coincideTexto && coincideMotivo && coincideFechaDesde && coincideFechaHasta;
    });

    renderizarTabla(filtrados);
}

// ==========================
// RENDERIZAR TABLA
// ==========================
function renderizarTabla(lista) {
    const container = document.getElementById("messages-container");

    if (lista.length === 0) {
        container.innerHTML = "<p>No se encontraron mensajes con los filtros actuales.</p>";
        return;
    }

    let html = `
    <table class="table table-striped table-bordered">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Motivo</th>
                <th>Mensaje</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
    `;

    lista.forEach(msg => {
        html += `
        <tr class="${msg.read ? "" : "unread-row"}">
            <td>${new Date(msg.created_at).toLocaleString()}</td>
            <td>${msg.name}</td>
            <td>${msg.email}</td>
            <td>${msg.subject}</td>
            <td class="message-body">${msg.message}</td>

            <td>
                ${msg.read ? "" : `<button class="btn btn-success btn-sm" onclick="marcarLeido('${msg.id}')">Marcar leído</button>`}
                <button class="btn btn-danger btn-sm" onclick="eliminarMensaje('${msg.id}')">Eliminar</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ==========================
// MARCAR COMO LEÍDO
// ==========================
async function marcarLeido(id) {
    await fetch("https://backend-quynza-pages.vercel.app/api/admin/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    cargarMensajes();
}

// ==========================
// ELIMINAR MENSAJE
// ==========================
async function eliminarMensaje(id) {
    if (!confirm("¿Seguro que quieres eliminar este mensaje?")) return;

    await fetch("https://backend-quynza-pages.vercel.app/api/admin/messages/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    cargarMensajes();
}
