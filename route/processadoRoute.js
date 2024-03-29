/* ROUTE processados */
const db = require('../infra/database');
const express = require('express');
const router = express.Router(); 
const processadoSrv = require('../service/processadoService');

/* ROTA GETONE processado */
router.get("/api/processado/:id_empresa/:id_tarefa/:codigo",async function(req, res) {try 
	{
		const lsLista = await processadoSrv.getProcessado(req.params.id_empresa,req.params.id_tarefa,req.params.codigo);
		if (lsLista == null) 
		{
			res.status(409).json({ message: 'Processado Não Encontrada.' });
		}
	else
		{
			res.status(200).json(lsLista);
		}
	}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'processado', message: err.message });
		}
	}
})
/* ROTA GETALL processado */
router.get("/api/processados",async function(req, res) {try 
	{
		const lsLista = await processadoSrv.getProcessados();
		if (lsLista.length == 0) 
		{
			res.status(409).json({ message: 'Nehuma Informação Para Esta Consulta.'} );
		}
	else
		{
			res.status(200).json(lsLista);
		}
	}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'processado', message: err.message });
		}
	}
})
/* ROTA INSERT processado */
router.post("/api/processado",async function(req, res) {try 
	{
		const processado = req.body;
		const registro = await processadoSrv.insertProcessado(processado);		if (registro == null)
		{			res.status(409).json({ message: 'Processado Cadastrado!' });
		}
		else
		{
			res.status(200).json(registro);
		}
}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'Processado', message: err.message });
		}
	}
})
/* ROTA UPDATE processado */
router.put("/api/processado",async function(req, res) {try 
	{
		const processado = req.body;
		const registro = await processadoSrv.updateProcessado(processado);		if (registro == null)
		{			res.status(409).json({ message: 'Processado Alterado Com Sucesso!' });
		}
		else
		{
			res.status(200).json(registro);
		}
}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'Processado', message: err.message });
		}
	}
})
/* ROTA DELETE processado */
router.delete("/api/processado/:id_empresa/:id_tarefa/:codigo",async function(req, res) {try 
	{
		await processadoSrv.deleteProcessado(req.params.id_empresa,req.params.id_tarefa,req.params.codigo);		res.status(200).json({ message: 'Processado Excluído Com Sucesso!' });
}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'Processado', message: err.message });
		}
	}
})
/* ROTA CONSULTA POST processados */
router.post("/api/processados",async function(req, res) {/*
	{
		"id_empresa":0, 
		"id_tarefa":0, 
		"codigo":, 
		"pagina":0, 
		"tamPagina":50, 
		"contador":"N", 
		"orderby":"", 
		"sharp":false 
	}
*/
try 
	{
		const params = req.body;
		const lsRegistros = await processadoSrv.getProcessados(params);		if (lsRegistros.length == 0)
		{			res.status(409).json({ message: 'Processado Nenhum Registro Encontrado!' });
		}
		else
		{
			res.status(200).json(lsRegistros);
		}
}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'Processado', message: err.message });
		}
	}
})

module.exports = router;
