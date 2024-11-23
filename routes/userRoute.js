const express = require('express');
const user_route = express();

const auth = require("../middleware/auth");

// Set view engine for user routes
user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');  // Ensure the path is correct

const userController = require('../controllers/userController');
const bodyParser = require('body-parser');

// Middleware for parsing request bodies
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const multer = require('multer');
const path = require("path");

// Serve static files (CSS, images, etc.) from 'public' directory
user_route.use(express.static('public'));

// Set up multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));  // Ensure the directory exists
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '_' + file.originalname;  // File will be named with a timestamp
        cb(null, name);
    }
});

// Initialize multer with storage settings
const upload = multer({ storage: storage });

// Routes for user registration
user_route.get('/register', auth.isLogout, userController.loadRegister);
user_route.post('/register', upload.single('image'), userController.insertUser);  // Single file upload field named 'image'

// Routes for login
user_route.get('/', auth.isLogout, userController.loginLoad); // Default to login route
user_route.get('/login', auth.isLogout, userController.loginLoad);
user_route.post('/login', userController.verifyLogin);

// Home route (only accessible if logged in)
user_route.get('/home',userController.isUser, auth.isLogin, userController.loadHome);

// Logout route (only accessible if logged in)
user_route.get('/logout',userController.isUser, auth.isLogin, userController.userLogout);

// Export the user_route
module.exports = user_route;
