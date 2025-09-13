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

        // Estado inicial
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
      if (root) wireNav(root);
    });
    obs.observe(container, { childList: true, subtree: true });
  });
});