# ask if a new version should be deployed
read -p "Do you want to deploy a new version? (y/n) " -n 1 -r
RESULT=$(echo $REPLY | tr '[:upper:]' '[:lower:]')
version=$(node -p -e "require('./package.json').version")

# run tests and build before deploying and exit if tests or build fail
yarn run vitest --dom --run
if [ $? -ne 0 ]; then
  echo "Tests failed, aborting deploy"
  exit 1
fi

if [ $REPLY ==  "y" ]; then
  yarn version --minor
  # get the current version number
  version=$(node -p -e "require('./package.json').version")
  
fi

echo "Deploying version $version"
yarn build
if [ $? -ne 0 ]; then
  echo "Build failed, aborting deploy"
  exit 1
fi
yarn add-domain

if [ $REPLY ==  "y" ]; then
  # commit changes
  git add -A
  git commit -m "build: bump to version $version"
  git push
fi

# deploy to gh-pages
echo "Deploying to gh-pages for version $version"
gh-pages -d dist