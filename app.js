const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());
app.use(cors());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(process.env.PORT || 3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const coverIntoObject = (jsobject) => {
  return {
    playerId: jsobject.player_id,
    playerName: jsobject.player_name,
    jerseyNumber: jsobject.jersey_number,
    role: jsobject.role,
  };
};

app.get("/forms/", async (request, response) => {
  const getplayersQuery = `SELECT * FROM form;`;
  const array = await database.all(getplayersQuery);
  response.send(array);
});

app.post("/insert/", async (request, response) => {
  const { firstname, lastname, email, message, addtional } = request.body;
  console.log(addtional);
  const createPlayerQuery = `
    INSERT INTO  form
    VALUES ('${firstname}','${lastname}','${email}','${message}','${addtional}');
    `;
  console.log(request.body);
  const player = await database.run(createPlayerQuery);
  response.send(firstname);
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES ('${playerName}','${jerseyNumber}','${role}');
    `;
  const player = await database.run(createPlayerQuery);
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
