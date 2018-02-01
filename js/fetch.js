//Estrae il titolo associato ad address dal file events.json
function extractTitle(address) {
		$.ajax({
			type: "POST",
			url: "./php/fetch_title.php",

			data: {val : address},

			success: function(val) {
				//console.log(address);
				$("#title_spot").html($("<h2>" + val + "</h2> </br>"));
				fetchAuthors(address);
			},

			error: function() {
				alert("Impossibile caricare titolo documenti...")
			}
		});
}


function fetchAuthors(url){	//Crea lista autori sotto il titolo
	$.ajax({
		url:"data/events.json",
		dataType:"json",
		success:function(r){
			var i, j,z;
			for( i in r){
				if(r.hasOwnProperty(i)){
					for(j in r[i]["submissions"]){
						if(r[i]["submissions"].hasOwnProperty(j)){
							if(r[i]["submissions"][j]["url"]==url){
								if(r[i]["submissions"][j]["authors"].length==1){
									$("#title_spot").append("<p>Autore</p>");
								}
								else{		
									$("#title_spot").append("<p>Autori</p>");
								}
								var lista=$("<ul></ul>");
								for(z in r[i]["submissions"][j]["authors"]){
									if(r[i]["submissions"][j]["authors"].hasOwnProperty(z)){
										var item=$("<li class='title_author'></li>").text(r[i]["submissions"][j]["authors"][z]);
										$(lista).css("list-style-type", "none");
										$(lista).append(item);						
									}
				
								}
								$("#title_spot").append(lista);
							}
						}
					}	
				}
			}
		},
	
		error:function(a,b,c){
			alert("errore");
		}
	});
}