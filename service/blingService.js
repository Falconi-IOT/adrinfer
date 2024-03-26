const axios = require('axios')
const variaveis = require('../global/variaveis')
const qs = require('querystring');
//const ACESSTOKEN = "824066939464910bcb89eee3bd77ace9e17aaf5e"
//const ACESSTOKEN = "b878e80a59a823c2339cff192ca67888070813e8"
//const ID_DEPOSITO = 14887604950
//const ID_CATEGORIA = 9260994


exports.getToken = async function() {

    const data = {
        'grant_type': 'authorization_code',
        'code': variaveis.getCode()
    };
    const options = {
        url: 'https://www.bling.com.br/Api/v3/oauth/token',
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${variaveis.getCredentialsBase64(1)}`,
            'Accept': '1.0',
        },
        data: qs.stringify(data),
    }

    try {

        const retorno = await axios(options);

        return retorno.data

    } catch (error) {

        throw error

    }



}

exports.getRefreshToken = async function() {

    //console.log("getRefreshToken", variaveis.getRefreshToken());
    const data = {
        'grant_type': 'refresh_token',
        'refresh_token': variaveis.getRefreshToken()
    };
    const options = {
        url: 'https://www.bling.com.br/Api/v3/oauth/token',
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${variaveis.getCredentialsBase64(1)}`,
            'Accept': '1.0',
        },
        data: qs.stringify(data),
    }

    try {

        const response = await axios(options)
        const retorno = response.data;
        console.log("Novo Token: ", retorno);
        variaveis.setAcessToken = retorno.access_token
        variaveis.setRefreshToken = retorno.refresh_token
        return retorno;
    } catch (err) {

        throw err

    }

}

exports.getProdutoFullById = async function(id_produto) {

    let lista = {}

    ////console.log(`params: ${id_produto}`)

    const options = {
        url: `https://www.bling.com.br/Api/v3/produtos/${id_produto}`,
        method: 'get',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${variaveis.getAcessToken()}`
        }
    }

    response = await axios(options);

    return response.data.data

}

exports.getProdutoSimpleByIds = async function(id_produtos, id_categoria) {

    let lista = {}

    const options = {
        url: `https://www.bling.com.br/Api/v3/produtos`,
        method: 'get',
        params: {
            idProdutos: id_produtos,
            idCategoria: id_categoria
        },
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${variaveis.getAcessToken()}`
        }
    }

    response = await axios(options);

    return response.data.data

}

exports.postAjustaSaldo = async function(id_deposito, id_produto, qtd, preco, histo) {

    let lista = {}

    const options = {
        url: `https://www.bling.com.br/Api/v3/estoques`,
        method: 'post',
        data: {
            deposito: {
                id: id_deposito
            },
            operacao: "B",
            produto: {
                id: id_produto
            },
            quantidade: qtd,
            preco: preco,
            custo: preco,
            observacoes: histo
        },
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${variaveis.getAcessToken()}`
        }
    }

    response = await axios(options);

    return response.data.data

}

exports.getSaldos = async function(produtos) {

    const options = {
        url: `https://www.bling.com.br/Api/v3/estoques/saldos/${variaveis.getIdDeposito()}`,
        method: 'get',
        params: { idsProdutos: produtos },
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${variaveis.getAcessToken()}`
        }
    }
    try {
        reponse = await axios(options);
        return reponse.data.data;
    } catch (err) {
        throw err
    }


}

exports.getListaWork = async function() {


    let workList = [];

    const idProdutos = []

    try {

        let lista = await this.getProdutoSimpleByIds(idProdutos, variaveis.getIdCategoria())

        //console.log("RETORNO ", lista);

        lista.forEach(async(bling) => {

            workList.push({
                id: bling.id,
                nome: bling.nome,
                codigo: bling.codigo,
                preco: bling.preco,
                id_deposito: variaveis.getIdDeposito(),
                saldo_bling: 0,
                saldo_chg: 0
            })

        });

        return workList;

    } catch (err) {

        throw err

    }

};

exports.getCategorias = async function() {
    const options = {
        url: `https://www.bling.com.br/Api/v3/categorias/produtos`,
        method: 'get',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${variaveis.getAcessToken()}`
        }
    }

    try {
        const categorias = await axios(options);

        return categorias.data.data;

    } catch (err) {
        throw err
    }

}

exports.getDepositos = async function() {


    const options = {
        url: `https://www.bling.com.br/Api/v3/depositos`,
        method: 'get',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${variaveis.getAcessToken()}`
        }
    }

    try {


        const depositos = await axios(options);

        return depositos.data.data;

    } catch (error) {
        throw error
    }


    return depositos;


};