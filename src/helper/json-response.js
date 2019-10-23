function getJsonResponse(code, reason, payload) {
    return {
        code: code,
        reason: reason,
        payload: payload
    }
}

module.exports = getJsonResponse;