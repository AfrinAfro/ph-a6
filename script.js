const categoryContainer =
  document.getElementById("category-container");

const plantsContainer =
  document.getElementById("plants-container");

const spinner =
  document.getElementById("spinner");

const cartContainer =
  document.getElementById("cart-container");

const totalPrice =
  document.getElementById("total-price");

const modal =
  document.getElementById("plant-modal");

const modalContent =
  document.getElementById("modal-content");

let cart = [];
let total = 0;


/* ================= SHOW SPINNER ================= */

const showSpinner = (status) => {
  if (status) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
};


/* ================= LOAD CATEGORIES ================= */

const loadCategories = async () => {
  try {
    const res = await fetch(
      "https://openapi.programming-hero.com/api/categories"
    );

    const data = await res.json();
    const categories = data.data || data.categories;

    displayCategories(categories);
  } catch (error) {
    console.log(error);
  }
};


/* ================= DISPLAY CATEGORIES ================= */

const displayCategories = (categories) => {
  categoryContainer.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.innerText = "All Trees";
  allButton.classList.add("active");

  allButton.onclick = () => {
    removeActiveButtons();
    allButton.classList.add("active");
    loadAllPlants();
  };

  categoryContainer.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement("button");
    button.innerText = category.category_name;

    button.onclick = () => {
      removeActiveButtons();
      button.classList.add("active");
      loadPlantsByCategory(category.id);
    };

    categoryContainer.appendChild(button);
  });
};


/* ================= REMOVE ACTIVE BUTTONS ================= */

const removeActiveButtons = () => {
  const buttons =
    document.querySelectorAll(".category-container button");

  buttons.forEach(button => {
    button.classList.remove("active");
  });
};


/* ================= LOAD ALL PLANTS ================= */

const loadAllPlants = async () => {
  try {
    showSpinner(true);

    const res = await fetch(
      "https://openapi.programming-hero.com/api/plants"
    );

    const data = await res.json();
    const plants = data.data || data.plants;

    displayPlants(plants);
  } catch (error) {
    console.log(error);
  } finally {
    showSpinner(false);
  }
};


/* ================= LOAD PLANTS BY CATEGORY ================= */

const loadPlantsByCategory = async (id) => {
  try {
    showSpinner(true);

    const res = await fetch(
      `https://openapi.programming-hero.com/api/category/${id}`
    );

    const data = await res.json();
    const plants = data.data || data.plants;

    displayPlants(plants);
  } catch (error) {
    console.log(error);
  } finally {
    showSpinner(false);
  }
};


/* ================= DISPLAY PLANTS ================= */

const displayPlants = (plants) => {
  plantsContainer.innerHTML = "";

  if (!plants || plants.length === 0) {
    plantsContainer.innerHTML = `
      <h2 class="no-data">No Plants Found</h2>
    `;
    return;
  }

  plants.forEach(plant => {
    const div = document.createElement("div");
    div.classList.add("plant-card");

    div.innerHTML = `
      <img src="${plant.image}" alt="${plant.name}" />

      <h3 class="plant-name" style="cursor: pointer; color: #13823b; text-decoration: underline;">
        ${plant.name}
      </h3>

      <p>
        ${(plant.description || "").slice(0, 80)}...
      </p>

      <div class="category-badge">
        ${plant.category || "N/A"}
      </div>

      <div class="card-bottom">
        <h4>৳${plant.price || 0}</h4>
        <button class="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    `;

    plantsContainer.appendChild(div);

    /* ================= MODAL CLICK VIA MANDATORY API ================= */
    const titleElement = div.querySelector(".plant-name");
    titleElement.addEventListener("click", () => {
      loadPlantDetails(plant.id || plant.plant_id);
    });

    /* ================= ADD TO CART ================= */
    const addToCartButton = div.querySelector(".add-to-cart-btn");
    addToCartButton.addEventListener("click", () => {
      addToCart(plant);
    });
  });
};


/* ================= LOAD SINGLE PLANT DETAILS (REQUIRED 4th API) ================= */

const loadPlantDetails = async (id) => {
  try {
    showSpinner(true);

    const res = await fetch(
      `https://openapi.programming-hero.com/api/plant/${id}`
    );

    const data = await res.json();
    console.log("DETAIL API RESPONSE:", data);

    // Dynamic checks for any property nesting variant
    let plantData = data.data || data.plant || data.plants;
    
    if (Array.isArray(plantData)) {
      plantData = plantData[0];
    }

    if (!plantData) {
      console.error("Could not find plant details inside API response object.");
      return;
    }

    showPlantModal(plantData);
  } catch (error) {
    console.log("Error loading plant details:", error);
  } finally {
    showSpinner(false);
  }
};


/* ================= SHOW MODAL ================= */

const showPlantModal = (plant) => {
  if (!plant) return;

  // Render the contents into the target element container
  modalContent.innerHTML = `
    <div class="modal-card">
      <img src="${plant.image || ''}" alt="${plant.name || ''}" />
      <div class="modal-info">
        <span class="modal-title">${plant.category || 'N/A'}</span>
        <h2>${plant.name || 'No name'}</h2>
        <p style="margin: 15px 0; color: #555;">${plant.description || 'No description available'}</p>
        <h3>Price: ৳${plant.price || 0}</h3>
      </div>
    </div>
  `;

  // Explicit HTML5 dialog display function trigger
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    // Fallback if browser compatibility is strict
    modal.setAttribute("open", "true");
  }
};


/* ================= CLOSE MODAL ================= */

const closeModal = () => {
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }
};

// Expose closeModal globally for inline onclick attribute
window.closeModal = closeModal;


/* ================= ADD TO CART ================= */

const addToCart = (plant) => {
  cart.push(plant);
  total += Number(plant.price || 0);

  updateCart();
};


/* ================= UPDATE CART ================= */

const updateCart = () => {
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p>Your cart is empty</p>`;
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <div>
        <h5>${item.name}</h5>
        <small>৳${item.price}</small>
      </div>
      <button class="remove-btn" onclick="removeItem(${index})">
        ×
      </button>
    `;

    cartContainer.appendChild(div);
  });

  totalPrice.innerText = total;
};


/* ================= REMOVE ITEM ================= */

const removeItem = (index) => {
  total -= Number(cart[index].price || 0);
  cart.splice(index, 1);

  updateCart();
};

// Expose removeItem globally so inline HTML onclick works flawlessly
window.removeItem = removeItem;


/* ================= INITIAL LOAD ================= */

loadCategories();
loadAllPlants();