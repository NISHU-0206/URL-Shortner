const express = require("express");
const dns = require("dns");
const Url = require("../models/urlModel");

const router = express.Router();

router.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;

  try {
    const parsedUrl = new URL(url); // Validate format
    const hostname = parsedUrl.hostname;

    dns.lookup(hostname, async (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Check if already exists
      let found = await Url.findOne({ original_url: url });
      if (found) {
        return res.json({
          original_url: found.original_url,
          short_url: found.short_url,
        });
      }

      // Generate short_url using count
      const count = await Url.countDocuments({});
      const newUrl = new Url({
        original_url: url,
        short_url: count + 1,
      });

      await newUrl.save();
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url,
      });
    });
  } catch (error) {
    return res.json({ error: "invalid url" });
  }
});

router.get("/api/shorturl/:short", async (req, res) => {
  const shortUrl = Number(req.params.short); // convert to number
  const found = await Url.findOne({ short_url: shortUrl });

  if (!found) {
    return res.json({ error: "No short URL found" });
  }

  return res.redirect(found.original_url);
});

module.exports = router;
