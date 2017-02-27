define(["app",'service/ModalDialogFactory'], function(app) {
    var deps = ['ModalDialogFactory'];

    function directive(ModalDialogFactory,ApplyCouponService) {
        return {
            templateUrl: "js/directive/tpl/slider.html",
            restrict: "A",
            scope: {
                banner: "=sliderItems"
            },
            controller: ["$scope", "$timeout", "$interval", function($scope, $timeout, $interval) {

                $scope.activeIndex = 0;
                $scope.pauseInterval = false;
                $scope.direction = true;
                $interval(function() {
                    if (!$scope.pauseInterval && $scope.banner) {
                        $scope.changeActiveIndex($scope.activeIndex + 1, true);
                    }
                }, 3000);

                $scope.changeActiveIndex = function(index, direction) {
                    if (!$scope.banner) {
                        return;
                    }
                    $scope.direction = direction;

                    $scope.activeIndex = index;
                    if ($scope.activeIndex >= $scope.banner.length) {
                        $scope.activeIndex = 0;
                    } else if ($scope.activeIndex < 0) {
                        $scope.activeIndex = $scope.banner.length - 1;
                    }
                }
                $scope.show =function(data){
                	data.copyurl = data.url||data.copyurl;	
                }
                this.setImgHeight = function(imgHeight) {
                    $scope.imgHeight = imgHeight;
                }

            }],
            link: function(scope, elem, attr) {
                scope.$watch("imgHeight", function(imgHeight) {
                    elem[0].style.height = scope.imgHeight + "px";
                })
            }
        }
    }

    directive.$inject = deps;
    app.directive("sliderItems", directive)

    app.directive('slideImg', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            require: '^sliderItems',
            template: '<img default-img="assets/img/propic_default_banner.png" ng-src="{{item.imageUrl}}" />',
            restrict: "E",
            replace: true,
            scope: {
                item: '=',
            },
            link: function(scope, elem, attr, sliderItemsCtrl) {
                $timeout(function() {
                    scope.imgHeight = elem[0].offsetHeight;
                    sliderItemsCtrl.setImgHeight(scope.imgHeight)
                }, 400)
            }
        }
    }]);
});
