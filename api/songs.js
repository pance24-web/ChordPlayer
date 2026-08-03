module.exports = (req, res) => {
  const songs = [
    { id: "1", title: "Laskar Pelangi", artist: "Nidji" },
    { id: "2", title: "Akad", artist: "Payung Teduh" },
    { id: "3", title: "Hampa", artist: "Ari Lasso" }
  ];

  res.status(200).json({ success: true, data: songs });
};
