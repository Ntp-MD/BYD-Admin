<script setup lang="ts">
const { cars, totalCars, priceRange, modelGroups, searchCar } = useCarData();
const { editMode, cars: editableCars, toggleEditMode, duplicateCar, updateCar, deleteCar, saveCars, cancelEdit } = useEditMode();

const searchQuery = ref("");

const filteredCars = computed(() => {
  const carList = editMode.value ? editableCars.value : cars.value;
  if (!searchQuery.value.trim()) return carList;
  return searchCar(searchQuery.value);
});

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
      successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-success);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      font-weight: 500;
    `;
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
      cars.value = importedCars;

      // Show success message
      const successMsg = document.createElement("div");
      successMsg.textContent = `Successfully imported ${importedCars.length} cars from ${file.name}!`;
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-success);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-weight: 500;
      `;
      document.body.appendChild(successMsg);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);
    } catch (error: any) {
      console.error("Import error:", error);
      const errorMsg = document.createElement("div");
      errorMsg.textContent = `Import failed: ${error instanceof Error ? error.message : String(error)}`;
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-danger);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-weight: 500;
      `;
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
          <button @click="toggleEditMode" class="dashboard__edit-btn" :class="{ 'dashboard__edit-btn--active': editMode }">
            {{ editMode ? "Exit Edit Mode" : "Edit Mode" }}
          </button>
          <button @click="exportData" class="dashboard__export-btn">Export Data</button>
          <button @click="copyToClipboard" class="dashboard__copy-btn">Copy Script</button>
          <button @click="importData" class="dashboard__import-btn">Import Data</button>
          <button v-if="editMode" @click="saveCars" class="dashboard__save-btn">Save Changes</button>
          <button v-if="editMode" @click="cancelEdit" class="dashboard__cancel-btn">Cancel</button>
        </div>
      </div>

      <div class="dashboard__grid">
        <CarCard
          v-for="car in filteredCars"
          :key="car.carId"
          :car="car"
          :edit-mode="editMode"
          @duplicate="handleDuplicate"
          @update="handleUpdate"
          @updateInstallmentRate="handleUpdateInstallmentRate"
          @delete="handleDelete"
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
  padding: var(--gap-sm) var(--gap-md);
  font-size: var(--font-sm);
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: var(--color-white);
  transition: border-color 0.2s ease;
}

.dashboard__search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dashboard__edit-controls {
  display: flex;
  gap: var(--gap-sm);
  flex-shrink: 0;
}

.dashboard__edit-btn {
  background-color: var(--accent-btn);
  color: var(--color-white);
}

.dashboard__edit-btn--active {
  background-color: var(--accent-warning);
}

.dashboard__export-btn {
  background-color: var(--accent-reserved);
  color: var(--color-white);
}

.dashboard__copy-btn {
  background-color: var(--accent-primary);
  color: var(--color-white);
}

.dashboard__import-btn {
  background-color: var(--accent-warning);
  color: var(--color-white);
}

.dashboard__save-btn {
  background-color: var(--accent-success);
  color: var(--color-white);
}

.dashboard__cancel-btn {
  background-color: var(--accent-danger);
  color: var(--color-white);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-md);
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
