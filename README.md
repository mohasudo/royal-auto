# Royal Auto — Car Sales Website

A car listing site: an admin panel for posting/editing cars, and a public
site where clients browse, search, and contact you directly (WhatsApp/call)
to make the deal.

## What's inside
- `server.js` — Express backend (listings API, admin login, image uploads)
- `db.js` — tiny JSON-file database (data.json is created automatically)
- `public/` — the website itself
  - `index.html` + `js/main.js` — client browsing/search page
  - `admin.html` + `js/admin.js` — admin login + listing management
  - `css/style.css` — shared Royal Auto styling
  - `uploads/` — car photos + your logo get stored here

## Running it locally
```
npm install
node server.js
```
Then open http://localhost:3000 (client site) and http://localhost:3000/admin (admin panel).

## Default admin login
- Username: `admin`
- Password: `royalauto123`

**Change these before putting the site online.** Either edit the values at
the top of `server.js`, or set environment variables when starting the server:
```
ADMIN_USERNAME=youruser ADMIN_PASSWORD=yourpassword SESSION_SECRET=some-long-random-string node server.js
```

## Before you go live
1. Change the admin username/password (see above).
2. Open `public/js/main.js` and set `OWNER_WHATSAPP` to your real WhatsApp
   number (country code + number, no + or spaces, e.g. `21620000000`).
   Each listing can also override this with its own WhatsApp/phone number
   in the admin form.
3. Deploy `server.js` somewhere that can run Node.js continuously (Render,
   Railway, a VPS, etc.) — a plain static host won't work since this site
   has a real backend and database file.
4. Back up `data.json` occasionally — it holds every listing.

## Notes
- Listings support: title, brand, model, year, price, mileage, fuel,
  transmission, color, description, multiple photos, phone, WhatsApp
  number, and status (available / reserved / sold).
- The public site only shows non-archived listings and lets clients search
  by keyword, brand, max price, and minimum year.
- Photos are stored in `public/uploads/` and referenced by the JSON database.
