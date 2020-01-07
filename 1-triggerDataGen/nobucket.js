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

      // Insert doc 
      await collection.insertOne(doc);

    }

}
