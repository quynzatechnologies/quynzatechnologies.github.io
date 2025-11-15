// Ejecutar lo más pronto posible
document.addEventListener("DOMContentLoaded", function () {

    // Verificar si el usuario ha iniciado sesión como ADMIN
    const isAdmin = sessionStorage.getItem("admin");

    if (isAdmin !== "true") {
        alert("Debes iniciar sesión como administrador para acceder a esta página.");
        window.location.href = "/admin/login_admin.html";
    } else {
        // Usuario autenticado → mostrar contenido
        document.body.classList.remove("protegido");
    }
});

// Función para cerrar sesión de administrador
function cerrarSesionAdmin() {
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("admin-username");

    alert("Sesión de administrador finalizada.");
    window.location.href = "/admin/login_admin.html";
}
