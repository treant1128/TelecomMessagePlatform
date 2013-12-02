//////////////////////////////////
var msecPerMinute = 1000 * 60;    //计算score精确到minute
var minutesPerHour = 60;
var minutesPerDay = minutesPerHour * 24;
var minutesPerWeek = minutesPerDay * 7;
var minutesPerHour = 60;
var DEFAULT_BEGIN_TIME = '10/31/2013 21:50:54';   //全局的公元时间起点, 必须和timeUtil.js一致
//计算score的方法   当前距离begin过去多少分钟?   copy的timeUtil.js的, 没有找到js调用js文件的方法
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
};	
///////////////////////////////////

var myApp = angular.module('zjdx_msg', ['toggle-switch'])
.filter('extractContent', function(){
	return function(msgContent){
		var extract = msgContent.toString();
		if(extract.length > 10){
			extract =  extract.substr(0, 10) + '...';
		}
		
		return extract;
	}
})
.filter('elapsedSoFarFilter', function(){
	return function(score){   	//传入的score也是当时用_getElapsedMinutesSince算出来的
		var descri = '未知...';
		if(score !== undefined){
			var p =  _getElapsedMinutesSince() - parseInt(score, 10);

			if(p < 0){
				descri = '刚才...';
			}else if(p >= 0 && p < minutesPerHour){
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
}).filter('isReadedFilter', function(){
	return function(isReaded){
		return isReaded ? '已读' : '未读';
	}
}).filter('composeIdByContent', function(){
	//Simple Hash just for identify
	return function(str){
		var hash = 0;
    		for (i = 0; i < str.length; i++) {
			char = str.charCodeAt(i);
			hash += char;
		}
		return hash;
	}
});

function TasksController($scope, $http) {
	var ITEMS_PER_PAGE= 3;
	var indiviTotalPages = undefined;  //Three Types
	var indiviCurrPage = undefined;  
	var cache = undefined;

	var phoneNumber = $('#phone').text();
//		alert($('#phone').html());
//		alert($('#phone').text());
	phoneNumber = phoneNumber.substring(phoneNumber.indexOf('<') + 1, phoneNumber.indexOf('>')).trim();
	phoneNumber = (phoneNumber == ''? '获取不到...' : phoneNumber);

	console.log(phoneNumber);
	$scope.whenToHide = true;
	console.log($scope.whenToHide);
//===============================================================================================
	initGlobalVariables();

	function initGlobalVariables(){
		indiviTotalPages = new Object();
		indiviCurrPage = new Object();
		$scope.tasks = new Array();
		cache = new Object();
	};
	console.log('--------------TasksControllerWorks-------------');
	
	//获取该用户的所有A.B.N信息 只包含MsgCode不包含MsgContent  only for show numbers
	initItemsNumber(0, -1, function(data){       			//默认0 -> -1 加载全部
		if(data !=null && data.constructor === Object){

        	for(var p in data){  					//forEach Object
			indiviTotalPages[p] = Math.ceil(data[p].length / ITEMS_PER_PAGE);
			indiviCurrPage[p] = 1;                                  //default start from 1st page

	        	$scope[p] = data[p]; 					//define $scope.A / $scope.B / $scope.N
        		$scope[p + 'msgCodes'] = new Array(data[p].length);
        		$scope[p + 'unreadedCount']  = 0;
			for(var q in data[p]){ 				//forEach Array			
				$scope[p + 'msgCodes'][q] = data[p][q].msgCode;  	//define $scope.AmsgCodes / $scope.BmsgCodes / $scope.NmsgCodes
				if(!data[p][q].isReaded){
					$scope[p + 'unreadedCount']++;
				}
			}	
		}

		console.log(indiviTotalPages);
		console.log(indiviCurrPage);
		console.log($scope.A);
		console.log($scope.AmsgCodes);
		console.log($scope.B);
		console.log($scope.BmsgCodes);
		console.log($scope.N);
		console.log($scope.NmsgCodes);
		//初始化与页面双绑的变量
	      	$scope.currentMenu = 'A';	//初始化完成后默认加载Activity的第一页
		$scope.totalPages = indiviTotalPages[$scope.currentMenu];
	      	$scope.currentPage = 1;

		loadPageByParams($scope.currentMenu, ($scope.currentPage - 1) * ITEMS_PER_PAGE, 
				$scope.currentPage * ITEMS_PER_PAGE, handleCache);
		}
	});
	
	function handleCache(menu, start, end, msgContents){
		if(msgContents.constructor === Array){
			console.log(indiviCurrPage);
			console.log(cache);
			
			//把返回的msgContent 再加上thumbnail, 并入对象属性, 至此生成具有msgCode, score, isReaded, msgContent, thumbnail的前端能用的"真正对象"
			//Redis的SortedSet中原生只保存了msgCode和score两种属性  Hash中保存了msgCode和msgContent
			$scope.tasks = null;
			$scope.tasks = $scope[menu].slice(start, end);
	
			for(var i=0; i<$scope.tasks.length; i++){
				$scope.tasks[i].msgContent = msgContents[i];
				$scope.tasks[i].打丁狗 = '巨魔';
				$scope.tasks[i].thumbnail = menu;
			}
				
		console.log($scope.tasks);
	
			cache[menu + '_' + start + '_' + end] = msgContents;//Cache Cache 减少请求次数  为了接口统一 只保存msgContent
			console.log(cache);
		}
	};

	function loadPageByParams(menu, start, end, callback){
		console.log('$scope.' + menu + ' length => ' + $scope[menu].length);
		end = end > $scope[menu].length ? $scope[menu].length : end;
		console.log(menu + '-' + start + '-' +end);
		if((menu === 'A' || menu === 'B' || menu === 'N') && start < end 
				//&& end <= $scope[menu].length
				){
			if(cache[menu + '_' + start + '_' + end]){
				console.log('^^^^^^^^^^^^^^^^^^^^Cache Hits^^^^^^^^^^^^^^^^');	
				callback(menu, start, end, cache[menu + '_' + start + '_' + end]);
			}else{
				var queryMsgCodes = $scope[menu + 'msgCodes'].slice(start, end);
				console.log('----截取的数组');
				console.log(queryMsgCodes);

				$http({
					url    : '/zjdx/getMsgContent',
					method : 'POST',
					data   : {'msgCodes' : queryMsgCodes}
				})
		 		.success(function(data){
					callback(menu, start, end, data);
				})
				.error(function(err){
					callback(err);		
				});
			}
		}
	}

	//start 和 end根据决定Redis的获取个数 默认 0 ～ -1选择全部
	function initItemsNumber(start, end, callback){
	        $http({
	        	url    : '/zjdx/init',
	          	method : 'post',
	        	data   : {'phoneNumber' : phoneNumber, 'start' : start, 'end' : end}
	        })
	        .success(function(data){
	        	console.log(data);
			sessionStorage['msg'] = JSON.stringify(data);
			callback(data);
	        })
	        .error(function(data){
	        	alert(data);
	        });
	};

//点击消息Toggle内容
$scope.clickItem = function(msgContent){
	var ps = $(".column .liBody p");
	var task = null;
	for(index in $scope.tasks){
		task = $scope.tasks[index];
		console.log(task.isReaded);
		if(msgContent === task.msgContent && !task.isReaded){
			task.isReaded = true;    //右上角的按钮状态马上变为已读
			$scope.tasks[index] = task;
			asyncServerIsReaded(phoneNumber, task.score, task.msgCode, $scope.currentMenu);
			task = null;
		}
	}

	for(var i=0; i<ps.length; i++){
		if(msgContent === ps.get(i).innerText){
//			$(ps.get(i)).hide('slow', function(){alert("hide Complete");});
			$(ps.get(i)).slideToggle("solw");
		}else{
			$(ps.get(i)).slideUp('slow');
		}
	}
};

//向服务器请求 变未读为已读， 用户有可能在请求返回前切换menu， 必须传入点击时的$scope.currentMenu，而不能以请求返回时的$scope.currentMenu作为基准
function asyncServerIsReaded(phoneNumber, score, msgCode, menu){
//	alert('修改未读为已读' + phoneNumber + '--' + score + '--' + msgCode);
	$http({
		url  	:  '/zjdx/markReaded',
		method 	:  'POST',
		data   	:  {'phoneNumber' : phoneNumber, 'score' : score, 'msgCode' : msgCode}
	})
	.success(function(data){
		console.log(data);
		console.log('成功返回值为：' + data);
		$scope[menu + 'unreadedCount']--;  //左边menu的unreadedCount数量等请求正确返回后再更新
	})
	.error(function(data){
	
	});
};

//通过改变menu更新$scope.tasks   不要一次在服务端返回全部的细节    在Client去Ajax请求
$scope.loadMenu = function(menu){
	//alert(menu);
	//$('a[data-toggle="pill"]').on('show.bs.tab', function (e) {
	//	         e.target // activated tab
	//	         console.log("before  之前");
	//         console.log('即将激活的tab: '+e.target.innerHTML);
	//	          e.relatedTarget // previous tab
	//	         console.log('先前的tab: '+e.relatedTarget.innerHTML);
	//});

	if(menu !=null && menu != $scope.currentMenu){
		$scope.currenteMenu = menu;
		load(menu);
	}
};

function load(menu){
	if(menu === 'A' || menu === 'B' || menu === 'N'){
		//sync scope variables
		$scope.currentMenu = menu;
		$scope.currentPage = indiviCurrPage[menu];
		$scope.totalPages = indiviTotalPages[menu];

		loadPageByParams($scope.currentMenu, ($scope.currentPage - 1) * ITEMS_PER_PAGE, $scope.currentPage * ITEMS_PER_PAGE, handleCache);	
	}
};


//换页操作
$scope.changePage = function(step){
//	alert('换页 ' + step);
	var temp = $scope.currentPage +  parseInt(step, 10);  //calculate temp for check boundary

	if(temp < 1){
		alert('当前已是第一页!');
		temp = null;
		return;
	}else if(temp > $scope.totalPages){
	 	alert('当前已是最后一页!');
		temp = null;
		return;
	}	
	
	$scope.currentPage = temp;
	temp = null;

	loadPageByParams($scope.currentMenu, ($scope.currentPage - 1) * ITEMS_PER_PAGE, $scope.currentPage * ITEMS_PER_PAGE, function(menu, start, end, msgContents){
		handleCache(menu, start, end, msgContents);
//	        console.log(msgContents);
		indiviCurrPage[$scope.currentMenu] = $scope.currentPage;  //refresh indiviCurrPage
		console.log(indiviCurrPage);
	});
};
}

