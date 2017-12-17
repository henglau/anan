/*
 * author:未完滴待续
 * time: 2017-07-22
 * email:weiwandaixuGie@outlook.com
 * remark:核心代码将被压缩混淆，本代码所属权归 “ 未完滴待续 ” 所有
 */

var baseApp = {
	ns: function(n) {
		var parts = n.split("."),
			object = this,
			i, len;
		for(i = 0,
			len = parts.length; i < len; i++) {
			if(!object[parts[i]]) {
				object[parts[i]] = {}
			}
			object = object[parts[i]]
		}
		return object
	},
	request: {
		url: {
			get: {},
			post: {}
		},
		get: function(url, Callback) {
			$.get(url, function(data) {
				Callback(data);
			})
		},
		post: function(url, datas, Callback) {
			$.ajax({
				type: "post",
				url: url,
				data: datas,
				async: true,
				success: function(data) {
					Callback(data);
				}
			});
		}
	},
	page: {
		roundurl: function(url) {
			try {
				var u = url.split("?");
				if(u != null && u.length == 2) {
					return url + "&r=" + Math.random();
				} else {
					return url + "?r=" + Math.random();
				}
			} catch(e) {
				return url;
			}
		},
		querystring: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if(r != null) {
				return unescape(r[2]);
			}
			return null;
		},
		trim: function(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		authenticationServerInfo: function() {
			return {
				name: "admin",
				pwd: "admin12345+"
			}
		}
	},
	storage: {
		local: {
			get: function(key) {
				return localStorage.getItem(key);
			},
			set: function(key, value) {
				localStorage.setItem(key, value);
			}
		},
		session: {
			get: function(key) {
				return sessionStorage.getItem(key);
			},
			set: function(key, value) {
				sessionStorage.setItem(key, value);
			}
		}
	}
};

// 写入 缓存
var uname = baseApp.storage.local.get("uname");
var upwd = baseApp.storage.local.get("upwd");
if( uname== null ||  upwd== null || uname=="" || upwd=="") {
	baseApp.storage.local.set("uname", "admin"); // 存入新的用户名
	baseApp.storage.local.set("upwd", "1234567"); // 存入新的密码
}