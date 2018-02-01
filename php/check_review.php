<?php
	/*
 	*
 	*	Script che controlla la presenza di recensioni da parte del reviewer attualmente connesso
 	*
	*/
	$url = $_GET['url'];
	$url = "../data/dataset/".$url;
	$usr = $_GET['usr'];
	$result = 1;
	
	$document = new DOMDocument();
	libxml_use_internal_errors(true);
	$document->loadHTMLFile($url);
	libxml_clear_errors();
	
	$node = $document->getElementById($usr."-review");
	
	if($node != NULL) {
		$temp = $node->textContent;
		$json = json_decode($temp, true);
		foreach($json as $k) {
			if($k["@type"]=="review") {
				$result = 0;
				break;
			}
		}
	}
	
	echo $result;
?>
