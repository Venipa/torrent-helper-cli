#!/usr/bin/env node

const pt = require("parse-torrent")
const yargs = require("yargs");
const fs = require("fs");
const pkg = require("./package.json");
const path = require("path");
const prettyBytes = require("pretty-bytes");

yargs.scriptName(pkg.name).usage("$0 <cmd> [args]").command('sum <path>', "sum torrents in dir", yg => {
  yg.positional("path", {
    type: "string"
  })
}, ({ path: torrentRoot }) => {
  const torrentReg = /^(?!.*(meta)\.torrent$).*torrent$/;
  const torrentFiles = fs.readdirSync(torrentRoot).filter(f => torrentReg.test(f)).map(p => [p, path.join(torrentRoot, p)]);
  const torrentTotal = torrentFiles.reduce((acc, [name, p]) => {
    let torrent;
    try {
      torrent = pt(fs.readFileSync(p));
    } catch (err) {
      console.error("Failed to read torrent \"" + name + "\"", err.message);
      return acc;
    }
    if (torrent?.length) acc += torrent.length;
    return acc;
  }, 0)
  console.log("Folder: " + path.normalize(torrentRoot) + "\nTorrent Total Size: " + prettyBytes(torrentTotal) + " (bytes " + torrentTotal + "), Torrents: " + torrentFiles.length);
}).help("sum torrent items in set path/folder").argv

yargs.showHelpOnFail(true);