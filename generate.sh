#!/usr/bin/expect
set timeout 10
spawn npx shopify app generate extension
expect "Type of extension"
# send down arrow a few times just to trigger it if needed, or just let it time out to read output
send "\x03"
