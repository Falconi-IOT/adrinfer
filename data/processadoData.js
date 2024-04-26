/* DATA processados */
const db = require("../infra/database");

/* GET CAMPOS */
exports.getCampos = function (Processado) {
  return [
    Processado.id_empresa,
    Processado.id_tarefa,
    Processado.codigo,
    Processado.seq,
    Processado.descricao,
    Processado.saldo_bling,
    Processado.saldo_chg,
    Processado.ocorrencia,
    Processado.user_insert,
    Processado.user_update,
  ];
};
/* CRUD GET */
exports.getProcessado = function (id_empresa, id_tarefa, codigo, seq) {
  strSql = ` select   
			   proce.id_empresa as  id_empresa  
			,  proce.id_tarefa as  id_tarefa  
			,  proce.codigo as  codigo  
			,  proce.seq as  seq  
			,  proce.descricao as  descricao  
			,  proce.saldo_bling as  saldo_bling  
			,  proce.saldo_chg as  saldo_chg  
			,  proce.ocorrencia as  ocorrencia  
			,  proce.user_insert as  user_insert  
			,  proce.user_update as  user_update    
 			FROM processados proce 	     
			 where proce.id_empresa = ${id_empresa} and  proce.id_tarefa = ${id_tarefa} and  proce.codigo = '${codigo}' and  proce.seq = ${seq}  `;
  return db.oneOrNone(strSql);
};
/* CRUD GET ALL*/
exports.getProcessados = function (params) {
  if (params) {
    where = "";
    orderby = "";
    paginacao = "";

    if (params.orderby == "")
      orderby = "proce.id_empresa,proce.id_tarega,proce.codigo,proce.seq";
    if (params.orderby == "Código")
      orderby = "proce.id_empresa,proce.id_tarefa,proce.codigo,proce.seq";

    if (orderby != "") orderby = " order by " + orderby;
    if (params.id_empresa !== 0) {
      if (where != "") where += " and ";
      where += `proce.id_empresa = ${params.id_empresa} `;
    }
    if (params.id_tarefa !== 0) {
      if (where != "") where += " and ";
      where += `proce.id_tarefa = ${params.id_tarefa} `;
    }
    if (params.codigo.trim() !== "") {
      if (where != "") where += " and ";
      if (params.sharp) {
        where += `proce.codigo = '${params.codigo}' `;
      } else {
        where += `proce.codigo like '%${params.codigo.trim()}%' `;
      }
    }
    if (params.sequencia !== 0) {
      if (where != "") where += " and ";
      where += `proce.sequencia = ${params.sequencia} `;
    }
    if (where != "") where = " where " + where;

    if (params.pagina != 0) {
      paginacao = `limit ${params.tamPagina} offset ((${params.pagina} - 1) * ${params.tamPagina})`;
    }
    if (params.contador == "S") {
      sqlStr = `SELECT COALESCE(COUNT(*),0) as total 
				  FROM processados proce      
				  ${where} `;
      return db.one(sqlStr);
    } else {
      strSql = `select   
			   proce.id_empresa as  id_empresa  
			,  proce.id_tarefa as  id_tarefa  
			,  proce.codigo as  codigo  
			,  proce.seq as  seq  
			,  proce.descricao as  descricao  
			,  proce.saldo_bling as  saldo_bling  
			,  proce.saldo_chg as  saldo_chg  
			,  proce.ocorrencia as  ocorrencia  
			,  proce.user_insert as  user_insert  
			,  proce.user_update as  user_update     
			FROM processados proce      
			${where} 			${orderby} ${paginacao} `;
      return db.manyOrNone(strSql);
    }
  } else {
    strSql = `select   
			   proce.id_empresa as  id_empresa  
			,  proce.id_tarefa as  id_tarefa  
			,  proce.codigo as  codigo  
			,  proce.seq as  seq  
			,  proce.descricao as  descricao  
			,  proce.saldo_bling as  saldo_bling  
			,  proce.saldo_chg as  saldo_chg  
			,  proce.ocorrencia as  ocorrencia  
			,  proce.user_insert as  user_insert  
			,  proce.user_update as  user_update    
			FROM processados proce			     `;
    return db.manyOrNone(strSql);
  }
};
/* CRUD - INSERT */
exports.insertProcessado = function (processado) {
  strSql = `insert into processados (
		     id_empresa 
		 ,   id_tarefa 
		 ,   codigo 
		 ,   descricao 
		 ,   saldo_bling 
		 ,   saldo_chg 
		 ,   ocorrencia 
		 ,   user_insert 
		 ,   user_update 
		 ) 
		 values(
		     ${processado.id_empresa} 
		 ,   ${processado.id_tarefa} 
		 ,   '${processado.codigo}' 
		 ,   '${processado.descricao}' 
		 ,   ${processado.saldo_bling} 
		 ,   ${processado.saldo_chg} 
		 ,   '${processado.ocorrencia}' 
		 ,   ${processado.user_insert} 
		 ,   ${processado.user_update} 
		 ) 
 returning * `;
  return db.oneOrNone(strSql);
};
/* CRUD - UPDATE */
exports.updateProcessado = function (processado) {
  strSql = `update   processados set  
		     descricao = '${processado.descricao}' 
 		 ,   saldo_bling = ${processado.saldo_bling} 
 		 ,   saldo_chg = ${processado.saldo_chg} 
 		 ,   ocorrencia = '${processado.ocorrencia}' 
 		 ,   user_insert = ${processado.user_insert} 
 		 ,   user_update = ${processado.user_update} 
 		 where id_empresa = ${processado.id_empresa} and  id_tarefa = ${processado.id_tarefa} and  codigo = '${processado.codigo}' and  seq = ${processado.seq}  returning * `;
  return db.oneOrNone(strSql);
};
/* CRUD - DELETE */
exports.deleteProcessado = function (id_empresa, id_tarefa, codigo, seq) {
  strSql = `delete from processados 
		 where id_empresa = ${id_empresa} and  id_tarefa = ${id_tarefa} and  codigo = '${codigo}' and  seq = ${seq}  `;
  return db.oneOrNone(strSql);
};
