DROP TYPE IF EXISTS categ_cafea;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_cafea AS ENUM('boabe', 'măcinată', 'capsule', 'instant');
CREATE TYPE tipuri_produse AS ENUM('cafea', 'accesorii', 'aparate');

CREATE TABLE IF NOT EXISTS cafea (
                                     id serial PRIMARY KEY,
                                     nume VARCHAR(50) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL,
    greutate INT NOT NULL CHECK (greutate>=0),
    tip_produs tipuri_produse DEFAULT 'cafea',
    intensitate INT CHECK (intensitate BETWEEN 1 AND 5),
    origine VARCHAR(50),
    note_gust VARCHAR [],
    aciditate VARCHAR(50),
    procesare VARCHAR(50),
    categorie categ_cafea DEFAULT 'boabe',
    imagine VARCHAR(300),
    data_adaugare TIMESTAMP DEFAULT current_timestamp
    );

INSERT INTO cafea (nume, descriere, pret, greutate, intensitate, origine, note_gust, aciditate, procesare, categorie, imagine) VALUES
                                                                                                                                   ('Arabica Etiopia Yirgacheffe', 'Cafea boabe single origin, cu note florale și citrice.', 25.99, 250, 3, 'Etiopia', '{"floral", "citric", "bergamotă"}', 'ridicată', 'naturală', 'boabe', 'arabica-etiopia.jpg'),

                                                                                                                                   ('Robusta Vietnam', 'Cafea măcinată, intensă și cu corp bogat.', 18.50, 500, 5, 'Vietnam', '{"ciocolată neagră", "nuci", "amărui"}', 'scăzută', 'uscată', 'măcinată', 'robusta-vietnam.jpg'),

                                                                                                                                   ('Espresso Italian Blend', 'Amestec de cafea boabe pentru un espresso clasic.', 32.75, 1000, 4, 'Brazilia, Columbia, India', '{"ciocolată", "caramel", "note dulci"}', 'medie', 'spălată și naturală', 'boabe', 'espresso-blend.jpg'),

                                                                                                                                   ('Decaf Columbia Supremo', 'Cafea boabe decofeinizată, cu aromă echilibrată și catifelată.', 28.00, 250, 3, 'Columbia', '{"caramel", "nuci", "corp mediu"}', 'medie', 'spălată (proces decaf)', 'boabe', 'decaf-columbia.jpg'),

                                                                                                                                   ('Capsule Espresso Intenso', 'Capsule de cafea cu intensitate ridicată, compatibile cu sistemul X.', 15.20, 50, 5, NULL, '{"intens", "note prăjite", "cremă bogată"}', NULL, NULL, 'capsule', 'capsule-intenso.jpg'),

                                                                                                                                   ('Cafea Instant Gold', 'Cafea instant de calitate superioară, ușor de preparat.', 12.99, 100, NULL, NULL, '{"echilibrat", "aromatic"}', NULL, NULL, 'instant', 'instant-gold.jpg'),

                                                                                                                                   ('Kenya AA', 'Cafea boabe single origin, aciditate vibrantă și arome fructate.', 29.50, 200, 4, 'Kenya', '{"fructe de pădure", "vin", "aciditate ridicată"}', 'ridicată', 'spălată', 'boabe', 'kenya-aa.jpg'),

                                                                                                                                   ('Sumatra Mandheling', 'Cafea boabe cu corp plin, note pământoase și aciditate scăzută.', 31.00, 250, 4, 'Indonezia', '{"pământos", "ierburi", "ciocolată neagră"}', 'scăzută', 'semi-spălată', 'boabe', 'sumatra-mandheling.jpg'),

                                                                                                                                   ('Măcinată French Press', 'Cafea măcinată grosier, ideală pentru prepararea la French Press.', 22.00, 500, 3, 'Brazilia, Etiopia', '{"corp bogat", "note florale"}', 'medie', 'naturală și spălată', 'măcinată', 'macinata-french-press.jpg'),

                                                                                                                                   ('Capsule Lungo Crema', 'Capsule de cafea pentru un lungo cremos și aromat.', 14.80, 55, 3, NULL, '{"fin", "aromatic", "cremă delicată"}', NULL, NULL, 'capsule', 'capsule-lungo.jpg'),

                                                                                                                                   ('Cafea Instant Decaf', 'Cafea instant decofeinizată, pentru o băutură rapidă fără cofeină.', 11.50, 80, NULL, NULL, '{"bland", "ușor"}', NULL, NULL, 'instant', 'instant-decaf.jpg'),

                                                                                                                                   ('Boabe Espresso Barista', 'Amestec premium de boabe, ideal pentru barista acasă.', 38.99, 1000, 4, 'America Centrală și de Sud', '{"nuci", "caramel", "echilibrat"}', 'medie', 'spălată', 'boabe', 'boabe-barista.jpg'),

                                                                                                                                   ('Măcinată Espresso', 'Cafea fin măcinată, perfectă pentru espressor.', 24.50, 250, 4, 'Columbia, Brazilia', '{"ciocolată", "note dulci"}', 'medie', 'spălată', 'măcinată', 'macinata-espresso.jpg'),

                                                                                                                                   ('Capsule Ristretto Intens', 'Capsule pentru un ristretto scurt și intens.', 16.00, 45, 5, NULL, '{"puternic", "note amare"}', NULL, NULL, 'capsule', 'capsule-ristretto.jpg'),

                                                                                                                                   ('Cafea Instant Vanilie', 'Cafea instant cu aromă bogată de vanilie.', 13.75, 120, NULL, NULL, '{"vanilie", "dulce"}', NULL, NULL, 'instant', 'instant-vanilie.jpg');