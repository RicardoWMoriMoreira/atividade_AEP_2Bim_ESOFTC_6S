import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import './ProjectBoard.css';

const columns = [
  { id: 'A Fazer', title: 'A Fazer', color: '#3498db' },
  { id: 'Fazendo', title: 'Fazendo', color: '#f39c12' },
  { id: 'Feito', title: 'Feito', color: '#27ae60' }
];

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        navigate('/dashboard');
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/tasks/project/${projectId}`);
      
      const validTasks = response.data.map(task => ({
        ...task,
        status: ['A Fazer', 'Fazendo', 'Feito'].includes(task.status) ? task.status : 'A Fazer'
      }));
      setTasks(validTasks);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const validColumns = ['A Fazer', 'Fazendo', 'Feito'];
    if (!validColumns.includes(destination.droppableId)) {
      console.error('Coluna de destino inválida:', destination.droppableId);
      return;
    }

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    const updatedTasks = tasks.map(t =>
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      const responsaveisIds = task.responsaveis 
        ? task.responsaveis.map(r => r._id || r)
        : [];

      const response = await axios.put(`/api/tasks/${draggableId}`, {
        title: task.title,
        description: task.description,
        status: newStatus,
        responsaveis: responsaveisIds
      });

      const finalTasks = tasks.map(t =>
        t._id === draggableId ? response.data : t
      );
      setTasks(finalTasks);
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      
      setTasks(tasks);
      alert('Erro ao mover tarefa. A mudança foi revertida.');
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setSelectedColumn('A Fazer');
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSaved = () => {
    fetchTasks();
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      alert('Erro ao deletar tarefa. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="loading">Carregando quadro...</div>;
  }

  if (!project) {
    return <div className="error">Projeto não encontrado</div>;
  }

  return (
    <div className="project-board">
      <div className="board-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Voltar
          </button>
          <h1>{project.title}</h1>
          {project.description && <p className="project-description">{project.description}</p>}
        </div>
        <button onClick={handleCreateTask} className="btn-primary">
          + Nova Tarefa
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = tasks.filter(task => task.status === column.id);

            return (
              <div key={column.id} className="kanban-column">
                <div className="column-header" style={{ borderTopColor: column.color }}>
                  <h2>{column.title}</h2>
                  <span className="task-count">{columnTasks.length}</span>
                </div>
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TaskCard
                              task={task}
                              provided={provided}
                              snapshot={snapshot}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnTasks.length === 0 && (
                        <div className="empty-column">
                          <p>Nenhuma tarefa</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <TaskModal
          projectId={projectId}
          task={selectedTask}
          defaultStatus={selectedColumn}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setSelectedColumn(null);
          }}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  );
};

export default ProjectBoard;

