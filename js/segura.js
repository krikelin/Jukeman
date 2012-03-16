$(document).ready(function(){
	// Associate menu click event handler
	$("nav ul li").each(function(){
		$(this).click(function(){
			$(this).html($(this).html()+"<img style=\"float: right;padding-right:3px;\" src=\"img/wait16circle2.gif\" />");
		});
	});
	
	// Animate the head img
	kickback();
});
function kickback(){
	console.log("F");
	var r = Math.round(Math.random()*4);
	console.log(r);
	var img = $("#headimg");
	switch(r)
	{
	case 1:
	case 0:
		img.css("background-size","130%");
		img.animate({'background-size':'100%',
	
		}, 5212, function(){
			setTimeout("kickback()",3000);
		} );
		break;
	case 1:
		img.css("background-size","130%");
		img.css("background-left","0");
		img.animate({'background-left':'-15px',
	
		}, 5212, function(){
			setTimeout("kickback()",3000);
		} );
		break;
	case 2:
		img.css("background-size","130%");
		img.css("background-left","-100px");
		img.animate({'background-left':'+=100px',
	
		}, 5212, function(){
			setTimeout("kickback()",3000);
		} );
		break;
	default:
	case 3:
	 
		img.css("background-size","130%");
		img.css("background-top","0");
		img.animate({'background-top':'30px',
	
		}, 5212, function(){
			setTimeout("kickback()",5000);
		} );
		break;
	}
}
