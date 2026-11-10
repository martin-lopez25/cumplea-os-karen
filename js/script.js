var petCard = document.getElementById("pet-card");
var cat = document.getElementById("cat");
var purrFill = document.getElementById("purrFill");
var isPetting = false;
var purrLevel = 0;
var petInterval;
var drainInterval;
var birthdayStarted = false;
var giftOpened = false;
var petPointerEvent;

var url_string = window.location.href; //window.location.href
var url = new URL(url_string);
var c = url.searchParams.get("name");
console.log(c);
var birthdayName = c || "Karen";
var nameElement = document.getElementById("name");
document.getElementById("name-text").textContent = birthdayName.toUpperCase();
nameElement.setAttribute("aria-label", birthdayName);
document.getElementById("nae").textContent = birthdayName;
var fishLayer = document.querySelector("#name > g");
var fishTemplates = Array.from(fishLayer.querySelectorAll(".letter-fish"));
var fishOverlayText = fishLayer.querySelector(".fish-name-text");
var extraFishCount = 20;

for (var fishIndex = 0; fishIndex < extraFishCount; fishIndex++) {
    var fishCopy = fishTemplates[fishIndex % fishTemplates.length].cloneNode(true);
    var fishColumn = fishIndex % 5;
    var fishRow = Math.floor(fishIndex / 5);
    var fishX = 60 + fishColumn * 104 + (fishRow % 2) * 18 + Math.floor(fishRow / 2) * 10;
    var fishY = 42 + fishRow * 21;
    var fishScale = 0.9 + (fishIndex % 3) * 0.08;

    fishCopy.style.setProperty("--fish-x", fishX + "px");
    fishCopy.style.setProperty("--fish-y", fishY + "px");
    fishCopy.style.setProperty("--fish-scale", fishScale);
    fishCopy.setAttribute("transform", "translate(" + fishX + " " + fishY + ") scale(" + fishScale + ")");
    fishLayer.insertBefore(fishCopy, fishOverlayText);
}

var letterFish = Array.from(fishLayer.querySelectorAll(".letter-fish"));
letterFish.forEach(function (fish, index) {
    var distance = 18 + (index % 3) * 6;
    var fishScale = 0.65 + (index % 3) * 0.07;
    fish.style.setProperty("--fish-distance", (index % 2 === 0 ? distance : -distance) + "px");
    fish.style.setProperty("--fish-scale", fishScale);
    fish.style.setProperty("--fish-duration", (4.5 + (index % 5) * 1.2) + "s");
});
var fishAnimationStart;
var reduceFishMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateLetterFish(timestamp) {
    if (fishAnimationStart === undefined) fishAnimationStart = timestamp;
    var elapsed = timestamp - fishAnimationStart;

    letterFish.forEach(function (fish, index) {
        var fishStyle = fish.style;
        var x = parseFloat(fishStyle.getPropertyValue("--fish-x"));
        var y = parseFloat(fishStyle.getPropertyValue("--fish-y"));
        var scale = parseFloat(fishStyle.getPropertyValue("--fish-scale"));
        var distance = parseFloat(fishStyle.getPropertyValue("--fish-distance"));
        var duration = parseFloat(fishStyle.getPropertyValue("--fish-duration")) * 1000;
        var phase = (elapsed / duration) * Math.PI * 2 + index * 0.9;
        var fishX = x + Math.sin(phase) * distance;
        var fishY = y + Math.sin(phase * 0.6) * 2;

        fish.setAttribute("transform", "translate(" + fishX + " " + fishY + ") scale(" + scale + ")");
    });

    if (!reduceFishMotion) window.requestAnimationFrame(animateLetterFish);
}

if (!reduceFishMotion) window.requestAnimationFrame(animateLetterFish);
$(".main").fadeOut(1);
function startBirthday() {
    if (birthdayStarted) return;
    birthdayStarted = true;
    $(".loader").fadeOut(500, function () {
        $("#gift-stage").attr("aria-hidden", "false").addClass("is-visible");
    });
}

function openGift() {
    if (!birthdayStarted || giftOpened) return;
    giftOpened = true;
    var giftStage = document.getElementById("gift-stage");
    giftStage.classList.add("is-opening");
    var audio = $('.song')[0];
    var playback = audio.play();
    if (playback) playback.catch(function () {});

    setTimeout(function () {
        giftStage.classList.remove("is-visible");
        giftStage.setAttribute("aria-hidden", "true");
        $(".main").fadeIn("slow", function () {
            blowButton.hidden = false;
        });
        $('.balloon-border').animate({
            top: -500
        }, 8000);
    }, 1100);
}

document.getElementById("gift-box").addEventListener("click", openGift);

var blowButton = document.getElementById("blow-button");
var blowGifStage = document.getElementById("blow-gif-stage");
var blowGif = document.getElementById("blow-gif");
var windStage = document.getElementById("wind-stage");
var windCanvas = document.getElementById("c");
var windContext = windCanvas.getContext("2d");
var invitationStage = document.getElementById("invitation-stage");
var invitationVideo = document.getElementById("invitation-video");
var windDpr = 1;
var windPoints = [];
var windMouse = { x: 0, y: 0 };
var windFrame = 0;
var windActive = false;
var windStartTime;
var blowSequenceStarted = false;
var birthdayPalette = [
    "#ff8fab", "#ffd166", "#a8dadc", "#b8e0d2", "#cdb4db",
    "#ffc8a2", "#9bf6ff", "#f4acb7", "#fff1a8", "#d0f4de"
];

function prepareWindCanvas() {
    windDpr = Math.min(2, window.devicePixelRatio || 1);
    windCanvas.width = Math.round(window.innerWidth * windDpr);
    windCanvas.height = Math.round(window.innerHeight * windDpr);
    windContext.setTransform(windDpr, 0, 0, windDpr, 0, 0);
    windContext.fillStyle = "#FFDAB9";
    windContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

    if (windPoints.length === 0) {
        var pointCount = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 90 : 280;
        for (var pointIndex = 0; pointIndex < pointCount; pointIndex++) {
            windPoints.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                color: pointIndex % birthdayPalette.length,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
}

function drawBirthdayWind(time) {
    if (!windActive) return;
    if (windStartTime === undefined) windStartTime = time;

    windContext.fillStyle = "rgba(255, 218, 185, 0.18)";
    windContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

    windPoints.forEach(function (point, index) {
        var orbit = index / windPoints.length * Math.PI * 2;
        var targetX = windMouse.x + Math.cos(orbit) * 44;
        var targetY = windMouse.y + Math.sin(orbit) * 44;
        var angle = Math.atan2(targetY - point.y, targetX - point.x) - Math.PI / 2;
        angle += Math.sin((index * 100 + time) / 1000) * 0.45;

        windContext.globalAlpha = 0.82;
        windContext.fillStyle = birthdayPalette[point.color];
        windContext.beginPath();
        windContext.arc(point.x, point.y, 1.4 + (index % 4) * 0.45, 0, Math.PI * 2);
        windContext.fill();

        var movementX = Math.cos(angle) * 12;
        var movementY = Math.sin(angle) * 12;
        for (var trailIndex = 3; trailIndex >= 0; trailIndex--) {
            var trailProgress = trailIndex / 3;
            windContext.globalAlpha = 0.35 + (1 - trailProgress) * 0.47;
            windContext.beginPath();
            windContext.arc(
                point.x - movementX * trailProgress,
                point.y - movementY * trailProgress,
                1.4 + (3 - trailIndex) * 0.55,
                0,
                Math.PI * 2
            );
            windContext.fill();
        }

        point.x += movementX;
        point.y += movementY;
        if (point.x > window.innerWidth + 4) point.x = -4;
        if (point.x < -4) point.x = window.innerWidth + 4;
        if (point.y > window.innerHeight + 4) point.y = -4;
        if (point.y < -4) point.y = window.innerHeight + 4;
    });

    windContext.globalAlpha = 1;
    windFrame = window.requestAnimationFrame(drawBirthdayWind);
}

function showInvitation() {
    windActive = false;
    window.cancelAnimationFrame(windFrame);
    windStage.hidden = true;
    windStage.setAttribute("aria-hidden", "true");
    document.body.classList.add("show-invitation");
    $(".balloon-border").stop(true).css("top", "0");
    if (window.birthdayConfetti) window.birthdayConfetti.resize();
    invitationStage.hidden = false;
    invitationStage.setAttribute("aria-hidden", "false");
    var invitationName = document.getElementById("invitation-name");
    invitationName.textContent = birthdayName;
    invitationVideo.currentTime = 0;
    invitationVideo.play().catch(function () {});
}

function startBirthdayWind() {
    blowGifStage.hidden = true;
    blowGifStage.setAttribute("aria-hidden", "true");
    windStage.hidden = false;
    windStage.setAttribute("aria-hidden", "false");
    windStartTime = undefined;
    windActive = true;
    prepareWindCanvas();
    windFrame = window.requestAnimationFrame(drawBirthdayWind);
    window.setTimeout(showInvitation, 3000);
}

function blowCandle() {
    if (blowSequenceStarted) return;
    blowSequenceStarted = true;
    blowButton.hidden = true;
    blowGifStage.setAttribute("aria-hidden", "false");

    var gifSequenceStarted = false;
    function beginGifSequence() {
        if (gifSequenceStarted) return;
        gifSequenceStarted = true;
        blowGifStage.hidden = false;
        window.setTimeout(startBirthdayWind, 1600);
    }

    blowGif.onload = beginGifSequence;
    blowGif.onerror = startBirthdayWind;
    blowGif.src = "img/soplar.gif?play=" + Date.now();
}

blowButton.addEventListener("click", blowCandle);
window.addEventListener("pointermove", function (event) {
    windMouse.x = event.clientX;
    windMouse.y = event.clientY;
});
window.addEventListener("resize", function () {
    if (windActive) prepareWindCanvas();
});

function startPetting(event) {
    if (isPetting || birthdayStarted) return;
    isPetting = true;
    petPointerEvent = event;
    clearInterval(drainInterval);
    cat.classList.add("purring");
    petInterval = setInterval(function () {
        purrLevel = Math.min(100, purrLevel + 4);
        purrFill.style.width = purrLevel + "%";
        purrFill.parentElement.setAttribute("aria-valuenow", purrLevel);
        spawnHeart(petPointerEvent);

        if (purrLevel === 100) {
            stopPetting();
            startBirthday();
        }
    }, 100);
}

function stopPetting() {
    if (!isPetting) return;
    isPetting = false;
    cat.classList.remove("purring");
    clearInterval(petInterval);

    drainInterval = setInterval(function () {
        if (purrLevel > 0 && !isPetting) {
            purrLevel = Math.max(0, purrLevel - 2);
            purrFill.style.width = purrLevel + "%";
            purrFill.parentElement.setAttribute("aria-valuenow", purrLevel);
        } else {
            clearInterval(drainInterval);
        }
    }, 100);
}

function spawnHeart(event) {
    var heart = document.createElement("div");
    heart.className = "heart-particle";
    heart.textContent = "♥";

    var rect = petCard.getBoundingClientRect();
    var x = event && event.clientX ? event.clientX - rect.left : rect.width / 2;
    var y = event && event.clientY ? event.clientY - rect.top : rect.height / 2;
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    petCard.appendChild(heart);
    setTimeout(function () { heart.remove(); }, 1000);
}

petCard.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    petCard.setPointerCapture(event.pointerId);
    startPetting(event);
});
petCard.addEventListener("pointermove", function (event) {
    if (isPetting) petPointerEvent = event;
});
petCard.addEventListener("pointerup", stopPetting);
petCard.addEventListener("pointercancel", stopPetting);
petCard.addEventListener("lostpointercapture", stopPetting);
petCard.addEventListener("keydown", function (event) {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
        event.preventDefault();
        startPetting(event);
    }
});
petCard.addEventListener("keyup", function (event) {
    if (event.key === " " || event.key === "Enter") stopPetting();
});
window.addEventListener("blur", stopPetting);
window.addEventListener("mousemove", function (event) {
    var rect = petCard.getBoundingClientRect();
    var offsetX = (event.clientX - rect.left - rect.width / 2) / (window.innerWidth / 2);
    var offsetY = (event.clientY - rect.top - rect.height / 2) / (window.innerHeight / 2);
    petCard.style.setProperty("--pet-ry", (offsetX * 15) + "deg");
    petCard.style.setProperty("--pet-rx", (-offsetY * 15) + "deg");
    petCard.style.setProperty("--pet-mx", (offsetX * 12) + "px");
    petCard.style.setProperty("--pet-my", (offsetY * 12) + "px");
});
window.addEventListener("mouseleave", function () {
    petCard.style.setProperty("--pet-ry", "0deg");
    petCard.style.setProperty("--pet-rx", "0deg");
    petCard.style.setProperty("--pet-mx", "0px");
    petCard.style.setProperty("--pet-my", "0px");
});
var typed = new Typed("#typed", {
    stringsElement: '#typed-strings',
    typeSpeed: 30,
    backSpeed: 10,
    loop: true
});
var retina = window.devicePixelRatio,

    // Math shorthands
    PI = Math.PI,
    sqrt = Math.sqrt,
    round = Math.round,
    random = Math.random,
    cos = Math.cos,
    sin = Math.sin,

    // Local WindowAnimationTiming interface
    rAF = window.requestAnimationFrame,
    cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,
    _now = Date.now || function () {
        return new Date().getTime();
    };

// Local WindowAnimationTiming interface polyfill
(function (w) {
    /**
     * Fallback implementation.
     */
    var prev = _now();

    function fallback(fn) {
        var curr = _now();
        var ms = Math.max(0, 16 - (curr - prev));
        var req = setTimeout(fn, ms);
        prev = curr;
        return req;
    }

    /**
     * Cancel.
     */
    var cancel = w.cancelAnimationFrame ||
        w.webkitCancelAnimationFrame ||
        w.clearTimeout;

    rAF = w.requestAnimationFrame ||
        w.webkitRequestAnimationFrame ||
        fallback;

    cAF = function (id) {
        cancel.call(w, id);
    };
}(window));

document.addEventListener("DOMContentLoaded", function () {
    var speed = 50,
        duration = (1.0 / speed),
        confettiRibbonCount = 10,
        ribbonPaperCount = 15,
        ribbonPaperDist = 8.0,
        ribbonPaperThick = 8.0,
        confettiPaperCount = 10,
        DEG_TO_RAD = PI / 180,
        RAD_TO_DEG = 180 / PI,
        colors = [
            ["#df0049", "#660671"],
            ["#00e857", "#005291"],
            ["#2bebbc", "#05798a"],
            ["#ffd200", "#b06c00"]
        ];

    function Vector2(_x, _y) {
        this.x = _x, this.y = _y;
        this.Length = function () {
            return sqrt(this.SqrLength());
        }
        this.SqrLength = function () {
            return this.x * this.x + this.y * this.y;
        }
        this.Add = function (_vec) {
            this.x += _vec.x;
            this.y += _vec.y;
        }
        this.Sub = function (_vec) {
            this.x -= _vec.x;
            this.y -= _vec.y;
        }
        this.Div = function (_f) {
            this.x /= _f;
            this.y /= _f;
        }
        this.Mul = function (_f) {
            this.x *= _f;
            this.y *= _f;
        }
        this.Normalize = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                this.x *= factor;
                this.y *= factor;
            }
        }
        this.Normalized = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                return new Vector2(this.x * factor, this.y * factor);
            }
            return new Vector2(0, 0);
        }
    }
    Vector2.Lerp = function (_vec0, _vec1, _t) {
        return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
    }
    Vector2.Distance = function (_vec0, _vec1) {
        return sqrt(Vector2.SqrDistance(_vec0, _vec1));
    }
    Vector2.SqrDistance = function (_vec0, _vec1) {
        var x = _vec0.x - _vec1.x;
        var y = _vec0.y - _vec1.y;
        return (x * x + y * y + z * z);
    }
    Vector2.Scale = function (_vec0, _vec1) {
        return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
    }
    Vector2.Min = function (_vec0, _vec1) {
        return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
    }
    Vector2.Max = function (_vec0, _vec1) {
        return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
    }
    Vector2.ClampMagnitude = function (_vec0, _len) {
        var vecNorm = _vec0.Normalized;
        return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
    }
    Vector2.Sub = function (_vec0, _vec1) {
        return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
    }

    function EulerMass(_x, _y, _mass, _drag) {
        this.position = new Vector2(_x, _y);
        this.mass = _mass;
        this.drag = _drag;
        this.force = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.AddForce = function (_f) {
            this.force.Add(_f);
        }
        this.Integrate = function (_dt) {
            var acc = this.CurrentForce(this.position);
            acc.Div(this.mass);
            var posDelta = new Vector2(this.velocity.x, this.velocity.y);
            posDelta.Mul(_dt);
            this.position.Add(posDelta);
            acc.Mul(_dt);
            this.velocity.Add(acc);
            this.force = new Vector2(0, 0);
        }
        this.CurrentForce = function (_pos, _vel) {
            var totalForce = new Vector2(this.force.x, this.force.y);
            var speed = this.velocity.Length();
            var dragVel = new Vector2(this.velocity.x, this.velocity.y);
            dragVel.Mul(this.drag * this.mass * speed);
            totalForce.Sub(dragVel);
            return totalForce;
        }
    }

    function ConfettiPaper(_x, _y) {
        this.pos = new Vector2(_x, _y);
        this.rotationSpeed = (random() * 600 + 800);
        this.angle = DEG_TO_RAD * random() * 360;
        this.rotation = DEG_TO_RAD * random() * 360;
        this.cosA = 1.0;
        this.size = 5.0;
        this.oscillationSpeed = (random() * 1.5 + 0.5);
        this.xSpeed = 40.0;
        this.ySpeed = (random() * 60 + 50.0);
        this.corners = new Array();
        this.time = random();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        for (var i = 0; i < 4; i++) {
            var dx = cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
            var dy = sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
            this.corners[i] = new Vector2(dx, dy);
        }
        this.Update = function (_dt) {
            this.time += _dt;
            this.rotation += this.rotationSpeed * _dt;
            this.cosA = cos(DEG_TO_RAD * this.rotation);
            this.pos.x += cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
            this.pos.y += this.ySpeed * _dt;
            if (this.pos.y > ConfettiPaper.bounds.y) {
                this.pos.x = random() * ConfettiPaper.bounds.x;
                this.pos.y = 0;
            }
        }
        this.Draw = function (_g) {
            if (this.cosA > 0) {
                _g.fillStyle = this.frontColor;
            } else {
                _g.fillStyle = this.backColor;
            }
            _g.beginPath();
            _g.moveTo((this.pos.x + this.corners[0].x * this.size) * retina, (this.pos.y + this.corners[0].y * this.size * this.cosA) * retina);
            for (var i = 1; i < 4; i++) {
                _g.lineTo((this.pos.x + this.corners[i].x * this.size) * retina, (this.pos.y + this.corners[i].y * this.size * this.cosA) * retina);
            }
            _g.closePath();
            _g.fill();
        }
    }
    ConfettiPaper.bounds = new Vector2(0, 0);

    function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
        this.particleDist = _dist;
        this.particleCount = _count;
        this.particleMass = _mass;
        this.particleDrag = _drag;
        this.particles = new Array();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        this.xOff = (cos(DEG_TO_RAD * _angle) * _thickness);
        this.yOff = (sin(DEG_TO_RAD * _angle) * _thickness);
        this.position = new Vector2(_x, _y);
        this.prevPosition = new Vector2(_x, _y);
        this.velocityInherit = (random() * 2 + 4);
        this.time = random() * 100;
        this.oscillationSpeed = (random() * 2 + 2);
        this.oscillationDistance = (random() * 40 + 40);
        this.ySpeed = (random() * 40 + 80);
        for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
        }
        this.Update = function (_dt) {
            var i = 0;
            this.time += _dt * this.oscillationSpeed;
            this.position.y += this.ySpeed * _dt;
            this.position.x += cos(this.time) * this.oscillationDistance * _dt;
            this.particles[0].position = this.position;
            var dX = this.prevPosition.x - this.position.x;
            var dY = this.prevPosition.y - this.position.y;
            var delta = sqrt(dX * dX + dY * dY);
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            for (i = 1; i < this.particleCount; i++) {
                var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
                dirP.Normalize();
                dirP.Mul((delta / _dt) * this.velocityInherit);
                this.particles[i].AddForce(dirP);
            }
            for (i = 1; i < this.particleCount; i++) {
                this.particles[i].Integrate(_dt);
            }
            for (i = 1; i < this.particleCount; i++) {
                var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
                rp2.Sub(this.particles[i - 1].position);
                rp2.Normalize();
                rp2.Mul(this.particleDist);
                rp2.Add(this.particles[i - 1].position);
                this.particles[i].position = rp2;
            }
            if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
                this.Reset();
            }
        }
        this.Reset = function () {
            this.position.y = -random() * ConfettiRibbon.bounds.y;
            this.position.x = random() * ConfettiRibbon.bounds.x;
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            this.velocityInherit = random() * 2 + 4;
            this.time = random() * 100;
            this.oscillationSpeed = random() * 2.0 + 1.5;
            this.oscillationDistance = (random() * 40 + 40);
            this.ySpeed = random() * 40 + 80;
            var ci = round(random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.particles = new Array();
            for (var i = 0; i < this.particleCount; i++) {
                this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
        };
        this.Draw = function (_g) {
            for (var i = 0; i < this.particleCount - 1; i++) {
                var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
                var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
                if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
                    _g.fillStyle = this.frontColor;
                    _g.strokeStyle = this.frontColor;
                } else {
                    _g.fillStyle = this.backColor;
                    _g.strokeStyle = this.backColor;
                }
                if (i == 0) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else if (i == this.particleCount - 2) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                }
            }
        }
        this.Side = function (x1, y1, x2, y2, x3, y3) {
            return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
        }
    }
    ConfettiRibbon.bounds = new Vector2(0, 0);
    confetti = {};
    confetti.Context = function (id) {
        var i = 0;
        var canvas = document.getElementById(id);
        var canvasParent = canvas.parentNode;
        var canvasWidth = canvasParent.offsetWidth;
        var canvasHeight = canvasParent.offsetHeight;
        canvas.width = canvasWidth * retina;
        canvas.height = canvasHeight * retina;
        var context = canvas.getContext('2d');
        var interval = null;
        var confettiRibbons = new Array();
        ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        for (i = 0; i < confettiRibbonCount; i++) {
            confettiRibbons[i] = new ConfettiRibbon(random() * canvasWidth, -random() * canvasHeight * 2, ribbonPaperCount, ribbonPaperDist, ribbonPaperThick, 45, 1, 0.05);
        }
        var confettiPapers = new Array();
        ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
        for (i = 0; i < confettiPaperCount; i++) {
            confettiPapers[i] = new ConfettiPaper(random() * canvasWidth, random() * canvasHeight);
        }
        this.resize = function () {
            canvasWidth = canvasParent.offsetWidth;
            canvasHeight = canvasParent.offsetHeight;
            if (document.body.classList.contains("show-invitation")) {
                canvasWidth = window.innerWidth;
                canvasHeight = window.innerHeight;
            }
            canvas.width = canvasWidth * retina;
            canvas.height = canvasHeight * retina;
            ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
            ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        }
        this.start = function () {
            this.stop()
            var context = this;
            this.update();
        }
        this.stop = function () {
            cAF(this.interval);
        }
        this.update = function () {
            var i = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (i = 0; i < confettiPaperCount; i++) {
                confettiPapers[i].Update(duration);
                confettiPapers[i].Draw(context);
            }
            for (i = 0; i < confettiRibbonCount; i++) {
                confettiRibbons[i].Update(duration);
                confettiRibbons[i].Draw(context);
            }
            this.interval = rAF(function () {
                confetti.update();
            });
        }
    };
    var confetti = new confetti.Context('confetti');
    window.birthdayConfetti = confetti;
    confetti.start();
    window.addEventListener('resize', function (event) {
        confetti.resize();
    });
});