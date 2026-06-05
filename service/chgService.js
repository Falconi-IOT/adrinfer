const chgData = require("../data/chgData");
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const pLimit = require("p-limit").default;
const limitCHG = pLimit(4); // 4 workers

const https = require("https");

// === AXIOS DEDICADO PARA A CHG ===
const axiosCHG = axios.create({
  httpsAgent: new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 5,        // evita overload
    maxFreeSockets: 2,
    rejectUnauthorized: false
  }),
  timeout: 15000
});


// === RETRY AUTOMÁTICO ===
axiosRetry(axiosCHG, {
    retries: 3,
    retryDelay: (count) => count * 2000,
    retryCondition: (error) => {
        return (
            error.code === "ECONNRESET" ||
            error.code === "ETIMEDOUT" ||
            axiosRetry.isNetworkError(error) ||
            axiosRetry.isRetryableError(error)
        );
    },
});

exports.getChgCatalogo = async function(emp, pagina) {
    const url = `https://loja.chg.com.br/api/catalogo/produtos?key=${emp.key_chg}&filial=CPS&pagina=${pagina}`;
    let response = await axiosCHG.get(url);
    return response.data.data;
};


// === FUNÇÃO REFEITA ===
exports.getProdutoByCodigo = async function(emp, codigo) {
    const url =
        "https://loja.chg.com.br/api/catalogo/produto" +
        "?key=" + emp.key_chg +
        "&produto=" + codigo +
        "&filial=CPS";

    try {
        const response = await axiosCHG.get(url);
        const data = response.data;

        if (!data || !data.data) {
            if (codigo == '0661031' || codigo == '0512375'){
               //console.log("Produto Não Encontrado:", codigo);
            }
            return { codigo, estoque: -999999 };
        } else {
            if (codigo == '0661031' || codigo == '0512375'){
               //console.log("Produto Não Encontrado:", codigo);
            }
            return data.data;
        }



    } catch (error) {

        const erroApi =

            error.response?.data || error.message;


        console.log("Erro ao buscar produto na CHG:", erroApi);

        return { codigo, estoque: -999999 };
    }
};


exports.getProdutoByCodigoArray = async function(emp, codigoProdutos) {
    const resultados = await Promise.all(
        codigoProdutos.map((p) =>
            limitCHG(async() => {
                try {
                    const produto = await this.getProdutoByCodigo(emp, p.codigo);
                    return {
                        codigo: p.codigo,
                        estoque: produto?.estoque ? produto?.estoque : -999999,
                    };
                } catch (err) {
                    return {
                        codigo: p.codigo,
                        estoque: -999999,
                    };
                }
            }),
        ),
    );

    return resultados;
};