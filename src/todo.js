export default class Todo {
    constructor(title, description, dueDate, priority, notes, checked) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
        this.checked = checked;
    };

    updateTodoDescription(descriptionPatch) {
        this.description = descriptionPatch;
    };

    updateTodoDueDate(dueDatePatch) {
        this.dueDate = dueDatePatch;
    };

    updateTodoPriority(priorityPatch) {
        this.priority = priorityPatch;
    };

    updateTodoNotes(notesPatch) {
       this.notes = notesPatch; 
    };
}

