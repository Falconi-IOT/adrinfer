/* SERVICE processados */
const processadoData = require('../data/processadoData');
const validacao = require('../util/validacao');
const parametros = require('../util/processadoParametros');
const erroDB = require('../util/userfunctiondb');
const regras = require('../util/processadoRegra');
const TABELA = 'PROCESSADOS';
/* CRUD GET SERVICE */
exports.getProcessado = async function(id_empresa,id_tarefa,codigo){
	return processadoData.getProcessado(id_empresa,id_tarefa,codigo);
};
/* CRUD GET ALL SERVICE */
exports.getProcessados = async function(params){
	return processadoData.getProcessados(params);
};
//* CRUD - INSERT - SERVICE */
 exports.insertProcessado = async function(processado){
try 
{
	await regras.processado_Inclusao(processado);
	validacao.Validacao(TABELA,processado, parametros.processados());
	return processadoData.insertProcessado(processado);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
//* CRUD - UPDATE - SERVICE */
 exports.updateProcessado = async function(processado){try 
{
	await regras.processado_Alteracao(processado);
	validacao.Validacao(TABELA,processado, parametros.processados());
	return processadoData.updateProcessado(processado);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
//* CRUD - DELETE - SERVICE */
 exports.deleteProcessado = async function(id_empresa,id_tarefa,codigo){try 
{
	await  regras.processado_Exclusao(id_empresa,id_tarefa,codigo);
	return processadoData.deleteProcessado(id_empresa,id_tarefa,codigo);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
