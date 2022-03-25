import Phaser from "phaser";
// import Network from "../services/Network";
import { BackgroundMode } from "../types/BackgroundMode";

export default class Game2 extends Phaser.Scene {
  // network!: Network;

  constructor() {
    super("game");
  }

  async preload() {
    // @ts-ignore
    // this.load.tilemapTiledJSONExternal("tilemap", "assets/archive/map.json");

    this.load.tilemapTiledJSON("tilemap", "assets/archive/map.json");

    const resourcePath = "assets/archive/";
    const json = await fetch("assets/archive/map.json");
    const jsonData = await json.json();
    if (jsonData.tilesets && jsonData.tilesets.length > 0) {
      for (const tileset of jsonData.tilesets) {
        // this.load.image(tileset.name, tileset.image);
        // this.load.image(tileset.name, `${resourcePath}${tileset.image}`);

        this.load.spritesheet(tileset.name, `${resourcePath}${tileset.image}`, {
          frameWidth: tileset.tilewidth,
          frameHeight: tileset.tileheight,
        });
      }
    }

    // if (jsonData.tilesets && jsonData.tilesets.length > 0) {
    //   for (const tileset of jsonData.tilesets) {
    //     // this.load.image(tileset.name, tileset.image);
    //     this.load.spritesheet(tileset.name, `${resourcePath}${tileset.image}`, {
    //       frameWidth: 32,
    //       frameHeight: 32,
    //     });
    //   }
    // }
  }

  init() {
    // this.network = new Network();
  }

  create() {
    // create the Tilemap
    const map = this.make.tilemap({ key: "tilemap" });

    // create the ground tiles
    const Room_Builder_Walls = map.addTilesetImage(
      "Room_Builder_Walls",
      "Room_Builder_Walls"
    );

    const Room_Builder_Floors = map.addTilesetImage(
      "Room_Builder_Floors",
      "Room_Builder_Floors"
    );

    const Room_Builder_Office = map.addTilesetImage(
      "Room_Builder_Office",
      "Room_Builder_Office"
    );

    map.createLayer("Ground", [
      Room_Builder_Floors,
      Room_Builder_Walls,
      Room_Builder_Office,
    ]);
    // map.createLayer("Ground2", Room_Builder_Walls);
    // map.createLayer("Ground3", Room_Builder_Office);

    this.cameras.main.zoom = 1.5;
  }
}
