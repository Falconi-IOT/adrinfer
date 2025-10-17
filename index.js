/*

Tras várias promisses de uma vez
https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop

*/
//process.env.TZ = "America/Brasilia";
const express = require("express");
//require("dotenv").config();
const path = require("path");
const bling = require("./util/bling.js");
const empresaSrv = require("./service/empresaService");
const chgSrv = require("./service/chgService.js");
const shared = require("./util/shared.js");
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const allowCors = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // colocar os dominios permitidos | ex: 127.0.0.1:3000

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, X-Access-Token, X-Key"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, PUT, POST, DELETE, OPTIONS, PATCH"
    );

    res.header("Access-Control-Allow-Credentials", "false");

    next();
};

const verficaCHG = async function(emp) {
    const produtos = [{ codigo: "0212234" }];

    for (const [index, dado] of produtos.entries()) {
        try {
            const produto = await chgSrv.getProdutoByCodigo(emp, dado.codigo);
            console.log(index, produto.codigo, produto.nome, produto.estoque);
        } catch (error) {
            console.log("Falha Na Chamanda Da API DA CHG!");
        }
    }
    return;
};

const refreshToken = async function(emp) {
    const validade = shared.ValidarToken(emp);
    console.log("validade: ", validade);
    if (validade.minutos_restantes <= 60) {
        emp = await bling.getAtualizaToken(emp);
    }
    return;
};

const iniciar = async function() {
    let emp = {};

    try {
        emp = await empresaSrv.getEmpresa(1);
    } catch (error) {
        throw error;
    }
    await verficaCHG(emp);
    try {
        await refreshToken(emp);
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
        } else {
            if (error.name == "MyExceptionDB") {
                console.log(error);
            } else {
                res = { erro: "BAK-END", tabela: "Empresa", message: error.message };
                console.log(res);
            }
        }
    }
    empresaSrv.AtivarEmpresas();
};

app.use(allowCors);

app.use("/", require("./route/helloRoute.js"));
app.use("/", require("./route/blingRoute.js"));
app.use("/", require("./route/empresaRoute.js"));
app.use("/", require("./route/tarefaRoute.js"));
app.use("/", require("./route/usuarioRoute.js"));
app.use("/", require("./route/processadoRoute.js"));

// front end
app.use(express.static(path.join(__dirname, "/application")));

//correção da rota do angular
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/application/index.html"));
});

iniciar();

console.log("AMBIENTE:", process.env.ENVIRONMENT);

app.listen(PORT, () => {
    console.log(`Servidor No Ar. Porta${PORT}`);
});