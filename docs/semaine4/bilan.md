# Bilan

## Conversation : audit des tests des candidatures EF-32 / EF-33

1. La demande était d’auditer les tests des candidatures correspondant aux exigences
   **EF-32** (candidater, retirer sa candidature) et **EF-33** (consulter ses candidatures
   et leur statut), en distinguant les comportements couverts des lacunes confirmées.
2. Une matrice HTML a été créée dans
   [matriceTestsCandidatures.html](./matriceTestsCandidatures.html), avec les colonnes :
   **Cas à vérifier**, **Tests existants et assertion utile** et
   **Manque confirmé ou constat**.
3. Le cas d’affichage des statuts « Retenue » et « Non retenue » a été renforcé dans
   [ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) :
   - le statut `SELECTED` est vérifié avec le libellé « Retenue » ;
   - le statut `REJECTED` est vérifié avec le libellé « Non retenue » ;
   - les candidatures traitées ne proposent pas le bouton « Retirer ».
4. La matrice a ensuite été mise à jour pour classer ce cas comme **Couvert**.
   Les lacunes restantes sont :
   - la soumission complète de la modale de candidature, notamment le POST, son payload
     et la fermeture après succès ;
   - l’annulation du retrait, l’état après réponse `204` et l’affichage d’une erreur `409` ;
   - la disponibilité du bouton « Candidater » selon qu’une candidature est
     `IN_PROGRESS` ou `WITHDRAWN`.
5. Les tests backend existants couvrent déjà la création, les doublons, le retrait logique,
   les droits étudiants, l’isolation entre étudiants et les statuts API dans
   [applications.test.ts](../../backend/tests/applications.test.ts).

### Validation de l’audit

- `git --no-pager status --short` a été exécuté pour établir l’état du dépôt.
- Le script `coverage_map.py` n’a pas pu être exécuté car Python n’était pas disponible.
- `npm exec vitest run frontend/tests/ApplicationsPage.test.tsx` n’a pas démarré :
  les dépendances Vitest n’étaient pas disponibles dans `node_modules`.
- La vérification finale de l’audit repose donc sur la lecture statique ciblée des sources
  et des tests. Aucune installation de dépendances n’a été effectuée.