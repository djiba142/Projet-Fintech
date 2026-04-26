"""
Module 2 — Base de données Mock pour les simulateurs d'opérateurs.

Architecture Dual-MSISDN : chaque opérateur a ses propres numéros.
Un client Orange 224622XXXXXX peut avoir un numéro MTN 224664XXXXXX différent.
C'est M3 qui collecte les deux numéros au moment du consentement OTP.
"""

# ─────────────────────────────────────────────────────────────────────────────
# BASE ORANGE MONEY
# Préfixes Orange : 622, 623, 624, 625
# ─────────────────────────────────────────────────────────────────────────────

ORANGE_ACCOUNTS = {
    "224622123456": {
        "msisdn": "224622123456",
        "available_balance": 2_500_000,
        "last_deposit": "2026-04-10",
        "status": "ACTIVE"
    },
    "224623456789": {
        "msisdn": "224623456789",
        "available_balance": 850_000,
        "last_deposit": "2026-03-28",
        "status": "ACTIVE"
    },
    "224624111222": {
        "msisdn": "224624111222",
        "available_balance": 120_000,
        "last_deposit": "2026-01-15",
        "status": "SUSPENDED"
    },
    "224625999888": {
        "msisdn": "224625999888",
        "available_balance": 4_200_000,
        "last_deposit": "2026-04-18",
        "status": "ACTIVE"
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# BASE MTN MOMO
# Préfixe MTN : 664
# ─────────────────────────────────────────────────────────────────────────────

MTN_ACCOUNTS = {
    # Numéros MTN purement MTN
    "224664789012": {
        "subscriber_number": "224664789012",
        "current_balance": 3_750_000,
        "currency": "GNF",
        "account_state": "OPEN"
    },
    "224664333444": {
        "subscriber_number": "224664333444",
        "current_balance": 50_000,
        "currency": "GNF",
        "account_state": "CLOSED"
    },
    # Numéros MTN des clients qui ont aussi Orange
    "224664100001": {      # ← MTN de 224622123456
        "subscriber_number": "224664100001",
        "current_balance": 780_000,
        "currency": "GNF",
        "account_state": "OPEN"
    },
    "224664100002": {      # ← MTN de 224623456789
        "subscriber_number": "224664100002",
        "current_balance": 1_500_000,
        "currency": "GNF",
        "account_state": "OPEN"
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION DES SCÉNARIOS DE TEST
# ─────────────────────────────────────────────────────────────────────────────

# MSISDN spéciaux pour simuler des pannes réseau (retourne 503)
SIMULATED_OUTAGE_MSISDNS = {
    "224622999999",   # Panne Orange uniquement
    "224664999999",   # Panne MTN uniquement
}

# Scénarios de test complets pour M4 (Dashboard)
TEST_SCENARIOS = {
    "client_double_operateur": {
        "msisdn_orange": "224622123456",
        "msisdn_mtn":    "224664100001",
        "description":   "Client avec Orange + MTN — score élevé attendu"
    },
    "client_orange_only": {
        "msisdn_orange": "224625999888",
        "msisdn_mtn":    None,
        "description":   "Client Orange uniquement — mode dégradé MTN"
    },
    "client_mtn_only": {
        "msisdn_orange": None,
        "msisdn_mtn":    "224664789012",
        "description":   "Client MTN uniquement — mode dégradé Orange"
    },
    "client_compte_suspendu": {
        "msisdn_orange": "224624111222",
        "msisdn_mtn":    None,
        "description":   "Compte Orange suspendu — malus scoring attendu"
    },
}
