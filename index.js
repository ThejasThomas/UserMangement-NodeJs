const mongoose = require('mongoose');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const session = require('express-session');
const nocache = require('nocache')

const app = express();

// MongoDB Connection 
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Serve static files
app.use(express.static('public'));

// Use session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));
// Middleware to apply no-cache headers globally
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});
app.use(nocache())
// For user routes
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);
// Serve static files with no-cache headers
app.use(express.static('public', {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
}));
app.get('*',(req,res)=>{
  res.status(404).send('<h2>404</h2>')
})




// Start server
app.listen(1000, () => {
  console.log("Server is running... http://localhost:1000");
});
