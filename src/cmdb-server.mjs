/*
 * Module that provides the entry point to the server application
 */

"use strict"

import dataMem from './data/cmdb-data-mem.mjs'
import dataElastic from './data/cmdb-data-elastic.mjs'
import moviesData from './data/cmdb-movies-data.mjs'
import servicesInit from './services/cmdb-services.mjs'
import apiInit from './web/api/cmdb-web-api.mjs'
import siteInit from './web/site/cmdb-web-site.mjs'
import authInit from './web/site/cmdb-web-auth.mjs'
import url from 'url'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'
import path from 'path'


const services = servicesInit(moviesData, dataMem)
const api = apiInit(services)
const site = siteInit(services)
const authRouter = authInit(services)

const swaggerDocument = yaml.load('./docs/cmdb-api-spec.yaml')
const PORT = 8080

console.log("Server starting up...")

export const app = express()
app.use(express.json())
app.use(cors())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.urlencoded({ extended: false }))

app.use(authRouter)
app.use('/api', api)
app.use('/', site)

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'web', 'site', 'views'))

app.use((req, rsp) => {
    rsp.status(404).render('notfound', { name: req.user?.name })
})

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))
