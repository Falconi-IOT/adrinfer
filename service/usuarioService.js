/* SERVICE usuarios */
const usuarioData = require('../data/usuarioData');
const validacao = require('../util/validacao');
const parametros = require('../util/usuarioParametros');
const erroDB = require('../util/userfunctiondb');
const regras = require('../util/usuarioRegra');
const TABELA = 'USUARIOS';
/* CRUD GET SERVICE */
exports.getUsuario = async function(id_empresa,id){
	return usuarioData.getUsuario(id_empresa,id);
};
/* CRUD GET ALL SERVICE */
exports.getUsuarios = async function(params){
	return usuarioData.getUsuarios(params);
};
//* CRUD - INSERT - SERVICE */
 exports.insertUsuario = async function(usuario){
try 
{
	await regras.usuario_Inclusao(usuario);
	validacao.Validacao(TABELA,usuario, parametros.usuarios());
	return usuarioData.insertUsuario(usuario);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
//* CRUD - UPDATE - SERVICE */
 exports.updateUsuario = async function(usuario){try 
{
	await regras.usuario_Alteracao(usuario);
	validacao.Validacao(TABELA,usuario, parametros.usuarios());
	return usuarioData.updateUsuario(usuario);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
//* CRUD - DELETE - SERVICE */
 exports.deleteUsuario = async function(id_empresa,id){try 
{
	await  regras.usuario_Exclusao(id_empresa,id);
	return usuarioData.deleteUsuario(id_empresa,id);
}
catch (err)
{ 
	throw new erroDB.UserException(err.erro, err); 
}
 };
