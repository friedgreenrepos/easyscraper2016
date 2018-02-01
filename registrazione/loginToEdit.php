<?php

/*
 * Controlla che password e email coincidano per accedere al modale che modifica i dati.
 * Stampa 0 se l'accesso e' andato a buon fine ma bisogna confermare l' account
 * stampa 1 se l'accesso e' andato a buon fine e si e' gia' confermato l'account
 * stampa 2 altrimenti
 */
 
$email = $_POST["email"];
$password = $_POST["password"];

$file = "../data/users.json";

$json = json_decode(file_get_contents($file), true);

$response = 2;

foreach ( $json as $person ){
  if ($person["email"] == $email) {
	if($person["pass"] == $password) {
    $response = 0;
    if(!isset($person["confirm"]) || $person["confirm"] == "1") $ok = 1;
    }
  }
}

echo $response; 
?>
