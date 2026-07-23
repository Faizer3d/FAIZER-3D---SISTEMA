"use strict";

/* ==========================================
   FAIZER3D - Cadastro de Clientes
========================================== */

const CHAVE_CLIENTES = "faizer3d_clientes";

let clientes = JSON.parse(localStorage.getItem(CHAVE_CLIENTES)) || [];

const formCliente = document.getElementById("formCliente");
const pesquisa = document.getElementById("pesquisa");
const tabelaClientes = document.getElementById("tabelaClientes");

const nome = document.getElementById("nome");
const cpfCnpj = document.getElementById("cpfCnpj");
const telefone = document.getElementById("telefone");
const email = document.getElementById("email");

const cep = document.getElementById("cep");
const endereco = document.getElementById("endereco");
const numero = document.getElementById("numero");
const bairro = document.getElementById("bairro");
const cidade = document.getElementById("cidade");
const estado = document.getElementById("estado");
const observacao = document.getElementById("observacao");

console.log("Sistema de Clientes FAIZER3D iniciado.");
function salvarNoLocalStorage() {
    localStorage.setItem(
        CHAVE_CLIENTES,
        JSON.stringify(clientes)
    );
}

formCliente.addEventListener("submit", function (e) {

    e.preventDefault();

    const cliente = {

        nome: nome.value,
        cpfCnpj: cpfCnpj.value,
        telefone: telefone.value,
        email: email.value,

        cep: cep.value,
        endereco: endereco.value,
        numero: numero.value,
        bairro: bairro.value,
        cidade: cidade.value,
        estado: estado.value,
        observacao: observacao.value

    };

    clientes.push(cliente);

    salvarNoLocalStorage();

    alert("Cliente salvo com sucesso!");

    formCliente.reset();

});
function listarClientes(lista = clientes) {
    const corpoTabela = tabelaClientes.querySelector("tbody");

    corpoTabela.innerHTML = "";

    lista.forEach((cliente, indice) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cpfCnpj}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cidade}</td>
            <td>
                <button onclick="excluirCliente(${indice})">
                    Excluir
                </button>
            </td>
        `;

        corpoTabela.appendChild(linha);
    });
}

function excluirCliente(indice) {
    const confirmar = confirm(
        "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) {
        return;
    }

    clientes.splice(indice, 1);

    salvarNoLocalStorage();
    listarClientes();
}
function listarClientes() {
    const corpoTabela = tabelaClientes.querySelector("tbody");

    corpoTabela.innerHTML = "";

    clientes.forEach((cliente, indice) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cpfCnpj}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cidade}</td>
            <td>
                <button onclick="excluirCliente(${indice})">
                    Excluir
                </button>
            </td>
        `;

        corpoTabela.appendChild(linha);
    });
}

function excluirCliente(indice) {
    const confirmar = confirm(
        "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) {
        return;
    }

    clientes.splice(indice, 1);

    salvarNoLocalStorage();
    listarClientes();
    
}

function  listarClientes(lista = clientes)  {
    const corpoTabela = tabelaClientes.querySelector("tbody");

    corpoTabela.innerHTML = "";

    lista.forEach((cliente, indice) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cpfCnpj}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cidade}</td>
            <td>
                <button onclick="excluirCliente(${indice})">
                    Excluir
                </button>
            </td>
        `;

        corpoTabela.appendChild(linha);
    });
}

function excluirCliente(indice) {
    const confirmar = confirm(
        "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) {
        return;
    }

    clientes.splice(indice, 1);

    salvarNoLocalStorage();
    listarClientes();
}

listarClientes();

pesquisa.addEventListener("input", function () {

    const termo = pesquisa.value.toLowerCase();

    const filtrados = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpfCnpj.toLowerCase().includes(termo) ||
        cliente.telefone.toLowerCase().includes(termo)
    );

    listarClientes(filtrados);

});

