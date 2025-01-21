import  { useEffect, useMemo, useState } from 'react'
import PlusIcon from '../Icons/PlusIcon'
import { Column, ID, Task } from '../type';
import ColumnContainer from '../components/ColumnContainer';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';
const LOCAL_STORAGE_KEY = 'kanban-board-data';

const KanbanBoard = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

    // for task
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            const { savedColumns, savedTasks } = JSON.parse(storedData);
            setColumns(savedColumns || []);
            setTasks(savedTasks || []);
        }
    }, []);
    // Save data to local storage whenever columns or tasks change
    useEffect(() => {
        const dataToSave = {
            savedColumns: columns,
            savedTasks: tasks,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }, [columns, tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor,
            {
                activationConstraint: {
                    distance: 3
                }
            })
    )

    // to create new column
    const createNewColumn = () => {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`
        }
        setColumns([...columns, columnToAdd])
    }

    const generateId = () => {
        // to generate random number
        return Math.floor(Math.random() * 1001);
    }

    // to delete the column
    const deleteColumn = (id: ID) => {
        const filteredColumn = columns.filter((col) => col.id !== id);
        setColumns(filteredColumn);
        const filteredTask = tasks.filter((task) => task.id !== id);
        setTasks(filteredTask);
    }

    // to update Column
    const updateColumn = (id: ID, title: string) => {
        const newColumn = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title }
        })
        setColumns(newColumn);
    }


    // to drag content (starting)
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const onDragStart = (event: DragStartEvent) => {
        console.log("Event", event);
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }
    // to drag content (ending)
    const onDragEnd = (event: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeColumnId = active.id;
        const overColumnId = over.id;
        if (activeColumnId === overColumnId) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
            const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex)
        })
    }
    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                const overIndex = tasks.findIndex((t) => t.id === overId)
                tasks[activeIndex].columnId = tasks[overIndex].columnId;
                return arrayMove(tasks, activeIndex, overIndex)
            })
        }
        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                tasks[activeIndex].columnId = overId;
                return arrayMove(tasks, activeIndex, activeIndex)
            })
        }

    }

    // to add task 
    const createTask = (columnId: ID) => {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`
        }
        setTasks([...tasks, newTask]);
    }
    // to delete task
    const deleteTask = (id: ID) => {
        const filteredTask = tasks.filter((task) => task.id !== id)
        setTasks(filteredTask);
    }
    // to update task
    const updateTask = (id: ID, content: string) => {
        const updatetask = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content }
        })
        setTasks(updatetask);

    }
    return (
        <>
        <div className=" mt-8">
            <h1 className="uppercase text-center text-4xl ">Kan<span className="text-rose-500">ban-Bo</span>ard</h1>
            <p className="text-xl text-center text-gray-600 italic">
                Streamline your workflow and boost productivity with our Kanban Board!
            </p>
        </div>
            <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden  px-[40px">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
                    <div className="m-auto flex">
                        <div className="flex gap-4">
                            <SortableContext items={columnsId}>
                                {columns.map((col) => (
                                    <ColumnContainer key={col.id} column={col} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask}
                                        tasks={tasks.filter((task) => task.columnId === col.id)}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask} />
                                ))}
                            </SortableContext>

                        </div>
                        <button
                            onClick={() => { createNewColumn(); }}
                            className="h-[60px] w-[350px] min-w-[350px] rounded-lg bg-mainBackgroundColor border-columnBackgroundColor border-2 cursor-pointer ring-rose-500 hover:ring-2 flex gap-3 p-4 ml-4"><PlusIcon />Add column</button>
                    </div>
                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (<ColumnContainer column={activeColumn} deleteColumn={deleteColumn} updateColumn={updateColumn}
                                createTask={createTask}
                                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                                deleteTask={deleteTask}
                                updateTask={updateTask} />)}
                            {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask}
                                updateTask={updateTask} />}
                        </DragOverlay>, document.body
                    )}

                </DndContext>
            </div>

        </>
    )
}

export default KanbanBoard