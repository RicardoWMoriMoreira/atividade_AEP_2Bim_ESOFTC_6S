const mongoose = require('mongoose');

// Define como um projeto é no banco de dados
// Um projeto pode ter vários membros trabalhando nele
const projectSchema = new mongoose.Schema({
  title: {
    type: String,     // Título do projeto (ex: "Desenvolvimento de App")
    required: true,   // É obrigatório dar um nome ao projeto
    trim: true        // Remove espaços extras
  },
  description: {
    type: String,     // Descrição do projeto (ex: "App para gerenciar tarefas")
    trim: true        // Remove espaços extras
  },
  owner: {
    // Quem criou o projeto - é o "dono" do projeto
    type: mongoose.Schema.Types.ObjectId,  // Armazena o ID de um usuário
    ref: 'User',      // Faz referência ao modelo User (para poder buscar os dados do dono)
    required: true    // Todo projeto precisa ter um dono
  },
  members: [{
    // Lista de membros que participam do projeto (incluindo o dono)
    type: mongoose.Schema.Types.ObjectId,  // Cada membro é um ID de usuário
    ref: 'User'       // Faz referência ao modelo User
  }]
}, {
  timestamps: true    // Guarda quando o projeto foi criado e atualizado
});

// Exporta o modelo para usar em outros arquivos
module.exports = mongoose.model('Project', projectSchema);

