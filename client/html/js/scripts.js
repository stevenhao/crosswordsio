var db = firebase.database();

function backfillInfo(pid) {
  db.ref(`puzzle/${pid}/info`)
    .once('value', info => {
      db.ref(`puzzlelist/${pid}`)
        .transaction(obj => (
          Object.assign(obj, {
            info: info.val()
          })
        ), (err, success, snapshot) => {
          console.log(snapshot.val());
        });
    });
}

function backfillPids() {
  db.ref('puzzle').transaction(puzzles => {
    if (puzzles) {
    console.log(puzzles.length);
    puzzles.forEach((puzzle, i) => {
      if (puzzle) {
        puzzle.pid = i;
      }
    });
    }
    return puzzles;
  });
}


function getPids(cbk) {
  db.ref(`puzzlelist`).once('value', list => {
    cbk(Object.keys(list.val()));
  });
}
