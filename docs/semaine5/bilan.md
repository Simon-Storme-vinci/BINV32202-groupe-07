# Bilan

## Conversation : exécution manuelle du scénario 1 E2E - recherche des offres

1. La demande était d’exécuter le scénario 1 décrit dans
   [scenarios.md](../../e2e/recherche-offres/scenarios.md), ouvert avec l’application
   locale, sans modifier le code ni créer de script de test.
2. L’application a été démarrée en développement sur `http://localhost:5173`, avec
   l’API sur `http://localhost:3000`. Les utilisateurs fictifs disponibles ont permis
   de sélectionner un administrateur, un étudiant et un représentant déposant.
3. Les utilisateurs suivants ont été testés :
   - **Anne Leclercq**, administratrice ;
   - **Lucas Dupont**, étudiant ;
   - **Claire Dumont**, représentante déposante.
4. Pour chaque rôle, la navigation a été réalisée jusqu’à la page **Offres**. Le champ
   **Rechercher par titre** a ensuite reçu la recherche `Application React`.

### Résultats observés

- La page **Offres** est accessible avec les trois rôles testés.
- L’administratrice voit initialement les 10 offres, tous statuts confondus.
- L’étudiant voit initialement les 4 offres publiées.
- La représentante déposante voit uniquement son offre déposée.
- Avec la recherche `Application React`, les trois rôles affichent uniquement
  **Application React de gestion de flotte**.
- Aucun écart n’a été constaté entre les résultats observés et le résultat attendu
  du scénario : les offres visibles sont filtrées selon leur titre.

### Limites et écarts

- La partie Playwright MCP configurée pour Chrome n’a pas pu démarrer directement
  car Chrome n’était pas installé au chemin attendu par le serveur MCP.
- L’exécution a tout de même été poursuivie avec les outils navigateur disponibles ;
  aucune modification de l’application ni aucun script de test n’a été ajouté.

## 4. Vérifier la qualité des tests et comparer les approches

- Code initial, le test réussit.
- Filtrage temporairement désactivé, le test échoue sur l’assertion des identifiants
  attendus. Il reçoit les 10 offres au lieu de la seule offre correspondant à la recherche.
- Après restauration du code, le même test réussit à nouveau.

### Comparaison

1. Playwright MCP permet à l’agent de piloter un navigateur pendant la conversation
   et d’observer l’interface. L’outil `browser_navigate` à été appellé avec l’URL
   `http://localhost:5173/offres`. La navigation n’a toutefois pas abouti : le client MCP
   a échoué à s’initialiser sur `http://localhost:8931/mcp`.

2. Playwright Test apporte des scénarios répétables avec des assertions automatiques,
automatiques,
   exécutables à nouveau pour détecter les régressions et intégrables à la CI. Un compte
   rendu MCP d’une exploration interactive ne garantit pas, à lui seul, ces vérifications
   reproductibles.

3. Je privilégierais l’exploration interactive avec MCP pour découvrir une interface
   ou investiguer un comportement imprévu. Je privilégierais un test automatisé pour
   vérifier de façon répétable un comportement connu et prévenir les régressions.


Conversation avec ia :

## Conversation : scénario E2E de recherche des offres

1. La demande était d’exécuter le scénario 1 de
   [scenarios.md](../../e2e/recherche-offres/scenarios.md) dans l’application locale,
   avec un administrateur, un étudiant et un représentant d’entreprise, sans modifier
   l’application ni générer de script de test.
2. L’exécution manuelle a été réalisée avec Anne Leclercq (administratrice), Lucas
   Dupont (étudiant) et Claire Dumont (représentante déposante). Les trois comptes ont
   accédé à **Offres**. La recherche `Application React` a affiché l’offre
   **Application React de gestion de flotte** pour chacun, en respectant les offres
   visibles selon le rôle.
3. Le serveur Playwright MCP configuré pour Chrome n’a pas démarré, car Chrome était
   absent du chemin attendu. L’interaction a été poursuivie avec les outils navigateur
   disponibles. Cette vérification était manuelle, pas un résultat de test Playwright
   automatisé.
4. À la demande d’examiner le rapport du test, aucun fichier de rapport Playwright ni
   dossier `test-results` n’a été trouvé. La lecture du test
   [recherche-offres.spec.ts](../../e2e/recherche-offres/recherche-offres.spec.ts) a
   révélé qu’il vérifie les connexions aux trois profils, mais que l’ouverture de la
   page **Offres** n’est testée qu’avec l’administratrice. Les recherches avec/sans
   résultat et le filtre de période du scénario n’y sont pas couverts.
5. Les étapes proposées pour une exécution automatisée étaient de démarrer
   l’application, installer Chromium uniquement s’il manque, exécuter le test ciblé
   avec `npx playwright test ... --project=chromium`, puis consulter le rapport avec
   `npx playwright show-report`. L’installation Playwright de Chromium n’est utile
   que si ce navigateur n’est pas déjà installé ; `npx playwright install --list`
   permet de le vérifier.

### État et limites

- Aucun test Playwright automatisé ni aucun rapport associé n’a été exécuté ou généré
  dans cette conversation.
- Une tentative ultérieure de démarrer l’application a été refusée par l’utilisateur ;
  les tests automatisés n’ont donc pas été lancés.

## Conversation : timeout de connexion et Playwright MCP

1. L’erreur rapportée était un timeout Playwright en attendant le bouton **Claire
   Dumont** dans `signInAs`.
2. Lors du diagnostic, l’API `/auth/demo-users` et le proxy Vite ont répondu `200`, et
   la liste contenait Claire Dumont. Le test Playwright n’a pas pu être rejoué : le
   binaire Chromium requis n’était pas installé dans l’environnement.
3. Une navigation Playwright MCP vers `http://localhost:5173/` a été tentée, mais le
   serveur MCP a échoué à s’initialiser ; aucune interaction avec la page n’a abouti.
