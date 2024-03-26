const chgData = require('../data/chgData');
const axios = require('axios')
const variaveis = require('../global/variaveis')

exports.getChgCatalogo = async function(pagina) {
    const url = `https://loja.chg.com.br/api/catalogo/produtos?key=${variaveis.getKeyChg()}&filial=CPS&pagina=${pagina}`
    let response = await axios.get(url);
    return response.data.data
};

exports.getProdutoByCodigo = async function(codigo) {
    const url = `https://loja.chg.com.br/api/catalogo/produto?key=${variaveis.getKeyChg()}&produto=${codigo}&filial=CPS`;
    //console.log("url", url);
    let response = await axios.get(url);
    return response.data.data
};


exports.getProdutoByCodigoArray = async function(produtos) {
    let retorno = []
        //console.log("Parametro funcao getProdutoByCodigoArray:", produtos)
    for (const [index, dado] of produtos.entries()) {
        const produto = await this.getProdutoByCodigo(dado.codigo)
            //console.log("getProdutoByCodigoArray", produto);
        retorno.push({
            index: index,
            codigo: produto.codigo,
            estoque: produto.estoque

        })
    }
    return retorno;
};