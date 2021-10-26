const {MongoClient} = require("mongodb");
const url = "mongodb://localhost/selflearning";

async function testWithAsync() {
    console.log("\n--- testWithAsync ---");
    const client = new MongoClient(url, {useNewUrlParser: true});
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db();
        const collection = db.collection("employees");

        // insert and read the item
        var employee = {id: 2, name: "Hu Haolei", age: 23};
        var result = await collection.insertOne(employee);
        console.log("Result of insert: \n", result.insertedId);
        var docs = await collection.find({_id: result.insertedId}).toArray();
        console.log("Result of the inserted item:\n", docs);
        console.log("Sucessfully insert the item!\n");

        // insert and read one more item
        var employee = {id: 3, name: "Wang Yanqing", age: 25};
        var result = await collection.insertOne(employee);
        console.log("Result of insert: \n", result.insertedId);
        var docs = await collection.find({_id: result.insertedId}).toArray();
        console.log("Result of the inserted item:\n", docs);
        console.log("Sucessfully insert the item!\n");

        // read the item of id = 1
        var docs = await collection.find({id: 1}).toArray();
        console.log("Result of read:\n", docs);
        console.log("Sucessfully read the item!\n");

        // update an item
        await collection.updateOne({id: 2}, {$set: {name: "Harry Potter", age: 33}});
        var docs = await collection.find({id: 2}).toArray();
        console.log("Result of the updated item:\n", docs);
        console.log("Sucessfully update the item!\n");

        // delete an item
        await collection.deleteOne({id:3});
        console.log("Sucessfully delete the item!\n");

    } catch(err) {
        console.log(err);
    } finally {
        client.close();
    }
}

function testWithCallbacks(callback, employee) {
    console.log("\n--- testWithCallbacks ---");
    var client = new MongoClient(url, {useNewUrlParser: true});
    client.connect(function(err, client) {
        if (err) {
            callback(err);
            return;
        }
        console.log("Connected to MongoDB");

        const db = client.db();
        const collection = db.collection("employees");

        // insert data
        collection.insertOne(employee, function(err, result) {
            if (err) {
                client.close();
                callback(err);
                return;
            }
            console.log("Result of insert:\n", result.insertedId);
            collection.find({_id: result.insertedId}).toArray(function(err, docs) {
                if (err) {
                    client.close();
                    callback(err);
                    return;
                }
                console.log("Result of inserted item:\n", docs);
                console.log("Sucessfully insert the item!\n");
                callback(err);
                client.close();
            });
        });
    });
}

testWithCallbacks(function(err) {
    if (err) {
        console.log(err);
    }
    testWithAsync();
}, {id: 1, name: "A. Callback", age: 23});
