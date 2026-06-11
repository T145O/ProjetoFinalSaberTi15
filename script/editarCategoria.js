// Configurações do Supabase
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("editarCategoriaForm");
const categoriaIdInput = document.getElementById("categoriaId");
const descricaoInput = document.getElementById("descricao");
const codigoConfirmacaoSpan = document.getElementById("codigoConfirmacao");
const inputConfirmacao = document.getElementById("inputConfirmacao");
const btnExcluir = document.getElementById("btnExcluir");

let codigoGerado = "";

/**
 * Gera um código aleatório de 5 caracteres usando 24 letras do alfabeto.
 */
function gerarCodigoSeguranca() {
    // Conjunto de 24 letras (excluindo I e O para evitar confusão visual)
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; 
    let resultado = "";
    for (let i = 0; i < 5; i++) {
        resultado += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    codigoGerado = resultado;
    codigoConfirmacaoSpan.textContent = codigoGerado;
}

/**
 * Carrega os dados da categoria com base no ID da URL.
 */
async function carregarDados() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("ID não informado.");
        window.location.href = "listaCategorias.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("categoria_produto")
        .select("*")
        .eq("categoriaprodutoid", id)
        .single();

    if (error || !data) {
        alert("Categoria não encontrada.");
        window.location.href = "listaCategorias.html";
        return;
    }

    categoriaIdInput.value = data.categoriaprodutoid;
    descricaoInput.value = data.ds_categoria_produto;
}

/**
 * Processa a atualização da categoria.
 */
async function salvar(evento) {
    evento.preventDefault();

    if (inputConfirmacao.value !== codigoGerado) {
        alert("Código de confirmação incorreto.");
        gerarCodigoSeguranca();
        inputConfirmacao.value = "";
        return;
    }

    const { error } = await supabaseClient
        .from("categoria_produto")
        .update({
            ds_categoria_produto: descricaoInput.value.trim()
        })
        .eq("categoriaprodutoid", categoriaIdInput.value);

    if (error) {
        alert("Erro ao atualizar: " + error.message);
        return;
    }

    alert("Categoria atualizada com sucesso!");
    window.location.href = "listaCategorias.html";
}

/**
 * Processa a exclusão da categoria.
 */
async function excluir() {
    if (inputConfirmacao.value !== codigoGerado) {
        alert("Código de confirmação incorreto para exclusão.");
        gerarCodigoSeguranca();
        inputConfirmacao.value = "";
        return;
    }

    if (!confirm("Tem certeza que deseja excluir esta categoria permanentemente?")) return;

    const { error } = await supabaseClient
        .from("categoria_produto")
        .delete()
        .eq("categoriaprodutoid", categoriaIdInput.value);

    if (error) {
        alert("Erro ao excluir (verifique se existem produtos vinculados): " + error.message);
        return;
    }

    alert("Categoria excluída com sucesso!");
    window.location.href = "listaCategorias.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    gerarCodigoSeguranca();
    form.addEventListener("submit", salvar);
    btnExcluir.addEventListener("click", excluir);
});