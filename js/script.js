$(document).ready(function() {

///////////////  Variabili Globali
	var i = 0; //Contatore di note

	var role={ /* ruoli che l'utente ricopre nel documento corrente, ogni array contiene gli url dei documenti */
		chair:[],
		reviewer:[],
		author:[]
	};

	var notes = [];                   //note salvate del documento
	var temporaryNotes = [];	        //note aggiunte e non salvate
	var deleteNotes = [];             //array che contiene le note cancellate in una sessione
	var i=0;                          //indice crescente delle annotazioni
	var range;                        //usato per mantenere selezione dopo aver fatto click su un bottone
	var selectedNote;				//Nota selezionata col doppioClick

	var textReview = "";
	var accepted = "";
	var acceptedChair="";


	$("#user-id").addClass(localStorage.getItem("user"));
	//abilitazione dei tooltip animati
	$("body").tooltip({ selector: '[data-toggle=tooltip]', delay: {show: 800, hide: 300} });

	//Vengono nascosti i bottoni fino a che non è necessario
	$("#note-creator").hide();
	$("#save").hide();
	$("#unsaved").hide();
	$("#edit-panel").hide();
	$("#reader-annotator").hide();
	$("#review, #chair-review").hide();

	window.addEventListener("beforeunload", function(e) {	//rimuovo il lock uscendo dall pagina
		removeLock($(".focus-link").attr('href'), $("#user-id").attr('class').split()[0], 1);
	});

	$(".reloader").click(function(){	//ricarica la pagina clickando sul logo
		location.reload();
	});
	

	fetchName($("#user-id").attr('class').split(' ')[0]);	//Crea lista autori di un articolo sotto il relativo titolo

	function getUser(user) {	//Funzione di utilità, data una stringa rimuove numeri, simboli di punteggiatura
		user = user.replace('@', '');
       		user = user.replace(/\./g, '');
        	user =  user.replace(/-?[0-9]*\.?[0-9]+/, "");
		return user;
	}

	$("#doc-list").empty();
	createList($('#user-id').attr('class').split(' ')[0],role); //carica lista documenti

	$("#reader-annotator").click(function() {	//Switch da annotatore a lettore e viceversa
		if($(this).hasClass("reader")) {
			setLock($(".focus-link").attr("href"), $("#user-id").attr('class').split()[0], $(this), role);
		} else {
			removeLock($(".focus-link").attr("href"), $("#user-id").attr('class').split()[0]);
			$(this).addClass("reader");
			$(this).removeClass("annotator");
			$("#ra-text").html("Reader");
		}
	});
	
	$(document).on("dblclick touchstart", ".nota", function() {		//apertura modale di dettaglio nota al doppio click
		$("textarea").val("");
		selectedNote = $(this);
		var user = getUser($("#user-id").attr('class').split()[0]);
		var classes = $(this).attr("class").toString().split(' ');
		var owner = false;
		for(var i = 0; i < classes.length; i++) {
			if(classes[i] == user) {
				owner = true;
				break;
			}
		}
		if(owner && $("#reader-annotator").hasClass("annotator")) {
			$("#edit-panel").show();
		}
		$("#edit-modal").modal('show');
		$("#note-text").html($(this).html());
		$("#note-comment").html($(this).attr("data-original-title"));
	});

	$(document).on('click', ".conf-doc", function(e) {		//funzione per la creazione dell'area di lavoro

		/*
		*	Quando si clicka su un documento ne si previene l'apertura in una pagina a lato e successivamente
		*	viene indicato come selezionato in modo da facilitare l'accesso alle informazioni associate solo a quello
		*/
		$("#main").css("border","");
		$("#main").css("border-radius", "");
		$("#main").css("padding", "");
		e.preventDefault();

		$("#doc-list a").each(function() {
			$(this).removeClass("focus-link");
		})

		$(this).addClass("focus-link");
		removeLock($(".focus-link").attr('href'), $("#user-id").attr('class').split()[0], 1);

		var url = $(".focus-link").attr("href");
		extractTitle(url);
		loadNotes(url, filter);
		if($("#reader-annotator").hasClass("annotator")){	//Se sono annotatore e cambio documento perdo priorità, devo switchare di nuovo in modalità annotatore
			$("#reader-annotator").removeClass("annotator");
			$("#reader-annotator").addClass("reader");
			$("#ra-text").html("Reader");
		}
		$("#reader-annotator").show();
	})

	$(document).on('click', '#edit', function(){	//modifica la nota selezionata
		
		//per problemi di duplicati coi modali serve selzionare il modale più vicino al bottone edit premuto
		var button = $(this);
		var container = button.closest(".modal");
		var textarea = container.find("textarea");
		var classes = $(selectedNote).attr("class").toString().split(' ');
		var id = classes[2];
		var newText = $(textarea).val();
		replaceComment(selectedNote, newText);
		for(var i = 0; i < temporaryNotes.length; i++) {
			if(temporaryNotes[i]["ref"] == id) {
				temporaryNotes[i]["text"] = newText;
			}
		}
		for(var i = 0; i < notes.length; i++) {
			if(notes[i]["ref"] == id) {
				deleteNotes.push(notes[i]);
				notes[i]["text"] = newText;
			}
		}
		$("#save").show();
		$("#edit-panel").hide();
	})
	
	function replaceComment(selectedNote, newText) {		// funzione che preso in input un nodo controlla se ci sono commenti multipli sul frammento e ne modifica quello relativo all'utente che sta lavorando
		var comments = $(selectedNote).attr("data-original-title").toString().split(";");
		var user = $("#user-id").html();
		for(var i = 0; i < comments.length; i++) {
			if(comments[i].indexOf(user) != -1) {
				if(newText == "") {
					comments.splice(i, 1);
					break;
				} else {
					comments[i] = user+": "+newText;
					break;
				}
			}
		}
		$(selectedNote).attr("data-original-title", comments.join("; "));
	}
	
	$("#delete").click(function(){	//se si accede da doppioclick su nota
		var classes = $(selectedNote).attr("class").toString().split(' ');
		var id;
		for(var i = 0; i < classes.length; i++) {
			if(classes[i].indexOf(getUser($("#user-id").attr("class").split(" ")[0])) != -1 && hasDigits(classes[i])){
				id = classes[i];
				break;
			}
		}
		deleteNote(id);
		$("#save").show();
		$("#edit-panel").hide();
	})
	
	function deleteNote(id) {		//rimuove la nota di id
		var nodes = $("."+id);
		replaceComment($("#main ."+id), "");
		$(nodes).removeClass(id);
		$(nodes).each(function(i, obj){
			classes = $(obj).attr("class").toString().split(' ');
			if(classes.length < 3){
				$(obj).attr("class", "");
				$(obj).attr("data-original-title", "");
				$(obj).attr("data-toggle", "");
			}
		});
		
		var author = id.replace(/\d+/g, '');
		var count = 0;
		for(var i = 0; i < classes.length; i++) {
			if(classes[i].indexOf(author) >= 0) {
				count++;
			}
		}
		if(count < 2) {
			$(nodes).removeClass(author);
		}
		
		classes = $(nodes).attr("class").toString().split(' ');
		if(classes.length < 2) {
			var anchor = $(nodes)[0].innerHTML;
			var s = $(nodes).parent()[0].innerHTML;
			var template = '&nbsp;<span class="" data-original-title="" data-toggle="">$0</span>&nbsp;';
			template = template.tpl([anchor]);
			s = s.replace(template, anchor);
			$(nodes).parent()[0].innerHTML = s;
			$(nodes).contents().unwrap();
		}
		
		for(var i = 0; i < notes.length; i++) {
			if(notes[i]["ref"] == id) {
				deleteNotes.push(notes[i]);
				notes.splice($.inArray(notes[i], notes), 1);
			}
		}
		
		for(var i = 0; i < temporaryNotes.length; i++) {
			if(temporaryNotes[i]["ref"] == id) {
				temporaryNotes.splice($.inArray(temporaryNotes[i], temporaryNotes), 1);
			}
		}
	}
	
	function loadNotes(url, filter) {		//Carica le note associate al documento selezionato
		$.ajax({
			url: "./php/loadNotes.php",
			type: "GET",
			data : {
				url : url
			},

			success: function(result) {
				if (result == 0) {
					notes = [];
					i = lookupIndex();
					deleteNotes = [];
				} else {
					notes = [];
					notes = JSON.parse(result);
					i = lookupIndex();
					deleteNotes = [];
				}
				accepted = "";
				textReview = "";
				loadDocument(url, filter);
			},

			error: function(e) {
				alert(e.status + " " + e.statusText);
			}
		});
	}

	function fetchName(user) {	//recupera il nome ben scritto associato all'id del log in
		$.ajax({
			url:"./php/fetch_name.php",
			type:"GET",
			data :{
				user : user
			},

			success: function(result) {
				$("#user-id").html(result);
			},

			error: function(a) {
				alert("Impossibile visualizzare il nome dell'utente connesso: "+ a.status+" "+ a.statusText);
			}
		});
	}

	function getSelectedText() { //ritorna la selezione di testo
		if(window.getSelection) {
			return window.getSelection();
		} else if(document.getSelection) {
			return document.getSelection();
		} else if(document.selection) {
			return document.selection.createRange().text;
		}
	}

	$("#insert").click(function() { //creazione di una nota se si clicka su insert
		var commentTxt = $("#text-comment").val();
		restoreSelection(range);
		var classAuthor = getUser($('#user-id').attr('class').split(' ')[0]);
		var classNote = classAuthor.concat(i);
		addNote(classNote, commentTxt, localStorage.getItem("user"));
		$("#save").show();
	})

	function addNote(id, text, author) {		//aggiunge i metadati della nota
		note = [];
		note["@context"] = "easyrash.json";
		note["@type"] = "comment";
		note["@id"] = "#author-"+id;
		note["text"] = text;
		note["ref"] = id;
		note["author"] = author;
		var date = new Date();
		note["date"] = date.toISOString();
		temporaryNotes.push(note);
		createNote(id, text);
	}

	$("#save").click(function() {	//salva le note controllando che il lock sul documento sia ancora valido
		checkLock($(".focus-link").attr("href"), $("#user-id").attr('class').split(' ')[0], refresh);
	})

	function refresh() {		//funzione per verificare la correttezza del json-ld già salvato
		$.ajax({
			url: "php/refresh.php",
			type: "GET",
			data: {
				url : $(".focus-link").attr("href"),
				usr : $("#user-id").attr('class').split()[0]
			},
			success: function(result) {
				if(accepted) {
					saveReview(textReview, accepted);
				} else if(acceptedChair){
					saveChairDecision(acceptedChair);
				} else {
					saveToJSON(temporaryNotes, notes);
				}
			},
			error: function(e) {
				alert("Errore refresh...");
			}
		});
	}

	function saveToHTML() {	//Sovrascrive il file html per contenere le note
		$.ajax({
			url: "./php/saveToHTML.php",
			type: "POST",
			data: {
				url:$(".focus-link").attr('href'),
				body:$("#main").html()
			},

			success: function() {
				$(".focus-link").click();
			},

			error: function(e) {
				alert(e.status + " " + e.statusText);
			}
		});
	}

	function saveToJSON(temp, saved) {		//Salva i metadati delle note in un file JSON
		var s1 = to_json(temp);
		var s2 = to_json(saved);
		if(s1) {
			if(s2) {
				s1 += ',';
			}
		}
		s1 += s2;
		$.ajax({
			url: "./php/saveToJSON.php",
			type: "POST",
			data: {
				val : s1,
				user : localStorage.getItem("user"),
				url : $(".focus-link").attr("href")
			},

			success: function(result) {
				saveToHTML();
			},

			error: function(e) {
				alert(e.status + " " + e.statusText);
			}
		});
	}

	function to_json(obj) {		//Trasforma un oggetto in oggetto json ben formattato
		var o = {};
		var s = "";
		var i = 0;

		for(i = 0; i < obj.length; i++) {
			o["@context"] = obj[i]["@context"];
			o["@type"] = obj[i]["@type"];
			o["@id"] = obj[i]["@id"];
			o["text"] = obj[i]["text"];
			o["ref"] = obj[i]["ref"];
			o["author"] = obj[i]["author"];
			o["date"] = obj[i]["date"];

			s += JSON.stringify(o);
			if(i != (obj.length - 1)) {
				s += ',';
			}
		}
		return s;
	}

	function createNote(id, textComment) {  //crea la nota con identificativo id
		var textSelected;
		var s = getSelectedText();
		var r=s.getRangeAt(0);

		var classAuthor = getUser($("#user-id").attr('class').split(' ')[0]);
		var classNote = id;

		if(r.endOffset==0) {	//se la selezione finisce nel nodo in cui è iniziata
			if(s.focusNode.parentElement===s.anchorNode.parentElement.parentElement) 	
				node = s.focusNode.previousElementSibling;
			else
				node = s.focusNode.parentElement.previousElementSibling; 
			end = node.childNodes[node.childNodes.length-1];	
			length = (end.data.length); 
			s.extend(end, length); 
		}

		var r=s.getRangeAt(0);
		if (s.anchorNode.nodeName==null)
			return false;	//se la selezione è vuota termino
		if (s.anchorNode.nodeType==3){ //se ho selezionato del testo

			var anchor = s.anchorNode.parentElement;
			var focus = s.focusNode.parentElement;
			var startRangeNode = r.startContainer; 	
			var startRangeValue = r.startOffset; 	
			var parent = r.commonAncestorContainer;	

			s1 = s.toString();	
			s1 = s1.replace(/\ /g, '');	
			s1 = s1.replace(/\t/g, '');	
			s2 = anchor.textContent;	
			s2 = s2.replace(/\ /g, '');	
			s2 = s2.replace(/\t/g, '');	

			if(Math.abs(s1.length - s2.length) < 3) {	//se il contenuto del testo del nodo padre dell'ancora e quello della selezione differiscono per 3 soli caratteri seleziona tutto
				dad = anchor;
				dad = anchor;
				$(dad).addClass(classAuthor);
				$(dad).addClass("nota");
				$(dad).addClass(id);
				if($(dad).attr("data-original-title") != null){		//In caso di selezione completa di una nota di un altro utente
					var comments = $(dad).attr("data-original-title").toString().split(";");
					var found = false;
					for(var i =0; i < comments.length; i++) {
						if(comments[i].indexOf($("#user-id").html()) != -1) {
							replaceComment(dad, textComment);
							found = true;
							break;
						}
					}
					if(!found) {
						var oldTxt = $(dad).attr("data-original-title");
						$(dad).attr("data-original-title", oldTxt + $("#user-id").html()+": "+textComment+";    ");
					}
				} else {
					$(dad).attr("data-original-title", $("#user-id").html()+": "+textComment+";");
				}
				$(dad).attr("data-toggle", "tooltip");
				var text= $(dad).html();
				$(dad.parentElement).before("  ");
				i++;
				return 1;
			}

			var a = anchor.localName;		
			var b = focus.localName;	
			var count = calculateDifference(anchor, focus); 
			var section = sameSection(anchor.parentElement, focus.parentElement);	
			s2 = focus.textContent;	
			s2 = s2.replace(/\ /g, '');
			s2 = s2.replace(/\t/g, '');


			//se i due nodi sono compatibili e se il primo è un p, un h1 o uno span e se anche il secondo lo è e se la differenza tra le selezioni nei due nodi differisce per 3 caratteri
			if((section) && (a == "p" || a == "h1" || a == "span") && (startRangeValue == 0) && (b == "p" || b == "h1" || b == "span") && (Math.abs(s1.length - count - s2.length) < 3))  {
				tmp = anchor;	
				while(tmp != focus) {	
				if(tmp != null) { 
					$(tmp).addClass(classAuthor);
                    $(tmp).addClass("nota");
					$(tmp).addClass(id);
				}
				if(tmp.nextSibling.nextSibling != null)	
					tmp = tmp.nextSibling.nextSibling;	
				else
					tmp = tmp.nextSibling;	
				}
				//creo la nota
				$(tmp).addClass("nota");
				$(tmp).addClass(classAuthor);
				$(tmp).addClass("nota");
				$(tmp).addClass(id);
				$(tmp).attr("data-original-title", $("#user-id").html()+": "+textComment+";");
				$(tmp).attr("data-toggle", "tooltip");
				i++;
				return 1;
			}

			//Nel caso il testo totale e la selezione differiscano per più di 3 caratteri
			parent = startRangeNode.parentNode;		
			var span = document.createElement('span');	
			$(span).addClass("nota");
			$(span).addClass(classAuthor);
			$(span).addClass("nota");
			$(span).addClass(id);
			$(span).attr("data-original-title", $("#user-id").html()+": "+textComment+";");
			$(span).attr("data-toggle", "tooltip");
			r.surroundContents(span);
			//aggiungo uno spazio prima e dopo
			$(span).after("&nbsp;");
			$(span).before("&nbsp;");
			i++;
			return 1;
		}
	}

	function sameSection(n1 , n2) {		//verifica che i due nodi si trovino nella stessa sezione
		while(n1.localName != 'body') {
			if (n1 == n2)
				return 1;
			n1 = n1.parentElement;
		}
		return 0;
	}

	function calculateDifference(n1, n2) {	//calcola la differenza in lunghezza tra due nodi
		var c = 0;
		while(n1 != n2) {
			if(n1 == n2)
				break;
			if(n1 == null)
				break;
			if(n1 != null && n1.textContent != null) {
				s = n1.textContent;
				s = s.replace(/\ /g, '');
		        s = s.replace(/\t/g, '');
				c += s.length+1;
			}
			n1 = n1.nextSibling;
		}
		return c;
	}

	$("#note-creator").click(function(){ //aggiungi nota a un frammento tramite modale

		var textSelected = "";
		range = saveSelection(); //salva selezione
		try {
			textSelected = checkSelection();
		}
		catch(er) {
			alert(er);
			return false;
		}
		$("#selected-text").html(textSelected);
		$("#text-comment").val("");
	});

	function saveSelection() {   //salva la selezione fatta in modo che persista il testo selezionato
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				return sel.getRangeAt(0);
			}
		} else if (document.selection && document.selection.createRange) {
			return document.selection.createRange();
		}
		return null;
	}

	function checkSelection () {  //verifica che il frammento selezionato sia valido
		var sel = getSelectedText();
		var range=sel.getRangeAt(0);
		var anchor = sel.anchorNode.parentElement;
		var focus = sel.focusNode.parentElement;
		if(range.endOffset==0) {
			if(focus === anchor.parentElement)
				node = sel.focusNode.previousElementSibling;
			else
				node = focus.previousElementSibling;
			end = node.childNodes[node.childNodes.length-1];
			length = (end.data.length);
			sel.extend(end, length);     
		}

		if(sel.toString().length < 4) {
			throw "Errore: Annotazione troppo breve." ;   //se la selezione è troppo corta
		}
		n = sel.anchorNode.parentElement;
		var notSection = 1;

		while(n) {
			if(n.id == "main") {
				notSection = 0;
				break;
			}
			n = n.parentElement;
		}

		if(notSection==1) {
			throw "Errore: sezione non valida." ; //se non siamo dentro main viene sollevata l'eccezione
		}
		var range=sel.getRangeAt(0);
		if (sel.anchorNode.nodeName==null)
			return 0;
		if (sel.anchorNode.nodeType==3){
			var startRangeValue = range.startOffset;
			var parent = range.commonAncestorContainer;

			/*considero la lughezza di s1 e s2 togliendo gli spazi */
			s1 = sel.toString();
			s1 = s1.replace(/\ /g, '');
			s1 = s1.replace(/\t/g, '');
			s2 = anchor.textContent;
			s2 = s2.replace(/\ /g, '');
			s2 = s2.replace(/\t/g, '');

			if(Math.abs(s1.length - s2.length)<3) { //se la nostra selezione coincide con un elemento per meno di 3 caratteri cosidero la selezione dell'intero elemento
				dad = anchor;
				textSelected = $(dad).text();
				return textSelected;
			}

			var a = anchor.localName;
			var b = focus.localName;
			var count = calculateDifference(anchor, focus);
			var section = sameSection(anchor.parentElement, focus.parentElement);

			s2 = focus.textContent;
			s2 = s2.replace(/\ /g, '');
			s2 = s2.replace(/\t/g, '');

			if((section) && (a=="p"||a=="h1") && (startRangeValue == 0) && (b=="p" || b=="h1") && (Math.abs(s1.length - count - s2.length) < 10))  { //se seleziono piu elementi h1 o p
				textSelected = "";
				tmp = anchor;
				while(tmp!=focus) {
					if(tmp!=null) {
						textSelected = textSelected + tmp.textContent + "<br>";
						;
					}
					if(tmp.nextSibling.nextSibling!=null){
						tmp = tmp.nextSibling.nextSibling;
					} else {
						tmp = tmp.nextSibling;
					}
					textSelected += tmp.textContent;
				}
				return textSelected;
			}

			if(anchor != focus)
				throw("Errore: impossibile inserire un'annotazione in questo frammento."); // negli altri casi se i genitori non coincidono sollevo l'eccezione
			return sel.toString();
		}
	}

	$(document).on('click', "#logout", function(e) {
		localStorage.removeItem("user");
		window.open("index.html", "_self");
	});

	function restoreSelection(range) {    //riprende una selezione precedente
		if (range) {
			if (window.getSelection) {
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.selection && range.select) {
            range.select();
        }
		}
	}

	Array.prototype.pushUnique = function (item){ //aggiungi elemento se non gia presente
		if(this.indexOf(item) == -1) {
			this.push(item);
			return true;
		}
		return false;
	}

	function lookupIndex(){	//cerca un indice univodo da cui far partire le note
		var tmp = 0;
		for(var j = 0; j < notes.length; j++) {
			if(notes.hasOwnProperty(j)) {
				var s = notes[j]["ref"].substring(1, notes[j]["ref"].length);
				var i = get_num(s);
				if(i) {
					if(tmp < i[i.length - 1])
						tmp = parseInt(i[i.length - 1]);
				}
			}
		}
		return tmp + 1;
	}

	function get_num(s) {		//data una stringa ritorna una cifra se la contiene
		return s.match(/[0-9]+/g);
	}

	function hasDigits(s) {		//ritorna true se la stringa s contiene una cifra
		var regex = /\d/g;
		return regex.test(s);
	}
	

	String.prototype.tpl = function(o) {	//prende in input un oggetto o e sostituisce ogni $i con o[i]
		var r = this ;
		for (var i in o) {
			r = r.replace(new RegExp("\\$"+i, 'g'),o[i])
		}
		return r
	}
	
	$("#unsaved").click(function() {
		showUnsaved();
	})
	
	function editNote(id) {		//modifica la nota di id=id
		$("#note-text").html($("#main ."+id).html());
		$("#note-comment").html($("#main ."+id).attr("data-original-title"));
		selectedNote = $("#main ."+id);
		$("textarea").val("");
		var user = getUser($("#user-id").attr('class').split()[0]);
		var classes = $(selectedNote).attr("class").toString().split(' ');
		var owner = false;
		for(var i = 0; i < classes.length; i++) {	//controllo la proprieta' della nota
			if(classes[i] == user) {
				owner = true;
				break;
			}
		}
		if(owner && $("#reader-annotator").hasClass("annotator")) {		//se annotatore e proprietario
			$("#edit-panel").show();
		}
		$("#edit-modal").modal('show');
		$("#note-text").html($(selectedNote).html());
		$("#note-comment").html($(selectedNote).attr("data-original-title"));
	}
	
	$(document).on('click', '#edit-button', function() {		//dal modale di note non salvate click su modifica
		var classes = $(this).attr("class").toString().split(' ');
		var id = classes[2];
		$("#unsaved-modal").modal('hide');
		editNote(id)
	})
	
	$(document).on('click', '#delete-button', function(){	//se si cancella dal modale di note non salvate
		var classes = $(this).attr("class").toString().split(' ');
		var id = classes[3];
		var click = $(this).hasClass("click");
		if(click)
			id = classes[4];
		deleteNote(id);
		$("#unsaved").click();
	})
	
	function filter(){		//mostra i filtri per gli autori presenti sul documento
		$("#filters").html("");
		var author=[];
		
		var classAuth = getUser($("#user-id").attr('class').split()[0]);
		author.pushUnique(classAuth);
		for(var i = 0; i < notes.length; i++) {
			var other = getUser(notes[i]["author"]);
			if(other != "nota" && other != classAuth){
				author.pushUnique(other);
			}
		}
		for(var i =0; i < author.length; i++) {
			var tmpl = '<li><a href="#" class="filtro $0" data-toggle="modal" style="color:black; border:1px solid black">$1</a></li>';
			tmpl = tmpl.tpl([author[i], author[i]]);
			$("#filters").append(tmpl);
		}
		
		$(".filtro").removeClass("disable");
	}
	
	$(document).on('click', '.filtro', function() {		//abilita/disabilita il filtro seleizonato
		var classes = $(this).attr('class').toString().split(' ');
		var auth = classes[1];
		if(!$(this).hasClass("disable")) {
			$(this).addClass("disable");
			$("#main ."+auth).each(function(obj, i) {
				$(this).removeClass(auth);
			});
		} else {
			$(this).css("background-colot", "");
			$(this).removeClass("disable");
			$("*[class^='"+auth+"'],*[class*='"+auth+"']").each(function(i, obj) {
				$(this).addClass(auth);
			});
		}
	})
	
	function showUnsaved() {		//creazione modale dinamico in base alle cose da salvare (note, recensioni o decisioni)
		$("#unsaved-field").html("");
		if(temporaryNotes.length == 0 && deleteNotes.length == 0 && accepted == "" && acceptedChair =="") {
			$("#unsaved-field").append("<h4 style='color: #0066ff; text-align: center;'> Niente da salvare </h4>");
		}
		
		var table ="";
		if(temporaryNotes.length != 0) {
			table += "<table class='table table-striped'><tr><th>ID</th><th>Annotazione</th><th>Modifica</th><th>Cancella</th>";
			
			for(var i = 0; i < temporaryNotes.length; i++) {
				var template = "<tr><td>$0</td><td>$1</td><td class='edit-column'><button type='button' data-toggle='modal' data-target='#edit-modal' class='btn-default btn-sm $2' id='edit-button' style='margin-left:8px; color: blue; border: 2px solid blue'>x</button></td><td class='del-column'><button type='button' class='btn btn-default btn-sm $3' id='delete-button' style='margin-right:8px; color:blue; border: 2px solid blue'>x</button></td></tr>";
				template = template.tpl([temporaryNotes[i]["ref"], temporaryNotes[i]["text"], temporaryNotes[i]["ref"], temporaryNotes[i]["ref"]]);
				table += template;
			}
			table += "</table>";
			
			$("#unsaved-field").append(table);
			$("#unsaved-field").append("<br><br>");
		}
		
		if(deleteNotes.length != 0) {
			var table = "<table class='table table-striped'><tr><th>ID</th><th>Annotazione Cancellata</th></tr>";
			for(var i = 0; i < deleteNotes.length; i++) {
				var template = "<tr><td>$0</td><td>$1</td></tr>";
				template = template.tpl([deleteNotes[i]["ref"], deleteNotes[i]["text"]]);
				table += template;
			}
			table += "</table>";
			$("#unsaved-field").append(table);
		}
		
		$("#unsaved-modal").modal('show');
		
		if(accepted != "") {
			$("#unsaved-field").append("<div id='review-area'> </div>");
			if(accepted == "accepted"){
				$("#review-area").append("<h4 style='text-align:center; color: lime'>Articolo accettato</h4>");
				$("#review-area").css("border", "2px solid lime");
				$("#review-area").css("border-radius", "2px");
				$("#review-area").append("<p style='text-align: center'>"+textReview+"</p>")
			}else {
				$("#review-area").append("<h4 style='text-align:center; color: red'>Articolo rifiutato</h4>");
				$("#review-area").css("border", "2px solid red");
				$("#review-area").css("border-radius", "2px");
				$("#review-area").append("<p style='text-align: center'>"+ textReview+ "</p>") 
			}
		}
    
    
		if(acceptedChair != "") {
			$("#unsaved-field").append("<div id='chair-review-area' style='border:2px solid black'> </div>")
			if(acceptedChair == "accepted"){
				$("#chair-review-area").append("<h4 style='text-align:center; color: lime'>Articolo accettato da parte del chair</h4>");
			} else{
				$("#chair-review-area").append("<h4 style='text-align:center; color: red'>Articolo rifiutato da parte del chair</h4>");
			}
		}
	}

	$(document).on("click", "#chair-review", function() {	//click su "Recesioni se si e' chair del documento
		exactReviewer($(".focus-link").attr("href"), localStorage.getItem("user"), effectiveReviewer, checkDecision, fetchDecision, fetchReview);
	})
	
	function exactReviewer(url, usr, effectiveReview, checkDecision, fetchDecision, fetchReview) {			//Trova tutti i reviewer designati
		$.ajax({
			type: "GET",
			url: "./php/exact_reviewer.php",
			data: {
				url : url
			},
			
			success: function(result) {
				effectiveReviewer(url, usr, result, checkDecision, fetchDecision, fetchReview);
			}
		});
	}
	
	function effectiveReviewer(url, usr, x, checkDecision, fetchDecision, fetchReview) {		//Trova i reviewer che hanno effettivamente recensito
		$.ajax({
			type: "GET",
			url: "./php/effective_reviewers.php",
			data: {
				url: url
			},
			
			success: function(result) {
				checkDecision(url, usr, x, result, fetchDecision, fetchReview);
			}
		});
	}
	
	function checkDecision(url, usr, x, y, fetchDecision, fetchReview) {		//Controllo lo stato delle recensioni
		$.ajax({
			type: "GET",
			url: "./php/check_decision.php",
			data: {
				url : url,
				usr: usr
			},
			
			success: function(result) {
					$("#main").css("border-radius", "10px");
					$("#main").css("padding", "10px");
				if(y < x) {		//non tutti i reviewer hanno finito
					missingReview(url);
					$("#main").css("border", "3px solid orange");
				}else if(result == 0) {		//Il chair ha fatto una decisione e viene mostrata e se presenti vengono mostrate anche quelle di altri chair
					fetchDecision(url, usr);
				}else{	//non è presente una decisione da parte del chair che sta visionando, vengono quindi mostrate le recensioni dei revisori
					fetchReview(url);
					$("#main").css("border", "3px solid blue");
				}
			}
		});
	}
	
	function missingReview(url) {		//Mostro i reviewer che mancano
		$.ajax({
			type: "GET",
			url: "./php/missing_review.php",
			data: {
				url: url
			},
			
			success: function(result) {
				var list = $("<ul></ul>");
				var obj = JSON.parse(result);
				for(i in obj) {
					if(obj.hasOwnProperty(i)) {
						var template = "<li>$0</li>";
						template = template.tpl([obj[i]]);
						list.append(template);
					}
				}
				var template = '<button type="button" class="close" data-dismiss="modal">x</button>';
				var template2 = '<h4> Revisori che devono ancora completare: </h4>';
				$("#chair-review-header").empty();
				$("#chair-review-header").append(template);
				$("#chair-review-header").append(template2);
				$("#chair-review-body").empty();
				$("#chair-review-body").append(list);
			}
		});
	}
	
	function fetchDecision(url, usr) {	//recupero la decisione relativa all'articolo
		$.ajax({
			type: "GET",
			url: "./php/fetch_decision.php",
			data: {
				url : url,
				usr : usr
			},
			
			success: function(result) {
				var obj = JSON.parse(result);
				var t1 = '<button type="button" class="close" data-dismiss="modal">x</button>';
				var t2 = '<h2 class="modal-title"> Elenco recensioni chair </h2>';
				$("#chair-review-header").empty();
				$("#chair-review-header").append(t1);
				$("#chair-review-header").append(t2);
				$("#chair-review-body").empty();
				var t3 = '<table class="table table-striped"><tr><th>Chair</th><th>Decisione</th></tr>';
				var s;
				for(var i = 0; i < obj["stato"].length; i++) {
					var t4 = '<tr><td>$0</td><td>$1</td></tr>';
					if(obj["stato"][i] == "pso:rejected-for-publication") {
						$("#main").css("border", "3px solid red");
						s="Rifiutato";
					} else {
						$("#main").css("border", "3px solid lime");
						s="Accettato";
					}
					t4 = t4.tpl([obj["autore"][i], s])
					t3 += t4;
				}
				t3 += "</table>";
				$("#chair-review-body").append(t3);
			},
			
			error: function(e) {
				alert("E' successo un errore: "+ e.status + " " + e.statusText);
			}
		});
	}

	function fetchReview(url) {		//recupero le recensioni se presenti con relativi autori e stati
		$.ajax({
			type: "GET",
			url: "./php/fetch_review.php",
			data: {
				url : url
			},
			
			success: function(result) {
				var obj = JSON.parse(result);
				var t1 = '<button type="button" class="close" data-dismiss="modal">x</button>';
				var t2 = '<h2 class="modal-title">Elenco Recensioni</h2>';
				$("#chair-review-header").empty();
				$("#chair-review-header").append(t1);
				$("#chair-review-header").append(t2);
				$("#chair-review-body").empty();
				var t3= '<table class="table table-striped"> <tr><th>Autore</th><th>Stato</th><th>Testo</th></tr>';
				var s = "";
				for(var i = 0; i < obj["stato"].length; i++) {
					var t4 = '<tr><td> $0 </td><td> $1 </td><td> $2 </td></tr>';
					if(obj["stato"][i] == "pso:rejected-for-publication") {
						s = "Rifiutato";
					} else {
						s = "Accettato";
					}
					t4 = t4.tpl([obj["autore"][i], s, obj["testo"][i]]);
					t3 += t4;
				}
				
				t3 += "</table>";
				$("#chair-review-body").append(t3);
				$("#chair-review-body").append('<button style="float: right; color: lime; border:2px solid lime" type="button" class="btn btn-default accepted send-chair-decision" data-dismiss="modal">Accettato</button>');
				$("#chair-review-body").append('<button style="float: left; color: red; border:2px solid red" type="button" class="btn btn-default rejected send-chair-decision" data-dismiss="modal">Rifiutato</button></br></br>');
				if(acceptedChair) {
					$("."+acceptedChair).css("background-color", "#ffff99");
				}
			},
			
			error: function(e) {
				alert("E' successo un errore: "+ e.status + " " + e.statusText);
			}
		});
	}

	$(document).on('click', ".send-chair-decision", function(){	//Sto salvando una decisione come chair
		if($(this).hasClass("accepted")){
			acceptedChair = "accepted";
		} else {
			acceptedChair = "rejected";
		}
		$("."+acceptedChair).css("background-color", "#ffff99");
		$("#save").show();
	})

	$("#review").click(function() {		//Al click su "Recensioni" se si e' reviewer
			checkReview();
	})
	
	function checkReview() {	//controllo le recensioni presenti
		$.ajax({
			type: "GET",
			url: "./php/check_review.php",
			data:{
				url : $(".focus-link").attr("href"),
				usr: $("#user-id").attr('class').split(' ')[0],
			},
			
			success: function(result) {
				if(result == 0) {
					$("#review-header").empty();
					$("#review-header").append("<button type='button' class='close' data-dismiss='modal'>x</button>");
					$("#review-body").empty();
					$("#review-header").append('<h2 style="text-align:center">Una tua recensione è già presente nell articolo </h4>');
					extractSpecificReview();
				} else {
					$("#review-header").empty();
					$("#review-header").append('<button type="button" class="close" data-dismiss="modal">x</button>');
					$("#review-body").empty();
					extractSpecificReview(1);
				}
			},
			
			error: function(e){
				alert("E' successo un errore: "+ e.status + " " + e.statusText);
			}
		});
	}

	function extractSpecificReview(index) {		//specificatamente per l'utente collegato controllo lo stato della sua recensione se presente la mostro, se non presente viene mostrata textarea per scrivere recensione
		var url = $(".focus-link").attr("href");
		var usr = $('#user-id').attr('class').split(' ')[0];
		$.ajax({
			type : "GET",
			url: "./php/fetch_review.php",
			data:{
				url : url,
				usr : usr
			},
			
			success: function(result) {
				var obj = JSON.parse(result);
				if(obj["autore"].length) {
					var t1 = '<table class="table table-striped"> <tr><th>Autore</th><th>Stato</th><th>Testo</th></tr>';
					var s;
					for(var i =0; i < obj["stato"].length; i++) {
						var t2 = '<tr><td>$0</td><td>$1</td><td>$2</td></tr>';
						if(obj["stato"][i]=="pso:rejected-for-publication") {
							s = "Rifiutato";
						} else {
							s = "Accettato";
						}
						t2 = t2.tpl([obj["autore"][i],s,obj["testo"][i]]);
						t1 += t2;
					}
					t1 += "</table>";
					$("#review-header").hide();
					$("#review-body").append('<button type="button" class="close" data-dismiss="modal">x</button>');
					if(index) {
						$("#review-body").append('<h2 class="modal-title">Recensioni presenti</h2>')
					} else {
						$("#review-body").append('<h2 class="modal-title">Una tua recensione è già presente</h2>');
					}
					$("#review-body").append("</hr>");
					$("#review-body").append(t1);
					if(index) {
						if(index == 1) {
							$("#review-body").append('<h4 class="modal-title">Scrivi la review dell articolo</h4>');
							$("#review-body").append('</hr>');
							$("#review-body").append('<textarea class="form-control" id="text-review" place-holder="Scrivi una recensione per l articolo" style="min-width: 100%"></textarea><br>');
							$("#review-body").append('<button type="button" class="btn btn-default accepted send-review" style="float:right; color:lime; border:2px solid lime" data-dismiss="modal" id="sendreview">Accettato</button>');
							$("#review-body").append('<button type="button" class="btn btn-default rejected send-review" style="float:left; color:red; border: 2px solid red" data-dismiss="modal" id="sendreview">Rifiutato</button></br></br>');
							$("#text-review").val(textReview);
							if(accepted) {
								$("."+accepted).css("background-color", "#ffff99");
							}
						}
					}
				} else {
					if(index){
						$("#review-header").show();
						$("#review-header").empty();
						$("#review-header").append('<button type="button" class="close" data-dismiss="modal">x</button>');
						$("#review-header").append('<h2 class="modal-title">Scrivi la review dell articolo</h2>');
						$("#review-body").empty();
						$("#review-body").append('<textarea class="form-control" id="text-review" place-holder="Scrivi una recensione globale sull articolo" style="min-width:100%"></textarea><br>');
						$("#review-body").append('<button type="button" class="btn btn-default accepted send-review" style="float:right; color:lime; border:2px solid lime" data-dismiss="modal" id="sendreview">Accettato</button>');
						$("#review-body").append('<button type="button" class="btn btn-default rejected send-review" style="float:left; color:red; border: 2px solid red" data-dismiss="modal" id="sendreview">Rifiutato</button></br></br>');
						$("#text-review").val(textReview);
						if(accepted) {
							$("."+accepted).css("background-color", "#ffff99");
						}
					}
				}
			},
			
			error: function(e) {
				alert("E' successo un errore nel mostrare una tua recensione già effettuata: "+ e.status+" "+ e.statusText);
			}
		});
	}

	$(document).on('click', ".send-review", function(){		//invio di una recensione
		textReview = $("#text-review").val();
		if($(this).hasClass("accepted")) {
			accepted = "accepted";
		} else {
			accepted = "rejected";
		}
		$("."+accepted).css("background-color", "#ffff99");
		$("#save").show();
	})

	function saveChairDecision(a) {		//salvataggio decisione finale
		var d = new Date();
		d = d.toISOString();
		var stato = "";
		if(a == "accepted") {
			stato = "pso:accepted-for-publication";
		}else{
			stato = "pso:rejected-for-publication";
		}
		$.ajax({
			type: "POST",
			url: "./php/save_decision.php",
			data: {
				date : d,
				stato : stato,
				usr : $("#user-id").attr("class").split(' ')[0],
				url : $(".focus-link").attr("href")
			},
			
			success: function(result) {
				acceptedChair = "";
				saveToJSON(temporaryNotes, notes);
			},
			
			error: function(e) {
				alert("E' successo un errore: "+e.status +" " + e.statusText);
			}
		});
	}

	function saveReview(text, status){		//salvataggio della propria recensione
		var d = new Date();
		d = d.toISOString();
		var result = "";
		if(status == "accepted") {
			result = "pso:accepted-for-publication";
		} else {
			result = "pso:rejected-for-publication";
		}
		$.ajax({
			type: "POST",
			url: "./php/save_review.php",
			data: {
				text : text,
				date: d,
				status : result,
				usr : $("#user-id").attr("class").split(' ')[0],
				url : $(".focus-link").attr("href")
			},
			
			success: function(result) {
				accepted = "";
				if(acceptedChair) {
					saveChairDecision(acceptedChair);
				} else {
					saveToJSON(temporaryNotes, notes);
				}
			},
			
			error: function(e) {
				alert("E' successo un errore: "+e.status+" "+e.statusText);
			}
		});
	}
});
