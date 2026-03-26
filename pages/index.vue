<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCarData } from "~/composables/useCarData";
import { useEditMode } from "~/composables/useEditMode";

const { cars, totalCars, priceRange, modelGroups, searchCar } = useCarData();
const { editMode, cars: editableCars, toggleEditMode, duplicateCar, updateCar, deleteCar, saveCars, cancelEdit } = useEditMode();

const searchQuery = ref("");

const filteredCars = computed(() => {
  const carList = editMode.value ? editableCars.value : cars.value;
  const query = searchQuery.value.toLowerCase();

  if (!query) return carList;

  return carList.filter((car: any) => {
    return (
      car.carName1.toLowerCase().includes(query) ||
      car.carName2.toLowerCase().includes(query) ||
      car.carPriceText.includes(query) ||
      car.carId.includes(query)
    );
  });
});

// Drag and drop functionality
const draggedCar = ref<any>(null);
const draggedIndex = ref<number>(-1);
const isSaving = ref<boolean>(false);

const handleDragStart = (car: any, index: number, event: DragEvent) => {
  if (!editMode.value) return;

  draggedCar.value = car;
  draggedIndex.value = index;

  // Add drag effect
  event.dataTransfer?.setData("text/plain", "");
  event.dataTransfer?.setDragImage?.(event.target as Element, 0, 0);
};

const handleDragOver = (event: DragEvent) => {
  if (!editMode.value) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};

const handleDrop = (targetCar: any, targetIndex: number, event: DragEvent) => {
  if (!editMode.value || !draggedCar.value) return;

  event.preventDefault();

  const sourceIndex = draggedIndex.value;
  const targetIdx = targetIndex;

  if (sourceIndex === targetIdx) return;

  // Reorder the cars array
  const newCars = [...editableCars.value];
  const [movedCar] = newCars.splice(sourceIndex, 1);
  newCars.splice(targetIdx, 0, movedCar);

  editableCars.value = newCars;

  // Reset drag state
  draggedCar.value = null;
  draggedIndex.value = -1;
};

const handleDragEnd = () => {
  console.log("handleDragEnd called");
  draggedCar.value = null;
  draggedIndex.value = -1;
};

const handleToggleEditMode = () => {
  console.log("handleToggleEditMode called, editMode:", editMode.value);
  if (editMode.value) {
    // If exiting edit mode, discard all changes
    cancelEdit();
    return;
  }
  toggleEditMode();
};

const handleSaveChanges = async () => {
  if (!editMode.value) return;

  isSaving.value = true;
  try {
    console.log("Saving changes...");
    await saveCars();
    console.log("Save completed");
    // Exit edit mode after successful save
    toggleEditMode();
  } catch (error) {
    console.error("Save failed:", error);
    alert("Failed to save changes. Please try again.");
  } finally {
    isSaving.value = false;
  }
};

const totalModels = computed(() => Object.keys(modelGroups.value).length);

const handleDuplicate = (car: any) => {
  duplicateCar(car);
};

const handleUpdate = (carId: string, field: string, value: string | number) => {
  updateCar(carId, field, value);
};

const handleUpdateInstallmentRate = (carId: string, detailIndex: number, rateIndex: number, value: string) => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
    updateCar(carId, `installmentRate_${detailIndex}_${rateIndex}`, numValue);
  }
};

const handleDelete = (carId: string) => {
  if (confirm("Are you sure you want to delete this car?")) {
    deleteCar(carId);
  }
};

const exportData = () => {
  const carList = editMode.value ? editableCars.value : cars.value;

  // Generate the car data array as a string
  const carDataArrayString = carList
    .map((car: any, index: number) => {
      const comma = index < carList.length - 1 ? "," : "";
      return `      //${car.carName1} ${car.carName2}
      {
        carId: "${car.carId}",
        carImageUrl: "${car.carImageUrl}",
        carLogoUrl: "${car.carLogoUrl}",
        carName1: "${car.carName1}",
        carName2: "${car.carName2}",
        carPriceText: "${car.carPriceText}",
        carPrice: ${car.carPrice},
        carInstallmentDetails: [${car.carInstallmentDetails
          .map((detail: any, detailIndex: number) => {
            const detailComma = detailIndex < car.carInstallmentDetails.length - 1 ? "," : "";
            return `          {
            carRatePricePercent: ${detail.carRatePricePercent},
            carMonthPaid: { percentPerMonth: [${detail.carMonthPaid.percentPerMonth.join(", ")}] },
          }${detailComma}`;
          })
          .join("\n")}
        ],
      }${comma}`;
    })
    .join("\n");

  // Generate HTML select options
  const selectOptions = carList
    .map((car: any) => {
      return `            <option value="${car.carId}">${car.carName1} ${car.carName2}</option>`;
    })
    .join("\n");

  const selectElement = `<select name="bydsuscoCar" id="bydsuscoCar" class="form-select">
${selectOptions}
          </select>`;

  const renderFunctions = `
    function renderResultInstallment(carId) {
      let car = carData.find((c) => c.carId === String(carId));
      if (!car) return;

      let installmentIndex = Number($("#InstallmentDuration").val());
      let installmentMonthIndex = [48, 60, 72, 84][Number($("#inputRageBydsusco").val())];
      let calculatedResult = car.carInstallmentDetails.find((x) => x.carRatePricePercent === installmentIndex);

      if (!calculatedResult) {
        $(".bydsusco_result_calculated_container").empty().append("<div>No data available for this selection.</div>");
        return;
      }

      let monthIndex = Number($("#inputRageBydsusco").val());
      let interestRate = calculatedResult.carMonthPaid.percentPerMonth[monthIndex] / 100 / 12;
      const carPrice = car.carPrice;
      const downPrice = Math.round((carPrice * installmentIndex) / 100);
      const excellentPrice = Math.round(carPrice - downPrice);
      const calculatedMonthlyPayment = calculateMonthlyPayment(excellentPrice, interestRate, installmentMonthIndex);

      $(".bydsusco_result_calculated_container").html(\`
        <div class="bydsusco_result_calculated_inside">
          <div class="flex_bydsusco_result"><span>เงินดาวน์</span><span>\${downPrice.toLocaleString()}</span><span>บาท</span></div>
          <div class="flex_bydsusco_result"><span>ยอดจัด</span><span>\${excellentPrice.toLocaleString()}</span><span>บาท</span></div>
          <div class="flex_bydsusco_result"><span>ผ่อนเดือนละ</span><span>\${calculatedMonthlyPayment.toLocaleString()}</span><span>บาท</span></div>
        </div>
      \`);
    }

    function calculateMonthlyPayment(excellentPrice, monthlyInterestRate, numberOfPayments) {
      const totalInterest = excellentPrice * monthlyInterestRate * numberOfPayments;
      const totalPayment = excellentPrice + totalInterest;
      return Math.round(totalPayment / numberOfPayments);
    }

    function renderCarDetails(carId) {
      let selectedCar = carData.find((c) => c.carId === String(carId));
      if (!selectedCar) return;

      $(".bydsusco_inside_left_container").html(\`
        <div class="bydsusco_result_container">
          <div class="bydsusco_result_image">
            <img src="\${selectedCar.carImageUrl}" alt="\${selectedCar.carName1}" width="100%" />
          </div>
          <div class="bydsusco_result_name1">
            <div>
              <img src="\${selectedCar.carLogoUrl}" alt="Car Logo" style="width: 100%" />
            </div>
            <div>
              <span>\${selectedCar.carName1}</span>
            </div>
          </div>
          <div class="bydsusco_result_name2">
            <span>\${selectedCar.carName2}</span>
          </div>
          <div class="bydsusco_result_price">
            <div class="bydsusco_price_text1">
              <span>ราคา</span>
            </div>
            <div class="bydsusco_price_text2">
              <span>\${selectedCar.carPriceText}</span>
            </div>
            <div class="bydsusco_price_text3">
              <span>บาท</span>
            </div>
          </div>
        </div>
      \`);
    }

    function generateSelectPercent(carId) {
      const selectedCar = carData.find((c) => c.carId === String(carId));
      if (!selectedCar) return;
      const selectedCarDetails = selectedCar.carInstallmentDetails;

      let selectResult = \`<select name="InstallmentDuration" id="InstallmentDuration" class="form-select">\`;
      selectedCarDetails.forEach((detail) => {
        selectResult += \`<option value="\${detail.carRatePricePercent}">\${detail.carRatePricePercent}%</option>\`;
      });
      selectResult += \`</select>\`;
      $(".InstallmentDurationClass").html(selectResult);
      renderResultInstallment(carId);
    }

    generateSelectPercent(1);
    renderCarDetails(1);

    $("#bydsuscoCar").on("change", function () {
      let carId = this.value;
      generateSelectPercent(carId);
      renderCarDetails(carId);
    });

    $(document).on("change", "#InstallmentDuration", function () {
      renderResultInstallment($("#bydsuscoCar").val());
    });

    $("#inputRageBydsusco")
      .on("input", function () {
        renderResultInstallment($("#bydsuscoCar").val());
      })
      .trigger("input");`;

  const dataJsContent = `$(document).ready(function () {
  let carData = [
${carDataArrayString}
  ]
${renderFunctions}
});`;

  // Create and download the file
  const blob = new Blob([dataJsContent], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Also download the HTML select element
  setTimeout(() => {
    const selectBlob = new Blob([selectElement], { type: "text/html" });
    const selectUrl = URL.createObjectURL(selectBlob);
    const selectA = document.createElement("a");
    selectA.href = selectUrl;
    selectA.download = "select-element.html";
    document.body.appendChild(selectA);
    selectA.click();
    document.body.removeChild(selectA);
    URL.revokeObjectURL(selectUrl);
  }, 500);
};

const copyToClipboard = () => {
  const carList = editMode.value ? editableCars.value : cars.value;

  // Generate the car data array as a string
  const carDataArrayString = carList
    .map((car: any, index: number) => {
      const comma = index < carList.length - 1 ? "," : "";
      return `      //${car.carName1} ${car.carName2}
      {
        carId: "${car.carId}",
        carImageUrl: "${car.carImageUrl}",
        carLogoUrl: "${car.carLogoUrl}",
        carName1: "${car.carName1}",
        carName2: "${car.carName2}",
        carPriceText: "${car.carPriceText}",
        carPrice: ${car.carPrice},
        carInstallmentDetails: [${car.carInstallmentDetails
          .map((detail: any, detailIndex: number) => {
            const detailComma = detailIndex < car.carInstallmentDetails.length - 1 ? "," : "";
            return `          {
            carRatePricePercent: ${detail.carRatePricePercent},
            carMonthPaid: { percentPerMonth: [${detail.carMonthPaid.percentPerMonth.join(", ")}] },
          }${detailComma}`;
          })
          .join("\n")}
        ],
      }${comma}`;
    })
    .join("\n");

  const renderFunctions = `
    function renderResultInstallment(carId) {
      let car = carData.find((c) => c.carId === String(carId));
      if (!car) return;

      let installmentIndex = Number($("#InstallmentDuration").val());
      let installmentMonthIndex = [48, 60, 72, 84][Number($("#inputRageBydsusco").val())];
      let calculatedResult = car.carInstallmentDetails.find((x) => x.carRatePricePercent === installmentIndex);

      if (!calculatedResult) {
        $(".bydsusco_result_calculated_container").empty().append("<div>No data available for this selection.</div>");
        return;
      }

      let monthIndex = Number($("#inputRageBydsusco").val());
      let interestRate = calculatedResult.carMonthPaid.percentPerMonth[monthIndex] / 100 / 12;
      const carPrice = car.carPrice;
      const downPrice = Math.round((carPrice * installmentIndex) / 100);
      const excellentPrice = Math.round(carPrice - downPrice);
      const calculatedMonthlyPayment = calculateMonthlyPayment(excellentPrice, interestRate, installmentMonthIndex);

      $(".bydsusco_result_calculated_container").html(\`
        <div class="bydsusco_result_calculated_inside">
          <div class="flex_bydsusco_result"><span>เงินดาวน์</span><span>\${downPrice.toLocaleString()}</span><span>บาท</span></div>
          <div class="flex_bydsusco_result"><span>ยอดจัด</span><span>\${excellentPrice.toLocaleString()}</span><span>บาท</span></div>
          <div class="flex_bydsusco_result"><span>ผ่อนเดือนละ</span><span>\${calculatedMonthlyPayment.toLocaleString()}</span><span>บาท</span></div>
        </div>
      \`);
    }

    function calculateMonthlyPayment(excellentPrice, monthlyInterestRate, numberOfPayments) {
      const totalInterest = excellentPrice * monthlyInterestRate * numberOfPayments;
      const totalPayment = excellentPrice + totalInterest;
      return Math.round(totalPayment / numberOfPayments);
    }

    function renderCarDetails(carId) {
      let selectedCar = carData.find((c) => c.carId === String(carId));
      if (!selectedCar) return;

      $(".bydsusco_inside_left_container").html(\`
        <div class="bydsusco_result_container">
          <div class="bydsusco_result_image">
            <img src="\${selectedCar.carImageUrl}" alt="\${selectedCar.carName1}" width="100%" />
          </div>
          <div class="bydsusco_result_name1">
            <div>
              <img src="\${selectedCar.carLogoUrl}" alt="Car Logo" style="width: 100%" />
            </div>
            <div>
              <span>\${selectedCar.carName1}</span>
            </div>
          </div>
          <div class="bydsusco_result_name2">
            <span>\${selectedCar.carName2}</span>
          </div>
          <div class="bydsusco_result_price">
            <div class="bydsusco_price_text1">
              <span>ราคา</span>
            </div>
            <div class="bydsusco_price_text2">
              <span>\${selectedCar.carPriceText}</span>
            </div>
            <div class="bydsusco_price_text3">
              <span>บาท</span>
            </div>
          </div>
        </div>
      \`);
    }

    function generateSelectPercent(carId) {
      const selectedCar = carData.find((c) => c.carId === String(carId));
      if (!selectedCar) return;
      const selectedCarDetails = selectedCar.carInstallmentDetails;

      let selectResult = \`<select name="InstallmentDuration" id="InstallmentDuration" class="form-select">\`;
      selectedCarDetails.forEach((detail) => {
        selectResult += \`<option value="\${detail.carRatePricePercent}">\${detail.carRatePricePercent}%</option>\`;
      });
      selectResult += \`</select>\`;
      $(".InstallmentDurationClass").html(selectResult);
      renderResultInstallment(carId);
    }

    generateSelectPercent(1);
    renderCarDetails(1);

    $("#bydsuscoCar").on("change", function () {
      let carId = this.value;
      generateSelectPercent(carId);
      renderCarDetails(carId);
    });

    $(document).on("change", "#InstallmentDuration", function () {
      renderResultInstallment($("#bydsuscoCar").val());
    });

    $("#inputRageBydsusco")
      .on("input", function () {
        renderResultInstallment($("#bydsuscoCar").val());
      })
      .trigger("input");`;

  const scriptContent = `<script>
$(document).ready(function () {
  let carData = [
${carDataArrayString}
  ]
${renderFunctions}
});
<\/script>`;

  // Copy to clipboard
  navigator.clipboard
    .writeText(scriptContent)
    .then(() => {
      // Show success message
      const successMsg = document.createElement("div");
      successMsg.textContent = "Script copied to clipboard!";
      successMsg.className = "success-message";
      document.body.appendChild(successMsg);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    });
};

const copySelectHtml = () => {
  const carList = editMode.value ? editableCars.value : cars.value;

  // Generate HTML select options
  const selectOptions = carList
    .map((car: any) => {
      return `            <option value="${car.carId}">${car.carName1} ${car.carName2}</option>`;
    })
    .join("\n");

  const selectElement = `<select name="bydsuscoCar" id="bydsuscoCar" class="form-select">
${selectOptions}
          </select>`;

  // Copy to clipboard
  navigator.clipboard
    .writeText(selectElement)
    .then(() => {
      // Show success message
      const successMsg = document.createElement("div");
      successMsg.textContent = "HTML Select copied to clipboard!";
      successMsg.className = "success-message";
      document.body.appendChild(successMsg);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy HTML Select to clipboard");
    });
};

const importData = () => {
  // Create file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".js,.txt,.html";

  fileInput.onchange = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      let importedCars: any[] = [];

      // Try to parse as JavaScript file first
      let carDataMatch = fileContent.match(/let carData\s*=\s*\[([\s\S]*?)\]/);

      if (carDataMatch) {
        // Parse JavaScript file
        const carDataString = `[${carDataMatch[1]}]`;
        importedCars = eval(carDataString);
      } else {
        // Try to parse as HTML file with script tag
        const scriptMatch = fileContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
          const scriptContent = scriptMatch[1];
          carDataMatch = scriptContent.match(/let carData\s*=\s*\[([\s\S]*?)\]/);
          if (carDataMatch) {
            const carDataString = `[${carDataMatch[1]}]`;
            importedCars = eval(carDataString);
          } else {
            throw new Error("Could not find carData array in HTML script");
          }
        } else {
          throw new Error("Could not find carData array or script tag in file");
        }
      }

      // Validate the imported data structure
      if (!Array.isArray(importedCars) || importedCars.length === 0) {
        throw new Error("Invalid car data format");
      }

      // Validate each car object
      for (const car of importedCars) {
        if (!car.carId || !car.carName1 || !car.carPrice || !Array.isArray(car.carInstallmentDetails)) {
          throw new Error(`Invalid car data for ${car.carName1 || "unknown car"}`);
        }
      }

      // Update the cars data
      if (editMode.value) {
        editableCars.value = importedCars;
      } else {
        cars.value = importedCars;
      }

      // Show success message
      const successMsg = document.createElement("div");
      successMsg.textContent = `Successfully imported ${importedCars.length} cars from ${file.name}!`;
      successMsg.className = "success-message";
      document.body.appendChild(successMsg);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);
    } catch (error: any) {
      console.error("Import error:", error);
      // Show error message
      const errorMsg = document.createElement("div");
      errorMsg.textContent = `Import error: ${error instanceof Error ? error.message : String(error)}`;
      errorMsg.className = "danger-message";
      document.body.appendChild(errorMsg);

      // Remove message after 5 seconds
      setTimeout(() => {
        if (errorMsg.parentNode) {
          errorMsg.parentNode.removeChild(errorMsg);
        }
      }, 5000);
    }
  };

  // Trigger file selection
  fileInput.click();
};
</script>

<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard__header section-header">
        <div>
          <h2>BYD Admin Dashboard</h2>
          <p>Car inventory overview and installment data</p>
        </div>
      </div>

      <DashboardStats :total-cars="totalCars" :total-models="totalModels" :price-min="priceRange.min" :price-max="priceRange.max" />

      <div class="dashboard__search-section">
        <input v-model="searchQuery" type="text" placeholder="Search by model name or price..." class="dashboard__search-input" />
        <div class="dashboard__edit-controls">
          <button
            @click="handleToggleEditMode"
            class="dashboard__edit-btn accent-base"
            :class="{ 'dashboard__edit-btn--active': editMode }"
            :disabled="isSaving"
            v-if="!editMode"
          >
            Edit Mode
          </button>
          <button @click="handleSaveChanges" class="dashboard__save-btn accent-success" :disabled="isSaving" v-if="editMode">
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </button>
          <button @click="handleToggleEditMode" class="dashboard__cancel-btn accent-danger" :disabled="isSaving" v-if="editMode">
            Exit Edit Mode
          </button>
          <button @click="exportData" class="dashboard__export-btn accent-reserved">Export Data</button>
          <button @click="copyToClipboard" class="dashboard__copy-btn accent-primary">Copy Script</button>
          <button @click="copySelectHtml" class="dashboard__copy-select-btn accent-reserved">Copy Select</button>
          <button @click="importData" class="dashboard__import-btn accent-warning">Import Data</button>
        </div>
      </div>

      <div class="dashboard__grid">
        <CarCard
          v-for="(car, index) in filteredCars"
          :key="car.carId"
          :car="car"
          :index="index"
          :edit-mode="editMode"
          :draggable="editMode"
          :is-dragging="draggedCar?.carId === car.carId"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
          @update="handleUpdate"
          @updateInstallmentRate="handleUpdateInstallmentRate"
          @dragstart="handleDragStart"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @dragend="handleDragEnd"
        />
      </div>

      <div v-if="filteredCars.length === 0" class="dashboard__empty">
        <p>No cars found matching "{{ searchQuery }}"</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  background-color: #f0f2f5;
  min-height: 100vh;
  padding: var(--gap-lg) 0;
}

.dashboard__header {
  text-align: center;
}

.dashboard__header h2 {
  color: var(--color1);
}

.dashboard__header p {
  color: var(--font-color2);
  margin: var(--gap-xs) 0 0;
}

.dashboard__search-section {
  display: flex;
  gap: var(--gap-sm);
  align-items: center;
  margin-bottom: var(--gap-lg);
  flex-wrap: wrap;
}

.dashboard__search-input {
  flex: 1;
  min-width: 300px;
}

.dashboard__edit-controls {
  display: flex;
  gap: var(--gap-sm);
  flex-shrink: 0;
}

.dashboard__edit-btn--active {
  background-color: var(--accent-warning);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--gap-md);
  margin-bottom: var(--gap-xl);
}

.dashboard__card--dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  cursor: grabbing !important;
}

.dashboard__card--dragging * {
  pointer-events: none;
}

.dashboard__grid[drag-over] {
  background: rgba(37, 99, 235, 0.05);
  border-radius: 8px;
}

.dashboard__empty {
  text-align: center;
  padding: var(--gap-xl);
  color: var(--font-color2);
}

@media screen and (max-width: 992px) {
  .dashboard__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}
</style>
