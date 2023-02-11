const NewItem = require("../models/NewItems")

module.exports = {
    getIndex: async (req, res) => {
        try {
            const items = await NewItem.find()

            let daysLeft = []
            for(let i = 0; i < items.length; i++) {
                let expirations = new Date(items[i].expiry)
                let today = new Date();
                let timeDiff = expirations.getTime() - today.getTime();
                if (timeDiff <= 0) {
                    daysLeft.push('Expired')
                } else {
                    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
                    daysLeft.push(diffDays)
                }
            }
            console.log(daysLeft);
            res.render('dashboard.ejs', {newItem: items, daysLeft: daysLeft})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    createItem: async (req, res) => {
        let expiration = new Date(req.body.expiry);

        const newItem = new NewItem(
            {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                expiry: expiration
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