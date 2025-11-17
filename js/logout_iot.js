// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
document.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-iot");

    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_iot/login.html";
    } else {
        document.body.classList.remove("protegido");
    }
});

function cerrarSesion() {

    // Eliminar todo lo relacionado al curso IoT
    sessionStorage.removeItem("logueado-iot");
    sessionStorage.removeItem("iot_user_id");
    sessionStorage.removeItem("iot_username");

    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_iot/login.html";
}
