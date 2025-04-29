window.onload = function() {
    btn = document.getElementById("filtrare");
    btn.onclick = function(){
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();

        let vectRadio = document.getElementsByName("gr_rad");
        let inpCalorii = null;
        let minCalorii = null;
        let maxCalorii = null;
        for (const button of Array.from(vectRadio)) {
            if (button.checked) {
                inpCalorii = button.value;
                if (inpCalorii !== "toate") {
                    [minCalorii, maxCalorii] = inpCalorii.split(":");
                    minCalorii = parseInt(minCalorii);
                    maxCalorii = parseInt(maxCalorii);
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
             let calorii = parseInt(item.getElementsByClassName("val-calorii")[0].innerHTML.trim());
             let pret = parseFloat(item.getElementsByClassName("val-pret")[0].innerHTML.trim());
             let categorie = item.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();

             let cond1 = nume.includes(inpNume)
             let cond2 = (inpCalorii === "toate" || (calorii >= minCalorii && calorii <= maxCalorii))
             let cond3 = (pret >= inpPret);
             let cond4 = (inpCategorie === "toate" || inpCategorie === categorie);

             if(!cond1 || !cond2 || !cond3 || !cond4    ){
                 item.style.display = "none";
             }
         })
    }
}