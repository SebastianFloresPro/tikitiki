document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('solicitud-adopcion-form');
    const selectMascota = document.getElementById('mascota');
    const resultadosSolicitudes = document.getElementById('resultados-solicitudes');
    const mensajeExito = document.getElementById('mensaje-exito');
    const mensajeError = document.getElementById('mensaje-error');
    const perfilMascota = document.getElementById('perfil-mascota');
    let usuarioId;
    let mascotasData = []; 

    fetch('http://localhost:3000/usuarios/api/auth/check', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            console.log('Respuesta de autenticación:', data);
            if (data.isValid && data.tipo === 'usuario') {
                document.getElementById('usuario').value = data.username || 'Usuario';
                usuarioId = data.userId;
                document.getElementById('usuario').disabled = true;
            } else {
                window.location.href = '/usuarios/login';
            }
        })
        .catch(error => {
            console.error('Error al verificar autenticación:', error);
            window.location.href = '/usuarios/login';
        });

    fetch('http://localhost:3000/mascotas', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.mascotas.length > 0) {
                mascotasData = data.mascotas; 
                selectMascota.innerHTML = '<option value="">Selecciona una mascota</option>';
                data.mascotas.forEach(mascota => {
                    const option = document.createElement('option');
                    option.value = mascota.idmascota;
                    option.textContent = `${mascota.nombre} (${mascota.especie})`;
                    selectMascota.appendChild(option);
                });

                const mascotaIdParam = new URLSearchParams(window.location.search).get('mascotaId');
                if (mascotaIdParam) {
                    selectMascota.value = mascotaIdParam;
                    selectMascota.disabled = true;
                    const mascotaSeleccionada = mascotasData.find(m => m.idmascota == mascotaIdParam);
                    if (mascotaSeleccionada) {
                        mostrarPerfilMascota(mascotaSeleccionada);
                    }
                }
            } else {
                selectMascota.innerHTML = '<option value="">No hay mascotas disponibles</option>';
            }
        })
        .catch(error => {
            console.error('Error al cargar mascotas:', error);
            selectMascota.innerHTML = '<option value="">Error al cargar mascotas</option>';
        });

    function mostrarPerfilMascota(mascota) {
        perfilMascota.innerHTML = `
            <h4>${mascota.nombre}</h4>
            <p><strong>Especie:</strong> ${mascota.especie}</p>
            ${mascota.edad ? `<p><strong>Edad:</strong> ${mascota.edad}</p>` : ''}
            ${mascota.descripcion ? `<p><strong>Descripción:</strong> ${mascota.descripcion}</p>` : ''}
        `;
    }

    selectMascota.addEventListener('change', () => {
        const mascotaId = selectMascota.value;
        const mascotaSeleccionada = mascotasData.find(m => m.idmascota == mascotaId);
        if (mascotaSeleccionada) {
            mostrarPerfilMascota(mascotaSeleccionada);
        } else {
            perfilMascota.innerHTML = '';
        }
    });

    function cargarSolicitudes() {
        fetch('http://localhost:3000/solicitudes/solicitudes', { credentials: 'include' }) 
            .then(res => res.json())
            .then(data => {
                resultadosSolicitudes.innerHTML = '';

                if (data.success && data.solicitudes.length > 0) {
                    data.solicitudes.forEach(solicitud => {
                        const tarjeta = document.createElement('div');
                        tarjeta.className = 'tarjeta-gato';
                        tarjeta.innerHTML = `
                            <h3>Solicitud #${solicitud.idsolicitud}</h3>
                            <p><strong>Mascota:</strong> ${solicitud.mascota_nombre || 'Desconocida'}</p>
                            <p><strong>Fecha:</strong> ${new Date(solicitud.fecha).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> ${solicitud.estado}</p>
                            <p><strong>Motivo:</strong> ${solicitud.motivo || 'No especificado'}</p>
                            <p><strong>Experiencia:</strong> ${solicitud.experiencia || 'No especificada'}</p>
                        `;
                        resultadosSolicitudes.appendChild(tarjeta);
                    });
                } else {
                    resultadosSolicitudes.innerHTML = '<p>No hay solicitudes de adopción aún.</p>';
                }
            })
            .catch(error => {
                console.error('Error al cargar solicitudes:', error);
                resultadosSolicitudes.innerHTML = '<p>Error al cargar solicitudes.</p>';
            });
    }

    cargarSolicitudes();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        mensajeExito.classList.add('oculto');
        mensajeError.classList.add('oculto');

        const mascotaId = selectMascota.value || new URLSearchParams(window.location.search).get('mascotaId');
        const motivo = document.getElementById('motivo').value;
        const experiencia = document.getElementById('experiencia').value; 
        console.log({ usuarioId, mascotaId, motivo, experiencia }); 

        if (!usuarioId || !mascotaId || !motivo || !experiencia) {
            mensajeError.textContent = 'Por favor, completa todos los campos.';
            mensajeError.classList.remove('oculto');
            return;
        }

        fetch('http://localhost:3000/mascotas/solicitar-adopcion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mascotaId, motivo, experiencia }),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    mensajeExito.textContent = '¡Solicitud enviada con éxito!';
                    mensajeExito.classList.remove('oculto');
                    form.reset();
                    selectMascota.disabled = false;
                    cargarSolicitudes();
                } else {
                    mensajeError.textContent = data.message || 'Hubo un error al enviar la solicitud.';
                    mensajeError.classList.remove('oculto');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mensajeError.textContent = 'Hubo un error al enviar la solicitud.';
                mensajeError.classList.remove('oculto');
            });
    });
});