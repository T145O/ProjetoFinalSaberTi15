const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

// Criamos o cliente do Supabase.
// Esse cliente e usado para conversar com o banco de dados pelo JavaScript.
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Pegamos o formulario de login pelo id que esta no HTML.
// Assim conseguimos controlar o que acontece quando o usuario clica em "Entrar".
const loginForm = document.getElementById("LoginForm");

// Pegamos o campo de usuario pelo id "username".
// Esse campo e onde a pessoa digita o nome de usuario.
const usernameInput = document.getElementById("username");

// Pegamos o campo de senha pelo id "senha".
// Esse campo e onde a pessoa digita a senha.
const senhaInput = document.getElementById("senha");

// Essa funcao verifica se existe no banco um usuario com a senha digitada.
// Usamos async porque a consulta no banco demora um pouco e precisamos esperar.
async function checkUser(evento) {
  // Impede o comportamento padrao do formulario.
  // Sem isso, a pagina recarrega e pode atrapalhar a verificacao no banco.
  evento.preventDefault();

  // Pegamos o texto digitado no campo usuario.
  // O trim remove espacos extras no comeco e no final.
  const username = usernameInput.value.trim();

  // Pegamos a senha digitada no campo senha.
  const senha = senhaInput.value;

  // Se algum campo estiver vazio, avisamos o usuario e paramos a funcao.
  if (username === "" || senha === "") {
    alert("Preencha o usuario e a senha.");
    return;
  }

  // Fazemos um SELECT na tabela usuario.
  // A ideia e procurar uma linha onde:
  // - a coluna username seja igual ao usuario digitado
  // - a coluna senha seja igual a senha digitada
  const { data, error } = await supabaseClient
    .from("usuarios")
    .select("usuario, senha")
    .eq("usuario", username)
    .eq("senha", senha)
    .maybeSingle();

  // Se acontecer algum erro na comunicacao com o banco,
  // mostramos a mensagem do erro para facilitar o estudo e a correcao.
  if (error) {
    alert("Erro ao verificar usuario: " + error.message);
    return;
  }

  // Se data tiver valor, significa que o Supabase encontrou o usuario e a senha.
  if (data) {
    // Redireciona o usuario para a tela menu.html.
    window.location.href = "paginas/menu.html";
    return;
  }

  // Se data estiver vazio, significa que nao foi encontrada uma linha no banco
  // com o usuario e a senha informados.
  alert("Usuario ou senha nao encontrado.");
}

// Ligamos o evento de envio do formulario a funcao checkUser.
// Quando clicar em Entrar, o navegador chama essa funcao.
loginForm.addEventListener("submit", checkUser);
