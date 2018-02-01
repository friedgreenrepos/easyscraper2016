$(document).ready(function() {

	var email;

	$("#loginbtn").click(function(e){              //funzione per loggarsi
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: "registrazione/login.php",
			data:{
				email:$("#user").val(),
				pass:$("#password").val()
			},
			success: function(result){
				console.log("Result from login.php: " + result);
				if(Number(result) == 1){                             //password e username coincidono
					if(typeof(Storage) !== "undefined"){
						localStorage.removeItem("user");
						localStorage.setItem("user", $("#user").val());
					}
					window.open("easyrash.html", "_self");
				}
				else if(Number(result)==0) {                         //password e username non coincidono
					$("#user").val('');
					$("#password").val('');
					$("#error").text("Username e password non coincidono");
				}
				else                                                 //l' email è da confermare
				$("#error").text("Conferma la tua email da 'Gestione Account'");
			}
		});
	});



	$("#modificadati").click(function(){                       //funzione per modificare i dati
		if($("#password-modifica").val() != $("#password-modifica2").val()){
			alert("Le password non coincidono");
			return 0;
		}

		data = [];                                                //dati da inviare a php
		data[0] = $("#name-modifica").val();
		data[1] = $("#surname-modifica").val();
		data[2] = $("#password-modifica").val();
		data[3] = $("input[name='sesso-modifica']:checked").val();
		data[4] = email;

		$.ajax({
			type: "POST",
			url: "registrazione/editInfo.php",
			dataType: "html",
			data: {"data":data},
			success: function(risposta){
				if(risposta != 0) {
					alert("I dati sono stati modificati correttamente");
					$("#modifica-dati").modal("hide");
				}
				else alert("Non hai modificato correttamente i dati");
			},
			error: function(){
				alert("Chiamata fallita!!!");
			}
		});
	})



	$("#conferma-pass").click(function(){                    //si apre il modale per modifica pwd
		$("#modifica-dati").modal("hide");

		$("#conferma-registrazione").modal("show");              //si apre il modale per ricevere il codice e confermare registrazione
		$("#email-conferma").html(email);                        //visualizzata mail a cui si invia il codice
	});


	$("#accedi").click(function(){                             //gestione account
		if($("#email-accedi") == "") alert("Inserisci email!");
		if($("#password-accedi") == "") alert("Inserisci password");

		email = $("#email-accedi").val();

		$("#conferma-pass").hide();

		$.ajax({
			type: "POST",
			url: "registrazione/loginToEdit.php",
			data: "email="+email + "&password=" + $("#password-accedi").val(),
			dataType: "html",
			async: false ,
			success: function(risposta){
				if(risposta < 2) {                                   //accesso riuscito
					$("#cambia-dati").modal("hide");
					$("#modifica-dati").modal("show");
					if(risposta == 0) $("#conferma-pass").show();     //se l'account deve essere ancora confermato mostro campo per richiedere codice
				}
				else alert("Email e password non corrispondono!");   //accesso non riuscito
			},
			error: function(){
				alert("Chiamata fallita!!!");
			}
		});
	})


	$("#conferma-codice").click(function(){                    //conferma il codice
		email = $("#email-conferma").html();
		$.ajax({
			type: "POST",
			url: "registrazione/confirmReg.php",
			data: "email="+email + "&codice=" + $("#inserisci-codice").val(),
			dataType: "html",
			async: false ,
			success: function(risposta){
				if(risposta == 0) {                                  //il codice non corrisponde
					alert("Il codice inserito non corrisponde");
				}
				else {                                               //se codice coincide
					alert("Hai completato la registrazione!");
					$("#conferma-registrazione").modal("hide");
				}
			},
			error: function(){
				alert("Chiamata fallita!!!");
			}
		});
	})


	function checkRegistration() {                             // 1 se email già registrata, 0 altrimenti
		mail = $("#email").val();

		//avvisi campi vuoti
		if(mail == "") {alert("Inserisci il campo email"); return 0; }
		if($("#name-registration").val() == "") {alert("Inserisci il campo nome"); return 0; }
		if($("#surname-registration").val() == "") {alert("Inserisci il campo cognome"); return 0; }
		if($("#sesso").val() == "") {alert("Inserisci il campo sesso"); return 0; }
		if($("#password-registration").val() == "") {alert("Inserisci il campo password"); return 0; }
		if($("#password-registration2").val() == "") {alert("Riscrivi la tua password"); return 0; }
		if($("#password-registration2").val() != $("#password-registration").val()) {alert("Le password non corrispondono"); return 0;}

		var x = 1;

		$.ajax({
			type: "POST",
			url: "registrazione/checkReg.php",
			data: "email="+mail,
			dataType: "html",
			async: false ,
			success: function(risposta){
				if(risposta == 0) {
					x = 0;
					alert("Questa mail è già stata registrata");
				}
			},
			error: function(){
				alert("Chiamata fallita!!!");
			}
		});
		return x;
	}

	$("#registrati").click(function(){
		var button = $(this);                                    //seleziono il modale più vicino
		var container = button.closest(".modal");
		var mail = container.find("input[id=email]");
		mail = mail.val();
		var okRegistration = 0;
		var x = checkRegistration();
		if(x==0) return 0;                                       //return 0 se mail già registrata

		// dati da inviare
		data = [];
		data[0] = mail;
		data[1] = $("#name-registration").val();
		data[2] = $("#password-registration").val();
		data[3] = okRegistration;
		data[4] = $("#surname-registration").val();
		data[5] = $("input[name='sesso']:checked").val();
		data[6] = randCode();

		$.ajax({                                                 //crea nuovo user in users.json
			type: "POST",
			url: "registrazione/signIn.php",
			dataType: "html",
			data: {"data":data},
			success: function(risposta){
			},
			error: function(){
				alert("Chiamata fallita!!!");
			}
		});

		$('#registrazione').modal('hide');
		$('#conferma-registrazione').modal('show');              //apre modale di conferma del codice
		$("#email-conferma").html(mail);
	});

	$("#ricevi-codice").click(function() {                     //invia il codice per la conferma della registrazione
		$.ajax({
			type: "POST",
			url: "PHPMailer/email.php",
			data: "email="+mail,
			dataType: "html",
			async: false,
			success: function(risposta){
				alert("Email inviata con successo!");
			},
			error: function(){
				alert("Chiamata fallita!!!");
			}
		});
	})

	function randCode(){                                       //crea codice di conferma
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var code = "";
		for( var i=0; i < 6; i++ )
		code += chars.charAt(Math.floor(Math.random() * chars.length));
		return code;
	}
});
