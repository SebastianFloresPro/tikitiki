document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const edad = document.getElementById('edad').value;
            const correo = document.getElementById('correo').value;
            const telefono = document.getElementById('telefono').value;
            const password = document.getElementById('password').value;
            const confirmar = document.getElementById('confirmar').value;

            if (password !== confirmar) {
                alert('las contraseñas no coinciden');
                return;
            }

            const datos = { nombre, edad, correo, telefono, password };

            fetch('/usuarios/register', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (datos.success) {
                    alert('registro exitoso');
                    window.location.href = '/usuarios/login';
                } else {
                    alert('error: ' + datos.message);
                }
            })
            .catch(error => {
                console.error('error:', error);
                alert('hubo un problema con el registro');
            });
        });
    }
});