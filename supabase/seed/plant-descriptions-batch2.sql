-- Batch 2 of long-form plant descriptions for SEO.
-- 15 more plants — herbs, peppers, brassicas, root vegetables, alliums.
-- See plant-descriptions-batch1.sql for tone + structure.

UPDATE public.plants SET description = $K$Paprika är pallkragens varmaste val — kräver lång och solig sommar, men belönar med flera kilo frukt per planta. 1 planta per ruta. I Sverige är försådd obligatorisk; säsongen är för kort för direktsådd utomhus.

Så frön inomhus 10–12 veckor före utplantering. För zon Z1–Z3 betyder det februari–mars; längre norrut är det knappt meningsfullt utan växthus. Frön gror långsamt (2–3 veckor) vid 25–28 °C — använd värmematta eller ovanpå kylskåpet. Tändlampa under kvällarna är nästan ett måste; svenska februaridagar är för korta.

Plantera om till större kruka när första riktiga bladparet kommit. Härda av i 1–2 veckor innan utplantering, som först ska ske när nattemperaturen är säkert över 12 °C — vanligen mitten av juni.

Paprika är extremt sol- och värmekrävande. Plats i pallkragens varmaste hörn, eller direkt mot en söderfasad. Mulcha för att hålla jorden varm. Stötta plantan tidigt — paprikastammar är spröda och kan brytas av sina egna frukter.

Vattna jämnt djupt en gång i veckan; oregelbunden vatten orsakar blomändröta (svarta fläckar på fruktens botten). Toppdressa med kompost halvvägs in i säsongen.

Goda grannar är basilika, morot och tomat. Undvik kålväxter och bönor.

Skörda gröna paprikor från ~75 dagar; röda eller gula (samma planta, mognare frukt) från ~90 dagar. Mogna paprikor är sötare men plantan producerar färre per säsong. Frost slutar säsongen tvärt; ofta lönar det sig att ta in plantan i kruka för en sista skörd inomhus.$K$ WHERE slug = 'paprika';

UPDATE public.plants SET description = $K$Chili är som paprika fast varmare, längre och mer tacksam i pallkrage — chiliplantor är ofta små och tål kruka. 1 planta per ruta.

Försås inomhus 10–14 veckor före utplantering. För svensk säsong: så i januari–februari, plantera ut i juni. Frön gror långsamt vid 25–28 °C; värmematta hjälper mycket. Vissa supersorter (habanero, ghost) kan kräva 4 veckor bara för groning.

Plantera om till större kruka stegvis. Chili lyckas också utmärkt på altan eller i växthus — om sommaren ser kall ut, behåll dem i kruka och flytta inomhus när nätterna blir kalla.

Sol är ett måste — minst 6 timmar per dag. Vattna måttligt men jämnt; chiliplantor tål viss torka bättre än paprika och hettare frukter (mer capsaicin) får man med lite kontrollerad vattenstress sent i säsongen.

Goda grannar är basilika, oregano, morot och tomat. Undvik bönväxter.

Skörda gröna chili från ~75 dagar; röda eller gula (helt mogna) från ~95 dagar. Mogen chili är hetare och fyllig i smak. Skörda löpande — fler frukter tas av plantan, fler ger den ny chans att producera. Vid säsongsslut: hela plantor kan tas in och fortsätta producera inomhus, eller torka skördade chili i kedjor (klassisk metod).

Vid hantering: använd handskar för hetta sorter. Capsaicin överförs lätt till händer, sedan ögon. Tvätta med olja, inte vatten — capsaicin är fettlösligt.$K$ WHERE slug = 'chili';

UPDATE public.plants SET description = $K$Jalapeño är det "mellanstarka" chilivalet — hetare än paprika, mildare än habanero. 1 planta per ruta. Mer tolerant mot svensk sommar än många andra heta chilisorter.

Försås inomhus 10 veckor före utplantering, alltså mars för utplantering i juni. Frön gror vid 22–25 °C på 1–2 veckor. Lite tålamod — chili gror sällan snabbt.

Plantera om till större kruka när bladpar 2 syns. Härda av en vecka innan ut. Jalapeño är mindre värmekrävande än stora paprikor; tål svenska sommarnätter ner till 10 °C utan att tappa fart.

Vattna måttligt och jämnt. Övervattning ger smaklös frukt. Sol minst 6 timmar.

Goda grannar är basilika, koriander och tomat — klassiska salsa-trädgårdsväxter. Undvik bönor och ärtor.

Skörda från ~70 dagar. Gröna jalapeños är de man hittar färska i butik; röda är samma sort men helt mogna, sötare och hetare. Skörda löpande — fler frukter tas, fler kommer.

Förvaring: gröna håller en vecka i kylen. Röda kan torkas (då blir det "chipotle" om de röks) eller pickla för långhållbarhet. En enda planta ger lätt 30–50 frukter under en svensk sommar.$K$ WHERE slug = 'jalapeno';

UPDATE public.plants SET description = $K$Sockerärt är ärtans söta kusin — skidan äts hel medan ärtorna fortfarande är små. 8 plantor per ruta. En av de mest barnvänliga växterna i pallkragen; barnen äter dem direkt från plantan.

Direktsås så snart marken är arbetsbar, vanligen mars–april. Sockerärtor tål lätt frost vid groning men inte tung kyla. Blötlägg frön 12–24 timmar före sådd för snabbare start.

Sås 3 cm djup, 10 cm mellanrum. Sätt klätterstöd från start — sockerärt klättrar 1–2 meter beroende på sort. Spaljé, ett nät eller pinnar fungerar; pallkrage med ett gallerstaket bakom är ideal.

Skötseln är minimal. Som alla baljväxter fixerar de kväve via rotknölar — ingen extragödning behövs. Vatten regelbundet, särskilt när skidorna börjar bildas.

Goda grannar är morot, rädisa, sallat — sockerärtor förbättrar jorden för efterföljande grödor. Undvik lök och vitlök, som hämmar baljväxters tillväxt.

Skörda när skidorna är fyllda men ärtorna fortfarande små och söta. Vänta för länge → trådiga, hårda skidor. Skörda dagligen i högsäsong — plantan slutar producera om gamla skidor sitter kvar.

Klassiska sorter är "Sugar Snap" (rundare skidor), "Mammoth Melting Sugar" (platta skidor). Säsongen är typiskt 60–70 dagar; sluta producera i värmen runt augusti. Riv upp plantorna och så efterföljande gröda i samma ruta.$K$ WHERE slug = 'sockerart';

UPDATE public.plants SET description = $K$Grönkål är pallkragens hårdaste arbetare — en planta per ruta som skördas hela hösten och vintern. Klarar temperaturer ner till -10 °C utan skydd, och bladen blir faktiskt sötare efter den första frosten.

Försås inomhus 4–6 veckor före utplantering. För huvudskörd: så i april, plantera ut i maj–juni. För vinterskörd: så i juli, plantera ut i augusti. Den senare omgången är klassisk svensk metod — fyll luckor när sommarplantor är klara.

Frön sås 1 cm djup, gror vid 15–20 °C på 5–10 dagar. Plantor är robusta — inga särskilda fönsterbrädsmysterier.

Plantera ut med 30 cm mellanrum (en planta per pallkrage-ruta). Mulcha generöst. Vatten regelbundet, gödsla halvvägs in i säsongen.

Goda grannar är lök, vitlök, rödbeta, dill, gräslök. Undvik tomat, jordgubbe och övriga kålväxter (samma sjukdomar).

Kålfjäril är värsta fienden — vita fjärilar som lägger ägg som blir till gröna larver vilka äter bladen till grunden. Skydda med fiberduk eller insektsnät från utplantering. Plocka ägg och larver för hand om det är få plantor.

Skördas löpande från ~55 dagar. Klipp av yttre blad så fortsätter plantan att producera. Vinterskörd direkt från plantan — frostiga blad är fortfarande ätbara och söta. Smoothie-grönkål är pallkragens vinter-superfood.$K$ WHERE slug = 'gronkal';

UPDATE public.plants SET description = $K$Mangold är spenatväxternas elaka kusin — varma färger, stora blad, perenn-aktig livslängd. 4 plantor per ruta. Tål både sommarvärme (där spenat går i blom) och första frosten.

Direktsås 1 cm djup när marken är arbetsbar, vanligen april. Försås kan göras inomhus 3–4 veckor tidigare för försprång. Frön är "kluster" (flera plantor per frö) — tunna såraderna när plantor är 5 cm höga.

Mangold är otroligt långsmal i pallkrage — en planta producerar i månader om man bara skördar yttre blad. Sorter med röda, gula och orangea stjälkar ("Bright Lights", "Rhubarb Chard") gör dessutom pallkragen vacker.

Halvskugga är OK under sommarens hetta. Vatten jämnt men inte överdrivet. Mangold är mer torktolerant än spenat eller sallat.

Goda grannar är böna, kålväxter, lök, ringblomma. Undvik spenat (samma näringsbehov).

Skördas löpande från ~50 dagar. Klipp yttre blad 5 cm över jord; plantan producerar nya. En väl skött mangoldplanta kan ge skörd från juli till oktober. I milda svenska söderlägen övervintrar plantor och producerar igen följande vår.

Bladen kan användas som spenat (raw eller stekt); stjälkarna är bäst lätt stekta eller picklade. Större blad blir lite sega — då används stjälkarna och bladens mittnerv som "selleri" i grytor.$K$ WHERE slug = 'mangold';

UPDATE public.plants SET description = $K$Palsternacka är morotens svenska tradition — perfekt för långförvaring och vintergrytor. 9 plantor per ruta. Tål kyla utmärkt, blir sötare efter frost.

Direktsås så fort marken är arbetsbar, vanligen mars–april. Palsternackefrön har dålig grobarhet (40–60 %) och gror långsamt — 14–28 dagar. Använd alltid årsfärska frön. Markera raderna med snabba rädisor mellan plantorna; rädisorna är skördade innan palsternackan börjar växa.

Frön sås 1 cm djup. Tunna till 10 cm mellanrum när plantor är 5 cm höga — 3×3 plantor per ruta i pallkrage.

Palsternacka behöver djup, stenfri och löst luckrad jord — pallkragens kontrollerade djup är därför ideal. Undvik färsk gödsel; ger förgrenade rötter.

Vatten regelbundet under hela säsongen. Mulcha för fukthållning.

Goda grannar är morot, lök, rädisa och böna. Undvik selleri (besläktade).

Skördas från ~120 dagar — sen september till första snön. Tradition: vänta tills marken har frusit en gång; då koncentreras stärkelsen till socker och rötterna blir markant sötare. Många svenska odlare lämnar palsternackan i marken över vintern och tar upp på våren — de håller sig perfekt om de inte fryser sönder helt.

Förvaras i sand i källaren, eller skala-koka-frys. Klassisk användning: rotmos tillsammans med morot och potatis.$K$ WHERE slug = 'palsternacka';

UPDATE public.plants SET description = $K$Rucola är sallaten med peppar — snabbväxande bladväxt med karaktäristisk pepparsmak. 9 plantor per ruta. Idealisk för pallkrage; klar på 3–4 veckor.

Direktsås från slutet av mars i söder, april i mellan- och Norrland. Frön sås ytligt (0,5 cm), gror vid 10–15 °C på 5–7 dagar.

Rucola är så snabb att den passar perfekt för "successionsodling" — så lite varje vecka för konstant skörd från april till september. När bladen blir för stora och hetta intensifieras dra upp plantan och så nytt.

Sol till halvskugga — under julis sommarvärme föredrar rucola halvskugga, annars skjuter den i blom snabbt. Vatten jämnt; torra plantor blir bittra och brännande heta.

Skötseln är minimal. Lite kvävegödning vid behov.

Loppor (jordloppor) är en plåga på unga plantor — små runda hål i bladen. Fiberduk de första 2 veckorna efter sådd skyddar effektivt.

Goda grannar är morot, böna, gurka. Undvik andra kålväxter (samma sjukdomar) och kryddor som basilika (helt olika behov).

Skördas från ~25 dagar för babyleaf till ~40 dagar för stora blad. Klipp yttre blad med sax 3 cm över jord — plantan producerar nya 2–3 gånger till. Sedan börjar den blomma; bladen blir hetta och bittra. Då dra upp och så nytt.

Blommor är ätbara och vackra på sallad. Frön kan samlas in och så själv året efter — rucola är "open-pollinated" och stabil.$K$ WHERE slug = 'ruccola';

UPDATE public.plants SET description = $K$Pak choi är wok-trädgårdens grundsten — knapprig stjälk, mild bladsmak, snabbväxande. 4 plantor per ruta. Asiatiskt ursprung men trivs utmärkt i svenska pallkrage.

Direktsås från april (söder) eller maj (norr). Försås kan göras inomhus 3–4 veckor tidigare. Frön sås 1 cm djup, gror snabbt (5–10 dagar) vid 15–20 °C.

Pak choi är som rucola en utpräglad vår- och höstväxt. Sommarhetta får plantan att skjuta i blom innan den hunnit utveckla stjälkar — kallt och fuktigt = perfekt.

Vatten jämnt och rikligt — pak choi har grunt rotsystem och torkar snabbt. Mulcha gärna.

Goda grannar är lök, vitlök, böna, sallat. Undvik andra kålväxter och tomat.

Kålfjäril och loppor är värsta hoten. Fiberduk från start är nästan obligatoriskt i en kålfri pallkrage. Om plantor blir genomgångna av larver: ge upp, så nytt i en annan ruta nästa omgång.

Skördas från ~45 dagar. Två metoder: hela plantan (skär av strax ovanför rotnacken) eller löv för löv (yttre blad först). Hela-plantan-metoden ger snyggast wokpannor; löv-för-löv ger längre skörd.

Klassisk användning: snabbstekt med vitlök, sojasås och sesam. Pak choi blir bäst av kort tillagning — bladen vissnar på 30 sekunder, stjälkarna är klara på 2 minuter.

Två omgångar per säsong (vår + höst) är typisk svensk odlingsmodell.$K$ WHERE slug = 'pak-choi';

UPDATE public.plants SET description = $K$Salladslök är gräslökens snabbare kusin — sätts som mini-lökar eller direktsås, skördas hel inklusive blast. 16 plantor per ruta. Snabb, lättskött, alltid välkommen i pallkragen.

Direktsås från mars i södra Sverige, april–maj längre norrut. Frön sås 1 cm djup, gror på 10–14 dagar vid 10–15 °C. Alternativ: sätt sättlökar (små lökar köpta för plantering) ett par centimeter under jorden — snabbare än frö, klart skördematerial på 8 veckor.

Plantor är robusta. Lite kvävegödning i mitten av säsongen, jämn vattning. Skadegörare är ovanligt — lukten avskräcker det mesta.

Goda grannar är morot (klassiker — salladslökens lukt skyddar mot morotsfluga), tomat, jordgubbe, kål. Undvik bönor och ärtor (hämmas av lök-släktet).

Skördas hel när stjälken är 1–2 cm i diameter och 25–30 cm hög, vanligen från ~60 dagar. Eller successivt — knip av yttre blad allt eftersom och låt plantan fortsätta producera. Successionsmetoden ger 2–3 ggr så mycket totalt, fast långsammare.

Sortvarianter: vit salladslök (mildare), röd (söt, vackra), bunchande sorter ("Welsh onion") som blir flerårig perenn — sätt en gång, skörda i åratal.

Förvaring: håller en vecka i kylen i fuktig handduk. Eller hacka och frys för wok/salsa-användning.$K$ WHERE slug = 'salladslok';

UPDATE public.plants SET description = $K$Gul lök är pallkragens långförvaringskung — sätts på våren, skördas i juli–augusti, håller hela vintern. 9 plantor per ruta. Praktiskt taget alla svenska kök behöver den.

Sätt sättlökar (små lökar köpta för plantering) från slutet av mars i söder till mitten av maj i norr. Sätt 2 cm djup med spetsen uppåt, 10 cm mellanrum. Frö-metoden fungerar också men tar 4+ veckor extra; sättlökar är standard för svensk hobbyodling.

Lök är förvånansvärt skötselfri. Vatten regelbundet de första 6 veckorna; sluta vattna helt 2 veckor före skörd så lökarna torkar inifrån.

Mulcha lätt med halm för fuktreglering. Undvik tjock mulch — lökar behöver luft kring lökens topp.

Goda grannar är morot (klassisk allianz — löken skyddar moroten från morotsfluga, moroten löken från lökfluga), rödbeta, sallat, jordgubbe. Undvik bönor, ärtor och kål.

Lökfluga är vanligaste hotet — vita maskar gnager lökens nedre del. Skadan syns som plötsligt vissnande blast. Fiberduk de första 4 veckorna skyddar; samodling med morot avskräcker.

Skördas när blasten gulnar och tippar över sig själv, vanligen juli–augusti. Vältra ner blasten med hand för snabbare mognad om så behövs. Dra upp i torrt väder, låt torka i skugga i 2–3 veckor. Klipp blasten 2 cm ovanför löken; flätar man kan låta den sitta kvar för upphängning.

Förvaras svalt och torrt (10–15 °C, låg fuktighet). Håller 6–9 månader. Inte i kylskåp — det förkortar hållbarheten.$K$ WHERE slug = 'gullok';

UPDATE public.plants SET description = $K$Dill är pallkragens lättaste kryddort — sås, kommer upp, blir klar. 1 planta per ruta (dill blir stor men växer luftigt). Två huvuduppgifter: smaksätta inläggningar och locka pollinerare med sina gula blommor.

Direktsås från april (söder) till maj (norr). Försås rekommenderas inte — dill har pålrot som inte tål omplantering. Frön sås 0,5 cm djup, gror vid 10–20 °C på 7–14 dagar.

Dill är så snabbgroende och pålitlig att den är en bra "nybörjarkrydda". Plantor kan bli 60–80 cm höga; ge dem utrymme. Sol minst 5 timmar.

Skötseln är minimal. Lite vatten, ingen extragödning. Plantor blir större och mer aromatiska om de växer i halvskugga under sommarens hetta.

Goda grannar är gurka (klassisk — dill drar in nyttoinsekter som äter gurkbaggar), kål och lök. Undvik morot (samma familj, konkurrerar) och tomat (sägs hämma).

Skördas löpande genom hela säsongen. Klipp av blad till salladsdressingar, fiskrätter, picklad gurka. När plantan blommar (vanligen efter ~60 dagar) blir blommorna gula skärmar — perfekta för pickle-saltlake. Frön mognar i augusti–september och samlas in för nästa års sådd eller kryddanvändning.

Dill självsår sig glatt om man låter blommor stå kvar — nästa år dyker det upp dillplantor på överraskande ställen i pallkragen. Pull oönskade upp, släpp resten att växa.$K$ WHERE slug = 'dill';

UPDATE public.plants SET description = $K$Persilja är pallkragens bäst-bevarade hemlighet — tvåårig växt som ger massiv skörd andra året om den får övervintra. 4 plantor per ruta.

Försås inomhus 6–8 veckor före utplantering, eller direktsås från april. Persiljefrön är ökänt långsamma — 21–28 dagar för groning, vid 15–20 °C. Blötlägg fröna 24 timmar före sådd så hjälper det rejält.

Det finns två huvudtyper: bladpersilja ("vanlig") med plana blad, och kruspersilja med lockiga. Smak är liknande; krusig är vackrare som garnering, bladig lite mer aromatisk.

Plantera ut när plantor har 4–6 riktiga blad. Härda av en vecka.

Sol till halvskugga, jämn vatten, mulcha. Persilja klarar svensk vinter över större delen av landet med ett lätt täcke av halm eller granris.

Goda grannar är morot, tomat, sparris. Undvik sallat (sägs hämmas).

Skördas löpande från ~70 dagar. Klipp yttre stjälkar med sax; centrum producerar nytt. En väl skött planta ger skörd från juli till första frosten, och i milda svenska söderlägen även genom hela vintern (frodigare som perenn).

Andra året (efter övervintring): plantan skjuter en lång blomstjälk i juni — bladskörden är slut, men blommor och frö är användbara. Lämna någon planta att fröa sig; nästa generation dyker upp självsådd nästa vår.

Klassisk användning: hackad persilja som garnering, persiljepesto, tabbouleh (där persilja är huvudingrediens).$K$ WHERE slug = 'persilja';

UPDATE public.plants SET description = $K$Koriander är salsa-trädgårdens karaktärsväxt — älskad och hatad i lika delar, men oöverträffad i thai-, mexikanskt och indiskt kök. 9 plantor per ruta. Snabbväxande som rucola; klar på ~30 dagar.

Direktsås från april (söder) till maj (norr). Försås rekommenderas inte — koriander har pålrot som tål omplantering dåligt. Frön sås 1 cm djup, gror vid 15–20 °C på 7–10 dagar.

Koriander är extremt blomningskänslig — så fort dagarna blir för långa eller för varma skjuter plantan i blom. Detta är därför en kompromisslös vår- och höstgröda. Successionssådd var 3:e vecka från april till slutet av juni; pausa under julis hetta; så igen i augusti för höstskörd.

Sol till halvskugga; sommarsådd görs gärna helt i skugga. Vatten jämnt; torka triggar blomning omedelbart.

Goda grannar är jalapeño, tomat, spenat, ärta. Undvik fänkål.

Skördas löpande från ~30 dagar. Klipp av yttre blad så fortsätter plantan att producera. Bladen är endast bra fram till blomningen; sedan blir de bittra. När plantan börjat blomma — låt den! Blommorna mognar till "koriander-frön" som är en helt egen krydda, klassisk i thai- och indisk matlagning.

Frön samlas in när skidorna är torra och bruna, vanligen augusti–september. Förvara i lufttät burk; behåller smak i flera år.

En extra knepighet: smak av koriander upplevs av cirka 10 % av folk som "tvål". Genetisk variation i OR6A2-receptorn — du odlar alltså inte koriander om din partner tillhör den gruppen.$K$ WHERE slug = 'koriander';

UPDATE public.plants SET description = $K$Oregano är pallkragens enkla medelhavskrydda — perenn, övervintrar, ger mer för varje år. 4 plantor per ruta. Pizza- och pastatrygdig som ingen annan örtväxt.

Försås inomhus 6–8 veckor före utplantering, eller köp småplantor (rekommenderat). Frön är minimala och dåliga groare — 14–21 dagar vid 18–22 °C. Plantor från plantskola kostar bara några kronor och sparar veckor.

Plantera ut när nattfrosten är förbi, vanligen mitten av maj till mitten av juni. Oregano vill ha torr, väl-dränerad jord — pallkragens höjda jord är perfekt. Sol minst 6 timmar; halvskugga ger smaklös oregano.

Skötseln är extremt minimal. Vatten bara vid längre torka. Ingen extragödning — för mycket näring ger stora blad med dålig smak. Det är torrt växta oregano som har den karakteristiska, koncentrerade smaken.

Goda grannar är tomat, paprika, bönor. Oregano avskräcker dessutom kålfjärilar — bra granne till kålväxter i samma pallkrage.

Övervintrar utmärkt i hela Sverige. Klipps tillbaka till 5 cm över jord i mars för fräsch ny tillväxt.

Skördas löpande från år 1, men tyngsta skörden i år 2–3. Klipp av blomställningar precis innan blommor öppnas — då är smaken som starkast. Hängtorka i buntar i skugga; smula sönder och förvara i mörk burk.

Färska blad är fina i sallad och på pizza; torkade är mer aromatiska och passar grytor och pastasåser. En oregano-planta i pallkragen behöver delas vart 3:e år för att inte konkurrera med sig själv.$K$ WHERE slug = 'oregano';

SELECT slug, length(description) as desc_len FROM public.plants
WHERE slug IN ('paprika','chili','jalapeno','sockerart','gronkal','mangold','palsternacka','ruccola','pak-choi','salladslok','gullok','dill','persilja','koriander','oregano')
ORDER BY desc_len DESC;
