import { makeGame } from './gameUtils';

// for interfacing with firebase

const db = firebase.database();
const actions = {

  // puzzle: { title, type, grid, clues }
  createPuzzle: function createPuzzle(puzzle) {
    db.ref('counters').transaction(counters => {
      const pid = ((counters && counters.pid) || 0) + 1;
      const title = puzzle.info.title;
      db.ref('puzzlelist/' + pid).set({
        pid: pid,
        title: title
      });
      db.ref('puzzle/' + pid).set(puzzle);
      return {...counters, pid: pid}
    }, (err, success, snapshot) => {
    });
  },

  createGame({ name, pid }) {
    db.ref('counters').transaction(counters => {
      const gid = ((counters && counters.gid) || 0) + 1;
      return {...counters, gid: gid}
    }, (error, committed, snapshot) => {
      if (error || !committed) {
        console.error('could not create game');
        return;
      }
      const gid = snapshot.child('gid').val();
      db.ref('gamelist/' + gid).set({
        gid: gid,
        name: name
      });
      db.ref('puzzle/' + pid).once('value', puzzle => {
        const game = makeGame(gid, name, puzzle.val());
        db.ref('game/' + gid).set(game);
      });
    });
  }
};

export { db };
export default actions;
