require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const sql = neon(process.env.DATABASE_URL);

module.exports = {
  query: (queryText, params) => sql(queryText, params),
};
