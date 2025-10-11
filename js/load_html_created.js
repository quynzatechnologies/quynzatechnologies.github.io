// Función para cargar el contenido del archivo nav.html en un contenedor específico
function loadNavigation() {
  fetch('/html/head_config.html')
  .then(response => response.text())  // Convertir la respuesta a texto
  .then(data => {
    // Insertar el contenido de head-config.html en el head de la página
    document.head.innerHTML += data;
  })
  .catch(error => console.error('Error al cargar las configuraciones en el head:', error));

  fetch('/html/nav_curso_micropython.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      // document.getElementById('aside-nav-curso-micropython-container').innerHTML = data;
      document.getElementById('aside-nav-curso-micropython-container').insertAdjacentHTML('beforeend', data);
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));

  fetch('/html/nav_curso_iot.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      // document.getElementById('aside-nav-curso-iot-container').innerHTML = data;
      document.getElementById('aside-nav-curso-iot-container').insertAdjacentHTML('beforeend', data);
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));

  fetch('/html/nav_curso_logica.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      // document.getElementById('aside-nav-curso-iot-container').innerHTML = data;
      document.getElementById('aside-nav-curso-logica-container').insertAdjacentHTML('beforeend', data);
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));
  
  fetch('/html/nav_header_main.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      document.getElementById('header-nav-main-container').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));
  
  fetch('/html/footer_main.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      document.getElementById('footer-main-container').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));
  
  fetch('/html/footer_copyright.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      document.getElementById('footer-copyright-container').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));
  
  fetch('/html/header_comm.html')  // Cargar el archivo nav.html
    .then(response => response.text())  // Convertir la respuesta a texto
    .then(data => {
      // Insertar el contenido de nav.html en el contenedor con el id 'sidebar-container'
      document.getElementById('header-comm-container').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el panel de navegación:', error));
  
  // Añadir funcionalidad de jQuery para alternar la visibilidad del formulario de registro
  $("#toggle-register").click(function(e){
      e.preventDefault();
      $("#register-form-container").slideToggle();
  });
}
  
// Llamamos a la función cuando la página haya cargado completamente
window.onload = loadNavigation;