# "Verify your listing" email campaign

Sends each attorney one email with their firm name and their own verify link. Nothing is sent unless you add `--send`.

## Files in this folder

| File | What it is | In GitHub? |
| --- | --- | --- |
| `verify-email.md` | The email text. You fill it in. | Yes |
| `attorneys.csv` | Your list: `firm_name`, `email`, and optionally `slug`. | No (private) |
| `unmatched.csv` | Rows the script could not tie to one listing, with the reason and likely listings. | No |
| `skipped.csv` | Rows left out, and why (verified, unsubscribed, already sent, do not send). | No |
| `send-log.csv` | One line for every email sent or failed. | No |

This repository is public, so everything here except `verify-email.md` and this page is kept out of GitHub by `.gitignore`. Keep your own copy of `send-log.csv`.

## The email text

The top of `verify-email.md` has two lines: `Subject:` and `From-Name:` (the name shown next to andy@illinoisprobatedirectory.com). Then a blank line, then the email.

- `{{firm_name}}` becomes the firm name from your list. It also works in the subject.
- `{{verify_link}}` becomes that firm's own link. Write a link as `[Verify your listing]({{verify_link}})`.
- `**bold**` works. Leave a blank line between paragraphs.
- Do not add the mailing address or an unsubscribe link. The script adds both under every email.
- Delete the `[[PLACEHOLDER]]` markers when you are done. The script will not send while one is left.

## The list

`slug` is the last part of the firm's profile address, for example `adler-law-firm-pc-joliet`. A pasted profile or verify link works too. With a slug, the row is matched by slug. Without one, it is matched by firm name, and only when exactly one listing has that name (capital letters, punctuation, "&" or "and", and endings like LLC or P.C. are ignored). Anything less certain goes to `unmatched.csv` instead of risking one firm getting another firm's link. To fix a row, add the slug shown in the `suggestions` column to `attorneys.csv` and run again.

If an email address appears twice, only the first row is used.

## Settings (once)

Put these in `.env.local` in the project folder (that file never goes to GitHub):

```
RESEND_API_KEY=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

The two `KV_` values are in Vercel: the IPD project → Storage → the Upstash database → the `.env.local` tab. They let the script see who is verified or unsubscribed and remember who has been sent. The Resend key must belong to the account where illinoisprobatedirectory.com is a verified sending domain.

## Running it

See what would be sent (sends nothing, records nothing):

```bash
npm run campaign
```

Send one sample to yourself (records nothing as sent):

```bash
npm run campaign -- --send --test-to you@example.com
```

Send the next 50:

```bash
npm run campaign -- --send
```

A different batch size:

```bash
npm run campaign -- --send --limit 20
```

Each run takes the next batch of people who have not been sent yet, so running the same command again continues where the last run stopped.

## Who is skipped

- Listings that already have an approved, verified email.
- Anyone who pressed Unsubscribe.
- Anyone already sent this campaign (remembered in the database, and in `send-log.csv`).
- Listings marked `do not send` in `data/attorney-records.json`.

## Unsubscribes

Every email ends with your mailing address and an unsubscribe link. The link opens `/unsubscribe` on the site, which shows one button. Mail programs that have their own Unsubscribe button (Gmail, Outlook) can use it too.

If someone replies asking to be removed:

```bash
npm run campaign -- --unsubscribe someone@firm.com
```

Before the first email of a real run leaves, the script asks the live site whether the unsubscribe link works. If not, it stops and sends nothing. So the `/unsubscribe` page must be live (this pull request merged and deployed) before the first send.

## If a run is interrupted

If the script is cut off in the middle of one email (closed laptop, lost connection), that one address is marked "interrupted" and later runs skip it, because the script cannot tell whether it went out. Look for the address in the Resend dashboard under Emails. If it was not sent:

```bash
npm run campaign -- --forget someone@firm.com
```

The next run sends to it. A send that Resend refuses is different: it is logged as `failed` and tried again on the next run by itself. Three failures in a row stop the run.

## A second campaign later

The "already sent" memory belongs to a campaign name, `verify-listing` unless you say otherwise. To email the same people again some day, use a new name: `npm run campaign -- --campaign verify-listing-2`. Unsubscribes carry over to every campaign.
