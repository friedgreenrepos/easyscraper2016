<?php
	/*
	*
	*	Script che controlla se esiste un lock sul documento
	*
	*/
	$url = $_POST['url'];
	$author = $_POST['usr'];
	
	$file = "log.json";
	
	$json = json_decode(file_get_contents($file), true);
	
	if($json[$url]["autore"] == $author)
		echo 1;
	else
		echo 0;
?>
