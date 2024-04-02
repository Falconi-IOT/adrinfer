const empresaSrv = require("../service/empresaService.js");
const blingSrv = require("../service/blingService.js");
const variaveis = require("../global/variaveis.js");

exports.getAtualizaToken = async function (emp) {
  let retorno = {};

  try {
    console.log("getAtualizaToken Empresa: => ", emp);

    try {
      retorno = await blingSrv.getRefreshToken(emp);
    } catch (error) {
      throw error;
    }

    try {
      console.log("retorno", retorno);

      emp.access_token = retorno.access_token.trim();

      emp.access_token_validade = retorno.expires_in;

      emp.access_token_date = new Date().toLocaleString("pt-BR");

      emp.refresh_token = retorno.refresh_token.trim();

      const empAlterada = await empresaSrv.updateEmpresa(emp);

      console.log("empAlterada", empAlterada);
    } catch (error) {
      throw error;
    }

    console.log("TOKEN ATUALIZADO COM SUCESSO!");
  } catch (error) {
    throw error;
  }

  return;
};
