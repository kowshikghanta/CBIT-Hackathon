document.getElementById('scoringForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get input values
    const mobileUsage = parseInt(document.getElementById('mobileUsage').value);
    const airtimePurchases = parseInt(document.getElementById('airtimePurchases').value);
    const dataConsumption = parseFloat(document.getElementById('dataConsumption').value);
    const electricityPaid = document.getElementById('electricityPaid').value;
    const waterPaid = document.getElementById('waterPaid').value;
    const rentHistory = document.getElementById('rentHistory').value;
    const transactionCount = parseInt(document.getElementById('transactionCount').value);
    const socialScore = parseFloat(document.getElementById('socialScore').value);
    const digitalScore = parseFloat(document.getElementById('digitalScore').value);
    const loanRepaid = document.getElementById('loanRepaid').value;

    // Simple scoring logic for prototype
    let score = 0;

    score += mobileUsage > 200 ? 1 : 0;
    score += airtimePurchases > 2 ? 1 : 0;
    score += dataConsumption > 1.0 ? 1 : 0;
    score += electricityPaid === "yes" ? 1 : 0;
    score += waterPaid === "yes" ? 1 : 0;
    score += rentHistory === "timely" ? 1 : 0;
    score += transactionCount > 50 ? 1 : 0;
    score += socialScore >= 0.6 ? 1 : 0;
    score += digitalScore >= 0.6 ? 1 : 0;
    score += loanRepaid === "yes" ? 1 : 0;

    // Categorize risk
    let category = "High";
    if (score >= 8) category = "Low";
    else if (score >= 5) category = "Medium";

    document.getElementById('result').innerText =
        "Predicted Risk Category: " + category;
});
