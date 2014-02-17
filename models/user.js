var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/poll');


var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
}, {
  collection: 'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
  this.username = user.username;
  this.password = user.password;
  this.email = user.email;
};

User.prototype.save = function(callback) {
  var user = {
      username: this.username,
      password: this.password,
      email: this.email,
  };

  var newUser = new userModel(user);

  newUser.save(function (err, user) {
    if (err) {
      return callback(err);
    }
    else {
      callback(null, user);
    }
  });
};

User.get = function(name, callback) {
  userModel.findOne({username: name}, function (err, user) {
    if (err) {
      return callback(err);
    }
    else {
      callback(null, user);
    }
  });
};

module.exports = User;
