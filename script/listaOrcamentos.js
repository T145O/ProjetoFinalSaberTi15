const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tableBody = document.querySelector("#listaOrcamentosTable tbody");

async function carregarOrcamentos() {
    const id = document.getElementById("searchId").value;
    const clienteId = document.getElementById("searchCliente").value;
    const status = document.getElementById("searchStatus").value;

    tableBody.innerHTML = '<tr><td colspan="7">Carregando...</td></tr>';

    let query = supabaseClient
        .from("orcamento")
        .select(`
            *, 
            cliente (nome_cliente) 
        `);

    if (id) query = query.eq("orcamentoid", id);
    if (clienteId) query = query.eq("clienteid", clienteId);

    const { data, error } = await query.order("orcamentoid", { ascending: true }); // Ordenação crescente por ID

    if (error) {
        alert("Erro: " + error.message);
        return;
    }

    // Lógica para calcular o status via JS baseada na data atual
    const hoje = new Date().toLocaleDateString('en-CA'); // Retorna YYYY-MM-DD na data local

    let orcamentosProcessados = data.map(o => {
        // Se a validade for posterior ou igual a hoje, está ABERTO
        const statusCalculado = o.dt_validade_orcamento >= hoje ? "ABERTO" : "FECHADO";
        return { ...o, status_calculado: statusCalculado };
    });

    // Filtra localmente se o usuário selecionou um status na busca
    if (status) {
        orcamentosProcessados = orcamentosProcessados.filter(o => o.status_calculado === status);
    }

    renderizar(orcamentosProcessados);
}

function renderizar(orcamentos) {
    tableBody.innerHTML = "";
    if (orcamentos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">Nenhum orçamento encontrado.</td></tr>';
        return;
    }
    orcamentos.forEach(o => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = o.orcamentoid;
        row.insertCell().textContent = o.cliente ? o.cliente.nome_cliente : "N/A";
        row.insertCell().textContent = formatarData(o.dt_orcamento);
        row.insertCell().textContent = formatarData(o.dt_validade_orcamento);
        
        // Coluna de status com cor dinâmica
        const statusCell = row.insertCell();
        statusCell.textContent = o.status_calculado;
        statusCell.style.color = o.status_calculado === "ABERTO" ? "green" : "red";
        statusCell.style.fontWeight = "bold";

        row.insertCell().textContent = `R$ ${o.vl_total_orcamento.toFixed(2)}`;

        // Coluna de Ações com botões de Impressão e Edição
        const acoesCell = row.insertCell();
        acoesCell.style.display = "flex";
        acoesCell.style.gap = "10px";
        acoesCell.style.justifyContent = "center";

        const linkImprimir = document.createElement("a");
        linkImprimir.href = `imprimirOrcamento.html?id=${o.orcamentoid}`;
        linkImprimir.textContent = "Imprimir";
        acoesCell.appendChild(linkImprimir);

        const linkEditar = document.createElement("a");
        linkEditar.href = `editarOrcamento.html?id=${o.orcamentoid}`;
        linkEditar.textContent = "Editar";
        acoesCell.appendChild(linkEditar);
    });
}

function formatarData(dataISO) {
    if (!dataISO) return "-";
    // Remove a parte do tempo (T00:00:00) caso exista
    const apenasData = dataISO.split("T")[0];
    // Divide a data YYYY-MM-DD
    const partes = apenasData.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

document.addEventListener("DOMContentLoaded", () => {
    carregarOrcamentos();
    document.getElementById("btnPesquisar").addEventListener("click", carregarOrcamentos);
});