-- Clear existing data and insert simplified sample risks
DELETE FROM risks;

-- Insert sample risks with only title, description, likelihood, and impact
INSERT INTO risks (id, title, description, likelihood, impact, severity, band, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Falla del servidor principal', 'El servidor principal podría fallar debido a hardware obsoleto', 4, 5, 20, 'Critical', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Pérdida de datos de clientes', 'Riesgo de pérdida de información confidencial de clientes', 2, 5, 10, 'Moderate', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Retraso en el proyecto', 'El proyecto podría retrasarse por falta de recursos', 3, 3, 9, 'Moderate', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Vulnerabilidad de seguridad', 'Posible brecha de seguridad en la aplicación web', 3, 4, 12, 'High', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Falta de personal clave', 'Riesgo de que personal clave abandone la empresa', 2, 3, 6, 'Low', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Cambios regulatorios', 'Nuevas regulaciones podrían afectar las operaciones', 4, 2, 8, 'Low', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Falla en el sistema de respaldo', 'El sistema de respaldo podría no funcionar cuando se necesite', 2, 4, 8, 'Low', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Ataque de ransomware', 'Posible ataque de ransomware que cifre los datos', 3, 5, 15, 'High', NOW(), NOW());
