/**
 *   Module that implements the HTTP routes and makese up the REST API of the web application
 *   - Obtains data from requests. Requests data can be obtained from: URI(path, query, fragment), headers, body
 *   - Invoques the corresponding operation on services
 *   - Generates the response
 */

"use strict"

import errorToHttpError from './http-errors.mjs'
import errors from '../../utils/cmdb-errors.mjs'
import apiRouter from './cmdb-api-router.mjs'

export default function(services) {

    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }

    async function createUser(req, rsp) {

        try {
            const newUser = await services.createUser(req.body)
            rsp.status(201).json({
                status: `User created sucessfully.`,
                user: newUser
            })
        } catch (e) {
            sendHTTPError(rsp, e, "Error creating user")
        }
    }

    async function getTopMovies(req, rsp) {
        try {
            const limit = req.query.limit
            const topMovies = await services.getTopMovies(limit)
            rsp.json(topMovies)
        } catch (e) {
            sendHTTPError(rsp, e, `Error getting top movies`)
        }
    }

    async function searchMovie(req, rsp) {
        try {
            const movieTitle = req.query.q
            const limit = req.query.limit
            if (movieTitle) {
                const movie = await services.searchMovie(movieTitle, limit)
                rsp.json(movie)
            } else {
                rsp.status(400).json({ error: `Invalid query string` })
            }
        } catch (e) {
            sendHTTPError(rsp, e, `Error searching movie`)
        }
    }

    async function getMovie(req, rsp) {
        const movieId = req.params.movieId
    
        try {
            const movie = await services.getMovie(movieId)
            rsp.status(200).json(movie)
        } catch (e) {
            sendHTTPError(rsp, e, `Movie with id ${movieId} not found`)
        }
    }

    async function getGroup(req, rsp) {
        try {
            const group = await services.getGroup(req.token, req.params.groupId)
            rsp.status(200).json(group)
        } catch (e) {
            sendHTTPError(rsp, e, `Error getting group`)
        }
    }

    async function getGroups(req, rsp) {
        try {
            const groups = await services.getGroups(req.token)
            rsp.json(groups)
        } catch (e) {
            sendHTTPError(rsp, e, `Error getting groups`)
        }
    }

    async function deleteGroup(req, rsp) {
        try {
            const groupId = req.params.groupId
            const deleted = await services.deleteGroup(req.token, groupId)
            if (deleted) {
                rsp.json({
                    status: `Group with id '${groupId}' sucessfully deleted `,
                    groupDeleted: deleted
                })
            } else {
                rsp.status(404).json({ error: `Group with id ${groupId} was not found ` })
            }

        } catch (e) {
            sendHTTPError(rsp, e, `Error deleting group`)
        }
    }
    async function createGroup(req, rsp) {
        try {
            const newGroup = await services.createGroup(req.token, req.body)
            rsp.status(201).json({
                status: `Group with id ${newGroup.id} sucessfully created `,
                newGroup: newGroup
            })
            
        } catch (e) {
            sendHTTPError(rsp, e, `Error creating group`)
        }
    }

    async function updateGroup(req, rsp) {
        const groupId = req.params.groupId
        const newGroup = req.body
        
        try {
            const updatedGroup = await services.updateGroup(req.token, groupId, newGroup)
            rsp.status(200).json({
                status: `Group with id ${groupId} sucessfully updated `,
                updatedGroup: updatedGroup
            })
        } catch (e) {
            sendHTTPError(rsp, e, `Error updating group`)
        }
    }

    async function deleteMovieFromGroup(req, rsp) {
        const groupId = req.params.groupId
        const movieId = req.params.movieId
        try {
            const updatedGroup = await services.deleteMovieFromGroup(req.token, groupId, movieId)
            rsp.status(200).json({
                status: `Movie with id ${movieId} sucessfully deleted from group with id ${groupId}`,
                updatedGroup: updatedGroup
            })

        } catch (e) {
            sendHTTPError(rsp, e, `Error deleting movie from group`)
        }
    }

    async function addMovieToGroup(req, rsp) {
        const groupId = req.params.groupId
        const movieId = req.body.id
        try {
            const updatedGroup = await services.addMovieToGroup(req.token, groupId, movieId)
            rsp.status(201).json({
                status: `Movie with id ${movieId} sucessfully added to group with id ${groupId}`,
                updatedGroup: updatedGroup
            })
        } catch (e) {
            sendHTTPError(rsp, e, `Error adding movie to group`)
        }
    }

    function sendHTTPError(rsp, e, error) {
        const httpError = errorToHttpError(e)
        rsp.status(httpError.status).json({
            error: error,
            description: (e.message != httpError.body) ? e.message : undefined,
            status: httpError.status,
            body: httpError.body
        })
    }

    function handleRequestWithAuth(callback) {
        return async(req, rsp) => {
            let userToken = req.get("Authorization")
            userToken = userToken ? userToken.split(" ")[1] : null
            if (!userToken) {
                return rsp.status(401).json({ error: `User token must be provided` })
            }
            req.token = userToken
            callback(req, rsp)
        }
    }

    const api = {
        createUser,
        getTopMovies,
        searchMovie,
        getMovie,
        getGroup: handleRequestWithAuth(getGroup),
        getGroups: handleRequestWithAuth(getGroups),
        deleteGroup: handleRequestWithAuth(deleteGroup),
        createGroup: handleRequestWithAuth(createGroup),
        updateGroup: handleRequestWithAuth(updateGroup),
        deleteMovieFromGroup: handleRequestWithAuth(deleteMovieFromGroup),
        addMovieToGroup: handleRequestWithAuth(addMovieToGroup)
    }

    return apiRouter(api)
}