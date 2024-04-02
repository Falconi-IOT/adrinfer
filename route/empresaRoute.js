/* ROUTE empresas */
const db = require("../infra/database");
const express = require("express");
const router = express.Router();
const empresaSrv = require("../service/empresaService");
const blingSrv = require("../service/blingService");
const bling = require("../util/bling.js");

/* ROTA GETONE empresa */
router.get("/api/empresa/:id", async function (req, res) {
  try {
    const lsLista = await empresaSrv.getEmpresa(req.params.id);
    if (lsLista == null) {
      res.status(409).json({ message: "Empresa Não Encontrada." });
    } else {
      res.status(200).json(lsLista);
    }
  } catch (err) {
    if (err.name == "MyExceptionDB") {
      res.status(409).json(err);
    } else {
      res
        .status(500)
        .json({ erro: "BAK-END", tabela: "empresa", message: err.message });
    }
  }
});
/* ROTA GETALL empresa */
router.get("/api/empresas", async function (req, res) {
  try {
    const lsLista = await empresaSrv.getEmpresas();
    if (lsLista.length == 0) {
      res
        .status(409)
        .json({ message: "Nehuma Informação Para Esta Consulta." });
    } else {
      res.status(200).json(lsLista);
    }
  } catch (err) {
    if (err.name == "MyExceptionDB") {
      res.status(409).json(err);
    } else {
      res
        .status(500)
        .json({ erro: "BAK-END", tabela: "empresa", message: err.message });
    }
  }
});
/* ROTA INSERT empresa */
router.post("/api/empresa", async function (req, res) {
  try {
    const empresa = req.body;
    const registro = await empresaSrv.insertEmpresa(empresa);
    if (registro == null) {
      res.status(409).json({ message: "Empresa Cadastrado!" });
    } else {
      res.status(200).json(registro);
    }
  } catch (err) {
    if (err.name == "MyExceptionDB") {
      res.status(409).json(err);
    } else {
      res
        .status(500)
        .json({ erro: "BAK-END", tabela: "Empresa", message: err.message });
    }
  }
});
/* ROTA UPDATE empresa */
router.put("/api/empresa", async function (req, res) {
  try {
    const empresa = req.body;
    const registro = await empresaSrv.updateEmpresa(empresa);
    if (registro == null) {
      res.status(409).json({ message: "Empresa Alterado Com Sucesso!" });
    } else {
      res.status(200).json(registro);
    }
  } catch (err) {
    if (err.name == "MyExceptionDB") {
      res.status(409).json(err);
    } else {
      res
        .status(500)
        .json({ erro: "BAK-END", tabela: "Empresa", message: err.message });
    }
  }
});
/* ROTA COMPLEMENTA empresa */
router.get("/api/complementaempresa/:id_empresa", async function (req, res) {
  try {
    const id_empresa = req.params.id_empresa;

    const response = await empresaSrv.ComplementarEmpresa(id_empresa);

    if (response.deposito <= 0 && response.categoria <= 0) {
      res
        .status(409)
        .json({ message: "Não Foi Possivel Complementar A Empresa!" });
    } else {
      res.status(200).json({
        message: "Empresa Complementada Com Depósito e Categoria!",
        response,
      });
    }
  } catch (error) {
    if (error.response) {
      res.status(409).json(error.response.data);
    } else {
      if (error.name == "MyExceptionDB") {
        res.status(409).json(error);
      } else {
        res
          .status(500)
          .json({ erro: "BAK-END", tabela: "Empresa", message: error.message });
      }
    }
  }
});

/* ROTA DELETE empresa */
router.delete("/api/empresa/:id", async function (req, res) {
  try {
    await empresaSrv.deleteEmpresa(req.params.id);
    res.status(200).json({ message: "Empresa Excluído Com Sucesso!" });
  } catch (err) {
    if (err.name == "MyExceptionDB") {
      res.status(409).json(err);
    } else {
      res
        .status(500)
        .json({ erro: "BAK-END", tabela: "Empresa", message: err.message });
    }
  }
});
/* ROTA CONSULTA POST empresas */
router.post("/api/empresas", async function (req, res) {
  /*
                	{
                		"id":0, 
                		"razao":"", 
                		"cnpj_cpf":"", 
                		"ativo":"", 
                		"cliente_id":"", 
                		"pagina":0, 
                		"tamPagina":50, 
                		"contador":"N", 
                		"orderby":"", 
                		"sharp":false 
                	}
                */
  try {
    const params = req.body;
    const lsRegistros = await empresaSrv.getEmpresas(params);
    if (lsRegistros.length == 0) {
      res.status(409).json({ message: "Empresa Nenhum Registro Encontrado!" });
    } else {
      res.status(200).json(lsRegistros);
    }
  } catch (err) {
    if (err.name == "MyExceptionDB") {
      res.status(409).json(err);
    } else {
      res
        .status(500)
        .json({ erro: "BAK-END", tabela: "Empresa", message: err.message });
    }
  }
});

router.get("/api/setagendamentoempresa/:id_empresa", async function (req, res) {
  try {
    const id_empresa = req.params.id_empresa;
    const retorno = await blingSrv.setAgendamentoEmpresa(id_empresa, true);
    res.status(200).json({ message: "Agendamento Iniciado" });
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      res.status(200).json({ message: error.response.data });
    } else {
      if (error.name == "MyExceptionDB") {
        res.status(409).json(error);
      } else {
        res.status(500).json({
          erro: "BAK-END",
          tabela: "SINCRONIZAÇÃO",
          message: error.message,
        });
      }
    }
  }
});

router.get("/api/stopagendamento/:id_empresa", async function (req, res) {
  try {
    const id_empresa = req.params.id_empresa;
    const retorno = await blingSrv.stopAgendamentoEmpresa(id_empresa);
    res.status(200).json({ message: "Agendamento parado" });
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      res.status(200).json({ message: error.response.data });
    } else {
      if (error.name == "MyExceptionDB") {
        res.status(409).json(error);
      } else {
        res.status(500).json({
          erro: "BAK-END",
          tabela: "SINCRONIZAÇÃO",
          message: error.message,
        });
      }
    }
  }
});

module.exports = router;
