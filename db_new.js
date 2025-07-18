// db_new.js - Nova camada de abstração que usa a API em vez do LocalStorage

import * as api from './api.js';

// Cache local para melhorar performance
let cache = {
    clientes: null,
    produtos: null,
    fornecedores: null,
    vendas: null
};

/**
 * Inicializa o banco de dados (não faz nada, pois a API já inicializa)
 */
export function init() {
    // A inicialização é feita pelo servidor
    console.log('Sistema inicializado com API');
}

/**
 * Pega todos os itens de uma tabela
 * @param {string} tableName - Nome da tabela (ex: 'clientes')
 * @returns {Array}
 */
export async function getAll(tableName) {
    try {
        let data;
        
        switch (tableName) {
            case 'clientes':
                data = await api.getAllClientes();
                break;
            case 'produtos':
                data = await api.getAllProdutos();
                break;
            case 'fornecedores':
                data = await api.getAllFornecedores();
                break;
            case 'vendas':
                data = await api.getAllVendas();
                // Transformar os dados das vendas para manter compatibilidade
                data = data.map(venda => ({
                    id: venda.id,
                    clienteId: venda.clienteId,
                    produtoId: venda.produtoId,
                    quantidade: venda.quantidade,
                    valorTotal: venda.valorTotal,
                    formaPagamento: venda.formaPagamento,
                    status: venda.status,
                    data: venda.data
                }));
                break;
            case 'users':
                // Para compatibilidade, retorna array vazio (autenticação é feita via API)
                return [];
            default:
                return [];
        }
        
        // Atualizar cache
        cache[tableName] = data;
        return data || [];
    } catch (error) {
        console.error(`Erro ao buscar ${tableName}:`, error);
        // Retornar cache se disponível
        return cache[tableName] || [];
    }
}

/**
 * Pega um item por ID de uma tabela
 * @param {string} tableName 
 * @param {string} id 
 * @returns {object | undefined}
 */
export async function getById(tableName, id) {
    try {
        let data;
        
        switch (tableName) {
            case 'clientes':
                data = await api.getClienteById(id);
                break;
            case 'produtos':
                data = await api.getProdutoById(id);
                break;
            case 'fornecedores':
                data = await api.getFornecedorById(id);
                break;
            case 'vendas':
                data = await api.getVendaById(id);
                if (data) {
                    // Transformar os dados para manter compatibilidade
                    data = {
                        id: data.id,
                        clienteId: data.clienteId,
                        produtoId: data.produtoId,
                        quantidade: data.quantidade,
                        valorTotal: data.valorTotal,
                        formaPagamento: data.formaPagamento,
                        status: data.status,
                        data: data.data
                    };
                }
                break;
            default:
                return undefined;
        }
        
        return data;
    } catch (error) {
        console.error(`Erro ao buscar ${tableName} por ID:`, error);
        return undefined;
    }
}

/**
 * Salva (cria ou atualiza) um item em uma tabela
 * @param {string} tableName
 * @param {object} itemData - Dados do item. Se tiver 'id', atualiza. Senão, cria.
 */
export async function save(tableName, itemData) {
    try {
        let result;
        const isUpdate = itemData.id && itemData.id !== '';
        
        switch (tableName) {
            case 'clientes':
                if (isUpdate) {
                    result = await api.updateCliente(itemData.id, itemData);
                } else {
                    result = await api.createCliente(itemData);
                }
                break;
            case 'produtos':
                if (isUpdate) {
                    result = await api.updateProduto(itemData.id, itemData);
                } else {
                    result = await api.createProduto(itemData);
                }
                break;
            case 'fornecedores':
                if (isUpdate) {
                    result = await api.updateFornecedor(itemData.id, itemData);
                } else {
                    result = await api.createFornecedor(itemData);
                }
                break;
            case 'vendas':
                if (isUpdate) {
                    result = await api.updateVenda(itemData.id, itemData);
                } else {
                    result = await api.createVenda(itemData);
                }
                break;
            default:
                throw new Error(`Tabela ${tableName} não suportada`);
        }
        
        // Limpar cache para forçar atualização
        cache[tableName] = null;
        
        return result;
    } catch (error) {
        console.error(`Erro ao salvar ${tableName}:`, error);
        throw error;
    }
}

/**
 * Remove um item de uma tabela pelo ID
 * @param {string} tableName 
 * @param {string} id 
 */
export async function remove(tableName, id) {
    try {
        switch (tableName) {
            case 'clientes':
                await api.deleteCliente(id);
                break;
            case 'produtos':
                await api.deleteProduto(id);
                break;
            case 'fornecedores':
                await api.deleteFornecedor(id);
                break;
            case 'vendas':
                await api.deleteVenda(id);
                break;
            default:
                throw new Error(`Tabela ${tableName} não suportada`);
        }
        
        // Limpar cache para forçar atualização
        cache[tableName] = null;
    } catch (error) {
        console.error(`Erro ao remover ${tableName}:`, error);
        throw error;
    }
}

/**
 * Limpa todos os registros de uma tabela. Ação perigosa.
 * @param {string} tableName
 */
export async function _dangerouslyClearTable(tableName) {
    try {
        if (tableName === 'vendas') {
            await api.clearAllVendas();
            // Limpar cache
            cache[tableName] = null;
        } else {
            throw new Error(`Limpeza da tabela ${tableName} não implementada`);
        }
    } catch (error) {
        console.error(`Erro ao limpar tabela ${tableName}:`, error);
        throw error;
    }
}

