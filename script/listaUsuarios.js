const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tableBody = document.querySelector("#listaUsuariosTable tbody");

async function carregarUsuarios() {
    const id = document.getElementById("searchId").value;
    const user = document.getElementById("searchUser").value.trim();
    const nome = document.getElementById("searchNome").value.trim();

    tableBody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';

    let query = supabaseClient.from("usuarios").select("id, usuario, nome_completo");

    if (id) query = query.eq("id", id);
    if (user) query = query.ilike("usuario", `%${user}%`);
    if (nome) query = query.ilike("nome_completo", `%${nome}%`);

    const { data, error } = await query.order("id", { ascending: true });

    if (error) {
        alert("Erro: " + error.message);
        return;
    }

    renderizar(data);
}

function renderizar(usuarios) {
    tableBody.innerHTML = "";
    if (usuarios.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">Nenhum usuário encontrado.</td></tr>';
        return;
    }
    usuarios.forEach(u => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = u.id;
        row.insertCell().textContent = u.usuario;
        row.insertCell().textContent = u.nome_completo;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuarios();
    document.getElementById("btnPesquisar").addEventListener("click", carregarUsuarios);
});