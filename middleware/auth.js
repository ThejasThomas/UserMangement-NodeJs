const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // If user is logged in, allow the request to proceed
            next();
        } else {
            // If user is not logged in, redirect to login
            return res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, optionally you can redirect to an error page
        res.redirect('/error');
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // If user is logged in, redirect to home
            return res.redirect('/home');
        }
        // If user is not logged in, allow the request to proceed
        next();
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, optionally you can redirect to an error page
        res.redirect('/error');
    }
};

module.exports = {
    isLogin,
    isLogout
};
