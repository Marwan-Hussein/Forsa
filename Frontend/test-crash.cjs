const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  
  console.log('Navigated to login. Clicking register...');
  await page.click('a[href="/register"]');
  
  await page.waitForTimeout(2000); // Wait to see if error happens
  console.log('Done waiting.');
  await browser.close();
})();
