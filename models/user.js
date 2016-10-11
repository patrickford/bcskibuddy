var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	residence: {
		type: String
	},
	experienceLevel: {
		type: String
	},
	gear: {
		type: String
	},
	picture: {
		data: Buffer,
		contentType: String
	},
	email: {
		type: String
	}
});

UserSchema.methods.validatePassword = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isValid) {
		if(err) {
			callback(err);
			return;
		}
		callback(null, isValid);
	})
}

var User = mongoose.model('User', UserSchema);

module.exports = User;