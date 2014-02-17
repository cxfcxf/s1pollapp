var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/poll');

var choiceSchme = new mongoose.Schema({
	choice: String,
	username: Array
})

var pollSchema = new mongoose.Schema({
  creatorname: String,
  question: String,
  choices: [choiceSchme]
}, {
  collection: 'polls'
});


var pollModel = mongoose.model('Poll', pollSchema);


function Poll(user) {
	this.creatorname = user.creatorname;
	this.question = user.question;
	this.choices = user.choices
};

Poll.prototype.save = function(callback) {
	var poll = {
		creatorname: this.creatorname,
		question: this.question,
		choices: this.choices
	}

	var pol = new pollModel(poll);

	pol.save(function (err, user) {
    if (err) {
      return callback(err);
  	}
    callback(null, poll);
  });
};


Poll.get = function(pid, callback) {
  pollModel.findOne({_id: pid}, function (err, poll) {
    if (err) {
      return callback(err);
  	}
    callback(null, poll);
  });
};

Poll.listq = function(callback) {
	pollModel.find({}, function (err, polls) {
		if (err) {
			return callback(err);
		};
		callback(null, polls);
	});
};

Poll.update = function(pid, sid, username, callback) {

	pollModel.update({_id: pid, "choices._id": sid}, {$addToSet: {"choices.$.username": username} }, function (err, poll) {
		if (err) {
			return callback(err);
		};
		callback(null, poll);

	});
};

Poll.remove = function(pid, username, callback) {
	pollModel.findOne({_id: pid}, function (err, poll) {
		if (err) {
			return callback(err);
		};
		if (username == poll.creatorname) {
			poll.remove(callback);
		} else {
			return callback("用户不一致, 不能删除该投票!");
		};
	});
};


module.exports = Poll;