/* DATA usuarios */
const db = require('../infra/database');

/* GET CAMPOS */
exports.getCampos = function(Usuario){
return [ 
			Usuario.id_empresa, 
			Usuario.id, 
			Usuario.razao, 
			Usuario.ativo, 
			Usuario.user_insert, 
			Usuario.user_update, 
 ]; 
}; 
/* CRUD GET */
exports.getUsuario = function(id_empresa,id){
	strSql = ` select   
			   usu.id_empresa as  id_empresa  
			,  usu.id as  id  
			,  usu.razao as  razao  
			,  usu.ativo as  ativo  
			,  usu.user_insert as  user_insert  
			,  usu.user_update as  user_update    
 			FROM usuarios usu 	     
			 where usu.id_empresa = ${id_empresa} and  usu.id = ${id}  `;
	return  db.oneOrNone(strSql);
}
/* CRUD GET ALL*/
exports.getUsuarios = function(params){
if (params) {
	where = "";
	orderby = "";
	paginacao = "";

	if(params.orderby == '') orderby = 'usu.id_empresa,usu.id';
	if(params.orderby == 'Código') orderby = 'usu.id_empresa,usu.id';
	if(params.orderby == 'Razão') orderby = 'usu.id_empresa,usu.razao';

	if (orderby != "") orderby = " order by " + orderby;
	if(params.id_empresa  !== 0 ){
		if (where != "") where += " and "; 
		where += `usu.id_empresa = ${params.id_empresa} `;
	}
	if(params.id  !== 0 ){
		if (where != "") where += " and "; 
		where += `usu.id = ${params.id} `;
	}
	if(params.razao.trim()  !== ''){
		if (where != "") where += " and ";
		if (params.sharp) { 
			 where +=  `usu.razao = '${params.razao}' `;
		} else 
		{
			where += `usu.razao like '%${params.razao.trim()}%' `;
		}
	}
	if (where != "") where = " where " + where;
	if (params.contador == 'S') {
		sqlStr = `SELECT COALESCE(COUNT(*),0) as total 
				  FROM usuarios usu      
				  ${ where} `;
		return db.one(sqlStr);
	}  else {
		strSql = `select   
			   usu.id_empresa as  id_empresa  
			,  usu.id as  id  
			,  usu.razao as  razao  
			,  usu.ativo as  ativo  
			,  usu.user_insert as  user_insert  
			,  usu.user_update as  user_update     
			FROM usuarios usu      
			${where} 			${ orderby} ${ paginacao} `;
			return  db.manyOrNone(strSql);
		}	}  else {
		strSql = `select   
			   usu.id_empresa as  id_empresa  
			,  usu.id as  id  
			,  usu.razao as  razao  
			,  usu.ativo as  ativo  
			,  usu.user_insert as  user_insert  
			,  usu.user_update as  user_update    
			FROM usuarios usu			     `;
		return  db.manyOrNone(strSql);
	}
}
/* CRUD - INSERT */
 exports.insertUsuario = function(usuario){
	strSql = `insert into usuarios (
		     id_empresa 
		 ,   razao 
		 ,   ativo 
		 ,   user_insert 
		 ,   user_update 
		 ) 
		 values(
		     ${usuario.id_empresa} 
		 ,   '${usuario.razao}' 
		 ,   '${usuario.ativo}' 
		 ,   ${usuario.user_insert} 
		 ,   ${usuario.user_update} 
		 ) 
 returning * `;
	return db.oneOrNone(strSql);
};
/* CRUD - UPDATE */
 exports.updateUsuario = function(usuario){
	strSql = `update   usuarios set  
		     razao = '${usuario.razao}' 
 		 ,   ativo = '${usuario.ativo}' 
 		 ,   user_insert = ${usuario.user_insert} 
 		 ,   user_update = ${usuario.user_update} 
 		 where id_empresa = ${usuario.id_empresa} and  id = ${usuario.id}  returning * `;
	return  db.oneOrNone(strSql);
}
/* CRUD - DELETE */
 exports.deleteUsuario = function(id_empresa,id){
	strSql = `delete from usuarios 
		 where id_empresa = ${id_empresa} and  id = ${id}  `;
 	return  db.oneOrNone(strSql);
}


