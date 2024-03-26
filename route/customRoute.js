const db = require('../infra/database');
const express = require('express');
const router = express.Router();
const empresaSrv = require('../service/empresaService');


router.post("/api/empresa_complemento/id_empresa", async function(req, res) {
    try {
        const param = {
            "id": 0,
            "razao": "",
            "cnpj_cpf": "",
            "ativo": "",
            "cliente_id": "",
            "pagina": 0,
            "tamPagina": 50,
            "contador": "N",
            "orderby": "",
            "sharp": false
        }

    } catch (err) {
        if (err.name == 'MyExceptionDB') {
            res.status(409).json(err);
        } else {
            res.status(500).json({ erro: 'BAK-END', tabela: 'Empresa', message: err.message });
        }
    }
})