// Calculate average, min, max, first and last values for all buckets
// This is independent from bucket rule (hour, day, or else) except for dateFromParts (hour bucket will need to specify hour)
db.bucket.updateMany({},
    [
      {
        $set: {
          avg: {$avg: "$samples.temp"},
          min: {$min: "$samples.temp"},
          max: {$max: "$samples.temp"},
          first: {$arrayElemAt: ["$samples.temp", 0]},
          last: {$arrayElemAt: ["$samples.temp", -1]},
          "date.ISOBucket": {$dateFromParts: {
            "year": "$date.year",
            "month": {$sum: ["$date.month",1]},
            "day": "$date.day"
          }}
        }
      }
    ]
);


// Rollback those changes
db.bucket.updateMany({},
  [
    {
      $unset: ["avg","min","max","first","last", "date.ISOBucket"]
    }
  ]
);
