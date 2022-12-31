import { config } from './shared/config'
import express from 'express'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc, { OAS3Definition } from 'swagger-jsdoc'
import { applyEntitiesToSwaggerDoc } from './shared/model-api/swagger'
import { registerModelApiRoutes } from './shared/model-api/routes'
import { errorHandler } from './shared/errorHandler'
import cors from 'cors'
import api from './routes'
import { activateAxiosTrace, endpointTracingMiddleware, printRouteSummary } from './shared/logger'
import { authProviderAutoConfigure } from './shared/auth/sync'
import { checkDatabase, Connection } from './shared/db'
import { modelAuthMiddleware } from './shared/auth'
import { loadSettingsAsync } from './shared/settings'
import { homepage } from './shared/server'

export interface BackendApp extends express.Express {
  onStartupCompletePromise: Promise<boolean[]>
}

export interface BackendOptions {
  checks?: boolean
  trace?: boolean
}

export function createBackendApp({ checks, trace }: BackendOptions = { checks: true }): BackendApp {
  const app = express() as BackendApp

  if (trace) {
    config.trace = trace
  }

  if (!config.production && config.trace) {
    activateAxiosTrace()
  }

  // Startup
  Connection.init()
  const promises = [
    checks
      ? checkDatabase()
          .then(async ok => (ok ? await loadSettingsAsync() : ok))
          .then(async ok => (ok ? await authProviderAutoConfigure() : ok))
      : Promise.resolve(true),
  ]

  // Add Middlewares - Order is important
  app.use(errorHandler)
  app.use(cors())
  app.use(express.json({ limit: config.jsonLimit }))
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  )
  app.use(endpointTracingMiddleware)
  app.use(modelAuthMiddleware)

  // Swagger Portal
  const swaggerDoc = swaggerJsdoc({
    swaggerDefinition: config.swaggerSetup as OAS3Definition,
    apis: ['**/*/swagger.yaml', '**/*/index.ts', 'index.js'],
  }) as OAS3Definition

  applyEntitiesToSwaggerDoc(Connection.entities, swaggerDoc)

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

  app.onStartupCompletePromise = Promise.all(promises)

  printRouteSummary(app)

  app.get('/', homepage)

  return app
}

export default createBackendApp
