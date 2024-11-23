const User = require("../models/userModel")
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')


const securePassword = async (password) => {
  try {

    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash;

  } catch (error) {
    console.log(error.message);

  }
}

const loadLogin = async (req, res) => {
  try {
    const message = req.query.message ;
    console.log(message+"Load login");
    
    res.render('login',{message:message})
  } catch (error) {
    console.log(error.message);

  }
}
const verifyLogin = async (req, res) => {
  try {

    const email = req.body.email
    const password = req.body.password

    const userData = await User.findOne({ email: email })
    if (userData) {

      const passwordMatch = await bcrypt.compare(password, userData.password)

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.redirect('/admin?message=You are not an Admin')

        } else {
          req.session.user_id = userData.id;
          return res.redirect('/admin/home')
        }

      } else {
        res.redirect('/admin?message=Incorrect Password')

      }
    }
    else {
      res.redirect('/admin?message=User not found')
    }

  } catch (error) {
    console.log(error.message);

  }
}
const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    res.render('home', { admin: userData })
  } catch (error) {
    console.log(error.message);

  }

}
const logout = async (req, res) => {
  try {
    req.session.destroy()
    return res.redirect('/admin')
  } catch (error) {
    console.log(error.message);

  }
}
const adminDashboard = async (req, res) => {
  try {

    const usersData = await User.find({ is_admin: 0 })
    res.render('dashboard', { users: usersData })
  } catch (error) {
    console.log(error.message);

  }
}

const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.body.searchItem || "";

    if (!searchQuery) {
      const users = await User.find({ is_admin: 0 });
      return res.render('dashboard', { users: users });
    }

    const regex = new RegExp(`^${searchQuery}`, 'i');

    const users = await User.find({
      is_admin: 0,
      $or: [
        { email: regex },
        { name: regex }
      ]
    });
    console.log(users);


    res.render('dashboard', { users: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).send('Server Error');
  }
};
//* Add New Work Start

const newUserLoad = async (req, res) => {
  try {
    res.render('new-user')

  } catch (error) {
    console.log(error.message);

  }
}

const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mno = req.body.mno;
    const image = req.file.filename;
    const password = req.body.password; // Assuming you want to use the provided password
    const spassword = await securePassword(password);
    
    const user = new User({
      name: name,
      email: email,
      mobile: mno,
      image: image,
      password: spassword,
      is_admin: 0, // Make sure to set this as needed
    });
    
    const userData = await user.save();
    if (userData) {
      // Redirect to admin dashboard after adding a new user
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/admin/new-user');
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/admin/new-user');
  }
};

//edit user functionality
const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id })

    if (userData) {
      res.render('edit-user', { user: userData })
    } else {
      res.redirect('admin/dashboard')
    }

  } catch (error) {
    console.log(error.message);

  }
}
const updateUsers = async (req, res) => {
  try {
    const userId = req.query.id
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.phone
    }
    const userData = await User.findByIdAndUpdate(userId, { $set: updateData }, { name: true })

    res.redirect('/admin/dashboard')

  } catch (error) {
    console.log(error.message);

  }
}
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id
    await User.deleteOne({ _id: id })
    return res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error.message);

  }
}

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId)
    if (userData.is_admin == 1) {
      return next();
    } else {
      return res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUsers,
  deleteUser,
  searchUsers,
  isAdmin
}