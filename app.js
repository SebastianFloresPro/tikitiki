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
const allowedOrigins = [
  'http://localhost:3000',
  'https://tikapawdbp-48n3.onrender.com'  // Tu frontend REAL
];

// Middleware CORS oficial
app.use(cors({
  origin: function(origin, callback) {
    // Permite solicitudes sin origin (ej: Postman o curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido para el origen: ' + origin));
    }
  },
  credentials: true
}));

// Middleware para manejar OPTIONS y headers CORS personalizados
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// --- CONFIGURACIONES BÁSICAS ---
app.set('trust proxy', 1);  // Para producción detrás de proxy (ej: Heroku)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// --- CONFIGURACIÓN DE SESIÓN ---
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000
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

sessionStore.sync();

app.use((req, res, next) => {
  console.log('Sesión actual:', {
    userId: req.session.userId,
    tipo: req.session.tipo,
    cookie: req.session.cookie
  });
  next();
});

// --- RUTAS ---
app.use('/', require('./routes/index'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/refugios', require('./routes/refugios'));
app.use('/mascotas', require('./routes/mascotas'));
app.use('/solicitudes', require('./routes/solicitudes'));

// --- MANEJO DE ERRORES CORS (opcional, para desarrollo) ---
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    console.error('Error de CORS:', err.message);
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

// --- INICIO DEL SERVIDOR ---
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
