$(document).ready(function() {
	$('#oldAccountModal').modal('show');

	$('#closeOldAccountModal').click(function() {
		window.location.href = '/';
	});

	$('#oldAcctForm').submit(function(event) {
		event.preventDefault();
		var user = {
			username: $('#existingUsername').val(),
			password: $('#existingPassword').val()
		}
		currentUserControl(user);
	});
});

var CurrentUser = function() {
	this.specs = {};
	this.toursPlanned = [];
	this.toursJoined = [];
}
CurrentUser.prototype.getUser = function(user) {
	var that = this;
	var ajax = $.ajax('/users/' + user.username, {
        type: 'GET',
		data: JSON.stringify(user),
		dataType: 'json',
		contentType: 'application/json'
    }).done(function(data) {
	    $('#existingUsername').val('');
		$('#existingPassword').val('');
		$('#oldAccountModal').modal('hide');
		that.specs = data;
		if (!that.specs.email) {
	    	that.editUser();
	    }
	    else {
	    	that.buildHomePage();
	    }
    }).fail(function(error) {
    	if (error.responseJSON.message = "Username does not exist") {
			$('#signInFormScrewUp').text("Username does not exist. If you don't have an account with us," + 
				" please close the window and create an account.").css('color', 'red');
    	}
    });
};
CurrentUser.prototype.editUser = function() {
	$('#userSetUpModal').modal('show');
	$('#userSetUpTitle').text('Hi ' + this.specs.name + '! Welcome to BCskibuddy!!!');
	this.specs.picture = {};
	var that = this;
	$('#userSetUpBtn').click(function() {
		var gearCheck = 'No';
		if ($('#setGearCheck').prop('checked')) {
			gearCheck = 'Yes';
		}
		that.specs.picture.data = './public/' + $('#setUserPic').attr('src');
		that.specs.picture.contentType = "image/jpg";
		that.specs.residence = $('#setLocation').val();
		that.specs.experienceLevel = $('#setExperienceLevel').val();
		that.specs.gear = gearCheck;
		that.specs.email = $('#setUserEmail').val();
		$('#userSetUpModal').modal('hide');
		that.updateUser();
	});
}
CurrentUser.prototype.editUserProfile = function() {
	var that = this;
	$('#profileModalBody').hide();
	$('#editFooter').hide();
	$('#modProfileForm').show();
	$('#saveFooter').show();
	$('#saveProfileBtn').click(function() {
		that.specs.name = $('#modName').val();
		that.specs.email = $('#modEmail').val();
		that.specs.picture.data = './public/' + $('#modUserPic').attr('src');
		that.specs.picture.contentType = "image/png";
		that.specs.residence = $('#modLocation').val();
		that.specs.experienceLevel = $('#modExperienceLevel').val();
		var gearCheck = 'No';
		if ($('#modGearCheck').prop('checked')) {
			gearCheck = 'Yes';
		}
		that.specs.gear = gearCheck;
		that.updateUser();
		$('#modProfileForm').hide();
		$('#saveFooter').hide();
		$('#profileModalBody').show();
		$('#editFooter').show();
	});
}
CurrentUser.prototype.updateUser = function() {
	var that = this;
	var ajax = $.ajax('/users/' + that.specs._id, {
		type: 'PUT',
		data: JSON.stringify(that.specs),
		dataType: 'json',
		contentType: 'application/json'
	}).done(function() {
		console.log('completed a put');
		console.log(that.specs);
		that.buildHomePage();
	}).fail(function() {
		console.log('there is an error on put');
	});
}
CurrentUser.prototype.deleteAccount = function() {
	var ajax = $.ajax('/users/' + this.specs._id, {
        type: 'DELETE',
        dataType: 'json'
    }).done(function() {
    	console.log('deleted account');
    	window.location.href = '/';
    }).fail(function() {
    	console.log('account not deleted');
    });
}
CurrentUser.prototype.buildHomePage = function() {
	console.log(this.specs.picture);
	$('#navTitle').text(this.specs.name + "'s Home Page");
	$('#brandPic').attr('src', 'data:image/jpg;base64,' + this.specs.picture.data.data.toString('base64'));
	$('#profileName').text("Name: " + this.specs.name);
	$('#username').text("Username: " + this.specs.username);	
	$('#email').text("Email: " + this.specs.email);
	$('#profilePic').text("Picture: " + this.specs.picture.data);
	$('#profileLocation').text("Location: " + this.specs.residence);
	$('#profileExperience').text("Experience level: " + this.specs.experienceLevel);
	$('#profileGear').text("Beacon, Shovel, and Probe: " + this.specs.gear);
	$('#tourOrganizer').text(this.specs.username);
	this.getCreatedTours();
	this.getJoinedTours();
}
CurrentUser.prototype.createTour = function() {
	var newTour = {};
	newTour.createdBy = this.specs.username;
	newTour.location = $('#tourLocation').val();
	newTour.area = $('#tourArea').val();
	newTour.date = $('#tourDate').val();
	newTour.time = $('#tourTime').val();
	newTour.difficulty = $('#tourDifficulty').val();
	newTour.usersGoing = [];
	newTour.usersGoing.push(this.specs.username);	
	newTour.comments = [];
	newTour.comments.push({
							'username': this.specs.username,
							'comment': $('#tourComments').val()
						  });
	var that = this;
    var ajax = $.ajax('/tours', {
        type: 'POST',
        data: JSON.stringify(newTour),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function(data) {
    	console.log('posted newTour');
    	that.getCreatedTours();
    	$('#joinTourByLocationPanel').empty();
    	$('#tourLocation').val('');
    	$('#tourArea').val('');
    	$('#tourDate').val('');
    	$('#tourTime').val('');
    	$('#tourDifficulty').val('');
    	$('#tourComments').val('')
    }).fail(function(error) {
    	console.log(error);
    	console.log('failed to post newTour');
    });
}
CurrentUser.prototype.getCreatedTours = function() {
	var that = this;
	var ajax = $.ajax('/tours/userCreated/' + that.specs.username, {
        type: 'GET',
		dataType: 'json',
		contentType: 'application/json'
    }).done(function(data) {
		$('#createTourModal').modal('hide');
		that.toursPlanned = data;
		console.log(that.toursPlanned);
		that.displayCreatedTours();
    }).fail(function() {
    	console.log("couldn't get created tours");
    });	
}
CurrentUser.prototype.joinTour = function(tripId) {
	var that = this;
	var ajax = $.ajax('/tours/joinTour/' + tripId, {
		type: 'PUT',
		data: JSON.stringify({'username': that.specs.username}),
		dataType: 'json',
		contentType: 'application/json'
	}).done(function(data) {
		console.log('completed join tour put');
		that.getJoinedTours();
	}).fail(function() {
		console.log('could not complete join tour put');
	});
}
CurrentUser.prototype.leaveTour = function(tripId) {
	var that = this;
	var ajax = $.ajax('/tours/leaveTour/' + tripId, {
		type: 'PUT',
		data: JSON.stringify({'username': that.specs.username}),
		dataType: 'json',
		contentType: 'application/json'
	}).done(function(data) {
		console.log('completed leave tour put');
		that.getJoinedTours();
	}).fail(function(error) {
		console.log(error);
		console.log('could not complete leave tour put');
	});
}
CurrentUser.prototype.addComment = function(tripId) {
	var newComment = {};
	newComment.username = this.specs.username;
	newComment.comment = $('#addTourComments').val();
	var that = this;
	var ajax = $.ajax('/tours/addComment/' + tripId, {
		type: 'PUT',
		data: JSON.stringify(newComment),
		dataType: 'json',
		contentType: 'application/json'
	}).done(function(data) {
		console.log(data);
		console.log('completed comment put');
		that.displayJoinedTours();
		that.displayCreatedTours();
	}).fail(function(error) {
		console.log(error);
		console.log('could not complete comment put');
	})
}
CurrentUser.prototype.getJoinedTours = function() {
	var that = this;
	var ajax = $.ajax('/tours/userJoined/' + that.specs.username, {
        type: 'GET',
		dataType: 'json',
		contentType: 'application/json'
    }).done(function(data) {
    	that.toursJoined = [];
    	for (var i=0; i<data.length; i++) {
    		if (data[i].createdBy !== that.specs.username) {
    			that.toursJoined.push(data[i]);
    		}
    	}
    	that.displayJoinedTours();
    }).fail(function() {
    	console.log("couldn't get created tours");
    });
}
CurrentUser.prototype.displayJoinedTours = function() {
	$(joinedTourPanel).empty();
	if (this.toursJoined.length == 0) {
		$('#joinedTourPanel').append('<p>You have not joined any tours yet. Search through the locations' +
			' below to find a tour to join in your desired area.</p>');
	}
	else {
		$('#joinedTourPanel').append('<p>These are the tours that you have joined.</p>');		
		this.toursJoined.forEach(function(item, index) {
			var id = item._id;
			var organizer = item.createdBy;
			var location = item.location;
			var area = item.area;
			var date = item.date;
			var time = item.time;
			var difficulty = item.difficulty;
			var party = '';
			var getParty = item.usersGoing.forEach(function(item) {
				party += '<a href=""><u>' + item + '</u> </a>';
			});
			var comments = '';
			var getComments = item.comments.forEach(function(item) {
				comments += '<div class="media">' +
							  '<div class="media-left">' +
							    '<img class="media-object" src="' + item.picData + '" alt="...">' +
							  '</div>' +
							  '<div class="media-body">' +
							    '<h5 class="media-heading"><a href="#"><u>' + item.username + '</u></a></h5>' +
							    '<p>' + item.comment + '</p>' +
							  '</div>' +
							'</div>' 
			});
			var html = '';
		    html += '<div class="panel panel-primary">' +
					    '<div class="panel-heading collapsed" role="tab button" id="joinTourHeading' + index + '" data-toggle="collapse" href="#joinTourCollapse' + index + '" aria-expanded="false" aria-controls="joinTourCollapse' + index + '">' +
					      '<h4 class="panel-title">' +
							 location + ': ' + area + ',   ' + date + ': ' + time + '<span class="caret" style="float:right;"></span>' +
					      '</h4>' +
					    '</div>' +
					    '<div id="joinTourCollapse' + index + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="joinTourHeading' + index + '">' +
					      '<div class="panel-body">' +
					      	'<h4>Tour Organizer: <a href="">' + organizer + '</a></h4>' +
					        '<h4>Difficulty: ' + difficulty + '</h4>' +
					        '<h4>Members Going: ' + party + '</h4>' +
					        '<h4>Comments:</h4>' +
					        '<div id="commentsDiv">' + comments + '</div>' +
					        '<div id="addCommentsDiv">' +
					          '<form id="commentForm">' +
						          '<textarea class="form-control" rows="4" id="addTourComments"></textarea>' +
								  '<button type="button" class="btn btn-primary" onclick="postCommentBtn(this.value)" value="' + id + '">Post Comment</button>' +
					          '</form>' +
					        '</div>' +
					      '</div>' +
					      '<div class="panel-footer">' +
							  '<button type="button" class="btn btn-primary" onclick="leaveTourBtn(this.value)" value="' + id + '">Leave Tour</button>' +
						  '</div>' +
					    '</div>' +
					'</div>';
			$('#joinedTourPanel').append(html);
		});
	}
}
CurrentUser.prototype.getTourByLocationList = function() {
	var that = this;
	var searchLocation = $('#browseTourByLocation').val();
	var ajax = $.ajax('/tours/searchLocation/' + searchLocation, {
        type: 'GET',
		dataType: 'json',
		contentType: 'application/json'
    }).done(function(data) {
    	if (data.length === 0) {
    		$('#joinTourByLocationPanel').html('<p>There are no current tours scheduled in the' +
    			' selected location. Please select another location, or organize a tour for this' +
    			' location by creating a tour above.</p>');
    	}
    	else {
    		that.displayTourByLocation(data);
    	}
    }).fail(function() {
    	console.log("couldn't get tours by location");
    });	
}
CurrentUser.prototype.displayTourByLocation = function(tours) {
	$('#joinTourByLocationPanel').empty();
	tours.forEach(function(item, index) {
		var organizer = item.createdBy;
		var id = item._id;
		var location = item.location;
		var area = item.area;
		var date = item.date;
		var time = item.time;
		var difficulty = item.difficulty;
		var party = '';
		var getParty = item.usersGoing.forEach(function(item) {
			party += '<a href="#"><u>' + item + '</u> </a>';
		});
		var comments = '';
		var getComments = item.comments.forEach(function(item) {
			comments += '<div class="media">' +
						  '<div class="media-left">' +
						    '<img class="media-object" src="' + item.picData + '" alt="...">' +
						  '</div>' +
						  '<div class="media-body">' +
						    '<h5 class="media-heading"><a href="#"><u>' + item.username + '</u></a></h5>' +
						    '<p>' + item.comment + '</p>' +
						  '</div>' +
						'</div>' 
		});
		var html = '';
	    html += '<div class="panel panel-primary">' +
				    '<div class="panel-heading collapsed" role="tab button" id="locationTourHeading' + index + '" data-toggle="collapse" href="#locationTourCollapse' + index + '" aria-expanded="false" aria-controls="locationTourCollapse' + index + '">' +
				      '<h4 class="panel-title">' +
						 location + ': ' + area + ',   ' + date + ': ' + time + '<span class="caret" style="float:right;"></span>' +
				      '</h4>' +
				    '</div>' +
				    '<div id="locationTourCollapse' + index + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="locationTourHeading' + index + '">' +
				      '<div class="panel-body">' +
				      	'<h4>Tour Organizer: <a href="">' + organizer + '</a></h4>' +
				        '<h4>Difficulty: ' + difficulty + '</h4>' +
				        '<h4>Members Going: ' + party + '</h4>' +
				        '<h4>Comments:</h4>' +
					    '<div id="commentsDiv">' + comments + '</div>' +
				      '</div>' +
				      '<div class="panel-footer">' +
						  '<button type="button" class="btn btn-primary" onclick="joinTourBtn(this.value)" value="' + id + '">Join Tour</button>' +
					  '</div>' +
				    '</div>' +
				'</div>';
		$('#joinTourByLocationPanel').append(html);
	});
}
CurrentUser.prototype.deleteTour = function(tourId) {
	var that = this;
	var ajax = $.ajax('/tour/deleteTour/' + tourId, {
        type: 'DELETE',
        dataType: 'json'
    }).done(function() {
    	console.log('deleted tour');
    	that.getCreatedTours();
    	$('#joinTourByLocationPanel').empty();
    }).fail(function() {
    	console.log('tour not deleted');
    });
}
CurrentUser.prototype.displayCreatedTours = function() {
	$(userTourPanel).empty();
	if (this.toursPlanned.length == 0) {
		$('#userTourPanel').append('<p>You do not have any upcoming tours that you organized. ' + 
			'Click "Create Tour" button above to create a new ski trip.</p>');
	}
	else {
		$('#userTourPanel').append('<p>These are the tours that you have organized.</p>');		
		this.toursPlanned.forEach(function(item, index) {
			var id = item._id;
			var organizer = item.createdBy;
			var location = item.location;
			var area = item.area;
			var date = item.date;
			var time = item.time;
			var difficulty = item.difficulty;
			var party = '';
			var getParty = item.usersGoing.forEach(function(item) {
				party += '<a href=""><u>' + item + '</u> </a>';
			});
			var comments = '';
			var getComments = item.comments.forEach(function(item) {
				comments += '<div class="media">' +
							  '<div class="media-left">' +
							    '<img class="media-object" src="' + item.picData + '" alt="...">' +
							  '</div>' +
							  '<div class="media-body">' +
							    '<h5 class="media-heading"><a href="#"><u>' + item.username + '</u></a></h5>' +
							    '<p>' + item.comment + '</p>' +
							  '</div>' +
							'</div>' 
			});
			var html = '';
		    html += '<div class="panel panel-primary">' +
					    '<div class="panel-heading collapsed" role="tab button" id="planTourHeading' + index + '" data-toggle="collapse" href="#planTourCollapse' + index + '" aria-expanded="false" aria-controls="planTourCollapse' + index + '">' +
					      '<h4 class="panel-title">' +
							 location + ': ' + area + ',   ' + date + ': ' + time + '<span class="caret" style="float:right;"></span>' +
					      '</h4>' +
					    '</div>' +
					    '<div id="planTourCollapse' + index + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="planTourHeading' + index + '">' +
					      '<div class="panel-body">' +
					      	'<h4>Tour Organizer: <a href="">' + organizer + '</a></h4>' +
					        '<h4>Difficulty: ' + difficulty + '</h4>' +
					        '<h4>Members Going: ' + party + '</h4>' +
					        '<h4>Comments:</h4>' +
					        '<div id="commentsDiv">' + comments + '</div>' +
					        '<div id="addCommentsDiv">' +
					          '<form id="commentForm">' +
						          '<textarea class="form-control" rows="4" id="addTourComments"></textarea>' +
								  '<button type="button" class="btn btn-primary" onclick="postCommentBtn(this.value)" value="' + id + '">Post Comment</button>' +
					          '</form>' +
					        '</div>' +					        
					      '</div>' +
					      '<div class="panel-footer">' +
							  '<button type="button" class="btn btn-primary" onclick="cancelTourBtn(this.value)" value="' + id + '">Cancel Tour</button>' +
						  '</div>' +
					    '</div>' +
					'</div>';
			$('#userTourPanel').append(html);
		});
	}
}

var currentUser = new CurrentUser();

function currentUserControl(user) {
	currentUser.getUser(user);
    $('#deleteAcctBtn').click(function() {
		currentUser.deleteAccount();
	});
	$('#profileBtn').click(function() {
		$('#profileModal').modal('show');
		$('#modProfileForm').hide();
		$('#saveFooter').hide();
		$('#profileModalBody').show();
		$('#editFooter').show();
	});
	$('#editProfileBtn').click(function() {
		currentUser.editUserProfile();
	});
	$('#tourModalBtn').click(function() {
		$('#createTourModal').modal('show');
	});
	$('#createTourBtn').click(function() {
		currentUser.createTour();
	});
	$('#tourByLocationForm').submit(function(e) {
		e.preventDefault();
		currentUser.getTourByLocationList();
	});
} 

function joinTourBtn(id) {
	currentUser.joinTour(id);
}

function leaveTourBtn(id) {
	currentUser.leaveTour(id);
}

function postCommentBtn(id) {
	currentUser.addComment(id);
}

function cancelTourBtn(id) {
	currentUser.deleteTour(id);
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#userPic').attr('src', e.target.result).width(140).height(140);
        };

        reader.readAsDataURL(input.files[0]);
    }
}