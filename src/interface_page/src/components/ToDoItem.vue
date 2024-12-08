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
  height: 40vh; /* Fixe Höhe */
  width: 40vw; /* Fixe Breite */
  background-repeat: no-repeat;
  background-size: contain; /* Hintergrundbild bleibt proportional */
  background-position: center; /* Bild wird zentriert */
  display: flex;
  justify-content: center; /* Zentriert den Inhalt horizontal */
  align-items: center; /* Zentriert den Inhalt vertikal */
}

.content {
  width: 80%; /* Begrenzt die Breite des Inhalts */
  text-align: center; /* Zentriert den Text */
  max-width: 38vw;
}

.content span:nth-of-type(1) {
  font-family: "Yuji Mai", serif; /* Spezielle Schriftart nur für die Überschrift */
  font-size: 1.5rem; /* Größere Schrift für die Überschrift */
  display: block;
  margin-bottom: 0.5rem; /* Abstand zum nächsten Element */
}

.content span:nth-of-type(2) {
  font-size: 1rem; /* Standardgröße für Beschreibung */
  display: block;
  margin-bottom: 1rem; /* Abstand zum Button */
}

.content input[type="checkbox"] {
  margin-right: 0.5rem; /* Abstand rechts vom Checkbox */
}

.content button {
  margin-top: 1rem; /* Abstand oberhalb des Buttons */
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  background-color: #e74c3c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.content button:hover {
  background-color: #c0392b; /* Farbe bei Hover ändern */
}

  </style>
  