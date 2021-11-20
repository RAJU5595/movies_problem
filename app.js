const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertdbObjectToResponseObjectForGETMovieName = (eachObject) => {
  return {
    movieName: eachObject.movie_name,
  };
};

//get movies names API
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
        SELECT movie_name
        FROM
        movie
    `;
  const movieNamesArray = await db.all(getMovieNamesQuery);
  const responseArray = movieNamesArray.map((eachObject) =>
    convertdbObjectToResponseObjectForGETMovieName(eachObject)
  );
  response.send(responseArray);
});

//get specific movie
const convertdbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieQuery);
  console.log(movieDetails);
});

//post API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
        INSERT INTO 
            movie(director_id,movie_name,lead_actor)
        VALUES
            (${directorId},'${movieName}','${leadActor}')    

    `;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

module.exports = app;
