import Phaser from "phaser";

export default class Scene_00 extends Phaser.Scene {
    constructor() {
        super({ key: "scene_00" });
    }

    preload() {
        this.load.image("menuImg", 'assets/Main-menu.jpg');
        this.load.audio("menuMusic", 'assets/sounds/main_menu.mp3');
        const font = new FontFace('gameFont', 'url(assets/Planes_ValMore.ttf)');
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
        }).catch((error) => {
            console.error('Error cargando la fuente:', error);
        });
    }

    create() {
        this.menuMusic = this.sound.add("menuMusic", { volume: 0.2, loop: true });
        this.menuMusic.play();
        this.mainMenuImg = this.add.image(475, 300, 'menuImg');
        this.mainMenuImg.setScale(0.67);
        this.add.text(300, 90, 'SMASH BUDDIES', { fontFamily: 'gameFont', fontSize: '48px', });
        const button = this.add.text(430, 180, "Start", { fontFamily: 'gameFont', fontSize: '48px', color: 'black' });
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => {
            this.menuMusic.stop();
            this.scene.setActive(false);
            this.scene.start("Scene_01");
        });

        // Acción al presionar la barra espaciadora
        this.input.keyboard.on('keydown-ENTER', () => {
            this.menuMusic.stop();
            this.scene.setActive(false);
            this.scene.start("Scene_01");
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.menuMusic.stop();
            this.scene.setActive(false);
            this.scene.start("Scene_01");
        });

    }
}