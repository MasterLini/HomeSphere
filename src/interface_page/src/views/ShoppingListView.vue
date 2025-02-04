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
            min="1"
            max="9999"
            step="0.01"
            class="list-input"
          />
        </div>
        <div class="form-group">
          <select 
            v-model="unit"            
            class="list-input">
            <option value="amount">Stück (St.)</option>
            <option value="litre">Liter (L)</option>
            <option value="kilogram">Kilogramm (kg)</option>
            <option value="package">Packung</option>
          </select>
        </div>
        <button type="submit" class="btn">
          <span class="icon">✨</span>
          Hinzufügen
        </button>
      </form>
    </div>  
    <div class="shoppinglist-table" v-show="data.length > 0">
      <table class="table">
        <tbody>
          <tr>
            <th>Produkt</th>
            <th>Menge</th>
            <th>Einheit</th>
            <th>Aktionen</th>
          </tr>
          <tr v-for="(item, index) in data" :key="index">
            <td @click="activateEditMode(item, 'productName')" v-show="!(editField === 'productName' && item.inEditMode)">
              {{ item.productName }}
            </td>
            <td v-show="editField === 'productName' && item.inEditMode">
              <input type="text" v-model="item.productName" v-bind:placeholder="item.productName">
            </td>
            <td @click="activateEditMode(item, 'quantity')" v-show="!(editField === 'quantity' && item.inEditMode)">
              {{ item.quantity }}
            </td>
            <td v-show="editField === 'quantity' && item.inEditMode">
              <input type="number" max="9999" min="1" step="0.01" v-model="item.quantity" v-bind:placeholder="item.quantity">
            </td>
            <td @click="activateEditMode(item, 'unit')" v-show="!(editField === 'unit' && item.inEditMode)">
              {{ unitOptions[item.unit] }}
            </td>
            <td v-show="editField === 'unit' && item.inEditMode">
              <select v-model="item.unit" class="list-input">
                <option v-for="(label, value) in unitOptions" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
            </td>

            <td>
              <button @click="removeItem(index)" class="btn btn-danger">Löschen</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ShoppingListItem from '@/components/ShoppingListItem.vue';
import axios from 'axios';
const backendUrl = `http://${process.env.VUE_APP_SERVER_IP}:${process.env.VUE_APP_SERVER_PORT}`;

export default {
  name: "shoppinglist",
  components: {
    ShoppingListItem
  },
  data() {
    return {
      productName: "", 
      quantity: 1,
      unit: "amount",
      data: [],
      editField: "",
      unitOptions: {
      amount: "Stück (St.)",
      litre: "Liter (L)",
      kilogram: "Kilogramm (kg)",
      package: "Packung"
    }
    };
  },
  mounted() {
    // Event listener für Klicks auf das Dokument hinzufügen
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    // Event listener entfernen, wenn die Komponente zerstört wird
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    addItem() {
      if (this.productName.trim() !== "") {
        this.data.push({ productName: this.productName, quantity: this.quantity, unit: this.unit, inEditMode: false });
        this.productName = "";
        this.unit = "amount";
        this.quantity = 1;
        console.log(this.data)
      }
    },
    removeItem(index) {
      this.data.splice(index, 1);
    },
    activateEditMode(item, field) {
      this.data.forEach((entry) => {
        entry.inEditMode = false;
      });

      item.inEditMode = true;
      this.editField = field;
    },
    deactivateEditMode() {
      this.data.forEach((entry) => {
        entry.inEditMode = false;
      });
      this.editField = "";
    },
    handleClickOutside(event) {
      const editFields = document.querySelectorAll('.list-input, td');
      let clickedInside = false;

      editFields.forEach(field => {
        if (field.contains(event.target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        this.deactivateEditMode();
        console.log(this.data)
      }
    },
    async fetchData() {
      try {
        const response = await axios.get(backendUrl);
        this.data = response.data;
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

.table {
  width: 100%;
  display: table;
  border-collapse: collapse;
  margin-top: 1rem;
  border-spacing: 0;
}
.table th, .table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.table th {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>
