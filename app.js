/*
const express = require('express');
const session = require('express-session'); 
const path = require('path');
const db = require('./config/database');
const cors = require('cors');
// Rutas
const indexRoutes = require('./routes/index');
const usuariosRoutes = require('./routes/usuarios');
const refugiosRoutes = require('./routes/refugios');
const mascotasRoutes = require('./routes/mascotas');
const solicitudesRoutes = require('./routes/solicitudes');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true 
        
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
// Rutas
app.use('/', indexRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/refugios', refugiosRoutes);
app.use('/mascotas', mascotasRoutes);
//app.use('/', solicitudesRoutes);
app.use('/solicitudes', solicitudesRoutes);

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
*/
// app.js
// app.js
/*
const express = require('express');
const session = require('express-session'); 
const path = require('path');
const db = require('./config/database');
const cors = require('cors');
// Rutas
const indexRoutes = require('./routes/index');
const usuariosRoutes = require('./routes/usuarios');
const refugiosRoutes = require('./routes/refugios');
const mascotasRoutes = require('./routes/mascotas');
const solicitudesRoutes = require('./routes/solicitudes');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true 
        
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
// Rutas
app.use('/', indexRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/refugios', refugiosRoutes);
app.use('/mascotas', mascotasRoutes);
//app.use('/', solicitudesRoutes);
app.use('/solicitudes', solicitudesRoutes);

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
*/
// app.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { db, sequelize } = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE CORS ---
// Definí aquí el arreglo allowedOrigins y la configuración cors,
// solo 1 vez en todo el backend, justo antes de middlewares.
const allowedOrigins = [
  'http://localhost:3000',
  'https://tikapawdbp.onrender.com',
  'https://tikapawdbp-48n3.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origen (ej: postman, o mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS no permitido: ' + origin));
  },
  credentials: true
}));

// --- CONFIGURACIONES BÁSICAS ---

app.set('trust proxy', 1);  // Para producción detrás de proxy (ej: Heroku)

app.use(express.json());             // Para parsear JSON
app.use(express.urlencoded({ extended: true }));  // Para parsear form data
app.use(cookieParser());             // Para cookies
app.use(express.static(path.join(__dirname, 'public')));   // Archivos públicos
app.use(express.static(path.join(__dirname, 'views')));    // Vistas estáticas

// --- CONFIGURACIÓN DE SESIÓN CON SequelizeStore ---

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,       // Cada 15 min limpia sesiones expiradas
  expiration: 7 * 24 * 60 * 60 * 1000            // Expiran a los 7 días
});

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || '91119adbb9f0f692a5838d138883bd53',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Sincroniza la tabla de sesiones en la DB
sessionStore.sync();

// Middleware para imprimir estado de sesión (para debug)
app.use((req, res, next) => {
  console.log('Sesión actual:', {
    userId: req.session.userId,
    tipo: req.session.tipo,
    cookie: req.session.cookie
  });
  next();
});

// --- RUTAS ---

// Rutas principales (index, usuarios, refugios, mascotas, solicitudes)
app.use('/', require('./routes/index'));
app.use('/usuarios', require('./routes/usuarios'));    // Aquí va tu archivo usuarios.js
app.use('/refugios', require('./routes/refugios'));
app.use('/mascotas', require('./routes/mascotas'));
app.use('/solicitudes', require('./routes/solicitudes'));

// --- INICIO DEL SERVIDOR ---

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


