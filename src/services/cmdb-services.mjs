/**
 * Module that implements the logic of each of the application's functionalities
 */

"use strict"

import errors from '../utils/cmdb-errors.mjs'

export default function(moviesData, data) {

    if (!moviesData) {
        throw errors.INVALID_PARAMETER('moviesData')
    }
    if (!data) {
        throw errors.INVALID_PARAMETER('data')
    }

    const validateString = (value) => typeof value == 'string' && value != ""
    
    const movieInGroup = async (userId, groupId, movieId) => {
        const movies = await data.getMoviesFromGroup(groupId, userId)
        return movies.find(m => m.id == movieId) != undefined
    }

    const validateGroup = (group) => {
        if (!(validateString(group.name) && validateString(group.description))) {
            throw errors.INVALID_PARAMETER('group')
        }
    }

    const validateUser = async (user) => {
       
        const username = user.name
        const password = user.password

        if (!user) {
            throw errors.INVALID_PARAMETER('user')
        }

        if(!validateString(username)) {
            throw errors.INVALID_PARAMETER('name')
        }
        
        if (!validateString(password)) {
            throw errors.INVALID_PARAMETER('password')
        }

        if (await data.getUserByUsername(username)) {
            throw errors.USER_ALREADY_EXISTS(username)
        }
    }

    async function createUser(user) {
        await validateUser(user)
        return data.createUser(user)
    }

    async function getUser(username, password) {

        const user = await data.getUserByUsername(username)

        if (!user) {
            throw errors.USER_NOT_FOUND(username)
        }

        if (user.password != password) {
            throw errors.INVALID_CREDENTIALS()
        }
        return user  
    }


    async function getTopMovies(limit = 250) {
        if (+limit < 0 || +limit > 250) {
            throw errors.INVALID_PARAMETER('limit')
        }
        return moviesData.getTopMovies(limit)
    }

    async function searchMovie(movieName, limit = 250) {
        if (+limit < 0 || +limit > 250) {
            throw errors.INVALID_PARAMETER('limit')
        }
        if (!validateString(movieName)) {
            throw errors.INVALID_PARAMETER('movieName')
        }
        return moviesData.searchMovie(movieName, limit)
    }

    async function getMovie(movieId) {
        if (!validateString(movieId) || movieId.substring(0, 2) != 'tt') {
            throw errors.INVALID_PARAMETER('movieId')
        }
        return moviesData.getMovieData(movieId)
    }

    
    async function getGroups(userToken) {
        return getUserAndExecute(userToken, user => data.getGroups(user.id))
    }

    async function deleteGroup(userToken, groupId) {
        return getUserAndExecute(userToken, user => handleGroupAndExecute(user.id, groupId, data.deleteGroup))
    }

    async function createGroup(userToken, group) {
        return getUserAndExecute(userToken, async user => {
            validateGroup(group)
            return data.createGroup(user.id, group)
        })
    }

    async function getGroup(userToken, groupId) {
        return getUserAndExecute(userToken, user => handleGroupAndExecute(user.id, groupId, data.getGroup))
    }

    async function updateGroup(userToken, groupId, newGroup) {
        validateGroup(newGroup)
        return getUserAndExecute(userToken, async user => {
            const group = await handleGroupAndExecute(user.id, groupId, data.getGroup)
            return data.updateGroup(user.id, group.id, newGroup)
        })
    }

    async function deleteMovieFromGroup(userToken, groupId, movieId) {
        const userId = await getUserAndExecute(userToken, user => user.id)

        if (!await movieInGroup(userId, groupId, movieId)) {
            throw errors.MOVIE_NOT_FOUND(movieId)
        }
        return getUserAndExecute(userToken, user => data.deleteMovieFromGroup(user.id, groupId, movieId))
    }

    async function addMovieToGroup(userToken, groupId, movieId) {
        const userId = await getUserAndExecute(userToken, user => user.id)
 
        if (!validateString(movieId)) {
            throw errors.INVALID_PARAMETER('movieId')
        }
        else if (await movieInGroup(userId, groupId, movieId)) {
            throw errors.MOVIE_ALREADY_EXISTS(movieId)
        }
        const movieData = await moviesData.getMovieData(movieId)
        const movie = {
            id: movieData.id,
            title: movieData.title,
            duration: movieData.runtimeMins
        }

        return getUserAndExecute(userToken, user => data.addMovieToGroup(user.id, groupId, movie))
    }

    async function getMoviesFromGroup(userToken, groupId) {
        return getUserAndExecute(userToken, user => handleGroupAndExecute(user.id, groupId, data.getMovies))
    }

    async function getUserName(userToken) {
        return getUserAndExecute(userToken, user => user.username)
    }

    async function getUserAndExecute(userToken, callback) {

        if (!userToken) {
            throw errors.NOT_SIGNED_IN()
        }

        const user = await data.getUserByToken(userToken)
        return callback(user)
    }

    async function handleGroupAndExecute(userId, groupId, callback) {
        const group = await callback(userId, groupId)
        if (!group) {
            throw errors.GROUP_NOT_FOUND(groupId)
        }
        return group
    }


    return {
        getTopMovies,
        searchMovie,
        createUser,
        getGroups,
        deleteGroup,
        createGroup,
        getGroup,
        updateGroup,
        deleteMovieFromGroup,
        addMovieToGroup,
        getMovie,
        getMoviesFromGroup,
        getUserName,
        getUser
    }
}