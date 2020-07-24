#!/usr/bin/env python

import sys
import json
import csv

data = sys.stdin.readline()
json = json.loads(data)

header=['Name', 'From', 'To', 'Amount']
with open('events.csv', 'a') as file:
    writer = csv.DictWriter(file, fieldnames=header)
    if file.tell() == 0:
        writer.writeheader()

    args = json['args']

    if 'from' in args:
        sender = args['from']
    else:
        sender = args['arg1']

    if 'to' in args:
        receiver = args['to']
    else:
        receiver = args['arg2']

    if 'value' in args:
        amount = args['value']
    else:
        amount = args['arg3']

    writer.writerow({ 'Name': json['name'], 'From': sender, 'To': receiver, 'Amount': amount })
