/*
 * Module that stores/loads users and groups data in/to memory
 */

"use strict"

import { randomUUID } from 'node:crypto'
import errors from '../utils/cmdb-errors.mjs'
import { readFileContents, writeFileContents } from '../utils/file-manager.mjs'
import { wrapper } from '../utils/wrapper.mjs'


let filePath = './data/data-mem.json/'
const storeDataMem = async () => await writeFileContents(filePath, JSON.stringify(users, null, 2))
const loadDataMem = async () => await JSON.parse(await readFileContents(filePath))

let users = await loadDataMem()
let lastId = users.length


async function getUserById(id) {
    return users.find(user => user.id == id)
}

async function getUserByToken(token) {
    return users.find(user => user.token == token)
}

async function getUserByUsername(username) {
    return users.find(user => user.name == username)
}

async function createUser(user) {
    const newUser = {
        id: lastId++,
        name: user.name,
        password: user.password,
        token: randomUUID(),
        createdGroups: 0,
        groups: []
    }
    users.push(newUser)
    await storeDataMem()
    return newUser
}

async function getGroups(userId) {
    const user = await getUserById(userId)
    return user.groups
}

async function getGroup(userId, groupId) {
    const groups = await getGroups(userId)
    return groups.find(group => group.id == groupId)
}

async function updateGroup(userId, groupId, newGroup) {
    const groups = await getGroups(userId)
    const group = groups.find(group => group.id == groupId)
    group.name = newGroup.name
    group.description = newGroup.description
    await storeDataMem()
    return group
}

async function deleteGroup(userId, groupId) {
    const user = await getUserById(userId)
    const groupIdx = user.groups.findIndex(group => group.id == groupId)

    if (groupIdx != -1) {
        const deletedGroup = user.groups.splice(groupIdx, 1)
        await storeDataMem()
        return deletedGroup[0]
    }
    return
}

async function createGroup(userId, group) {
    const user = await getUserById(userId)
    group.id = user.createdGroups++
    group.movies = []
    user.groups.push(group)
    await storeDataMem()
    return group
}

async function addMovieToGroup(userId, groupId, movie) {
    return getGroupAndExecute(userId, groupId, group => {
        movie.duration = Number(movie.duration)
        group.movies.push(movie)
    })
}

async function deleteMovieFromGroup(userId, groupId, movieId) {
    return getGroupAndExecute(userId, groupId, group => {
        const movie = group.movies.find(movie => movie.id === movieId)
        group.movies.splice(group.movies.indexOf(movie), 1)
    })
}

async function getMoviesFromGroup(groupId, userId) {
    const group = await getGroup(userId, groupId)
    return group.movies
}

const getGroupAndExecute = async (userId, groupId, callback) => {
    const group = await getGroup(userId, groupId)
    callback(group)
    await storeDataMem()
    return group
}

const changeFilePath = async (path) => {
    filePath = path
    users = await loadDataMem()
    lastId = users.length
}


const functions = {
    getUserByUsername,
    getUserByToken,
    createUser,
    getGroups,
    getGroup,
    updateGroup,
    deleteGroup,
    createGroup,
    deleteMovieFromGroup,
    addMovieToGroup,
    getMoviesFromGroup,
    changeFilePath
}

export default wrapper(functions, errors.DB_ERROR())