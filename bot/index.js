var Weibo = require('./../api');

var bot = module.exports = {};

bot.name = "I'm a weibo bot!";
bot.tasks = [];

bot.init = function(token, uid) {
	this.accessToken = token;
	this.uid = uid;
	//显然应该在index处调用，access token和uid都是hidden dependency
	this.weibo = new Weibo(bot.accessToken, bot.uid);
	console.log('bot has been initiated, accessToken: ' + this.accessToken + ', uid: ' + this.uid);
	return this;
};

bot.start = function() {
	this.pushTasks([retweet, follow, cancelFollow]);
	this.run();
};

bot.run = function() {
	for (var i = this.tasks.length - 1; i >= 0; i--) {
		this.tasks[i].run();
		//console.log('task : [' + this.tasks[i].name + '] is on the go.');
	}
}

bot.pushTasks = function(tasks) {
	for (var i = tasks.length - 1; i >= 0; i--) {
		this.tasks.push(tasks[i]);
		console.log('task : [' + tasks[i].name + '] has been pushed to the bot');
	}
};

var Task = function Task(options) {
	this.name = options.name || 'default task';
	this.trigger = options.trigger || null;
	this.terminator = options.terminator || function() {
		return false;
	};
	this.repitation = options.repitation || 10000000000;
	this.fn = options.fn || function() {};
	this.option = options.option || null;
	this.next = options.next || null;
	this.interval = options.interval;
};

Task.prototype.run = function() {
	//console.log('runned');
	var self = this;
	var timeStamp = setInterval(function() {
		if (self.repitator()) {
			self.fn(self.option);
			self.repitation--;
			console.log('task runned:');
			console.log('name :' + self.name);
		} else {
			clearInterval(timeStamp);
			console.log('task: ' + self.name + ' ,重复次数已尽');
		}
	}, self.interval);
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

/*
 *调用热门收藏接口，然后转发
 *重复时间：30~120分钟
 */
var retweet = new Task({
	name: 'retweet',
	fn: function() {
		bot.weibo.suggestionsFavoritesHot(function(body) {
			var parsed = JSON.parse(body);
			var id = parsed[Math.floor(parsed.length * Math.random())].id;
			bot.weibo.statusesRepost(id, function(body) {
				console.log('该推荐微博已被转发' + body);
			});
		});
	},
	interval: 43 * 60 * 1000
});

/*
 *调用关注接口，粉丝数最少且没有关注我的人，取消关注
 *重复时间：30~120分钟
 */

//TODO：微博关注上限是2000人，所以越接近这个数字，这个程序的调用频率就越高

var cancelFollow = new Task({
	name: 'cancelFollow',
	fn: function() {
		bot.weibo.friendshipsFriends(function(body) {
			var friends = JSON.parse(body).users;
			//sort by fans numbers
			insertionSort(friends, "friends_count", function(sorted) {
				for (var i = 0, j = true; j && i <= sorted.length - 1; i++) {
					if (!sorted[i]['follow_me']) {
						j = !j;
						//remove watching
						bot.weibo.friendshipsDestroy(sorted[i].id, function(body) {
							console.log('已取消关注某人');
						});
					}
				}
			});
		});
	},
	interval: 35 * 60 * 1000
});

/*
 *随机关注一个优质粉丝的粉丝
 *重复时间：30~120分钟
 */

//TODO：微博关注上限是2000人，所以越接近这个数字，这个程序的调用频率就越低

var follow = new Task({
	name: 'follow',
	fn: function() {
		bot.weibo.friendshipsFollowersActive(function(body) {
			var activeFollowers = JSON.parse(body).users,
				random = Math.floor(activeFollowers.length * Math.random()),
				randomActiveFollower = activeFollowers[random];
			bot.weibo.friendshipsCreate(randomActiveFollower.id, function(body) {
				console.log('已经关注某人');
			});
		});
	},
	interval: 30 * 60 * 1000
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