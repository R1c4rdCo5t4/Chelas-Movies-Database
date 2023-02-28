import express from 'express'
import errors from '../../utils/cmdb-errors.mjs'

export default function (api) {

    if (!api) {
        throw errors.INVALID_PARAMETER('api')
    }

    const router = express.Router()
    router.use(express.urlencoded({ extended: true }))


    /* Public Routes */

    // Users
    router.post('/users', api.createUser)

    // Movies
    router.get('/movies/top', api.getTopMovies)
    router.get('/movies/search', api.searchMovie)
    router.get('/movies/:movieId', api.getMovie)

    
    /* Private Routes */

    // Groups
    router.get('/groups', api.getGroups)
    router.post('/groups', api.createGroup)
    router.get('/groups/:groupId', api.getGroup)
    router.put('/groups/:groupId', api.updateGroup)
    router.delete('/groups/:groupId', api.deleteGroup)
    router.post('/groups/:groupId', api.addMovieToGroup)
    router.delete('/groups/:groupId/:movieId', api.deleteMovieFromGroup)

    return router
}