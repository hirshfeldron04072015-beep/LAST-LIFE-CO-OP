import { WebSocketServer } from "ws";
import crypto from "crypto";

const PORT =
  process.env.PORT || 8080;

const server =
  new WebSocketServer({
    port: PORT
  });

const rooms = new Map();

function roomCode() {
  return crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();
}

function send(socket, data) {
  if (
    socket.readyState === 1
  ) {
    socket.send(
      JSON.stringify(data)
    );
  }
}

function broadcast(room, data) {
  for (
    const player of room.players.values()
  ) {
    send(
      player.socket,
      data
    );
  }
}

server.on(
  "connection",
  socket => {
    let currentRoom = null;
    let playerId = null;

    send(socket, {
      type: "connected"
    });

    socket.on(
      "message",
      raw => {
        let message;

        try {
          message =
            JSON.parse(raw);
        } catch {
          return;
        }

        if (
          message.type ===
          "create_room"
        ) {
          const code =
            roomCode();

          const id =
            crypto.randomUUID();

          const room = {
            code,
            players: new Map()
          };

          room.players.set(
            id,
            {
              id,
              name:
                message.name ||
                "OPERATIVE",
              x: 0,
              y: 1.7,
              z: 12,
              socket
            }
          );

          rooms.set(
            code,
            room
          );

          currentRoom =
            room;

          playerId = id;

          send(socket, {
            type: "room_created",
            code,
            id
          });

          return;
        }

        if (
          message.type ===
          "join_room"
        ) {
          const room =
            rooms.get(
              message.code
            );

          if (!room) {
            send(socket, {
              type: "error",
              message:
                "Room not found"
            });

            return;
          }

          if (
            room.players.size >= 6
          ) {
            send(socket, {
              type: "error",
              message:
                "Room is full"
            });

            return;
          }

          const id =
            crypto.randomUUID();

          room.players.set(
            id,
            {
              id,
              name:
                message.name ||
                "OPERATIVE",
              x: 0,
              y: 1.7,
              z: 12,
              socket
            }
          );

          currentRoom =
            room;

          playerId = id;

          send(socket, {
            type: "joined_room",
            code:
              room.code,
            id
          });

          broadcast(
            room,
            {
              type:
                "players",
              players:
                [...room.players.values()]
                  .map(p => ({
                    id: p.id,
                    name: p.name,
                    x: p.x,
                    y: p.y,
                    z: p.z
                  }))
            }
          );

          return;
        }

        if (
          message.type ===
          "state" &&
          currentRoom &&
          playerId
        ) {
          const player =
            currentRoom.players.get(
              playerId
            );

          if (!player) {
            return;
          }

          player.x =
            message.x;

          player.y =
            message.y;

          player.z =
            message.z;

          broadcast(
            currentRoom,
            {
              type:
                "player_state",
              id:
                playerId,
              x:
                player.x,
              y:
                player.y,
              z:
                player.z
            }
          );
        }
      }
    );

    socket.on(
      "close",
      () => {
        if (
          !currentRoom ||
          !playerId
        ) {
          return;
        }

        currentRoom.players.delete(
          playerId
        );

        broadcast(
          currentRoom,
          {
            type:
              "player_left",
            id:
              playerId
          }
        );

        if (
          currentRoom.players.size ===
          0
        ) {
          rooms.delete(
            currentRoom.code
          );
        }
      }
    );
  }
);

console.log(
  `LAST LINE server running on ${PORT}`
);
