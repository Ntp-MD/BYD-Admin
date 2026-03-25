import { ref, computed } from 'vue';
import { useCarData } from "~/composables/useCarData";
import { useEditMode } from "~/composables/useEditMode";

export function useDashboard() {
  const { cars, totalCars, priceRange, modelGroups, searchCar } = useCarData();
  const { editMode, cars: editableCars, toggleEditMode, duplicateCar, updateCar, deleteCar, saveCars, cancelEdit } = useEditMode();

  const searchQuery = ref("");
  const draggedCar = ref<any>(null);
  const draggedIndex = ref<number>(-1);
  const isSaving = ref<boolean>(false);

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

  // Edit mode toggle - discard changes on exit
  const handleToggleEditMode = () => {
    console.log("handleToggleEditMode called, editMode:", editMode.value);
    if (editMode.value) {
      // If exiting edit mode, discard all changes
      cancelEdit();
      return;
    }
    toggleEditMode();
  };

  const totalModels = computed(() => Object.keys(modelGroups.value).length);

  // Event handlers
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

  // Export data function
  const exportData = () => {
    const carList = editMode.value ? editableCars.value : cars.value;

    // Generate the car data array as a string
    const carDataArrayString = carList
      .map((car) => {
        // Format installment details
        const installmentDetailsString = car.carInstallmentDetails
          .map(
            (detail) =>
              `      {\n` +
              `        carRatePricePercent: ${detail.carRatePricePercent},\n` +
              `        carMonthPaid: {\n` +
              `          percentPerMonth: [${detail.carMonthPaid.percentPerMonth.join(", ")}]\n` +
              `        }\n` +
              `      }`
          )
          .join(",\n");

        return `    {\n` +
          `      carId: "${car.carId}",\n` +
          `      carName1: "${car.carName1}",\n` +
          `      carName2: "${car.carName2}",\n` +
          `      carPrice: ${car.carPrice},\n` +
          `      carPriceText: "${car.carPriceText}",\n` +
          `      carImageUrl: "${car.carImageUrl}",\n` +
          `      carLogoUrl: "${car.carLogoUrl}",\n` +
          `      carInstallmentDetails: [\n${installmentDetailsString}\n      ]\n` +
          `    }`;
      })
      .join(",\n");

    const scriptContent = `let carData = [\n${carDataArrayString}\n];`;

    // Create a blob with the script content
    const blob = new Blob([scriptContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "car-data.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    URL.revokeObjectURL(url);

    // Show success message
    const successMsg = document.createElement("div");
    successMsg.textContent = "Data exported successfully!";
    successMsg.className = "success-message";
    document.body.appendChild(successMsg);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.parentNode.removeChild(successMsg);
      }
    }, 3000);
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    const carList = editMode.value ? editableCars.value : cars.value;

    // Generate the car data array as a string
    const carDataArrayString = carList
      .map((car) => {
        // Format installment details
        const installmentDetailsString = car.carInstallmentDetails
          .map(
            (detail) =>
              `      {\n` +
              `        carRatePricePercent: ${detail.carRatePricePercent},\n` +
              `        carMonthPaid: {\n` +
              `          percentPerMonth: [${detail.carMonthPaid.percentPerMonth.join(", ")}]\n` +
              `        }\n` +
              `      }`
          )
          .join(",\n");

        return `    {\n` +
          `      carId: "${car.carId}",\n` +
          `      carName1: "${car.carName1}",\n` +
          `      carName2: "${car.carName2}",\n` +
          `      carPrice: ${car.carPrice},\n` +
          `      carPriceText: "${car.carPriceText}",\n` +
          `      carImageUrl: "${car.carImageUrl}",\n` +
          `      carLogoUrl: "${car.carLogoUrl}",\n` +
          `      carInstallmentDetails: [\n${installmentDetailsString}\n      ]\n` +
          `    }`;
      })
      .join(",\n");

    const scriptContent = `let carData = [\n${carDataArrayString}\n];\n<\/script>`;

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
        console.error("Failed to copy: ", err);
      });
  };

  // Copy HTML select function
  const copySelectHtml = () => {
    const carList = editMode.value ? editableCars.value : cars.value;

    // Generate HTML select options
    const selectOptions = carList
      .map((car) => `  <option value="${car.carId}">${car.carName1} ${car.carName2} - ${car.carPriceText}</option>`)
      .join("\n");

    const selectElement = `<select name="bydsuscoCar" id="bydsuscoCar" class="form-select">\n${selectOptions}\n</select>`;

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
        console.error("Failed to copy: ", err);
      });
  };

  // Import data function
  const importData = () => {
    // Create file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".js,.html,.txt";

    fileInput.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
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
            throw new Error("Could not find carData array in file");
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
    });

    // Trigger file selection
    fileInput.click();
  };

  // Test all functions
  const testAllFunctions = () => {
    console.log("=== TESTING ALL FUNCTIONS ===");

    // Test 1: Edit Mode Toggle
    console.log("1. Testing Edit Mode Toggle...");
    console.log("Current editMode:", editMode.value);
    console.log("Total cars:", cars.value.length);
    console.log("Editable cars:", editableCars.value.length);

    // Test 2: Search Function
    console.log("2. Testing Search Function...");
    searchQuery.value = "test";
    console.log("Search results:", filteredCars.value.length);
    searchQuery.value = "";

    // Test 3: Data Functions
    console.log("3. Testing Data Functions...");
    if (cars.value.length > 0) {
      const testCar = cars.value[0];
      console.log("Test car ID:", testCar.carId);
      console.log("Test car name:", testCar.carName1);
    }

    // Test 4: Drag and Drop State
    console.log("4. Testing Drag & Drop State...");
    console.log("Dragged car:", draggedCar.value);
    console.log("Dragged index:", draggedIndex.value);
    console.log("Is saving:", isSaving.value);

    // Test 5: Computed Values
    console.log("5. Testing Computed Values...");
    console.log("Total models:", totalModels.value);
    console.log("Price range:", priceRange.value);

    console.log("=== TEST COMPLETE ===");
  };

  return {
    // Reactive data
    searchQuery,
    draggedCar,
    draggedIndex,
    isSaving,
    filteredCars,
    totalModels,
    
    // Computed from composables
    cars,
    totalCars,
    priceRange,
    modelGroups,
    editMode,
    editableCars,
    
    // Event handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleToggleEditMode,
    handleDuplicate,
    handleUpdate,
    handleUpdateInstallmentRate,
    handleDelete,
    exportData,
    copyToClipboard,
    copySelectHtml,
    importData,
    testAllFunctions,
    
    // Direct composable functions
    toggleEditMode,
    duplicateCar,
    updateCar,
    deleteCar,
    saveCars,
    cancelEdit
  };
}
