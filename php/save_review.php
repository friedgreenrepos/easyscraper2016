<?php

	/*
 	*
 	*	Script che si occupa di salvare le decisioni in un nodo <script type"application/ld+json" id="user-review">
 	*	separato dagli altri in modo da facilitarne l'accesso
 	*
	*/
	include "util.php";
	
	$text = $_POST['text'];
	$date = $_POST['date'];
	$status = $_POST['status'];
	$usr = $_POST['usr'];
	$url = $_POST['url'];
	$url = "../data/dataset/".$url;
	
	$review = array(
		"@context"=>"http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
		"@type" => "review",
		"@id" => "#review",
		"article"=> array( 
            "@id"=> "", 
            "eval"=> array(
				"@id"=> "#review-eval",
				"@type"=> "score",
              	"status"=> $status,
              	"textreview" => $text,
              	"author"=> $usr,
              	"date"=> $date
            ),
        ),
		"comments"=>array()
	);
	
	$tmp = fetchIDNote($usr, $url);
	foreach($tmp as $k) {
		$review["comments"][] = $k;
	}
	$name = fetchName($usr);
	$person = array(
		"@context" => "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
		"@type" => "person",
		"@id" => $usr,
		"name" => $name,
		"as" => array(
			"@id" => "#role",
			"@type" => "role",
			"role_type" => "pro:reviewer",
			"in" => ""
		),
	);
	
	$document = new DOMDocument();
	libxml_use_internal_errors(true);
	$document->loadHTMLFile($url);
	libxml_clear_errors();
	
	$node = $document->getElementById($usr."-review");
	if($node == NULL) {
		$newdoc = new DOMDocument();
		$newdoc->formatOutput = true;
		$tmp = array();
		$tmp[] = $review;
		$tmp[] = $person;
		$content = json_encode($tmp);
		$elem = $newdoc->createElement("script", $content);
		$elem->setAttribute("type", "application/ld+json");
		$elem->setAttribute("id", $usr."-review");
		$elem = $document->importNode($elem, true);
		$document->getElementsByTagName('head')->item(0)->appendChild($elem);
	} else {
		$json = json_decode($node->textContent, true);
		$json[] = $review;
		$json[] = $person;
		$node->nodeValue=json_encode($json);
	}
	
	echo $document->saveHTMLFile($url);

?>
