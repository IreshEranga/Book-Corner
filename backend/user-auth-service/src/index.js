const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'User Auth Service API', version: '1.0.0' }
  },
  apis: ['./src/routes/*.js']
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 User Auth Service running on http://localhost:${PORT}`));

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const swaggerUi = require('swagger-ui-express');
// const swaggerJsdoc = require('swagger-jsdoc');

// require('dotenv').config(); // ✅ Must be first

// require('./config/db');

// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/user');

// const app = express();

// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' }, // ✅ Fix helmet
// }));

// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000', // ✅ Explicit origin
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.options('*', cors()); // ✅ Handle preflight

// app.use(express.json());

// // Swagger
// const swaggerOptions = {
//   definition: {
//     openapi: '3.0.0',
//     info: { title: 'User Auth Service API', version: '1.0.0' }
//   },
//   apis: ['./src/routes/*.js']
// };
// const specs = swaggerJsdoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// app.use('/api/auth', authRoutes);
// app.use('/api/admin/users', userRoutes);

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`🚀 User Auth Service running on http://localhost:${PORT}`));