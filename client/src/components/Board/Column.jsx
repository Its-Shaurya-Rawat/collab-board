import { Draggable } from 'react-beautiful-dnd';
import TaskCard from '../TaskCard/TaskCard';

export default function Column({ col, provided, snapshot, onAddTask, onTaskClick, allUsers }) {
  return (
    <div style={{ width:260, flexShrink:0, display:'flex', flexDirection:'column', background:snapshot.isDraggingOver?'#7c5cfc08':'transparent', borderRadius:12, border:`1px solid ${snapshot.isDraggingOver?'#7c5cfc33':'transparent'}`, transition:'all .15s', padding:4 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 8px 12px' }}>
        <span style={{ fontSize:16, opacity:.6 }}>{col.icon}</span>
        <span style={{ fontWeight:600, fontSize:14 }}>{col.title}</span>
        <span style={{ marginLeft:'auto', fontSize:12, background:'#ffffff0a', padding:'2px 8px', borderRadius:10, color:'#6b6880' }}>{col.tasks.length}</span>
      </div>
      <div ref={provided.innerRef} {...provided.droppableProps} style={{ flex:1, display:'flex', flexDirection:'column', gap:10, minHeight:80, overflowY:'auto', padding:'0 2px 8px' }}>
        {col.tasks.map((task, index) => (
          <Draggable draggableId={task.id} index={index} key={task.id}>
            {(prov, snap) => (
              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                style={{ ...prov.draggableProps.style, opacity: snap.isDragging ? .85 : 1 }}>
                <TaskCard task={task} onClick={() => onTaskClick(task)} allUsers={allUsers} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
        <button onClick={onAddTask} style={{ width:'100%', padding:'10px', background:'transparent', border:'1px dashed #ffffff12', borderRadius:10, color:'#6b6880', fontSize:13, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>+</span> Add task
        </button>
      </div>
    </div>
  );
}