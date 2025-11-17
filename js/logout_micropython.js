// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
document.addEventListener('DOMContentLoaded', function() {
    const logueado = localStorage.getItem("logueado-micropython");

    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_micropython/login.html";
    } else {
        document.body.classList.remove("protegido");
    }
});

function cerrarSesion() {

    // Eliminar datos del curso MicroPython
    localStorage.removeItem("logueado-micropython");
    localStorage.removeItem("micropython_user_id");
    localStorage.removeItem("micropython_username");

    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_micropython/login.html";
}