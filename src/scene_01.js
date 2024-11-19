import Phaser from "phaser"

export default class Scene_01 extends Phaser.Scene {
	// Initialize game state variables
	constructor() {
		super('Scene_01');
		this.livesP1 = 3;
		this.livesP2 = 3;
		this.idleP1 = true;
		this.idleP2 = true;
		this.isAttackP1 = false;
		this.isAttackP2 = false;
		this.canThrowP1 = true;
		this.canThrowP2 = true;
		this.gameOver = false;
		this.winner = null;
		this.pointsP1 = 0;
		this.pointsP2 = 0;
	}

	// Load all game assets
	preload() {
		// Load background layers
		this.load.image("skyImg", "assets/bg/1.png");
		this.load.image('darkTreesImg', 'assets/bg/2.png');
		this.load.image('lightTreesImg', 'assets/bg/3.png');
		this.load.image('lakeImg', 'assets/bg/4.png');
		this.load.image('tilesetImg', 'assets/bg/Tileset.png');
		this.load.image('undergrowthImg', 'assets/bg/5.png');

		// Load map data
		this.load.tilemapTiledJSON('map', 'assets/Map.json');

		// Sprites of the players
		this.load.atlas("player1", "assets/players/BlueGuy.png", "assets/players/BlueGuy.json");
		this.load.atlas("player2", "assets/players/PinkGirl.png", "assets/players/PinkGirl.json");

		// Platforms sprites
		this.load.image('platform', 'assets/platform.png')
		this.load.image('player1Img', 'assets/players/blueGuy/Dude_Monster.png');
		this.load.image('player2Img', 'assets/players/pinkGirl/Pink_Monster.png');

		// Hearts sprites
		this.load.image('liveUpImg', 'assets/health1.png');
		this.load.image('liveDownImg', 'assets/health2.png');

		// Winner's crown and stone sprites
		this.load.image('stone', 'assets/players/Rock2.png');
		this.load.image('crown', 'assets/players/crown.png');

		// Music and effects
		this.load.audio('gameMusic', 'assets/sounds/game-sound.mp3');
		this.load.audio('jump', 'assets/sounds/jump.wav');
		this.load.audio('hurt', 'assets/sounds/hurt.wav');
		this.load.audio('death', 'assets/sounds/death.wav')
		this.load.audio('throw', 'assets/sounds/throw.mp3');
		this.load.audio('hit', 'assets/sounds/hit.mp3')
		this.load.audio('gameOverMusic', 'assets/sounds/game_over_song.mp3');
		this.load.audio('fight', 'assets/sounds/fight.mp3');

		// Font of the game
		const font = new FontFace('gameFont', 'url(assets/Planes_ValMore.ttf)');
		font.load().then((loadedFont) => {
			document.fonts.add(loadedFont);
		}).catch((error) => {
			console.error('Error cargando la fuente:', error);
		});

		// Lives of the players
		this.livesP1 = 3;
		this.livesP2 = 3;
	}

	create() {
		//Create tilemap and layers from loaded assets
		const map = this.make.tilemap({ key: "map" });
		const skyTile = map.addTilesetImage("sky", "skyImg");
		const darkTreesTile = map.addTilesetImage('darkTrees', 'darkTreesImg');
		const lightTreesTile = map.addTilesetImage('lightTrees', 'lightTreesImg');
		const lakeTile = map.addTilesetImage('lake', 'lakeImg');
		const tilesetTile = map.addTilesetImage('tileset', 'tilesetImg');
		const undergrowthTile = map.addTilesetImage('undergrowth', 'undergrowthImg');

		//Create tilemap and layers from loaded assets
		map.createLayer("Sky", skyTile);
		map.createLayer("DarkTrees", darkTreesTile);
		map.createLayer("LightTrees", lightTreesTile);
		map.createLayer("Lake", lakeTile);
		const dirt = map.createLayer("Dirt", tilesetTile);
		dirt.setCollisionByExclusion([-1], true);
		const floor = map.createLayer("Floor", tilesetTile);
		floor.setCollisionByExclusion([-1], true);

		//Initialize and play game sounds
		this.fightSound = this.sound.add("fight", { volume: 0.3, loop: false });
		this.fightSound.play();
		this.gameMusic = this.sound.add("gameMusic", { volume: 0.3, loop: true });
		this.gameMusic.play();
		this.jump = this.sound.add("jump", { volume: 0.5, loop: false });
		this.hurt = this.sound.add("hurt", { volume: 0.6, loop: false });
		this.death = this.sound.add("death", { volume: 0.5, loop: false });
		this.throw = this.sound.add("throw", { volume: 0.2, loop: false });
		this.hit = this.sound.add("hit", { volume: 0.15, loop: false });
		this.gameOverMusic = this.sound.add("gameOverMusic", { volume: 0.5, loop: false });

		//Create player portraits and health indicators
		this.p1Img = this.add.image(50, 340, 'player1Img');
		this.p1Img.setScale(2.5);
		this.p2Img = this.add.image(900, 340, 'player2Img');
		this.p2Img.setScale(2.5);
		this.p2Img.setFlipX(true);

		//Set up health indicators for player 1
		this.healthP1 = this.add.image(110, 360, 'liveUpImg');
		this.healthP1.setScale(0.125);
		this.healthP1 = this.add.image(170, 360, 'liveUpImg');
		this.healthP1.setScale(0.125);
		this.healthP1 = this.add.image(230, 360, 'liveUpImg');
		this.healthP1.setScale(0.125);

		//Set up health indicators for player 2
		this.healthP2 = this.add.image(720, 360, 'liveUpImg');
		this.healthP2.setScale(0.125);
		this.healthP2 = this.add.image(780, 360, 'liveUpImg');
		this.healthP2.setScale(0.125);
		this.healthP2 = this.add.image(840, 360, 'liveUpImg');
		this.healthP2.setScale(0.125);

		//Create moving platforms with physics
		this.movingPlatform1 = this.physics.add.image(370, 105, 'platform').setScale(0.125);
		this.movingPlatform1.setImmovable(true);
		this.movingPlatform1.body.allowGravity = false;
		this.movingPlatform1.setVelocityX(50);

		this.movingPlatform2 = this.physics.add.image(600, 168, 'platform').setScale(0.125);
		this.movingPlatform2.setImmovable(true);
		this.movingPlatform2.body.allowGravity = false;
		this.movingPlatform2.setVelocityX(50);

		//Create and configure player 1 (Blue Guy)
		this.player1 = this.physics.add.sprite(50, 50, "player1");
		this.player1.setCollideWorldBounds(true);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.physics.add.collider(this.player1, floor);
		this.physics.add.collider(this.player1, dirt);
		this.player1.setGravityY(200);
		this.player1.body.setSize(15, 25);

		//Create animations for player 1
		this.anims.create({
			key: "move",
			frames: this.anims.generateFrameNames("player1", {
				prefix: "run_",
				start: 1,
				end: 6,
				zeroPad: 2,
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNames("player1", {
				prefix: "idle_",
				start: 1,
				end: 4,
				zeroPad: 2,
			}),
			frameRate: 8,
			repeat: -1,
		});

		this.anims.create({
			key: "jump",
			frames: this.anims.generateFrameNames("player1", {
				prefix: "jump_",
				start: 1,
				end: 8,
				zeroPad: 2,
			}),
			frameRate: 8,
			repeat: 0,
		});

		this.anims.create({
			key: "attack2",
			frames: this.anims.generateFrameNames("player1", {
				prefix: "attack2_",
				start: 1,
				end: 5,
				zeroPad: 2,
			}),
			frameRate: 9,
			repeat: 0,
		});

		this.anims.create({
			key: "throw",
			frames: this.anims.generateFrameNames("player1", {
				prefix: "throw_",
				start: 1,
				end: 4,
				zeroPad: 2,
			}),
			frameRate: 15,
			repeat: 0,
		});

		this.anims.create({
			key: "hurt",
			frames: this.anims.generateFrameNames("player1", {
				prefix: "hurt_",
				start: 1,
				end: 4,
				zeroPad: 2,
			}),
			frameRate: 8,
			repeat: 0,
		});

		//Create and configure player 2 (Pink Girl)
		this.player2 = this.physics.add.sprite(900, 50, "player2");
		this.player2.setCollideWorldBounds(true);
		this.physics.add.collider(this.player2, floor);
		this.physics.add.collider(this.player2, dirt);
		this.player2.setGravityY(200);
		this.player2.body.setSize(15, 25);
		this.player2.setFlipX(true);

		map.createLayer("Undergrowth", undergrowthTile);

		//Create animations for player 2
		this.anims.create({
			key: "moveP2",
			frames: this.anims.generateFrameNames("player2", {
				prefix: "run_",
				start: 1,
				end: 6,
				zeroPad: 2,
			}),
			frameRate: 10,
			repeat: -1,
		});


		this.anims.create({
			key: "idleP2",
			frames: this.anims.generateFrameNames("player2", {
				prefix: "idle_",
				start: 1,
				end: 4,
				zeroPad: 2,
			}),
			frameRate: 8,
			repeat: -1,
		});

		this.anims.create({
			key: "jumpP2",
			frames: this.anims.generateFrameNames("player2", {
				prefix: "jump_",
				start: 1,
				end: 8,
				zeroPad: 2,
			}),
			frameRate: 8,
			repeat: 0,
		});


		this.anims.create({
			key: "attack2P2",
			frames: this.anims.generateFrameNames("player2", {
				prefix: "attack2_",
				start: 1,
				end: 5,
				zeroPad: 2,
			}),
			frameRate: 9,
			repeat: 0,
		});

		this.anims.create({
			key: "throwP2",
			frames: this.anims.generateFrameNames("player2", {
				prefix: "throw_",
				start: 1,
				end: 4,
				zeroPad: 2,
			}),
			frameRate: 15,
			repeat: 0,
		});

		this.anims.create({
			key: "hurtP2",
			frames: this.anims.generateFrameNames("player2", {
				prefix: "hurt_",
				start: 1,
				end: 4,
				zeroPad: 2,
			}),
			frameRate: 8,
			repeat: 0,
		});

		//Set up keyboard controls for both players
		this.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.C = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
		this.V = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);

		this.P = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
		this.O = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);

		//Set up collisions between players and platforms
		this.physics.add.collider(this.player1, this.player2);

		this.physics.add.collider(this.player1, this.movingPlatform1);
		this.physics.add.collider(this.player1, this.movingPlatform2);
		this.physics.add.collider(this.player2, this.movingPlatform1);
		this.physics.add.collider(this.player2, this.movingPlatform2);

		this.registry.set('livesP1', this.livesP1);
		this.registry.set('livesP2', this.livesP2);

		//Create death zone and game over text elements
		this.deathZone = this.add.rectangle(0, 475, 950, 5).setOrigin(0, 0);
		this.physics.add.existing(this.deathZone, true);
		this.gameOverText = this.add.text(475, 40, '', {
			fontFamily: "gameFont",
			fontSize: "64px",
			color: "black",
			fontStyle: "bold"
		}).setOrigin(0.5);

		this.winnerText = this.add.text(485, 220, '', {
			fontFamily: "gameFont",
			fontSize: "64px",
			color: "gold",
			fontStyle: "bold"
		}).setOrigin(0.5);

		// Score points
		this.scoreP1Text = this.add.text(20, 180, '', {
			fontFamily: "gameFont",
			fontSize: "16px",
			color: "white",
			fontStyle: "bold"
		}) 

		this.scoreP2Text = this.add.text(860, 180, '', {
			fontFamily: "gameFont",
			fontSize: "16px",
			color: "white",
			fontStyle: "bold"
		}) 

		this.pointsP1Text = this.add.text(40, 200, '', {
			fontFamily: "gameFont",
			fontSize: "84px",
			color: "blue",
			fontStyle: "bold"
		}) 

		this.pointsP2Text = this.add.text(880, 200, '', {
			fontFamily: "gameFont",
			fontSize: "84px",
			color: "magenta",
			fontStyle: "bold"
		}) 

		this.scoreP1Text.setText(`SCORE P1`);
		this.scoreP2Text.setText(`SCORE P2`);

		this.pointsP1Text.setText(`${this.pointsP1}`);
		this.pointsP2Text.setText(`${this.pointsP2}`);
		
		// Create attack zone for Player 1
		this.attackZoneP1 = this.add.zone(this.player1.x, this.player1.y, 20, 15); // Initial size is 20x15
		this.physics.add.existing(this.attackZoneP1);

		const bodyP1 = this.attackZoneP1.body;
		if (bodyP1 instanceof Phaser.Physics.Arcade.Body) {
			bodyP1.setImmovable(true); // Make the body immovable
			bodyP1.moves = true; // Allow movement
			bodyP1.setAllowGravity(false); // Disable gravity
		}

		// Create attack zone for Player 2
		this.attackZoneP2 = this.add.zone(this.player2.x, this.player2.y, 20, 15); // Initial size is 20x15
		this.physics.add.existing(this.attackZoneP2);

		const bodyP2 = this.attackZoneP2.body;
		if (bodyP2 instanceof Phaser.Physics.Arcade.Body) {
			bodyP2.setImmovable(true); // Make the body immovable
			bodyP2.moves = true; // Allow movement
			bodyP2.setAllowGravity(false); // Disable gravity
		}
		this.stones = this.physics.add.group();
	}

	update() {
		// Update Player 1's attack zone position
		this.attackZoneP1.x = this.player1.x;
		this.attackZoneP1.y = this.player1.y;

		this.isAttackP1 = false;

		// Player 1 movement controls
		if (this.A.isDown) {
			this.player1.setVelocityX(-200);
			this.player1.setFlipX(true);
			this.player1.anims.play("move", true);
			this.idleP1 = true;
		} else if (this.D.isDown) {
			this.player1.setVelocityX(200);
			this.player1.setFlipX(false);
			this.player1.anims.play("move", true);
			this.idleP1 = true;
		}

		// Player 1 attack controls
		if (this.C.isDown) {
			this.isAttackP1 = true;
			this.player1.anims.play("attack2", true);
			if (!this.hit.isPlaying) {
				this.hit.play();
			}
			const offsetX = this.player1.flipX ? -7 : 7
			this.attackZoneP1.x = this.player1.x + offsetX;
			this.idleP1 = true;
		}
		// Player 1 throwing stone mechanics
		else if (this.V.isDown && this.canThrowP1) {
			this.player1.anims.play("throw", true);
			this.throw.play();
			this.canThrowP1 = false;
			const direction = this.player1.flipX ? -1 : 1; // Determine stone direction
			const stone = this.physics.add.sprite(this.player1.x, this.player1.y, 'stone');
			this.physics.add.collider(stone, this.player2, () => {
				stone.destroy(); // Destroy stone on collision
				this.player2.setVelocityY(-200); // Impact reaction
				this.player2.anims.play("hurtP2", true);
				if (!this.hurt.isPlaying) {
					this.hurt.play();
				}
				this.playerDied(this.player2);
			});
			this.stones.add(stone);
			stone.setVelocityX(300 * direction);
			stone.setVelocityY(-150); // Adjust velocity
			this.time.delayedCall(1000, () => {
				this.canThrowP1 = true;
			}, [], this);
			this.idleP1 = true;
		}

		// Player 1 jump mechanics
		if ((this.W.isDown) && this.player1.body.onFloor()) {
			this.player1.setVelocityY(-250);
			this.player1.anims.play("jump", true);
			this.idleP1 = true;
			if (!this.jump.isPlaying && !this.gameOver) {
				this.jump.play();
			}
		}

		// Player 1 idle animation
		if (this.A.isUp && this.D.isUp && this.C.isUp && this.V.isUp && this.W.isUp && this.idleP1) {
			this.player1.setVelocityX(0);
			this.player1.anims.play("idle", true);
		}

		// Update Player 2's attack zone position
		this.attackZoneP2.x = this.player2.x;
		this.attackZoneP2.y = this.player2.y;

		this.isAttackP2 = false;
		// Player 2 movement controls
		if (this.cursors.left.isDown) {
			this.player2.setVelocityX(-200);
			this.player2.setFlipX(true);
			this.player2.anims.play("moveP2", true);
			this.idleP2 = true;
		} else if (this.cursors.right.isDown) {
			this.player2.setVelocityX(200);
			this.player2.setFlipX(false);
			this.player2.anims.play("moveP2", true);
			this.idleP2 = true;
		}

		// Player 2 attack controls
		if (this.P.isDown) {
			this.isAttackP2 = true;
			this.player2.anims.play("attack2P2", true);
			if (!this.hit.isPlaying) {
				this.hit.play();
			}
			const offsetX = this.player2.flipX ? -7 : 7
			this.attackZoneP2.x = this.player2.x + offsetX;
			this.idleP2 = true;
		}
		// Player 2 throwing stone mechanics
		else if (this.O.isDown && this.canThrowP2) {
			this.player2.anims.play("throwP2", true);
			this.throw.play();
			this.idleP2 = true;
			this.canThrowP2 = false;
			const direction = this.player2.flipX ? -1 : 1; // Determine stone direction
			const stone = this.physics.add.sprite(this.player2.x, this.player2.y, 'stone');
			this.stones.add(stone);
			stone.setVelocityX(300 * direction);
			stone.setVelocityY(-150); // Adjust velocity
			this.physics.add.collider(stone, this.player1, () => {
				stone.destroy(); // Destroy stone on collision
				this.player1.setVelocityY(-200); // Impact reaction
				this.player1.anims.play("hurt", true);
				if (!this.hurt.isPlaying) {
					this.hurt.play();
				}
				this.playerDied(this.player1);
			});
			this.time.delayedCall(1000, () => {
				this.canThrowP2 = true;
			}, [], this);
		}

		// Player 2 jump mechanics
		if ((this.cursors.up.isDown) && this.player2.body.onFloor()) {
			this.player2.setVelocityY(-250);
			this.player2.anims.play("jumpP2", true);
			this.idleP2 = true;
			if (!this.jump.isPlaying && !this.gameOver) {
				this.jump.play();
			}
		}

		// Player 2 idle animation
		if (this.cursors.left.isUp && this.cursors.right.isUp && this.P.isUp && this.O.isUp && this.idleP2) {
			this.player2.setVelocityX(0);
			this.player2.anims.play("idleP2", true);
		}

		// Moving platforms logic
		if (this.movingPlatform1.x >= 500) {
			this.movingPlatform1.setVelocityX(-75);
		}
		else if (this.movingPlatform1.x <= 250) {
			this.movingPlatform1.setVelocityX(75);
		}

		if (this.movingPlatform2.x >= 700) {
			this.movingPlatform2.setVelocityX(-75);
		}
		else if (this.movingPlatform2.x <= 500) {
			this.movingPlatform2.setVelocityX(75);
		}

		// Collision detection
		this.physics.overlap(this.player1, this.attackZoneP2, this.playerHit, null, this);
		this.physics.overlap(this.player2, this.attackZoneP1, this.playerHit, null, this);

		this.physics.overlap(this.player1, this.deathZone, this.playerDied, null, this);
		this.physics.overlap(this.player2, this.deathZone, this.playerDied, null, this);

		// Game over state
		if (this.gameOver) {
			// Display Game Over and winner texts
			this.pointsP1Text.setText(`${this.pointsP1}`);
			this.pointsP2Text.setText(`${this.pointsP2}`);
			this.gameOverText.setText(`GAME OVER`);
			this.winnerText.setText(`Player ${this.winner} wins !!!`);

			// Stop game music and physics
			this.gameMusic.stop();
			this.movingPlatform1.setVelocity(0, 0);
			this.movingPlatform2.setVelocity(0, 0);
			this.player1.setVelocity(0, 0);
			this.player2.setVelocity(0, 0);

			// Create restart button
			const button = this.add.text(420, 120, "Restart", { fontFamily: 'gameFont', fontSize: '32px', color: 'white' });
			button.setInteractive({ useHandCursor: true });
			button.on("pointerdown", () => {
				this.scene.setActive(false);
				this.gameOver = false;
				this.scene.restart();
			});

			// Restart game on spacebar press
			this.input.keyboard.on('keydown-SPACE', () => {
				this.scene.setActive(false);
				this.gameOver = false;
				this.scene.restart();
			});
		}
	}

	// Handle player hit mechanics
	playerHit() {
		if (this.isAttackP2) {
			const direction = this.player2.flipX ? -1 : 1; // Determine attack direction
			this.player1.setVelocityX(300 * direction);
			this.player1.setVelocityY(-200);
			this.player1.anims.play("hurt", true);
			this.idleP1 = false;
			if (!this.hurt.isPlaying) {
				this.hurt.play();
			}
		}

		if (this.isAttackP1) {
			const direction = this.player1.flipX ? -1 : 1; // Determine attack direction
			this.player2.setVelocityX(300 * direction);   // Push horizontally
			this.player2.setVelocityY(-200);
			this.player2.anims.play("hurtP2", true);
			this.idleP2 = false;
			if (!this.hurt.isPlaying) {
				this.hurt.play();
			}
		}
	}

	// Handle player death mechanics
	playerDied(player) {
		// Player 1 death handling
		if (player === this.player1) {
			if (this.livesP1 > 0) {
				this.livesP1--;
				this.death.play();
				switch (this.livesP1) {
					case 2:
						this.healthP1 = this.add.image(230, 360, 'liveDownImg');
						this.healthP1.setScale(0.125);
						break;
					case 1:
						this.healthP1 = this.add.image(170, 360, 'liveDownImg');
						this.healthP1.setScale(0.125);
						break;
				}
				// Reset players positions
				this.player1.setPosition(50, 115);
				this.player1.setVelocity(0, 0);
				this.player2.setPosition(900, 115);
				this.player2.setVelocity(0, 0);
			}
			// Game over for Player 1
			if (this.livesP1 === 0) {
				this.pointsP2++;
				this.gameOver = true;
				this.gameOverMusic.play();
				this.winner = 2;
				this.player1.anims.stop();
				this.player2.anims.play("idleP1", true);
				this.healthP1 = this.add.image(110, 360, 'liveDownImg');
				this.healthP1.setScale(0.125);
				this.player1.setPosition(50, 110);
				this.player1.setVelocity(0, 0);
				this.crown = this.add.image(900, 93, 'crown');
				this.crown.setScale(0.035);
			}

		}
		// Player 2 death handling
		else if (player === this.player2) {
			if (this.livesP2 > 0) {
				this.livesP2--;
				this.death.play();
				switch (this.livesP2) {
					case 2:
						this.healthP2 = this.add.image(720, 360, 'liveDownImg');
						this.healthP2.setScale(0.125);
						break;
					case 1:
						this.healthP2 = this.add.image(780, 360, 'liveDownImg');
						this.healthP2.setScale(0.125);
						break;
				}
				// Reset players positions
				this.player1.setPosition(50, 115);
				this.player1.setVelocity(0, 0);
				this.player2.setPosition(900, 115);
				this.player2.setVelocity(0, 0);
			}

			// Game over for Player 2
			if (this.livesP2 === 0) {
				this.pointsP1++;
				this.gameOver = true;
				this.gameOverMusic.play();
				this.winner = 1;
				this.player2.anims.stop();
				this.player1.anims.play("idleP1", true);
				this.healthP2 = this.add.image(840, 360, 'liveDownImg');
				this.healthP2.setScale(0.125);
				this.player2.setPosition(900, 110);
				this.player2.setVelocity(0, 0);
				this.crown = this.add.image(50, 93, 'crown');
				this.crown.setScale(0.035);
			}
		}
	}
}
