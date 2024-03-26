/* ROUTE usuarios */
const db = require('../infra/database');
const express = require('express');
const router = express.Router(); 
const usuarioSrv = require('../service/usuarioService');

/* ROTA GETONE usuario */
router.get("/api/usuario/:id_empresa/:id",async function(req, res) {try 
	{
		const lsLista = await usuarioSrv.getUsuario(req.params.id_empresa,req.params.id);
		if (lsLista == null) 
		{
			res.status(409).json({ message: 'Usuario Não Encontrada.' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'usuario', message: err.message });
		}
	}
})
/* ROTA GETALL usuario */
router.get("/api/usuarios",async function(req, res) {try 
	{
		const lsLista = await usuarioSrv.getUsuarios();
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'usuario', message: err.message });
		}
	}
})
/* ROTA INSERT usuario */
router.post("/api/usuario",async function(req, res) {try 
	{
		const usuario = req.body;
		const registro = await usuarioSrv.insertUsuario(usuario);		if (registro == null)
		{			res.status(409).json({ message: 'Usuario Cadastrado!' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'Usuario', message: err.message });
		}
	}
})
/* ROTA UPDATE usuario */
router.put("/api/usuario",async function(req, res) {try 
	{
		const usuario = req.body;
		const registro = await usuarioSrv.updateUsuario(usuario);		if (registro == null)
		{			res.status(409).json({ message: 'Usuario Alterado Com Sucesso!' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'Usuario', message: err.message });
		}
	}
})
/* ROTA DELETE usuario */
router.delete("/api/usuario/:id_empresa/:id",async function(req, res) {try 
	{
		await usuarioSrv.deleteUsuario(req.params.id_empresa,req.params.id);		res.status(200).json({ message: 'Usuario Excluído Com Sucesso!' });
}
catch (err)
	{
		if(err.name == 'MyExceptionDB')
		{
			res.status(409).json(err);
		}
		else
		{
			res.status(500).json({ erro: 'BAK-END', tabela: 'Usuario', message: err.message });
		}
	}
})
/* ROTA CONSULTA POST usuarios */
router.post("/api/usuarios",async function(req, res) {/*
	{
		"id_empresa":0, 
		"id":0, 
		"razao":"", 
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
		const lsRegistros = await usuarioSrv.getUsuarios(params);		if (lsRegistros.length == 0)
		{			res.status(409).json({ message: 'Usuario Nenhum Registro Encontrado!' });
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
			res.status(500).json({ erro: 'BAK-END', tabela: 'Usuario', message: err.message });
		}
	}
})

module.exports = router;
