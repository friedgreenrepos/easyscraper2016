<?php
	/*
 	*
 	*	Script che conta il numero di recensori designati per il documento selezionato
 	*
	*/
	$url = $_GET['url'];
	$events = file_get_contents("../data/events.json");
	$json = json_decode($events, true);
	$result;
	foreach($json as $key=>$value) {
		foreach($value["submissions"] as $key1=>$value1) {
			if($value1["url"]==$url) {
				$result = count($value1["reviewers"]);
				break 2;
			}
		}
	}
	echo $result;
?>
