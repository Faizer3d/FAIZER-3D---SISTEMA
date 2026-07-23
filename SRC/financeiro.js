"use strict";

/* ==========================================
   FAIZER3D - CONTROLE FINANCEIRO
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const CHAVE_FINANCEIRO = "faizer3d_financeiro";

    const formFinanceiro =
        document.getElementById("formFinanceiro");

    const tipoMovimentacao =
        document.getElementById("tipoMovimentacao");

    const dataMovimentacao =
        document.getElementById("dataMovimentacao");

    const valorMovimentacao =
        document.getElementById("valorMovimentacao");

    const categoriaMovimentacao =
        document.getElementById("categoriaMovimentacao");

    const descricaoMovimentacao =
        document.getElementById("descricaoMovimentacao");

    const observacoesFinanceiro =
        document.getElementById("observacoesFinanceiro");

    const totalEntradas =
        document.getElementById("totalEntradas");

    const totalDespesas =
        document.getElementById("totalDespesas");

    const saldoFinanceiro =
        document.getElementById("saldoFinanceiro");

    const totalMovimentacoes =
        document.getElementById("totalMovimentacoes");

    const filtroTipoFinanceiro =
        document.getElementById("filtroTipoFinanceiro");

    const pesquisaFinanceiro =
        document.getElementById("pesquisaFinanceiro");

    const listaFinanceiro =
        document.getElementById("listaFinanceiro");

    let movimentacoes =
        JSON.parse(
            localStorage.getItem(CHAVE_FINANCEIRO)
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

        const partes = data.split("-");

        return ${partes[2]}/${partes[1]}/${partes[0]};

    }

    function salvarMovimentacoes() {

        localStorage.setItem(
            CHAVE_FINANCEIRO,
            JSON.stringify(movimentacoes)
        );

    }

    function definirDataAtual() {

        const hoje = new Date();

        const ano = hoje.getFullYear();

        const mes = String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
            hoje.getDate()
        ).padStart(2, "0");

        dataMovimentacao.value =
            ${ano}-${mes}-${dia};

    }

    function atualizarCards() {

        const entradas =
            movimentacoes
                .filter(function (item) {
                    return item.tipo === "entrada";
                })
                .reduce(function (total, item) {
                    return total + numero(item.valor);
                }, 0);

        const despesas =
            movimentacoes
                .filter(function (item) {
                    return item.tipo === "despesa";
                })
                .reduce(function (total, item) {
                    return total + numero(item.valor);
                }, 0);

        const saldo = entradas - despesas;

        totalEntradas.textContent =
            formatarDinheiro(entradas);

        totalDespesas.textContent =
            formatarDinheiro(despesas);

        saldoFinanceiro.textContent =
            formatarDinheiro(saldo);

        totalMovimentacoes.textContent =
            movimentacoes.length;

    }

    function obterMovimentacoesFiltradas() {

        const tipo =
            filtroTipoFinanceiro.value;

        const termo =
            pesquisaFinanceiro.value
                .trim()
                .toLowerCase();

        return movimentacoes.filter(
            function (item) {

                const correspondeTipo =
                    !tipo ||
                    item.tipo === tipo;

                const correspondePesquisa =
                    String(item.descricao)
                        .toLowerCase()
                        .includes(termo)
                    ||
                    String(item.categoria)
                        .toLowerCase()
                        .includes(termo);

                return (
                    correspondeTipo &&
                    correspondePesquisa
                );

            }
        );

    }

    function listarMovimentacoes() {

        const lista =
            obterMovimentacoesFiltradas();

        listaFinanceiro.innerHTML = "";

        if (lista.length === 0) {

            listaFinanceiro.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhuma movimentação cadastrada.
                    </td>
                </tr>
            `;

            return;

        }

        lista
            .slice()
            .reverse()
            .forEach(function (item) {

                const indiceReal =
                    movimentacoes.findIndex(
                        function (movimentacao) {
                            return movimentacao.id === item.id;
                        }
                    );

                const linha =
                    document.createElement("tr");

                const classeTipo =
                    item.tipo === "entrada"
                        ? "financeiro-entrada"
                        : "financeiro-despesa";

                const textoTipo =
                    item.tipo === "entrada"
                        ? "Entrada"
                        : "Despesa";

                linha.innerHTML = `
                    <td>
                        ${formatarData(item.data)}
                    </td>

                    <td class="${classeTipo}">
                        ${textoTipo}
                    </td>

                    <td>
                        ${item.categoria}
                    </td>

                    <td>
                        ${item.descricao}
                    </td>

                    <td class="${classeTipo}">
                        ${formatarDinheiro(item.valor)}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="botao-excluir-financeiro"
                            onclick="excluirMovimentacao(${indiceReal})"
                        >
                            Excluir
                        </button>
                    </td>
                `;

                listaFinanceiro.appendChild(linha);

            });

    }

    formFinanceiro.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            const valor =
                numero(valorMovimentacao.value);

            if (valor <= 0) {

                alert(
                    "Informe um valor maior que zero."
                );

                valorMovimentacao.focus();

                return;

            }

            const novaMovimentacao = {

                id: Date.now(),

                tipo:
                    tipoMovimentacao.value,

                data:
                    dataMovimentacao.value,

                valor: valor,

                categoria:
                    categoriaMovimentacao.value,

                descricao:
                    descricaoMovimentacao.value.trim(),

                observacoes:
                    observacoesFinanceiro.value.trim()

            };

            movimentacoes.push(
                novaMovimentacao
            );

            salvarMovimentacoes();

            atualizarCards();

            listarMovimentacoes();

            formFinanceiro.reset();

            definirDataAtual();

            tipoMovimentacao.value =
                "entrada";

            alert(
                "Movimentação salva com sucesso!"
            );

        }
    );

    filtroTipoFinanceiro.addEventListener(
        "change",
        listarMovimentacoes
    );

    pesquisaFinanceiro.addEventListener(
        "input",
        listarMovimentacoes
    );

    window.excluirMovimentacao =
        function (indice) {

            if (
                !confirm(
                    "Deseja excluir esta movimentação?"
                )
            ) {
                return;
            }

            movimentacoes.splice(
                indice,
                1
            );

            salvarMovimentacoes();

            atualizarCards();

            listarMovimentacoes();

        };

    definirDataAtual();

    atualizarCards();

    listarMovimentacoes();

});