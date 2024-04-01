const express = require("express");
const srvEmpresa = require("../service/empresaService");
const shared = require("../util/shared");
const router = express.Router();

process.env.TZ = "America/Araguaina";

router.get("", async function (req, res) {
  const hoje = new Date().toLocaleString("pt-BR");

  let emp = await srvEmpresa.getEmpresa(1);

  const validade = new Date(Date.parse(emp.access_token_date));

  validade.setSeconds(validade.getSeconds() + emp.access_token_validade);

  const validade_tempo = shared.ValidarToken(emp);

  res.status(200).json({
    message: "Sistema No Ar!",
    horario: hoje,
    validade_token: validade.toLocaleString("pt-BR"),
    validade_tempo: validade_tempo,
  });
});

function convertDBDateTime(value) {
  let soData = value.substring(0, 10);

  const pedacos = soData.split("/");

  soData = pedacos[2] + "-" + pedacos[1] + "-" + pedacos[0];

  return soData + value.substring(10) + "GMT-0300";
}

module.exports = router;
