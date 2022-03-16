import Phaser from "phaser";

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from "../anims/CharacterAnims";
import "../characters/MyPlayer";
import "../characters/OtherPlayer";
import MyPlayer from "../characters/MyPlayer";
import PlayerSelector from "../characters/PlayerSelector";
import Chair from "../items/Chair";
import Computer from "../items/Computer";
import Whiteboard from "../items/Whiteboard";

export type NavKeys = ShooterKeys & Phaser.Types.Input.Keyboard.CursorKeys;

type ShooterKeys = {
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
};

export default class Game extends Phaser.Scene {
  private cursors!: NavKeys;
  private map!: Phaser.Tilemaps.Tilemap;
  myPlayer!: MyPlayer;
  private playerSelector!: Phaser.GameObjects.Zone;

  private computerMap = new Map<string, Computer>();
  private whiteboardMap = new Map<string, Whiteboard>();

  constructor() {
    super("game");
  }

  create() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys("W,S,A,D") as ShooterKeys),
    };
    this.input.keyboard.disableGlobalCapture();

    createCharacterAnims(this.anims);

    this.map = this.make.tilemap({ key: "tilemap" });
    const FloorAndGround = this.map.addTilesetImage(
      "FloorAndGround",
      "tiles_wall"
    );

    const groundLayer = this.map.createLayer("Ground", FloorAndGround);
    groundLayer.setCollisionByProperty({ collides: true });

    this.myPlayer = this.add.myPlayer(
      705,
      500,
      "adam",
      "this.network.mySessionId"
    );
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16);

    // import chair objects from Tiled map to Phaser
    const chairs = this.physics.add.staticGroup({ classType: Chair });
    const chairLayer = this.map.getObjectLayer("Chair");
    chairLayer.objects.forEach((chairObj) => {
      const item = this.addObjectFromTiled(
        chairs,
        chairObj,
        "chairs",
        "chair"
      ) as Chair;
      // custom properties[0] is the object direction specified in Tiled
      item.itemDirection = chairObj.properties[0].value;
    });

    // import computers objects from Tiled map to Phaser
    const computers = this.physics.add.staticGroup({ classType: Computer });
    const computerLayer = this.map.getObjectLayer("Computer");
    computerLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        computers,
        obj,
        "computers",
        "computer"
      ) as Computer;
      item.setDepth(item.y + item.height * 0.27);
      const id = `${i}`;
      item.id = id;
      this.computerMap.set(id, item);
    });

    // import whiteboards objects from Tiled map to Phaser
    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard });
    const whiteboardLayer = this.map.getObjectLayer("Whiteboard");
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        "whiteboards",
        "whiteboard"
      ) as Whiteboard;
      const id = `${i}`;
      item.id = id;
      this.whiteboardMap.set(id, item);
    });

    // import other objects from Tiled map to Phaser
    this.addGroupFromTiled("Wall", "tiles_wall", "FloorAndGround", false);
    this.addGroupFromTiled(
      "Objects",
      "office",
      "Modern_Office_Black_Shadow",
      false
    );
    this.addGroupFromTiled(
      "ObjectsOnCollide",
      "office",
      "Modern_Office_Black_Shadow",
      true
    );
    this.addGroupFromTiled("GenericObjects", "generic", "Generic", false);
    this.addGroupFromTiled(
      "GenericObjectsOnCollide",
      "generic",
      "Generic",
      true
    );
    this.addGroupFromTiled("Basement", "basement", "Basement", true);

    this.cameras.main.zoom = 1.5;
    this.cameras.main.startFollow(this.myPlayer, true);

    this.physics.add.collider(
      [this.myPlayer, this.myPlayer.playerContainer],
      groundLayer
    );
    this.physics.add.overlap(
      this.playerSelector,
      [],
      () => {},
      undefined,
      this
    );

    this.physics.add.overlap(this.myPlayer, [], () => {}, undefined, this);
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup();
    const objectLayer = this.map.getObjectLayer(objectLayerName);
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5;
      const actualY = object.y! - object.height! * 0.5;
      group
        .get(
          actualX,
          actualY,
          key,
          object.gid! - this.map.getTileset(tilesetName).firstgid
        )
        .setDepth(actualY);
    });
    if (this.myPlayer && collidable)
      this.physics.add.collider(
        [this.myPlayer, this.myPlayer.playerContainer],
        group
      );
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5;
    const actualY = object.y! - object.height! * 0.5;
    const obj = group
      .get(
        actualX,
        actualY,
        key,
        object.gid! - this.map.getTileset(tilesetName).firstgid
      )
      .setDepth(actualY);
    return obj;
  }

  update(t: number, dt: number) {
    if (this.myPlayer) {
      // console.log(this.cursors);
      this.playerSelector.update(this.myPlayer, this.cursors);
      this.myPlayer.update(this.playerSelector, this.cursors);
    }
  }
}
