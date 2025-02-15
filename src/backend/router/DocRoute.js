const express = require('express');
const swaggerUi = require('swagger-ui-express');
const router = express.Router();

// Load Swagger documentation
const swaggerDocument = require('../docs/swagger.json');

// Configure Swagger UI options
const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "HomeSphere API Documentation",
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha',
        defaultModelsExpandDepth: 3
    }
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, options));

// Serve raw documentation JSON
router.get('/json', (req, res) => {
    res.json(swaggerDocument);
});

module.exports = router;
