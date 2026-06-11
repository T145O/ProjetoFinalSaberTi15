// Link de sempre com o banco de dados.
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


const novoClienteForm = document.getElementById("novoClienteForm");
const nome = document.getElementById("nome");
const cpfCnpj = document.getElementById("cpfCnpj");

async function cadastrarCliente(evento) {
    evento.preventDefault();

    // Procuramos o radio marcado dentro do grupo que tem name="tipoCliente".
    // O :checked significa "o input radio que esta selecionado".
    const tipoClienteSelecionado = document.querySelector(
        'input[name="tipoCliente"]:checked'
    );

    if (tipoClienteSelecionado === null) {
        alert("Escolha se o cliente e pessoa fisica ou pessoa juridica.");
        return;
    }
    const tipoCliente = tipoClienteSelecionado.value;
    const cpf_cnpj_cliente = cpfCnpj.value;
    const nome_cliente = nome.value;

    const { data, error } = await supabaseClient
        .from("cliente")
        .insert({
            tipo_cliente: tipoCliente,
            cpf_cnpj_cliente: cpf_cnpj_cliente,
            nome_cliente: nome_cliente
        })

    if (error) {
        alert("Erro: " + error.message);
        return;
    }
    
    alert("Cliente cadastrado com sucesso");

    novoClienteForm.reset();
}

novoClienteForm.addEventListener("submit", cadastrarCliente);
