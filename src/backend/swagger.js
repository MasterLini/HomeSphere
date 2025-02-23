import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'HomeSphere API',
        description: 'Automatically generated API documentation for HomeSphere',
        version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    securityDefinitions: {
        BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        },
    },
    security: [{ BearerAuth: [] }],
};

const outputFile = './swagger-output.json';
const routes = ['./app.js']; // Main entry point with route imports

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes);
