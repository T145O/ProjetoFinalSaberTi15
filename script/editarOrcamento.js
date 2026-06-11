const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("editarOrcamentoForm");
const orcamentoIdInput = document.getElementById("orcamentoId");
const clienteSelect = document.getElementById("clienteSelect");
const produtoSelect = document.getElementById("produtoSelect");
const quantidadeInput = document.getElementById("quantidadeInput");
const adicionarItemBtn = document.getElementById("adicionarItemBtn");
const itensTableBody = document.querySelector("#itensOrcamentoTable tbody");
const valorTotalSpan = document.getElementById("valorTotalOrcamento");
const codigoConfirmacaoSpan = document.getElementById("codigoConfirmacao");
const inputConfirmacao = document.getElementById("inputConfirmacao");
const btnExcluir = document.getElementById("btnExcluir");
const dataOrcamentoInput = document.getElementById("dataOrcamento");
const validadeOrcamentoInput = document.getElementById("validadeOrcamento");

let codigoGerado = "";
let itensOrcamento = [];
let produtosMap = new Map();

function gerarCodigoSeguranca() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let resultado = "";
    for (let i = 0; i < 5; i++) resultado += letras.charAt(Math.floor(Math.random() * letras.length));
    codigoGerado = resultado;
    codigoConfirmacaoSpan.textContent = codigoGerado;
}

async function carregarDadosIniciais() {
    const urlParams = new URLSearchParams(window.location.search);
    const orcamentoId = urlParams.get('id');
    if (!orcamentoId) { window.location.href = "listaOrcamentos.html"; return; }

    // Carregar Clientes
    const { data: clientes } = await supabaseClient.from("cliente").select("clienteid, nome_cliente").order("nome_cliente");
    clienteSelect.innerHTML = clientes.map(c => `<option value="${c.clienteid}">${c.nome_cliente}</option>`).join('');

    // Carregar Produtos
    const { data: produtos } = await supabaseClient.from("produto").select("*").eq("status_produto", "ATIVO");
    produtos.forEach(p => {
        produtosMap.set(p.produtoid, p);
        const opt = document.createElement("option");
        opt.value = p.produtoid;
        opt.textContent = `${p.ds_produto} (R$ ${p.vl_venda_produto.toFixed(2)})`;
        produtoSelect.appendChild(opt);
    });

    // Carregar Orçamento
    const { data: orcamento } = await supabaseClient.from("orcamento").select("*").eq("orcamentoid", orcamentoId).single();
    orcamentoIdInput.value = orcamento.orcamentoid;
    clienteSelect.value = orcamento.clienteid;
    dataOrcamentoInput.value = orcamento.dt_orcamento;
    validadeOrcamentoInput.value = orcamento.dt_validade_orcamento;

    // Carregar Itens
    const { data: itens } = await supabaseClient.from("orcamento_item").select("*").eq("orcamentoid", orcamentoId);
    itensOrcamento = itens.map(i => ({
        produtoid: i.produtoid,
        produtodesc: i.produtodesc,
        qt_produto: i.qt_produto,
        vl_unitario: i.vl_unitario,
        vl_total: i.vl_total
    }));

    renderizarItens();
}

function renderizarItens() {
    itensTableBody.innerHTML = "";
    let totalGeral = 0;

    itensOrcamento.forEach((item, index) => {
        const row = itensTableBody.insertRow();
        row.insertCell().textContent = item.produtodesc;
        row.insertCell().textContent = item.qt_produto;
        row.insertCell().textContent = `R$ ${item.vl_unitario.toFixed(2)}`;
        row.insertCell().textContent = `R$ ${item.vl_total.toFixed(2)}`;
        
        const acoesCell = row.insertCell();
        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.className = "remove-item-btn";
        btnRemover.onclick = () => { itensOrcamento.splice(index, 1); renderizarItens(); };
        acoesCell.appendChild(btnRemover);

        totalGeral += item.vl_total;
    });

    valorTotalSpan.textContent = totalGeral.toFixed(2);
}

adicionarItemBtn.onclick = () => {
    const pId = parseInt(produtoSelect.value);
    const qtd = parseInt(quantidadeInput.value);
    if (!pId || qtd <= 0) return alert("Selecione um produto e quantidade.");

    const p = produtosMap.get(pId);
    const itemExistente = itensOrcamento.find(i => i.produtoid === pId);

    if (itemExistente) {
        itemExistente.qt_produto += qtd;
        itemExistente.vl_total = itemExistente.qt_produto * itemExistente.vl_unitario;
    } else {
        itensOrcamento.push({
            produtoid: pId,
            produtodesc: p.ds_produto,
            qt_produto: qtd,
            vl_unitario: p.vl_venda_produto,
            vl_total: qtd * p.vl_venda_produto
        });
    }
    renderizarItens();
};

async function processarEdicao(e) {
    e.preventDefault();
    if (inputConfirmacao.value !== codigoGerado) {
        alert("Código de segurança incorreto.");
        gerarCodigoSeguranca();
        return;
    }

    if (itensOrcamento.length === 0) return alert("Adicione pelo menos um item.");

    const id = orcamentoIdInput.value;
    const total = parseFloat(valorTotalSpan.textContent);

    // 1. Atualiza cabeçalho do orçamento
    const { error: errOrc } = await supabaseClient.from("orcamento").update({
        clienteid: parseInt(clienteSelect.value),
        vl_total_orcamento: total,
        dt_orcamento: dataOrcamentoInput.value,
        dt_validade_orcamento: validadeOrcamentoInput.value
    }).eq("orcamentoid", id);

    if (errOrc) return alert("Erro ao atualizar cabeçalho: " + errOrc.message);

    // 2. Remove itens antigos e insere os novos (Simulando uma atualização de lista)
    await supabaseClient.from("orcamento_item").delete().eq("orcamentoid", id);
    
    const novosItens = itensOrcamento.map((item, idx) => ({
        orcamentoid: id,
        orcamentoitemid: idx + 1,
        produtoid: item.produtoid,
        produtodesc: item.produtodesc,
        qt_produto: item.qt_produto,
        vl_unitario: item.vl_unitario,
        vl_total: item.vl_total
    }));

    const { error: errItens } = await supabaseClient.from("orcamento_item").insert(novosItens);

    if (errItens) return alert("Erro ao atualizar itens: " + errItens.message);

    alert("Orçamento atualizado com sucesso!");
    window.location.href = "listaOrcamentos.html";
}

async function processarExclusao() {
    if (inputConfirmacao.value !== codigoGerado) {
        alert("Código de segurança incorreto para exclusão.");
        gerarCodigoSeguranca();
        return;
    }

    if (!confirm("Tem certeza que deseja excluir permanentemente este orçamento?")) return;

    const id = orcamentoIdInput.value;

    // Deletar itens primeiro por causa da integridade (se houver FK ativa)
    await supabaseClient.from("orcamento_item").delete().eq("orcamentoid", id);
    const { error } = await supabaseClient.from("orcamento").delete().eq("orcamentoid", id);

    if (error) {
        alert("Erro ao excluir: " + error.message);
        return;
    }

    alert("Orçamento excluído com sucesso!");
    window.location.href = "listaOrcamentos.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    gerarCodigoSeguranca();
    form.addEventListener("submit", processarEdicao);
    btnExcluir.addEventListener("click", processarExclusao);
});