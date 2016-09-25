<?php $title = 'Asteroids Near Uranus';include __DIR__ . '/template/header.php';?>

<div id="aflash">

<div id="game">
    <h1 id="loadHeading">LOADING GAME...</h1>
    <div id="gameUI" hidden>
        <div id="gameIntro">
            <h1 id="gameHeading1">The Asteroids Near Uranus</h1>
            <p><br></p>
            <form><label>Enter your acronym (3 chars): </label><input type="text" id="player_acronym" maxlength="3" autofocus /></form>
            <p><br>
                Select singleplayer or multiplayer.
            </p>
            <p id="buttonPara"><br>
                <a id="gamePlay" class="button" href="">Singleplayer</a>
                <a id="mpGamePlay" class="button" href="">Multiplayer</a>
            </p>
            <div id="connecting" hidden>
                <p id="connectPara">Connecting...</p>
            </div>
        </div>
        <div id="multiplayerlobbyscreen" class="gamelayer" hidden>
            <h2 id="mpLobbyHeading">Multiplayer Lobby</h2>
            <div id="lobbyMessage">
                <p id="lobbyMessagePara"></p>
            </div>
            <select id="multiplayergameslist" size="8">
                <option>Not connected to game server</option>
            </select>
            <div>
                <a id="multiplayerjoin" class="button" href="">Join</a>
                <a id="multiplayercancel" class="button" href="">Cancel</a>
            </div>
            <div id="chat">
            <h2 id="mpChatHeading">Comms</h2>
                <div id="chatlog">
                    <ul id="chatmessageslist"></ul>
                </div>
                <input id="chatmessage" type="text" placeholder="Type message, hit return">
            </div>
        </div>
        <div id="gameStats" hidden>
            <p>
                Time: <span class="gameScore"></span> seconds<br>
                Score: <span class="gamePlayerScore"></span>
            </p>
            <p id="acronym"></p>
            <div id="charger">
        	<p>
        		Laser: <span id="chargelevel"></span>%
        	</p>
        </div>
        </div>
        <div id="gameComplete" hidden>
            <h1 id="gameHeading2">GAME OVER</h1>
            <p><br>
                You survived for <span class="gameEndTimeScore"></span> seconds<br>
                Your score: <span class="gamePlayerEndScore"></span>
            </p>
            <ul id="hiscorelist">HEROES:</ul>
            <p><br>
                <a class="gameReset button" href="">Play again</a>
                <a id="singleplayercancel" class="button" href="">Cancel</a>
            </p>
        </div>
        <div id="mpGameComplete" hidden>
            <h1 id="gameHeading3">GAME OVER</h1>
            <p><br>
                You survived for <span class="gameEndTimeScore"></span> seconds<br>
                Your score: <span class="gamePlayerEndScore"></span>
            </p>
            <p id="remoteScores"><br>
                <span class="remotePlayer"></span> survived for <span class="remoteTime"></span> seconds<br>
                <span class="remotePlayer"></span>'s score: <span class="remoteScore"></span>
            </p>
            <p><br>
                <a id="mpPlayAgain" class="button" href="">Play again</a>
                <a id="multiplayerlobby" class="button" href="">Main Menu</a>
            </p>
            <div id="chatWebRTC">
            <h2 id="mpChatHeadingWebRTC">Direct link</h2>
                <div id="chatlogWebRTC">
                    <ul id="chatmessageslistWebRTC"></ul>
                </div>
                <input id="chatmessageWebRTC" type="text" placeholder="Type message, hit return">
            </div>
        </div>
        <div id="gameMessage" hidden>
        	<h2 id="gameMessageHeading"></h2>
        	<p><br><br></p>
        	<p id="gameMessagePara"></p>
            <div id="gameInstructionColumn1">
                <p>RIGHT ARROW<br>
                UP ARROW<br>
                DOWN ARROW<br>
                SPACE<br>
                1<br>
                2</p>
            </div>
            <div id="gameInstructionColumn2">
                <p>=<br>
                =<br>
                =<br>
                =<br>
                =<br>
                =<br></p>
            </div>
            <div id="gameInstructionColumn3">
                <p>Thruster<br>
                Move up<br>
                Move down<br>
                Fire<br>
                Volume down<br>
                Volume up</p>
            </div>
        </div>
        <div id="connectingDataChannel" hidden>
            <h3 id="connectHeading">DATACHANNEL CONNECTION FAILED</h3>
            <a id="cancelConnect" class="button" href="">Cancel</a>
        </div>
    </div>

    <canvas id="gameCanvas" width="1200" height="600">Game over. Your browser does not support HTML5.</canvas>

    <div id="creditlink"><p>Copyright &#9400; Carl Ramsell 2016 | Credits and code on <a class="simple_link" href="https://github.com/helikopterspark/asturan">github</a></p></div>

    <div id="volume" hidden>
        <div class="volume_controls">
            <div class="volume_header"><p>VOLUME: <span class="volume1">90</span></p></div>
        </div>
        <div>
    	   <div class="volume_slider"><input id="sliderMaster" type ="range" min ="0" max="99" step ="1" value="60"/>
           </div>
        </div>
    </div>
</div>
</div>
<script src="game/main.js"></script>
<?php $path = __DIR__;include __DIR__ . '/template/footer.php';?>