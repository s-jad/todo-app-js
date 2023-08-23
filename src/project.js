export default class Project {
    constructor(title, description, todos) {
        this.title = title;
        this.description = description;
        this.todos = todos;
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    deleteTodo(todoTitle) {
        const todoIndex = this.todos.findIndex(todo => todo.title === todoTitle);

        if (todoIndex !== -1) {
            this.todos.splice(todoIndex, 1);
        } else {
            console.log(`Can't find ${todoTitle}`);
        }
    }

    getTodo(todoTitle) {
        const todoIndex = this.todos.findIndex(todo => todo.title === todoTitle);

        if (todoIndex !== -1) {
            return this.todos[todoIndex];
        } else {
            console.log(`Can't find ${todoTitle}`);
        }
    }

    getAllTodos() {
        return this.todos;
    }

    updateTodo(todoTitle, todoPatch) {
        const todoIndex = this.todos.findIndex(todo => todo.title === todoTitle);

        if (todoIndex !== -1) {
            this.todos[todoIndex] = todoPatch;
        } else {
            console.log(`Can't find ${todoTitle}`);
        }
    }
}


