var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
var header = {
	    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0',
	    'Cookie': 'SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5D29h5RE0l-0OhEUYHSoVI5JpX5KMt; SINAGLOBAL=5162854212611.284.1427970947089; ULV=1437205098610:106:27:13:9737097589715.115.1437205098588:1437135508258; SUHB=08J7ZGI0A8IHHj; UOR=,,login.sina.com.cn; __gads=ID=6419d4675ae35070:T=1433940064:S=ALNI_MbZuTKIJ4qh231j2Re3KTR9xn5N9w; wvr=6; SUS=SID-2971571717-1437205252-JA-4eay9-abdaf59de191c276b37aa03075034955; SUE=es%3Dd3ae38cbbdfddba63a348563e22f08b2%26ev%3Dv1%26es2%3Dfe5a81751169ac2b6b1b4c2e46ac2dd1%26rs0%3DgdG5fyqRdm0FgbI1%252FSb2yOicla4J19ygQomP3vyMj7zyTO573WPTa94tJjWpQULqC8thYe8gEcYXa%252FWxfLJEcwyg%252BM7uo8YLCE%252Fq4fXZPNfbUiAsf1kBfOZYC%252F9Fb2zoz12QHPm7nQ3VnEgFmSai4W1ultPShs%252F1eMD0bAuTPw8%253D%26rv%3D0; SUP=cv%3D1%26bt%3D1437205252%26et%3D1437291652%26d%3Dc909%26i%3D4955%26us%3D1%26vf%3D0%26vt%3D0%26ac%3D2%26st%3D0%26uid%3D2971571717%26name%3D18322694269m0%2540sina.cn%26nick%3D%25E9%2581%2593%25E8%25A1%258D%26fmp%3D%26lcp%3D2012-12-09%252017%253A28%253A55; SUB=_2A254rnNUDeTxGeRH7FMU9y_LyjuIHXVb2uOcrDV8PUNbvtAMLU7EkW8MKnRRUJgFFGnSg-NNDpMzUJTWzg..; ALF=1468741251; SSOLoginState=1437205252; _s_tentry=login.sina.com.cn; Apache=9737097589715.115.1437205098588',
	    'Connection': 'keep-alive'
  		}

/**
* getInfoById 请求对象，
* @param {string}    id
* @param {function}  cb
*/									
	// cb 对象的信息 info  {obj} 
	//微博的数量  weiboCount     {number}
	// 关注的地址  followUrl      {string}
	// 关注的数量  followCount 	{number}
	// 粉丝的地址  followerUrl	{string}
	// 粉丝的数量  followerCount	{number}

var getInfoById=function(id,cb){
	request({
		url:id,
		headers:header
	},function(err,res,body){
		if(err){
			cb(err);
		}else{
			var info={};
			var $=cheerio.load(body);
			//var followUrl=$(($(".tip2 a"))[0]).attr("href");
			info.weiboCount=parseInt(($(".tip2 .tc"))[0].children[0].data.match(/[0-9]+/)[0]);
			info.followUrl="http://www.weibo.cn"+($(".tip2 a"))[0].attribs.href;
			info.followCount=parseInt(($(".tip2 a"))[0].children[0].data.match(/[0-9]+/)[0]);
			info.followerUrl="http://www.weibo.cn"+($(".tip2 a"))[1].attribs.href;
			info.followerCount=parseInt(($(".tip2 a"))[1].children[0].data.match(/[0-9]+/)[0]);
			cb(null,info);
		}
	});
}
// getInfoById("http://www.weibo.cn/1197755162",function(info){
// 	console.log(info);
// 	//console.log(followUrl,followCount,followerUrl,followerCount);
// })

/**
* getFollowPerson 获取所有关注者，
* @param {string}    url
* @param {function}  cb
*/
 // cb 	关注者的数组  followArray    {array}
	// 	array中存放对象 followObj
	// 	关注者的昵称  followName     {string}
	// 	关注者的ID    followId 	  {string}
	// 	关注者的头像地址 followPhoto {string}
var getFollowPageUrl=function(followUrl,cb){
	request({
		url:followUrl,
		headers:header
	},function(err,res,body){
		if(err){
			cb(err);
		}else{
			var followPageArray=[];//每个页面的url
			var $=cheerio.load(body);
			var followCount=parseInt($(".tip2 .tc")[0].children[0].data.match(/[0-9]+/)[0]);
			var pageAll=followCount/10+1;
			pageAll=(pageAll>20?20:pageAll);//微博限制访问
			count=pageAll;
			for(num=1,i=1;i<=pageAll;i++){
				followPageArray.push(followUrl+"?page="+(num++));
			}
			cb(followPageArray);
		}
	});
}

var followArray=[];//关注人物对象

var getFollowPersonByPageUrl=function(followUrl,cb){
	request({
		url:followUrl,
		headers:header
	},function(err,res,body){
		var $=cheerio.load(body);
		$("table tr").each(function(index,el){
			followArray.push({
				followName  : this.children[1].children[0].children[0].data,
				followId    : this.children[0].children[0].attribs.href,
				followPhoto : this.children[0].children[0].children[0].attribs.src
			});
		});
		cb(null);
	});
}

var getAllFollowPerson=function(followUrl,cb){
	getFollowPageUrl(followUrl,function(followPageArray){
		async.mapLimit(followPageArray, 3, function (url, cb) {//控制吧并发量
			console.log("正在爬"+url);
		  getFollowPersonByPageUrl(url, cb);  //由cb第二个参数决定result数组中的内容
		}, function (err, result) {
			if(err){
				cb(err);
			}else{
				cb(null);
				console.log('final:');
				console.log(followArray);
				console.log(followArray.length);
			}
		  
		});
	})
}

getAllFollowPerson("http://weibo.cn/1197755162/follow",function(err){
	if(err){
		conso.log(err);
	}else{
		console.log("sucess");
	}
});
