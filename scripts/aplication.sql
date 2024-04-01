CREATE DATABASE db_Afrinfer 
		WITH 
		OWNER = postgres 
		ENCODING = 'UTF8' 
		LC_COLLATE = 'Portuguese_Brazil.1252' 
		LC_CTYPE = 'Portuguese_Brazil.1252' 
		TABLESPACE = "Producao" 
		CONNECTION LIMIT = -1; 
GO 
/* Script Tabelas */
/* TABELA tarefas  */
DROP TABLE IF EXISTS tarefas;
CREATE TABLE Public.tarefas (
		id_empresa int4  NOT NULL  , 
		id serial  NOT NULL  , 
		id_usuario int4  NOT NULL  , 
		descricao varchar(50)  NOT NULL  , 
		tempo numeric(15,3) NOT NULL default 0 , 
		inicial varchar(20)  NOT NULL default '' , 
		final varchar(20)  NOT NULL default '' , 
		qtd_total int4  NOT NULL  , 
		qtd_erro int4  NOT NULL  , 
		status int4  NOT NULL  , 
		user_insert int4  NOT NULL  , 
		user_update int4  NOT NULL  , 
		PRIMARY KEY(id_empresa,id) 
)
 WITHOUT OIDS 
 TABLESPACE "Producao" 
 GO 
/* TABELA empresas  */
DROP TABLE IF EXISTS empresas;
CREATE TABLE Public.empresas (
		id serial  NOT NULL  , 
		cnpj_cpf varchar(14)  NOT NULL  , 
		razao varchar(40)  NOT NULL  , 
		cliente_id varchar(150)  NOT NULL  , 
		cliente_secret varchar(150)  NOT NULL  , 
		link varchar(255)  NOT NULL  , 
		url_redirecionamento varchar(255)  NOT NULL  , 
		code varchar(100)  NOT NULL  , 
		access_token varchar(100)  NOT NULL  , 
		access_token_validade int4 not null default 0,
        access_token_date       varchar(25) null dedault '',
		refresh_token varchar(100)  NOT NULL  , 
		refresh_token_validade int4 not null default 0,
        refresh_token_date      varchar(25) null dedault '',
		id_deposito varchar(20)  NOT NULL  , 
		id_categoria varchar(20)  NOT NULL  , 
		key_chg varchar(50)  NOT NULL  , 
		ativo char(1)  NOT NULL  , 
		tempo int4  NOT NULL  , 
		user_insert int4  NOT NULL  , 
		user_update int4  NOT NULL  , 
		PRIMARY KEY(id) 
)
 WITHOUT OIDS 
 TABLESPACE "Producao" 
 GO 
/* TABELA usuarios  */
DROP TABLE IF EXISTS usuarios;
CREATE TABLE Public.usuarios (
		id_empresa int4  NOT NULL  , 
		id serial  NOT NULL  , 
		razao varchar(40)  NOT NULL  , 
		ativo char(1)  NOT NULL  , 
		user_insert int4  NOT NULL  , 
		user_update int4  NOT NULL  , 
		PRIMARY KEY(id_empresa,id) 
)
 WITHOUT OIDS 
 TABLESPACE "Producao" 
 GO 
/* TRUNCATE TABLES */ 
TRUNCATE TABLE Public.tarefas RESTART IDENTITY; 
GO 
TRUNCATE TABLE Public.empresas RESTART IDENTITY; 
GO 
TRUNCATE TABLE Public.usuarios RESTART IDENTITY; 
GO 
/* Drop TABLES */ 
DROP TABLE IF EXISTS Public.tarefas ; 
GO 
DROP TABLE IF EXISTS Public.empresas ; 
GO 
DROP TABLE IF EXISTS Public.usuarios ; 
GO 
