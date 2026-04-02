-- Connect to database
\c gazcom_db;

-- Sample Products for PETROLEUM EQUIPMENTS (Category ID: 1)
INSERT INTO products (name, description, price, category_id, sub_category, sku, specifications, stock_quantity, is_featured) VALUES
('Steel Petroleum Pipe - 6 inch', 'High-grade carbon steel pipe for petroleum transportation, 6-inch diameter, Schedule 40', 4500.00, 1, 'Pipes', 'PP-6IN-40', '{"material": "Carbon Steel", "diameter": "6 inch", "schedule": "40", "length": "6 meters"}', 100, TRUE),
('API 6D Gate Valve', 'Industrial gate valve for petroleum pipelines, API 6D certified, flanged ends', 12500.00, 1, 'Valves', 'VAL-GATE-6D', '{"type": "Gate Valve", "size": "4 inch", "pressure": "150 LB", "material": "Cast Steel"}', 50, TRUE),
('Centrifugal Pump - 5HP', 'Heavy-duty centrifugal pump for petroleum transfer, 5HP motor, explosion-proof', 45000.00, 1, 'Pumps', 'PUMP-CENT-5HP', '{"power": "5HP", "flow_rate": "500 L/min", "material": "Cast Iron", "certification": "ATEX"}', 25, TRUE),
('Steel Pipe Fitting - Elbow 90°', 'Carbon steel threaded elbow fitting, 90-degree angle, 2-inch', 850.00, 1, 'Fittings', 'FIT-ELB-90-2IN', '{"type": "Elbow", "angle": "90°", "size": "2 inch", "material": "Carbon Steel"}', 500, FALSE),
('Flange Adapter Kit', 'Complete flange adapter set with gaskets and bolts, 4-inch', 3200.00, 1, 'Fittings', 'FIT-FLANGE-4IN', '{"type": "Flange Kit", "size": "4 inch", "includes": "Flange, Gasket, Bolts"}', 150, FALSE);

-- Sample Products for PETROLEUM ELECTRICALS (Category ID: 2)
INSERT INTO products (name, description, price, category_id, sub_category, sku, specifications, stock_quantity, is_featured) VALUES
('Explosion-Proof Lighting Fixture', 'LED lighting fixture for hazardous areas, Class I Division 1 certified', 8750.00, 2, 'Lighting', 'ELEC-LED-EXP', '{"type": "LED Light", "wattage": "100W", "certification": "Class I Div 1", "voltage": "220V"}', 75, TRUE),
('Intrinsically Safe Junction Box', 'Stainless steel junction box for petroleum facilities, IP66 rated', 5500.00, 2, 'Enclosures', 'ELEC-JBOX-IS', '{"material": "Stainless Steel", "rating": "IP66", "size": "200x200x100mm", "certification": "ATEX"}', 100, TRUE),
('Fuel Management System', 'Complete fuel management system with controllers and sensors', 125000.00, 2, 'Control Systems', 'ELEC-FMS-1000', '{"type": "Fuel Management", "tanks": "Up to 8 tanks", "pumps": "Up to 16 pumps", "interface": "LCD Touchscreen"}', 10, TRUE),
('Cable Gland Kit - Explosion Proof', 'Set of explosion-proof cable glands, sizes M20 to M50', 2800.00, 2, 'Wiring', 'ELEC-GLAND-EXP', '{"type": "Cable Glands", "material": "Brass", "certification": "Ex d", "sizes": "M20, M25, M32"}', 200, FALSE),
('Earth Rod Kit', 'Copper-bonded earth rod kit for petroleum station grounding', 4500.00, 2, 'Grounding', 'ELEC-EARTH-KIT', '{"material": "Copper Bonded", "length": "3 meters", "includes": "Rod, Clamp, Cable"}', 120, FALSE);

-- Sample Products for PETROL STATION PARTS AND ACCESSORIES (Category ID: 3)
INSERT INTO products (name, description, price, category_id, sub_category, sku, specifications, stock_quantity, is_featured) VALUES
('Fuel Dispenser Nozzle - Automatic', 'Automatic shut-off fuel nozzle for petrol pumps, with swivel', 6500.00, 3, 'Nozzles', 'PMP-NOZ-AUTO', '{"type": "Automatic", "flow_rate": "40 L/min", "material": "Aluminum", "color": "Red"}', 150, TRUE),
('Fuel Hose - 3/4 inch', 'High-quality fuel dispensing hose, 3/4 inch diameter, 5 meters', 8500.00, 3, 'Hoses', 'PMP-HOSE-34', '{"diameter": "3/4 inch", "length": "5 meters", "working_pressure": "300 PSI", "material": "Nitrile Rubber"}', 80, TRUE),
('Dispenser Breakaway Valve', 'Safety breakaway valve for fuel dispensers, prevents hose pull-away', 3200.00, 3, 'Safety', 'PMP-BREAK-1', '{"type": "Breakaway", "size": "3/4 inch", "material": "Brass", "release_force": "300 lbs"}', 200, TRUE),
('Submersible Pump Motor', 'Submersible turbine pump motor for underground tanks, 1.5HP', 38500.00, 3, 'Pumps', 'PMP-SUB-15HP', '{"power": "1.5HP", "voltage": "230V", "phase": "Single", "flow_rate": "100 L/min"}', 30, TRUE),
('Tank Level Gauge', 'Mechanical tank level gauge for underground storage tanks', 12500.00, 3, 'Monitoring', 'PMP-GAUGE-MECH', '{"type": "Mechanical", "accuracy": "±0.5%", "tank_height": "Up to 4 meters", "material": "Stainless Steel"}', 45, FALSE);

-- Sample Products for PETROLEUM GAS AND ACCESSORIES (Category ID: 4)
INSERT INTO products (name, description, price, category_id, sub_category, sku, specifications, stock_quantity, is_featured) VALUES
('LPG Cylinder - 13kg', 'Standard 13kg LPG cylinder with valve, certified and tested', 5500.00, 4, 'Cylinders', 'GAS-CYL-13KG', '{"capacity": "13kg", "material": "Steel", "working_pressure": "17.5 bar", "test_pressure": "30 bar"}', 500, TRUE),
('LPG Regulator - High Pressure', 'High-pressure LPG regulator with safety valve, 0-4 bar adjustable', 1850.00, 4, 'Regulators', 'GAS-REG-HP', '{"type": "High Pressure", "pressure_range": "0-4 bar", "inlet": "W21.8", "outlet": "3/8 inch"}', 300, TRUE),
('LPG Rubber Hose - 1.5m', 'Flexible LPG hose with brass fittings, 1.5 meters length', 1200.00, 4, 'Hoses', 'GAS-HOSE-15M', '{"length": "1.5 meters", "diameter": "10mm", "working_pressure": "20 bar", "material": "Nitrile Rubber"}', 400, TRUE),
('Gas Leak Detector', 'Portable gas leak detector for LPG and natural gas', 4500.00, 4, 'Safety', 'GAS-DETECT-PORT', '{"type": "Portable", "sensitivity": "50 ppm", "alarm": "Audible/Visual", "battery": "Rechargeable"}', 60, TRUE),
('LPG Changeover Valve', 'Automatic changeover valve for dual cylinder systems', 3200.00, 4, 'Valves', 'GAS-CHANGE-AUTO', '{"type": "Automatic", "inlet": "2 x W21.8", "outlet": "3/8 inch", "material": "Brass"}', 120, FALSE);

-- Sample Products for PETROLEUM PERSONAL PROTECTIVE EQUIPMENTS (Category ID: 5)
INSERT INTO products (name, description, price, category_id, sub_category, sku, specifications, stock_quantity, is_featured) VALUES
('Flame Resistant Coverall', 'FR coverall for petroleum workers, NFPA 2112 certified', 4500.00, 5, 'Clothing', 'PPE-COV-FR', '{"material": "Cotton/Nomex", "standard": "NFPA 2112", "sizes": "S-XXXL", "colors": "Navy Blue"}', 200, TRUE),
('Safety Helmet with Face Shield', 'Industrial safety helmet with integrated face shield for chemical splash', 2800.00, 5, 'Head Protection', 'PPE-HELM-FS', '{"type": "Full Brim", "material": "HDPE", "standard": "EN 397", "includes": "Face Shield"}', 150, TRUE),
('Chemical Resistant Gloves', 'Nitrile chemical-resistant gloves for petroleum handling, 15-inch', 850.00, 5, 'Hand Protection', 'PPE-GLOVE-CHEM', '{"material": "Nitrile", "length": "15 inch", "thickness": "15 mil", "standard": "EN 374"}', 400, TRUE),
('Steel Toe Safety Boots', 'Oil-resistant steel toe boots with slip-resistant sole', 5500.00, 5, 'Footwear', 'PPE-BOOT-STEEL', '{"material": "Full Grain Leather", "toe": "Steel", "sole": "Oil Resistant", "standard": "EN ISO 20345"}', 180, TRUE),
('Safety Goggles - Anti-Fog', 'Chemical splash goggles with anti-fog coating', 1200.00, 5, 'Eye Protection', 'PPE-GOGGLE-AF', '{"type": "Chemical Splash", "lens": "Polycarbonate", "coating": "Anti-Fog", "standard": "EN 166"}', 300, TRUE),
('Ear Protection Kit', 'Earplugs and earmuffs for high-noise petroleum environments', 950.00, 5, 'Hearing Protection', 'PPE-EAR-KIT', '{"includes": "Earplugs, Earmuffs", "noise_reduction": "30 dB", "standard": "EN 352"}', 250, FALSE);