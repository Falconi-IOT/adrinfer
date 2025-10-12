CREATE OR REPLACE FUNCTION public.limpa_historico(_id_empresa integer, OUT _retorno integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$ 

BEGIN
        _retorno := 1;
		/* Apaga os processados */
		WITH tar AS (
		    SELECT t.id_empresa,t.id
		    FROM tarefas t
		    WHERE t.id_empresa = _id_empresa and TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY') <> LEFT(t.inicial, 10)
		)
		DELETE FROM processados p
		USING tar
		WHERE p.id_empresa = tar.id_empresa and p.id_tarefa = tar.id;
		
		/* Apaga as tarefas */
		delete 
		from tarefas 
		where id_empresa = _id_empresa and to_char(CURRENT_DATE,'DD/MM/YYYY') <> left(inicial,10);
	
   
END;
$function$
;

