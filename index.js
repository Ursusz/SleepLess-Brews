const express = require("express");
const path = require("path");
const fs = require("fs")

app = express();

// a = {
//     prop: 10,
//     b:["orice", {c: 100}, true, [0, 12, {d:200}]]
// }
// console.log(a.b[3][2].d)

v = [10, 27, 23, 44, 15]
nrimpar = v.find(elem => elem % 2)
console.log(nrimpar);

app.set("view engine", "ejs");

obGlobal={
    obErori:null
}

vect_foldere = ["temp", "backup", "temp1"]
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder)
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}   

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");

    obGlobal.obErori=JSON.parse(continut)

    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)
}

initErori()

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
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"))
    
})


app.get(["/", "/home", "/index"], (req, res) => {
    res.render("pagini/index",{ip: req.ip});
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
