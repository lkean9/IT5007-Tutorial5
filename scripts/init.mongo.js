/*
localhost:
    mongo waitlist scripts/init.mongo.js
*/


db.reservations.remove({});

const count = db.reservations.count();
print("Inserted", count, "reservations");

db.counters.remove({_id: "reservations"});
db.counters.insert({_id: "reservations", current: count});

db.reservations.createIndex({serialNo: 1}, {unique: true});
