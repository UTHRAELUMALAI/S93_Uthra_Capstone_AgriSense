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

            <p>Price unit and date will be added
            with verified market data.</p>
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