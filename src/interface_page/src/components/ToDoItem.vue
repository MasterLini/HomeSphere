<template>
    
      <div class="postIt">
        <div class="content">
        <input 
          type="checkbox" 
          v-model="todo.completed" 
          class="me-2"
          @change="toggleCompleted"
        />
        <span :class="{ 'completed': todo.completed}">
          {{ todo.text }}
        </span>
        <br>
        <span :class="{ 'completed': todo.completed }">
          {{ todo.description }}
        </span>
        <br>
        <span :class="{ 'completed': todo.completed }">
          {{ formatDate(todo.date) }}
        </span>
        <br>
      <button class="btn btn-danger btn-sm" @click="remove">Löschen</button>
    </div>
    </div>
    
  </template>
  
  <script>
  export default {
    name: "ToDoItem",
    props: {
      todo: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        required: true
      }
    },
    methods: {
      remove() {
        this.$emit("remove", this.index);
      },
      toggleCompleted() {
        this.$emit("update", { index: this.index, completed: this.todo.completed });
      },
      formatDate(date) {
        if (date.trim() !== "")
        {
          const [yyyy, mm, dd] = date.split("-");
          return `${dd}-${mm}-${yyyy}`;
        }
        
      }
    }
  };
  </script>
  
  <style>
@import url('https://fonts.googleapis.com/css2?family=Yuji+Mai&display=swap');

.completed {
  text-decoration: line-through;
}

.postIt {
    background-image: url('../assets/postit.svg');
    height: 40vh;
    width: 20vw;
    padding: 10px;
    margin: 0;
    overflow-y: hidden;
    box-sizing: border-box;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.content {
    text-align: center;
    padding: 10px;
    margin: 0;
    word-wrap: break-word;
    width: 100%;
    max-width: 90%;
    overflow-wrap: break-word;
}

.content span {
    word-break: break-word;
}

.content span:nth-of-type(1) {
    font-family: Arial, Helvetica, sans-serif;
    font-style: italic;
    font-size: 1.5rem;
    display: inline-block;
    margin-bottom: 0.5rem;
}

.content span:nth-of-type(2) {
    font-size: 1rem;
    display: inline-block;
    margin-bottom: 1rem;
}

.content input[type="checkbox"] {
  margin-right: 0.5rem; 
}

.content input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: none;
  box-shadow: none;
}

.content button {
  margin-top: 1rem; 
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  background-color: #e74c3c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.content button:hover {
  background-color: #c0392b; 
}

  </style>
  