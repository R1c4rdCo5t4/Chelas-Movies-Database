import express from 'express'
import expressSession from 'express-session'
import passport from 'passport'
import toHttpResponse from '../api/http-errors.mjs'


export default function (services) {
    
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }

    async function getAuthPage(req, rsp) {
        rsp.render('auth', { title: 'CMDB | Authenticate' })
    }

    async function signUp(req, rsp) {

        try {
            const user = await services.createUser(req.body)
            await login(req, user)
            rsp.redirect('/home')

        } catch (e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).render('auth', { title: 'CMDB | Authenticate', signUpErrorMessage: e.message })
        }
    }

    async function signIn(req, rsp) {

        try {
            const username = req.body.name
            const password = req.body.password
            const user = await services.getUser(username, password)
     
            await login(req, user)
            rsp.redirect('/home')

        } catch (e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).render('auth', { title: 'CMDB | Authenticate', signInErrorMessage: e.message })
        }
    }

    function signOut(req, rsp) {
        try {
            req.logout(_ => rsp.redirect('/home'))

        } catch (e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).render('auth', { title: 'CMDB | Authenticate', error: e.message })
        }
    }
    
    function login(req, user){
        return new Promise((resolve,reject) => {
            req.login(user, (err, result) =>{
                if(err) reject(err)
                else resolve(result)
            })
        })
    }

    const router = express.Router()

    router.use(expressSession({secret : 'CMDB', resave : true, saveUninitialized : true}))
    router.use(passport.initialize())
    router.use(passport.session())

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))

    router.get('/auth', getAuthPage)
    router.post('/auth/signup', signUp)
    router.post('/auth/signin', signIn)
    router.get('/auth/signout', signOut)

    return router
}
