/*
 * Module that manages requests to the IMDB API
 */

"use strict"

import fetch from 'node-fetch'
import errors from '../utils/cmdb-errors.mjs'
import { wrapper } from '../utils/wrapper.mjs'

const URI = 'https://imdb-api.com/en/API'
const API_KEY = 'k_txznau34'


function validateResponse(resp) {
    if(resp.errorMessage) throw errors.DB_ERROR()
}

async function fetchIMDb(URI) {
    const resp = await fetch(URI)
    const json = await resp.json()
    validateResponse(json)
    return json
}

async function getTopMovies(limit) {
    const movies = await fetchIMDb(`${URI}/Top250Movies/${API_KEY}`)
    return movies.items.splice(0, limit)
}

async function searchMovie(movieName, limit) {
    const results = await fetchIMDb(`${URI}/SearchMovie/${API_KEY}/${encodeURIComponent(movieName)}`)
    return results.results.splice(0, limit)
}

async function getMovieData(movieId) {
    return fetchIMDb(`${URI}/Title/${API_KEY}/${movieId}`)
}


const functions = {
    getMovieData,
    getTopMovies,
    searchMovie,
    getMovieData
}

export default wrapper(functions, errors.DB_ERROR())
