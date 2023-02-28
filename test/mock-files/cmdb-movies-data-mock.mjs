/*
 * Mock module that simulates requests to the IMDB API
 */

"use strict"

import { readFileContents } from '../../src/utils/file-manager.mjs'

async function processMovies(path, prop, limit) {
    const resp = await readFileContents(path)
    const results = await JSON.parse(resp)
    return results[prop].splice(0, limit)
} 

async function getTopMovies(limit) {
    return processMovies('./test/test-db/TopMovies.json','items', limit)
}

async function searchMovie(movieName, limit) {
    const movies = await processMovies('./test/test-db/SearchMovie.json','results', limit)
    return movies.filter(movie => movie.title.includes(movieName))
}

async function getMovieData(movieId) {
    const resp = await readFileContents('./test/test-db/Title.json')
    const movie = JSON.parse(resp)
    return movie
}


export default {
    getMovieData,
    getTopMovies,
    searchMovie
}