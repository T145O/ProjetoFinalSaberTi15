// URL do projeto no Supabase.
// Ela indica para qual banco de dados o JavaScript vai enviar e buscar informacoes.
const SUPABASE_URL = "https://aasmkusxiriaktgvbafh.supabase.co";

// Chave publica do Supabase.
// Essa chave permite que o site acesse o Supabase usando as regras configuradas no banco.
const SUPABASE_ANON_KEY = "sb_publishable_MOSGO5OyqsnxRNp8TiDVSA_VkNujOvX";

// Aqui criamos o cliente do Supabase.
// Esse objeto sera usado para fazer comandos como SELECT e INSERT no banco.
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Pegamos o formulario pelo id dele no HTML.
// Com isso conseguimos saber quando o usuario clicou em "Cadastrar".
const novoProdutoForm = document.getElementById("novoProdutoForm");

// Pegamos o campo select onde o usuario escolhe a categoria.
// O valor desse campo sera o id da categoria escolhida.
const categoriaProdutoId = document.getElementById("categoriaProdutoId");

// Pegamos o campo onde o usuario digita o nome do produto.
const nome = document.getElementById("nome");

// Pegamos o campo onde o usuario digita a descricao do produto.
const descricao = document.getElementById("descricao");

// Pegamos o campo onde o usuario digita o valor de venda do produto.
const val = document.getElementById("val");

// Pegamos o campo onde o usuario escolhe se o produto esta ativo ou inativo.
const statusProduto = document.getElementById("statusProduto");

// Essa funcao monta a data de hoje no formato usado pelo banco: ano-mes-dia.
// Exemplo: 2026-06-03.
function dataCadastroHoje() {
    // Criamos um objeto Date com a data e horario atuais do computador.
    const hoje = new Date();

    // Pegamos o ano completo, por exemplo 2026.
    const ano = hoje.getFullYear();

    // Pegamos o mes atual.
    // O JavaScript conta os meses de 0 a 11, entao somamos 1.
    // O padStart garante dois digitos: 6 vira "06".
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    // Pegamos o dia do mes e tambem garantimos dois digitos.
    const dia = String(hoje.getDate()).padStart(2, "0");

    // Retornamos a data pronta para ser enviada ao campo dt_cadastro_produto.
    return `${ano}-${mes}-${dia}`;
}

// Funcao responsavel por buscar no banco as categorias ja cadastradas.
// Ela e async porque a busca no banco demora um pouco e precisamos usar await.
async function carregarCategorias() {
    // Fazemos um SELECT na tabela categoria_produto.
    // Buscamos o id da categoria e a descricao que vai aparecer para o usuario.
    const { data, error } = await supabaseClient
        .from("categoria_produto")
        .select("categoriaprodutoid, ds_categoria_produto")
        .order("ds_categoria_produto", { ascending: true });

    // Se o Supabase devolver algum erro, mostramos uma mensagem e paramos a funcao.
    if (error) {
        alert("Erro ao carregar categorias: " + error.message);
        categoriaProdutoId.innerHTML = '<option value="">Erro ao carregar categorias</option>';
        return;
    }

    // Limpamos o select e colocamos a primeira opcao pedindo para o usuario escolher.
    categoriaProdutoId.innerHTML = '<option value="">Selecione uma categoria</option>';

    // Se nao existir nenhuma categoria cadastrada, avisamos no proprio select.
    if (data.length === 0) {
        categoriaProdutoId.innerHTML = '<option value="">Nenhuma categoria cadastrada</option>';
        return;
    }

    // Para cada categoria encontrada no banco, criamos uma opcao no select.
    data.forEach((categoria) => {
        // Criamos uma tag <option> pelo JavaScript.
        const opcao = document.createElement("option");

        // O value guarda o id da categoria.
        // Esse id sera enviado para categoriaprodutoid na tabela produto.
        // Isso liga o produto a uma categoria pela chave estrangeira.
        opcao.value = categoria.categoriaprodutoid;

        // O texto visivel para o usuario sera a descricao da categoria.
        opcao.textContent = categoria.ds_categoria_produto;

        // Adicionamos a opcao criada dentro do select de categorias.
        categoriaProdutoId.appendChild(opcao);
    });
}

// Funcao chamada quando o usuario envia o formulario de novo produto.
async function cadastrarProduto(evento) {
    // Evita que o navegador recarregue a pagina automaticamente ao enviar o formulario.
    evento.preventDefault();

    // Criamos um objeto JavaScript com os mesmos campos da tabela produto.
    // Cada propriedade abaixo representa uma coluna da tabela no banco de dados.
    const produto = {
        // Convertendo para numero porque o id da categoria no banco e numerico.
        categoriaprodutoid: Number(categoriaProdutoId.value),

        // trim remove espacos extras no inicio e no fim do texto.
        ds_produto: nome.value.trim(),

        // Descricao ou observacao digitada pelo usuario.
        obs_produto: descricao.value.trim(),

        // Convertendo o valor digitado para numero antes de enviar ao banco.
        vl_venda_produto: Number(val.value),

        // A data de cadastro nao vem do formulario.
        // Ela e gerada automaticamente pela funcao dataCadastroHoje.
        dt_cadastro_produto: dataCadastroHoje(),

        // Status escolhido pelo usuario: ativo ou inativo.
        status_produto: statusProduto.value
    };

    // Fazemos o INSERT na tabela produto.
    // O Supabase vai inserir os dados do objeto produto no banco.
    const { error } = await supabaseClient
        .from("produto")
        .insert(produto);

    // Se acontecer erro no INSERT, mostramos o erro e paramos aqui.
    if (error) {
        alert("Erro: " + error.message);
        return;
    }

    // Se nao houve erro, avisamos que o cadastro deu certo.
    alert("Produto cadastrado com sucesso");

    // Limpamos os campos do formulario para permitir outro cadastro.
    novoProdutoForm.reset();
}

// Assim que a pagina carrega, buscamos as categorias do banco.
carregarCategorias();

// Quando o formulario for enviado, chamamos a funcao cadastrarProduto.
novoProdutoForm.addEventListener("submit", cadastrarProduto);
