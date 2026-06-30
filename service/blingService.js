const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const https = require("https");
const agendas = require("../global/agendas.js");
const bling = require("../util/bling.js");
const credentials = require("../util/credentials.js");
const empresaSrv = require("../service/empresaService");
const tarefaSrv = require("../service/tarefaService.js");
const processadoSrv = require("../service/processadoService");
const processados = require("../global/processados");
const chgSrv = require("../service/chgService.js");
const shared = require("../util/shared.js");
const qs = require("querystring");
const pLimit = require("p-limit").default;
const limitAjuste = pLimit(2); // 2 workers simultâneos

const iguais = (a, b) => Number(a) === Number(b);

function getBrazilDateTime() {
    const now = new Date();
    const offsetMs = now.getTime() - (3 * 60 * 60 * 1000); // UTC-3
    const br = new Date(offsetMs);
    return br.toISOString().substring(0, 19); // remove o Z
}





function getDataFullCHG() {
    const d = new Date();
    d.setDate(d.getDate() - 1); // dia anterior
    d.setHours(0, 0, 0, 0);     // 00:00:00
    lastDate = d.toISOString().substring(0, 10);
    return lastDate;    // formato aceito pela CHG
}



// === Função auxiliar: FULL ou INCREMENTAL ===
function getNextChgDateRef(emp) {
    const nowBR = getBrazilDateTime();
    const today = nowBR.substring(0, 10);
    const ontem = getDataFullCHG();

    // Nunca sincronizou → FULL LOAD
    if (!emp.chg_last_sync_datetime) {
        return { mode: "FULL", dateref: `${ontem}T00:00:00` };
    }

    const lastDay = emp.chg_last_sync_datetime.substring(0, 10);

    // Mudou o dia → FULL LOAD
    if (lastDay !== today) {
        return { mode: "FULL", dateref: `${ontem}T00:00:00` };
    }

    // Mesmo dia → INCREMENTAL
    return { mode: "INC", dateref: emp.chg_last_sync_datetime };
}


// === Função para buscar todas as páginas ===
async function getChgFullList(emp, dateref) {
    let pagina = 1;
    let listaFinal = [];

    while (true) {
        const url = `https://loja.chg.com.br/api/catalogo/userest?key=${emp.key_chg}&filial=CPS&pagina=${pagina}&dateref=${dateref}&preco=1`;
        
        try {
            const resp = await axios.get(url, { timeout: 30000 });

            const lista = resp.data.data.resultado;

            if (!lista || lista.length === 0) break;

            listaFinal.push(...lista);

            console.log("Pagina..:",pagina);

            pagina++;

        } catch (err) {
            console.log("Erro CHG página", pagina, err.code || err.message);

            // Timeout/reset → considerar fim das páginas
            if (["ECONNRESET", "ETIMEDOUT", "ECONNABORTED"].includes(err.code)) {
                break;
            }

            throw err;
        }
    }

    return listaFinal;
}

exports.sincronizaCHG = async function (emp) {

    console.log("=== INICIANDO SINCRONIZAÇÃO CHG ===");

    // 1. FULL ou INCREMENTAL?
    let { mode, dateref } = getNextChgDateRef(emp);
    console.log("Modo:", mode, "dateref:", dateref);

    // 2. Buscar lista da CHG
    let lista = await getChgFullList(emp, dateref);

    // 3. Incremental vazio → FULL LOAD obrigatório
    if (mode === "INC" && lista.length === 0) {
        console.log("Incremental vazio → FULL LOAD");

        const ontem = getDataFullCHG();
        const fullDate = `${ontem}T00:00:00`;

        lista = await getChgFullList(emp, fullDate);
        mode = "FULL";
    }

    // 4. Persistir no banco
    if (mode === "FULL") {
        console.log("Salvando FULL LOAD CHG...");
        await chgSrv.salvarListaCompleta(emp.id, lista);
    } else {
        console.log("Aplicando INCREMENTAL CHG...");
        for (const item of lista) {
            await chgSrv.atualizarProduto(emp.id, item.codigo, item);
        }
    }

    // 5. Atualizar última sincronização
    emp.chg_last_sync_datetime = getBrazilDateTime();
    await empresaSrv.updateEmpresa(emp);

    console.log("CHG sincronizado com sucesso.");

    // 6. Retornar lista atualizada
    return lista;
};




// Axios dedicado para o Bling
const axiosBling = axios.create({
    httpsAgent: new https.Agent({ keepAlive: true }),
    timeout: 30000,
});


axiosRetry(axiosBling, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return (
            error.code === "ECONNRESET" ||
            error.code === "ETIMEDOUT" ||
            error.code === "ECONNABORTED" ||   // <=== FALTAVA ESSE
            axiosRetry.isNetworkError(error) ||
            axiosRetry.isRetryableError(error)
        );
    },
});




process.env.TZ = "America/Araguaina";


const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const convertSegToHorario = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const hourString = `${shared.adicionaZero(hours)}`;
    const minuteString = `${shared.adicionaZero(minutes)}`;
    const secondString = `${shared.adicionaZero(remainingSeconds | 0)}`; // trunca as decimais

    return `${hourString}:${minuteString}:${secondString}`;
};


exports.getToken = async function(emp) {
    const data = {
        grant_type: "authorization_code",
        code: emp.code,
        redirect_uri: "http://localhost:3000/api/bling/recebercode/1",
    };

    const options = {
        url: "https://www.bling.com.br/Api/v3/oauth/token",
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials.getCredentialsBase64(emp)}`,
            Accept: "application/json",
            "enable-jwt": 1  
        },
        data: qs.stringify(data),
    };

    const retorno = await axios(options);
    console.log("retorno getToken:", retorno.data);
    return retorno.data;
};

exports.getRefreshToken = async function(emp) {
    const data = {
        grant_type: "refresh_token",
        refresh_token: emp.refresh_token.trim(),
    };

    const options = {
        url: "https://api.bling.com.br/Api/v3/oauth/token",
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials.getCredentialsBase64(emp)}`,
            Accept: "application/json",
            "enable-jwt": 1  
        },
        data: qs.stringify(data),
    };

    try {
        const response = await axios(options);
        const retorno = response.data;
        console.log("retorno refreshcode", retorno);
        return retorno;
    } catch (err) {
        throw err;
    }
};

exports.getProdutoFullById = async function(emp, id_produto) {
    const options = {
        url: `https://api.bling.com.br/Api/v3/produtos/${id_produto}`,
        method: "get",
        httpsAgent: agent,
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${emp.access_token.trim()}`,
             "enable-jwt": 1 
        },
    };

    try {
        response = await axios(options);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

exports.getProdutoFullByCodigo = async function(id_produto) {
    let lista = {};

    ////console.log(`params: ${id_produto}`)

    const options = {
        url: `https://api.bling.com.br/Api/v3/produtos/${id_produto}`,
        method: "get",
        httpsAgent: agent,
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${emp.access_token.trim()}`,
             "enable-jwt": 1 
        },
    };

    response = await axios(options);

    return response.data.data;
};

exports.getProdutoSimpleByIds = async function(id_produtos, emp, pagina) {
    let page = 1;

    if (typeof pagina == "undefined") {
        page = 1;
    } else {
        page = pagina;
    }

    const options = {
        url: `https://api.bling.com.br/Api/v3/produtos`,
        method: "get",
        httpsAgent: agent,
        params: {
            pagina: page,
            limite: 100,
            idProdutos: id_produtos,
            idCategoria: emp.id_categoria,
        },
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${emp.access_token.trim()}`,
            "enable-jwt": 1 
        },
    };

    response = await axios(options);

    return response.data.data;
};

exports.postAjustaSaldo = async function(
    id_deposito,
    id_produto,
    qtd,
    preco,
    histo,
    emp,
) {
    try {
        const response = await axiosBling.post(
            "https://api.bling.com.br/Api/v3/estoques", {
                deposito: { id: id_deposito },
                operacao: "B",
                produto: { id: id_produto },
                quantidade: qtd,
                observacoes: histo,
            }, {
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${emp.access_token.trim()}`,
                    "enable-jwt": 1 
                },
            },
        );

        return response.data.data;
    } catch (error) {
        const erroApi = error.response?.data || error.message;
        console.log("Erro postAjustaSaldo:", erroApi);
        throw error;
    }
};


exports.getSaldos = async function(produtos, emp) {
    if (!Array.isArray(produtos) || produtos.length === 0) {
        console.log("getSaldos - Nenhum produto informado, retornando vazio");
        return [];
    }

    try {
        const response = await axiosBling.get(
            `https://api.bling.com.br/Api/v3/estoques/saldos/${emp.id_deposito.trim()}`, {
                params: { idsProdutos: produtos },
                paramsSerializer: (params) =>
                    params.idsProdutos.map((id) => `idsProdutos[]=${id}`).join("&"),
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${emp.access_token.trim()}`,
                    "enable-jwt": 1 
                },
            }
        );

        return response.data.data;

    } catch (err) {
        const erroApi = err.response?.data || err.message;
        console.log("Erro getSaldos:", erroApi);
        throw err;
    }
};

exports.getListaWork = async function(emp, page) {
    let workList = [];

    const idProdutos = [];

    try {
        let lista = await this.getProdutoSimpleByIds(idProdutos, emp, page);
        if (lista.length == 0) {
            return workList;
        } else {
            lista.forEach(async(bling) => {
                workList.push({
                    id: bling.id,
                    nome: bling.nome,
                    codigo: bling.codigo == "" ? bling.id : bling.codigo,
                    preco: bling.preco,
                    id_deposito: emp.id_deposito,
                    saldo_bling: 0,
                    saldo_chg: 0,
                    sem_codigo: bling.codigo == "" ? "S" : "N",
                });
            });
            return workList;
        }
    } catch (err) {
        throw err;
    }
};

exports.getCategorias = async function(emp) {
    const options = {
        url: `https://api.bling.com.br/Api/v3/categorias/produtos`,
        method: "get",
        httpsAgent: agent,
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${emp.access_token.trim()}`,
            "enable-jwt": 1 
        },
    };

    try {
        const categorias = await axios(options);

        return categorias.data.data;
    } catch (err) {
        throw err;
    }
};

exports.getDepositos = async function(emp) {
    const options = {
        url: `https://api.bling.com.br/Api/v3/depositos`,
        method: "get",
        httpsAgent: agent,
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${emp.access_token.trim()}`,
            "enable-jwt": 1 
        },
    };

    try {
        const depositos = await axios(options);

        return depositos.data.data;
    } catch (error) {
        throw error;
    }

    return depositos;
};


exports.sincronizacaov2 = async function(id_empresa) {
    const inicio = new Date();
    let page = 0;
    let produtosBling = [];



    // ============================
    // 1. Buscar empresa e criar tarefa
    // ============================
    let emp = await empresaSrv.getEmpresa(id_empresa);


    let tarefa = await tarefaSrv.insertTarefa({
        id_empresa: emp.id,
        id: 0,
        id_usuario: 99,
        descricao: "Iniciando Processamento...Aguarde!",
        tempo: "",
        inicial: new Date().toLocaleString("pt-BR"),
        final: new Date().toLocaleString("pt-BR"),
        qtd_total: 0,
        qtd_erro: 0,
        status: 0,
        descricao_erro: "",
        user_insert: 99,
        user_update: 0,
    });

    // ============================
    // 2. Validar token do Bling
    // ============================

    const validade = shared.ValidarToken(emp);

    if (validade.minutos_restantes <= 60) {
        emp = await bling.getAtualizaToken(emp);
    } 

    // ============================
    // 3. Loop de páginas do Bling
    // ============================
    console.log("BUSCAR LISTWORK");

    while (true) {
        page++;
        
        await sleep(350);

        const listaWork = await this.getListaWorkTamPage(emp, page, 100);
        if (listaWork.length === 0) break;

        console.log(`Página ${page} - ${listaWork.length} produtos`);
        tarefa.qtd_total += listaWork.length;
        produtosBling.push(...listaWork);

        // ============================
        // 4. Preparar IDs e códigos
        // ============================
        const idsProdutos = [];
        const codigoProdutos = [];

        listaWork.forEach((produto) => {
            if (produto.sem_codigo === "S") {
                console.log("Produto sem código:", produto.id, produto.codigo);
            } else {
                idsProdutos.push(produto.id);
                codigoProdutos.push({ codigo: produto.codigo });
            }
        });

        // ============================
        // 5. Buscar saldos do Bling
        // ============================
        const saldosBling = await this.getSaldos(idsProdutos, emp);

        // ============================
        // 6. Buscar saldos da CHG (workers)
        // ============================
        console.log("BUSCAR SALDOS CHG...");
        const saldosCHG = await chgSrv.getProdutoByCodigoArray(emp, codigoProdutos);

        // ============================
        // 7. Mesclar saldos Bling + CHG
        // ============================
        listaWork.forEach((item) => {
            if (item.sem_codigo === "N") {
                const bling = saldosBling.find((x) => x.produto.id === item.id);
                item.saldo_bling = bling?.saldoFisicoTotal ? bling?.saldoFisicoTotal : 0;

                const chg = saldosCHG.find((x) => x.codigo === item.codigo);
                item.saldo_chg = chg ? (chg.estoque > 3 ? chg.estoque : 0) : -999999;
            }
        });

        // ============================
        // 8. Ajustar saldos no Bling (workers)
        // ============================
        console.log("Ajustando saldos do Bling...");

        await Promise.all(
            listaWork.map((dado) =>
                limitAjuste(async() => {
                    if (dado.sem_codigo === "N" && !iguais(dado.saldo_bling, dado.saldo_chg)) {
                        const processado = {
                            id_empresa: emp.id,
                            id_tarefa: tarefa.id,
                            codigo: dado.codigo,
                            seq: 0,
                            descricao: dado.nome,
                            saldo_bling: dado.saldo_bling,
                            saldo_chg: dado.saldo_chg,
                            ocorrencia: "",
                            user_insert: 99,
                            user_update: 0,
                        };

                        // Produto não encontrado na CHG
                        if (dado.saldo_chg === -999999) {
                            processado.ocorrencia = "Produto Não Encontrado Na CHG";
                            tarefa.qtd_erro++;
                            await processadoSrv.insertProcessado(processado);
                            return;
                        }

                        // Ajustar saldo no Bling
                        try {
                            await this.postAjustaSaldo(
                                dado.id_deposito,
                                dado.id,
                                dado.saldo_chg,
                                dado.preco,
                                "AJUSTE AUTOMÁTICO CHG",
                                emp,
                            );

                            processado.ocorrencia = `Saldo Alterado Para ${dado.saldo_chg}.`;
                            await processadoSrv.insertProcessado(processado);
                        } catch (err) {
                            processado.ocorrencia = "Falha Na Atualização Do Saldo No Bling!";
                            await processadoSrv.insertProcessado(processado);
                        }
                    } else 
                        if (dado.sem_codigo === "N")
                            {
                                // Saldo igual → registrar
                                await processadoSrv.insertProcessado({
                                    id_empresa: emp.id,
                                    id_tarefa: tarefa.id,
                                    codigo: dado.codigo,
                                    seq: 0,
                                    descricao: dado.nome,
                                    saldo_bling: dado.saldo_bling,
                                    saldo_chg: dado.saldo_chg,
                                    ocorrencia: "Saldo NÃO ALTERADO! Saldos Iguais",
                                    user_insert: 99,
                                    user_update: 0,
                                });
                            }
                        else {
                             await processadoSrv.insertProcessado({
                                    id_empresa: emp.id,
                                    id_tarefa: tarefa.id,
                                    codigo: dado.codigo,
                                    seq: 0,
                                    descricao: dado.nome,
                                    saldo_bling: dado.saldo_bling,
                                    saldo_chg: dado.saldo_chg,
                                    ocorrencia: "Saldo NÃO ALTERADO! Produto Sem Código",
                                    user_insert: 99,
                                    user_update: 0,
                                });
                        }
                }),
            ),
        );

        tarefa.final = new Date().toLocaleString("pt-BR");
    }

    // ============================
    // 9. Finalizar tarefa
    // ============================
    const final = new Date();
    const tempo = (final.getTime() - inicio.getTime()) / 1000;

    tarefa.tempo = convertSegToHorario(tempo);
    tarefa.final = final.toLocaleString("pt-BR");
    tarefa.descricao = "Processamento Finalizado";
    await tarefaSrv.updateTarefa(tarefa);

    return { message: "Processamento Finalizado" , tempo: tarefa.tempo};
};

exports.sincronizacaov3 = async function(id_empresa) {
    const inicio = new Date();
    let page = 0;
    let produtosBling = [];

    // 1. Buscar empresa
    let emp = await empresaSrv.getEmpresa(id_empresa);

    // 2. Criar tarefa
    let tarefa = await tarefaSrv.insertTarefa({
        id_empresa: emp.id,
        id: 0,
        id_usuario: 99,
        descricao: "Iniciando Processamento...Aguarde!",
        tempo: "",
        inicial: new Date().toLocaleString("pt-BR"),
        final: new Date().toLocaleString("pt-BR"),
        qtd_total: 0,
        qtd_erro: 0,
        status: 0,
        descricao_erro: "",
        user_insert: 99,
        user_update: 0,
    });

    // 3. Validar token do Bling
    const validade = shared.ValidarToken(emp);
    if (validade.minutos_restantes <= 60) {
        emp = await bling.getAtualizaToken(emp);
    }

    // 4. Sincronizar CHG (FULL/INC)
    console.log("SINCRONIZANDO CHG...");
    await exports.sincronizaCHG(emp); // usa a versão nova que já fizemos


    // 5. Carregar tabela CHG do banco
    console.log("CARREGANDO LISTA CHG DO BANCO...");
    const listaCHG = await chgSrv.getListaCompleta(emp.id);


    // 6. Loop de páginas do Bling
    console.log("BUSCAR LISTWORK");

    while (true) {
        page++;
        await sleep(350);

        const listaWork = await this.getListaWorkTamPage(emp, page, 100);


        if (listaWork.length === 0 ) break;

        console.log(`Página ${page} - ${listaWork.length} produtos`);
        tarefa.qtd_total += listaWork.length;
        produtosBling.push(...listaWork);

        // 7. Buscar saldos do Bling
        const idsProdutos = listaWork.filter(p => p.sem_codigo === "N").map(p => p.id);
        const saldosBling = await this.getSaldos(idsProdutos, emp);
         
        // 8. Mesclar Bling + CHG (AGORA DO BANCO)
        listaWork.forEach((item) => {
        if (item.sem_codigo === "N") {

            const bling = saldosBling.find((x) => x?.produto?.id === item.id);

            item.saldo_bling = bling?.saldoFisicoTotal ?? 0;
            
            const chg = listaCHG.find((x) => x.codigo === item.codigo);
                
            item.saldo_chg = chg ? (chg.estoque > 3 ? chg.estoque : 0) : -999999;  
          }
        });

        

        // 9. Ajustar saldos no Bling
        console.log("Ajustando saldos do Bling...");

        await Promise.all(
            listaWork.map((dado) =>
                limitAjuste(async () => {
                    const processado = {
                        id_empresa: emp.id,
                        id_tarefa: tarefa.id,
                        codigo: dado.codigo,
                        seq: 0,
                        descricao: dado.nome,
                        saldo_bling: dado.saldo_bling,
                        saldo_chg: dado.saldo_chg,
                        ocorrencia: "",
                        user_insert: 99,
                        user_update: 0,
                    };

                    if (dado.sem_codigo === "S") {
                        processado.ocorrencia = "Produto Sem Código";
                        await processadoSrv.insertProcessado(processado);
                        return;
                    }

                    if (dado.saldo_chg === -999999) {
                        processado.ocorrencia = "Produto Não Encontrado Na CHG";
                        tarefa.qtd_erro++;
                        await processadoSrv.insertProcessado(processado);
                        return;
                    }

                    if (iguais(dado.saldo_bling, dado.saldo_chg)) {
                        processado.ocorrencia = "Saldo NÃO ALTERADO! Saldos Iguais";
                        await processadoSrv.insertProcessado(processado);
                        return;
                    }
                    console.log(`ajustando ${dado.codigo}`);
                    try {
                        await this.postAjustaSaldo(
                            dado.id_deposito,
                            dado.id,
                            dado.saldo_chg,
                            dado.preco,
                            "AJUSTE AUTOMÁTICO CHG",
                            emp,
                        );

                        processado.ocorrencia = `Saldo Alterado Para ${dado.saldo_chg}.`;
                        await processadoSrv.insertProcessado(processado);

                    } catch (err) {
                        processado.ocorrencia = "Falha Na Atualização Do Saldo No Bling!";
                        await processadoSrv.insertProcessado(processado);
                    }
                })
            )
        );

        tarefa.final = new Date().toLocaleString("pt-BR");

    }

    // 10. Finalizar tarefa
    const final = new Date();
    const tempo = (final.getTime() - inicio.getTime()) / 1000;

    tarefa.tempo = convertSegToHorario(tempo);
    tarefa.final = final.toLocaleString("pt-BR");
    tarefa.descricao = "Processamento Finalizado";
    await tarefaSrv.updateTarefa(tarefa);

    return { message: "Processamento Finalizado", tempo: tarefa.tempo };
};


exports.getProdutoSimplesAllPages = async function(id_empresa) {
    let lista = [];
    let emp = {};
    let page = 1;
    let lastId = 0;

    const id_produtos = [];

    try {
        emp = await empresaSrv.getEmpresa(id_empresa);
    } catch (error) {
        throw error;
    }

    console.log(emp);

    try {
        while (page > 0) {
            const options = {
                url: `https://api.bling.com.br/Api/v3/produtos`,
                method: "get",
                httpsAgent: agent,
                params: {
                    pagina: page,
                    limite: 50,
                    idProdutos: id_produtos,
                    idCategoria: emp.id_categoria,
                },
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${emp.access_token.trim()}`,
                    "enable-jwt": 1 
                },
            };

            const response = await axios(options);

            if (response.data.data.length == 0) {
                page = -1;
                continue;
            }

            let produtos = [];
            for (const [index, dado] of response.data.data.entries()) {
                produtos.push({
                    idx: index,
                    codigo: dado.codigo,
                    descricao: dado.nome,
                });
            }
            console.log("Pagina: ", page);

            lista.push(...produtos);
            page++;
        }
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            return lista;
        } else {
            throw error;
        }
    }

    return lista;
};

exports.setAgendamentoEmpresa = async function(id_empresa, imediato) {
    try {
        emp = await empresaSrv.getEmpresa(id_empresa);
        if (emp.ativo == "S") {
            agendas.setAgendamento(emp.id, emp.tempo, imediato);
        }
    } catch (error) {
        throw error;
    }
};

exports.stopAgendamentoEmpresa = async function(id_empresa) {
    try {
        emp = await empresaSrv.getEmpresa(id_empresa);
        if (emp.ativo == "S") {
            agendas.stopAgendamento(`id_${emp.id}`);
        }
    } catch (error) {
        throw error;
    }
};


exports.getProdutoSimpleByIdsTamPage = async function(
    id_produtos,
    emp,
    pagina,
    tamPage,
) {
    let page = pagina || 1;

    const params = {
        pagina: page,
        limite: tamPage,
        idCategoria: emp.id_categoria,
    };

    if (id_produtos && id_produtos.length > 0) {
        params.idsProdutos = id_produtos;
    }

    const options = {
        url: "https://api.bling.com.br/Api/v3/produtos",
        method: "get",
        params: params,
        paramsSerializer: function(params) {
            let query = [];

            if (params.idsProdutos) {
                params.idsProdutos.forEach(function(id) {
                    query.push("idsProdutos[]=" + id);
                });
            }

            query.push("pagina=" + params.pagina);
            query.push("limite=" + params.limite);

            if (params.idCategoria) {
                query.push("idCategoria=" + params.idCategoria);
            }

            return query.join("&");
        },
        headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + emp.access_token.trim(),
            "enable-jwt": 1 
        },
    };

    try {
        // 🔥 Delay obrigatório para evitar 429
        await sleep(350);

        // 🔥 Usar axiosBling (com keepAlive + retry + timeout)
        const response = await axiosBling(options);

         if (!response.data || response.data.length === 0) {
            return [];
        }

        return response.data.data;
    }catch (err) {

    // Timeout do Axios → ECONNABORTED
    if (err.code === "ECONNABORTED") {
        console.log(`Timeout na página ${page}. Retornando lista vazia.`);
        return [];
    }

    // Bling fechou a conexão
    if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
        console.log(`Conexão fechada pelo Bling na página ${page}. Retornando lista vazia.`);
        return [];
    }

    // Página realmente não existe
    if (err.response && err.response.status === 404) {
        console.log(`Página ${page} não existe. Retornando lista vazia.`);
        return [];
    }

    // Qualquer outro erro → lançar
    throw err;
}

};

exports.getListaWorkTamPage = async function(emp, page, tamPage) {
    let workList = [];

    const idProdutos = [];

    try {
        let lista = await this.getProdutoSimpleByIdsTamPage(
            idProdutos,
            emp,
            page,
            tamPage,
        );

        if (lista.length == 0) {
            return workList;
        } else {
            workList = lista.map((bling) => ({
                id: bling.id,
                nome: bling.nome,
                codigo: bling.codigo == "" ? bling.id : bling.codigo,
                preco: bling.preco,
                id_deposito: emp.id_deposito,
                saldo_bling: bling.estoque?.saldoFisicoTotal ? bling.estoque?.saldoFisicoTotal : 0,
                saldo_chg: 0,
                sem_codigo: bling.codigo == "" ? "S" : "N",
            }));
        }

        return workList;
    } catch (err) {
        throw err;
    }
};

exports.getProdutoByCodigo = async function(emp, codigo) {
    try {
        const params = {
            codigo: codigo,
            idCategoria: emp.id_categoria,
        };

        // 🔥 Delay para evitar 429
        await sleep(350);

        // 🔥 Usar axiosBling (retry + keepAlive)
        const resp = await axiosBling.get(
            "https://api.bling.com.br/Api/v3/produtos",
            {
                params: params,
                headers: {
                            "content-type": "application/json",
                            Authorization: "Bearer " + emp.access_token.trim(),
                            "enable-jwt": 1 
                         },
            }
        );

        return resp.data.data;

    } catch (err) {
        const erroApi =
            err.response && err.response.data ? err.response.data : err.message;
            console.log("Erro getProdutoByCodigo:", erroApi);
            throw err;
    }
};
