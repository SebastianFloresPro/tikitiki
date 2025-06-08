document.addEventListener('DOMContentLoaded', () => {
    // Definir URL backend según origen de la página
    const BACKEND_URL = (window.location.origin === 'https://tikapawdbp-48n3.onrender.com')
      ? 'https://tikapawdbp-48n3.onrender.com'
      : (window.location.origin === 'http://localhost:3000' 
          ? 'http://localhost:3000' 
          : 'https://tikapawdbp.onrender.com');

    const resultadosSolicitudes = document.getElementById('resultados-solicitudes');
    const mensajeError = document.getElementById('mensaje-error');
    const urlParams = new URLSearchParams(window.location.search);
    const mascotaId = urlParams.get('mascotaId');
    const idcentro = urlParams.get('idcentro');

    if (!mascotaId || !idcentro) {
        mensajeError.textContent = 'Error: No se especificó una mascota o refugio.';
        mensajeError.classList.remove('oculto');
        return;
    }

    fetch(`${BACKEND_URL}/usuarios/api/auth/check`, { method: 'GET', credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (!data.isValid || data.tipo !== 'refugio' || data.userId != idcentro) {
                window.location.href = '/usuarios/login';
            } else {
                cargarSolicitudes();
            }
        })
        .catch(error => {
            console.error('Error al verificar autenticación:', error);
            mensajeError.textContent = 'Error al verificar autenticación.';
            mensajeError.classList.remove('oculto');
        });

    function cargarSolicitudes() {
        fetch(`${BACKEND_URL}/solicitudes/solicitudes?tipo=refugio&mascotaId=${mascotaId}&idcentro=${idcentro}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
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

                    document.querySelectorAll('.actualizar-estado').forEach(button => {
                        button.addEventListener('click', () => {
                            const solicitudId = button.getAttribute('data-solicitud-id');
                            const select = button.previousElementSibling;
                            const nuevoEstado = select.value;

                            fetch(`${BACKEND_URL}/solicitudes/solicitudes/${solicitudId}/estado`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: nuevoEstado }),
                                credentials: 'include'
                            })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('Estado actualizado correctamente');
                                        cargarSolicitudes();
                                    } else {
                                        mensajeError.textContent = data.message || 'Error al actualizar el estado';
                                        mensajeError.classList.remove('oculto');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error al actualizar estado:', error);
                                    mensajeError.textContent = 'Error al actualizar el estado';
                                    mensajeError.classList.remove('oculto');
                                });
                        });
                    });
                } else {
                    resultadosSolicitudes.innerHTML = '<p>No hay solicitudes para esta mascota.</p>';
                }
            })
            .catch(error => {
                console.error('Error al cargar solicitudes:', error);
                resultadosSolicitudes.innerHTML = '<p>Error al cargar solicitudes.</p>';
            });
    }
});
