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

// Detectar URL backend según origen de la página
const BASE_URL = (window.location.origin === 'https://tikapawdbp-48n3.onrender.com') 
  ? 'https://tikapawdbp-48n3.onrender.com' 
  : 'https://tikapawdbp.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  async function checkAuth() {
    try {
      const res = await fetch(`${BASE_URL}/usuarios/api/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('Error al verificar sesión:', e);
      return { isValid: false };
    }
  }

  const authData = await checkAuth();

  if (authData.isValid) {
    if (authData.tipo === 'usuario' && !location.pathname.includes('/perfil/usuario')) {
      location.href = `${BASE_URL}/usuarios/perfil/usuario`;
    } else if (authData.tipo === 'refugio' && !location.pathname.includes('/perfil/refugio')) {
      location.href = `${BASE_URL}/refugios/perfil/refugio`;
    }
  } else if (!location.pathname.includes('/login')) {
    location.href = `${BASE_URL}/usuarios/login`;
  }

  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const correo = document.getElementById('correo').value.trim();
      const password = document.getElementById('password').value.trim();
      if (!correo || !password) {
        alert('Completa todos los campos.');
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/usuarios/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo, password })
        });
        if (!res.ok) {
          alert('Error en el servidor, intenta más tarde.');
          return;
        }
        const data = await res.json();
        if (data.success) {
          const urlDestino = data.tipo === 'usuario'
            ? `${BASE_URL}/usuarios/perfil/usuario`
            : `${BASE_URL}/refugios/perfil/refugio`;
          location.href = urlDestino;
        } else {
          alert(data.message || 'Credenciales incorrectas');
        }
      } catch (err) {
        console.error('Error al iniciar sesión:', err);
        alert('No se pudo conectar con el servidor.');
      }
    });
  }

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${BASE_URL}/usuarios/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          alert('Sesión cerrada correctamente');
          location.href = `${BASE_URL}/usuarios/login`;
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
