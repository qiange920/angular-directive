define(["app"], function (app) {

    var deps = ['$parse'];

    function directive($parse) {
        return {
            templateUrl: "js/directive/tpl/pager.html",
            restrict: "E",
            scope: {
                currentPage: "=", // 当前页, 由指令内部或外部改变
                totalNum: "=",    // 总条数, 由外部改变
                numPerPage: "=",  // 每页条数, 由外部指定, 暂不单独监听其改变
                totalPage: "=",   // 总页数, 总条数变化时, 指令自动计算得出
                onPageChange: "@" // 翻页回调, 参数page
            },
            controller: ["$scope", function ($scope) {
                var vm = $scope.vm = {};

                $scope.$watch("totalNum", function (totalNum) {
                    if (!totalNum) {
                        $scope.totalPage = 1;
                        $scope.currentPage = 1;
                        return;
                    }
                    $scope.totalPage = Math.ceil(totalNum / $scope.numPerPage);
                    vm.goPageNum = 1;
                    $scope.changeCurrentPage(1);
                });

                $scope.onPageChangeFn = $parse($scope.onPageChange);
                $scope.$watch("currentPage", function (newVal) {
                    $scope.changeCurrentPage(+newVal);
                    $scope.onPageChangeFn($scope.$parent, {page: newVal});
                });

                $scope.selectCurrentPage = function (page) {
                    if (isNaN(page)) {
                        vm.goPageNum = $scope.currentPage;
                        return;
                    }
                    if (page < 1) {
                        $scope.currentPage = 1;
                    } else if (page > $scope.totalPage) {
                        $scope.currentPage = $scope.totalPage;
                    } else {
                        $scope.currentPage = page;
                    }
                    vm.goPageNum = $scope.currentPage;
                };

                $scope.changeCurrentPage = function (currentPage) {

                    var totalPage = $scope.totalPage;

                    if (currentPage < 1) {
                        currentPage = 1;
                    } else if (currentPage > totalPage) {
                        currentPage = totalPage;
                    }

                    vm.showLeftDot = (currentPage - 4 > 1);
                    vm.showRightDot = ((currentPage + 2 < totalPage) && (totalPage > 7));
                    vm.pagerList = [];

                    var offset = {
                        start: 1,
                        end: totalPage
                    };
                    if (vm.showLeftDot) {
                        offset.start = currentPage - 3;
                    }
                    if (vm.showRightDot) {
                        offset.end = currentPage + 2;
                    }
                    for (var i = offset.start; i <= offset.end; i++) {
                        vm.pagerList.push(i);
                    }
                };

            }]
        };
    }

    directive.$inject = deps;
    app.directive("pager", directive);
})
;