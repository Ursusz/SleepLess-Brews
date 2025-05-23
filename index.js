const express = require("express");
const path = require("path");
const fs = require("fs")
const sharp = require("sharp")
const sass = require("sass")
const pg = require("pg")

const AccesBD = require("./resurse/module_proprii/accesbd")
AccesBD.getInstanta().select({tabel:"cafea", campuri:["*"]}, function(err, rez){
    console.log("------------------------------------------------------------ Acces BD ---------------------------------------------------------------");
    console.log(err, rez)
});

const Client=pg.Client;

client=new Client({
    database:"proiectweb",
    user:"ursu",
    password:"Alexandru20!!",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from cafea", function(err, rezultat ){
    // console.log(err)
    // console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::categ_cafea))", function(err, rezultat ){
    // console.log(err)
    // console.log(rezultat)
})


app = express();

// a = {
//     prop: 10,
//     b:["orice", {c: 100}, true, [0, 12, {d:200}]]
// }
// console.log(a.b[3][2].d)

v = [10, 27, 23, 44, 15]
nrimpar = v.find(elem => elem % 2)
// console.log(nrimpar);

app.set("view engine", "ejs");

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname, "resurse/scss"),
    folderCss:path.join(__dirname, "resurse/css"),
    folderBackup:path.join(__dirname, "backup")
}

vect_foldere = ["temp"]
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder)
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        let numeFisExt= path.basename(caleScss);
        let numeFis= numeFisExt.split(".")[0]
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)

    let caleBackup= path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)){
        fs.mkdirSync(caleBackup,{recursive:true})
    }

    let numeFisCss= path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        const timestamp = Date.now();
        const numeFisBackup = numeFisCss.replace(".css", `_${timestamp}.css`);
        // fs.copyFileSync(caleCss, path.join(caleBackup, numeFisBackup));
    }
    rez = sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss, rez.css)
}
//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for(let numeFis of vFisiere){
    if (path.extname(numeFis) == ".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, (eveniment, numeFis) =>{
    // console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})


function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");

    obGlobal.obErori=JSON.parse(continut)

    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    // console.log(obGlobal.obErori)
}
initErori()

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mic");
    // console.log("caleabsmic", caleAbsMic);

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    if(!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis+".webp");

        if (!fs.existsSync(caleFisMediuAbs)) {
            sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        }
        if (!fs.existsSync(caleFisMicAbs)) {
            sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        }

        imag.fisier_mic = path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis+".webp");
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp");
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier);
    }
    // console.log(obGlobal.obImagini)
}
initImagini();

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){
        return elem.identificator==identificator
    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;
    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;
    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    })

}

function getLunaCurenta() {
    const luni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
        "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
    const dataCurenta = new Date();
    const indexLuna = dataCurenta.getMonth();
    return luni[indexLuna];
}

app.use(async (req, res, next) => {
    try {
        const queryOptiuni = "SELECT unnest(enum_range(NULL::categ_cafea)) AS categorie";
        const rezOptiuni = await client.query(queryOptiuni);
        res.locals.categoriiMeniu = rezOptiuni.rows.map(row => row.categorie);
        next();
    } catch (err) {
        console.error("Eroare la obținerea opțiunilor de categorie pentru meniul de navigare:", err);
        res.locals.categoriiMeniu = [];
        next();
    }
});

app.use("/resurse", express.static(path.join(__dirname,'resurse')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"))
})

app.get("/galerie", (req, res) => {
    const lunaCurenta = getLunaCurenta();
    const imaginiFiltrate = obGlobal.obImagini.imagini
        .filter(imagine => imagine.luni.includes(lunaCurenta))
        .slice(0, 12);
    res.render("pagini/paginagalerie", {
        imaginiGalerie: imaginiFiltrate
    });
})

app.get(["/", "/home", "/index"], (req, res) => {
    const lunaCurenta = getLunaCurenta();
    const imaginiFiltrate = obGlobal.obImagini.imagini
        .filter(imagine => imagine.luni.includes(lunaCurenta))
        .slice(0, 12);
    res.render("pagini/index",{ip: req.ip, imagini:obGlobal.obImagini.imagini, imaginiGalerie: imaginiFiltrate});
});

app.get("/index/a", (req, res) => {
    res.render("pagini/index");
});

app.get("/cerere", (req, res) => {
   res.send("<p style='color: green'>Buna ziua!</p>")
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
    client.query(queryOptiuni, function(errOptiuni, rezOptiuni){
        if (errOptiuni) {
            console.error("Eroare la obținerea opțiunilor de categorie:", errOptiuni);
            afisareEroare(res, 500, "Eroare internă a serverului", "Nu s-au putut obține categoriile de cafea.");
            return;
        }

        const queryProduse = `SELECT * FROM cafea ${conditieSQL}`;
        client.query(queryProduse, valoriSQL, function(errCafele, rezCafele){
            if (errCafele){
                console.error("Eroare la obținerea cafelelor:", errCafele);
                afisareEroare(res, 500, "Eroare internă a serverului", "Nu s-au putut obține produsele.");
            } else {
                res.render("pagini/produse", {
                    cafele: rezCafele.rows,
                    optiuniCategorie: rezOptiuni.rows
                });
            }
        });
    });
});

app.get("/produs/:id", function(req, res){
    const productId = req.params.id;

    client.query("SELECT * FROM cafea WHERE id = $1", [productId], function(err, rezultatProdus){
        if (err){
            console.error("Eroare la interogarea bazei de date:", err);
            afisareEroare(res, 500, "Eroare internă a serverului", "A apărut o eroare la procesarea cererii tale."); // Utilizează funcția afisareEroare
        }
        else{
            if (rezultatProdus.rows.length === 0){
                afisareEroare(res, 404, "Produs inexistent", "Ne pare rău, produsul solicitat nu a fost găsit."); // Utilizează funcția afisareEroare
            }
            else{
                res.render("pagini/produs", { prod: rezultatProdus.rows[0] });
            }
        }
    });
});

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, (req, res, next) => {
    afisareEroare(res, 403);
})

app.get("/*.ejs", (req, res, next) => {
    afisareEroare(res, 400);
})

/// ASTA E GENERAL, NU MAI TREBUIE SA FAC 100 DE APP.GET PENTRU FIECARE PAGINA
app.get("/*", (req, res, next) =>{
    try{
        res.render("pagini" + req.url, (err, res_render) => {
            if(err) {
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res, 404);
                }
                else{
                    afisareEroare(res)
                }
            }else{
                res.send(res_render);
            }
        })
    }catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res, 404);
        }else{
            afisareEroare(res);
        }
    }
})

app.listen(8080);
console.log("Serverul a pornit");
