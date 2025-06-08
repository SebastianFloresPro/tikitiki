const BASE_URL = window.location.origin; 

document.addEventListener('DOMContentLoaded', async () => {
    let usuarioId;

    const mostrarError = (mensaje) => {
        const mensajeError = document.getElementById('mensaje-error');
        mensajeError.textContent = mensaje;
        mensajeError.classList.remove('oculto');
        console.error(mensaje);
    };

    try {
        const response = await fetch(`${BASE_URL}/usuarios/api/auth/check`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Respuesta de autenticación:', data);

        if (data.isValid && data.tipo === 'usuario') {
            usuarioId = data.userId;
            document.getElementById('nombre').textContent = data.username || 'Usuario';
            document.getElementById('edad').textContent = data.edad || 'No especificada';
            document.getElementById('correo').textContent = data.correo || 'No especificado';
            document.getElementById('telefono').textContent = data.telefono || 'No especificado';
            console.log('Datos del usuario asignados:', {
                nombre: document.getElementById('nombre').textContent,
                edad: document.getElementById('edad').textContent,
                correo: document.getElementById('correo').textContent,
                telefono: document.getElementById('telefono').textContent
            });

            await cargarSolicitudes();
        } else {
            mostrarError('Sesión no válida o tipo de usuario incorrecto');
            setTimeout(() => window.location.href = `${BASE_URL}/usuarios/login`, 2000);
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        mostrarError(`Error al verificar autenticación: ${error.message}`);
        setTimeout(() => window.location.href = `${BASE_URL}/usuarios/login`, 2000);
    }

    async function cargarSolicitudes() {
        try {
            const response = await fetch(`${BASE_URL}/solicitudes/solicitudes?tipo=usuario&id=${usuarioId}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const resultadosSolicitudes = document.getElementById('resultados-solicitudes');
            resultadosSolicitudes.innerHTML = '';

            if (data.success && data.solicitudes && data.solicitudes.length > 0) {
                data.solicitudes.forEach(solicitud => {
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'tarjeta-solicitud';
                    tarjeta.innerHTML = `
                        <img src="${solicitud.mascota_foto || '/img/cat.jpeg'}" alt="${solicitud.mascota_nombre || 'Mascota'}">
                        <h3>Solicitud #${solicitud.idsolicitud}</h3>
                        <p><strong>Mascota:</strong> ${solicitud.mascota_nombre || 'Desconocida'}</p>
                        <p><strong>Fecha:</strong> ${new Date(solicitud.fecha).toLocaleDateString('es-ES')}</p>
                        <p><strong>Estado:</strong> <span class="estado-${solicitud.estado}">${solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}</span></p>
                        <a href="${BASE_URL}/mascota.html?mascotaId=${solicitud.idmascota}" class="boton-heroico">Ver Mascota</a>
                    `;
                    resultadosSolicitudes.appendChild(tarjeta);
                });
            } else {
                resultadosSolicitudes.innerHTML = '<p>No hay solicitudes de adopción aún.</p>';
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            mostrarError(`Error al cargar las solicitudes: ${error.message}`);
        }
    }

    document.getElementById('logout').addEventListener('click', async () => {
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
            console.error('Error al cerrar sesión:', error);
            mostrarError('Error al cerrar sesión: ' + error.message);
        }
    });
});
