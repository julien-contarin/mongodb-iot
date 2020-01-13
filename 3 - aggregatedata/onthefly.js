// Calculate average, min, max, first and last values for all buckets for a particular device
// This is independent from bucket rule (hour, day, or else)
db.bucket.aggregate(
    [
      {
        '$match': {
          'deviceId': 23936000
        }
      },{
        $addFields: {
          avg: {$avg: "$samples.temp"},
          min: {$min: "$samples.temp"},
          max: {$max: "$samples.temp"},
          first: {$arrayElemAt: ["$samples.temp", 0]},
          last: {$arrayElemAt: ["$samples.temp", -1]}
        }
      }
    ]
);

// Trend all values from one sensor
db.bucket.aggregate(
  [
    {
      '$match': {
        'deviceId': 23936000
      }
    }, {
      '$unwind': {
        'path': '$samples'
      }
    }, {
      '$project': {
        deviceId: 1,
        'date': '$samples.full',
        'value': '$samples.temp'
      }
    }, {
      '$sort': {
        'date': 1
      }
    }
  ]
)

// Set custom timeline
timelinemin = ISODate("2020-01-06T09:00")
timelinemax = ISODate("2020-01-06T11:00")

db.bucket.aggregate([
  {
    '$match': {
      'deviceId': 23936000,
      'samples.full': {
        '$gte': timelinemin,
        '$lte': timelinemax
      }
    }
  }, {
    '$unwind': {
      'path': '$samples'
    }
  }, {
    '$match': {
      'samples.full': {
        '$gte': timelinemin,
        '$lte': timelinemax
      }
    }
  }, {
    '$project': {
      'deviceId': 1,
      'date': '$samples.full',
      'value': '$samples.temp'
    }
  }, {
    '$sort': {
      'date': 1
    }
  }
])

// Find all sensors where temp is critical (>75)

db.bucket.aggregate([
  {
    '$match': {
      'samples.temp': {
        '$gte': 75
      }
    }
  }, {
    '$unwind': {
      'path': '$samples'
    }
  }, {
    '$match': {
      'samples.temp': {
        '$gte': 75
      }
    }
  }, {
    '$project': {
      'deviceId': 1,
      'date': '$samples.full',
      'value': '$samples.temp'
    }
  }, {
    '$sort': {
      'date': 1
    }
  }
])

// Find all sensors where temp is critical (>75) with custom timeline
timelinemin = ISODate("2020-01-06T09:00")
timelinemax = ISODate("2020-01-06T11:00")

db.bucket.aggregate([
  {
    '$match': {
      'samples.temp': {
        '$gte': 75
      },
      'samples.full': {
        '$gte': timelinemin,
        '$lte': timelinemax
      }
    }
  }, {
    '$unwind': {
      'path': '$samples'
    }
  }, {
    '$match': {
      'samples.temp': {
        '$gte': 75
      },
      'samples.full': {
        '$gte': timelinemin,
        '$lte': timelinemax
      }
    }
  }, {
    '$project': {
      'deviceId': 1,
      'date': '$samples.full',
      'value': '$samples.temp'
    }
  }, {
    '$sort': {
      'date': 1
    }
  }
])
