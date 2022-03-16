import Phaser from "phaser";

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from "../anims/CharacterAnims";
import "../characters/MyPlayer";
import "../characters/OtherPlayer";
import MyPlayer from "../characters/MyPlayer";
import PlayerSelector from "../characters/PlayerSelector";

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

  update(t: number, dt: number) {
    if (this.myPlayer) {
      // console.log(this.cursors);
      this.playerSelector.update(this.myPlayer, this.cursors);
      this.myPlayer.update(this.playerSelector, this.cursors);
    }
  }
}
