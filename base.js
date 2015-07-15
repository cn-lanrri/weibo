var request = require('request');
var cheerio = require('cheerio');
var header = {
	    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0',
	    'Cookie': 'SUHB=0V5laU8STAKU1T; _T_WM=d39e1f2168df5f915b7d87bd521db7f5; SUB=_2A254og7wDeTxGeRH7FMU9y_LyjuIHXVYbJK4rDV6PUJbvNBeLWHBkW1BSElYQJ6-VrX3uVh_ZSLZ6p8S-g..; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5D29h5RE0l-0OhEUYHSoVI5JpX5K-t; SSOLoginState=1436974752',
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
		var info={};
		var $=cheerio.load(body);
		//var followUrl=$(($(".tip2 a"))[0]).attr("href");
		info.weiboCount=parseInt(($(".tip2 .tc"))[0].children[0].data.match(/[0-9]+/)[0]);
		info.followUrl="http://www.weibo.cn"+($(".tip2 a"))[0].attribs.href;
		info.followCount=parseInt(($(".tip2 a"))[0].children[0].data.match(/[0-9]+/)[0]);
		info.followerUrl="http://www.weibo.cn"+($(".tip2 a"))[1].attribs.href;
		info.followerCount=parseInt(($(".tip2 a"))[1].children[0].data.match(/[0-9]+/)[0]);
		cb(info);
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

var getAllFollowPerson=function(followUrl,cb){
	var followArray=[];
	request({
		url:followUrl,
		headers:header
	},function(err,res,body){
		var $=cheerio.load(body);
		var followCount=parseInt($(".tip2 .tc")[0].children[0].data.match(/[0-9]+/)[0]);
		var pageAll=followCount/10+1;
		pageAll=(pageAll>20?20:pageAll);
		
		for(num=1,i=1;i<=pageAll;i++){
			setTimeout(function () {
                            getFollowPerson(followUrl+"?page="+(num++),followArray);
                        }, parseInt(Math.random() * 100*followCount));
			//getFollowPerson(followUrl+"?page="+i,followArray);
		}
		console.log(followCount,pageAll);
		setTimeout(function(){
			cb(followArray);	
		},100*followCount);
		
	});
}

var getFollowPerson=function(followUrl,followArray){
	console.log(followUrl);
	request({
		url:followUrl,
		headers:header
	},function(err,res,body){
		var $=cheerio.load(body);
		$("table tr").each(function(index,el){
			// var fowllowName=this.children[1].children[0].children[0].data;
			// console.log(this.children[0].children[0].children[0].attribs.src);
			// var followId=this.children[0].children[0].attribs.href;
			// var followPhoto=this.children[0];
			followArray.push({
				followName  : this.children[1].children[0].children[0].data,
				followId    : this.children[0].children[0].attribs.href,
				followPhoto : this.children[0].children[0].children[0].attribs.src
			});
		});
		//console.log(followArray);
	});
}
getAllFollowPerson("http://weibo.cn/1197755162/follow",function(data){
	console.log(data);
})
// var requestFollow=function(url,cb){
// 	request({
// 		url:url,
// 		headers:header
// 	},function(err,res,body){
// 		var $=cheerio.load(body);

// 	});
// }
// var options = {
//   url: 'http://www.weibo.cn',
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0',
//     'Cookie': 'SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5D29h5RE0l-0OhEUYHSoVI5JpX5KMt; SINAGLOBAL=5162854212611.284.1427970947089; ULV=1436873268663:99:20:6:5522503881641.888.1436873268657:1436829024291; SUHB=0xnC0YJDxlYjb9; UOR=,,www.liaoxuefeng.com; __gads=ID=6419d4675ae35070:T=1433940064:S=ALNI_MbZuTKIJ4qh231j2Re3KTR9xn5N9w; wvr=6; ALF=1468409403; SUS=SID-2971571717-1436873404-JA-p1hmf-44990a08e53cd326731eaf3f4f024955; SUE=es%3D728a8c5249af0acd8a1d72915c825d79%26ev%3Dv1%26es2%3D276563e66535b7855bf9678f3c8e77ad%26rs0%3DAmP09KKFNVyscva7Jnqx3qeoaKx9T9%252FfqyNZ6JCEFldGv9bHY%252FWOqv%252F6SAgV%252Fq79Bs4rog3%252BTsM%252BKWrGY%252FtKxEwBo4mvtPlyTjjz7yOcJPv10nDHiiVlEVoANG5mr6xiZo5tqUpqvdyYgf7PJdy0nVDfNt2IQLvuqFCALxTZrMM%253D%26rv%3D0; SUP=cv%3D1%26bt%3D1436873404%26et%3D1436959804%26d%3Dc909%26i%3D4955%26us%3D1%26vf%3D0%26vt%3D0%26ac%3D2%26st%3D0%26uid%3D2971571717%26name%3D18322694269m0%2540sina.cn%26nick%3D%25E9%2581%2593%25E8%25A1%258D%26fmp%3D%26lcp%3D2012-12-09%252017%253A28%253A55; SUB=_2A254oILsDeTxGeRH7FMU9y_LyjuIHXVb1_MkrDV8PUNbvtAMLUT4kW9Og1lDe1iBspmp6QpDK3tZvT5APA..; SSOLoginState=1436873404; _s_tentry=login.sina.com.cn; Apache=5522503881641.888.1436873268657',
//     'Connection': 'keep-alive'
//   }
// };
// //.W_person_info .nameBox .name
// function callback(error, response, body) {
//   if (!error && response.statusCode == 200) {
//   	//console.log(body);
//   	var $ = cheerio.load(body);
//   	var data=$(".ut").html();
//   	console.log(data);
//   	var name=data.substring(0,data.search('<'));
//   	console.log(name);
//   }
// }

// request(options, callback);