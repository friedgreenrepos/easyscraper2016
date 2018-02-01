<?php
	/*
 	*
 	*	Script che salva le note in formato json-ld
 	*
	*/
	
	$note = $_POST['val'];
	$author = $_POST['user'];
	$url = $_POST['url'];
	$note = "[".$note."]";
	$url = "../data/dataset/" . $url;
	$json = json_decode($note, true);
	$a = array();
	
	
	//Prende l'array associativo $json e lo scandisce nelle coppie chiave-valore per inserire in un array di output
	//le note relative all'autore attualmente connesso
	foreach($json as $key=>$value) {
		if(isset($json[$key]["author"])) {
			if($json[$key]["author"] == $author) {
				$a [] = $json[$key];
			}
		}
	}
	
	//Se una coppia chiave-valore contiene un valore vuoto, viene eliminata dall'array di output
	foreach($a as $key=>$value) {
		if(empty($value))
			unset($a[$key]);
	}
	
	$doc = new DOMDocument();

	libxml_use_internal_errors(true);
	$doc->loadHTMLFile($url);
	libxml_clear_errors();

	$n = $doc->getElementByID($author."-note");

	
	if(($n == NULL) and !empty($a)) {//Se non sono mai state fatte annotazioni dall'autore e se l'array di output non è vuoto
		$newdoc = new DOMDocument();	
		$newdoc->formatOutput = true;		
		$data = json_encode($a);		
		$elem = $newdoc->createElement("script", $data);	
		$elem->setAttribute("type", "application/ld+json");	
		$elem->setAttribute("id", $author."-note");	
		$elem = $doc->importNode($elem, true);
		$doc->getElementsByTagName('head')->item(0)->appendChild($elem);	
	} else if (($n != NULL) and empty($a)) {		//Se l'autore aveva già annotato, ma l'array di output è vuoto ne rimuovo gli elementi (ho cancellato tutte le note che c'erano)
		$n->parentNode->removeChild($n);
	} else {	//Se l'array di output non e' vuoto allora sovrascrivo i dati
		$tmp = $n->textContent;	
		$p = json_decode($tmp, true);	
		$p = array_values($p);	
		foreach($a as $key=>$value) {	
			$p[]=$a[$key];	
		}
		$p = array_values(array_map("unserialize", array_unique(array_map("serialize", $p))));	//Salvo in modo che non ci siano duplicati e che mantenga la struttura chiave valore
		$n->nodeValue = json_encode($p);	
		}

	echo $doc->saveHTMLFile($url);		
	

?>
