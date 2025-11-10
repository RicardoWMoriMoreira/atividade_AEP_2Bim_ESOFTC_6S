const mongoose = require('mongoose');

// Define como uma tarefa é no banco de dados
// As tarefas seguem o estilo Kanban (A Fazer, Fazendo, Feito)
const taskSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,  // ID único da tarefa
    auto: true    // Gerado automaticamente pelo MongoDB
  },
  title: {
    type: String,     // Título da tarefa (ex: "Criar tela de login")
    required: true,   // É obrigatório dar um nome à tarefa
    trim: true        // Remove espaços extras
  },
  description: {
    type: String,     // Descrição detalhada da tarefa
    trim: true        // Remove espaços extras
  },
  status: {
    type: String,     // Em que coluna do Kanban a tarefa está
    enum: ['A Fazer', 'Fazendo', 'Feito'],  // Só pode ser um desses três valores
    default: 'A Fazer',  // Quando cria uma tarefa nova, começa em "A Fazer"
    required: true    // Toda tarefa precisa ter um status
  },
  responsaveis: [{
    // Lista de pessoas responsáveis pela tarefa
    type: mongoose.Schema.Types.ObjectId,  // Cada responsável é um ID de usuário
    ref: 'User'       // Faz referência ao modelo User
  }],
  project: {
    // A qual projeto essa tarefa pertence
    type: mongoose.Schema.Types.ObjectId,  // ID do projeto
    ref: 'Project',   // Faz referência ao modelo Project
    required: true    // Toda tarefa precisa estar em um projeto
  }
}, {
  timestamps: true    // Guarda quando a tarefa foi criada e atualizada
});

// Exporta o modelo para usar em outros arquivos
module.exports = mongoose.model('Task', taskSchema);

