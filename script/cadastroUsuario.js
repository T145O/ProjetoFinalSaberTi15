//Link de sempre com o banco de dados
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

//Todos os campos do form do HTML estão sendo "pegos" pelo js
const cadastroForm = document.getElementById("cadastroForm");
const usuarioInput = document.getElementById("usuario");
const nomeCompletoInput = document.getElementById("nomeCompleto");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");

// Esta funcao cria um novo usuario no banco de dados.
// Usamos async porque a comunicacao com o banco nao acontece instantaneamente.
async function criarUsuario(evento) {
  evento.preventDefault();
//O .trim serve pra tirar espaço aleatório no começo e final do texto
  const usuario = usuarioInput.value.trim();
  const nomeCompleto = nomeCompletoInput.value.trim();
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;
  //Caso as senhas sejam diferentes um alerta aparece na tela
  if (senha !== confirmarSenha) {
    alert("As senhas nao conferem.");
    return;
  }

  // Fazemos um INSERT na tabela "usuarios".
  const { data, error } = await supabaseClient
    .from("usuarios")
    .insert({
      usuario: usuario,
      nome_completo: nomeCompleto,
      senha: senha,
    })
  // Se o Supabase devolver um erro, mostramos a mensagem para facilitar o estudo.
  // Erros comuns: nome da tabela errado, coluna errada ou regra de permissao no Supabase.
  if (error){
    alert("Erro: " + error.message);
    return;
  }
  alert("Cadastro criado com sucesso!");
  cadastroForm.reset();
  window.location.href = "..//index.html";
}

cadastroForm.addEventListener("submit", criarUsuario);