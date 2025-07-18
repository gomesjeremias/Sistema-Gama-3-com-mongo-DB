# Sistema de Vendas com MongoDB e Prisma

Este projeto é uma migração do sistema de vendas original que utilizava LocalStorage para um sistema que utiliza MongoDB com Prisma ORM.

## Funcionalidades

- **Autenticação**: Sistema de login e logout
- **Gestão de Clientes**: Cadastro, edição, visualização e exclusão de clientes
- **Gestão de Produtos**: Cadastro, edição, visualização e exclusão de produtos
- **Gestão de Fornecedores**: Cadastro, edição, visualização e exclusão de fornecedores
- **Gestão de Vendas**: Registro, edição, visualização e exclusão de vendas
- **Dashboard**: Visão geral com métricas e gráficos
- **Relatórios**: Geração de relatórios em PDF por cliente

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS (DaisyUI/TailwindCSS), JavaScript (ES6+)
- **Backend**: Node.js com Prisma ORM
- **Banco de Dados**: MongoDB
- **Bibliotecas**: Chart.js, jsPDF, Font Awesome

## Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd sales-app-mongodb
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   
   Edite o arquivo `.env` e configure a URL de conexão do MongoDB:
   
   **Para MongoDB local:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/sales_app"
   ```
   
   **Para MongoDB Atlas (nuvem):**
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/sales_app?retryWrites=true&w=majority"
   ```

4. **Gere o cliente Prisma**
   ```bash

   ```

5. **Inicie o MongoDB (se estiver usando localmente)**
   ```bash
   mongod
   ```

## Execução

1. **Abra o arquivo `index.html` em um navegador web**
   
   Você pode usar um servidor local como:
   ```bash
   # Usando Python
   python -m http.server 8000
   
   # Usando Node.js (se tiver o http-server instalado)
   npx http-server
   
   # Usando Live Server (extensão do VS Code)
   ```

2. **Acesse a aplicação**
   - Usuário padrão: `admin`
   - Senha padrão: `bibiaobia@06`

## Estrutura do Projeto

```
sales-app-mongodb/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── .env                       # Variáveis de ambiente
├── package.json              # Dependências do projeto
├── db.js                     # Camada de acesso ao banco de dados
├── auth.js                   # Sistema de autenticação
├── app.js                    # Lógica principal da aplicação
├── index.html                # Interface do usuário
└── README.md                 # Este arquivo
```

## Modelos de Dados

### User
- `id`: String (ObjectId)
- `username`: String (único)
- `password`: String

### Cliente
- `id`: String (ObjectId)
- `nome`: String
- `email`: String (opcional)
- `telefone`: String (opcional)
- `status`: String ("Pago" ou "A pagar")

### Produto
- `id`: String (ObjectId)
- `nome`: String
- `codigo`: String (único)
- `descricao`: String (opcional)
- `preco`: Float
- `estoque`: Integer

### Fornecedor
- `id`: String (ObjectId)
- `nome`: String
- `cnpj`: String (único)
- `contato`: String (opcional)
- `produtos`: String (opcional)

### Venda
- `id`: String (ObjectId)
- `clienteId`: String (ObjectId, referência ao Cliente)
- `produtoId`: String (ObjectId, referência ao Produto)
- `quantidade`: Integer
- `valorTotal`: Float
- `formaPagamento`: String
- `status`: String ("Pago" ou "A pagar")
- `data`: DateTime

## Principais Mudanças da Migração

1. **Banco de Dados**: Migração do LocalStorage para MongoDB
2. **ORM**: Implementação do Prisma para acesso ao banco
3. **Async/Await**: Todas as operações de banco agora são assíncronas
4. **IDs**: Mudança de IDs numéricos para ObjectIds do MongoDB
5. **Relacionamentos**: Implementação de relacionamentos entre entidades
6. **Tratamento de Erros**: Adição de try/catch em todas as operações

## Comandos Úteis

```bash
# Gerar cliente Prisma após mudanças no schema
npx prisma generate

# Visualizar dados no Prisma Studio
npx prisma studio

# Reset do banco de dados (cuidado!)
npx prisma db push --force-reset
```

## Solução de Problemas

### Erro de Conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme se a URL de conexão no `.env` está correta
- Para MongoDB Atlas, verifique as credenciais e whitelist de IPs

### Erro "Module not found"
- Execute `npm install` para instalar as dependências
- Execute `npx prisma generate` para gerar o cliente Prisma

### Dados não aparecem
- Verifique se o banco foi inicializado (dados iniciais são criados automaticamente)
- Abra o console do navegador para ver possíveis erros JavaScript

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

