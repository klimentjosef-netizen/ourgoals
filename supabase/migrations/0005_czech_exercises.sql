-- OurGoals — České názvy cviků
-- Formát: Anglický název (český překlad) pro mezinárodně známé cviky
-- nebo čistě český název pro jednoznačné překlady

-- PUSH
UPDATE exercises SET name = 'Bench press (tlak na lavičce)' WHERE name = 'Bench press';
UPDATE exercises SET name = 'Šikmý bench press' WHERE name = 'Incline bench press';
UPDATE exercises SET name = 'Jednoručky na rovné lavičce' WHERE name = 'Flat dumbbell press';
UPDATE exercises SET name = 'Tlak nad hlavou' WHERE name = 'OHP (overhead press)';
UPDATE exercises SET name = 'Tlak s jednoručkami vsedě' WHERE name = 'Seated DB shoulder press';
UPDATE exercises SET name = 'Dipy' WHERE name = 'Dips';
UPDATE exercises SET name = 'Upažování na kladce' WHERE name = 'Cable lateral raise';
UPDATE exercises SET name = 'Stahování na triceps (kladka)' WHERE name = 'Cable triceps pushdown';
UPDATE exercises SET name = 'Francouzský tlak s jednoručkou' WHERE name = 'Overhead DB triceps extension';
UPDATE exercises SET name = 'Úzký bench press' WHERE name = 'Close-grip bench press';
UPDATE exercises SET name = 'Skull crushers (lebkodrtič)' WHERE name = 'Skull crushers';

-- PULL
UPDATE exercises SET name = 'Shyby' WHERE name = 'Pull-ups';
UPDATE exercises SET name = 'Shyby nadhmatem' WHERE name = 'Chin-ups';
UPDATE exercises SET name = 'Přítahy činky v předklonu' WHERE name = 'Barbell row';
UPDATE exercises SET name = 'Přítahy s oporou hrudníku' WHERE name = 'Chest-supported row';
UPDATE exercises SET name = 'Stahování kladky' WHERE name = 'Lat pulldown';
UPDATE exercises SET name = 'T-bar přítahy' WHERE name = 'T-bar row';
UPDATE exercises SET name = 'Face pull (zadní delty)' WHERE name = 'Face pull';
UPDATE exercises SET name = 'Kladívkové bicepsové zdvihy' WHERE name = 'Hammer curl';
UPDATE exercises SET name = 'Bicepsový zdvih s činkou' WHERE name = 'Barbell curl';
UPDATE exercises SET name = 'Bicepsový zdvih s EZ činkou' WHERE name = 'EZ bar curl';
UPDATE exercises SET name = 'Bicepsový zdvih na šikmé lavičce' WHERE name = 'Incline DB curl';
UPDATE exercises SET name = 'Kladívkové zdvihy na kladce' WHERE name = 'Cable rope hammer curl';

-- LEGS
UPDATE exercises SET name = 'Dřep' WHERE name = 'Back squat';
UPDATE exercises SET name = 'Přední dřep' WHERE name = 'Front squat';
UPDATE exercises SET name = 'Bulharský dřep' WHERE name = 'Bulgarian split squat';
UPDATE exercises SET name = 'Leg press (tlak nohama)' WHERE name = 'Leg press';
UPDATE exercises SET name = 'Rumunský mrtvý tah' WHERE name = 'Romanian deadlift';
UPDATE exercises SET name = 'Hip thrust (zdvih boků)' WHERE name = 'Hip thrust';
UPDATE exercises SET name = 'Výpady s chůzí' WHERE name = 'Walking lunge';
UPDATE exercises SET name = 'Flexe nohou vleže' WHERE name = 'Lying leg curl';
UPDATE exercises SET name = 'Flexe nohou vsedě' WHERE name = 'Seated leg curl';
UPDATE exercises SET name = 'Extenze nohou' WHERE name = 'Leg extension';
UPDATE exercises SET name = 'Výpony vestoje' WHERE name = 'Standing calf raise';
UPDATE exercises SET name = 'Výpony vsedě' WHERE name = 'Seated calf raise';

-- CORE
UPDATE exercises SET name = 'Plank (prkno)' WHERE name = 'Plank';
UPDATE exercises SET name = 'Zvedání nohou ve visu' WHERE name = 'Hanging leg raise';
UPDATE exercises SET name = 'Sklapovačky na kladce' WHERE name = 'Cable crunch';
UPDATE exercises SET name = 'Stěrače ve visu' WHERE name = 'Hanging windshield wiper';
UPDATE exercises SET name = 'Hyperextenze' WHERE name = 'Back extension';
UPDATE exercises SET name = 'Farmer carry (nosič)' WHERE name = 'Farmer carry';

-- COMPOUND
UPDATE exercises SET name = 'Mrtvý tah' WHERE name = 'Deadlift';

-- MOBILITY (ponecháno s českým doplněním)
UPDATE exercises SET name = 'Mobilita hrudní páteře' WHERE name = 'Mobility T-spine';
UPDATE exercises SET name = 'Mobilita kyčlí' WHERE name = 'Mobility hips';
