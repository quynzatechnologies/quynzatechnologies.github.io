/**
 * ============================================================
 *  loader_logica.js
 *  SPA para el Curso de Lógica Digital
 * ============================================================
 *
 *  Este script:
 *   - carga el archivo maestro curso_logica.json
 *   - construye el menú lateral dinámicamente
 *   - genera los breadcrumbs
 *   - genera navegación prev/next
 *   - carga contenido HTML parcial dentro de #content
 *   - actualiza la URL con history.pushState()
 *   - reacciona a back/forward del navegador
 *
 *  Requiere:
 *   - contenido/index.html (contenedor SPA)
 *   - contenido/curso_logica.json (archivo maestro)
 *   - archivos parciales content.html
 *
 * ============================================================
 */

let COURSE_DATA = null;        // JSON completo
let ID_TO_NODE = {};           // { id: nodo }
let PATHS = {};                // { id: [ {id,titulo}, ... ] }
let ORDER = [];                // Lista lineal de IDs en orden de navegación


/* ============================================================
   INICIALIZACIÓN PRINCIPAL
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    await loadCourseData();
    buildMappings();
    buildSidebar();
    loadInitialLesson();
});


/* ============================================================
   1. Cargar JSON maestro del curso
   ============================================================ */
async function loadCourseData() {
    try {
        const res = await fetch("/products/curso_logica/contenido/curso_logica.json");
        COURSE_DATA = await res.json();
    } catch (err) {
        console.error("Error cargando curso_logica.json:", err);
    }
}


/* ============================================================
   2. Crear mapeos:
        - ID_TO_NODE: acceso directo
        - PATHS: breadcrumbs
        - ORDER: lista lineal para prev/next
   ============================================================ */
function buildMappings() {
    ID_TO_NODE = {};
    PATHS = {};
    ORDER = [];

    function traverse(node, path) {
        const currentPath = [...path, { id: node.id, titulo: node.titulo }];
        ID_TO_NODE[node.id] = node;
        PATHS[node.id] = currentPath;

        // Solo agregar a ORDER si el nodo tiene archivo
        if (node.archivo && !node.excluirOrden) {
            ORDER.push(node.id);
        }

        if (node.items) {
            for (const child of node.items) {
                traverse(child, currentPath);
            }
        }
    }

    for (const top of COURSE_DATA.estructura) {
        traverse(top, []);
    }
}


/* ============================================================
   3. Construcción del menú lateral dinámico
   ============================================================ */
function buildSidebar() {
    const container = document.getElementById("aside-nav-curso-logica-container");
    container.innerHTML = "";

    // Creamos el <aside class="sidebar">
    const aside = document.createElement("aside");
    aside.classList.add("sidebar");

    // UL raíz: <ul class="current" aria-expanded="true">
    const rootUl = document.createElement("ul");
    rootUl.classList.add("current");
    rootUl.setAttribute("aria-expanded", "true");

    // Construimos los nodos de primer nivel (equivalente a toctree-l1)
    COURSE_DATA.estructura.forEach(node => {
        const li = buildMenuNode(node, 1);
        rootUl.appendChild(li);
    });

    aside.appendChild(rootUl);
    container.appendChild(aside);
}

/**
 * Construye un <li> de menú para cualquier nivel.
 * level = 1 → toctree-l1
 * level = 2 → toctree-l2
 * level = 3 → toctree-l3
 */
function buildMenuNode(node, level) {
    const li = document.createElement("li");
    li.classList.add(`toctree-l${level}`);
    li.setAttribute("aria-expanded", node.items ? "false" : "true");

    // <a> con el título
    const a = document.createElement("a");
    a.textContent = node.titulo;
    a.href = "#";
    a.dataset.lesson = node.id;
    a.addEventListener("click", onMenuClick);
    li.appendChild(a);

    // Si tiene hijos, añadimos el span.submenu-toggle y el <ul> anidado
    if (node.items && node.items.length > 0) {
        const toggle = document.createElement("span");
        toggle.classList.add("submenu-toggle");
        toggle.textContent = "▸";
        li.appendChild(toggle);

        const ulChild = document.createElement("ul");
        node.items.forEach(child => {
            const childLi = buildMenuNode(
                child,
                Math.min(level + 1, 3) // hasta toctree-l3 como máximo
            );
            ulChild.appendChild(childLi);
        });
        li.appendChild(ulChild);
    }

    return li;
}


/* ============================================================
   4. Manejar clics del menú lateral
   ============================================================ */
function onMenuClick(e) {
    e.preventDefault();
    const lessonId = e.target.dataset.lesson;
    loadLesson(lessonId);
}


/* ============================================================
   5. Cargar lección dentro de #content
   ============================================================ */
async function loadLesson(lessonId, pushState = true, anchorId = null) {
    const lesson = ID_TO_NODE[lessonId];
    if (!lesson) {
        console.error("Lección no encontrada:", lessonId);
        return;
    }

    try {
        const html = await fetch(`/products/curso_logica/contenido/${lesson.archivo}`)
            .then(r => r.text());
        document.getElementById("content").innerHTML = html;
    } catch (err) {
        console.error("Error cargando archivo HTML:", err);
        document.getElementById("content").innerHTML = "<p>Error cargando contenido.</p>";
    }

    // Actualizar título H1
    const h1 = document.querySelector("#heading-breadcrumbs h1");
    if (h1) h1.textContent = lesson.titulo;

    // Actualizar título <title>
    document.title = lesson.titulo + " - Curso de Lógica Digital";

    updateBreadcrumbs(lessonId);
    updatePrevNext(lessonId);
    highlightActiveLesson(lessonId);
    activateContentLinks();

    if (anchorId) {
        const el = document.getElementById(anchorId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (pushState) {
        history.pushState({ lessonId }, "", `?lesson=${lessonId}`);
    }
}


/* ============================================================
   6. Construir breadcrumbs dinámicos
   ============================================================ */
function updateBreadcrumbs(lessonId) {
    const bc = document.getElementById("breadcrumbs");
    bc.innerHTML = "";

    // 1. Agregar el item raíz (Inicio)
    const rootLi = document.createElement("li");
    rootLi.classList.add("wy-li");

    if (lessonId !== "inicio") {
        // Inicio es clicable si NO estamos en inicio
        const rootA = document.createElement("a");
        rootA.textContent = "Inicio";
        rootA.href = "#";
        rootA.dataset.lesson = "inicio";
        rootA.addEventListener("click", onMenuClick);
        rootLi.appendChild(rootA);
    } else {
        // Si estamos en inicio → mostrar como elemento actual
        const span = document.createElement("span");
        span.textContent = "Inicio";
        span.classList.add("not-active");
        rootLi.appendChild(span);
    }

    bc.appendChild(rootLi);

    // 2. Breadcrumbs derivados del árbol PATHS
    const path = PATHS[lessonId];

    // Si estamos en inicio, no agregamos más
    if (lessonId === "inicio") return;

    path.forEach((level, idx) => {
        // Evitar duplicar "inicio" en el breadcrumb
        if (level.id === "inicio") return;

        const li = document.createElement("li");
        li.classList.add("wy-li");

        const isLast = (idx === path.length - 1);

        if (isLast) {
            // Nivel actual → no es link, tiene clase not-active
            const span = document.createElement("span");
            span.textContent = level.titulo;
            span.classList.add("not-active");
            li.appendChild(span);
        } else {
            // Niveles superiores → son links
            const a = document.createElement("a");
            a.textContent = level.titulo;
            a.href = "#";
            a.dataset.lesson = level.id;
            a.addEventListener("click", onMenuClick);
            li.appendChild(a);
        }

        bc.appendChild(li);
    });
}


/* ============================================================
   7. Generar botones Prev / Next
   ============================================================ */
function updatePrevNext(lessonId) {
    const idx = ORDER.indexOf(lessonId);
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    // Prev
    if (idx > 0) {
        const prevId = ORDER[idx - 1];
        btnPrev.style.visibility = "visible";
        btnPrev.textContent = "← Anterior";
        btnPrev.dataset.lesson = prevId;
        btnPrev.onclick = () => loadLesson(prevId);
    } else {
        btnPrev.style.visibility = "hidden";
    }

    // Ocultar botón siguiente SOLO en la página de ejercicios
    if (lessonId === "recopilacion_ejercicios" || lessonId === "glosario") {

        // Mostrar Anterior que lleve a Inicio
        btnPrev.style.visibility = "visible";
        btnPrev.textContent = "← Anterior";
        btnPrev.dataset.lesson = "inicio";
        btnPrev.onclick = () => loadLesson("inicio");

        // Ocultar Next
        btnNext.style.visibility = "hidden";
        btnNext.onclick = null;
        btnNext.textContent = "";

        return; // salir y no procesar el flujo normal
    }

    // Next
    if (idx < ORDER.length - 1) {
        const nextId = ORDER[idx + 1];
        btnNext.style.visibility = "visible";
        btnNext.textContent = "Siguiente →";
        btnNext.dataset.lesson = nextId;
        btnNext.onclick = () => loadLesson(nextId);
    } else {
        btnNext.style.visibility = "hidden";
    }
}


/* ============================================================
   8. Cargar lección inicial (inicio) o por parámetro ?lesson=
   ============================================================ */
function loadInitialLesson() {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get("lesson");

    if (lessonId && ID_TO_NODE[lessonId]) {
        loadLesson(lessonId, false);
    } else {
        // Cargar "inicio" automáticamente
        const inicioNode = COURSE_DATA.estructura.find(n => n.id === "inicio");
        if (inicioNode) {
            loadLesson("inicio", false);
        }
    }
}


/* ============================================================
   9. Manejar navegación del navegador (Back / Forward)
   ============================================================ */
window.onpopstate = function (event) {
    if (event.state?.lessonId) {
        loadLesson(event.state.lessonId, false);
    }
};

/* ============================================================
   10. Resaltar lección activa y abrir submenús correspondientes
   ============================================================ */
function highlightActiveLesson(lessonId) {

    // 1. Quitar estados previos
    document.querySelectorAll(".sidebar a.active")
        .forEach(a => a.classList.remove("active"));

    // 2. Cerrar TODO el árbol (aria + display)
    document.querySelectorAll(".sidebar li[aria-expanded]").forEach(li => {
        li.setAttribute("aria-expanded", "false");

        const ul = li.querySelector(":scope > ul");
        if (ul) ul.style.display = "none";
    });

    // 3. Marcar activo
    const activeLink = document.querySelector(`.sidebar a[data-lesson="${lessonId}"]`);
    if (!activeLink) return;
    activeLink.classList.add("active");

    // 4. Subir abriendo TODOS los ancestros
    let currentLi = activeLink.parentElement;

    while (currentLi && currentLi.tagName.toLowerCase() === "li") {
        currentLi.setAttribute("aria-expanded", "true");

        // Abrir su <ul> interno si lo tiene
        const innerUl = currentLi.querySelector(":scope > ul");
        if (innerUl) innerUl.style.display = "block";

        // Subir al padre LI
        currentLi = currentLi.parentElement.closest("li");
    }
}


/* ============================================================
   Convertir <a data-lesson=""> en enlaces SPA
   ============================================================ */
function activateContentLinks() {
    const links = document.querySelectorAll("#content a[data-lesson]");

    links.forEach(a => {
        a.addEventListener("click", (e) => {
            e.preventDefault();

            const lessonId = a.dataset.lesson;
            let anchorId = null;

            const href = a.getAttribute("href") || "";
            if (href.startsWith("#") && href.length > 1) {
                anchorId = href.substring(1);
            }

            loadLesson(lessonId, true, anchorId);
        });
    });
}
