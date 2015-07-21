'use strict';

angular
  .module('app', ['ngRoute','ngResource','angularjs-dropdown-multiselect','angularUtils.directives.dirPagination'])
  .config(['$routeProvider','$locationProvider', '$resourceProvider', function($routeProvider,$locationProvider,$resourceProvider) {
    $routeProvider.otherwise({redirectTo: '/'});
  }]);