const jwt = require('jsonwebtoken');  // Biblioteca para trabalhar com tokens de autenticação
const User = require('../models/User');  // Modelo de usuário do banco de dados

// Middleware de autenticação - é tipo um "segurança" que verifica se o usuário está logado
const auth = async (req, res, next) => {
  try {
    // Pega o token que vem no cabeçalho da requisição (é tipo uma "carteirinha digital")
    // Remove a palavra "Bearer " que vem junto com o token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Se não tem token, significa que a pessoa não está logada
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verifica se o token é válido e não foi adulterado
    // É como verificar se a carteirinha não é falsa
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    
    // Busca o usuário no banco usando o ID que estava dentro do token
    // O .select('-password') significa "busca tudo, menos a senha" (por segurança)
    const user = await User.findById(decoded.userId).select('-password');
    
    // Se não encontrou o usuário, é porque ele foi deletado ou não existe
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Adiciona as informações do usuário na requisição
    // Agora as próximas funções podem saber quem está fazendo a requisição
    req.user = user;
    
    // Chama a próxima função (deixa a requisição continuar)
    next();
  } catch (error) {
    // Se deu qualquer erro (token expirado, inválido, etc), bloqueia o acesso
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = auth;

