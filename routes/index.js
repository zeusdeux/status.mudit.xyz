'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var low = require('lowdb');
var db = low(path.resolve(__dirname, '../db/index.json'))('status-list');
var cp = require('child_process');
const totalImages = process.env.TOTAL_IMAGES || 5; // no of images for each status of mine


/* Generate random int mod by total */
function randModInput(total) {
  return ~~((Math.random() * total) % total);
}

/* Show my status dawg */
router.get('/', function(req, res, next) {
  try {
    const currentStatus = db.last();

    res.render('index', {
      image: currentStatus.status + randModInput(totalImages) + '.gif',
      status: currentStatus.status,
      since: new Date(currentStatus.since).toLocaleString()
    });
  }
  catch (e) {
    next(e);
  }
});

/* POST new status dawg */
router.post('/iam', function(req, res, next) {
  cp.exec('openssl rsautl -in ' + path.resolve(__dirname, '..', req.files.status.path) + ' -pubin -inkey public.pem -verify', function (err, stdout) {
    const status = stdout;

    if (err) return next(err);
    switch(status) {
    case 'asleep':
    case 'awake':
    case 'sick':
    case 'bored':
      break;
    default: return next(new Error('That isn\'t a valid status dawg!'));
    }

    db.push({
      status: status,
      since: Date.now()
    });
    res.sendStatus(200);
  });
});

/* GET current status as json */
router.get('/iam', function(req, res, next) {
  try {
    res.json(db.last());
  }
  catch(e) {
    next(e);
  }
});

module.exports = router;
