// Dependencies
'use strict';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection string
const url = "insert_connection_string";

// Create Client
async function main() {
  const client = new MongoClient(url, { useUnifiedTopology: true });

  // Await client connection
  await client.connect();
  console.log('Connected correctly to server');

  const db = client.db('iot');

  for (let i=0; i<200; i++) {
        console.log(i);
        await updateDocument(db,i);
  }
  await client.close();
};

// Actually run main
main().catch(console.dir);

// Upsert IoT documents
async function updateDocument(db,i) {
  const collection = db.collection('bucketD');
  const deviceId = 23936000+i;
  const temperature = random(30,80);
  const date = new Date();

  // Create document
  const doc = {
    deviceId: deviceId,
    sensor: "temp",
    sample: {
      full: date,
      temp: temperature},
    date: {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hour: date.getHours()
    }
  };

  // Upsert document (bucket/hour)
  await collection.updateOne({deviceId: doc.deviceId,
    "date.year": doc.date.year,
    "date.month": doc.date.month,
    "date.day": doc.date.day,
    "date.hour": doc.date.hour,
    sensor: doc.sensor,
    nsamples: {$lt: 200}
  },
    {
      $inc: {nsamples: 1},
      $set: {
        deviceId: doc.deviceId,
        "date.year": doc.date.year,
        "date.month": doc.date.month,
        "date.day": doc.date.day,
        "date.hour": doc.date.hour,
        sensor: doc.sensor
      },
      $addToSet: {samples: doc.sample}
    },
    {upsert: true, returnNewDocument: true});

  console.log("upserted 1");
  //sleep(100);

}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
};

function random(low, high) {
  return Math.random() * (high - low) + low
};

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};
