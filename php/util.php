<?php
	/*
	*	fetchTitle prende in input il nome del file in formato "nomefile.html" e cerca all'interno del file events.json
	*	Apre il file Json e lo converte in un array associativo.
	*	Scandisce per ogni elemento dell'array le "submissions"
	*	Se ne trova una il cui "url" coincide con il nome del file lo restituisce.
	*	La funzione restituisce la prima occorrenza o restituisce null.
	*/
	function fetchTitle($doc){

		$string=file_get_contents("../data/events.json");
		$elements=json_decode($string,true);

		foreach($elements as $key=>$value){
			for($i=0;$i<count($elements[$key]["submissions"]);$i++){
				if($elements[$key]["submissions"][$i]["url"]==$doc){
					return $elements[$key]["submissions"][$i]["title"];

				}
			}
		}
		return null;
	}

	/*
	*
	*	fetchName prende in input il nome dell'utente connesso sotto forma di indirizzo email e 
	*	ne restituisce il nome completo del tipo: Nome Cognome
	*
	*/
	function fetchName($user){
		$string=file_get_contents("../data/users.json");
		$arr=json_decode($string,true);

		foreach($arr as $value){
			if($value["email"]==$user){
				$ris=$value["given_name"]." ".$value["family_name"];
				return $ris;
			}
		}
		return null;
	}
	
	//funzione che recupera in un array tutti i commenti testuali (le note)
	function fetchIDNote($usr, $url) {
		$tmp = array();
		$doc = new DOMDocument();
		libxml_use_internal_errors(true);
		$doc->loadHTMLFile($url);
		libxml_clear_errors();
		$node = $doc->getElementById($usr);
		if($node != NULL) {
			$content = $node->textContent;
			if(!empty($content)) {
				$json = json_decode($content, true);
				foreach($json as $k=>$v) {
					if($v["@type"] == "comment")
						$tmp[] = $v["@id"];
				}
			}
		}
		return $tmp;
	}
?>
