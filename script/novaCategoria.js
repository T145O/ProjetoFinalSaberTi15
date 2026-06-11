//Link de sempre com o banco de dados
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const categoriaForm = document.getElementById("novaCategoria");
const categoria = document.getElementById("categoria");
const enviar = document.getElementById("enviar");

async function novaCategoria(event){
    event.preventDefault();
    const categoriaNova = categoria.value.trim();
    
    const {data, error } = await supabaseClient
    .from("categoria_produto")
    .insert({
        ds_categoria_produto: categoriaNova
    })

    if (error){
    alert("Erro: " + error.message);
    return;
    }
    alert("Nova categoria registrada com sucesso!");
    categoriaForm.reset();
}

categoriaForm.addEventListener("submit", novaCategoria);