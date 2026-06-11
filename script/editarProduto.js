// Configurações do Supabase
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("editarProdutoForm");
const produtoIdInput = document.getElementById("produtoId");
const nomeInput = document.getElementById("nome");
const categoriaSelect = document.getElementById("categoria");
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const statusSelect = document.getElementById("status");
const codigoConfirmacaoSpan = document.getElementById("codigoConfirmacao");
const inputConfirmacao = document.getElementById("inputConfirmacao");
const btnExcluir = document.getElementById("btnExcluir");

let codigoGerado = "";

/**
 * Gera um código aleatório de 5 caracteres usando letras maiúsculas e minúsculas.
 */
function gerarCodigoSeguranca() {
    // Conjunto de letras (excluindo I e O para evitar confusão visual)
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; 
    let resultado = "";
    for (let i = 0; i < 5; i++) {
        resultado += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    codigoGerado = resultado;
    codigoConfirmacaoSpan.textContent = codigoGerado;
}

/**
 * Carrega as categorias do banco de dados para o dropdown.
 */
async function carregarCategorias() {
    const { data, error } = await supabaseClient
        .from("categoria_produto")
        .select("categoriaprodutoid, ds_categoria_produto")
        .order("ds_categoria_produto", { ascending: true });

    if (error) {
        console.error("Erro ao carregar categorias:", error);
        return;
    }

    categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    data.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.categoriaprodutoid;
        option.textContent = cat.ds_categoria_produto;
        categoriaSelect.appendChild(option);
    });
}

/**
 * Carrega os dados do produto com base no ID da URL.
 */
async function carregarDadosProduto() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("ID do produto não encontrado na URL.");
        window.location.href = "listaProdutos.html";
        return;
    }

    // Garante que as categorias existam antes de preencher os dados do produto
    await carregarCategorias();

    const { data, error } = await supabaseClient
        .from("produto")
        .select("*")
        .eq("produtoid", id)
        .single();

    if (error || !data) {
        alert("Erro ao buscar dados do produto.");
        window.location.href = "listaProdutos.html";
        return;
    }

    produtoIdInput.value = data.produtoid;
    nomeInput.value = data.ds_produto;
    categoriaSelect.value = data.categoriaprodutoid;
    descricaoInput.value = data.obs_produto || "";
    valorInput.value = data.vl_venda_produto;
    statusSelect.value = data.status_produto;
}

async function processarEdicao(evento) {
    evento.preventDefault();

    if (inputConfirmacao.value !== codigoGerado) {
        alert("O código de confirmação está incorreto. Tente novamente.");
        gerarCodigoSeguranca();
        inputConfirmacao.value = "";
        return;
    }

    const { error } = await supabaseClient
        .from("produto")
        .update({
            ds_produto: nomeInput.value.trim(),
            categoriaprodutoid: Number(categoriaSelect.value),
            obs_produto: descricaoInput.value.trim(),
            vl_venda_produto: Number(valorInput.value),
            status_produto: statusSelect.value
        })
        .eq("produtoid", produtoIdInput.value);

    if (error) {
        alert("Erro ao atualizar: " + error.message);
        return;
    }

    alert("Produto atualizado com sucesso!");
    window.location.href = "listaProdutos.html";
}

async function processarExclusao() {
    if (inputConfirmacao.value !== codigoGerado) {
        alert("Código de confirmação incorreto para a exclusão.");
        gerarCodigoSeguranca();
        inputConfirmacao.value = "";
        return;
    }

    if (!confirm("Tem certeza que deseja excluir permanentemente este produto?")) return;

    const { error } = await supabaseClient
        .from("produto")
        .delete()
        .eq("produtoid", produtoIdInput.value);

    if (error) {
        alert("Erro ao excluir: " + error.message);
        return;
    }

    alert("Produto excluído com sucesso!");
    window.location.href = "listaProdutos.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosProduto();
    gerarCodigoSeguranca();
    form.addEventListener("submit", processarEdicao);
    btnExcluir.addEventListener("click", processarExclusao);
});