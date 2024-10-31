#!/bin/sh
set -e
cd smoke/ucan 
smokeDir=$(pwd)
tmpDir=$(mktemp -d)
cp * $tmpDir || true
cd $tmpDir
rm -rf try-fp-ucan
pnpm create vite try-fp-ucan --template react-ts
cd try-fp-ucan
pnpm install -f $smokeDir/../../dist/ucan/fireproof-ucan-*.tgz
pnpm build
