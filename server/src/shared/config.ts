import dotenv from 'dotenv'
import { OAS3Definition } from 'swagger-jsdoc'
import packageJson from '../../package.json'

dotenv.config({})

export interface Config {
  version: string
  port: number
  db: {
    url: string
    schema: string
    ssl?: boolean
  }
  swaggerSetup: OAS3Definition & { basePath: string }
}

const apiVersion = 'v1'
const config: Config = {
  version: apiVersion,
  port: Number(process.env.PORT || 3001),
  db: {
    url: process.env.DB_URL || '',
    schema: process.env.DB_SCHEMA || 'public',
    ssl: process.env.DB_SSL === 'true',
  },
  swaggerSetup: {
    openapi: '3.0.0',
    info: {
      title: packageJson.name,
      description: packageJson.description,
      version: packageJson.version,
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/${apiVersion}`,
        description: `localhost:${process.env.PORT}`,
      },
    ],
    basePath: '/docs',
  },
}

export default config
