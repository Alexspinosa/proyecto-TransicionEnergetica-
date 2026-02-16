(function () {
  // Determine components base path depending on current page location
  const base = window.location.pathname.includes('/pages/') ? '../components/' : 'components/';

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`);
    return await res.text();
  }

  async function loadHead() {
    try {
      let html = await fetchText(base + 'head.html');
      // Adjust asset paths when page is inside /pages/
      const assetPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
      html = html.replace(/(href=\")[\.\/]*assets\//g, `$1${assetPrefix}assets/`);
      html = html.replace(/(src=\")[\.\/]*assets\//g, `$1${assetPrefix}assets/`);
      // Inject into document.head
      document.head.insertAdjacentHTML('beforeend', html);
    } catch (err) {
      console.error('Error cargando head:', err);
    }
  }

  function executeScripts(container) {
    // Find scripts in the loaded fragment and re-insert them so they execute
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((old) => {
      const script = document.createElement('script');
      if (old.src) {
        script.src = old.src;
        script.async = false;
      } else {
        script.textContent = old.textContent;
      }
      document.body.appendChild(script);
      old.parentNode && old.parentNode.removeChild(old);
    });
  }

  async function loadComponent(selector, url) {
    const container = document.querySelector(selector);
    if (!container) return;
    try {
      const html = await fetchText(url);
      container.innerHTML = html;
      executeScripts(container);
    } catch (err) {
      console.error('Error cargando componente', url, err);
    }
  }

  async function init() {
    await loadHead();
    // Ensure jQuery is available (some components rely on it, e.g., slick)
    if (!window.jQuery) {
      await new Promise((resolve, reject) => {
        const jq = document.createElement('script');
        jq.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jq.onload = () => resolve();
        jq.onerror = () => reject(new Error('Failed to load jQuery'));
        document.head.appendChild(jq);
      }).catch((err) => console.warn(err));
    }

    // Ensure Bootstrap JS is available (bundle includes Popper)
    if (!window.__bootstrap_bundle_loaded) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js';
      s.defer = true;
      document.body.appendChild(s);
      window.__bootstrap_bundle_loaded = true;
    }

    await loadComponent('#navbar-container', base + 'navbar.html');
    // Adjust navbar internal links so they work from root and from /pages/
    (function adjustNavbarLinks() {
      const inPages = window.location.pathname.includes('/pages/');
      const container = document.querySelector('#navbar-container');
      if (!container) return;
      const anchors = Array.from(container.querySelectorAll('a'));
      anchors.forEach((a) => {
        const href = a.getAttribute('href') || '';
        // If link is an internal page and does not start with http or mailto or #
        if (/^pages\//.test(href) || /^\.\.?\/pages\//.test(href)) {
          if (inPages) {
            // currently in pages/, make href relative from pages (../pages/...)
            a.setAttribute('href', '../' + href.replace(/^\.\/?/, ''));
          } else {
            // root: keep as pages/... (no change)
            a.setAttribute('href', href.replace(/^\.\/?/, ''));
          }
        }
      });
    })();

    await loadComponent('#footer-container', base + 'footer.html');
  }

  // Expose API
  window.ComponentsLoader = {
    init,
    loadComponent,
    loadHead,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
