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

router.get("", async function (req, res) {
  const hoje = new Date().toLocaleString("pt-BR");

  let emp = await srvEmpresa.getEmpresa(1);

  const validade = new Date(Date.parse(emp.access_token_date));

  validade.setSeconds(validade.getSeconds() + emp.access_token_validade);

  const validade_tempo = shared.ValidarToken(emp);

  /*
  const scheduler = new ToadScheduler();

  const task = new AsyncTask(
    "simple task",
    () => {
      return srvBling.sincronizacao(1).then((result) => {
        console.log(result);
      });
    },
    (error) => {
      console.log(error);
    }
  );
  const job = new SimpleIntervalJob(
    { minutes: 20, runImmediately: true },
    task
  );

  scheduler.addSimpleIntervalJob(job);
*/
  res.status(200).json({
    message: "Sistema No Ar!",
    horario: hoje,
    validade_token: validade.toLocaleString("pt-BR"),
    validade_tempo: validade_tempo,
  });
});

module.exports = router;
