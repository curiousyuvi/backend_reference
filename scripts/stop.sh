#!/bin/bash
appName=kurukshetra-backend-api
pid=$(ps aux | grep 'npm' | grep -v grep | awk '{print $2}')
echo "----------------> Stopping $appName"
if [ -z "$pid" ]; then
  echo "----------------> $appName not running"
else
  echo "$appName running at pid $pid"
  kill "$pid"
  sleep 5
  pid=$(ps aux | grep $appName'.jar' | grep -v grep | awk '{print $2}')
  if [ -z "$pid" ]; then
    echo "Stopped $appName"
  else
    echo "$appName still running. Force stopping"
    kill -9 $pid
    echo "Stopped $appName"
    sleep 2
  fi
fi
echo "----------------> Done!"
