#!/bin/bash

if [ -f "$1" ]; then
  while IFS='=' read -r key value; do
    if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]]; then
      export "$key=$value"
    fi
  done < "$1"
else
  exit 1
fi