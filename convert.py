#!/usr/bin/env python
from __future__ import print_function
import puz
import json
import sys
p = puz.read(sys.argv[1])
r = p.rebus()

def get_sol(i, j):
    sq = i * p.width + j
    if r.has_rebus() and r.is_rebus_square(sq):
        return r.get_rebus_solution(sq)
    else:
        return p.solution[sq]

def get_circles():
    circles = []
    if p.has_markup():
        m = p.markup()
        for square in m.get_markup_squares():
            if m.markup[square] == puz.GridMarkup.Circled:
                circles.append(square)
    return circles


grid = [[get_sol(i, j) for j in range(p.width)] for i in range(p.height)]
circles = get_circles()

obj = {
    'info': {
        'title': p.title,
        'type': 'Daily Puzzle' if p.width > 10 else 'Mini Puzzle',
        'author': p.author
        },
    'grid': grid,
    'circles': circles,
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
