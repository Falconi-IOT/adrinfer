const pgp = require("pg-promise")();
const fs = require("fs");

let dbConfig;

if (process.env.DATABASE_URL) {
  dbConfig = process.env.DATABASE_URL;
  console.log("Conexão Configurada Para Nuvem");
} else {
  const conexao = JSON.parse(fs.readFileSync("./conexoes_nuvem.json", "utf8"));
  dbConfig = conexao.database_url;
  console.log("Conexão configurada Para Nuvem!");
}

const db = pgp(dbConfig);

module.exports = db;
