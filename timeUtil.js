//计算时间的工具类
//1. 以当前时间距离过去某一时间点的Integer分钟值作为SortedSet中的score, 排序所需
//2. 在前端中, 再获取一次, 减去当时的score就是, 当时距离现在的时间长度, ***前

//assume begin with '10/31/2013 21:50:54', just a time point to compare, it makes no sense
var DEFAULT_BEGIN_TIME = '10/31/2013 21:50:54';
var msecPerMinute = 1000 * 60;    //计算score精确到minute

//显示***前也精确到分钟
var minutesPerHour = 60;
var minutesPerDay = minutesPerHour * 24;
var minutesPerWeek = minutesPerDay * 7;


var _getElapsedMinutesSince = function(begin){
	if(begin === undefined){
		begin = DEFAULT_BEGIN_TIME;
	}
	if(begin.constructor === String){
		var interval = new Date().getTime() - new Date(begin).getTime();
		var elapsedMinutes = Math.floor(interval / msecPerMinute);
		return elapsedMinutes;
	}else{
		return 0;
	}
}

//console.log(_getElapsedTime('10/30/2013 9:38:42'));

exports.getElapsedMinutesSince = _getElapsedMinutesSince;

//根据当前相距begin(计算score时用的时间参考点)的分钟数减去score, 即为计算score时距离当前的分钟
//|Begin->->->->->->->CalScore->->->->->->->ShowInFront|
//|<--------score-------->|<-----------???------------>|
//|       当时存入的Score |      在前端显示???前       |


var _getSinceDescription = function(score){
	var descri = '未知...';
	if(score !== undefined){
		var p =  _getElapsedMinutesSince() - parseInt(score, 10);
		if(p < minutesPerHour){
			descri = p + '分钟前...';
		}else if(p >= minutesPerHour && p < minutesPerDay){
			descri = Math.floor(p / minutesPerHour) + '小时前...';
		}else if(p >= minutesPerDay && p < minutesPerWeek){
			descri = Math.floor(p / minutesPerDay) + '天前...';
		}else {
			descri = Math.floor(p / minutesPerWeek) + '周前...';
		}
	}

	return descri;
};

console.log("现在距离'10/31/2013 21:50:54'的分钟数: %d", _getElapsedMinutesSince());
//console.log(_getSinceDescription(1000));
//console.log(_getSinceDescription());
