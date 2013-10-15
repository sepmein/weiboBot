var bot = module.exports = {};

bot.name = "I'm a weibo bot!";
bot.tasks = [];

bot.init = function(token, uid) {
	this.accessToken = token;
	this.uid = uid;
	return this;
};

bot.start = function() {
	this.pushTasks([retweet, cancelFollow, follow]);
	this.run();
};

bot.run = function() {
	for (var i = this.tasks.length - 1; i >= 0; i--) {
		this.tasks[i].run();
	}
}

bot.pushTasks = function(tasks) {
	for (var i = tasks.length - 1; i >= 0; i--) {
		this.tasks.push(tasks[i]);
	}
};

var Task = function Task(options) {
	this.name = options.name || 'default task';
	this.trigger = options.trigger || null;
	this.terminator = options.terminator || function() {
		return false;
	};
	this.repitation = options.repitation || true;
	this.fn = options.fn || function() {};
	this.option = options.option || null;
	this.next = options.next || null;
	this.interval = options.interval;
};

Task.prototype.run = function() {
	var timeStamp = setInterval(function() {
		if (!this.terminator() && this.repitator()) {
			this.fn(this.option);
			this.repitation--;
		} else {
			clearInterval(timeStamp);
		}
	}, this.interval);
};

Task.prototype.repitator = function() {
	if (typeof this.repitation === 'boolean') {
		if (this.repitation) {
			return 9999999999999999;
		} else {
			return 0;
		}
	} else {
		return this.repitation;
	}
}


var Weibo = require('./../api');
//显然应该在index处调用，access token和uid都是hidden dependency
var weibo = new Weibo(bot.accessToken, bot.uid);

/*
 *调用热门收藏接口，然后转发
 *重复时间：30~120分钟
 */
var retweet = new Task({
	name: 'retweet',
	fn: function() {
		weibo.suggestionsFavoritesHot(function(body) {
			var id = body.id;
			weibo.statusesRepost(id, function(body) {
				console.log(body);
			});
		});
	},
	interval: 15 * 60 * 1000
});

/*
 *调用关注接口，粉丝数最少且没有关注我的人，取消关注
 *重复时间：30~120分钟
 */

//TODO：微博关注上限是2000人，所以越接近这个数字，这个程序的调用频率就越高

var cancelFollow = new Task({
	name: 'cancelFollow',
	fn: function() {
		weibo.friendshipsFriends(function(body) {
			var friends = JSON.parse(body).users;
			//sort by fans numbers
			insertionSort(friends, "friends_count", function(sorted) {
				for (var i = 0, j = false; j || i <= sorted.length - 1; i++) {
					if (!sorted[i]['follow_me']) {
						j = !j;
						//remove watching
						weibo.friendshipsDestroy(sorted[i].id);
					}
				}
			});
		});
	},
	interval: 2 * 60 * 1000
});

/*
 *随机关注一个优质粉丝的粉丝
 *重复时间：30~120分钟
 */

//TODO：微博关注上限是2000人，所以越接近这个数字，这个程序的调用频率就越低

var follow = new Task({
	name: 'follow',
	fn: function() {
		weibo.friendshipsFollowersActive(function(body) {
			var activeFollowers = JSON.parse(body).users,
				random = Math.floor(activeFollowers.length * Math.random()),
				randomActiveFollower = activeFollowers[random];
			weibo.friendshipsCreate(randomActiveFollower.id);
		});
	},
	interval: 2 * 60 * 1000
});


function insertionSort(A, field, cb) {
	for (var j = 1; j < A.length; j++) {
		var key = A[j],
			b = A[j][field];
		//Insert A[j] into the sorted sequence A[1..j-1].
		var i = j - 1;
		while (i >= 0 && A[i][field] > b) {
			A[i + 1] = A[i];
			i--;
		}
		A[i + 1] = key;
	}
	cb(A);
}