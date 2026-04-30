import nodriver as uc
import sys
import json
import asyncio
import nodriver as uc

ev_path = "results/"
cf_token = ""

async def main():
    url = sys.argv[1] if len(sys.argv) > 1 else ''
    if not url:
        print("No url provided")
        return
    
    driver = await uc.start()

    tab = await driver.get(url)

    await tab.sleep(6)

    try:
        await tab.verify_cf()
    except Exception as e:
        print(e)
    
    await asyncio.sleep(5)
    raw_content = await tab.evaluate("document.querySelector('pre').innerText")
    data = json.loads(raw_content)

    # Print json content to stdout
    print(json.dumps(data))
    # cookies_list = await tab.send(uc.cdp.storage.get_cookies())
    # cf_token = next((c.value for c in cookies_list if c.name == 'cf_clearance'), None)
    # print(cf_token)    

if __name__ == "__main__":
    uc.loop().run_until_complete(main())
