<?php

	/*
	*
	*	Imposta il lock sul documento
	*
	*/
	$url = $_POST['url'];
	$author = $_POST['usr'];
	
	$file = "log.json";
	
	$json = json_decode(file_get_contents($file), true);
	
	$time = getDate();
	
	if(!isset($json[$url])) {				//Se non c'è lock
		$json[$url] = array("autore" => $author, "data"=>$time[0]);
		file_put_contents($file, json_encode($json));
		echo "1";
	} else {									//Se c'è lock
		foreach($json as $key=>$value) {
			if($key == $url) {
				if((($time[0] - $value["data"]["0"]) > 1200) or ($value["autore"] != $author)){			//se è scaduto il tempo o se i lock appartiene ad un altro
					echo 0;
				} else {
					$json[$key]["autore"] = $author;
					$json[$key]["data"] = $time;
					file_put_contents($file, json_encode($json));
					echo 1;
				}
			}
		}
	}
?>
