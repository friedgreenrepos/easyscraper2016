<?php
$data =  $_POST["data"];
$email = $data[4]; 
$sesso = $data[3]; 
$surname = $data[1]; 
$name = $data[0]; 
$password = $data[2]; 

$file = "../data/users.json"; 

$json = json_decode(file_get_contents($file), true);

foreach ( $json as $person ) {   
        if ($person["email"] == $email) {
		$key = $person["given_name"] ." ". $person["family_name"] ." <" .$person["email"].">";   //chiave di accesso

		if($surname != "" || $name != "") {       //creo la nuova chiave (se vengono modificati nome e cognome)
			if($surname != "" &&  $name != "") $key2 = $name ." ". $surname ." <" .$email.">"; 
			else if($name == "") $key2 = $person["given_name"] ." ". $surname ." <" .$email.">"; 
			else $key2 = $name ." ". $person["family_name"] ." <" .$email.">"; 

			$json[$key2]  = $json[$key];
            unset($json[$key]);            //rimuovo vecchio elemento 
			$key = $key2;                  //modifico la chiave in base ai dati modificati
		}

		if($name != "") $json[$key]["given_name"] = $name;   //inserisco i dati modificati
		if($surname != "") $json[$key]["family_name"] = $surname;
		if($password != "") $json[$key]["pass"] = $password;
		if($sesso == "male" || $sesso == "female" ) $json[$key]["sex"] = $sesso;

		file_put_contents($file, json_encode($json));    //salva
		echo 1;
	}
}

echo 0; 

?>
