/**
* Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

/**
* Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
*/
window.cancelRequestAnimFrame = (function(){
    return  window.cancelRequestAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame    ||
    window.oCancelRequestAnimationFrame      ||
    window.msCancelRequestAnimationFrame     ||
    window.clearTimeout;
})();

/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
window.Key = {
  pressed: {},

  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40,
  SPACE:  32,
  A:      65,
  S:      83,
  D:      68,
  W:      87,
  VOLUP:  50,
  VOLDOWN: 49,

  isDown: function(keyCode, keyCode1) {
    return this.pressed[keyCode] || this.pressed[keyCode1];
  },

  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  }
};

//window.addEventListener('keyup',   function(event) { Key.onKeyup(event);},   false);
//window.addEventListener('keydown', function(event) { Key.onKeydown(event);}, false);

'use strict';

// All objects are vectors
function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector.prototype = {
    // Multiply with scalar
    muls: function(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    },

    // Multiply itself with scalar
    imuls: function(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },

    // Add with scalar
    adds: function(scalar) {
        return new Vector(this.x + scalar, this.y + scalar);
    },

    // Add itself with Vector
    iadd: function(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    },
}

// The forces around us
function Forces() {
    this.all = {};
}

Forces.prototype = {
    createAcceleration: function(vector) {
        return function(velocity, td) {
            velocity.iadd(vector.muls(td));
        }
    },

    createDamping: function(damping) {
        return function(velocity, td) {
            velocity.imuls(damping);
        }
    },

    createWind: function(vector) {
        return function(velocity, td) {
            velocity.iadd(vector.adds(td));
        }
    },

    addAcceleration: function(name, vector) {
        this.all[name] = this.createAcceleration(vector);
    },

    addDamping: function(name, damping) {
        this.all[name] = this.createDamping(damping);
    },

    addWind: function(name, vector) {
        this.all[name] = this.createWind(vector);
    },

    update: function(object, td) {
        for (var force in this.all) {
            if (this.all.hasOwnProperty(force)) {
                this.all[force](object, td);
            }
        }
    },
}

window.Forces = new Forces();
window.Forces.addAcceleration('gravity', new Vector(0, 9.82));
window.Forces.addDamping('drag', 0.47);
window.Forces.addWind('wind', new Vector(0.5, 0));

// Asteroid class
var Asteroid = function(canvasWidth, canvasHeight, image) {
    this.radius = 5 + (Math.random() * 10);
    this.position = new Vector(canvasWidth + this.radius + Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight));
    this.vX = -5 - (Math.random() * 5);
    this.image = image || null;

    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = Math.abs(this.vX) / 2;
    this.numberOfFrames = 19;

    this.direction = 180;
    this.speedfactor = 110;
}

Asteroid.prototype = {

    draw: function(ctx, canvasWidth, canvasHeight) {
        var margin = 1.16;  // Compensate for margin in image

        if (this.position.x + this.radius < 0) {    // Recycle asteroids in the array
            this.radius = 5 + (Math.random() * 10);
            this.position.x = canvasWidth + this.radius;
            this.position.y = Math.floor(Math.random( ) * canvasHeight);
            this.vX = -5 - (Math.random() * 5);
            this.ticksPerFrame = Math.abs(this.vX) / 2;
        };

        ctx.drawImage(
            this.image,
            this.frameIndex * this.image.width / this.numberOfFrames,
            0,
            this.image.width / this.numberOfFrames,
            this.image.height,
            this.position.x - this.radius,
            this.position.y - this.radius,
            (this.radius*2)*margin,
            (this.radius*2)*margin);
    },

    update: function(td) {
        //this.position.x += this.vX - td;
        this.position.x += -(this.vX * this.speedfactor * Math.cos(this.direction) * td);

        this.tickCount += 1;

        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {
                // Go to the next frame
                this.frameIndex += 1;
            } else {
                this.frameIndex = 0;
            }
        }
    },

    detectCollisionXY: function(plr, td) {  // for asteroid against player
        var dX = plr.position.x - this.position.x;
        var dY = plr.position.y - this.position.y;
        var distance = Math.sqrt((dX * dX) + (dY * dY));
        if (distance - td < plr.halfWidth + this.radius) {
            return true;
        } else {
            return false;
        };
    },

    detectCollisionX: function(plr, td) {   // for asteroid against laser shot, x-plane must compensate for timediff
        var dX = plr.position.x - this.position.x;
        var dY = plr.position.y - this.position.y;
        var distance = Math.sqrt((dX * dX) + (dY * dY));
        if ((dY - 12 < this.radius && dY + 11 > 0 - this.radius) && (distance - td < plr.halfWidth + this.radius)) {
            return true;
        } else {
            return false;
        };
    },
}

// Player class
var Player = function(position, image, appearance, velocity, speed, direction, accelerateForce, breakForce, dampForce, chargerate, acronym) {
    this.width = 24;
    this.height = 24;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;

    this.position = position || new Vector();
    this.velocity = velocity || new Vector();
    this.speed = speed || new Vector();
    this.direction = direction || 0;
    this.accelerateForce = accelerateForce || Forces.createAcceleration(new Vector(270, 270));
    this.breakForce = breakForce || Forces.createDamping(0.97);
    this.dampForce = dampForce || Forces.createDamping(0.999);
    this.image = image || null;
    this.appearance = appearance || 0;

    this.moveRight = false;

    this.flameLength = 30;

    this.laser = 0;
    this.chargerate = chargerate || 0.125;
    this.fire = false;

    this.score = 0;
    this.time = 0;
    this.acronym = acronym || 'NOB';
    this.lost = false;
};

Player.prototype = {
    draw: function(ctx, canvasWidth, canvasHeight) {

        var surfaceGradient = ctx.createLinearGradient(this.position.x - this.halfWidth, this.position.y -8, this.position.x - this.halfWidth, this.position.y + this.halfHeight);

        if (this.moveRight) {
            this.drawFlame(ctx);
        };

        this.stayInArea(canvasWidth, canvasHeight);

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.halfWidth, this.degreesToRadians(90), this.degreesToRadians(270), false);
        ctx.arc(this.position.x + 8, this.position.y + this.halfHeight, this.halfWidth/4, 0, 2*Math.PI);
        ctx.moveTo(this.position.x, this.position.y - this.halfHeight);
        ctx.lineTo(this.position.x + this.width, this.position.y-1);

        ctx.lineTo(this.position.x + this.halfWidth, this.position.y-1);
        ctx.lineTo(this.position.x + this.halfWidth, this.position.y+3);

        ctx.lineTo(this.position.x + this.width, this.position.y+3);
        ctx.lineTo(this.position.x, this.position.y + this.halfHeight);

        ctx.clip();
        ctx.closePath();

        ctx.fill();
        ctx.drawImage(this.image, this.position.x - this.halfWidth, this.position.y - this.halfHeight);
        ctx.drawImage(this.image, this.position.x + this.halfWidth, this.position.y - this.halfHeight);
        ctx.drawImage(this.image, this.position.x, this.position.y);

        surfaceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        surfaceGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = surfaceGradient;
        ctx.fillRect(this.position.x - this.halfWidth, this.position.y - this.halfHeight, this.position.x + this.width, this.position.y + this.height);

        ctx.restore();        

        this.moveRight = false;
    },

    degreesToRadians: function (degrees) {
        return (degrees * Math.PI) / 180;
    },

    drawX: function(ctx, canvasWidth, canvasHeight) {

        var surfaceGradient = ctx.createLinearGradient(this.position.x - this.width, this.position.y - this.height + 4, this.position.x - this.width, this.position.y + this.halfHeight);

        if (this.moveRight) {
            this.drawFlameX(ctx);
        };

        this.stayInArea(canvasWidth, canvasHeight);
       
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.position.x-5, this.position.y - this.halfHeight);
        ctx.lineTo(this.position.x + this.halfWidth + 5, this.position.y - this.halfHeight + 9); // left frontedge
        ctx.lineTo(this.position.x + this.halfWidth + 5, this.position.y + 3); // right front edge
        ctx.lineTo(this.position.x-5, this.position.y + this.halfHeight);
        ctx.lineTo(this.position.x - 6, this.position.y + this.halfHeight);
        ctx.lineTo(this.position.x - 18, this.position.y + 5); // right rear edge
        ctx.lineTo(this.position.x - 18, this.position.y - 5); // left rear edge
        ctx.lineTo(this.position.x - 6, this.position.y - this.halfHeight);
        ctx.clip();
        ctx.closePath();
        ctx.fill();
        ctx.drawImage(this.image, this.position.x - 18, this.position.y - this.halfHeight);
        ctx.drawImage(this.image, this.position.x + 7, this.position.y - this.halfHeight);

        surfaceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        surfaceGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = surfaceGradient;
        ctx.fillRect(this.position.x - this.width, this.position.y - this.halfHeight, this.position.x + this.width, this.position.y + this.height);

        ctx.restore();

        // Cannons
        ctx.save();
        ctx.fillStyle = '#ccc';
        ctx.translate(this.position.x - 10, this.position.y - this.halfHeight - 2);
        ctx.fillRect(0, 0, 17, 1);
        ctx.fillRect(0, 26, 17, 1);
        ctx.restore();

        this.moveRight = false;
    },

    drawExplosion: function(ctx, image) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'lightblue';
        ctx.translate(this.position.x, this.position.y);
        ctx.drawImage(
            image,
            (image.width/70)*45,
            0,
            image.width/70,
            image.height,
            -this.width,
            -this.height,
            this.width*3,
            this.height*3);
        ctx.restore();
    },

    drawFlame: function(ctx) {
        ctx.save();
        ctx.translate(this.position.x - this.halfWidth + 5, this.position.y);

       if (this.flameLength == 30) {
            this.flameLength = 15;
            ctx.fillStyle = "white";
        } else {
            this.flameLength = 30;
            ctx.fillStyle = "#0066CC";
        };

        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-this.flameLength, 0);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    drawFlameX: function(ctx) {
        ctx.save();
        ctx.translate(this.position.x - this.halfWidth, this.position.y);

        if (this.flameLength == 30) {
            this.flameLength = 6;
            ctx.fillStyle = "yellow";
        } else {
            this.flameLength = 30;
            ctx.fillStyle = "red";
        };

        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(-this.flameLength - 15, 0);
        ctx.lineTo(0, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    throttle: function(td) {
        this.accelerateForce(this.speed, td);
    },

    breaks: function(td) {
        this.breakForce(this.speed, td);
        this.breakForce(this.velocity, td);
    },

    moveUpY: function(td) {
        this.dampForce(this.speed, td);
        this.position.y -= this.speed.y * Math.cos(this.direction) * td + td * 60;
        this.position.iadd(this.velocity.muls(td));
    },

    moveDownY: function(td) {
        this.dampForce(this.speed, td);
        this.position.y += this.speed.y * Math.cos(this.direction) * td + td * 60;
        this.position.iadd(this.velocity.muls(td));
    },

    moveForward: function(td) {
        this.dampForce(this.speed, td);
        this.position.x += this.speed.x * Math.cos(this.direction) * td;
        this.position.iadd(this.velocity.muls(td));
    },

    moveBackward: function(td) {
        this.dampForce(this.speed, td);
        //this.position.x -= 2;
        this.position.x -= td * 120;
    },

    stayInArea: function(canvasWidth, canvasHeight) {
        // Add boundaries
        if (this.position.x - this.halfWidth < 20) {
            this.position.x = 20 + this.halfWidth;
        } else if (this.position.x + this.halfWidth > canvasWidth - 20) {
            this.position.x = canvasWidth - 20 - this.halfWidth;
        }

        if (this.position.y - this.halfHeight < 20) {
            this.position.y = 20 + this.halfHeight;
        } else if (this.position.y + this.halfHeight > canvasHeight - 20) {
            this.position.y = canvasHeight - 20 - this.halfHeight;
        };
    },

    update: function(td) {
        if (Key.isDown(Key.UP, Key.W)) {
            this.moveUpY(td);
        }
        if (Key.isDown(Key.DOWN, Key.S)) {
            this.moveDownY(td);
        }
        if (Key.isDown(Key.RIGHT, Key.D)) {
            this.moveRight = true;
            this.throttle(td);
        } else {
            this.moveRight = false;
            this.breaks(td);
            this.moveBackward(td);
        }
        if (Key.isDown(Key.SPACE) && this.laser > 99) {
            this.fire = true;
            this.laser = 0;
        }
        this.moveForward(td);
        Forces.update(this.velocity, td);

        if (this.laser < 100) {
            this.laser += this.chargerate;
        }
    },

    updateMP: function(td, command) {
        if (command === 'right') {
            this.moveRight = true;
        }
        if (command === 'fire') {
            this.fire = true;
        }
    },

    detectCollisionX: function(projectile, td) {   // for player against laser shot, x-plane must compensate for timediff
        var dX = projectile.position.x - this.position.x;
        var dY = projectile.position.y - this.position.y;
        var distance = Math.sqrt((dX * dX) + (dY * dY));
        if ((dY - 12 < this.halfWidth && dY + 11 > 0 - this.halfWidth) && (distance - td < projectile.halfWidth + this.halfWidth)) {
            return true;
        } else {
            return false;
        };
    },
}

// Laser shot class
var Laser = function(height, width, position, velocity, direction, color, own) {
    this.height     = height        || 2;
    this.width      = width         || 40;
    this.position   = position      || new Vector();
    this.velocity   = velocity      || new Vector(1,1);
    this.direction  = direction     || 0;
    this.halfWidth  = this.width / 2;
    this.speed      = 1200;
    this.color      = color || 0;
    this.own        = own || false;
}

Laser.prototype = {
    
    draw: function(ctx, posX, posY) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.direction+Math.PI/2);
        
        ctx.shadowBlur = 15;
        
        if (this.color === 0) {
            ctx.shadowColor = "#9CFF00";
            ctx.fillStyle = '#9CFF00';
        } else {
            ctx.shadowColor = 'red';
            ctx.fillStyle = 'red';
        }

        ctx.fillRect(posX, posY, this.width, this.height);

        ctx.restore();
    },
    
    update: function(td) {
        this.position.x += this.speed * Math.cos(this.direction) * td;
        this.position.y += this.speed * Math.sin(this.direction) * td;
    },
    
    inArea: function(canvasWidth, canvasHeight) {
        if (this.position.x >= canvasWidth || 
            this.position.x <= 0 || 
            this.position.y >= canvasHeight || 
            this.position.y <= 0) {
                return false;
        } else {
            return true;
        }
    }
};

var randomIntFromInterval = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

// Explosion class
var Explosion = function(canvasWidth, canvasHeight, image, size, halo, td) {
   
    this.radius = size.radius * 1.5;
    this.x = size.position.x;
    this.y = size.position.y;
    this.vX = -2;

    this.image = image || null;
    this.halo = halo || 0;

    this.frameIndex = 0;
    this.tickCount = 0;
    //this.ticksPerFrame = Math.abs(this.vX) / 2;
    this.ticksPerFrame = 0.005;
    this.numberOfFrames = 70;

    this.done = false;
}

Explosion.prototype = {
    draw: function(ctx, canvasWidth, canvasHeight) {
        var margin = 1.5;  // Compensate for margin in image
        var halocolors = ["#9CFF00", "#0066CC", 'white'];
        this.x += this.vX;

        ctx.save()
        ctx.shadowBlur = 15;
        ctx.shadowColor = halocolors[this.halo];

        ctx.drawImage(
            this.image,
            this.frameIndex * this.image.width / this.numberOfFrames,
            0,
            this.image.width / this.numberOfFrames,
            this.image.height,
            this.x - this.radius,
            this.y - this.radius,
            (this.radius*2)*margin,
            (this.radius*2)*margin);
        ctx.restore();
    },

    update: function() {
        this.tickCount += 1;

        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {
                // Go to the next frame
                this.frameIndex += 1;
            } else {
                //this.frameIndex = 0;
                this.done = true;
            }
        }
    },

    inArea: function(canvasWidth, canvasHeight) {
        if (this.x >= canvasWidth || 
            this.x <= 0 || 
            this.y >= canvasHeight || 
            this.y <= 0) {
                return false;
        } else {
            return true;
        }
    },
}

// Progressbar class, for laser charge
var Progressbar = function(position) {
    this.position = position;
    this.width = 0;
}

Progressbar.prototype = {
    draw: function(ctx) {

        var gradient = ctx.createLinearGradient(0, 0, 170, 0);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.33, "yellow");
        gradient.addColorStop(0.66, "#9CFF00");

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, 12);

        ctx.restore();
    },

    update: function(td, width) {
        this.width = width;
    },
}

// The grid
var Grid = function(color) {
    this.color = color || 'rgba(255, 255, 255, 0.5)';
}

Grid.prototype = {
    draw: function(ctx, cWidth, cHeight, leftCornerPosY, squareSize) {
        var verticalX = squareSize;
        var verticalY = leftCornerPosY;
        var horizontalX = squareSize;
        //var horizontalY = squareSize;
        var halfSquare = Math.floor(squareSize/2) + 1;

        var line1 = 'rgba(0, 0, 0, 0.2)';
        var line2 = 'rgba(0, 0, 0, 0.5)';

        // Scan lines
        ctx.save();

        ctx.translate(0, leftCornerPosY);
        ctx.fillStyle = line1;
        ctx.fillRect(0, 0, cWidth, cHeight/squareSize);

        ctx.restore();
        
        cHeight += 1; // Draw one line beneath area
       
        ctx.save();
        ctx.strokeStyle = line2;
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (horizontalY = leftCornerPosY; horizontalY < cHeight; horizontalY += 4) {
            ctx.moveTo(0, horizontalY);
            ctx.lineTo(cWidth, horizontalY);
        }

        ctx.stroke();

        ctx.closePath();
        ctx.restore();

        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#0066CC";
        
        ctx.beginPath();

        // Horizontal lines
        for (horizontalY = leftCornerPosY; horizontalY < cHeight; horizontalY += squareSize) {
            ctx.moveTo(0, horizontalY);
            ctx.lineTo(cWidth, horizontalY);
        }

        // Short
        for (horizontalY = leftCornerPosY; horizontalY < cHeight - halfSquare; horizontalY += squareSize) {
            ctx.moveTo(0, horizontalY + halfSquare);
            ctx.lineTo(halfSquare, horizontalY + halfSquare);
        }

        for (horizontalY = leftCornerPosY; horizontalY < cHeight - halfSquare; horizontalY += squareSize) {
            ctx.moveTo(cWidth - halfSquare, horizontalY + halfSquare);
            ctx.lineTo(cWidth, horizontalY + halfSquare);
        }

        // Vertical lines
        for (var horizontalX = squareSize; horizontalX < cWidth; horizontalX += squareSize) {
            ctx.moveTo(horizontalX, leftCornerPosY);
            ctx.lineTo(horizontalX, cHeight);
        }

        // Short
        for (var horizontalX = squareSize; horizontalX < cWidth - squareSize; horizontalX += squareSize) {
            ctx.moveTo(horizontalX + halfSquare, leftCornerPosY);
            ctx.lineTo(horizontalX + halfSquare, leftCornerPosY + halfSquare);
        }

        for (var horizontalX = squareSize; horizontalX < cWidth - squareSize; horizontalX += squareSize) {
            ctx.moveTo(horizontalX + halfSquare, cHeight);
            ctx.lineTo(horizontalX + halfSquare, cHeight - halfSquare);
        }

        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
}

// Message to display ingame, scrolls down from top and fades out.
// With extra shadows, which require multiple message objects, one for each shadow.
var Message = function(messageText) {
    this.text = messageText;
    this.step = 0;
    this.fontsize = 24;
    this.opacity = 1.0;
    this.done = false;
    this.wait = 150;
}

Message.prototype = {
    draw: function(ctx, width, height, index, td) {
        
        var x = width / 2;
        var y = 0 + this.step;

        var shadows = [
            {color: "rgba(255,255,255," + this.opacity + ")", blur: -7, swidth: width},
            {color: "rgba(0,102,204," + this.opacity + ")", blur: 10, swidth: width},
            {color: "rgba(0,102,204," + this.opacity + ")", blur: -10, swidth: width},
            {color: "rgba(255,255,255," + this.opacity + ")", blur: 7, swidth: 0}];
        
        ctx.save();
        ctx.translate(x, y);
        ctx.font= this.fontsize + "px Orbitron";
        ctx.textAlign = 'center';
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(255,255,255," + this.opacity + ")"; 

        ctx.shadowColor = shadows[index].color;
        ctx.shadowOffsetX = shadows[index].swidth;
        ctx.shadowOffsetY = shadows[index].blur;
        ctx.shadowBlur = Math.abs(shadows[index].blur);
        ctx.fillText(this.text, -(shadows[index].swidth), 0);

        ctx.restore();
        if (this.step < height / 3) {
            this.step += 2;
        } else if (this.wait > 0) {
            this.wait -= 1;
        } else if (this.opacity > 0) {
            this.opacity -= 1/100;
        } else {
            this.done = true;
        }
    },
}

// Volume hander to set master volume with keys
var VolumeHandler = function(mastervolume, slider, numberDisplay) {
    this.volume = mastervolume || 0.5;
    this.slider = slider;
    this.numberDisplay = numberDisplay;
}

VolumeHandler.prototype = {
    update: function(td) {

        if (Key.isDown(Key.VOLUP) && this.volume.gain.value < 1) {
            this.volume.gain.value += 0.01 * td * 12;
        }
        if (Key.isDown(Key.VOLDOWN) && this.volume.gain.value > 0) {
            this.volume.gain.value -= 0.01 * td * 12;
        }

        this.slider.val(this.volume.gain.value * 100);
        if (this.slider.val() < 10) {
            this.numberDisplay.html('0' + this.slider.val());
        } else {
            this.numberDisplay.html(this.slider.val());
        }
    },
}

window.Asteroids = (function() {
    // Canvas dimensions
    var canvas;
    var context;
    var canvasWidth;
    var canvasHeight;

    var grid;

    // Background
    var bkgX = 0;
    var bkgDX = 0.3;

    // http://freegameassets.blogspot.se/2013/09/asteroids-and-planets-if-you-needed-to.html
    var bkg, spaceshipImage, asteroidImage, asteroidImage2, explosionSprite;

    var asteroidSprites;

    // Game settings
    var playGame = false;
    var goScreen;
    var timescore = 0;
    var scoreTimeout;
    var asteroids = [];
    var numAsteroids;
    var player, playerRemote;
    var multiplayerGame = false;
    var multiplayerGO = false;
    var lastGameTick;
    var td;

    var projectiles = [];
    var explosions = [];
    var hits;
    var chargerate = 0.125;
    var progressbar;
    var hiscorelist;
    var message = null;

    // Game UI
    var ui = $("#gameUI");
    var uiIntro = $("#gameIntro");
    var uiStats = $("#gameStats");
    var uiComplete = $("#gameComplete");
    var uiPlay = $("#gamePlay");
    var uiPlayButton = $("#buttonPara");
    var uiReset = $(".gameReset");
    var uiScore = $(".gameScore");
    var uiCharger = $("#chargelevel");
    var uiMessage = $("#gameMessage");
    var uiMessageText = $("#gameMessageHeading");
    var uiMessagePara = $("#gameMessagePara");
    var playerScore = $(".gamePlayerScore");
    var uiVolume = $("#volume");

    var uiEndScore = $(".gamePlayerEndScore");
    var uiEndTimeScore = $(".gameEndTimeScore");

    var buttons = $(".button");

    var masterVolume = $("#sliderMaster");
    var volumeHandler;

    var acronym;

    // Sounds
    var audioContext;
    var masterGain;
    var volFade;

    var soundBackground = {};
    var soundThrust = {};
    var soundDeath = {};
    var soundLaser = {};
    var soundPowerup = {};
    var soundAsteroidBlast = {};
    var soundHiscore = {};

    var quotes = ['Never tell me the odds!',
        'You\'re not actually going into an asteroid field!?!',
        'That was no laser blast, something hit us!',
        'Pulverized?',
        'Sir, the possibility of successfully navigating an asteroid field is approximately 3,720 to 1!'];

    // Multiplayer
    var mpPlay = $("#mpGamePlay");
    var mpLobby = $("#multiplayerlobbyscreen");
    var mpComplete = $("#mpGameComplete");
    var lastCommand = null;
    var remoteAcronym = null;
    var updateCounter = 0;
    var mpToLobby = $("#multiplayerlobby");
    var mpPlayAgain = $("#mpPlayAgain");
    var playerRemoteScore = 0;
    var playerRemoteTime = 0;
    var mpEndScore = 0;
    var mpEndTime = 0;

    var init = function(canvas) {

        canvas = $("#gameCanvas");
        context = canvas.get(0).getContext('2d');
        // Canvas dimensions
        canvasWidth = canvas.width();
        canvasHeight = canvas.height();

        uiPlayButton.hide();

        setupAudio();

        bkg = imageLoader.load('img/GalaxyBackground.jpg');
        spaceshipImage = imageLoader.load('img/shipsurface.png');
        asteroidImage = imageLoader.load('img/asteroid_sprite.png');
        asteroidImage2 = imageLoader.load('img/asteroid_sprite2.png');
        explosionSprite = imageLoader.load('img/explosion_sprite2.png');

        
        window.addEventListener("audioloaded", function() {
            //console.log("audio listener");
            uiPlayButton.fadeIn();
            window.removeEventListener("audioloaded", null);
        });

        window.addEventListener("loadallimages", function() {
            //console.log("image listener");
            window.removeEventListener("loadallimages", null);
            $("#loadHeading").hide();
            canvas.css('border-color', "#444");
            ui.fadeIn('slow');
            uiVolume.fadeIn('slow');
            render();
        }, false);

        grid = new Grid('rgba(255, 255, 255, 0.2)');

        asteroidSprites = [asteroidImage, asteroidImage2];

        buttons.on('click', function(e) {
            e.preventDefault();
            soundPowerup.play(0, 0);
        });

        uiPlay.click(function(e) {
            e.preventDefault();
            multiplayerGame = false;
            initGame('PRESS SPACE TO LAUNCH');
        });

        uiReset.click(function(e) {
            e.preventDefault();
            uiComplete.slideUp(75);
            resetGame();
            if (acronym) {
                player.acronym = acronym;
            }
            render();
            uiMessageText.html('PRESS SPACE TO LAUNCH');
            uiMessagePara.html('"' + quotes[randomIntFromInterval(0, quotes.length - 1)] + '"');
            uiMessage.fadeIn("slow");
            window.addEventListener('keydown', listener, false);

            //console.log('reset game');
        });

        // Check WebRTC support in browser to allow multiplayer
        if ( !( navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia ) ) {
            // WebRTC/getUserMedia is not supported == no multiplayer
            mpPlay.click(function(e) {
                $("#connectPara").html("Your browser does not support WebRTC.");
                $("#connecting").show();
                $('#connectPara').addClass('flash');
                $("#connecting").delay(3000).fadeOut(100);
            });
        } else {
            // Multiplayer
            mpPlay.click(function(e) {
                var mpCancel = $("#multiplayercancel");
                e.preventDefault();
                render();
                $("#connecting").show();
                $('#connectPara').addClass('flash');

               // Load multiplayer.js script
                $.getScript('game/multiplayer.js', function(data, textStatus, jqxhr) {
                    //console.log( data ); // Data returned
                    //console.log(textStatus); // Success
                    //console.log(jqxhr.status); // 200
                    console.log("Load multiplayer.js was performed.");
                }).done(function(script, textStatus) {
                    multiplayerGame = true;
                    multiplayer.start();    //  start connecting to WS server and enter lobby
                    //console.log(textStatus);
                }).fail(function(jqxhr, settings, exception) {
                    console.log("Triggered ajaxError handler.", exception);
                });
            });
        }
        // Master volume slider
        masterVolume.on('input change', setMasterVolume);
    };

    //======================================================================================//
    // Image loader
    //======================================================================================//
    
    var eventImages = new CustomEvent("loadallimages", {
        detail: {
            message: null,
            time: new Date(),
        },
        bubbles: true,
        cancelable: true
    });
    
    var imageLoader = {
        loaded: true,
        loadedImages: 0,
        totalImages: 5,
        load: function(url) {
            this.loaded = false;
            var image = new Image();
            image.src = url;
            image.onload = function() {
                imageLoader.loadedImages += 1;
                if (imageLoader.loadedImages === imageLoader.totalImages) {
                    imageLoader.loaded = true;
                    //console.log("images done");
                    window.dispatchEvent(eventImages);
                }
            }
            return image;
        }
    }

    //======================================================================================//
    // Audio load, extract, create objects
    //======================================================================================//
    
    var eventAudio = new CustomEvent("audioloaded", {
        detail: {
            message: null,
            time: new Date(),
        },
        bubbles: true,
        cancelable: true,
    });

    var setupAudio = function() {

        var soundArray = [soundHiscore, soundLaser, soundThrust, soundDeath, soundBackground, soundAsteroidBlast, soundPowerup];

        audioContext = new AudioContext();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = 0.6;

        loadSoundFile();

        function loadSoundFile() {
            var soundURL = 'sounds/conc_sounds.mp3';
            var request = new XMLHttpRequest();
            request.open('GET', soundURL, true);
            request.responseType = 'arraybuffer';

            request.onload = function() {
                processConcatenatedFile(request.response);
                setVolumes();
                setMasterVolume();
                volumeHandler = new VolumeHandler(masterGain, masterVolume, $(".volume1"));
            }
            request.send();
        }

        /*
        Runs through the loaded array buffer and 
        extract each individual chunk that contains
        each original sound file buffer.
        */

        function processConcatenatedFile(data) {

            var bb = new DataView(data);
            var offset = 0;
            var arrayPointer = 0;

            while (offset < bb.byteLength) {

                var length = bb.getUint32(offset, true);
                offset += 4;
                var sound = extractBuffer(data, offset, length);
                offset += length;

                createSoundWithBuffer(soundArray[arrayPointer], sound.buffer);
                arrayPointer += 1;
            }
            //console.log("audio done");
            window.dispatchEvent(eventAudio);
        }

        /*
        Create a new buffer to store the compressed sound
        buffer from the concatenated buffer.
        */

        function extractBuffer( src, offset, length ) {

            var dstU8 = new Uint8Array(length);
            var srcU8 = new Uint8Array(src, offset, length);
            dstU8.set(srcU8);
            return dstU8;
        }

        /*
        Uses Web Audio API decodeAudioData() to decode
        the extracted buffer.
        */

        function createSoundWithBuffer( object, buffer ) {

            audioContext.decodeAudioData(buffer, function(res) {
                object.buffer = res;
            });

                /* 
                Do something with the sound, for instance, play it.
                Watch out: all the sounds will sound at the same time!
                */
            object.volume = audioContext.createGain();
            object.loop = false;
            object.play = function (when, offset) {
                var s = audioContext.createBufferSource();
                s.buffer = object.buffer;
                s.connect(object.volume);
                object.volume.connect(masterGain);
                s.loop = object.loop;
                s.start(when, offset);
                object.s = s;
            }
            object.stop = function () {
                if(object.s) object.s.stop(0);
            }
        }

        function setVolumes() {
            soundBackground.volume.gain.value = 0.7;
            soundThrust.volume.gain.value = 0;
            soundLaser.volume.gain.value = 0.3;
            soundAsteroidBlast.volume.gain.value = 0.99;
            soundDeath.volume.gain.value = 0.2;
            soundHiscore.volume.gain.value = 0.6;
            soundPowerup.volume.gain.value = 0.99;
        }
    }

    function setMasterVolume() {
        masterGain.gain.value = masterVolume.val() / 100;
        if (masterVolume.val() < 10) {
            $(".volume1").html('0' + masterVolume.val());
        } else {
            $(".volume1").html(masterVolume.val());
        }
    }

    //======================================================================================//
    
    var listener = function(e) {
        if (e.keyCode == 32) {
            uiMessage.hide();
            e.preventDefault();
            if (multiplayerGame) {
                e.stopImmediatePropagation();
                soundPowerup.play(0, 0);
                multiplayer.sendWebSocketMessage({type:"ready"});
                uiMessageText.html("WAITING FOR OTHER PLAYER...");
                uiMessagePara.html('"' + quotes[randomIntFromInterval(0, quotes.length - 1)] + '"');
                uiMessage.show();
            } else {
                Asteroids.startGame();
            }
        }
    };
    
    var initGame = function(title) {
        var sCancel = $("#singleplayercancel");
        render();

        uiIntro.slideUp(75);
        uiMessageText.html(title);
        uiMessagePara.html('"' + quotes[randomIntFromInterval(0, quotes.length - 1)] + '"');
        uiMessage.fadeIn("slow");

        window.addEventListener('keydown', listener, false);

        sCancel.click(function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            resetGame();
            render();
            uiComplete.hide(10);
            uiIntro.delay(50).fadeIn(500);
        });
    };

    var resetGame = function() {        
        clearTimeout(scoreTimeout);

        playGame = false;
        goScreen = false;
        bkgX = 0;   // reset background
        chargerate = 0.125;
        progressbar = new Progressbar(new Vector(550, 45));
        hits = 0;

        td = 0;
        lastGameTick = 0;

        // Setup asteroids etc
        explosions = new Array();
        asteroids = new Array();
        projectiles = new Array();
        numAsteroids = 5;
        for (var i = 0; i < numAsteroids; i += 1) {
            asteroids.push(new Asteroid(canvasWidth, canvasHeight, asteroidSprites[randomIntFromInterval(0, 1)]));
        };

        // For multiplayer
        if (multiplayerGame) {
            if (!multiplayer.isInitiator) {
                multiplayer.asteroidsArray = asteroids;
            }
            playerRemoteScore = 0;
            mpEndScore = 0;
            playerRemoteTime = 0;
            mpEndTime = 0;
            if (multiplayer.shiptype === "smugglership") {
                //console.log(multiplayer.shiptype);
                player = new Player(new Vector(150, 200), spaceshipImage, 0);
                playerRemote = new Player(new Vector(150, 400), spaceshipImage, 1);
            } else {
                player = new Player(new Vector(150, 400), spaceshipImage, 1);
                playerRemote = new Player(new Vector(150, 200), spaceshipImage, 0);
            }
            playerRemote.acronym = remoteAcronym;
            
        // Singleplayer
        } else {
            player = new Player(new Vector(150, canvasHeight / 2), spaceshipImage, randomIntFromInterval(0, 1));
        }

        if ($("#player_acronym").val()) {
            acronym = $("#player_acronym").val().toUpperCase();
            player.acronym = acronym;
        }
    }

    var startGame = function() {
        console.log("Start game!");
        window.removeEventListener('keydown', listener, false);
        $('body').unbind('keydown');

        if (multiplayerGame && !multiplayer.isInitiator) {
            resetGame();
        } else {
            resetGame();
        }

        if (!playGame && !goScreen) {
            uiMessage.hide();
            soundPowerup.play(0, 0);
            $('body').bind('keydown', function(e) {
                e.preventDefault(e);
            });
            $('body').css('cursor', 'none');
            // Reset stats
            uiScore.html("0");
            playerScore.html("0");
            if (multiplayerGame) {
                $("#acronym").html(player.acronym + ' vs ' + playerRemote.acronym);
            } else {
                $("#acronym").html(player.acronym);
            }
            uiStats.show();
            timescore = 0;

            playGame = true;
            goScreen = false;
            
            soundBackground.loop = true;
            soundBackground.play(0, 0);
            soundThrust.loop = true;
            soundThrust.loopStart = 0.5;
            soundThrust.loopEnd = 8.5;
            soundThrust.play(0, 0);

            window.addEventListener('keyup',   function(event) { Key.onKeyup(event);},   false);
            window.addEventListener('keydown', function(event) { Key.onKeydown(event);}, false);
            
            gameLoop();
            timer();
            render();
            //console.log(player.acronym + ': start play');
        };
    };

    var render = function() {
        var projPos = -9;
        // Clear
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw background image and repeat when scrolling to the edge
        context.drawImage(bkg, bkgX, 0);
        context.drawImage(bkg, bkg.width - Math.abs(bkgX), 0);

        if (Math.abs(bkgX) > bkg.width) {
            bkgX = 0;
        }
        bkgX -= bkgDX;

        // Draw asteroids
        for (var i = 0; i < asteroids.length; i += 1) {
            asteroids[i].draw(context, canvasWidth, canvasHeight);
        }

        // Explosions
        for (var j = 0; j < explosions.length; j += 1) {
            explosions[j].draw(context, canvasWidth, canvasHeight);
        }

        // Draw player
        if (playGame && !player.lost) {
            if (player.appearance === 0) {
                player.draw(context, canvasWidth, canvasHeight);
            } else if (player.appearance === 1) {
                player.drawX(context, canvasWidth, canvasHeight);
            }
        } else if (goScreen && !playGame) {
            player.drawExplosion(context, explosionSprite);
        }

        if (multiplayerGame && playerRemote && playGame && !playerRemote.lost) {
            if (playerRemote.appearance === 0) {
                playerRemote.draw(context, canvasWidth, canvasHeight);
            } else if (playerRemote.appearance === 1) {
                playerRemote.drawX(context, canvasWidth, canvasHeight);
            }
        }
  
        // Laser shots
        for (var k = 0; k < projectiles.length; k += 1) {
            projectiles[k].draw(context, projPos, -50 + k * 2);
            projPos += 9;
        }

        // Progressbar
        if (playGame && progressbar) {
            grid.draw(context, canvasWidth, 25 * 3, 0, 25);
            progressbar.draw(context);
        } else if (!playGame) {
            grid.draw(context, canvasWidth, 25 * 19, 100, 25);
        }

        // Game message
        if (message) {
            if (message.done) {
                message = null;
            } else {
                for (var i = 0; i < 4; i += 1) {
                    message.draw(context, canvasWidth, canvasHeight, i, td);
                }
            }       
        }
    }

    var timer = function() {
        if (playGame) {
            scoreTimeout = setTimeout(function() {
                uiScore.html(++timescore);
                // Increase number of asteroids on screen
                if (timescore % 5 == 0) {
                    numAsteroids += 1;
                    if (chargerate < 0.5) {
                        chargerate += 0.0125;
                    }
                    if (!player.lost) {
                        player.score += 10;
                    }
                };
                playerScore.html(player.score);
                timer();
            }, 1000);
        };
    };

    var hiscorelisting = function() {
        // Get hiscores from json file
        // fool the browser to not use the cached file since it might be updated by another connected player
        var json_filename = "game/sp_hiscore.json?nocache=" + (new Date()).getTime();
        $.ajax({
            url: json_filename,
            beforeSend: function(xhr){
                if (xhr.overrideMimeType)
                {
                  xhr.overrideMimeType("application/json");
              }
          },
            dataType: "json",
            success: function(response) {
                hiscorelist = response;

                hiscorelist.push({"acronym": player.acronym, "score": player.score});
            
                hiscorelist.sort(function(a, b) {
                    return parseInt(b.score) - parseInt(a.score);
                });

                hiscorelist.pop();

                $("#hiscorelist li").remove();  // clear html list

                hiscorelist.forEach(function(obj, index) {
                    $("#hiscorelist").append('<li id=li' + index + '><div class="acronym">'+obj.acronym.toUpperCase()+'</div><div class="middle"> ..................... </div><div class="listscore">' + obj.score+'</div></li>');
                    if (obj.acronym === player.acronym && obj.score === player.score) {
                        // new hiscore, save file
                        $.ajax({
                            type: "GET",
                            dataType : 'json',
                            async: false,
                            url: 'game/save_hiscore_json.php',
                            data: { data: JSON.stringify(hiscorelist) },
                            success: function () {console.log("json file loaded successfully"); },
                            failure: function() {console.log("Error!");}
                        });
                        // flash new score and play sound
                        $("#li" + index).addClass("flash");
                        $("#li" + index + " .acronym").prepend("OUR NEW HERO: ");
                        setTimeout(function() {
                            soundHiscore.play(0, 0);
                        }, 1000);
                    }
                });
                hiscorelist = null;
            }
        });
    }

    var gameover = function() {
        if (playGame) {
            // To stop listening for keyboard events:
            window.removeEventListener('keyup',   function(event) { Key.onKeyup(event);},   false);
            window.removeEventListener('keydown', function(event) { Key.onKeydown(event);}, false);
            if (!multiplayerGame) {
                hiscorelisting();
            }
            message = null;
            goScreen = true;
            soundThrust.stop();
            soundBackground.stop();

            playGame = false;
            clearTimeout(scoreTimeout);
            uiStats.hide();
            progressbar = null;
 
            if (multiplayerGame) {
                uiEndScore.html(mpEndScore);
                uiEndTimeScore.html(mpEndTime);
                $('.remotePlayer').html(remoteAcronym);
                $('.remoteTime').html(playerRemoteTime);
                $('.remoteScore').html(playerRemoteScore);
                $('#remoteScores').show();

                $('#chatWebRTC').show();

                // Play again button
                mpPlayAgain.show();
                mpPlayAgain.click(function(e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    mpComplete.hide();
                    multiplayer.sendWebSocketMessage({type: "reset_ready"});
                    multiplayer.initMPGameOnOpenDataChannel();
                });

                // Back to main menu button
                mpToLobby.show();
                mpToLobby.click(function(e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    mpComplete.hide();
                    resetGame();
                    render();
                    if (multiplayer.roomId) {
                        multiplayer.cancel();
                    }
                    multiplayer.closeAndExit();
                });
            } else {
                uiEndScore.html(player.score);
                uiEndTimeScore.html(timescore);
                uiComplete.slideDown(75);
            }

            setTimeout(function() {     // To avoid unintentional scrolling directly after game over
                $('body').unbind('keydown');
            }, 1500);
            $('body').css('cursor', '');

            soundDeath.play(0, 0.55);
            console.log("Game over");
        }
    }

    var gameoverMP = function() {
        if (playGame) {
            multiplayer.sendDataChannelMessage({type: "gameover", score: player.score, time: timescore});
            // To stop listening for keyboard events:
            window.removeEventListener('keyup',   function(event) { Key.onKeyup(event);},   false);
            window.removeEventListener('keydown', function(event) { Key.onKeydown(event);}, false);

            soundThrust.stop();

            uiStats.hide();
            progressbar = null;

            mpEndScore = player.score;
            mpEndTime = timescore;

            uiEndScore.html(mpEndScore);
            uiEndTimeScore.html(mpEndTime);

            player.lost = true;
            $('#remoteScores').hide();
            $('#chatWebRTC').hide();
            mpPlayAgain.hide();
            mpToLobby.hide();
            mpComplete.slideDown(75);
            if (!playerRemote) {
                gameover();
            } else {
                exp = {'radius':32,
                    'x':player.position.x - player.halfWidth,
                    'y':player.position.y - player.halfHeight,
                    'vX': 5,
                    'position': new Vector(player.position.x - player.halfWidth, player.position.y - player.halfHeight)};
                explosions.push(new Explosion(canvasWidth, canvasHeight, explosionSprite, exp, randomIntFromInterval(0, 2), td));
            }
        }
    }

    var receiveCommand = function(command) {
        if (command) {
            lastCommand = command;
        } else {
            lastCommand = null;
        }
        //console.log(lastCommand);
    }

    var receivePosition = function(position) {
        if (playerRemote) {
            playerRemote.position = position;
        }
    }

    var gameLoop = function() {
        var now = Date.now();
        td = (now - (lastGameTick || now)) / 1000;  // Timediff since last frame / gametick
        lastGameTick = now;

        if (playGame) {
            requestAnimFrame(gameLoop);
        };

        // Increase number of asteroids on screen
        while (asteroids.length < numAsteroids) {
            asteroids.push(new Asteroid(canvasWidth, canvasHeight, asteroidSprites[randomIntFromInterval(0, 1)]));
        };
        // Sync asteroids for multiplayer
        if (multiplayerGame) {
            //console.log(numAsteroids);
            if (multiplayer.isInitiator && updateCounter === 0) {
                multiplayer.sendDataChannelMessage({type: "setup_asteroids", asteroidsArray: asteroids, currentTick: lastGameTick});
            } else if (!multiplayer.isInitiator && updateCounter === 0) {
                while (asteroids.length < multiplayer.asteroidsArray) {
                    asteroids.push(new Asteroid(canvasWidth, canvasHeight, asteroidSprites[randomIntFromInterval(0, 1)]));
                };
                while (asteroids.length > multiplayer.asteroidsArray) {
                    asteroids.splice(asteroids.length - 1, 1);
                };
                for (var i = 0; i < asteroids.length; i++) {
                    if (multiplayer.asteroidsArray[i]) {
                        asteroids[i].radius = multiplayer.asteroidsArray[i].radius;
                        asteroids[i].ticksPerFrame = multiplayer.asteroidsArray[i].ticksPerFrame;
                        asteroids[i].position = multiplayer.asteroidsArray[i].position;
                        asteroids[i].vX = multiplayer.asteroidsArray[i].vX;
                    }
                }
            }
        }

        // Player
        player.update(td);
        player.chargerate = chargerate;
        if (player.moveRight && playGame) {
            soundThrust.volume.gain.value = 0.7;
        } else {
            soundThrust.volume.gain.value = 0;
        };


        // send commands and position to peer
        if (multiplayerGame && !player.lost) {
           if (Key.isDown(Key.RIGHT, Key.D)) {
                //multiplayer.sentCommandForTick = true;
                multiplayer.sendDataChannelMessage({type: "command", command: 'right', currentTick: lastGameTick, acronym: multiplayer.acronym});
            }
            if (updateCounter === 1) {
                multiplayer.sendDataChannelMessage({type: "position", position: player.position, currentTick: lastGameTick, acronym: multiplayer.acronym});
                updateCounter += 1;
            } else if (updateCounter === 2) {
                updateCounter = 0;
            } else {
                updateCounter += 1;
            }
        }

        if (multiplayerGame && playerRemote && playerRemote.lost && player.lost) {
            gameover();
        }

        // Laser fired
        if (player.fire && !player.lost) {
            soundLaser.play(0, 0);

            for (var m = 0; m < 3; m += 1) {
                projectiles.push(new Laser(40, 2, new Vector(player.position.x - 35, player.position.y), new Vector(10, 10), player.direction, player.appearance, true));
            }
            player.fire = false;
            if (multiplayerGame && !player.lost) {
                multiplayer.sendDataChannelMessage({type: "command", command: 'fire', currentTick: lastGameTick, acronym: multiplayer.acronym});
            }
        }

        if (playerRemote) {
            playerRemote.updateMP(td, lastCommand);
            lastCommand = null;
        }

        if (playerRemote && playerRemote.fire) {
            soundLaser.play(0, 0);

            for (var m = 0; m < 3; m += 1) {
                projectiles.push(new Laser(40, 2, new Vector(playerRemote.position.x - 35, playerRemote.position.y), new Vector(10, 10), playerRemote.direction, playerRemote.appearance));
            }
            playerRemote.fire = false;
        }

        // Laser recharge
        uiCharger.html(Math.floor(player.laser));
        if (progressbar) {
            progressbar.update(td, player.laser);
        }

        // Laser shot
        if (projectiles.length > 0) {
            for (var l = 0; l < projectiles.length; l += 1) {
                projectiles[l].update(td);
                if (!projectiles[l].inArea(canvasWidth, canvasHeight)) {
                    projectiles.splice(l, 1);
                    hits = 0;
                } else if (!projectiles[l].own && player.detectCollisionX(projectiles[l], projectiles[l].speed * Math.cos(projectiles[l].direction) * td)) {
                    projectiles.splice(l, 1);
                    gameoverMP();
                } else {
                    for (var j = 0; j < asteroids.length; j += 1) {
                        if (asteroids[j].detectCollisionX(projectiles[l], projectiles[l].speed * Math.cos(projectiles[l].direction) * td)) {
                            explosions.push(new Explosion(canvasWidth, canvasHeight, explosionSprite, asteroids[j], randomIntFromInterval(0, 2), td));
                            soundAsteroidBlast.play(0, 0);
                            if (projectiles[l].color === player.appearance) {
                                player.score += 50;
                                hits += 1;
                            }
                            asteroids.splice(j, 1);
                            projectiles.splice(l, 1);
                            break;
                        }
                    }
                }
            }
            // Triple hit
            if (hits == 3 && gamePlay) {
                hits = 0;
                player.score += 200;
                
                message = new Message("TRIPLE HIT +200");

                soundBackground.volume.gain.value = 0.2;
                soundPowerup.play(0, 0);
                volFade = setInterval(function() {
                    if (soundBackground.volume.gain.value < 0.7) {
                        soundBackground.volume.gain.value += 0.1;
                    } else {
                        clearInterval(volFade);
                    }
                }, 500);
            }
        }

        // Exploding asteroids
        if (explosions.length > 0) {
            for (var k = 0; k < explosions.length; k += 1) {
                if (!explosions[k].inArea(canvasWidth, canvasHeight)) {
                    explosions.splice(k, 1);
                } else if (explosions[k].done) {
                    explosions.splice(k, 1);
                } else {
                    explosions[k].update();
                }
            }
        }

        // Asteroid collisions
        Loop:
        for (var i = 0; i < asteroids.length; i += 1) {
            var exp = asteroids[i];
            asteroids[i].update(td);
            if (asteroids[i].detectCollisionXY(player, td) && !player.lost) {
                if (multiplayerGame && playGame) {
                    gameoverMP();
                } else {
                    gameover();
                }

                break Loop;
            }
        }

        if (playerRemote && playerRemote.lost) {
            exp = {'radius':32,
                    'x':playerRemote.position.x - playerRemote.halfWidth,
                    'y':playerRemote.position.y - playerRemote.halfHeight,
                    'vX': 5,
                    'position': new Vector(playerRemote.position.x - playerRemote.halfWidth, playerRemote.position.y - playerRemote.halfHeight)};
            explosions.push(new Explosion(canvasWidth, canvasHeight, explosionSprite, exp, randomIntFromInterval(0, 2), td));
            asteroids.splice(i, 1);
            playerRemote = null;
            soundAsteroidBlast.play(0, 0);
        }

        if (volumeHandler) {
            volumeHandler.update(td);
        }

        render();
    };

    return {
        'init': init,
        'initGame': initGame,
        'startGame': startGame,
        'resetGame': resetGame,
        'render': render,
        'gameLoop': gameLoop,
        'closeMP': function() {multiplayerGame = false;},
        'setPlayerRemoteLost': function(score, time) {if (playerRemote) {playerRemote.lost = true;} playerRemoteScore = score; playerRemoteTime = time;},
        'setPlayerRemoteAcronym': function(acro) {remoteAcronym = acro;},
        'setMessage': function(msg) {if (playerRemote) {message = new Message(playerRemote.acronym + " CRASHED AND BURNED!");}},
        'receiveCommand': receiveCommand,
        'receivePosition': receivePosition,
    }
})();

$(function(){
    'use strict';
    Asteroids.init('gameCanvas');

    console.log('Ready to play.');
});
