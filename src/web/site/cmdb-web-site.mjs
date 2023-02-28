/* Module that contains the functions that handle all HTTP requests for the website. Handle HTTP request means:
    - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
    - Invoke the corresponding operation on services
    - Generate the response in HTML format
    - Render the response using templates and layout
*/

"use strict"


import url from 'url'
import toHttpResponse from '../api/http-errors.mjs'
import errors from '../../utils/cmdb-errors.mjs'
import siteRouter from './cmdb-web-router.mjs'


const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default function(services) {
 
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }

    async function getCss(req, rsp) {
        rsp.sendFile(__dirname + 'styles/styles.css', rsp)
    }

    function getJavascript(req, rsp) {
        rsp.sendFile(__dirname + 'scripts/client.js', rsp)
    }

    async function getHome(req, rsp) {
        return { name: 'home', data: { title: 'CMDB | Home' }}
    }
    
    async function getTopMovies(req, rsp) {
        const movies = await services.getTopMovies(req.query.limit)
        return { name: 'topmovies', data: { title: 'CMDB | Top Movies', movies: movies, limit: req.query.limit }}
    }

    async function searchMovie(req, rsp) {
        const movieName = req.query.q
        const query = await services.searchMovie(movieName, req.query.limit)
        const searchValue = query.length > 0 ? `Search results for '${movieName}'` : "No Results Found"
        return {
            name: 'search',
            data: { title: 'CMDB | Search', searchValue: searchValue, results: query, search: movieName, limit: req.query.limit }
        }
    }

    async function getMovie(req, rsp) {
        const movieId = req.params.movieId
        const movie = await services.getMovie(movieId)

        if (!movie.title) {
            throw errors.MOVIE_NOT_FOUND(movieId)
        }

        const groups = req.user ? await services.getGroups(req.user.token) : undefined
        return { name: 'movie', data: { title: `CMDB | ${movie.title}`, movie: movie, groups: groups } }
    }

    
    async function getGroups(req, rsp) {
        if (!req.user) {
            throw errors.NOT_SIGNED_IN()
        }
        const groups = await services.getGroups(req.user?.token)
        return { name: 'groups', data: { title: 'CMDB | Groups', groups: groups, token: req.user.token }}
    }

    async function getGroup(req, rsp) {
        const groupId = req.params.groupId
        const group = await services.getGroup(req.user?.token, groupId)
        const groupCopy = { ...group }
        groupCopy.movieCount = group.movies.length
        groupCopy.totalDuration = stringifyDuration(getTotalGroupDuration(group.movies))
        return { name: 'group', data: { title: 'CMDB | Groups', group: groupCopy, token: req.user.token } }
    }

    async function createGroup(req, rsp) {
        await services.createGroup(req.user?.token, req.body)
        rsp.redirect('/groups')
    }

    async function addMovieToGroup(req, rsp) {
        const movieId = req.body.movieId
        const groupId = req.params.groupId
        await services.addMovieToGroup(req.user?.token, req.params.groupId, movieId)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function getProfile(req, rsp) {

        const groups = await services.getGroups(req.user?.token)
        const totalMinutes = groups.reduce((acc, group) => acc + getTotalGroupDuration(group.movies), 0)
        const user = {
            name: req.user.name,
            totalGroups: groups.length,
            totalMovies: groups.reduce((acc, group) => acc + group.movies.length, 0),
            totalDuration: stringifyDuration(totalMinutes),
            groups: groups
        }

        return { name: 'profile', data: { title: 'CMDB | Profile', user: user } }
    }

    function getTotalGroupDuration(movies) {
        return movies.reduce((acc, movie) => acc + movie.duration, 0)
    }

    function stringifyDuration(mins) {
        let hours = Math.floor(mins / 60)
        let minutes = mins % 60

        if (hours < 1) return `${minutes}min`
        if (minutes < 10) minutes = `0${minutes}`

        return `${hours}h ${minutes}min`
    }

    function handleRequest(handler) {

        return async function (req, rsp) {
            
            try {
                const view = await handler(req, rsp)
                if (view) {
                    if (req.user) {
                        view.data.name = req.user.name
                    }
                    rsp.render(view.name, view.data)
                }

            } catch (e) {
                const response = toHttpResponse(e)
                const body = `${response.status} - ${response.body}`
                const username = req.user ? req.user.name : undefined
                rsp.status(response.status).render('error', { title: 'CMDB | Error', error: body, name: username })
            }
        }
    }

    const site = {
        getCss: getCss,
        getJavascript: getJavascript,
        getHome: handleRequest(getHome),
        getTopMovies: handleRequest(getTopMovies),
        getMovie: handleRequest(getMovie),
        searchMovie: handleRequest(searchMovie),
        getGroup: handleRequest(getGroup),
        getGroups: handleRequest(getGroups),
        createGroup: handleRequest(createGroup),
        addMovieToGroup: handleRequest(addMovieToGroup),
        getProfile: handleRequest(getProfile),
    }

    return siteRouter(site)
}