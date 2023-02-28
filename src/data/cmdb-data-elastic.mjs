/*
 * Module that handles users and groups data in the elastic search database
 */

"use strict"

import fetch from 'node-fetch'
import { randomUUID } from 'crypto'
import errors from '../utils/cmdb-errors.mjs'
import { wrapper } from '../utils/wrapper.mjs'


const baseURL = 'http://localhost:9200'

async function createUser(user) {

    const newUser = {
        name: user.name,
        password: user.password,
        token: randomUUID(),
        createdGroups: 0,
        groups: []
    }
      
    await fetch(`${baseURL}/users/_doc?refresh=wait_for`, {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    return newUser
}



async function getUser(key, value) {

    const response = await fetch(`${baseURL}/users/_search?q=${key}:"${value}"`,
        { headers: { "Accept": "application/json" } })

    const body = await response.json()
    return body.hits.hits.map(t => {
        return {
            id: t._id,
            name: t._source.name,
            password: t._source.password,
            token: t._source.token,
            createdGroups: t._source.createdGroups,
            groups: t._source.groups
        }
    })[0]
}


async function getUserByToken(userToken){
    return getUser('token', userToken)
}

async function getUserByUsername(username) {
    return getUser('name', username)
}

async function createGroup(userId, group) {

    const body = {
        userId: userId,
        name: group.name,
        description: group.description,
    }

    const response = await fetch(`${baseURL}/groups/_doc?refresh=wait_for`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    const result = await response.json()
    return result
}

async function updateGroup(userId, groupId, newGroup) {
    newGroup.userId = userId
    newGroup.movies = (await getGroup(userId, groupId)).movies

    const response = await fetch(`${baseURL}/groups/_doc/${groupId}?refresh=wait_for`, {
        method: 'PUT',
        body: JSON.stringify(newGroup),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    const result = await response.json()
    return result
}

async function deleteGroup(userId, groupId) {
    const response = await fetch(`${baseURL}/groups/_doc/${groupId}?refresh=wait_for`, { method: 'DELETE' })
    return response.json()
}


async function getGroups(userId) {

    const response = await fetch(`${baseURL}/groups/_search?q=userId:"${userId}"`,
        { headers: { "Accept": "application/json" } })

    const body = await response.json()
    const groups = await Promise.all(
        body.hits.hits.map(async g => {
            g._source.id = g._id
            g._source.movies = await getMoviesFromGroup(g._id)
            return g._source
        })
    )
    return groups
}

async function getGroup(userId, groupId) {

    const response = await fetch(`${baseURL}/groups/_doc/${groupId}`)
    const body = await response.json()

    const group = {
        id: body._id,
        name: body._source.name,
        description: body._source.description,
        movies: await getMoviesFromGroup(groupId)
    }
    return group
}

async function getMoviesFromGroup(groupId) {

    const response = await fetch(`${baseURL}/movies/_search?q=groupId:"${groupId}"`,
        { headers: { "Accept": "application/json" } })

    const body = await response.json()
    const movies = body.hits.hits.map(m => m._source)
    return movies
}

async function addMovieToGroup(userId, groupId, movie) {

    movie.groupId = groupId
    movie.duration = Number(movie.duration)
    
    const response = await fetch(`${baseURL}/movies/_doc?refresh=wait_for`, {
        method: 'POST',
        body: JSON.stringify(movie),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    
    const result = await response.json()
    return result
}


async function deleteMovieFromGroup(userId, groupId, movieId) {
 
    const query = {
        bool: {
            must: [
                { match: { groupId: groupId } },
                { match: { id: movieId } }
            ]
        }
    }
        
    const movie = await fetch(`${baseURL}/movies/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
        
    const body = await movie.json()
    const elasticMovieId = body.hits.hits[0]._id
    const response = await fetch(`${baseURL}/movies/_doc/${elasticMovieId}?refresh=wait_for`, { method: 'DELETE' })

    return response.json()
}


const functions = {
    createUser,
    getUserByToken,
    getUserByUsername,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroups,
    getGroup,
    addMovieToGroup,
    deleteMovieFromGroup,
    getMoviesFromGroup,
}

export default wrapper(functions, errors.DB_ERROR())
