<template>
  <div class="postIt" :style="{
      backgroundImage: todo.status === 'completed'
        ? 'url(/postit-green.svg)'
        : 'url(' + randomSvg + ')'
    }">
    <div class="content">
      <input
          type="checkbox"
          :checked="todo.status === 'completed'"
          class="me-2"
          @change="toggleCompleted"
      />
      <br />
      <!-- Update on blur -->
      <span
          contenteditable="true"
          @blur="updateTodoText"
          :class="{ 'completed': todo.status === 'completed' }"
      >
        {{ todo.title }}
      </span>
      <br />
      <span :class="{ 'completed': todo.status === 'completed' }">
        {{ todo.description }}
      </span>
      <br />
      <span :class="{ 'completed': todo.status === 'completed' }">
        {{ formatDate(todo.dueDate) }}
      </span>
      <br />
      <button class="btn btn-danger btn-sm" @click="remove">&#128465;</button>
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
  data() {
    return {
      svgVariants: [
        '/postit-pink.svg',
        '/postit-yellow.svg',
        '/postit-red.svg'
      ],
      randomSvg: ''
    };
  },
  mounted() {
    this.randomSvg = this.svgVariants[Math.floor(Math.random() * this.svgVariants.length)];
  },
  methods: {
    remove() {
      this.$emit("remove", this.index);
    },
    toggleCompleted() {
      const newStatus = this.todo.status === 'completed' ? 'pending' : 'completed';
      this.$emit("check", {
        id: this.todo._id,
        completed: newStatus === 'completed'
      });
    },
    updateTodoText(event) {
      const updatedText = event.target.textContent.trim();
      this.$emit("update", { id: this.todo._id, updates: { title: updatedText } });
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString();
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
    /*background-image: url('../assets/postit.svg');*/
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
    max-height: 3rem;
    overflow-y: hidden;
    display: inline-block;
    margin-bottom: 0.5rem;
    line-height: 1.5rem;
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
  height: 2.5rem;
  width: 2.5rem;
  font-size: 1.5rem;
  border: none;
  background-color: #e74c3c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.content button:hover {
  background-color: #c0392b; 
}

span {
  border: none;
}
  </style>
  