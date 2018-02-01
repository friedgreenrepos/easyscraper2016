<?php
	/*
 	*
 	*	Script che carica un'array json con i dati degli autori che devono ancora recensire
 	*
	*/

	$url = $_GET['url'];
	$ind = "../data/dataset/".$url;
	
	function cancel(&$a, $b) {	//Rimuove da a ogni elemento di b
		foreach($b as $k=>$v) {
			foreach($a as $k1=>$v1) {
				if(strpos($v1,$v)!==false) {
					array_splice($a, $k1, 1);
				}
			}
		}
	}
	
	function revComp($url) {	//Recupera tutti gli autori che hanno completato una recensione
		$result = array();
		$doc = new DOMDocument();
		libxml_use_internal_errors(true);
		$doc->loadHTMLFile($url);
		libxml_clear_errors();
		$xpath = new DOMXPath($doc);
		$oldNode = $xpath->query('//script[@type="application/ld+json"][@id]');
		foreach($oldNode as $key=>$value) {
			$json = json_decode($value->textContent,true);
			foreach($json as $k=>$v) {
				if($v['@type'] == 'review') {
					$result[] = $v['article']['eval']['author'];
				}
			}
		}
		return $result;
	}
	
	$recensioni = revComp($ind);
	$result = array();
	$events = file_get_contents("../data/events.json");
	$json = json_decode($events, true);
	foreach($json as $k=>$v) {
		foreach($v['submissions'] as $k1=>$v1) {
			if($v1['url'] == $url) {
				foreach($v1["reviewers"] as $v2) {
					$result[] = $v2;
				}
			}
		}
	}
	cancel($result, $recensioni);
	
	foreach($result as $key=>$value) {
		$result[$key] =str_replace("<", "(", $value);
		$result[$key] =str_replace(">", ")", $result[$key]);
	}
	
	echo json_encode($result);
?>
