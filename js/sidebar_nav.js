document.addEventListener("DOMContentLoaded", () => {
  const setups = [
    { containerId: "aside-nav-curso-micropython-container", buttonId: "toggle-sidebar" },
    { containerId: "aside-nav-curso-iot-container", buttonId: "toggle-sidebar-iot" }
  ];

  setups.forEach(({ containerId, buttonId }) => {
    const container = document.getElementById(containerId);
    const toggleBtn = document.getElementById(buttonId);

    if (!container || !toggleBtn) return;

    // Toggle sidebar completo
    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("is-collapsed");
    });

    // Inicializar submenús
    function wireNav(root){
      root.querySelectorAll("li").forEach(li => {
        const link = li.querySelector(":scope > a");
        const submenu = li.querySelector(":scope > ul");
        if (!link || !submenu) return;

        li.classList.add("has-submenu");

        let toggle = li.querySelector(":scope > .submenu-toggle");
        if (!toggle) {
          toggle = document.createElement("span");
          toggle.className = "submenu-toggle";
          toggle.textContent = "▸";
          link.insertAdjacentElement("afterend", toggle);
        }

        // Estado inicial: cerrado
        submenu.style.display = "none";
      });
    }

    // Delegación: clic en toggle
    container.addEventListener("click", (e) => {
      const tgl = e.target.closest(".submenu-toggle");
      if (tgl && container.contains(tgl)) {
        e.preventDefault();
        e.stopPropagation();
        const li = tgl.closest("li");
        const submenu = li.querySelector(":scope > ul");
        const isOpen = submenu.style.display === "block";
        submenu.style.display = isOpen ? "none" : "block";
        li.classList.toggle("open", !isOpen);
        tgl.classList.toggle("open", !isOpen);
      }
    });

    // Observer: inicializa al inyectar el HTML
    const obs = new MutationObserver(() => {
      const root = container.querySelector("aside.sidebar, nav, ul");
      if (root) {
        wireNav(root);

        // === NUEVO: abrir automáticamente el menú de la página actual ===
        const currentPath = window.location.pathname.replace(/\/+$/, "");

        // Buscar coincidencia exacta primero
        let currentLink = container.querySelector(`a[href="${currentPath}"]`);

        // Si no hay coincidencia exacta, buscar el enlace cuyo href sea prefijo más largo de la URL
        if (!currentLink) {
          let bestMatch = null;
          let bestLength = 0;
          container.querySelectorAll("a[href]").forEach(a => {
            const href = a.getAttribute("href").replace(/\/+$/, "");
            if (currentPath.startsWith(href) && href.length > bestLength) {
              bestMatch = a;
              bestLength = href.length;
            }
          });
          currentLink = bestMatch;
        }

        if (currentLink) {
          currentLink.classList.add("active");

          // Deshabilitar el link actual
          currentLink.removeAttribute("href");
          currentLink.style.pointerEvents = "none"; // por seguridad
          currentLink.style.cursor = "default";
          
          // Abre todos los padres
          let li = currentLink.closest("li");
          while (li) {
            li.classList.add("open");
            li.setAttribute("aria-expanded", "true");
            const submenu = li.querySelector(":scope > ul");
            if (submenu) submenu.style.display = "block";

            const tgl = li.querySelector(":scope > .submenu-toggle");
            if (tgl) tgl.classList.add("open");

            li = li.parentElement.closest("li");
          }
        }
      }
    });
    obs.observe(container, { childList: true, subtree: true });
  });
});
