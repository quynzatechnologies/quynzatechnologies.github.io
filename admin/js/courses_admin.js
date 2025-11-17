/* ============================================================
   courses_admin.js – Administrador de cursos (JSON maestro)
   ============================================================ */

const COURSES_ENDPOINT = "https://backend-quynza-pages.vercel.app/api/admin/courses";

let stateCourses = [];
let currentCourseId = null;
let currentJsonOriginal = null;

document.addEventListener("DOMContentLoaded", () => {
    // Verificar sesión admin
    if (localStorage.getItem("logueado-admin") !== "true") {
        window.location.href = "/admin/login_admin.html";
        return;
    }

    // Detectar curso desde el hash de la URL
    const hash = window.location.hash.replace("#", "").trim();

    if (hash === "logica" || hash === "iot" || hash === "micropython") {
        // Simula que el usuario seleccionó un curso
        seleccionarCurso(hash);

        // Activar botones inmediatamente
        document.getElementById("btn-validar-json").disabled = false;
        document.getElementById("btn-guardar-json").disabled = false;
        document.getElementById("btn-revertir-json").disabled = false;

        const btnUpload = document.getElementById("btn-upload-json");
        if (btnUpload) btnUpload.disabled = false;

        const btnProbar = document.getElementById("btn-probar-curso");
        if (btnProbar) btnProbar.disabled = false;
    }

    // Eventos
    document.getElementById("btn-recargar-cursos").addEventListener("click", cargarCursos);
    document.getElementById("btn-validar-json").addEventListener("click", async () => {
        if (!currentCourseId || !currentJsonOriginal) return;
        await validarDesdeEditor();
    });
    document.getElementById("btn-guardar-json").addEventListener("click", guardarCambiosJson);
    document.getElementById("btn-revertir-json").addEventListener("click", revertirCambiosJson);
    const btnUpload = document.getElementById("btn-upload-json");
    if (btnUpload) {
        btnUpload.addEventListener("click", () => {
            document.getElementById("input-json-file").click();
        });
    }
    document.getElementById("input-json-file").addEventListener("change", handleFileUpload);

    // Botón "Probar curso"
    const btnProbar = document.getElementById("btn-probar-curso");
    if (btnProbar) {
        btnProbar.addEventListener("click", probarCurso);
    }

    cargarCursos();

    // Mostrar nombre de usuario en el dashboard
    const el = document.getElementById("usuario-admin");
    if (!el) return;

    const username = localStorage.getItem("admin-username");
    if (username) {
        el.textContent = "👤 " + username;
    }
});

/* ============================================================
   Helpers fetch
   ============================================================ */

async function fetchJSON(url) {
    const r = await fetch(url);
    const json = await r.json();
    if (!r.ok) {
        const msg = json.error || "Error desconocido";
        throw new Error(msg);
    }
    return json.data;
}

/* ============================================================
   1. Cargar lista de cursos
   ============================================================ */

async function cargarCursos() {
    try {
        const data = await fetchJSON(`${COURSES_ENDPOINT}?action=list`);
        stateCourses = Array.isArray(data) ? data : [];

        const tbody = document.querySelector("#tablaCursos tbody");
        tbody.innerHTML = "";

        if (stateCourses.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="3">No hay cursos registrados en Supabase.</td>`;
            tbody.appendChild(tr);
            return;
        }

        stateCourses.forEach(row => {
            const tr = document.createElement("tr");

            const titulo = inferCourseTitle(row.json_data, row.course_id);
            const fecha = row.updated_at ? new Date(row.updated_at).toLocaleString("es-CO") : "–";

            tr.innerHTML = `
                <td>${titulo}</td>
                <td>${fecha}</td>
                <td>
                    <button class="btn btn-xs btn-default" data-course-id="${row.course_id}">
                        Ver
                    </button>
                </td>
            `;

            tr.querySelector("button").addEventListener("click", () => {
                seleccionarCurso(row.course_id);
            });

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error cargando cursos:", err);
        alert("Error cargando cursos: " + err.message);
    }
}

function inferCourseTitle(json, fallbackId) {
    if (!json || typeof json !== "object") return fallbackId;
    if (json.titulo) return json.titulo;
    if (json.title) return json.title;
    if (json.curso && json.curso.titulo) return json.curso.titulo;
    if (json.curso && json.curso.title) return json.curso.title;
    return fallbackId;
}

/* ============================================================
   2. Seleccionar curso
   ============================================================ */

async function seleccionarCurso(courseId) {
    let data = null;

    try {
        // Intentar obtener desde Supabase
        data = await fetchJSON(`${COURSES_ENDPOINT}?action=get&course_id=${encodeURIComponent(courseId)}`);
    } catch (err) {
        console.warn(`Curso '${courseId}' no existe en Supabase. Modo nuevo curso activado.`);
        data = null;
    }

    currentCourseId = courseId;

    const label = document.getElementById("curso-seleccionado-label");

    if (data && data.json_data) {
        // Caso normal: existe en Supabase
        currentJsonOriginal = data.json_data;

        label.textContent = `Curso seleccionado: ${inferCourseTitle(currentJsonOriginal, currentCourseId)} (${currentCourseId})`;

        const editor = document.getElementById("json-editor");
        editor.disabled = false;
        editor.value = JSON.stringify(currentJsonOriginal, null, 2);

        document.getElementById("btn-validar-json").disabled = false;
        document.getElementById("btn-guardar-json").disabled = false;
        document.getElementById("btn-revertir-json").disabled = false;
        const btnProbar = document.getElementById("btn-probar-curso");
        if (btnProbar) btnProbar.disabled = false;
        const btnUpload = document.getElementById("btn-upload-json");
        if (btnUpload) btnUpload.disabled = false;

        await ejecutarValidacion(currentJsonOriginal);
    } else {
        // Fallback: curso NO existe en Supabase
        currentJsonOriginal = null;

        label.textContent = `Curso seleccionado (nuevo): ${courseId}`;

        const editor = document.getElementById("json-editor");
        editor.disabled = false;
        editor.value = "";

        // Activar solo botón de subir JSON
        document.getElementById("btn-upload-json").disabled = false;

        // Desactivar botones que requieren JSON previo
        document.getElementById("btn-validar-json").disabled = true;
        document.getElementById("btn-guardar-json").disabled = true;
        document.getElementById("btn-revertir-json").disabled = true;
        const btnProbar = document.getElementById("btn-probar-curso");
        if (btnProbar) btnProbar.disabled = true;

        // Vaciar validación
        document.getElementById("validation-results").style.display = "none";
        document.getElementById("course-summary").innerHTML = "";
    }
}


/* ============================================================
   3. Validación estructural + archivos reales
   ============================================================ */

async function validarDesdeEditor() {
    const editor = document.getElementById("json-editor");
    let parsed;

    try {
        parsed = JSON.parse(editor.value);
    } catch (e) {
        mostrarResultadosValidacion({
            errors: [`JSON inválido: ${e.message}`],
            warnings: [],
            summary: null
        });
        return;
    }

    await ejecutarValidacion(parsed);
}

async function ejecutarValidacion(json) {
    const estructural = validarEstructuraCurso(json);
    let archivos = { errors: [], warnings: [], summary: null };

    if (currentCourseId) {
        archivos = await validarArchivosCurso(currentCourseId, json);
    }

    const merged = {
        errors: [...(estructural.errors || []), ...(archivos.errors || [])],
        warnings: [...(estructural.warnings || []), ...(archivos.warnings || [])],
        summary: {
            ...(estructural.summary || {}),
            ...(archivos.summary || {})
        }
    };

    mostrarResultadosValidacion(merged);
}

function validarEstructuraCurso(json) {
    const errors = [];
    const warnings = [];

    if (!json || typeof json !== "object") {
        errors.push("El JSON raíz no es un objeto.");
        return { errors, warnings, summary: null };
    }

    const ids = [];
    let lessonCount = 0;
    let nodesCount = 0;

    function traverse(node) {
        if (Array.isArray(node)) {
            node.forEach(traverse);
            return;
        }
        if (!node || typeof node !== "object") return;

        nodesCount++;

        if (node.id) {
            ids.push(node.id);
        }

        if (node.content || node.content_html || node.archivo || node.file) {
            lessonCount++;
        }

        for (const k in node) {
            if (Object.prototype.hasOwnProperty.call(node, k)) {
                traverse(node[k]);
            }
        }
    }

    traverse(json);

    const idCounts = ids.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});
    const duplicatedIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);

    if (duplicatedIds.length > 0) {
        errors.push(`Existen IDs duplicados: ${duplicatedIds.join(", ")}`);
    }

    if (lessonCount === 0) {
        warnings.push("No se detectaron nodos que parezcan lecciones (sin campos content/content_html/archivo/file).");
    }

    const summary = {
        totalNodos: nodesCount,
        totalIds: ids.length,
        idsUnicos: ids.length - duplicatedIds.length,
        leccionesDetectadas: lessonCount
    };

    return { errors, warnings, summary };
}

async function validarArchivosCurso(courseId, json) {
    const errors = [];
    const warnings = [];
    const archivos = new Set();

    // 1) Buscar todos los nodos con campo "archivo"
    function buscarArchivos(node) {
        if (Array.isArray(node)) {
            node.forEach(buscarArchivos);
            return;
        }
        if (!node || typeof node !== "object") return;

        if (node.archivo) {
            archivos.add(node.archivo);
        }

        for (const k in node) {
            if (Object.prototype.hasOwnProperty.call(node, k)) {
                buscarArchivos(node[k]);
            }
        }
    }

    buscarArchivos(json);

    const totalArchivos = archivos.size;

    if (totalArchivos === 0) {
        warnings.push("No se encontraron campos 'archivo' en el JSON.");
        return {
            errors,
            warnings,
            summary: {
                archivosTotales: 0,
                archivosOk: 0,
                archivosFaltantes: 0
            }
        };
    }

    // 2) Rutas base según curso
    const baseMap = {
        logica: "/products/curso_logica/contenido/",
        iot: "/products/curso_iot/contenido/",
        micropython: "/products/curso_micropython/contenido/"
    };

    const basePath = baseMap[courseId];
    if (!basePath) {
        errors.push("La ruta base del curso no está definida.");
        return {
            errors,
            warnings,
            summary: {
                archivosTotales: totalArchivos,
                archivosOk: 0,
                archivosFaltantes: totalArchivos
            }
        };
    }

    let okCount = 0;
    let missingCount = 0;

    // 3) Validar cada archivo mediante fetch HEAD o GET
    for (const archivo of archivos) {
        const ruta = archivo.replace(/^\/+/, "");  // quitar "/" inicial
        const fullUrl = basePath + ruta;

        try {
            const resp = await fetch(fullUrl, { method: "GET" });

            if (resp.ok) {
                okCount++;
            } else {
                missingCount++;
                errors.push(`Archivo no encontrado (${resp.status}): ${fullUrl}`);
            }
        } catch (e) {
            missingCount++;
            errors.push(`Error al intentar acceder: ${fullUrl}`);
        }
    }

    return {
        errors,
        warnings,
        summary: {
            archivosTotales: totalArchivos,
            archivosOk: okCount,
            archivosFaltantes: missingCount
        }
    };
}

function mostrarResultadosValidacion({ errors, warnings, summary }) {
    const cont = document.getElementById("validation-results");
    const summaryList = document.getElementById("course-summary");

    cont.style.display = "block";
    cont.innerHTML = "";

    const errs = Array.isArray(errors) ? errors : [];
    const warns = Array.isArray(warnings) ? warnings : [];

    const h = document.createElement("h4");
    h.textContent = "Resultados de validación";
    cont.appendChild(h);

    if (errs.length === 0 && warns.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Sin errores ni advertencias.";
        cont.appendChild(p);
    }

    if (errs.length > 0) {
        const hErr = document.createElement("h5");
        hErr.textContent = "Errores:";
        cont.appendChild(hErr);

        const ul = document.createElement("ul");
        errs.forEach(e => {
            const li = document.createElement("li");
            li.style.color = "#b30000";
            li.textContent = e;
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }

    if (warns.length > 0) {
        const hWarn = document.createElement("h5");
        hWarn.textContent = "Advertencias:";
        cont.appendChild(hWarn);

        const ul = document.createElement("ul");
        warns.forEach(w => {
            const li = document.createElement("li");
            li.style.color = "#8a6d3b";
            li.textContent = w;
            ul.appendChild(li);
        });
        cont.appendChild(ul);
    }

    // Resumen
    summaryList.innerHTML = "";
    if (summary) {
        const lines = [];

        if (summary.totalNodos != null) {
            lines.push(`<li><strong>Total de nodos recorridos:</strong> ${summary.totalNodos}</li>`);
        }
        if (summary.totalIds != null) {
            lines.push(`<li><strong>Total de IDs encontrados:</strong> ${summary.totalIds}</li>`);
        }
        if (summary.idsUnicos != null) {
            lines.push(`<li><strong>IDs únicos (aprox.):</strong> ${summary.idsUnicos}</li>`);
        }
        if (summary.leccionesDetectadas != null) {
            lines.push(`<li><strong>Lecciones detectadas (heurística):</strong> ${summary.leccionesDetectadas}</li>`);
        }
        if (summary.archivosTotales != null) {
            lines.push(`<li><strong>Archivos content.html en JSON:</strong> ${summary.archivosTotales}</li>`);
        }
        if (summary.archivosOk != null) {
            lines.push(`<li><strong>Archivos encontrados OK:</strong> ${summary.archivosOk}</li>`);
        }
        if (summary.archivosFaltantes != null) {
            lines.push(`<li><strong>Archivos faltantes o con error:</strong> ${summary.archivosFaltantes}</li>`);
        }

        summaryList.innerHTML = lines.join("");
    }
}

/* ============================================================
   4. Guardar / revertir
   ============================================================ */

async function guardarCambiosJson() {
    if (!currentCourseId) {
        alert("No hay curso seleccionado.");
        return;
    }

    const editor = document.getElementById("json-editor");
    let parsed;
    try {
        parsed = JSON.parse(editor.value);
    } catch (e) {
        alert("El JSON no es válido: " + e.message);
        return;
    }

    const confirmacion = confirm("¿Guardar cambios en Supabase para el curso " + currentCourseId + "?");
    if (!confirmacion) return;

    const adminUser = localStorage.getItem("admin-username") || null;

    try {
        const r = await fetch(COURSES_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "save",
                course_id: currentCourseId,
                json_data: parsed,
                updated_by: adminUser
            })
        });

        const resp = await r.json();
        if (!r.ok) {
            throw new Error(resp.error || "Error guardando cambios");
        }

        alert("Cambios guardados correctamente.");
        currentJsonOriginal = parsed;
        cargarCursos();

    } catch (err) {
        console.error("Error guardando JSON:", err);
        alert("Error guardando JSON: " + err.message);
    }
}

function revertirCambiosJson() {
    if (!currentJsonOriginal) return;
    const editor = document.getElementById("json-editor");
    editor.value = JSON.stringify(currentJsonOriginal, null, 2);
    ejecutarValidacion(currentJsonOriginal);
}

/* ============================================================
   5. Probar curso (abrir SPA)
   ============================================================ */

function probarCurso() {
    if (!currentCourseId) return;
    const url = `/products/curso_${currentCourseId}/index.html?preview=true`;
    window.open(url, "_blank");
}


async function handleFileUpload(evt) {
    const file = evt.target.files[0];
    if (!file) return;

    const courseId = currentCourseId;
    if (!courseId) {
        alert("Primero selecciona un curso.");
        return;
    }

    try {
        const text = await file.text();
        const json = JSON.parse(text);

        const confirmacion = confirm(
            `¿Cargar archivo JSON para el curso '${courseId}'?\nEsto reemplazará la versión actual.`
        );
        if (!confirmacion) return;

        const resp = await fetch(
            "https://backend-quynza-pages.vercel.app/api/admin/courses_upload",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    course_id: courseId,
                    json_data: json,
                    updated_by: localStorage.getItem("admin-user") || null
                })
            }
        );

        const data = await resp.json();
        if (!resp.ok) {
            throw new Error(data.error || "Error desconocido");
        }

        alert("JSON cargado correctamente.");

        // Refrescar interfaz
        currentJsonOriginal = json;
        document.getElementById("json-editor").value =
            JSON.stringify(json, null, 2);

        cargarCursos(); // actualizar fechas tabla

    } catch (err) {
        console.error("Error al subir JSON:", err);
        alert("Error al subir JSON: " + err.message);
    }
}
