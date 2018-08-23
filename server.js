var config = require('./config');
const puppeteer = require('puppeteer');
const pdClient = require('node-pagerduty');

const pd = new pdClient(config.PAGERDUTY_API_KEY);

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let isServerHereSir = false;

  while (isServerHereSir == false) {
    const page = await browser.newPage();
    await page.goto('https://usdedicated.com/dedicated-servers');

    await page.waitFor(9000);

    const html = await page.$eval('#server-list > div:nth-child(4) > div > div:nth-child(2) > div > div.availability > ul:nth-child(3) > li.nyc > p', e => e.innerHTML);

    if (html != 'Out') {
      isServerHereSir = true;

      let payload = {
        "incident": {
          "type": "incident",
          "title": "US Dedicated server is available!",
          "service": {
            "id": config.PAGERDUTY_SERVICE_ID,
            "type": "service_reference"
          },
          "priority": {
            "id": config.PAGERDUTY_PRIORITY_ID,
            "type": "priority_reference"
          },
          "urgency": "high",
          "incident_key": "baf7cf21b1da41b4b0221008339ff357",
          "body": {
            "type": "incident_body",
            "details": "Move your ass here: https://usdedicated.com/dedicated-servers and order a server!"
          },
          "escalation_policy": {
            "id": config.PAGERDUTY_ESCALATION_POLICY_ID,
            "type": "escalation_policy_reference"
          }
        }
      };

      pd.incidents.createIncident(config.PAGERDUTY_INCIDENT_FROM, payload);
    }

    let today = new Date();
    let date = today.getFullYear() + '-' + ('0' + (today.getMonth()+1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    let time = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2) + ':' + ('0' + today.getSeconds()).slice(-2);

    console.log(date + ' ' + time + ' || ' + html);

    await page.close();
  }

  await browser.close();
})();
