#!/Users/stevenhao/miniconda3/envs/python2/bin/python2
'''
puzzle = {
  info: {
    title: 'Wednesday, April 5, 2017',
    type: 'Mini Puzzle',
    author: 'Joel Fagliano',
  },
  grid: [
    ['S', 'A', 'P', 'P', 'Y'],
    ['A', 'G', 'R', 'E', 'E'],
    ['G', 'E', 'A', 'R', 'S'],
    ['A', 'N', 'D', 'R', 'E'],
    ['S', 'T', 'A', 'Y', 'S'],
  ],
  clues: {
    across: {
      1: 'Overly Sentimental',
      6: 'Share the same opinion',
      7: 'Truckers shift them frequently',
      8: '___ the Giant, pro wrestling legend',
      9: 'Remains'
    },
    down: {
      1: 'Long, drawn-out tales',
      2: 'Recipient of thanks in an Oscars acceptance',
      3: '"The Devil Wears ___"',
      4: 'Rick who is Trump\'s secretary of energy',
      5: 'Thumbs-up votes',
    },
  }
};'''

import puz
import json
import sys
p = puz.read(sys.argv[1])
#print list(p.clue_numbering().across)
#print p.solution

grid = map(lambda i:
        map(lambda j:
            str(p.solution[i * p.height + j]),
            range(p.width)),
        range(p.height))


print json.dumps({
    'info': {
        'title': str(p.title),
        'type': 'Daily Puzzle' if p.width > 10 else 'Mini Puzzle',
        'author': str(p.author)
        },
    'grid': grid,
    'clues': {
        'across': {
            clue['num']: str(clue['clue'])
            for clue in p.clue_numbering().across
            },
        'down': {
            clue['num']: str(clue['clue'])
            for clue in p.clue_numbering().down
            }
        }
    }, '\n')



