import nodriver as uc
import sys
import json
import asyncio
import dataclasses
import enum
import threading
import os

ev_path = "results/"
cf_token = ""

def cookie_serializer(obj):
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return dataclasses.asdict(obj)
    if isinstance(obj, enum.Enum):
        return obj.value
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def watch_stdin(driver):
    try:
        # Readline blocks until stdin has input or is closed (EOF)
        sys.stdin.readline()
    except Exception:
        pass
    finally:
        if driver:
            try:
                driver.stop()
            except Exception:
                pass
        # Exit immediately
        os._exit(0)

async def main():
    url = sys.argv[1] if len(sys.argv) > 1 else ''
    if not url:
        print("No url provided")
        return
    
    driver = await uc.start()

    # Start daemon thread to close browser if parent process exits or closes stdin
    threading.Thread(target=watch_stdin, args=(driver,), daemon=True).start()

    try:
        tab = await driver.get(url)
        await tab.sleep(6)

        try:
            await tab.verify_cf()
        except Exception as e:
            # Print exceptions to stderr so they don't break JSON parsing of stdout in Node.js
            print(e, file=sys.stderr)
        
        await asyncio.sleep(5)
        cookies_list = await tab.send(uc.cdp.storage.get_cookies())
        print(json.dumps(cookies_list, default=cookie_serializer))
    finally:
        try:
            driver.stop()
        except Exception:
            pass

if __name__ == "__main__":
    uc.loop().run_until_complete(main())
