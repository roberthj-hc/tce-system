-- roles
INSERT INTO roles (name, code) VALUES
('Administrator', 'admin'),
('Seller', 'seller'),
('Auditor', 'auditor');

-- users
INSERT INTO users (name, email, phone, password, role_id, photo) VALUES
('Alice Johnson', 'alice@example.com', '601111111', 'hashedpass1', 1, 'alice.jpg'),
('Bob Smith', 'bob@example.com', '602222222', 'hashedpass2', 2, 'bob.jpg'),
('Charlie Davis', 'charlie@example.com', '603333333', 'hashedpass3', 3, 'charlie.jpg');

-- suppliers - last
INSERT INTO suppliers (name, contact_name, email, phone, address) VALUES
('Global Supplies Inc.', 'Ana Torres', 'ana@globalsupplies.com', '701-12345', 'Av. América 456, La Paz'),
('TechnoTrade', 'Luis Rivas', 'contact@technotrade.bo', '703-67890', 'Calle 12, Zona Sur, La Paz'),
('EcoMarket SRL', 'Verónica Méndez', 'vmendez@ecomarket.com', '704-22233', 'Av. Costanera 555'),
('Distribuciones Bolivia', 'Miguel Salazar', 'msalazar@distbol.com', '705-98989', 'Calle 8, Miraflores'),
('Super Importaciones', 'Roxana Vargas', 'info@superimport.bo', '706-12121', 'Zona Villa Fátima'),
('Andean Trade', 'Pablo Gutierrez', 'pgutierrez@andeantrade.com', '707-45678', 'Calle Sagárnaga 321'),
('Urban Tools', 'César Quispe', 'cesar@urbantools.bo', '708-65432', 'Av. Arce 233'),
('Altiplano Ltda', 'Sandra Flores', 'sflores@altiplano.com', '709-33333', 'Zona Sopocachi'),
('Beni Distribuciones', 'Nelson Aguilar', 'nelson@beni.com', '710-77777', 'Av. Busch 109'),
('Soluciones SRL', 'Marcela Pinto', 'marcela@soluciones.bo', '711-12123', 'Av. Blanco Galindo'),
('Casa Litoral', 'Iván Romero', 'ivan@casalitoral.com', '712-99999', 'Calle 17, Calacoto'),
('Pacífico Supply', 'Noelia Céspedes', 'noelia@pacificosupply.com', '713-44444', 'Zona San Pedro'),
('Comercial Norte', 'Ramiro López', 'ramiro@norte.bo', '714-77777', 'Calle Loayza'),
('Market Partners', 'Patricia Reyes', 'patricia@partners.com', '715-56565', 'Zona Central'),
('TecnoMax', 'Andrés Gómez', 'andres@tecnomax.com', '716-80808', 'Zona Villa Adela');

-- categories - last
INSERT INTO categories (name, description) VALUES
('Cables HDMI', 'Cables de alta definición para video y audio'),
('Cables USB-C', 'Cables modernos para carga y transferencia de datos'),
('Cargadores portátiles', 'Power banks para cargar dispositivos móviles'),
('Cargadores USB', 'Adaptadores de corriente con salidas USB'),
('Adaptadores', 'Convertidores de señal y puertos'),
('Soportes para celular', 'Accesorios para sostener teléfonos'),
('Fundas para celular', 'Protección y diseño para smartphones'),
('Teclados inalámbricos', 'Teclados Bluetooth y RF'),
('Ratones inalámbricos', 'Mouses para laptop y PC sin cable'),
('Lentes de realidad virtual', 'Accesorios VR para celulares y consolas'),
('Luces LED USB', 'Iluminación portátil y decorativa'),
('Audífonos Bluetooth', 'Auriculares sin cable de diferentes estilos'),
('Audífonos con cable', 'Auriculares tradicionales con jack 3.5mm'),
('Controles de videojuegos', 'Gamepads para consolas y celulares'),
('Bases de refrigeración', 'Soportes ventilados para laptops'),
('Soportes para laptop', 'Bases ergonómicas ajustables'),
('Protectores de pantalla', 'Accesorio para proteger pantallas táctiles'),
('Limpieza de dispositivos', 'Kits y herramientas para limpiar electrónicos'),
('Antenas digitales', 'Recepción de TV sin cable'),
('Soportes de TV', 'Montajes para pantallas planas'),
('Repetidores WiFi', 'Extensores de señal inalámbrica'),
('Cables de audio', 'Conectores para equipos de sonido'),
('Baterías externas solares', 'Power banks con carga solar'),
('Bases de carga inalámbrica', 'Plataformas de carga por inducción'),
('Cables Lightning', 'Cables de carga para dispositivos Apple');

-- products - last  
INSERT INTO products (name, barcode, brand, price, cost, stock, stock_minimum, photo, description, active, category_id, supplier_id) VALUES
('Cable HDMI 2m', 'HDMI001', 'TechLink', 12.00, 6.00, 100, 10, 'https://example.com/cable_hdmi.jpg', 'Cable HDMI con soporte 4K y conector dorado', TRUE, 1, 1),
('Cable HDMI 5m', 'HDMI002', 'Belkin', 18.50, 9.00, 80, 12, 'https://example.com/cable_hdmi_5m.jpg', 'Cable de larga distancia con blindaje extra', TRUE, 1, 2),
('Cable USB-C rápido', 'USBC001', 'Ugreen', 9.99, 4.80, 150, 15, 'https://example.com/usb_c.jpg', 'Cable de carga rápida USB-C trenzado', TRUE, 2, 3),
('Cable USB-C largo', 'USBC002', 'Baseus', 13.50, 7.00, 100, 10, 'https://example.com/usb_c_2m.jpg', 'Cable resistente de 2 metros', TRUE, 2, 4),
('Power Bank 10,000mAh', 'PB001', 'Xiaomi', 29.99, 18.00, 80, 10, 'https://example.com/power_bank.jpg', 'Carga rápida con doble salida USB', TRUE, 3, 5),
('Power Bank solar', 'PB002', 'Energizer', 35.00, 22.00, 50, 5, 'https://example.com/power_solar.jpg', 'Batería externa con panel solar incorporado', TRUE, 23, 6),
('Cargador USB doble', 'CHG001', 'Anker', 16.00, 9.50, 60, 8, 'https://example.com/charger_usb.jpg', 'Cargador de pared con dos puertos 2.4A', TRUE, 4, 7),
('Cargador rápido 30W', 'CHG002', 'Samsung', 19.50, 12.00, 90, 10, 'https://example.com/fast_charger.jpg', 'Cargador compatible con carga rápida USB-C', TRUE, 4, 8),
('Adaptador HDMI-VGA', 'ADPT001', 'TP-Link', 13.99, 7.50, 40, 4, 'https://example.com/hdmi_vga.jpg', 'Adaptador sin alimentación externa', TRUE, 5, 9),
('Adaptador USB-C a Jack', 'ADPT002', 'Apple', 17.00, 11.00, 45, 6, 'https://example.com/usb_jack.jpg', 'Adaptador para auriculares tradicionales', TRUE, 5, 10),
('Soporte magnético auto', 'SUP001', 'Baseus', 11.00, 6.20, 90, 10, 'https://example.com/car_mount.jpg', 'Montaje magnético universal para auto', TRUE, 6, 11),
('Soporte ventosa celular', 'SUP002', 'Spigen', 13.50, 7.80, 75, 12, 'https://example.com/ventosa.jpg', 'Soporte giratorio con ventosa', TRUE, 6, 12),
('Funda silicona iPhone', 'CASE001', 'Spigen', 18.00, 10.00, 70, 10, 'https://example.com/iphone_case.jpg', 'Protección flexible para iPhone 13', TRUE, 7, 13),
('Funda rígida Galaxy', 'CASE002', 'OtterBox', 22.50, 14.00, 60, 9, 'https://example.com/galaxy_case.jpg', 'Funda antigolpes para Galaxy S22', TRUE, 7, 14),
('Teclado Bluetooth Slim', 'KEYB001', 'Logitech', 33.00, 21.50, 40, 5, 'https://example.com/bluetooth_keyboard.jpg', 'Teclado compacto inalámbrico', TRUE, 8, 15),
('Teclado retroiluminado', 'KEYB002', 'Redragon', 39.00, 25.00, 35, 6, 'https://example.com/gamer_keyboard.jpg', 'Teclado gamer RGB Bluetooth', TRUE, 8, 1),
('Mouse inalámbrico óptico', 'MSE001', 'HP', 14.00, 8.50, 80, 10, 'https://example.com/wireless_mouse.jpg', 'Ratón compacto con receptor USB', TRUE, 9, 2),
('Mouse ergonómico RF', 'MSE002', 'Logitech', 27.00, 17.00, 45, 5, 'https://example.com/ergonomic_mouse.jpg', 'Diseño ergonómico con alta precisión', TRUE, 9, 3),
('Lentes VR universales', 'VR001', 'VRBox', 25.00, 15.00, 35, 6, 'https://example.com/vr_glasses.jpg', 'Compatible con smartphones Android/iOS', TRUE, 10, 4),
('Lentes VR Elite', 'VR002', 'Oculus', 39.50, 26.00, 30, 4, 'https://example.com/oculus.jpg', 'Realidad virtual avanzada', TRUE, 10, 5),
('Luz LED USB flexible', 'LED001', 'Ugreen', 7.99, 3.50, 100, 10, 'https://example.com/usb_led.jpg', 'Lámpara portátil ideal para laptop', TRUE, 11, 6),
('Tira LED decorativa', 'LED002', 'Philips', 19.99, 12.00, 50, 5, 'https://example.com/led_strip.jpg', 'Iluminación decorativa con control remoto', TRUE, 11, 7),
('Audífonos Bluetooth in-ear', 'AUD001', 'JBL', 34.99, 22.00, 60, 8, 'https://example.com/bluetooth_earbuds.jpg', 'Diseño ergonómico y buena autonomía', TRUE, 12, 8),
('Audífonos over-ear Bluetooth', 'AUD002', 'Sony', 59.00, 35.00, 40, 5, 'https://example.com/sony_headphones.jpg', 'Cancelación de ruido activa', TRUE, 12, 9),
('Audífonos con cable básicos', 'AUD003', 'Panasonic', 11.99, 6.00, 90, 12, 'https://example.com/panasonic.jpg', 'Sonido nítido, jack 3.5mm', TRUE, 13, 10),
('Audífonos intraurales con micrófono', 'AUD004', 'Philips', 14.50, 7.90, 70, 10, 'https://example.com/wired_earphones.jpg', 'Control de llamadas integrado', TRUE, 13, 11),
('Control Bluetooth para móvil', 'CTRL001', 'GameSir', 29.00, 18.00, 50, 6, 'https://example.com/controller_mobile.jpg', 'Gamepad compatible con Android/iOS', TRUE, 14, 12),
('Control para consola PC', 'CTRL002', 'Microsoft', 49.99, 35.00, 40, 5, 'https://example.com/xbox_controller.jpg', 'Xbox Controller Bluetooth', TRUE, 14, 13),
('Base refrigeración laptop', 'BASE001', 'CoolerMaster', 27.50, 18.00, 30, 5, 'https://example.com/laptop_cooler.jpg', 'Ventilador silencioso 4 puertos', TRUE, 15, 14),
('Base ajustable laptop', 'BASE002', 'Nulaxy', 23.00, 14.00, 60, 8, 'https://example.com/laptop_stand.jpg', 'Diseño plegable y ergonómico', TRUE, 16, 15),
('Protector pantalla iPhone', 'SCRN001', 'Spigen', 9.99, 4.00, 120, 10, 'https://example.com/screen_protector.jpg', 'Vidrio templado anti-rayas', TRUE, 17, 1),
('Protector pantalla Galaxy', 'SCRN002', 'ZAGG', 11.50, 5.80, 100, 8, 'https://example.com/zagg.jpg', 'Protección contra caídas', TRUE, 17, 2),
('Kit limpieza electrónica', 'CLN001', 'CleanPro', 17.50, 9.00, 80, 10, 'https://example.com/cleaning_kit.jpg', 'Incluye spray, paño de microfibra y brocha antiestática', TRUE, 18, 3),
('Kit limpieza premium', 'CLN002', 'iFixit', 22.00, 13.00, 50, 5, 'https://example.com/premium_cleaning.jpg', 'Para pantallas OLED, lentes y puertos delicados', TRUE, 18, 4),
('Antena digital interior', 'ANT001', 'RCA', 26.00, 17.50, 60, 8, 'https://example.com/digital_antenna.jpg', 'Recepción HD para televisión abierta', TRUE, 19, 5),
('Antena digital con amplificador', 'ANT002', 'Tivax', 32.00, 19.00, 40, 5, 'https://example.com/amplified_antenna.jpg', 'Mayor alcance y señal mejorada', TRUE, 19, 6),
('Soporte TV pared 32-55"', 'TVSUP001', 'Vogel’s', 44.00, 30.00, 35, 6, 'https://example.com/tv_mount.jpg', 'Montaje fijo compatible con VESA universal', TRUE, 20, 7),
('Soporte TV articulado', 'TVSUP002', 'North Bayou', 59.00, 40.00, 25, 4, 'https://example.com/articulated_mount.jpg', 'Brazos móviles y giro de hasta 180°', TRUE, 20, 8),
('Repetidor WiFi 300Mbps', 'WIFI001', 'TP-Link', 29.99, 18.00, 70, 10, 'https://example.com/wifi_repeater.jpg', 'Extiende red inalámbrica en casa', TRUE, 21, 9),
('Repetidor WiFi doble banda', 'WIFI002', 'Mercusys', 36.00, 23.50, 55, 6, 'https://example.com/wifi_dual.jpg', 'Compatible con bandas 2.4GHz y 5GHz', TRUE, 21, 10),
('Cable de audio estéreo', 'AUDCB001', 'Monster Cable', 14.50, 8.50, 65, 10, 'https://example.com/audio_cable.jpg', 'Conectores dorados y recubrimiento de nylon', TRUE, 22, 11),
('Cable auxiliar 1.5m', 'AUDCB002', 'Belkin', 11.00, 6.00, 90, 12, 'https://example.com/aux_cable.jpg', 'Jack 3.5mm universal para audio móvil', TRUE, 22, 12),
('Power Bank solar impermeable', 'PB003', 'RAVPower', 38.00, 25.00, 40, 5, 'https://example.com/solar_waterproof.jpg', 'Ideal para viajes, resistente al agua y polvo', TRUE, 23, 13),
('Power Bank con linterna', 'PB004', 'Mophie', 33.50, 21.00, 50, 6, 'https://example.com/torch_power.jpg', 'Incluye luz LED potente para emergencias', TRUE, 23, 14),
('Base carga inalámbrica 15W', 'WIRELESS001', 'Samsung', 29.00, 19.50, 60, 8, 'https://example.com/wireless_charging.jpg', 'Carga rápida compatible Qi', TRUE, 24, 15),
('Base carga triple inalámbrica', 'WIRELESS002', 'Anker', 42.00, 28.00, 30, 4, 'https://example.com/charging_pad.jpg', 'Carga simultánea para celular, reloj y audífonos', TRUE, 24, 1),
('Cable Lightning original', 'LGT001', 'Apple', 21.00, 15.00, 70, 10, 'https://example.com/lightning.jpg', 'Compatible con iPhone y iPad', TRUE, 25, 2),
('Cable Lightning trenzado 2m', 'LGT002', 'Ugreen', 17.50, 10.00, 80, 10, 'https://example.com/lightning_braided.jpg', 'Durable y compatible con carga rápida', TRUE, 25, 3);



-- customers
INSERT INTO customers (name, email, phone) VALUES
('Luis Fernández', 'luisf@gmail.com', '607111111'),
('Marcela Pinto', 'marcelap@yahoo.com', '608222222');

-- inventory
INSERT INTO inventory (product_id, type, quantity, date, comment, user_id) VALUES
(1, 'entry', 20, NOW(), 'Initial stock for iPhone', 1),
(3, 'entry', 10, NOW(), 'Initial stock for MacBook', 1),
(4, 'entry', 50, NOW(), 'Bulk entry for JBL', 2),
(1, 'exit', 2, NOW(), 'Sale to customer', 2);

-- sales
INSERT INTO sales (date, customer_id, seller_id, total) VALUES
(NOW(), 1, 2, 1560.00);

-- sale_details
INSERT INTO sale_details (sale_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 850.00),
(1, 4, 2, 120.00);

-- audits
INSERT INTO audits (user_id, action, date, description) VALUES
(1, 'CREATE_PRODUCT', NOW(), 'Created MacBook Pro'),
(2, 'SALE_COMPLETED', NOW(), 'Sold iPhone and JBL speakers');

-- notifications
INSERT INTO notifications (type, message, date, read_, user_id, global, deletable) VALUES
('stock_alert', 'Stock low for MacBook Pro', NOW(), FALSE, 1, FALSE, TRUE),
('system_info', 'New category added: Audio', NOW(), FALSE, NULL, TRUE, TRUE);
