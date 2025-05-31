document.addEventListener('DOMContentLoaded', function() {
    const COMPARISON_STORAGE_KEY = 'comparisonProducts';
    const LAST_COMPARE_ACTION_KEY = 'lastCompareAction';
    const COMPARISON_LIFESPAN_MS = 24 * 60 * 60 * 1000;
    const MAX_COMPARISON_PRODUCTS = 2;

    let comparisonProducts = [];
    let comparisonContainer = null;

    function getComparisonProducts() {
        try {
            const storedProducts = localStorage.getItem(COMPARISON_STORAGE_KEY);
            return storedProducts ? JSON.parse(storedProducts) : [];
        } catch (e) {
            console.error("Eroare la citirea produselor de comparare din localStorage:", e);
            return [];
        }
    }

    function setComparisonProducts(products) {
        try {
            localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(products));
            localStorage.setItem(LAST_COMPARE_ACTION_KEY, new Date().getTime().toString());
        } catch (e) {
            console.error("Eroare la scrierea produselor de comparare în localStorage:", e);
        }
    }

    function clearComparisonProducts() {
        localStorage.removeItem(COMPARISON_STORAGE_KEY);
        localStorage.removeItem(LAST_COMPARE_ACTION_KEY);
        comparisonProducts = [];
        renderComparisonContainer();
    }

    function isProductInComparison(productId) {
        return comparisonProducts.some(p => p.id === productId);
    }

    function addProductToComparison(product) {
        if (!isProductInComparison(product.id) && comparisonProducts.length < MAX_COMPARISON_PRODUCTS) {
            comparisonProducts.push(product);
            setComparisonProducts(comparisonProducts);
            renderComparisonContainer();
        }
    }

    function removeProductFromComparison(productId) {
        comparisonProducts = comparisonProducts.filter(p => p.id !== productId);
        setComparisonProducts(comparisonProducts);
        renderComparisonContainer();
    }

    function createComparisonContainer() {
        if (!comparisonContainer) {
            comparisonContainer = document.createElement('div');
            comparisonContainer.id = 'container-comparare';
            document.body.appendChild(comparisonContainer);
        }
    }

    function renderComparisonContainer() {
        createComparisonContainer();

        if (comparisonProducts.length === 0) {
            comparisonContainer.style.display = 'none';
            updateCompareButtons();
            return;
        }

        const path = window.location.pathname;
        const isProductPage = path.startsWith('/produse') || path.startsWith('/produs/');
        if (!isProductPage) {
            comparisonContainer.style.display = 'none';
            return;
        }

        comparisonContainer.style.display = 'block';
        comparisonContainer.innerHTML = '';

        comparisonProducts.forEach(prod => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('compare-item');
            productDiv.innerHTML = `
                <span>${prod.nume}</span>
                <button class="remove-compare-btn" data-id="${prod.id}"><i class="fas fa-times"></i></button>
            `;
            comparisonContainer.appendChild(productDiv);
        });

        if (comparisonProducts.length === MAX_COMPARISON_PRODUCTS) {
            const compareButton = document.createElement('button');
            compareButton.id = 'show-comparison-btn';
            compareButton.classList.add('btn', 'btn-success', 'btn-sm');
            compareButton.textContent = 'Afișează';
            compareButton.addEventListener('click', showComparisonWindow);
            comparisonContainer.appendChild(compareButton);
        }

        updateCompareButtons();
    }

    function updateCompareButtons() {
        const compareButtons = document.querySelectorAll('.compare-btn');
        compareButtons.forEach(button => {
            const productId = button.dataset.id;
            if (isProductInComparison(productId)) {
                button.disabled = true;
                button.title = "Acest produs este deja în lista de comparare.";
            } else if (comparisonProducts.length === MAX_COMPARISON_PRODUCTS) {
                button.disabled = true;
                button.title = "Ștergeți un produs din lista de comparare pentru a adăuga altul.";
            } else {
                button.disabled = false;
                button.title = "Adaugă la comparare";
            }
        });
    }

    function showComparisonWindow() {
        if (comparisonProducts.length !== MAX_COMPARISON_PRODUCTS) {
            return;
        }

        const product1 = comparisonProducts[0];
        const product2 = comparisonProducts[1];

        const propertiesToCompare = [
            { key: 'nume', label: 'Nume' },
            { key: 'pret', label: 'Preț' },
            { key: 'greutate', label: 'Greutate' },
            { key: 'intensitate', label: 'Intensitate' },
            { key: 'origine', label: 'Origine' },
            { key: 'categorie', label: 'Categorie' }
        ];

        let tableRows = '';
        propertiesToCompare.forEach(prop => {
            tableRows += `
                <tr>
                    <td><strong>${prop.label}</strong></td>
                    <td>${product1[prop.key] || 'N/A'}</td>
                    <td>${product2[prop.key] || 'N/A'}</td>
                </tr>
            `;
        });

        const comparisonWindowContent = `
            <!DOCTYPE html>
            <html lang="ro">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Comparație Produse</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    h1 { text-align: center; color: #333; }
                </style>
            </head>
            <body>
                <h1>Comparație Produse</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Caracteristică</th>
                            <th>${product1.nume}</th>
                            <th>${product2.nume}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(comparisonWindowContent);
            newWindow.document.close();
        } else {
            alert("Vă rugăm permiteți deschiderea ferestrelor pop-up pentru a vizualiza comparația.");
        }
    }
    document.body.addEventListener('click', function(event) {
        if (event.target.closest('.compare-btn')) {
            const button = event.target.closest('.compare-btn');
            if (!button.disabled) {
                const product = {
                    id: button.dataset.id,
                    nume: button.dataset.nume,
                    pret: button.dataset.pret,
                    greutate: button.dataset.greutate,
                    intensitate: button.dataset.intensitate,
                    origine: button.dataset.origine,
                    categorie: button.dataset.categorie
                };
                addProductToComparison(product);
            }
        } else if (event.target.closest('.remove-compare-btn')) {
            const button = event.target.closest('.remove-compare-btn');
            const productId = button.dataset.id;
            removeProductFromComparison(productId);
        }
    });

    function initComparisonSystem() {
        const lastActionTime = localStorage.getItem(LAST_COMPARE_ACTION_KEY);
        const currentTime = new Date().getTime();

        if (lastActionTime && (currentTime - parseInt(lastActionTime, 10)) > COMPARISON_LIFESPAN_MS) {
            clearComparisonProducts();
        } else {
            comparisonProducts = getComparisonProducts();
        }

        renderComparisonContainer();
    }

    initComparisonSystem();
});
