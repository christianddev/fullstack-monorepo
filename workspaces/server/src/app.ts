import express from 'express'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc, { OAS3Definition } from 'swagger-jsdoc'
import config from './shared/config'
import { Connection } from './shared/db'
import { applyModelsToSwaggerDoc } from './shared/model-api/swagger'
import { registerModelApiRoutes } from './shared/model-api/routes'
import { errorHandler } from './shared/errorHandler'
import cors from 'cors'
import api from './routes'
import { activateAxiosTrace } from './shared/logger'
import { authProviderAutoSetup } from './shared/auth/setup'

export default function createBackendApp(): express.Express {
  const app = express()

  if (!config.production) {
    activateAxiosTrace()
  }

  authProviderAutoSetup()

  // Basics
  app.use(cors())
  app.use(express.json({ limit: config.jsonLimit }))

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )

  app.use(errorHandler)

  // Swagger Endpoint
  const swaggerDoc = swaggerJsdoc({
    swaggerDefinition: config.swaggerSetup as OAS3Definition,
    apis: ['**/*/swagger.yaml', '**/routes/**/index.*s'],
  }) as OAS3Definition

  applyModelsToSwaggerDoc(Connection.models, swaggerDoc)

  app.use(
    config.swaggerSetup.basePath,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      customSiteTitle: config.swaggerSetup.info?.title,
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  )

  //Endpoints
  registerModelApiRoutes(Connection.models, api)

  app.use(api)

  return app
}
