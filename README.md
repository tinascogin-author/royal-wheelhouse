# The Royal Wheelhouse

A free, dependency-free Princess Prompt Party app. All banks, parties, and results stay in this browser's local storage. No account, server database, analytics, fonts, or paid services.

## The ten royal reveals

The main screen presents an illustrated palace game room with ten categories. The victim registry opens as a drawer; collections, archives, and setup remain accessible without occupying the stage. All reveals offer Skip and honor the browser's reduced-motion preference. Results are selected and saved before the theater begins.

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

Collections ship with a ready-to-play curated starter library: everyday and seasonal words, all 78 Tarot cards, Potions, Poisons, character-specific Magic Mirror challenges, and genres. Every entry remains editable. Untouched original samples expand in place; edited lists are preserved and receive a separate Royal Library collection. The expansion runs only once, so deleted collections stay deleted. Existing banks and parties retain the same storage key and backup format. Poisons is added once to older installations without replacing any existing bank. Sparkle intensity and animation speed settings remain future polish.

## Screen layout and Tarot orientation

On desktop, categories form a left-hand rail. The magical object sits beside the result and action controls, keeping the main party view visible on common laptop screens. Long custom descriptions and decrees can scroll within their own areas; Collections and Archives may need page scrolling. Small screens retain the compact top category bar and a stacked stage.

The cauldron spoon is layered above the illustrated potion, with its submerged end masked below the liquid line.

Tarot draws the card and then independently selects Upright or Reversed, each with a 50% chance. A reversed card appears upside down; the large callout remains right-side up. The orientation and the meaning used for the draw are saved with the result, included in copied results, and preserved in backups. Earlier results are not retroactively changed.

For Tarot collections use `card name | upright meaning | reversed meaning` when pasting, uploading, or editing. Other collection types still use `name | optional description`. All 78 starter cards have separate upright and reversed descriptions. Custom cards without a reversed description show a clear missing-meaning message when reversed, rather than reusing the upright meaning. Both fields are editable: reversals are not universally negative. Starter Tarot descriptions are original, concise writing interpretations using familiar card themes, rather than predictions. Historical reference: [A. E. Waite’s public-domain Pictorial Key to the Tarot](https://sacred-texts.com/tarot/pkt/pkttp.htm).

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

## Install on Princess's computer

Open the GitHub Pages address in Chrome or Edge and choose **Install app** beside Party room, Collections, and Archives. The installation panel offers the browser's native install prompt when available, or shows the browser-menu route when it isn't. Wait for **Offline ready**, then open The Royal Wheelhouse from the installed app icon to play without a network connection. No local server is required. Installation and offline caching are separate: caching must finish while online. An embedded chat browser may not offer installation, so use a regular browser on the actual party computer.

The app bundles 192px and 512px PNG icons for browser installation. The native confirmation is controlled by the browser; declining it leaves the website usable. Installing does not copy data from another browser profile or another website address. Export and import a backup when moving that data.

## GitHub Pages publishing

No build step is required. The static build includes index.html, style.css, royal.css, enchanted.css, magic.css, layout.css, app.js, core.js, magic-reveals.js, sounds.js, sw.js, manifest.webmanifest, icon.svg, and the assets folder in the Pages artifact. All paths are relative, including the service-worker scope, so repository subdirectories work. This repository is configured for GitHub Pages.

## Party guide

- Start a New Party and set its date, decree, and curse. Parties on the same day share the displayed date ID but have separate internal IDs and archives.
- Enter a Discord handle before drawing. Every draw is recorded under that handle immediately, before its visual reveal. The Word Wheel selects one entry uniformly; spinning is decorative. The crystal uses a separate secure draw for each Yes/No answer.
- Words are retired by their trimmed, case-insensitive name across all Words banks in that party. Deleting or editing a result does not return its word to the pool. Start a new party to reset eligibility. An exhausted collection disables the draw.
- Collections supports bulk paste and local .txt uploads in `name | optional description` format. Uploading fills a preview and suggests a name; Save creates a new collection, preserving the existing lists and using the type selected in the editor. Editing a selected collection without uploading still updates it in place. Types include Words, Tarot, Potions, Poisons, Magic Mirror, and Genre Genie. Seasonal collections are independent. Tarot, Potions, Poisons, Genre Genie, and Story Spindle also retire entries per party. Perspectives use repeating no-repeat rounds; Curse, Tense Tiara, and Mirror remain independent draws.
- Archives autosave and can be reopened. Copy all results or copy numbered Discord chunks of at most 1,000 characters. Individual results support edit and delete.
- Export backups regularly. Browser data clearing, private browsing, storage limits, or changing browser profiles can remove local data. Import validates the file, asks before replacing data, and downloads a safety backup first. Keep that file if you need to undo an import. No backup is uploaded anywhere.

## Offline updates

All app assets are cached by sw.js. When changing app files for a future release, change its CACHE version so the new install refreshes the assets. Offline capability does not provide cloud synchronization.

## Princess collection expansion

Story Spindle weaves a glowing thread and reveals a structure and definition. Perspective Portal lights a nine-square portal board and reveals a point of view and definition. Tense Tiara lights three gems and crowns Past, Present, or Future. All use the same secure selection, save-before-animation, Skip, reduced-motion, copy, backup, and collection editing behavior as the other categories. Custom entries also work with each reveal.

Princess supplied 78 Tarot entries, 233 Mirror challenges, 14 structures, 9 perspectives, 3 tenses, 34 genres, 50 potions, and 50 poisons. Source wording is preserved in princess-library.js. Untouched built-in lists expand in place. Edited lists are preserved with a separate Royal Library collection added once. Word and seasonal banks remain available. This update does not rewrite historical results.

## Beta party rules and Princess Privileges

Curse is first in the category rail; Magic Mirror is last. Edit decree & curse can turn the decree off for the party. Each writer has a Not asked / Yes / No decree choice, saved by case-insensitive Discord handle and included in copied results. Declining the decree does not change the independent Yes/No curse draw. The current curse text is saved with new Curse records.

Mirror offers Trade an existing result or Extra challenge — keep everything. Both create a mandatory challenge; extras work without any existing result. Normal word spins are never capped at three: the counter is a guide.

All selections use secure browser randomness before animation. Drawing uniformly from remaining entries is equivalent to revealing the next item from a randomly shuffled deck; visible motion never chooses results. Words, Tarot, Potions, Poisons, Genre, and Story Spindle do not repeat within a party, across collections of the same type. Upright and Reversed share one retired card name. Old result records seed the new category pools; subsequent retirement persists even if a record is edited or deleted. Perspectives automatically start a new no-repeat round after all entries are used, excluding the previous result from the first draw when there is more than one entry. Curse, Mirror, and Tense retain independent draws.

The Privileges panel is optional and defaults off for each new party. It accepts sprint counts as @handle | words, previews rankings, and awards points only when Princess clicks Award. Places one through five receive 5/4/3/2/1; ties share a place with skipped following places, and zero words earns nothing. Each party sprint can be awarded once. Princess can correct balances with a noted adjustment, approve a transfer, and set each category’s price (default 1). Normal spins default free; select Spend Princess Privileges explicitly to charge. Changing writers or categories returns to free mode. Insufficient balances prevent a paid spin; Skip cannot charge twice. Deleting a result does not refund its payment. Ledger balances carry across parties on this browser and are included in backups, never synced to another device automatically.

Traditional Tarot images are bundled locally for all 78 standard card names, with a decorative fallback for custom names. See assets/TAROT-CREDITS.md for the public-domain Wikimedia Commons sources.
