exports.UserException = function(origem, erros) {

    console.log('erros', erros);

    console.log('origem', origem);


    if (erros && erros != null) {

        mensagem = '';

        if (Array.isArray(erros)) {
            for (e of erros) {
                mensagem += e.message + '|';
            }
            this.tabela = erros[0].tabela;
        } else {
            mensagem = erros.message;
            this.tabela = erros.tabela;
        }
        this.erro = origem;
        this.message = mensagem;
        this.name = 'MyExceptionDB';
    } else {

        this.erro = 'JS';
        this.tabela = '';
        this.message = origem;
        this.name = 'MyExceptionDB';
    }
}