document.addEventListener('DOMContentLoaded', () => {
    const pagina = window.location.pathname;

if (pagina === '/' || pagina === '/index.html') {
    fetch('/mascotas')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.success) {
                const contenedorGatos = document.querySelector('.contenedor-gatos');
                contenedorGatos.innerHTML = '';

                const mascotas = datos.mascotas.slice(0, 5);

                if (mascotas.length > 0) {
                    mascotas.forEach(mascota => {
                        const fotoMascota = mascota.foto || '/img/cat.jpeg';
                        const urlFoto = fotoMascota.startsWith('http') ? fotoMascota : `${window.location.origin}${fotoMascota}`;

                        const tarjeta = document.createElement('div');
                        tarjeta.className = 'tarjeta-gato';
                        tarjeta.innerHTML = `
                            <img src="${urlFoto}" alt="${mascota.nombre}">
                            <h3>${mascota.nombre}</h3>
                            <p>${mascota.edad} años • ${mascota.descripcion || 'Sin descripción'}</p>
                            <a href="/mascota.html?mascotaId=${mascota.idmascota}" class="boton-adoptar">Adóptame</a>
                        `;
                        contenedorGatos.appendChild(tarjeta);
                    });
                } else {
                    contenedorGatos.innerHTML = '<p>No hay mascotas disponibles para adopción en este momento.</p>';
                }
            } else {
                console.error('Error al cargar mascotas:', datos.message);
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            const contenedorGatos = document.querySelector('.contenedor-gatos');
            contenedorGatos.innerHTML = `<p>Error al cargar mascotas: ${error.message}</p>`;
        });
}

    if (pagina === '/refugios' || pagina === '/refugios/') {
        fetch('/refugios/refugios')
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (datos.success) {
                    const contenedorGatos = document.querySelector('.contenedor-gatos');
                    contenedorGatos.innerHTML = '';

                    if (datos.refugios.length > 0) {
                        datos.refugios.forEach(refugio => {
                            const tarjeta = document.createElement('div');
                            tarjeta.className = 'tarjeta-gato';
                            tarjeta.innerHTML = `
                                <img src="/img/cat.jpeg" alt="${refugio.nombrecentro}">
                                <h3>${refugio.nombrecentro}</h3>
                                <p>telefono: ${refugio.telefono}</p>
                                <nav>
                                    <button class="boton-adoptar" onclick="localStorage.setItem('idcentro', ${refugio.idcentro}); window.location.href='/refugios/refugio'">
                                        <a style="text-decoration: none; color: inherit;">mas informacion de refugio</a>
                                    </button>
                                </nav>
                            `;
                            contenedorGatos.appendChild(tarjeta);
                        });
                    } 
                    else {
                        contenedorGatos.innerHTML = '<p>no hay refugios disponibles en este momento.</p>';
                    }
                } 
                else {
                    console.error('error al cargar refugios:', datos.message);
                }
            })
            .catch(error => console.error('error:', error));
    }

    if (pagina === '/refugios/refugio' || pagina === '/refugios/refugio/') {
        const idcentro = localStorage.getItem('idcentro');
        if (idcentro) {
            // Obtener detalles del refugio
            fetch('/refugios/refugios')
                .then(respuesta => respuesta.json())
                .then(datos => {
                    if (datos.success) {
                        const refugio = datos.refugios.find(r => r.idcentro == idcentro);
                        if (refugio) {
                            document.getElementById('refugio-nombre').textContent = refugio.nombrecentro;
                            document.getElementById('refugio-telefono').textContent = refugio.telefono;
                            document.getElementById('refugio-encargado').textContent = refugio.nombreencargado;
          //rdf idcentro
                            const rdfViewerLink = document.getElementById('rdf-viewer-link');
                            const rdfDownloadLink = document.getElementById('rdf-download-link');
                            const graphLink = document.getElementById('graph-link');
                            if (rdfViewerLink && rdfDownloadLink && graphLink) {
                                rdfViewerLink.href = `/mascotas/mascotas-rdf?view=html&idcentro=${idcentro}`;
                                rdfDownloadLink.href = `/mascotas/mascotas-rdf?idcentro=${idcentro}`;
                                graphLink.href = `/mascotas/mascotas-rdf?view=graph&idcentro=${idcentro}`;
                            }
                        }
                    }
                })
                .catch(error => console.error('error al cargar detalles del refugio:', error));

            // Obtener mascotas del refugio
            fetch(`/refugios/mascotas/${idcentro}`)
                .then(respuesta => respuesta.json())
                .then(datos => {
                    if (datos.success) {
                        const contenedorGatos = document.querySelector('.contenedor-gatos');
                        contenedorGatos.innerHTML = '';

                        if (datos.mascotas.length > 0) {
                            datos.mascotas.forEach(mascota => {
                                const tarjeta = document.createElement('div');
                                tarjeta.className = 'tarjeta-gato';
                                tarjeta.innerHTML = `
                                    <img src="/img/cat.jpeg" alt="${mascota.nombre}">
                                    <h3>${mascota.nombre}</h3>
                                    <p>${mascota.edad} años • ${mascota.descripcion}</p>
                                    <a href="/mascota.html?mascotaId=${mascota.idmascota}" class="boton-adoptar">Adóptame</a>
                                    `;
                                contenedorGatos.appendChild(tarjeta);
                            });
                        }
                         else {
                            contenedorGatos.innerHTML = '<p>No hay mascotas disponibles en este refugio.</p>';
                        }
                    }
                     else {
                        console.error('error al cargar mascotas:', datos.message);
                    }
                })
                .catch(error => console.error('error:', error));
        }
         else {
            const contenedorGatos = document.querySelector('.contenedor-gatos');
            contenedorGatos.innerHTML = '<p>Error: No se seleccionó un refugio.</p>';
        }
    }
});
