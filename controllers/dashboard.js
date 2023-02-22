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
        let expiration = new Date(req.body.expiry);
        try {
            console.log('Item has been updated');
            await NewItem.findByIdAndUpdate(id, {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                expiry: expiration
            })
            res.redirect('/')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        }
    },
    deleteItem: async (req, res) => {
        const id = req.params.id
        try {
            const item = await NewItem.findByIdAndDelete(id)
            console.log(item);
            res.redirect('/')
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }
}