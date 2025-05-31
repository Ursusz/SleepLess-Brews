const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const AccesBD = require("./resurse/module_proprii/accesbd");
AccesBD.getInstanta().select({tabel:"cafea", campuri:["*"]}, function(err, rez){
    console.log("------------------------------------------------------------ Acces BD ---------------------------------------------------------------");
    console.log(err, rez);
});

const Client = pg.Client;

const client = new Client({
    database:"proiectweb",
    user:"ursu",
    password:"Alexandru20!!",
    host:"localhost",
    port:5432
});

client.connect();
client.query("select * from cafea", function(err, rezultat ){
});
client.query("select * from unnest(enum_range(null::categ_cafea))", function(err, rezultat ){
});


const app = express();

app.set("view engine", "ejs");

const obGlobal={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname, "resurse/scss"),
    folderCss:path.join(__dirname, "resurse/css"),
    folderBackup:path.join(__dirname, "backup"),
    oferteFilePath: path.join(__dirname, "oferte.json"),
    currentOffer: null
};

const vect_foldere = ["temp"];
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder);
    if(!fsSync.existsSync(caleFolder)){
        fsSync.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        let numeFisExt= path.basename(caleScss);
        let numeFis= numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup= path.join(obGlobal.folderBackup, "resurse/css");
    if (!fsSync.existsSync(caleBackup)){
        fsSync.mkdirSync(caleBackup,{recursive:true});
    }

    let numeFisCss= path.basename(caleCss);
    if (fsSync.existsSync(caleCss)){
        const timestamp = Date.now();
        const numeFisBackup = numeFisCss.replace(".css", `_${timestamp}.css`);
    }
    const rez = sass.compile(caleScss, {"sourceMap":true});
    fsSync.writeFileSync(caleCss, rez.css);
}

const vFisiere=fsSync.readdirSync(obGlobal.folderScss);
for(let numeFis of vFisiere){
    if (path.extname(numeFis) == ".scss"){
        compileazaScss(numeFis);
    }
}

fsSync.watch(obGlobal.folderScss, (eveniment, numeFis) =>{
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fsSync.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
});


function initErori(){
    let continut = fsSync.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori=JSON.parse(continut);
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
}
initErori();

function initImagini(){
    var continut= fsSync.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mic");

    if (!fsSync.existsSync(caleAbsMediu))
        fsSync.mkdirSync(caleAbsMediu);
    if(!fsSync.existsSync(caleAbsMic))
        fsSync.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        let [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis+".webp");

        if (!fsSync.existsSync(caleFisMediuAbs)) {
            sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        }
        if (!fsSync.existsSync(caleFisMicAbs)) {
            sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        }

        imag.fisier_mic = path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis+".webp");
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp");
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}
initImagini();

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){
        return elem.identificator==identificator
    });
    if(eroare){
        if(eroare.status)
            res.status(identificator);
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;
    }
    else{
        var err=obGlobal.obErori.eroare_default;
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;
    }
    res.render("pagini/eroare", {
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    });
}

function getLunaCurenta() {
    const luni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
        "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
    const dataCurenta = new Date();
    const indexLuna = dataCurenta.getMonth();
    return luni[indexLuna];
}

async function readOffers() {
    try {
        const data = await fs.readFile(obGlobal.oferteFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(obGlobal.oferteFilePath, JSON.stringify({ oferte: [] }, null, 2));
            return { oferte: [] };
        }
        console.error("Eroare la citirea oferte.json:", error);
        return { oferte: [] };
    }
}

async function writeOffers(offersData) {
    try {
        await fs.writeFile(obGlobal.oferteFilePath, JSON.stringify(offersData, null, 2));
    } catch (error) {
        console.error("Eroare la scrierea oferte.json:", error);
    }
}

async function generateOffer() {
    const offersData = await readOffers();
    const categoriesResult = await client.query("SELECT unnest(enum_range(NULL::categ_cafea)) AS categorie");
    const categories = categoriesResult.rows.map(row => row.categorie);
    const discounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

    let newCategory = null;
    let lastOfferCategory = offersData.oferte.length > 0 ? offersData.oferte[0].categorie : null;

    if (categories.length > 1) {
        do {
            newCategory = categories[Math.floor(Math.random() * categories.length)];
        } while (newCategory === lastOfferCategory);
    } else if (categories.length === 1) {
        newCategory = categories[0];
    } else {
        console.warn("Nu există categorii disponibile pentru a genera oferte.");
        return;
    }

    const newDiscount = discounts[Math.floor(Math.random() * discounts.length)];
    const now = new Date();
    const offerDurationMinutes = 1;
    const expiryTime = new Date(now.getTime() + offerDurationMinutes * 60 * 1000);

    const newOffer = {
        categorie: newCategory,
        data_incepere: now.toISOString(),
        data_finalizare: expiryTime.toISOString(),
        reducere: newDiscount
    };

    offersData.oferte.unshift(newOffer);
    await writeOffers(offersData);
    obGlobal.currentOffer = newOffer;
    console.log("Ofertă nouă generată:", newOffer);
}

async function cleanupOldOffers() {
    const offersData = await readOffers();
    const cleanupThresholdMinutes = 2;
    const currentTime = new Date();

    const filteredOffers = offersData.oferte.filter(offer => {
        const finalizare = new Date(offer.data_finalizare);
        const expiredBy = (currentTime.getTime() - finalizare.getTime()) / (60 * 1000);
        return expiredBy < cleanupThresholdMinutes;
    });

    if (filteredOffers.length !== offersData.oferte.length) {
        offersData.oferte = filteredOffers;
        await writeOffers(offersData);
        console.log("Oferte vechi curățate.");
    }
}

(async () => {
    await readOffers();
    await generateOffer();
    setInterval(generateOffer, 1 * 60 * 1000);
    setInterval(cleanupOldOffers, 2 * 60 * 1000);
})();


app.use(async (req, res, next) => {
    try {
        const queryOptiuni = "SELECT unnest(enum_range(NULL::categ_cafea)) AS categorie";
        const rezOptiuni = await client.query(queryOptiuni);
        res.locals.categoriiMeniu = rezOptiuni.rows.map(row => row.categorie);

        const offersData = await readOffers();
        obGlobal.currentOffer = offersData.oferte.length > 0 ? offersData.oferte[0] : null;
        res.locals.currentOffer = obGlobal.currentOffer;

        next();
    } catch (err) {
        console.error("Eroare la obținerea datelor pentru meniu sau oferte:", err);
        res.locals.categoriiMeniu = [];
        res.locals.currentOffer = null;
        next();
    }
});

app.use("/resurse", express.static(path.join(__dirname,'resurse')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"));
});

app.get("/galerie", (req, res) => {
    const lunaCurenta = getLunaCurenta();
    const imaginiFiltrate = obGlobal.obImagini.imagini
        .filter(imagine => imagine.luni.includes(lunaCurenta))
        .slice(0, 12);
    res.render("pagini/paginagalerie", {
        imaginiGalerie: imaginiFiltrate
    });
});

app.get(["/", "/home", "/index"], (req, res) => {
    const lunaCurenta = getLunaCurenta();
    const imaginiFiltrate = obGlobal.obImagini.imagini
        .filter(imagine => imagine.luni.includes(lunaCurenta))
        .slice(0, 12);
    res.render("pagini/index",{
        ip: req.ip,
        imagini:obGlobal.obImagini.imagini,
        imaginiGalerie: imaginiFiltrate,
        currentOffer: res.locals.currentOffer
    });
});

app.get("/index/a", (req, res) => {
    res.render("pagini/index");
});

app.get("/cerere", (req, res) => {
    res.send("<p style='color: green'>Buna ziua!</p>");
});

app.get("/abc", (req, res, next) => {
    res.write("Data curenta: ");
    next();
});

app.get("/abc", (req, res, next) => {
    res.write(new Date()+"");
    res.end();
});

app.get("/fisier", (req, res) => {
    res.sendFile(path.join(__dirname, "package.json"));
});

app.get("/produse", function(req, res){
    const tipFiltru = req.query.tip;
    let conditieSQL = "";
    let valoriSQL = [];

    if (tipFiltru && ['boabe', 'măcinată', 'capsule', 'instant'].includes(tipFiltru)) {
        conditieSQL = "WHERE categorie = $1";
        valoriSQL = [tipFiltru];
    }

    const queryOptiuni = "SELECT unnest(enum_range(NULL::categ_cafea)) AS unnest";
    const queryMinMaxPret = "SELECT MIN(pret) AS min_pret, MAX(pret) AS max_pret FROM cafea";
    const querySugestiiNume = "SELECT DISTINCT nume FROM cafea ORDER BY nume LIMIT 4";
    const queryOrigini = "SELECT DISTINCT origine FROM cafea WHERE origine IS NOT NULL ORDER BY origine";

    client.query(queryOptiuni, function(errOptiuni, rezOptiuni){
        if (errOptiuni) {
            console.error("Eroare la obținerea opțiunilor de categorie:", errOptiuni);
            afisareEroare(res, 500, "Eroare internă a serverului", "Nu s-au putut obține categoriile de cafea.");
            return;
        }

        client.query(queryMinMaxPret, function(errMinMax, rezMinMax){
            if (errMinMax) {
                console.error("Eroare la obținerea pretului minim si maxim:", errMinMax);
                afisareEroare(res, 500, "Eroare internă a serverului", "Nu s-au putut obține limitele de preț.");
                return;
            }

            const minPretDB = rezMinMax.rows[0].min_pret || 0;
            const maxPretDB = rezMinMax.rows[0].max_pret || 100;

            client.query(querySugestiiNume, function(errNume, rezNume){
                if (errNume) {
                    console.error("Eroare la obținerea numelor de produse:", errNume);
                    res.locals.numeProduse = [];
                }

                client.query(queryOrigini, function(errOrigini, rezOrigini){
                    if (errOrigini) {
                        console.error("Eroare la obținerea originilor:", errOrigini);
                        res.locals.optiuniOrigini = [];
                    }

                    const queryProduse = `SELECT * FROM cafea ${conditieSQL}`;
                    client.query(queryProduse, valoriSQL, function(errCafele, rezCafele){
                        if (errCafele){
                            console.error("Eroare la obținerea cafelelor:", errCafele);
                            afisareEroare(res, 500, "Eroare internă a serverului", "Nu s-au putut obține produsele.");
                        } else {
                            const cafele = rezCafele.rows;
                            const cheapestProductsPerCategory = {};

                            cafele.forEach(prod => {
                                const category = prod.categorie;
                                const price = parseFloat(prod.pret);

                                if (!cheapestProductsPerCategory[category] || price < parseFloat(cheapestProductsPerCategory[category].pret)) {
                                    cheapestProductsPerCategory[category] = prod;
                                }
                            });

                            res.render("pagini/produse", {
                                cafele: cafele,
                                optiuniCategorie: rezOptiuni.rows,
                                minPret: minPretDB,
                                maxPret: maxPretDB,
                                numeProduse: rezNume.rows.map(row => row.nume),
                                optiuniOrigini: rezOrigini.rows.map(row => row.origine),
                                currentOffer: res.locals.currentOffer,
                                cheapestProductsPerCategory: cheapestProductsPerCategory
                            });
                        }
                    });
                });
            });
        });
    });
});

app.get("/produs/:id", function(req, res){
    const productId = req.params.id;

    client.query("SELECT * FROM cafea WHERE id = $1", [productId], function(err, rezultatProdus){
        if (err){
            console.error("Eroare la interogarea bazei de date:", err);
            afisareEroare(res, 500, "Eroare internă a serverului", "A apărut o eroare la procesarea cererii tale.");
        }
        else{
            if (rezultatProdus.rows.length === 0){
                afisareEroare(res, 404, "Produs inexistent", "Ne pare rău, produsul solicitat nu a fost găsit.");
            }
            else{
                res.render("pagini/produs", { prod: rezultatProdus.rows[0] });
            }
        }
    });
});

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, (req, res, next) => {
    afisareEroare(res, 403);
});

app.get("/*.ejs", (req, res, next) => {
    afisareEroare(res, 400);
});

app.get("/*", (req, res, next) =>{
    try{
        res.render("pagini" + req.url, (err, res_render) => {
            if(err) {
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res, 404);
                }
                else{
                    afisareEroare(res);
                }
            }else{
                res.send(res_render);
            }
        });
    }catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res, 404);
        }else{
            afisareEroare(res);
        }
    }
});

app.listen(8080);
console.log("Serverul a pornit");