<?php
	/*
 	*
 	*	Script che carica il documento e le relative immagini e collegamenti
 	*
	*/
	include 'simple_html_dom.php';
	$url = $_GET["val"];
	$url = "../data/dataset/" . $url;
	$output = new simple_html_dom();
	$output = file_get_html($url);

	foreach($output->find("img") as $e){
		if (strpos($e->src, "./data/dataset/") !==0){
			$e->src = "./data/dataset/" . $e->src;
		}
	}

	foreach($output->find("link") as $e){
		if (strpos($e->href, "./data/dataset/") !==0){
			$e->href = "./data/dataset/" . $e->href;
		}
	}

	foreach($output->find("a") as $e){
		$e->target = "_blank";
	}

	foreach($output->find("body") as $e){
		echo $e;
	}

 ?>
