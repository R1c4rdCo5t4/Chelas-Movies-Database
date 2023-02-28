/**
 * Server Mock for Integration Testing
 */

"use strict"


import dataMem from '../../src/data/cmdb-data-mem.mjs'
import moviesDataMock from './cmdb-movies-data-mock.mjs'
import servicesInit from '../../src/services/cmdb-services.mjs'
import apiInit from '../../src/web/api/cmdb-web-api.mjs'
import express from 'express'


const services = servicesInit(moviesDataMock, dataMem)
const api = apiInit(services)
const PORT = 8080

console.log("Server starting up...")

export const app = express()
app.use(express.json())
app.use('/api', api)

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))
