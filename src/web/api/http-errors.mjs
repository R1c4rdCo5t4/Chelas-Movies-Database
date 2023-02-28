/**
 * Modules that translates aplication errors to HTTP errors
 */

"use strict"

function HTTPErrorResponse(status, body) {
    this.status = status
    this.body = body
}

// translate application errors to HTTP status codes
const HTTP_STATUS_CODES = [400, 404, 404, 404, 409, 500, 409, 401, 401]

export default function (e) {
    console.log(e.message)
    const code = HTTP_STATUS_CODES[e.code]
    return new HTTPErrorResponse(code || 500, code ? e.message : "Internal server error")
}
