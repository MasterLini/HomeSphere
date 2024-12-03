<template>
    
      <div class="postIt">
        <input 
          type="checkbox" 
          v-model="todo.completed" 
          class="me-2"
          @change="toggleCompleted"
        />
        <span :class="{ 'text-decoration-line-through': todo.completed }">
          {{ todo.text }}
        </span>
        <br>
        <span :class="{ 'text-decoration-line-through': todo.completed }">
          {{ todo.description }}
        </span>
      <button class="btn btn-danger btn-sm" @click="remove">Löschen</button>
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
      }
    }
  };
  </script>
  
  <style>

  .postIt {
    background-image: url('../assets/postit.svg');
    height: 40vh;
    width: 40vw;
    background-repeat: no-repeat;
  }

  .text-decoration-line-through {
    text-decoration: line-through;
  }
  </style>
  