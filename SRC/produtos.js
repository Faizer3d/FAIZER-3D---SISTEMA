"use strict";

/* ==========================================
   FAIZER3D - Cadastro de Produtos
========================================== */

/* ========= ELEMENTOS ========= */

const formProduto = document.getElementById("formProduto");

const codigo = document.getElementById("codigo");
const nomeProduto = document.getElementById("nomeProduto");
const categoria = document.getElementById("categoria");
const unidade = document.getElementById("unidade");

const pesoFilamento = document.getElementById("pesoFilamento");
const precoFilamentoKg = document.getElementById("precoFilamentoKg");

const tempoImpressao = document.getElementById("tempoImpressao");
const custoMaquinaHora = document.getElementById("custoMaquinaHora");

const tempoElaboracao = document.getElementById("tempoElaboracao");
const valorHoraTrabalho = document.getElementById("valorHoraTrabalho");

const custoCalculado = document.getElementById("custoCalculado");
const lucroPercentual = document.getElementById("lucroPercentual");
const vendaSugerida = document.getElementById("vendaSugerida");

const estoque = document.getElementById("estoque");
const observacoes = document.getElementById("observacoes");

const pesquisaProduto = document.getElementById("pesquisaProduto");
const listaProdutos = document.getElementById("listaProdutos");

const imagemProduto = document.getElementById("imagemProduto");
const previewImagem = document.getElementById("previewImagem");
const textoPreview = document.getElementById("textoPreview");
const btnRemoverImagem = document.getElementById("btnRemoverImagem");

const btnSalvarProduto =
    document.getElementById("btnSalvarProduto");

/* ========= LOCAL STORAGE ========= */

const CHAVE_PRODUTOS = "faizer3d_produtos";

let produtos =
    JSON.parse(localStorage.getItem(CHAVE_PRODUTOS)) || [];

let indiceEmEdicao = null;

let imagemAtual = "";

/* ========= FUNÇÕES AUXILIARES ========= */

function numero(valor){
    return Number(valor) || 0;
}

function formatarDinheiro(valor){

    return numero(valor).toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}

function salvarProdutos(){

    localStorage.setItem(

        CHAVE_PRODUTOS,

        JSON.stringify(produtos)

    );

}
/* ==========================================
   CÁLCULO DE CUSTOS
========================================== */

function calcularCusto(){

    const custoMaterial =
        (numero(pesoFilamento.value)/1000) *
        numero(precoFilamentoKg.value);

    const custoMaquina =
        numero(tempoImpressao.value) *
        numero(custoMaquinaHora.value);

    const custoMaoObra =
        numero(tempoElaboracao.value) *
        numero(valorHoraTrabalho.value);

    const custoTotal =
        custoMaterial +
        custoMaquina +
        custoMaoObra;

    const venda =
        custoTotal +
        (custoTotal *
        numero(lucroPercentual.value)/100);

    custoCalculado.value =
        custoTotal.toFixed(2);

    vendaSugerida.value =
        venda.toFixed(2);

}

/* ==========================================
   IMAGEM DO PRODUTO
========================================== */

function mostrarImagem(imagem){

    imagemAtual = imagem || "";

    if(imagemAtual){

        previewImagem.src = imagemAtual;

        previewImagem.style.display = "block";

        textoPreview.style.display = "none";

        btnRemoverImagem.hidden = false;

    }else{

        previewImagem.removeAttribute("src");

        previewImagem.style.display = "none";

        textoPreview.style.display = "block";

        btnRemoverImagem.hidden = true;

    }

}

imagemProduto.addEventListener("change",function(){

    const arquivo = this.files[0];

    if(!arquivo){

        return;

    }

    const leitor = new FileReader();

    leitor.onload = function(e){

        mostrarImagem(e.target.result);

    };

    leitor.readAsDataURL(arquivo);

});

btnRemoverImagem.addEventListener("click",function(){

    imagemProduto.value = "";

    mostrarImagem("");

});

/* ==========================================
   LIMPAR FORMULÁRIO
========================================== */

function limparFormulario(){

    formProduto.reset();

    pesoFilamento.value = 0;
    precoFilamentoKg.value = 0;

    tempoImpressao.value = 0;
    custoMaquinaHora.value = 0;

    tempoElaboracao.value = 0;
    valorHoraTrabalho.value = 0;

    lucroPercentual.value = 0;

    estoque.value = 0;

    custoCalculado.value = "0.00";

    vendaSugerida.value = "0.00";

    indiceEmEdicao = null;

    mostrarImagem("");

    btnSalvarProduto.textContent =
        "Salvar Produto";

}
/* ==========================================
   SALVAR OU ATUALIZAR PRODUTO
========================================== */

formProduto.addEventListener("submit", function(evento){

    evento.preventDefault();

    calcularCusto();

    const novoProduto = {

        id:
            indiceEmEdicao === null
                ? Date.now()
                : produtos[indiceEmEdicao].id,

        imagem: imagemAtual,

        codigo: codigo.value.trim(),

        nome: nomeProduto.value.trim(),

        categoria: categoria.value.trim(),

        unidade: unidade.value,

        pesoFilamento:
            numero(pesoFilamento.value),

        precoFilamentoKg:
            numero(precoFilamentoKg.value),

        tempoImpressao:
            numero(tempoImpressao.value),

        custoMaquinaHora:
            numero(custoMaquinaHora.value),

        tempoElaboracao:
            numero(tempoElaboracao.value),

        valorHoraTrabalho:
            numero(valorHoraTrabalho.value),

        custoCalculado:
            numero(custoCalculado.value),

        lucroPercentual:
            numero(lucroPercentual.value),

        vendaSugerida:
            numero(vendaSugerida.value),

        estoque:
            numero(estoque.value),

        observacoes:
            observacoes.value.trim()

    };

    if(!novoProduto.codigo){

        alert("Informe o código do produto.");

        codigo.focus();

        return;

    }

    if(!novoProduto.nome){

        alert("Informe o nome do produto.");

        nomeProduto.focus();

        return;

    }

    const codigoDuplicado =
        produtos.some(function(produto, indice){

            return (
                String(produto.codigo).toLowerCase() ===
                novoProduto.codigo.toLowerCase()
                &&
                indice !== indiceEmEdicao
            );

        });

    if(codigoDuplicado){

        alert("Já existe um produto com esse código.");

        codigo.focus();

        return;

    }

    if(indiceEmEdicao === null){

        produtos.push(novoProduto);

        alert("Produto salvo com sucesso!");

    }else{

        produtos[indiceEmEdicao] = novoProduto;

        alert("Produto atualizado com sucesso!");

    }

    salvarProdutos();

    listarProdutos();

    limparFormulario();

});

/* ==========================================
   LISTAR PRODUTOS
========================================== */

function listarProdutos(lista = produtos){

    listaProdutos.innerHTML = "";

    if(lista.length === 0){

        listaProdutos.innerHTML = `
            <tr>
                <td colspan="8">
                    Nenhum produto cadastrado.
                </td>
            </tr>
        `;

        return;

    }

    lista.forEach(function(produto){

        const indiceReal =
            produtos.findIndex(function(item){

                return item.id === produto.id;

            });

        const linha =
            document.createElement("tr");

        const imagemTabela =
            produto.imagem
                ? `
                    <img
                        src="${produto.imagem}"
                        alt="${produto.nome}"
                        style="
                            width:70px;
                            height:70px;
                            object-fit:cover;
                            border-radius:8px;
                        "
                    >
                `
                : "Sem foto";

        linha.innerHTML = `

            <td>
                ${imagemTabela}
            </td>

            <td>
                ${produto.codigo}
            </td>

            <td>
                ${produto.nome}
            </td>

            <td>
                ${produto.categoria}
            </td>

            <td>
                ${produto.estoque}
            </td>

            <td>
                ${formatarDinheiro(
                    produto.custoCalculado
                )}
            </td>

            <td>
                ${formatarDinheiro(
                    produto.vendaSugerida
                )}
            </td>

            <td>

                <button
                    type="button"
                    onclick="editarProduto(${indiceReal})"
                >
                    Editar
                </button>

                <button
                    type="button"
                    onclick="excluirProduto(${indiceReal})"
                >
                    Excluir
                </button>

            </td>

        `;

        listaProdutos.appendChild(linha);

    });

}
/* ==========================================
   EDITAR PRODUTO
========================================== */

function editarProduto(indice){

    const produto = produtos[indice];

    codigo.value = produto.codigo;
    nomeProduto.value = produto.nome;
    categoria.value = produto.categoria;
    unidade.value = produto.unidade;

    pesoFilamento.value = produto.pesoFilamento;
    precoFilamentoKg.value = produto.precoFilamentoKg;

    tempoImpressao.value = produto.tempoImpressao;
    custoMaquinaHora.value = produto.custoMaquinaHora;

    tempoElaboracao.value = produto.tempoElaboracao;
    valorHoraTrabalho.value = produto.valorHoraTrabalho;

    lucroPercentual.value = produto.lucroPercentual;

    estoque.value = produto.estoque;

    observacoes.value = produto.observacoes;

    mostrarImagem(produto.imagem);

    indiceEmEdicao = indice;

    calcularCusto();

    btnSalvarProduto.textContent =
        "Atualizar Produto";

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

/* ==========================================
   EXCLUIR PRODUTO
========================================== */

function excluirProduto(indice){

    if(!confirm("Deseja excluir este produto?")){
        return;
    }

    produtos.splice(indice,1);

    salvarProdutos();

    listarProdutos();

    if(indiceEmEdicao === indice){
        limparFormulario();
    }

}

/* ==========================================
   PESQUISA
========================================== */

pesquisaProduto.addEventListener("input",function(){

    const termo =
        pesquisaProduto.value.toLowerCase();

    const listaFiltrada =
        produtos.filter(function(produto){

            return(

                produto.codigo.toLowerCase().includes(termo)

                ||

                produto.nome.toLowerCase().includes(termo)

                ||

                produto.categoria.toLowerCase().includes(termo)

            );

        });

    listarProdutos(listaFiltrada);

});

/* ==========================================
   EVENTOS DOS CÁLCULOS
========================================== */

[
pesoFilamento,
precoFilamentoKg,
tempoImpressao,
custoMaquinaHora,
tempoElaboracao,
valorHoraTrabalho,
lucroPercentual

].forEach(function(campo){

    campo.addEventListener(

        "input",

        calcularCusto

    );

});

/* ==========================================
   INICIAR SISTEMA
========================================== */

mostrarImagem("");

calcularCusto();

listarProdutos();