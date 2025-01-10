<template>
  <div class="shoppinglist-view">
    <div class="page-header">
      <h1>Einkaufsliste</h1>
      <p class="subtitle">Befüllen Sie die Einkaufliste nach Ihrer Wahl</p>
    </div>
    <div class="card todo-form">
      <form @submit.prevent="addItem" class="form-inline">
        <div class="form-group">
          <input 
            v-model="productName" 
            type="text" 
            placeholder="Produktname eingeben..." 
            maxlength="40"
            class="list-input"
            required
      />
        </div>
        <div class="form-group">
          <input
            v-model="quantity"
            type="number"
            placeholder="Menge eingeben..."
            class="list-input"
          />
        </div>
      <button type="submit" class="btn">
          <span class="icon">✨</span>
          Hinzufügen
        </button>
      </form>
    </div>  
    </div>
</template>

<script>
import axios from 'axios';
const backendUrl = `http://${process.env.VUE_APP_SERVER_IP}:${process.env.VUE_APP_SERVER_PORT}`;

export default {
  name: "shoppinglist",
  components: {
  },
  data() {
    return {
      productName: "", 
      quantity: 1,
      data: ""
    };
  },
  mounted() {
    //this.fetchData();
    },
  methods: {
    selectElements() {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    },
    async fetchData() {
      try {
        const response = await axios.get(backendUrl);
        this.data = response.data;
        console.log(this.data)
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    },
  }
};
</script>

<style scoped>

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 1.1em;
}

.list-input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s ease;
}

.list-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
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

</style>
