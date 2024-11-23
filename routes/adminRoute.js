const express = require("express");
const admin_route = express();

const session = require("express-session");
const config = require('../config/config');
const bodyParser = require('body-parser');
const nocache = require('nocache');  // Import the nocache middleware
const multer = require('multer');
const path = require('path');

const auth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// Use session
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

// Apply nocache globally for all admin routes
admin_route.use(nocache());  // Apply nocache middleware

// Body parser
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// Set view engine
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));  // Ensure the directory exists
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '_' + file.originalname;  // File will be named with a timestamp
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

// Admin routes
admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/home', auth.isLogin, adminController.isAdmin, adminController.loadDashboard);
admin_route.get('/logout', adminController.isAdmin, adminController.logout);
admin_route.get('/dashboard', auth.isLogin, adminController.isAdmin, adminController.adminDashboard);
admin_route.get('/new-user', auth.isLogin, adminController.isAdmin, adminController.newUserLoad);
admin_route.post('/new-user', upload.single('image'), adminController.addUser);
admin_route.get('/edit-user', auth.isLogin, adminController.isAdmin, adminController.editUserLoad);
admin_route.post('/edit-user', adminController.updateUsers);
admin_route.get('/delete-user', auth.isLogin, adminController.isAdmin, adminController.deleteUser);
admin_route.post('/dashboard', adminController.searchUsers);

// Catch-all route to redirect to the admin login page
admin_route.get('*', function (req, res) {
    res.redirect('/admin');
});


module.exports = admin_route;
