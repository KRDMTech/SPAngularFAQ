(function(angular) {
    'use strict';

    angular.module('SPFAQApp', ['ngRoute']) // Don't forget ngRoute!
    .controller('FAQController', function ($scope, $route, $routeParams, $location, $http, $sce) { //$sce let's you inject trusted HTML
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;
        if (!$scope.appWebUrl) { // SharePoint has a unique URL for apps so we need to get it
            $scope.appWebUrl = decodeURIComponent($.url().param("SPAppWebUrl"));
        }
        $scope.getFAQItems = function (listName) { // Use the REST api to get the list items
            var url = $scope.appWebUrl + "/_api/web/lists/getByTitle('" + listName + "')/items?$select=id,Title,FAQAnswer,FAQSortOrder,FAQPages&sort=FAQSortOrder";

            return $http({
                method: 'GET',
                url: url,
                headers: { "Accept": "application/json; odata=verbose" }
            });
        }

        var promise = $scope.getFAQItems('Frequently Asked Questions'); // Setup promise for getting the list items

        promise.then(function (data, status, headers, config) { // Execute when promise is fulfilled
            $scope.faqItems = [];
            angular.forEach(data.data.d.results, function (faqItem) {
                var result = faqItem.FAQPages.results.filter(function (faqPage) {
                    return faqPage === $scope.$routeParams.faqName;
                })[0];
                if (result) {
                    this.push({
                        question: $sce.trustAsHtml(faqItem.Title),
                        answer: $sce.trustAsHtml(faqItem.FAQAnswer),
                        sortOrder: faqItem.FAQSortOrder,
                        id: faqItem.ID
                    });
                }
            }, $scope.faqItems);
        }, function (data, status, headers, config) {
            console.log("Error " + status);
        });
    })
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
         .when('/', {
             templateUrl: 'SPAngularFAQ/Pages/FAQTemplate.html',
             controller: 'FAQController'
         })
         .when('/FAQ', {
             templateUrl: 'SPAngularFAQ/Pages/FAQTemplate.html',
             controller: 'FAQController'
         })
         .when('/FAQ/:faqName', {
             templateUrl: 'SPAngularFAQ/Pages/FAQTemplate.html',
             controller: 'FAQController'
         })
        .otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true);
    });
})(window.angular);