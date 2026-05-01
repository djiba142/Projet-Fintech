"""
Module 2 — Base de données Mock pour les simulateurs d'opérateurs.
Architecture Dual-MSISDN : chaque opérateur a ses propres numéros.
Données enrichies avec historique réaliste pour chaque client Kandjou.
"""

# ─────────────────────────────────────────────────────────────────────────────
# BASE ORANGE MONEY
# ─────────────────────────────────────────────────────────────────────────────
ORANGE_ACCOUNTS = {
    "224622123456": {"msisdn": "224622123456", "available_balance": 2500000, "last_deposit": "2026-04-10", "status": "ACTIVE"},
    "224623456789": {"msisdn": "224623456789", "available_balance": 850000, "last_deposit": "2026-03-28", "status": "ACTIVE"},
    "224624111222": {"msisdn": "224624111222", "available_balance": 120000, "last_deposit": "2026-01-15", "status": "SUSPENDED"},
    "224625999888": {"msisdn": "224625999888", "available_balance": 4200000, "last_deposit": "2026-04-18", "status": "ACTIVE"},
    # Nouveaux clients migrés
    "224620000001": {"msisdn": "224620000001", "available_balance": 5000000, "last_deposit": "2026-05-01", "status": "ACTIVE"},
    "224620000002": {"msisdn": "224620000002", "available_balance": 1250000, "last_deposit": "2026-04-25", "status": "ACTIVE"},
    "224620000003": {"msisdn": "224620000003", "available_balance": 3400000, "last_deposit": "2026-04-30", "status": "ACTIVE"},
    "224620000004": {"msisdn": "224620000004", "available_balance": 900000,  "last_deposit": "2026-04-12", "status": "ACTIVE"},
    "224620000005": {"msisdn": "224620000005", "available_balance": 15000000,"last_deposit": "2026-05-01", "status": "ACTIVE"},
    "224620000006": {"msisdn": "224620000006", "available_balance": 450000,  "last_deposit": "2026-03-10", "status": "ACTIVE"},
    "224620000007": {"msisdn": "224620000007", "available_balance": 7800000, "last_deposit": "2026-04-28", "status": "ACTIVE"},
    "224620000008": {"msisdn": "224620000008", "available_balance": 2100000, "last_deposit": "2026-04-20", "status": "ACTIVE"},
    "224620000009": {"msisdn": "224620000009", "available_balance": 11200000,"last_deposit": "2026-05-01", "status": "ACTIVE"},
    "224620000010": {"msisdn": "224620000010", "available_balance": 350000,  "last_deposit": "2026-04-05", "status": "ACTIVE"},
}

# ─────────────────────────────────────────────────────────────────────────────
# BASE MTN MOMO
# ─────────────────────────────────────────────────────────────────────────────
MTN_ACCOUNTS = {
    "224664789012": {"subscriber_number": "224664789012", "current_balance": 3750000, "currency": "GNF", "account_state": "OPEN"},
    "224664100001": {"subscriber_number": "224664100001", "current_balance": 780000,  "currency": "GNF", "account_state": "OPEN"},
    "224664100002": {"subscriber_number": "224664100002", "current_balance": 1500000, "currency": "GNF", "account_state": "OPEN"},
    # Dual-Sim pour les nouveaux clients
    "224664000001": {"subscriber_number": "224664000001", "current_balance": 1200000, "currency": "GNF", "account_state": "OPEN"},
    "224664000002": {"subscriber_number": "224664000002", "current_balance": 8500000, "currency": "GNF", "account_state": "OPEN"},
    "224664000004": {"subscriber_number": "224664000004", "current_balance": 340000,  "currency": "GNF", "account_state": "OPEN"},
    "224664000005": {"subscriber_number": "224664000005", "current_balance": 9200000, "currency": "GNF", "account_state": "OPEN"},
    "224664000007": {"subscriber_number": "224664000007", "current_balance": 450000,  "currency": "GNF", "account_state": "OPEN"},
    "224664000009": {"subscriber_number": "224664000009", "current_balance": 1800000, "currency": "GNF", "account_state": "OPEN"},
}

SIMULATED_OUTAGE_MSISDNS = {"224622999999", "224664999999"}

# ─────────────────────────────────────────────────────────────────────────────
# HISTORIQUE DES TRANSACTIONS ORANGE (Réaliste & Complet)
# ─────────────────────────────────────────────────────────────────────────────
ORANGE_TRANSACTIONS = {
    "224622123456": [
        {"id": "OR-101", "date": "2026-04-29T10:30:00", "desc": "Paiement EDG", "type": "DEBIT", "amount": 150000, "status": "SUCCESS"},
        {"id": "OR-102", "date": "2026-04-28T14:20:00", "desc": "Recharge crédit Cellcom", "type": "DEBIT", "amount": 50000, "status": "SUCCESS"},
    ],
    # ── Client 1 : Aboubacar Sylla ──
    "224620000001": [
        {"id": "OR-A01", "date": "2026-05-01T08:00:00", "desc": "Dépôt Agent - Kaloum", "type": "CREDIT", "amount": 5000000, "status": "SUCCESS"},
        {"id": "OR-A02", "date": "2026-04-30T16:45:00", "desc": "Paiement EDG Électricité", "type": "DEBIT", "amount": 350000, "status": "SUCCESS"},
        {"id": "OR-A03", "date": "2026-04-29T09:15:00", "desc": "Transfert vers Mariama Barry", "type": "DEBIT", "amount": 200000, "status": "SUCCESS"},
        {"id": "OR-A04", "date": "2026-04-28T11:30:00", "desc": "Salaire SOTELGUI", "type": "CREDIT", "amount": 3500000, "status": "SUCCESS"},
        {"id": "OR-A05", "date": "2026-04-27T14:00:00", "desc": "Achat Marché Madina", "type": "DEBIT", "amount": 175000, "status": "SUCCESS"},
        {"id": "OR-A06", "date": "2026-04-25T08:30:00", "desc": "Transfert reçu de Lansana Kouyate", "type": "CREDIT", "amount": 500000, "status": "SUCCESS"},
        {"id": "OR-A07", "date": "2026-04-22T17:00:00", "desc": "Paiement SOTELGUI Internet", "type": "DEBIT", "amount": 120000, "status": "SUCCESS"},
        {"id": "OR-A08", "date": "2026-04-20T10:00:00", "desc": "Frais scolarité enfants", "type": "DEBIT", "amount": 750000, "status": "SUCCESS"},
    ],
    # ── Client 2 : Hadja Mariama Barry ──
    "224620000002": [
        {"id": "OR-B01", "date": "2026-04-30T10:00:00", "desc": "Vente tissus Marché Niger", "type": "CREDIT", "amount": 850000, "status": "SUCCESS"},
        {"id": "OR-B02", "date": "2026-04-29T15:30:00", "desc": "Transfert vers fournisseur Dubaï", "type": "DEBIT", "amount": 1200000, "status": "SUCCESS"},
        {"id": "OR-B03", "date": "2026-04-28T08:00:00", "desc": "Dépôt Agent - Ratoma", "type": "CREDIT", "amount": 2000000, "status": "SUCCESS"},
        {"id": "OR-B04", "date": "2026-04-26T12:15:00", "desc": "Paiement loyer boutique", "type": "DEBIT", "amount": 500000, "status": "SUCCESS"},
        {"id": "OR-B05", "date": "2026-04-24T09:00:00", "desc": "Transfert reçu de Aboubacar Sylla", "type": "CREDIT", "amount": 200000, "status": "SUCCESS"},
        {"id": "OR-B06", "date": "2026-04-22T16:30:00", "desc": "Recharge crédit téléphone", "type": "DEBIT", "amount": 30000, "status": "SUCCESS"},
    ],
    # ── Client 3 : Ousmane Keita (Orange uniquement) ──
    "224620000003": [
        {"id": "OR-C01", "date": "2026-04-30T14:00:00", "desc": "Salaire Ministère Éducation", "type": "CREDIT", "amount": 4200000, "status": "SUCCESS"},
        {"id": "OR-C02", "date": "2026-04-29T10:30:00", "desc": "Paiement EDG Électricité", "type": "DEBIT", "amount": 280000, "status": "SUCCESS"},
        {"id": "OR-C03", "date": "2026-04-27T08:45:00", "desc": "Transfert vers famille Kankan", "type": "DEBIT", "amount": 600000, "status": "SUCCESS"},
        {"id": "OR-C04", "date": "2026-04-25T15:00:00", "desc": "Achat médicaments Pharmacie Centrale", "type": "DEBIT", "amount": 185000, "status": "SUCCESS"},
        {"id": "OR-C05", "date": "2026-04-23T11:00:00", "desc": "Dépôt Agent - Dixinn", "type": "CREDIT", "amount": 1000000, "status": "SUCCESS"},
    ],
    # ── Client 4 : Aissatou Bah ──
    "224620000004": [
        {"id": "OR-D01", "date": "2026-04-30T09:30:00", "desc": "Paiement SOTELGUI Fibre", "type": "DEBIT", "amount": 200000, "status": "SUCCESS"},
        {"id": "OR-D02", "date": "2026-04-28T14:00:00", "desc": "Commission vente mobile", "type": "CREDIT", "amount": 350000, "status": "SUCCESS"},
        {"id": "OR-D03", "date": "2026-04-26T08:00:00", "desc": "Frais transport taxi", "type": "DEBIT", "amount": 45000, "status": "SUCCESS"},
        {"id": "OR-D04", "date": "2026-04-24T16:30:00", "desc": "Transfert reçu de Sekou Toure", "type": "CREDIT", "amount": 150000, "status": "SUCCESS"},
        {"id": "OR-D05", "date": "2026-04-22T11:15:00", "desc": "Achat crédit data Orange", "type": "DEBIT", "amount": 75000, "status": "SUCCESS"},
    ],
    # ── Client 5 : Thierno Amadou Tidiane ──
    "224620000005": [
        {"id": "OR-E01", "date": "2026-05-01T07:00:00", "desc": "Virement entreprise BTP", "type": "CREDIT", "amount": 12000000, "status": "SUCCESS"},
        {"id": "OR-E02", "date": "2026-04-30T15:00:00", "desc": "Paiement fournisseur ciment", "type": "DEBIT", "amount": 4500000, "status": "SUCCESS"},
        {"id": "OR-E03", "date": "2026-04-28T10:00:00", "desc": "Salaire employés chantier", "type": "DEBIT", "amount": 2800000, "status": "SUCCESS"},
        {"id": "OR-E04", "date": "2026-04-26T08:30:00", "desc": "Paiement carburant Total Conakry", "type": "DEBIT", "amount": 650000, "status": "SUCCESS"},
        {"id": "OR-E05", "date": "2026-04-24T14:00:00", "desc": "Acompte client construction", "type": "CREDIT", "amount": 8000000, "status": "SUCCESS"},
        {"id": "OR-E06", "date": "2026-04-22T09:00:00", "desc": "Paiement EDG Industrie", "type": "DEBIT", "amount": 980000, "status": "SUCCESS"},
        {"id": "OR-E07", "date": "2026-04-20T16:00:00", "desc": "Achat matériaux Marché Taouyah", "type": "DEBIT", "amount": 1350000, "status": "SUCCESS"},
    ],
    # ── Client 6 : Salematou Traore (Orange uniquement) ──
    "224620000006": [
        {"id": "OR-F01", "date": "2026-04-28T10:00:00", "desc": "Dépôt Agent - Matam", "type": "CREDIT", "amount": 300000, "status": "SUCCESS"},
        {"id": "OR-F02", "date": "2026-04-26T15:30:00", "desc": "Achat riz et huile Marché", "type": "DEBIT", "amount": 125000, "status": "SUCCESS"},
        {"id": "OR-F03", "date": "2026-04-24T09:00:00", "desc": "Transfert vers mère N'Zérékoré", "type": "DEBIT", "amount": 100000, "status": "SUCCESS"},
        {"id": "OR-F04", "date": "2026-04-20T12:00:00", "desc": "Paiement couture tailleur", "type": "DEBIT", "amount": 80000, "status": "SUCCESS"},
    ],
    # ── Client 7 : Lansana Kouyate ──
    "224620000007": [
        {"id": "OR-G01", "date": "2026-04-30T08:00:00", "desc": "Salaire ONG internationale", "type": "CREDIT", "amount": 6500000, "status": "SUCCESS"},
        {"id": "OR-G02", "date": "2026-04-29T14:30:00", "desc": "Paiement loyer appartement", "type": "DEBIT", "amount": 1500000, "status": "SUCCESS"},
        {"id": "OR-G03", "date": "2026-04-27T10:00:00", "desc": "Transfert vers Aboubacar Sylla", "type": "DEBIT", "amount": 500000, "status": "SUCCESS"},
        {"id": "OR-G04", "date": "2026-04-25T16:00:00", "desc": "Paiement SOTELGUI", "type": "DEBIT", "amount": 95000, "status": "SUCCESS"},
        {"id": "OR-G05", "date": "2026-04-23T09:30:00", "desc": "Achat essence station Kipé", "type": "DEBIT", "amount": 200000, "status": "SUCCESS"},
        {"id": "OR-G06", "date": "2026-04-21T13:00:00", "desc": "Recharge Orange 5Go", "type": "DEBIT", "amount": 100000, "status": "SUCCESS"},
    ],
    # ── Client 8 : Mohamed Camara (Orange uniquement) ──
    "224620000008": [
        {"id": "OR-H01", "date": "2026-04-29T11:00:00", "desc": "Vente poissons marché Kaporo", "type": "CREDIT", "amount": 1400000, "status": "SUCCESS"},
        {"id": "OR-H02", "date": "2026-04-28T07:00:00", "desc": "Achat filets de pêche", "type": "DEBIT", "amount": 450000, "status": "SUCCESS"},
        {"id": "OR-H03", "date": "2026-04-26T15:00:00", "desc": "Paiement carburant pirogue", "type": "DEBIT", "amount": 300000, "status": "SUCCESS"},
        {"id": "OR-H04", "date": "2026-04-24T10:00:00", "desc": "Dépôt Agent - Boulbinet", "type": "CREDIT", "amount": 800000, "status": "SUCCESS"},
        {"id": "OR-H05", "date": "2026-04-22T14:30:00", "desc": "Transfert famille Boffa", "type": "DEBIT", "amount": 250000, "status": "SUCCESS"},
    ],
    # ── Client 9 : Fatoumata Binta Diallo ──
    "224620000009": [
        {"id": "OR-I01", "date": "2026-05-01T09:00:00", "desc": "Salaire Banque Centrale (BCRG)", "type": "CREDIT", "amount": 8500000, "status": "SUCCESS"},
        {"id": "OR-I02", "date": "2026-04-30T14:30:00", "desc": "Paiement EDG + Eau SEG", "type": "DEBIT", "amount": 420000, "status": "SUCCESS"},
        {"id": "OR-I03", "date": "2026-04-28T10:00:00", "desc": "Frais scolarité Université Gamal", "type": "DEBIT", "amount": 2500000, "status": "SUCCESS"},
        {"id": "OR-I04", "date": "2026-04-26T16:00:00", "desc": "Achat bijoux Marché Madina", "type": "DEBIT", "amount": 680000, "status": "SUCCESS"},
        {"id": "OR-I05", "date": "2026-04-24T08:00:00", "desc": "Transfert reçu de Thierno Amadou", "type": "CREDIT", "amount": 1000000, "status": "SUCCESS"},
        {"id": "OR-I06", "date": "2026-04-22T12:00:00", "desc": "Cotisation tontine mensuelle", "type": "DEBIT", "amount": 500000, "status": "SUCCESS"},
    ],
    # ── Client 10 : Sekou Toure (Orange uniquement) ──
    "224620000010": [
        {"id": "OR-J01", "date": "2026-04-28T09:00:00", "desc": "Dépôt Agent - Matoto", "type": "CREDIT", "amount": 250000, "status": "SUCCESS"},
        {"id": "OR-J02", "date": "2026-04-26T14:00:00", "desc": "Recharge crédit Orange", "type": "DEBIT", "amount": 20000, "status": "SUCCESS"},
        {"id": "OR-J03", "date": "2026-04-24T10:30:00", "desc": "Transfert vers Aissatou Bah", "type": "DEBIT", "amount": 150000, "status": "SUCCESS"},
        {"id": "OR-J04", "date": "2026-04-20T08:00:00", "desc": "Petit commerce - vente habits", "type": "CREDIT", "amount": 180000, "status": "SUCCESS"},
    ],
}

# ─────────────────────────────────────────────────────────────────────────────
# HISTORIQUE DES TRANSACTIONS MTN (Réaliste & Complet)
# ─────────────────────────────────────────────────────────────────────────────
MTN_TRANSACTIONS = {
    # ── Client 1 : Aboubacar Sylla (Dual-SIM) ──
    "224664000001": [
        {"id": "MTN-A01", "date": "2026-05-01T09:00:00", "desc": "Salaire reçu employeur", "type": "CREDIT", "amount": 1200000, "status": "SUCCESS"},
        {"id": "MTN-A02", "date": "2026-04-29T16:00:00", "desc": "Paiement restaurant Le Damier", "type": "DEBIT", "amount": 85000, "status": "SUCCESS"},
        {"id": "MTN-A03", "date": "2026-04-27T10:30:00", "desc": "Recharge MTN Data 10Go", "type": "DEBIT", "amount": 150000, "status": "SUCCESS"},
        {"id": "MTN-A04", "date": "2026-04-25T14:00:00", "desc": "Transfert reçu de Mohamed Camara", "type": "CREDIT", "amount": 300000, "status": "SUCCESS"},
        {"id": "MTN-A05", "date": "2026-04-23T08:00:00", "desc": "Paiement parking Kaloum", "type": "DEBIT", "amount": 15000, "status": "SUCCESS"},
    ],
    # ── Client 2 : Hadja Mariama Barry (Dual-SIM) ──
    "224664000002": [
        {"id": "MTN-B01", "date": "2026-04-30T11:00:00", "desc": "Transfert reçu client commerce", "type": "CREDIT", "amount": 3200000, "status": "SUCCESS"},
        {"id": "MTN-B02", "date": "2026-04-28T15:00:00", "desc": "Achat gros lot pagnes Dakar", "type": "DEBIT", "amount": 5500000, "status": "SUCCESS"},
        {"id": "MTN-B03", "date": "2026-04-26T09:30:00", "desc": "Cotisation tontine femmes", "type": "DEBIT", "amount": 250000, "status": "SUCCESS"},
        {"id": "MTN-B04", "date": "2026-04-24T14:00:00", "desc": "Vente tissus bazin client VIP", "type": "CREDIT", "amount": 1800000, "status": "SUCCESS"},
        {"id": "MTN-B05", "date": "2026-04-22T08:30:00", "desc": "Frais douane port Conakry", "type": "DEBIT", "amount": 750000, "status": "SUCCESS"},
    ],
    # ── Client 4 : Aissatou Bah (Dual-SIM) ──
    "224664000004": [
        {"id": "MTN-D01", "date": "2026-04-29T12:00:00", "desc": "Dépôt Agent MTN - Cosa", "type": "CREDIT", "amount": 200000, "status": "SUCCESS"},
        {"id": "MTN-D02", "date": "2026-04-27T14:30:00", "desc": "Abonnement Canal+ mensuel", "type": "DEBIT", "amount": 65000, "status": "SUCCESS"},
        {"id": "MTN-D03", "date": "2026-04-25T09:00:00", "desc": "Recharge crédit MTN", "type": "DEBIT", "amount": 25000, "status": "SUCCESS"},
    ],
    # ── Client 5 : Thierno Amadou Tidiane (Dual-SIM) ──
    "224664000005": [
        {"id": "MTN-E01", "date": "2026-04-30T08:00:00", "desc": "Encaissement client chantier Coyah", "type": "CREDIT", "amount": 4500000, "status": "SUCCESS"},
        {"id": "MTN-E02", "date": "2026-04-28T13:00:00", "desc": "Paiement sous-traitant électricité", "type": "DEBIT", "amount": 1800000, "status": "SUCCESS"},
        {"id": "MTN-E03", "date": "2026-04-26T10:00:00", "desc": "Transfert vers Fatoumata Binta", "type": "DEBIT", "amount": 1000000, "status": "SUCCESS"},
        {"id": "MTN-E04", "date": "2026-04-24T15:00:00", "desc": "Paiement assurance véhicule", "type": "DEBIT", "amount": 450000, "status": "SUCCESS"},
        {"id": "MTN-E05", "date": "2026-04-22T08:00:00", "desc": "Acompte projet Dubréka", "type": "CREDIT", "amount": 6000000, "status": "SUCCESS"},
    ],
    # ── Client 7 : Lansana Kouyate (Dual-SIM) ──
    "224664000007": [
        {"id": "MTN-G01", "date": "2026-04-29T10:00:00", "desc": "Prime ONG trimestrielle", "type": "CREDIT", "amount": 2000000, "status": "SUCCESS"},
        {"id": "MTN-G02", "date": "2026-04-27T15:30:00", "desc": "Achat billet d'avion Air Guinée", "type": "DEBIT", "amount": 1200000, "status": "SUCCESS"},
        {"id": "MTN-G03", "date": "2026-04-25T08:00:00", "desc": "Cotisation mutuelle santé", "type": "DEBIT", "amount": 180000, "status": "SUCCESS"},
        {"id": "MTN-G04", "date": "2026-04-23T12:00:00", "desc": "Recharge MTN bundle illimité", "type": "DEBIT", "amount": 200000, "status": "SUCCESS"},
    ],
    # ── Client 9 : Fatoumata Binta Diallo (Dual-SIM) ──
    "224664000009": [
        {"id": "MTN-I01", "date": "2026-04-30T09:00:00", "desc": "Indemnité logement BCRG", "type": "CREDIT", "amount": 2500000, "status": "SUCCESS"},
        {"id": "MTN-I02", "date": "2026-04-28T14:00:00", "desc": "Paiement cours particuliers enfants", "type": "DEBIT", "amount": 300000, "status": "SUCCESS"},
        {"id": "MTN-I03", "date": "2026-04-26T10:30:00", "desc": "Achat vêtements Marché HLM", "type": "DEBIT", "amount": 450000, "status": "SUCCESS"},
        {"id": "MTN-I04", "date": "2026-04-24T16:00:00", "desc": "Transfert vers sœur Labé", "type": "DEBIT", "amount": 350000, "status": "SUCCESS"},
    ],
}

TEST_SCENARIOS = {
    "client_complet": {"msisdn_orange": "224620000001", "msisdn_mtn": "224664000001", "description": "Profil Aboubacar Sylla"},
    "client_orange_seul": {"msisdn_orange": "224620000003", "msisdn_mtn": None, "description": "Profil Ousmane Keita (Orange uniquement)"},
    "client_gros_volume": {"msisdn_orange": "224620000005", "msisdn_mtn": "224664000005", "description": "Profil Thierno Amadou Tidiane (BTP, gros volumes)"},
    "client_petit_commerce": {"msisdn_orange": "224620000006", "msisdn_mtn": None, "description": "Profil Salematou Traore (petit commerce)"},
}
