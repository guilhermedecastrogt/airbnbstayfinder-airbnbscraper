#!/usr/bin/env python3
"""
Tiny bridge: accepts JSON on stdin, performs an HTTP request using curl_cffi
with Chrome TLS impersonation, returns JSON on stdout.

Input JSON:
  { "method": "GET"|"POST", "url": "...", "headers": {...}, "body": "..." }

Output JSON:
  { "status": 200, "body": "..." }
"""
import json
import sys

from curl_cffi import requests


def main():
    req = json.loads(sys.stdin.read())
    method = req.get("method", "GET").upper()
    url = req["url"]
    headers = req.get("headers", {})
    body = req.get("body")

    kwargs = {
        "headers": headers,
        "impersonate": "chrome124",
        "timeout": 60,
    }
    if body is not None:
        kwargs["data"] = body.encode("utf-8") if isinstance(body, str) else body

    if method == "POST":
        resp = requests.post(url, **kwargs)
    else:
        resp = requests.get(url, **kwargs)

    out = {"status": resp.status_code, "body": resp.text}
    sys.stdout.write(json.dumps(out))


if __name__ == "__main__":
    main()
