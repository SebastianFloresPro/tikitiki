document.addEventListener('DOMContentLoaded', () => {
    console.log('busqueda.js cargado correctamente');

    const resultadosHeaderDiv = document.createElement('div');
    resultadosHeaderDiv.id = 'resultados';
    const seccionHeroica = document.querySelector('.seccion-heroica');
    if (seccionHeroica) {
        seccionHeroica.appendChild(resultadosHeaderDiv);
        console.log('Contenedor de resultados para el header creado');
    } else {
        console.log('No se encontró .seccion-heroica');
    }

    const resultadosInformativaDiv = document.getElementById('resultados-informativa');
    if (resultadosInformativaDiv) {
        console.log('Contenedor de resultados para la sección informativa encontrado');
    } else {
        console.log('No se encontró #resultados-informativa');
    }

    window.buscarRefugio = async () => {
        console.log('Función buscarRefugio (header) ejecutada');
        const termino = document.getElementById('buscar-refugio').value.trim();
        console.log('Término de búsqueda (header - refugio):', termino);
        if (!termino) {
            alert('Por favor, ingresa un término de búsqueda.');
            return;
        }

        try {
            const response = await fetch(`/busqueda/refugios?nombre=${encodeURIComponent(termino)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Respuesta del servidor (refugios - header):', response.status, response.statusText);
            const datos = await response.json();
            console.log('Datos recibidos (refugios - header):', datos);

            mostrarResultados(datos, 'refugios', resultadosHeaderDiv);
        } catch (error) {
            console.error('Error al buscar refugios (header):', error);
            resultadosHeaderDiv.innerHTML = '<p>Hubo un problema al buscar refugios.</p>';
        }
    };

    window.buscarMascota = async () => {
        console.log('Función buscarMascota (header) ejecutada');
        const termino = document.getElementById('buscar-mascota').value.trim();
        console.log('Término de búsqueda (header - mascota):', termino);
        if (!termino) {
            alert('Por favor, ingresa un término de búsqueda.');
            return;
        }

        try {
            const response = await fetch(`/busqueda/mascotas?termino=${encodeURIComponent(termino)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Respuesta del servidor (mascotas - header):', response.status, response.statusText);
            const datos = await response.json();
            console.log('Datos recibidos (mascotas - header):', datos);

            mostrarResultados(datos, 'mascotas', resultadosHeaderDiv);
        } catch (error) {
            console.error('Error al buscar mascotas (header):', error);
            resultadosHeaderDiv.innerHTML = '<p>Hubo un problema al buscar mascotas.</p>';
        }
    };
    window.buscarRefugioInformativa = async () => {
        console.log('Función buscarRefugioInformativa ejecutada');
        const termino = document.getElementById('buscar-refugio-informativa').value.trim();
        console.log('Término de búsqueda (informativa - refugio):', termino);
        if (!termino) {
            alert('Por favor, ingresa un término de búsqueda.');
            return;
        }

        try {
            const response = await fetch(`/busqueda/refugios?nombre=${encodeURIComponent(termino)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Respuesta del servidor (refugios - informativa):', response.status, response.statusText);
            const datos = await response.json();
            console.log('Datos recibidos (refugios - informativa):', datos);

            mostrarResultados(datos, 'refugios', resultadosInformativaDiv);
        } catch (error) {
            console.error('Error al buscar refugios (informativa):', error);
            if (resultadosInformativaDiv) {
                resultadosInformativaDiv.innerHTML = '<p>Hubo un problema al buscar refugios.</p>';
            }
        }
    };

    window.buscarMascotaInformativa = async () => {
        console.log('Función buscarMascotaInformativa ejecutada');
        const termino = document.getElementById('buscar-mascota-informativa').value.trim();
        console.log('Término de búsqueda (informativa - mascota):', termino);
        if (!termino) {
            alert('Por favor, ingresa un término de búsqueda.');
            return;
        }

        try {
            const response = await fetch(`/busqueda/mascotas?termino=${encodeURIComponent(termino)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Respuesta del servidor (mascotas - informativa):', response.status, response.statusText);
            const datos = await response.json();
            console.log('Datos recibidos (mascotas - informativa):', datos);

            mostrarResultados(datos, 'mascotas', resultadosInformativaDiv);
        } catch (error) {
            console.error('Error al buscar mascotas (informativa):', error);
            if (resultadosInformativaDiv) {
                resultadosInformativaDiv.innerHTML = '<p>Hubo un problema al buscar mascotas.</p>';
            }
        }
    };

    function mostrarResultados(datos, tipo, contenedor) {
        console.log('Mostrando resultados en contenedor:', contenedor ? contenedor.id : 'Contenedor no definido');
        if (!contenedor) {
            console.error('Contenedor no encontrado');
            return;
        }
        contenedor.innerHTML = '';

        if (datos.success) {
            if (tipo === 'refugios' && datos.refugios && datos.refugios.length > 0) {
               
                const galeria = document.createElement('div');
                galeria.classList.add('contenedor-gatos');

                datos.refugios.forEach(refugio => {
                    const tarjeta = document.createElement('div');
                    tarjeta.classList.add('tarjeta-gato');
                    tarjeta.innerHTML = `
                        <img src="/img/cat.jpeg" alt="${refugio.nombrecentro}">
                        <h3>${refugio.nombrecentro}</h3>
                        <p>Teléfono: ${refugio.telefono}</p>
                        <nav>
                            <button class="boton-adoptar">
                                <a href="/refugios/refugio?id=${refugio.idcentro}" style="text-decoration: none; color: inherit;">
                                    Más información
                                </a>
                            </button>
                        </nav>
                    `;
                    galeria.appendChild(tarjeta);
                });

                const header = document.createElement('h3');
                header.textContent = 'Refugios encontrados:';
                header.style.textAlign = 'center';
                header.style.marginBottom = '20px';
                contenedor.appendChild(header);
                contenedor.appendChild(galeria);
            } 
            else if (tipo === 'mascotas' && datos.mascotas && datos.mascotas.length > 0) {
                
                const galeria = document.createElement('div');
                galeria.classList.add('contenedor-gatos');

                datos.mascotas.forEach(mascota => {
                    const tarjeta = document.createElement('div');
                    tarjeta.classList.add('tarjeta-gato');
                    tarjeta.innerHTML = `
                        <img src="/img/cat.jpeg" alt="${mascota.nombre}">
                        <h3>${mascota.nombre}</h3>
                        <p>${mascota.edad} años • ${mascota.descripcion}</p>
                        <button class="boton-adoptar">Adoptar</button>
                    `;
                    galeria.appendChild(tarjeta);
                });

                const header = document.createElement('h3');
                header.textContent = 'Mascotas encontradas:';
                header.style.textAlign = 'center';
                header.style.marginBottom = '20px';
                contenedor.appendChild(header);
                contenedor.appendChild(galeria);
            } 
            else {
                contenedor.innerHTML = `<p style="text-align: center;">No se encontraron ${tipo === 'refugios' ? 'refugios' : 'mascotas'}.</p>`;
            }
        } 
        else {
            contenedor.innerHTML = `<p style="text-align: center;">Error: ${datos.message}</p>`;
        }
    }
});