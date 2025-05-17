window.onload = function() {
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 'c') {
            const checkboxes = document.querySelectorAll('.select-cos:checked');
            let suma = 0;

            checkboxes.forEach(checkbox => {
                const produsElement = checkbox.closest('.produs');
                if (produsElement) {
                    const pretElement = produsElement.querySelector('.val-pret');
                    if (pretElement) {
                        const pretText = pretElement.innerText.trim();
                        const pret = parseFloat(pretText);
                        if (!isNaN(pret)) {
                            suma += pret;
                        }
                    }
                }
            });

            alert('Suma prețurilor produselor selectate este: ' + suma.toFixed(2) + ' RON');
        }
    });

    btn = document.getElementById("filtrare");
    btn.onclick = function(){
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


        let produse = document.getElementsByClassName("produs");
        Array.from(produse).forEach(item => {
            item.style.display = "block";
            let nume = item.getElementsByClassName("val-nume")[0].innerText.trim().toLowerCase();
            let intensitate = item.getElementsByClassName("val-intensitate")[0]?.innerText.trim(); // Changed to optional chaining
            let pret = parseFloat(item.getElementsByClassName("val-pret")[0].innerText.trim());
            let categorie = item.getElementsByClassName("val-categorie")[0].innerText.trim().toLowerCase();

            let cond2 = true;
            if(inpIntensitate !== "toate" && intensitate){
                intensitate = parseInt(intensitate.split("/")[0]); //extract the intensity value;
                cond2 = (intensitate >= minIntensitate && intensitate <= maxIntensitate);
            }
            let cond1 = nume.includes(inpNume)

            let cond3 = (pret >= inpPret);
            let cond4 = (inpCategorie === "toate" || inpCategorie === categorie);

            if(!cond1 || !cond2 || !cond3 || !cond4){
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
            let produse = document.getElementsByClassName("produs");
            Array.from(produse).forEach(item => {
                item.style.display = "block";
            });
            document.getElementById("i_rad4").checked = true;
        }
    }
    document.getElementById("sortCrescNume").onclick = function(){
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
    document.getElementById("sortDescrescNume").onclick = function(){
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
}
