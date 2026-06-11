// Configurações do Supabase
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Carrega os detalhes completos de um orçamento específico.
 */
async function carregarOrcamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const orcamentoId = urlParams.get('id');

    if (!orcamentoId) {
        alert("ID do orçamento não identificado.");
        window.location.href = "listaOrcamentos.html";
        return;
    }

    // 1. Buscar dados do orçamento e do cliente (Inner Join)
    const { data: orcamento, error: orcError } = await supabaseClient
        .from("orcamento")
        .select(`
            *,
            cliente (nome_cliente, cpf_cnpj_cliente)
        `)
        .eq("orcamentoid", orcamentoId)
        .single();

    if (orcError || !orcamento) {
        console.error("Erro ao buscar orçamento:", orcError);
        alert("Erro ao carregar os dados do orçamento.");
        return;
    }

    // 2. Buscar itens do orçamento
    const { data: itens, error: itensError } = await supabaseClient
        .from("orcamento_item")
        .select("*")
        .eq("orcamentoid", orcamentoId)
        .order("orcamentoitemid", { ascending: true });

    if (itensError) {
        console.error("Erro ao buscar itens:", itensError);
        return;
    }

    preencherDados(orcamento, itens);
}

/**
 * Preenche os elementos HTML com as informações do banco.
 */
function preencherDados(orcamento, itens) {
    document.getElementById("displayId").textContent = orcamento.orcamentoid;
    document.getElementById("displayData").textContent = formatarData(orcamento.dt_orcamento);
    document.getElementById("displayValidade").textContent = formatarData(orcamento.dt_validade_orcamento);
    document.getElementById("displayCliente").textContent = orcamento.cliente.nome_cliente;
    document.getElementById("displayCpfCnpj").textContent = orcamento.cliente.cpf_cnpj_cliente;
    document.getElementById("valorTotalOrcamento").textContent = orcamento.vl_total_orcamento.toFixed(2);

    const tableBody = document.querySelector("#itensOrcamentoTable tbody");
    tableBody.innerHTML = "";

    itens.forEach(item => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = item.produtodesc;
        row.insertCell().textContent = item.qt_produto;
        row.insertCell().textContent = `R$ ${item.vl_unitario.toFixed(2)}`;
        row.insertCell().textContent = `R$ ${item.vl_total.toFixed(2)}`;
    });
}

/**
 * Converte data YYYY-MM-DD para DD/MM/YYYY
 */
function formatarData(dataISO) {
    if (!dataISO) return "-";
    
    const apenasData = dataISO.split("T")[0];
    const partes = apenasData.split("-");
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    carregarOrcamento();
});