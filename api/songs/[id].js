module.exports = (req, res) => {
  const { id } = req.query;

  // Data lengkap termasuk chord
  const songsData = {
    "1": { 
      id: "1", title: "Laskar Pelangi", artist: "Nidji", 
      chord: "C F C F\nMimpi adalah kunci...\nAm Em F G\nLaskar pelangi takkan terikat waktu..." 
    },
    "2": { 
      id: "2", title: "Akad", artist: "Payung Teduh", 
      chord: "F G Em A\nBila nanti saatnya tlah tiba...\nDm G C\nKuingin kau menjadi istriku..." 
    },
    "3": { 
      id: "3", title: "Hampa", artist: "Ari Lasso", 
      chord: "(Intro) C Am F G\nC       Am\nEntah di mana...\nF         G\ndirimu berada..." 
    }
  };

  const song = songsData[id];

  if (song) {
    res.status(200).json({ success: true, data: song });
  } else {
    res.status(404).json({ success: false, message: "Lagu tidak ditemukan" });
  }
};
