/* SERVICE tarefas */
const tarefaData = require('../data/tarefaData');
const validacao = require('../util/validacao');
const parametros = require('../util/tarefaParametros');
const erroDB = require('../util/userfunctiondb');
const regras = require('../util/tarefaRegra');
const TABELA = 'TAREFAS';
/* CRUD GET SERVICE */
exports.getTarefa = async function(id_empresa,id){
	return tarefaData.getTarefa(id_empresa,id);
};
/* CRUD GET ALL SERVICE */
exports.getTarefas = async function(params){
	return tarefaData.getTarefas(params);
};
//* CRUD - INSERT - SERVICE */
 exports.insertTarefa = async function(tarefa){
try 
{
	await regras.tarefa_Inclusao(tarefa);
	validacao.Validacao(TABELA,tarefa, parametros.tarefas());
	return tarefaData.insertTarefa(tarefa);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
//* CRUD - UPDATE - SERVICE */
 exports.updateTarefa = async function(tarefa){
try 
{
	await regras.tarefa_Alteracao(tarefa);
	validacao.Validacao(TABELA,tarefa, parametros.tarefas());
	return tarefaData.updateTarefa(tarefa);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
//* CRUD - DELETE - SERVICE */
 exports.deleteTarefa = async function(id_empresa,id){
try 
{
	await  regras.tarefa_Exclusao(id_empresa,id);
	return tarefaData.deleteTarefa(id_empresa,id);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
 
 exports.limpa_historico = async function(id_empresa){
try 
{
	return tarefaData.limpa_historico(id_empresa);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };