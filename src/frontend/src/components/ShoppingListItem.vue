<template>
  <tr>
    <!-- Product Name with inline edit -->
    <td @click="activateEditMode('productName')" v-if="editField !== 'productName' || !item.inEditMode">
      {{ item.productName }}
    </td>
    <td v-if="editField === 'productName' && item.inEditMode">
      <input type="text" v-model="localItem.productName" @keyup.enter="deactivateEditMode" />
    </td>
    <!-- Quantity inline edit -->
    <td @click="activateEditMode('quantity')" v-if="editField !== 'quantity' || !item.inEditMode">
      {{ item.quantity }}
    </td>
    <td v-if="editField === 'quantity' && item.inEditMode">
      <input type="number" v-model="localItem.quantity" @keyup.enter="deactivateEditMode" />
    </td>
    <!-- Unit inline edit -->
    <td @click="activateEditMode('unit')" v-if="editField !== 'unit' || !item.inEditMode">
      {{ unitOptions[item.unit] }}
    </td>
    <td v-if="editField === 'unit' && item.inEditMode">
      <select v-model="localItem.unit" @change="deactivateEditMode">
        <option v-for="(label, value) in unitOptions" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </td>
    <!-- Actions -->
    <td>
      <button class="btn btn-danger" @click="remove">Löschen</button>
    </td>
    <td>
      <input
          type="checkbox"
          :checked="item.isChecked"
          @change="toggleChecked($event)"
      />
    </td>
  </tr>
</template>

<script>
import { updateShoppingItem } from '@/api/shopping';

export default {
  name: "ShoppingItemRow",
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    unitOptions: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localItem: { ...this.item, inEditMode: false },
      editField: ""
    };
  },
  watch: {
    item(newVal) {
      this.localItem = { ...newVal, inEditMode: newVal.inEditMode || false };
    }
  },
  methods: {
    remove() {
      this.$emit("remove", this.index);
    },
    activateEditMode(field) {
      this.editField = field;
      // Direct assignment works in Vue 3
      this.item.inEditMode = true;
    },
    async deactivateEditMode() {
      // Update the item if any of the editable fields have changed
      if (this.localItem.productName !== this.item.productName ||
          this.localItem.quantity !== this.item.quantity ||
          this.localItem.unit !== this.item.unit) {
        try {
          const response = await updateShoppingItem(this.item._id, this.localItem);
          this.$emit("update", { index: this.index, updatedItem: response.data.item });
        } catch (error) {
          console.error("Error updating shopping item:", error);
        }
      }
      this.editField = "";
      this.item.inEditMode = false;
    },
    async toggleChecked(event) {
      // Toggle the isChecked flag based on the checkbox state
      const checked = event.target.checked;
      try {
        const response = await updateShoppingItem(this.item._id, { isChecked: checked });
        // Emit the updated item to update the parent list
        this.$emit("update", { index: this.index, updatedItem: response.data.item });
      } catch (error) {
        console.error("Error updating checked status:", error);
      }
    }
  }
};
</script>

<style scoped>
/* Basic styling for inline editing and checkbox */
input, select {
  padding: 0.4rem;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}
.btn {
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
  border-radius: 3px;
}
</style>
