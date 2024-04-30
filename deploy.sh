#!/usr/bin/env sh
# abort on errors
set -e

export NODE_OPTIONS=--openssl-legacy-provider

# build
npm run build

# navigate into the build output directory
cd dist
# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:ryben/verse.git main:gh-pages

unset NODE_OPTIONS

cd -
