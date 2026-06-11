const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tableBody = document.querySelector("#listaCategoriasTable tbody");

async function carregarCategorias() {
    const id = document.getElementById("searchId").value;
    const nome = document.getElementById("searchNome").value.trim();

    tableBody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';

    let query = supabaseClient.from("categoria_produto").select("*");

    if (id) query = query.eq("categoriaprodutoid", id);
    if (nome) query = query.ilike("ds_categoria_produto", `%${nome}%`);

    const { data, error } = await query.order("categoriaprodutoid", { ascending: true });

    if (error) {
        alert("Erro: " + error.message);
        return;
    }

    renderizar(data);
}

function renderizar(categorias) {
    tableBody.innerHTML = "";
    if (categorias.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">Nenhuma categoria encontrada.</td></tr>';
        return;
    }
    categorias.forEach(c => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = c.categoriaprodutoid;
        row.insertCell().textContent = c.ds_categoria_produto;

        // Coluna de Ações com o link estilizado
        const acoesCell = row.insertCell();
        const linkEditar = document.createElement("a");
        linkEditar.href = `editarCategoria.html?id=${c.categoriaprodutoid}`;
        linkEditar.textContent = "Editar";
        acoesCell.appendChild(linkEditar);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    document.getElementById("btnPesquisar").addEventListener("click", carregarCategorias);
});