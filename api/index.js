var request = require('request');

var weiboApiUrl = 'https://api.weibo.com/2/';

var weibo = {};

function Weibo(accessToken, uid) {
	this.accessToken = accessToken;
	this.uid = uid;
}
var appKey = "1878841322";



/**TODO 所有的api请求都应像类似经过express middleware的东西，在发送之前
 * 1、添加accessToken
 * 2、验证accessToken
 */
Weibo.prototype.accessTokenMiddleware = function(preRequestObject) {
	preRequestObject.qs = preRequestObject.qs || {};
	preRequestObject.qs["access_token"] = this.accessToken;
	//console.dir(preRequestObject.qs);
	return preRequestObject;
}

//get UID
Weibo.prototype.accountGetUid = function() {
	var self = this;
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'account/get_uid' + '.json'
		}),
		function(error, response, body) {
			self.uid = JSON.parse(body).uid;
		})
};

//===========关系接口============

//根据uid关注用户
Weibo.prototype.friendshipsCreate = function(uid) {
	request(this.accessTokenMiddleware({
			method: 'POST',
			uri: weiboApiUrl + 'friendships/create' + '.json',
			form: {
				uid: uid
			}
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//取消关注一个用户
Weibo.prototype.friendshipsDestroy = function(uid) {
	request(this.accessTokenMiddleware({
			method: 'POST',
			uri: weiboApiUrl + 'friendships/destroy' + '.json',
			form: {
				uid: uid
			}
		}),
		function(error, response, body) {
			console.log(body);
		});
};

//获取用户的关注列表
Weibo.prototype.friendshipsFriends = function(next) {
	var self = this;
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'friendships/friends' + '.json',
			qs: {
				uid: self.uid
			}
		}),
		function(error, response, body) {
			next(body);
		});
};

//获取用户关注对象UID列表
Weibo.prototype.friendshipsFriendsIds = function(next) {
	var self = this;
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'friendships/friends/ids' + '.json',
			qs: {
				uid: self.uid
			}
		}),
		function(error, response, body) {
			next(body);
		});
};


//获取用户粉丝的用户UID列表
Weibo.prototype.friendshipsFollowersIds = function(next) {
	var self = this;
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'friendships/followers/ids' + '.json',
			qs: {
				uid: self.uid
			}
		}),
		function(error, response, body) {
			next(body);
		});
};

//获取用户的活跃粉丝列表 - 返回默认的20条记录
Weibo.prototype.friendshipsFollowersActive = function(uid) {
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'friendships/followers/active' + '.json',
			qs: {
				uid: uid
			}
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//===========微博接口============

//转发一条微博
Weibo.prototype.statusesRepost = function(id, next) {
	console.log(id);
	request(this.accessTokenMiddleware({
			method: 'POST',
			url: weiboApiUrl + 'statuses/repost' + '.json',
			form: {
				id: id
			}
		}),
		function(error, response, body) {
			next(body);
		})
};

//一周热门
Weibo.prototype.trendsWeekly = function() {
	console.log(this.accessToken);
	request(this.accessTokenMiddleware({
			method: 'GET',
			url: weiboApiUrl + 'trends/weekly' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//一日热门
Weibo.prototype.trendsDaily = function() {
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'trends/daily' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//每时热门
Weibo.prototype.trendsHourly = function() {
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'trends/hourly' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//返回系统推荐的热门收藏 - 只返回一条记录，为了bot的方便运行
Weibo.prototype.suggestionsFavoritesHot = function(next) {
	request(this.accessTokenMiddleware({
			method: 'GET',
			uri: weiboApiUrl + 'suggestions/favorites/hot' + '.json',
			qs: {
				count: 1
			}
		}),
		function(error, response, body) {
			next(body);
		})
};


module.exports = Weibo;