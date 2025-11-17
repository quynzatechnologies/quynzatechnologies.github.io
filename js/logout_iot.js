// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
document.addEventListener('DOMContentLoaded', function() {
    const logueado = localStorage.getItem("logueado-iot");

    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_iot/login.html";
    } else {
        document.body.classList.remove("protegido");
    }
});

function cerrarSesion() {

    // Eliminar todo lo relacionado al curso IoT
    localStorage.removeItem("logueado-iot");
    localStorage.removeItem("iot_user_id");
    localStorage.removeItem("iot_username");

    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_iot/login.html";
}
