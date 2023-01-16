const NewItem = require("../models/NewItems")

module.exports = {
    getIndex: async (req, res) => {
        try {
            const items = await NewItem.find()
            res.render('dashboard.ejs', {newItem: items})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    createItem: async (req, res) => {
        let expiration = new Date(req.body.expiry);
        let today = new Date();
        let timeDiff = Math.abs(expiration.getTime() - today.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        // let options = { month: 'short', day: 'numeric', year: 'numeric' };
        let expiryFormated = expiration.toDateString();
        expiryFormated = expiryFormated.slice(4,7) + ' '+ expiryFormated.slice(8,11) + ' ' + expiryFormated.slice(11,16);
        console.log(expiryFormated);
        const newItem = new NewItem(
            {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                expiry: expiryFormated,
                daysLeft: diffDays
            }
        )
        try {
            await newItem.save()
            console.log(newItem)
            res.redirect('/')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    }
}