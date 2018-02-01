<?php
$mail = $_POST["email"];
$codice = $_POST["codice"];

$file = "../data/users.json";

$json = json_decode(file_get_contents($file), true);

foreach ( $json as $person ) {
   if($person["email"] == $mail) {
	 if($person["code"] == $codice) { // se coincide il codice
		$json[$person["given_name"] ." ". $person["family_name"] ." <" .$person["email"].">"]["confirm"] ="1"; //imposto 1 al campo confirm
		file_put_contents($file, json_encode($json));
		echo 1;
      }
     else echo 0; //se non coincide il codice
    }
}

?>
