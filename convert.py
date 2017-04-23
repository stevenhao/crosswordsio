#!/usr/bin/env python
from __future__ import print_function
import puz
import json
import sys
p = puz.read(sys.argv[1])

grid = [[p.solution[i * p.width + j] for j in range(p.width)] for i in range(p.height)]


obj = {
    'info': {
        'title': p.title,
        'type': 'Daily Puzzle' if p.width > 10 else 'Mini Puzzle',
        'author': p.author
        },
    'grid': grid,
    'clues': {
        'across': {
            clue['num']: clue['clue']
            for clue in p.clue_numbering().across
            },
        'down': {
            clue['num']: clue['clue']
            for clue in p.clue_numbering().down
            }
        }
    }

print (json.dumps(obj));

