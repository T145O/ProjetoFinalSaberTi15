// Configurações do Supabase (reutilizadas dos seus outros arquivos)
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Referências aos elementos do DOM
const novoOrcamentoForm = document.getElementById("novoOrcamentoForm");
const clienteSelect = document.getElementById("clienteSelect");
const produtoSelect = document.getElementById("produtoSelect");
const quantidadeInput = document.getElementById("quantidadeInput");
const adicionarItemBtn = document.getElementById("adicionarItemBtn");
const itensOrcamentoTableBody = document.querySelector("#itensOrcamentoTable tbody");
const valorTotalOrcamentoSpan = document.getElementById("valorTotalOrcamento");

// Variáveis para armazenar dados e estado
let clientes = [];
let produtos = [];
let produtosMap = new Map(); // Para acesso rápido aos detalhes do produto pelo ID
let itensOrcamento = []; // Array para armazenar os itens que serão salvos no orçamento

/**
 * Carrega os clientes do Supabase e popula o select.
 */
async function carregarClientes() {
    clienteSelect.innerHTML = '<option value="">Carregando clientes...</option>';
    const { data, error } = await supabaseClient
        .from("cliente")
        .select("clienteid, nome_cliente, cpf_cnpj_cliente")
        .order("nome_cliente", { ascending: true });

    if (error) {
        console.error("Erro ao carregar clientes:", error.message);
        alert("Erro ao carregar clientes: " + error.message);
        clienteSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
        return;
    }

    clientes = data;
    clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
    if (clientes.length === 0) {
        clienteSelect.innerHTML = '<option value="">Nenhum cliente cadastrado</option>';
        return;
    }

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.clienteid;
        option.textContent = `${cliente.nome_cliente} (ID: ${cliente.clienteid})`;
        clienteSelect.appendChild(option);
    });
}

/**
 * Carrega os produtos do Supabase e popula o select.
 */
async function carregarProdutos() {
    produtoSelect.innerHTML = '<option value="">Carregando produtos...</option>';
    const { data, error } = await supabaseClient
        .from("produto")
        .select("produtoid, ds_produto, vl_venda_produto")
        .eq("status_produto", "ATIVO") // Apenas produtos ativos
        .order("ds_produto", { ascending: true });

    if (error) {
        console.error("Erro ao carregar produtos:", error.message);
        alert("Erro ao carregar produtos: " + error.message);
        produtoSelect.innerHTML = '<option value="">Erro ao carregar produtos</option>';
        return;
    }

    produtos = data;
    produtosMap.clear();
    produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
    if (produtos.length === 0) {
        produtoSelect.innerHTML = '<option value="">Nenhum produto ativo cadastrado</option>';
        return;
    }

    produtos.forEach(produto => {
        produtosMap.set(produto.produtoid, produto); // Armazena para fácil lookup
        const option = document.createElement("option");
        option.value = produto.produtoid;
        option.textContent = `${produto.ds_produto} (R$ ${produto.vl_venda_produto.toFixed(2)})`;
        produtoSelect.appendChild(option);
    });
}

/**
 * Adiciona um item à lista de itens do orçamento na interface e no array.
 */
function adicionarItemAoOrcamento() {
    const produtoId = parseInt(produtoSelect.value);
    const quantidade = parseInt(quantidadeInput.value);

    if (!produtoId || isNaN(quantidade) || quantidade <= 0) {
        alert("Por favor, selecione um produto e insira uma quantidade válida.");
        return;
    }

    const produtoSelecionado = produtosMap.get(produtoId);
    if (!produtoSelecionado) {
        alert("Produto não encontrado. Tente novamente.");
        return;
    }

    // Verificar se o produto já está na lista e atualizar a quantidade
    const itemExistenteIndex = itensOrcamento.findIndex(item => item.produtoid === produtoId);

    if (itemExistenteIndex > -1) {
        itensOrcamento[itemExistenteIndex].qt_produto += quantidade;
        itensOrcamento[itemExistenteIndex].vl_total = itensOrcamento[itemExistenteIndex].qt_produto * itensOrcamento[itemExistenteIndex].vl_unitario;
    } else {
        const vlUnitario = parseFloat(produtoSelecionado.vl_venda_produto);
        const vlTotalItem = quantidade * vlUnitario;

        itensOrcamento.push({
            produtoid: produtoId,
            produtodesc: produtoSelecionado.ds_produto,
            qt_produto: quantidade,
            vl_unitario: vlUnitario,
            vl_total: vlTotalItem
        });
    }

    renderizarItensOrcamento();
    atualizarValorTotalOrcamento();

    // Limpar campos de adição de item
    produtoSelect.value = "";
    quantidadeInput.value = "1";
}

/**
 * Remove um item da lista de itens do orçamento.
 * @param {number} produtoId O ID do produto a ser removido.
 */
function removerItemDoOrcamento(produtoId) {
    itensOrcamento = itensOrcamento.filter(item => item.produtoid !== produtoId);
    renderizarItensOrcamento();
    atualizarValorTotalOrcamento();
}

/**
 * Renderiza a tabela de itens do orçamento com base no array `itensOrcamento`.
 */
function renderizarItensOrcamento() {
    itensOrcamentoTableBody.innerHTML = ""; // Limpa a tabela

    if (itensOrcamento.length === 0) {
        const row = itensOrcamentoTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = "Nenhum item adicionado ao orçamento.";
        cell.style.textAlign = "center";
        return;
    }

    itensOrcamento.forEach(item => {
        const row = itensOrcamentoTableBody.insertRow();
        row.insertCell().textContent = `${item.produtodesc} (ID: ${item.produtoid})`;
        row.insertCell().textContent = item.qt_produto;
        row.insertCell().textContent = `R$ ${item.vl_unitario.toFixed(2)}`;
        row.insertCell().textContent = `R$ ${item.vl_total.toFixed(2)}`;

        const acoesCell = row.insertCell();
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remover";
        removeBtn.classList.add("remove-item-btn");
        removeBtn.onclick = () => removerItemDoOrcamento(item.produtoid);
        acoesCell.appendChild(removeBtn);
    });
}

/**
 * Atualiza o valor total do orçamento exibido na interface.
 */
function atualizarValorTotalOrcamento() {
    const total = itensOrcamento.reduce((sum, item) => sum + item.vl_total, 0);
    valorTotalOrcamentoSpan.textContent = total.toFixed(2);
}

/**
 * Formata uma data para o padrão 'YYYY-MM-DD'.
 * @param {Date} date Objeto Date.
 * @returns {string} Data formatada.
 */
function formatarDataParaBanco(date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

/**
 * Calcula a data de validade do orçamento (15 dias após a data de criação).
 * @param {Date} dataCriacao Objeto Date da criação do orçamento.
 * @returns {string} Data de validade formatada.
 */
function calcularDataValidade(dataCriacao) {
    const dataValidade = new Date(dataCriacao);
    // Adiciona exatamente 15 dias à data de criação
    dataValidade.setDate(dataValidade.getDate() + 15);
    return formatarDataParaBanco(dataValidade);
}

/**
 * Função principal para criar o orçamento no Supabase.
 * @param {Event} evento O evento de submit do formulário.
 */
async function criarOrcamento(evento) {
    evento.preventDefault();

    const clienteId = parseInt(clienteSelect.value);

    if (!clienteId) {
        alert("Por favor, selecione um cliente.");
        return;
    }

    if (itensOrcamento.length === 0) {
        alert("Por favor, adicione pelo menos um item ao orçamento.");
        return;
    }

    const dataOrcamento = new Date();
    const dtOrcamentoFormatada = formatarDataParaBanco(dataOrcamento);
    const dtValidadeOrcamentoFormatada = calcularDataValidade(dataOrcamento);
    const vlTotalOrcamento = parseFloat(valorTotalOrcamentoSpan.textContent);

    // 1. Inserir na tabela ORCAMENTO
    const { data: orcamentoData, error: orcamentoError } = await supabaseClient
        .from("orcamento")
        .insert({
            clienteid: clienteId,
            dt_orcamento: dtOrcamentoFormatada,
            dt_validade_orcamento: dtValidadeOrcamentoFormatada,
            vl_total_orcamento: vlTotalOrcamento
        })
        .select("orcamentoid") // Solicita o ID do orçamento recém-criado
        .single();

    if (orcamentoError) {
        console.error("Erro ao criar orçamento:", orcamentoError.message);
        alert("Erro ao criar orçamento: " + orcamentoError.message);
        return;
    }

    const orcamentoId = orcamentoData.orcamentoid;

    // 2. Inserir na tabela ORCAMENTO_ITEM
    const itensParaInserir = itensOrcamento.map((item, index) => ({
        orcamentoid: orcamentoId,
        orcamentoitemid: index + 1, // Sequencial para cada item do orçamento
        produtoid: item.produtoid,
        produtodesc: item.produtodesc,
        qt_produto: item.qt_produto,
        vl_unitario: item.vl_unitario,
        vl_total: item.vl_total
    }));

    const { error: itensError } = await supabaseClient
        .from("orcamento_item")
        .insert(itensParaInserir);

    if (itensError) {
        console.error("Erro ao inserir itens do orçamento:", itensError.message);
        alert("Orçamento criado, mas houve um erro ao inserir os itens: " + itensError.message);
        // Considerar um rollback ou marcar o orçamento como incompleto se isso fosse uma aplicação de produção crítica
        return;
    }

    // Oferece a opção de imprimir o orçamento antes de limpar os dados da tela
    if (confirm("Orçamento gerado com sucesso! Deseja imprimir uma via para o cliente?")) {
        window.print();
    }

    // Limpar formulário e estado
    novoOrcamentoForm.reset();
    itensOrcamento = [];
    renderizarItensOrcamento();
    atualizarValorTotalOrcamento();
    clienteSelect.value = ""; // Resetar o select de cliente
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarProdutos();
    renderizarItensOrcamento(); // Renderiza a tabela vazia inicialmente
});

adicionarItemBtn.addEventListener("click", adicionarItemAoOrcamento);
novoOrcamentoForm.addEventListener("submit", criarOrcamento);