var apiKey:string = '3f301be7381a03ad8d352314dcc3ec1d';
let requestToken:string;
let username:string;
let password:string;
let sessionId:string;
let listId = '7101979';


let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');

if (loginButton){
    loginButton.addEventListener('click', async () => {
        await criarRequestToken();
        await logar();
        await criarSessao();
      })
}

if (searchButton){
    searchButton.addEventListener('click', async () => {
        let lista = document.getElementById("lista");
        if (lista) {
          lista.outerHTML = "";
        }
        let query = (document.getElementById('search') as HTMLInputElement).value;
        let listaDeFilmes = {results: await procurarFilme(query)}
        let ul = document.createElement('ul');
        ul.id = "lista"
        if (typeof(listaDeFilmes) == 'string'){
          for (const item of listaDeFilmes.results){
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(item.original_title))
            ul.appendChild(li)
          }
        }
        
        console.log(listaDeFilmes);
        if (searchContainer){
            searchContainer.appendChild(ul);
        }
      })
}


function preencherSenha() {
  const pas1 = document.getElementById('senha') as HTMLInputElement;
  password = pas1.value;
  validateLoginButton();
}

function preencherLogin() {
  const u1 = document.getElementById('login') as HTMLInputElement;
  username =  u1.value;
  validateLoginButton();
}

function preencherApi() {
  const ap1 = document.getElementById('api-key') as HTMLInputElement;
  apiKey = ap1.value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    if(loginButton){
        loginButton.disabled = false;
    }
  } else {
    if (loginButton){
        loginButton.disabled = true;
    }
  }
}

class HttpClient {
  static async get({url, method, body = null}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body === "string"){
      if (body.toString()) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body)
      }
      request.send(body);
    }
  }
  )}
}
async function procurarFilme(query:any): Promise<unknown> {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}

async function adicionarFilme(filmeId:any) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })
  if (typeof(result) === "string"){
    requestToken = result.request_token
  }

  
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = {session_id: await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })}
  if (typeof(sessionId) ==="string"){
    sessionId = result.session_id;
  }
}

async function criarLista(nomeDaLista:any, descricao:any) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId:number, listaId:string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body : {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}
