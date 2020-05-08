#!/usr/bin/env python

import sys
import json
import csv

data = sys.stdin.readline()
json = json.loads(data)

header=['Name', 'Account', 'Amount']
with open('./examples/events.csv', 'a') as file:
    writer = csv.DictWriter(file, fieldnames=header)
    if file.tell() == 0:
        writer.writeheader()
    writer.writerow({ 'Name': json['name'], 'Account': json['args'][0], 'Amount': json['args'][1]})