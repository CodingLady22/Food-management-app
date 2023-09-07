const NewItem = require("../models/NewItems")

module.exports = {
    getDashboard: async (req, res) => {
        try {
            console.log(req.user.id);
            const items = await NewItem.find({ user: req.user.id })

            let daysLeft = [];
            let expiringSoonCount = 0;

            for(let i = 0; i < items.length; i++) {
                let expirations = new Date(items[i].expiry)
                let today = new Date();
                let timeDiff = expirations.getTime() - today.getTime();
                if (timeDiff <= 0) {
                    daysLeft.push('Expired')
                } else {
                    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
                    daysLeft.push(diffDays);

                    if (diffDays <= 7) {
                        expiringSoonCount++;
                    }
                }
            }
            console.log(daysLeft);
            res.render('dashboard.ejs', {newItem: items, user: req.user, daysLeft: daysLeft, expiringSoonCount: expiringSoonCount})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    createItem: async (req, res) => {

        const newItem = new NewItem(
            {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                purchaseDate: req.body.purchaseDate,
                expiry: req.body.expiry,
                user: req.user.id,
            }
        )
        try {
            await newItem.save()
            console.log(newItem)
            res.redirect('/dash')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    },
      // getting the edit page
    editItems: async (req, res) => {
        const id = req.params.id
        console.log(id);
        try {
            const items = await NewItem.find()
            res.render('editDashboard.ejs', { dashItems : items, dashId : id})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    },
    // the actual update
    updateItem: async (req, res) => {
        const id = req.params.id

        try {
            console.log('Item has been updated');
            await NewItem.findByIdAndUpdate(id, {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                purchaseDate: req.body.purchaseDate,
                expiry: req.body.expiry,
                user: req.user.id,
            })
            res.redirect('/dash')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    },
    deleteItem: async (req, res) => {
        const id = req.params.id
        try {
            const item = await NewItem.findByIdAndDelete(id)
            console.log(item);
            res.redirect('/dash')
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
}