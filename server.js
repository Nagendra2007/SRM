const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());
app.use(express.static("."));

app.post("/getname", async (req, res) => {
    try {

        const { reg, pass } = req.body;

        const browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });

        const page = await browser.newPage();

        await page.goto("https://srmapi.in/login", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.fill("#regNumber", reg);
        await page.fill("#password", pass);

        await page.click("button[type='submit']");

        await page.waitForLoadState("networkidle");

        const name = await page.locator("h2").textContent();

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
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});    const cards = page.locator(".p-6.pt-0 .grid > div");

    const count = await cards.count();

    let details = {};

    for (let i = 0; i < count; i++) {

        const heading = await cards.nth(i).locator("h4").textContent();
        const value = await cards.nth(i).locator("p").textContent();

        if (heading && value) {
            details[heading.trim()] = value.trim();
        }
    }

    console.log(details);

    await browser.close();

    res.json({
        name,
        ...details
    });

});

app.listen(3000,()=>{
    console.log("Running at http://localhost:3000");
});
