const mongoose = require('mongoose');  // Para criar a estrutura dos dados no MongoDB
const bcrypt = require('bcryptjs');    // Para criptografar senhas (deixar seguras)

// Define como um usuário é no banco de dados - tipo uma "ficha cadastral"
const userSchema = new mongoose.Schema({
  name: {
    type: String,     // O nome é texto
    required: true,   // É obrigatório ter nome
    trim: true        // Remove espaços extras no início e fim
  },
  email: {
    type: String,     // Email é texto
    required: true,   // É obrigatório
    unique: true,     // Não pode ter dois usuários com o mesmo email
    lowercase: true,  // Salva sempre em minúsculas (ex: JOAO@EMAIL.COM vira joao@email.com)
    trim: true        // Remove espaços extras
  },
  password: {
    type: String,     // Senha é texto (mas vai ser criptografada)
    required: true,   // É obrigatório
    minlength: 6      // Tem que ter no mínimo 6 caracteres
  }
}, {
  timestamps: true    // Adiciona automaticamente "createdAt" e "updatedAt" (quando criou e atualizou)
});

// Antes de salvar um usuário, criptografa a senha
// É como passar a senha por um "embaralhador" antes de guardar no banco
userSchema.pre('save', async function(next) {
  // Se a senha não foi modificada, não precisa criptografar de novo
  if (!this.isModified('password')) return next();
  
  // Criptografa a senha (10 é o nível de segurança)
  // Ex: "123456" vira algo tipo "$2a$10$abc123xyz..."
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para verificar se a senha está correta no login
// Compara a senha digitada com a senha criptografada do banco
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Retorna true se a senha está certa, false se está errada
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exporta o modelo para usar em outros arquivos
module.exports = mongoose.model('User', userSchema);

