(function() {
  'use strict';

  angular
    .module('app')
    .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$scope','$rootScope','scenarioService', 'metaService'];

    function DashboardController($scope,$rootScope,scenarioService,metaService) {

      if(typeof $rootScope.dash_active_tab === 'undefined'){
        $rootScope.dash_active_tab = 'drafts';
      }

      if(typeof $rootScope.dash_active_sort_tab === 'undefined'){
        $rootScope.dash_active_sort_tab = 'latest';
      }

      getDashboardScenarios();

      function getDashboardScenarios(){

        $scope.loading_animation = true;
        clearMessages();
        $scope.scenarios = [];

        var q = {
          order : 'latest',
          user: {
            _id: $rootScope.user._id
          }
        };

        if(typeof $rootScope.dash_active_sort_tab == 'undefined'){
          $rootScope.dash_active_sort_tab = 'latest';
        }else{
          switch ($rootScope.dash_active_sort_tab) {
            case 'latest':
                q.order = 'latest';
              break;
              case 'popular':
                  q.order = 'popular';
                break;
              case 'favorited':
                  q.order = 'favorited';
                break;
              case 'commented':
                  q.order = 'commented';
                break;
            default:
              q.order = 'latest';
          }
        }

        if(typeof $rootScope.dash_active_tab == 'undefined'){
          q.filter = 'drafts';
        }else{
          switch ($rootScope.dash_active_tab) {
            case 'published':
                q.filter = 'published';
              break;
              case 'favorites':
                  q.filter = 'favorites';
                break;
              case 'following':
                  q.filter = 'following';
                break;
            default:
              q.filter = 'drafts';
          }
        }

        scenarioService.getDashScenarios(q)
          .then(function(data) {
            //console.log(data);
            if(data.scenarios){

              switch (q.filter) {
                case 'drafts':
                  $scope.drafts_count = data.scenarios.length;
                  if(data.scenarios.length === 0){
                    $scope.no_drafts = true;
                  }
                  break;
                case 'published':
                  if(data.scenarios.length === 0){
                    $scope.no_published = true;
                  }
                  break;
                case 'favorites':
                  if(data.scenarios.length === 0){
                    $scope.no_favorites = true;
                  }
                  break;
                case 'following':

                  if(data.scenarios.length === 0){
                    $scope.no_following = true;
                  }

                  break;
              }

              $scope.scenarios = data.scenarios;
              $scope.loading_animation = false;

            }

            if(data.error){
              switch(data.error.id) {
                case 100:
                  // user changed
                  $location.path('/');
                  break;
                default:
                  console.log(data.error);
              }
            }
        });

      }

      function clearMessages(){
        $scope.no_drafts = undefined;
        $scope.no_published = undefined;
        $scope.no_favorites = undefined;
        $scope.no_following = undefined;
      }

      $scope.isActiveDash = function(tab){
        if(tab == $rootScope.dash_active_tab){ return true; }
        return false;
      };

       $scope.updateDashList = function(tab){
        if(tab == 'drafts ' || tab == 'published' || tab == 'favorites' || tab == 'following'){
          $rootScope.dash_active_tab = tab;
          getDashboardScenarios();
        }else{
          $rootScope.dash_active_tab = 'drafts';
          getDashboardScenarios();
        }
      };

      $scope.isSortActive = function(tab){
        if(tab == $rootScope.dash_active_sort_tab){ return true; }
        return false;
      };

      $scope.updateSortList = function(tab){
        if(tab == 'latest ' || tab == 'popular' || tab == 'favorited' || tab == 'commented'){
          $rootScope.dash_active_sort_tab = tab;
          getDashboardScenarios();
        }else{
          $rootScope.dash_active_sort_tab = 'latest';
          getDashboardScenarios();
        }
      };

    } // DashboardController end
}());
