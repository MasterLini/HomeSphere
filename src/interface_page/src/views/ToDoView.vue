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
      <form @submit.prevent="addTodo" class="form-content" :class="{ 'loading': loading }">
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
            :class="{ 'invalid': isTitleInvalid }"
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
            :class="{ 'invalid': isDateInvalid }"
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
        :key="todo.id || index"
        :todo="todo"
        :index="index"
        @remove="removeTodo"
        @update="updateTodo"
        @check="updateTodoCompletion"
      />
    </div>
  </div>
</template>

<script>
import ToDoItem from "../components/ToDoItem.vue";
import { getTodoLists, createTodoList, deleteTodoList, updateTodoList } from '@/api/lists';
import { getUserInfo } from '@/api/user';

export default {
  name: "todo",
  components: {
    ToDoItem
  },
  created() {
    console.log('[DEBUG] ToDoView created');
  },
  beforeMount() {
    console.log('[DEBUG] ToDoView beforeMount');
  },
  beforeUnmount() {
    console.log('[DEBUG] ToDoView beforeUnmount');
  },
  unmounted() {
    console.log('[DEBUG] ToDoView unmounted, resetting initialized state');
    this.initialized = false;
  },
  data() {
    return {
      userId: null,
      todoText: "",
      todoDescription: "",
      todoDate: "",
      todos: [],
      lists: [],
      isAscending: true,
      loading: false,
      error: null,
      formError: null,
      initialized: false,
      initializationInProgress: false
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
  watch: {
    '$route'(to, from) {
      console.log('[DEBUG] Route changed in ToDoView', {
        to: to.path,
        from: from.path,
        initialized: this.initialized,
        inProgress: this.initializationInProgress
      });
    }
  },
  async mounted() {
    console.log('[DEBUG] ToDoView mounted', {
      initialized: this.initialized,
      inProgress: this.initializationInProgress,
      userId: this.userId,
      route: this.$route.path,
      lists: this.lists.length
    });

    if (this.initialized) {
      console.log('[DEBUG] ToDoView already initialized, skipping');
      return;
    }

    if (this.initializationInProgress) {
      console.log('[DEBUG] Initialization in progress, skipping');
      return;
    }

    try {
      this.loading = true;
      this.initializationInProgress = true;
      console.log('[DEBUG] Starting ToDoView initialization');

      // Get authenticated user info
      const data = await getUserInfo();
      this.userId = data._id;
      console.log('[DEBUG] Authenticated user (ToDoView):', data);

      // Initialize and load todos
      await this.initUserTodoList();

      // Set initial todos from the list
      const todoList = this.lists.find(list => list.type === "todolist");
      this.todos = todoList ? todoList.items : [];

      // Mark as initialized after successful setup
      this.initialized = true;
      console.log('[DEBUG] ToDoView initialization complete', {
        initialized: this.initialized,
        inProgress: this.initializationInProgress,
        lists: this.lists.length,
        todos: this.todos.length
      });
    } catch (err) {
      console.error('[DEBUG] Error initializing ToDoView:', err);
      this.error = 'Failed to load todo list. Please try again.';
      // Reset initialization state on error
      this.initialized = false;
    } finally {
      this.loading = false;
      this.initializationInProgress = false;
      console.log('[DEBUG] ToDoView initialization cleanup complete', {
        initialized: this.initialized,
        inProgress: this.initializationInProgress
      });
    }
  },
  methods: {
    /**
     * Ensure the user has exactly one "todolist".
     * If none is found, create a fresh one on the backend.
     */
    async initUserTodoList() {
      if (this.initializationInProgress) {
        console.log('[DEBUG] Initialization already in progress, skipping');
        return;
      }

      this.initializationInProgress = true;
      console.log('[DEBUG] Starting initUserTodoList');

      try {
        // 1. Get all todo lists
        const lists = await getTodoLists();
        console.log('[DEBUG] Got lists from server:', lists);

        // Filter for todolist type
        const todoLists = lists.filter(list => list.type === 'todolist');
        console.log('[DEBUG] Filtered todo lists:', todoLists);

        if (todoLists.length > 0) {
          console.log('[DEBUG] Found existing todo lists:', todoLists.length);
          // Use existing todo list
          this.lists = todoLists;
          return;
        }

        // 2. Create a new todo list if none exists
        try {
          console.log('[DEBUG] No existing todo lists found, creating new one');
          console.log('[DEBUG] Attempting to create todo list with data:', {
            userId: this.userId,
            type: "todolist"
          });

          const newList = await createTodoList({
            userId: this.userId,
            type: "todolist",
            items: []
          });

          if (!newList) {
            console.error('[DEBUG] Create todo list returned null/undefined');
            throw new Error('Failed to create todo list: empty response');
          }
          console.log('[DEBUG] Successfully created new todo list:', newList);
          this.lists = [newList];
        } catch (createError) {
          console.log('[DEBUG] Error creating todo list:', createError.response?.data);
          if (createError.response?.data?.message === 'User already has a todo list') {
            console.log('[DEBUG] List exists error, fetching updated lists');
            // If list was created in another session, fetch again
            const updatedLists = await getTodoLists();
            const filteredLists = updatedLists.filter(list => list.type === 'todolist');
            console.log('[DEBUG] Got updated lists:', filteredLists);
            this.lists = filteredLists;
          } else {
            console.log('[DEBUG] Unknown error creating todo list:', createError);
            throw createError;
          }
        }
      } catch (error) {
        console.error("[DEBUG] Error in initUserTodoList:", error);
        this.error = "Failed to initialize todo list. Please try again.";
      } finally {
        console.log('[DEBUG] Resetting initialization lock');
        this.initializationInProgress = false;
      }
    },


    /**
     * Add a new ToDo item to the user's existing to-do list.
     */
    async addTodo() {
      this.formError = null;

      // Validate inputs
      if (!this.todoText.trim()) {
        this.formError = 'Please enter a todo title';
        return;
      }

      if (!this.todoDate) {
        this.formError = 'Please select a date';
        return;
      }

      const newItem = {
        text: this.todoText.trim(),
        description: this.todoDescription.trim(),
        date: this.todoDate,
        responsibilities: this.userId,
        completed: false
      };

      // Find the user's todolist
      const todoList = this.lists.find(list => list.type === "todolist");
      if (!todoList) {
        console.error("No to-do list found, cannot add item!");
        return;
      }

      try {
        // Add new item to the list
        const updatedItems = [...todoList.items, newItem];
        await updateTodoList(todoList._id, {
          type: "todolist",
          items: updatedItems,
          userId: this.userId
        });

        // Update local state
        todoList.items = updatedItems;
        this.todos = updatedItems;

        // Clear form
        this.todoText = "";
        this.todoDescription = "";
        this.todoDate = "";
      } catch (error) {
        console.error("Error adding new item:", error);
      }
    },

    /**
     * Remove a to-do from the user's local array & DB.
     */
    async removeTodo(index) {
      try {
        console.log('[DEBUG] Removing todo item at index:', index);
        const todoList = this.lists.find(list => list.type === "todolist");
        if (!todoList) {
          console.log('[DEBUG] No todo list found');
          return;
        }

        // Remove item from array
        const updatedItems = [...todoList.items];
        updatedItems.splice(index, 1);
        console.log('[DEBUG] Updated items after removal:', updatedItems);

        // Update the list in the backend
        await updateTodoList(todoList._id, {
          type: "todolist",
          items: updatedItems,
          userId: this.userId
        });

        // Update local state
        todoList.items = updatedItems;
        this.todos = updatedItems;
        console.log('[DEBUG] Local state updated after removal');
      } catch (error) {
        console.error("[DEBUG] Error removing item:", error);
        this.error = "Failed to remove todo item. Please try again.";
      }
    },

    /**
     * Update a todo item's completion status
     */
    async updateTodo({ index, completed }) {
      try {
        const todoList = this.lists.find(list => list.type === "todolist");
        if (!todoList) return;

        // Update the item in the list
        const updatedItems = [...todoList.items];
        updatedItems[index] = {
          ...updatedItems[index],
          completed
        };

        // Update in backend
        await updateTodoList(todoList._id, {
          type: "todolist",
          items: updatedItems,
          userId: this.userId
        });

        // Update local state
        todoList.items = updatedItems;
        this.todos = updatedItems;
      } catch (error) {
        console.error("Error updating todo item:", error);
      }
    },

    setMinimumDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentDate = `${yyyy}-${mm}-${dd}`;

      document.querySelectorAll('input[type="date"]').forEach(input => {
        input.setAttribute("min", currentDate);
      });
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

    async updateTodoCompletion({ index, completed }) {
      try {
        const todoList = this.lists.find(list => list.type === "todolist");
        if (!todoList) return;

        // Update the item in the list
        const updatedItems = [...todoList.items];
        updatedItems[index] = {
          ...updatedItems[index],
          completed
        };

        // Update in backend
        await updateTodoList(todoList._id, {
          type: "todolist",
          items: updatedItems,
          userId: this.userId
        });

        // Update local state
        todoList.items = updatedItems;
        this.todos = updatedItems;
      } catch (error) {
        console.error("Error updating todo completion:", error);
        this.error = "Failed to update todo status. Please try again.";
      }
    },

    async loadTodos() {
      this.loading = true;
      try {
        if (!this.userId) {
          console.warn('No authenticated user found.');
          return;
        }
        const lists = await getTodoLists();
        this.lists = lists;
      } catch (error) {
        console.error('Error fetching todos:', error);
      } finally {
        this.loading = false;
      }
    },

    async createTodo() {
      if (!this.userId) {
        console.warn('No authenticated user found in ToDoView.');
        return;
      }
      const newTodo = {
        userId: this.userId,
        type: 'todolist',
        items: [{
          text: "New Task",
          description: "Task description",
          date: new Date(),
          responsibilities: this.userId,
        }],
        createdAt: new Date()
      };
      await createTodoList(newTodo);
      this.loadTodos();
    }
  },
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
  font-size: 2em;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form-content.loading {
  opacity: 0.7;
  pointer-events: none;
}

.form-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9em;
}

.form-group input.invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.form-group input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}

.form-group input.invalid:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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
