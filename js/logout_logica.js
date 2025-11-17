// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
document.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-logica");

    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_logica/login.html";
    } else {
        document.body.classList.remove("protegido");
    }
});

function cerrarSesion() {

    // Eliminar datos del curso Lógica
    sessionStorage.removeItem("logueado-logica");
    sessionStorage.removeItem("logica_user_id");
    sessionStorage.removeItem("logica_username");

    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_logica/login.html";
}