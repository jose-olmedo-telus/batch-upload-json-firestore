# batch-upload-json-firestore

split-json.js requires 2 arguments.
1. Name of the file to be splited 
2. Numbers of objects per file

eg. `node split-json.js ./PAPM_cfp_CARRIER_FOOT_PRINT.json 10000`

To migrate, use the index.js file
index.js requires 3 arguments 
1. Filepath of the json to migrate
2. method: "add" or "set"
3. name of the collections

eg `node index.js ./splited/example.json2.json set tmf-630_carrier_footprint`
