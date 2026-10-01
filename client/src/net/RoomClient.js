export class RoomClient {
  constructor(url) {
    this.url = url;
    this.socket = null;

    this.room = null;
    this.players = new Map();

    this.listeners = {};
  }

  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(
      callback
    );
  }

  emit(type, data) {
    for (
      const callback
      of this.listeners[type] || []
    ) {
      callback(data);
    }
  }

  connect() {
    return new Promise(
      (resolve, reject) => {
        this.socket =
          new WebSocket(
            this.url
          );

        this.socket.onopen =
          () => {
            this.emit("open");
            resolve();
          };

        this.socket.onerror =
          error => {
            this.emit(
              "error",
              error
            );

            reject(error);
          };

        this.socket.onclose =
          () => {
            this.emit("close");
          };

        this.socket.onmessage =
          event => {
            this.handle(
              JSON.parse(
                event.data
              )
            );
          };
      }
    );
  }

  send(type, data = {}) {
    if (
      !this.socket ||
      this.socket.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        type,
        ...data
      })
    );
  }

  createRoom() {
    this.send(
      "create"
    );
  }

  joinRoom(
    code,
    callsign
  ) {
    this.send(
      "join",
      {
        code,
        callsign
      }
    );
  }

  sendState(state) {
    this.send(
      "state",
      state
    );
  }

  handle(message) {
    if (
      message.type ===
      "roomCreated"
    ) {
      this.room =
        message.code;

      this.emit(
        "room",
        this.room
      );
    }

    if (
      message.type ===
      "joined"
    ) {
      this.room =
        message.code;

      this.emit(
        "room",
        this.room
      );
    }

    if (
      message.type ===
      "snapshot"
    ) {
      this.players.clear();

      for (
        const player
        of message.players
      ) {
        this.players.set(
          player.id,
          player
        );
      }

      this.emit(
        "snapshot",
        this.players
      );
    }

    if (
      message.type ===
      "playerState"
    ) {
      this.players.set(
        message.player.id,
        message.player
      );

      this.emit(
        "playerState",
        message.player
      );
    }

    if (
      message.type ===
      "playerLeft"
    ) {
      this.players.delete(
        message.id
      );

      this.emit(
        "playerLeft",
        message.id
      );
    }

    if (
      message.type ===
      "error"
    ) {
      this.emit(
        "errorMessage",
        message.message
      );
    }
  }
}
