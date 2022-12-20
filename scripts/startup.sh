#!/bin/bash
appName=kurukshetra-backend-api
port=3000
echo "----------------> Starting $appName"
pid=$(ps aux | grep 'npm' | grep -v grep | awk '{print $2}')
if [ -z "$pid" ]; then
  echo "----------------> Started $appName at $port"
  (cd ../kurukshetra-backend-api && nohup yarn run serve </dev/null > process.log 2> processerror.log &)
else
  echo "$appName already running at $port port. Execute stop.sh to stop app at pid $pid and then rerun startup.sh"
fi
echo "----------------> Done"
