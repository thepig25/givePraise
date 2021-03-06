/*global Deps, Meteor, Template, PraisePosts, PraisePostService, moment*/
/*jshint -W020 */
/**
 * Separate player logic into an own service singleton for better testability and reusability.
 * @type {{}}
 */

Deps.autorun(function() {
	Meteor.subscribe('offlineUsers');
	Meteor.subscribe('onlineUsers');
	Meteor.subscribe('allUsers');
	Meteor.subscribe('praisePosts');
});

PraisePostService = {
	praisePosts: function() {
		return PraisePosts.find({}, {
			sort: {
				createdAt: -1
			}
		});
	},
	postCount: function() {
		return PraisePosts.find().count();
	}
};

Template.showPlaudits.onRendered(function () {
  // Use the Slick jQuery plugin
  this.$('#carousel').slick({
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 500,
    });
});

// Events
Template.praiseBlog.events({
	'submit .newPraisePostForm': function(event) {
		// This function is called when the new task form is submitted
		var plaudit = document.getElementById('praise-user').value;
		var text = event.target.text.value;

		Meteor.call('addPost', text, plaudit);

		// Clear form
		event.target.text.value = '';
		window.location = '/showPlaudits';
		// Prevent default form submit
		return false;
	}
});

Template.myPosts.events({
	'click .delete': function() {
		Meteor.call('deletePraisePost', this._id);
	}
});

//Helpers

Template.praiseBlog.helpers({
	'offlineUsers': function() {
		return Meteor.users.find({
			'status.online': false,
			_id: {
				$ne: Meteor.userId()
			}
		});
	},
	'onlineUsers': function() {
		return Meteor.users.find({
			'status.online': true,
			_id: {
				$ne: Meteor.userId()
			}
		});
	},
	'allUsers': function() {
		var usersLower = Meteor.users.find({
			_id: {
				$ne: Meteor.userId()
			}
		}).fetch();
		var usernameArray = _.pluck(usersLower, 'username');
		usernameArray.sort(function(a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		return usernameArray;
	}

});

Template.showPlaudits.helpers({
	praisePosts: function() {
		return PraisePostService.praisePosts();
	}

});

Template.yourPlaudits.helpers({
	praisePosts: function() {
		return PraisePostService.praisePosts();
	}

});

Template.leaderboard.helpers({
	praisePosts: function() {
		return PraisePostService.praisePosts();
	}

});


Template.myPosts.helpers({
	isOwner: function() {
		return this.owner === Meteor.userId();
	},
	createdAtFormatted: function() {
		return moment(this.createdAt).format('MM/DD/YYYY, HH:MM');
	}
});

Template.recievedPosts.helpers({
	isMyPlaudit: function() {
		return this.plaudit === Meteor.user().username;
	},
	createdAtFormatted: function() {
		return moment(this.createdAt).format('MM/DD/YYYY, HH:MM');
	}
});

Template.praisePost.helpers({
	createdAtFormatted: function() {
		return moment(this.createdAt).format('MM/DD/YYYY, HH:MM');
	}
});

Template.leaderboard.helpers({
	mostPraised: function() {
		var plaudits = PraisePosts.find().fetch();

		var groupedData = _.groupBy(_.pluck(plaudits, 'plaudit')),
			sortedData = _.map(groupedData,function(item) {

							return {
								plauditLength: item.length,
								plauditName: item[0]
							};

						}),
			filtered = _.sortBy(sortedData, 'plauditLength'),
			mostPraised = filtered.reverse();


		return mostPraised;
	},
	mostRaised: function() {
		var plaudits = PraisePosts.find().fetch();

		var groupedData = _.groupBy(_.pluck(plaudits, 'username')),
			sortedData = _.map(groupedData,function(item) {

							return {
								plauditLength: item.length,
								plauditName: item[0]
							};

						}),
			filtered = _.sortBy(sortedData, 'plauditLength'),
			mostRaised = filtered.reverse();


		return mostRaised;
	},
});

