The Asteroids Near Uranus
=========================

A simple side-scrolling shoot-em-up game made in HTML5 Canvas for the Javascript course (DV1483) at Blekinge Tekniska Högskola. Fly through the asteroid field and avoid crashing into the rocks. Use the laser cannons to blast away rocks in front of your ship.

The WebAudio API is used for sound and gives much improved performance over using the ``<audio>``-tag.

The multiplayer version requires a Node.js-server and browsers with support for WebSockets and WebRTC. The WebSockets server is used for signaling and the WebRTC data channel is used for peer-to-peer gaming.

The multiplayer part is very much WIP. The game lobby and the WebRTC connection is working well. However, the sync is rudimentary and needs improvement. Lots of refactoring is needed to separate multiplayer code from singleplayer code, as this grew out of a singleplayer game.

Installation
-----------

Install all files in the www/ directory on your web server. Make sure to make the game/hiscore.json file writable with:

``chmod 777 hiscore.json``

For multiplayer:

Use ``npm install`` to install the dependency (theturtle32/WebSocket-Node).

Set port number the server should listen to in ``server.js``.

Set the server name and port number for ``websocket_url`` in ``multiplayer.js``.

If you want to restrict request origin, do so in the ``connectionIsAllowed()`` function in ``server.js``.

Start the server with ``node server.js``.

Google's STUN server is used as default for the signaling and can be used for demo purposes.

Credits
-------

Based on the game Asteroid Avoidance in the book Foundation HTML5 Canvas: For Games and Entertainment by Rob Hawkes.

Images:

Asteroids and superb looking explosion sprites are made by Krasi Wasilev (http://freegameassets.blogspot.com).

Galaxy background is taken from http://hdwallpaperbackgrounds.net/distant-galaxy-stars-wallpapers/


Sounds from freesounds.org:

beeps.wav by atari66: http://www.freesound.org/people/atari66/sounds/64119/

BFG Laser by TheHadNot: http://www.freesound.org/people/TheHadnot/sounds/160880/

CinematicBoomNorm.wav by HerbertBoland: http://www.freesound.org/people/HerbertBoland/sounds/33637/

Explosion_01.wav by tommcann: http://www.freesound.org/people/tommccann/sounds/235968/

Mystery & Adventure theme by tyops: http://www.freesound.org/people/tyops/sounds/264873/

Powerup by RandomationPictures: http://www.freesound.org/people/RandomationPictures/sounds/138485/

Thruster_Level_II.aif by nathanshadow: http://www.freesound.org/people/nathanshadow/sounds/22455/

External libs:

AudioContext MonkeyPatch by Chris Wilson is used for the WebAudio part, to ease the trouble with vendor prefixes.

https://github.com/cwilso/AudioContext-MonkeyPatch
