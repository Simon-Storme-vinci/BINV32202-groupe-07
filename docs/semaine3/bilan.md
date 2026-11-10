# Bilan

## Conversation : matrice des guides et des senseurs

1. La demande était de repérer, dans le dépôt et à partir de la consigne illustrée,
   les mécanismes de type guide (*feedforward*) et senseur (*feedback*), puis de les
   classer selon qu’ils sont inférentiels ou computationnels.
2. La matrice a d’abord été créée en Markdown, puis convertie en
   [matriceGuides.html](./matriceGuides.html) pour rendre sa représentation plus claire.
3. La première version ne mentionnait pas le cahier des charges ni les tests unitaires.
   Après la remarque de l’utilisateur, la matrice a été complétée :
   - le [cahier des charges](../cdc_gesta_developpement.md) est classé comme guide
     inférentiel, car ses exigences métier doivent être interprétées par l’agent ;
   - les attentes des tests peuvent guider l’implémentation (guide computationnel),
     puis leur exécution vérifie le comportement (senseur computationnel) ;
   - des exemples de tests API et frontend sont liés dans la matrice.
4. Les instructions Copilot et le README figurent également parmi les guides
   inférentiels. Les commandes de lint, de vérification TypeScript, de tests et de build,
   ainsi que les tests de version Node.js, figurent comme senseurs computationnels.
   Aucun senseur inférentiel automatique n’a été identifié dans le dépôt.

La vérification documentaire effectuée après la mise à jour est `git diff --check` ;
elle s’est terminée sans erreur. Aucune suite de tests n’a été lancée pour cette
modification de documentation.


## Récapitulatif des échanges : tracabilité EF32-EF33

1. La demande initiale était de construire une matrice reliant les exigences EF-32
   (candidater et retirer sa candidature) et EF-33 (consulter ses candidatures et leur
   statut) aux tests existants, en jugeant la couverture à partir des assertions réelles.
2. Le livrable a été précisé : la matrice est la page
   [matriceTracabilite.html](./matriceTracabilite.html).
3. Après avoir repéré les cas absents ou partiellement couverts, la demande suivante a
   été d’ajouter les tests les plus importants, surtout à l’API/backend, puis de lancer
   `npm run check` et d’en relever les résultats.
4. Ce bilan récapitule la matrice, les changements apportés aux tests et leurs
   validations.

## Tests ajoutés ou renforcés

Dans [applications.test.ts](../../backend/tests/applications.test.ts), les tests
existants ont été complétés avec les cas suivants :

- **« refuse une candidature à une offre non publiée de l'année courante »**
  - Vérification : soumet une candidature à `OFFER.CLIENT_PORTAL` (`SUBMITTED`, année courante), attend `404` / `NOT_FOUND`, puis vérifie que l’offre ne figure pas dans les candidatures de l’étudiant.
  - Défaut détecté : l’API accepterait une offre non publiée, ou la créerait malgré l’erreur annoncée.
- **« liste les statuts de candidature de l'étudiant connecté »**
  - Vérification : interroge GET pour les propriétaires des candidatures retenue, non retenue et retirée ; vérifie les ID et les statuts `SELECTED`, `REJECTED` et `WITHDRAWN`.
  - Défaut détecté : l’API omettrait une candidature ou retournerait un statut erroné pour l’un de ces cas.
- **« retire logiquement une candidature et autorise une nouvelle candidature » — renforcé**
  - Vérification : contrôle la création sans message (`201`, `message: null`), le retrait (`204`), la présence de l’ancienne candidature en `WITHDRAWN`, puis la création d’une candidature de remplacement avec un nouvel ID.
  - Défaut détecté : le message facultatif serait rejeté, le retrait ne serait pas conservé, ou une nouvelle candidature ne pourrait pas être créée après retrait.
- **« refuse à un étudiant de retirer la candidature d'un autre étudiant »**
  - Vérification : attend `404` / `NOT_FOUND`, puis relit la candidature sous l’identité de son propriétaire et vérifie qu’elle est toujours `IN_PROGRESS`.
  - Défaut détecté : le serveur autoriserait le retrait inter-comptes, ou modifierait la candidature malgré le refus.
- **« refuse l'accès aux candidatures pour un utilisateur non étudiant »**
  - Vérification : confirme que GET, POST et DELETE renvoient chacun `403` / `FORBIDDEN` pour un administrateur.
  - Défaut détecté : une route de candidature laisserait accéder un profil autre qu’étudiant.

Le scénario de retrait d’une candidature déjà traitée a aussi été rendu plus lisible en
remplaçant l’identifiant numérique direct par `APPLICATION.MATEUSZ_CLOUD_MIGRATION`.

Ces tests utilisent Vitest, Supertest, le seed et les bases SQLite en mémoire déjà
configurées dans le projet. Aucun test end-to-end ni changement de code métier n’a été
nécessaire.

## Résultats de validation

- **Tests API ciblés** — `npm.cmd exec --workspace=backend -- vitest run tests/applications.test.ts` : réussi, 1 fichier et 9 tests.
- **Lint** — inclus dans `npm.cmd run check` : réussi pour les workspaces backend et frontend.
- **Typecheck** — inclus dans `npm.cmd run check` : réussi pour les workspaces backend et frontend.
- **Tests backend** — inclus dans `npm.cmd run check` : réussi, 10 fichiers et 124 tests.
- **Tests frontend** — inclus dans `npm.cmd run check` : réussi, 8 fichiers et 51 tests.
- **Build backend** — inclus dans `npm.cmd run check` : réussi, compilation TypeScript et copie des migrations.
- **Build frontend** — inclus dans `npm.cmd run check` : réussi, compilation TypeScript et build Vite.
- **Vérification de la matrice HTML** — parse HTML et validation des liens locaux : réussi, HTML analysé, 24 liens locaux vérifiés, aucune ligne avec espace final.
- **Hygiène du diff** — `git diff --check` : réussi.

La commande globale `npm.cmd run check` a terminé avec le code de sortie 0.

## Limites restantes

- Aucun test de rendu UI n’a été ajouté pour les libellés « Retenue » et « Non retenue ».
  Leur correspondance est définie dans le code de libellés, mais la matrice note ce
  manque de test d’affichage.
- Aucune vérification manuelle dans un navigateur n’a été effectuée.
- Aucun défaut artificiel n’a été introduit dans le code métier pour confirmer qu’un
  test échoue : cette vérification aurait demandé une modification temporaire du
  comportement de production, non nécessaire pour cette tâche.

