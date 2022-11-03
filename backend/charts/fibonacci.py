import matplotlib.pyplot as plt
import json
import time
import os
from math import floor, ceil


unit = 0.01
price = 0.04
width = 0.03
density = 0.05
decimals = 2
a = 0.1   
b = 10
c = 1


def fibo(density, current, previous, mx, result):
    next = current+(previous*density)
    if next > mx:
        return result
    result.append(next)
    return fibo(density, next, current, mx, result)


serie = fibo(density, unit, unit, unit+width, [])

print(serie)

prices = []
sizes = []

for x in serie:
    n = round((price-x+unit), decimals)
    if n not in prices and n != price and n >= 0:
        sizes.append(pow(x,2)*a+x*b+c)
        prices.append(n)

for x in serie:
    n = round((price+x-unit), decimals)
    if n not in prices and n != price and n >= 0:
        prices.append(n)
        sizes.append(pow(x,2)*a+x*b+c)


total = sum(sizes)
sizes = [floor((s/total)*100) for s in sizes]

print(prices)
print(sizes)
print(sum(sizes))

plt.ion()
fig = plt.figure()
ax = fig.add_subplot(111)


def show_chart():
    try:
        ax.plot([price, price], [0, sizes[len(sizes)-1]], color="orange")
        ax.stem(prices, sizes, linefmt='k-',markerfmt='.')
        fig.canvas.flush_events()
        ax.clear()
        fig.canvas.draw()
    except:
        pass


while True:
    show_chart()
    time.sleep(1)