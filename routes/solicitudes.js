const express = require('express');
const router = express.Router();

//const db = require('../config/database');
const { db } = require('../config/database');

router.get('/solicitudes', (req, res) => {
    if (!req.session.userId || !req.session.tipo) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    console.log('Solicitando solicitudes para usuario:', req.session.userId); 

    const { mascotaId, idcentro } = req.query;
    let sql;
    let params;

    if (req.session.tipo === 'refugio' && mascotaId && idcentro) {
       
        if (req.session.userId != idcentro) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        sql = `
            SELECT s.idsolicitud, s.fecha, s.estado, s.motivo, s.experiencia, m.nombre AS mascota_nombre, u.nombre AS usuario_nombre
            FROM solicitudes s
            JOIN mascota m ON s.idmascota = m.idmascota
            JOIN usuario u ON s.idusuario = u.idusuario
            WHERE s.idmascota = ? AND m.idcentro = ?
        `;
        params = [mascotaId, idcentro];
    } else if (req.session.tipo === 'usuario') {
        sql = `
            SELECT s.idsolicitud, s.fecha, s.estado, s.motivo, s.experiencia, m.nombre AS mascota_nombre
            FROM solicitudes s
            JOIN mascota m ON s.idmascota = m.idmascota
            WHERE s.idusuario = ?
        `;
        params = [req.session.userId];
    } else if (req.session.tipo === 'refugio') {
        sql = `
            SELECT s.idsolicitud, s.fecha, s.estado, s.motivo, s.experiencia, m.nombre AS mascota_nombre, u.nombre AS usuario_nombre
            FROM solicitudes s
            JOIN mascota m ON s.idmascota = m.idmascota
            JOIN usuario u ON s.idusuario = u.idusuario
            JOIN centrosdeadopcion c ON m.idcentro = c.idcentro
            WHERE c.idcentro = ?
        `;
        params = [req.session.userId];
    } else {
        return res.status(403).json({ success: false, message: 'Tipo de usuario no permitido' });
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error al obtener solicitudes:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener solicitudes', error: err.message });
        }
        console.log('Solicitudes obtenidas:', results); 
        res.json({ success: true, solicitudes: results });
    });
});

router.post('/solicitudes/:id/estado', (req, res) => {
    const solicitudId = req.params.id;
    const { estado } = req.body;

    if (!req.session.userId || req.session.tipo !== 'refugio') {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const sql = `
        UPDATE solicitudes s
        JOIN mascota m ON s.idmascota = m.idmascota
        SET s.estado = ?
        WHERE s.idsolicitud = ? AND m.idcentro = ?
    `;
    db.query(sql, [estado, solicitudId, req.session.userId], (err, result) => {
        if (err) {
            console.error('Error al actualizar estado:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar estado' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada o no autorizada' });
        }
        res.json({ success: true, message: 'Estado actualizado correctamente' });
    });
});

module.exports = router;