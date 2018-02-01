<?php
	//recupera il nome completo dell'utente
	
	include "util.php";
	$user=$_GET['user'];
	$var = fetchName($user);
	echo $var;
?>
