function checkLock(url, author, refresh) {		//controlla la validita' del lock per l'autore al momento del salvataggio
	$.ajax({
		type: "POST",
		url: "./lock/check.php",
		data: {
			url: url,
			usr: author
		},
		
		success: function(result) {
			if(result == 0) {
				alert("Tempo scaduto...");
			}
			$("#save").hide();
			refresh();
		},
		
		error: function(e) {
			alert("Errore checklock");
		}
	});
}

function removeLock(url, author, p) {	//Rimuove il lock sul documento dell'autore e nasconde i tool della modalita' annotator
	var g = true;
	if(p) {
		g = false;
	}
	
	$.ajax({
		url: "./lock/remove.php",
		type: "POST",
		dataType: "html",
		data: {
			url : url,
			usr : author
		},
		
		success: function(result) {
			$("#save, #unsaved, #note-creator, #review, #chair-review, #edit-panel").hide();
		},
		
		error: function(e) {
			alert("Errore removelock...");
		}
	});
}

function setLock(url, author, obj, r) {		//fornisce il lock sul documento all'user e mostra i tool della modalita' annotator
	$.ajax({
		url: "./lock/set.php",
		type: "POST",
		data: {
			url: url,
			usr: author
		},
		
		success: function(result) {
			if(result == 0) {
				alert("Un altro utente sta modificando il documento, riprovare più tardi...");
			} else {
				$("#note-creator, #unsaved").show();
				
				if(r.reviewer.indexOf(url) != -1) {
					$("#review").show();
				}
				if(r.chair.indexOf(url) != -1) {
					$("#chair-review").show();
				}
				$(obj).addClass("annotator");
				$(obj).removeClass("reader");
				$("#ra-text").html("Annotator");
			}
		},
		
		error: function(e) {
			alert("Errore setlock..");
		}
	});
}
