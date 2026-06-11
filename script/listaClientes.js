// Configurações do Supabase
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const listaClientesTableBody = document.querySelector("#listaClientesTable tbody");

/**
 * Busca os clientes no banco com base nos filtros.
 */
async function carregarClientes() {
    const nome = document.getElementById("searchNome").value.trim();
    const tipo = document.getElementById("searchTipo").value;
    const cpfCnpj = document.getElementById("searchCpfCnpj").value.trim();

    listaClientesTableBody.innerHTML = '<tr><td colspan="5">Carregando clientes...</td></tr>';

    // Inicia a query na tabela 'cliente'
    let query = supabaseClient
        .from("cliente")
        .select("clienteid, nome_cliente, tipo_cliente, cpf_cnpj_cliente");

    // Aplica filtros se preenchidos (ilike para busca parcial no nome)
    if (nome) query = query.ilike("nome_cliente", `%${nome}%`);
    if (tipo) query = query.eq("tipo_cliente", tipo);
    if (cpfCnpj) query = query.eq("cpf_cnpj_cliente", cpfCnpj);

    const { data, error } = await query.order("clienteid", { ascending: true });

    if (error) {
        console.error("Erro ao carregar:", error.message);
        alert("Erro ao buscar clientes: " + error.message);
        return;
    }

    renderizarClientes(data);
}

/**
 * Converte a sigla do banco para texto legível.
 */
function formatarTipo(tipo) {
    return tipo === 'F' ? "Pessoa Física" : tipo === 'J' ? "Pessoa Jurídica" : tipo;
}

/**
 * Renderiza os dados na tabela.
 */
function renderizarClientes(clientes) {
    listaClientesTableBody.innerHTML = "";

    if (clientes.length === 0) {
        listaClientesTableBody.innerHTML = '<tr><td colspan="5">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    clientes.forEach(cli => {
        const row = listaClientesTableBody.insertRow();
        
        // Criando as células
        const cellId = row.insertCell();
        const cellNome = row.insertCell();
        const cellTipo = row.insertCell();
        const cellCpfCnpj = row.insertCell();
        const cellAcoes = row.insertCell();

        cellId.textContent = cli.clienteid;
        cellNome.textContent = cli.nome_cliente;
        cellTipo.textContent = formatarTipo(cli.tipo_cliente);
        cellCpfCnpj.textContent = cli.cpf_cnpj_cliente || "-";

        const btnEditar = document.createElement("a");
        btnEditar.textContent = "Editar";
        btnEditar.href = `editarCliente.html?id=${cli.clienteid}`;
        btnEditar.className = "btn-editar"; // Estilize conforme necessário no CSS
        cellAcoes.appendChild(btnEditar);
    });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes(); // Carrega tudo inicialmente
    document.getElementById("btnPesquisar").addEventListener("click", carregarClientes);
});