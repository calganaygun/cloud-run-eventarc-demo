const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_WRITE_KEY
);
const index = client.initIndex("demo_data");

async function addDataToAlgolia(data) {
  return index.saveObject(data);
}

module.exports = { addDataToAlgolia };
