// Configurações do Supabase
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("editarClienteForm");
const clienteIdInput = document.getElementById("clienteId");
const nomeInput = document.getElementById("nome");
const cpfCnpjInput = document.getElementById("cpfCnpj");
const codigoConfirmacaoSpan = document.getElementById("codigoConfirmacao");
const inputConfirmacao = document.getElementById("inputConfirmacao");
const btnExcluir = document.getElementById("btnExcluir");

let codigoGerado = "";

/**
 * Gera um código aleatório de 5 caracteres usando letras maiúsculas e minúsculas.
 * Utiliza um conjunto de 24 letras (excluindo algumas para evitar confusão visual ou seguir o requisito).
 */
function gerarCodigoSeguranca() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // Conjunto de letras
    let resultado = "";
    for (let i = 0; i < 5; i++) {
        resultado += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    codigoGerado = resultado;
    codigoConfirmacaoSpan.textContent = codigoGerado;
}

/**
 * Extrai o ID da URL e carrega os dados atuais do cliente.
 */
async function carregarDadosCliente() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("ID do cliente não encontrado na URL.");
        window.location.href = "listaClientes.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("cliente")
        .select("*")
        .eq("clienteid", id)
        .single();

    if (error || !data) {
        console.error("Erro ao carregar:", error);
        alert("Erro ao buscar dados do cliente.");
        window.location.href = "listaClientes.html";
        return;
    }

    // Preencher o formulário
    clienteIdInput.value = data.clienteid;
    nomeInput.value = data.nome_cliente;
    cpfCnpjInput.value = data.cpf_cnpj_cliente;
    
    if (data.tipo_cliente === 'F') {
        document.getElementById("tipoF").checked = true;
    } else if (data.tipo_cliente === 'J') {
        document.getElementById("tipoJ").checked = true;
    }
}

/**
 * Executa o UPDATE no banco de dados.
 */
async function processarEdicao(evento) {
    evento.preventDefault();

    // Validação do código de 5 caracteres
    if (inputConfirmacao.value !== codigoGerado) {
        alert("O código de confirmação está incorreto. Por favor, tente novamente.");
        gerarCodigoSeguranca(); // Troca o código por um novo em caso de erro
        inputConfirmacao.value = "";
        return;
    }

    const cpfCnpjValue = cpfCnpjInput.value.trim();
    const tipoClienteSelecionado = document.querySelector('input[name="tipoCliente"]:checked').value;

    // Validação de CPF/CNPJ
    if (tipoClienteSelecionado === 'F') {
        if (!isValidCPF(cpfCnpjValue)) {
            alert("CPF inválido para Pessoa Física.");
            cpfCnpjInput.focus();
            return;
        }
    } else if (tipoClienteSelecionado === 'J') {
        if (!isValidCNPJ(cpfCnpjValue)) {
            alert("CNPJ inválido para Pessoa Jurídica.");
            cpfCnpjInput.focus();
            return;
        }
    }


    const { error } = await supabaseClient
        .from("cliente")
        .update({
            nome_cliente: nomeInput.value.trim(),
            cpf_cnpj_cliente: cpfCnpjInput.value.trim(),
            tipo_cliente: tipoClienteSelecionado
        })
        .eq("clienteid", clienteIdInput.value);

    if (error) {
        alert("Erro ao atualizar cliente: " + error.message);
        return;
    }

    alert("Cliente atualizado com sucesso!");
    window.location.href = "listaClientes.html";
}

/**
 * Executa o DELETE no banco de dados.
 */
async function processarExclusao() {
    // Validação do código de 5 caracteres
    if (inputConfirmacao.value !== codigoGerado) {
        alert("O código de confirmação está incorreto para a exclusão. Por favor, tente novamente.");
        gerarCodigoSeguranca();
        inputConfirmacao.value = "";
        return;
    }

    if (!confirm("Tem certeza que deseja excluir permanentemente este cliente? Esta ação não pode ser desfeita.")) {
        return;
    }

    const { error } = await supabaseClient
        .from("cliente")
        .delete()
        .eq("clienteid", clienteIdInput.value);

    if (error) {
        alert("Erro ao excluir cliente: " + error.message);
        return;
    }

    alert("Cliente excluído com sucesso!");
    window.location.href = "listaClientes.html";
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosCliente();
    gerarCodigoSeguranca();
    form.addEventListener("submit", processarEdicao);
    btnExcluir.addEventListener("click", processarExclusao);
});