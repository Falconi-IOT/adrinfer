/* SERVICE empresas */
const empresaData = require('../data/empresaData');
const validacao = require('../util/validacao');
const blingSrv = require('../service/blingService.js');
const variaveis = require('../global/variaveis')
const parametros = require('../util/empresaParametros');
const erroDB = require('../util/userfunctiondb');
const regras = require('../util/empresaRegra');
const TABELA = 'EMPRESAS';
/* CRUD GET SERVICE */
exports.getEmpresa = async function(id) {
    return empresaData.getEmpresa(id);
};
/* CRUD GET ALL SERVICE */
exports.getEmpresas = async function(params) {
    return empresaData.getEmpresas(params);
};
//* CRUD - INSERT - SERVICE */
exports.insertEmpresa = async function(empresa) {
    try {
        await regras.empresa_Inclusao(empresa);
        validacao.Validacao(TABELA, empresa, parametros.empresas());
        return empresaData.insertEmpresa(empresa);
    } catch (err) {
        throw new erroDB.UserException(err.erro, err);
    }
};
//* CRUD - UPDATE - SERVICE */
exports.updateEmpresa = async function(empresa) {
    try {
        await regras.empresa_Alteracao(empresa);
        validacao.Validacao(TABELA, empresa, parametros.empresas());
        return empresaData.updateEmpresa(empresa);
    } catch (err) {
        throw new erroDB.UserException(err.erro, err);
    }
};


//* CRUD - DELETE - SERVICE */
exports.deleteEmpresa = async function(id) {
    try {
        await regras.empresa_Exclusao(id);
        return empresaData.deleteEmpresa(id);
    } catch (err) {
        throw new erroDB.UserException(err.erro, err);
    }
};

//* CRUD - COMPLEMENTAR EMPRESA - SERVICE */
exports.ComplementarEmpresa = async function(id_empresa) {

    let retorno = {
        deposito: 0,
        categoria: 0
    }

    let depositos = [];

    let categorias = [];

    let emp = null;

    try {

        emp = await this.getEmpresa(id_empresa);

        if (emp == null) {
            throw new erroDB.UserException('Regra de negócio', [{ tabela: 'EMPRESA', message: `Empresa Não Encontrada!` }]);
        }

    } catch (error) {

        throw error;

    }

    try {


        depositos = await blingSrv.getDepositos();

    } catch (error) {

        throw error;

    }

    if ((typeof depositos !== 'undefined') && (depositos.length != 0)) {

        const dep = depositos.filter((dp) => {
            if (dp.descricao == "Geral") {
                return true;
            }
        });
        if ((typeof dep !== 'undefined') && (dep.length != 0)) {
            retorno.deposito = dep[0].id;
        }

    }

    try {

        categorias = await blingSrv.getCategorias();

    } catch (error) {

        throw error;

    }

    if ((typeof categorias !== 'undefined') && (categorias.length != 0)) {

        const cat = categorias.filter((categ) => {
            if (categ.descricao == "CHG") {
                return true;
            }
        });

        if ((typeof cat !== 'undefined') && (cat.length != 0)) {
            retorno.categoria = cat[0].id;
        }

    }


    if ((retorno.deposito !== 0) && (retorno.categoria !== 0)) {

        try {

            emp.id_deposito = retorno.deposito.toString();

            emp.id_categoria = retorno.categoria.toString();

            const empAlterada = await this.updateEmpresa(emp);

            if (empAlterada.id_deposito !== retorno.deposito.toString()) {
                retorno.deposito = -1;
            }
            if (empAlterada.id_categoria !== retorno.categoria.toString()) {
                retorno.categoria = -1;
            }

        } catch (err) {

            throw err;
        }

    }


    return retorno;

};