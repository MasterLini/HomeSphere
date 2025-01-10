<template>
  <div class="table">
    <div class="table-row table-header">
      <div class="table-cell">Auswahl</div>
      <div class="table-cell">Produktname</div>
      <div class="table-cell">Menge</div>
      <div class="table-cell">Aktionen</div>
    </div>

    <div class="table-row">
      <div class="table-cell">
        <input 
          type="checkbox" 
          v-model="list.completed" 
          @change="toggleCompleted"
        />
      </div>
      <div class="table-cell">
        <span :class="{ 'completed': list.completed }">
          {{ list.productName }}
        </span>
      </div>
      <div class="table-cell">
        <span :class="{ 'completed': list.completed }">
          {{ list.quantity }}
        </span>
      </div>
      <div class="table-cell">
        <button class="btn btn-danger btn-sm" @click="remove">Löschen</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ToDoItem",
  props: {
    list: {
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
      this.$emit("update", { index: this.index, completed: this.list.completed });
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Yuji+Mai&display=swap');

/* Allgemeiner Stil */
.table {
  display: grid;
  grid-template-rows: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-header {
  background-color: #f0f0f0;
  font-weight: bold;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 3fr 2fr 1fr;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 10px;
  text-align: left;
}

.completed {
  text-decoration: line-through;
  color: gray;
}

/* Checkbox-Stil */
input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #4CAF50;
}

/* Button-Stil */
button {
  font-size: 0.8rem;
  border-radius: 3px;
  padding: 5px 10px;
}
</style>
