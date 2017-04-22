#!/Users/stevenhao/miniconda3/envs/python2/bin/python2

from unidecode import unidecode
import puz
import json
import sys
p = puz.read(sys.argv[1])
#print list(p.clue_numbering().across)
#print p.solution

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
    }, '\n')



