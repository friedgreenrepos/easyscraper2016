<?php
	/*
 	*
	*	Script che controlla la presenza di decisioni da parte del Chair attualmente connesso
 	*
	*/
	$url = $_GET['url'];
	$usr = $_GET['usr'];
	$url = "../data/dataset/".$url;
	$result = 1;
	
	$doc = new DOMDocument();
	libxml_use_internal_errors(true);
	$doc->loadHTMLFile($url);
	libxml_clear_errors();
	
	$node = $doc->getElementById($usr."-decision");
	
	if($node != NULL) {
		$tmp = $node->textContent;
		$json = json_decode($tmp, true);
		foreach($json as $x) {
			if(isset($x["@type"])) {
				if($x["@type"] == "decision") {
					$result = 0;
					break;
				}
			}
		}
	}
	
	echo $result;
?>
