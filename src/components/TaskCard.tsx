import { useState } from "react";
import DeleteIcon from "../Icons/DeleteIcon";
import { ID, Task } from "../type"
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
    task: Task;
    deleteTask: (id: ID) => void;
    updateTask: (id: ID, content: string) => void
}

const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setMouseIsOver(false)
    }

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task
        },
        disabled: editMode
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform)
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="h-[100px] w-[350px] bg-mainBackgroundColor p-2.5 items-center  text-left  opacity-30  rounded-xl max-h-[100px] border-2 border-rose-500 cursor-grab relative flex"></div>
        )

    }

    if (editMode) {
        return (
            <div ref={setNodeRef} style={style } {...attributes} {...listeners} className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative" >
                <textarea className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus-outline-none  " value={task.content} autoFocus placeholder="Task content here " onBlur={toggleEditMode} onKeyDown={(e) => { if (e.key == "Enter" && e.shiftKey) { toggleEditMode() } }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                >

                </textarea>

            </div>
        )
    }

    return (
        <div  ref={setNodeRef} style={style } {...attributes} {...listeners}  onClick={toggleEditMode} className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task" onMouseEnter={() => setMouseIsOver(true)} onMouseLeave={() => setMouseIsOver(false)}>
            {mouseIsOver && (
                <button className="absolute bg-columnBackgroundColor stroke-white right-4 top-1/2 p-2 rounded -translate-y-1/2 opacity-60 hover:opacity-100" onClick={() => deleteTask(task.id)} >
                    <DeleteIcon />
                </button>
            )}

            <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap ">{task.content}</p></div>
    )
}

export default TaskCard