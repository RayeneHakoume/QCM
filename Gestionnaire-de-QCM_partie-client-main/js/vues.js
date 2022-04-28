/* global state getQuizzes getUser getMyQuizzes getMyRep */

// //////////////////////////////////////////////////////////////////////////////
// HTML : fonctions génération de HTML à partir des données passées en paramètre
// //////////////////////////////////////////////////////////////////////////////

//VARIABLE GLOBALE (elle nous aide dans la fonction d'envoie des réponses au serveur)
let idQForm;
let newQuestionForm;
let nbPropForm;
let tabRepondant=[];
let tabNbRepondant=[];
let tabSansDouble=[];
// génération d'une liste de quizzes avec deux boutons en bas
const htmlQuizzesList = (quizzes, curr, total) => {
  console.debug(`@htmlQuizzesList(.., ${curr}, ${total})`);

  const quizzesLIst = quizzes.map(
    (q) =>
      `<li class="collection-item modal-trigger cyan lighten-5" data-target="id-modal-quizz-menu" data-quizzid="${q.quiz_id}">
        <h5>${q.title}</h5>
        ${q.description} <a class="chip">${q.owner_id}</a>
      </li>`
  );
  
   const prevBtn =
    curr !== 1
      ? `<button id="id-prev-quizzes" data-page="${curr -
          1}" class="btn amber accent-3"><i class="material-icons">navigate_before</i></button>`
      : '';

  // le bouton ">" pour aller à la page suivante, ou rien si c'est la première page
  const nextBtn =
    curr !== total
      ? `<button id="id-next-quizzes" data-page="${curr +
          1}" class="btn amber accent-3"><i class="material-icons">navigate_next</i></button>`
      : '';  
	
    let HTML="";
    for(let i=0;i<total;i++){
		if (i+1==curr){ HTML=HTML+`			<button class="btn waves-effect deep-orange" id="page`+i+`">${i+1}</button>		`}
		else{ HTML=HTML+`		<button  onclick ="getQuizzes(${i+1})"  class="btn-small waves-effect blue-grey darken-2" id="page`+i+`">${i+1}</button>		`} 
	}

  // La liste complète et les deux boutons en bas 
  let html = `
  <ul class="collection">
    ${quizzesLIst.join('')}
  </ul>
  <div class="row center-align"> 
    
	<ul class="pagination">${prevBtn} ${HTML} ${nextBtn}</ul>
    
  </div>`

  return html;
};

// //////////////////////////////////////////////////////////////////////////////
// RENDUS : mise en place du HTML dans le DOM et association des événemets
// //////////////////////////////////////////////////////////////////////////////

//rendu TOUS LES QUIZ
function renderQuizzes() {
	
  console.debug(`@renderQuizzes()`);

  const usersElt = document.getElementById('id-all-quizzes-list');
  const modalPartie1 = document.getElementById('contentmodal1');
  const modalPartie2 = document.getElementById('contentmodal2');
  const modalPartie3 = document.getElementById('contentmodal3');

  
  usersElt.innerHTML = htmlQuizzesList(
    state.quizzes.results,        //quizzes 
    state.quizzes.currentPage,    //curr 
    state.quizzes.nbPages         //total
  );

  const prevBtn = document.getElementById('id-prev-quizzes');
  const nextBtn = document.getElementById('id-next-quizzes');

  const quizzes = document.querySelectorAll('#id-all-quizzes-list li'); 

  function clickBtnPager() {
    getQuizzes(this.dataset.page);
  }
  
  if (prevBtn) prevBtn.onclick = clickBtnPager;
  if (nextBtn) nextBtn.onclick = clickBtnPager;
  
  function clickQuiz() {
    const quizzId = this.dataset.quizzid;
    console.debug(`@clickQuiz(${quizzId})`);
    if (quizzId != undefined){
    
		const addr = `${state.serverUrl}/quizzes/${quizzId}`;
		return fetch(addr, { method: 'GET', headers: state.headers })	                 
	      .then(filterHttpResponse)	
	      .then((data) => {	
			if (data === undefined){
            console.log('data inexistant');
            alert('Ce quizz a été supprimé, choisissez en un autre ! ');
            }else{
			
				console.log("Quizz de la liste clické");
				console.log(data);
				state.open=data.open;
				state.currentQuizz = quizzId;
				state.ownerQuizz=data.owner_id;
				state.title=data.title;
				state.description=data.description;
				state.currentQuizzNbQuestions = data.questions_number;	
				const html = `<p><h3 style="color:#0e086f; ">Voici le quizz numéro ${state.currentQuizz}: </h3><h3 style="color:#ed8012;">${data.title}</h3><h6 style="color:#1a8e20;">Thème: ${data.description}</h6></p>`;	
				modalPartie1.innerHTML = html;	
				modalPartie2.innerHTML ="";	
				modalPartie3.innerHTML ="";
				getMyRep;	
				if(state.open){
				renderCurrentQuizz();
				}else{renderCurrentQuizzClose();}
			    }
			
				                                                  
	      });	
	}
  }
	  
  quizzes.forEach((q) => {
    q.onclick = clickQuiz;
  });
  
}

//rendu au click d'un quiz de TOUS LES QUIZ
function renderCurrentQuizz(){ 	
  
  console.debug(`@renderCurrentQuizz()`);
  
  const addr = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;	
  fetch(addr, { method: 'GET', headers: state.headers })	
	.then(filterHttpResponse)	
	.then((data) => {	
	  state.REPONDU=false; 
	  console.log("Detail question du quizz clické");
	  console.log(data);
	  const main = document.getElementById('id-all-quizzes-main');	
	  let html = `</br> <h6 class="center-align" >Titre du quiz: <i class="deep-orange-text">${state.title}</i> </h6>
				  <h6 class="center-align" >Description: <i class="blue-grey-text text-darken-2">${state.description} </i></h6>
				  <p class="center-align" >Créé par: <i class="amber-text text-amber darken-2">${state.ownerQuizz}</i></p>
				  <form>`;	
	  
	  for(let k=0; k<state.NbTotalRep;k++){	
		  if (state.currentQuizz == state.MyRep[k].quiz_id){
			  
			      state.REPONDU=true; 	
				  for (let i = 0; i < state.currentQuizzNbQuestions; i++) {	
					
					if (state.MyRep[k].answers[i]==undefined) 
					{	console.log('Question pas rep ');
						html = html + `<fieldset id="formulaire` + i + `">`	
					    html = html + `<legend>Question ` + (i + 1) + ` : ` + data[i].sentence + `</legend>`;	 
					    for (let j = 0; j < data[i].propositions_number; j++) 	
					    {	
						  html = html + `<p><label><input type="radio" id="` + j + `"onclick= "envoieSansBtn(${i}, ${j})""`+ `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;	
					    }	
					    html = html + `</fieldset>`;	
					}
                    else {console.log('Question REPONDU ');
						html = html + `<fieldset id="formulaire` + i + `">`	
						html = html + `<legend>Question ` + (i + 1) + ` : ` + data[i].sentence + `</legend>`;
						for (let j = 0; j < data[i].propositions_number; j++) 	
						{							
							if (j === state.MyRep[k].answers[i].proposition_id){
								
								html = html + `<p><label><input onclick="envoieSansBtn(${i},${j})" class="btn` + i + `-`+ j +`" type="radio" id="` + j + `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"checked/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;	

							}else{html = html + `<p><label><input onclick="envoieSansBtn(${i},${j})" class="btn` + i + `-`+ j +`" type="radio" id="` + j + `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;	}
						}	
						html = html + `</fieldset>`;  	
					}	
				  }	
		  }
      }
      
	  if (state.REPONDU ==true) 
	  console.log('Vous avez déja repondue à ce quizz!');
	  else{
		  console.log('Quizz non repondu  pour le moment ');
		  for (let i = 0; i < state.currentQuizzNbQuestions; i++) {
			  console.log('QUESTION PAS REP');	
			  html = html + `<fieldset id="formulaire` + i + `">`	
			  html = html + `<legend>Question ` + (i + 1) + ` : ` + data[i].sentence + `</legend>`;	 
			  for (let j = 0; j < data[i].propositions_number; j++) 	
			  {	
				html = html + `<p><label><input type="radio" id="` + j + `"onclick= "envoieSansBtn(${i}, ${j})""`+ `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;	
			  }	
			  html = html + `</fieldset>`;			
		  }	
	  }	  
	  	  
	  main.innerHTML = html;	
	  
	});
}


function envoieSansBtn(idQuestion,idProposition){
	
	console.debug(`@envoieSansBtn()`);
	if (state.xApiKey != ''){
		
		const url = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions/${idQuestion}/answers/${idProposition}`;
		fetch(url, { method: 'POST', headers: state.headers() })
		
		alert("votre réponse a bien été prise en compte!");
		getMyRep();
		
	}else alert("Veuillez vous authentifier pour pouvoir envoyer vos réponses");
	
}



//rendu des quiz fermés dans TOUS LES QUIZ
function renderCurrentQuizzClose(){

  console.debug(`@renderCurrentQuizzCLose()`);
  
  const addr = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;	
  fetch(addr, { method: 'GET', headers: state.headers })	
	.then(filterHttpResponse)	
	.then((data) => {	
	  const main = document.getElementById('id-all-quizzes-main');	
	  let html = `<h5 class="center-align" style="color:#e02730;">Ce quiz est fermé, vous ne pouvez pas y répondre. Choisissez en un autre.</h5>`;	
	  html = html+ `</br> <h6 class="center-align" >Titre du quiz: <i class="deep-orange-text">${state.title}</i> </h6>
						  <h6 class="center-align" >Description: <i class="blue-grey-text text-darken-2">${state.description} </i></h6>
						  <p class="center-align" >Créé par: <i class="amber-text text-amber darken-2">${state.ownerQuizz}</i></p>
						  <form>`;	
	  for (let i = 0; i < state.currentQuizzNbQuestions; i++) {	
		html = html + `<fieldset id="formulaire` + i + `">`	
		html = html + `<legend>Question ` + (i + 1) + ` : ` + data[i].sentence + `</legend>`;	
	
		for (let j = 0; j < data[i].propositions_number; j++) 	
		{	
		  html = html + `<p><label><input type="radio" id="` + j + `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"disabled/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;	
		}	

		html = html + `</fieldset>`;	
			
	  }	
	  
	  main.innerHTML = html;	
	  
	});	
	
}

//rendu MES QUIZ
function renderMyQuizzes(){
	
	console.debug(`@renderMyQuizzes()`);

    const usersElt = document.getElementById('id-all-my-quizzes-list');
	const modalPartie1 = document.getElementById('contentmodal1');
    formCreateQuizz();
    formCreateQuestion();
    
    let titre=`</br><h4 style="color:#1a8e20;">Voici la liste de vos quiz</h4>`;
    let liste= titre + htmlQuizzesList(state.Myquizzes,1,1);
    usersElt.innerHTML = liste;

    const quizzes = document.querySelectorAll('#id-all-my-quizzes-list li');
    
    function clickQuiz() {
			const quizzId = this.dataset.quizzid;
			console.debug(`@clickQuiz(${quizzId})`);
			const addr = `${state.serverUrl}/quizzes/${quizzId}`;
			return fetch(addr, { method: 'GET', headers: state.headers })	                 
				  .then(filterHttpResponse)	
				  .then((data) => {	
					console.log("Mon quizz");
					console.log(data);
					state.open=data.open;
					console.log(state.open);
					const html = `<p><h3 style="color:#0e086f; ">Voici votre quizz numéro ${quizzId}: </h3><h3 style="color:#ed8012;">${data.title}</h3><h6 style="color:#1a8e20;">Thème: ${data.description}</h6></p>`;	
					modalPartie1.innerHTML = html;	
					state.currentQuizz = quizzId;	
					state.currentQuizzNbQuestions = data.questions_number;	
					
					detailMonQuizz();	
					                                                  
				  });	
	  }
	  
     quizzes.forEach((q) => {
		q.onclick = clickQuiz;
      });
  
}

//rendu au click d'un quiz de MES QUIZ
function detailMonQuizz() {	
	
  console.debug(`@detailMonQuizz()`);
  const addr = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;	
  fetch(addr, { method: 'GET', headers: state.headers })	
	.then(filterHttpResponse)	
	.then((data) => {
		console.log("dataaaaa");
		console.log(data);	
	  let main=document.getElementById('contentmodal2');	
	  let html = `<form>`;	
	  let main2=document.getElementById('contentmodal3');	
	  let html2 ='';
	  
	  if(state.open){ html2 = html2+ `<h3 style="color:#0e086f;">Voici la liste des répondants à ce quiz! </h3>`}else{html2 = html2+ `<h5>Ce quizz est fermé</h5>`}
	  
	  if(data.length==0){
		  
		  		console.log("quizz vide");
				html2 = html2+ `<h6>Ce quizz est vide pour le moment! Personne ne peut donc y répondre</h6>`
				main.innerHTML = '';
				main2.innerHTML = html2;	
			
	  }else{
		  
		
		  for (let i = 0; i < state.currentQuizzNbQuestions; i++) {	
			html = html + `<fieldset id="formulaire` + i + `">`	
			html = html + `<legend>Question ` + (i + 1) + ` : ` + data[i].sentence + `</legend>`;	
		
			for (let j = 0; j < data[i].propositions_number; j++) 	
			{	
			  html = html + `<p><label><input type="radio" id="` + j + `"name="` + data[i].question_id  + `"value="` + data[i].propositions[j].content +`"disabled/> <span>` + data[i].propositions[j].content + `</span> </label> </p>`;	
			}	

			html = html + `</fieldset>`;
			main.innerHTML = html;	
			
			

			
		const url = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions/${i}/answers/`;
        fetch(url, { method: "GET", headers: state.headers() })
        .then(filterHttpResponse)
        .then((data) => {
			
	        if(state.open){ 
				console.log("répondant à la question");
				console.log(data);
				console.log(i);
				html2 = html2+ `<h6 style="color:#ed8012;">Répondants à la question ${i}: </h6>`
				for (let k=0; k<data.propositions.length; k++){

					for(let l=0; l<data.propositions[k].answers.length;l++){
						 
					console.log(data.propositions[k].answers[l].user_id);
					tabRepondant.push(data.propositions[k].answers[l].user_id);
					html2 = html2 + `<div> ${data.propositions[k].answers[l].user_id}</div></div>`
					
					}
				}
			}
		   main2.innerHTML = html2;	

	  	  let report = {};

		  tabRepondant.forEach(function(el){
			report[el] = report[el] + 1 || 1;
		  });
				
		  function getCount(arr,val)
		  {
			let ob={};
			let len=arr.length;
			for(let k=0;k<len;k++)
			{
				if(ob.hasOwnProperty(arr[k]))
				{
					ob[arr[k]]++;
					continue;
				}
				ob[arr[k]]=1;
			}
			return ob[val];
		   }

			state.Repondants=tabRepondant.filter((item,index) => tabRepondant.indexOf(item) === index);
			state.Repondants.sort();
			
			/*function repondants(){
				return state.Repondants;
			}
			state.Repondants.forEach(function(el){
			  html2 = html2 + `<div> ${el} </div>`
			});
			sansDoublon.map(function(x) { console.log(x);
															html2 = html2 + `<div> ${x} </div>`});
			
			main2.innerHTML = html2;*/
			console.log(tabRepondant);
			console.log(report);
			console.log(Object.values(report));	
			//console.log(getCount(tabRepondant,numEtu));
			console.log(state.Repondants);
			
		 });
	    }

			
	  }		 
		 
	});
}

//rendu MES REPONSES
function renderMyRep(){
	
		console.debug(`@renderMyRep()`);

		const usersElt = document.getElementById('id-all-answers-list');
		const modalPartie1 = document.getElementById('contentmodal1');
		const modalPartie2 = document.getElementById('contentmodal2');
		const modalPartie3 = document.getElementById('contentmodal3');

		
		let titre=`</br><h4 style="color:#1a8e20;">Voici la liste des quiz répondu</h4>`;
		let liste= titre + htmlQuizzesList(state.MyRep,1,1);
		usersElt.innerHTML = liste;

		const quizzes = document.querySelectorAll('#id-all-answers-list li');
        
		function clickQuiz() {
				const quizzId = this.dataset.quizzid;
				console.debug(`@clickQuiz(${quizzId})`);
				const addr = `${state.serverUrl}/quizzes/${quizzId}`;
				return fetch(addr, { method: 'GET', headers: state.headers })	                 
					  .then(filterHttpResponse)	
					  .then((data) => {	
						console.log("Mon quiz répondu clické");
						console.log(data);
						
						const html = `<p><h3 style="color:#0e086f; ">Voici le quizz numéro ${quizzId} auquel vous avez répondu: </h3><h3 style="color:#ed8012;">${data.title}</h3><h6 style="color:#1a8e20;">Thème: ${data.description}</h6></p>`;	
						modalPartie1.innerHTML = html;
						modalPartie2.innerHTML = "";
						modalPartie3.innerHTML = "";	
						
						state.currentQuizz = quizzId;	
						state.currentQuizzNbQuestions = data.questions_number;
						state.title=data.title;	
						getMyRep();
						detailMaRep();	  
					  });	
		  }
		  
		 quizzes.forEach((q) => {
			q.onclick = clickQuiz;
		  });
  
}

//rendu au click d'un quiz de MES REPONSES
function detailMaRep(){
	
	console.debug(`@detailMaRep()`);
	
	const addr = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;	
    fetch(addr, { method: 'GET', headers: state.headers })	
	.then(filterHttpResponse)	
	.then((data) => {	
	  let main=document.getElementById('id-all-answers-main');	
	  let html = `<form></br> </br> </br> </br>`;	
	  	
		for(let j=0; j<state.NbTotalRep;j++){
			
			if( state.currentQuizz == state.MyRep[j].quiz_id){
					
				
				html = html + `<fieldset id="formulaire">`
				html = html + `<legend style="font-size:  x-large;">Vos réponses au quiz : ${state.title}</legend>`;
				for (let i = 0; i < state.currentQuizzNbQuestions; i++) {	
				
					if (state.MyRep[j].answers[i]==undefined) 
					{	
						html = html + `<p><h6 style="color:#0e086f;" > Pour la question ${i+1}: ${data[i].sentence}</h6>`	
						html = html + ` Vous n'aviez pas répondu</br></br></br>`;
					}
					else{
						html = html + `<p><h6 style="color:#0e086f;" > Pour la question ${i+1}: ${data[i].sentence}</h6>`	
						html = html + ` Vous aviez repondu: <i style="color:#f15212;"> ${data[i].propositions[state.MyRep[j].answers[i].proposition_id].content} </i></p></br>`;
					}	
					
				}
					
				html = html + `</fieldset>`;
			}	
			
	    }		
	    main.innerHTML = html;
	  
	});
	
}

//rendu de la partie gauche de MES QUIZZ  (dédié à l'affichage des quiz du user) si user non connecté	 
function renderMyQuizzesNoConnect(){
	
	console.debug(`@renderMyQuizzesNoConnect()`);
	
	let main=document.getElementById('id-all-my-quizzes-list');	
	let html= `<h4 style="color:#1a8e20;">Connectez vous pour voir vos quizz ici!</h4>`;
	main.innerHTML = html;	

}

//rendu de la partie central de MES QUIZZ  (dédié à l'affichage d'un formulaire de création d'un nouveau quiz) si user non connecté	
function renderCreateQuizNoConnect(){

	console.debug(`@renderCreateQuizNoConnect()`);
	
	let main=document.getElementById('id-all-my-quizzes-main');	
	let html= `<h4 style="color:#ed8012;">Connectez vous pour pouvoir créer un nouveau quizz ici!</h4>`;
	main.innerHTML = html;	

}

//rendu de la partie de droite de MES QUIZZ  (dédié à l'affichage d'un formulaire de création d'une nouvelle question) si user non connecté	
function renderCreateQuestionNoConnect(){

	console.debug(`@renderCreateQuestionNoConnect()`);
	
	let main=document.getElementById('id-all-my-quizzes-main2');	
	let html= `<h4 style="color:#0e086f;">Connectez vous pour pouvoir créer une nouvelle question ici!</h4>`;
	main.innerHTML = html;	

}

//rendu de MES REPONSES si user non connecté
function renderMyRepNoConnect(){

	console.debug(`@renderMyRepNoConnect()`);
	
	let liste=document.getElementById('id-all-answers-list');	
	let html= `<h4 style="color:#1a8e20;">Connectez vous pour voir vos réponses ici!</h4>`;
	liste.innerHTML = html;	
	let main=document.getElementById('id-all-answers-main');
	main.innerHTML="";

}

//rendu du formulaire de création d'un nouveau quiz
function formCreateQuizz(){
	
	console.debug(`@formcreateQuizz()`);
	
	const main= document.getElementById('id-all-my-quizzes-main');

	const form=`</br>
				  <h4 style="color:#ed8012;" >Créer votre quizz ici</h4>
					  <div class="row">
						<form class="col s12" id="formCreerQuizz">
						  <div class="row">
							<div class="input-field col s12">
							  <textarea id="titre" class="materialize-textarea"></textarea>
							  <label for="textarea1">Titre</label>
							</div>
						  </div>
						  <div class="row">
							<div class="input-field col s12">
							  <textarea id="descr" class="materialize-textarea"></textarea>
							  <label for="textarea1">Description</label>
							</div>
						  </div>
						  
						  <div class="row center-align">
							<button class="waves-effect waves-light btn-small orange darken-3" onclick="createQuizzServeur()">Créer<i class="material-icons right">send</i></button>	
						  </div> 
						</form>
					  </div>`
	
	main.innerHTML=form;
	
}

function createQuizzServeur(){
	
	alert("votre quizz à bien été créé!");
	
	const form= document.getElementById('formCreerQuizz');
	form.addEventListener("submit",(e) =>{
      e.preventDefault();})
      
	const title= document.getElementById('titre').value;
	const description= document.getElementById('descr').value;
	const open=true;
	const data ={ title,description,open};
	console.log(data);
	
	const body = JSON.stringify(data);
	const url = `${state.serverUrl}/quizzes/`; 
	fetch(url, {method: 'POST',headers:state.headers(), body})
	
	getQuizzes();
	getMyQuizzes();

}

//rendu du formulaire de création d'une nouvelle question à un quiz
function formCreateQuestion(){
	
	console.debug(`@formCreateQuestion()`);
	
	const main= document.getElementById('id-all-my-quizzes-main2');

	const formCreationQuestion=`</br>
								  <h4 style="color:#0e086f;" >Ajouter une question ici</h4>
									 <div class="row">
										<form id="formCreerQuestion" class="col s12">
										 
											  <div class="row">
													 <div class="input-field col s7">
														<input id="idQ" type="number">
														<label for="idQui">Numéro du quizz où ajouter la question</label>
													 </div>
											  </div>
											  
											  <div class="row">
													<div class="input-field col s12">
													  <textarea id="newQuestion" class="materialize-textarea"></textarea>
													  <label for="textarea1">Votre nouvelle question</label>
													</div>
											  </div>
											  
											  <div class="row">
													 <div class="input-field col s7">
														<input id="NbProp" type="number">
														<label for="NbProp">Nombre de propositions</label>
													 </div>
											  </div> 
											  
											  <div class="row center-align">
													<button class="waves-effect waves-light btn-small indigo darken-4" onclick=" idQForm = document.getElementById('idQ').value; 
																																 newQuestionForm= document.getElementById('newQuestion').value;
																																 nbPropForm=document.getElementById('NbProp').value;
																																 suiteForm(nbPropForm);">suivant</button>	
											  </div>
										</form>
										</div>`
								
	main.innerHTML=formCreationQuestion; 
}

function suiteForm(NbProp){
	console.debug(`@suiteForm()`);
	const main= document.getElementById('id-all-my-quizzes-main2');

	let suite=`</br>
						  <h4 style="color:#0e086f;" >Entrez les propositions ici</h4>
							 <div class="row">
								<form id="formCreerQuestion2" class="col s12">`
	for(let i=0; i<NbProp;i++){									
		
		suite=suite+`				  <div class="row">
											
												<div class="input-field col s6">
												  <textarea id="prop` + i + `" class="materialize-textarea"></textarea>
												  <label for="prop">contenu de la proposition ${i+1}</label>
												</div>

												</br><p><label><input type="radio" name="btnRadioCorrect" id="` + i + `correcte"/><span><h7>Réponse juste</h7></span></label></p>
											
									 </div>`
	}										  
	suite=suite+`					  
									  
									  <div class="row center-align">
										<button class="waves-effect waves-light btn-small indigo darken-4" onclick="creationQuestionQuiz()">Ajouter<i class="material-icons right">send</i></button>	
									  </div> 
							   </form>
							 </div>`
	main.innerHTML=suite;
}

function creationQuestionQuiz(){
	
	alert("votre question à bien été ajouté!");

	const url1 = `${state.serverUrl}/quizzes/${idQForm}/`;

    fetch(url1, { method: 'GET', headers: state.headers() })
	.then(filterHttpResponse)
	.then((data) => {
	  state.quizToUpdate = data;
	  state.questions_number = data.questions_number;
	  
	  const form2= document.getElementById('formCreerQuestion2');
	  form2.addEventListener("submit",(e) =>{
		e.preventDefault();
      })
	
	const question_id=state.questions_number;
	const sentence= newQuestionForm;
	const propositions= [];
	console.log(idQForm);
	console.log(sentence);
	console.log("question_id:");
	console.log(question_id);
	for (let i=0; i<nbPropForm;i++){
		
		const content=document.getElementById("prop"+i).value;
		const proposition_id=i;
		const radioCorrect=document.getElementById(i+"correcte");
		const correct=radioCorrect.checked;
		const obj={content,proposition_id,correct}
		propositions.push(obj);
	}
	console.log(propositions); 
	const data2 ={question_id,sentence,propositions};
	console.log(data2);
	
	const body = JSON.stringify(data2);
	const url2 = `${state.serverUrl}/quizzes/${idQForm}/questions/`; 
	fetch(url2, {method: 'POST',headers:state.headers(), body})
	
	});
}

//rendu du bouton de connexion
const renderUserBtn = () => {
	
  console.debug(`@renderUserBtn()`);
  	
  const btn = document.getElementById('id-login');
  btn.onclick = () => {

		 if (state.xApiKey == '') { 
		  
			  const saisie= prompt(`Pour vous authentifier, saisir votre xApiKey `);
			  
				  if(saisie){
					  
					  state.xApiKey= saisie;
					  getUser();
					  getMyQuizzes();
					  getMyRep();
					  formCreateQuizz();
					  formCreateQuestion();
					  console.log(state.xApiKey);
				  }
			  
		  }else{
			
			  console.log(state.user);
			  console.log(state.xApiKey);
			  const res= confirm(`Bonjour ${state.user.firstname} ${state.user.lastname.toUpperCase()}\nVoulez-vous vous déconnecter?`);
			  
			  if (res){ 
				  
				  state.xApiKey= '';
				  console.log("apiKey vide");
				  renderMyQuizzesNoConnect();
				  renderCreateQuizNoConnect();
				  renderCreateQuestionNoConnect();
				  renderMyRepNoConnect();
			  }
		  }   
      
	};
};


