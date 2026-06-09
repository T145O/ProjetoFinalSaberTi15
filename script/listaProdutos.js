const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tableBody = document.querySelector("#listaProdutosTable tbody");

async function carregarProdutos() {
    const id = document.getElementById("searchId").value;
    const catId = document.getElementById("searchCatId").value;
    const nome = document.getElementById("searchNome").value.trim();
    const valor = document.getElementById("searchValor").value;
    const dataCad = document.getElementById("searchData").value;
    const status = document.getElementById("searchStatus").value;

    tableBody.innerHTML = '<tr><td colspan="7">Carregando...</td></tr>';

    let query = supabaseClient.from("produto").select("*");

    if (id) query = query.eq("produtoid", id);
    if (catId) query = query.eq("categoriaprodutoid", catId);
    if (nome) query = query.ilike("ds_produto", `%${nome}%`);
    if (valor) query = query.eq("vl_venda_produto", valor);
    if (dataCad) query = query.eq("dt_cadastro_produto", dataCad);
    if (status) query = query.eq("status_produto", status);

    const { data, error } = await query.order("produtoid", { ascending: true });

    if (error) {
        alert("Erro: " + error.message);
        return;
    }

    renderizar(data);
}

function renderizar(produtos) {
    tableBody.innerHTML = "";
    if (produtos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">Nenhum produto encontrado.</td></tr>';
        return;
    }
    produtos.forEach(p => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = p.produtoid;
        row.insertCell().textContent = p.categoriaprodutoid;
        row.insertCell().textContent = p.ds_produto;
        row.insertCell().textContent = p.obs_produto || "-";
        row.insertCell().textContent = `R$ ${p.vl_venda_produto.toFixed(2)}`;
        row.insertCell().textContent = p.dt_cadastro_produto;
        row.insertCell().textContent = p.status_produto;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    document.getElementById("btnPesquisar").addEventListener("click", carregarProdutos);
});