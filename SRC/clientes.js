"use strict";

/* ==========================================
   FAIZER3D - CADASTRO DE CLIENTES
========================================== */

const CHAVE_CLIENTES = "faizer3d_clientes";

/* ==========================================
   ELEMENTOS DO HTML
========================================== */

const formCliente =
    document.getElementById("formCliente");

const pesquisa =
    document.getElementById("pesquisa");

const tabelaClientes =
    document.getElementById("tabelaClientes");

const nome =
    document.getElementById("nome");

const cpfCnpj =
    document.getElementById("cpfCnpj");

const telefone =
    document.getElementById("telefone");

const email =
    document.getElementById("email");

const cep =
    document.getElementById("cep");

const endereco =
    document.getElementById("endereco");

const numero =
    document.getElementById("numero");

const bairro =
    document.getElementById("bairro");

const cidade =
    document.getElementById("cidade");

const estado =
    document.getElementById("estado");

const observacao =
    document.getElementById("observacao");

const botaoSalvar =
    document.querySelector(".btnSalvar");

/* ==========================================
   DADOS
========================================== */

let clientes = carregarClientes();

let idEmEdicao = null;

/* ==========================================
   FUNÇÕES AUXILIARES
========================================== */

function gerarId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return (
        ${Date.now()}- +
        ${Math.random().toString(16).slice(2)}
    );

}

function carregarClientes() {

    try {

        const dadosSalvos =
            localStorage.getItem(
                CHAVE_CLIENTES
            );

        const lista =
            dadosSalvos
                ? JSON.parse(dadosSalvos)
                : [];

        const listaAtualizada =
            lista.map(function (cliente) {

                return {
                    ...cliente,
                    id:
                        cliente.id ||
                        gerarId()
                };

            });

        localStorage.setItem(
            CHAVE_CLIENTES,
            JSON.stringify(
                listaAtualizada
            )
        );

        return listaAtualizada;

    } catch (erro) {

        console.error(
            "Erro ao carregar clientes:",
            erro
        );

        return [];

    }

}

function salvarNoLocalStorage() {

    localStorage.setItem(
        CHAVE_CLIENTES,
        JSON.stringify(clientes)
    );

}

function somenteNumeros(valor) {

    return String(
        valor || ""
    ).replace(/\D/g, "");

}

function escaparHtml(valor) {

    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

/* ==========================================
   MÁSCARAS
========================================== */

function mascaraCpfCnpj(valor) {

    const numeros =
        somenteNumeros(valor)
            .slice(0, 14);

    if (numeros.length <= 11) {

        return numeros
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d{1,2})$/,
                "$1-$2"
            );

    }

    return numeros
        .replace(
            /^(\d{2})(\d)/,
            "$1.$2"
        )
        .replace(
            /^(\d{2})\.(\d{3})(\d)/,
            "$1.$2.$3"
        )
        .replace(
            /\.(\d{3})(\d)/,
            ".$1/$2"
        )
        .replace(
            /(\d{4})(\d{1,2})$/,
            "$1-$2"
        );

}

function mascaraTelefone(valor) {

    const numeros =
        somenteNumeros(valor)
            .slice(0, 11);

    if (numeros.length <= 10) {

        return numeros
            .replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            )
            .replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );

    }

    return numeros
        .replace(
            /^(\d{2})(\d)/,
            "($1) $2"
        )
        .replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );

}

function mascaraCep(valor) {

    const numeros =
        somenteNumeros(valor)
            .slice(0, 8);

    return numeros.replace(
        /^(\d{5})(\d)/,
        "$1-$2"
    );

}

/* ==========================================
   BUSCA AUTOMÁTICA DO CEP
========================================== */

async function buscarEnderecoPeloCep() {

    const cepNumerico =
        somenteNumeros(
            cep.value
        );

    if (
        cepNumerico.length !== 8
    ) {
        return;
    }

    try {

        endereco.value =
            "Buscando...";

        bairro.value = "";
        cidade.value = "";
        estado.value = "";

        const resposta =
            await fetch(
                https://viacep.com.br/ws/${cepNumerico}/json/
            );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao consultar o CEP."
            );

        }

        const dados =
            await resposta.json();

        if (dados.erro) {

            throw new Error(
                "CEP não encontrado."
            );

        }

        endereco.value =
            dados.logradouro || "";

        bairro.value =
            dados.bairro || "";

        cidade.value =
            dados.localidade || "";

        estado.value =
            dados.uf || "";

        if (endereco.value) {

            numero.focus();

        }

    } catch (erro) {

        endereco.value = "";

        alert(
            erro.message ||
            "Não foi possível consultar o CEP."
        );

        console.error(erro);

    }

}

/* ==========================================
   LIMPAR FORMULÁRIO
========================================== */

function limparFormulario() {

    formCliente.reset();

    idEmEdicao = null;

    botaoSalvar.textContent =
        "Salvar Cliente";

    nome.focus();

}

/* ==========================================
   SALVAR OU ATUALIZAR CLIENTE
========================================== */

formCliente.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();

        const dadosCliente = {

            id:
                idEmEdicao ||
                gerarId(),

            nome:
                nome.value.trim(),

            cpfCnpj:
                cpfCnpj.value.trim(),

            telefone:
                telefone.value.trim(),

            email:
                email.value.trim(),

            cep:
                cep.value.trim(),

            endereco:
                endereco.value.trim(),

            numero:
                numero.value.trim(),

            bairro:
                bairro.value.trim(),

            cidade:
                cidade.value.trim(),

            estado:
                estado.value
                    .trim()
                    .toUpperCase(),

            observacao:
                observacao.value.trim()

        };

        if (!dadosCliente.nome) {

            alert(
                "Informe o nome ou a razão social."
            );

            nome.focus();

            return;

        }

        if (!dadosCliente.cpfCnpj) {

            alert(
                "Informe o CPF ou CNPJ."
            );

            cpfCnpj.focus();

            return;

        }

        const documentoDuplicado =
            clientes.some(
                function (cliente) {

                    return (
                        somenteNumeros(
                            cliente.cpfCnpj
                        ) ===
                        somenteNumeros(
                            dadosCliente.cpfCnpj
                        )
                        &&
                        cliente.id !==
                        idEmEdicao
                    );

                }
            );

        if (documentoDuplicado) {

            alert(
                "Já existe um cliente com esse CPF ou CNPJ."
            );

            cpfCnpj.focus();

            return;

        }

        if (idEmEdicao) {

            const indice =
                clientes.findIndex(
                    function (cliente) {

                        return (
                            cliente.id ===
                            idEmEdicao
                        );

                    }
                );

            if (indice !== -1) {

                clientes[indice] =
                    dadosCliente;

            }

            alert(
                "Cliente atualizado com sucesso!"
            );

        } else {

            clientes.push(
                dadosCliente
            );

            alert(
                "Cliente salvo com sucesso!"
            );

        }

        salvarNoLocalStorage();

        listarClientes();

        limparFormulario();

    }
);

/* ==========================================
   LISTAR CLIENTES
========================================== */

function listarClientes(
    lista = clientes
) {

    const corpoTabela =
        tabelaClientes.querySelector(
            "tbody"
        );

    corpoTabela.innerHTML = "";

    if (lista.length === 0) {

        corpoTabela.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="text-align:center;"
                >
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;

        return;

    }

    lista.forEach(
        function (cliente) {

            const linha =
                document.createElement(
                    "tr"
                );

            linha.innerHTML = `

                <td>
                    ${escaparHtml(
                        cliente.nome
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        cliente.cpfCnpj
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        cliente.telefone || "-"
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        cliente.cidade || "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="editarCliente('${cliente.id}')"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        onclick="excluirCliente('${cliente.id}')"
                    >
                        Excluir
                    </button>

                </td>

            `;

            corpoTabela.appendChild(
                linha
            );

        }
    );

}

/* ==========================================
   EDITAR CLIENTE
========================================== */

window.editarCliente =
    function (id) {

        const cliente =
            clientes.find(
                function (item) {

                    return (
                        item.id === id
                    );

                }
            );

        if (!cliente) {

            alert(
                "Cliente não encontrado."
            );

            return;

        }

        nome.value =
            cliente.nome || "";

        cpfCnpj.value =
            cliente.cpfCnpj || "";

        telefone.value =
            cliente.telefone || "";

        email.value =
            cliente.email || "";

        cep.value =
            cliente.cep || "";

        endereco.value =
            cliente.endereco || "";

        numero.value =
            cliente.numero || "";

        bairro.value =
            cliente.bairro || "";

        cidade.value =
            cliente.cidade || "";

        estado.value =
            cliente.estado || "";

        observacao.value =
            cliente.observacao || "";

        idEmEdicao =
            cliente.id;

        botaoSalvar.textContent =
            "Atualizar Cliente";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        nome.focus();

    };

/* ==========================================
   EXCLUIR CLIENTE
========================================== */

window.excluirCliente =
    function (id) {

        const cliente =
            clientes.find(
                function (item) {

                    return (
                        item.id === id
                    );

                }
            );

        if (!cliente) {

            alert(
                "Cliente não encontrado."
            );

            return;

        }

        const confirmar =
            window.confirm(
                Deseja realmente excluir o cliente "${cliente.nome}"?
            );

        if (!confirmar) {
            return;
        }

        clientes =
            clientes.filter(
                function (item) {

                    return (
                        item.id !== id
                    );

                }
            );

        salvarNoLocalStorage();

        listarClientes();

        if (idEmEdicao === id) {

            limparFormulario();

        }

    };

/* ==========================================
   PESQUISA EM TEMPO REAL
========================================== */

pesquisa.addEventListener(
    "input",
    function () {

        const termo =
            pesquisa.value
                .trim()
                .toLowerCase();

        const termoNumerico =
            somenteNumeros(termo);

        const clientesFiltrados =
            clientes.filter(
                function (cliente) {

                    const nomeCliente =
                        String(
                            cliente.nome || ""
                        ).toLowerCase();

                    const documento =
                        String(
                            cliente.cpfCnpj || ""
                        ).toLowerCase();

                    const telefoneCliente =
                        String(
                            cliente.telefone || ""
                        ).toLowerCase();

                    const cidadeCliente =
                        String(
                            cliente.cidade || ""
                        ).toLowerCase();

                    const numerosCliente =
                        somenteNumeros(
                            ${cliente.cpfCnpj || ""} ${cliente.telefone || ""}
                        );

                    return (
                        nomeCliente.includes(
                            termo
                        )
                        ||
                        documento.includes(
                            termo
                        )
                        ||
                        telefoneCliente.includes(
                            termo
                        )
                        ||
                        cidadeCliente.includes(
                            termo
                        )
                        ||
                        (
                            termoNumerico &&
                            numerosCliente.includes(
                                termoNumerico
                            )
                        )
                    );

                }
            );

        listarClientes(
            clientesFiltrados
        );

    }
);

/* ==========================================
   EVENTOS DOS CAMPOS
========================================== */

cpfCnpj.addEventListener(
    "input",
    function () {

        cpfCnpj.value =
            mascaraCpfCnpj(
                cpfCnpj.value
            );

    }
);

telefone.addEventListener(
    "input",
    function () {

        telefone.value =
            mascaraTelefone(
                telefone.value
            );

    }
);

cep.addEventListener(
    "input",
    function () {

        cep.value =
            mascaraCep(
                cep.value
            );

    }
);

cep.addEventListener(
    "blur",
    buscarEnderecoPeloCep
);

estado.addEventListener(
    "input",
    function () {

        estado.value =
            estado.value
                .replace(
                    /[^a-zA-Z]/g,
                    ""
                )
                .slice(0, 2)
                .toUpperCase();

    }
);

/* ==========================================
   ATUALIZAR ENTRE ABAS
========================================== */

window.addEventListener(
    "storage",
    function (evento) {

        if (
            evento.key ===
            CHAVE_CLIENTES
        ) {

            clientes =
                carregarClientes();

            listarClientes();

        }

    }
);

/* ==========================================
   INICIALIZAÇÃO
========================================== */

listarClientes();

console.log(
    "Cadastro de Clientes FAIZER3D iniciado."
);