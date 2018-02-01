<?php
	/*
 	*
 	*	Script che conta il numero di recensori che hanno effettivamente inviato una recensione
 	*
	*/

	$url = $_GET['url'];
	$url = "../data/dataset/".$url;
	$document = new DOMDocument();
	
	libxml_use_internal_errors(true);
	$document->loadHTMLFile($url);
	libxml_clear_errors();
	
	$recensioni = 0;
	$xpath = new DOMXPath($document);
	$oldNode = $xpath->query('//script[@type="application/ld+json"][@id]');
	$length = $oldNode->length;
	
	for($i = 0; $i < $length; $i++) {
		$json = json_decode($oldNode->item($i)->textContent, true);
		foreach($json as $key=>$value) {
			if($value["@type"] == "review") {
				$recensioni += 1;
			}
		}
	}
	
	echo $recensioni;
?>
