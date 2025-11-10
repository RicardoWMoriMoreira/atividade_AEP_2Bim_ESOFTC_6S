import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] });
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        members: newProject.members.map(member => member._id)
      };
      const response = await axios.post('/api/projects', projectData);
      setProjects([...projects, response.data]);
      setNewProject({ title: '', description: '', members: [] });
      setSearchUser('');
      setSearchResults([]);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto. Tente novamente.');
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(`/api/auth/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setSearchResults([]);
    }
  };

  const addMember = (user) => {
    if (!newProject.members.find(member => member._id === user._id)) {
      setNewProject({
        ...newProject,
        members: [...newProject.members, user]
      });
    }
    setSearchUser('');
    setSearchResults([]);
  };

  const removeMember = (userId) => {
    setNewProject({
      ...newProject,
      members: newProject.members.filter(member => member._id !== userId)
    });
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o projeto "${projectTitle}"?\n\nEsta ação não pode ser desfeita e todas as tarefas do projeto serão perdidas.`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      alert('Projeto deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      if (error.response?.status === 403) {
        alert('Apenas o dono do projeto pode deletá-lo.');
      } else {
        alert('Erro ao deletar projeto. Tente novamente.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Carregando projetos...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Meus Projetos</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não tem projetos.</p>
          <p>Crie seu primeiro projeto para começar!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <div 
                className="project-content"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <h3>{project.title}</h3>
                <p>{project.description || 'Sem descrição'}</p>
                <div className="project-meta">
                  <span>Dono: {project.owner?.name}</span>
                  <span>Membros: {project.members?.length || 1}</span>
                </div>
              </div>
              <div className="project-actions">
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project._id, project.title);
                  }}
                  title="Deletar projeto"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Projeto</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Adicionar Membros</label>
                <div className="user-search">
                  <input
                    type="text"
                    placeholder="Digite o nome ou email do usuário..."
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      searchUsers(e.target.value);
                    }}
                  />
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="search-result-item"
                          onClick={() => addMember(user)}
                        >
                          <div className="user-info">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                          <button type="button" className="btn-add-user">+</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {newProject.members.length > 0 && (
                  <div className="selected-members">
                    <h4>Membros Selecionados:</h4>
                    <div className="members-list">
                      {newProject.members.map((member) => (
                        <div key={member._id} className="member-tag">
                          <span>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => removeMember(member._id)}
                            className="btn-remove-member"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

