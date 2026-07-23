"use strict";

/* ==========================================
   FAIZER3D - CONTROLE DE PEDIDOS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const CHAVE_CLIENTES = "faizer3d_clientes";
    const CHAVE_PRODUTOS = "faizer3d_produtos";
    const CHAVE_PEDIDOS = "faizer3d_pedidos";

    /* ========= ELEMENTOS ========= */

    const formPedido =
        document.getElementById("formPedido");

    const numeroPedido =
        document.getElementById("numeroPedido");

    const dataPedido =
        document.getElementById("dataPedido");

    const dataEntrega =
        document.getElementById("dataEntrega");

    const clientePedido =
        document.getElementById("clientePedido");

    const statusPedido =
        document.getElementById("statusPedido");

    const produtoPedido =
        document.getElementById("produtoPedido");

    const quantidadePedido =
        document.getElementById("quantidadePedido");

    const valorPedido =
        document.getElementById("valorPedido");

    const btnAdicionarItemPedido =
        document.getElementById("btnAdicionarItemPedido");

    const listaItensPedido =
        document.getElementById("listaItensPedido");

    const descontoPedido =
        document.getElementById("descontoPedido");

    const fretePedido =
        document.getElementById("fretePedido");

    const subtotalPedido =
        document.getElementById("subtotalPedido");

    const resumoDescontoPedido =
        document.getElementById("resumoDescontoPedido");

    const resumoFretePedido =
        document.getElementById("resumoFretePedido");

    const totalPedido =
        document.getElementById("totalPedido");

    const observacoesPedido =
        document.getElementById("observacoesPedido");

    const filtroStatusPedido =
        document.getElementById("filtroStatusPedido");

    const pesquisaPedido =
        document.getElementById("pesquisaPedido");

    const listaPedidosSalvos =
        document.getElementById("listaPedidosSalvos");

    /* ========= DADOS ========= */

    let clientes =
        JSON.parse(
            localStorage.getItem(CHAVE_CLIENTES)
        ) || [];

    let produtos =
        JSON.parse(
            localStorage.getItem(CHAVE_PRODUTOS)
        ) || [];

    let pedidos =
        JSON.parse(
            localStorage.getItem(CHAVE_PEDIDOS)
        ) || [];

    let itensPedido = [];

    let indiceEmEdicao = null;

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

    function formatarData(data) {

        if (!data) {
            return "";
        }

        const partes = data.split("-");

        if (partes.length !== 3) {
            return data;
        }

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
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

    function salvarPedidos() {

        localStorage.setItem(
            CHAVE_PEDIDOS,
            JSON.stringify(pedidos)
        );

    }

    function criarDataLocal(data) {

        const ano =
            data.getFullYear();

        const mes =
            String(
                data.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                data.getDate()
            ).padStart(2, "0");

        return ${ano}-${mes}-${dia};

    }

    /* ==========================================
       NÚMERO DO PEDIDO
    ========================================== */

    function gerarNumeroPedido() {

        if (indiceEmEdicao !== null) {
            return;
        }

        let maiorNumero = 0;

        pedidos.forEach(function (pedido) {

            const numeroEncontrado =
                Number(
                    String(pedido.numero || "")
                        .replace(/\D/g, "")
                );

            if (numeroEncontrado > maiorNumero) {
                maiorNumero = numeroEncontrado;
            }

        });

        numeroPedido.value =
            "PED-" +
            String(maiorNumero + 1)
                .padStart(4, "0");

    }

    /* ==========================================
       DATAS
    ========================================== */

    function preencherDatas() {

        if (!dataPedido.value) {

            const hoje = new Date();

            dataPedido.value =
                criarDataLocal(hoje);

        }

        if (!dataEntrega.value) {

            const entrega = new Date();

            entrega.setDate(
                entrega.getDate() + 7
            );

            dataEntrega.value =
                criarDataLocal(entrega);

        }

    }

    /* ==========================================
       CLIENTES
    ========================================== */

    function carregarClientes() {

        clientePedido.innerHTML = `
            <option value="">
                Selecione um cliente
            </option>
        `;

        clientes.forEach(function (cliente) {

            const option =
                document.createElement("option");

            option.value =
                String(cliente.id);

            option.textContent =
                cliente.nome ||
                cliente.nomeRazaoSocial ||
                "Cliente sem nome";

            clientePedido.appendChild(option);

        });

    }

    /* ==========================================
       PRODUTOS
    ========================================== */

    function carregarProdutos() {

        produtoPedido.innerHTML = `
            <option value="">
                Selecione um produto
            </option>
        `;

        produtos.forEach(function (produto) {

            const option =
                document.createElement("option");

            option.value =
                String(produto.id);

            option.textContent =
                ${produto.codigo} - ${produto.nome};

            produtoPedido.appendChild(option);

        });

    }

    produtoPedido.addEventListener(
        "change",
        function () {

            const produtoSelecionado =
                produtos.find(function (produto) {

                    return (
                        String(produto.id) ===
                        produtoPedido.value
                    );

                });

            if (!produtoSelecionado) {

                valorPedido.value = "0.00";

                return;

            }

            valorPedido.value =
                numero(
                    produtoSelecionado.vendaSugerida
                ).toFixed(2);

        }
    );

    /* ==========================================
       CÁLCULOS
    ========================================== */

    function calcularSubtotal() {

        return itensPedido.reduce(
            function (total, item) {

                return (
                    total +
                    (
                        numero(item.quantidade) *
                        numero(item.valorUnitario)
                    )
                );

            },
            0
        );

    }

    function calcularTotal() {

        const subtotal =
            calcularSubtotal();

        const desconto =
            numero(descontoPedido.value);

        const frete =
            numero(fretePedido.value);

        const total =
            Math.max(
                subtotal - desconto + frete,
                0
            );

        subtotalPedido.textContent =
            formatarDinheiro(subtotal);

        resumoDescontoPedido.textContent =
            formatarDinheiro(desconto);

        resumoFretePedido.textContent =
            formatarDinheiro(frete);

        totalPedido.textContent =
            formatarDinheiro(total);

        return total;

    }

    descontoPedido.addEventListener(
        "input",
        calcularTotal
    );

    fretePedido.addEventListener(
        "input",
        calcularTotal
    );

    /* ==========================================
       ITENS DO PEDIDO
    ========================================== */

    function listarItensPedido() {

        listaItensPedido.innerHTML = "";

        if (itensPedido.length === 0) {

            listaItensPedido.innerHTML = `
                <tr id="pedidoSemItens">
                    <td colspan="5">
                        Nenhum produto adicionado.
                    </td>
                </tr>
            `;

            calcularTotal();

            return;

        }

        itensPedido.forEach(
            function (item, indice) {

                const subtotal =
                    numero(item.quantidade) *
                    numero(item.valorUnitario);

                const linha =
                    document.createElement("tr");

                linha.innerHTML = `

                    <td>
                        ${escaparHTML(item.nome)}
                    </td>

                    <td>
                        ${item.quantidade}
                    </td>

                    <td>
                        ${formatarDinheiro(
                            item.valorUnitario
                        )}
                    </td>

                    <td>
                        ${formatarDinheiro(
                            subtotal
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="botao-excluir-estoque"
                            onclick="removerItemPedido(${indice})"
                        >
                            Remover
                        </button>

                    </td>

                `;

                listaItensPedido.appendChild(linha);

            }
        );

        calcularTotal();

    }

    btnAdicionarItemPedido.addEventListener(
        "click",
        function () {

            const produtoSelecionado =
                produtos.find(function (produto) {

                    return (
                        String(produto.id) ===
                        produtoPedido.value
                    );

                });

            if (!produtoSelecionado) {

                alert(
                    "Selecione um produto."
                );

                produtoPedido.focus();

                return;

            }

            const quantidade =
                numero(quantidadePedido.value);

            const valorUnitario =
                numero(valorPedido.value);

            if (quantidade <= 0) {

                alert(
                    "Informe uma quantidade válida."
                );

                quantidadePedido.focus();

                return;

            }

            if (valorUnitario <= 0) {

                alert(
                    "Informe um valor unitário válido."
                );

                valorPedido.focus();

                return;

            }

            const itemExistente =
                itensPedido.find(function (item) {

                    return (
                        String(item.produtoId) ===
                        String(produtoSelecionado.id)
                    );

                });

            if (itemExistente) {

                itemExistente.quantidade +=
                    quantidade;

                itemExistente.valorUnitario =
                    valorUnitario;

            } else {

                itensPedido.push({

                    produtoId:
                        produtoSelecionado.id,

                    codigo:
                        produtoSelecionado.codigo,

                    nome:
                        produtoSelecionado.nome,

                    quantidade:
                        quantidade,

                    valorUnitario:
                        valorUnitario,

                    pesoFilamento:
                        numero(
                            produtoSelecionado
                                .pesoFilamento
                        )

                });

            }

            produtoPedido.value = "";

            quantidadePedido.value = "1";

            valorPedido.value = "0.00";

            listarItensPedido();

        }
    );

    window.removerItemPedido =
        function (indice) {

            itensPedido.splice(indice, 1);

            listarItensPedido();

        };

    /* ==========================================
       LIMPAR FORMULÁRIO
    ========================================== */

    function limparFormulario() {

        formPedido.reset();

        itensPedido = [];

        indiceEmEdicao = null;

        descontoPedido.value = "0.00";

        fretePedido.value = "0.00";

        quantidadePedido.value = "1";

        valorPedido.value = "0.00";

        statusPedido.value = "Aguardando";

        numeroPedido.value = "";

        listarItensPedido();

        preencherDatas();

        gerarNumeroPedido();

    }

    /* ==========================================
       SALVAR PEDIDO
    ========================================== */

    formPedido.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            if (!clientePedido.value) {

                alert(
                    "Selecione um cliente."
                );

                clientePedido.focus();

                return;

            }

            if (itensPedido.length === 0) {

                alert(
                    "Adicione pelo menos um produto."
                );

                produtoPedido.focus();

                return;

            }

            const clienteSelecionado =
                clientes.find(function (cliente) {

                    return (
                        String(cliente.id) ===
                        clientePedido.value
                    );

                });

            const total =
                calcularTotal();

            const novoPedido = {

                id:
                    indiceEmEdicao === null
                        ? Date.now()
                        : pedidos[
                            indiceEmEdicao
                        ].id,

                numero:
                    numeroPedido.value,

                data:
                    dataPedido.value,

                dataEntrega:
                    dataEntrega.value,

                clienteId:
                    clienteSelecionado
                        ? clienteSelecionado.id
                        : clientePedido.value,

                clienteNome:
                    clienteSelecionado
                        ? (
                            clienteSelecionado.nome ||
                            clienteSelecionado
                                .nomeRazaoSocial
                        )
                        : "Cliente",

                status:
                    statusPedido.value,

                itens:
                    itensPedido.map(
                        function (item) {
                            return { ...item };
                        }
                    ),

                desconto:
                    numero(
                        descontoPedido.value
                    ),

                frete:
                    numero(
                        fretePedido.value
                    ),

                subtotal:
                    calcularSubtotal(),

                total:
                    total,

                observacoes:
                    observacoesPedido.value.trim(),

                atualizadoEm:
                    new Date().toISOString()

            };

            if (indiceEmEdicao === null) {

                pedidos.push(novoPedido);

                alert(
                    "Pedido salvo com sucesso!"
                );

            } else {

                pedidos[indiceEmEdicao] =
                    novoPedido;

                alert(
                    "Pedido atualizado com sucesso!"
                );

            }

            salvarPedidos();

            listarPedidos();

            limparFormulario();

        }
    );

    /* ==========================================
       FILTRAR PEDIDOS
    ========================================== */

    function obterPedidosFiltrados() {

        const termo =
            pesquisaPedido.value
                .trim()
                .toLowerCase();

        const statusSelecionado =
            filtroStatusPedido.value;

        return pedidos.filter(
            function (pedido) {

                const correspondePesquisa =
                    String(pedido.numero || "")
                        .toLowerCase()
                        .includes(termo)
                    ||
                    String(
                        pedido.clienteNome || ""
                    )
                        .toLowerCase()
                        .includes(termo);

                const correspondeStatus =
                    !statusSelecionado ||
                    pedido.status ===
                        statusSelecionado;

                return (
                    correspondePesquisa &&
                    correspondeStatus
                );

            }
        );

    }

    /* ==========================================
       LISTAR PEDIDOS
    ========================================== */

    function listarPedidos() {

        const lista =
            obterPedidosFiltrados();

        listaPedidosSalvos.innerHTML = "";

        if (lista.length === 0) {

            listaPedidosSalvos.innerHTML = `
                <tr>
                    <td colspan="7">
                        Nenhum pedido cadastrado.
                    </td>
                </tr>
            `;

            return;

        }

        lista
            .slice()
            .reverse()
            .forEach(function (pedido) {

                const indiceReal =
                    pedidos.findIndex(
                        function (item) {
                            return item.id === pedido.id;
                        }
                    );

                const linha =
                    document.createElement("tr");

                linha.innerHTML = `

                    <td>
                        ${escaparHTML(
                            pedido.numero
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            pedido.clienteNome
                        )}
                    </td>

                    <td>
                        ${formatarData(
                            pedido.data
                        )}
                    </td>

                    <td>
                        ${formatarData(
                            pedido.dataEntrega
                        )}
                    </td>

                    <td>

                        <select
                            onchange="alterarStatusPedido(
                                ${indiceReal},
                                this.value
                            )"
                        >

                            <option
                                value="Aguardando"
                                ${
                                    pedido.status ===
                                    "Aguardando"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Aguardando
                            </option>

                            <option
                                value="Em impressão"
                                ${
                                    pedido.status ===
                                    "Em impressão"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Em impressão
                            </option>

                            <option
                                value="Pós-processo"
                                ${
                                    pedido.status ===
                                    "Pós-processo"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pós-processo
                            </option>

                            <option
                                value="Pintura"
                                ${
                                    pedido.status ===
                                    "Pintura"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pintura
                            </option>

                            <option
                                value="Finalizado"
                                ${
                                    pedido.status ===
                                    "Finalizado"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Finalizado
                            </option>

                            <option
                                value="Entregue"
                                ${
                                    pedido.status ===
                                    "Entregue"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Entregue
                            </option>

                        </select>

                    </td>

                    <td>
                        ${formatarDinheiro(
                            pedido.total
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="botao-editar-estoque"
                            onclick="editarPedido(${indiceReal})"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-excluir-estoque"
                            onclick="excluirPedido(${indiceReal})"
                        >
                            Excluir
                        </button>

                    </td>

                `;

                listaPedidosSalvos.appendChild(
                    linha
                );

            });

    }

    /* ==========================================
       ALTERAR STATUS
    ========================================== */

    window.alterarStatusPedido =
        function (indice, novoStatus) {

            const pedido =
                pedidos[indice];

            if (!pedido) {
                return;
            }

            pedido.status =
                novoStatus;

            pedido.atualizadoEm =
                new Date().toISOString();

            salvarPedidos();

            listarPedidos();

        };

    /* ==========================================
       EDITAR PEDIDO
    ========================================== */

    window.editarPedido =
        function (indice) {

            const pedido =
                pedidos[indice];

            if (!pedido) {
                return;
            }

            indiceEmEdicao = indice;

            numeroPedido.value =
                pedido.numero;

            dataPedido.value =
                pedido.data;

            dataEntrega.value =
                pedido.dataEntrega;

            clientePedido.value =
                String(pedido.clienteId);

            statusPedido.value =
                pedido.status;

            descontoPedido.value =
                numero(
                    pedido.desconto
                ).toFixed(2);

            fretePedido.value =
                numero(
                    pedido.frete
                ).toFixed(2);

            observacoesPedido.value =
                pedido.observacoes || "";

            itensPedido =
                Array.isArray(pedido.itens)
                    ? pedido.itens.map(
                        function (item) {
                            return { ...item };
                        }
                    )
                    : [];

            listarItensPedido();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };

    /* ==========================================
       EXCLUIR PEDIDO
    ========================================== */

    window.excluirPedido =
        function (indice) {

            const pedido =
                pedidos[indice];

            if (!pedido) {
                return;
            }

            if (
                !confirm(
                    Deseja excluir o pedido ${pedido.numero}?
                )
            ) {
                return;
            }

            pedidos.splice(indice, 1);

            salvarPedidos();

            listarPedidos();

            if (indiceEmEdicao === indice) {
                limparFormulario();
            }

        };

    /* ==========================================
       PESQUISA E FILTRO
    ========================================== */

    pesquisaPedido.addEventListener(
        "input",
        listarPedidos
    );

    filtroStatusPedido.addEventListener(
        "change",
        listarPedidos
    );

    /* ==========================================
       INICIAR
    ========================================== */

    carregarClientes();

    carregarProdutos();

    preencherDatas();

    gerarNumeroPedido();

    listarItensPedido();

    listarPedidos();

});