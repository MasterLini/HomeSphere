<template>
  <div class="text-center mt-5">
    <h1>ToDo-Liste</h1>
    <p class="lead">Erstellen Sie ganz einfach ToDo's und weisen Sie Familienmitglieder zu</p>
    
    <form @submit.prevent="addTodo">
      <input 
        v-model="todoText" 
        type="text" 
        placeholder="ToDo-Titel eingeben..." 
        class="form-control mb-3"
      />
      <input
        v-model="todoDescription"
        type="text"
        placeholder="ToDo-Beschreibung eingeben..."
        class="form-control mb-3"
        />
      <button type="submit" class="btn btn-primary">Hinzufügen</button>
    </form>

    <ul class="list-group mt-4">
      <ToDoItem 
        v-for="(todo, index) in todos" 
        :key="index" 
        :todo="todo" 
        :index="index" 
        @remove="removeTodo"
        @update="updateTodo"
      />
    </ul>
  </div>
</template>

<script>
import ToDoItem from "../components/ToDoItem.vue";

export default {
  name: "todo",
  components: {
    ToDoItem
  },
  data() {
    return {
      todoText: "", 
      todoDescription: "",
      todos: []
    };
  },
  methods: {
    addTodo() {
      if (this.todoText.trim() !== "") {
        this.todos.push({ text: this.todoText, description: this.todoDescription, completed: false });
        this.todoText = ""; 
      }
      if (this.todoDescription.trim() !== "") {
        this.todoDescription = "";
      }
      console.log(this.todos);
    },
    removeTodo(index) {
      this.todos.splice(index, 1);
    },
    updateTodo({ index, completed }) {
      this.todos[index].completed = completed;
    }
  }
};
</script>
