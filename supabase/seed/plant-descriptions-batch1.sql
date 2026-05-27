-- First batch of long-form plant descriptions for SEO.
-- 12 of Sweden's most-popular hobby crops, ~250–300 words each, focused on
-- pallkrage growing under Swedish conditions. Run via `supabase db push`
-- locally, or apply via the Supabase MCP (which is what we did first time).
--
-- Idempotent: only updates the description column; safe to re-run.
-- Tone: practical, zone-aware, no AI-marker words like "delve into" or
-- "embark on". This is content meant to look like a knowledgeable human
-- gardener wrote it.

UPDATE public.plants SET description = $K$Tomaten är pallkragens klassiska stjärna. En enda planta i en 30×30 cm-ruta ger lätt 3–5 kilo frukt under en bra säsong. Tomater behöver långt växtfönster, så i Sverige sår vi nästan alltid inomhus — räkna med 8–10 veckor från sådd till utplantering. I zon Z1–Z3 betyder det sådd i mitten av mars; längre norrut (Z5–Z8) kan du behöva vänta till april.

Så frön på 1 cm djup i krukor på fönsterbrädan vid 22–25 °C. Plantera om till större kruka när första riktiga bladparet kommit. Härda av plantorna i en vecka innan utplantering — först när nattfrosten är säkert förbi, vanligen mitten av maj till början av juni beroende på zon.

I pallkragen ger du tomaten en hel ruta för sig själv. Stöd plantan med pinne eller bambu från start — när skörden kommer väger den. Tjuva bort sidoskott regelbundet på buskformade sorter; cherrytomater behöver oftast inte tjuvas. Vattna vid roten, inte på bladen — bladmögel sprider sig snabbt med fukt.

Goda grannar är basilika (förbättrar smak, avskräcker bladlöss) och ringblomma (drar nematoder från rötterna). Undvik att plantera nära potatis eller kålväxter — de delar sjukdomar.

Skördas allt eftersom från juli till första frosten. Mogen tomat lossnar lätt om man vrider den, omogen sitter fast. Frosttoleranta sorter som "Latah" eller "Glacier" är bra val för Norrland; "Sungold" och "San Marzano" passar resten av landet.$K$ WHERE slug = 'tomat';

UPDATE public.plants SET description = $K$Morötter är en av de mest tacksamma rotfrukterna i pallkragen. På en enda ruta får du plats med 16 plantor — alltså 16 fullvuxna morötter per 30×30 cm. Direktsås utomhus eftersom morötter inte tål omplantering; pålroten skadas och blir krokig.

Så frön så fort marken kan bearbetas, vanligen mars–april i södra Sverige, april–maj längre norrut. Frön ligger ytligt — 0,5–1 cm djup. Tunna såraderna när plantorna är 3–4 cm höga; behåll de starkaste på 4–6 cm avstånd, vilket blir 4×4 plantor per ruta.

Marken ska vara djupt luckrad och stenfri — morötter växer rakt ner och en sten på vägen blir en krokig morot. Pallkragens kontrollerade jord är därför ideal. Undvik färsk gödsel; det ger förgrenade rötter. Håll jorden jämnt fuktig under groningen (10–20 dagar) och vattna sedan grundligt en gång i veckan.

Morotsfluga är det största hotet i Sverige. Den lägger ägg vid rotbaserna och larverna gnager gångar i rötterna. Skydda med fiberduk under hela säsongen, eller blanda morotsodlingen med lök, gräslök eller dill — luktinslagen förvirrar flugan.

Goda grannar är lök, gräslök och rosmarin. Undvik dill när moroten ska bli stor — dill konkurrerar om samma näringsämnen.

Skördas från ~70 dagar för tidigsorter (Nantes, Amsterdam) till 90–100 dagar för förvaringssorter (Berlikum, Flakkée). Knip i toppen av blasten — då går moroten lättare upp. Förvara i sand i källaren, eller i kylskåp utan blast.$K$ WHERE slug = 'morot';

UPDATE public.plants SET description = $K$Huvudsallat är en av de enklaste och snabbaste odlingsväxterna för pallkrage. Med 4 plantor per ruta får du en kontinuerlig skörd om du sår var tredje vecka. Sallat är inte särskilt frostkänslig — det är en riktig vår- och höstgröda som ogärna vill ha varma sommardagar.

Direktsådd från slutet av mars i södra Sverige (Z1–Z3), april–maj i mellersta och norra delar. Försådd inomhus 3–4 veckor innan utplantering ger en något tidigare skörd. Sallatsfrön behöver ljus för att gro — strö ut dem på ytan och tryck lätt ner, vattna med spray istället för stril.

Plantor behöver minst 4–5 timmar sol om dagen, men trivs bättre i halvskugga under julis hetta — då blir bladen mörkare och söta istället för bittra. En tomatplantas skugga i samma pallkrage är därför en fördel för sallat. Vattna ofta men måttligt: för torr jord ger bittra blad, för blött ger mögel.

Goda grannar är morot, rödbeta och ärtor — alla relativt korta plantor som inte konkurrerar om ljus. Undvik selleri och persilja, som hämmar varandras tillväxt.

Skördas hel (när huvudet är fast) eller löv för löv genom hela säsongen. Klipps bara de yttre bladen så fortsätter plantan att producera i veckor. Vid riktigt varm sommar går sallat i blom ("bolting") — då blir bladen beska och plantan kan kasseras. Så då en ny omgång för höstskörd istället. Höstskörden kan vara klar fram till oktober i milda söderlägen.$K$ WHERE slug = 'huvudsallat';

UPDATE public.plants SET description = $K$Basilika är pizza-trädgårdens stjärna och en av de växter som faktiskt blir bättre i pallkrage än i fri jord — basilika tål dåligt fuktiga rötter, och den höjda jorden dränerar perfekt. 4 plantor per ruta är lagom.

Sås alltid inomhus — basilika är extremt frostkänslig och behöver minst 20 °C för att gro ordentligt. Räkna med 6–8 veckor från sådd till utplantering. I praktiken: så i mitten av april, plantera ut i juni när nätterna är säkert över 10 °C. Frön sås ytligt (0,5 cm) och täcks lätt. Gro vid 22–24 °C, ljus från start.

När plantorna har 4–6 riktiga blad, plantera om till större kruka eller direkt ut. Sol är ett måste — minst 6 timmar per dag. Vattna vid roten, aldrig på bladen.

Knip topparna regelbundet när plantan är 15 cm hög för buskig växt och fortsatt bladproduktion. Låt aldrig basilika blomma om du vill ha bladskörd — så fort knoppar dyker upp, knip av dem. Bladen blir hårda och beska efter blomning.

Goda grannar är tomat (klassikern — basilika sägs förbättra smaken och avskräcker bladlöss + vita flugor) och paprika. Undvik gurka och fänkål.

Skördas löpande från juni till första frosten. Stora skördar bör torkas eller frysas — basilika klarar inte kyla och förlorar smak snabbt i kylskåp. För frysning: hacka, blanda med olivolja, frys i isbitsformar. Då fungerar den hela vintern i såser och pesto.$K$ WHERE slug = 'basilika';

UPDATE public.plants SET description = $K$Salladsgurka klättrar gärna uppåt och passar därför perfekt i pallkrage med spaljé eller klättergaller. 2 plantor per ruta är lagom — varje planta blir en lång ranka.

Försås inomhus 3–4 veckor före utplantering. Frön gror snabbt vid 22–25 °C, vanligen inom en vecka. Plantera om bara en gång — gurkor ogillar att flyttas. Härda av i en vecka innan utplantering, som inte ska ske förrän jordtemperaturen är minst 15 °C, vanligen början av juni.

Pallkrage med ett klättergaller på norrsidan är ideal. Bind upp huvudstammen tidigt och låt sidoskotten klättra. Knip toppskotten vid 1,8 m för att stoppa höjden — då lägger plantan kraft på frukter istället för mer ranka.

Sol och jämn vattning är A och O. Torka leder till bittra gurkor; ojämn vattning ger förvridna frukter. Vattna djupt 2 gånger i veckan, hellre än lite varje dag. Mulcha med halm för att hålla fukten.

Goda grannar är böna, ärta och solros — de senare ger naturlig skugga och struktur att klättra på. Undvik potatis och salvia.

Mjöldagg är den vanligaste sjukdomen — vita beläggningar på bladen i augusti. Föregå genom god luftcirkulation och vattning enbart vid roten. Plantor som drabbas hårt: ta bort, undvik samma ruta nästa år.

Skörda när gurkorna är 15–20 cm långa och fortfarande mjukt gröna. Övermogna gurkor blir gula, bittra och stoppar fortsatt produktion. Med daglig skörd får du frukt från slutet av juli till första frosten.$K$ WHERE slug = 'salladsgurka';

UPDATE public.plants SET description = $K$Spenat är en av de få bladväxterna som klarar svensk vår och höst utan problem. 9 plantor per ruta. Tål lätt frost — kan sås så snart marken kan bearbetas, vanligen mars i söder, april i norr.

Direktsås 1 cm djup, gror inom 1–2 veckor vid 10–15 °C. Spenat ogillar varma jordar; vid temperaturer över 20 °C kommer plantorna att skjuta i blom istället för att producera blad. Därför är det smartare att så två omgångar — en på våren (mars–april) och en på sensommaren (mitten av augusti).

Halvskugga är att föredra under sommaren. En högre växt som ärta eller solros i en intilliggande ruta ger naturligt skydd.

Skötseln är minimal: jämn vattning, lite kvävegödsel halvvägs in i odlingen. Bladlöss är det vanligaste problemet — spruta av med vatten eller plantera bredvid gräslök för avskräckande lukt.

Goda grannar är jordgubbe, kålväxter och ärta. Undvik mangold (släktingar konkurrerar om samma näring).

Skördas löpande från ~30 dagar för babyspenat till ~50 dagar för mogna blad. Klipp av yttre blad så fortsätter plantan att producera. När plantan börjar bilda en lång stjälk i mitten — det är blomningen som startar — är det dags att skörda allt och så nytt. Höstskörden kan vara klar fram till september, och i milda söderlägen ända till oktober. Frostiga blad är fortfarande ätbara.$K$ WHERE slug = 'spenat';

UPDATE public.plants SET description = $K$Rädisa är den snabbaste odlingsväxten i pallkragen — frö till skörd på 25–35 dagar. 16 plantor per ruta. Idealisk för nybörjare och för att fylla luckor mellan långsammare grödor.

Direktsås 1 cm djup, vanligen från mars till september med 2–3 veckors mellanrum för kontinuerlig skörd. Frön gror snabbt vid 10–15 °C, vanligen inom 5–10 dagar.

Rädisor är ett perfekt val för "intercropping" — så dem mellan morötter eller palsternacka. Rädisorna är skördade och borta innan rotfrukten behöver utrymmet.

Skötseln är så enkel det blir: vattna jämnt, lite näring behövs. Torka ger sega, trådiga rädisor; för mycket näring ger stora blad och små rötter. Direktsådda rädisor i pallkrage är nästan oöverträffat i smak jämfört med butiksvarianten.

Goda grannar är morot, sallat, gurka och bönor. Rädisor avskräcker faktiskt gurkbaggar — så några intill gurkplantorna fungerar som naturligt skydd.

Loppor (jordloppor) är största problemet — små runda hål i bladen. Skydda nyplanterade rader med fiberduk de första 2–3 veckorna.

Skördas så snart roten är 2–3 cm i diameter; större = trådigt + starkt. Drar du upp en rädisa och den är liten, vänta en vecka. Är den övermogen och spricker — komposten, så nästa omgång. Rädisor är inget man förvarar; ät dem direkt eller inom några dagar.$K$ WHERE slug = 'radisa';

UPDATE public.plants SET description = $K$Rödbeta är en av de mest tacksamma rotfrukterna för pallkrage. 9 plantor per ruta. Tål både kyla och en del torka — pålitlig i hela Sverige.

Direktsås från slutet av april i södra Sverige, maj längre norrut. Frön är faktiskt "frökluster" — varje "frö" innehåller 2–4 plantor. Tunna såraderna tidigt så att varje planta får sin egen ruta. De som dras upp är ätbara som mikrogrönt.

Frön sås 2 cm djup, gror vid 10–20 °C på 7–14 dagar. Markstemperatur över 7 °C är minimum.

Rödbeta behöver borrik jord — bristen visar sig som svarta fläckar inuti rotan. Använd havsalgsgödning eller var noga med kompost när du fyller pallkragen. Vatten jämnt; ojämn vattning ger trådig konsistens.

Goda grannar är lök, kål, bönor och sallat. Undvik bönväxter direkt bredvid (de konkurrerar om kväve) och låga gräs som hämmar.

Skördas från ~55 dagar för babybetor (4–5 cm) till ~80 dagar för fullstora. Bladen är också ätbara — smakar som mangold. Skörda gradvis genom säsongen — dra upp var fjärde när de är 5 cm i diameter och låt resten växa större.

Förvaras i sand i källare hela vintern; eller koka, skala och frys; eller pickla. Pickled rödbetor är en svensk klassiker som håller flera år.$K$ WHERE slug = 'rodbeta';

UPDATE public.plants SET description = $K$Ärta är vinterodlingens motsats — älskar svalt och fuktigt, vill bli klar innan sommarvärmen kommer. 8 plantor per ruta. Direktsås så fort marken är arbetsbar, vanligen mars–april. Tål lätt frost.

Frön sås 2–3 cm djup. Blötlägg i 24 timmar före sådd för snabbare groning (3–10 dagar). Plantera nära ett klätterstöd från start — ärta klättrar inte långt (40–80 cm beroende på sort) men behöver något att hänga på. Pinnar, ett enkelt nät eller en spaljé fungerar.

Skötseln är minimal. Ärtor fixerar kväve från luften via knöldjur på rötterna, så de behöver knappt någon gödning. Vatten regelbundet under skidsbildningen.

Goda grannar är morot, rädisa och sallat — ärtor förbättrar jorden för efterföljande grödor genom kvävefixering. Undvik lök och vitlök — de hämmar ärtans tillväxt.

Skördas när skidorna är fyllda men fortfarande gröna. Plocka regelbundet — en planta som inte skördas slutar producera. Tidigsorter (Frühe Heinrich, Boogie) är klara på ~55 dagar; senare på ~70.

I varm sommar blir ärtor mjölaktiga och slutar producera — då är säsongen slut. Riv upp plantorna men låt rötterna ligga kvar i jorden som naturlig gödning för nästa gröda. En klassisk efterföljare i samma ruta är sallat eller spenat för höstskörd.$K$ WHERE slug = 'arta';

UPDATE public.plants SET description = $K$Zucchini är pallkragens kraftpaket men kräver utrymme — 0,25 plantor per ruta, dvs 1 planta över 4 rutor. En enda planta kan ge 20+ frukter under sommaren.

Försås inomhus 3–4 veckor före utplantering i april–maj. Frö gror snabbt (1 vecka) vid 20–25 °C. Direktsådd är möjlig från slutet av maj i söder, men försådda plantor ger längre säsong.

Plantera ut när nätterna är säkert över 10 °C, vanligen mitten av juni. Zucchini är frostkänslig och blir snabbt sjuk i kall jord.

Jord behöver vara näringsrik — zucchini är en av de mest näringskrävande växterna i odlingen. Toppdressa med kompost var tredje vecka. Vattna djupt, gärna mulchat. Vattenstress = bittra frukter.

Goda grannar är böna, majs och solros ("three sisters"-kombinationen). Undvik potatis och fänkål.

Pollinering är ofta en flaskhals — om frukter blir små och gula och faller av är problemet bina som inte hittar fram. Plantera ringblomma eller borago bredvid för att locka pollinerare. Vid behov: handpollinera med en pensel mellan han- och honblommor (honblomman har en liten zucchini i botten).

Skörda när frukterna är 15–20 cm — större = vattnig och seg. En skörd om dagen i högsäsong är inte ovanligt. Bladen är taggiga; använd handskar. Frost slutar säsongen tvärt.$K$ WHERE slug = 'zucchini';

UPDATE public.plants SET description = $K$Gräslök är pallkragens perenna lyx — sätt en gång, skörda i 5+ år. 16 plantor per ruta. Tål svensk vinter över hela landet utan skydd.

Försås inomhus i mars eller direktsås i april. Frö gror långsamt (2–3 veckor) vid 15 °C. Många väljer att köpa småplantor istället — gräslök är så lätt att etablera att försådd sällan lönar sig.

Plantera ut i klumpar om 8–12 stänglar; dela klumpen var 3:e år för att hålla plantan vital. Sol till halvskugga, fukt regelbundet men inte våt — gräslök tål inte vattensjuk jord.

Skötseln är minimal. Klipp av allt 5 cm över jord när blomning startar för att tvinga ny tillväxt. Blommorna är ätbara — strö över sallad. Övervintrar perfekt; dra inte upp stänglarna på hösten.

Goda grannar är morot, tomat och jordgubbe — gräslök avskräcker bladlöss, morotsfluga och spinnkvalster. En av de bästa "växtskydds-grödorna" i pallkragen.

Skördas löpande från maj till oktober. Klipp aldrig mer än en tredjedel åt gången — låt resten regenerera. Frys i isbitsformar med vatten, eller torka för vintern (förlorar dock en del smak vid torkning).$K$ WHERE slug = 'graslok';

UPDATE public.plants SET description = $K$Vitlök sätts på hösten i Sverige — oktober till november, beroende på zon. 9 plantor per ruta. Övervintrar och skördas följande sommar.

Köp svenska sättvitlök, inte importerad matvitlök (matvitlök är ofta behandlad mot grodd). Bryt isär klyftor strax före sättning; lämna det yttersta skalet på. Sätt med spetsen uppåt, 5 cm djup, 10 cm mellanrum.

Vitlök behöver kallchock för bra knöl — det är därför hösten är rätt tid. Sätter du på våren får du mest blast, lite knöl.

Mulcha med halm för vinterskydd och fuktreglering. På våren börjar blasten skjuta upp; ta bort vid eventuell snökrust så plantorna inte ruttnar.

Hardneck-sorter (de flesta svenska) bildar "scapes" — krullande blomstjälkar — i juni. Bryt av dem så lägger plantan energin på knölen istället. Scapen är dessutom utmärkt i pesto eller stekt.

Skördas i juli–augusti när nedre 3–4 bladen gulnat men de övre är gröna. För sen skörd = klyftorna delar sig i jorden; för tidig = liten knöl. Dra upp, låt torka i skugga i 2–3 veckor, klipp av blasten och förvara svalt + torrt.

Goda grannar är tomat, rödbeta, kål och jordgubbe. Undvik bönor och ärtor — vitlök hämmar baljväxters kväveupptag.$K$ WHERE slug = 'vitlok';
