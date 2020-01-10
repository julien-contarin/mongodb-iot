// This example shows a few examples of how to build materialized views
// Calculate average, min, max, first and last values for all buckets and persist it as a materialized view
// This is dependent from bucket rule (hour, day, or else): in this example we use hour-bucketting

db.bucketAggH.createIndex({ "deviceId" : 1, "sensor" : 1, "date.year" : 1, "date.month" : 1, "date.day" : 1, "date.hour" : 1 }, {unique:true})

db.bucket.aggregate(
  [
    {
      '$project': { _id:0, deviceId: 1, sensor:1, date: 1, nsamples:1,
        'avg': {
          '$avg': '$samples.temp'
        },
        'min': {
          '$min': '$samples.temp'
        },
        'max': {
          '$max': '$samples.temp'
        },
        'first': {
          '$arrayElemAt': [
            '$samples.temp', 0
          ]
        },
        'last': {
          '$arrayElemAt': [
            '$samples.temp', -1
          ]
        }
      }
    }, {
      '$merge': {
        'into': 'bucketAggH',
        'on': [
          'deviceId', 'sensor', 'date.year', 'date.month', 'date.day', 'date.hour'
        ],
        'whenMatched': 'replace',
        'whenNotMatched': 'insert'
      }
    }
  ]
);

// In this example we use day-bucketting

db.bucketAggD.createIndex({ "deviceId" : 1, "sensor" : 1, "date.year" : 1, "date.month" : 1, "date.day" : 1 }, {unique:true})

db.bucketD.aggregate(
  [
    {
      '$project': { _id:0, deviceId: 1, sensor:1, date: 1, nsamples:1,
        'avg': {
          '$avg': '$samples.temp'
        },
        'min': {
          '$min': '$samples.temp'
        },
        'max': {
          '$max': '$samples.temp'
        },
        'first': {
          '$arrayElemAt': [
            '$samples.temp', 0
          ]
        },
        'last': {
          '$arrayElemAt': [
            '$samples.temp', -1
          ]
        }
      }
    }, {
      '$merge': {
        'into': 'bucketAggD',
        'on': [
          'deviceId', 'sensor', 'date.year', 'date.month', 'date.day'
        ],
        'whenMatched': 'replace',
        'whenNotMatched': 'insert'
      }
    }
  ]
);


// Rollback odmv (delete documents)
// db.bucketAggH.deleteMany({});

// Rollback odmv (drop collection)
// db.bucketAggH.drop();
