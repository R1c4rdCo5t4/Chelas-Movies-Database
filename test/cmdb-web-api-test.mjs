"use strict"

import request from 'supertest'
import assert from 'assert'
import { app } from '../test/mock-files/cmdb-server-mock.mjs'
import { randomUUID } from 'crypto'
import url from 'url'
import dataMem from '../src/data/cmdb-data-mem.mjs'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const filePath = __dirname + "/test-db/DataMem.json"
dataMem.changeFilePath(filePath)


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


describe('POST /api/users', function() {
    it("should create a user", async function () {

        const res = await request(app)
            .post('/api/users')
            .send(testUser)
            .expect(201)
            .expect('Content-Type', /json/)
        
        assert.equal(res.body.user.username, testUser.username)
        testUser.token = res.body.user.token
        testUser.id = res.body.user.id
    })
})


describe('GET /api/movies/top?limit=2', function() {
    it("should get top movies", async function() {
        const res = await request(app)
            .get('/api/movies/top?limit=2')
            .expect(200)
            .expect('Content-Type', /json/)

        assert.equal(res.body.length, 2)
    })

})

describe('GET /api/movies/search?q=avengers&limit=3', function() {
    it("should search movie", async function() {
        const res = await request(app)
            .get('/api/movies/search?q=Avengers&limit=3')
            .expect(200)
            .expect('Content-Type', /json/)

        assert.equal(res.body.length, 3)
        assert.equal(res.body[0].title, "Avengers: Endgame")
    })
})

describe('GET /api/movies/:movieId', function () {
    it("should get movie by id", async function () {
        const res = await request(app)
            .get(`/api/movies/${testMovie.id}`)
            .expect(200)
            .expect('Content-Type', /json/)

        assert.equal(res.body.id, testMovie.id)
        assert.equal(res.body.title, "Avengers: Endgame")
        assert.equal(res.body.year, 2019)
    })
})

describe('GET /api/groups', function() {
    it("should get groups", async function() {
        const res = await request(app)
            .get('/api/groups')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .expect(200)
            .expect('Content-Type', /json/)
        
        assert.equal(res.body.length, 0)
    })
})

describe('POST /api/groups', function() {
    it("should create a group", async function() {
        const res = await request(app)
            .post('/api/groups')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(testGroup)
            .expect(201)
            .expect('Content-Type', /json/)

        assert.equal(res.body.newGroup.name, testGroup.name)
        assert.equal(res.body.newGroup.description, testGroup.description)
        assert.equal(res.body.newGroup.movies.length, 0)
        testGroup.id = res.body.newGroup.id
    })
})

describe('GET /api/groups/:groupId', function() {
    it("should get a group", async function() {
        const res = await request(app)
            .get(`/api/groups/${testGroup.id}`)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .expect(200)
            .expect('Content-Type', /json/)

        assert.equal(res.body.name, testGroup.name)
        assert.equal(res.body.description, testGroup.description)
        assert.equal(res.body.movies.length, 0)
    })
})

describe('POST /api/groups/:groupId', function () {
    it("should update a group", async function() {

        testGroup.name = "group-test-updated"
        testGroup.description = "group-test-description-updated"

        const res = await request(app)
            .put(`/api/groups/${testGroup.id}`)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .expect(200)
            .expect('Content-Type', /json/)
            .send(testGroup)

        assert.equal(res.body.updatedGroup.name, testGroup.name)
        assert.equal(res.body.updatedGroup.description, testGroup.description)
        assert.equal(res.body.updatedGroup.movies.length, 0)
    })
})

describe('POST /api/groups/:groupId', function() {
    it("should add a movie to a group", async function() {
        const res = await request(app)
            .post(`/api/groups/${testGroup.id}`)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(testMovie)
            .expect(201)
            .expect('Content-Type', /json/)
        
        assert.equal(res.body.updatedGroup.movies.length, 1)
        assert.equal(res.body.updatedGroup.movies[0].id, testMovie.id)
        testGroup.movies = res.body.updatedGroup.movies
    })
})


describe('DELETE /api/groups/:groupId/:movieId', function() {
    it("should delete a movie from a group", async function() {
        const res = await request(app)
            .delete(`/api/groups/${testGroup.id}/${testMovie.id}`)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .expect(200)
            .expect('Content-Type', /json/)

        assert.equal(res.body.updatedGroup.name, testGroup.name)
        assert.equal(res.body.updatedGroup.movies.length, 0)
        testGroup.movies = res.body.updatedGroup.movies
    })
})

describe('DELETE /api/groups/:groupId', function() {
    it("should delete a group", async function() {
        const res = await request(app)
            .delete(`/api/groups/${testGroup.id}`)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${testUser.token}`)
            .expect(200)
            .expect('Content-Type', /json/)
        
        assert.deepEqual(testGroup, res.body.groupDeleted)
    })
})

