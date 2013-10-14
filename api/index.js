var request = require('request');

var weiboApiUrl = 'https://api.weibo.com/2/';

var weibo = {};

/**TODO 所有的api请求都应像类似经过express middleware的东西，在发送之前
 * 1、添加accessToken
 * 2、验证accessToken
 */
//增加了accessToken，但是是用手工的方式，能不能自动点呢。。。

function accessTokenMiddleware(preRequestObject) {
	preRequestObject.qs.accessToken = accessToken;
	return preRequestObject;
}

//get UID
weibo.accountGetUid = function() {
	request(accessTokenMiddleware({
			method: 'GET'
			uri: weiboApiUrl + 'account/get_uid' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//根据uid关注用户
weibo.friendshipsCreate = function(uid) {
	request(accessTokenMiddleware({
			method: 'POST'
			uri: weiboApiUrl + 'friendships/create' + '.json',
			qs: {
				uid: uid
			}
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//取消关注一个用户
weibo.friendshipsDestroy = function(uid) {
	request(accessTokenMiddleware({
			method: 'POST'
			uri: weiboApiUrl + 'friendships/destroy' + '.json',
			qs: {
				uid: uid
			}
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//获取用户的活跃粉丝列表 - 返回默认的20条记录
weibo.friendshipsFollowersActive = function(uid) {
	request(accessTokenMiddleware({
			method: 'GET'
			uri: weiboApiUrl + 'friendships/followers/active' + '.json',
			qs: {
				uid: uid
			}
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//转发一条微博
weibo.statusesRepost = function(id) {
	request(accessTokenMiddleware({
			method: 'POST'
			uri: weiboApiUrl + 'statuses/repost' + '.json',
			qs: {
				id: id
			}
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//一周热门
weibo.trendsWeekly = function() {
	request(accessTokenMiddleware({
			method: 'GET'
			uri: weiboApiUrl + 'trends/weekly' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//一日热门
weibo.trendsDaily = function() {
	request(accessTokenMiddleware({
			method: 'GET'
			uri: weiboApiUrl + 'trends/daily' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//每时热门
weibo.trendsHourly = function() {
	request(accessTokenMiddleware({
			method: 'GET'
			uri: weiboApiUrl + 'trends/hourly' + '.json'
		}),
		function(error, response, body) {
			console.log(body);
		})
};

//返回系统推荐的热门收藏 - 只返回一条记录，为了bot的方便运行
weibo.suggestionsFavoritesHot = function() {
	request(accessTokenMiddleware({
			method: 'GET'
			uri: weiboApiUrl + 'suggestions/favorites/hot' + '.json',
			count: 1
		}),
		function(error, response, body) {
			console.log(body);
		})
};




module.exports = weibo;