"use strict";

/* ==========================================
   FAIZER3D - CATÁLOGO PÚBLICO
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ========= ELEMENTOS ========= */

    const listaCatalogo =
        document.getElementById("listaCatalogo");

    const pesquisaCatalogo =
        document.getElementById("pesquisaCatalogo");

    const filtroCategoria =
        document.getElementById("filtroCategoria");

    const catalogoVazio =
        document.getElementById("catalogoVazio");


    /* ========= MODAL ========= */

    const modalProduto =
        document.getElementById("modalProduto");

    const fecharModalProduto =
        document.getElementById("fecharModalProduto");

    const modalImagemPrincipal =
        document.getElementById("modalImagemPrincipal");

    const modalMiniaturas =
        document.getElementById("modalMiniaturas");

    const contadorImagens =
        document.getElementById("contadorImagens");

    const imagemAnterior =
        document.getElementById("imagemAnterior");

    const proximaImagem =
        document.getElementById("proximaImagem");

    const modalCategoria =
        document.getElementById("modalCategoria");

    const modalNomeProduto =
        document.getElementById("modalNomeProduto");

    const modalPrecoProduto =
        document.getElementById("modalPrecoProduto");

    const modalEstoqueProduto =
        document.getElementById("modalEstoqueProduto");

    const modalObservacoesProduto =
        document.getElementById("modalObservacoesProduto");

    const botaoWhatsAppProduto =
        document.getElementById("botaoWhatsAppProduto");


    /* ========= CONFIGURAÇÕES ========= */

    const NUMERO_WHATSAPP =
        "5544999214316";


    /* ========= PRODUTOS ========= */

    let produtos =
        Array.isArray(
            window.FAIZER3D_PRODUTOS_PUBLICOS
        )
            ? window.FAIZER3D_PRODUTOS_PUBLICOS
            : [];


    /* ========= GALERIA ========= */

    let imagensProdutoAberto = [];

    let indiceImagemAtual = 0;


    /* ==========================================
       FUNÇÕES AUXILIARES
    ========================================== */

    function numero(valor) {

        return Number(valor) || 0;

    }


    function formatarDinheiro(valor) {

        return numero(valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function escaparHTML(texto) {

        const elemento =
            document.createElement("div");

        elemento.textContent =
            texto === undefined ||
            texto === null
                ? ""
                : String(texto);

        return elemento.innerHTML;

    }


    function obterImagensProduto(produto) {

        if (
            Array.isArray(produto.imagens) &&
            produto.imagens.length > 0
        ) {

            return produto.imagens.filter(
                function (imagem) {

                    return (
                        typeof imagem === "string" &&
                        imagem.trim() !== ""
                    );

                }
            );

        }

        if (produto.imagem) {

            return [produto.imagem];

        }

        return [];

    }


    /* ==========================================
       WHATSAPP
    ========================================== */

    function criarMensagemWhatsApp(produto) {

        const mensagem = [
            "Olá, Faizer 3D!",
            "",
            "Tenho interesse neste produto:",
            "",
            `Produto: ${produto.nome || "Não informado"}`,
            `Categoria: ${produto.categoria || "Não informada"}`,
            `Preço: ${formatarDinheiro(produto.vendaSugerida)}`,
            `Código: ${produto.codigo || "Não informado"}`,
            "",
            "Gostaria de fazer um pedido."
        ].join("\n");

        return encodeURIComponent(mensagem);

    }


    function criarLinkWhatsApp(produto) {

        return (
            `https://wa.me/${NUMERO_WHATSAPP}` +
            `?text=${criarMensagemWhatsApp(produto)}`
        );

    }


    /* ==========================================
       CRIAR CARD DO PRODUTO
    ========================================== */

    function criarCardProduto(produto) {

        const nome =
            escaparHTML(
                produto.nome ||
                "Produto sem nome"
            );

        const categoria =
            escaparHTML(
                produto.categoria ||
                "Sem categoria"
            );

        const estoque =
            numero(produto.estoque);

        const preco =
            formatarDinheiro(
                produto.vendaSugerida
            );

        const imagens =
            obterImagensProduto(produto);

        const imagemPrincipal =
            imagens.length > 0
                ? imagens[0]
                : "";


        const imagemHTML =
            imagemPrincipal
                ? `
                    <img
                        src="${imagemPrincipal}"
                        alt="${nome}"
                        class="catalogo-card-imagem"
                    >
                `
                : `
                    <div class="catalogo-sem-imagem">

                        <span>
                            📷
                        </span>

                        <p>
                            Sem imagem
                        </p>

                    </div>
                `;


        const quantidadeFotosHTML =
            imagens.length > 1
                ? `
                    <div class="catalogo-quantidade-fotos">
                        📷 ${imagens.length} fotos
                    </div>
                `
                : "";


        const botaoWhatsAppHTML =
            estoque > 0
                ? `
                    <a
                        href="${criarLinkWhatsApp(produto)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="botao-whatsapp"
                    >
                        🟢 Pedir pelo WhatsApp
                    </a>
                `
                : `
                    <button
                        type="button"
                        class="botao-sem-estoque"
                        disabled
                    >
                        Produto sem estoque
                    </button>
                `;


        const card =
            document.createElement("article");

        card.className =
            "catalogo-card";


        card.innerHTML = `

            <div class="catalogo-imagem-container">

                ${imagemHTML}

                ${quantidadeFotosHTML}

            </div>


            <div class="catalogo-card-conteudo">

                <h2>
                    ${nome}
                </h2>

                <p class="catalogo-categoria">
                    Categoria: ${categoria}
                </p>

                <p class="catalogo-preco">
                    💰 ${preco}
                </p>

                <p class="catalogo-estoque">
                    📦 Estoque: ${estoque}
                </p>

                <button
                    type="button"
                    class="botao-ver-produto"
                >
                    Ver produto
                </button>

                ${botaoWhatsAppHTML}

            </div>

        `;


        const botaoVerProduto =
            card.querySelector(
                ".botao-ver-produto"
            );

        botaoVerProduto.addEventListener(
            "click",
            function () {

                abrirModalProduto(produto);

            }
        );


        const imagemCard =
            card.querySelector(
                ".catalogo-card-imagem"
            );

        if (imagemCard) {

            imagemCard.style.cursor =
                "pointer";

            imagemCard.addEventListener(
                "click",
                function () {

                    abrirModalProduto(produto);

                }
            );

        }


        return card;

    }


    /* ==========================================
       ABRIR MODAL
    ========================================== */

    function abrirModalProduto(produto) {

        imagensProdutoAberto =
            obterImagensProduto(produto);

        indiceImagemAtual = 0;


        modalNomeProduto.textContent =
            produto.nome ||
            "Produto";


        modalCategoria.textContent =
            produto.categoria
                ? `Categoria: ${produto.categoria}`
                : "Sem categoria";


        modalPrecoProduto.textContent =
            formatarDinheiro(
                produto.vendaSugerida
            );


        modalEstoqueProduto.textContent =
            `Estoque disponível: ${numero(produto.estoque)}`;


        const descricao =
            produto.descricao ||
            produto.observacoes ||
            "";


        if (
            descricao.trim() !== ""
        ) {

            modalObservacoesProduto.textContent =
                descricao;

            modalObservacoesProduto.style.display =
                "block";

        } else {

            modalObservacoesProduto.textContent =
                "";

            modalObservacoesProduto.style.display =
                "none";

        }


        if (
            numero(produto.estoque) > 0
        ) {

            botaoWhatsAppProduto.href =
                criarLinkWhatsApp(produto);

            botaoWhatsAppProduto.style.display =
                "inline-flex";

        } else {

            botaoWhatsAppProduto.removeAttribute(
                "href"
            );

            botaoWhatsAppProduto.style.display =
                "none";

        }


        criarMiniaturas();

        atualizarImagemPrincipal();


        modalProduto.hidden =
            false;

        document.body.style.overflow =
            "hidden";

    }


    /* ==========================================
       IMAGEM PRINCIPAL
    ========================================== */

    function atualizarImagemPrincipal() {

        if (
            imagensProdutoAberto.length === 0
        ) {

            modalImagemPrincipal.removeAttribute(
                "src"
            );

            modalImagemPrincipal.style.display =
                "none";

            contadorImagens.textContent =
                "Produto sem imagem";

            imagemAnterior.style.display =
                "none";

            proximaImagem.style.display =
                "none";

            return;

        }


        modalImagemPrincipal.style.display =
            "block";


        modalImagemPrincipal.src =
            imagensProdutoAberto[
                indiceImagemAtual
            ];


        contadorImagens.textContent =
            `${indiceImagemAtual + 1} de ${imagensProdutoAberto.length}`;


        if (
            imagensProdutoAberto.length > 1
        ) {

            imagemAnterior.style.display =
                "flex";

            proximaImagem.style.display =
                "flex";

        } else {

            imagemAnterior.style.display =
                "none";

            proximaImagem.style.display =
                "none";

        }


        const miniaturas =
            modalMiniaturas.querySelectorAll(
                ".modal-miniatura"
            );


        miniaturas.forEach(
            function (
                miniatura,
                indice
            ) {

                if (
                    indice ===
                    indiceImagemAtual
                ) {

                    miniatura.classList.add(
                        "ativa"
                    );

                } else {

                    miniatura.classList.remove(
                        "ativa"
                    );

                }

            }
        );

    }


    /* ==========================================
       MINIATURAS
    ========================================== */

    function criarMiniaturas() {

        modalMiniaturas.innerHTML =
            "";


        if (
            imagensProdutoAberto.length <= 1
        ) {

            modalMiniaturas.style.display =
                "none";

            return;

        }


        modalMiniaturas.style.display =
            "flex";


        imagensProdutoAberto.forEach(
            function (
                imagem,
                indice
            ) {

                const miniatura =
                    document.createElement(
                        "img"
                    );

                miniatura.src =
                    imagem;

                miniatura.alt =
                    `Foto ${indice + 1}`;

                miniatura.className =
                    "modal-miniatura";


                miniatura.addEventListener(
                    "click",
                    function () {

                        indiceImagemAtual =
                            indice;

                        atualizarImagemPrincipal();

                    }
                );


                modalMiniaturas.appendChild(
                    miniatura
                );

            }
        );

    }


    /* ==========================================
       NAVEGAÇÃO DAS FOTOS
    ========================================== */

    function mostrarImagemAnterior() {

        if (
            imagensProdutoAberto.length <= 1
        ) {

            return;

        }


        indiceImagemAtual--;


        if (
            indiceImagemAtual < 0
        ) {

            indiceImagemAtual =
                imagensProdutoAberto.length - 1;

        }


        atualizarImagemPrincipal();

    }


    function mostrarProximaImagem() {

        if (
            imagensProdutoAberto.length <= 1
        ) {

            return;

        }


        indiceImagemAtual++;


        if (
            indiceImagemAtual >=
            imagensProdutoAberto.length
        ) {

            indiceImagemAtual =
                0;

        }


        atualizarImagemPrincipal();

    }


    /* ==========================================
       FECHAR MODAL
    ========================================== */

    function fecharModal() {

        modalProduto.hidden =
            true;

        document.body.style.overflow =
            "";

        imagensProdutoAberto =
            [];

        indiceImagemAtual =
            0;

    }


    /* ==========================================
       CATEGORIAS
    ========================================== */

    function preencherCategorias() {

        if (!filtroCategoria) {

            return;

        }


        filtroCategoria.innerHTML = `

            <option value="">
                Todas as categorias
            </option>

        `;


        const categorias = [

            ...new Set(

                produtos

                    .map(
                        function (produto) {

                            return produto.categoria;

                        }
                    )

                    .filter(
                        function (categoria) {

                            return (
                                categoria &&
                                categoria.trim() !== ""
                            );

                        }
                    )

            )

        ];


        categorias.sort(
            function (a, b) {

                return a.localeCompare(
                    b,
                    "pt-BR"
                );

            }
        );


        categorias.forEach(
            function (categoria) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    categoria;

                option.textContent =
                    categoria;

                filtroCategoria.appendChild(
                    option
                );

            }
        );

    }


    /* ==========================================
       FILTRO
    ========================================== */

    function obterProdutosFiltrados() {

        const termo =
            pesquisaCatalogo
                ? pesquisaCatalogo.value
                    .trim()
                    .toLowerCase()
                : "";


        const categoriaSelecionada =
            filtroCategoria
                ? filtroCategoria.value
                    .trim()
                    .toLowerCase()
                : "";


        return produtos.filter(
            function (produto) {

                const nome =
                    String(
                        produto.nome || ""
                    ).toLowerCase();


                const categoria =
                    String(
                        produto.categoria || ""
                    ).toLowerCase();


                const codigo =
                    String(
                        produto.codigo || ""
                    ).toLowerCase();


                const correspondePesquisa =
                    nome.includes(termo) ||
                    categoria.includes(termo) ||
                    codigo.includes(termo);


                const correspondeCategoria =
                    categoriaSelecionada === "" ||
                    categoria ===
                    categoriaSelecionada;


                return (
                    correspondePesquisa &&
                    correspondeCategoria
                );

            }
        );

    }


    /* ==========================================
       MOSTRAR CATÁLOGO
    ========================================== */

    function mostrarCatalogo() {

        listaCatalogo.innerHTML =
            "";


        const produtosFiltrados =
            obterProdutosFiltrados();


        if (
            produtosFiltrados.length === 0
        ) {

            catalogoVazio.hidden =
                false;

            return;

        }


        catalogoVazio.hidden =
            true;


        produtosFiltrados.forEach(
            function (produto) {

                listaCatalogo.appendChild(
                    criarCardProduto(produto)
                );

            }
        );

    }


    /* ==========================================
       EVENTOS
    ========================================== */

    pesquisaCatalogo.addEventListener(
        "input",
        mostrarCatalogo
    );


    filtroCategoria.addEventListener(
        "change",
        mostrarCatalogo
    );


    fecharModalProduto.addEventListener(
        "click",
        fecharModal
    );


    imagemAnterior.addEventListener(
        "click",
        mostrarImagemAnterior
    );


    proximaImagem.addEventListener(
        "click",
        mostrarProximaImagem
    );


    const fundoModal =
        modalProduto.querySelector(
            ".modal-produto-fundo"
        );


    fundoModal.addEventListener(
        "click",
        fecharModal
    );


    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                modalProduto.hidden
            ) {

                return;

            }


            if (
                evento.key === "Escape"
            ) {

                fecharModal();

            }


            if (
                evento.key === "ArrowLeft"
            ) {

                mostrarImagemAnterior();

            }


            if (
                evento.key === "ArrowRight"
            ) {

                mostrarProximaImagem();

            }

        }
    );


    /* ==========================================
       INICIAR
    ========================================== */

    preencherCategorias();

    mostrarCatalogo();

});
