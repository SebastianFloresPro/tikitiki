const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
//const db = require('../config/database');
const { db } = require('../config/database');

const bcrypt = require('bcrypt'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/registerrefugio', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'registerrefugio.html'));
});

router.post('/registerrefugio', async (req, res) => {
    const { nombreencargado, nombrecentro, telefono, correo, redesociales, contrasena } = req.body;
    const adopcion = true;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena || '123', saltRounds);

        const sql = 'INSERT INTO centrosdeadopcion (nombrecentro, adopcion, nombreencargado, telefono, correo, contrasena, redesociales) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [nombrecentro, adopcion, nombreencargado, telefono, correo, hashedPassword, redesociales], (err, result) => {
            if (err) {
                console.error('Error al registrar refugio:', err);
                return res.json({ success: false, message: 'Error al registrar refugio' });
            }
            const newId = result.insertId;
            res.json({ success: true, message: 'Refugio registrado exitosamente', idcentro: newId });
        });
    } catch (error) {
        console.error('Error al encriptar contraseña:', error);
        res.json({ success: false, message: 'Error al procesar el registro' });
    }
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'refugios.html'));
});

router.get('/refugios', (req, res) => {
    const sql = 'SELECT * FROM centrosdeadopcion';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener refugios:', err);
            return res.json({ success: false, message: 'Error al obtener refugios' });
        }
        res.json({ success: true, refugios: results });
    });
});

router.get('/refugio', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/refugio.html'));
});

router.get('/mascotas/:idcentro', (req, res) => {
    const idcentro = req.params.idcentro;
    const sql = 'SELECT * FROM mascota WHERE idcentro = ?';
    db.query(sql, [idcentro], (err, results) => {
        if (err) {
            console.error('Error al obtener mascotas del refugio:', err);
            return res.json({ success: false, message: 'Error al obtener mascotas' });
        }
        res.json({ success: true, mascotas: results });
    });
});

router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    const sqlRefugio = 'SELECT idcentro, nombrecentro, contrasena FROM centrosdeadopcion WHERE correo = ?';
    db.query(sqlRefugio, [correo], async (err, resultsRefugio) => {
        if (err) {
            console.error('Error al iniciar sesión (refugio):', err);
            return res.json({ success: false, message: 'Error del servidor' });
        }

        if (resultsRefugio.length > 0) {
            const refugio = resultsRefugio[0];
            const match = await bcrypt.compare(password, refugio.contrasena);
            if (match) {
                req.session.userId = refugio.idcentro;
                req.session.tipo = 'refugio';
                return res.json({ success: true, tipo: 'refugio' });
            }
        }

        return res.json({ success: false, message: 'Correo o contraseña incorrectos' });
    });
});

router.get('/perfil/refugio', (req, res) => {
    if (!req.session.userId || req.session.tipo !== 'refugio') {
        return res.redirect('/usuarios/login');
    }
    res.sendFile(path.join(__dirname, '../views', 'perfilRefugio.html'));
});

router.get('/api/perfil', (req, res) => {
    if (!req.session.userId || req.session.tipo !== 'refugio') {
        return res.json({ success: false, message: 'Debe iniciar sesión como refugio' });
    }

    const sql = 'SELECT * FROM centrosdeadopcion WHERE idcentro = ?';
    db.query(sql, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error al obtener perfil de refugio:', err);
            return res.json({ success: false, message: 'Error al obtener perfil' });
        }
        if (results.length > 0) {
            res.json({ success: true, refugio: results[0] });
        } else {
            res.json({ success: false, message: 'No se encontró el refugio' });
        }
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ success: false, message: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    });
});

router.post('/mascotas/register', upload.single('foto'), (req, res) => {
    const { nombre, tamanio, especie, edad, genero, descripcion, idcentro } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!nombre || !tamanio || !especie || !edad || !genero || !descripcion || !idcentro) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const sql = 'INSERT INTO mascota (nombre, tamanio, especie, edad, genero, descripcion, idcentro, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [nombre, tamanio, especie, edad, genero, descripcion, idcentro, foto], (err, result) => {
        if (err) {
            console.error('Error al registrar mascota:', err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
        res.json({ success: true, message: 'Mascota registrada con éxito' });
    });
});

router.get('/mascotas', (req, res) => {
    if (!req.session.userId || req.session.tipo !== 'refugio') {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const idcentro = req.session.userId;
    const sql = 'SELECT * FROM mascota WHERE idcentro = ?';

    db.query(sql, [idcentro], (err, results) => {
        if (err) {
            console.error('Error al obtener mascotas:', err);
            return res.json({ success: false, message: 'Error al obtener mascotas' });
        }
        res.json({ success: true, mascotas: results });
    });
});

router.get('/registermascota', (req, res) => {
    if (!req.session.userId || req.session.tipo !== 'refugio') {
        return res.redirect('/usuarios/login');
    }
    res.sendFile(path.join(__dirname, '../views/registermascota.html'));
});

router.get('/api/auth/check', (req, res) => {
    if (req.session.userId && req.session.tipo) {
        res.json({ isValid: true, tipo: req.session.tipo, userId: req.session.userId });
    } else {
        res.json({ isValid: false });
    }
});

router.get('/refugioseSolicitudes.html', (req, res) => {
    if (!req.session.userId || req.session.tipo !== 'refugio') {
        return res.redirect('/usuarios/login');
    }
    res.sendFile(path.join(__dirname, '../views', 'refugiosesolicitudes.html'));
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/rdf', (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const view = req.query.view;
    const refugioSQL = 'SELECT * FROM centrosdeadopcion';

    db.query(refugioSQL, (err, refugios) => {
        if (err) {
            console.error('Error al obtener refugios:', err);
            return res.status(500).send('Error interno');
        }

        let rdf = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:tiki="${baseURL}/rdf#">`;

        for (let r of refugios) {
            const url = `${baseURL}/refugio/${r.idcentro}`;
            const nombre = r.nombrecentro.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const direccion = (r.direccion || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const correo = (r.correo || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const telefono = (r.telefono || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            rdf += `
    <rdf:Description rdf:about="${url}">
        <tiki:nombre>${nombre}</tiki:nombre>
        <tiki:direccion>${direccion}</tiki:direccion>
        <tiki:correo>${correo}</tiki:correo>
        <tiki:telefono>${telefono}</tiki:telefono>
    </rdf:Description>`;
        }

        rdf += '\n</rdf:RDF>';

        if (view === 'html') {
            res.send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>RDF de Refugios - TikaPaw</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        pre { background: #f4f4f4; padding: 10px; border: 1px solid #ccc; }
                    </style>
                </head>
                <body>
                    <h1>RDF de Refugios</h1>
                    <pre>${rdf.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                    <a href="/refugios/rdf">Descargar RDF</a> | <a href="/refugios/rdf?view=graph">Ver grafo</a>
                </body>
                </html>
            `);
        } else if (view === 'graph') {
            res.sendFile(path.join(__dirname, '../views', 'refugios-rdf-viewer.html'));
        } else {
            res.type('application/rdf+xml');
            res.send(rdf);
        }
    });
});
///
router.get('/registerrefugio/rdf', (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const view = req.query.view;

    const rdf = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:tiki="${baseURL}/rdf#">
    <rdf:Description rdf:about="${baseURL}/refugios/registerrefugio">
        <tiki:descripcion>Registra un nuevo centro de adopción.</tiki:descripcion>
        <tiki:yaTengoCuenta rdf:resource="${baseURL}/usuarios/login"/>
    </rdf:Description>
</rdf:RDF>`;

    if (view === 'html') {
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>RDF de Registro de Refugio - TikaPaw</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    pre { background: #f4f4f4; padding: 10px; border: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <h1>RDF de Registro de Refugio</h1>
                <pre>${rdf.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <a href="/refugios/registerrefugio/rdf">Descargar RDF</a> | <a href="/refugios/registerrefugio/rdf?view=graph">Ver grafo</a>
            </body>
            </html>
        `);
    } else if (view === 'graph') {
        res.sendFile(path.join(__dirname, '../views', 'registerrefugio-rdf-viewer.html'));
    } else {
        res.type('application/rdf+xml');
        res.send(rdf);
    }
});
///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;