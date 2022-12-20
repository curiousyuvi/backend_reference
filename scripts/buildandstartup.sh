#!/bin/bash
sh scripts/stop.sh
sleep 0.1
(cd ../kurukshetra-backend-api && echo "----------------> Pulling latest code" && git reset --hard && git pull https://developerAkX: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@github.com/developerAkX/kurukshetra-backend-api.git && sleep 0.3)
sleep 0.3
sh scripts/startup.sh