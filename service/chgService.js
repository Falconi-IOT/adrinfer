const chgData = require("../data/chgData");
const axios = require("axios");

const https = require("https");

exports.getChgCatalogo = async function (emp, pagina) {
  const url = `https://loja.chg.com.br/api/catalogo/produtos?key=${emp.key_chg}&filial=CPS&pagina=${pagina}`;
  let response = await axios.get(url);
  return response.data.data;
};

/* exports.getProdutoByCodigo = async function (emp, codigo) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  console.log("chave chg:", emp.key_chg, codigo);

  const url = `https://loja.chg.com.br/api/catalogo/produto?key=${emp.key_chg}&produto=${codigo}&filial=CPS`;
  try {
    let response = await axios.get(url);
    if (response.data.err_code == "404") {
      return { codigo: codigo };
    }
    return response.data.data;
  } catch (error) {
    console.log("Erro ao buscar produto na CHG:", error.message || error);
    throw error;
  }
}; */

//feito pela IA
exports.getProdutoByCodigo = async function (emp, codigo) {
  const agent = new https.Agent({ rejectUnauthorized: false });

  const url =
    "https://loja.chg.com.br/api/catalogo/produto" +
    "?key=" +
    emp.key_chg +
    "&produto=" +
    codigo +
    "&filial=CPS";

  let tentativas = 0;

  while (tentativas < 3) {
    try {
      const response = await axios.get(url, { httpsAgent: agent });
      const data = response.data;

      if (!data || !data.data) {
        console.log("CHG sem dados para:", codigo);
        return { codigo: codigo, estoque: -999999 };
      }
      //console.log("Resposta CHG para", codigo, "=>", data.data);
      return data.data;
    } catch (error) {
      tentativas++;

      const erroApi =
        error.response && error.response.data
          ? error.response.data
          : error.message;

      console.log("Erro ao buscar produto na CHG:", erroApi);
      console.log("Falha Na API da CHG. Tentativa", tentativas);

      // espera 300ms antes de tentar de novo
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // depois de 3 tentativas, retorna estoque 0
  return { codigo: codigo, estoque: -999999 };
};

/* exports.getProdutoByCodigoArray = async function (emp, produtos) {
  //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  let retorno = [];
  //console.log("Parametro funcao getProdutoByCodigoArray:", produtos)
  for (const [index, dado] of produtos.entries()) {
    const produto = await this.getProdutoByCodigo(emp, dado.codigo);
    if (response.data.data == {}) {
      console.log("Produto CHG =>", response.data);
    }
    retorno.push({
      index: index,
      codigo: produto.codigo,
      estoque: produto.estoque,
    });
  }
  return retorno;
};
 */
//gerado pela IA
exports.getProdutoByCodigoArray = async function (emp, produtos) {
  let retorno = [];

  for (const [index, dado] of produtos.entries()) {
    const produto = await this.getProdutoByCodigo(emp, dado.codigo);

    // produto pode ser { codigo: X, estoque: 0 } quando não encontrado ou erro
    if (!produto || !produto.codigo) {
      console.log("Produto CHG inválido:", produto, dado.codigo);
      retorno.push({
        index: index,
        codigo: dado.codigo,
        estoque: 0,
      });
      continue;
    }

    retorno.push({
      index: index,
      codigo: produto.codigo,
      estoque: produto.estoque || 0,
    });
  }

  return retorno;
};
