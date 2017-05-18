#!/usr/bin/env python
from __future__ import print_function
import puz
import json
import sys
p = puz.read(sys.argv[1])
r = p.rebus()
if r.has_rebus():
    sys.exit(0)

numbering = p.clue_numbering()

obj = []
for clue in numbering.across:
    answer = ''.join(
        p.solution[clue['cell'] + i]
        for i in range(clue['len']))
    obj.append(answer)

for clue in numbering.down:
    answer = ''.join(
        p.solution[clue['cell'] + i * numbering.width]
        for i in range(clue['len']))
    obj.append(answer)

print (json.dumps(obj));

