#!/usr/bin/env python

from unidecode import unidecode
import puz
import json
import sys
p = puz.read(sys.argv[1])

grid = map(lambda i:
        map(lambda j:
            unidecode(p.solution[i * p.height + j]),
            range(p.width)),
        range(p.height))


print json.dumps({
    'info': {
        'title': unidecode(p.title),
        'type': 'Daily Puzzle' if p.width > 10 else 'Mini Puzzle',
        'author': unidecode(p.author)
        },
    'grid': grid,
    'clues': {
        'across': {
            clue['num']: unidecode(clue['clue'])
            for clue in p.clue_numbering().across
            },
        'down': {
            clue['num']: unidecode(clue['clue'])
            for clue in p.clue_numbering().down
            }
        }
    })



