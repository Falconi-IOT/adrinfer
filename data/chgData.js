const axios = require('axios')

exports.getChgCatalogo = async function(pagina) {
    const url = `https://loja.chg.com.br/api/catalogo/produtos?key=cuJDtZKp55fFzsUZYM4XDgGYbGNurkFX&filial=CPS&pagina=${pagina}`
    const lista = await axios.get(url).then((res) => {
        const dados = res.data;
        return dados
    });
    console.log("lista", lista);
    return lista
}