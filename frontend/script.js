const API_URL = "http://localhost:5000/api/crop-prices";

function showCrop() {
    const crop = document.getElementById("cropSelect").value;
    const district = document.getElementById("districtSelect").value;
    const result = document.getElementById("result");

    if (crop === "" || district === "") {
        result.innerHTML = `
            <p>Please select both crop and district.</p>
        `;
        return;
    }

    const cropPrices = {
        Paddy: 2400,
        Groundnut: 6200,
        Coconut: 2800,
        Banana: 3500
    };

    const price = cropPrices[crop];

    result.innerHTML = `
        <div class="price-card">
            <h3>Market Information</h3>
            <p><strong>Crop:</strong> ${crop}</p>
            <p><strong>District:</strong> ${district}</p>
            <p><strong>Sample Price:</strong> ₹${price}</p>
            <p>Price unit and date will be added with verified market data.</p>
        </div>
    `;
}

function compareCrops() {
    const cropPrices = {
        Paddy: 2400,
        Groundnut: 6200,
        Coconut: 2800,
        Banana: 3500
    };

    let comparisonHTML = `
        <div class="price-card">
            <h3>Crop Price Comparison</h3>
    `;

    for (const crop in cropPrices) {
        comparisonHTML += `
            <p>
                <strong>${crop}:</strong>
                ₹${cropPrices[crop]}
            </p>
        `;
    }

    comparisonHTML += `</div>`;

    document.getElementById("comparison").innerHTML =
        comparisonHTML;
}

async function loadCropPrices() {
    try {
        const response = await fetch(API_URL);
        const cropPrices = await response.json();

        const result = document.getElementById("result");

        if (cropPrices.length === 0) {
            result.innerHTML = "<p>No crop price records found.</p>";
            return;
        }

        result.innerHTML = `
            <h2>Crop Price Records</h2>

            ${cropPrices.map(item => `
                <div class="price-card">
                    <p><strong>Crop:</strong> ${item.crop}</p>
                    <p><strong>District:</strong> ${item.district}</p>
                    <p><strong>Market:</strong> ${item.market}</p>
                    <p><strong>Price:</strong> ₹${item.price}</p>
                    <p><strong>Unit:</strong> ${item.unit}</p>
                    <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>

                    <button onclick="updateCrop('${item._id}', ${item.price})">
                        Update Price
                    </button>

                    <button onclick="deleteCrop('${item._id}')">
                        Delete
                    </button>
                </div>
            `).join("")}
        `;
    } catch (error) {
        console.error(error);

        document.getElementById("result").innerHTML =
            "<p>Failed to load crop prices.</p>";
    }
}

async function updateCrop(id, currentPrice) {
    const newPrice = prompt(
        "Enter the new price:",
        currentPrice
    );

    if (newPrice === null) {
        return;
    }

    if (newPrice === "" || isNaN(newPrice)) {
        alert("Please enter a valid price.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                price: Number(newPrice)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to update crop price.");
            return;
        }

        alert("Crop price updated successfully!");

        loadCropPrices();
    } catch (error) {
        console.error(error);
        alert("Failed to update crop price.");
    }
}

async function deleteCrop(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this crop price?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete crop price.");
            return;
        }

        alert("Crop price deleted successfully!");

        loadCropPrices();
    } catch (error) {
        console.error(error);
        alert("Failed to delete crop price.");
    }
}