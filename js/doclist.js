function createList(user,role){

	var conf = {
		c_chair: [],
		c_reviewer: [],
		c_author: []
	};

	var docs =[];

	$.ajax({
		type: "POST",
		url:"php/events.php",
		error: function(){
			alert("Chiamata fallita");
		},
		success: function(result){

			var obj = JSON.parse(result);
			var i,j,z,y,q;

			var tmp = [];


			for (i=0; i<obj.length; i++){ //per ogni conferenza
				for (j=0; j<obj[i].chairs.length; j++){ //per ogni chair della conferenza i
					if (obj[i].chairs[j].indexOf(user) > -1){ //se tra i chair c'è l'user connesso
					tmp = [];

					for (z=0; z<obj[i].submissions.length; z++){ //per ogni sub della conferenza i

						tmp.push(obj[i].submissions[z].url);
						role.chair.push(obj[i].submissions[z].url);

					}
					//metto in c_chair gli articoli che di cui è chair l'user
					conf.c_chair.push({ name:obj[i].conference, docs:tmp });
				}
			}					//array chair popolato
			tmp = []; //svuoto l'array
			for (j=0; j<obj[i].pc_members.length; j++){ //ciclo tra i pc_members, se è tra questi sarà anche un revisore

				if (obj[i].pc_members[j].indexOf(user) > -1){

					for (y=0; y<obj[i].submissions.length; y++){

						for (q=0; q<obj[i].submissions[y].reviewers.length; q++){
							if (obj[i].submissions[y].reviewers[q].indexOf(user) > -1){

								tmp.push(obj[i].submissions[y].url);
								role.reviewer.push(obj[i].submissions[y].url);

							}
						}
					}



					if (tmp.length>0){ //se ho dei documenti revisionati, li aggiungo a c_reviewer
						conf.c_reviewer.push({name:obj[i].conference, docs:tmp});
					}
					break; //se è tra pc_members, allora è revisore e ha popolato il secondo campo
				}
			}

			tmp = [];

			for (j=0; j<obj[i].submissions.length; j++){

				for (y=0; y<obj[i].submissions[j].authors.length; y++){

					if (obj[i].submissions[j].authors[y].indexOf(user) > -1){
						tmp.push(obj[i].submissions[j].url);
						role.author.push(obj[i].submissions[j].url);
						break;

					}
				}
			}
			if (tmp.length>0){
				conf.c_author.push({name:obj[i].conference, docs:tmp});
				tmp = [];
			}
		}

		//effettiva visualizzazione dei documenti, divisi per conferenza e ruoli di user loggato
		for (i=0; i<obj.length; i++){
			var template0 =
			$("<li><a href='#' class='conf-list' data-toggle='collapse' data-target='#collapse-"+i+"'>"+ obj[i].conference +"</a><div id='collapse-"+i+"'><ul id='conference-"+i+"'></ul></div></li>");
			$("#doc-list").append(template0);


			//ciclo per il ruolo di chair
			for (j=0; j < conf.c_chair.length; j++){
				if(obj[i].conference == conf.c_chair[j].name){
					$("#conference-"+i).append("<h5>Chair:</h5>");
					for (z=0; z<conf.c_chair[j].docs.length; z++){
						var fileName1 = conf.c_chair[j].docs[z].replace(".html", "");
						var template1 = $("<li> <a id='chair-doc"+j +"' class ='conf-doc'href='"+conf.c_chair[j].docs[z]+"'>"+ fileName1+"</a> </li> </br>");
						$("#conference-"+i).append(template1);
					}
				}
			}

			//ciclo per il ruolo di autore
			for (j=0; j<conf.c_author.length; j++){
				if(obj[i].conference == conf.c_author[j].name){
					$("#conference-"+i).append("<h5>Author:</h5>");
					for (z=0; z<conf.c_author[j].docs.length; z++){
						var fileName2 = conf.c_author[j].docs[z].replace(".html","");
						var template2 = $("<li> <a id='author-doc"+j +"' class ='conf-doc' href='"+conf.c_author[j].docs[z]+"'>"+ fileName2+"</a> </li> </br>");
						$("#conference-"+i).append(template2);
					}
				}
			}

			//ciclo per il ruolo di reviewer
			for (j=0; j<conf.c_reviewer.length; j++){
				if(obj[i].conference == conf.c_reviewer[j].name){
					$("#conference-"+i).append("<h5>Reviewer:</h5>");
					for (z=0; z<conf.c_reviewer[j].docs.length; z++){
						var fileName3 = conf.c_reviewer[j].docs[z].replace(".html","");
						var template3 = $("<li> <a id='reviewer-doc"+j +"' class ='conf-doc' href='"+conf.c_reviewer[j].docs[z]+"'>"+ fileName3+"</a> </li> </br>");
						$("#conference-"+i).append(template3);
					}
				}
			}
		}
	}//chiudo funzione in caso di successo
});	//chiudo chiamata ajax
}   //chiudo funzione createList
