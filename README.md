# nft-tests

npm uninstall chai
npm install chai@4.3.4



name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Docker
      uses: docker-practice/actions-setup-docker@v1

    - name: Run Docker container
      run: |
        docker run -d -p 4000:4000 evercoinx/faraway:nft-collection-deployer-backend

    - name: Install Dependencies
      run: |
        sudo apt-get install -y nodejs npm
        npm install axios mocha
        npm install chai@4.3.4

    - name: Run Tests
      run: npx mocha
