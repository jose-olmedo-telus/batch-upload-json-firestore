const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");
const fs = require("fs");
const JSONStream = require("JSONStream");
const es = require("event-stream");
const Firestore = require("@google-cloud/firestore");
//import { Firestore } from '@google-cloud/firestore';
const { resolve } = require("path");

// Initialize Firebase configs file
const config = {
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.SERVICE_ACCOUNT,
};

class PopulateJsonFireStore {
  // class constructor
  constructor() {
    console.time("Time taken");
    this.db = new Firestore(config);
    // Obtain the relative path, method type, collection name arguments provided through
    const [, , filepath, type, collectionname] = process.argv;

    // Obtain the absolute path for the given relative
    this.absolutepath = resolve(process.cwd(), filepath);

    // Obtain the firestore method type
    this.type = type;

    // Obtain the firestore method type
    this.collectionname = collectionname;

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

    //data.forEach((item) => console.log(item));
    // loop through the data
    // Populate Firestore on each run
    // Make sure file has atleast one item.
    if (data.length < 1) {
      console.error("Make sure file contains items.");
    }
    const batch = this.db.batch();
    //const collection = this.db.collection("Counters");
    //const documents = await collection.get();
    //const arr = documents.docs.map((x) => {
    //  return x.data();
    //});
    //console.log(arr);
    for (var item of data) {
      try {
        if (this.type === "set") {
          await this.set(item);
        } else if (this.type === "batch") {
          this.batchFun(item, batch);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
    if (this.type === "batch") {
      await batch.commit();
    }
    console.log("IMPORT SUCCESSFUL!")
    this.exit(0);
  }

  // Sets data to firestore database
  // Firestore auto generated IDS
  batchFun(item, batch) {
    console.log(`Batching item with id ${item["id"]}`);
    const collectionRef = this.db
      .collection(this.collectionname)
      .doc(String(item["id"]));
    batch.set(collectionRef, item);
  }

  // Set data with specified ID
  // Custom Generated IDS
  set(item) {
    console.log(`setting item with id ${item["ID."]}`);
    return this.db
      .doc(`${this.collectionname}/${item["ID."]}`)
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
const populateFireStore = new PopulateJsonFireStore();
populateFireStore.populate();

// command to run
//node json-to-firestore/populateJsonFirestore.js ./json-to-firestore/data.json add demo-users
