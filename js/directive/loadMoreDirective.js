define(["app"], function (app) {

    var deps = ['$parse'];

    function directive($parse) {
        return {
            templateUrl: "js/directive/tpl/load_more.html",
            restrict: "E",
            scope: {
                currentPage: "=", // 当前页, 由指令内部或外部改变
                totalNum: "=",    // 总条数, 由外部改变
                numPerPage: "=",  // 每页条数, 由外部指定, 暂不单独监听其改变
                totalPage: "=",   // 总页数, 总条数变化时, 指令自动计算得出
                onPageChange: "@", // 翻页回调, 参数page
                isBusy: "="
            },
            controller: ["$scope", function ($scope) {
                var vm = $scope.vm = {};
                vm.more = true;
                $scope.currentPage = 1;

                $scope.$watch("totalNum", function (totalNum) {

                    if (!totalNum) {
                        $scope.totalPage = 1;
                        $scope.currentPage = 1;
                        $scope.more = false
                        return;
                    }
                    $scope.totalPage = Math.ceil(totalNum / $scope.numPerPage);
                    if($scope.totalPage && $scope.totalPage == 1){
                        vm.more = false;
                    }else{
                        vm.more = true;
                    }
                });
                
                $scope.onPageChangeFn = $parse($scope.onPageChange);
                $scope.$watch("currentPage", function (newVal) {
                    $scope.nextPage(+newVal);
                    $scope.onPageChangeFn($scope.$parent, {page: newVal});
                });
                
                $scope.nextPage = function (page) {
                    if (page == $scope.totalPage) {
                        $scope.currentPage = $scope.totalPage;
                        vm.more = false;
                    }else {
                        $scope.currentPage = page;
                    }
                };

            }]
        };
    }

    directive.$inject = deps;
    app.directive("loadMore", directive);
})
;