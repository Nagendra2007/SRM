const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());
app.use(express.static("."));

app.post("/getname", async (req, res) => {
    let browser;

    try {
        const { reg, pass } = req.body;

        browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        });

        const page = await browser.newPage();

        // Open login page
        await page.goto("https://srmapi.in/login", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // Login
        await page.fill("#regNumber", reg);
        await page.fill("#password", pass);
        await page.click("button[type='submit']");

        // Wait for dashboard
        await page.waitForSelector("h2", {
            timeout: 60000
        });

        const name = (await page.locator("h2").textContent())?.trim();

        // Open profile
        await page.goto("https://srmapi.in/profile", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForSelector(".p-6.pt-0", {
            timeout: 60000
        });

        const cards = page.locator(".p-6.pt-0 .grid > div");

        const count = await cards.count();

        let details = {};

        for (let i = 0; i < count; i++) {

            const heading = await cards.nth(i).locator("h4").textContent();
            const value = await cards.nth(i).locator("p").textContent();

            if (heading && value) {
                details[heading.trim()] = value.trim();
            }
        }

        res.json({
            name,
            details
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    } finally {

        if (browser) {
            await browser.close();
        }

    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
