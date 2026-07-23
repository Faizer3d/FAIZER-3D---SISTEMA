"use strict";

/* ==========================================
   FAIZER3D - CONTROLE DE ESTOQUE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const CHAVE_ESTOQUE = "faizer3d_estoque";

    /* ========= ELEMENTOS ========= */

    const formEstoque =
        document.getElementById("formEstoque");

    const codigoMaterial =
        document.getElementById("codigoMaterial");

    const nomeMaterial =
        document.getElementById("nomeMaterial");

    const categoriaMaterial =
        document.getElementById("categoriaMaterial");

    const corMaterial =
        document.getElementById("corMaterial");

    const marcaMaterial =
        document.getElementById("marcaMaterial");

    const fornecedorMaterial =
        document.getElementById("fornecedorMaterial");

    const quantidadeMaterial =
        document.getElementById("quantidadeMaterial");

    const unidadeMaterial =
        document.getElementById("unidadeMaterial");

    const estoqueMinimoMaterial =
        document.getElementById("estoqueMinimoMaterial");

    const custoUnitarioMaterial =
        document.getElementById("custoUnitarioMaterial");

    const dataCompraMaterial =
        document.getElementById("dataCompraMaterial");

    const observacoesMaterial =
        document.getElementById("observacoesMaterial");

    const btnSalvarMaterial =
        document.getElementById("btnSalvarMaterial");

    const totalMateriais =
        document.getElementById("totalMateriais");

    const totalEstoqueBaixo =
        document.getElementById("totalEstoqueBaixo");

    const totalEsgotados =
        document.getElementById("totalEsgotados");

    const valorTotalEstoqueMateriais =
        document.getElementById(
            "valorTotalEstoqueMateriais"
        );

    const filtroSituacaoEstoque =
        document.getElementById(
            "filtroSituacaoEstoque"
        );

    const pesquisaEstoque =
        document.getElementById("pesquisaEstoque");

    const listaEstoque =
        document.getElementById("listaEstoque");

    /* ========= DADOS ========= */

    let materiais =
        JSON.parse(
            localStorage.getItem(CHAVE_ESTOQUE)
        ) || [];

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

    function formatarQuantidade(
        quantidade,
        unidade
    ) {

        const valor =
            numero(quantidade).toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            );

        return ${valor} ${unidade || ""};

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

    function salvarMateriais() {

        localStorage.setItem(
            CHAVE_ESTOQUE,
            JSON.stringify(materiais)
        );

    }

    /* ==========================================
       SITUAÇÃO DO ESTOQUE
    ========================================== */

    function obterSituacao(material) {

        const quantidade =
            numero(material.quantidade);

        const minimo =
            numero(material.estoqueMinimo);

        if (quantidade <= 0) {

            return {
                codigo: "esgotado",
                texto: "Esgotado",
                classe: "estoque-esgotado"
            };

        }

        if (quantidade <= minimo) {

            return {
                codigo: "baixo",
                texto: "Estoque baixo",
                classe: "estoque-baixo"
            };

        }

        return {
            codigo: "normal",
            texto: "Normal",
            classe: "estoque-normal"
        };

    }

    /* ==========================================
       CARDS
    ========================================== */

    function atualizarCards() {

        const estoqueBaixo =
            materiais.filter(function (material) {

                return (
                    obterSituacao(material).codigo ===
                    "baixo"
                );

            }).length;

        const esgotados =
            materiais.filter(function (material) {

                return (
                    obterSituacao(material).codigo ===
                    "esgotado"
                );

            }).length;

        const valorTotal =
            materiais.reduce(
                function (total, material) {

                    return (
                        total +
                        (
                            numero(material.quantidade) *
                            numero(material.custoUnitario)
                        )
                    );

                },
                0
            );

        totalMateriais.textContent =
            materiais.length;

        totalEstoqueBaixo.textContent =
            estoqueBaixo;

        totalEsgotados.textContent =
            esgotados;

        valorTotalEstoqueMateriais.textContent =
            formatarDinheiro(valorTotal);

    }

    /* ==========================================
       LIMPAR FORMULÁRIO
    ========================================== */

    function limparFormulario() {

        formEstoque.reset();

        quantidadeMaterial.value = "0";

        estoqueMinimoMaterial.value = "0";

        custoUnitarioMaterial.value = "0.00";

        unidadeMaterial.value = "g";

        indiceEmEdicao = null;

        btnSalvarMaterial.textContent =
            "Salvar material";

        codigoMaterial.focus();

    }

    /* ==========================================
       FILTROS
    ========================================== */

    function obterMateriaisFiltrados() {

        const termo =
            pesquisaEstoque.value
                .trim()
                .toLowerCase();

        const situacaoSelecionada =
            filtroSituacaoEstoque.value;

        return materiais.filter(
            function (material) {

                const situacao =
                    obterSituacao(material);

                const textoPesquisa = [
                    material.codigo,
                    material.nome,
                    material.categoria,
                    material.cor,
                    material.marca,
                    material.fornecedor
                ]
                    .join(" ")
                    .toLowerCase();

                const correspondePesquisa =
                    textoPesquisa.includes(termo);

                const correspondeSituacao =
                    !situacaoSelecionada ||
                    situacao.codigo ===
                        situacaoSelecionada;

                return (
                    correspondePesquisa &&
                    correspondeSituacao
                );

            }
        );

    }

    /* ==========================================
       LISTAR MATERIAIS
    ========================================== */

    function listarMateriais() {

        const lista =
            obterMateriaisFiltrados();

        listaEstoque.innerHTML = "";

        if (lista.length === 0) {

            listaEstoque.innerHTML = `
                <tr>
                    <td colspan="9">
                        Nenhum material encontrado.
                    </td>
                </tr>
            `;

            return;

        }

        lista.forEach(function (material) {

            const indiceReal =
                materiais.findIndex(
                    function (item) {
                        return item.id === material.id;
                    }
                );

            const situacao =
                obterSituacao(material);

            const valorEstoque =
                numero(material.quantidade) *
                numero(material.custoUnitario);

            const linha =
                document.createElement("tr");

            linha.innerHTML = `

                <td>
                    ${escaparHTML(material.codigo)}
                </td>

                <td>
                    <strong>
                        ${escaparHTML(material.nome)}
                    </strong>

                    ${
                        material.marca
                            ? `
                                <br>
                                <small>
                                    ${escaparHTML(
                                        material.marca
                                    )}
                                </small>
                            `
                            : ""
                    }
                </td>

                <td>
                    ${escaparHTML(
                        material.categoria
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        material.cor || "-"
                    )}
                </td>

                <td>
                    ${formatarQuantidade(
                        material.quantidade,
                        material.unidade
                    )}
                </td>

                <td>
                    ${formatarQuantidade(
                        material.estoqueMinimo,
                        material.unidade
                    )}
                </td>

                <td class="${situacao.classe}">
                    ${situacao.texto}
                </td>

                <td>
                    ${formatarDinheiro(
                        valorEstoque
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="botao-editar-estoque"
                        onclick="editarMaterial(${indiceReal})"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="botao-excluir-estoque"
                        onclick="excluirMaterial(${indiceReal})"
                    >
                        Excluir
                    </button>

                </td>

            `;

            listaEstoque.appendChild(linha);

        });

    }

    /* ==========================================
       SALVAR OU ATUALIZAR MATERIAL
    ========================================== */

    formEstoque.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            const codigo =
                codigoMaterial.value.trim();

            const nome =
                nomeMaterial.value.trim();

            if (!codigo) {

                alert(
                    "Informe o código do material."
                );

                codigoMaterial.focus();

                return;

            }

            if (!nome) {

                alert(
                    "Informe o nome do material."
                );

                nomeMaterial.focus();

                return;

            }

            const codigoDuplicado =
                materiais.some(
                    function (material, indice) {

                        return (
                            String(material.codigo)
                                .toLowerCase() ===
                            codigo.toLowerCase()
                            &&
                            indice !== indiceEmEdicao
                        );

                    }
                );

            if (codigoDuplicado) {

                alert(
                    "Já existe um material com esse código."
                );

                codigoMaterial.focus();

                return;

            }

            const novoMaterial = {

                id:
                    indiceEmEdicao === null
                        ? Date.now()
                        : materiais[
                            indiceEmEdicao
                        ].id,

                codigo: codigo,

                nome: nome,

                categoria:
                    categoriaMaterial.value,

                cor:
                    corMaterial.value.trim(),

                marca:
                    marcaMaterial.value.trim(),

                fornecedor:
                    fornecedorMaterial.value.trim(),

                quantidade:
                    numero(
                        quantidadeMaterial.value
                    ),

                unidade:
                    unidadeMaterial.value,

                estoqueMinimo:
                    numero(
                        estoqueMinimoMaterial.value
                    ),

                custoUnitario:
                    numero(
                        custoUnitarioMaterial.value
                    ),

                dataCompra:
                    dataCompraMaterial.value,

                observacoes:
                    observacoesMaterial.value.trim(),

                atualizadoEm:
                    new Date().toISOString()

            };

            if (indiceEmEdicao === null) {

                materiais.push(novoMaterial);

                alert(
                    "Material salvo com sucesso!"
                );

            } else {

                materiais[indiceEmEdicao] =
                    novoMaterial;

                alert(
                    "Material atualizado com sucesso!"
                );

            }

            salvarMateriais();

            atualizarCards();

            listarMateriais();

            limparFormulario();

        }
    );

    /* ==========================================
       EDITAR MATERIAL
    ========================================== */

    window.editarMaterial =
        function (indice) {

            const material =
                materiais[indice];

            if (!material) {
                return;
            }

            codigoMaterial.value =
                material.codigo || "";

            nomeMaterial.value =
                material.nome || "";

            categoriaMaterial.value =
                material.categoria || "";

            corMaterial.value =
                material.cor || "";

            marcaMaterial.value =
                material.marca || "";

            fornecedorMaterial.value =
                material.fornecedor || "";

            quantidadeMaterial.value =
                numero(material.quantidade);

            unidadeMaterial.value =
                material.unidade || "g";

            estoqueMinimoMaterial.value =
                numero(material.estoqueMinimo);

            custoUnitarioMaterial.value =
                numero(
                    material.custoUnitario
                ).toFixed(2);

            dataCompraMaterial.value =
                material.dataCompra || "";

            observacoesMaterial.value =
                material.observacoes || "";

            indiceEmEdicao = indice;

            btnSalvarMaterial.textContent =
                "Atualizar material";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };

    /* ==========================================
       EXCLUIR MATERIAL
    ========================================== */

    window.excluirMaterial =
        function (indice) {

            const material =
                materiais[indice];

            if (!material) {
                return;
            }

            const confirmar =
                confirm(
                    Deseja excluir o material "${material.nome}"?
                );

            if (!confirmar) {
                return;
            }

            materiais.splice(indice, 1);

            salvarMateriais();

            atualizarCards();

            listarMateriais();

            if (indiceEmEdicao === indice) {
                limparFormulario();
            }

        };

    /* ==========================================
       FILTROS
    ========================================== */

    pesquisaEstoque.addEventListener(
        "input",
        listarMateriais
    );

    filtroSituacaoEstoque.addEventListener(
        "change",
        listarMateriais
    );

    /* ==========================================
       INICIAR
    ========================================== */

    atualizarCards();

    listarMateriais();

});