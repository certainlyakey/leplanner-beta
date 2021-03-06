(function() {
    'use strict';

    angular
    .module('app')
    .factory('requestService', ['$http', '$rootScope', '$location', '$q', 'queryService', function($http, $rootScope, $location, $q, queryService) {
        var API_BASE = '/api';

        var success = function (response) { return response.data; };

        return {
            get: function(request, query) {

                if (query) {
                    request += queryService.stringify(query);
                }

                return $http.get(API_BASE + request).then(success);
            },

            post: function(request, query) {

                // Add user id to compare with server session
                if ($rootScope.user && $rootScope.user._id) {
                    if (!query) { query = {}; }
                    if (!query.user) { query.user = {}; }
                    query.user._id = $rootScope.user._id;
                }

                return $http.post(API_BASE + request, query).then(success)
                .catch(function(error){
                    if (error.status === 403 && error.data === 'refresh page, user changed') {
                        $location.path('/');
                        return;
                    }
                    return $q.reject(error);
                });
            }
        };

    }]);

}());
