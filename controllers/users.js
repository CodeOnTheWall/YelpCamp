const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        // passing in from the req.body email and username into the new User
        const registeredUser = await User.register(user, password)
        // register takes the instance of this new user and takes password and hashes it/salts it
        req.login(registeredUser, error => {
            if (error) return next(error);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('register')
    }
}

// .login is a helper function that logs the user in after they register

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    // that returnTo information that was stored will take us there
    res.redirect(redirectUrl);
}

// this ('local') is a strategy to authenticate - local is us, but we could add i.e. twitter
// if we fail, we will get a flash and get redirected to /login, if nothing fails, then we move next line of code

module.exports.logout = (req, res, next) => {
    req.logout(function (error) {
        if (error) { return next(error); }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds')
    });
}



























