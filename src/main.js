import Phaser, { Scale } from "phaser"

import Scene_00 from './scene_00'
import Scene_01 from './scene_01'

const config = {
	type: Phaser.AUTO,
	width: 950,
	height: 480,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		parent: 'app'
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { x: 0, y: 200 },
		}, 
	},
	scene: [Scene_00, Scene_01],
}

export default new Phaser.Game(config)
