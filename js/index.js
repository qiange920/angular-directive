/**
 * Created by Lifeng on 2016/4/26.
 */
require.config({
    paths: {
        "sizzle": "lib/sizzle/sizzle.min", // selector of jQuery
        "hammer": "lib/hammer.min", 
        "angular": "lib/angular/angular",
        "angular-animate": "lib/angular-animate/angular-animate.min",
        "angular-cookies": "lib/angular-cookies/angular-cookies.min",
        "angular-uirouter": "lib/angular-ui-router/angular-ui-router.min",
        "angular-blockui": "lib/angular-block-ui/angular-block-ui",
        "angular-gestures": "lib/angular-gestures/gestures.min",
        "cityData": "lib/cityData.min",
        "app": "app"
    },
    shim: {
        "angular": {
            "exports": "angular"
        },
        "angular-animate": ["angular"],
        "angular-cookies": ["angular"],
        "angular-uirouter": ["angular"],
        "angular-blockui": ["angular"],
        "angular-gestures": ["angular", "hammer"]
    },
    priority: [
        "angular"
    ],
    // urlArgs: "t=" + (new Date().getTime()),
    waitSeconds: 0
});
require(["app", "routeConfig", "service/LoginService", "directive/ToolkitDirective", "version2directive/version2ToolkitDirective"], function (app, routeConfig,LoginService) {
    angular.formatJSON = function (json) {
        if (angular.isArray(json)) {
            var arr = [];
            angular.forEach(json, function (item) {
                arr.push(angular.formatJSON(item));
            });
            return arr;
        } else if (angular.isObject(json)) {
            var result = {};
            for (var p in json) {
                if (json.hasOwnProperty(p)) {
                    var np = p.substring(0, 1).toLowerCase() + p.substring(1);
                    result[np] = angular.formatJSON(json[p])
                }
            }
            return result;
        } else {
            return json;
        }
    };
    
   /* app.run(['$rootScope', '$state', 'LoginService', function ($rootScope, $state, LoginService) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        	toParams.fromState = fromState.name;
            
//            toParams.goBack = function () {
//                if (fromState.name) {
//                    $state.go(fromState.name, fromParams);
//                } else {
//                    $state.go("navi.home");
//                }
//            };
        	//如果未登录，获取上一次访问的url及参数
        	var lastUrlState = {name: toState.name };
        	lastUrlState.toParams  =toParams;
            toState.roleName && LoginService.ensureRole(lastUrlState);
        });
    }]);*/
    /*
    app.run(['$rootScope', '$state', function ($rootScope, $state) {
        var stateStack = [];
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            if (!toParams._isGoBack) {
                stateStack.push({
                    name: fromState.name,
                    params: fromParams
                });
            }
            toParams.goBack = function () {
                var stateStackItem = stateStack.pop();
                if (stateStackItem) {
                    stateStackItem.params._isGoBack = true;
                    $state.go(stateStackItem.name, stateStackItem.params);
                }
            };
        });
    }]);
    */
    app.run(['$templateCache', function ($templateCache) {
        
        var template = 
            '<div class="block-ui-message-container" aria-live="assertive" aria-atomic="true">' +
            '<div class="loading-message loading-message-boxed">'+
                '<div class="loading-state">{{ state.message }}</div>'+
            '</div>' +
            '</div>';
        
        /*var template = 
        '<div class="block-ui-message-container" aria-live="assertive" aria-atomic="true">' +
        '<div id="loadingToast" class="weui_loading_toast">'+
            '<div class="weui_toast">'+
                '<div class="weui_loading">'+
                    '<div class="weui_loading_leaf weui_loading_leaf_0"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_1"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_2"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_3"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_4"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_5"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_6"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_7"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_8"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_9"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_10"></div>'+
                    '<div class="weui_loading_leaf weui_loading_leaf_11"></div>'+
                '</div>'+
                '<p class="weui_toast_content">{{ state.message }}</p>'+
            '</div>'+
        '</div>'+
        '</div>';
        */
        $templateCache.put('angular-block-ui/angular-block-ui.ng.html', template);
    }]);
    
    app.filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }]);
 
    app.directive('img', [function () {
        return {
            restrict: "E",
            link: function (scope, elem, attr) {
                var defalutImg = elem.attr("default-img") ||  "assets/img/propic_default.gif";
                elem.attr("src") || elem.attr("src", defalutImg);
                    elem.on("error", function () {
                        elem.attr("src", defalutImg);
                    });
                
            }
        };
    }]);
    
    app.directive('lazyImg', ['$window', '$document', '$rootScope', function ($window, $document, $rootScope) {
        return {
            restrice: 'A',
            compile: function () {
                var eventName = 'broadcastViewportChange';
                if (!$rootScope[eventName]) {
                    var win = angular.element($window);
                    var viewportChange = function () {
                        $rootScope.$broadcast(eventName);
                    };
                    win.on('scroll', viewportChange);
                    win.on('resize', viewportChange);
                    $rootScope[eventName] = true;
                }
                return function (scope, elem, attr) {
                    var doc = $document[0];
                    var win = angular.element($window);
                    var listener = scope.$on(eventName, function () {
                        var rect = elem[0].getBoundingClientRect();
                        var ret = true;
                        if (rect.height > 0 && rect.width > 0) {
                            var x = rect.top > 0 && (rect.top + rect.height / 3) < Math.max(doc.documentElement.clientHeight, win.innerHeight || 0);
                            var y = rect.left > 0 && (rect.left + rect.width / 3) < Math.max(doc.documentElement.clientWidth, win.innerWidth || 0);
                            ret = x && y;
                        }
                        if (ret) {
                            elem.attr('src', elem.attr('lazy-img'));
                            listener();
                            listener = null;
                        }
                    });
                    attr.$observe('lazyImg', function () {
                        scope.$broadcast(eventName);
                    });
                }
            }
        }
    }]);

    app.factory('httpInterceptor', ['$q', '$log', '$cookies', function ($q, $log, $cookies) {
        return {
            request: function (config) {
            	String.prototype.endsWith=function(str){var reg=new RegExp(str+"$");return reg.test(this);} 
				//添加百度统计
				if(config&&!config.url.endsWith('.html')){
					if(_hmt){
						_hmt.push(['_trackPageview', "/"+config.url]);
					}
					if(config.isService){
//						config.url = "http://123.59.81.247:8433/" + config.url;

						config.url = "http://197.168.12.180:9999/" + config.url;
						if(config.params){
							config.params.tokenid = localStorage.getItem("TOKEN");
						}
						if(config.data){
							config.data.tokenid = localStorage.getItem("TOKEN");
						}
					}
				}
                if (config.isForm) {
                    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                    config.transformRequest = [function (obj) {
                        var str = [];
                        for (var p in obj) {
                            if (obj.hasOwnProperty(p)) {
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            }
                        }
                        return str.join("&");
                    }];
                } else if (config.isMulti) {
                    config.headers['Content-Type'] = undefined;
                    config.transformRequest = [function (obj) {
                        if (obj instanceof FormData) {
                            return obj;
                        } else if (angular.isObject(obj)) {
                            var formData = new FormData();
                            for (var p in obj) {
                                if (obj.hasOwnProperty(p)) {
                                    formData.append(p, obj[p]);
                                }
                            }
                            return formData;
                        }
                    }];
                }
                return config;
            },
            
            response: function (resp) {
            	if(resp.data.success === false){
            		
            	}
                if (resp.data.Success === true) {
                	if(resp.data.Data){
                        resp.data.data = angular.formatJSON(resp.data.Data);
                	}else{
                        resp.data = angular.formatJSON(resp.data);
                	}
                    return $q.resolve(resp);
                } else if (resp.data.success === false) {
                    resp.data = angular.formatJSON(resp.data);
                    $log.error(resp);
                    return $q.reject(resp);
                } else if(resp.data.Success === false){
                    resp.data = angular.formatJSON(resp.data);
                    $log.error(resp);
                    return $q.reject(resp);
                } else{
                    return resp;
                }
            },
            
            responseError: function (rejection) {
                if (rejection.status === 403) {
                    $cookies.remove("USER_ID");
                    $cookies.remove("USER_NAME");
                    $cookies.remove("TOKEN_ID");
                    rejection.data = {
                        message: '请登录后再操作',
                        friendlyMessage: '请登录后再操作'
                    };
                }
                $log.error(rejection);
                return $q.reject(rejection);
            }
            
        };
    }]);
    
    app.config(['$httpProvider', '$cookiesProvider', function ($httpProvider, $cookiesProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
        $httpProvider.defaults.useXDomain = true;
	    $httpProvider.defaults.withCredentials = true;
/*	    delete $httpProvider.defaults.headers.common['X-Requested-With'];
*/        var now = new Date();
        $cookiesProvider.defaults.expires = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
    }]);

    app.configRouter(routeConfig);
    app.start();
});