/* DATA tarefas */
const db = require("../infra/database");

/* GET CAMPOS */
exports.getCampos = function (Tarefa) {
  return [
    Tarefa.id_empresa,
    Tarefa.id,
    Tarefa.id_usuario,
    Tarefa.descricao,
    Tarefa.tempo,
    Tarefa.inicial,
    Tarefa.final,
    Tarefa.qtd_total,
    Tarefa.qtd_erro,
    Tarefa.status,
    Tarefa.descricao_erro,
    Tarefa.user_insert,
    Tarefa.user_update,
  ];
};
/* CRUD GET */
exports.getTarefa = function (id_empresa, id) {
  strSql = ` select   
			   tarefa.id_empresa as  id_empresa  
			,  tarefa.id as  id  
			,  tarefa.id_usuario as  id_usuario  
			,  tarefa.descricao as  descricao  
			,  tarefa.tempo  as tempo  
			,  tarefa.inicial as inicial  
			,  tarefa.final   as final  
			,  tarefa.qtd_total as  qtd_total  
			,  tarefa.qtd_erro as  qtd_erro  
			,  tarefa.status as  status  
			,  tarefa.descricao_erro as descricao_erro 
			,  tarefa.user_insert as  user_insert  
			,  tarefa.user_update as  user_update  
			,  emp.razao as  emp_razao    
 			FROM tarefas tarefa 	  
				 inner join empresas emp on emp.id = tarefa.id_empresa    
			 where tarefa.id_empresa = ${id_empresa} and  tarefa.id = ${id}  `;
  return db.oneOrNone(strSql);
};
/* CRUD GET ALL*/
exports.getTarefas = function (params) {
  if (params) {
    where = "";
    orderby = "";
    paginacao = "";

    if (params.orderby == "") orderby = "tarefa.id_empresa,tarefa.inicial";
    if (params.orderby == "Código")
      orderby = "tarefa.id_empresa,tarefa.inicial desc";

    if (orderby != "") orderby = " order by " + orderby;
    if (params.id_empresa !== 0) {
      if (where != "") where += " and ";
      where += `tarefa.id_empresa = ${params.id_empresa} `;
    }
    if (params.id !== 0) {
      if (where != "") where += " and ";
      where += `tarefa.id = ${params.id} `;
    }
    if (where != "") where = " where " + where;
    if (params.contador == "S") {
      sqlStr = `SELECT COALESCE(COUNT(*),0) as total 
				  FROM tarefas tarefa   
				 inner join empresas emp on emp.id_empresa = tarefa.id_empresa    
				  ${where} `;
      return db.one(sqlStr);
    } else {
      strSql = `select   
			   tarefa.id_empresa as  id_empresa  
			,  tarefa.id as  id  
			,  tarefa.id_usuario as  id_usuario  
			,  tarefa.descricao as  descricao ,  
			,  tarefa.tempo  as tempo  
			,  tarefa.inicial as inicial  
			,  tarefa.final   as final   
			,  tarefa.qtd_total as  qtd_total  
			,  tarefa.qtd_erro as  qtd_erro  
			,  tarefa.status as  status  
			,  tarefa.descricao_erro as descricao_erro 
			,  tarefa.user_insert as  user_insert  
			,  tarefa.user_update as  user_update  
			,  emp.razao as  emp_razao     
			FROM tarefas tarefa   
				 inner join empresas emp on emp.id = tarefa.id_empresa    
			${where} 			${orderby} ${paginacao} `;
      return db.manyOrNone(strSql);
    }
  } else {
    strSql = `select   
			   tarefa.id_empresa as  id_empresa  
			,  tarefa.id as  id  
			,  tarefa.id_usuario as  id_usuario  
			,  tarefa.descricao as  descricao  
			,  tarefa.tempo  as tempo  
			,  tarefa.inicial as inicial  
			,  tarefa.final   as final  
			,  tarefa.qtd_total as  qtd_total  
			,  tarefa.qtd_erro as  qtd_erro  
			,  tarefa.status as  status  
			,  tarefa.descricao_erro as descricao_erro 
			,  tarefa.user_insert as  user_insert  
			,  tarefa.user_update as  user_update  
			,  emp.razao as  emp_razao    
			FROM tarefas tarefa			   
				 inner join empresas emp on emp.id = tarefa.id_empresa   `;
    return db.manyOrNone(strSql);
  }
};
/* CRUD - INSERT */
exports.insertTarefa = function (tarefa) {
  strSql = `insert into tarefas (
		     id_empresa 
		 ,   id_usuario 
		 ,   descricao 
		 ,   tempo 
		 ,   inicial 
		 ,   final 
		 ,   qtd_total 
		 ,   qtd_erro 
		 ,   status 
		 ,   descricao_erro
		 ,   user_insert 
		 ,   user_update 
		 ) 
		 values(
		     ${tarefa.id_empresa} 
		 ,   ${tarefa.id_usuario} 
		 ,   '${tarefa.descricao}' 
		 ,   '${tarefa.tempo}'
		 ,   '${tarefa.inicial}'
		 ,   '${tarefa.final}' 
		 ,   ${tarefa.qtd_total} 
		 ,   ${tarefa.qtd_erro} 
		 ,   ${tarefa.status} 
		 ,   '${tarefa.descricao_erro}'
		 ,   ${tarefa.user_insert} 
		 ,   ${tarefa.user_update} 
		 ) 
 returning * `;
  return db.oneOrNone(strSql);
};
/* CRUD - UPDATE */
exports.updateTarefa = function (tarefa) {
  strSql = `update   tarefas set  
		     id_usuario = ${tarefa.id_usuario} 
 		 ,   descricao = '${tarefa.descricao}' 
 		 ,   tempo =     '${tarefa.tempo}'
 		 ,   inicial = '${tarefa.inicial}' 
 		 ,   final   = '${tarefa.final}'
 		 ,   qtd_total = ${tarefa.qtd_total} 
 		 ,   qtd_erro = ${tarefa.qtd_erro} 
 		 ,   status = ${tarefa.status}
		 ,   descricao_erro = '${tarefa.descricao_erro}' 
 		 ,   user_insert = ${tarefa.user_insert} 
 		 ,   user_update = ${tarefa.user_update} 
 		 where id_empresa = ${tarefa.id_empresa} and  id = ${tarefa.id}  returning * `;
  return db.oneOrNone(strSql);
};
/* CRUD - DELETE */
exports.deleteTarefa = function (id_empresa, id) {
  strSql = `delete from tarefas 
		 where id_empresa = ${id_empresa} and  id = ${id}  `;
  return db.oneOrNone(strSql);
};
