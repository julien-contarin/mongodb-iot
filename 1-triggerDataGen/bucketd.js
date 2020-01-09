exports = async function() {

    const collection = context.services.get("insert_cluster_name").db("insert_db_name").collection("insert_coll_name");

    // Generate documents from 200 devices
    for (let i=0; i<200; i++) {

      const deviceId = 23936000+i;
      // Generate random data using Math. This is where you determine how your dataset is randomized
      const temperature = Math.random() * 50 + 30;
      const date = new Date();

      // Create doc to upsert
      const doc = {
        deviceId: deviceId,
        sensor: "temp",
        sample: {
          full: date,
          temp: temperature},
        date: {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate()
        }
      };

      // Update routine to bucket - limit bucket size to a maximum of 200 samples
      await collection.updateOne({deviceId: doc.deviceId,
        "date.year": doc.date.year,
        "date.month": doc.date.month,
        "date.day": doc.date.day,
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
          sensor: doc.sensor
      },
        $addToSet: {samples: doc.sample}
      },
      {upsert: true, returnNewDocument: true});

    }

}
