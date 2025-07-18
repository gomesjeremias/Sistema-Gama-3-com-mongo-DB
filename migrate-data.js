// migrate-data.js - Script para migrar dados do LocalStorage para MongoDB

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para migrar dados existentes do LocalStorage para MongoDB
 * Execute este script se você já tem dados no LocalStorage que deseja migrar
 */
async function migrateFromLocalStorage() {
    try {
        console.log('Iniciando migração de dados do LocalStorage...');
        
        // Simula a leitura do LocalStorage (você precisará adaptar isso)
        // Em um ambiente real, você executaria isso no navegador onde os dados estão
        const localStorageData = {
            users: [
                { id: 1, username: 'admin', password: 'bibiaobia@06' }
            ],
            clientes: [
                { id: 1, nome: 'João da Silva', email: 'joao.silva@email.com', telefone: '11987654321', status: 'Pago' },
                { id: 2, nome: 'Maria Oliveira', email: 'maria.o@email.com', telefone: '21912345678', status: 'A pagar' },
                { id: 3, nome: 'Carlos Pereira', email: 'carlos.p@email.com', telefone: '31955554444', status: 'Pago' },
            ],
            produtos: [
                { id: 1, nome: 'Notebook Pro', codigo: 'NTK-001', descricao: 'Notebook de alta performance', preco: 7500.00, estoque: 15 },
                { id: 2, nome: 'Mouse Sem Fio', codigo: 'MSE-002', descricao: 'Mouse ergonômico', preco: 150.00, estoque: 100 },
                { id: 3, nome: 'Teclado Mecânico', codigo: 'TCD-003', descricao: 'Teclado para gamers', preco: 450.00, estoque: 50 },
            ],
            fornecedores: [
                { id: 1, nome: 'Tech Distribuidora', cnpj: '11.222.333/0001-44', contato: 'contato@techdist.com', produtos: 'Notebooks, Mouses' },
                { id: 2, nome: 'Periféricos Brasil', cnpj: '55.666.777/0001-88', contato: 'vendas@perifericosbr.com', produtos: 'Teclados, Monitores' },
            ],
            vendas: [
                { id: 1, clienteId: 1, produtoId: 1, quantidade: 1, valorTotal: 7500.00, formaPagamento: 'Cartão de Crédito', status: 'Pago', data: '2024-05-20' },
                { id: 2, clienteId: 2, produtoId: 2, quantidade: 2, valorTotal: 300.00, formaPagamento: 'Boleto', status: 'A pagar', data: '2024-05-21' },
                { id: 3, clienteId: 3, produtoId: 3, quantidade: 1, valorTotal: 450.00, formaPagamento: 'PIX', status: 'Pago', data: '2024-05-22' },
                { id: 4, clienteId: 1, produtoId: 2, quantidade: 1, valorTotal: 150.00, formaPagamento: 'PIX', status: 'Pago', data: '2024-05-23' },
            ]
        };

        // Limpar dados existentes (cuidado!)
        console.log('Limpando dados existentes...');
        await prisma.venda.deleteMany();
        await prisma.cliente.deleteMany();
        await prisma.produto.deleteMany();
        await prisma.fornecedor.deleteMany();
        await prisma.user.deleteMany();

        // Migrar usuários
        console.log('Migrando usuários...');
        const userMap = new Map();
        for (const userData of localStorageData.users) {
            const { id, ...data } = userData;
            const user = await prisma.user.create({ data });
            userMap.set(id, user.id);
            console.log(`Usuário migrado: ${user.username}`);
        }

        // Migrar clientes
        console.log('Migrando clientes...');
        const clienteMap = new Map();
        for (const clienteData of localStorageData.clientes) {
            const { id, ...data } = clienteData;
            const cliente = await prisma.cliente.create({ data });
            clienteMap.set(id, cliente.id);
            console.log(`Cliente migrado: ${cliente.nome}`);
        }

        // Migrar produtos
        console.log('Migrando produtos...');
        const produtoMap = new Map();
        for (const produtoData of localStorageData.produtos) {
            const { id, ...data } = produtoData;
            const produto = await prisma.produto.create({ data });
            produtoMap.set(id, produto.id);
            console.log(`Produto migrado: ${produto.nome}`);
        }

        // Migrar fornecedores
        console.log('Migrando fornecedores...');
        for (const fornecedorData of localStorageData.fornecedores) {
            const { id, ...data } = fornecedorData;
            const fornecedor = await prisma.fornecedor.create({ data });
            console.log(`Fornecedor migrado: ${fornecedor.nome}`);
        }

        // Migrar vendas
        console.log('Migrando vendas...');
        for (const vendaData of localStorageData.vendas) {
            const { id, clienteId, produtoId, data, ...restData } = vendaData;
            const venda = await prisma.venda.create({
                data: {
                    ...restData,
                    clienteId: clienteMap.get(clienteId),
                    produtoId: produtoMap.get(produtoId),
                    data: new Date(data)
                }
            });
            console.log(`Venda migrada: ${venda.id}`);
        }

        console.log('Migração concluída com sucesso!');
        
        // Verificar dados migrados
        const counts = {
            users: await prisma.user.count(),
            clientes: await prisma.cliente.count(),
            produtos: await prisma.produto.count(),
            fornecedores: await prisma.fornecedor.count(),
            vendas: await prisma.venda.count()
        };
        
        console.log('Dados migrados:');
        console.log(`- Usuários: ${counts.users}`);
        console.log(`- Clientes: ${counts.clientes}`);
        console.log(`- Produtos: ${counts.produtos}`);
        console.log(`- Fornecedores: ${counts.fornecedores}`);
        console.log(`- Vendas: ${counts.vendas}`);

    } catch (error) {
        console.error('Erro durante a migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Função para extrair dados do LocalStorage
 * Execute esta função no console do navegador onde os dados estão armazenados
 */
function extractLocalStorageData() {
    const data = localStorage.getItem('sales_app_db');
    if (data) {
        console.log('Dados encontrados no LocalStorage:');
        console.log(JSON.stringify(JSON.parse(data), null, 2));
        return JSON.parse(data);
    } else {
        console.log('Nenhum dado encontrado no LocalStorage');
        return null;
    }
}

// Executar migração se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateFromLocalStorage();
}

export { migrateFromLocalStorage, extractLocalStorageData };

