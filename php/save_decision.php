<?php
	/*
 	*
 	*	Script che si occupa di salvare le decisioni in un nodo <script type"application/ld+json" id="user-decision">
 	*	separato dagli altri in modo da facilitarne l'accesso
 	*
	*/
	include "util.php";
	$stato = $_POST['stato'];
	$date = $_POST['date'];
	$usr = $_POST['usr'];
	$url = $_POST['url'];
	$url = "../data/dataset/".$url;
	
	$decision = array(
		"@context" => "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
		"@type" => "decision",
		"@id" => "#decision",
		"article" => array(
			"@id" => "",
			"eval" => array(
				"@id" => "decision1-eval",
				"@type" => "score",
				"status" => $stato,
				"author" => $usr,
				"date" => $date
			),
		),
	);
	
	$name = fetchName($usr);
	$person = array(
		"@context" => "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
		"@type" => "person",
		"@id" => $usr,
		"name" => $name,
		"as" => array (
			"@id" => "#role",
			"@type" => "role",
			"role_type" => "pro:chair",
			"in" => ""
		),
	);
	
	$doc = new DOMDocument();
	libxml_use_internal_errors(true);
	$doc->loadHTMLFile($url);
	libxml_clear_errors();
	$node = $doc->getElementById($usr."-decision");
	if($node == NULL) {
		$newDocument = new DOMDocument();
		$newDocument->formatOutput = true;
		$tmp = array();
		$tmp[] = $decision;
		$tmp[] = $person;
		$content = json_encode($tmp);
		$elem = $newDocument->createElement("script", $content);
		$elem->setAttribute("type", "application/ld+json");
		$elem->setAttribute("id", $usr."-decision");
		$elem = $doc->importNode($elem, true);
		$doc->getElementsByTagName('head')->item(0)->appendChild($elem);
	} else {
		$json = json_decode($node->textContent, true);
		$json[] = $decision;
		$json[] = $person;
		$node->nodeValue=json_encode($json);
	}
	echo $doc->saveHTMLFile($url);
?>
