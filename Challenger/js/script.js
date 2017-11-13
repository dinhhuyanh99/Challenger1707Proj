
var YTChallengerApp = angular.module('YTChallengerApp',['ngRoute', 'ui.materialize']);
var videoApi = "https://youtube-api-challenger2.appspot.com/videos";
var apiChallengerLogin = "https://youtube-api-challenger2.appspot.com/authentication";
var registerApi = "https://youtube-api-challenger2.appspot.com/members";
var playlistApi = "https://youtube-api-challenger2.appspot.com/playlists";
var googleSEApi = "https://content.googleapis.com/youtube/v3/search?q=&maxResults=25&part=snippet&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM";
var page = 1;
var limit = 200;
$(document).ready(function() {
  // Page Initilization
	$('.modal').modal();
  $('.button-collapse').sideNav({
    menuWidth: 300,
    edge: 'left',
    closeOnClick: false,
    draggable: true,
    onOpen: function(el) {
    	$('#modal-login').modal('close');
    }
  });
  $('#dropdown-user').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrainWidth: false, 
    hover: false,
    gutter: 0,
    belowOrigin: true,
    alignment: 'right',
    stopPropagation: false
  });
  $('select').material_select();
  // ===================
});

$('.preloader-wrapper').bind('ajaxStart', function () {
    $this.show();
}).bind('ajaxStop', function () {
    $this.hide();
});
YTChallengerApp.config(['$routeProvider',function($routeProvider) {
  $routeProvider
  .when("/",{
      title: 'Challenger',
    templateUrl: "pages/main.htm"

  })
  .when("/play", {
      title: 'Challenger',
    templateUrl: "pages/video.htm"
  })
      .when("/watch", {
          title: 'Challenger',
          templateUrl: "pages/videoPersonal.htm"
      })
  .when("/upload", {
      title: 'Add videos',
    templateUrl: "pages/upload.htm"
  })
  .when("/playlist", {
      title: 'Playlist',
    templateUrl: "pages/playlist.htm"
  })
      .when("/playlist/createPlaylist", {
          title: 'Create Playlist',
          templateUrl: "pages/createPlaylist.htm"
      })
      .when("/playlist/playlistDetail", {
          title: 'Playlist',
          templateUrl: "pages/playlistDetail.htm"
      })
  .when("/register",{
      title: 'Register',
    templateUrl: "pages/register.htm"
  })
  .otherwise({
     redirectTo: '/'
  });
}]);

YTChallengerApp.controller('searchEngine', function($scope, $http, $sce){
    $scope.searchVideo = function searchVideo(toSearchFor) {
        $scope.validSearchString = false;
        $http({
            method: 'GET',
            url: "https://content.googleapis.com/youtube/v3/search?q=" + toSearchFor + "&maxResults=25&part=snippet&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM"
        }).then(function successCallBack(response) {
            $scope.validSearchString = true;
            $scope.searchResults = response.data.items;
            $scope.resetSearch = function resetSearch() {
                $scope.searchString = "";
                $scope.validSearchString = false;
            };
        }, function errorCallBack(response) {
            Materialize.toast('Oops! Our server is having problem. We are so sorry for such inconvenient!', 5000);
            console.log(response);
        });
    }

});
YTChallengerApp.controller('listVideosPersonal', function($scope, $http, $sce){
  $scope.videoStatusPersonal= false;
  $scope.loadingPersonal = true;
  $http({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('youtubeToken')
    },
    url:videoApi
  }).then(function successCallBack(response) {
      $scope.loadingPersonal = false;
    $scope.arrayVideosPersonal = response.data.data;
    if ($scope.arrayVideosPersonal !== undefined) {
      for (var i = 0; i < $scope.arrayVideosPersonal.length; i++) {
        if ($scope.arrayVideosPersonal[i].attributes.thumbnail === "") {
          $scope.arrayVideosPersonal[i].attributes.thumbnail = 'https://i.ytimg.com/vi/' + $scope.arrayObject[i].attributes.youtubeId + '/hqdefault.jpg';
        }
        $scope.arrayVideosPersonal[i].attributes.createdTimeMLS = new Date($scope.arrayVideosPersonal[i].attributes.createdTimeMLS).toLocaleDateString();
      }
      $scope.videoStatusPersonal = true;
    } else {
      $scope.videoStatusPersonal = false;
    }
  }, function errorCallBack(response) {
      Materialize.toast('Please log in!', 5000);
      $scope.loadingPersonal = false;
      console.log(response);
  });
});

YTChallengerApp.controller('listVideos', function($scope, $http){
    $scope.loadingPage = true;
  $http({
    method: 'GET',
    url: googleSEApi
}).then(function successCallBack(response) {
    $scope.loadingPage = false;
    $scope.arrayVideos = response.data.items;
}, function errorCallBack(response) {
    Materialize.toast('Check your network!', 3000);
    console.log(response);

});
  
});
YTChallengerApp.controller('navigationBar', function($scope, $location, $http){
  $scope.signedInStatus = false;

  $scope.dataToSend = {
    "data":{
      "type" : "MemberLogin",
      "attributes":{
        "username":"",
        "password":""
      }
    }
  };
  $scope.refreshPage = function() {
  location.reload();
  };

  $scope.submitLogin = function() {
    $http({
      method: 'POST',
      url: apiChallengerLogin,
      data: $scope.dataToSend
    }).then(function  successCallBack(response) {
      Materialize.toast('Logged in successfully!', 3000);
      localStorage.setItem ('youtubeToken', response.data.data.attributes.secretToken);
      localStorage.setItem ('usernameYT', response.config.data.data.attributes.username);
      location.reload();
    }, function errorCallBack(errorResponse) {
      Materialize.toast('Failed to log in, error ' + errorResponse.data.errors[0].code + ' ! ' + errorResponse.data.errors[0].detail, 3000);
    });
  };

  $scope.loginToken = localStorage.getItem('youtubeToken');
  if ($scope.loginToken !== null) {
    $scope.signedInStatus = true;
  }
  $scope.signedInUsername = localStorage.getItem('usernameYT');

  $scope.signOut = function() {
    localStorage.removeItem('youtubeToken');
    localStorage.removeItem('usernameYT');
    location.reload();
  };
  $scope.activeNavbar = function (path) {
    return (path === $location.path());
  };
});

YTChallengerApp.controller('videoContent', function videoContent($scope, $http, $location, $sce) {
  var id = $location.search().id;
  $scope.loadingPage = true;
  $scope.embededId = 'https://www.youtube.com/embed/' + id + '?enablejsapi=1&rel=0&autoplay=1';
  $scope.embededId = $sce.trustAsResourceUrl($scope.embededId);
  $http ({
    method: 'GET',
    url: 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM&part=snippet,contentDetails,statistics,status'
  }).then(function successCallBack(response) {
      onYouTubeIframeAPIReady();
      $scope.loadingPage = false;
      $scope.watchingVideo = response.data.items[0];
      $scope.timeStamp = new Date($scope.watchingVideo.snippet.publishedAt).toLocaleDateString();
      $scope.tagsForVideo = response.data.items[0].snippet.tags;
      $scope.channelInfo = response.data.items[0].snippet.channelId;
      $http ({
          method: 'GET',
          url: 'https://www.googleapis.com/youtube/v3/channels?id='+ $scope.channelInfo +'&part=snippet,contentDetails,statistics&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM'
      }).then(function successCallBack(response) {
        $scope.channelDetails = response.data.items[0];
      }, function errorCallBack(response) {
        console.log(response);
      });
  }, function errorCallBack(response) {
      console.log(response);
      Materialize.toast('Sorry we are having problems', 3000);
  });
      $http ({
        method: 'GET',
          url: 'https://content.googleapis.com/youtube/v3/search?q=' + id + '&maxResults=50&part=snippet&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM'
      }).then(function successCallBack(response) {
        $scope.suggestedToWatch = response.data.items;
      }, function errorCallBack(response) {
        Materialize.toast('Cannot load all the comments!',3000);
        console.log(response);
      });
      $http ({
          method: 'GET',
          url: 'https://www.googleapis.com/youtube/v3/commentThreads?videoId=' + id + '&part=snippet,replies&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM&maxResults=25'
      }).then(function successCallBack(response) {
          $scope.commentThreads = response.data.items;
          console.log(commentThreads);
      }, function errorCallBack(response) {
          console.log(response);
          Materialize.toast('Sorry we are having problems', 3000);
      });

});
function onYouTubeIframeAPIReady() {
    var player = new YT.Player('existed-iframe-player', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}
function onPlayerReady(event) {
    alert('Ready to play!');
}
function iframeStatus(playerStatus) {
    if (playerStatus == -1) {
        alert('Unstarted!'); // unstarted
    } else if (playerStatus == 0) {
        alert('Ended!'); // ended
    } else if (playerStatus == 1) {
        alert('playing!'); // playing
    } else if (playerStatus == 2) {
        alert('paused!'); // paused
    } else if (playerStatus == 3) {
        alert('buffering'); // buffering
    } else if (playerStatus == 5) {
        alert('video cued'); // video cued
    }
}
function onPlayerStateChange(event) {
    iframeStatus(event.data);
}

YTChallengerApp.controller('videoPersonalContent', function videoContent($scope, $http, $location, $sce) {
    var cid = $location.search().cid;
    var inPlaylist = $location.search().inplaylist;
    $scope.playPlaylistVideo = false;
    $scope.loadingPersonal = true;
    $http ({
        method:'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('youtubeToken')
        },
        url: 'https://youtube-api-challenger2.appspot.com/videos/' + cid
    }).then(function successCallBack(response) {
        $scope.loadingPersonal = false;
        $scope.watchingPersonalVideo = response.data.data;
        $scope.embededCID = 'https://www.youtube.com/embed/' + $scope.watchingPersonalVideo.attributes.youtubeId + '?rel=0&autoplay=1';
        $scope.embededCID = $sce.trustAsResourceUrl($scope.embededCID);
        if (inPlaylist === undefined) {
            $scope.playPlaylistVideo = false;
        } else {
            $scope.playPlaylistVideo = true;
            $http({
                method:'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('youtubeToken')
                },
                url: playlistApi
            }).then(function successCallBack(response){
                const renderQueuePlaylist= response.data.data;
                $scope.playlistQueueInfo = renderQueuePlaylist.find(item => item.id === inPlaylist);
                $scope.createdTime = new Date($scope.playlistQueueInfo.attributes.createdTimeMLS).toLocaleDateString();
                $http({
                    method:'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('youtubeToken')
                    },
                    url: 'https://youtube-api-challenger2.appspot.com/videos?playlist=' + inPlaylist + '&page=1&limit=100'
                }).then(function successCallBack(response) {
                    $scope.playlistQueueVideo = response.data.data;
                    $scope.playlistID = inPlaylist;
                    $scope.author = localStorage.getItem('usernameYT');
                }, function errorCallBack(response) {
                    Materialize.toast('Cannot get all the videos in the playlist!', 3000);
                    console.log(response);
                });
            }, function errorCallBack(response){
                Materialize.toast('Error loading playlist info for the queue!', 3000);
                console.log(response);
            });
        };
        $scope.videoToPlaylistData = {
            "data":{
                "type":"Video",
                "attributes":{
                    "youtubeId": $scope.watchingPersonalVideo.attributes.youtubeId,
                    "name": $scope.watchingPersonalVideo.attributes.name,
                    "description": $scope.watchingPersonalVideo.attributes.description,
                    "keywords": $scope.watchingPersonalVideo.attributes.keywords,
                    "playlistId": "",
                    "thumbnail": $scope.watchingPersonalVideo.attributes.thumbnail,
                }
            }
        };
        $http({
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('youtubeToken')
            },
            url: playlistApi
        }).then(function successCallBack(response) {
            $scope.listOfPlaylists = response.data.data;
        }, function errorCallBack(response) {
            Materialize.toast('Cannot load playlists because of a problem, please check the log!', 5000);
            console.log(response);
        });
        $scope.addToPlaylist = function (PlaylistID) {
            $scope.videoToPlaylistData.data.attributes.playlistId = PlaylistID;
            $http({
                method:'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('youtubeToken')
                },
                url: 'https://youtube-api-challenger2.appspot.com/videos/' + cid,
                data: $scope.videoToPlaylistData
            }).then(function successCallBack(response) {
                Materialize.toast('Successfully added!', 5000);
                $('#add-to-playlist').modal('close');
            }, function errorCallBack(response) {
                Materialize.toast('Failed to add video! Check logs', 5000);
                console.log(response);
            });
        }
    }, function errorCallBack(response) {
        console.log(response);
    });


});
YTChallengerApp.controller('manageAcc', 
  function manageAcc($scope){
    
});

YTChallengerApp.controller('registerForm', 
  function registerForm($scope, $http){
   $scope.init = function() {
    $scope.registerData = {
      "data":{
        "type": "Member",
        "attributes":{
          "username":"",
          "password":"",
          "fullName":"",
          "email":"",
          "birthDay":"",
          "gender":""
        }
      }
    }
  };

    $scope.handleRegister = function() {
      $http({
        method: 'POST',
        url: registerApi,
        data: $scope.registerData
      }).then(function  successCallBack(response) {
        Materialize.toast('Registered successfully!', 3000);
      }, function errorCallBack(response) {
        Materialize.toast('Register request failed, check log!', 3000);
      });
    }
});

YTChallengerApp.controller('uploadVideo', function($http, $scope){
    $scope.videoData = {
        "data":{
            "type":"Video",
            "attributes":{
                "youtubeId": "",
                "name": "",
                "description": "",
                "keywords": "",
                "playlistId": "",
                "thumbnail": ""
            }
        }
    };
    $http({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('youtubeToken')
        },
        url: playlistApi
    }).then(function successCallBack(response) {
        $scope.playlistToAddOptions = response.data.data;
    }, function errorCallBack(response) {
        Materialize.toast('Cannot load playlist details!', 5000);
        console.log(response);
    });
    $scope.checkAndPreviewID = function () {
        $scope.showPreviewVideo = false;
        $scope.invalidId = false;
        $scope.enoughCharID = false;
        if ($scope.videoData.data.attributes.youtubeId.length === 0) {
            $scope.showPreviewVideo = false;
            $scope.enoughCharID = false;
        } else if ($scope.videoData.data.attributes.youtubeId.length < 10) {
            $scope.enoughCharID = true;
        } else {
            $http ({
                method: 'GET',
                url: 'https://www.googleapis.com/youtube/v3/videos?id=' + $scope.videoData.data.attributes.youtubeId + '&key=AIzaSyALTMBX1Ufu_PZqGPd_M2cePFckKxHZXEM&part=snippet,contentDetails,statistics,status'
            }).then(function successCallBack(response) {
                $scope.previewResult = response.data.items.length;
                if ($scope.previewResult === 0) {
                    $scope.invalidId = true;
                    $scope.showPreviewVideo = false;
                    $scope.enoughCharID = true;
                } else {
                    $scope.showPreviewVideo = true;
                    $scope.previewVideoCard = response.data.items[0];
                    $scope.autoFill = function () {
                        $scope.videoData.data.attributes.name = response.data.items[0].snippet.title;
                        $scope.videoData.data.attributes.description = response.data.items[0].snippet.description;
                        $scope.videoData.data.attributes.thumbnail = response.data.items[0].snippet.thumbnails.high.url;
                    }
                }
            }, function errorCallBack(response) {
               console.log(response);
               Materialize.toast('A problem has occured, please check the console!', 5000);

            });
        }
    };
    $scope.ajaxPostToApi = function () {
        $http({
            method: 'POST',
            url: videoApi,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('youtubeToken')
            },
            data: $scope.videoData
        }).then(function successCallBack(response) {
            var $successCall = $('<span>Video Added!</span>').add($('<a class="btn-flat toast-action" href="#!">Done</a>'));
            Materialize.toast($successCall, 5000);
        }, function errorCallBack(response) {
            var $errorCall = $('<span>Error! Check logs in console!</span>').add($('<button class="btn-flat toast-action">Okay</button>'));
            Materialize.toast($errorCall, 5000);
            console.log(response);
        });
    };


    $scope.submitVideo = function () {
        if ($scope.videoData.data.attributes.playlistId === null) {
            $scope.videoData.data.attributes.playlistId = '0';
            $scope.ajaxPostToApi();
        } else {
            $scope.ajaxPostToApi();
        }
    };
});

YTChallengerApp.controller('listingPlaylist', function($http, $scope, $sce) {
    $scope.loadingPage = true;
    $http({
        method:'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('youtubeToken')
        },
        url: playlistApi
    }).then(function successCallBack(response) {
        $scope.loadingPage = false;
        $scope.listOfPlaylists = response.data.data;
        $scope.confirmationDelete = false;
    }, function errorCallBack(response) {
        Materialize.toast('Cannot load playlists because of a problem, please check the log!', 5000);
        console.log(response);
    });
    $scope.deletePlaylist = function (playlistID) {
        $scope.confirmationDelete = true;
        var deleteButton = 'delete' + playlistID;
        document.getElementById(deleteButton).classList.add("red-text");
        document.getElementById(deleteButton).classList.add("activator");
        $scope.noDelete = function () {
            document.getElementById(deleteButton).classList.remove("red-text");
            document.getElementById(deleteButton).classList.remove("activator");
            $scope.confirmationDelete = false;
            count = 0;
        }
        $scope.confirmedDelete = function (counting) {
            if(counting === 2) {
                $http({
                    method:'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('youtubeToken')
                    },
                    url: playlistApi + '/' + playlistID
                }).then(function successCallBack(response) {
                    Materialize.toast('Successfully deleted chosen playlist!', 5000);
                    document.getElementById(playlistID)
                    console.log(response)
                }, function errorCallBack(response) {
                    Materialize.toast('Error in deleting chosen playlist!', 5000);
                    console.log(response);
                });
            }
        }
    };
});

YTChallengerApp.controller('createPlaylist', function ($http, $scope) {
   $scope.validPlaylistDetails = false;
    $scope.playlistData = {
       "data": {
           "type":"Playlist",
           "attributes":{
               "name": "",
               "description": "",
               "thumbnailUrl": ""
           }
       }
   };
    $scope.addPlaylist = function () {
       $http ({
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': localStorage.getItem('youtubeToken')
           },
           url: playlistApi,
           data: $scope.playlistData
       }).then(function successCallBack(response) {
           Materialize.toast('Successfully created '+ $scope.playlistData.data.attributes.name, 3000);
           var timer = setTimeout(function() {
               $window.location.href = '#!playlist';
           }, 1000);
       }, function errorCallBack(response) {
           Materialize.toast('Error in creating playlist!', 3000);
           console.log(response);
       })
   }
});


YTChallengerApp.controller('playlistInDetail', function ($http, $scope, $location, $window) {
    var playlistId = $location.search().id;
    $scope.deleteConfirmation = false;
    $http ({
       method:'GET',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': localStorage.getItem('youtubeToken')
       },
       url: playlistApi
   }).then(function successCallBack(response) {
       const playlistDetails = response.data.data;
       $scope.playlistToShow = playlistDetails.find(item => item.id === playlistId);
       $scope.createdTime = new Date($scope.playlistToShow.attributes.createdTimeMLS).toLocaleDateString();
       $http({
           method:'GET',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': localStorage.getItem('youtubeToken')
           },
           url: 'https://youtube-api-challenger2.appspot.com/videos?playlist=' + playlistId + '&page=1&limit=100'
       }).then(function successCallBack(response){
           $scope.playlistDetailVideos = response.data.data;
           $scope.deletePlaylist = function (playlistID) {
                $http({
                    method:'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('youtubeToken')
                    },
                    url: playlistApi + '/' + playlistID
                }).then(function successCallBack(response) {
                    Materialize.toast('Successfully deleted playlist ' + response.data.data.attributes.name, 3000);
                    $scope.deleteConfirmation = false;
                    var timer = setTimeout(function() {
                        $window.location.href = '#!playlist';
                    }, 1000);

                }, function errorCallBack(response) {
                    Materialize.toast('Error in deleting playlist!', 3000);
                    console.log(response);
                });
           }
       }, function errorCallBack(response){
           Materialize.toast('Uh oh, we might have encountered an error!', 5000);
           console.log(response);
       });
    }, function errorCallBack(response) {
       console.log(response);
   });
});