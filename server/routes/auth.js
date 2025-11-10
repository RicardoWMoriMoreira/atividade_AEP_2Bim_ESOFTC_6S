const express = require('express');
const jwt = require('jsonwebtoken');   // Para criar tokens de autenticação
const User = require('../models/User');
const router = express.Router();

// ROTA DE CADASTRO - Quando alguém cria uma conta nova
router.post('/register', async (req, res) => {
  try {
    // Pega os dados que o usuário enviou (nome, email e senha)
    const { name, email, password } = req.body;

    // Valida se todos os campos foram preenchidos
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    // Valida se a senha tem pelo menos 6 caracteres (segurança básica)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verifica se já existe alguém cadastrado com esse email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Cria um novo usuário no banco de dados
    // A senha será criptografada automaticamente pelo modelo User (veja User.js)
    const user = new User({ name, email, password });
    await user.save();

    // Cria um token de autenticação (é tipo uma "carteirinha digital")
    // Esse token vai ser usado nas próximas requisições para identificar o usuário
    const token = jwt.sign(
      { userId: user._id },  // Coloca o ID do usuário dentro do token
      process.env.JWT_SECRET || 'dev-secret',  // Chave secreta para assinar o token
      { expiresIn: '7d' }    // Token válido por 7 dias
    );

    // Retorna sucesso com o token e os dados do usuário (sem a senha)
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    // Se deu algum erro no processo, retorna erro 500
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// ROTA DE LOGIN - Quando alguém entra na conta
router.post('/login', async (req, res) => {
  try {
    // Pega o email e senha que o usuário digitou
    const { email, password } = req.body;

    // Verifica se preencheu os dois campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça email e senha' });
    }

    // Busca o usuário no banco pelo email
    const user = await User.findOne({ email });
    if (!user) {
      // Se não encontrou, retorna "credenciais inválidas" (não diz se é email ou senha errada por segurança)
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verifica se a senha está correta
    // Usa o método comparePassword que criamos no modelo User
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Se a senha está errada, retorna erro
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Se chegou aqui, login está correto! Cria um token
    const token = jwt.sign(
      { userId: user._id },  // Coloca o ID do usuário no token
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }    // Token válido por 7 dias
    );

    // Retorna sucesso com o token e dados do usuário
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// ROTA PARA PEGAR OS DADOS DO USUÁRIO LOGADO
// Precisa estar autenticado (ter o token válido)
router.get('/me', require('../middleware/auth'), async (req, res) => {
  // O middleware 'auth' já colocou os dados do usuário em req.user
  // Só retorna esses dados
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// ROTA PARA BUSCAR OUTROS USUÁRIOS
// Usado quando você quer adicionar alguém ao seu projeto
router.get('/search', require('../middleware/auth'), async (req, res) => {
  try {
    // Pega o texto que a pessoa digitou na busca (vem na URL como ?q=texto)
    const { q } = req.query;
    
    // Se não digitou nada ou digitou menos de 2 caracteres, retorna lista vazia
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Busca usuários que tenham o texto no nome OU no email
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },  // Exclui você mesmo da busca (não faz sentido adicionar a si mesmo)
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },   // Busca no nome (i = case insensitive, ignora maiúsculas)
            { email: { $regex: q, $options: 'i' } }   // Busca no email
          ]
        }
      ]
    })
    .select('name email')  // Retorna só nome e email (não retorna senha)
    .limit(10);            // Limita a 10 resultados para não ficar muito pesado

    // Retorna a lista de usuários encontrados
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Exporta todas as rotas para usar no index.js
module.exports = router;

