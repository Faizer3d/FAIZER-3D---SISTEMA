"use strict";

/* ==========================================
   FAIZER3D - DASHBOARD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const CHAVE_CLIENTES =
            "faizer3d_clientes";

        const CHAVE_PRODUTOS =
            "faizer3d_produtos";

        const CHAVE_PEDIDOS =
            "faizer3d_pedidos";

        const totalClientes =
            document.getElementById(
                "totalClientes"
            );

        const totalProdutos =
            document.getElementById(
                "totalProdutos"
            );

        const totalEstoque =
            document.getElementById(
                "totalEstoque"
            );

        const valorEstoque =
            document.getElementById(
                "valorEstoque"
            );

        const dashboardProdutos =
            document.getElementById(
                "dashboardProdutos"
            );

        const dashboardSemProdutos =
            document.getElementById(
                "dashboardSemProdutos"
            );

        const producaoHoje =
            document.getElementById(
                "producaoHoje"
            );

        const producaoHojeVazia =
            document.getElementById(
                "producaoHojeVazia"
            );

        const clientes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CLIENTES
                )
            ) || [];

        const produtos =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_PRODUTOS
                )
            ) || [];

        const pedidos =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_PEDIDOS
                )
            ) || [];

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

        function formatarData(data) {

            if (!data) {
                return "";
            }

            const partes =
                data.split("-");

            if (partes.length !== 3) {
                return data;
            }

            return (
                ${partes[2]}/ +
                ${partes[1]}/ +
                ${partes[0]}
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

        function obterDataHoje() {

            const hoje =
                new Date();

            const ano =
                hoje.getFullYear();

            const mes =
                String(
                    hoje.getMonth() + 1
                ).padStart(2, "0");

            const dia =
                String(
                    hoje.getDate()
                ).padStart(2, "0");

            return ${ano}-${mes}-${dia};

        }

        function calcularDiasAte(data) {

            if (!data) {
                return null;
            }

            const hoje =
                new Date(
                    ${obterDataHoje()}T00:00:00
                );

            const entrega =
                new Date(
                    ${data}T00:00:00
                );

            const diferenca =
                entrega.getTime() -
                hoje.getTime();

            return Math.ceil(
                diferenca /
                (1000 * 60 * 60 * 24)
            );

        }

        function atualizarIndicadores() {

            const quantidadeEstoque =
                produtos.reduce(
                    function (total, produto) {

                        return (
                            total +
                            numero(produto.estoque)
                        );

                    },
                    0
                );

            const valorTotalEstoque =
                produtos.reduce(
                    function (total, produto) {

                        return (
                            total +
                            (
                                numero(
                                    produto.vendaSugerida
                                ) *
                                numero(
                                    produto.estoque
                                )
                            )
                        );

                    },
                    0
                );

            totalClientes.textContent =
                clientes.length;

            totalProdutos.textContent =
                produtos.length;

            totalEstoque.textContent =
                quantidadeEstoque;

            valorEstoque.textContent =
                formatarDinheiro(
                    valorTotalEstoque
                );

        }

        function criarProdutoDashboard(
            produto
        ) {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "dashboard-produto";

            const imagem =
                produto.imagem
                    ? `
                        <img
                            src="${produto.imagem}"
                            alt="${escaparHTML(
                                produto.nome
                            )}"
                        >
                    `
                    : `
                        <div
                            class="dashboard-produto-sem-imagem"
                        >
                            📦
                        </div>
                    `;

            card.innerHTML = `

                ${imagem}

                <div
                    class="dashboard-produto-info"
                >

                    <h3>
                        ${escaparHTML(
                            produto.nome
                        )}
                    </h3>

                    <p>
                        Código:
                        ${escaparHTML(
                            produto.codigo
                        )}
                    </p>

                    <p>
                        Estoque:
                        ${numero(
                            produto.estoque
                        )}
                    </p>

                    <strong>
                        ${formatarDinheiro(
                            produto.vendaSugerida
                        )}
                    </strong>

                </div>

            `;

            return card;

        }

        function listarUltimosProdutos() {

            dashboardProdutos.innerHTML =
                "";

            if (produtos.length === 0) {

                dashboardSemProdutos.hidden =
                    false;

                return;

            }

            dashboardSemProdutos.hidden =
                true;

            produtos
                .slice()
                .reverse()
                .slice(0, 4)
                .forEach(
                    function (produto) {

                        dashboardProdutos
                            .appendChild(
                                criarProdutoDashboard(
                                    produto
                                )
                            );

                    }
                );

        }

        function obterClasseStatus(status) {

            const classes = {

                "Aguardando":
                    "producao-status-aguardando",

                "Em impressão":
                    "producao-status-impressao",

                "Pós-processo":
                    "producao-status-pos",

                "Pintura":
                    "producao-status-pintura",

                "Finalizado":
                    "producao-status-finalizado",

                "Entregue":
                    "producao-status-entregue"

            };

            return (
                classes[status] ||
                "producao-status-aguardando"
            );

        }

        function criarAvisoEntrega(pedido) {

            const dias =
                calcularDiasAte(
                    pedido.dataEntrega
                );

            if (dias === null) {
                return "";
            }

            if (dias < 0) {

                return `
                    <p class="producao-alerta producao-atrasado">
                        ⚠️ Entrega atrasada há
                        ${Math.abs(dias)}
                        dia(s)
                    </p>
                `;

            }

            if (dias === 0) {

                return `
                    <p class="producao-alerta producao-hoje">
                        🔴 Entrega hoje
                    </p>
                `;

            }

            if (dias === 1) {

                return `
                    <p class="producao-alerta producao-amanha">
                        🟠 Entrega amanhã
                    </p>
                `;

            }

            return `
                <p class="producao-alerta">
                    Entrega em ${dias} dia(s)
                </p>
            `;

        }

        function criarCardProducao(pedido) {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "producao-card";

            const itens =
                Array.isArray(pedido.itens)
                    ? pedido.itens
                    : [];

            const nomesProdutos =
                itens.length > 0
                    ? itens
                        .map(function (item) {
                            return item.nome;
                        })
                        .join(", ")
                    : "Produto não informado";

            card.innerHTML = `

                <div class="producao-card-topo">

                    <strong>
                        ${escaparHTML(
                            pedido.numero ||
                            "Pedido"
                        )}
                    </strong>

                    <span
                        class="producao-status ${obterClasseStatus(
                            pedido.status
                        )}"
                    >
                        ${escaparHTML(
                            pedido.status ||
                            "Aguardando"
                        )}
                    </span>

                </div>

                <h3>
                    ${escaparHTML(
                        pedido.clienteNome ||
                        "Cliente"
                    )}
                </h3>

                <p class="producao-produtos">
                    ${escaparHTML(
                        nomesProdutos
                    )}
                </p>

                <p>
                    Entrega:
                    <strong>
                        ${formatarData(
                            pedido.dataEntrega
                        )}
                    </strong>
                </p>

                ${criarAvisoEntrega(pedido)}

                <a
                    href="pages/pedidos.html"
                    class="producao-link"
                >
                    Abrir pedido
                </a>

            `;

            return card;

        }

        function listarProducaoHoje() {

            if (
                !producaoHoje ||
                !producaoHojeVazia
            ) {
                return;
            }

            producaoHoje.innerHTML = "";

            const pedidosAtivos =
                pedidos
                    .filter(
                        function (pedido) {

                            return (
                                pedido.status !==
                                "Entregue"
                            );

                        }
                    )
                    .sort(
                        function (a, b) {

                            return String(
                                a.dataEntrega || ""
                            ).localeCompare(
                                String(
                                    b.dataEntrega || ""
                                )
                            );

                        }
                    )
                    .slice(0, 6);

            if (
                pedidosAtivos.length === 0
            ) {

                producaoHojeVazia.hidden =
                    false;

                return;

            }

            producaoHojeVazia.hidden =
                true;

            pedidosAtivos.forEach(
                function (pedido) {

                    producaoHoje.appendChild(
                        criarCardProducao(
                            pedido
                        )
                    );

                }
            );

        }

        atualizarIndicadores();

        listarProducaoHoje();

        listarUltimosProdutos();

    }
);