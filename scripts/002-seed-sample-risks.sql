-- Insert sample risks for testing
INSERT OR IGNORE INTO "Risk" (
    "id", "title", "description", "category", "owner", 
    "likelihood", "impact", "severity", "band", "status"
) VALUES 
(
    'risk-001', 
    'Falla del servidor principal', 
    'El servidor principal podría fallar debido a hardware obsoleto',
    'Tecnología',
    'Juan Pérez',
    3, 4, 12, 'High', 'Open'
),
(
    'risk-002',
    'Pérdida de datos de clientes',
    'Riesgo de pérdida de información confidencial de clientes',
    'Seguridad',
    'María García',
    2, 5, 10, 'High', 'Monitoring'
),
(
    'risk-003',
    'Retraso en entrega de proyecto',
    'El proyecto podría retrasarse por falta de recursos',
    'Proyecto',
    'Carlos López',
    4, 3, 12, 'High', 'Open'
),
(
    'risk-004',
    'Fluctuación del tipo de cambio',
    'Variaciones en el tipo de cambio pueden afectar costos',
    'Financiero',
    'Ana Martínez',
    3, 2, 6, 'Moderate', 'Open'
),
(
    'risk-005',
    'Rotación de personal clave',
    'Pérdida de empleados con conocimiento crítico',
    'Recursos Humanos',
    'Luis Rodríguez',
    2, 3, 6, 'Moderate', 'Closed'
);
