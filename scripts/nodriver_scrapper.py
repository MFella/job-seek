import nodriver as uc
import sys
import json
import asyncio
import nodriver as uc
import dataclasses, enum

ev_path = "results/"
cf_token = ""

def cookie_serializer(obj):
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return dataclasses.asdict(obj)
    if isinstance(obj, enum.Enum):
        return obj.value
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

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
    # raw_content = await tab.evaluate("document.querySelector('pre').innerText")
    # data = json.loads(raw_content)

    # Print json content to stdout
    # print(json.dumps(data))
    cookies_list = await tab.send(uc.cdp.storage.get_cookies())

    print(json.dumps(cookies_list, default=cookie_serializer))

if __name__ == "__main__":
    uc.loop().run_until_complete(main())
