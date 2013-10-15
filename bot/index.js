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

var api = require('./../api');
/*
 *调用热门收藏接口，然后转发
 *重复时间：30~120分钟
 */
api.suggestionsFavoritesHot(function(body) {
	var id = body.id;
	api.statusesRepost(id, function(body) {
		console.log(body);
	});
});

/*
 *调用关注接口，对于那些关注了一段时间，但是没有粉回来的人，取消关注
 *重复时间：30~120分钟
 */

/*
 *调用关注接口，随机获取某个人，获取此人的粉丝，关注他
 *重复时间：30~120分钟
 */