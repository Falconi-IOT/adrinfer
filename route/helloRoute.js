const express = require("express");
const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} = require("toad-scheduler");
const srvEmpresa = require("../service/empresaService");
const srvBling = require("../service/blingService");
const shared = require("../util/shared");
const router = express.Router();

process.env.TZ = "America/Araguaina";

router.get("/hello/:id_empresa", async function (req, res) {
  const id_empresa = req.params.id_empresa;

  const hoje = new Date().toLocaleString("pt-BR");

  try {
    let emp = await srvEmpresa.getEmpresa(id_empresa);

    const validade = shared.ValidarToken(emp);

    res.status(200).json({
      message: "Sistema No Ar!",
      Inicio: emp.access_token_date,
      Agora: hoje,
      validade: validade,
    });
  } catch (error) {
    if (error.response) {
      res.status(500).json(error.response.data);
    } else {
      if (error.name == "MyExceptionDB") {
        console.log(error);
      } else {
        retorno = {
          erro: "BAK-END",
          tabela: "Empresa",
          message: error.message,
        };
        res.status(500).json(retorno);
      }
    }
  }
});

module.exports = router;
