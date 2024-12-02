<template>
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
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
      </div>
      <button class="btn btn-danger btn-sm" @click="remove">Löschen</button>
    </li>
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
  .text-decoration-line-through {
    text-decoration: line-through;
  }
  </style>
  