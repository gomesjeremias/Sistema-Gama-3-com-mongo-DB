import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '841c298a08e88979da446bb4deb18184ed8f8ae008cc5fbe9c067f9cb13ebb6b';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir arquivos estáticos

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    console.log('Token recebido:', token);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erro na verificação do token:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Função para inicializar dados padrão
async function initializeData() {
    try {
        console.log('Iniciando verificação de dados...');

        // Verificar se já existem usuários
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            // Criar usuário admin padrão
            const hashedPassword = await bcrypt.hash('bibiaobia@06', 10);
            await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashedPassword
                }
            });
            console.log('Usuário admin criado');
        }

        // Verificar se já existem clientes
        const clientCount = await prisma.cliente.count();
        if (clientCount === 0) {
            await prisma.cliente.createMany({
                data: [
                    { nome: 'João da Silva', email: 'joao.silva@email.com', telefone: '11987654321', status: 'Pago' },
                    { nome: 'Maria Oliveira', email: 'maria.o@email.com', telefone: '21912345678', status: 'A pagar' },
                    { nome: 'Carlos Pereira', email: 'carlos.p@email.com', telefone: '31955554444', status: 'Pago' }
                ]
            });
            console.log('Clientes iniciais criados');
        }

        // Verificar se já existem produtos
        const productCount = await prisma.produto.count();
        if (productCount === 0) {
            await prisma.produto.createMany({
                data: [
                    { nome: 'Notebook Pro', codigo: 'NTK-001', descricao: 'Notebook de alta performance', preco: 7500.00, estoque: 15 },
                    { nome: 'Mouse Sem Fio', codigo: 'MSE-002', descricao: 'Mouse ergonômico', preco: 150.00, estoque: 100 },
                    { nome: 'Teclado Mecânico', codigo: 'TCD-003', descricao: 'Teclado para gamers', preco: 450.00, estoque: 50 }
                ]
            });
            console.log('Produtos iniciais criados');
        }

        // Verificar se já existem fornecedores
        const supplierCount = await prisma.fornecedor.count();
        if (supplierCount === 0) {
            await prisma.fornecedor.createMany({
                data: [
                    { nome: 'Tech Distribuidora', cnpj: '11.222.333/0001-44', contato: 'contato@techdist.com', produtos: 'Notebooks, Mouses' },
                    { nome: 'Periféricos Brasil', cnpj: '55.666.777/0001-88', contato: 'vendas@perifericosbr.com', produtos: 'Teclados, Monitores' }
                ]
            });
            console.log('Fornecedores iniciais criados');
        }

        // Verificar se já existem vendas
        const salesCount = await prisma.venda.count();
        if (salesCount === 0) {
            // Buscar IDs dos clientes e produtos APÓS criá-los
            const clientes = await prisma.cliente.findMany({
                orderBy: { nome: 'asc' }
            });
            const produtos = await prisma.produto.findMany({
                orderBy: { nome: 'asc' }
            });

            console.log(`Encontrados ${clientes.length} clientes e ${produtos.length} produtos`);

            if (clientes.length >= 3 && produtos.length >= 3) {
                // Criar vendas uma por uma para ter melhor controle
                const vendasData = [
                    { 
                        clienteId: clientes[0].id, 
                        produtoId: produtos[0].id, 
                        quantidade: 1, 
                        valorTotal: 7500.00, 
                        formaPagamento: 'Cartão de Crédito', 
                        status: 'Pago',
                        data: new Date('2024-05-20')
                    },
                    { 
                        clienteId: clientes[1].id, 
                        produtoId: produtos[1].id, 
                        quantidade: 2, 
                        valorTotal: 300.00, 
                        formaPagamento: 'Boleto', 
                        status: 'A pagar',
                        data: new Date('2024-05-21')
                    },
                    { 
                        clienteId: clientes[2].id, 
                        produtoId: produtos[2].id, 
                        quantidade: 1, 
                        valorTotal: 450.00, 
                        formaPagamento: 'PIX', 
                        status: 'Pago',
                        data: new Date('2024-05-22')
                    }
                ];

                for (const vendaData of vendasData) {
                    try {
                        await prisma.venda.create({
                            data: vendaData
                        });
                        console.log(`Venda criada: Cliente ${vendaData.clienteId} - Produto ${vendaData.produtoId}`);
                    } catch (error) {
                        console.error('Erro ao criar venda individual:', error);
                    }
                }
                
                console.log('Vendas iniciais criadas');
            } else {
                console.log('Não foi possível criar vendas: clientes ou produtos insuficientes');
            }
        }

        console.log('Inicialização de dados concluída com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        // Não interromper o servidor por causa de erro na inicialização
    }
}

// Rotas de Autenticação
app.post('/api/auth_new/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rotas para Clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(clientes);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

app.get('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id: req.params.id }
        });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
});

app.post('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const { nome, email, telefone, status } = req.body;
        const cliente = await prisma.cliente.create({
            data: { nome, email, telefone, status }
        });
        res.status(201).json(cliente);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});

app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        const { nome, email, telefone, status } = req.body;
        const cliente = await prisma.cliente.update({
            where: { id: req.params.id },
            data: { nome, email, telefone, status }
        });
        res.json(cliente);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});

app.delete('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.cliente.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
});

// Rotas para Produtos
app.get('/api/produtos', authenticateToken, async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

app.get('/api/produtos/:id', authenticateToken, async (req, res) => {
    try {
        const produto = await prisma.produto.findUnique({
            where: { id: req.params.id }
        });
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

app.post('/api/produtos', authenticateToken, async (req, res) => {
    try {
        const { nome, codigo, descricao, preco, estoque } = req.body;
        const produto = await prisma.produto.create({
            data: { nome, codigo, descricao, preco, estoque }
        });
        res.status(201).json(produto);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

app.put('/api/produtos/:id', authenticateToken, async (req, res) => {
    try {
        const { nome, codigo, descricao, preco, estoque } = req.body;
        const produto = await prisma.produto.update({
            where: { id: req.params.id },
            data: { nome, codigo, descricao, preco, estoque }
        });
        res.json(produto);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/produtos/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.produto.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// Rotas para Fornecedores
app.get('/api/fornecedores', authenticateToken, async (req, res) => {
    try {
        const fornecedores = await prisma.fornecedor.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(fornecedores);
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        res.status(500).json({ error: 'Erro ao buscar fornecedores' });
    }
});

app.get('/api/fornecedores/:id', authenticateToken, async (req, res) => {
    try {
        const fornecedor = await prisma.fornecedor.findUnique({
            where: { id: req.params.id }
        });
        if (!fornecedor) {
            return res.status(404).json({ error: 'Fornecedor não encontrado' });
        }
        res.json(fornecedor);
    } catch (error) {
        console.error('Erro ao buscar fornecedor:', error);
        res.status(500).json({ error: 'Erro ao buscar fornecedor' });
    }
});

app.post('/api/fornecedores', authenticateToken, async (req, res) => {
    try {
        const { nome, cnpj, contato, produtos } = req.body;
        const fornecedor = await prisma.fornecedor.create({
            data: { nome, cnpj, contato, produtos }
        });
        res.status(201).json(fornecedor);
    } catch (error) {
        console.error('Erro ao criar fornecedor:', error);
        res.status(500).json({ error: 'Erro ao criar fornecedor' });
    }
});

app.put('/api/fornecedores/:id', authenticateToken, async (req, res) => {
    try {
        const { nome, cnpj, contato, produtos } = req.body;
        const fornecedor = await prisma.fornecedor.update({
            where: { id: req.params.id },
            data: { nome, cnpj, contato, produtos }
        });
        res.json(fornecedor);
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
    }
});

app.delete('/api/fornecedores/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.fornecedor.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar fornecedor:', error);
        res.status(500).json({ error: 'Erro ao deletar fornecedor' });
    }
});

// Rotas para Vendas
app.get('/api/vendas', authenticateToken, async (req, res) => {
    try {
        const vendas = await prisma.venda.findMany({
            include: {
                cliente: true,
                produto: true
            },
            orderBy: { data: 'desc' }
        });
        res.json(vendas);
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
});

app.get('/api/vendas/:id', authenticateToken, async (req, res) => {
    try {
        const venda = await prisma.venda.findUnique({
            where: { id: req.params.id },
            include: {
                cliente: true,
                produto: true
            }
        });
        if (!venda) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }
        res.json(venda);
    } catch (error) {
        console.error('Erro ao buscar venda:', error);
        res.status(500).json({ error: 'Erro ao buscar venda' });
    }
});

app.post('/api/vendas', authenticateToken, async (req, res) => {
    try {
        const { clienteId, produtoId, quantidade, valorTotal, formaPagamento, status } = req.body;
        const venda = await prisma.venda.create({
            data: {
                clienteId,
                produtoId,
                quantidade,
                valorTotal,
                formaPagamento,
                status
            },
            include: {
                cliente: true,
                produto: true
            }
        });
        res.status(201).json(venda);
    } catch (error) {
        console.error('Erro ao criar venda:', error);
        res.status(500).json({ error: 'Erro ao criar venda' });
    }
});

app.put('/api/vendas/:id', authenticateToken, async (req, res) => {
    try {
        const { clienteId, produtoId, quantidade, valorTotal, formaPagamento, status } = req.body;
        const venda = await prisma.venda.update({
            where: { id: req.params.id },
            data: {
                clienteId,
                produtoId,
                quantidade,
                valorTotal,
                formaPagamento,
                status
            },
            include: {
                cliente: true,
                produto: true
            }
        });
        res.json(venda);
    } catch (error) {
        console.error('Erro ao atualizar venda:', error);
        res.status(500).json({ error: 'Erro ao atualizar venda' });
    }
});

app.delete('/api/vendas/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.venda.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar venda:', error);
        res.status(500).json({ error: 'Erro ao deletar venda' });
    }
});

// Rota para limpar todas as vendas
app.delete('/api/vendas', authenticateToken, async (req, res) => {
    try {
        await prisma.venda.deleteMany({});
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao limpar vendas:', error);
        res.status(500).json({ error: 'Erro ao limpar vendas' });
    }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Inicializar servidor
async function startServer() {
    try {
        console.log('Conectando ao banco de dados...');
        await prisma.$connect();
        console.log('Conexão com banco estabelecida');
        
        await initializeData();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}/api/health para testar`);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Encerrando servidor...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Encerrando servidor...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();

