# Tier 3 source and paint pass — 25 September 2026

All **383 workbook Tier 3 identities** and **766 Home/Away slots** have been checked. **548 shirts are ready**, with no drafts or unchecked Tier 3 slots. The other **218 slots lack an independently verified archive reference in an allowed season**. This completes the current research pass, not all Tier 3 artwork.

The complete collection now contains **1,083 ready shirts / 1,470 slots**. **387 remain**: 218 Tier 3 source gaps, 46 previously documented Tier 2 source gaps and 123 researching slots outside these completed passes. Tier 1 remains 276/276; Tier 2 remains 254/300.

| Country | Teams | Ready shirts | Source gaps |
| --- | ---: | ---: | ---: |
| England | 24 | 48 / 48 | 0 |
| Spain | 40 | 80 / 80 | 0 |
| Italy | 60 | 120 / 120 | 0 |
| Germany | 20 | 40 / 40 | 0 |
| France | 18 | 36 / 36 | 0 |
| Romania | 96 | 89 / 192 | 103 |
| Greece | 113 | 115 / 226 | 111 |
| Finland | 12 | 20 / 24 | 4 |

Tier 3 includes 262 teams with both variants ready, 24 with one ready variant and 97 with neither variant available in the checked sources. Competition/event membership has not created duplicate team slots. All 735 identities, 39 associations, 708 first teams, 27 reserve teams, 779 memberships, 27 competition editions and 16 workbook tabs remain intact.

## Season and evidence policy

Prefer independently evidenced 2026/27, retain verified calendar-year 2026, and use the user-authorized 2025/26 fallback when a current variant is absent. Finland's previous calendar season remains literally **2025**. Each selected fallback is recorded in [season-policy.json](../data/research/season-policy.json). Tier 3 ready labels are 323 × 2026/27, 2 × 2026, 205 × 2025/26 and 18 × 2025. Home and Away may legitimately have different seasons.

Romania: 96 canonical identities checked through current/previous league listings, 76 history observations (including the duplicate Filiași candidates), 45 focused search observations and the Romanian Cup listing. Eight current shirts and 81 previous-season shirts are ready. The historical Comuna Recea and FC Drobeta candidates do not establish current identity and were not substituted. Sepsi OSK II and FC Bacău II use independently labeled reserve references. Metalurgistul Cugir's selected alternate remains labeled **Away 2** in source equipment metadata.

Greece and Finland: the new [combined gap report](../data/research/tier3-greece-finland-current-gaps-2026-09-25.json) supersedes the earlier current-season-only decisions. Greek cup and regional histories were also checked. Romanian evidence and the 103 remaining slots are in the [Romanian gap report](../data/research/tier3-romania-current-gaps-2026-09-25.json). The archive's absence of an eligible record does not establish that a club has no kit.

## Artwork and review

New continuation batches include Greece D/E, Finland fallback and Romania A–D. Each ready drawing has independent variant evidence, a saved reference hash, editable paint configuration, source/render comparison and per-slot Codex review decision. Reviews explicitly record **human_approved: false**. Batch scripts and decisions are in `scripts/research` and `data/research`; side-by-side images are under `artifacts/footballkitarchive/<batch>`.

The original 8000 × 5000 PNG remains byte-identical (SHA-256 `4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042`). Flat paint retains its fabric, alpha and physical round collar. Source logos, crests, sponsors, lettering and repeated manufacturer symbols are excluded. Ready revisions remain immutable, and the removed per-shirt SVG archive is not regenerated.

Color estimates, obscured construction, repeated print phases and reduced fine detail are disclosed per shirt. Action photos cannot establish hidden regions precisely. Unirea Alba Iulia's fine architectural illustration is simplified into traced ink and redrawn cornices/columns; patterned sleeves and marbling have documented adaptations. Ceahlăul's discrete oversized lower identity marks are omitted with other branding. This review does not claim photographic reproduction or the source garment's different physical collar.

## Validation

Production build and canonical data verification pass. The full unit suite passes **79/79** (151.5 seconds), covering all ready render configurations, immutable hashes, source/equipment links and canonical data. The Tier 3 Chromium browser suite passes **3/3** (11.1 seconds): Greek mixed seasons, League One Home/Away pairs, Finnish calendar 2025, Romanian mixed seasons on Sepsi OSK II, independent CS Tunari variants, distinct transparent 168 × 168 PNG exports and VJS remaining unavailable. The tested local flows make no external requests.

## Remaining Tier 3 teams

The JSON reports retain full per-slot checks and reasons. This table groups missing variants by team.

| Country | Team | Missing | Evidence checked |
| --- | --- | --- | --- |
| Finland | TPV | away, home | 1999 Home, 1993 Home |
| Finland | VJS | away, home | 2022 Home, 2022 Away |
| Greece | Acharnaikos | away | [2025-26](https://www.footballkitarchive.com/acharnaikos-kits-t75345/) |
| Greece | AE Karitsa | away, home | Archive search / listing check |
| Greece | AE Neapoli | away, home | Archive search / listing check |
| Greece | AE Polykastro | away, home | Archive search / listing check |
| Greece | AE Thraki | away, home | Archive search / listing check |
| Greece | Agios Nikolaos | away, home | [2023-24](https://www.footballkitarchive.com/ao-agios-nikolaos-kits-t20862/) |
| Greece | Amfiali | away, home | Archive search / listing check |
| Greece | AO Levante | away, home | [2015-16](https://www.footballkitarchive.com/ao-levante-kits-t9859/) |
| Greece | AO Plataria | away, home | Archive search / listing check |
| Greece | Apollon Paralimnio | away, home | [2023-24](https://www.footballkitarchive.com/apollon-paralimniou-kits-t20850/) |
| Greece | Apollon Smyrnis | away, home | [2024-25](https://www.footballkitarchive.com/apollon-smyrnis-kits-t2457/) |
| Greece | Ardas Kastanies | away, home | Archive search / listing check |
| Greece | AS Vatolakkos | away, home | Archive search / listing check |
| Greece | Asteras Agios Nikolaos | away, home | Archive search / listing check |
| Greece | Asteras Amaliada | away, home | Archive search / listing check |
| Greece | Asteras Magoula | away | [2025-26](https://www.footballkitarchive.com/el/asteras-magoula-f-c-emphaniseis-t86887/) |
| Greece | Asteras Vlachioti | away, home | [2022-23](https://www.footballkitarchive.com/asteras-vlachioti-kits-t13080/) |
| Greece | Atromitos Patras | away, home | Archive search / listing check |
| Greece | Diagoras Agia Paraskevi | away, home | Archive search / listing check |
| Greece | Digenis Neochori | away, home | Archive search / listing check |
| Greece | Doxa Mascholouri | away, home | Archive search / listing check |
| Greece | Doxa Neo Sidirochori | away, home | Archive search / listing check |
| Greece | Episkopi | away, home | [2023-24](https://www.footballkitarchive.com/ao-episkopi-rethymnou-kits-t20918/) |
| Greece | Ergotelis | away, home | [2021-22](https://www.footballkitarchive.com/el/ergotelis-emphaniseis-t8256/) |
| Greece | Ermis Kiveri | away, home | Archive search / listing check |
| Greece | Foinikas Polichni | away, home | Archive search / listing check |
| Greece | Fokikos | away, home | [2013-14](https://www.footballkitarchive.com/fokikos-kits-t46639/) |
| Greece | Ialysos | away, home | [2023-24](https://www.footballkitarchive.com/gas-ialysos-1948-kits-t20876/) |
| Greece | Iraklis Larissa | away, home | [2022-23](https://www.footballkitarchive.com/iraklis-larissa-kits-t26815/) |
| Greece | Iraklis Xylokastro | away, home | Archive search / listing check |
| Greece | Kastoria 1980 | away, home | [2023-24](https://www.footballkitarchive.com/as-kastoria-1980-kits-t20867/) |
| Greece | Katsantonis Agrafa | away, home | Archive search / listing check |
| Greece | Kifissos Kato Tithorea | away, home | Archive search / listing check |
| Greece | Makedonikos Siatista | away, home | Archive search / listing check |
| Greece | Megas Aetos Orfano | away, home | Archive search / listing check |
| Greece | Megas Alexandros Florina | away, home | Archive search / listing check |
| Greece | Naousa | away, home | Archive search / listing check |
| Greece | OF Agios Matthaios | away, home | Archive search / listing check |
| Greece | Olympiakos Chersonisos | away, home | Archive search / listing check |
| Greece | Orfeas Eleftheroupoli | away, home | Archive search / listing check |
| Greece | Pallixouriakos | away, home | Archive search / listing check |
| Greece | Panagriniakos | away | [2025-26](https://www.footballkitarchive.com/panagriniakos-fc-kits-t13242/) |
| Greece | Panakrotiriakos | away, home | Archive search / listing check |
| Greece | Panthyreatikos | away, home | Archive search / listing check |
| Greece | PAO Pontioi Nea Amisos | away, home | Archive search / listing check |
| Greece | PAO Rouf | away, home | [2022-23](https://www.footballkitarchive.com/pao-rouf-kits-t26838/) |
| Greece | PAS Panedessaikos 2024 | away, home | Archive search / listing check |
| Greece | PAS Preveza | away, home | Archive search / listing check |
| Greece | Platanias | away, home | [2019-20](https://www.footballkitarchive.com/ao-platanias-kits-t3876/) |
| Greece | Proodeftiki | away, home | [2023-24](https://www.footballkitarchive.com/proodeftiki-neolea-kits-t20924/) |
| Greece | Rethymniakos | away, home | [2012-13](https://www.footballkitarchive.com/ao-rethymniakos-kits-t44801/) |
| Greece | Rigas Feraios Velestino | away, home | Archive search / listing check |
| Greece | Tamynaikos Aliveri | away, home | Archive search / listing check |
| Greece | Telos Agras Gargalianoi | away, home | Archive search / listing check |
| Greece | Thiva | away, home | Archive search / listing check |
| Greece | Thyella Katsikas | away, home | [2023-24](https://www.footballkitarchive.com/thyella-katsikas-kits-t20894/) |
| Greece | Tympaki | away, home | Archive search / listing check |
| Romania | Academica Recea | away, home | [2020-21](https://www.footballkitarchive.com/comuna-recea-kits-t20405/) |
| Romania | ACS Axi Arena | away, home | Archive search / listing check |
| Romania | ACSO Filiași | away, home | [2023-24](https://www.footballkitarchive.com/acso-filiasi-kits-t35112/); [2023-24](https://www.footballkitarchive.com/cso-filiasi-kits-t42981/) |
| Romania | Agricola Borcea | home | [2025-26](https://www.footballkitarchive.com/agricola-borcea-kits-t26768/) |
| Romania | Axiopolis Cernavodă | away, home | [2023-24](https://www.footballkitarchive.com/cs-axiopolis-cernavoda-kits-t43027/) |
| Romania | Bihorul Beiuș | home | [2025-26](https://www.footballkitarchive.com/cs-bihorul-beius-kits-t84808/) |
| Romania | Bradul Putna | away, home | Archive search / listing check |
| Romania | Carpați Covasna | away, home | Archive search / listing check |
| Romania | CIL Blaj | away | [2025-26](https://www.footballkitarchive.com/cil-blaj-kits-t77021/) |
| Romania | Corona Brașov | away | [2026-27](https://www.footballkitarchive.com/csm-corona-brasov-kits-t44941/) |
| Romania | Crișul Sântandrei | away | [2025-26](https://www.footballkitarchive.com/csc-crisul-santandrei-kits-t42972/) |
| Romania | CS Agigea | away, home | Archive search / listing check |
| Romania | CS Drobeta Turnu Severin | away, home | [2012-13](https://www.footballkitarchive.com/fotbal-club-drobeta-turnu-severin-kits-t10965/) |
| Romania | CS Păulești | away | [2025-26](https://www.footballkitarchive.com/cs-paulesti-kits-t42900/) |
| Romania | CSM Deva | away, home | [2024-25](https://www.footballkitarchive.com/csm-deva-kits-t42975/) |
| Romania | CSM Pașcani | away, home | [2021-22](https://www.footballkitarchive.com/pascani-kits-t26839/) |
| Romania | CSM Râmnicu Sărat | away | [2025-26](https://www.footballkitarchive.com/csm-ramnicu-sarat-kits-t76790/) |
| Romania | CSM Săcele | home | [2025-26](https://www.footballkitarchive.com/csm-sacele-kits-t72699/) |
| Romania | CSM Sighetu Marmației | away, home | [2023-24](https://www.footballkitarchive.com/csm-sighet-kits-t42978/) |
| Romania | CSM Târgu Jiu | away | [2025-26](https://www.footballkitarchive.com/csm-targu-jiu-kits-t73151/) |
| Romania | CSO Băicoi | away | [2025-26](https://www.footballkitarchive.com/cso-baicoi-kits-t45663/) |
| Romania | Dinamo București II | away, home | [2021-22](https://www.footballkitarchive.com/fc-dinamo-bucuresti-ii-kits-t42984/) |
| Romania | FC Bacău II | away | [2025-26](https://www.footballkitarchive.com/fc-bacau-2-kits-t76858/) |
| Romania | FC Păușești Otăsău | away, home | Archive search / listing check |
| Romania | FC Pucioasa | home | [2026-27](https://www.footballkitarchive.com/fc-pucioasa-kits-t42910/) |
| Romania | FC Voluntari II | away, home | [2023-24](https://www.footballkitarchive.com/voluntari-ii-kits-t43039/) |
| Romania | FCSB II | away, home | [2022-23](https://www.footballkitarchive.com/fcsb-ii-kits-t10811/) |
| Romania | Flacăra Moreni | away | [2026-27](https://www.footballkitarchive.com/csm-flacara-moreni-kits-t42906/) |
| Romania | Gloria Băneasa | away | [2025-26](https://www.footballkitarchive.com/cs-gloria-baneasa-kits-t43028/) |
| Romania | Inter Stars Sibiu | away, home | Archive search / listing check |
| Romania | Kids Tâmpa Brașov | away, home | [2023-24](https://www.footballkitarchive.com/kids-tampa-brasov-kits-t42913/) |
| Romania | KSE Târgu Secuiesc | away | [2025-26](https://www.footballkitarchive.com/kse-targu-secuiesc-kits-t26031/) |
| Romania | Minaur Baia Mare | away | [2025-26](https://www.footballkitarchive.com/cs-minaur-baia-mare-kits-t10971/) |
| Romania | Minerul Lupeni | away, home | [2024-25](https://www.footballkitarchive.com/minerul-lupeni-kits-t42732/) |
| Romania | Muscelul ARO Câmpulung | away, home | [2023-24](https://www.footballkitarchive.com/acs-aro-muscelul-campulung-kits-t42889/) |
| Romania | Nera Bogodinț | away, home | Archive search / listing check |
| Romania | Olimpic Zărnești | away, home | [2024-25](https://www.footballkitarchive.com/asc-olimpic-zarnesti-kits-t42896/) |
| Romania | Omega Sport | away, home | Archive search / listing check |
| Romania | Oțelul Galați II | away, home | Archive search / listing check |
| Romania | Oxigen București | away, home | Archive search / listing check |
| Romania | Petrolul Berca | away, home | Archive search / listing check |
| Romania | Petrolul Hîrtiești | away, home | Archive search / listing check |
| Romania | Politehnica Timișoara II | away, home | Archive search / listing check |
| Romania | Portul Constanța | away, home | Archive search / listing check |
| Romania | Progresul Drăgănești | away, home | Archive search / listing check |
| Romania | Progresul Mogoșoaia | away, home | Archive search / listing check |
| Romania | Progresul Pecica | away | [2025-26](https://www.footballkitarchive.com/acs-progresul-pecica-kits-t42957/) |
| Romania | Progresul Spartac | away, home | Archive search / listing check |
| Romania | Recolta Gheorghe Doja | away, home | [2023-24](https://www.footballkitarchive.com/acs-recolta-gheorghe-doja-kits-t43020/) |
| Romania | SCM Zalău | away | [2025-26](https://www.footballkitarchive.com/scm-zalau-kits-t42990/) |
| Romania | Teleajenul Vălenii de Munte | away, home | Archive search / listing check |
| Romania | Timișul Șag | away | [2025-26](https://www.footballkitarchive.com/cs-timisul-sag-kits-t77005/) |
| Romania | Tricolorul Breaza | away, home | [2023-24](https://www.footballkitarchive.com/cso-tricolorul-breaza-kits-t42909/) |
| Romania | Unirea Bascov | away, home | [2023-24](https://www.footballkitarchive.com/acs-unirea-bascov-kits-t42894/) |
| Romania | Unirea Dej | away, home | [2024-25](https://www.footballkitarchive.com/unirea-dej-kits-t12621/) |
| Romania | Unirea Tășnad | away, home | Archive search / listing check |
| Romania | Universitatea Craiova II | away, home | [2023-24](https://www.footballkitarchive.com/universitatea-craiova-2-kits-t42918/) |
| Romania | Urban Titu | away | [2026-27](https://www.footballkitarchive.com/urban-titu-kits-t88710/) |
| Romania | Viitorul Cluj | away, home | [2023-24](https://www.footballkitarchive.com/af-viitorul-cluj-kits-t42960/) |
| Romania | Viitorul Corbeanca | away, home | Archive search / listing check |
| Romania | Voința Crevedia | away | [2026-27](https://www.footballkitarchive.com/vointa-crevedia-kits-t88711/) |
| Romania | Vulturii Fărcășești | away, home | Archive search / listing check |
