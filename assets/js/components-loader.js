/**
 * Cargador de componentes HTML
 * Script para cargar dynamicamente componentes desde archivos externos
 */

// Función para cargar el head desde componentes
function loadHeadComponent() {
    fetch('components/head.html')
        .then(response => response.text())
        .then(data => {
            // Insertar etiquetas en el head
            document.head.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => console.error('Error al cargar head component:', error));
}

// Función para cargar componentes dinámicamente
function loadComponent(componentPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(componentPath)
        .then(response => response.text())
        .then(data => {
            container.innerHTML = data;
            // Cargar scripts si el componente los tiene
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            });
        })
        .catch(error => console.error('Error al cargar componente:', error));
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar head si la página lo requiere
    if (document.querySelector('meta[data-load-head]')) {
        loadHeadComponent();
    }
});
