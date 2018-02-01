<?php
	/*
 	*
 	*	Script che carica tutte le note di tutti gli autori presenti sul documento selezionato
 	*
	*/
	$url = $_GET['url'];
	$url = "../data/dataset/".$url;
	
	$document = new DOMDocument();
	
	libxml_use_internal_errors(true);
	$document->loadHTMLFile($url);
	libxml_clear_errors();
	
	$array = array();
	$xpath = new DOMXPath($document);
	$prevNode = $xpath->query('//script[@type="application/ld+json"][@id]');
	$l = $prevNode->length;
	
	$i;
	
	for($i = 0; $i < $l; $i++) {
		$a = array();
		$a = json_decode($prevNode->item($i)->textContent, true);
		
		foreach($a as $key=>$value) {
			if(isset($a[$key]["@type"])) {
				if($a[$key]["@type"] == "comment") {
					$array [] = $a[$key];
				}
			}
		}
	}
	
	foreach($array as $key=>$value) {
		if(empty($value)) {
			unset($array[$key]);
		}
	}
	
	if(empty($array)) {
		echo 0;
	} else {
		$array = json_encode($array);
		echo $array;
	}
?>
