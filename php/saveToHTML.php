<?php
	/*
 	*
 	*	Script che rimpiazza il vecchio body del documento con il nuovo contenente le note
 	*
	*/
	include('simple_html_dom.php');
	
	$url = $_POST['url'];
	$body = $_POST['body'];
	
	$url = "../data/dataset/" . $url;
	
	$out = file_get_html($url);
	
	foreach($out->find("body") as $b) {
		$b->innertext = $body;
	}
	
	echo $out->save($url);
?>
