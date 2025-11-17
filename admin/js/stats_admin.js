/* ============================================================
   stats_admin.js – Dashboard Premium (Versión Estable)
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    await cargarEstadisticas();

    // Mostrar nombre de usuario en el dashboard
    const el = document.getElementById("usuario-admin");
    if (!el) return;

    const username = localStorage.getItem("admin-username");
    if (username) {
        el.textContent = "👤 " + username;
    }
});

/* ============================================================
   Helpers para seguridad de datos
   ============================================================ */
function safeArray(a) {
    return Array.isArray(a) ? a : [];
}
function safeNumber(n) {
    return isFinite(n) ? n : 0;
}
function safeDate(d) {
    if (!d) return "–";
    const t = new Date(d);
    return isNaN(t) ? "–" : t.toLocaleString("es-CO");
}

function noDataMessage(canvasId, msg = "No hay datos suficientes") {
    const canvas = document.getElementById(canvasId);
    const parent = canvas.parentElement;

    const div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.padding = "25px 10px";
    div.style.color = "#777";
    div.textContent = msg;

    // Oculta canvas
    canvas.style.display = "none";
    parent.appendChild(div);
}

/* ============================================================
   1. ENDPOINTS
   ============================================================ */

const ENDPOINT_BASE = "https://backend-quynza-pages.vercel.app/api/admin/stats";

const ENDPOINTS = {
    global: `${ENDPOINT_BASE}?view=global`,
    usuarios: `${ENDPOINT_BASE}?view=usuarios`,
    populares: `${ENDPOINT_BASE}?view=lecciones-populares`,
    abandonadas: `${ENDPOINT_BASE}?view=lecciones-abandonadas`,
    actividad_hora: `${ENDPOINT_BASE}?view=actividad-hora`,
    actividad_dia: `${ENDPOINT_BASE}?view=actividad-dia`,
    tiempo_lectura: `${ENDPOINT_BASE}?view=tiempo-lectura`,
    ranking: `${ENDPOINT_BASE}?view=ranking`,
    ultima: `${ENDPOINT_BASE}?view=ultima`,
};

/* ============================================================
   2. FUNCIÓN PRINCIPAL
   ============================================================ */

async function cargarEstadisticas() {
    try {
        const [
            globalStats,
            usuariosStats,
            popularesStats,
            abandonadasStats,
            actividadHoraStats,
            actividadDiaStats,
            tiempoLecturaStats,
            rankingStats,
            ultimaStats
        ] = await Promise.all([
            fetchJSON(ENDPOINTS.global),
            fetchJSON(ENDPOINTS.usuarios),
            fetchJSON(ENDPOINTS.populares),
            fetchJSON(ENDPOINTS.abandonadas),
            fetchJSON(ENDPOINTS.actividad_hora),
            fetchJSON(ENDPOINTS.actividad_dia),
            fetchJSON(ENDPOINTS.tiempo_lectura),
            fetchJSON(ENDPOINTS.ranking),
            fetchJSON(ENDPOINTS.ultima),
        ]);

        pintarKPIs(globalStats, ultimaStats);
        graficosCompletado(globalStats);
        graficosUsuarios(globalStats);
        graficoActividadHora(actividadHoraStats);
        graficoActividadDia(actividadDiaStats);
        tablaRanking(rankingStats);
        tablaPopulares(popularesStats);
        tablaAbandonadas(abandonadasStats);

    } catch (err) {
        console.error("Error cargando estadísticas:", err);
    }
}

/* ============================================================
   3. Helper Fetch
   ============================================================ */

async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Error en fetch " + url);
    const json = await r.json();
    return safeArray(json.data);
}

/* ============================================================
   4. KPIs
   ============================================================ */

function pintarKPIs(globalDataRaw, ultimaRaw) {
    const globalData = safeArray(globalDataRaw);

    const logica = globalData.find(x => x.curso === "logica") || {};
    const iot = globalData.find(x => x.curso === "iot") || {};
    const micro = globalData.find(x => x.curso === "micropython") || {};

    document.getElementById("kpi_logica_users").textContent = safeNumber(logica.usuarios_unicos);
    document.getElementById("kpi_iot_users").textContent = safeNumber(iot.usuarios_unicos);
    document.getElementById("kpi_micropython_users").textContent = safeNumber(micro.usuarios_unicos);

    const ultima = safeArray(ultimaRaw).sort(
        (a, b) => new Date(b.ultima_visita) - new Date(a.ultima_visita)
    )[0];

    document.getElementById("kpi_last_activity").textContent =
        ultima ? safeDate(ultima.ultima_visita) : "–";
}

/* ============================================================
   5. Gráfico de Completado
   ============================================================ */

function graficosCompletado(dataRaw) {
    const data = safeArray(dataRaw);

    if (data.length === 0) {
        noDataMessage("chartCompletado");
        return;
    }

    const cursos = ["logica", "iot", "micropython"];
    const valores = cursos.map(c => {
        const r = data.find(x => x.curso === c);
        if (!r || r.total_registros === 0) return 0;
        return safeNumber((r.completados * 100) / r.total_registros);
    });

    new Chart(document.getElementById("chartCompletado"), {
        type: "bar",
        data: {
            labels: ["Lógica", "IoT", "MicroPython"],
            datasets: [{
                label: "% Completado",
                data: valores,
                backgroundColor: "#7a9cc6"
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

/* ============================================================
   6. Gráfico de Usuarios por Curso
   ============================================================ */

function graficosUsuarios(dataRaw) {
    const data = safeArray(dataRaw);

    if (data.length === 0) {
        noDataMessage("chartUsuarios");
        return;
    }

    const cursos = ["logica", "iot", "micropython"];
    const valores = cursos.map(c => {
        const r = data.find(x => x.curso === c);
        return safeNumber(r?.usuarios_unicos);
    });

    new Chart(document.getElementById("chartUsuarios"), {
        type: "pie",
        data: {
            labels: ["Lógica", "IoT", "MicroPython"],
            datasets: [{
                data: valores,
                backgroundColor: ["#8ea8c3", "#b8c6db", "#a2b5d4"]
            }]
        }
    });
}

/* ============================================================
   7. Heatmap – Actividad por Hora
   ============================================================ */

function graficoActividadHora(dataRaw) {
    const data = safeArray(dataRaw);

    if (data.length === 0) {
        noDataMessage("chartHora");
        return;
    }

    const cursos = ["logica", "iot", "micropython"];

    const matrix = data.map(d => ({
        x: safeNumber(d.hora),
        y: cursos.indexOf(d.curso),
        v: safeNumber(d.registros)
    }));

    new Chart(document.getElementById("chartHora"), {
        type: "matrix",
        data: {
            datasets: [{
                label: "Actividad por hora",
                data: matrix,
                backgroundColor: ctx => {
                    const v = ctx.dataset.data[ctx.dataIndex].v;
                    return `rgba(122,156,198,${Math.min(v / 10, 1)})`;
                },
                width: ctx => {
                    const ca = ctx.chart.chartArea;
                    return ca ? ca.width / 25 : 25;
                },
                height: ctx => {
                    const ca = ctx.chart.chartArea;
                    return ca ? ca.height / 10 : 20;
                }
            }]
        },
        options: {
            scales: {
                x: {
                    type: "linear",
                    min: 0,
                    max: 23,
                    ticks: { stepSize: 1 }
                },
                y: {
                    type: "category",
                    labels: cursos
                }
            }
        }
    });
}

/* ============================================================
   8. Gráfico – Actividad por Día
   ============================================================ */

function graficoActividadDia(dataRaw) {
    const data = safeArray(dataRaw);

    if (data.length === 0) {
        noDataMessage("chartDia");
        return;
    }

    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const valores = Array(7).fill(0);

    data.forEach(r => {
        valores[safeNumber(r.dia_semana)] += safeNumber(r.registros);
    });

    new Chart(document.getElementById("chartDia"), {
        type: "bar",
        data: {
            labels: dias,
            datasets: [{
                label: "Actividad",
                data: valores,
                backgroundColor: "#9dbbd8"
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
}

/* ============================================================
   9. TABLA RANKING
   ============================================================ */

function tablaRanking(dataRaw) {
    const data = safeArray(dataRaw);
    const tbody = document.querySelector("#tablaRanking tbody");
    tbody.innerHTML = "";

    if (data.length === 0) return;

    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.user_id}</td>
            <td>${r.curso}</td>
            <td>${r.completadas}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* ============================================================
   10. TABLA POPULARES
   ============================================================ */

function tablaPopulares(dataRaw) {
    const data = safeArray(dataRaw);
    const tbody = document.querySelector("#tablaPopulares tbody");
    tbody.innerHTML = "";

    if (data.length === 0) return;

    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.curso}</td>
            <td>${r.leccion_id}</td>
            <td>${r.total_completados}</td>
            <td>${r.visitas}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* ============================================================
   11. TABLA ABANDONADAS
   ============================================================ */

function tablaAbandonadas(dataRaw) {
    const data = safeArray(dataRaw);
    const tbody = document.querySelector("#tablaAbandonadas tbody");
    tbody.innerHTML = "";

    if (data.length === 0) return;

    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.curso}</td>
            <td>${r.leccion_id}</td>
            <td>${r.abandonos}</td>
            <td>${r.total}</td>
        `;
        tbody.appendChild(tr);
    });
}
