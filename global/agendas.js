const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} = require("toad-scheduler");
const srvEmpresa = require("../service/empresaService");
const srvBling = require("../service/blingService");
const shared = require("../util/shared");

const scheduler = new ToadScheduler();

exports.setAgendamento = function (id_empresa, intervalo, imediato) {
  const task = new AsyncTask(
    `Sincronismo Empresa ${id_empresa}`,
    () => {
      return srvBling.sincronizacao(id_empresa).then((result) => {
        console.log(
          `empresa ${id_empresa} intervalo ${intervalo} imediato ${imediato}`
        );
        console.log(result);
      });
    },
    (error) => {
      console.log(error);
    }
  );

  const job = new SimpleIntervalJob(
    { minutes: intervalo, runImmediately: imediato },
    task,
    {
      id: `id_${id_empresa}`,
      preventOverrun: true,
    }
  );

  scheduler.addSimpleIntervalJob(job);

  return;
};

exports.stopAgendamento = function (id_job) {
  scheduler.stopById(id_job);
};
