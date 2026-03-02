async function fetchGoldData() {
    const response = await fetch('https://www.goldapi.io/api/XAU/USD');
    if (!response.ok) {
        throw new Error('Failed to fetch gold data');
    }
    const data = await response.json();
    return data;
}

async function fetchSilverData() {
    const response = await fetch('https://www.goldapi.io/api/XAG/USD');
    if (!response.ok) {
        throw new Error('Failed to fetch silver data');
    }
    const data = await response.json();
    return data;
}