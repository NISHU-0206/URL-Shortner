const express = require("express");
const dns = require("dns");
const Url = require("../models/urlModel");

const router = express.Router();

let urlCounter = 1;

router.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;

  try {
    const hostname = new URL(url).hostname;
    dns.lookup(hostname, async (err) => {
      if (err) return res.json({ error: "invalid url" });

      const found = await Url.findOne({ original_url: url });
      if (found) return res.json(found);

      const newUrl = new Url({ original_url: url, short_url: urlCounter++ });
      await newUrl.save();
      res.json(newUrl);
    });
  } catch (e) {
    res.json({ error: "invalid url" });
  }
});

router.get("/api/shorturl/:short", async (req, res) => {
  const shortUrl = req.params.short;
  const found = await Url.findOne({ short_url: shortUrl });

  if (!found) return res.json({ error: "No short URL found" });

  res.redirect(found.original_url);
});

module.exports = router;
