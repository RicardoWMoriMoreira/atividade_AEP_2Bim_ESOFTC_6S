const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');  // Middleware para verificar se está logado
const Project = require('../models/Project');

// ROTA PARA CRIAR UM NOVO PROJETO
// Precisa estar logado (auth)
router.post('/', auth, async (req, res) => {
  try {
    // Pega os dados que vieram do formulário
    const { title, description, members } = req.body;

    // Valida se o título foi preenchido (é obrigatório)
    if (!title) {
      return res.status(400).json({ message: 'Título do projeto é obrigatório' });
    }

    // Cria a lista de membros do projeto
    // Começa com você mesmo (quem está criando o projeto)
    const projectMembers = [req.user._id];
    
    // Se você adicionou outros membros, inclui eles também
    if (members && Array.isArray(members)) {
      members.forEach(memberId => {
        // Verifica se o membro ainda não está na lista (evita duplicatas)
        if (!projectMembers.includes(memberId)) {
          projectMembers.push(memberId);
        }
      });
    }

    // Cria o projeto no banco de dados
    const project = new Project({
      title,
      description: description || '',  // Se não tem descrição, deixa vazio
      owner: req.user._id,              // Você é o dono do projeto
      members: projectMembers           // Lista de membros (incluindo você)
    });

    // Salva no banco
    await project.save();
    
    // Busca e preenche os dados completos do dono e dos membros
    // Traz nome e email de cada pessoa
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    // Retorna o projeto criado (status 201 = Created)
    res.status(201).json(project);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ message: 'Erro ao criar projeto', error: error.message });
  }
});

// ROTA PARA LISTAR TODOS OS PROJETOS DO USUÁRIO
// Mostra os projetos que você criou OU que você é membro
router.get('/', auth, async (req, res) => {
  try {
    // Busca projetos onde você é o dono OU você está na lista de membros
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },      // Projetos que você criou
        { members: req.user._id }     // Projetos que você participa
      ]
    })
    .populate('owner', 'name email')    // Preenche dados do dono
    .populate('members', 'name email')  // Preenche dados dos membros
    .sort({ createdAt: -1 });           // Ordena do mais recente para o mais antigo

    // Retorna a lista de projetos
    res.json(projects);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ message: 'Erro ao listar projetos', error: error.message });
  }
});

// ROTA PARA VER UM PROJETO ESPECÍFICO
// Usado quando você clica em um projeto para ver os detalhes
router.get('/:id', auth, async (req, res) => {
  try {
    // Busca o projeto pelo ID que vem na URL
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    // Se não encontrou o projeto, retorna erro 404 (Not Found)
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verifica se você tem permissão para ver esse projeto
    // Você tem acesso se for o dono OU se estiver na lista de membros
    const hasAccess = project.owner._id.toString() === req.user._id.toString() ||
                      project.members.some(m => m._id.toString() === req.user._id.toString());

    // Se não tem acesso, retorna erro 403 (Forbidden)
    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Se passou nas verificações, retorna o projeto
    res.json(project);
  } catch (error) {
    console.error('Erro ao obter projeto:', error);
    res.status(500).json({ message: 'Erro ao obter projeto', error: error.message });
  }
});

// ROTA PARA EDITAR UM PROJETO
// Só o dono do projeto pode editar
router.put('/:id', auth, async (req, res) => {
  try {
    // Busca o projeto que será editado
    const project = await Project.findById(req.params.id);

    // Verifica se o projeto existe
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verifica se você é o dono do projeto
    // Só o dono pode editar (membros normais não podem)
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode editar o projeto' });
    }

    // Atualiza os campos que foram enviados
    const { title, description } = req.body;
    if (title) project.title = title;  // Atualiza o título se foi enviado
    if (description !== undefined) project.description = description;  // Atualiza descrição (mesmo se for vazio)

    // Salva as alterações no banco
    await project.save();
    
    // Preenche os dados do dono e membros antes de retornar
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    // Retorna o projeto atualizado
    res.json(project);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ message: 'Erro ao atualizar projeto', error: error.message });
  }
});

// ROTA PARA DELETAR UM PROJETO
// Só o dono pode deletar, e isso também apaga todas as tarefas do projeto
router.delete('/:id', auth, async (req, res) => {
  try {
    // Busca o projeto
    const project = await Project.findById(req.params.id);

    // Verifica se existe
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verifica se você é o dono
    // Só o dono pode deletar o projeto inteiro
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode deletar o projeto' });
    }

    // Antes de deletar o projeto, deleta todas as tarefas associadas a ele
    // Se não fizer isso, as tarefas ficariam "órfãs" no banco
    const Task = require('../models/Task');
    await Task.deleteMany({ project: req.params.id });

    // Agora deleta o projeto
    await Project.findByIdAndDelete(req.params.id);
    
    // Retorna mensagem de sucesso
    res.json({ message: 'Projeto e todas as suas tarefas foram deletados com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ message: 'Erro ao deletar projeto', error: error.message });
  }
});

// Exporta todas as rotas
module.exports = router;

