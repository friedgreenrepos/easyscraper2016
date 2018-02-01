<?php
	/*
	 * Controlla in users.json che password e email inserite coincidano
	 * e che l'account sia stato confirmato
	 * stampa 0 se password e email non coincidono
	 * stampa 1 se la registrazione e' stata confirmata
	 * stampa 2 se l' account deve ancora essere verificato
	 */
	 
	$email = $_POST['email'];
	$pass = $_POST['pass'];

	$string = file_get_contents("../data/users.json");
	$json_a = json_decode($string, true);

	$i=0;
	foreach ($json_a as $person_name => $person_a) {
		if (( $person_a['email']==$email) and ( $person_a['pass']==$pass)){
			if(isset($person_a["confirm"]))	{
				if($person_a["confirm"] == "1")
				$i=1;
				else $i=2;
			}
		  else $i=1; 
    	break;
		}
	}

	echo $i;  
?>
