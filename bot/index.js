var wbot = {};

wbot.name = "I'm a weibo bot!";

var Task = function Task(name, trigger, termination, repitation, fn, option, next) {
	this.name = name;
	this.trigger = trigger;
	this.termination = termination;
	this.repitation = repitation;
	this.fn = fn;
	this.option = option;
	this.next = next;
};

Task.prototype.run = function() {
	while (!this.termination && this.repitation > 0) {
		this.fn(this.option);
		this.repitation--;
	}
}

wbot.tasks = [];

wbot.pushTask = function(task) {
	if (typeof task === Task) {
		this.tasks.push(task);
	}
}

var Weibo = require('./../api');
//显然应该在index处调用，access token和uid都是hidden dependency
var weibo = new Weibo('a', 123);

/*
 *调用热门收藏接口，然后转发
 *重复时间：30~120分钟
 */
weibo.suggestionsFavoritesHot(function(body) {
	var id = body.id;
	weibo.statusesRepost(id, function(body) {
		console.log(body);
	});
});

/*
 *调用关注接口，粉丝数最少且没有关注我的人，取消关注
 *重复时间：30~120分钟
 */

//TODO：微博关注上限是2000人，所以越接近这个数字，这个程序的调用频率就越高

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

/*
 *随机关注一个优质粉丝的粉丝
 *重复时间：30~120分钟
 */

//TODO：微博关注上限是2000人，所以越接近这个数字，这个程序的调用频率就越低
weibo.friendshipsFollowersActive(function(body) {
	var activeFollowers = JSON.parse(body).users,
		random = Math.floor(activeFollowers.length * Math.random()),
		randomActiveFollower = activeFollowers[random];
	weibo.friendshipsCreate(randomActiveFollower.id);
});