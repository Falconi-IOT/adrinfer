const express = require("express");
const srvEmpresa = require("../service/empresaService");
const router = express.Router();

process.env.TZ = "America/Araguaina";

router.get("", async function (req, res) {
  const hoje = new Date().toLocaleString("pt-BR");

  //console.log(convertDBDateTime(hoje));

  let emp = await srvEmpresa.getEmpresa(1);

  console.log("emp", emp);

  //emp.access_token_date = hoje;
  //emp.access_token_validade = 120;

  //emp = await srvEmpresa.updateEmpresa(emp);

  //emp = await srvEmpresa.getEmpresa(1);

  //console.log("Empresa alterada: ", emp);

  //Gera Data Da Validade Do Token

  const validade = new Date(Date.parse(emp.access_token_date));

  validade.setMinutes(validade.getMinutes() + emp.access_token_validade);

  const tempo = difDate(new Date(Date.parse(hoje)), validade);

  res.status(200).json({
    message: "Sistema No Ar!",
    horario: hoje,
    validade_token: validade.toLocaleString("pt-BR"),
    tempo: tempo,
  });
});

function convertDBDateTime(value) {
  let soData = value.substring(0, 10);

  const pedacos = soData.split("/");

  soData = pedacos[2] + "-" + pedacos[1] + "-" + pedacos[0];

  return soData + value.substring(10) + "GMT-0300";
}

function difDate(date1, date2) {
  try {
    var agora = date1;
    var vencimento = date2;
    var diffMs = vencimento - agora; // milliseconds between now & vencimento
    var diffDays = Math.floor(diffMs / 86400000); // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return { dias: diffDays, horas: diffHrs, minutos: diffMins };
  } catch (error) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }
}
module.exports = router;
