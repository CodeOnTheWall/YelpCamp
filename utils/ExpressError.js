class ExpressError extends Error {
    constructor(message, statusCode) {
        super()
        // this is going to call the Error Constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}
// reminder that we are giving our custom ExpressError, all the properties of the regular Error object/processes

module.exports = ExpressError;

























