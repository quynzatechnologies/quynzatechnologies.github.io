document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("aside-nav-curso-micropython-container");
  const toggleBtn  = document.getElementById("toggle-sidebar");

  // Colapsar/expandir todo el sidebar
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("is-collapsed");
    });
  }

  // Inicializa: añade .has-submenu, asegura el toggle y sincroniza estado
  function wireNav(root){
    root.querySelectorAll("li").forEach(li => {
      // Dentro de wireNav(root) para cada <li> con submenú:
      const link = li.querySelector(":scope > a");
      const submenu = li.querySelector(":scope > ul");
      if (!link || !submenu) return;

      // Asegura el toggle
      let toggle = li.querySelector(":scope > .submenu-toggle");
      if (!toggle) {
        toggle = document.createElement("span");
        toggle.className = "submenu-toggle";
        toggle.textContent = "▸";
        toggle.setAttribute("role", "button");
        toggle.setAttribute("aria-label", "Abrir/cerrar submenú");
      }

      // Crea header si no existe y mete dentro el link + toggle
      let header = li.querySelector(":scope > .menu-item-header");
      if (!header) {
        header = document.createElement("div");
        header.className = "menu-item-header";
        li.insertBefore(header, link);   // lo ponemos antes del link
        header.appendChild(link);        // movemos el link dentro
        header.appendChild(toggle);      // y la flecha
      }

      // Estado inicial
      const expanded = li.getAttribute("aria-expanded") === "true";
      submenu.style.display = expanded ? "block" : "none";
      li.classList.toggle("open", expanded);
      toggle.classList.toggle("open", expanded);

    });
  }

  // Delegación: click en la flecha = toggle; click en título = abre si estaba cerrado, si no navega
  container.addEventListener("click", (e) => {
    const tgl = e.target.closest(".submenu-toggle");
    if (tgl && container.contains(tgl)) {
      e.preventDefault(); e.stopPropagation();
      const li = tgl.closest("li");
      const submenu = li.querySelector(":scope > ul");
      const isOpen = submenu.style.display === "block";
      submenu.style.display = isOpen ? "none" : "block";
      li.classList.toggle("open", !isOpen);
      tgl.classList.toggle("open", !isOpen);
      li.setAttribute("aria-expanded", String(!isOpen));
      return;
    }

    const a = e.target.closest("li.has-submenu > a");
    if (a && container.contains(a)) {
      const li = a.parentElement;
      const submenu = li.querySelector(":scope > ul");
      if (submenu && submenu.style.display !== "block") {
        e.preventDefault(); // primer click abre
        submenu.style.display = "block";
        li.classList.add("open");
        li.setAttribute("aria-expanded", "true");
        const tog = li.querySelector(":scope > .submenu-toggle");
        tog && tog.classList.add("open");
      }
    }
  });

  // Re-wire cuando se inyecta el nav dinámicamente
  const obs = new MutationObserver(() => {
    const root = container.querySelector("aside.sidebar, nav, ul");
    if (root) wireNav(root);
  });
  obs.observe(container, { childList: true, subtree: true });
});
