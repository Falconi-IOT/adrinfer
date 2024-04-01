const express = require("express");
const empresaSrv = require("../service/empresaService");
const axios = require("axios");
const blingSrv = require("../service/blingService.js");
const getCredentials = require("../util/credentials.js");
const variaveis = require("../global/variaveis");
const processados = require("../global/processados");
const qs = require("querystring");
const router = express.Router();

process.env.TZ = "America/Araguaina";

const convertSeconds = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hourString = hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
  const minuteString =
    minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "";
  const secondString =
    remainingSeconds > 0
      ? `${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`
      : "";

  if (hours > 0) {
    return `${hourString} : ${minuteString || "0 minute"} ${
      secondString && `: ${secondString}`
    }`;
  } else if (!hours && minutes > 0) {
    return `${minuteString} ${secondString && `: ${secondString}`}`;
  }

  return `${secondString} Segundos`;
};

router.get("/api/bling/recebercode/:id_empresa", async function (req, res) {
  let empresa = {};

  const id_empresa = req.params.id_empresa;

  console.log(
    `ENTREI Na recebercode ==> ${id_empresa} code: "${req.query.code}`
  );

  if (req.query.code) {
    try {
      try {
        emp = await empresaSrv.getEmpresa(id_empresa);

        emp.code = req.query.code.trim();
      } catch (error) {
        throw error;
      }
      console.log("Emp.: ", emp);
      try {
        const token = await blingSrv.getToken(emp);

        console.log("token", token);

        emp.access_token = token.access_token;

        emp.access_token_validade = token.expires_in;

        emp.access_token_date = new Date().toLocaleString("pt-BR");

        emp.refresh_token = token.refresh_token;

        const empAlterada = await empresaSrv.updateEmpresa(emp);

        console.log(empAlterada);

        res.status(200).json(req.query.code);
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
              tabela: "Empresa",
              message: error.message,
            });
          }
        }
      }
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
            tabela: "Empresa",
            message: error.message,
          });
        }
      }
    }
  } else {
    res.status(200).json({ message: "Não Recebi O Código!" });
  }
});

router.get("/api/bling/token", async function (req, response) {
  try {
    const retorno = await blingSrv.getToken();

    response.status(200).json(retorno);
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      response.status(200).json({ message: error.response.status });
    }
  }
});

router.get("/api/bling/refreshtoken", async function (req, response) {
  try {
    const retorno = await blingSrv.getRefreshToken(emp);

    response.status(200).json(retorno);
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      response.status(200).json({ message: error.response.status });
    }
  }
});

router.get("/api/bling/getcode", function (req, response) {
  const options = {
    url: "https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=ad4ef071ff95286ac58508d99f21c195266fab6a&state=122a1900f33fa161a1d9e3f8da605937",
    headers: {
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      Accept: "*/*",
    },
    method: "get",
  };

  axios
    .get(options)
    .then(function (res) {
      response.status(200).json({ message: "Code Solicitado !" });
    })
    .catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        response.status(200).json({ message: error.response.status });
      }
    });
});

router.get("/api/bling/getprodutos/:id_produto", function (req, response) {
  console.log(lixo);
  const options = {
    url: `https://www.bling.com.br/Api/v3/produtos/${req.params.id_produto}`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${variaveis.getAcessToken()}}`,
    },
  };

  axios(options)
    .then(function (res) {
      const retorno = res.data.data;
      response.status(200).json(retorno);
    })
    .catch(function (err) {
      console.log("error = " + err);
      const retorno = { message: err.message };
      response.status(200).json(retorno);
    });
});

router.get("/api/bling/getprodutos", function (req, response) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/produtos`,
    method: "get",
    params: {
      idCategoria: 9260994,
    },
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${variaveis.getAcessToken()}`,
    },
  };

  axios(options)
    .then(function (res) {
      const retorno = res.data.data;
      response.status(200).json(retorno);
    })
    .catch(function (err) {
      console.log("error = " + err);
      const retorno = { message: err.message };
      response.status(200).json(retorno);
    });
});

router.get("/api/bling/getsaldos", function (req, response) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/estoques/saldos/14887604950`,
    method: "get",
    params: { idsProdutos: [16226515369, 16225647233] },
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${variaveis.getAcessToken()}`,
    },
  };

  axios(options)
    .then(function (res) {
      const retorno = res.data.data;
      response.status(200).json(retorno);
    })
    .catch(function (err) {
      console.log("error = " + err);
      const retorno = { message: err.message };
      response.status(200).json(retorno);
    });
});

router.get(
  "/api/bling/getprodutofullbyid/:id_produto",
  async function (req, resp) {
    try {
      const lista = await blingSrv.getProdutoFullById(req.params.id_produto);

      resp.status(200).json(lista);
    } catch (err) {
      resp.status(200).json({ message: "DEU ERRO ", err });
    }
  }
);

/*
router.get("/api/bling/getprodutoSimplebyids", async function (req, resp) {
  const id_produtos = [];
  const id_Categoria = 9260994;
  try {
    const lista = await blingSrv.getProdutoSimpleByIds(
      id_produtos,
      id_Categoria
    );
    resp.status(200).json(lista);
  } catch (err) {
    resp.status(200).json({ message: "DEU ERRO ", err });
  }
});
*/
router.get("/api/bling/getprocessados/:id_empresa", async function (req, res) {
  if (processados.getProcessados.length == 0) {
    res.status(200).json({
      message:
        "Não Tenho Nenhum Registro De Processamento De Saldo Na Memória!",
    });
  } else {
    res.status(200).json(processados.getProcessados());
  }
});

router.get("/api/bling/sincronizarsaldo", async function (req, res) {
  try {
    const inicio = new Date();
    response = await blingSrv.sincronizacao(1);
    const final = new Date();
    const tempo = final.getTime() - inicio.getTime();
    const segundos = tempo / 1000; // em segundos
    console.log(
      "inicio",
      inicio,
      "final",
      final,
      "tempo",
      tempo,
      "Tempo Gasto em segundos: ",
      segundos,
      "hora: ",
      convertSeconds(segundos)
    );
    res.status(200).json(response);
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

router.get("/api/bling/getcategorias", async function (req, res) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/categorias/produtos`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${variaveis.getAcessToken()}`,
    },
  };

  try {
    const categorias = await blingSrv.getCategorias();

    res.status(200).json(categorias);
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      res.status(200).json(error.response.data);
    } else {
      if (err.name == "MyExceptionDB") {
        res.status(409).json(err);
      } else {
        res
          .status(500)
          .json({ erro: "BAK-END", tabela: "empresa", message: err.message });
      }
    }
  }
});

router.get("/api/bling/getdepositos", async function (req, res) {
  const options = {
    url: `https://www.bling.com.br/Api/v3/depositos`,
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${variaveis.getAcessToken()}`,
    },
  };

  try {
    const depositos = await blingSrv.getDepositos();

    res.status(200).json(depositos);
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      res.status(200).json(error.response.data);
    } else {
      if (err.name == "MyExceptionDB") {
        res.status(409).json(err);
      } else {
        res
          .status(500)
          .json({ erro: "BAK-END", tabela: "empresa", message: err.message });
      }
    }
  }
});

router.get("/api/bling/produtosallpage", async function (req, res) {
  try {
    console.log("produtosallpage");
    response = await blingSrv.getProdutoSimplesAllPages(1);
    for (const [index, dado] of response.entries()) {
      console.log(index, dado.codigo, dado.descricao);
    }
    res.status(200).json(response);
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
