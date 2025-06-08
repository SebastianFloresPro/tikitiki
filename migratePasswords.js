require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function migratePasswords() {
    // Crear la conexión a la base de datos
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'aliceg',
        database: process.env.DB_DATABASE || 'dbtikapaw',
        port: process.env.DB_PORT || 3306
    });

    const saltRounds = 10;

    try {
        // Migrar contraseñas de la tabla `usuario`
        console.log('Migrando contraseñas de usuarios...');
        const [usuarios] = await connection.execute('SELECT idusuario, contrasena FROM usuario');
        for (const usuario of usuarios) {
            // Verificar si la contraseña ya está encriptada (empieza con $2b$)
            if (!usuario.contrasena.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(usuario.contrasena, saltRounds);
                await connection.execute(
                    'UPDATE usuario SET contrasena = ? WHERE idusuario = ?',
                    [hashedPassword, usuario.idusuario]
                );
                console.log(`Contraseña del usuario con id ${usuario.idusuario} actualizada.`);
            } else {
                console.log(`Contraseña del usuario con id ${usuario.idusuario} ya está encriptada.`);
            }
        }

        // Migrar contraseñas de la tabla `centrosdeadopcion`
        console.log('Migrando contraseñas de refugios...');
        const [refugios] = await connection.execute('SELECT idcentro, contrasena FROM centrosdeadopcion');
        for (const refugio of refugios) {
            // Verificar si la contraseña ya está encriptada
            if (!refugio.contrasena.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(refugio.contrasena, saltRounds);
                await connection.execute(
                    'UPDATE centrosdeadopcion SET contrasena = ? WHERE idcentro = ?',
                    [hashedPassword, refugio.idcentro]
                );
                console.log(`Contraseña del refugio con id ${refugio.idcentro} actualizada.`);
            } else {
                console.log(`Contraseña del refugio con id ${refugio.idcentro} ya está encriptada.`);
            }
        }

        console.log('Migración de contraseñas completada exitosamente.');
    } catch (error) {
        console.error('Error al migrar contraseñas:', error);
    } finally {
        await connection.end();
    }
}

migratePasswords();