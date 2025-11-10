import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskModal.css';

const TaskModal = ({ projectId, task, defaultStatus, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus || 'A Fazer');
  const [responsaveis, setResponsaveis] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectMembers();
    
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'A Fazer');
      
      const taskResponsaveis = Array.isArray(task.responsaveis) ? task.responsaveis : [];
      setResponsaveis(taskResponsaveis);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || 'A Fazer');
      setResponsaveis([]);
    }
  }, [task, defaultStatus, projectId]);

  const fetchProjectMembers = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProjectMembers(response.data.members || []);
    } catch (error) {
      console.error('Erro ao buscar membros do projeto:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const taskData = {
        title,
        description,
        status,
        responsaveis: responsaveis.map(r => r._id || r)
      };

      if (task) {
        await axios.put(`/api/tasks/${task._id}`, taskData);
      } else {
        await axios.post('/api/tasks', {
          ...taskData,
          project: projectId
        });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Digite o título da tarefa"
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Digite a descrição da tarefa"
            />
          </div>
          <div className="form-group">
            <label>Coluna do Kanban</label>
            <div className="kanban-status-selector">
              {[
                { id: 'A Fazer', title: 'A Fazer', color: '#3498db', description: 'Tarefas pendentes' },
                { id: 'Fazendo', title: 'Fazendo', color: '#f39c12', description: 'Em andamento' },
                { id: 'Feito', title: 'Feito', color: '#27ae60', description: 'Concluídas' }
              ].map((column) => (
                <button
                  key={column.id}
                  type="button"
                  className={`status-option ${status === column.id ? 'active' : ''}`}
                  style={{ borderColor: column.color }}
                  onClick={() => setStatus(column.id)}
                  title={column.description}
                >
                  <div className="status-indicator" style={{ backgroundColor: column.color }}></div>
                  <span>{column.title}</span>
                </button>
              ))}
            </div>
          </div>

          {projectMembers.length > 1 && (
            <div className="form-group">
              <label>Responsáveis</label>
              <div className="responsaveis-selector">
                {projectMembers.map((member) => {
                  const isSelected = responsaveis.some(r => (r._id || r) === member._id);
                  return (
                    <button
                      key={member._id}
                      type="button"
                      className={`member-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setResponsaveis(responsaveis.filter(r => (r._id || r) !== member._id));
                        } else {
                          setResponsaveis([...responsaveis, member]);
                        }
                      }}
                    >
                      <div className="member-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{member.name}</span>
                        <span className="member-email">{member.email}</span>
                      </div>
                      {isSelected && <div className="selected-indicator">✓</div>}
                    </button>
                  );
                })}
              </div>
              
              {responsaveis.length > 0 && (
                <div className="selected-responsaveis">
                  <small>Responsáveis selecionados:</small>
                  <div className="responsaveis-tags">
                    {responsaveis.map((responsavel) => (
                      <span key={responsavel._id} className="responsavel-tag">
                        {responsavel.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

