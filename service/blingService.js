const axios = require("axios");
const variaveis = require("../global/variaveis");
const credentials = require("../util/credentials.js");
const empresaSrv = require("../service/empresaService");
const tarefaSrv = require("../service/tarefaService.js");
const processadoSrv = require("../service/processadoService");
const processados = require("../global/processados");
const chgSrv = require("../service/chgService.js");
const shared = require("../util/shared.js");
const qs = require("querystring");

process.env.TZ = "America/Araguaina";

exports.getToken = async function (emp) {
  const data = {
    grant_type: "authorization_code",
    code: emp.code,
  };
  const options = {
    url: "https://www.bling.com.br/Api/v3/oauth/token",
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials.getCredentialsBase64(emp)}`,
      Accept: "1.0",
    },
    data: qs.stringify(data),
  };

  try {
    const retorno = await axios(options);

    return retorno.data;
  } catch (error) {
    throw error;
  }
};

exports.getRefreshToken = async function (emp) {
  const data = {
    grant_type: "refresh_token",
    refresh_token: emp.refresh_token.trim(),
  };
  const options = {
    url: "https://www.bling.com.br/Api/v3/oauth/token",
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials.getCredentialsBase64(emp)}`,
      Accept: "1.0",
    },
    data: qs.stringify(data),
  };

  try {
    const response = await axios(options);
    const retorno = response.data;
    console.log("retorno refreshcode", retorno);
    return retorno;
  } catch (err) {
    throw err;
  }
};

exports.getProdutoFullById = async function (id_produto) {
  let lista = {};

  ////console.log(`params: ${id_produto}`)

  const options = {
    url: `https://www.bling.com.br/Api/v3/produtos/${id_produto}`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };

  response = await axios(options);

  return response.data.data;
};

exports.getProdutoFullByCodigo = async function (id_produto) {
  let lista = {};

  ////console.log(`params: ${id_produto}`)

  const options = {
    url: `https://www.bling.com.br/Api/v3/produtos/${id_produto}`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };

  response = await axios(options);

  return response.data.data;
};

exports.getProdutoSimpleByIds = async function (id_produtos, emp, pagina) {
  let page = 1;

  if (typeof pagina == "undefined") {
    page = 1;
  } else {
    page = pagina;
  }

  const options = {
    url: `https://www.bling.com.br/Api/v3/produtos`,
    method: "get",
    params: {
      pagina: page,
      limite: 100,
      idProdutos: id_produtos,
      idCategoria: emp.id_categoria,
    },
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };

  response = await axios(options);

  return response.data.data;
};

exports.postAjustaSaldo = async function (
  id_deposito,
  id_produto,
  qtd,
  preco,
  histo,
  emp
) {
  let lista = {};

  const options = {
    url: `https://www.bling.com.br/Api/v3/estoques`,
    method: "post",
    data: {
      deposito: {
        id: id_deposito,
      },
      operacao: "B",
      produto: {
        id: id_produto,
      },
      quantidade: qtd,
      preco: preco,
      custo: preco,
      observacoes: histo,
    },
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };

  response = await axios(options);

  return response.data.data;
};

exports.getSaldos = async function (produtos, emp) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/estoques/saldos/${emp.id_deposito.trim()}`,
    method: "get",
    params: { idsProdutos: produtos },
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };
  try {
    reponse = await axios(options);
    return reponse.data.data;
  } catch (err) {
    throw err;
  }
};

exports.getListaWork = async function (emp, page) {
  let workList = [];

  const idProdutos = [];

  try {
    let lista = await this.getProdutoSimpleByIds(idProdutos, emp, page);
    if (lista.length == 0) {
      return workList;
    } else {
      lista.forEach(async (bling) => {
        workList.push({
          id: bling.id,
          nome: bling.nome,
          codigo: bling.codigo,
          preco: bling.preco,
          id_deposito: emp.id_deposito,
          saldo_bling: 0,
          saldo_chg: 0,
        });
      });
      return workList;
    }
  } catch (err) {
    throw err;
  }
};

exports.getCategorias = async function (emp) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/categorias/produtos`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };

  try {
    const categorias = await axios(options);

    return categorias.data.data;
  } catch (err) {
    throw err;
  }
};

exports.getDepositos = async function (emp) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/depositos`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${emp.access_token.trim()}`,
    },
  };

  try {
    const depositos = await axios(options);

    return depositos.data.data;
  } catch (error) {
    throw error;
  }

  return depositos;
};

exports.sincronizacao = async function (id_empresa) {
  let idsProdutos = [];
  let codigoProdutos = [];
  let contador = 0;
  let emp = {};
  let tarefa = {};
  let page = 0;
  let listaWork = [];
  const inicio = new Date();

  try {
    emp = await empresaSrv.getEmpresa(id_empresa);
    tarefa = {
      id_empresa: emp.id,
      id: 0,
      id_usuario: 99,
      descricao: "GERADO AUTOMATICAMENTE",
      tempo: 0,
      inicial: new Date().toLocaleString("pt-BR"),
      final: new Date().toLocaleString("pt-BR"),
      qtd_total: 0,
      qtd_erro: 0,
      status: 0,
      user_insert: 99,
      user_update: 0,
    };
    tarefa = await tarefaSrv.insertTarefa(tarefa);
    console.log("tarefa", tarefa);
  } catch (error) {
    throw error;
  }

  try {
    const validade = shared.ValidarToken(emp);
    if (validade.minutos_restantes <= 60) {
      await bling.getAtualizaToken(emp);
    } else {
      console.log("validade: ", validade);
    }
  } catch (error) {
    throw error;
  }

  try {
    console.log("BUSCAR LISTWORK");
    while (page >= 0) {
      page = page + 1;
      listaWork = await this.getListaWork(emp, page);
      if (listaWork.length == 0) {
        page = -1;
        continue;
      }
      console.log("Pagina ", page, " Tam ", listaWork.length);
      tarefa.qtd_total += listaWork.length;
      idsProdutos = [];
      codigoProdutos = [];
      listaWork.forEach((produto) => {
        idsProdutos.push(produto.id);
        codigoProdutos.push({ codigo: produto.codigo });
      });
      console.log("", idsProdutos);
      console.log("BUSCAR SALDOS BLING");
      const saldosBling = await this.getSaldos(idsProdutos, emp);
      console.log("BUSCAR SALDOS CHG DOS SEGUINTES CODIGOS: ");
      console.log(codigoProdutos);
      saldosCHG = await chgSrv.getProdutoByCodigoArray(codigoProdutos);
      console.log("SALDOS CHG ENCONTRADOS:");
      for (const [index, dado] of saldosCHG.entries()) {
        console.log("==>", dado);
      }
      //console.log("SALDOS CHG ENCONTRADOS!", saldosCHG);
      listaWork.forEach((item) => {
        //console.log("item", item);
        var bling = saldosBling.filter((x) => x.produto.id === item.id);
        if (bling) {
          //console.log("bling", bling);
          //console.log("bling.produto", bling[0].produto.id);
          item.saldo_bling = bling[0].saldoFisicoTotal;
        }
        var chg = saldosCHG.filter((x) => x.codigo === item.codigo);
        if (chg) {
          if (typeof chg[0].estoque !== "undefined") {
            item.saldo_chg = chg[0].estoque;
          } else {
            item.saldo_chg = -999999;
          }
          console.log("bling - chg", item.saldo_bling, item.saldo_chg);
        }
      });
      console.log("RESULTADOS");
      processados.clearProcessados();
      tarefa.final = new Date().toLocaleString("pt-BR");
      for (const [index, dado] of listaWork.entries()) {
        if (dado.saldo_bling != dado.saldo_chg) {
          if (dado.saldo_chg == -999999) {
            const processado = {
              id_empresa: emp.id,
              id_tarefa: tarefa.id,
              codigo: dado.codigo,
              descricao: dado.nome,
              saldo_bling: dado.saldo_bling,
              saldo_chg: 0,
              ocorrencia: "Produto Não Encontrado Na CHG",
              user_insert: 99,
              user_update: 0,
            };
            tarefa.qtd_erro = tarefa.qtd_erro + 1;
            await processadoSrv.insertProcessado(processado);
            processados.addProcessados({
              id_empresa: emp.id,
              id_tarefa: tarefa.id,
              codigo: dado.codigo,
              descricao: dado.nome,
              saldo_bling: dado.saldo_bling,
              saldo_chg: "",
              ocorrencia: "Produto Não Encontrado Na CHG",
            });
            console.log(
              "Produto - ",
              dado.id,
              dado.codigo,
              dado.nome,
              "Produto Não Encontrado Na CHG"
            );
          } else {
            const processado = {
              id_empresa: emp.id,
              id_tarefa: tarefa.id,
              codigo: dado.codigo,
              descricao: dado.nome,
              saldo_bling: dado.saldo_bling,
              saldo_chg: dado.saldo_chg,
              ocorrencia: `Saldo Alterado Para ${dado.saldo_chg}.`,
              user_insert: 99,
              user_update: 0,
            };
            await processadoSrv.insertProcessado(processado);
            processados.addProcessados({
              id_empresa: emp.id,
              id_tarefa: 0,
              codigo: dado.codigo,
              descricao: dado.nome,
              saldo_bling: dado.saldo_bling,
              saldo_chg: dado.saldo_chg,
              ocorrencia: `Saldo Alterado Para ${dado.saldo_chg}.`,
              user_insert: 99,
              user_update: 0,
            });
            console.log(
              "Produto - ",
              dado.id,
              dado.codigo,
              dado.nome,
              dado.saldo_bling,
              dado.saldo_chg
            );
            novoSaldo = await this.postAjustaSaldo(
              dado.id_deposito,
              dado.id,
              dado.saldo_chg,
              dado.preco,
              "AJUSTE AUTOMÁTICO CHG",
              emp
            );
            console.log("novoSaldo", novoSaldo);
            contador++;
          }
        } else {
          const processado = {
            id_empresa: emp.id,
            id_tarefa: tarefa.id,
            codigo: dado.codigo,
            descricao: dado.nome,
            saldo_bling: dado.saldo_bling,
            saldo_chg: dado.saldo_chg,
            ocorrencia: `Saldo NÃO ALTERADO!.`,
            user_insert: 99,
            user_update: 0,
          };
          await processadoSrv.insertProcessado(processado);
          processados.addProcessados({
            id_empresa: emp.id,
            id_tarefa: 0,
            codigo: dado.codigo,
            descricao: dado.nome,
            saldo_bling: dado.saldo_bling,
            saldo_chg: dado.saldo_chg,
            ocorrencia: `Saldo NÃO ALTERADO!}.`,
          });
        }
      }
    }
    //fim
    const final = new Date();
    const tempo = final.getTime() - inicio.getTime();
    const segundos = tempo / 1000;
    tarefa.tempo = segundos;
    tarefa.final = final.toLocaleString("pt-BR");
    await tarefaSrv.updateTarefa(tarefa);
    const men = `Fim Do Processamento. ${
      contador == 0
        ? "NENHUM PRODUTO AJUSTADO!"
        : contador.toString() +
          ` PRODUTO${contador == 0 ? "" : "S"} AJUSTADO${
            contador == 0 ? "" : "S"
          }!`
    }`;
    return { message: men };
  } catch (error) {
    throw error;
  }
};

exports.getProdutoSimplesAllPages = async function (id_empresa) {
  let lista = [];
  let emp = {};
  let page = 1;
  let lastId = 0;

  const id_produtos = [];

  try {
    emp = await empresaSrv.getEmpresa(id_empresa);
  } catch (error) {
    throw error;
  }

  console.log(emp);

  try {
    while (page > 0) {
      const options = {
        url: `https://www.bling.com.br/Api/v3/produtos`,
        method: "get",
        params: {
          pagina: page,
          limite: 50,
          idProdutos: id_produtos,
          idCategoria: emp.id_categoria,
        },
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${emp.access_token.trim()}`,
        },
      };

      const response = await axios(options);

      if (response.data.data.length == 0) {
        page = -1;
        continue;
      }

      let produtos = [];
      for (const [index, dado] of response.data.data.entries()) {
        produtos.push({
          idx: index,
          codigo: dado.codigo,
          descricao: dado.nome,
        });
      }
      console.log("Pagina: ", page);

      lista.push(...produtos);
      page++;
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      return lista;
    } else {
      throw error;
    }
  }

  return lista;
};
