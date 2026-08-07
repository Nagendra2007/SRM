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

        // Login page
        await page.goto("https://srmapi.in/login", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.fill("#regNumber", reg);
        await page.fill("#password", pass);

        await page.click("button[type='submit']");

        // Wait for dashboard
        await page.waitForSelector("h2", {
            timeout: 60000
        });

        console.log("Dashboard URL:", await page.url());

        const name = (await page.locator("h2").textContent())?.trim();

        // Profile page
        await page.goto("https://srmapi.in/profile", {
            waitUntil: "domcontentloaded"
        });

        await page.waitForSelector(".p-6.pt-0", {
            timeout: 60000
        });

        console.log("Profile URL:", await page.url());

        const cards = page.locator(".p-6.pt-0 .grid > div");

        console.log("Cards:", await cards.count());

        let details = {};

        const count = await cards.count();

        for (let i = 0; i < count; i++) {

            const heading = await cards.nth(i).locator("h4").textContent();
            const value = await cards.nth(i).locator("p").textContent();

            if (heading && value) {
                details[heading.trim()] = value.trim();
            }
        }

        console.log(details);

        res.json({
            name,
            ...details
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    } finally {

        if (browser)
            await browser.close();

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on", PORT);
});        const name = await page.locator("h2").textContent();

        await page.goto("https://srmapi.in/profile");

        await page.waitForLoadState("networkidle");

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

        await browser.close();

        res.json({
            name,
            ...details
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`);
});
