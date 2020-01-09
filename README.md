# mongodb-iot
IoT Data generation + consumption for MongoDB (Node.JS)

Maintainer: Julien Contarin
**Date**: January 2020
**MongoDB Version**: 4.2
**MongoDB Tools being used**:
- *MongoDB Cluster* hosted either on Atlas or elsewhere
- *1 - IoT Data simulation* using Node.JS : app run locally or Atlas Trigger
- *2 - IoT Data enrichment* using MongoDB shell
- *3 - IoT Data consumption* using the aggregation framework from supported tools (shell, Compass)
- *IoT Data visualisation* using MongoDB Charts

## 1 - Data simulation

localDataGen and triggerDataGen are two ways to a common goal: test how MongoDB document model is fit for IoT use cases by simulating IoT data. The code is essentially the same for the two but run from different places.

Prior to executing any of those, it is recommended (not required) to build indexes for the collections you will use. Repeat this operation for all collections you will use.

```
use database;

// Indexes for non bucketted data
db.collection.createIndex({"date.year" : 1,"date.month" : 1,"date.day" : 1,"date.hour" : 1});
db.collection.createIndex({"deviceId" : 1,"sample.full" : 1});
db.collection.createIndex({"sample.temp" : 1,"sample.full" : 1});
db.collection.createIndex({"deviceId" : 1,"sensor" : 1,"sample.full" : 1});

// Indexes for bucketted data (independent from day or hour)
db.collection.createIndex({"deviceId" : 1,"samples.full" : 1});
db.collection.createIndex({"samples.temp" : 1,"samples.full" : 1});

// Indexes that are specific to hour bucketting
db.collection.createIndex({"deviceId" : 1,"sensor" : 1,"date.year" : 1,"date.month" : 1,"date.day" : 1,"date.hour" : 1});
db.collection.createIndex({"date.year" : 1,"date.month" : 1,"date.day" : 1,"date.hour" : 1});

// Indexes that are specific to day bucketting
db.collection.createIndex({"deviceId" : 1,"sensor" : 1,"date.year" : 1,"date.month" : 1,"date.day" : 1});
db.collection.createIndex({"date.year" : 1,"date.month" : 1,"date.day" : 1});
```

### 1 - localDataGen

This folder contains a single Node.JS application which will generate 200 temperature documents (one document per IoT sensor) with a bucketting per hour.
The constraint with this app is that you will have to run it at a given frequency (every x minutes) to simulate continuous IoT data generation.

#### Prerequisites

Node.JS and NPM must be installed on the machine and the following libraries.
You must have a running MongoDB Cluster anywhere (Atlas or self-managed)

```
npm install mongodb
npm install assert
```

Alternatively, you can opt for a global install of those libraries

```
npm install -g mongodb
npm install -g assert
```

Edit app.js to specify the SRV connection string for your MongoDB cluster, as well as the namespace (database, collection).
The namespace defaults to *iot.bucket*.

```
const url = "mongodb+srv://usr:pwd@clusterurl.mongodb.net/test?retryWrites=true&w=majority";
const db = client.db("iot");
const collection = db.collection("bucket");
```

#### Execution

```
node app.js
```

### 1-triggerDataGen

This contains 3 functions to be run as an **Atlas or Stitch scheduled trigger**. Each function will insert data from 200 IoT devices every time it is run. You must configure the frequency when setting up your Atlas scheduled trigger.
1. nobucket.js: this will insert simulated device data without bucketting
2. bucketH.js: this will insert simulated device data with hour bucketting
2. bucketD.js: this will insert simulated device data with day bucketting

#### Prerequisites

Your MongoDB cluster must run on Atlas. M0 should suffice for a few days but most likely this will require M10 to keep days/months of data. If M0 capacity (512MB storage) is exceeded, trigger execution will error.

1. To create the trigger, from the Atlas interface, click Triggers on the left-panel.
2. Click Add Trigger
3. Select "Scheduled" and give your trigger a name
4. Recommended scheduling: select Basic and 10 minutes
5. In the function editor, erase all and copy-paste the js code described in the previous section (nobucket, bucketH, bucketD).
*NB: you may create several triggers to test and compare several bucketting policies within the same database, do make sure you use distinct collections*
6. Edit cluster name, database and collection
7. If you wish to add less or more devices, change *i < 200* to update the loop
8. Test your trigger by clicking "Run" and then checking the collection(s) (db.collection.findOne()). You may run several times to check bucketting (bucketH, bucketD).
9. After having checked your trigger is enabled, save your trigger. This will now auto-populate data
*NB: if you select a high value for the maximum of i, there may be cases where Trigger maximum execution time (90s) is exceeded, which will result in less data being inserted. The best way to work around that would be to add more Triggers for the same, and scheduling them so they don't all run at the same time. For example Trigger1 simulates device 23936000 to 23936500, Trigger2 simulates devices 2393500 to 23937000, and so on.*

#### Execution

```
// Nothing to do! Simply connect a few times for the first hours/days and verify your documents are populated with as many samples as expected.
```

### Results (with hour bucketting)

```
// Example document to retrieve from mongo shell
// Documents are grouped by deviceId, sensor and date (Y,M,D,H) so this schema is ready to be use with multiple sensors on one device (e.g. connected computer)

use iot;
db.bucket.findOne()

{
	"_id" : ObjectId("5e12fbc0d136647251f01992"),
	"date" : {
		"day" : 6,
		"hour" : 9,
		"month" : 0,
		"year" : 2020
	},
	"deviceId" : 23936000,
	"sensor" : "temp",
	"nsamples" : NumberLong(1),
	"samples" : [
		{
			"full" : ISODate("2020-01-06T09:20:00.047Z"),
			"temp" : 62.922267625735216
		}
	]
}
```

## 2 - Data enrichment

The folder 2-calculateAggregates contains examples of how to use MongoDB 4.2 enriched update mechanisms to append aggregated values (avg, min, max, first, last) for each IoT device inside the bucketted document.

### updateMany.js

This is to be executed from Mongo shell. To optimize this, it is highly recommended to build the indexes (see introduction to 1 - Data generation)

## 3 - Data consumption

The folder 3-aggregateData contains examples of how to query data when it is bucketted using the aggregation framework. It also demonstrates how to build materialized views using 4.2 capabilities

### onthefly.js

This shows how to execute aggregations and get results on the getFullYear

### odmv.js

This shows how to persist said aggregations to an on-demand materialized view. Don't forget that this view must be executed at a given frequency to be kept up to date.
