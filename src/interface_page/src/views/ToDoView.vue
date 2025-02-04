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
        @check="updateTodoCompletion"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ToDoItem from "../components/ToDoItem.vue";
import { fetchLists, createList, deleteList } from '@/api/lists';
import { getUserInfo } from '@/api/user';

const backendUrl = `http://localhost:3000`;

export default {
  name: "todo",
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
      lists: [],
      isAscending: true,
      todoLists: [],
      loading: false,
    };
  },
  computed: {
    sortIcon() {
      return this.isAscending ? "bi bi-sort-up" : "bi bi-sort-down";
    }
  },
  created() {
    /**
     * 1) Set the baseURL so we can do relative requests like axios.get('/me').
     * 2) Register an interceptor to automatically include the token (if any).
     */
    axios.defaults.baseURL = "http://localhost:3000";

    // If you use a token-based auth (e.g. Bearer token in LocalStorage):
    axios.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem("token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
    );

    // If you prefer cookie-based sessions instead, comment out the above
    // lines and use: axios.defaults.withCredentials = true;
  },
  async mounted() {
    try {
      // Get authenticated user info using getUserInfo API helper
      const data = await getUserInfo();
      this.userId = data._id;
      console.log('Authenticated user (ToDoView):', data);

      // Ensure a todolist exists for this user
      await this.initUserTodoList();

      // Load lists from backend (the todolist should be among these)
      await this.loadTodos();

      // Extract the todolist items into the todos array.
      const todoList = this.lists.find(list => list.type === "todolist");
      this.todos = todoList ? todoList.items : [];

    } catch (err) {
      console.error('Error fetching authenticated user or todolist in ToDoView:', err);
    }
  },
  methods: {
    /**
     * Ensure the user has exactly one "todolist".
     * If none is found, create a fresh one on the backend.
     */
    async initUserTodoList() {
      try {
        // 1. Check if the user already has a todolist
        const response = await axios.get(
            `${backendUrl}/lists?userId=${this.userId}&type=todolist`
        );

        this.lists = response.data; // This should be an array of lists

        // 2. If there's no existing to-do list, create one
        if (!this.lists || this.lists.length === 0) {
          const createResponse = await axios.post(`${backendUrl}/lists`, {
            userId: this.userId,
            type: "todolist",
            items: []
          });
          console.log("Created a new to-do list:", createResponse.data);

          // Now fetch again to refresh this.lists
          const secondFetch = await axios.get(
              `${backendUrl}/lists?userId=${this.userId}&type=todolist`
          );
          this.lists = secondFetch.data;
        }
      } catch (error) {
        console.error("Error in initUserTodoList:", error);
      }
    },

    /**
     * After we have the user's lists, pick out the 'todolist' and sync to `this.todos`.
     */
    loadTodoItemsFromLists() {
      const todoList = this.lists.find(list => list.type === "todolist");
      this.todos = todoList ? todoList.items : [];
    },

    /**
     * Add a new ToDo item to the user's existing to-do list.
     */
    async addTodo() {
      if (!this.todoText.trim()) return; // basic validation

      const newItem = {
        text: this.todoText,
        description: this.todoDescription,
        date: this.todoDate
        // responsibilities: (handled by backend if needed)
      };

      // 1. Find the user's todolist in this.lists (we ensured it exists in initUserTodoList)
      const todoList = this.lists.find(list => list.type === "todolist");
      if (!todoList) {
        console.error("No to-do list found, cannot add item!");
        return;
      }

      try {
        // 2. Update the list's items array in memory
        todoList.items.push(newItem);

        // 3. Send a PATCH request with the updated items
        const patchResponse = await axios.patch(`${backendUrl}/lists/${todoList._id}`, {
          type: "todolist",
          items: todoList.items,
          userId: this.userId
        });
        console.log("Updated existing list:", patchResponse.data);

        // 4. Refresh local state
        this.todoText = "";
        this.todoDescription = "";
        this.todoDate = "";
        // Re-load from server or just trust the local state:
        //    EITHER do a fresh fetch...
        //       await this.initUserTodoList();
        //       this.loadTodoItemsFromLists();
        //    OR trust the local changes:
        this.todos = todoList.items;
      } catch (error) {
        console.error("Error adding new item:", error);
      }
    },

    /**
     * Remove a to-do from the user's local array & DB.
     */
    async removeTodo(index) {
      try {
        const todoList = this.lists.find(list => list.type === "todolist");
        if (!todoList) return;

        // Identify the item's id
        const itemId = todoList.items[index].id;

        // PATCH the list or use DELETE to remove that item
        const updatedItems = todoList.items.filter(item => item.id !== itemId);

        const deleteResponse = await axios.delete(`${backendUrl}/lists/${todoList._id}`, {
          data: { itemId } // must be in request body for this route
        });
        console.log("Deleted item:", deleteResponse.data);

        // Update local arrays
        todoList.items = updatedItems;
        this.todos = updatedItems;
      } catch (error) {
        console.error("Error removing item:", error);
      }
    },

    /**
     * Example method to mark an item completed, etc.
     * (You'd just patch the list with the updated item).
     */
    updateTodo({ index, completed }) {
      this.todos[index].completed = completed;
      // Then call the PATCH route with the updated items as above
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

    async loadTodos() {
      this.loading = true;
      try {
        // Use the real userId obtained from /users/me once available.
        if (!this.userId) {
          console.warn('No authenticated user found.');
          return;
        }
        const lists = await fetchLists({ userId: this.userId, type: 'todolist' });
        this.lists = lists; // store fetched lists here for addTodo() to use
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
      await createList(newTodo);
      this.loadTodos();
    },

    async removeTodo(listId, itemId) {
      try {
        await deleteList(listId, itemId);
        this.loadTodos();
      } catch (error) {
        console.error('Error deleting todo item:', error);
      }
    }
  },
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
