import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Column, ID, Task } from '../type'
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import DeleteIcon from '../Icons/DeleteIcon';
import PlusIcon from '../Icons/PlusIcon';
import TaskCard from './TaskCard';


interface Props {
    column: Column;
    deleteColumn: (id: ID) => void;
    updateColumn: (id: ID, title: string) => void;
    createTask: (columnId: ID) => void;
    deleteTask:(id:ID)=>void;
    updateTask:(id:ID,content:string)=>void;
    tasks: Task[]
}

const ColumnContainer = (props: Props) => {
    const { column, deleteColumn, updateColumn, createTask, tasks ,deleteTask,updateTask} = props;
    const [editMode, setEditMode] = useState(false)
    const tasksId = useMemo(() => tasks.map((task) => task.id), [tasks])

    // for dragging and dropping using dnd kit
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column
        },
        disabled: editMode
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform)
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="h-[500px] w-[350px] bg-columnBackgroundColor opacity-50 border-2 rounded-md max-h-[500px] border-pink-500 flex"></div>
        )

    }


    return (
        <>
            <div ref={setNodeRef} style={style} className="flex flex-col h-[500px] w-[350px] bg-columnBackgroundColor rounded-md max-h-[500px] ">
                {/* column title */}
                <div {...listeners} {...attributes} onClick={() => setEditMode(true)} className="bg-mainBackgroundColor p-3 text-md h-[60px] cursor-grab rounded-md rounded-b-none font-bold border-columnBackgroundColor border-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="bg-columnBackgroundColor rounded-full flex  justify-center items-center px-2 py-1 text-sm">0</div>
                    </div>
                    {!editMode && column.title}
                    {editMode && (
                        <input className="bg-black focus:border-rose-500 border-2 rounded outline-none px-2"
                            value={column.title}
                            onChange={e => updateColumn(column.id, e.target.value)}
                            autoFocus onBlur={() => (setEditMode(false))}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                setEditMode(false)
                            }} />
                    )}

                    <button className="stroke-gray-500 hover:bg-columnBackgroundColor hover:stroke-white px-1 py-2 rounded" onClick={() => { deleteColumn(column.id) }}>
                        <DeleteIcon />
                    </button>
                </div>






                {/* column body */}
                < div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden  overflow-y-auto" >
                <SortableContext items={tasksId}>
                {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
                    ))}
                </SortableContext>
                    
                </div >

                {/* column footer */}
                < button className="flex justify-center items-center  p-4  gap-2 border-columnBackgroundColor border-2 rounded-md border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black" onClick={() => createTask(column.id)}>
                    <PlusIcon />
                    Add Task
                </button>
            </div>
        </>

    )
}

export default ColumnContainer