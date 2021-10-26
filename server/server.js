const fs = require("fs");
const express = require('express');
const {ApolloServer} = require("apollo-server-express");
const {MongoClient} = require("mongodb");

const url = "mongodb://localhost/waitlist";
let db;

let aboutMessage = "Waitlist System API v1.0";

const resolvers = {
  Query: {
    about: () => aboutMessage,
    reservationList,
  },
  Mutation: {
    setAboutMessage,
    reservationAdd,
    reservationDelete,
  },
};

function setAboutMessage(_, {message}) {
  return aboutMessage = message;
}

async function reservationAdd(_, {reservation}) {
  reservation.timestamp = new Date().toLocaleTimeString();
  reservation.serialNo = await getNextSequence("reservations");
  
  const result = await db.collection("reservations").insertOne(reservation);

  const savedReservation = await db.collection("reservations").findOne({_id: result.insertedId});
  return savedReservation;
}

async function reservationDelete(_, {serialNo}) {
  await db.collection("reservations").deleteOne({serialNo: serialNo});
  return "Sucessfully Deleted!"
}

async function reservationList() {
  const reservations = await db.collection("reservations").find({}).toArray();
  return reservations;
}

async function getNextSequence(name) {
  const result = await db.collection("counters").findOneAndUpdate(
    {_id: name},
    {$inc: {current: 1}},
    {returnOriginal: false}
  );
  return result.value.current;
}

async function connectToDb() {
  const client = new MongoClient(url, {useNewUrlParser: true});
  await client.connect();
  console.log("Connected to MongoDB at", url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync("./server/schema.graphql", "utf-8"),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  }
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({app, path: "/graphql"});

(async function() {
  try {
    await connectToDb();
    app.listen(2021, function() {
      console.log('The waiting list system application started on port 2021');
    });
  } catch (err) {
    console.log("ERROR:", err);
  }
})();