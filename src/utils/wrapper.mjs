/* 
* Module that returns object wrapping all functions with a try-catch block that throws specified error
*/

"use strict"

export function wrapper(functions, error) {
    return Object
        .assign({}, ...Object.entries(functions) // converts object to array of key-value pairs [funcname, func]
        .map(([k, v]) => ({ [k]: (...args) => handler(v, error, ...args) }))) // wraps function with handler
}

async function handler(callback, error, ...args) {
    try {
        return await callback(...args)
    }
    catch {
        throw error
    }
}

    