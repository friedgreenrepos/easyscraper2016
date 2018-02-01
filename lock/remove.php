<?php
	/*
	*
	*	Rimuove il lock sul documento dell'utente connesso
	*
	*/
	$url = $_POST['url'];
	$author = $_POST['usr'];
	
	$file = "log.json";
	
	$json = json_decode(file_get_contents($file), true);
	
	if(isset($json[$url])) {
		if($json[$url]["autore"] == $author) {
			unset($json[$url]);
			file_put_contents($file, json_encode($json));
		}
	}
	
	echo "1";
?>
