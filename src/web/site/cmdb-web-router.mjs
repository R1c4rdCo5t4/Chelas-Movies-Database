import express from 'express'
import errors from '../../utils/cmdb-errors.mjs'

export default function (site) {

    if (!site) {
        throw errors.INVALID_PARAMETER('site')
    }

    const router = express.Router()
    router.use(express.urlencoded({ extended: true }))


    /* Public Routes */

    // Home
    router.get('/home', site.getHome)
    router.get('/', site.getHome)
    router.get('/styles.css', site.getCss)
    router.get('/client.js', site.getJavascript)
    
    // Movies
    router.get('/movies/top', site.getTopMovies)
    router.get('/movies/search', site.searchMovie)
    router.get('/movies/:movieId', site.getMovie)


    /* Private Routes */

    // User
    router.get('/profile', site.getProfile)

    // Groups
    router.get('/groups', site.getGroups)
    router.post('/groups', site.createGroup)
    router.get('/groups/:groupId', site.getGroup)
    router.post('/groups/:groupId', site.addMovieToGroup)

    return router
}