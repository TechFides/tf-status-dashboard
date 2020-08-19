'use strict'

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Swagger Information
  | Please use Swagger 2 Spesification Docs
  | https://swagger.io/docs/specification/2-0/basic-structure/
  |--------------------------------------------------------------------------
  */

  enable: true,

  options: {
    swaggerDefinition: {
      info: {
        title: 'Techfides Dashboard documentation',
        description: 'Dates are formatted by ISO. Example: 2020-08-17 (The International Standard)',
        version: '1.0.0',
      },

      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },

      basePath: '/',

      // Example security definitions.
      securityDefinitions: {
        ApiKey: {
          description: 'ApiKey description',
          name: 'Authorization'
        },

        bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization'
        },
      }
    },

    // Path to the API docs
    // Sample usage
    apis: [
       'docs/**/*.yml',    // load recursive all .yml file in docs directory
       'docs/**/*.js',     // load recursive all .js file in docs directory
    ]
    // apis: [
    //   'app/**/*.js',
    //   'start/routes.js'
    // ]
  }
}
