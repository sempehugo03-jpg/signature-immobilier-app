# Signature Immobilier V2 - Clean Core

## Philosophie

Signature Immobilier V2 n'est pas un CRM. La plateforme ameliore ce que le client voit :

- site public agence premium ;
- biens publics mieux presentes ;
- demandes de visite et d'estimation lisibles cote agence ;
- espace vendeur simple apres mandat ;
- Preview Studio pour Hugo avant le rendez-vous commercial ;
- activation agence uniquement apres paiement valide.

## Noyau implemente

Le noyau V2 est centralise dans :

- `src/lib/v2/core.ts` : types metier, seed, stockage pilote, actions ;
- `src/lib/v2/pages.tsx` : pages et layouts V2 ;
- `src/lib/session-cleanup.ts` : deconnexion reelle et nettoyage des sessions ;
- `src/components/session-logout-button.tsx` : bouton de sortie commun.

Les donnees sont stockees dans `localStorage` via la cle `signature_v2_state` pour le pilote. Les modeles sont volontairement proches des futures tables Supabase.

## Routes V2 principales

Public :

- `/a/[agencySlug]`
- `/a/[agencySlug]/biens`
- `/a/[agencySlug]/biens/[propertySlug]`
- `/a/[agencySlug]/estimation`
- `/mon-suivi`
- `/creer-acces/[token]` existe deja et reste la porte creation mot de passe.

Vendeur :

- `/vendeur/[sellerToken]`
- `/vendeur/[sellerToken]/bien`
- `/vendeur/[sellerToken]/visites`
- `/vendeur/[sellerToken]/documents`

Agence :

- `/agence/[agencySlug]`
- `/agence/[agencySlug]/biens`
- `/agence/[agencySlug]/biens/nouveau`
- `/agence/[agencySlug]/biens/[propertyId]`
- `/agence/[agencySlug]/vendeurs`
- `/agence/[agencySlug]/estimations`
- `/agence/[agencySlug]/demandes-visites`
- `/agence/[agencySlug]/agents`

Admin :

- `/admin`
- `/admin/preview-studio`
- `/admin/preview-studio/nouveau`
- `/admin/preview-studio/[previewId]`
- `/admin/agences`
- `/admin/agences/[agencyId]`
- `/admin/tarifs`
- `/admin/abonnements`

## Mon suivi

`/mon-suivi` ne redirige jamais automatiquement au chargement.

Sans session :

- email ;
- mot de passe ;
- bouton `Acceder a mon espace` ;
- acces administrateur Signature par code.

Avec session existante :

- message `Vous etes deja connecte avec [email].` ;
- bouton `Continuer vers mon espace` ;
- bouton `Changer de compte` ;
- acces administrateur toujours disponible.

## Activation agence

Le Preview Studio prepare un lien Stripe pilote et place l'agence en `payment_pending`. Le passage en `active` est separe et explicite via `Paiement valide`.

La logique a brancher ensuite :

- creation de session Stripe cote serveur ;
- webhook Stripe ;
- passage `active` uniquement depuis webhook valide ;
- creation invitation patron apres paiement valide.

## Scraping et IA

Le Preview Studio contient les etats et ecrans :

- mode automatique ;
- mode assiste ;
- mode manuel rapide ;
- biens detectes ;
- demandes IA avec validation par Hugo.

Le scraping reel et les appels IA restent a brancher cote serveur. L'interface ne bloque pas si le scraping echoue.
