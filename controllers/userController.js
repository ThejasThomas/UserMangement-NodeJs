const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Function to hash password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

// Load Registration Page
const loadRegister = async (req, res) => {
    try {
        const message = req.query.message || ''; // Get message from query params if it exists
        res.render('registration', { message });
    } catch (error) {
        console.log(error.message);
    }
};

// Insert User and Redirect with Query Message
const insertUser = async (req, res) => {
    try {
        const password = req.body.password;
        const spassword = await securePassword(password);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0,
        });

        const userData = await user.save();

        if (userData) {
            return res.redirect('/register?message=Registration successful!'); // Redirect with success message
        } else {
            return res.redirect('/register?message=Registration failed, please try again.');
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect('/register?message=An error occurred during registration.');
    }
};

// Load Login Page
const loginLoad = async (req, res) => {
    try {
        const message = req.query.message || ''; // Get message from query params if it exists
        res.render('login', { message });
    } catch (error) {
        console.log(error.message);
    }
};

// Verify Login and Redirect with Query Message
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.is_admin===0){
                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    req.session.user_id = userData._id;
                    return res.redirect('/home'); // Redirect to home on successful login
                } else {
                    return res.redirect('/login?message=Incorrect email or password.'); // Redirect with error message
                }
            } else {
                return res.redirect('/login?message=You are an Admin')
            }

        } else {
            return res.redirect('/login?message=User not found.'); // Redirect with error message
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect('/login?message=An error occurred during login.');
    }
};

// Load Home Page (after login)
const loadHome = async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }
        const userData = await User.findById(req.session.user_id);
        res.render('home', { user: userData });
    } catch (error) {
        console.log(error.message);
    }
};

// User Logout
const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        return res.redirect('/login?message=Successfully logged out.'); // Redirect to login with a message
    } catch (error) {
        console.log(error.message);
    }
};

const isUser = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId)
        if (userData.is_admin === 0) {
            return next();
        } else {
            return res.redirect('/admin')
        }

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    isUser
};
