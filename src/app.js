const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ name: 'BookCircle API', status: 'ok', docs: '/api-docs' }));

const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/books', require('./routes/books'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/quotes', require('./routes/quotes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
