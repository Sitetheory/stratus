#!/bin/bash

#############################################
# This fixes bundle naming issues in rollup #
#############################################

# todo: make this dynamic XD
packages=(
  angular
  angularjs
  angularjs-extras
  calendar
  core
  idx
  map
  stripe
  swiper
)
for package in "${packages[@]}"
do
	if [[ -f "packages/${package}/dist/multi-entry.js" ]]; then
      echo "Rename packages/${package}/dist/multi-entry.js -> packages/${package}/dist/$(echo "$package" | tr '[:upper:]' '[:lower:]').bundle.js"
      mv "packages/${package}/dist/multi-entry.js" "packages/${package}/dist/$(echo "$package" | tr '[:upper:]' '[:lower:]').bundle.js"
  fi
done
