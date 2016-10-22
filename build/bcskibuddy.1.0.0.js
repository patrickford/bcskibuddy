/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname, module) {var express = __webpack_require__(2);
	var path = __webpack_require__(3);
	var app = express();
	var bodyParser = __webpack_require__(4);
	var jsonParser = bodyParser.json();
	var mongoose = __webpack_require__(5);
	var bcrypt = __webpack_require__(6);
	var passport = __webpack_require__(7);
	var BasicStrategy = __webpack_require__(8).BasicStrategy;
	var config = __webpack_require__(9);
	var Users = __webpack_require__(10);
	var Tours = __webpack_require__(11);
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use('/jquery', express.static('./node_modules/jquery/dist/'));
	app.use('/bootstrap', express.static('./node_modules/bootstrap/dist/js/'));
	app.use('/bootstrapCss', express.static('./node_modules/bootstrap/dist/css'));
	
	var runServer = function(callback) {
	    mongoose.connect(config.DATABASE_URL, function(err) {
	        if (err && callback) {
	            return callback(err);
	        }
	
	        app.listen(config.PORT, function() {
	            console.log('Listening on localhost:' + config.PORT);
	            if (callback) {
	                callback();
	            }
	        });
	    });
	};
	
	if (__webpack_require__.c[0] === module) {
	    runServer(function(err) {
	        if (err) {
	            console.error(err);
	        }
	    });
	};
	
	app.get('/', function (req, res) {
	    res.status(200);
	});
	
	app.get('/info', function(req, res) {
	    res.sendfile('./public/info.html');
	    res.status(200);
	});
	
	app.get('/user', function(req, res) {
		res.sendfile('./public/user.html');
		res.status(200);
	});
	
	var strategy = new BasicStrategy(function(username, password, callback) {
	    Users.findOne({username: username}, function(err, user) {
	        if(err) {
	            callback(err);
	            return;
	        }
	        if(!user) {
	            return callback(null, false, {
	                message: "Incorrect username"
	            });
	        }
	        user.validatePassword(password, function(err, isValid) {
	            console.log(password);
	            if (err) {
	                return callback(err);
	            }
	            if (!isValid) {
	                return callback(null, false, {
	                    message: "Incorrect password"
	                });
	            }
	            return callback(null, user);
	        });
	    });
	});
	
	passport.use(strategy);
	app.use(passport.initialize());
	
	app.get('/hidden', passport.authenticate('basic', {session: false}), function(req, res) {
	    res.json({
	        message: 'Luke... I am your father'
	    });
	});
	
	// app.get('/login', passport.authenticate('basic', {session: false}), function(req, res) {
	//     res.json({
	//         message: 'Luke... I am your father'
	//     });
	
	// });
	
	app.get('/users/:username', function(req, res) {
	    Users.findOne({username: req.params.username}, function(err, items) {
	        if (err) {
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        if (!items) {
	            return res.status(500).json({
	                message: 'Username does not exist'
	            });
	        }
	        res.json(items);
	    });
	});
	
	app.post('/users', jsonParser, function(req, res) {
	    if (!req.body) {
	        return res.status(400).json({
	            message: "No request body"
	        });
	    }
	    if (!('username' in req.body)) {
	        return res.status(422).json({
	            message: "Missing field: username"
	        });
	    }
	    var username = req.body.username;
	    if (typeof username !== 'string') {
	        return res.status(422).json({
	            message: "Incorrect field type: username"
	        });
	    }
	    username = username.trim();
	    if (username == '') {
	        return res.status(422).json({
	            message: "Incorrect field length: username"
	        });
	    }
	    if (!('password' in req.body)) {
	        return res.status(422).json({
	            message: "Missing field: password"
	        });
	    }
	    var password = req.body.password;
	    if (typeof password !== 'string') {
	        return res.status(422).json({
	            message: "Incorrect field type: password"
	        });
	    }
	    password = password.trim();
	    if (password == '') {
	        return res.status(422).json({
	            message: "Incorrect field length: password"
	        });
	    }
	    var name = req.body.name;
	    name = name.trim();
	    if (name == '') {
	        return res.status(422).json({
	            message: "Missing field: name"
	        });
	    }
	    bcrypt.genSalt(10, function(err, salt) {
	        if (err) {
	            return res.status(500).json({
	                message: "Internal server error"
	            });
	        }
	        bcrypt.hash(password, salt, function(err, hash) {
	            if (err) {
	                return res.status(500).json({
	                    message: "Internal server error"
	                });
	            }
	            var user = new Users({
	                name: name,
	                username: username,
	                password: hash
	            });
	            user.save(function(err) {
	            if (err && err.code == 11000) {
	                return res.status(500).json({
	                        message: 'Username already exists'
	                    });
	                }
	                else if (err) {
	                    return res.status(500).json({
	                        message: 'Internal Server Error'
	                    });
	                }
	                return res.status(201).json(user);
	            });
	        });
	    });
	});
	
	app.put('/users/:id', function(req, res) {
	    if (req.params.id !== req.body._id) {
	        return res.status(400).send();
	    } 
	    Users.findOne({_id: req.params.id}, function(err, item){
	        if (err) {
	            console.log(err);
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        item.name = req.body.name;
	        item.residence = req.body.residence;
	        item.experienceLevel = req.body.experienceLevel;
	        item.gear = req.body.gear;
	        item.email = req.body.email;
	        item.save(function(err) {
	            if (err) {
	                return res.status(500).send(err);
	            } else {
	                res.status(201).json(item);
	            }
	        });
	    });
	});
	
	app.delete('/users/:id', function(req, res) {
	    var id = req.params.id;
	    Users.findByIdAndRemove(id, function(err, item) {
	        if (err) {
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        res.status(201).json(item);
	    });
	});
	
	app.post('/tours', function(req, res) {
	    var tour = {};
	    tour.createdBy = req.body.createdBy;
	    tour.location = req.body.location;
	    tour.area = req.body.area;
	    tour.date = req.body.date;
	    tour.time = req.body.time;
	    tour.difficulty = req.body.difficulty;
	    tour.usersGoing = req.body.usersGoing;   
	    tour.comments = req.body.comments;
	    Tours.create(tour, function(err, item) {
	        if (err) {
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        return res.status(201).json(item);
	    });
	});
	
	app.get('/tours/searchLocation/:location', function(req, res) {
	    if (req.params.location == 'SeeAll') {
	        Tours.find(function(err, items) {
	            if (err) {
	                return res.status(500).json({
	                    message: 'Internal Server Error'
	                });
	            }
	            res.json(items);
	        });
	    }
	    else {
	        Tours.find({location: req.params.location}, function(err, items) {
	            if (err) {
	                return res.status(500).json({
	                    message: 'Internal Server Error'
	                });
	            }
	            return res.status(200).json(items);
	        });
	    }
	    
	});
	
	app.put('/tours/joinTour/:id', function(req, res) {
	    Tours.findOne({_id: req.params.id}, function(err, item){
	        if (err) {
	            console.log(err);
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        if (item.usersGoing.indexOf(req.body.username) !== -1) {
	            return res.status(500).json({
	                message: 'Already joined'
	            });
	        }
	        else {
	            item.usersGoing.push(req.body.username);
	            item.save(function(err) {
	                if (err) {
	                    return res.status(500).send(err);
	                } else {
	                    res.status(201).json(item);
	                }
	            });            
	        }
	    });
	});
	
	app.put('/tours/leaveTour/:id', function(req, res) {
	    Tours.findOne({_id: req.params.id}, function(err, item){
	        if (err) {
	            console.log(err);
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        item.usersGoing.splice(item.usersGoing.indexOf(req.body.username), 1);
	        item.save(function(err) {
	            if (err) {
	                return res.status(500).send(err);
	            } else {
	                res.status(201).json(item);
	            }
	        });            
	    });
	});
	
	app.delete('/tour/deleteTour/:id', function(req, res) {
	    var id = req.params.id;
	    Tours.findByIdAndRemove(id, function(err, item) {
	        if (err) {
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        res.status(201).json(item);
	    });
	});
	
	app.get('/tours/userCreated/:username', function(req, res) {
	    Tours.find({createdBy: req.params.username}, function(err, items) {
	        if (err) {
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        res.status(201).json(items);
	    });
	});
	
	app.get('/tours/userJoined/:username', function(req, res) {
	    Tours.find({ usersGoing: req.params.username }, function(err, items) {
	        if (err) {
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        res.status(201).json(items);
	    });
	});
	
	app.put('/tours/addComment/:id', function(req, res) {
	    Tours.findOne({_id: req.params.id}, function(err, item){
	        if (err) {
	            console.log(err);
	            return res.status(500).json({
	                message: 'Internal Server Error'
	            });
	        }
	        item.comments.push(req.body);
	        item.save(function(err) {
	            if (err) {
	                return res.status(500).send(err);
	            } else {
	                res.status(201).json(item);
	            }
	        });            
	    });
	});
	
	app.get("*", function(req, res) { 
	    res.redirect("/");
	});
	
	exports.app = app;
	exports.runServer = runServer;
	/* WEBPACK VAR INJECTION */}.call(exports, "/", __webpack_require__(1)(module)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("mongoose");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("bcryptjs");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("passport");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("passport-http");

/***/ },
/* 9 */
/***/ function(module, exports) {

	exports.DATABASE_URL= process.env.DATABASE_URL || 
							global.DATABASE_URL ||
							(process.env.NODE_ENV === 'production' ?
								'mongodb://localhost/bcskibuddy' :
								'mongodb://localhost/bcskibuddy-dev');
	exports.PORT= process.env.PORT || 8080;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var mongoose = __webpack_require__(5);
	var bcrypt = __webpack_require__(6);
	
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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var mongoose = __webpack_require__(5);
	
	var TourSchema = new mongoose.Schema({
		createdBy: {
			type: String,
			required: true
		},	
		location: {
			type: String,
			required: true
		},
		area: {
			type: String
		},
		date: {
			type: Date,
			required: true
		},
		time: {
			type: String
		},
		difficulty: {
			type: String
		},
		comments: {
			type: Array
		},
		usersGoing: {
			type: Array
		}
	});
	
	var Tour = mongoose.model('Tour', TourSchema);
	module.exports = Tour;
	
	// var mockUpcomingTrips = {
	// 	"upcomingTrips": [
	// 		{
	// 			"id": "1",
	// 			"location": "logan",
	// 			"area": "black smith",
	// 			"date": "novermber 3",
	// 			"time": "6:00am",
	// 			"difficulty": "easy",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "2",
	// 			"location": "ogden",
	// 			"area": "snow basin",
	// 			"date": "novermber 4",
	// 			"time": "6:00am",
	// 			"difficulty": "moderate",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "3",
	// 			"location": "salt lake",
	// 			"area": "little cottonwood",
	// 			"date": "novermber 5",
	// 			"time": "6:00am",
	// 			"difficulty": "hard",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "4",
	// 			"location": "provo",
	// 			"area": "big springs",
	// 			"date": "novermber 6",
	// 			"time": "6:00am",
	// 			"difficulty": "extreme",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "5",
	// 			"location": "uintas",
	// 			"area": "soap stone",
	// 			"date": "novermber 7",
	// 			"time": "6:00am",
	// 			"difficulty": "easy",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "6",
	// 			"location": "skyline",
	// 			"area": "unknown",
	// 			"date": "novermber 8",
	// 			"time": "6:00am",
	// 			"difficulty": "moderate",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "7",
	// 			"location": "moab",
	// 			"area": "la sals",
	// 			"date": "novermber 9",
	// 			"time": "6:00am",
	// 			"difficulty": "hard",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 		{
	// 			"id": "8",
	// 			"location": "abajos",
	// 			"area": "unknown",
	// 			"date": "novermber 10",
	// 			"time": "6:00am",
	// 			"difficulty": "extreme",
	// 			"usersGoing": ["dan", "jaimie", "linley", "luna"]
	// 		},
	// 	]
	// };

/***/ }
/******/ ]);
//# sourceMappingURL=bcskibuddy.1.0.0.js.map