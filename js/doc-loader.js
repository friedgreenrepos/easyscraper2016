/*
 *	Funzione per il caricamento dei file nell'area principale
 *	Prende in input due parametri
 *	url rappresenta il nome del file
 *	filter è una variabile per poter chiamare la funzione per caricare i filtri
 *	sul documento
 *
*/
function loadDocument(url, filter) {
	$.ajax({
		type:"GET",
		url:"./php/doc-loader.php",
		data: {val : url},
		success: function(text){

			$("#main").html(text);
			filter();
		},
		error:function(a){
			alert("Errore nel caricamento del documento:" + a.status + " " + a.statusText);
			$("#main").html(a.responseText);
		}
	})
}
