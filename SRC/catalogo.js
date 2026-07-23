"use strict";

/* ==========================================
   FAIZER3D - CATÁLOGO DE PRODUTOS
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

    /* ========= CONFIGURAÇÕES ========= */

    const CHAVE_PRODUTOS = "faizer3d_produtos";

    const NUMERO_WHATSAPP = "5544999214316";

    let produtos =
        JSON.parse(
            localStorage.getItem(CHAVE_PRODUTOS)
        ) || [];

    /* ========= FUNÇÕES AUXILIARES ========= */

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
            texto === undefined || texto === null
                ? ""
                : String(texto);

        return elemento.innerHTML;

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
            Produto: ${produto.nome},
            Categoria: ${produto.categoria || "Não informada"},
            Preço: ${formatarDinheiro(produto.vendaSugerida)},
            Código: ${produto.codigo || "Não informado"},
            "",
            "Gostaria de fazer um pedido."
        ].join("\n");

        return encodeURIComponent(mensagem);

    }

    function criarLinkWhatsApp(produto) {

        return (
            https://wa.me/${NUMERO_WHATSAPP} +
            ?text=${criarMensagemWhatsApp(produto)}
        );

    }

    /* ==========================================
       CRIAR CARD
    ========================================== */

    function criarCardProduto(produto) {

        const nome =
            escaparHTML(produto.nome || "Produto sem nome");

        const categoria =
            escaparHTML(
                produto.categoria || "Sem categoria"
            );

        const estoque =
            numero(produto.estoque);

        const preco =
            formatarDinheiro(
                produto.vendaSugerida
            );

        const imagemHTML =
            produto.imagem
                ? `
                    <img
                        src="${produto.imagem}"
                        alt="${nome}"
                        class="catalogo-card-imagem"
                    >
                `
                : `
                    <div class="catalogo-sem-imagem">
                        <span>📷</span>
                        <p>Sem imagem</p>
                    </div>
                `;

        const botaoHTML =
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

        card.className = "catalogo-card";

        card.innerHTML = `

            <div class="catalogo-imagem-container">

                ${imagemHTML}

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

                ${botaoHTML}

            </div>

        `;

        return card;

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
                    .map(function (produto) {
                        return produto.categoria;
                    })
                    .filter(function (categoria) {
                        return categoria &&
                            categoria.trim() !== "";
                    })
            )
        ];

        categorias.sort(function (a, b) {

            return a.localeCompare(
                b,
                "pt-BR"
            );

        });

        categorias.forEach(function (categoria) {

            const option =
                document.createElement("option");

            option.value = categoria;

            option.textContent = categoria;

            filtroCategoria.appendChild(option);

        });

    }

    /* ==========================================
       FILTRAR PRODUTOS
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

        return produtos.filter(function (produto) {

            const nome =
                String(produto.nome || "")
                    .toLowerCase();

            const categoria =
                String(produto.categoria || "")
                    .toLowerCase();

            const codigo =
                String(produto.codigo || "")
                    .toLowerCase();

            const correspondePesquisa =
                nome.includes(termo) ||
                categoria.includes(termo) ||
                codigo.includes(termo);

            const correspondeCategoria =
                categoriaSelecionada === "" ||
                categoria === categoriaSelecionada;

            return (
                correspondePesquisa &&
                correspondeCategoria
            );

        });

    }

    /* ==========================================
       MOSTRAR CATÁLOGO
    ========================================== */

    function mostrarCatalogo() {

        if (!listaCatalogo) {

            console.error(
                "Elemento listaCatalogo não encontrado."
            );

            return;

        }

        const produtosFiltrados =
            obterProdutosFiltrados();

        listaCatalogo.innerHTML = "";

        if (produtosFiltrados.length === 0) {

            if (catalogoVazio) {
                catalogoVazio.hidden = false;
            }

            return;

        }

        if (catalogoVazio) {
            catalogoVazio.hidden = true;
        }

        produtosFiltrados.forEach(
            function (produto) {

                const card =
                    criarCardProduto(produto);

                listaCatalogo.appendChild(card);

            }
        );

    }

    /* ==========================================
       EVENTOS
    ========================================== */

    if (pesquisaCatalogo) {

        pesquisaCatalogo.addEventListener(
            "input",
            mostrarCatalogo
        );

    }

    if (filtroCategoria) {

        filtroCategoria.addEventListener(
            "change",
            mostrarCatalogo
        );

    }

    window.addEventListener(
        "storage",
        function () {

            produtos =
                JSON.parse(
                    localStorage.getItem(
                        CHAVE_PRODUTOS
                    )
                ) || [];

            preencherCategorias();

            mostrarCatalogo();

        }
    );

    /* ==========================================
       INICIAR CATÁLOGO
    ========================================== */

    preencherCategorias();

    mostrarCatalogo();

}); 