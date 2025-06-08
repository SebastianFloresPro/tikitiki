// usuarios.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const path = require('path');
const bcrypt = require('bcrypt');

// Ruta para mostrar formulario de registro
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'register.html'));
});

// Procesar registro de usuario
router.post('/register', async (req, res) => {
    const { nombre, edad, correo, telefono, password } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = 'INSERT INTO usuario (nombre, edad, correo, telefono, contrasena) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [nombre, edad, correo, telefono, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ success: false, message: 'Error al registrar usuario' });
            }
            res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        console.error('Error al encriptar contraseña:', error);
        res.status(500).json({ success: false, message: 'Error al procesar el registro' });
    }
});

// Ruta para mostrar formulario de login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

// Procesar inicio de sesión
router.post('/login', async (req, res) => {
    if (req.session.userId) {
        console.log('Sesión ya activa:', req.session);
        return res.json({ 
            success: true, 
            tipo: req.session.tipo,
            userId: req.session.userId
        });
    }

    const { correo, password } = req.body;

    try {
        // Buscar en tabla de usuarios
        const sqlUsuario = 'SELECT idusuario, nombre, contrasena FROM usuario WHERE correo = ?';
        db.query(sqlUsuario, [correo], async (err, resultsUsuario) => {
            if (err) {
                console.error('Error al iniciar sesión (usuario):', err);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }

            if (resultsUsuario.length > 0) {
                const usuario = resultsUsuario[0];
                const match = await bcrypt.compare(password, usuario.contrasena);
                if (match) {
                    req.session.userId = usuario.idusuario;
                    req.session.tipo = 'usuario';
                    req.session.save(err => {
                        if (err) {
                            console.error('Error al guardar sesión:', err);
                            return res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
                        }
                        console.log('Login exitoso (usuario):', req.session);
                        return res.json({ 
                            success: true, 
                            tipo: 'usuario',
                            userId: usuario.idusuario
                        });
                    });
                    return;
                }
            }

            // Buscar en tabla de refugios
            const sqlRefugio = 'SELECT idcentro, nombrecentro, contrasena FROM centrosdeadopcion WHERE correo = ?';
            db.query(sqlRefugio, [correo], async (err, resultsRefugio) => {
                if (err) {
                    console.error('Error al iniciar sesión (refugio):', err);
                    return res.status(500).json({ success: false, message: 'Error del servidor' });
                }

                if (resultsRefugio.length > 0) {
                    const refugio = resultsRefugio[0];
                    const match = await bcrypt.compare(password, refugio.contrasena);
                    if (match) {
                        req.session.userId = refugio.idcentro;
                        req.session.tipo = 'refugio';
                        req.session.save(err => {
                            if (err) {
                                console.error('Error al guardar sesión:', err);
                                return res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
                            }
                            console.log('Login exitoso (refugio):', req.session);
                            return res.json({ 
                                success: true, 
                                tipo: 'refugio',
                                userId: refugio.idcentro
                            });
                        });
                        return;
                    }
                }

                // Credenciales incorrectas
                return res.status(401).json({ 
                    success: false, 
                    message: 'Correo o contraseña incorrectos' 
                });
            });
        });
    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
});

// Verificar estado de autenticación
router.get('/api/auth/check', (req, res) => {
    console.log('Sesión completa:', req.session);
    console.log('Cookies recibidas:', req.headers.cookie);

    if (!req.session.userId || !req.session.tipo) {
        console.log('Sesión no válida - Faltan datos');
        return res.json({ isValid: false });
    }

    if (req.session.tipo === 'usuario') {
        const sql = 'SELECT idusuario, nombre, edad, correo, telefono FROM usuario WHERE idusuario = ?';
        db.query(sql, [req.session.userId], (err, results) => {
            if (err || results.length === 0) {
                console.error('Error al verificar usuario:', err || 'Usuario no encontrado');
                return res.json({ isValid: false });
            }
            const user = results[0];
            res.json({
                isValid: true,
                tipo: req.session.tipo,
                userId: user.idusuario,
                username: user.nombre,
                edad: user.edad,
                correo: user.correo,
                telefono: user.telefono
            });
        });
    } else if (req.session.tipo === 'refugio') {
        const sql = 'SELECT idcentro, nombrecentro, nombreencargado, correo, telefono, redesociales FROM centrosdeadopcion WHERE idcentro = ?';
        db.query(sql, [req.session.userId], (err, results) => {
            if (err || results.length === 0) {
                console.error('Error al verificar refugio:', err || 'Refugio no encontrado');
                return res.json({ isValid: false });
            }
            const refugio = results[0];
            res.json({
                isValid: true,
                tipo: req.session.tipo,
                userId: refugio.idcentro,
                username: refugio.nombrecentro,
                nombreencargado: refugio.nombreencargado,
                correo: refugio.correo,
                telefono: refugio.telefono,
                redesociales: refugio.redesociales
            });
        });
    } else {
        console.log('Tipo de sesión desconocido:', req.session.tipo);
        res.json({ isValid: false });
    }
});

// Ruta para perfil de usuario
router.get('/perfil/usuario', (req, res) => {
    if (!req.session.userId || req.session.tipo !== 'usuario') {
        return res.redirect('/usuarios/login');
    }
    res.sendFile(path.join(__dirname, '../views', 'perfilUsuario.html'));
});

// Obtener datos de perfil de usuario
router.get('/perfil/usuario/datos', (req, res) => {
  if (!req.session.userId || req.session.tipo !== 'usuario') {
      return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  const sql = 'SELECT nombre, edad, correo, telefono FROM usuario WHERE idusuario = ?';
  db.query(sql, [req.session.userId], (err, results) => {
      if (err) {
          console.error('Error al obtener datos del usuario:', err);
          return res.status(500).json({ success: false, message: 'Error del servidor' });
      }
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      res.json({ success: true, data: results[0] });
  });
});

// RDF para login (opcional)
router.get('/login/rdf', (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const rdf = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:tiki="${baseURL}/rdf#">
  <rdf:Description rdf:about="${baseURL}/usuarios/login">
    <tiki:descripcion>Accede a tu cuenta o regístrate.</tiki:descripcion>
    <tiki:enlaceRegistrar rdf:resource="${baseURL}/usuarios/register"/>
    <tiki:yaTengoCuenta rdf:resource="${baseURL}/usuarios/login"/>
  </rdf:Description>
</rdf:RDF>`;

    res.type('application/rdf+xml');
    res.send(rdf);
});

// RDF para registro (opcional)
router.get('/register/rdf', (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const rdf = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:tiki="${baseURL}/rdf#">
  <rdf:Description rdf:about="${baseURL}/usuarios/register">
    <tiki:descripcion>Formulario para crear una cuenta de usuario.</tiki:descripcion>
    <tiki:yaTengoCuenta rdf:resource="${baseURL}/usuarios/login"/>
  </rdf:Description>
</rdf:RDF>`;

    res.type('application/rdf+xml');
    res.send(rdf);
});

module.exports = router;
