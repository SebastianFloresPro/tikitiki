// login.js
/*
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            const datos = { correo: correo, password: password };

            fetch('/usuarios/login', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (datos.success) {
                    alert('inicio exitoso :d');
                    window.location.href = '/';
                } 
                else {
                    alert('error: ' + datos.message);
                }
            })
            .catch(error => {
                console.error('error:', error);
                alert('hubo un problema con el inicio de sesion');
            });
        });
    }
});
*/
/*
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión con el backend primero
    try {
        const response = await fetch('/usuarios/api/auth/check', { credentials: 'include' });
        const { isValid, tipo } = await response.json();

        if (isValid) {
            sessionStorage.setItem('tipoUsuario', tipo);
            const currentPath = window.location.pathname;

            // Redirigir según el tipo de usuario
            if (tipo === 'usuario' && !currentPath.includes('/usuarios/perfil')) {
                window.location.replace('/usuarios/perfil/usuario');
            } else if (tipo === 'refugio' && !currentPath.includes('/refugios/perfil')) {
                window.location.replace('/refugios/perfil/refugio');
            }
        } else {
            sessionStorage.removeItem('tipoUsuario');
            if (!window.location.pathname.includes('/usuarios/login')) {
                window.location.replace('/usuarios/login');
            }
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }

    // Manejo del formulario de login
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password }),
                    credentials: 'include'
                });
                const datos = await response.json();

                if (datos.success) {
                    sessionStorage.setItem('tipoUsuario', datos.tipo);
                    window.location.replace(
                        datos.tipo === 'usuario' 
                            ? '/usuarios/perfil/usuario' 
                            : '/refugios/perfil/refugio'
                    );
                } else {
                    alert('Error: ' + datos.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un problema con el inicio de sesión');
            }
        });
    }
});
*/

const BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:3000' 
  : 'https://tikapawdbp.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
    // Función mejorada para verificar sesión
    async function checkAuth() {
        try {
            const response = await fetch(`${BASE_URL}/usuarios/api/auth/check`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            console.log('Response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Datos de sesión:', data);
            return data;
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            return { isValid: false };
        }
    }

    // Manejo de redirección
    const authData = await checkAuth();
    
    if (authData.isValid) {
        if (authData.tipo === 'usuario' && !window.location.pathname.includes('/perfil/usuario')) {
            window.location.href = `${BASE_URL}/usuarios/perfil/usuario`;
        } else if (authData.tipo === 'refugio' && !window.location.pathname.includes('/perfil/refugio')) {
            window.location.href = `${BASE_URL}/refugios/perfil/refugio`;
        }
    } else if (!window.location.pathname.includes('/login')) {
        window.location.href = `${BASE_URL}/usuarios/login`;
    }

    // Manejo del formulario de login
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${BASE_URL}/usuarios/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ correo, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Forzar recarga limpia de la página
                    window.location.href = data.tipo === 'usuario' 
                        ? `${BASE_URL}/usuarios/perfil/usuario` 
                        : `${BASE_URL}/refugios/perfil/refugio`;
                } else {
                    alert(data.message || 'Error en el inicio de sesión');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }
    const logoutBtn = document.getElementById('logout');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          const response = await fetch(`${BASE_URL}/usuarios/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          });

          const data = await response.json();

          if (data.success) {
            alert('Sesión cerrada correctamente');
            window.location.href = `${BASE_URL}/usuarios/login`;
          } else {
            alert('Error al cerrar sesión');
          }
        } catch (error) {
          console.error('Error en logout:', error);
          alert('Error al conectar con el servidor');
        }
      });
    }
});
