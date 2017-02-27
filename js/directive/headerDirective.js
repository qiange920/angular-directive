define(["app"], function(app) {
    var deps = [];

    function directive() {
        return {
            templateUrl: "js/directive/tpl/header_bar.html",
            restrict: "E",
            transclude: true,
            scope: {
            },
            controller: ["$rootScope", "$scope", "$state", "$stateParams", function($rootScope, $scope, $state, $stateParams) {
                $scope.title=$state.current.title;
                $scope.goBack =  function(){
                    //$stateParams.goBack();
                    history.back();
                }
            }]
        }
    }

    directive.$inject = deps;
    app.directive("headerBar", directive);
});
