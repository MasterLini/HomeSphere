<template>
  <div class="shoppinglist-view">
    <div class="page-header">
      <h1>Einkaufsliste</h1>
      <p class="subtitle">Befüllen Sie die Einkaufliste nach Ihrer Wahl</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-overlay">
      <span class="loading-spinner">🔄</span>
      <p>Loading...</p>
    </div>

    <div v-if="formError" class="form-error">
      {{ formError }}
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
            :class="{ 'invalid': formError && !productName.trim() }"
            required
            @focus="formError = null"
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
        <button type="submit" class="btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner">🔄</span>
          <span v-else class="icon">✨</span>
          {{ loading ? 'Wird hinzugefügt...' : 'Hinzufügen' }}
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
          <tr v-for="(item, index) in data" :key="item.id || index">
            <td @click="activateEditMode(item, 'productName')" v-show="!(editField === 'productName' && item.inEditMode)">
              {{ item.productName }}
            </td>
            <td v-show="editField === 'productName' && item.inEditMode">
              <input 
                type="text" 
                v-model="item.productName" 
                :placeholder="item.productName"
                @keyup.enter="deactivateEditMode"
              >
            </td>
            <td @click="activateEditMode(item, 'quantity')" v-show="!(editField === 'quantity' && item.inEditMode)">
              {{ item.quantity }}
            </td>
            <td v-show="editField === 'quantity' && item.inEditMode">
              <input 
                type="number" 
                max="9999" 
                min="1" 
                step="0.01" 
                v-model="item.quantity" 
                :placeholder="item.quantity"
                @keyup.enter="deactivateEditMode"
              >
            </td>
            <td @click="activateEditMode(item, 'unit')" v-show="!(editField === 'unit' && item.inEditMode)">
              {{ unitOptions[item.unit] }}
            </td>
            <td v-show="editField === 'unit' && item.inEditMode">
              <select 
                v-model="item.unit" 
                class="list-input"
                @change="deactivateEditMode"
              >
                <option v-for="(label, value) in unitOptions" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
            </td>
            <td>
              <button 
                @click="removeItem(index)" 
                class="btn btn-danger"
                :disabled="loading"
              >
                {{ loading ? '...' : 'Löschen' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ShoppingListItem from '@/components/ShoppingListItem.vue';
import { getUserInfo } from '@/api/user';
import {
  getShoppingLists,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem
} from '@/api/shopping';

export default {
  name: "shoppinglist",
  components: {
    ShoppingListItem
  },
  data() {
    return {
      // Form data
      productName: "", 
      quantity: 1,
      unit: "amount",

      // List data
      data: [],
      currentList: null,

      // Edit state
      editField: "",
      editingItem: null,

      // Options
      unitOptions: {
        amount: "Stück (St.)",
        litre: "Liter (L)",
        kilogram: "Kilogramm (kg)",
        package: "Packung"
      },

      // State
      loading: false,
      error: null,
      formError: null,
      initialized: false,
      userId: null
    };
  },

  async mounted() {
    try {
      this.loading = true;
      console.log('[DEBUG] Initializing shopping list view');

      // Get authenticated user info
      const data = await getUserInfo();
      this.userId = data._id;

      // Initialize shopping list
      await this.initializeShoppingList();
    } catch (error) {
      console.error('[DEBUG] Error initializing shopping list view:', error);
      this.error = 'Failed to initialize shopping list. Please try again.';
    } finally {
      this.loading = false;
    }

    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    handleClickOutside(event) {
      if (!event.target.closest('.form-group')) {
        this.deactivateEditMode();
      }
    },

    async initializeShoppingList() {
      try {
        console.log('[DEBUG] Initializing shopping list');
        const lists = await getShoppingLists();

        // Find or create shopping list
        let shoppingList = lists.find(list => list.type === 'shoppinglist');

        if (!shoppingList) {
          console.log('[DEBUG] No shopping list found, creating new one');
          shoppingList = await createShoppingList({
            userId: this.userId,
            type: 'shoppinglist',
            items: []
          });
        }

        this.currentList = shoppingList;
        this.data = shoppingList.items || [];
        this.initialized = true;
        console.log('[DEBUG] Shopping list initialized:', this.currentList._id);
      } catch (error) {
        console.error('[DEBUG] Error initializing shopping list:', error);
        this.error = 'Failed to initialize shopping list';
        throw error;
      }
    },

    async addItem() {
      if (!this.productName.trim()) {
        this.formError = 'Please enter a product name';
        return;
      }

      try {
        this.loading = true;
        this.formError = null;

        const newItem = {
          productName: this.productName.trim(),
          quantity: this.quantity,
          unit: this.unit,
          inEditMode: false
        };

        const updatedList = await addShoppingItem(this.currentList._id, newItem);
        this.data = updatedList.items;

        // Reset form
        this.productName = '';
        this.quantity = 1;
        this.unit = 'amount';
      } catch (error) {
        console.error('[DEBUG] Error adding item:', error);
        this.formError = 'Failed to add item';
      } finally {
        this.loading = false;
      }
    },

    async removeItem(index) {
      try {
        this.loading = true;
        const item = this.data[index];
        console.log('[DEBUG] Removing item:', item);

        const updatedList = await deleteShoppingItem(
          this.currentList._id,
          item.id
        );

        this.data = updatedList.items;
      } catch (error) {
        console.error('[DEBUG] Error removing item:', error);
        this.error = 'Failed to remove item';
      } finally {
        this.loading = false;
      }
    },

    activateEditMode(item, field) {
      this.data.forEach((entry) => {
        entry.inEditMode = false;
      });

      item.inEditMode = true;
      this.editField = field;
      this.editingItem = item;
    },

    async deactivateEditMode() {
      if (this.editingItem) {
        await this.updateEditedItem();
      }
      this.data.forEach((entry) => {
        entry.inEditMode = false;
      });
      this.editField = '';
      this.editingItem = null;
    },

    async updateEditedItem() {
      if (this.editingItem) {
        try {
          this.loading = true;
          console.log('[DEBUG] Updating item:', this.editingItem);

          const updatedList = await updateShoppingItem(
            this.currentList._id,
            this.editingItem.id,
            this.editingItem
          );

          this.data = updatedList.items;
          this.editingItem = null;
          this.editField = '';
        } catch (error) {
          console.error('[DEBUG] Error updating item:', error);
          this.error = 'Failed to update item';
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>

<style scoped>
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

.form-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9em;
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

.list-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

.list-input.invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.list-input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}

.list-input.invalid:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-inline {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4fd1c5;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover {
  background-color: #38b2ac;
}

.btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #ef4444;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.shoppinglist-table {
  margin-top: 2rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  background-color: #f9fafb;
  font-weight: 600;
}

.table tr:hover {
  background-color: #f9fafb;
}

.table input,
.table select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.table input:focus,
.table select:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}
</style>
