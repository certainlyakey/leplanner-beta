(function() {
    'use strict';

    angular
    .module('app')
    .controller('DashboardController', ['$scope','$rootScope','requestService','$translate','$window','$location',
    function ($scope,$rootScope,requestService,$translate, $window, $location) {

        $translate('PAGE.DASHBOARD').then(function (t) {
            $rootScope.title = $rootScope.user.first_name+' '+$rootScope.user.last_name+' '+t+' | Leplanner beta';

            /* ANALYTICS */
            $window.ga('send', 'pageview', {
                'page': $location.path(),
                'title': $rootScope.title
            });
        });

        if(typeof $rootScope.dash_active_tab === 'undefined'){
            $rootScope.dash_active_tab = 'feed';
        }

        if(typeof $rootScope.sort_tab === 'undefined'){
            $rootScope.sort_tab = {};
        }else if(typeof $rootScope.sort_tab.dash === 'undefined') {
            $rootScope.sort_tab.dash = 'latest';
        }

        $scope.pagination = {
            current: 1
        };
        $scope.total_count = 0;

        // INIT
        getDashboardData();

        // NOTIFICATIONS
        var notification_limit = 20;
        getNotifications(notification_limit);

        function getDashboardData(){

            $scope.loading_animation = true;
            $scope.messages = {};
            $scope.scenarios = [];
            $scope.users_list = [];

            var CorrectedPage = $scope.pagination.current >= 1 ? $scope.pagination.current : 1;

            var query = {
                order: 'latest',
                page: CorrectedPage
            };

            if(!$rootScope.sort_tab.dash){
                $rootScope.sort_tab.dash = 'latest';
            }else{
                switch ($rootScope.sort_tab.dash) {
                    case 'latest':
                        query.order = 'latest';
                        break;
                    case 'popular':
                        query.order = 'popular';
                        break;
                    case 'favorited':
                        query.order = 'favorited';
                        break;
                    case 'commented':
                        query.order = 'commented';
                        break;
                    default:
                        query.order = 'latest';
                }
            }

            if(!$rootScope.dash_active_tab){
                query.tab = 'feed';
            }else{
                switch ($rootScope.dash_active_tab) {
                    case 'feed':
                        query.tab = 'feed';
                        break;
                    case 'drafts':
                        query.tab = 'drafts';
                        break;
                    case 'published':
                        query.tab = 'published';
                        break;
                    case 'favorites':
                        query.tab = 'favorites';
                        break;
                    case 'users':
                        query.tab = 'users';
                        break;
                    default:
                        query.tab = 'feed';
                }
            }

            // IF users, get users list
            if(query.tab === 'users'){
                getUsers();
            }else{
                getScenarios(query);
            }
        }

        function getScenarios(query){

            requestService.post('/scenarios/dashboard', query)
            .then(function(data) {

                $scope.drafts_count = data.scenarios.length;
                $scope.total_count =  data.count;
                if(data.scenarios.length === 0){
                    switch (query.tab) {
                        case 'feed':
                            $scope.messages.no_following = true;
                            break;
                        case 'drafts':
                            $scope.messages.no_drafts = true;
                            break;
                        case 'published':
                            $scope.messages.no_published = true;
                            break;
                        case 'favorites':
                            $scope.messages.no_favorites = true;
                            break;
                        default:
                            window.alert('something went wrong, please refresh the page');
                            break;
                    }
                }

                $scope.loading_animation = false;
                $scope.scenarios = data.scenarios;

                for(var j = 0; j < $scope.scenarios.length; j++){
                    //translating subjects
                    for(var a = 0; a < $scope.scenarios[j].subjects.length; a++){
                        $scope.scenarios[j].subjects[a].name = $scope.scenarios[j].subjects[a]["name_"+$translate.use()];
                    }
                }

            })
            .catch(function (error) {
                console.log(error);
            });
        }

        function getUsers(){

            requestService.post('/users/list')
            .then(function(data) {

                $scope.total_count = 0;

                if(data.users){
                    $scope.users_list = data.users;
                    $scope.loading_animation = false;
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }

        function getNotifications(limit){

            $scope.notifications_loading_animation = true;

            var params = {};

            if(limit){
                params.limit = limit;
            }

            requestService.post('/users/notifications', params)
            .then(function(data) {

                $scope.notifications = data.notifications;
                $scope.notifications_loading_animation = undefined;

            })
            .catch(function (error) {
                console.log(error);
            });
        }

        $scope.isActiveDash = function(tab){
            if(tab === $rootScope.dash_active_tab){ return true; }
            return false;
        };

        $scope.updateDashList = function(tab){
            $scope.total_count = 0;
            if(tab === 'feed ' || tab === 'drafts' || tab === 'published' || tab === 'favorites' || tab === 'users'){
                $rootScope.dash_active_tab = tab;
            }else{
                $rootScope.dash_active_tab = 'feed';
            }

            $scope.pageChanged(1);
        };

        $scope.isSortActive = function(tab){
            if(tab === $rootScope.sort_tab.dash){ return true; }
            return false;
        };

        $scope.updateSortList = function(tab){
            if(tab === 'latest ' || tab === 'popular' || tab === 'favorited' || tab === 'commented'){
                $rootScope.sort_tab.dash = tab;
            }else{
                $rootScope.sort_tab.dash = 'latest';
            }

            $scope.pageChanged(1);
        };

        $scope.addFollow = function(user_id){

            requestService.post('/followers/' + user_id)
            .then(function(follower) {
                for(var j = 0; j < $scope.users_list.length; j++){
                    if($scope.users_list[j]._id === user_id){
                        $scope.users_list[j].following = 'following';
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        };

        $scope.removeFollow = function(user_id){

            requestService.post('/followers/remove/' + user_id)
            .then(function(follower) {
                for(var i = 0; i < $scope.users_list.length; i++){
                    if($scope.users_list[i]._id === user_id){
                        $scope.users_list[i].following = undefined;
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        };

        $scope.getAllNotifications = function(){
            getNotifications();
        };

        $scope.getLatestNotifications = function(){
            getNotifications(notification_limit);
        };

        $scope.pageChanged = function(new_page_nr) {
            $scope.pagination.current = new_page_nr;
            getDashboardData();
            document.body.scrollTop = 0;
        };

    }]); // DashboardController end
}());
