<?php
	/*
	*	
	*	Recupera il titolo del documento dato il nome del file
	*	
	*/
	include "util.php";
	$doc = $_POST['val'];
	$result = fetchTitle($doc);
	echo $result;
?>
