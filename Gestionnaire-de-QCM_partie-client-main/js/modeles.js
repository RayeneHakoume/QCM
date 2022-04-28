/* globals renderQuizzes renderUserBtn renderMyQuizzes renderMyRep */

// //////////////////////////////////////////////////////////////////////////////
// LE MODELE, a.k.a, ETAT GLOBAL
// //////////////////////////////////////////////////////////////////////////////

// un objet global pour encapsuler l'état de l'application
const state = {
  // la clef de l'utilisateur
  xApiKey: '082a1c2e-0340-45e3-b618-33d01cf41948', //082a1c2e-0340-45e3-b618-33d01cf41948

  // l'URL du serveur où accéder aux données
  serverUrl: 'https://lifap5.univ-lyon1.fr',

  // la liste des quizzes
  quizzes: [],
  
  //tab qui contient la liste des repondants
  Repondants: [],

  // le quizz actuellement choisi
  currentQuizz:	undefined,
  
  // variables pour le tri de la liste
  res:50,
  order:'quiz_id',
  dir:'asc',
  
  // une méthode pour l'objet 'state' qui va générer les headers pour les appel à fetch
	headers(){
		
		const headers = new Headers();
		headers.set('X-API-KEY', this.xApiKey);
		headers.set('Accept', 'application/json');
		headers.set('Content-Type', 'application/json');
		return headers;
	}
};


// //////////////////////////////////////////////////////////////////////////////
// OUTILS génériques
// //////////////////////////////////////////////////////////////////////////////

// un filtre simple pour récupérer les réponses HTTP qui correspondent à des
// erreurs client (4xx) ou serveur (5xx)
function filterHttpResponse(response) {
  return response
    .json()
    .then((data) => {
      if (response.status >= 400 && response.status < 600) {
        throw new Error(`${data.name}: ${data.message}`);
      }
      return data;
    })
    .catch((err) => console.error(`Error on json: ${err}`));
}

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES UTILISATEURS
// //////////////////////////////////////////////////////////////////////////////

const getUser = () => {
  console.debug(`@getUser()`);
  const url = `${state.serverUrl}/users/whoami`;
  return fetch(url, { method: 'GET', headers: state.headers() })
    .then(filterHttpResponse)
    .then((data) => {
      state.user = data;
      console.log(state.user);
      return renderUserBtn();
    });
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES QUIZZES
// //////////////////////////////////////////////////////////////////////////////

// getQuizzes télécharge la page 'p' des quizzes et la met dans l'état puis relance le rendu
const getQuizzes = (p = 1) => {
  console.debug(`@getQuizzes(${p})`);
  //const url = `${state.serverUrl}/quizzes/?page=${p}`;
  const url = `${state.serverUrl}/quizzes/?page=${p}&limit=${state.res}&order=${state.order}&dir=${state.dir}`;


  return fetch(url, { method: 'GET', headers: state.headers() })
    .then(filterHttpResponse)
    .then((data) => {
	  
      state.quizzes = data;
      return renderQuizzes();
    });
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES QUIZZES DE L'UTILISATEUR CONNECTE
// //////////////////////////////////////////////////////////////////////////////

const getMyQuizzes = (p = 1) => {

	  console.debug(`@getMyQuizzes(${p})`);
	  const url = `${state.serverUrl}/users/quizzes`;

	  return fetch(url, { method: 'GET', headers: state.headers() })
		.then(filterHttpResponse)
		.then((data) => {
		  console.log("Mes quizz");
		  console.log(data);
		  state.Myquizzes = data;
		  return renderMyQuizzes();
		});
  
};

// //////////////////////////////////////////////////////////////////////////////
// DONNEES DES REPONSES DE L'UTILISATEUR CONNECTE
// //////////////////////////////////////////////////////////////////////////////

const getMyRep = (p = 1) => {

	  console.debug(`@getMyRep(${p})`);
	  const url = `${state.serverUrl}/users/answers`;

	  return fetch(url, { method: 'GET', headers: state.headers() })
		.then(filterHttpResponse)
		.then((data) => {
		  /*console.log("Mes reponses");
		  console.log(data);*/
		  state.NbTotalRep=data.length;	
		  state.MyRep = data;
		  return renderMyRep();
		});		
			
};
