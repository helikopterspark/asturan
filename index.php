<?php $title = 'Asteroids Near Uranus';include __DIR__ . '/template/header.php';?>

<style type="text/css">
body {
	background-attachment: fixed;
}

#intro {
	background-image: url('screenshots/bk_screen.png');
	height: 200px;
	padding: 40px;
	margin-bottom: 40px;
}

p {
	line-height: 2em;
	text-shadow: none;
	font-size: 18px;
}
.simple_link {
	text-decoration: underline;
}

#introtext, #mpText {
    display: block;
    width: 60%;
    margin: 0 auto;
    margin-bottom: 80px;
    margin-top: 30px;
    padding: 40px;
}

#asteroid_belt img {
	box-shadow: none;
	margin-top: 30px;
}

#img1, #asteroid_belt {
    text-align: center;
}

#img1Bkg, #screens1Bkg, #mpWrap {
	background-color: #111;
	width: 100%
}

#img1 img {
	margin-bottom: 40px;
	margin-top: 40px;
}

img {
	box-shadow: 0 0 10px #fff,
            0 0 20px #fff,
            0 0 30px #0066CC,
            0 0 40px #0066CC;
    z-index: 99;
}

.small_fig {
	display: inline-block;
	margin: 20px;
}

#infoText {
    display: block;
    width: 60%;
    margin: 0 auto;
    margin-top: 40px;
    padding: 40px;
}

#introHeading {
    margin-top: 80px;
    margin-bottom: 80px;
    text-align: center;
    font-size: 56px;
}

#mpInfo, #screenshots {
	display: block;
	text-align: center;
	width: 75%;
	margin: 0 auto;
	margin-top: 40px;
	margin-bottom: 80px;
}

#mpInfo h2, #screenshots h2 {
	font-family: Orbitron;
    color: #fff;
    font-size: 48px;
    margin-bottom: 20px;

    text-shadow: 0 0 10px #fff,
        0 0 20px #fff,
        0 0 30px #0066CC,
        0 0 40px #0066CC;
}

.fig_div {
	margin-bottom: 40px;
}

#installation {
	list-style-image: url(favicon-16x16.png);
	margin-left: 20px;
	margin-bottom: 20px;
	text-shadow: none;
}

#bottom_feeder {
	margin: 0 auto;
	margin-top: 40px;
	margin-bottom: 40px;
	padding-bottom: 40px;
	width: 60%;
	text-align: center;
}

</style>
	<div id="intro">
		<h1 id="introHeading">The Asteroids Near Uranus</h1>
	</div>
	<div id="img1">
		<figure>
			<img class="clickable" src="screenshots/screen3.png" alt="Asteroids game over" width="850" height="425" border="0">
		</figure>
		<a class="button" href="game.php">Play now!</a>
	</div>
	<!--
	<figure id="asteroid_belt">
		<img src="img/asteroid_sprite2	.png" alt="asteroid belt" width="920" height="50" border="0">
	</figure> -->
<div id="img1Bkg">
	<div id="introtext">
		<p>Welcome to the homepage for The Asteroids Near Uranus game. It is a simple and classic space shoot-em-up, easy enough for everyone to play but hard to master! Play for just a few minutes or spend entire days trying to beat the high score.</p>
		<p>&nbsp;</p>
		<p>How long can you survive the ever increasing hailstorm of asteroids? How many triple hits can you make? You will be thrown into a gunship or a smuggler vessel depending on chance. You must maneuver between the rocks and ice chunks of the Uranus asteroid belt. Keep those thrusters going or your maneuver control decreases. To your aid you have a powerful three barrel laser cannon. Beware, the cannon needs to recharge, so be sure to fire at the right moment. And do not miss or soon you will be eating space dust...</p>
	</div>
</div>
<div id="screenshots">
		<h2>Screenshots</h2>
		<div class="fig_div">
		<figure class="small_fig">
			<img class="clickable" src="screenshots/open_screen.png" alt="Asteroids startscreen" width="400" height="200" border="0">
		</figure>
		<figure class="small_fig">
			<img class="clickable" src="screenshots/screen2.png" alt="Asteroids startscreen" width="400" height="200" border="0">
		</figure>
		<figure class="small_fig">
			<img class="clickable" src="screenshots/screen1.png" alt="Asteroids" width="400" height="200" border="0">
		</figure>
		<figure class="small_fig">
			<img class="clickable" src="screenshots/go_screen.png" alt="Asteroids game over" width="400" height="200" border="0">
		</figure>
		</div>
</div>
<div id="screens1Bkg">
	<div id="mpText">
		<p>Want to take a step further and challenge your friends to a one-on-one race through the asteroid field? With WebRTC that is a reality. The multiplayer version features peer-to-peer connection between WebRTC-compatible web browsers for minimal latency between players. A fast connection is recommended on both ends for maximum smoothness in gameplay.</p>
		<p>&nbsp;</p>
		<p>Enter the game lobby and find someone to play with in the chat. When a link is established, hit the spacebar to start the multiplayer session. Play together or try to take down each other with the lasers, while avoiding the asteroids. Between sessions you can chat directly and privately to each other via the datachannel.</p>
	</div>
</div>
	<div id="mpInfo">

		<h2>Multiplayer Screenshots</h2>
		<div class="fig_div">
		<figure class="small_fig">
			<img class="clickable" src="screenshots/mp_screen2.png" alt="Asteroids startscreen" width="400" height="200" border="0">
		</figure>
		<figure class="small_fig">
			<img class="clickable" src="screenshots/mp_screen5.png" alt="Asteroids startscreen" width="400" height="200" border="0">
		</figure>
		<figure class="small_fig">
			<img class="clickable" src="screenshots/mp_screen4.png" alt="Asteroids startscreen" width="400" height="200" border="0">
		</figure>
		<figure class="small_fig">
			<img class="clickable" src="screenshots/mp_screen3.png" alt="Asteroids startscreen" width="400" height="200" border="0">
		</figure>
		</div>
	</div>
<div id="mpWrap">
	<div id="infoText">
		<p>The game is written in JavaScript and PHP to explore the possibilities of HTML5 and modern web technologies. It makes use of jQuery for manipulating DOM objects, HTML5 canvas for animated graphics and the WebAudio API for sound.</p>
		<p>&nbsp;</p>
		<p>The multiplayer part uses the WebRTC datachannel for peer-to-peer connection and Websockets for the game lobby and signaling between peers (requires a Node.js server).</p>
		<p>&nbsp;</p>
		<p>You may download and install the game on your own web server:</p>
		<ul id="installation">
			<li>Get the code from <a class="simple_link" href="https://github.com/helikopterspark/asturan">github</a></li>
			<li>Deploy the files on your web server</li>
			<li>Run <code>npm install</code> to install the Websockets module</li>
			<li>Make the <i>hiscore.json</i> file writable</li>
			<li>Configure the server settings (full instructions in the README.md-file)</li>
			<li>Start the Node server with <code>node server.js</code> to enable multiplayer.</li>
		</ul>
		<p>Your monitor should preferably be 1200x800 pixels or larger. Turn up the volume and play in your favourite HTML5 capable browser!</p>
		<p>&nbsp;</p>
		<p>End transmission...&#9608;</p>
	</div>
</div>
	<div id="bottom_feeder">
		<p>Written by Carl Ramsell. The code carries a MIT license. Please see the readme file in the <a class="simple_link" href="https://github.com/helikopterspark/asturan">github</a> repo for full credits.</p>
		<p>Copyright &#9400; Carl Ramsell 2016</p>
	</div>
<!-- </div>
<div id="img1Bkg"></div>
<div id="screens1Bkg"></div> -->

<script type="text/javascript" src="template/js/jquery.thelightboxgallery.js"></script>
<script type="text/javascript">
	$('.clickable').hover(function() {
		$(this).css('box-shadow', '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #0066CC, 0 0 70px #0066CC, 0 0 80px #0066CC');
	}, function() {
		$(this).css('box-shadow', '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0066CC, 0 0 40px #0066CC');
	});
	$('.clickable').click(function() {
    	$(this).addLightbox();
	});
</script>

<?php $path = __DIR__;include __DIR__ . '/template/footer.php';?>