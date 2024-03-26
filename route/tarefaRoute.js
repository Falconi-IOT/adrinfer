/* ROUTE tarefas */
const db = require('../infra/database');
const express = require('express');
const router = express.Router(); 
const tarefaSrv = require('../service/tarefaService');

/* ROTA GETONE tarefa */
router.get("/api/tarefa/:id_empresa/:id",async function(req, res) {try 
	{
		const lsLista = await tarefaSrv.getTarefa(req.params.id_empresa,req.params.id);
		if (lsLista == null) 
		{
			res.status(409).json({ message: 'Tarefa Não Encontrada.' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'tarefa', message: err.message });
		}
	}
})
/* ROTA GETALL tarefa */
router.get("/api/tarefas",async function(req, res) {try 
	{
		const lsLista = await tarefaSrv.getTarefas();
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'tarefa', message: err.message });
		}
	}
})
/* ROTA INSERT tarefa */
router.post("/api/tarefa",async function(req, res) {try 
	{
		const tarefa = req.body;
		const registro = await tarefaSrv.insertTarefa(tarefa);		if (registro == null)
		{			res.status(409).json({ message: 'Tarefa Cadastrado!' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'Tarefa', message: err.message });
		}
	}
})
/* ROTA UPDATE tarefa */
router.put("/api/tarefa",async function(req, res) {try 
	{
		const tarefa = req.body;
		const registro = await tarefaSrv.updateTarefa(tarefa);		if (registro == null)
		{			res.status(409).json({ message: 'Tarefa Alterado Com Sucesso!' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'Tarefa', message: err.message });
		}
	}
})
/* ROTA DELETE tarefa */
router.delete("/api/tarefa/:id_empresa/:id",async function(req, res) {try 
	{
		await tarefaSrv.deleteTarefa(req.params.id_empresa,req.params.id);		res.status(200).json({ message: 'Tarefa Excluído Com Sucesso!' });
}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'Tarefa', message: err.message });
		}
	}
})
/* ROTA CONSULTA POST tarefas */
router.post("/api/tarefas",async function(req, res) {/*
	{
		"id_empresa":0, 
		"id":0, 
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
		const lsRegistros = await tarefaSrv.getTarefas(params);		if (lsRegistros.length == 0)
		{			res.status(409).json({ message: 'Tarefa Nenhum Registro Encontrado!' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'Tarefa', message: err.message });
		}
	}
})

module.exports = router;
