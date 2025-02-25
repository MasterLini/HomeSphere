<template>
  <div class="shoppinglist-view">
    <div class="page-header">
      <h1>Einkaufsliste</h1>
      <p class="subtitle">Befüllen Sie die Einkaufsliste nach Ihrer Wahl</p>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="formError" class="form-error">{{ formError }}</div>
    <div v-if="loading" class="loading-overlay">
      <span class="loading-spinner">🔄</span>
      <p>Loading...</p>
    </div>

    <!-- Add Item Form -->
    <div class="card list-form">
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
        <!-- If user is in a family, let them choose item type -->
        <div class="form-group" v-if="inFamily">
          <label class="radio-label">
            <input type="radio" value="private" v-model="itemType" />
            Privat
          </label>
          <label class="radio-label">
            <input type="radio" value="family" v-model="itemType" />
            Familie
          </label>
        </div>
        <button type="submit" class="btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner">🔄</span>
          <span v-else class="icon">✨</span>
          {{ loading ? 'Wird hinzugefügt...' : 'Hinzufügen' }}
        </button>
      </form>
    </div>

    <!-- Items Table -->
    <div class="shoppinglist-table" v-if="data.length > 0">
      <table class="table">
        <thead>
        <tr>
          <th>Produkt</th>
          <th>Menge</th>
          <th>Einheit</th>
          <th>Aktionen</th>
          <th>Erledigt</th>
        </tr>
        </thead>
        <tbody>
        <ShoppingListItem
            v-for="(item, index) in data"
            :key="item._id || index"
            :item="item"
            :index="index"
            :unitOptions="unitOptions"
            @remove="removeItem"
            @update="updateItem"
        />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getUserInfo } from "@/api/auth";
import {
  getShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem
} from "@/api/shopping";
import ShoppingListItem from "../components/ShoppingListItem.vue";

export default {
  name: "ShoppingListView",
  components: { ShoppingListItem },
  data() {
    return {
      productName: "",
      quantity: 1,
      unit: "amount",
      // If the user is in a family, allow choosing between private and family item
      itemType: "private",
      data: [],
      unitOptions: {
        amount: "Stück (St.)",
        litre: "Liter (L)",
        kilogram: "Kilogramm (kg)",
        package: "Packung"
      },
      loading: false,
      error: null,
      formError: null,
      inFamily: false,
      userId: null
    };
  },
  async mounted() {
    try {
      this.loading = true;
      // Fetch user info
      const response = await getUserInfo();
      this.userId = response.data.user._id;
      // Determine if the user belongs to a family
      this.inFamily = !!response.data.user.family;
      await this.initializeShoppingList();
    } catch (error) {
      console.error("[DEBUG] Error initializing shopping list view:", error);
      this.error = "Failed to initialize shopping list. Please try again.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async initializeShoppingList() {
      try {
        const response = await getShoppingItems();
        this.data = response.data.items;
      } catch (error) {
        console.error("[DEBUG] Error initializing shopping list:", error);
        this.error = "Failed to initialize shopping list";
      }
    },
    async addItem() {
      if (!this.productName.trim()) {
        this.formError = "Please enter a product name";
        return;
      }
      try {
        this.loading = true;
        this.formError = null;
        const newItem = {
          productName: this.productName.trim(),
          quantity: this.quantity,
          unit: this.unit,
          // If user is in a family and chooses "family", send flag as true.
          isFamilyItem: this.inFamily ? (this.itemType === "family") : false
        };
        const response = await createShoppingItem(newItem);
        this.data.push(response.data.item);
        // Reset form fields
        this.productName = "";
        this.quantity = 1;
        this.unit = "amount";
        // Reset itemType if user is in a family
        if (this.inFamily) this.itemType = "private";
      } catch (error) {
        console.error("[DEBUG] Error adding item:", error);
        this.formError = "Failed to add item";
      } finally {
        this.loading = false;
      }
    },
    async removeItem(index) {
      try {
        this.loading = true;
        const item = this.data[index];
        await deleteShoppingItem(item._id);
        this.data.splice(index, 1);
      } catch (error) {
        console.error("[DEBUG] Error removing item:", error);
        this.error = "Failed to remove item";
      } finally {
        this.loading = false;
      }
    },
    async updateItem({ index, updatedItem }) {
      try {
        this.loading = true;
        // Replace updated item in the list
        this.data.splice(index, 1, updatedItem);
      } catch (error) {
        console.error("[DEBUG] Error updating item:", error);
        this.error = "Failed to update item";
      } finally {
        this.loading = false;
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
.page-header {
  text-align: center;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
}
.page-header h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  margin-bottom: 0.5rem;
}
.subtitle {
  color: #555;
  opacity: 0.8;
  font-size: 1rem;
  margin-bottom: 1rem;
}
.error-message, .form-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
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
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.card.list-form {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.form-group {
  flex: 1;
  min-width: 150px;
}
.list-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 1rem;
}
.radio-label {
  margin-right: 1rem;
  font-size: 0.9rem;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.table th, .table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 1rem;
}
.table th {
  background-color: #f3f4f6;
  font-weight: 600;
}
</style>
