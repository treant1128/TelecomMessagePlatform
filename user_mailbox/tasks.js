//////////////////////////////////
var types = {
	'1'	:	'天翼100元包2G手机上网流量',
	'2' 	:	'天翼10元包60M手机上网流量',
	'3' 	:	'天翼20元包150M手机上网流量',
	'4' 	:	'天翼30元包300M手机上网流量',
	'5' 	:	'天翼50元包800M手机上网流量',
	'6' 	:	'天翼5元包30M手机上网流量',
	'7' 	:	'天翼200元包5G手机上网流量',
	'8' 	:	'5元25M一次性流量包',
	'9' 	:	'3元15M一次性流量包',
	'10'	:	'10元50M一次性流量包',
	'11'	:	'20元120M一次性流量包',
	'12'	:	'100M免费流量包',
	'14'	:	'50M免费流量包',
	'15'	:	'300M免费流量包',
	'16'	:	'10元包1G省内夜间流量包',
	'17'	:	'20元包3G省内夜间流量包',
	'18'	:	'150M国内免费促销流量包_ZJ 20元夏季清凉包',
	'19'	:	'300M国内免费促销流量包_ZJ 30元夏季清凉包',
	'20'	:	'800M国内免费促销流量包_ZJ 50元夏季清凉包',
	'21'	:	'省内一次性流量包5元300M',
	'22'	:	'一次性流量包10元800M'
};

var formatTime = function(t){  //CREATE_TIME: '20130917215458'->'2013-09-17 21:54:58'
	return  t.substr(0, 4) + '-' + t.substr(4, 2) + '-' + t.substr(6, 2) + ' ' +
		t.substr(8, 2) + ':' + t.substr(10, 2) + ':' + t.substr(12, 2);
};
var replaceFrom = function(from){
    if(_.isString(from)){
        return from.replace(/189_ToolBar_V1/, '微视窗')
                    .replace(/189_ToolBar_V2/, '微视窗')
                    .replace(/189_android/, '微视窗客户端')
                    .replace(/189_toolbar/, '微视窗')
                    .replace(/3g_JFFS/, '积分反刷')
                    .replace(/ailixin/, '微视窗')
                    .replace(/order_toolbar/, '微视窗')
                    .replace(/tencent/, '腾讯管家')
                    .replace(/wsc/, '活动页面');
    }    
    return "未知";
};
/////////////////////////////////
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
	return  function(content){
			content = content.toString();
		  	if(content.indexOf('|-_-|') === content.lastIndexOf('|-_-|')){
				return content.split('*!-_-!*')[0];   //back_admin中的flag是: *!-_-!*
			}else{
				content = content.split('|-_-|');
//				return '来自' + content[12]+ '的温馨提示（' + formatTime(content[9]) + '）...';
				return replaceFrom(content[12]) + '!';
			}
	};
}).filter('elapsedSoFarFilter', function(){
	return function(score){   	//传入的score也是当时用_getElapsedMinutesSince算出来的
		var descri = '未知...';
		if(score !== undefined){
			var p =  _getElapsedMinutesSince() - parseInt(score, 10);

			if(p <= 0){
				descri = '刚才...';
			}else if(p > 0 && p < minutesPerHour){
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
}).filter('extractOracleFields', function(){
	return function(content){
		if(content.indexOf('|-_-|') === content.lastIndexOf('|-_-|')){
      			return content;   //back_admin中的flag是: *!-_-!*
		}

		content = content.split('|-_-|');
		return '尊敬的' + content[0] + '用户， 您已于' + formatTime(content[9]) + '通过' 
		+ content[12]+ '平台成功订购' + types[content[3]] + '套餐（订单编号：' + content[1]  + '）！';
	};
});

function TasksController($scope, $http) {
	var ITEMS_PER_PAGE= 5;
	var indiviTotalPages = undefined;  //Three Types
	var indiviCurrPage = undefined;  
	var cache = undefined;

	var phoneNumber = $('#phone').text();
//		alert($('#phone').html());
//		alert($('#phone').text());
//	phoneNumber = phoneNumber.substring(phoneNumber.indexOf('<') + 1, phoneNumber.indexOf('>')).trim();
	phoneNumber = (phoneNumber == ''? '获取不到...' : phoneNumber.trim());

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
	    $scope.currentMenu = 'N';	//初始化完成后默认加载Activity的第一页
		$scope.totalPages = indiviTotalPages[$scope.currentMenu];
	    $scope.currentPage = $scope.totalPages == 0 ? 0 : 1;

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
                $scope.tasks[i].isChecked = false;    //起始都是未选中状态
			}
				
		console.log($scope.tasks);
            if($scope.tasks.length === 0){
                $("#wait").fadeIn(688);
            }else{
                $("#wait").hide();    
            }	
			cache[menu + '_' + start + '_' + end] = msgContents;//Cache Cache 减少请求次数  为了接口统一 只保存msgContent
			console.log(cache);
		}
	};

	function loadPageByParams(menu, start, end, callback){
		console.log('$scope.' + menu + ' length => ' + $scope[menu].length);
		end = end > $scope[menu].length ? $scope[menu].length : end;
		console.log(menu + '-' + start + '-' +end);
		if((menu === 'A' || menu === 'B' || menu === 'N') && start <= end 
				//&& end <= $scope[menu].length
				){
			if(cache[menu + '_' + start + '_' + end]){
				console.log('^^^^^^^^^^^^^^^^^^^^Cache Hits^^^^^^^^^^^^^^^^');	
				callback(menu, start, end, cache[menu + '_' + start + '_' + end]);
			}else{
				var queryMsgCodes = $scope[menu + 'msgCodes'].slice(start, end);
				console.log('----截取的数组');
				console.log(queryMsgCodes);
				
				if(queryMsgCodes.length > 0){
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
				}else{
					callback(menu, 0, 0, []);	
				}
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
            //展开内容时 标记为已读
			asyncAction(4, phoneNumber, [task.score], [task.msgCode], $scope.currentMenu, function(data){
		        console.log('markReaded成功返回值为：' + data);
		        $scope[$scope.currentMenu + 'unreadedCount']--;  //左边menu的unreadedCount数量等请求正确返回后再更新        
            });
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

//向服务器请求 已读/未读/删除的action为4/5/7  用户有可能在请求返回前切换menu， 必须传入点击时的$scope.currentMenu，而不能以请求返回时的$scope.currentMenu作为基准
function asyncAction(action, phoneNumber, scores, msgCodes, menu, callback){
//	alert('修改状态' + action + '--' + phoneNumber + '--' + score + '--' + msgCode);
	$http({
		url  	:  '/zjdx/batchMove',
		method 	:  'POST',
		data   	:  {'action' : action, 'phoneNumber' : phoneNumber, 'scores' : scores, 'msgCodes' : msgCodes}
	})
	.success(function(data){
        callback(data);
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
		$scope.totalPages = indiviTotalPages[menu];
        $scope.currentPage = $scope.totalPages == 0 ? 0 : indiviCurrPage[menu];

//		alert($scope.totalPages + '--' + $scope.currentPage);
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

//提交意见
$scope.submitAdvise = function(){
    var ad = $("#advise").val().trim();
    if(ad == null || ad == '')  { 
        alert('请添加文字哦!');
    }else{
        alert(ad);
        
        $http({
		    url  	:  '/zjdx/advise',
		    method 	:  'POST',
		    data   	:  {'phoneNumber' : phoneNumber, 'advise' : ad}
	    }).success(function(data){
            alert(data);
            $("#myModal").modal('hide');
        }).error(function(data){
            $("#myModal").modal('hide');
    	});
    }
};

//选中CheckBox
$scope.checkItem = function(msgCode){
    console.log($("#cbx_" + msgCode +" :first").attr('checked'));
    
    console.log($scope.tasks);
    var msgCodes = _.map($scope.tasks, function(item){
        return item.msgCode;
    });

    //console.log(msgCodes);

    var states = _.map($scope.tasks, function(item){
        return item.isChecked;
        });
    console.log(states);
};

//选择 && 标记为
$scope.option = function(n){
//    alert(n); 
    if(_.isNumber(n)){
        switch(n){
            case 1:         //不选
                _.map($scope.tasks, function(item){
                    return item.isChecked = false;
                });
            break;
            case 2:         //全选
                _.map($scope.tasks, function(item){
                    return item.isChecked = true;
                });
            break;
            case 3:         //反选
                _.map($scope.tasks, function(item){
                    return item.isChecked = !(item.isChecked); 
                });
            break;
            //对选中项标记
            case 4:         //已读
            case 5:         //未读
            case 7:         //删除
                var selected = _.filter($scope.tasks, function(item){
                        return item.isChecked === true;
                    });
                if(selected.length == 0){
                    alert('您没选择任何消息噢!');
                    return;
                }
                
                if(n === 7){
                    if(!confirm('信息删除后永久隐藏, 确定继续么?'))  return;    
                }

//                alert('继续执行: ' + n);
                console.log(selected);
//                alert(_.map(selected, function(item){ return item.msgCode; }));

                asyncAction(n, 
                    phoneNumber, 
                    _.map(selected, function(item){ return item.score; }), 
                    _.map(selected, function(item){ return item.msgCode; }), 
                    $scope.currentMenu, 
                    function(data){
//                      alert('对选中项标记返回结果' + JSON.stringify(data));    
                        switch(n){          //根据不同的操作类型n  前端触发不同的逻辑
                            case 4:         //把选定的msgCode变为已读 计算出影响到的Unreaded数量
//                              alert('进入4的callback处理前端逻辑');
                                _.map(selected, function(item){
                                    return item.isReaded = true;    
                                });
                            break;
                            case 5:         //.......未读....... 
                                _.map(selected, function(item){
                                    return item.isReaded = false;    
                                });
                            break;
                            case 7:         //-------删除-------
//                                alert('进入7的删除完了啊callback处理前端逻辑');
                                $scope.tasks = _.difference($scope.tasks, selected);
                                //clear cache of current page, fetch in the subsequent refresh
                               
                                setTimeout(function(){
                                    cache = {};
                                    refreshAfterDelete();    	
                                }, 500);
                            break;
                            default:        //impossible
                                break;
                        }
                    });
            break;
            //对全部操作
            case 6:         //全部设为已读
            case 8:         //删除全部
                 
                if(n === 8){
                    if(!confirm('信息删除后永久隐藏, 确定继续么?'))  return;    
                }

//                alert(_.map($scope.tasks, function(item){ return item.msgCode; }));
                
                asyncAction(n, 
                    phoneNumber, 
                    _.map($scope.tasks, function(item){ return item.score; }), 
                    _.map($scope.tasks, function(item){ return item.msgCode; }), 
                    $scope.currentMenu,
                    function(data){
                        switch(n){
                            case 6:
                                _.map($scope.tasks, function(item){
                                    return item.isReaded = true;
                                });
                            break;
                            case 8:
//                                alert('进入8的删除完了啊callback处理前端逻辑');
                                $scope.tasks = [];
                                setTimeout(function(){
                                    cache = {};
                                    refreshAfterDelete();    	
                                }, 500);
                            break;
                            default:
                                break;
                        }    
                    });
            break;
            default:
                break;
        } //End of switch

    } //isNumber
};

function refreshAfterDelete(){
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

		//初始化与页面双绑的变量
	    $scope.currentMenu = 'N';	//初始化完成后默认加载Activity的第一页
		$scope.totalPages = indiviTotalPages[$scope.currentMenu];
//	    $scope.currentPage = $scope.totalPages == 0 ? 0 : 1;

		loadPageByParams($scope.currentMenu, ($scope.currentPage - 1) * ITEMS_PER_PAGE, 
				$scope.currentPage * ITEMS_PER_PAGE, handleCache);
		}
	});
}
}

