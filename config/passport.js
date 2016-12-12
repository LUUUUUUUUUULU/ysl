var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');


module.exports= function(User){
  passport.use(new LocalStrategy({
    usernameField: 'phone'
  },
  function(phone, password, done) {
    User.findOne({ 'profile.phone': phone }, function (err, user) {
       // In case of any error, return using the done method
      if (err) { return done(err); }
      
      // Username does not exist, log error & redirect back
      if (!user) {
        return done(null, false, 'User Not found.', 'User Not found.');
      }
        // User exists but wrong password, log the erro
      if (!user.validPassword(password)) {
        return done(null, false, 'Invalid Password', 'Invalid Password');
      }
    // User and password both match, return user from 
        // done method which will be treated like success
      return done(null, user);
    });
  }
));
}