"use strict"

import assert from 'node:assert'
import servicesInit from '../src/services/cmdb-services.mjs'
import dataMem from '../src/data/cmdb-data-mem.mjs'
import moviesDataMock from './mock-files/cmdb-movies-data-mock.mjs'
import { randomUUID } from 'node:crypto'
import url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const filePath = __dirname + "/test-db/DataMem.json"
dataMem.changeFilePath(filePath)

const services = servicesInit(moviesDataMock, dataMem)


const testUser = {
    name: randomUUID(),
    password: "12345678"
}
const testGroup = {
    name: "group-test",
    description: "group-test-description"
}
const testMovie = {
    id: "tt4154796"
}

describe('#auth', function () {
    it('should return the user created', async function () {

        const createdUser = await services.createUser(testUser)
        
        assert.equal(testUser.name, createdUser.name)
        assert.equal(testUser.password, createdUser.password)
        assert.notEqual(createdUser.token, undefined)
        assert.notEqual(createdUser.id, undefined)
        assert.equal(createdUser.groups.length, 0)
        assert.equal(createdUser.createdGroups, 0)

        testUser.id = createdUser.id
        testUser.token = createdUser.token

    })
})

describe('#getTopMovies', function () {
    it('should return the top movies', async function () {
        const limit = 3
        const topMovies = await services.getTopMovies(limit)
        assert.equal(topMovies.length, limit)
        topMovies.forEach(movie => {
            assert.notEqual(movie, undefined)
        })
    })
})

describe('#searchMovie', function () {
    it('should return the movie found', async function () {
        const moviesFound = await services.searchMovie('Avengers', 3)
        assert.notEqual(moviesFound, undefined)
        assert.equal(moviesFound.length, 3)
        assert.equal(moviesFound[0].title, 'Avengers: Endgame')
    })
})

describe('#getMovie', function () {
    it('should return the movie by id', async function () {
        const movie = await services.getMovie(testMovie.id)
        assert.equal(movie.id, testMovie.id)
        assert.equal(movie.title, "Avengers: Endgame")
        assert.equal(movie.year, 2019)
    })
})

describe('#createGroup', function () {
    it('should return the group created', async function () {
        const createdGroup = await services.createGroup(testUser.token, testGroup)

        assert.equal(testGroup.name, createdGroup.name)
        assert.equal(createdGroup.movies.length, 0)
        testGroup.id = createdGroup.id
    })
})

describe('#getGroups', function () {
    it('should return the groups of the user', async function () {
        const groups = await services.getGroups(testUser.token,)
        assert.notEqual(groups, undefined)
        assert.equal(typeof groups, 'object')          
    })
})

describe('#getGroup', function () {
    it('should return the group', async function () {
        const groupFound = await services.getGroup(testUser.token, testGroup.id)
        assert.equal(testGroup.name, groupFound.name)
        assert.equal(groupFound.movies.length, 0)
    })
})

describe('#updateGroup', function () {
    it('should update the group', async function () {
    
        testGroup.name = "test-group-services-update"
        testGroup.description = "test-group-description-updated"
        const groupUpdated = await services.updateGroup(testUser.token, testGroup.id, testGroup)
        const groups = await services.getGroups(testUser.token)

        assert.equal(groups.length, 1)
        assert.equal(groupUpdated.name, testGroup.name)
        assert.equal(groupUpdated.description, testGroup.description)
    })
})

describe('#addMovieToGroup', function () {
    it('should add the movie to the group', async function () {
        await services.addMovieToGroup(testUser.token, testGroup.id, testMovie.id)
        assert.equal(testGroup.movies.length, 1)
        assert.equal(testGroup.movies[0].id, testMovie.id)
    })
})

describe('#deleteMovieFromGroup', function () {
    it('should delete the movie from the group', async function () {
        const testGroupUpdated = await services.deleteMovieFromGroup(testUser.token, testGroup.id, testMovie.id)
        assert.equal(testGroupUpdated.movies.length, 0)
    })
})

describe('#deleteGroup', function () {
    it('should delete the group', async function () {
        const previousLength = (await services.getGroups(testUser.token)).length
        const group = testGroup
        const deleted = await services.deleteGroup(testUser.token, testGroup.id)
        const groups = await services.getGroups(testUser.token)

        assert.equal(group, deleted)
        assert.equal(groups.length, previousLength-1)
    })
})