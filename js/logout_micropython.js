// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
// Ejecutar lo más pronto posible
document.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-micropython");

    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_micropython/login.html";
    } else {
        // Usuario autenticado → mostrar contenido
        document.body.classList.remove("protegido");
    }
});

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem("logueado-micropython");  // Eliminar la sesión
    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_micropython/login.html";  // Redirigir a la página de login
}