<template>
  <div class="todo-view">
    <div class="page-header">
      <h1>ToDo-Liste</h1>
      <p class="subtitle">Erstellen Sie ganz einfach ToDo's und weisen Sie Familienmitglieder zu</p>
    </div>
    
    <div class="card todo-form">
      <form @submit.prevent="addTodo" class="form-content">
        <div class="form-group">
          <input 
            v-model="todoText" 
            type="text" 
            placeholder="ToDo-Titel eingeben..." 
            maxlength="40"
            class="todo-input"
            required
      />
        </div>
        <div class="form-group">
          <input
            v-model="todoDescription"
            type="text"
            placeholder="ToDo-Beschreibung eingeben..."
            maxlength="160"
            class="todo-input"
          />
        </div>
        <div class="form-group">
          <input
        v-model="todoDate"
        type="date"
        class="todo-input"
        />
      </div>
      <button type="submit" class="btn">
          <span class="icon">✨</span>
          Hinzufügen
        </button>
      </form>
      <button @click="toggleSort" class="btn btn-primary">
        <i :class="sortIcon"></i>
      </button>
    </div>

    <div class="todo-grid">
      <ToDoItem 
        v-for="(todo, index) in sortTodo()" 
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
      todoDate: "",
      todos: [],
      isAscending: true,
      data: []
    };
  },
  computed: {
    sortIcon() {
      return this.isAscending ? "bi bi-sort-up" : "bi bi-sort-down";
    },
  },
  mounted() {
    //this.fetchData();
    console.log("Hii");
    this.setMinimumDate();
    },
  methods: {
    addTodo() {
      if (this.todoText.trim() !== "") {
        this.todos.push({ text: this.todoText, description: this.todoDescription, date: this.todoDate, completed: false });
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
    setMinimumDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); 
      const dd = String(today.getDate()).padStart(2, '0'); 
      const currentDate = `${yyyy}-${mm}-${dd}`;

      document.querySelectorAll('input[type="date"]').forEach(input => input.setAttribute('min', currentDate));      
    },
    async fetchData() {
      try {
        const response = await axios.get(backendUrl + "/lists/");
        this.data = response.data;
        console.log(this.data)
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    },
    sortTodo() {
      return this.todos.slice().sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return this.isAscending ? dateA - dateB : dateB - dateA;
      });
    },
    toggleSort() {
      this.isAscending = !this.isAscending;
    },
  }
};
</script>

<style scoped>
body {
  overflow-x: hidden;
}
.todo-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 1.1em;
}

.todo-form {
  max-width: 800px;
  margin: 0 auto 3rem auto;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todo-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s ease;
}

.todo-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}

.todo-grid {
  display: grid;
  grid-template-columns: repeat(3,auto); 
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: start; 
  justify-items: start; 
}

.btn {
  align-self: flex-end;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .todo-view {
    padding: 1rem;
  }
  
  .todo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
