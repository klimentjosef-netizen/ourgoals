-- Seed: Czech food database (~80 items)
-- All values per 100g, source = 'public', owner_id = NULL

INSERT INTO food_items (name, brand, kcal_per_100g, protein_g, carbs_g, fat_g, fiber_g, source, owner_id) VALUES

-- === MEAT ===
('Kurecí prsa (syrova)', NULL, 110, 23.1, 0, 1.2, 0, 'public', NULL),
('Krutí prsa (syrova)', NULL, 104, 24.6, 0, 0.7, 0, 'public', NULL),
('Hovezí zadní (syrove)', NULL, 137, 21.3, 0, 5.4, 0, 'public', NULL),
('Veprova panenka (syrova)', NULL, 143, 21.0, 0, 6.3, 0, 'public', NULL),
('Losos (syrovy)', NULL, 208, 20.4, 0, 13.4, 0, 'public', NULL),
('Treska (syrova)', NULL, 82, 17.8, 0, 0.7, 0, 'public', NULL),
('Tunak v konzerve (vlastni stava)', NULL, 116, 25.5, 0, 0.8, 0, 'public', NULL),
('Kurecí stehno (syrove)', NULL, 177, 17.3, 0, 11.6, 0, 'public', NULL),
('Sunka (vysoka kvalita)', NULL, 107, 18.0, 1.5, 3.0, 0, 'public', NULL),

-- === EGGS ===
('Vejce cele (syrove)', NULL, 155, 12.6, 1.1, 11.0, 0, 'public', NULL),
('Vajecny bilek (syrovy)', NULL, 52, 10.9, 0.7, 0.2, 0, 'public', NULL),

-- === DAIRY ===
('Recky jogurt 0%', NULL, 57, 10.2, 3.6, 0.4, 0, 'public', NULL),
('Tvaroh mekky polotucny', NULL, 104, 13.0, 3.5, 4.0, 0, 'public', NULL),
('Skyr', NULL, 63, 11.0, 4.0, 0.2, 0, 'public', NULL),
('Cottage cheese', NULL, 98, 11.1, 3.4, 4.3, 0, 'public', NULL),
('Mleko 1.5%', NULL, 47, 3.5, 4.8, 1.5, 0, 'public', NULL),
('Parmezán', NULL, 431, 35.8, 3.2, 29.7, 0, 'public', NULL),
('Mozzarella', NULL, 280, 22.2, 2.2, 20.3, 0, 'public', NULL),
('Ricotta', NULL, 174, 11.3, 3.0, 13.0, 0, 'public', NULL),

-- === CARBS / GRAINS ===
('Ryze basmati (varena)', NULL, 130, 2.7, 28.2, 0.3, 0.4, 'public', NULL),
('Brambory (varene)', NULL, 77, 2.0, 17.0, 0.1, 1.8, 'public', NULL),
('Bataty (varene)', NULL, 86, 1.6, 20.1, 0.1, 3.0, 'public', NULL),
('Ovesne vlocky', NULL, 379, 13.2, 67.7, 6.5, 10.1, 'public', NULL),
('Chleb zitny', NULL, 259, 8.5, 48.3, 3.3, 5.8, 'public', NULL),
('Testoviny (varene)', NULL, 131, 5.0, 25.4, 1.1, 1.8, 'public', NULL),
('Quinoa (varena)', NULL, 120, 4.4, 21.3, 1.9, 2.8, 'public', NULL),
('Pohanka (varena)', NULL, 92, 3.4, 19.9, 0.6, 2.7, 'public', NULL),
('Celozrnny chleb', NULL, 247, 9.7, 41.3, 3.5, 6.8, 'public', NULL),
('Tortilla (psenicna)', NULL, 312, 8.3, 52.4, 7.8, 2.1, 'public', NULL),
('Kuskus (vareny)', NULL, 112, 3.8, 23.2, 0.2, 1.4, 'public', NULL),

-- === LEGUMES ===
('Cocka (varena)', NULL, 116, 9.0, 20.1, 0.4, 7.9, 'public', NULL),
('Cizrna (varena)', NULL, 164, 8.9, 27.4, 2.6, 7.6, 'public', NULL),
('Fazole cervene (varene)', NULL, 127, 8.7, 22.8, 0.5, 6.4, 'public', NULL),
('Edamame', NULL, 121, 11.9, 8.9, 5.2, 5.2, 'public', NULL),

-- === FATS / NUTS ===
('Olivovy olej', NULL, 884, 0, 0, 100, 0, 'public', NULL),
('Avokado', NULL, 160, 2.0, 8.5, 14.7, 6.7, 'public', NULL),
('Mandle', NULL, 579, 21.2, 21.7, 49.9, 12.5, 'public', NULL),
('Vlasske orechy', NULL, 654, 15.2, 13.7, 65.2, 6.7, 'public', NULL),
('Chia seminko', NULL, 486, 16.5, 42.1, 30.7, 34.4, 'public', NULL),
('Arasidove maslo', NULL, 588, 25.1, 20.0, 50.4, 6.0, 'public', NULL),
('Kokosovy olej', NULL, 862, 0, 0, 100, 0, 'public', NULL),
('Lnene seminko', NULL, 534, 18.3, 28.9, 42.2, 27.3, 'public', NULL),
('Slunecnicova seminko', NULL, 584, 20.8, 20.0, 51.5, 8.6, 'public', NULL),
('Keshu orechy', NULL, 553, 18.2, 30.2, 43.9, 3.3, 'public', NULL),

-- === VEGETABLES ===
('Spenat (cerstvy)', NULL, 23, 2.9, 3.6, 0.4, 2.2, 'public', NULL),
('Brokolice', NULL, 34, 2.8, 7.0, 0.4, 2.6, 'public', NULL),
('Rajce', NULL, 18, 0.9, 3.9, 0.2, 1.2, 'public', NULL),
('Paprika cervena', NULL, 31, 1.0, 6.0, 0.3, 2.1, 'public', NULL),
('Okurka', NULL, 15, 0.7, 3.6, 0.1, 0.5, 'public', NULL),
('Cuketa', NULL, 17, 1.2, 3.1, 0.3, 1.0, 'public', NULL),
('Květak', NULL, 25, 1.9, 5.0, 0.3, 2.0, 'public', NULL),
('Mrkev', NULL, 41, 0.9, 9.6, 0.2, 2.8, 'public', NULL),
('Cibule', NULL, 40, 1.1, 9.3, 0.1, 1.7, 'public', NULL),
('Cesnek', NULL, 149, 6.4, 33.1, 0.5, 2.1, 'public', NULL),
('Zelí bile', NULL, 25, 1.3, 5.8, 0.1, 2.5, 'public', NULL),
('Salat ledovy', NULL, 14, 0.9, 3.0, 0.1, 1.2, 'public', NULL),
('Houby zampiony', NULL, 22, 3.1, 3.3, 0.3, 1.0, 'public', NULL),

-- === FRUIT ===
('Jablko', NULL, 52, 0.3, 13.8, 0.2, 2.4, 'public', NULL),
('Banan', NULL, 89, 1.1, 22.8, 0.3, 2.6, 'public', NULL),
('Boruvky', NULL, 57, 0.7, 14.5, 0.3, 2.4, 'public', NULL),
('Jahody', NULL, 32, 0.7, 7.7, 0.3, 2.0, 'public', NULL),
('Kiwi', NULL, 61, 1.1, 14.7, 0.5, 3.0, 'public', NULL),
('Pomeranc', NULL, 47, 0.9, 11.8, 0.1, 2.4, 'public', NULL),
('Maliny', NULL, 52, 1.2, 11.9, 0.7, 6.5, 'public', NULL),
('Hruska', NULL, 57, 0.4, 15.2, 0.1, 3.1, 'public', NULL),
('Mango', NULL, 60, 0.8, 15.0, 0.4, 1.6, 'public', NULL),

-- === SUPPLEMENTS ===
('Whey protein (cokoladovy)', NULL, 395, 78.0, 7.0, 5.5, 0, 'public', NULL),
('Casein protein', NULL, 370, 80.0, 4.0, 2.0, 0, 'public', NULL),
('Kreatin monohydrat', NULL, 0, 0, 0, 0, 0, 'public', NULL),
('BCAA prasek', NULL, 0, 0, 0, 0, 0, 'public', NULL),

-- === OTHER / COMMON CZECH ===
('Pizza (rez, margarita)', NULL, 266, 11.0, 33.0, 10.0, 2.0, 'public', NULL),
('Pivo 10° (500ml = cca 500g)', NULL, 40, 0.3, 3.5, 0, 0, 'public', NULL),
('Vino cervene', NULL, 85, 0.1, 2.6, 0, 0, 'public', NULL),
('Vino bile', NULL, 82, 0.1, 2.6, 0, 0, 'public', NULL),
('Med', NULL, 304, 0.3, 82.4, 0, 0.2, 'public', NULL),
('Ryze jasminova (varena)', NULL, 129, 2.4, 28.6, 0.2, 0.3, 'public', NULL),
('Proteinova tycinka (prumer)', NULL, 350, 30.0, 35.0, 10.0, 3.0, 'public', NULL),
('Rizovy kolacek', NULL, 387, 7.7, 81.1, 2.8, 3.4, 'public', NULL),
('Hraskovy protein', NULL, 380, 80.0, 3.0, 5.0, 1.0, 'public', NULL),
('Tmavy cokoladovy ctvercek (85%)', NULL, 580, 10.9, 33.4, 46.3, 11.2, 'public', NULL),
('Maslo', NULL, 717, 0.9, 0.1, 81.1, 0, 'public', NULL),
('Smotana ke slehani 33%', NULL, 292, 2.2, 3.3, 30.0, 0, 'public', NULL)

ON CONFLICT DO NOTHING;
