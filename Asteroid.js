const FPS = 40; // quadros por segundo
const friction = 0.5; // coeficiente de atrito do espaço
const shipBlinkDuration = 0.1; // duraçao da piscada em segundos
const shipExplodeDuration = 0.3; // duração da explosão da nave
const shipInvisibilityDuration = 3; // duraçao da invencibildade em segundos
const shipSize = 30; // altura em pixels da nave
const shipThrust = 5; // aceleração do navio px por segundo
const shipTurnSpeed = 360; // graus por segundo
const laserDist = 0.55; // distância máxima que o laser pode percorrer
const laserExplodeDuration = 0.1; // duração da explosão do laser
const laserMax = 10; // número máximo de lasers na tela ao mesmo tempo
const laserSpeed = 500; // velocidade do laser em pixels por segundo
const roidsJag = 0.3; //irregularidade dos asteróides
const roidsNum = 1; // começando o número de asteróides
const roidsSize = 100; // tamanho inicial dos asteróides em px
const roidsSpeed = 50; // velocidade máxima da asteroide em px por segundo
const roidsVert = 10; // número médio de vértices em cada asteróide
const gameLives = 3; //número inicial de vidas
const textFadeTime = 3; // em segundos
const textSize = 40; // em pixels
const roidsLargePts = 20; // pontos marcados para grande asteróide
const roidsMediumPts = 50; // pontos marcados para asteróide médio
const roidsSmallPts = 100; // pontos marcados para pequeno asteroide
const saveScore = "highScore"; // salvar chave para armazenamento local
let soundOn = false;
let musicOn = false;

let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");
document.querySelector("main").focus();


// Efeitos de som
function Sound(src, maxStreams = 1, vol = 1.0) {
	this.streamNum = 0;
	this.streams = [];
	for (let i = 0; i < maxStreams; i++) {
		this.streams.push(new Audio(src));
		this.streams[i].volume = vol;
	}
	this.play = function () {
		if (soundOn) {
			this.streamNum = (this.streamNum + 1) % maxStreams;
			this.streams[this.streamNum].play();
		}
	}
	this.stop = function () {
		this.streams[this.streamNum].pause();
		this.streams[this.streamNum].currentTime = 0;
	}
}
let laserSound = new Sound("https://margaux-dev.github.io/asteroids-game/asteroids-game-sounds/pew.m4a", 5, 0.4);
let thrustSound = new Sound("https://margaux-dev.github.io/asteroids-game/asteroids-game-sounds/thrust.m4a");
let hitSound = new Sound("https://margaux-dev.github.io/asteroids-game/asteroids-game-sounds/hit.m4a", 5, 0.8);
let explosionSound = new Sound("https://margaux-dev.github.io/asteroids-game/asteroids-game-sounds/explosion.m4a", 1, 0.7);


//Música
let music = new Music("https://margaux-dev.github.io/asteroids-game/asteroids-game-sounds/music-high.m4a", "https://margaux-dev.github.io/asteroids-game/asteroids-game-sounds/music-low.m4a");
let roidsLeft, roidsTotal;
function Music(srcA, srcB) {
	this.soundA = new Audio(srcA);
	this.soundB = new Audio(srcB);
	this.a = true;
	this.tempo = 1.0;
	this.beatTime = 0;
	this.play = function () {
		if (musicOn) {
			if (this.a) {
				this.soundA.play();
			} else {
				this.soundB.play();
			}
			this.a = !this.a;
		}
	}
	this.setAsteroidRatio = function (ratio) {
		this.tempo = 1 - 0.75 * (1 - ratio);
	}
	this.tick = function () {
		if (this.beatTime === 0) {
			this.play();
			this.beatTime = Math.ceil(this.tempo * FPS);
		} else {
			this.beatTime--;
		}
	}
}


// Coloca o Jogo em Loop
function loop() {
	
	game_proces = setInterval(update, 1000 / FPS);
	game_proces;
	
}

loop();

function telapause() {
	this.pauseAudio();
	clearInterval(game_proces);
}

// DECLARA AS VARIÁVEIS DO JOGO
let level, roids, ship, lives, score, highScore, text, textAlpha;

//Música de undertale Hope and Dreans
function playAudio() {
	let x = document.getElementById("undertale");
	x.play();
}
function pauseAudio() {
	let x = document.getElementById("undertale");
	x.pause();
}

// Inicia o Jogo
// Imagem de fundo
context.fillStyle = "rgba(0, 0, 11, 1)";
context.fillRect(0, 0, canvas.width, canvas.height);
// Titulo
context.fillStyle = "rgba(255, 255, 255, 1)";
context.font = "normal small-caps 100 " + (textSize + 30) + "px VT323";
context.textAlign = "center";
context.textBaseline = "middle";
context.fillText("ASTEROIDES", canvas.width / 2, canvas.height * 0.48);
// subtitulo
context.font = "small-caps " + (textSize - 15) + "px VT323";
context.fillText("PRESSIONE QUALQUER TECLA PARA COMEÇAR", canvas.width / 2, canvas.height * 0.58);
document.addEventListener("keydown", newGame);
document.addEventListener("keydown", playAudio);



// Cria um asteroide
function newAsteroid(x, y, r) {
	let lvlMultiply = 1 + 0.1 * level;
	let roid = {
		x: x,
		y: y,
		xv: Math.random() * roidsSpeed * lvlMultiply / FPS * (Math.random() < 0.5 ? 1 : -1),
		yv: Math.random() * roidsSpeed * lvlMultiply / FPS * (Math.random() < 0.5 ? 1 : -1),
		r: r,
		a: Math.random() * Math.PI * 2, // in radians
		vert: Math.floor(Math.random() * (roidsVert + 1) + roidsVert / 2),
		offs: []
	};

	// Crie a matriz de deslocamentos de vértice
	for (let i = 0; i < roid.vert; i++) {
		roid.offs.push(Math.random() * roidsJag * 2 + 1 - roidsJag);
	}

	return roid;
}

// cria o cinturão de asteroide
function createAsteroidBelt() {
	roids = [];
	roidsTotal = (roidsNum + level) * 7;
	roidsLeft = roidsTotal;
	let x, y;
	for (let i = 0; i < roidsNum + level; i++) {
		do {
			x = Math.floor(Math.random() * canvas.width);
			y = Math.floor(Math.random() * canvas.height);
		} while (distBetweenPoints(ship.x, ship.y, x, y) < roidsSize * 2 + ship.r);
		roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 2)));
	}
}


// Ao destruir um asteroide
function destroyAsteroid(index) {
	let x = roids[index].x;
	let y = roids[index].y;
	let r = roids[index].r;

	// separa o asteroide em 2 
	if (r === Math.ceil(roidsSize / 2)) {
		roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 4)));
		roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 4)));
		score += roidsLargePts;
	} else if (r == Math.ceil(roidsSize / 4)) {
		roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 8)));
		roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 8)));
		score += roidsMediumPts;
	} else {
		score += roidsSmallPts;
	}

	// Olha a pontuação máxima
	if (score > highScore) {
		highScore = score;
		localStorage.setItem(saveScore, highScore);
	}

	// Destroi o último fragmento do asteroide
	roids.splice(index, 1);
	hitSound.play();

	// Proporção de asteróides restantes para o ritmo da música
	roidsLeft--;
	music.setAsteroidRatio(roidsLeft === 0 ? 1 : roidsLeft / roidsTotal);

	// Então um novo nível começa
	if (roids.length === 0) {
		level++;
		newLevel();
	}
}


// OBTENHA A DISTÂNCIA ENTRE DOIS PONTOS
function distBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}


// CONSTRUA UMA NOVA NAVE
function newShip() {
	return {
		x: canvas.width / 2,
		y: canvas.height / 2,
		r: shipSize / 2,
		a: 90 / 180 * Math.PI, // radiant
		blinkNumber: Math.ceil(shipInvisibilityDuration / shipBlinkDuration),
		blinkTime: Math.ceil(shipBlinkDuration * FPS),
		canShoot: true,
		dead: false,
		explodeTime: 0,
		lasers: [],
		rotation: 0,
		thrusting: false,
		thrust: {
			x: 0,
			y: 0
		}
	}
}


// DESENHE UMA NOVA NAVE
function drawShip(x, y, a, color = "rgba(73, 152, 250, 1)") {
	context.fillStyle = "#fff";
	context.strokeStyle = color;
	context.lineWidth = shipSize / 10;
	context.beginPath();
	context.moveTo(
		x + 5 / 3 * ship.r * Math.cos(a),
		y - 5 / 3 * ship.r * Math.sin(a)
	);
	context.lineTo(
		x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
		y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
	);
	context.lineTo(
		x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
		y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
	);
	context.closePath();
	context.stroke();
	context.fill();
}


// ATIRA LASERS
function shootLaser() {
	// Cria os lasers
	if (ship.canShoot && ship.lasers.length < laserMax) {
		ship.lasers.push({
			x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
			y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
			xv: laserSpeed * Math.cos(ship.a) / FPS,
			yv: -laserSpeed * Math.sin(ship.a) / FPS,
			dist: 0,
			explodeTime: 0
		});
		laserSound.play();
	}
	// Evitar mais disparos
	ship.canShoot = false;
}


// FAZ A NAVE EXPLODIR
function explodeShip() {
	ship.explodeTime = Math.ceil(shipExplodeDuration * FPS);
	explosionSound.play();
}


// DESENHA A EXPLOSÃO
function drawExplosion(ex, ey, spikes, r) {
	let rot = Math.PI / 2 * 3;
	let x = ex;
	let y = ey;
	let step = Math.PI / spikes;
	context.beginPath();
	context.moveTo(
		ex, ey - r
	);
	for (let i = 0; i < spikes; i++) {
		x = ex + Math.cos(rot) * r;
		y = ey + Math.sin(rot) * r;
		context.lineTo(x, y);
		rot += step;
		x = ex + Math.cos(rot);
		y = ey + Math.sin(rot);
		context.lineTo(x, y);
		rot += step
	}
	context.lineTo(ex, ey - r);
	context.closePath();
	context.lineWidth = 3.5;
	context.strokeStyle = "rgba(179,62,0,1.00)";
	context.stroke();
	context.fillStyle = "rgba(255,235,0,1.00)";
	context.fill();

	context.fillStyle = "rgba(198,77,0,1.00)";
	context.beginPath();
	context.arc(ex, ey, r * 0.7, Math.PI * 2, false);
	context.fill();
	context.fillStyle = "rgba(252,99,0,1.00)";
	context.beginPath();
	context.arc(ex, ey, r * 0.6, Math.PI * 2, false);
	context.fill();
	context.fillStyle = "rgba(255,140,65,1.00)";
	context.beginPath();
	context.arc(ex, ey, r * 0.5, Math.PI * 2, false);
	context.fill();
	context.fillStyle = "rgba(255,169,65,1.00)";
	context.beginPath();
	context.arc(ex, ey, r * 0.4, Math.PI * 2, false);
	context.fill();
	context.fillStyle = "rgba(255,206,65,1.00)";
	context.beginPath();
	context.arc(ex, ey, r * 0.3, Math.PI * 2, false);
	context.fill();
	context.fillStyle = "rgba(255,233,66,1.00)";
	context.beginPath();
	context.arc(ex, ey, r * 0.2, 0, Math.PI * 2, false);
	context.fill();
}


// FAZ O JOGO FUNCIONAR
function update() {
	let blinkOn = ship.blinkNumber % 2 === 0;
	let exploding = ship.explodeTime > 0;


	//MÚSICA
	music.tick();

	// FUNDO
	context.fillStyle = "rgba(22, 22, 2, 1)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// DESENHA O ASTEROIDE
	let x, y, r, a, vert, offs;
	for (let i = 0; i < roids.length; i++) {
		context.strokeStyle = "rgba(89, 92, 94, 1)";
		context.fillStyle = "rgba(46, 47, 48, 1)";
		context.lineWidth = shipSize / 15;

		// Obtenha os adereços de asteróides
		x = roids[i].x;
		y = roids[i].y;
		r = roids[i].r;
		a = roids[i].a;
		vert = roids[i].vert;
		offs = roids[i].offs;

		// Desenhe um caminho
		context.beginPath();
		context.moveTo(
			x + r * offs[0] * Math.cos(a),
			y + r * offs[0] * Math.sin(a)
		);

		// Desenhe o polígono
		for (let j = 1; j < vert; j++) {
			context.lineTo(
				x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
				y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
			);
		}
		context.closePath();
		context.stroke();
		context.fill()
	}


	// IMPULSIONE A NAVE
	if (ship.thrusting && !ship.dead) {
		ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
		ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;
		thrustSound.play();

		// Desenhe o propulsor
		if (!exploding && blinkOn) {
			context.fillStyle = "rgba(250, 250, 250, 1)";
			context.strokeStyle = "rgba(0, 242, 255, 1)";
			context.lineWidth = shipSize / 8;
			context.beginPath();
			context.moveTo(
				//Esquerda
				ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
				ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
			);
			context.lineTo(
				//Centro, atrás da nave
				ship.x - ship.r * (5 / 3 * Math.cos(ship.a)),
				ship.y + ship.r * (5 / 3 * Math.sin(ship.a))
			);
			context.lineTo(
				//direita
				ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
				ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
			);
			context.closePath();
			context.fill();
			context.stroke();
		}
	} else {
		// Aplique fricção espacial quando não houver impulso
		ship.thrust.x -= friction * ship.thrust.x / FPS;
		ship.thrust.y -= friction * ship.thrust.y / FPS;
		thrustSound.stop()
	}

	// DESENHE A NAVE APÓS A EXPLOSÃO
	if (!exploding) {
		if (blinkOn && !ship.dead) {
			drawShip(ship.x, ship.y, ship.a);
		}
		// Lidar com piscando
		if (ship.blinkNumber > 0) {
			// Reduza o tempo de piscar
			ship.blinkTime--;
			// Reduzir o número de piscadas
			if (ship.blinkTime === 0) {
				ship.blinkTime = Math.ceil(shipBlinkDuration * FPS);
				ship.blinkNumber--;
			}
		}
	} else {
		// Desenha a explosão
		drawExplosion(ship.x, ship.y, 20, ship.r);
	}


	// CRIA OS LASERS
	for (let i = 0; i < ship.lasers.length; i++) {
		if (ship.lasers[i].explodeTime == 0) {
			context.fillStyle = "rgba(52, 207, 240, 1)";
			context.beginPath();
			context.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 13, 0, Math.PI * 2, false);
			context.fill();
		} else {
			// Desenha a explosão
			drawExplosion(ship.lasers[i].x, ship.lasers[i].y, 20, shipSize * 0.75);
		}
	}


	// DESENHE O TEXTO DO JOGO
	if (textAlpha >= 0) {
		context.fillStyle = "rgba(255, 255, 255, 1) " + textAlpha + ")";
		context.font = "small-caps " + (textSize + 20) + "px VT323";
		context.textAlign = "center";
		context.fillText(text, canvas.width / 2, canvas.height * 0.7);
		textAlpha -= (1.0 / textFadeTime / FPS);
	} else if (ship.dead) {
		context.fillStyle = "rgba(255, 255, 255, 1)";
		context.font = "small-caps " + (textSize - 5) + "px VT323";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText("PRESSIONE QUALQUER TECLA PARA JOGAR DE NOVO", canvas.width / 2, canvas.height * 0.5);
		document.addEventListener("keydown", newGame);
		document.addEventListener("keydown", playAudio);

	}


	// MOSTRA AS VIDAS 
	let lifeColors;
	for (let i = 0; i < lives; i++) {
		lifeColors = exploding && i === lives - 1 ? "red" : "#fff";
		drawShip((shipSize + i * shipSize * 1.2), shipSize, 0.5 * Math.PI, lifeColors);
	}


	// MOSTRA A PONTUAÇÃO
	context.fillStyle = "#fff";
	context.font = (textSize + 5) + "px VT323";
	context.textAlign = "right";
	context.textBaseline = "middle";
	context.fillText(score, canvas.width - shipSize / 2, shipSize);


	// MOSTRA A PONTUAÇÃO MÁXIMA
	context.fillStyle = "rgba(242, 255, 76, 1)";
	context.font = (textSize * 0.9) + "px VT323";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText("PONTUAÇÃO MÁXIMA: " + highScore, canvas.width / 2, shipSize);


	//DETECTA O LASER BATENDO NO ASTEROIDE
	let ax, ay, ar, lx, ly;
	for (let i = roids.length - 1; i >= 0; i--) {
		//Pegue os adereços dos asteróides
		ax = roids[i].x;
		ay = roids[i].y;
		ar = roids[i].r;
		//loop dos lasers
		for (let j = ship.lasers.length - 1; j >= 0; j--) {
			//pegue os adereços de laser
			lx = ship.lasers[j].x;
			ly = ship.lasers[j].y;

			//detecta dano
			if (ship.lasers[j].explodeTime === 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

				//destroi o asteroide + laser explosão
				destroyAsteroid(i);
				ship.lasers[j].explodeTime = Math.ceil(laserExplodeDuration * FPS);
				break;
			}
		}
	}


	//OLHA A COLISÃO DO ASTEROIDE
	if (!exploding) {
		if (ship.blinkNumber === 0 && !ship.dead) {
			for (let i = 0; i < roids.length; i++) {
				if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
					explodeShip();
					destroyAsteroid(i);
					break;
				}
			}
		}

		// GIRA A NAVE
		ship.a += ship.rotation;

		// MOVE A NAVE
		ship.x += ship.thrust.x;
		ship.y += ship.thrust.y;

	} else {
		ship.explodeTime--;
		// RESTAURA A NAVE APÓS UMA EXPLOSÃO SE OUVER VIDAS
		if (ship.explodeTime == 0) {
			lives--;
			if (lives === 0) {
				gameOver();
			} else {
				ship = newShip();
			}
		}
	}

	// BORDA DO PUNHO DA TELA
	if (ship.x < 0 - ship.r) {
		ship.x = canvas.width + ship.r;
	} else if (ship.x > canvas.width + ship.r) {
		ship.x = 0 - ship.r;
	}
	if (ship.y < 0 - ship.r) {
		ship.y = canvas.height + ship.r;
	} else if (ship.y > canvas.height + ship.r) {
		ship.y = 0 - ship.r;
	}


	// FUNÇÃO DOS LASERS
	for (let i = ship.lasers.length - 1; i >= 0; i--) {

		// Distância percorrida verificada
		if (ship.lasers[i].dist > laserDist * canvas.width) {
			ship.lasers.splice(i, 1);
			continue;
		}

		// Lidar com a explosão
		if (ship.lasers[i].explodeTime > 0) {
			ship.lasers[i].explodeTime--;

			// Destrua o laser após a duração
			if (ship.lasers[i].explodeTime == 0) {
				ship.lasers.splice(i, 1);
				continue;
			}
		} else {
			//Move o laser
			ship.lasers[i].x += ship.lasers[i].xv;
			ship.lasers[i].y += ship.lasers[i].yv;

			// Calcula a dinstãncia percorrida
			ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
		}



		// Lidar com a borda da tela (lasers)
		if (ship.lasers[i].x < 0) {
			ship.lasers[i].x = canvas.width;
		} else if (ship.lasers[i].x > canvas.width) {
			ship.lasers[i].x = 0;
		}
		if (ship.lasers[i].y < 0) {
			ship.lasers[i].y = canvas.height;
		} else if (ship.lasers[i].y > canvas.height) {
			ship.lasers[i].y = 0;
		}
	}


	//MOVE OS ASTEROIDES
	for (let i = 0; i < roids.length; i++) {
		roids[i].x += roids[i].xv;
		roids[i].y += roids[i].yv;

		//Lidar com a borda da tela (asteroides)
		if (roids[i].x < 0 - roids[i].r) {
			roids[i].x = canvas.width + roids[i].r;
		} else if (roids[i].x > canvas.width + roids[i].r) {
			roids[i].x = 0 - roids[i].r
		}
		if (roids[i].y < 0 - roids[i].r) {
			roids[i].y = canvas.height + roids[i].r;
		} else if (roids[i].y > canvas.height + roids[i].r) {
			roids[i].y = 0 - roids[i].r
		}
	}
}


// COMEÇAR UM NOVO JOGO
function newGame() {
	level = 0;
	score = 0;
	lives = gameLives;
	ship = newShip();

	document.removeEventListener("keydown", newGame);

	//Pontuação máxima para armazenamento local
	let scoreStr = localStorage.getItem(saveScore);
	if (scoreStr === null) {
		highScore = 0;
	} else {
		highScore = parseInt(scoreStr);
	}

	newLevel();
}


// NOVO NÍVEL
function newLevel() {
	text = "NÍVEL  " + (level + 1);
	textAlpha = 1.0;
	createAsteroidBelt();
}


// FIM DE JOGO
function gameOver() {
	ship.dead = true;
	text = "FIM DE JOGO";
	textAlpha = 1.0;
	musicOn = false;
}




// MOVE A NAVE E ATIRA OS LASERS AO PRESSIONAR AS TECLAS
function keyDown(e) {
	if (ship.dead) {
		return;
	}
	switch (e.keyCode) {
		//BOTAO DE PAUSE
		// Tecla P para pause
		case 80:
			telapause();
			
			break;
		// Tecla O para despausar
		case 79:
			loop();
			break;
		// Barra de espaço
		case 32:
			shootLaser();
			break;
		case 83:
			shootLaser();
			break;
		case 40:
			shootLaser();
			break;
		// Seta esquerda
		case 37:
			ship.rotation = shipTurnSpeed / 180 * Math.PI / FPS;
			break;
		// Tecla A para ir para esquerda
		case 65:
			ship.rotation = shipTurnSpeed / 180 * Math.PI / FPS;
			break;
		// Seta pra cima
		case 38:
			ship.thrusting = true;
			break;
		// Tecla W para ir pra cima
		case 87:
			ship.thrusting = true;
			break;
		// Seta direita
		case 39:
			ship.rotation = -shipTurnSpeed / 180 * Math.PI / FPS;
			break;
		// Tecla D para ir pra direita
		case 68:
			ship.rotation = -shipTurnSpeed / 180 * Math.PI / FPS;
			break;
	}
}


// PARA AS AÇÕES DO ACELERADOR
function keyUp(e) {

	switch (e.keyCode) {
		// Barra de espaço
		case 32:
			ship.canShoot = true;
			break;
		// Tecla S
		case 83:
			ship.canShoot = true;
			break;
		// Tecla para baixo
		case 40:
			ship.canShoot = true;
			break;
		// Seta esquerda
		case 37:
			ship.rotation = 0;
			break;
		// Tecla A para ir para esquerda
		case 65:
			ship.rotation = 0;
			break;
		// Seta pra cima
		case 38:
			ship.thrusting = false;
			break;
		// Tecla W para ir pra cima
		case 87:
			ship.thrusting = false;
			break;
		// Seta direita
		case 39:
			ship.rotation = 0;
			break;
		// Tecla D para ir pra direita
		case 68:
			ship.rotation = 0;
			break;
	}
}


// LIGUE/DESLIGUE OS EFEITOS SONOROS
function soundToggle() {
	if (soundOn === false) {
		soundOn = true;
		document.querySelector("#sound").innerHTML = '<i class="fas fa-volume-up" aria-hidden="true" aria-label="sound on"></i>'
	} else {
		soundOn = false;
		document.querySelector("#sound").innerHTML = '<i class="fas fa-volume-mute" aria-hidden="true" aria-label="sound off"></i>'
	}
}

function teladepause(){
	document.querySelector("canvas").classList.add("#tela")
}

// LIGUE/DESLIGUE A MÚSICA
function musicToggle() {
	if (musicOn === false) {
		musicOn = true;
		document.querySelector("#music").classList.remove("mute");
	} else {
		musicOn = false;
		document.querySelector("#music").classList.add("mute");
		
	}
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
document.querySelector("#sound").addEventListener("click", soundToggle);
document.querySelector("#music").addEventListener("click", musicToggle);