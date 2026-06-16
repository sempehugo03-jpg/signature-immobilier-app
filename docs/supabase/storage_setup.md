# Configuration Supabase Storage

Cette configuration permet aux pages de gestion de bien d'envoyer des photos et documents dans Supabase Storage.

## Buckets nécessaires

Créer deux buckets dans Supabase Storage :

1. `property-photos`
2. `property-documents`

Chemins utilisés par l'application :

- Photos : `property-photos/[agencySlug]/[propertyId]/[fileName]`
- Documents : `property-documents/[agencySlug]/[propertyId]/[fileName]`

## Création par SQL

Vous pouvez créer les buckets depuis Supabase Dashboard > Storage, ou exécuter :

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'property-photos',
    'property-photos',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'property-documents',
    'property-documents',
    true,
    20971520,
    array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
```

## Policies pilote

Pour la version pilote, les photos sont publiques afin d'être affichées sur les fiches publiques.

Les documents sont aussi configurés en lecture publique temporaire pour simplifier le pilote. Pour une vraie version de production, les documents vendeurs devront être protégés avec un bucket privé et des URLs signées.

```sql
create policy "Public read property photos"
on storage.objects
for select
using (bucket_id = 'property-photos');

create policy "Pilot upload property photos"
on storage.objects
for insert
with check (bucket_id = 'property-photos');

create policy "Pilot update property photos"
on storage.objects
for update
using (bucket_id = 'property-photos')
with check (bucket_id = 'property-photos');

create policy "Pilot delete property photos"
on storage.objects
for delete
using (bucket_id = 'property-photos');

create policy "Pilot read property documents"
on storage.objects
for select
using (bucket_id = 'property-documents');

create policy "Pilot upload property documents"
on storage.objects
for insert
with check (bucket_id = 'property-documents');

create policy "Pilot update property documents"
on storage.objects
for update
using (bucket_id = 'property-documents')
with check (bucket_id = 'property-documents');

create policy "Pilot delete property documents"
on storage.objects
for delete
using (bucket_id = 'property-documents');
```

## Variables d'environnement

Le client navigateur utilise :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Les anciens alias `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` restent supportés.

## Limites actuelles

- Photos : 10 Mo maximum par fichier.
- Documents : 20 Mo maximum par fichier.
- Photos acceptées : JPEG, PNG, WebP.
- Documents acceptés : PDF, JPEG, PNG, DOC, DOCX.
- Les documents sont lisibles publiquement dans le pilote si le bucket `property-documents` est public. À sécuriser avec URLs signées avant une mise en production complète.
