import Phaser from "phaser";
// import Network from "../services/Network";
import { BackgroundMode } from "../types/BackgroundMode";

export default class Game2 extends Phaser.Scene {
  tileset: string[] = [];
  layers: string[] = [];

  constructor() {
    super("game");
  }

  async preload() {
    this.load.tilemapTiledJSON("tilemap", "assets/archive/map.json");

    const resourcePath = "assets/archive/";
    const json = await fetch("assets/archive/map.json");
    const jsonData = await json.json();

    if (jsonData.tilesets && jsonData.tilesets.length > 0) {
      for (const tileset of jsonData.tilesets) {
        this.load.spritesheet(tileset.name, `${resourcePath}${tileset.image}`, {
          frameWidth: tileset.tilewidth,
          frameHeight: tileset.tileheight,
        });
        this.tileset.push(tileset.name);
      }
    }

    if (jsonData.layers && jsonData.layers.length > 0) {
      for (const layer of jsonData.layers) {
        this.layers.push(layer.name);
      }
    }

    this.tileset = [...new Set(this.tileset)];
  }

  init() {
    // this.network = new Network();
  }

  create() {
    // create the Tilemap
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
}
