document.addEventListener('DOMContentLoaded', async () => {

  // Función para cargar un componente
  async function loadComponent(selector, file) {
    const container = document.querySelector(selector);
    if (!container) return;

    try {
      const response = await fetch('components/' + file);
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      console.error('Error cargando:', file, error);
    }
  }

  // Cargar componentes
  await loadComponent('#navbar-container', 'navbar.html');
 // await loadComponent('#carousel-container', 'carrusel.html');
  await loadComponent('#footer-container', 'footer.html');

});
