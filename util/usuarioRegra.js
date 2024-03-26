const usuarioSrv = require('../service/usuarioService');
const erroDB = require('../util/userfunctiondb');
const shared = require('../util/shared');
/* REGRA DE NEGOCIO usuarios */

exports.usuario_Inclusao = async function(usuario) { 
	try { 
		const obj = await usuarioSrv.getUsuario(usuario.id_empresa,usuario.id);
		if (obj != null) { 
		   throw new erroDB.UserException('Regra de negócio', [{ tabela: 'USUARIO', message: `"INCLUSÃO" Registro Já Existe Na Base De Dados.!` }]);
		}
	} catch (err) { 
		throw err; 
	}


	return; 
} 

exports.usuario_Alteracao = async function(usuario) { 
	try { 
		const obj = await usuarioSrv.getUsuario(usuario.id_empresa,usuario.id);
		if (obj == null) { 
		   throw new erroDB.UserException('Regra de negócio', [{ tabela: 'USUARIO', message: `"ALTERAÇÃO" Registro Não Existe Na Base De Dados.!` }]);
		}
	} catch (err) { 
		throw err; 
	}


	return; 
} 

exports.usuario_Exclusao = async function(id_empresa,id) { 
	try { 
		const obj = await usuarioSrv.getUsuario(id_empresa,id);
		if (obj == null) { 
		   throw new erroDB.UserException('Regra de negócio', [{ tabela: 'USUARIO', message: `"EXCLUSÃO" Registro Não Existe Na Base De Dados.!` }]);
		}
	} catch (err) { 
		throw err; 
	}


	return; 
} 

