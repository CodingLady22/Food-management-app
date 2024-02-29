//* Controller for managing the dashboard, including displaying items, creating, editing, and deleting.
//* Handles data retrieval, validation, and rendering of views.

import NewItem from "../models/NewItems.js";


    //* Retrieves and renders the user's dashboard, displaying items with expiration information.
    //* Handles date calculations and rendering of the dashboard view.

    export const getDashboard = async (req, res) => {
        // Error messages for wrong date inputs
        const purchaseDateError = req.flash('purchaseDateError');
        const expiryDateError = req.flash('expiryDateError');
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

            res.render('dashboard.ejs', {newItem: items, user: req.user, daysLeft: daysLeft, expiringSoonCount: expiringSoonCount, purchaseDateError: purchaseDateError, expiryDateError: expiryDateError})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }

    //* Create newly entered food item in dashboard
    export const createItem = async (req, res) => {

        const newItem = new NewItem(
            {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                purchaseDate: req.body.purchaseDate,
                expiry: req.body.expiry,
                user: req.user.id,
            }
        );
        
        const purchaseDate = new Date(req.body.purchaseDate);
        const expiryDate = new Date(req.body.expiry);
        const currentDate = new Date();

        if(purchaseDate > currentDate) {

            req.flash('purchaseDateError', 'Purchase date cannot be in the future.')
            return res.redirect('/dash')
        }
        if (expiryDate < currentDate) {
            req.flash('expiryDateError', 'Expiry date cannot be in the past.')
            return res.redirect('/dash')
        }
        if (expiryDate < purchaseDate) {
            req.flash('expiryDateError', 'Expiry date cannot be before the purchase date.')
            return res.redirect('/dash')
        }

        try {
            await newItem.save()
            console.log(newItem)
            
            res.redirect('/dash')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    }

    // * Display only items expring within 7 days
    export const getExpiringItems = async (req, res) => {
        try {
            const items = await NewItem.find({ user: req.user.id })

            let expiringItems = [];
            let expiringDaysLeft = [];

            for (let i = 0; i < items.length; i++) {
                let expiration = new Date(items[i].expiry);
                let today = new Date();
                let timeDiff = expiration.getTime() - today.getTime();

            if (timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000) {
                expiringItems.push(items[i]);
                let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                expiringDaysLeft.push(diffDays);
            }
        }

        res.render('expirationPage.ejs', {
            user: req.user,
            expiringItems: expiringItems,
            expiringDaysLeft: expiringDaysLeft
        });
        } catch (err) {
            if (err) return res.status(500).send(err);
        }
    }

      //* Display edit page
      
    export const editItems = async (req, res) => {
        const id = req.params.id
        const purchaseDateError = req.flash('purchaseDateError');
        const expiryDateError = req.flash('expiryDateError');
        try {
            const items = await NewItem.find()
            res.render('editDashboard.ejs', { dashItems : items, dashId : id, purchaseDateError: purchaseDateError, expiryDateError: expiryDateError})
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }

    //* Update items in dashboard
    export const updateItem = async (req, res) => {
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

        const purchaseDate = new Date(req.body.purchaseDate);
        const expiryDate = new Date(req.body.expiry);
        const currentDate = new Date();

        if(purchaseDate > currentDate) {
            req.flash('purchaseDateError', 'Purchase date cannot be in the future.')
            return res.redirect(`/dash/edit/${id}`)
        }
        if (expiryDate < currentDate) {
            req.flash('expiryDateError', 'Expiry date cannot be in the past.')
            return res.redirect(`/dash/edit/${id}`)
        }
        if (expiryDate < purchaseDate) {
            req.flash('expiryDateError', 'Expiry date cannot be before the purchase date.')
            return res.redirect(`/dash/edit/${id}`)
        }
        
            res.redirect('/dash')
        } catch (err) {
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    }

    // * Delete items in dashboard
    export const deleteItem = async (req, res) => {
        const id = req.params.id
        try {
            const item = await NewItem.findByIdAndDelete(id)
            console.log(item);
            
            res.redirect('/dash')
        } catch (err) {
            if (err) return res.status(500).send(err)
        }
    }