<template>
  <div class="todo-view">
    <div class="page-header">
      <h1>ToDo-Liste</h1>
      <p class="subtitle">Erstellen Sie ganz einfach ToDo's und weisen Sie Familienmitglieder zu</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-overlay">
      <span class="loading-spinner">🔄</span>
      <p>Loading...</p>
    </div>

    <div class="card todo-form">
      <form @submit.prevent="addTodo" class="form-content" :class="{ loading: loading }">
        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>
        <div class="form-group">
          <input
              v-model="todoText"
              type="text"
              placeholder="ToDo-Titel eingeben..."
              maxlength="40"
              class="todo-input"
              :class="{ invalid: isTitleInvalid }"
              required
              @focus="formError = null"
          />
        </div>
        <div class="form-group">
          <input
              v-model="todoDescription"
              type="text"
              placeholder="ToDo-Beschreibung eingeben..."
              maxlength="160"
              class="todo-input"
              @focus="formError = null"
          />
        </div>
        <div class="form-group">
          <input
              v-model="todoDate"
              type="date"
              class="todo-input"
              :class="{ invalid: isDateInvalid }"
              :min="new Date().toISOString().split('T')[0]"
              required
              @focus="formError = null"
          />
        </div>
        <button type="submit" class="btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner">🔄</span>
          <span v-else class="icon">✨</span>
          {{ loading ? 'Wird hinzugefügt...' : 'Hinzufügen' }}
        </button>
      </form>
      <button @click="toggleSort" class="btn btn-primary">
        <i :class="sortIcon"></i>
      </button>
    </div>

    <div class="todo-grid">
      <ToDoItem
          v-for="(todo, index) in sortTodo()"
          :key="todo._id || index"
          :todo="todo"
          :index="index"
          @remove="removeTodo(todo._id)"
          @update="updateTodo({ id: todo._id, updates: $event })"
          @check="updateTodoCompletion({ id: todo._id, completed: $event })"
      />
    </div>
  </div>
</template>

<script>
import ToDoItem from "../components/ToDoItem.vue";
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/api/todos';
import { getUserInfo } from '@/api/auth';

export default {
  name: "ToDoView",
  components: {
    ToDoItem
  },
  data() {
    return {
      userId: null,
      todoText: "",
      todoDescription: "",
      todoDate: "",
      todos: [],
      isAscending: true,
      loading: false,
      error: null,
      formError: null
    };
  },
  computed: {
    sortIcon() {
      return this.isAscending ? "bi bi-sort-up" : "bi bi-sort-down";
    },
    isTitleInvalid() {
      return this.formError && !this.todoText.trim();
    },
    isDateInvalid() {
      return this.formError && !this.todoDate;
    }
  },
  async mounted() {
    try {
      this.loading = true;
      console.log('[DEBUG] ToDoView mounted');
      const userResponse = await getUserInfo();
      this.userId = userResponse.data.user._id;
      await this.loadTodos();
    } catch (err) {
      console.error('[DEBUG] Error initializing ToDoView:', err);
      this.error = 'Failed to load todo list. Please try again.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadTodos() {
      try {
        const response = await getTodos();
        // Assumes the backend returns { todos: [...] }
        this.todos = response.data.todos;
      } catch (error) {
        console.error('Error fetching todos:', error);
        this.error = 'Failed to fetch todos.';
      }
    },
    async addTodo() {
      this.formError = null;
      if (!this.todoText.trim()) {
        this.formError = 'Please enter a todo title';
        return;
      }
      if (!this.todoDate) {
        this.formError = 'Please select a due date';
        return;
      }
      const newTodo = {
        title: this.todoText.trim(),
        description: this.todoDescription.trim(),
        dueDate: this.todoDate, // Ensure your backend accepts "dueDate"
        status: 'pending'
      };
      try {
        const response = await createTodo(newTodo);
        // Append the new todo to the local array
        this.todos.push(response.data.todo);
        // Clear form fields
        this.todoText = "";
        this.todoDescription = "";
        this.todoDate = "";
      } catch (error) {
        console.error('Error adding new todo:', error);
        this.error = 'Failed to add todo item. Please try again.';
      }
    },
    sortTodo() {
      return this.todos.slice().sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return this.isAscending ? dateA - dateB : dateB - dateA;
      });
    },
    toggleSort() {
      this.isAscending = !this.isAscending;
    },
    async updateTodo({ id, updates }) {
      try {
        const response = await updateTodo(id, updates);
        const index = this.todos.findIndex(todo => todo._id === id);
        if (index !== -1) {
          this.todos.splice(index, 1, response.data.todo);
        }
      } catch (error) {
        console.error("Error updating todo item:", error);
        this.error = "Failed to update todo item. Please try again.";
      }
    },
    async removeTodo(id) {
      try {
        await deleteTodo(id);
        this.todos = this.todos.filter(todo => todo._id !== id);
      } catch (error) {
        console.error("Error removing todo item:", error);
        this.error = "Failed to remove todo item. Please try again.";
      }
    },
    async updateTodoCompletion({ id, completed }) {
      try {
        const updates = { status: completed ? 'completed' : 'pending' };
        const response = await updateTodo(id, updates);
        const index = this.todos.findIndex(todo => todo._id === id);
        if (index !== -1) {
          this.todos.splice(index, 1, response.data.todo);
        }
      } catch (error) {
        console.error("Error updating todo completion:", error);
        this.error = "Failed to update todo status. Please try again.";
      }
    }
  }
};
</script>

<style scoped>
body {
  overflow-x: hidden;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  text-align: center;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.form-content.loading {
  opacity: 0.7;
  pointer-events: none;
}

.form-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
}

.form-group input.invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.form-group input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
}

.form-group input.invalid:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 0.1875rem rgba(220, 38, 38, 0.1);
}

.todo-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1rem, 4vw, 2rem);
}

.page-header {
  text-align: center;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
}

.page-header h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
}

.subtitle {
  color: var(--text-color);
  opacity: 0.8;
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.todo-form {
  max-width: min(100%, 800px);
  margin: 0 auto clamp(2rem, 6vw, 3rem) auto;
  padding: clamp(1rem, 3vw, 1.5rem);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.todo-input {
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--border-color);
  border-radius: clamp(0.5rem, 2vw, 0.75rem);
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s ease;
}

.todo-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
}

.todo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  margin: 0;
  padding: 0;
  align-items: start;
  width: 100%;
}

.btn {
  align-self: flex-end;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  min-height: 2.75rem;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
}

@media (max-width: 768px) {
  .todo-form {
    padding: 1rem;
  }

  .todo-grid {
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .todo-view {
    padding: 0.75rem;
  }

  .todo-input {
    padding: 0.75rem;
  }

  .btn {
    padding: 0.75rem;
    min-height: 2.5rem;
  }
}

.icon {
  font-size: clamp(1.1em, 3vw, 1.2em);
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
