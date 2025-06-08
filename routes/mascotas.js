const express = require('express');
const router = express.Router();
const path = require('path');
const { db } = require('../config/database');

router.get('/mascotas-public', (req, res) => {
    const sql = `
        SELECT mascota.idmascota, mascota.nombre, mascota.edad, mascota.descripcion, mascota.foto, centrosdeadopcion.nombrecentro 
        FROM mascota 
        JOIN centrosdeadopcion ON mascota.idcentro = centrosdeadopcion.idcentro
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener mascotas públicas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener mascotas' });
        }
        res.json({ success: true, mascotas: results });
    });
});
///
router.get('/grafos', (req, res) => {
    const idmascota = req.query.idmascota;
    const idcentro = req.query.idcentro;
    res.render('refugio-mascotas-rdf-viewer', { idmascota, idcentro });
});
///
router.get('/mascotas-rdf', (req, res) => {
    const idcentro = req.query.idcentro;
    const idmascota = req.query.idmascota;
    const view = req.query.view;

    let sql = `
        SELECT m.idmascota, m.nombre, m.edad, m.descripcion, m.foto, m.especie, m.genero, m.tamanio,
               c.nombrecentro, c.idcentro
        FROM mascota m
        JOIN centrosdeadopcion c ON m.idcentro = c.idcentro
    `;
    const params = [];

    if (idmascota) {
        sql += ` WHERE m.idmascota = ?`;
        params.push(idmascota);
    } else if (idcentro) {
        sql += ` WHERE m.idcentro = ?`;
        params.push(idcentro);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error generando RDF de mascotas:', err);
            return res.status(500).send('Error generando RDF');
        }

        const escapeXml = (str) => {
            if (!str) return '';
            return str.replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;')
                     .replace(/"/g, '&quot;')
                     .replace(/'/g, '&#39;');
        };

        const baseURL = `${req.protocol}://${req.get('host')}`;
        let rdf = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:tp="${baseURL}/ontology#"
         xmlns:xsd="http://www.w3.org/2001/XMLSchema#">\n`;

        const centrosAgregados = new Set();

        results.forEach(m => {
            rdf += `
    <rdf:Description rdf:about="${baseURL}/mascota/${m.idmascota}">
        <rdf:type rdf:resource="${baseURL}/ontology#Mascota"/>
        <tp:nombre>${escapeXml(m.nombre)}</tp:nombre>
        <tp:edad rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">${m.edad}</tp:edad>
        <tp:especie>${escapeXml(m.especie)}</tp:especie>
        <tp:genero>${escapeXml(m.genero)}</tp:genero>
        <tp:tamanio>${escapeXml(m.tamanio)}</tp:tamanio>
        <tp:descripcion>${escapeXml(m.descripcion)}</tp:descripcion>
        <tp:foto rdf:resource="${baseURL}/images/${escapeXml(m.foto || 'default.jpg')}"/>
        <tp:perteneceA rdf:resource="${baseURL}/centro/${m.idcentro}"/>
    </rdf:Description>`;

            const centroURI = `${baseURL}/centro/${m.idcentro}`;
            if (!centrosAgregados.has(centroURI)) {
                centrosAgregados.add(centroURI);
                rdf += `
    <rdf:Description rdf:about="${centroURI}">
        <rdf:type rdf:resource="${baseURL}/ontology#Shelter"/>
        <tp:nombre>${escapeXml(m.nombrecentro)}</tp:nombre>
    </rdf:Description>`;
            }
        });

        rdf += `\n</rdf:RDF>`;

        if (view === 'html') {
            res.send(`
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"><title>RDF de Mascotas - TikaPaw</title>
                    <style>body { font-family: sans-serif; margin: 20px; } pre { background: #f4f4f4; padding: 10px; border: 1px solid #ccc; }</style>
                </head>
                <body>
                    <h1>RDF de ${idmascota ? 'Mascota' : 'Mascotas del Refugio'}</h1>
                    <pre>${rdf.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                    <a href="/mascotas/mascotas-rdf${idmascota ? `?idmascota=${idmascota}` : ''}">Descargar RDF</a>
                </body></html>`);
        } else {
            res.setHeader('Content-Type', 'application/rdf+xml');
            res.send(rdf);
        }
    });
});

router.get('/', (req, res) => {
    const sql = `
        SELECT idmascota, nombre, especie 
        FROM mascota
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener mascotas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener mascotas' });
        }
        res.json({ success: true, mascotas: results });
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    console.log(`Solicitando mascota con ID: ${id}`);
    const sql = `
        SELECT mascota.*, centrosdeadopcion.nombrecentro 
        FROM mascota 
        JOIN centrosdeadopcion ON mascota.idcentro = centrosdeadopcion.idcentro 
        WHERE idmascota = ?
    `;
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener mascota:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener mascota', error: err.message });
        }
        if (results.length === 0) {
            console.error(`Mascota con ID ${id} no encontrada`);
            return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
        }
        console.log('Mascota encontrada:', results[0]);
        res.json({ success: true, mascota: results[0] });
    });
});

router.post('/solicitar-adopcion', (req, res) => {
    const { mascotaId, motivo, experiencia } = req.body;

    if (!req.session.userId || !req.session.tipo || req.session.tipo !== 'usuario') {
        return res.status(401).json({ success: false, message: 'Debes iniciar sesión como usuario para solicitar adopción' });
    }

    const idusuario = req.session.userId;

    const sql = 'INSERT INTO solicitudes (idusuario, idmascota, fecha, estado, motivo, experiencia) VALUES (?, ?, NOW(), "pendiente", ?, ?)';
    db.query(sql, [idusuario, mascotaId, motivo, experiencia], (err, result) => {
        if (err) {
            console.error('Error al registrar la solicitud:', err);
            return res.status(500).json({ success: false, message: 'Error al registrar la solicitud' });
        }
        console.log('Solicitud registrada con ID:', result.insertId); 
        res.json({ success: true, message: 'Solicitud de adopción registrada exitosamente' });
    });
});

module.exports = router;