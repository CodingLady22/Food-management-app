//* Reads the home page

export default {
  getIndex: (req, res) => {
    res.render("index.ejs");
  },
};