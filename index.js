const express = require("express");
const path = require("path");
const fs = require("fs")
const sharp = require("sharp")
const sass = require("sass")
const pg = require("pg")

const Client=pg.Client;

client=new Client({
    database:"proiectweb",
    user:"ursu",
    password:"Alexandru20!!",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from prajituri", function(err, rezultat ){
    console.log(err)
    console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::categ_prajitura))", function(err, rezultat ){
    console.log(err)
    console.log(rezultat)
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
    // console.log("cale:", caleCss);
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
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))
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

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
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
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )

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

app.use("/resurse", express.static(path.join(__dirname,'resurse')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"))
})

app.get(["/", "/home", "/index"], (req, res) => {
    res.render("pagini/index",{ip: req.ip, imagini:obGlobal.obImagini.imagini});
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
    console.log(req.query)
    var conditieQuery=""; // TO DO where din parametri


    queryOptiuni=""
    client.query(queryOptiuni, function(err, rezOptiuni){
        console.log(rezOptiuni)


        queryProduse="select * from prajituri"
        client.query(queryProduse, function(err, rez){
            if (err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else{
                res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows})
            }
        })
    });
})

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
