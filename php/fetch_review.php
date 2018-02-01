<?php
	/*
 	*
 	*	Script che recupera tutte le recensioni su un documento se presenti
 	*
	*/
	
	$url = $_GET['url'];
	$url = "../data/dataset/".$url;
	$reviews = array(
		"autore"=>array(),
		"stato"=>array(),
		"testo"=>array()
	);
	$doc = new DOMDocument();
	libxml_use_internal_errors(true);
	$doc->loadHTMLFile($url);
	libxml_clear_errors();
	$xpath = new DOMXPath($doc);
	$oldNode = $xpath->query('//script[@type="application/ld+json"][@id]');
	$length = $oldNode->length;
	$i;
	for($i = 0; $i < $length; $i++) {
		$json = json_decode($oldNode->item($i)->textContent, true);
		foreach($json as $k=>$v) {
			if(isset($json[$k]["@type"])) {
				if($json[$k]["@type"]=="review") {
					$reviews["autore"][] = $json[$k]["article"]["eval"]["author"];
					$reviews["stato"][] = $json[$k]["article"]["eval"]["status"];
					$reviews["testo"][] = $json[$k]["article"]["eval"]["textreview"];
				}
			}
		}
	}
	
	echo json_encode($reviews);
?>
