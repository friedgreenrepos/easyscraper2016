<?php
	/*
 	*
 	*	Script che carica la lista di tutti i documenti presenti
 	*
	*/
	$files = array();
	$files = scandir("../data/dataset");

	$filesList = array();
	for ($i=0; $i<count($files); $i++) {
		if (strpos($files[$i], 'html'))
			$filesList[] = $files[$i]; 
	}

	echo json_encode($filesList);
?>
