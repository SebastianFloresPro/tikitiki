/*
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const container = document.getElementById('mynetwork');

  const toggle = document.getElementById('toggle');
  const menu = document.getElementById('menu');

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  window.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const rdfText = e.target.result;

      // Limpiar grafo previo
      container.innerHTML = '';

      try {
        // Parsear RDF XML
        const store = $rdf.graph();
        const baseURI = window.location.href; // Base para URIs relativos
        const contentType = 'application/rdf+xml';
        $rdf.parse(rdfText, store, baseURI, contentType);

        // Crear nodos y aristas para vis-network
        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();

        let idCount = 0;
        const nodeMap = new Map();

        function addNode(uri) {
          if (!nodeMap.has(uri)) {
            let label = uri;
            try {
              if (uri.startsWith('http')) {
                label = decodeURIComponent(uri.split(/[\/#]/).pop());
              }
            } catch {}
            nodes.add({ id: idCount, label: label });
            nodeMap.set(uri, idCount);
            idCount++;
          }
          return nodeMap.get(uri);
        }

        store.statements.forEach(triple => {
          const s = triple.subject.value;
          const p = triple.predicate.value;
          const o = triple.object.value;

          const sId = addNode(s);
          const oId = addNode(o);

          const predLabel = p.split(/[\/#]/).pop();

          edges.add({
            from: sId,
            to: oId,
            label: predLabel,
            arrows: 'to',
            font: { align: 'middle' }
          });
        });

        // Configuración grafo
        const data = { nodes, edges };
        const options = {
          layout: { improvedLayout: true },
          edges: {
            smooth: true,
            arrows: { to: true }
          },
          physics: {
            enabled: true,
            stabilization: { iterations: 100 }
          }
        };

        new vis.Network(container, data, options);

      } catch (err) {
        container.innerHTML = <p style="color:red;">Error al parsear RDF: ${err.message}</p>;
        console.error(err);
      }
    };

    reader.readAsText(file);
  });
});
*/
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const container = document.getElementById('mynetwork');

  function renderGraphFromText(rdfText) {
    try {
      container.innerHTML = ''; 

      const store = $rdf.graph();
      const baseURI = window.location.href;
      const contentType = 'application/rdf+xml';
      $rdf.parse(rdfText, store, baseURI, contentType);

      const nodes = new vis.DataSet();
      const edges = new vis.DataSet();
      let idCount = 0;
      const nodeMap = new Map();

      function addNode(uri) {
        if (!nodeMap.has(uri)) {
          let label = uri;
          try {
            if (uri.startsWith('http')) {
              label = decodeURIComponent(uri.split(/[\/#]/).pop());
            }
          } catch {}
          nodes.add({ id: idCount, label: label });
          nodeMap.set(uri, idCount);
          idCount++;
        }
        return nodeMap.get(uri);
      }

      store.statements.forEach(triple => {
        const s = triple.subject.value;
        const p = triple.predicate.value;
        const o = triple.object.value;

        const sId = addNode(s);
        const oId = addNode(o);
        const predLabel = p.split(/[\/#]/).pop();

        edges.add({
          from: sId,
          to: oId,
          label: predLabel,
          arrows: 'to',
          font: { align: 'middle' }
        });
      });

      const data = { nodes, edges };
      const options = {
        layout: { improvedLayout: true },
        edges: {
          smooth: true,
          arrows: { to: true }
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 100 }
        }
      };

      new vis.Network(container, data, options);
    } catch (err) {
      container.innerHTML = `<p style="color:red;">Error al parsear RDF: ${err.message}</p>`;
      console.error(err);
    }
  }

  fetch('/rdf')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo obtener RDF desde /rdf');
      return response.text();
    })
    .then(renderGraphFromText)
    .catch(err => {
      console.warn('No se pudo cargar RDF automáticamente:', err.message);
    });

  if (fileInput) {
    fileInput.addEventListener('change', event => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => renderGraphFromText(e.target.result);
      reader.readAsText(file);
    });
  }
});
