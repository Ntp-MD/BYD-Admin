<script setup lang="ts">
import type { CarData } from "~/types/car";
import { useCarCard } from "~/composables/useCarCard";

interface Props {
  car: CarData;
  editMode?: boolean;
  draggable?: boolean;
  index?: number;
  isDragging?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  duplicate: [car: CarData];
  update: [carId: string, field: keyof CarData, value: string | number];
  updateInstallmentRate: [carId: string, detailIndex: number, rateIndex: number, value: string];
  addInstallmentDetail: [carId: string, percent: number];
  removeInstallmentDetail: [carId: string, detailIndex: number];
  delete: [carId: string];
  dragstart: [car: CarData, index: number, event: DragEvent];
  dragover: [event: DragEvent];
  drop: [car: CarData, index: number, event: DragEvent];
  dragend: [];
}>();

const {
  editingField,
  editingDetailIndex,
  editingRateIndex,
  tempValue,
  showAddInstallment,
  newInstallmentPercent,
  startEdit,
  saveEdit,
  cancelEdit,
  addInstallmentDetail,
  removeInstallmentDetail,
} = useCarCard();
</script>

<template>
  <div
    class="card car-card"
    :class="{ 'car-card--dragging': props.isDragging }"
    :draggable="props.draggable && props.editMode"
    @dragstart="emit('dragstart', props.car, props.index || 0, $event)"
    @dragover="emit('dragover', $event)"
    @drop="emit('drop', props.car, props.index || 0, $event)"
    @dragend="emit('dragend')"
  >
    <div v-if="editMode" class="car-card__actions">
      <button @click="$emit('duplicate', props.car)" class="accent-primary">Duplicate</button>
      <button @click="$emit('delete', props.car.carId)" class="accent-danger">Delete</button>
    </div>

    <div class="car-card__image">
      <div v-if="editMode && editingField === 'carImageUrl'" class="car-card__image-edit">
        <div class="car-card__url-input-container">
          <label class="car-card__url-label">Image URL:</label>
          <input
            v-model="tempValue"
            @blur="saveEdit(props.car.carId, 'carImageUrl', emit)"
            @keyup.enter="saveEdit(props.car.carId, 'carImageUrl', emit)"
            @keyup.esc="cancelEdit"
            class="car-card__input car-card__input--url"
            placeholder="Paste new image URL here..."
            ref="imageUrlInput"
          />
          <div class="car-card__url-hint">Press Enter to save, Esc to cancel</div>
        </div>
      </div>
      <div v-else-if="editMode" class="car-card__image-edit-mode">
        <img :src="props.car.carImageUrl" :alt="props.car.carName1 + ' ' + props.car.carName2" loading="lazy" class="car-card__image-preview" />
        <div class="car-card__url-overlay">
          <button @click="startEdit('carImageUrl', props.car.carImageUrl)" class="accent-primary">📝 Edit URL</button>
        </div>
      </div>
      <img v-else :src="props.car.carImageUrl" :alt="props.car.carName1 + ' ' + props.car.carName2" loading="lazy" class="car-card__image-normal" />
    </div>
    <div class="car-card__body">
      <div class="car-card__logo">
        <div v-if="editMode && editingField === 'carLogoUrl'" class="car-card__logo-edit">
          <div class="car-card__logo-input-container">
            <label class="car-card__logo-label">Logo URL:</label>
            <input
              v-model="tempValue"
              @blur="saveEdit(props.car.carId, 'carLogoUrl', emit)"
              @keyup.enter="saveEdit(props.car.carId, 'carLogoUrl', emit)"
              @keyup.esc="cancelEdit"
              class="car-card__input car-card__input--logo"
              placeholder="Paste new logo URL here..."
              ref="logoUrlInput"
            />
            <div class="car-card__logo-hint">Press Enter to save, Esc to cancel</div>
          </div>
        </div>
        <div v-else-if="editMode" class="car-card__logo-edit-mode">
          <img :src="props.car.carLogoUrl.trim()" alt="Brand Logo" class="car-card__logo-preview" />
          <div class="car-card__logo-overlay">
            <button @click="startEdit('carLogoUrl', props.car.carLogoUrl.trim())" class="accent-primary">📝 Edit Logo</button>
          </div>
        </div>
        <img v-else :src="props.car.carLogoUrl.trim()" alt="Brand Logo" class="car-card__logo-normal" />
      </div>

      <div class="car-card__name-section">
        <h5 v-if="!editMode || editingField !== 'carName1'" class="car-card__name1" @click="editMode && startEdit('carName1', props.car.carName1)">
          {{ props.car.carName1 }}
        </h5>
        <input
          v-else
          v-model="tempValue"
          @blur="saveEdit(props.car.carId, 'carName1', emit)"
          @keyup.enter="saveEdit(props.car.carId, 'carName1', emit)"
          @keyup.esc="cancelEdit"
          class="car-card__input"
          ref="editInput"
        />

        <span v-if="!editMode || editingField !== 'carName2'" class="car-card__name2" @click="editMode && startEdit('carName2', props.car.carName2)">
          {{ props.car.carName2 }}
        </span>
        <input
          v-else
          v-model="tempValue"
          @blur="saveEdit(props.car.carId, 'carName2', emit)"
          @keyup.enter="saveEdit(props.car.carId, 'carName2', emit)"
          @keyup.esc="cancelEdit"
          class="car-card__input"
        />
      </div>

      <div class="car-card__price">
        <span class="car-card__price-label">Price</span>
        <span
          v-if="!editMode || editingField !== 'carPrice'"
          class="car-card__price-value"
          @click="editMode && startEdit('carPrice', props.car.carPrice)"
        >
          {{ props.car.carPriceText }}
        </span>
        <input
          v-else
          v-model="tempValue"
          @blur="saveEdit(props.car.carId, 'carPrice', emit)"
          @keyup.enter="saveEdit(props.car.carId, 'carPrice', emit)"
          @keyup.esc="cancelEdit"
          class="car-card__input car-card__input--price"
          type="number"
        />
        <span class="car-card__price-unit">THB</span>
      </div>

      <div class="car-card__installment">
        <div v-if="editMode" class="car-card__installment-controls">
          <div class="car-card__installment-header">
            <span class="car-card__installment-title">Installment Options</span>
            <div class="car-card__installment-actions">
              <button @click="showAddInstallment = true" class="accent-success">+ Add %</button>
            </div>
          </div>
          <div v-if="showAddInstallment" class="car-card__add-installment">
            <input
              v-model="newInstallmentPercent"
              type="number"
              min="5"
              max="50"
              step="5"
              class="car-card__input car-card__input--add"
              placeholder="Down % (5, 10, 15...)"
            />
            <div class="car-card__add-buttons">
              <button @click="addInstallmentDetail(props.car.carId, emit)" class="accent-success">Add</button>
              <button @click="showAddInstallment = false" class="accent-danger">Cancel</button>
            </div>
          </div>
        </div>

        <table class="car-card__table">
          <thead>
            <tr>
              <th>Down %</th>
              <th>48 mo.</th>
              <th>60 mo.</th>
              <th>72 mo.</th>
              <th>84 mo.</th>
              <th v-if="editMode" class="car-card__table-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, detailIndex) in props.car.carInstallmentDetails" :key="detail.carRatePricePercent">
              <td>{{ detail.carRatePricePercent }}%</td>
              <td v-for="(rate, rateIndex) in detail.carMonthPaid.percentPerMonth" :key="rateIndex">
                <div v-if="editMode && editingField === `installment_${detailIndex}_${rateIndex}`" class="car-card__rate-edit">
                  <input
                    v-model="tempValue"
                    @blur="saveEdit(props.car.carId, 'carInstallmentDetails', emit)"
                    @keyup.enter="saveEdit(props.car.carId, 'carInstallmentDetails', emit)"
                    @keyup.esc="cancelEdit"
                    class="car-card__input car-card__input--rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="99"
                    ref="rateInput"
                  />
                </div>
                <span v-else-if="editMode" class="car-card__rate-value" @click="startEdit('installment', rate, detailIndex, rateIndex)">
                  {{ rate }}%
                </span>
                <span v-else class="car-card__rate-normal"> {{ rate }}% </span>
              </td>
              <td v-if="editMode" class="car-card__table-actions">
                <button @click="removeInstallmentDetail(props.car.carId, detailIndex, emit)" class="accent-danger">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car-card {
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.4s ease forwards;
}

.car-card__image {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gap-md);
  min-height: 250px;
  aspect-ratio: 1;
  position: relative;
}

.car-card__image-normal {
  object-fit: contain;
  width: 100%;
}

.car-card__image-preview {
  object-fit: contain;
  width: 100%;
  opacity: 0.7;
}

.car-card__image-edit {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gap-sm);
}

.car-card__url-input-container {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.car-card__url-label {
  font-weight: 600;
}

.car-card__input--url {
  width: 100%;
  text-align: left;
}

.car-card__url-hint {
  font-size: var(--font-xs);
  color: var(--font-color2);
  text-align: center;
  font-style: italic;
}

.car-card__image-edit-mode {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-card__url-overlay {
  position: absolute;
  bottom: var(--gap-xs);
  right: var(--gap-xs);
}

.car-card__url-edit-btn {
  padding: var(--gap-xs) var(--gap-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.car-card__url-edit-btn:hover {
  transform: translateY(-1px);
}

.car-card__body {
  padding: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  flex: 1;
}

.car-card__logo {
  width: 100%;
  margin-bottom: var(--gap-xs);
  position: relative;
}

.car-card__logo img {
  max-width: 100px;
}

.car-card__logo-normal {
  width: 100%;
  height: auto;
}

.car-card__logo-preview {
  width: 100%;
  height: auto;
  opacity: 0.7;
}

.car-card__logo-edit {
  width: 100%;
  min-height: calc(var(--gap-lg) * 3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-card__logo-input-container {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.car-card__logo-label {
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--color1);
  text-align: center;
}

.car-card__input--logo {
  width: 100%;
  text-align: left;
  border-color: var(--accent-primary);
  border-width: 2px;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.car-card__logo-hint {
  font-size: var(--font-xs);
  color: var(--font-color2);
  text-align: center;
  font-style: italic;
}

.car-card__logo-edit-mode {
  position: relative;
  width: 100%;
  height: auto;
}

.car-card__logo-overlay {
  position: absolute;
  bottom: var(--gap-xs);
  right: var(--gap-xs);
}

.car-card__logo-edit-btn {
  padding: var(--gap-xs) var(--gap-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.car-card__logo-edit-btn:hover {
  transform: translateY(-1px);
}

.car-card__rate-edit {
  display: flex;
  justify-content: center;
}

.car-card__input--rate {
  width: 60px;
  text-align: center;
  border-color: var(--accent-primary);
  border-width: 2px;
  border-radius: var(--radius-xs);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.car-card__rate-value {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: var(--gap-xs) var(--gap-xs);
  border-radius: var(--radius-xs);
  display: inline-block;
  min-width: 40px;
  text-align: center;
}

.car-card__rate-value:hover {
}

.car-card__rate-normal {
  display: inline-block;
  min-width: 40px;
  text-align: center;
}

.car-card__installment-controls {
  margin-bottom: var(--gap-sm);
}

.car-card__installment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gap-xs);
}

.car-card__installment-title {
  font-weight: 600;
  color: var(--color1);
  font-size: var(--font-sm);
}

.car-card__installment-actions {
  display: flex;
  gap: var(--gap-xs);
}

.car-card__add-installment {
  background-color: var(--color3);
  border: 1px solid var(--color2);
  border-radius: var(--radius-md);
  padding: var(--gap-sm);
  margin-bottom: var(--gap-sm);
}

.car-card__input--add {
  width: 100%;
  margin-bottom: var(--gap-xs);
  border-color: var(--accent-primary);
  border-radius: var(--radius-xs);
}

.car-card__add-buttons {
  display: flex;
  gap: var(--gap-xs);
  justify-content: flex-end;
}

.car-card__btn--remove {
  padding: var(--gap-xs) var(--gap-xs);
  font-size: var(--font-xs);
}

.car-card__table-actions {
  width: 60px;
  text-align: center;
}

.car-card__name1 {
  color: var(--color1);
}

.car-card__name2 {
  color: var(--font-color2);
  font-size: var(--font-xs);
}

.car-card__price {
  display: flex;
  align-items: baseline;
  gap: var(--gap-xs);
  margin-top: var(--gap-sm);
  padding-top: var(--gap-sm);
  border-top: 1px solid var(--font-color3);
}

.car-card__price-label {
  font-size: var(--font-xs);
  color: var(--font-color2);
}

.car-card__price-value {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--accent-primary);
}

.car-card__price-unit {
  font-size: var(--font-xs);
  color: var(--font-color2);
}

.car-card__installment {
  margin-top: var(--gap-sm);
  overflow-x: auto;
}

.car-card__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-xs);
}

.car-card__table th,
.car-card__table td {
  padding: var(--gap-xs) var(--gap-sm);
  text-align: center;
  border-bottom: 1px solid var(--font-color3);
}

.car-card__table th {
  font-weight: 600;
  color: var(--color2);
}

.car-card__table td {
  color: var(--color2);
}

.car-card__actions {
  display: flex;
  gap: var(--gap-xs);
  padding: var(--gap-sm);
  border-bottom: 1px solid var(--accent-primary);
}

.car-card__name-section {
  margin-bottom: var(--gap-xs);
}

.car-card__name1,
.car-card__name2 {
  display: inline-block;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: var(--gap-xs) var(--gap-xs);
  border-radius: var(--radius-xs);
}

.car-card__name1:hover,
.car-card__name2:hover {
}

.car-card__price-value {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: var(--gap-xs) var(--gap-xs);
  border-radius: var(--radius-xs);
}

.car-card__price-value:hover {
}

.car-card__input {
  font-size: inherit;
  border-color: var(--accent-primary);
  border-radius: var(--radius-xs);
  padding: var(--gap-xs) var(--gap-sm);
  width: 100%;
}

.car-card__input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.car-card__input--price {
  font-weight: 700;
  color: var(--accent-primary);
}

/* Drag and Drop Styles */
.car-card--dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  cursor: grabbing;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  z-index: 1000;
}

.car-card[draggable="true"] {
  cursor: grab;
}

.car-card[draggable="true"]:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
</style>
