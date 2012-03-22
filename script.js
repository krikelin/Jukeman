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
var current_uri = "";
var playlist = null;
var cache = new Array();
var mode = "user";
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
function resume() {
	if(!models.player.playing) {
		document.getElementById("player").setAttribute("class", "play");
		models.player.play(temp_playlist.get(pos), temp_playlist);
	} else {
		document.getElementById("player").setAttribute("class", "paused");
		models.player.stop();
	}
}
function scrollTo(no) {	
	try {
		pos = no;
		var track = temp_playlist.get(no);
		console.log($(".cover"));
		// Shift the others to the left
		$(".cover").each(function(index) {
			console.log("Aw");
			$(this).animate({left:"-=155px", top:"+=15px", height: "-=30px", width:"-=35px", opacity: "-=0.25"});
			if($(this).css("opacity") < 0.25) {
				$(this).remove();
			}
		});
		// Create first view
		var player = new views.Image(track.data.album.cover, track.data.uri, "M");
		player.node.style.width = "252px";
		player.node.style.height = "252px";
		player.node.style.position = "absolute";
		player.node.style.left = "320px";
		player.node.style.top = "120px";
		console.log(player.node);
		$(player.node).addClass("cover");
		
		document.getElementById("radio").appendChild(player.node);
		console.log($("#radio"));
		$(player.node).fadeIn();
		$("#player").css({ width: 79, height: 79, "z-index" : 11});
		
	} catch (e) {
		console.log(e);
	}	
}
function prepareShowQuery(str, date) {
	if(typeof date == "undefined") {
		date = new Date();
	}
	str = str.replace("%d", date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate());
	str = str.replace("%t", date.getHours()+ ":" + date.getMinutes());
	return str;
}
var playlist = "";
var radio_pos = 0;
var show_queries = ["Deluxe  P3", "Sommar P1", "Mammas nya kille P3"];
var show = false;	
var users = "";
var pos = 0;
var playlist = null;
function scrobble() {
	if(!activated) {
		return;
	}
	var users = [user];
	if(user == "$me") {
		var friends = ["drsounds"];
	}
	console.log(user);
	if(user!=null) {
		if(user.indexOf(",")!=-1) {
			users = user.split(",");
			
		}
	}
	// Invalidate all classes
	$(".user").each(function(index) {
		$(this).removeClass("playing");
		console.log("REMOVED");
	});
	var date = new Date();
	for(var i = 0; i < 5; i++) {
		// Get toplist of user
		var  toplist = new models.Toplist();
		// Select mode by random 
		if(date.getMinutes() >= 0 && date.getMinutes() <= 5 && show && show_queries.length > 0 ) {
			if(radio_pos > show_queries.length -1) {
				radio_pos = 0;
			}
			var show_query = show_queries[radio_pos];
			radio_pos++;
			console.log(show_query);
			// If the show query is a sptoify uri use it, otherwise search it like a string
			if(show_query.indexOf("spotify:track") == -1) {
				var search = new models.Search(prepareShowQuery(show_query, date), {localResults: models.LOCALSEARCHRESULTS.PREPEND});
				search.observe(models.EVENT.CHANGE, function() {
					console.log(search.tracks.length);
					if(search.tracks.length > 0) {
					
						var track2 = search.tracks[0];
						console.log(track2);
						temp_playlist.add(track2);
						if(temp_playlist.length > 0) {
							if(first) {
								scrollTo(0);
								models.player.play(temp_playlist.get(0), temp_playlist);
								first = false;
							}
						} else {
						}
					}
				});
				search.appendNext();
			} else {
				models.Track.fromURI(show_query, function(track) {
					temp_playlist.add(track);
				});
			}
		}
		if(mode == "playlist") {
			var pls = models.Playlist.fromURI("spotify:user:" + user + ":playlist:" + playlist, function(playlist) {
				var track = playlist.tracks[Math.floor(playlist.tracsk.length*Math.random())];
				var search = new models.Search("artist:\"" + track.data.artists[0].uri +"\"", { "pageSize": 120, "searchTracks": true, "searchPlaylists": false, "searchArtists": false});
				search.observe(modes.EVENT.CHANGE, function() {
					var track2 = search.tracks[Math.floor(search.tracks.length*Math.random())];
					temp_playlist.add(track2);
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
		}else if(mode == "user") {
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
}
var genre ="";
var user = "";
var can_change = true;
var preTrack = null;
var nowTrack = null;
var activated = true;
function addPlaylist() {
	var playlist = new models.Playlist("Jukeman: " + user + "");
	temp_playlist.tracks.forEach(function(track) {
		playlist.add(track);
	});
}
function update() {
	try {
		document.body.style.backgroundImage = "";
		activated = true;
		var args = models.application.arguments;
		console.log(args);
		temp_playlist = new models.Playlist();
		
		first = true;
		
		if(args.length > 1) {
			
			mode = args[0];
			user = args[1];
			
			if(args.length > 2) {
				playlist = args[3];
				mode = "playlist";
			}
			
			console.log("F");
			// Create user 
			var users = [user];
			console.log(user);
			if(user.indexOf(",")!=-1) {
				users = user.split(",");
			}
			var nav = document.getElementById("users_list");
			$(nav).html(""); // Clear
			
			for(var i = 0; i < users.length; i++) {	
				console.log("USERS");
				var li = document.createElement("li");
				
				$(li).addClass("user");
				
				li.setAttribute("id", "u_" + users[i]);
				var a = document.createElement("a");
				a.setAttribute("href", "spotify:user:" + users[i]);
				$(a).html(users[i]);
				li.appendChild(a);
				$("#users_list").append(li);
			}
		
	//		switch_section("radio");
			scrobble();
		} else {
			user = "$me";
			var li = document.createElement("li");
			
			$(li).addClass("user");
			
			li.setAttribute("id", "u_friends");
			var a = document.createElement("a");
			a.setAttribute("href", "spotify:app:people:spotify");
			$(a).html("Me");
			li.appendChild(a);
			$("#users_list").append(li);
		//	switch_section("overview");
		}
	} catch( e) {
		
		console.log(e.stack);
	}
}
function load(){
	console.log(sp.social);
	console.log(sp);
	document.getElementById("addPlaylist").addEventListener("click", addPlaylist);
	
	temp_playlist = new models.Playlist();
	document.getElementById("player").addEventListener("click", function() {
		if(!models.player.playing) {	
			document.getElementById("player").setAttribute("class", "play");
			models.player.playing = true;
			
		} else {
			document.getElementById("player").setAttribute("class", "paused");
			models.player.playing = false;
		}
	});
	$("#btnGo").bind("click", function(e) {
		var user = document.getElementById("user").value;

		self.location="spotify:app:jukeman:" + user ;
	});
	update();
	models.application.observe(models.EVENT.ACTIVATE, function() {
		activated = true;
	});
	models.application.observe(models.EVENT.DEACTIVATE, function() {
		activated = false;
	});
	models.application.observe(models.EVENT.ARGUMENTSCHANGED, function() {
		current_uri = self.location.href;
		update();
	});
	
	models.player.observe(models.EVENT.CHANGE, function(event) {
		
		if(!models.player.playing) {
			document.getElementById("player").setAttribute("class", "play");
		
		} else {
			document.getElementById("player").setAttribute("class", "paused");
		
		}
		
		
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