import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Calendar, AlertCircle } from 'lucide-react';

const SortableTask = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group mb-4"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          task.priority === 'high' ? 'bg-red-50 text-red-500' :
          task.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
        }`}>
          {task.priority}
        </span>
        <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={16} /></button>
      </div>
      
      <h4 className="text-[14px] font-bold text-slate-800 mb-4 leading-snug group-hover:text-violet-600 transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar size={12} />
          <span className="text-[11px] font-bold">
            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full bg-violet-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-violet-600">
           {task.assignedTo?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const Column = ({ id, title, tasks, onTaskClick }) => {
  return (
    <div className="flex-1 min-w-[300px] bg-slate-50/50 rounded-[32px] p-6 flex flex-col h-full border border-slate-100/50">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">{title}</h3>
          <span className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTask key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-32 rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2">
            <AlertCircle size={20} />
            <span className="text-[11px] font-bold uppercase tracking-widest">No tasks</span>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, onTaskUpdate, onTaskClick }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const safeTasks = tasks || [];

  const columns = {
    todo: safeTasks.filter(t => t.status === 'todo'),
    'in-progress': safeTasks.filter(t => t.status === 'in-progress'),
    review: safeTasks.filter(t => t.status === 'review'),
    completed: safeTasks.filter(t => t.status === 'completed'),
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = safeTasks.find(t => t._id === activeId);
    if (!activeTask) return;

    // Determine if we dropped over a column or a task
    let overColumnId = null;
    if (['todo', 'in-progress', 'review', 'completed'].includes(overId)) {
      overColumnId = overId;
    } else {
      const overTask = safeTasks.find(t => t._id === overId);
      if (overTask) overColumnId = overTask.status;
    }

    if (overColumnId && activeTask.status !== overColumnId) {
      onTaskUpdate(activeTask, overColumnId);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-320px)] min-h-[500px] overflow-x-auto pb-4 scrollbar-hide">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <Column id="todo" title="Todo" tasks={columns.todo} onTaskClick={onTaskClick} />
        <Column id="in-progress" title="In Progress" tasks={columns['in-progress']} onTaskClick={onTaskClick} />
        <Column id="review" title="Review" tasks={columns.review} onTaskClick={onTaskClick} />
        <Column id="completed" title="Completed" tasks={columns.completed} onTaskClick={onTaskClick} />
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
