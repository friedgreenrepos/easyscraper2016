<?php
	/*
 	*
 	*	Script che recupera una decisione dell'utente connesso se presente
 	*
	*/
	$url = $_GET['url'];
	$usr = $_GET['usr'];
	$url = "../data/dataset/".$url;
	$decision = array(
		"autore" => array(),
		"stato" => array()
	);
	
	$doc = new DOMDocument();
	libxml_use_internal_errors(true);
	$doc->loadHTMLFile($url);
	libxml_clear_errors();
	
	$node = $doc->getElementById($usr."-decision");
	if($node != NULL) {
		$json = json_decode($node->textContent, true);
		foreach($json as $k=>$v) {
			if(isset($json[$k]["@type"])) {
				if($json[$k]["@type"] == "decision") {
					$decision["autore"][] = $json[$k]["article"]["eval"]["author"];
					$decision["stato"][] = $json[$k]["article"]["eval"]["status"];
				}
			}
		}
	}
	
	echo json_encode($decision);
?>
