const processadoSrv = require('../service/processadoService');
const erroDB = require('../util/userfunctiondb');
const shared = require('../util/shared');
/* REGRA DE NEGOCIO processados */

exports.processado_Inclusao = async function(processado) { 
	try { 
		const obj = await processadoSrv.getProcessado(processado.id_empresa,processado.id_tarefa,processado.codigo,processado.seq);
		if (obj != null) { 
		   throw new erroDB.UserException('Regra de negócio', [{ tabela: 'PROCESSADO', message: `"INCLUSÃO" Registro Já Existe Na Base De Dados.!` }]);
		}
	} catch (err) { 
		throw err; 
	}


	return; 
} 

exports.processado_Alteracao = async function(processado) { 
	try { 
		const obj = await processadoSrv.getProcessado(processado.id_empresa,processado.id_tarefa,processado.codigo,processado.seq);
		if (obj == null) { 
		   throw new erroDB.UserException('Regra de negócio', [{ tabela: 'PROCESSADO', message: `"ALTERAÇÃO" Registro Não Existe Na Base De Dados.!` }]);
		}
	} catch (err) { 
		throw err; 
	}


	return; 
} 

exports.processado_Exclusao = async function(id_empresa,id_tarefa,codigo,seq) { 
	try { 
		const obj = await processadoSrv.getProcessado(id_empresa,id_tarefa,codigo,seq);
		if (obj == null) { 
		   throw new erroDB.UserException('Regra de negócio', [{ tabela: 'PROCESSADO', message: `"EXCLUSÃO" Registro Não Existe Na Base De Dados.!` }]);
		}
	} catch (err) { 
		throw err; 
	}


	return; 
} 

