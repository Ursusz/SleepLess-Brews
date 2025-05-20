function parseDate(dateString) {
    if (!dateString) {
        return null;
    }
    const parts = dateString.split('-');
    if (parts.length !== 3) {
        return null;
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null;
    }
    return new Date(year, month, day);
}

window.onload = function() {


    const filtrareBtn = document.getElementById("filtrare");
    filtrareBtn.onclick = function() {
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();

        let vectRadio = document.getElementsByName("gr_rad");
        let inpIntensitate = null;
        let minIntensitate = null;
        let maxIntensitate = null;
        for (const button of Array.from(vectRadio)) {
            if (button.checked) {
                inpIntensitate = button.value;
                if (inpIntensitate !== "toate") {
                    [minIntensitate, maxIntensitate] = inpIntensitate.split(":");
                    minIntensitate = parseInt(minIntensitate);
                    maxIntensitate = parseInt(maxIntensitate);
                }
                break;
            }
        }
        let inpPret = document.getElementById("inp-pret").value;
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
        const descriereFilter = document.getElementById("txt-descriere-min").value.trim().toLowerCase();
        const originiMultiple = Array.from(document.getElementById("inp-origini-multiple").selectedOptions).map(option => option.value);
        const noutati = document.getElementById("chk-noutati").checked;

        let produse = document.getElementsByClassName("produs");
        Array.from(produse).forEach(item => {
            item.style.display = "block";
            let nume = item.getElementsByClassName("val-nume")[0].innerText.trim().toLowerCase();
            let intensitate = item.getElementsByClassName("val-intensitate")[0]?.innerText.trim();
            let pret = parseFloat(item.getElementsByClassName("val-pret")[0].innerText.trim());
            let categorie = item.getElementsByClassName("val-categorie")[0].innerText.trim().toLowerCase();
            let descriere = item.querySelector(".descriere")?.innerText.trim().toLowerCase() || "";
            let origine = item.querySelector(".val-origine")?.innerText.trim() || "";
            let data_produs = item.querySelector('.val-data-adaugare').innerText || "";
            let cond2 = true;
            if (inpIntensitate !== "toate" && intensitate) {
                intensitate = parseInt(intensitate.split("/")[0]);
                cond2 = (intensitate >= minIntensitate && intensitate <= maxIntensitate);
            }
            let cond1 = nume.includes(inpNume)
            let cond3 = (pret >= inpPret);
            let cond4 = (inpCategorie === "toate" || inpCategorie === categorie);
            let cond5 = descriere.includes(descriereFilter);
            let cond6 = originiMultiple.includes("oricare") || originiMultiple.includes(origine);
            let cond7 = (!noutati || (data_produs && new Date(data_produs.toString()) > new Date("2025-05-16")));
            // console.log(new Date(data_produs.toString()), new Date("2025-05-16"))
            if (!cond1 || !cond2 || !cond3 || !cond4 || !cond5 || !cond6 || !cond7) {
                item.style.display = "none";
            }
        })
    }
    document.getElementById("inp-pret").oninput = function() {
        document.getElementById("infoRange").innerText = `(${this.value})`;
    }

    document.getElementById("resetare").onclick = function() {
        if (confirm("Sigur dorești să resetezi filtrele?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = 0;
            document.getElementById("infoRange").innerText = "(0)";
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("txt-descriere-min").value = "";
            document.getElementById("inp-origini-multiple").value = "oricare";
            document.getElementById("chk-noutati").checked = false;


            let produse = document.getElementsByClassName("produs");
            Array.from(produse).forEach(item => {
                item.style.display = "block";
            });
            document.getElementById("i_rad4").checked = true;
        }
    }
    document.getElementById("sortCrescNume").onclick = function() {
        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);
        vProduse.sort((a, b) => {
            const pretA = parseFloat(a.querySelector(".val-pret").innerText.trim());
            const pretB = parseFloat(b.querySelector(".val-pret").innerText.trim());
            const numeA = a.querySelector(".val-nume").innerText.trim().toLowerCase();
            const numeB = b.querySelector(".val-nume").innerText.trim().toLowerCase();

            if (pretB !== pretA) {
                return pretA - pretB;
            } else {
                return numeB.localeCompare(numeA);
            }
        });
        vProduse.forEach(produs => produs.parentNode.appendChild(produs));
    }
    document.getElementById("sortDescrescNume").onclick = function() {
        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);
        vProduse.sort((a, b) => {
            const pretA = parseFloat(a.querySelector(".val-pret").innerText.trim());
            const pretB = parseFloat(b.querySelector(".val-pret").innerText.trim());
            const numeA = a.querySelector(".val-nume").innerText.trim().toLowerCase();
            const numeB = b.querySelector(".val-nume").innerText.trim().toLowerCase();

            if (pretB !== pretA) {
                return pretB - pretA;
            } else {
                return numeB.localeCompare(numeA);
            }
        });
        vProduse.forEach(produs => produs.parentNode.appendChild(produs));
    }

    document.getElementById('calculeazaPret').addEventListener('click', function() {
        const produseSelectate = document.querySelectorAll('.select-cos:checked');
        let suma = 0;
        let count = 0;
        let minPrice = Infinity;
        let maxPrice = -Infinity;

        produseSelectate.forEach(checkbox => {
            const produsElement = checkbox.closest('.produs');
            if (produsElement) {
                const pretElement = produsElement.querySelector(".val-pret");
                if (pretElement) {
                    const pretText = pretElement.innerText.trim();
                    const pretValue = parseFloat(pretText);
                    if (!isNaN(pretValue)) {
                        suma += pretValue;
                        count++;
                        minPrice = Math.min(minPrice, pretValue);
                        maxPrice = Math.max(maxPrice, pretValue);
                    }
                }
            }
        });

        let rezultatText = "";
        if (count > 0) {
            rezultatText = `Suma: ${suma.toFixed(2)} RON, Media: ${(suma / count).toFixed(2)} RON, Minim: ${minPrice.toFixed(2)} RON, Maxim: ${maxPrice.toFixed(2)} RON`;
        } else {
            rezultatText = "Nu ați selectat niciun produs.";
        }

        const rezultatDiv = document.createElement('div');
        rezultatDiv.style.position = 'fixed';
        rezultatDiv.style.top = '20px';
        rezultatDiv.style.left = '50%';
        rezultatDiv.style.transform = 'translateX(-50%)';
        rezultatDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        rezultatDiv.style.padding = '10px 20px';
        rezultatDiv.style.border = '1px solid #ccc';
        rezultatDiv.style.borderRadius = '5px';
        rezultatDiv.style.zIndex = '1000';
        rezultatDiv.textContent = rezultatText;

        document.body.appendChild(rezultatDiv);

        setTimeout(() => {
            rezultatDiv.remove();
        }, 2000);
    });
}
