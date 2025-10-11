// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
window.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-logica");
    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_logica/login.html";  // Redirigir a la página de login
    }
});

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem("logueado-logica");  // Eliminar la sesión
    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_logica/login.html";  // Redirigir a la página de login
}