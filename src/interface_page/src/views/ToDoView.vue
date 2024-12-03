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

    <div class="postItDiv">
      <ToDoItem 
        v-for="(todo, index) in todos" 
        :key="index" 
        :todo="todo" 
        :index="index" 
        @remove="removeTodo"
        @update="updateTodo"
      />
    </div>
  </div>
</template>

<script>
import ToDoItem from "../components/ToDoItem.vue";
import axios from 'axios';
const backendUrl = `http://${process.env.VUE_APP_SERVER_IP}:${process.env.VUE_APP_SERVER_PORT}`;

export default {
  name: "todo",
  components: {
    ToDoItem
  },
  data() {
    return {
      todoText: "", 
      todoDescription: "",
      todos: [],
      data: ""
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
    },
    async fetchData() {
      try {
        const response = await axios.get(backendUrl);
        this.data = response.data;
        console.log(this.data)
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    },
    mounted() {
    //this.fetchData();
    }
  }
};
</script>
<style>
.postItDiv {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap:10vw;
}
</style>
