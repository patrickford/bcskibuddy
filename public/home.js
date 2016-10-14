$(document).ready(function() {
	$('#oldAccountModal').modal('show');

	$('#closeOldAccountModal').click(function() {
		window.location.href = '/';
	});

	$('#oldAcctForm').submit(function(event) {
		event.preventDefault();
		console.log('submitted');
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
		console.log(that.specs);
		if (!that.specs.email) {
	    	that.editUser();
	    }
	    else {
	    	that.buildHomePage();
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
	$('#navTitle').text(this.specs.name + "'s Home Page");
	$('#brandPic').attr('src', 'data:image/jpg;base64,' + this.specs.picture.data.toString('base64'));
	$('#profileName').text("Name: " + this.specs.name);
	$('#username').text("Username: " + this.specs.username);	
	$('#email').text("Email: " + this.specs.email);
	$('#profilePic').text("Picture: " + this.specs.picture.data);
	$('#profileLocation').text("Location: " + this.specs.residence);
	$('#profileExperience').text("Experience level: " + this.specs.experienceLevel);
	$('#profileGear').text("Beacon, Shovel, and Probe: " + this.specs.gear);
	$('#tourOrganizer').text(this.specs.username);
	this.getCreatedTours();
}
CurrentUser.prototype.createTour = function() {
	var newTour = {};
	newTour.createdBy = this.specs.username;
	newTour.location = $('#tourLocation').val();
	newTour.area = $('#tourArea').val();
	newTour.date = $('#tourDate').val();
	newTour.time = $('#tourTime').val();
	newTour.difficulty = $('#tourDifficulty').val();
	newTour.comments = $('#tourComments').val();
	newTour.usersGoing = [];
	newTour.usersGoing.push(this.specs.username);
	var that = this;
    var ajax = $.ajax('/tours', {
        type: 'POST',
        data: JSON.stringify(newTour),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function(data) {
    	console.log('posted newTour');
    	that.getCreatedTours();
    }).fail(function(error) {
    	console.log(error);
    	console.log('failed to post newTour');
    });
}
// CurrentUser.prototype.editTour = function() {
	
// }
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
// CurrentUser.prototype.joinTour = function() {
	
// }
// CurrentUser.prototype.getJoinedTours = function() {
	
// }
// CurrentUser.prototype.displayJoinedTours = function() {
	
// }
CurrentUser.prototype.getTourByLocationList = function() {
	var searchLocation = $('#browseTourByLocation').val();
	var ajax = $.ajax('/tours/searchLocation/' + searchLocation, {
        type: 'GET',
		dataType: 'json',
		contentType: 'application/json'
    }).done(function(data) {
		console.log(data);
    }).fail(function() {
    	console.log("couldn't get tours by location");
    });	
}
// CurrentUser.prototype.deleteTour = function() {
	
// }
CurrentUser.prototype.displayCreatedTours = function() {
	if (this.toursPlanned.length == 0) {
		$('#userTourPanel').append('<p>You do not have any upcoming tours that you organized. ' + 
			'Click "Create Tour" button above, or <a id="tourModalBtn" href="#tourModalBtn">here</a>' +
			' to create a new ski trip.</li>');
	}
	else {
		this.toursPlanned.forEach(function(item, index) {
			var organizer = item.createdBy;
			var location = item.location;
			var area = item.area;
			var date = item.date;
			var time = item.time;
			var difficulty = item.difficulty;
			var comments = item.comments;
			var party = item.usersGoing;
			var html = '';
		    html += '<div class="panel panel-primary">';
		    html += '<div class="panel-heading collapsed" role="tab button" id="headingOne" data-toggle="collapse" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne">';
		    html += '<h4 class="panel-title">';
			html += 'Location: Area		Date: Time <span class="caret" style="float, right"></span>';
		    html += '</h4>';
		    html += '</div>';
		    html += '<div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">';
		    html += '<div class="panel-body">';
		    html += '<h4>Tour Organizer: <a href="">bob</a></h4>';
		    html += '<h4>Difficulty: hard</h4>';
		    html += '<h4>Members Going: <a href="">bob</a>, <a href="">rachel</a></h4>';
		    html += '<h4>Comments:</h4>';
		    html += '<div id>';
			html += '<div class="media">';
			html += '<div class="media-left">';
			html += '<a href="#">';
			html += '<img class="media-object" src="..." alt="...">';
			html += '</a>';
			html += '</div>';
			html += '<div class="media-body">';
			html += '<h5 class="media-heading">Bob</h5>';
			html += '<p>This is my comment.</p>';
			html += '</div>';
			html += '</div>';
			html += '<div class="media">';
			html += '<div class="media-left">';
			html += '<a href="#">';
			html += '<img class="media-object" src="..." alt="...">';
			html += '</a>';
			html += '</div>';
			html += '<div class="media-body">';
			html += '<h5 class="media-heading">Rachel</h5>';
			html += '<p>This is my comment.</p>';
			html += '</div>';
			html += '</div>';
			html += '</div>';
		    html += '</div>';
		    html += '<div class="panel-footer">';
			html += '<button type="button" class="btn btn-primary">Add Comment</button>';
			html += '<button type="button" class="btn btn-primary">Edit Tour</button>';
			html += '</div>';
		    html += '</div>';
		    html += '</div>';
			$('#userTourPanel').append(html);
		});
	}

}

function currentUserControl(user) {
	console.log('called user control');
	var currentUser = new CurrentUser();
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

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#userPic').attr('src', e.target.result).width(140).height(140);
        };

        reader.readAsDataURL(input.files[0]);
    }
}