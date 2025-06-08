const BASE_URL = window.location.origin;  // Usar siempre la URL actual para evitar problemas

document.addEventListener('DOMContentLoaded', async () => {
    const mensajeError = document.getElementById('mensaje-error');
    const resultadosSolicitudes = document.getElementById('resultados-solicitudes');
    let idcentro;

    // Mostrar mensaje de error
    const mostrarError = (msg) => {
        mensajeError.textContent = msg;
        mensajeError.classList.remove('oculto');
        console.error(msg);
    };

    try {
        // Verificar autenticación
        const response = await fetch(`${BASE_URL}/usuarios/api/auth/check`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);

        const data = await response.json();
        console.log('Respuesta de autenticación:', data);

        if (data.isValid && data.tipo === 'refugio') {
            idcentro = data.userId;

            document.getElementById('nombrecentro').textContent = data.username || 'Refugio';
            document.getElementById('nombreencargado').textContent = data.nombreencargado || 'No especificado';
            document.getElementById('correo').textContent = data.correo || 'No especificado';
            document.getElementById('telefono').textContent = data.telefono || 'No especificado';
            document.getElementById('redesociales').textContent = data.redesociales || 'No especificado';

            await cargarMascotas(idcentro);
            await cargarSolicitudes();
        } else {
            mostrarError('Sesión no válida o tipo incorrecto');
            setTimeout(() => window.location.href = `${BASE_URL}/usuarios/login`, 2000);
        }
    } catch (error) {
        mostrarError(`Error al verificar autenticación: ${error.message}`);
        setTimeout(() => window.location.href = `${BASE_URL}/usuarios/login`, 2000);
    }

    async function cargarMascotas(idcentro) {
        try {
            const response = await fetch(`${BASE_URL}/refugios/mascotas/${idcentro}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);

            const data = await response.json();
            const contenedorGatos = document.getElementById('mascotasRegistradas');
            contenedorGatos.innerHTML = '';

            if (data.success && data.mascotas.length > 0) {
                data.mascotas.forEach(mascota => {
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'tarjeta-gato';
                    tarjeta.innerHTML = `
                        <img src="${mascota.foto || '/img/cat.jpeg'}" alt="${mascota.nombre}">
                        <h3>${mascota.nombre}</h3>
                        <p>${mascota.edad} años • ${mascota.descripcion}</p>
                        <button class="boton-solicitudes" data-mascota-id="${mascota.idmascota}">Solicitudes de Adopción</button>
                    `;
                    contenedorGatos.appendChild(tarjeta);
                });

                document.querySelectorAll('.boton-solicitudes').forEach(button => {
                    button.addEventListener('click', () => {
                        const mascotaId = button.getAttribute('data-mascota-id');
                        window.location.href = `${BASE_URL}/refugiosSolicitudes.html?mascotaId=${mascotaId}&idcentro=${idcentro}`;
                    });
                });
            } else {
                contenedorGatos.innerHTML = '<p>No hay mascotas registradas en este refugio.</p>';
            }
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
            const contenedorGatos = document.getElementById('mascotasRegistradas');
            contenedorGatos.innerHTML = '<p>Error al cargar mascotas.</p>';
        }
    }

    async function cargarSolicitudes() {
        try {
            const response = await fetch(`${BASE_URL}/solicitudes/solicitudes?tipo=refugio&idcentro=${idcentro}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);

            const data = await response.json();
            console.log('Solicitudes obtenidas:', data);
            resultadosSolicitudes.innerHTML = '';

            if (data.success && data.solicitudes.length > 0) {
                data.solicitudes.forEach(solicitud => {
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'tarjeta-gato';
                    tarjeta.innerHTML = `
                        <h3>Solicitud #${solicitud.idsolicitud}</h3>
                        <p><strong>Usuario:</strong> ${solicitud.usuario_nombre || 'Desconocido'}</p>
                        <p><strong>Mascota:</strong> ${solicitud.mascota_nombre || 'Desconocida'}</p>
                        <p><strong>Fecha:</strong> ${new Date(solicitud.fecha).toLocaleDateString()}</p>
                        <p><strong>Estado:</strong> ${solicitud.estado}</p>
                        <p><strong>Motivo:</strong> ${solicitud.motivo || 'No especificado'}</p>
                        <p><strong>Experiencia:</strong> ${solicitud.experiencia || 'No especificada'}</p>
                        <select class="estado-solicitud" data-solicitud-id="${solicitud.idsolicitud}">
                            <option value="pendiente" ${solicitud.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="aprobada" ${solicitud.estado === 'aprobada' ? 'selected' : ''}>Aprobada</option>
                            <option value="rechazada" ${solicitud.estado === 'rechazada' ? 'selected' : ''}>Rechazada</option>
                        </select>
                        <button class="actualizar-estado" data-solicitud-id="${solicitud.idsolicitud}">Actualizar Estado</button>
                    `;
                    resultadosSolicitudes.appendChild(tarjeta);
                });

                // Agregar event listeners para actualizar estado
                document.querySelectorAll('.actualizar-estado').forEach(button => {
                    button.addEventListener('click', async () => {
                        const solicitudId = button.getAttribute('data-solicitud-id');
                        const select = button.previousElementSibling;
                        const nuevoEstado = select.value;

                        try {
                            const res = await fetch(`${BASE_URL}/solicitudes/solicitudes/${solicitudId}/estado`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: nuevoEstado }),
                                credentials: 'include'
                            });

                            const resData = await res.json();

                            if (resData.success) {
                                alert('Estado actualizado correctamente');
                                cargarSolicitudes();
                            } else {
                                mostrarError(resData.message || 'Error al actualizar el estado');
                            }
                        } catch (error) {
                            console.error('Error al actualizar estado:', error);
                            mostrarError('Error al actualizar el estado');
                        }
                    });
                });
            } else {
                resultadosSolicitudes.innerHTML = '<p>No hay solicitudes de adopción aún.</p>';
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            resultadosSolicitudes.innerHTML = '<p>Error al cargar solicitudes.</p>';
        }
    }

    document.getElementById('cerrar-sesion').addEventListener('click', async () => {
        try {
            console.log('Intentando cerrar sesión...');
            const response = await fetch(`${BASE_URL}/usuarios/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
            });

            const data = await response.json();
            console.log('Respuesta de logout:', data);

            if (data.success) {
                sessionStorage.clear();
                window.location.href = `${BASE_URL}/usuarios/login`;
            } else {
                mostrarError('Error al cerrar sesión: ' + (data.message || 'Intenta de nuevo'));
            }
        } catch (error) {
            mostrarError('Error al cerrar sesión: ' + error.message);
        }
    });
});
