const User = require("../models/user.js");

module.exports.signupform = (req, res) => {
  res.render("users/signup.ejs");
}
module.exports.signup = async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const newUser = new User({ username, email });
      const registerdUser = await User.register(newUser, password);
      console.log(registerdUser);
      req.login(registerdUser,(err)=>{
        if(err){
          next(err);
        }
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      })
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  };
module.exports.loginform = (req, res) => {
  res.render("users/login.ejs");
};
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust !");
    let redirecturl = res.locals.redirectUrl || "/listings";
    res.redirect(redirecturl);
  };
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};