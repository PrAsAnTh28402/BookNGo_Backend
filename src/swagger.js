const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookNGo API",
      version: "1.0.0",
      description: "API documentation for BookNGo Event Booking Platform",
    },
    servers: [
      {
        url: "http://localhost:5000", // no trailing slash
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "routes/*.js")], // robust path
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
