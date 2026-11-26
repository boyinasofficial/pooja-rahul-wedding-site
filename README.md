# Lakshmi Sri Pooja weds Rahul · invitation website

Plain HTML/CSS/JS. No build step. Upload the whole folder to any static host (your agency server, Netlify, Vercel, GitHub Pages, Hostinger…).

## Folder map
| Path | What it is |
| --- | --- |
| `index.html` | The invitation (all chapters) |
| `admin/index.html` | Password-protected dashboard at `/admin/` |
| `js/config.js` | **Edit this:** API URL, muhurtham time, music path, map links, default language |
| `js/i18n.js` | **All wording**, English + Telugu |
| `js/stars.js` | Karkataka–Simha star animation |
| `js/main.js` | Doors, images, events, knot, countdown, music, petals |
| `js/rsvp.js` | Akshintalu RSVP |
| `css/style.css` | All styling |
| `apps-script/` | Backend code + `SETUP.md` |
| `assets/images/` | Drop generated images here |
| `assets/audio/` | Put `nadaswaram.mp3` here |

## Images
All artwork is in `assets/images/` as compressed WebP (2.8 MB total, down from 45 MB of PNGs).
Phones get the `_mobile` versions and laptops the `_desktop` versions automatically.
Derived files made from your artwork:
- `gate-leaf-*`: the two door leaves cut from the entrance art (they swing open)
- `gate-trunks_mobile`: the elephant trunks that sit in front of the doors on phones
- `07_door-frame`, `06_photo-frame`, `12_brahmamudi-knot`, `14_rsvp-palm-leaf`: background removed
- `leaf-strip`: palm-leaf texture used behind each RSVP field
- `01_entrance-doors_mobile`: the text the image tool printed at the top was cropped off
To replace a picture, keep the same file name.

## Music
`assets/audio/wedding-song.mp3` (Kalyanam Vybhogam) starts when guests open the doors and loops. Guests can pause it with the music button. To change it, replace the file (or the path in `js/config.js`).

## Key facts
- Countdown target: **18 Dec 2026, 3:45 AM IST** (Thursday night / early Friday).
- Language toggle: Telugu default; guests can switch any time (bottom-right button).

## Photo booth
- Guests tap **Open camera**, pick one of 5 frames (Temple Gold, Temple Door, Royal Invite, Brahmamudi, Pandiri), and a 3·2·1 countdown takes the picture.
- **Save** downloads the framed photo (1080×1440 JPG); **Share** opens WhatsApp/Instagram on phones.
- If camera access is refused, guests can pick a photo from their gallery instead.
- Each picture is also sent to your Google Drive album (visible in `/admin/`) once `API_URL` is set.
- The camera only works when the site is served over **https://** (all normal hosts do this).
