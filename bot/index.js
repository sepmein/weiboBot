var wbot = {};

wbot.name = "I'm a weibo bot!";

var Task = function Task(name, trigger, termination, repitation, fn, option, next) {
	this.name = name;
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
var weibo = new Weibo('a',123);
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
 *调用关注接口，粉丝数最少的没有关注我的人，取消关注
 *重复时间：30~120分钟
 */
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

weibo.friendshipsFriends(function(body){
	
});

/*
 *调用关注接口，随机获取某个人，获取此人的粉丝，关注他
 *重复时间：30~120分钟
 */