import nodriver as uc
import sys
import json
import asyncio
import dataclasses
import enum
import threading
import os
import time

def cookie_serializer(obj):
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return dataclasses.asdict(obj)
    if isinstance(obj, enum.Enum):
        return obj.value
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def watch_stdin(driver):
    initial_ppid = os.getppid()
    while True:
        time.sleep(1)
        if os.getppid() != initial_ppid or os.getppid() == 1:
            try:
                driver.stop()
            except Exception:
                pass
            os._exit(0)

async def is_cf_challenge_page(tab):
    try:
        title = await tab.evaluate("document.title", return_by_value=True)
    except Exception:
        return False
    if not isinstance(title, str):
        return False
    lowered = title.lower()
    return any(marker in lowered for marker in ("just a moment", "attention required", "checking your browser"))

async def attempt_scrape(url, headless, extra_browser_args=None):
    driver = await uc.start(headless=headless, browser_args=extra_browser_args or [])

    # Start daemon thread to close browser if parent process exits or closes stdin
    threading.Thread(target=watch_stdin, args=(driver,), daemon=True).start()

    try:
        tab = await driver.get(url)
        await tab.sleep(6)

        challenged = await is_cf_challenge_page(tab)
        if challenged:
            try:
                await tab.verify_cf()
            except Exception as e:
                # Print exceptions to stderr so they don't break JSON parsing of stdout in Node.js
                print(e, file=sys.stderr)

            await asyncio.sleep(5)
            challenged = await is_cf_challenge_page(tab)

        cookies_list = await tab.send(uc.cdp.storage.get_cookies())
        return cookies_list, challenged
    finally:
        try:
            driver.stop()
        except Exception:
            pass

async def main():
    url = sys.argv[1] if len(sys.argv) > 1 else ''
    if not url:
        print("No url provided")
        return

    cookies_list, challenged = await attempt_scrape(url, headless=True)

    if challenged:
        print("Headless attempt still shows a Cloudflare challenge, retrying off-screen", file=sys.stderr)
        cookies_list, _ = await attempt_scrape(
            url, headless=False, extra_browser_args=["--window-position=-32000,-32000"]
        )

    print(json.dumps(cookies_list, default=cookie_serializer))

if __name__ == "__main__":
    uc.loop().run_until_complete(main())
