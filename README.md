# Bitcoin Kakuma Hub website

The hub's website: learning paths, a six-lesson course with a certificate, a member directory where people create their own profile and get paid in bitcoin, and a market for things made in Kakuma.

It is a static site. There is no server, no database, no passwords and nothing to patch. Hosting is free. Maintaining it means editing text files and, once in a while, adding an npub to a list.

## What is in the box

| File | What it is |
|---|---|
| `index.html` | Home: what the hub is, the three doors, coming up, library, visit |
| `learn.html` | Learning paths for beginners, freelancers, students, teachers, builders |
| `course.html` + `course.js` | Bitcoin Basics: six lessons, a quiz each, a certificate. The lesson text lives in `course.js` |
| `members.html` | People: hub-verified members from `data/members.json` plus community profiles people publish themselves. Every card opens a full profile |
| `person.html` | One person: photo, about, skills, links, what they make, contact and pay buttons. Opened from a card |
| `market.html` | Made in Kakuma: curated products from `data/products.json` plus products members publish themselves |
| `profile.html` + `nostr.js` | Create a profile, log in, edit, add products, back up the key. Uses Nostr (below) |
| `add.html` | A form that writes a directory or market entry for you, for people who send details by WhatsApp |
| `data/*.json` | The hub's own lists: members, products, events, and `hub.json` for moderation |
| `data/img/` | Photos for the verified lists. Each entry's `photo_credit` names the photographer and licence; keep it when you keep the photo |
| `styles.css`, `app.js` | Look and behaviour. One stylesheet, one script |
| `check.py` | Run before publishing. Finds broken data files and dead links |
| `404.html`, `.nojekyll` | Not-found page; tells GitHub Pages to serve the files as they are |

## Put it online (GitHub Pages, free)

1. Make a free account at github.com (one for the hub, not a personal one, so it can be handed on).
2. New repository, name `kakuma-hub`, Public, Create.
3. Add file, Upload files, drag every file and the `data` folder in, Commit changes.
4. Settings, Pages, Build and deployment: Deploy from a branch, branch `main`, folder `/ (root)`, Save.
5. In about a minute the site is live at `https://<account>.github.io/kakuma-hub/`.

Every later change is the same: upload the changed file, commit, wait a minute.

If the repository was handed to you already on GitHub: Settings, Transfer ownership, type the hub's account. Everything, including the live site, moves with it.

## A domain (the only thing that costs money)

1. Buy the domain at any registrar (Namecheap, Cloudflare Registrar, Porkbun), about USD 10 to 15 a year. Use the hub's email so it renews under the hub's control.
2. In the repository, add a file named `CNAME` containing only the domain, for example `bitcoinkakuma.org`.
3. At the registrar, add DNS records: four `A` records for the bare domain pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` record for `www` pointing to `<account>.github.io`.
4. Settings, Pages, Custom domain: type the domain, Save, tick Enforce HTTPS once the check passes (up to a day).

## Edit the words

Open any `.html` file in a text editor (on a phone, the GitHub app works). Every word on the page is in that file. Lines in [square brackets] are placeholders waiting for the hub's own words: who comes, what a Saturday looks like, class times, the WhatsApp number.

The course lessons and quiz questions are in `course.js`. Each lesson has `title`, `body` (plain HTML paragraphs), one `read` link and three quiz questions. `correct` is the number of the right answer, counting from 0. Change the `id` at the top if you rewrite the course, so old progress saved on phones starts fresh.

## Add a verified member, product or event

`data/members.json`, `data/products.json` and `data/events.json` are lists. Copy an existing entry, change the words, keep the commas. The four entries marked "Example" are placeholders: delete them once real people are in.

Easiest way to get the entry right: open `add.html` on the site, fill in the form, press the button, copy the result into the file. People can also do this themselves and send you the result on WhatsApp.

Dates are `2026-10-31` style. Prices are whole numbers of sats with no quotes. Skills are a list like `["Teaching", "Design"]`. `photo` is a path like `data/img/name.jpg` (put the file in `data/img/`, about 500 px square for people, 800 px wide for products) or empty for initials. `example: true` shows a small example tag; remove it for real people.

The placeholder photos are from Wikimedia Commons under CC0, CC BY-SA 4.0 and public domain, credited on each card. Replace them with the hub's own photos, taken with the person's agreement, and delete the credit fields.

Then run `python3 check.py` (any computer with Python; `python3 check.py --offline` without internet). It tells you exactly which entry is wrong. Fix it, run again, upload.

## Community profiles (how sign-up works without a server)

Members create their own profile on `profile.html`. The phone makes a Nostr key, keeps it, and signs everything the member publishes. The profile and products are published as events tagged `bitcoinkakuma` to four public relays (`nostr.js`, top). The directory and market read those relays when the page opens and show the results after the verified list.

What this means for the hub:

- Nothing to run. The relays are free public infrastructure used by millions of Nostr users. If one is down, the others answer; if all four fail, the pages still show the verified lists.
- Nothing to reset. There are no passwords. A member who loses their phone and their `nsec` backup phrase creates a new profile. Teach the backup like the bitcoin words.
- Every profile also appears in Nostr apps (Primal, Damus, Amethyst) with a zap button, because `profile.html` publishes the standard Nostr profile too. That is free reach to the whole bitcoin world.
- A member can add a photo link on their profile; it shows on their card and page and in Nostr apps.
- Moderation is `data/hub.json`. To hide someone, put their npub (shown on their card's Nostr link, `primal.net/p/npub1…`) in `blocked`. To mark a community profile as hub verified, put their npub in `verified`. Upload the file; done.

To change the relays, edit the `RELAYS` list at the top of `nostr.js`. To change the tag, change `TAG`, and tell existing members to republish.

## Test before you publish

- `python3 check.py` for the data files and links.
- Open the site in a phone browser: home, learn, course (answer one quiz), members (search a skill), market, profile (create, publish, see yourself in members, remove, log out, log in with the nsec).
- `profile.html?tag=bitcoinkakuma-test`, `members.html?tag=bitcoinkakuma-test` and `market.html?tag=bitcoinkakuma-test` use a separate test tag, so you can try everything without appearing in the real directory.

## Things that are deliberately not here

Private messaging (contact goes through the member's own WhatsApp or email), accounts with passwords, an admin dashboard, and payments through the site. Each of those needs a server someone has to run and protect for years. Everything the hub needs works without them. If the hub grows into needing them, the data files and the Nostr events are the foundation to build on.

## Licence

Do what you like with it. Credit the Bitcoin Kakuma Hub if you copy it for another hub, and send them our regards.
