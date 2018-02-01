<?php
	$email = $_POST["email"];  

	$file = "../data/users.json"; 

	$json = json_decode(file_get_contents($file), true);

	$ok = 1; 
	foreach ( $json as $person )
	{   
		  if ($person["email"] == $email) $ok = 0;
	}

	echo $ok; 
?>
