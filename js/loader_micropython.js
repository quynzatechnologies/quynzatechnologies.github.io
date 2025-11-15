/**
 * ============================================================
 *  loader_micropython.js
 *  SPA para el Curso de MicroPython
 * ============================================================
 */

let COURSE_DATA = null;
let ID_TO_NODE = {};
let PATHS = {};
let ORDER = [];

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    await loadCourseData();
    buildMappings();
    buildSidebar();
    loadInitialLesson();
});


/* ============================================================
   1. Cargar curso_micropython.json
   ============================================================ */
async function loadCourseData() {
    try {
        const res = await fetch("/products/curso_micropython/contenido/curso_micropython.json");
        COURSE_DATA = await res.json();
    } catch (err) {
        console.error("Error cargando curso_micropython.json:", err);
    }
}


/* ============================================================
   2. Crear mappings: ID_TO_NODE, PATHS, ORDER
   ============================================================ */
function buildMappings() {
    ID_TO_NODE = {};
    PATHS = {};
    ORDER = [];

    function traverse(node, path) {
        const currentPath = [...path, { id: node.id, titulo: node.titulo }];

        ID_TO_NODE[node.id] = node;
        PATHS[node.id] = currentPath;

        if (node.archivo && !node.excluirOrden) {
            ORDER.push(node.id);
        }

        if (node.items) {
            node.items.forEach(child => traverse(child, currentPath));
        }
    }

    COURSE_DATA.estructura.forEach(top => traverse(top, []));
}


/* ============================================================
   3. Construcción del menú lateral
   ============================================================ */
function buildSidebar() {
    const container = document.getElementById("aside-nav-curso-micropython-container");
    container.innerHTML = "";

    const aside = document.createElement("aside");
    aside.classList.add("sidebar");

    const rootUl = document.createElement("ul");
    rootUl.classList.add("current");
    rootUl.setAttribute("aria-expanded", "true");

    COURSE_DATA.estructura.forEach(node =>
        rootUl.appendChild(buildMenuNode(node, 1))
    );

    aside.appendChild(rootUl);
    container.appendChild(aside);
}


function buildMenuNode(node, level) {
    const li = document.createElement("li");
    li.classList.add(`toctree-l${level}`);
    li.setAttribute("aria-expanded", node.items ? "false" : "true");

    const a = document.createElement("a");
    a.textContent = node.titulo;
    a.href = "#";
    a.dataset.lesson = node.id;
    a.addEventListener("click", onMenuClick);
    li.appendChild(a);

    if (node.items && node.items.length > 0) {
        const toggle = document.createElement("span");
        toggle.classList.add("submenu-toggle");
        toggle.textContent = "▸";
        li.appendChild(toggle);

        const ul = document.createElement("ul");
        node.items.forEach(child =>
            ul.appendChild(buildMenuNode(child, Math.min(level + 1, 3)))
        );
        li.appendChild(ul);
    }

    return li;
}


/* ============================================================
   4. Manejo de clic en menú lateral
   ============================================================ */
function onMenuClick(e) {
    e.preventDefault();
    const lessonId = e.target.dataset.lesson;
    loadLesson(lessonId);
}


/* ============================================================
   5. Cargar lección content.html dinámicamente
   ============================================================ */
async function loadLesson(lessonId, pushState = true, anchorId = null) {
    const lesson = ID_TO_NODE[lessonId];
    if (!lesson) return console.error("Lección no encontrada:", lessonId);

    try {
        const html = await fetch(`/products/curso_micropython/contenido/${lesson.archivo}`)
            .then(r => r.text());
        document.getElementById("content").innerHTML = html;
    } catch (err) {
        console.error("Error cargando archivo:", err);
        document.getElementById("content").innerHTML = "<p>Error cargando contenido.</p>";
    }

    // Actualizar encabezado H1
    const h1 = document.querySelector("#heading-breadcrumbs h1");
    if (h1) h1.textContent = lesson.titulo;

    // Actualizar <title>
    document.title = lesson.titulo + " - Curso de MicroPython";

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
   6. Breadcrumbs
   ============================================================ */
function updateBreadcrumbs(lessonId) {
    const bc = document.getElementById("breadcrumbs");
    bc.innerHTML = "";

    const rootLi = document.createElement("li");
    rootLi.classList.add("wy-li");

    if (lessonId !== "inicio") {
        const a = document.createElement("a");
        a.textContent = "Inicio";
        a.href = "#";
        a.dataset.lesson = "inicio";
        a.addEventListener("click", onMenuClick);
        rootLi.appendChild(a);
    } else {
        const span = document.createElement("span");
        span.textContent = "Inicio";
        span.classList.add("not-active");
        rootLi.appendChild(span);
    }

    bc.appendChild(rootLi);

    const path = PATHS[lessonId];
    if (lessonId === "inicio") return;

    path.forEach((level, idx) => {
        if (level.id === "inicio") return;

        const li = document.createElement("li");
        li.classList.add("wy-li");

        const isLast = idx === path.length - 1;

        if (isLast) {
            const span = document.createElement("span");
            span.textContent = level.titulo;
            span.classList.add("not-active");
            li.appendChild(span);
        } else {
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
   7. Prev / Next
   ============================================================ */
function updatePrevNext(lessonId) {
    const idx = ORDER.indexOf(lessonId);
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    // Caso Recopilación
    if (lessonId === "recopilacion_ejercicios") {
        btnPrev.style.visibility = "visible";
        btnPrev.textContent = "← Anterior";
        btnPrev.onclick = () => loadLesson("inicio");

        btnNext.style.visibility = "hidden";
        btnNext.onclick = null;
        btnNext.textContent = "";
        return;
    }

    // Prev normal
    if (idx > 0) {
        btnPrev.style.visibility = "visible";
        btnPrev.textContent = "← Anterior";
        const prevId = ORDER[idx - 1];
        btnPrev.onclick = () => loadLesson(prevId);
    } else {
        btnPrev.style.visibility = "hidden";
    }

    // Next normal
    if (idx < ORDER.length - 1) {
        btnNext.style.visibility = "visible";
        btnNext.textContent = "Siguiente →";
        const nextId = ORDER[idx + 1];
        btnNext.onclick = () => loadLesson(nextId);
    } else {
        btnNext.style.visibility = "hidden";
    }
}


/* ============================================================
   8. Cargar lección inicial
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
   9. Back/Forward
   ============================================================ */
window.onpopstate = function (event) {
    if (event.state?.lessonId) {
        loadLesson(event.state.lessonId, false);
    }
};


/* ============================================================
   10. Resaltar activo
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
   11. Enlaces internos desde el contenido (data-lesson)
   ============================================================ */
function activateContentLinks() {
    const links = document.querySelectorAll("#content a[data-lesson]");

    links.forEach(a => {
        a.addEventListener("click", e => {
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
