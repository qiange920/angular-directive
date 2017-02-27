define(['app'], function (app) {

    app.directive('frame', ['$window', function ($window) {

        return {
            restrict: "E",
            scope: {
                url: "="
            },
            link: function (scope, elem, attr) {
                const windowElement = angular.element($window);
                var clientHeight=windowElement[0].innerHeight;
                scope.$watch('url', function () {
                    elem.html('<iframe src="' + scope.url + '" frameborder="0" width="100%" height="'+clientHeight+'" scrolling="yes"></iframe>');
                });
            }
        }

    }]);

});