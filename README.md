# Dev Planner

Plataforma para organizacao de projetos academicos utilizando metodologia Kanban.

## Pre-requisitos

Antes de comecar, voce precisa ter instalado:

- Node.js (versao 14 ou superior)
- npm ou yarn
- MongoDB (local ou MongoDB Atlas)

### Instalacao do Node.js

1. Acesse https://nodejs.org/
2. Baixe a versao LTS
3. Instale seguindo as instrucoes do instalador
4. Verifique a instalacao:

```
node --version
npm --version
```

### MongoDB

Voce tem duas opcoes:

#### Opcao 1: MongoDB Local

1. Acesse https://www.mongodb.com/try/download/community
2. Baixe e instale o MongoDB Community Server
3. Inicie o servidor MongoDB:

```
mongod
```

#### Opcao 2: MongoDB Atlas (Recomendado - Gratuito)

1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita
3. Crie um cluster gratuito (M0 - Shared)
4. Configure Database Access: crie um usuario e senha
5. Configure Network Access: adicione 0.0.0.0/0 para desenvolvimento
6. Obtenha a string de conexao: Database > Connect > Connect your application
7. Copie a string de conexao no formato: mongodb+srv://usuario:senha@cluster.mongodb.net/

## Instalacao

### 1. Clone ou baixe o projeto

```bash
cd AEP2
```

### 2. Instale as dependencias do projeto principal

```bash
npm install
```

### 3. Instale as dependencias do backend

```bash
cd server
npm install
cd ..
```

### 4. Instale as dependencias do frontend

```bash
cd client
npm install --legacy-peer-deps
cd ..
```

Ou instale tudo de uma vez:

```bash
npm run install-all
```

Se der erro de politica de execucao no Windows PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Configuracao

### 1. Crie o arquivo de variaveis de ambiente

No diretorio `server/`, crie um arquivo chamado `.env`:

```bash
cd server
```

Crie o arquivo `.env` com o seguinte conteudo:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dev-planner
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
```

Se estiver usando MongoDB Atlas, substitua `MONGODB_URI` pela sua string de conexao:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/dev-planner?retryWrites=true&w=majority
```

Importante: na string do MongoDB Atlas, substitua:
- `usuario` pelo usuario que voce criou
- `senha` pela senha que voce criou
- `cluster.mongodb.net` pela URL do seu cluster
- Adicione `/dev-planner` antes do `?` para usar o banco `dev-planner`

## Execucao

### Modo Desenvolvimento (Recomendado)

Para iniciar o backend e frontend simultaneamente:

```bash
npm run dev
```

Isso vai iniciar:
- Backend na porta 5000
- Frontend na porta 3000

Aguarde alguns segundos para os servidores iniciarem. Na primeira vez, o React pode demorar ate 60 segundos para compilar.

### Executar Separadamente

Se preferir executar em terminais separados:

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

### Acessar a Aplicacao

Abra seu navegador e acesse:

```
http://localhost:3000
```

A API estara disponivel em:

```
http://localhost:5000
```

## Estrutura do Projeto

```
AEP2/
├── server/                 # Backend Node.js
│   ├── models/            # Modelos do MongoDB
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/            # Rotas da API
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── middleware/        # Middlewares
│   │   └── auth.js
│   ├── index.js           # Arquivo principal
│   └── package.json
├── client/                # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── package.json           # Scripts principais
```

## Dependencias

### Backend

- express: Framework web para Node.js
- mongoose: ODM para MongoDB
- cors: Middleware para habilitar CORS
- dotenv: Carregar variaveis de ambiente
- bcryptjs: Hash de senhas
- jsonwebtoken: Autenticacao JWT
- nodemon: Reiniciar servidor automaticamente (dev)

### Frontend

- react: Biblioteca JavaScript para interfaces
- react-dom: Renderizacao React para web
- react-router-dom: Roteamento
- react-beautiful-dnd: Drag and drop para Kanban
- axios: Cliente HTTP
- react-scripts: Scripts e configuracao do Create React App

## Funcionalidades

- Cadastro e autenticacao de usuarios
- Gerenciamento de projetos
- Quadro Kanban com tres colunas: A Fazer, Fazendo, Feito
- Criacao e edicao de tarefas
- Movimentacao de tarefas entre colunas (drag and drop)
- Atribuicao de responsaveis as tarefas

## Solucao de Problemas

### Erro: Porta ja em uso

Se a porta 5000 ou 3000 estiver em uso:

Windows PowerShell:
```powershell
netstat -ano | findstr :5000
taskkill /PID [numero_do_pid] /F
```

Ou altere a porta no arquivo `.env`:
```
PORT=5001
```

### Erro: MongoDB nao conecta

1. Verifique se o MongoDB esta rodando (se local)
2. Verifique a string de conexao no arquivo `.env`
3. Se usar MongoDB Atlas, verifique:
   - Network Access configurado (0.0.0.0/0)
   - Usuario e senha corretos
   - String de conexao completa

### Erro: npm install falha

Tente limpar o cache e reinstalar:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Erro: react-scripts nao encontrado

No diretorio `client/`:

```bash
cd client
npm install --legacy-peer-deps
```

### Erro de politica de execucao (PowerShell)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Scripts Disponiveis

- `npm run dev`: Inicia backend e frontend simultaneamente
- `npm run server`: Inicia apenas o backend
- `npm run client`: Inicia apenas o frontend
- `npm run install-all`: Instala todas as dependencias

## Desenvolvimento

### Adicionar novas funcionalidades

1. Backend: Adicione rotas em `server/routes/`
2. Frontend: Adicione componentes em `client/src/components/`
3. Modelos: Adicione schemas em `server/models/`

### Banco de Dados

O projeto usa MongoDB com os seguintes modelos:

- User: Usuarios da aplicacao
- Project: Projetos
- Task: Tarefas do Kanban

As tarefas sao armazenadas no formato JSON com os atributos:
- _id
- title
- description
- status (A Fazer, Fazendo, Feito)
- responsaveis
- project

## Licenca

MIT
