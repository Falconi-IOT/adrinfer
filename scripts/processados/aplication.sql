CREATE DATABASE db_Adrinfer 
		WITH 
		OWNER = postgres 
		ENCODING = 'UTF8' 
		LC_COLLATE = 'Portuguese_Brazil.1252' 
		LC_CTYPE = 'Portuguese_Brazil.1252' 
		TABLESPACE = "Producao" 
		CONNECTION LIMIT = -1; 
GO 
/* Script Tabelas */
/* TABELA processados  */
DROP TABLE IF EXISTS processados;
CREATE TABLE Public.processados (
		id_empresa int4  NOT NULL  , 
		id_tarefa int4  NOT NULL  , 
		codigo varchar(60)  NOT NULL  , 
		seq serial  NOT NULL  , 
		descricao varchar(150)  NOT NULL  , 
		saldo_bling numeric(12,3)  NOT NULL  , 
		saldo_chg numeric(12,3)  NOT NULL  , 
		ocorrencia varchar(150)  NOT NULL  , 
		user_insert int4  NOT NULL  , 
		user_update int4  NOT NULL  , 
		PRIMARY KEY(id_empresa,id_tarefa,codigo,seq) 
)
 WITHOUT OIDS 
 TABLESPACE "Producao" 
 GO 
/* TRUNCATE TABLES */ 
TRUNCATE TABLE Public.processados RESTART IDENTITY; 
GO 
/* Drop TABLES */ 
DROP TABLE IF EXISTS Public.processados ; 
GO 
