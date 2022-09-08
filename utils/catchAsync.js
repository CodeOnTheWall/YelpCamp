module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

// This is called a higher order function - a function that accepts a function as an arguement, and also returns a function
// The objective is to check if there are any asynchronous errors in the function
// If there are no errors, we return the exact same function that was originally passed through and the code will run as normal
// And if there is an error, we catch it so it can be handled by our error handler
// By using this, we dont need to write try and catch on each function





























