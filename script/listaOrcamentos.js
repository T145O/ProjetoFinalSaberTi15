// Configurações do Supabase
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referência ao corpo da tabela onde os dados serão exibidos
const listaOrcamentosTableBody = document.querySelector("#listaOrcamentosTable tbody");

/**
 * Busca os orçamentos no banco de dados.
 * Realizamos um JOIN com a tabela 'cliente' para exibir o nome em vez de apenas o ID.
 */
async function carregarOrcamentos() {
    // Obtém os valores dos campos de pesquisa
    const idOrcamento = document.getElementById("searchOrcamentoId").value;
    const idCliente = document.getElementById("searchClienteId").value;
    const nomeCliente = document.getElementById("searchClienteNome").value.trim();
    const dataOrcamento = document.getElementById("searchData").value;
    const dataValidade = document.getElementById("searchValidade").value;

    listaOrcamentosTableBody.innerHTML = '<tr><td colspan="5">Carregando orçamentos...</td></tr>';

    // Inicia a query base
    let query = supabaseClient
        .from("orcamento")
        .select(`
            orcamentoid,
            dt_orcamento,
            dt_validade_orcamento,
            vl_total_orcamento,
            cliente!inner ( nome_cliente )
        `);

    // Verifica se algum filtro foi preenchido
    const temFiltro = idOrcamento || idCliente || nomeCliente || dataOrcamento || dataValidade;

    if (idOrcamento) query = query.eq("orcamentoid", idOrcamento);
    if (idCliente) query = query.eq("clienteid", idCliente);
    if (nomeCliente) query = query.ilike("cliente.nome_cliente", `%${nomeCliente}%`);
    if (dataOrcamento) query = query.eq("dt_orcamento", dataOrcamento);
    if (dataValidade) query = query.eq("dt_validade_orcamento", dataValidade);

    // Caso nenhum campo seja preenchido, aplica a regra de não mostrar vencidos
    if (!temFiltro) {
        const hoje = new Date().toISOString().split('T')[0];
        query = query.gte("dt_validade_orcamento", hoje);
    }

    const { data, error } = await query.order("dt_orcamento", { ascending: false });

    if (error) {
        console.error("Erro ao carregar:", error.message);
        alert("Erro ao carregar orçamentos: " + error.message);
        return;
    }

    renderizarOrcamentos(data);
}

/**
 * Formata a data do padrão ISO (YYYY-MM-DD) para o brasileiro (DD/MM/YYYY).
 */
function formatarDataBR(dataISO) {
    if (!dataISO) return "-";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

/**
 * Preenche a tabela HTML com os dados retornados do Supabase.
 */
function renderizarOrcamentos(orcamentos) {
    listaOrcamentosTableBody.innerHTML = "";

    if (orcamentos.length === 0) {
        listaOrcamentosTableBody.innerHTML = '<tr><td colspan="5">Nenhum orçamento encontrado.</td></tr>';
        return;
    }

    orcamentos.forEach(orc => {
        const row = listaOrcamentosTableBody.insertRow();
        row.insertCell().textContent = orc.orcamentoid;
        row.insertCell().textContent = orc.cliente?.nome_cliente || "Cliente não vinculado";
        row.insertCell().textContent = formatarDataBR(orc.dt_orcamento);
        row.insertCell().textContent = formatarDataBR(orc.dt_validade_orcamento);
        row.insertCell().textContent = `R$ ${orc.vl_total_orcamento.toFixed(2)}`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Carrega a lista inicial (sem filtros, apenas não vencidos)
    carregarOrcamentos();
    // Adiciona o evento de clique ao botão de pesquisar
    document.getElementById("btnPesquisar").addEventListener("click", carregarOrcamentos);
});