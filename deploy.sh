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
yarn build
if [ $? -ne 0 ]; then
  echo "Build failed, aborting deploy"
  exit 1
fi

yarn add-domain

if [ $REPLY ==  "y" ]; then
  read -p "Version type: major, minor, patch? (m/n/p) " -n 1 -r
  MAJOR_RESULT=$(echo $REPLY | tr '[:upper:]' '[:lower:]')

  if [ $MAJOR_RESULT == "m" ]; then
    # update version number in package.json
    yarn version --major
  elif [ $MAJOR_RESULT == "p" ]; then
    # update version number in package.json
    yarn version --patch
  elif [ $MAJOR_RESULT == "n" ]; then
  # update version number in package.json
    yarn version --minor
  else
    echo "Invalid version type, aborting deploy"
    exit 1
  fi

  # get the current version number
  version=$(node -p -e "require('./package.json').version")
  echo "Deploying version $version"

  # commit changes
  git add -A
  git commit -m "build: bump to version $version"
  git push
fi

deploy to gh-pages
echo "Deploying to gh-pages for version $version"
gh-pages -d dist