# AMM Backend

set config parameters in src/config/env

run the AMM with:
```
npx ts-node src/amm.ts
```

visualize the AMM orders distribution config running:
```
source venv/bin/activate
python3 charts/orders.py
```
matplotlib and tkinter must be installed first

run MongoDB Compass to set bot config and visualize data

start database
```
mac:
brew services start mongodb-community@6.0

windows:
mongod
```
stop database
```
mac:
brew services stop mongodb-community@6.0
```