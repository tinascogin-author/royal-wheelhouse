# The Royal Wheelhouse

A free, dependency-free Princess Prompt Party app. All banks, parties, and results stay in this browser's local storage. No account, server database, analytics, fonts, or paid services.

## The seven royal reveals

The main screen presents an illustrated palace game room with seven categories. The victim registry opens as a drawer; collections, archives, and setup remain accessible without occupying the stage. All reveals offer Skip and honor the browser's reduced-motion preference. Results are selected and saved before the theater begins.

The illustrated wheel spins and slows under a fixed jeweled pointer, followed by a large prompt and its description. Its decorative segments represent the theater; the pointer does not select the word. TEMPT FATE activates the mist, pulse, and lightning in the illustrated crystal; its verdict reads YOU ARE CURSED! or YOU ESCAPED!, alongside the current curse. The local artwork, CSS, and SVG work offline. A per-handle counter helps the host track three word prompts, without preventing her from making additional draws.

| Category | Reveal | Button |
| --- | --- | --- |
| Words | Jeweled spinning wheel | SPIN THE WHEEL |
| Curse | Mist and lightning crystal ball | TEMPT FATE |
| Tarot | Shuffling fan, lifted card, flip and meaning | DRAW YOUR DESTINY |
| Potions | Bubbling cauldron, slowing spoon, rising smoke | BREW MY FATE |
| Poisons | Bubbling flask and a rising bubble that pops | WHAT’S YOUR POISON? |
| Genre | Jeweled spinning wheel | SPIN ME A STORY |
| Magic Mirror | Mist, ripples and a mandatory challenge | MIRROR, MIRROR… |

Collections include editable starter entries rather than complete curated libraries. Existing banks and parties retain the same storage key and backup format. Poisons is added once to older installations without replacing any existing bank. Sparkle intensity and animation speed settings remain future polish.

## Screen layout and Tarot orientation

On desktop, categories form a left-hand rail. The magical object sits beside the result and action controls, keeping the main party view visible on common laptop screens. Long custom descriptions and decrees can scroll within their own areas; Collections and Archives may need page scrolling. Small screens retain the compact top category bar and a stacked stage.

The cauldron spoon is layered above the illustrated potion, with its submerged end masked below the liquid line.

Tarot draws the card and then independently selects Upright or Reversed, each with a 50% chance. A reversed card appears upside down; the large callout remains right-side up. The orientation and the meaning used for the draw are saved with the result, included in copied results, and preserved in backups. Earlier results are not retroactively changed.

For Tarot collections use `card name | upright meaning | reversed meaning` when pasting, uploading, or editing. Other collection types still use `name | optional description`. The three starter cards have separate reversed descriptions. Custom cards without a reversed description show a clear missing-meaning message when reversed, rather than reusing the upright meaning. Both fields are editable: reversals are not universally negative. Starter interpretations follow common themes summarized in [Labyrinthos's Tarot meanings](https://labyrinthos.co/blogs/tarot-card-meanings-list) and [reversal guide](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-interpret-reversed-tarot-cards).

## Sound

Use the visible Sound on/off control at the top of the room. Wheel pointer clicks follow the actual spin easing and slow toward the stop. Card rustles, bubbling tones, magical suspense and reveal chimes are synthesized through the browser's Web Audio API, so there are no external audio files. Audio begins only after a user gesture. Muting cancels active and scheduled sounds immediately; skipping cancels suspense and plays the reveal. The preference is saved locally and in backups. If a browser does not support audio, reveals still work silently.

## Magic Mirror trades

Enter a handle, choose Mirror, then choose that writer's active result to trade in. The original stays recorded and links to the mandatory replacement. Neither a different writer's result nor an existing mandatory Mirror challenge can be traded. Copying and backups include the trade history. Deleting the replacement restores the original's active status; a linked original cannot be deleted until its replacement is removed. Traded words remain retired for the party. Linked records cannot be reassigned to another handle independently.

## Permanent hosting and updates

Repository: https://github.com/tinascogin-author/royal-wheelhouse

Pages address: https://tinascogin-author.github.io/royal-wheelhouse/

In Settings → Pages, select **GitHub Actions** as the publishing source. Every push to main runs the tests, builds only the public app assets into dist, and publishes after the checks pass. Pull requests run checks without deploying. No npm installation is needed.

The review site and GitHub Pages have different browser storage. To move party archives, collections, and settings, export a backup from the review site and import it on GitHub Pages. Do not commit backups to the repository. Browser data does not automatically transfer between addresses.

## Run locally

Install Node.js, open a terminal in this folder, and run `npm start` (or `node server.js` if npm is unavailable). Visit http://127.0.0.1:4173. Keep the terminal open while using the local server. Run `node --test` for the draw-engine and app interaction checks.

Use localhost or HTTPS rather than opening index.html directly. After the page displays **Offline ready**, it can reload without the server or network. You may install it from your browser's app/install menu where supported. Keep using the same browser and origin: changing from localhost to a hosted URL does not transfer local data.

## GitHub Pages publishing

No build step is required. The static build includes index.html, style.css, royal.css, enchanted.css, magic.css, layout.css, app.js, core.js, magic-reveals.js, sounds.js, sw.js, manifest.webmanifest, icon.svg, and the assets folder in the Pages artifact. All paths are relative, including the service-worker scope, so repository subdirectories work. This repository is configured for GitHub Pages.

## Party guide

- Start a New Party and set its date, decree, and curse. Parties on the same day share the displayed date ID but have separate internal IDs and archives.
- Enter a Discord handle before drawing. Every draw is recorded under that handle immediately, before its visual reveal. The Word Wheel selects one entry uniformly; spinning is decorative. The crystal uses a separate secure draw for each Yes/No answer.
- Words are retired by their trimmed, case-insensitive name across all Words banks in that party. Deleting or editing a result does not return its word to the pool. Start a new party to reset eligibility. An exhausted collection disables the draw.
- Collections supports bulk paste and local .txt uploads in `name | optional description` format. Uploading fills a preview and suggests a name; Save creates a new collection, preserving the existing lists and using the type selected in the editor. Editing a selected collection without uploading still updates it in place. Types include Words, Tarot, Potions, Poisons, Magic Mirror, and Genre Genie. Seasonal collections are independent. The non-Word types allow repeat draws.
- Archives autosave and can be reopened. Copy all results or copy numbered Discord chunks of at most 1,000 characters. Individual results support edit and delete.
- Export backups regularly. Browser data clearing, private browsing, storage limits, or changing browser profiles can remove local data. Import validates the file, asks before replacing data, and downloads a safety backup first. Keep that file if you need to undo an import. No backup is uploaded anywhere.

## Offline updates

All app assets are cached by sw.js. When changing app files for a future release, change its CACHE version so the new install refreshes the assets. Offline capability does not provide cloud synchronization.
