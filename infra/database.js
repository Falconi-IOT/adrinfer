/* fontes gerado automaticamente */
const pgp = require("pg-promise")();

db = null;

if (process.env.PORT) {
  db = pgp({
    user: "postgres",
    password: "PfNbmHQxjSnsZMCjzUYYLpVETcPeuBVx",
    host: "monorail.proxy.rlwy.net",
    port: 34218,
    database: "railway",
  });
} else {
  db = pgp({
    user: "postgres",
    password: "PfNbmHQxjSnsZMCjzUYYLpVETcPeuBVx",
    host: "monorail.proxy.rlwy.net",
    port: 34218,
    database: "railway",
  });
}

module.exports = db;
/*//web
postgresql://postgres:PfNbmHQxjSnsZMCjzUYYLpVETcPeuBVx@monorail.proxy.rlwy.net:34218/railway


acesso via web

 

*/
/*
db = pgp({
        user: "postgres",
        password: "123456",
        host: "localhost",
        port: 5432,
        database: "db_afrinfer",
    });
    */
