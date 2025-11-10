// Importando as bibliotecas que vamos usar
const express = require('express');  // Framework para criar o servidor web
const mongoose = require('mongoose'); // Biblioteca para conversar com o MongoDB (banco de dados)
const cors = require('cors');         // Permite que o frontend converse com o backend
require('dotenv').config();           // Carrega as configurações do arquivo .env

// Cria a nossa aplicação Express (o servidor)
const app = express();

// Configurações do servidor para entender as requisições
app.use(cors());                                  // Libera o frontend para fazer requisições
app.use(express.json());                          // Entende dados em formato JSON
app.use(express.urlencoded({ extended: true })); // Entende formulários enviados pelo navegador

// Define as rotas da API - é como um "mapa" que diz o que fazer quando alguém acessa cada endereço
app.use('/api/auth', require('./routes/auth'));           // Tudo relacionado a login e cadastro vai pra cá
app.use('/api/projects', require('./routes/projects'));   // Tudo sobre projetos vai pra cá
app.use('/api/tasks', require('./routes/tasks'));         // Tudo sobre tarefas vai pra cá

// Pega o endereço do banco de dados (se não tiver no .env, usa o padrão local)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev-planner';

// Conecta no banco de dados MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,    // Usa o jeito novo de conectar
  useUnifiedTopology: true, // Melhora a estabilidade da conexão
})
.then(() => console.log('MongoDB conectado com sucesso'))  // Se deu certo, mostra essa mensagem
.catch((error) => {
  // Se deu erro, mostra o problema e uma dica
  console.error('Erro ao conectar MongoDB:', error.message);
  console.log('Configure MongoDB Atlas ou MongoDB local para usar a aplicacao');
});

// Rota para verificar se o servidor está funcionando - útil para testar
app.get('/api/health', (req, res) => {
  res.json({ message: 'Dev Planner API esta funcionando' });
});

// Pega a porta do arquivo .env, ou usa 5000 se não tiver definido
const PORT = process.env.PORT || 5000;

// Inicia o servidor e fica escutando requisições na porta escolhida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

