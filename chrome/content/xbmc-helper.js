function getVideoUrl(url) {
    var type = 'youtube';
    var videoId = getUrlVars(url, 'v');

    if (url.indexOf('vimeo') != -1) {
        type = 'vimeo';
        var index = url.lastIndexOf('/');
        if (url.indexOf('#') != -1) {
            index = url.indexOf('#');
        }
        videoId = url.substring(index + 1, url.length);
    }

    if (url.indexOf('collegehumor') != -1) {
        type = 'collegehumor';
        videoId = url.replace('http://www.collegehumor.com/', '');
    }

    return getPluginPath(type, videoId);
}

function playItem(url) {
    var videoUrl = getVideoUrl(url);

    playVideo(videoUrl);
}

function queueItem(url) {
    var videoUrl = getVideoUrl(url);

    addItemToPlaylist(videoUrl);
}

function getPluginPath(type, videoId) {
    switch (type) {
        case 'youtube':
        case 'vimeo':
            return  'plugin://plugin.video.' + type + '/?action=play_video&videoid=' + videoId;
        case 'collegehumor':
            return  'plugin://plugin.video.' + type + '/watch/' + encodeURIComponent(videoId) + '/';

        default:
            return '';
    }
}


function getUrlVars(url, attribute) {
    var vars = [], hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars[attribute];
}

function ajaxPost(data, callback) {
    var url = getURL();
    var fullPath = url + "/jsonrpc";

    jQuery.ajax({
        type: 'POST',
        url : fullPath,
        success: function(result) {
            callback(result);
        },
        contentType: "application/json",
        data : data
    });
}

function playVideo(video_url) {
//    console.log(fullPath);
    var data = '{"jsonrpc": "2.0", "method": "Player.Open", "params":{ "item" :{"file" : "' + video_url + '" }}, "id" : 1}';

    ajaxPost(data, function() {});
}

function initVideoButton() {
    chrome.tabs.getSelected(null, function(tab) {
        //properties of tab object
        var url = tab.url;

        // check URL
        var valid = false;
        if (url.indexOf('youtube') != -1) valid = true;
        if (url.indexOf('vimeo') != -1) valid = true;
        if (url.indexOf('collegehumor') != -1) valid = true;

        // if valid, enable button
        if (valid) {
            $("#playCurrentVideoButton").removeAttr('disabled');
            $("#queueVideoButton").removeAttr('disabled');
        }
    });
}

function clearPlaylist(callback) {
    var clearPlaylist ='{"jsonrpc": "2.0", "method": "Playlist.Clear", "params":{"playlistid":1}, "id": 1}';

    ajaxPost(clearPlaylist, function(result) {
        callback(result);
    });
}

function addItemToPlaylist(video_url) {
    var getActivePlayers = '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}';
    var addToPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Add", "params":{"playlistid":1, "item" :{ "file" : "' + video_url + '" }}, "id" : 1}';

    ajaxPost(getActivePlayers, function(result) {
        if ($.isEmptyObject(result.result)) {
            //If nothing is playing, clear the list, probably left over from be
            clearPlaylist(function(){});
        }
        ajaxPost(addToPlaylist, function(){
            ajaxPost(getActivePlayers,function( result ){
                var playVideo = '{"jsonrpc": "2.0", "method": "Player.Open", "params":{"item":{"playlistid":1, "position" : 0}}, "id": 1}';

                //if nothing is playing, play what we inserted
                if (jQuery.isEmptyObject(result.result)){
                    ajaxPost(playVideo, function() {});
                }
            });
        });
    });
}

function getPlaylist() {
    var getcurrentplaylist = '{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params":{"playlistid":1}, "id": 1}';

    ajaxPost(getcurrentplaylist, function(data) {
        data.result.items;
    });
}

function playCurrentUrl() {
    doAction(actions.Stop, function() {
        clearPlaylist(function() {
            queueCurrentUrl();
        });
    });
}