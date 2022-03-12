import { Client, Room } from "colyseus.js";
import {
  IComputer,
  IOfficeState,
  IPlayer,
  IWhiteboard,
} from "../types/IOfficeState";
import { Message } from "../types/Messages";
import { IRoomData, RoomType } from "../types/Rooms";
import { ItemType } from "../types/Items";
import { phaserEvents, Event } from "../events/EventCenter";
import phaserGame from "../PhaserGame";
import Bootstrap from "../scenes/Bootstrap";
import Game from "../scenes/Game";

export default class Network {
  private client: Client;
  private lobby!: Room;
  room?: Room<IOfficeState>;

  mySessionId!: string;

  constructor() {
    this.client = new Client("wss://vapi.jobrank.co");

    this.joinLobbyRoom().then(() => {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
      bootstrap.network
        .joinOrCreatePublic()
        .then(() => bootstrap.launchGame())
        .catch((error) => console.error(error));

      // this.room = await this.client.joinOrCreate(RoomType.PUBLIC);
      bootstrap.network.readyToConnect();

      const game = phaserGame.scene.keys.game as Game;
      game.registerKeys();
      // game.myPlayer.setPlayerName(name)
      // game.myPlayer.setPlayerTexture(avatarDetails.name)
    });

    phaserEvents.on(Event.MY_PLAYER_NAME_CHANGE, this.updatePlayerName, this);
    phaserEvents.on(Event.MY_PLAYER_TEXTURE_CHANGE, this.updatePlayer, this);
    phaserEvents.on(
      Event.PLAYER_DISCONNECTED,
      this.playerStreamDisconnect,
      this
    );
  }

  /**
   * method to join Colyseus' built-in LobbyRoom, which automatically notifies
   * connected clients whenever rooms with "realtime listing" have updates
   */
  async joinLobbyRoom() {
    this.lobby = await this.client.joinOrCreate(RoomType.LOBBY);
  }

  // method to join the public lobby
  async joinOrCreatePublic() {
    this.room = await this.client.joinOrCreate(RoomType.PUBLIC);
    this.initialize();
  }

  // method to join a custom room
  async joinCustomById(roomId: string, password: string | null) {
    this.room = await this.client.joinById(roomId, { password });
    this.initialize();
  }

  // method to create a custom room
  async createCustom(roomData: IRoomData) {
    const { name, description, password, autoDispose } = roomData;
    this.room = await this.client.create(RoomType.CUSTOM, {
      name,
      description,
      password,
      autoDispose,
    });
    this.initialize();
  }

  // set up all network listeners before the game starts
  initialize() {
    if (!this.room) return;

    this.lobby.leave();
    this.mySessionId = this.room.sessionId;

    // new instance added to the players MapSchema
    this.room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.mySessionId) return;

      // track changes on every child object inside the players MapSchema
      player.onChange = (changes) => {
        changes.forEach((change) => {
          const { field, value } = change;
          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, key);

          // when a new player finished setting up player name
          if (field === "name" && value !== "") {
            phaserEvents.emit(Event.PLAYER_JOINED, player, key);
          }
        });
      };
    };

    // an instance removed from the players MapSchema
    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      phaserEvents.emit(Event.PLAYER_LEFT, key);
      console.log("removed: ", key);
    };

    // new instance added to the computers MapSchema
    this.room.state.computers.onAdd = (computer: IComputer, key: string) => {
      // track changes on every child object's connectedUser
      computer.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.COMPUTER);
      };
      computer.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(
          Event.ITEM_USER_REMOVED,
          item,
          key,
          ItemType.COMPUTER
        );
      };
    };

    this.room.onMessage(Message.ADD_CHAT_MESSAGE, ({ clientId, content }) => {
      phaserEvents.emit(Event.UPDATE_DIALOG_BUBBLE, clientId, content);
    });
  }

  // method to register event listener and call back function when a item user added
  onChatMessageAdded(
    callback: (playerId: string, content: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.UPDATE_DIALOG_BUBBLE, callback, context);
  }

  // method to register event listener and call back function when a item user added
  onItemUserAdded(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_ADDED, callback, context);
  }

  // method to register event listener and call back function when a item user removed
  onItemUserRemoved(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_REMOVED, callback, context);
  }

  // method to register event listener and call back function when a player joined
  onPlayerJoined(
    callback: (Player: IPlayer, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_JOINED, callback, context);
  }

  // method to register event listener and call back function when a player left
  onPlayerLeft(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT, callback, context);
  }

  // method to register event listener and call back function when myPlayer is ready to connect
  onMyPlayerReady(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_READY, callback, context);
  }

  // method to register event listener and call back function when my video is connected
  onMyPlayerVideoConnected(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_VIDEO_CONNECTED, callback, context);
  }

  // method to register event listener and call back function when a player updated
  onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context?: any
  ) {
    console.log("onPlayerUpdated");
    phaserEvents.on(Event.PLAYER_UPDATED, callback, context);
  }

  // method to send player updates to Colyseus server
  updatePlayer(currentX: number, currentY: number, currentAnim: string) {
    this.room?.send(Message.UPDATE_PLAYER, {
      x: currentX,
      y: currentY,
      anim: currentAnim,
    });
  }

  // method to send player name to Colyseus server
  updatePlayerName(currentName: string) {
    this.room?.send(Message.UPDATE_PLAYER_NAME, { name: currentName });
  }

  // method to send ready-to-connect signal to Colyseus server
  readyToConnect() {
    this.room?.send(Message.READY_TO_CONNECT);
    phaserEvents.emit(Event.MY_PLAYER_READY);
  }

  // method to send ready-to-connect signal to Colyseus server
  videoConnected() {
    this.room?.send(Message.VIDEO_CONNECTED);
    phaserEvents.emit(Event.MY_PLAYER_VIDEO_CONNECTED);
  }

  // method to send stream-disconnection signal to Colyseus server
  playerStreamDisconnect(id: string) {
    this.room?.send(Message.DISCONNECT_STREAM, { clientId: id });
  }

  connectToComputer(id: string) {
    this.room?.send(Message.CONNECT_TO_COMPUTER, { computerId: id });
  }

  disconnectFromComputer(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_COMPUTER, { computerId: id });
  }

  connectToWhiteboard(id: string) {
    this.room?.send(Message.CONNECT_TO_WHITEBOARD, { whiteboardId: id });
  }

  disconnectFromWhiteboard(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_WHITEBOARD, { whiteboardId: id });
  }

  onStopScreenShare(id: string) {
    this.room?.send(Message.STOP_SCREEN_SHARE, { computerId: id });
  }

  addChatMessage(content: string) {
    this.room?.send(Message.ADD_CHAT_MESSAGE, { content: content });
  }
}