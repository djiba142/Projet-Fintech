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

# ─────────────────────────────────────────────────────────────────────────────
# HISTORIQUE DES TRANSACTIONS (MOCK)
# ─────────────────────────────────────────────────────────────────────────────

ORANGE_TRANSACTIONS = {
    "224622123456": [
        {"id": "OR-101", "date": "2026-04-29T10:30:00", "desc": "Paiement Facture EDG", "type": "DEBIT", "amount": 150000, "status": "SUCCESS"},
        {"id": "OR-102", "date": "2026-04-28T15:20:00", "desc": "Dépôt Agent", "type": "CREDIT", "amount": 500000, "status": "SUCCESS"},
        {"id": "OR-103", "date": "2026-04-27T09:00:00", "desc": "Achat Pass Data 2GB", "type": "DEBIT", "amount": 25000, "status": "SUCCESS"},
        {"id": "OR-104", "date": "2026-04-25T14:15:00", "desc": "Paiement Superché Madina", "type": "DEBIT", "amount": 450000, "status": "PENDING"},
    ],
    "224625999888": [
        {"id": "OR-201", "date": "2026-04-29T11:45:00", "desc": "Transfert reçu", "type": "CREDIT", "amount": 1000000, "status": "SUCCESS"},
        {"id": "OR-202", "date": "2026-04-26T20:10:00", "desc": "Retrait Agent", "type": "DEBIT", "amount": 300000, "status": "SUCCESS"},
    ]
}

MTN_TRANSACTIONS = {
    "224664100001": [
        {"id": "MTN-501", "date": "2026-04-29T08:15:00", "desc": "Réabonnement Canal+", "type": "DEBIT", "amount": 180000, "status": "SUCCESS"},
        {"id": "MTN-502", "date": "2026-04-28T18:30:00", "desc": "Transfert vers 622...", "type": "DEBIT", "amount": 75000, "status": "SUCCESS"},
        {"id": "MTN-503", "date": "2026-04-24T12:00:00", "desc": "Salaire Microfinance", "type": "CREDIT", "amount": 2500000, "status": "SUCCESS"},
    ],
    "224664789012": [
        {"id": "MTN-601", "date": "2026-04-29T09:10:00", "desc": "Achat crédit MTN", "type": "DEBIT", "amount": 50000, "status": "SUCCESS"},
    ]
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
