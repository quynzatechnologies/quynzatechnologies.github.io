// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
window.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-iot");
    if (logueado !== "true") {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/products/curso_iot/login.html";  // Redirigir a la página de login
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const toggleMenus = document.querySelectorAll('.toggle-menu'); // Seleccionamos todos los botones de expansión
    
    toggleMenus.forEach(menu => {
        menu.addEventListener('click', function(event) {
            event.preventDefault(); // Prevenimos la acción predeterminada del enlace
            const submenu = this.nextElementSibling; // El siguiente elemento es el submenú
            const icon = this.querySelector('.toggle-icon'); // El icono de expansión

            // Alternar la clase "active" para mostrar u ocultar el submenú
            submenu.classList.add('active');
            icon.classList.add('active'); // Cambiar el icono (rotación)
        });
    });
});

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem("logueado-iot");  // Eliminar la sesión
    alert("Has cerrado sesión.");
    window.location.href = "/products/curso_iot/login.html";  // Redirigir a la página de login
}