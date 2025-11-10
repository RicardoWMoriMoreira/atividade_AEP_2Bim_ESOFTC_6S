const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');  // Verificar se está logado
const Task = require('../models/Task');
const Project = require('../models/Project');

// ROTA PARA CRIAR UMA NOVA TAREFA
// A tarefa precisa estar dentro de um projeto
router.post('/', auth, async (req, res) => {
  try {
    // Pega os dados da tarefa que vieram do formulário
    const { title, description, status, project, responsaveis } = req.body;

    // Valida se tem título e projeto (são obrigatórios)
    if (!title || !project) {
      return res.status(400).json({ message: 'Título e projeto são obrigatórios' });
    }

    // Busca o projeto para verificar se ele existe e se você tem acesso
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verifica se você faz parte desse projeto (é dono ou membro)
    // Só quem está no projeto pode criar tarefas nele
    const hasAccess = projectDoc.owner.toString() === req.user._id.toString() ||
                      projectDoc.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado ao projeto' });
    }

    // Valida os responsáveis pela tarefa
    // Só pode ser responsável quem é membro do projeto
    let validResponsaveis = [];
    if (responsaveis && Array.isArray(responsaveis)) {
      // Filtra e mantém só os responsáveis que são membros do projeto
      validResponsaveis = responsaveis.filter(responsavelId => 
        projectDoc.members.some(memberId => memberId.toString() === responsavelId.toString())
      );
    }

    // Cria a tarefa no banco de dados
    const task = new Task({
      title,
      description: description || '',        // Se não tem descrição, deixa vazio
      status: status || 'A Fazer',           // Se não definiu status, começa em "A Fazer"
      project,                                // ID do projeto
      responsaveis: validResponsaveis         // Lista de responsáveis validados
    });

    // Salva no banco
    await task.save();
    
    // Preenche os dados dos responsáveis e do projeto
    await task.populate('responsaveis', 'name email');
    await task.populate('project', 'title');

    // Retorna a tarefa criada (status 201 = Created)
    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro ao criar tarefa', error: error.message });
  }
});

// ROTA PARA LISTAR TODAS AS TAREFAS DE UM PROJETO
// Usado no quadro Kanban para mostrar as tarefas nas colunas
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    // Pega o ID do projeto que vem na URL
    const { projectId } = req.params;

    // Busca o projeto para verificar se existe e se você tem acesso
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verifica se você faz parte do projeto
    // Só pode ver as tarefas quem é dono ou membro do projeto
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                      project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado ao projeto' });
    }

    // Busca todas as tarefas desse projeto
    const tasks = await Task.find({ project: projectId })
      .populate('responsaveis', 'name email')  // Preenche dados dos responsáveis
      .populate('project', 'title')            // Preenche dados do projeto
      .sort({ createdAt: -1 });                // Ordena da mais recente para mais antiga

    // Retorna a lista de tarefas
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ message: 'Erro ao listar tarefas', error: error.message });
  }
});

// ROTA PARA ATUALIZAR UMA TAREFA
// Usado quando você edita a tarefa ou arrasta ela para outra coluna no Kanban
router.put('/:id', auth, async (req, res) => {
  try {
    // Pega os dados que serão atualizados
    const { title, description, status, responsaveis } = req.body;
    
    // Busca a tarefa e já traz os dados do projeto junto
    const task = await Task.findById(req.params.id).populate('project');

    // Verifica se a tarefa existe
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verifica se você tem acesso ao projeto dessa tarefa
    const project = task.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                      project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Atualiza o status se foi enviado e é válido
    // Importante: valida se o status é um dos três permitidos
    if (status && ['A Fazer', 'Fazendo', 'Feito'].includes(status)) {
      task.status = status;
    }
    
    // Atualiza outros campos se foram enviados
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    
    // Atualiza os responsáveis se foi enviado
    if (responsaveis !== undefined && Array.isArray(responsaveis)) {
      task.responsaveis = responsaveis;
    }

    // Salva as alterações no banco
    await task.save();
    
    // Preenche os dados dos responsáveis e do projeto antes de retornar
    await task.populate('responsaveis', 'name email');
    await task.populate('project', 'title');

    // Retorna a tarefa atualizada
    res.json(task);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa', error: error.message });
  }
});

// ROTA PARA DELETAR UMA TAREFA
router.delete('/:id', auth, async (req, res) => {
  try {
    // Busca a tarefa e traz os dados do projeto junto
    const task = await Task.findById(req.params.id).populate('project');

    // Verifica se existe
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Verifica se você tem acesso ao projeto dessa tarefa
    // Só quem está no projeto pode deletar tarefas dele
    const project = task.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                      project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Deleta a tarefa
    await Task.findByIdAndDelete(req.params.id);
    
    // Retorna mensagem de sucesso
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ message: 'Erro ao deletar tarefa', error: error.message });
  }
});

// Exporta todas as rotas
module.exports = router;

