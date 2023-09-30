
  const ensureAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  }

  const ensureGuest = function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/allRecipes");
    }
  }

  export {
    ensureAuth,
    ensureGuest
  }