<?php
	/*
 	*
 	*	Script che controlla che non ci siano nodi di note vuoti 
 	*
	*/
	$url = $_GET['url'];
	$url = "../data/dataset/". $url;
	$user = $_GET['usr'];
	$document = new DOMDocument();
	$a = array();
	
	libxml_use_internal_errors(true);
	$document->loadHTMLFile($url);
	libxml_clear_errors();
	
	$usrEl = $document->getElementById($user);
	
	if($usrEl != NULL) {
		$text = $usrEl->textContent;
		$arr = json_decode($text, true);
		foreach($arr as $key=>$value){
			if(isset($arr[$key]["@type"])) {
				if($arr[$key]["@type"] != "comment") {
					$a[] = $arr[$key];
				}
			}
		}
		if(empty($a)) {
			$usrEl->parentNode->removeChild($usrEl);
		} else {
			$usrEl->nodeValue = json_encode($a);
		}
	}
	
	echo $document->saveHTMLFile($url);
?>
