define(['app'], function (app) {

    app.directive('modalDialog', [function () {
        return {
            restrict: "E",
            transclude: true,
            templateUrl: "js/directive/tpl/modal_dialog.html"
        };
    }]);

});