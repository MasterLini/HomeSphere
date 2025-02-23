<template>
  <div class="shoppinglist-view">
    <div class="page-header">
      <h1>Einkaufsliste</h1>
      <p class="subtitle">Befüllen Sie die Einkaufsliste nach Ihrer Wahl</p>
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
              :class="{ invalid: formError && !productName.trim() }"
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
          <select v-model="unit" class="list-input">
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
        <thead>
        <tr>
          <th>Produkt</th>
          <th>Menge</th>
          <th>Einheit</th>
          <th>Aktionen</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in data" :key="item._id || index">
          <!-- Editable cells: clicking toggles edit mode for that field -->
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
            <button class="btn btn-danger" @click="removeItem(index)" :disabled="loading">
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
import { getUserInfo } from '@/api/auth';
import {
  getShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem
} from '@/api/shopping';

export default {
  name: "shoppinglist",
  data() {
    return {
      // Form data
      productName: "",
      quantity: 1,
      unit: "amount",

      // Array of shopping items
      data: [],

      // Edit state for inline editing
      editField: "",
      editingItem: null,

      // Options for units
      unitOptions: {
        amount: "Stück (St.)",
        litre: "Liter (L)",
        kilogram: "Kilogramm (kg)",
        package: "Packung"
      },

      // General UI state
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
      const response = await getUserInfo();
      this.userId = response.data.user._id;

      // Initialize shopping list items
      await this.initializeShoppingList();
    } catch (error) {
      console.error('[DEBUG] Error initializing shopping list view:', error);
      this.error = 'Failed to initialize shopping list. Please try again.';
    } finally {
      this.loading = false;
    }

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
        const response = await getShoppingItems();
        // Expecting response.data.items to be an array of shopping items
        this.data = response.data.items;
        this.initialized = true;
        console.log('[DEBUG] Shopping list initialized');
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
          unit: this.unit
        };

        const response = await createShoppingItem(newItem);
        // Assuming the response returns { item: <newItem> }
        this.data.push(response.data.item);

        // Reset form fields
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
        await deleteShoppingItem(item._id);
        this.data.splice(index, 1);
      } catch (error) {
        console.error('[DEBUG] Error removing item:', error);
        this.error = 'Failed to remove item';
      } finally {
        this.loading = false;
      }
    },

    activateEditMode(item, field) {
      this.data.forEach(entry => {
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
      this.data.forEach(entry => {
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
          const response = await updateShoppingItem(this.editingItem._id, this.editingItem);
          // Replace the updated item in the local array
          const index = this.data.findIndex(item => item._id === this.editingItem._id);
          if (index !== -1) {
            this.data.splice(index, 1, response.data.item);
          }
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
.shoppinglist-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1rem, 4vw, 2rem);
}

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
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: 0.5rem;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  text-align: center;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.form-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  border-radius: 0.5rem;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
}

.page-header {
  text-align: center;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
}

.page-header h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-color);
  opacity: 0.8;
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.list-input {
  width: 100%;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  border: 1px solid #ccc;
  border-radius: clamp(0.25rem, 1vw, 0.5rem);
  margin-right: clamp(0.5rem, 2vw, 0.75rem);
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.list-input.invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.list-input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
}

.list-input.invalid:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 0.1875rem rgba(220, 38, 38, 0.1);
}

.form-inline {
  display: flex;
  gap: clamp(0.5rem, 2vw, 1rem);
  align-items: center;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: min(100%, 200px);
}

.btn {
  padding: clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem);
  border: none;
  border-radius: clamp(0.25rem, 1vw, 0.5rem);
  background-color: #4fd1c5;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  min-height: 2.5rem;
  white-space: nowrap;
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
  margin-top: clamp(1.5rem, 4vw, 2rem);
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.table th,
.table td {
  padding: clamp(0.5rem, 2vw, 0.75rem);
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.table th {
  background-color: #f9fafb;
  font-weight: 600;
  white-space: nowrap;
}

.table tr:hover {
  background-color: #f9fafb;
}

.table input,
.table select {
  width: 100%;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  border: 1px solid #e5e7eb;
  border-radius: clamp(0.25rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.table input:focus,
.table select:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
}

@media (max-width: 768px) {
  .form-inline {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group {
    margin-right: 0;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .shoppinglist-view {
    padding: 0.75rem;
  }

  .list-input {
    padding: 0.5rem;
  }

  .btn {
    padding: 0.5rem;
    min-height: 2.25rem;
  }
}
</style>
