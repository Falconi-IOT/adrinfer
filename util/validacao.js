const erroDB = require('../util/userfunctiondb');


exports.Validacao = function(nomeTabela, tabela, parametros) {

    const campos = Object.keys(tabela);

    erros = [];

    for (campo of campos) {

        par = parametros[campo];

        if (par && par != null) {

            const chaves = Object.keys(par);

            for (chave of chaves) {

                if (chave == 'check') {
                    if (!par[chave]) {
                        break;
                    }
                }

                if (chave == 'minLength') {


                    if (typeof(tabela[campo]) === 'string') {
                        if (tabela[campo].length < par[chave]) {

                            erros.push({ tabela: nomeTabela, message: `${campo} não atingiu o tamanho mínimo ! ${par[chave]}` });

                        }
                    }

                }

                if (chave == 'maxLength') {

                    if (typeof(tabela[campo]) === 'string') {
                        if (tabela[campo].length > par[chave]) {

                            erros.push({ tabela: nomeTabela, message: `${campo} excedeu o tamanho máximo ! ${par[chave]}` });

                        }
                    }

                }
                if (chave == 'min') {

                    if (typeof(tabela[campo]) === 'number') {

                        if (tabela[campo] < par[chave]) {

                            erros.push({ tabela: nomeTabela, message: `${campo} abaixo do valor mínimo ! ${par[chave]}` });

                        }
                    }

                }
                if (chave == 'max') {

                    if (typeof(tabela[campo]) === 'number') {

                        if (tabela[campo] < par[chave]) {

                            erros.push({ tabela: nomeTabela, message: `${campo} acima do valor máximo! ${par[chave]}` });

                        }
                    }

                }

                if (chave == 'data') {


                }

                if (chave == 'require') {


                }

            }

        }
    }


    if (erros.length > 0) {

        throw new erroDB.UserException('Banco De Dados', erros)

    }

    return;

}