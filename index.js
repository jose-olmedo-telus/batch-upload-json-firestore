const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");
const fs = require("fs");
const JSONStream = require("JSONStream");
const es = require("event-stream");
const Firestore = require("@google-cloud/firestore");
//import { Firestore } from '@google-cloud/firestore';
const { resolve } = require("path");
const BigBatch = require('@qualdesk/firestore-big-batch').BigBatch;
// Initialize Firebase configs file
const config = {
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.SERVICE_ACCOUNT,
};

class PopulateJsonFireStore {
  // class constructor
  constructor(fileNumber) {
    console.time("Time taken");
    this.db = new Firestore(config);
    // Obtain the relative path, method type, collection name arguments provided through
    // [RELATIVE PATH TO FILE] [FIRESTORE METHOD] [COLLECTION NAME] [IDKEYFIRESTORE]
    // TEST PUSH: idKey is json key! 
    const [, , filepath, type, collectionname, idKey] = process.argv;
    const realPath = `${filepath}${fileNumber}.json`
    // Obtain the absolute path for the given relative
    this.absolutepath = resolve(process.cwd(), realPath);

    // Obtain the firestore method type
    this.type = type;

    // Obtain the firestore method type
    this.collectionname = collectionname;

    this.idKey = idKey;
    if (!this.idKey) {
      console.error("idKey is needed");
      this.exit(1);
    }

    // Lets make sure the right firestore method is used.
    if (this.type !== "set" && this.type !== "batch") {
      console.error(`Wrong method type ${this.type}`);
      console.log("Accepted methods are: set or batch");
      this.exit(1);
    }

    // If file path is missing
    if (this.absolutepath == null || this.absolutepath.length < 1) {
      console.error(
        `Make sure you have file path assigned ${this.absolutepath}`
      );
      this.exit(1);
    }

    // If collection name not set
    if (this.collectionname == null || this.collectionname.length < 1) {
      console.error(
        `Make sure to specify firestore collection ${this.collectionname}`
      );
      this.exit(1);
    }

    console.log(`ABS: FILE PATH ${this.absolutepath}`);
    console.log(`Type: method is ${this.type}`);
  }

  // The populate function
  // uploads the json data to firestore
  async populate() {
    // initialize our data array
    let data = [];

    const getStream = function () {
      const jsonData = this.absolutepath,
        stream = fs.createReadStream(jsonData, { encoding: "utf8" }),
        parser = JSONStream.parse("*");
      return stream.pipe(parser);
    };
    // Get data from json file using fs
    try {
      //getStream().pipe(
      //  es.mapSync(function (data) {
      //    console.log(data);
      //    return data;
      //  })
      //);
      data = JSON.parse(fs.readFileSync(this.absolutepath, {}), "utf8");
    } catch (e) {
      console.error(e.message);
    }
    // loop through the data
    // Populate Firestore on each run
    // Make sure file has atleast one item.
    if (data.length < 1) {
      console.error("Make sure file contains items.");
    }
    const batch = new BigBatch({ firestore: this.db })
    //const batch = this.db.batch();
    for (var item of data) {
      try {
        if (this.type === "set") {
          await this.set(item);
        } else if (this.type === "batch") { //ALMOST ALWAYS BATCH SHOULD BE USED
          this.batchFun(item, batch);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
    if (this.type === "batch") {
      console.log("Beginning to commit the batch....")
      await batch.commit();
    }
    console.log("IMPORT SUCCESSFUL!");
    console.timeEnd("Time taken");
  }

  // Sets data to firestore database
  // Firestore auto generated IDS
  batchFun(item, batch) {
    console.log(`Batching item with id ${item[this.idKey]}`);
    const collectionRef = this.db
      .collection(this.collectionname)
      .doc(String(item[this.idKey]));
    batch.set(collectionRef, item);
  }

  // Set data with specified ID
  // Custom Generated IDS
  set(item) {
    console.log(`setting item with id ${item[this.idKey]}`);
    return this.db
      .doc(`${this.collectionname}/${item[this.idKey]}`)
      .set(Object.assign({}, item))
      .then(() => true)
      .catch((e) => console.error(e.message));
  }

  // Exit nodejs console
  exit(code) {
    return process.exit(code);
  }
}

// create instance of class
// Run populate function


// command to run
//node index.js ./splited/example.json2.json set tmf-630_carrier_footprint ID.
const populateAll = async() => {
  for(let i=6; i<=29; i++){
    const populateFireStore = new PopulateJsonFireStore(i);
    await populateFireStore.populate();
  }
}
populateAll()
  .then(()=>console.log("success!"))
  .catch(()=>console.log("failure lol"))