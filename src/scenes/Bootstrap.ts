export default class Bootstrap extends Phaser.Scene {
  constructor() {
    super("bootstrap");
  }

  create() {}

  launchGame(map: any, resourcePath: string) {
    this.scene.launch("game", {
      map: map,
      resourcePath: resourcePath,
    });
  }
}
