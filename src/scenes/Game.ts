export default class Game extends Phaser.Scene {
  tileset: string[] = [];
  layers: string[] = [];

  map: any;
  resourcePath: string;

  constructor() {
    super("game");
  }

  create() {
    console.log("Game.create()");

    const map = this.make.tilemap({ key: "tilemap" });

    const tilesets = [];

    this.tileset.forEach((tileset) => {
      tilesets.push(map.addTilesetImage(tileset));
    });

    this.layers.forEach((layer) => {
      map.createLayer(layer, tilesets);
    });

    this.cameras.main.zoom = 0.8;
  }

  preload() {
    console.log("Game.preload()");

    this.load.tilemapTiledJSON("tilemap", this.map);

    if (this.map.tilesets && this.map.tilesets.length > 0) {
      for (const tileset of this.map.tilesets) {
        this.load.spritesheet(
          tileset.name,
          `${this.resourcePath}${tileset.image}`,
          {
            frameWidth: tileset.tilewidth,
            frameHeight: tileset.tileheight,
          }
        );
        this.tileset.push(tileset.name);
      }
    }

    if (this.map.layers && this.map.layers.length > 0) {
      for (const layer of this.map.layers) {
        this.layers.push(layer.name);
      }
    }

    this.tileset = [...new Set(this.tileset)];
  }

  init(data: { map: any; resourcePath: string }) {
    console.log("Game.init()", data);
    this.map = data.map;
    this.resourcePath = data.resourcePath;
  }
}
