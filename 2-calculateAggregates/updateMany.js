// Calculate average, min, max, first and last values for all buckets
// This is independent from bucket rule (hour, day, or else)
db.collection.updateMany({},
    [
      {
        $set: {
          avg: {$avg: "$samples.temp"},
          min: {$min: "$samples.temp"},
          max: {$max: "$samples.temp"},
          first: {$arrayElemAt: ["$samples.temp", 0]},
          last: {$arrayElemAt: ["$samples.temp", -1]}
        }
      }
    ]
);
