require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Admin credentials -----------------------------------------------
// Change these before deploying. Password is hashed at startup.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'royalauto123';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// ---- Middleware --------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'royal-auto-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// Images are now stored as embedded data inside MongoDB (not as files on
// disk), since Render's free tier wipes local files periodically. Kept
// deliberately small so a listing's document stays well under MongoDB's
// size limits and the free 512MB storage goes a long way.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1.5 * 1024 * 1024, files: 6 }, // 1.5MB per image, max 6 images
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|jpg)/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, or WEBP images are allowed, max 1.5MB each'), ok);
  },
});

function filesToDataUrls(files) {
  return (files || []).map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

// ---- Auth routes ---------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = username === ADMIN_USERNAME;
  const validPass = validUser && bcrypt.compareSync(password || '', ADMIN_PASSWORD_HASH);
  if (validUser && validPass) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ---- Public listing routes ------------------------------------------------
app.get('/api/listings', async (req, res) => {
  try {
    let listings = await db.getAllListings();
    const { brand, minPrice, maxPrice, minYear, maxYear, fuel, transmission, q, status } = req.query;

    if (status) {
      listings = listings.filter(l => l.status === status);
    } else {
      listings = listings.filter(l => l.status !== 'archived');
    }
    if (brand) listings = listings.filter(l => l.brand.toLowerCase() === brand.toLowerCase());
    if (fuel) listings = listings.filter(l => l.fuel === fuel);
    if (transmission) listings = listings.filter(l => l.transmission === transmission);
    if (minPrice) listings = listings.filter(l => Number(l.price) >= Number(minPrice));
    if (maxPrice) listings = listings.filter(l => Number(l.price) <= Number(maxPrice));
    if (minYear) listings = listings.filter(l => Number(l.year) >= Number(minYear));
    if (maxYear) listings = listings.filter(l => Number(l.year) <= Number(maxYear));
    if (q) {
      const needle = q.toLowerCase();
      listings = listings.filter(
        l =>
          l.title.toLowerCase().includes(needle) ||
          l.brand.toLowerCase().includes(needle) ||
          l.model.toLowerCase().includes(needle) ||
          (l.description || '').toLowerCase().includes(needle)
      );
    }
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await db.getListing(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load listing' });
  }
});

// ---- Admin-only listing routes --------------------------------------------
app.post('/api/listings', requireAuth, upload.array('images', 6), async (req, res) => {
  try {
    const body = req.body;
    const images = filesToDataUrls(req.files);
    const listing = await db.createListing({
      title: body.title,
      brand: body.brand,
      model: body.model,
      year: Number(body.year),
      price: Number(body.price),
      mileage: Number(body.mileage) || 0,
      fuel: body.fuel || '',
      transmission: body.transmission || '',
      color: body.color || '',
      description: body.description || '',
      phone: body.phone || '',
      whatsapp: body.whatsapp || '',
      images,
      status: body.status || 'available',
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to create listing' });
  }
});

app.put('/api/listings/:id', requireAuth, upload.array('images', 6), async (req, res) => {
  try {
    const body = req.body;
    const existing = await db.getListing(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Listing not found' });

    const newImages = filesToDataUrls(req.files);
    let keepImages = existing.images || [];
    if (body.removedImages) {
      const removed = JSON.parse(body.removedImages);
      keepImages = keepImages.filter(img => !removed.includes(img));
    }

    const updated = await db.updateListing(req.params.id, {
      title: body.title ?? existing.title,
      brand: body.brand ?? existing.brand,
      model: body.model ?? existing.model,
      year: body.year ? Number(body.year) : existing.year,
      price: body.price ? Number(body.price) : existing.price,
      mileage: body.mileage ? Number(body.mileage) : existing.mileage,
      fuel: body.fuel ?? existing.fuel,
      transmission: body.transmission ?? existing.transmission,
      color: body.color ?? existing.color,
      description: body.description ?? existing.description,
      phone: body.phone ?? existing.phone,
      whatsapp: body.whatsapp ?? existing.whatsapp,
      status: body.status ?? existing.status,
      images: [...keepImages, ...newImages],
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to update listing' });
  }
});

app.delete('/api/listings/:id', requireAuth, async (req, res) => {
  try {
    const existing = await db.getListing(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    await db.deleteListing(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// ---- Page routes -----------------------------------------------------
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`Royal Auto server running at http://localhost:${PORT}`);
  console.log(`Admin login → username: ${ADMIN_USERNAME} / password: ${ADMIN_PASSWORD}`);
});