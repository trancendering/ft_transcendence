// modalHandler.js

const ModalHandler = (() => {
  // Private method to get a modal by ID
  const getModalById = (modalId) => {
    return document.getElementById(modalId);
  };

  // Opens a modal with a given ID
  const openModal = (modalId) => {
    const modal = getModalById(modalId);
    if (modal) {
      modal.style.display = "flex";
      document
        .getElementsByTagName("body")[0]
        .classList.add("overflow-y-hidden");
    }
  };

  // Closes a modal with a given ID
  const closeModal = (modalId) => {
    const modal = getModalById(modalId);
    if (modal) {
      modal.style.display = "none";
      document
        .getElementsByTagName("body")[0]
        .classList.remove("overflow-y-hidden");
      clearModal(modalId);
    }
  };

  const clearModal = (modalId) => {
    // specific to game-customization-modal
    //   document.getElementById("nickname").value = "";
    //   document.getElementById("speed-up").checked = false;
    //   document.getElementById("fancy-ball").checked = false;

    // general way
    const modal = getModalById(modalId);

    // Clear all text inputs, textareas, and number inputs
    const textInputs = modal.querySelectorAll(
      'input[type="text"], input[type="number"], textarea'
    );
    textInputs.forEach((input) => {
      input.value = "";
    });

    // Reset all checkboxes and radio buttons to their default state
    const checkboxesAndRadios = modal.querySelectorAll(
      'input[type="checkbox"], input[type="radio"]'
    );
    checkboxesAndRadios.forEach((input) => {
      input.checked = input.defaultChecked;
    });

    // Reset all select elements to their default selected option
    const selects = modal.querySelectorAll("select");
    selects.forEach((select) => {
      select.value =
        select.querySelector("option[selected]")?.value ||
        select.options[0].value;
    });
  };

  // Public API
  return {
    openModal,
    closeModal,
  };
})();

export default ModalHandler;