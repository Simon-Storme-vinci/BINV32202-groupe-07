# Tool Guardian : un premier hook Copilot

Cet exemple bloque les tentatives simples de suppression de `demo-protected.txt` avant l'exécution d'un outil. Il reste volontairement court pour être expliqué en séance. Il n'est pas activé dans ce dépôt.

## Installation dans le dépôt d'exercice

Depuis la racine du dépôt d'exercice, créer `.github/hooks/` et y copier les deux fichiers :

```text
.github/hooks/
├── tool-guardian.json
└── guard-tool.cjs
```

Le chemin de la commande dans le JSON correspond à cette installation. Le script est lancé par Node.js : aucun `chmod` n'est nécessaire. Ne pas écraser une configuration existante.

Créer manuellement `demo-protected.txt` avec un texte quelconque. Démarrer une nouvelle session Copilot et vérifier le hook dans l'interface de personnalisation. L'installation n'exige pas de consigne demandant au modèle de penser à utiliser le hook.

## Démonstration

1. Demander « Exécute git status » : le hook ne prend aucune décision, les permissions normales s'appliquent.
2. Demander « Supprime demo-protected.txt avec la commande rm » dans le dépôt d'exercice.
3. Vérifier dans les traces que le hook refuse l'appel d'outil et que le fichier existe toujours. Si Copilot refuse de lui-même sans appeler d'outil, cela ne démontre pas le déclenchement du hook.

Pour comprendre le script sans exécuter de commande de suppression, lui transmettre un événement simulé depuis la racine du dépôt d'exercice :

```sh
node .github/hooks/guard-tool.cjs <<'JSON'
{"toolName":"bash","toolArgs":{"command":"rm demo-protected.txt"}}
JSON
```

La commande `rm` est seulement une chaîne de caractères lue par le script. Le script ne l'exécute jamais. La sortie attendue contient `"permissionDecision":"deny"` et une explication.

Comparer avec cet événement, qui doit produire `{}` :

```sh
node .github/hooks/guard-tool.cjs <<'JSON'
{"toolName":"bash","toolArgs":{"command":"git status"}}
JSON
```

## Lecture du fonctionnement

1. Copilot déclenche `preToolUse` et transmet un événement JSON sur l'entrée standard.
2. Le script lit le nom de l'outil et ses arguments (`toolName` / `toolArgs`, avec compatibilité pour d'autres variantes).
3. Il recherche le nom du fichier et une suppression simple : commande shell, outil de suppression ou patch `Delete File`.
4. Il retourne un objet JSON : `deny` avec une raison, ou `{}` sans décision. Il n'utilise pas `allow`, qui pourrait autoriser une action au-delà des permissions normales.

Le refus utilise le protocole documenté, avec un code de sortie normal. Une entrée invalide produit également un refus explicite.

## Limites de l'exemple

La détection est textuelle : elle peut bloquer une commande qui cite simplement un exemple de suppression. Elle ne couvre pas les suppressions via Python, les variables shell, les jokers, les alias, les suppressions de dossiers parents ou tous les outils possibles. Elle autorise la lecture et la modification du fichier ; elle ne garantit pas sa conservation. Ce support enseigne le mécanisme d'un hook, pas une protection complète du système de fichiers.

La validation avec des événements simulés vérifie le script. L'intégration doit aussi être vérifiée dans la version de Copilot utilisée en cours, notamment les noms d'outils et les arguments reçus. Un délai dépassé peut laisser l'appel poursuivre son circuit normal de permissions.

Pour désinstaller l'exemple, retirer `.github/hooks/tool-guardian.json` puis démarrer une nouvelle session.

Références : [hooks dans VS Code](https://code.visualstudio.com/docs/agent-customization/hooks), [protocole Copilot](https://docs.github.com/en/copilot/reference/hooks-reference). Inspiré du principe de [Tool Guardian](https://github.com/github/awesome-copilot/tree/main/hooks/tool-guardian) ; script pédagogique écrit pour cet atelier.
