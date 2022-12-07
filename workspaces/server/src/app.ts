import { config } from './shared/config'
import express from 'express'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc, { OAS3Definition } from 'swagger-jsdoc'
import { applyModelsToSwaggerDoc } from './shared/model-api/swagger'
import { registerModelApiRoutes } from './shared/model-api/routes'
import { errorHandler } from './shared/errorHandler'
import cors from 'cors'
import api from './routes'
import { activateAxiosTrace, traceRoutesMiddleware } from './shared/logger'
import { authProviderSync } from './shared/auth/sync'
import { checkDatabase, Connection } from './shared/db'

export function createBackendApp(): express.Express {
  const app = express()

  Connection.init()
  checkDatabase()

  if (!config.production && config.trace) {
    activateAxiosTrace()
  }

  if (process.env.NODE_ENV !== 'test') {
    authProviderSync()
  }

  // Add Middlewares - Order is important
  app.use(errorHandler)
  app.use(cors())
  app.use(express.json({ limit: config.jsonLimit }))
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )
  app.use(traceRoutesMiddleware)

  // Swagger Portal
  const swaggerDoc = swaggerJsdoc({
    swaggerDefinition: config.swaggerSetup as OAS3Definition,
    apis: ['**/*/swagger.yaml', '**/routes/**/index.*s'],
  }) as OAS3Definition

  applyModelsToSwaggerDoc(Connection.entities, swaggerDoc)

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

  // Endpoints
  registerModelApiRoutes(Connection.entities, api)

  app.use(api)

  return app
}

export default createBackendApp
