// api.js - Cliente para comunicação com a API

const API_BASE_URL = 'http://localhost:3000/api';

// Função para obter o token de autenticação
function getAuthToken() {
    const session = localStorage.getItem('sales_app_session');
    if (session) {
        const sessionData = JSON.parse(session);
        return sessionData.token;
    }
    return null;
}

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('sales_app_session');
            window.location.reload();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Se a resposta for 204 (No Content), não tenta fazer parse do JSON
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Funções para Clientes
export async function getAllClientes() {
    return await apiRequest('/clientes');
}

export async function getClienteById(id) {
    return await apiRequest(`/clientes/${id}`);
}

export async function createCliente(clienteData) {
    return await apiRequest('/clientes', {
        method: 'POST',
        body: JSON.stringify(clienteData)
    });
}

export async function updateCliente(id, clienteData) {
    return await apiRequest(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clienteData)
    });
}

export async function deleteCliente(id) {
    return await apiRequest(`/clientes/${id}`, {
        method: 'DELETE'
    });
}

// Funções para Produtos
export async function getAllProdutos() {
    return await apiRequest('/produtos');
}

export async function getProdutoById(id) {
    return await apiRequest(`/produtos/${id}`);
}

export async function createProduto(produtoData) {
    return await apiRequest('/produtos', {
        method: 'POST',
        body: JSON.stringify(produtoData)
    });
}

export async function updateProduto(id, produtoData) {
    return await apiRequest(`/produtos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(produtoData)
    });
}

export async function deleteProduto(id) {
    return await apiRequest(`/produtos/${id}`, {
        method: 'DELETE'
    });
}

// Funções para Fornecedores
export async function getAllFornecedores() {
    return await apiRequest('/fornecedores');
}

export async function getFornecedorById(id) {
    return await apiRequest(`/fornecedores/${id}`);
}

export async function createFornecedor(fornecedorData) {
    return await apiRequest('/fornecedores', {
        method: 'POST',
        body: JSON.stringify(fornecedorData)
    });
}

export async function updateFornecedor(id, fornecedorData) {
    return await apiRequest(`/fornecedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fornecedorData)
    });
}

export async function deleteFornecedor(id) {
    return await apiRequest(`/fornecedores/${id}`, {
        method: 'DELETE'
    });
}

// Funções para Vendas
export async function getAllVendas() {
    return await apiRequest('/vendas');
}

export async function getVendaById(id) {
    return await apiRequest(`/vendas/${id}`);
}

export async function createVenda(vendaData) {
    return await apiRequest('/vendas', {
        method: 'POST',
        body: JSON.stringify(vendaData)
    });
}

export async function updateVenda(id, vendaData) {
    return await apiRequest(`/vendas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vendaData)
    });
}

export async function deleteVenda(id) {
    return await apiRequest(`/vendas/${id}`, {
        method: 'DELETE'
    });
}

export async function clearAllVendas() {
    return await apiRequest('/vendas', {
        method: 'DELETE'
    });
}

// Função de autenticação
export async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth_new/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        
        // Salvar token e informações da sessão
        localStorage.setItem('sales_app_session', JSON.stringify({
            loggedIn: true,
            username: data.username,
            token: data.token,
            timestamp: new Date().getTime()
        }));

        return data;
    } catch (error) {
        console.error('Erro no login:', error);
        return false;
    }
}

