<?php
$data =  $_POST["data"];
echo $data[3];

$file = "../data/users.json";

$json = json_decode(file_get_contents($file), true);

$json[$data[1] ." ". $data[4] ." <" .$data[0].">"] = array("given_name" => $data[1], "family_name"=> $data[4], "email" => $data[0], "pass" => $data[2], "sex" => $data[5], "confirm" => "0", "code" => $data[6]); // crea nuvo utente

file_put_contents($file, json_encode($json)); //salva

?>
