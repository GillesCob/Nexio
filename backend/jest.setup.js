// Variables d'environnement factices pour les tests : aucune clé réelle, aucun accès réseau.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret'
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
process.env.RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL || 'http://localhost:5173/reset-password'
