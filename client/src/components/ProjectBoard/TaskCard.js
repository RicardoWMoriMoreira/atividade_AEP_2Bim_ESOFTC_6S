import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, provided, snapshot, onEdit, onDelete }) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <div className="drag-indicator">
          <span className="drag-dots">⋮⋮</span>
        </div>
        <h3 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(task);
          }} 
          className="task-title"
        >
          {task.title}
        </h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="btn-delete"
          title="Deletar tarefa"
        >
          ×
        </button>
      </div>
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(task);
        }} 
        className="task-content"
      >
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        {task.responsaveis && task.responsaveis.length > 0 && (
          <div className="task-responsaveis">
            <strong>Responsáveis:</strong>
            <div className="responsaveis-list">
              {task.responsaveis.map((user) => (
                <span key={user._id || user.id} className="responsavel-tag">
                  {user.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

