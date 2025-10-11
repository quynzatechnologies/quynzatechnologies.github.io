// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
window.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-iot");
    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_iot/login.html";  // Redirigir a la página de login
    }
});

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem("logueado-iot");  // Eliminar la sesión
    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_iot/login.html";  // Redirigir a la página de login
}