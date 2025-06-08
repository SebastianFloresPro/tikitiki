/*
document.addEventListener('DOMContentLoaded', async () => {
    const mensajeExito = document.getElementById('mensaje-exito');
    const mensajeError = document.getElementById('mensaje-error');
    const form = document.getElementById('solicitud-adopcion-form');

    // Obtener mascotaId desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const mascotaId = urlParams.get('mascotaId');
    console.log('Mascota ID extraído de la URL:', mascotaId);

    if (!mascotaId) {
        mensajeError.textContent = 'Error: No se especificó una mascota.';
        mensajeError.classList.add('visible');
        return;
    }

    try {
        // Omitir temporalmente el chequeo de autenticación para pruebas
        console.log('Omitiendo chequeo de autenticación para depuración');

        // Cargar detalles de la mascota con URL absoluta
        const petResponse = await fetch(`http://localhost:3000/mascotas/${mascotaId}`, {
            credentials: 'include'
        });

        console.log('Estado de la respuesta del servidor:', petResponse.status);
        const responseText = await petResponse.text();
        console.log('Respuesta del servidor (Texto):', responseText);

        if (!petResponse.ok) {
            mensajeError.textContent = `Error al cargar los detalles de la mascota. Código: ${petResponse.status} - ${responseText || 'Sin detalles'}`;
            mensajeError.classList.add('visible');
            return;
        }

        try {
            const petData = JSON.parse(responseText);
            console.log('Datos de la mascota parseados:', petData);

            if (petData.success && petData.mascota) {
                document.getElementById('idcentro').textContent = petData.mascota.idcentro || 'Desconocido';
                document.getElementById('idmascota').value = mascotaId;
                document.getElementById('nombre').textContent = petData.mascota.nombre || 'Sin nombre';
                document.getElementById('tamanio').textContent = petData.mascota.tamanio || 'No especificado';
                document.getElementById('especie').textContent = petData.mascota.especie || 'No especificado';
                document.getElementById('edad').textContent = `${petData.mascota.edad || '0'} años`;
                document.getElementById('genero').textContent = petData.mascota.genero || 'No especificado';
                document.getElementById('descripcion').textContent = petData.mascota.descripcion || 'Sin descripción';
                document.getElementById('foto').src = petData.mascota.foto || '/img/cat.jpeg';
            } else {
                mensajeError.textContent = petData.message || 'Mascota no encontrada.';
                mensajeError.classList.add('visible');
            }
        } catch (error) {
            console.error('Error al parsear los datos JSON:', error);
            mensajeError.textContent = 'Error al procesar los datos de la mascota. Verifica el formato JSON.';
            mensajeError.classList.add('visible');
        }
    } catch (error) {
        console.error('Error general al cargar la mascota:', error);
        mensajeError.textContent = `Error al conectar con el servidor. Intenta de nuevo. Detalle: ${error.message}`;
        mensajeError.classList.add('visible');
    }

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensajeExito.classList.remove('visible');
        mensajeError.classList.remove('visible');

        const mascotaId = document.getElementById('idmascota').value;
        console.log('Enviando solicitud para la mascota ID:', mascotaId);

        try {
            const response = await fetch('http://localhost:3000/solicitar-adopcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mascotaId }),
                credentials: 'include'
            });
            const data = await response.json();
            console.log('Respuesta de la solicitud de adopción:', data);

            if (data.success) {
                mensajeExito.classList.add('visible');
                form.reset();
                setTimeout(() => {
                    window.location.href = '/perfilUsuario.html';
                }, 2000);
            } else {
                mensajeError.textContent = data.message || 'Error al enviar la solicitud.';
                mensajeError.classList.add('visible');
            }
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            mensajeError.textContent = 'Error al enviar la solicitud.';
            mensajeError.classList.add('visible');
        }
    });
});
*/

// Detectar backend según origen actual
const BACKEND_URL = (window.location.origin === 'https://tikapawdbp-48n3.onrender.com')
  ? 'https://tikapawdbp-48n3.onrender.com'
  : 'https://tikapawdbp.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
    const mensajeExito = document.getElementById('mensaje-exito');
    const mensajeError = document.getElementById('mensaje-error');
    const form = document.getElementById('solicitud-adopcion-form');

    const urlParams = new URLSearchParams(window.location.search);
    const mascotaId = urlParams.get('mascotaId');
    console.log('Mascota ID extraído de la URL:', mascotaId);

    if (!mascotaId) {
        mensajeError.textContent = 'Error: No se especificó una mascota.';
        mensajeError.classList.add('visible');
        return;
    }

    try {
        // Cambiado localhost por BACKEND_URL
        const authResponse = await fetch(`${BACKEND_URL}/usuarios/api/auth/check`, {
            method: 'GET',
            credentials: 'include'
        });
        console.log('Estado de la respuesta de autenticación:', authResponse.status);
        const authData = await authResponse.json();
        console.log('Datos de autenticación:', authData);

        if (!authData.isValid || authData.tipo !== 'usuario') {
            window.location.href = '/usuarios/login';
            return;
        }

        const petResponse = await fetch(`${BACKEND_URL}/mascotas/${mascotaId}`, {
            credentials: 'include'
        });

        console.log('Estado de la respuesta del servidor:', petResponse.status);
        const responseText = await petResponse.text();
        console.log('Respuesta del servidor (Texto):', responseText);

        if (!petResponse.ok) {
            mensajeError.textContent = `Error al cargar los detalles de la mascota. Código: ${petResponse.status}`;
            mensajeError.classList.add('visible');
            return;
        }
        
        try {
            const petData = JSON.parse(responseText);
            console.log('Datos de la mascota parseados:', petData);

            if (petData.success && petData.mascota) {
                document.getElementById('idcentro').textContent = petData.mascota.nombrecentro || 'Desconocido';
                document.getElementById('idmascota').value = mascotaId;
                document.getElementById('nombre').textContent = petData.mascota.nombre || 'Sin nombre';
                document.getElementById('tamanio').textContent = petData.mascota.tamanio || 'No especificado';
                document.getElementById('especie').textContent = petData.mascota.especie || 'No especificado';
                document.getElementById('edad').textContent = `${petData.mascota.edad || '0'} años`;
                document.getElementById('genero').textContent = petData.mascota.genero || 'No especificado';
                document.getElementById('descripcion').textContent = petData.mascota.descripcion || 'Sin descripción';
                const fotoMascota = petData.mascota.foto || '/img/cat.jpeg';
                const urlFoto = fotoMascota.startsWith('http') ? fotoMascota : `${window.location.origin}${fotoMascota}`;

                document.getElementById('foto').src = urlFoto;
            } else {
                mensajeError.textContent = petData.message || 'Mascota no encontrada.';
                mensajeError.classList.add('visible');
            }
        } catch (error) {
            console.error('Error al parsear los datos JSON:', error);
            mensajeError.textContent = 'Error al procesar los datos de la mascota. Verifica el formato JSON.';
            mensajeError.classList.add('visible');
        }
    } catch (error) {
        console.error('Error general al cargar la mascota:', error);
        mensajeError.textContent = `Error al conectar con el servidor. Intenta de nuevo. Detalle: ${error.message}`;
        mensajeError.classList.add('visible');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Redirigiendo a solicitud.html con mascotaId:', mascotaId);
        window.location.href = `${BACKEND_URL}/solicitud.html?mascotaId=${mascotaId}`;
    });
});
