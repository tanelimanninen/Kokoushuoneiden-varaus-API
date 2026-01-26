# Analyysi tekoälyn hyödyntämisestä ohjelmistokehitystehtävässä

## Johdanto

Oman kokemukseni mukaan tekoäly on tehokas työkalu ohjelmistokehityksen työvaiheiden nopeuttamiseen. Kuvailisin sitä eräänlaiseksi ”tehostetuksi Googlaukseksi”, jota kehittäjä on perinteisesti joutunut tekemään runsaasti työnsä ohessa. Tekoälyn käytössä korostuu kuitenkin kehittäjän oma vastuu: langat on pidettävä omissa käsissä. Kehittäjällä täytyy olla kokonaiskuva järjestelmästä sekä riittävä ammattitaito, jotta työskentely pysyy hallittuna eikä päätöksenteko siirry liikaa tekoälylle.

Olen käyttänyt tekoälyä aiemmin erityisesti tekstisisällön tuottamisessa. Tyypillisesti annan tekoälylle selkeän tehtävänannon ja rajat: määrittelen tekstin tarkoituksen, rakenteen, pituuden, painotettavat asiat sekä vältettävät sisällöt. Toisin sanoen tarjoan tekoälylle raamit, joiden sisällä se toimii. Lopullisessa tuotoksessa sovellan tekoälyn ehdotuksia kriittisesti ja teen tarvittavat päätökset itse. Samaa toimintamallia hyödynsin myös tässä ennakkotehtävässä.

## Työskentelytapa ja ajallinen rajaus

Tehtävän aikana käytin tekoälyä nimenomaan työkaluna yksittäisten työvaiheiden tehostamiseen, en prosessin ohjaajana. Koin tärkeäksi edetä paloittain ja syöttää tekoälylle tietoa vaiheittain, jotta kokonaisuus pysyi hallinnassa. Kehittäjänä tein itse arkkitehtoniset ja toiminnalliset päätökset oman osaamiseni pohjalta.

Annoin itselleni tehtävän toteutukseen aikaa noin yhden työviikon verran, eli viisi arkipäivää (noin 7–8 tuntia päivässä). Tällä tavoin pystyin simuloimaan realistista työtilannetta, jossa käytettävissä oleva aika on rajallinen. Samalla haastoin itseäni pysymään asettamassani aikaraamissa ja maksimoimaan tuotoksen annetun työajan puitteissa. Aikarajaus vaikutti myös siihen, mihin osa-alueisiin päätin panostaa eniten ja missä kohtaa tein tietoisia rajauksia. Tämä vastasi hyvin todellista projektityöskentelyä, jossa kaikkia mahdollisia kehitysideoita ei ole tarkoituksenmukaista tai mahdollista toteuttaa.

## Projektin lähtökohdat ja teknologiset valinnat

Aloitin työn määrittelemällä tekoälylle sovelluksen raamit ja vaatimukset. Kuvasin karkeasti arkkitehtuurin, käytettävät teknologiat sekä ohjelmointikielen. Valitsin ratkaisuksi JavaScript-pohjaisen Node.js-ajoympäristössä toimivan Express-webkehyksen, koska tiesin sen olevan kevyt ja nopea tapa toteuttaa palvelin ja REST-rajapinta. Lisäksi sovelluksen olennaisena osana oli muistinvarainen tietokanta, joka oli luontevaa toteuttaa JavaScript-pohjaisesti.

## Tekoälyn rooli projektin alustuksessa

Tekoäly loi annetun aloituskehotteen pohjalta yksinkertaisen, yhden tiedoston API-pohjan. Kun palvelinpuolen perusta oli kunnossa, pyysin tekoälyä luomaan projektiin käyttöliittymän, jonka se toteutti HTML-, CSS- ja JavaScript-kokonaisuutena. Tässä vaiheessa keskityin ensisijaisesti palvelimen toimivuuden varmistamiseen ennen käyttöliittymän jatkokehitystä. Testasin kaikki API-pyynnöt aluksi manuaalisesti Postman-sovelluksella, mikä auttoi hahmottamaan palvelimen toimintaa ja mahdollisia virhetilanteita.

Kun API todettiin toimivaksi, pyysin tekoälyä luomaan rajapinnalle automaatiotestit. Testaukseen käytettiin JavaScript-pohjaista Jest-kirjastoa, ja testien avulla API:n toiminta oli mahdollista varmistaa yhdellä terminaalikomennolla. Tämä nopeutti kehitystä ja toi varmuutta jatkotyöskentelyyn. Käyttöliittymän alustava toteutus tehtiin tekoälyn avustuksella, peilaten suoraan palvelimen toiminnallisuuksiin. Lisäksi pyysin tekoälyä huomioimaan tehtävänannossa määritellyn varauslogiikan jo ennen ensimmäistä Git-committia.

## Tekoälyn rajoitteet projektin kasvaessa

Projektin kasvaessa tekoälyn heikkoudet alkoivat kuitenkin tulla esiin. Se ei automaattisesti ehdottanut selkeää tai skaalautuvaa hakemistorakennetta, joten käytin aikaa koodin ja tiedostorakenteen uudelleenjärjestelyyn. Halusin projektin rakenteen olevan ammattimainen, helposti hahmotettava ja jatkokehitystä tukeva. Pidin myös tärkeänä informoida tekoälyä tekemistäni muutoksista, jotta se pysyisi mukana projektin kehityksessä – hieman kuin kommunikoisi tiimikaverille tehdyistä päivityksistä. Tästä huolimatta tekoäly saattoi myöhemmissä vastauksissaan viitata vanhentuneisiin rakenteisiin tai unohtaa aiemmin tehdyt muutokset. Lisäksi tekoälyn tehokkuus hidastui projektin edetessä.

## Koodin laatu ja ylläpidettävyys

Panostin kehitystyön aikana erityisesti koodin selkeyteen: yhtenäiseen muotoiluun ja kommentointiin. Näitä tekoäly ei oletusarvoisesti tarjonnut ratkaisuissaan, eikä se myöskään kiinnittänyt huomiota koodin luettavuuteen, ellei sitä erikseen pyydetty. Lisäksi tekoälyn vastauksissa ilmeni ajoittain mielistelyn tuntua – se pyrki vahvistamaan käyttäjän oletuksia sen sijaan, että olisi haastanut ratkaisuja kriittisesti. Tämä korostaa käyttäjän vastuuta arvioida tekoälyn tuottamia ehdotuksia.

## Käyttöliittymän suunnittelu ja visuaalinen toteutus

Halusin tehtävässä myös panostaa omiin vahvuusalueisiini ja pitää projektin itselleni motivoivana. Luontevaa oli keskittyä käyttöliittymän toimivuuteen, käytettävyyteen ja visuaaliseen ilmeeseen. Toteutin käyttöliittymän yksisivuisena sovelluksena, mutta panostin sen ulkoasuun, asetteluun ja värimaailmaan. Tavoitteenani oli luoda kokonaisuus, jonka voisi kuvitella osaksi Vincitin verkkosivustoa. Hyödynsin Vincitin sivuilta poimittuja värikoodeja taustaväreissä, painikkeissa ja notifikaatio-elementeissä.

## Käytettävyys ja käyttäjäkokemus

Toteutin käyttöliittymään kustomoidut notifikaatiot, jotka tukivat lomakkeen käyttöä sekä varauksen poisto -toimintoa. Notifikaatiot toimivat ehdollisesti (error/success) ja sisälsivät myös varmistusviestin varauksen poiston yhteydessä. Tämä kulki käsi kädessä palvelimen POST-pyyntöjen validoinnin kanssa ja esti esimerkiksi tyhjän lomakkeen lähettämisen. Käyttäjä pidettiin jatkuvasti ajan tasalla toimintojen onnistumisesta tai epäonnistumisesta.



Käyttöliittymän kehityksen myötä tein myös oletuksen, että varattavien huonetilojen määrä tulisi rajata. Tekoälyn alkuperäinen ratkaisu salli käytännössä minkä tahansa huonearvon, mikä ei ollut järkevää. Muutin lomakkeen huonekentän pudotusvalikoksi, johon sisällytin kolme ennalta määriteltyä tilavaihtoehtoa. Päivitin myös palvelimen muistitietokannan vastaamaan näitä arvoja ja lisäsin huonekohtaisen GET-pyynnön validoinnin, joka varmisti annetun huoneen olemassaolon.

## Toimintalogiikka ja validoinnit

Lisäsin POST-pyyntöihin myös omaa validointilogiikkaa. Toteutin rajauksen, joka esti varausten tekemisen toimistoaikojen (klo 8.00–18.00) ulkopuolella. Mahdollisia lisärajauksia olisi ollut esimerkiksi viikonloppuvaraukset, liian pitkät tai liian lyhyet varaukset, mutta rajasin validoinnin yhteen sääntöön ajankäytön vuoksi. Jokaiselle lisäämälleni validaatiolle toteutin myös oman automaatiotestin, joka varmisti virheellisen datan estymisen.

## Johtopäätökset tekoälyn hyödyntämisestä

Kokonaisuutena tekoäly osoittautui erinomaiseksi työkaluksi projektin alustamisessa, yksittäisten työvaiheiden nopeuttamisessa sekä tiedon kokoamisessa. Sen heikkoudet ilmenivät erityisesti projektin rakenteellisessa suunnittelussa, koodin pitkäjänteisessä hallinnassa ja kriittisessä ajattelussa. Merkittävimmät parannukset tekoälyn tuottamaan koodiin liittyivät koodin siistimiseen, jakamiseen useisiin tiedostoihin, tiedostorakenteen parantamiseen, kommentointiin, virheenkäsittelyyn sekä käyttöliittymän luovaan ja visuaaliseen toteutukseen.

➡️  Tekoäly toimii parhaimmillaan kehittäjän apuvälineenä – ei projektinvetäjänä.