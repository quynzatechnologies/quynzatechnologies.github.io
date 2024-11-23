async function cargarUsers() {
    try {
        const response = await fetch("/js/login/users.json");
        const data = await response.json();
        return data.users; // Retorna el objeto con los usuarios
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        return null;
    }
}

function md5(text) {
    return CryptoJS.MD5(text).toString();
}

// Verificar si el usuario ha iniciado sesión cuando el contenido se haya cargado completamente
window.addEventListener('DOMContentLoaded', function() {
    const logueado = sessionStorage.getItem("logueado-micropython");
    if (logueado === "true") {
        window.location.href = "/products/curso_micropython/contenido/index.html";  // Redirigir a la página de login
    }
});

document.getElementById("login-form-micropython").addEventListener("submit", async function (e) {
    e.preventDefault();
    const userIngresado = document.getElementById("usuario").value;
    const pwdIngresada = document.getElementById("contraseña").value;

    const usuarios = await cargarUsers();
    if (!usuarios) {
        alert("No se pudieron verificar los usuarios. Inténtalo más tarde.");
        return;
    }

    // Generar el hash MD5 de la contraseña ingresada
    const userHash = md5(userIngresado);
    const pwdHash = md5(pwdIngresada);

    // Validar el usuario
    if (usuarios[userHash] === pwdHash) {
        sessionStorage.setItem("logueado-micropython", "true");
        alert("Inicio de sesión exitoso");
        window.location.href = "/products/curso_micropython/contenido/index.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});