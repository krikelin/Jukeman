/***
Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var views = sp.require("sp://import/scripts/api/views");
var jquery = sp.require("js/jquery-1.7.min");
var player = models.application.player;
exports.init = init;
var playlist = null;
var cache = new Array();
function init(){
	load();
}
function switch_section(section) {
	$(".section").each(function(index) {
		
		$(this).hide();
	});

	document.getElementById("section_" + section).style.display="block";

	
}
var first = true;
var changable = false;
/***
Generate a new track
****/
var temp_playlist = null;
var tile_size = 256;
var left = 1220;
function getLeft(no) {
	return   window.innerWidth +((no) * tile_size);
}
function scrollTo(no) {	
	$("#l_track").html("");
	$("#r_track").html("");
	$("#track").html("");
	var track = temp_playlist.get(no);
	// Create first view
	var player = new views.Image(track.data.album.cover, track.data.uri, "M");
	player.node.style.width = "340px";
	player.node.style.height = "340px";
	
	$("#track").append(player.node);
	
	// Create left and rightview
	
	// Create left view
	if(no > 0) {
		track = temp_playlist.get(no - 1);
		var l_player = new views.Image(track.data.album.cover, track.data.uri, "M");
	
		l_player.node.style.width = "120px";
		l_player.node.style.height = "120px";
		$("#l_track").append(l_player.node);
	}
	if(no < temp_playlist.tracks.length - 1) {
		track = temp_playlist.get(no+1);
		var r_player = new views.Image(track.data.album.cover, track.data.uri, "M");
	
		r_player.node.style.width = "120px";
		r_player.node.style.height = "120px";
		$("#r_track").append(r_player.node);
	}
	
}
function scrobble(user) {
	if(!activated) {
		return;
	}
	var users = [user];
	if(user.indexOf(",")!=-1) {
		users = user.split(",");
	}
	
	for(var i = 0; i < 5; i++) {
		// Get toplist of user
		var  toplist = new models.Toplist();
		// Select mode by random
		var c = 1;
		switch(c) {
			case 1:
				toplist.toplistType = models.TOPLISTTYPE.USER;
				toplist.matchType = models.TOPLISTMATCHES.TRACKS; 
				toplist.userName = users[Math.floor(users.length*Math.random())];
				toplist.observe(models.EVENT.CHANGE, function() {
					console.log(Math.floor(toplist.results.length*Math.random()));
					var _track = toplist.results[Math.floor(toplist.results.length*(1-Math.random()))];
						console.log(_track.data);	
						console.log(_track.data.artists[0].uri);
					var __artist = models.Artist.fromURI(_track.data.artists[0].uri, function(artist) {
						console.log(artist);
						console.log(artist.data.name);
						var search = new models.Search("artist:\"" + artist.data.name + "\"");
						search.observe(models.EVENT.CHANGE, function() {
							var track = search.tracks[Math.floor(search.tracks.length*Math.random())];
							temp_playlist.add(track);
							if(temp_playlist.length > 0) {
								if(first) {
									scrollTo(0);
									models.player.play(temp_playlist.get(0), temp_playlist);
									first = false;
								}
							} else {
							}
						});
						search.appendNext();
					});
				});
				toplist.run();
				break;
			case 0:
				toplist.toplistType = models.TOPLISTTYPE.USER;
				toplist.matchType = models.TOPLISTMATCHES.ARTISTS; 
				toplist.userName = users[Math.floor(users.length*Math.random())];
				toplist.observe(models.EVENT.CHANGE, function() {
					console.log(Math.floor(toplist.results.length*Math.random()));
					var _artist = toplist.results[Math.floor(toplist.results.length*(1-Math.random()))];
					console.log(_artist.data);	
					console.log(toplist.results);
					var __artist = models.Artist.fromURI(_artist.data.uri, function(artist) {
						console.log(artist);
						console.log(artist.data.name);
						var search = new models.Search("artist:\"" + artist.data.name + "\"");
						search.observe(models.EVENT.CHANGE, function() {
							var track = search.tracks[Math.floor(search.tracks.length*Math.random())];
							temp_playlist.add(track);
							if(temp_playlist.length > 0) {
								if(first) {
									scrollTo(0);
									models.player.play(temp_playlist.get(0), temp_playlist);
									first = false;
								}
							} else {
							}
						});
						search.appendNext();
						
							
							// This was removed in one build
						/*	artist.getAlbums(function(albums) {
								console.log(albums);
								var album = albums[Math.floor(Math.random()*albums.length)];
								models.Album.fromURI(album.uri, function(album) {
									var track = album.tracks[Math.floor(album.tracks.length*Math.random())];
									temp_playlist.add(track);
								});
							});*/
					});
				});
				
				
				toplist.run();
				
				break;
		}
	}
}
var genre ="";
var user = "";
var can_change = true;
var preTrack = null;
var nowTrack = null;
var activated = true;
function load(){
	console.log(models.EVENT);
	temp_playlist = new models.Playlist();

	$("#btnGo").bind("click", function(e) {
		var user = document.getElementById("user").value;

		self.location="spotify:app:jukeman:" + user ;
	});

	models.application.observe(models.EVENT.ACTIVATE, function() {
		activated = true;
	});
	models.application.observe(models.EVENT.DEACTIVATE, function() {
		activated = false;
	});
	models.application.observe(models.EVENT.ARGUMENTSCHANGED, function() {
		document.body.style.backgroundImage = "";
		activated = true;
		var args = models.application.arguments;
		console.log(args);
		temp_playlist = new models.Playlist();
		first = true;
		
		try {
			
			if(args.length > 0) {
		
				user = args[0];
				$("#username").html(user);
		//		switch_section("radio");
				scrobble(user);
			} else {
				$("#username").html("Jukeman");
			//	switch_section("overview");
			}
		} catch( e) {
			
			console.log(e.stack);
		}
	});
	
	models.player.observe(models.EVENT.CHANGE, function(event) {
		
		if(temp_playlist == null)
			return;
		
		if(event.data.curtrack) {
			console.log("F");
			var track = models.player.track;
			
			var pos = temp_playlist.indexOf(track);
			if(pos > temp_playlist.tracks.length - 3) {
				scrobble(user);
			}
			scrollTo(pos);
		}
	});
	
}