#!/usr/bin/env python

import sys
import json
import csv

data = sys.stdin.readline()
parsed = json.loads(data)

header=['Name', 'From', 'To', 'Amount']
with open('events.csv', 'a') as file:
    writer = csv.DictWriter(file, fieldnames=header)
    if file.tell() == 0:
        writer.writeheader()

    args = parsed['data']['args']

    if 'from' in args:
        sender = args['from']
    else:
        sender = args['0']

    if 'to' in args:
        receiver = args['to']
    else:
        receiver = args['1']

    if 'amount' in args:
        amount = args['amount']
    else:
        amount = args['2']

    writer.writerow({ 'Name': parsed['data']['name'], 'From': sender, 'To': receiver, 'Amount': amount })
