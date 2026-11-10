# Matrice des guides et des senseurs

Un **guide** donne des consignes en amont ou pendant le travail (*feedforward*).
Un **senseur** observe le code ou son comportement et fournit un retour
(*feedback*). Voici les mécanismes repérés dans ce dépôt :

| Type de mécanisme | Guide — *feedforward* | Senseur — *feedback* |
|---|---|---|
| **Inférentiel** (interprété par une IA) | Les instructions de [Copilot](../../.github/copilot-instructions.md) orientent l’agent sur l’architecture, les conventions du dépôt et les validations à effectuer. Le [README](../../README.md) et la consigne de travail donnent aussi du contexte et des objectifs. | Aucun senseur inférentiel automatique n’est configuré dans le dépôt. Le [modèle de pull request](../../.github/pull_request_template.md) prévoit des points d’attention pour la revue, mais ne réalise pas lui-même une revue par IA. |
| **Computationnel** (règles ou calculs exécutables) | [package.json](../../package.json) définit la version minimale de Node.js et les commandes reproductibles (`lint`, `typecheck`, `test`, `build`, `check`). Les configurations TypeScript et Oxlint précisent également des règles exécutables pour le code. | Les commandes `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` produisent des résultats vérifiables. Le contrôle de version de Node.js au démarrage renvoie aussi un message explicite en cas de version trop ancienne ([requireSupportedNode.ts](../../backend/src/requireSupportedNode.ts)); les tests associés vérifient les versions acceptées et refusées ([nodeVersion.test.ts](../../backend/tests/nodeVersion.test.ts)). |

**À retenir :** les instructions de Copilot guident l’agent sans exécuter de vérification ; les tests, le compilateur et le linter observent le résultat et signalent les problèmes. Une revue de code par IA pourrait compléter les senseurs du dépôt, mais n’y est pas déclarée comme mécanisme automatique.
