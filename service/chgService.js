const chgData = require("../data/chgData");
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const pLimit = require("p-limit").default;
const limitCHG = pLimit(2); // 2 workers
const db = require("../infra/database");

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
             error.code === "ECONNABORTED" ||
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

    console.log(url);    

    try {
        const response = await axiosCHG.get(url);

        console.log("response",response);
        
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


// FULL LOAD — substitui tudo
exports.salvarListaCompleta = async function (empresaId, lista) {

    await db.query("DELETE FROM chg_produtos WHERE empresa_id = $1", [empresaId]);

    if (!lista || lista.length === 0) return;

    const batchSize = 1000; // 1000 produtos por lote
    const now = new Date();

    for (let i = 0; i < lista.length; i += batchSize) {
        const chunk = lista.slice(i, i + batchSize);

        const values = [];
        const placeholders = [];

        chunk.forEach((item, idx) => {
            const base = idx * 6;
            placeholders.push(
                `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`
            );

            values.push(
                empresaId,
                item.codigo,
                item.nome,
                item.estoque,
                item.preco,
                now
            );
        });

        const sql = `
            INSERT INTO chg_produtos
            (empresa_id, codigo, nome, estoque, preco, atualizado_em)
            VALUES ${placeholders.join(",")}
        `;

        await db.query(sql, values);
    }
};

    // INCREMENTAL — atualiza só o item alterado
exports.atualizarProduto =  async function (empresaId, codigo, item) {

        const sql = `
            INSERT INTO chg_produtos
            (empresa_id, codigo, nome, estoque, preco, atualizado_em)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (empresa_id, codigo)
            DO UPDATE SET
                nome = EXCLUDED.nome,
                estoque = EXCLUDED.estoque,
                preco = EXCLUDED.preco,
                atualizado_em = EXCLUDED.atualizado_em
        `;

        await db.query(sql, [
            empresaId,
            codigo,
            item.nome,
            item.estoque,
            item.preco,
            new Date()
        ]);
    },

    // Carregar lista completa
    exports.getListaCompleta = async function (empresaId) {
        try {
            const sql = `
                SELECT codigo, nome, estoque, preco, atualizado_em
                FROM chg_produtos
                WHERE empresa_id = $1
            `;

            const result = await db.any(sql, [empresaId]);

            return result; // <-- ESSENCIAL
        } catch (err) {
            console.log("Erro getListaCompleta:", err);
            return []; // <-- nunca retorne undefined
        }
    };


    // Opcional — limpar tudo
  exports.limparEmpresa = async function (empresaId) {
        await db.query("DELETE FROM chg_produtos WHERE empresa_id = $1", [empresaId]);
    };

