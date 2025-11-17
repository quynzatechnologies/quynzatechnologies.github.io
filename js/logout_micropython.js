// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
document.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-micropython");

    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_micropython/login.html";
    } else {
        document.body.classList.remove("protegido");
    }
});

function cerrarSesion() {

    // Eliminar datos del curso MicroPython
    sessionStorage.removeItem("logueado-micropython");
    sessionStorage.removeItem("micropython_user_id");
    sessionStorage.removeItem("micropython_username");

    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_micropython/login.html";
}