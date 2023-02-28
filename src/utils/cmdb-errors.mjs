/**
 * Module that exports the internal errors of the application
 */

"use strict"

export default {
    INVALID_PARAMETER: argName => {
        return {
            code: 0,
            message: `Invalid parameter: ${argName}`
        }
    },
    USER_NOT_FOUND: username => {
        return {
            code: 1,
            message: `User with username '${username}' not found`
        }
    },
    GROUP_NOT_FOUND: groupId => {
        return {
            code: 2,
            message: `Group with id '${groupId}' not found`
        }
    },
    MOVIE_NOT_FOUND: movieId => {
        return {
            code: 3,
            message: `Movie with id '${movieId}' not found`
        }
    },
    MOVIE_ALREADY_EXISTS: movieId => {
        return {
            code: 4,
            message: `Movie with id '${movieId}' already in group` 
        }
    },
    DB_ERROR: () => {
        return {
            code: 5,
            message: `Unexpected database error` 
        }
    },
    USER_ALREADY_EXISTS: username => {
        return {
            code: 6,
            message: `User with username '${username}' already exists`
        }
    },
    NOT_SIGNED_IN: () => {
        return {
            code: 7,
            message: `Must be signed in to perform this action`
        }
    },
    INVALID_CREDENTIALS: () => {
        return {
            code: 8,
            message: `Incorrect username or password`
        }
    }
}