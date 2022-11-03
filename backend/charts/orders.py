import matplotlib.pyplot as plt
import json
import time
import os


file_path = '../src/temp/orders.json'
plt.ion()
fig = plt.figure()
ax = fig.add_subplot(111)


def show_chart():
    try:
        data = {}
        with open(file_path, 'r') as file:
            data = json.load(file)

        ax.plot([data['price'], data['price']], [0, data['size_bids'][len(data['size_bids'])-1]], color="orange")
        ax.stem(data['price_bids']+data['price_asks'], data['size_bids']+data['size_asks'],linefmt='k-',markerfmt='.')

        fig.canvas.flush_events()
        ax.clear()
        fig.canvas.draw()
    except:
        pass


while True:
    show_chart()
    time.sleep(1)