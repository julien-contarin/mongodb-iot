exports = async function() {

    const collection = context.services.get("insert_cluster_name").db("insert_db_name").collection("insert_coll_name");

    for (let i=0; i<1000; i++) {

      // Generate random data using Math. This is where you determine how your dataset is randomized
      const deviceId = Math.floor(Math.random() * 1000 + 23936000);
      const temperature = Math.random() * 50 + 30;
      const date = new Date();

      // Create doc to insert
      const doc = {
        deviceId: deviceId,
        sensor: "temp",
        sample: {
          full: date.toISOString(),
          temp: temperature},
        date: {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          hour: date.getHours()
        }
      };

      // Update routine to bucket + upsert - limit bucket size to a maximum of 200 samples
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

      //console.log("upserted 1");
      // context.functions.execute(sleep,1000);

    }

}
