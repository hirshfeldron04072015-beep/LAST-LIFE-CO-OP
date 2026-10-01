export class Network {
  constructor() {
    this.socket = null;
    this.room = null;
    this.id = null;

    this.players = new Map();

    this.handlers = {};
  }

  on(type, callback) {
    this.handlers[type] =
      callback;
  }

  emit(type, data) {
    const handler =
      this.handlers[type];

    if (handler) {
      handler(data);
    }
  }

  connect(url) {
    return new Promise(
      (resolve, reject) => {
        this.socket =
          new WebSocket(url);

        this.socket.onopen =
          () => {
            resolve();
          };

        this.socket.onerror =
          reject;

        this.socket.onmessage =
          event => {
            const message =
              JSON.parse(
                event.data
              );

            if (
              message.type ===
              "room_created" ||
              message.type ===
              "joined_room"
            ) {
              this.room =
                message.code;

              this.id =
                message.id;
            }

            this.emit(
              message.type,
              message
            );
          };
      }
    );
  }

  send(data) {
    if (
      this.socket &&
      this.socket.readyState === 1
    ) {
      this.socket.send(
        JSON.stringify(data)
      );
    }
  }

  createRoom(name) {
    this.send({
      type: "create_room",
      name
    });
  }

  joinRoom(code, name) {
    this.send({
      type: "join_room",
      code,
      name
    });
  }

  updatePosition(position) {
    this.send({
      type: "state",
      x: position.x,
      y: position.y,
      z: position.z
    });
  }
}
