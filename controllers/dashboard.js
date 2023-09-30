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
            // Retrieve user's items
            console.log(req.user.id);
            const items = await NewItem.find({ user: req.user.id })

            // Initialize arrays to store days left for each item and count of expiring items
            let daysLeft = [];
            let expiringSoonCount = 0;

            // Calculate days left for each item and check if it's expiring soon
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
            // console.log(daysLeft);
            // Render the dashboard view with data
            res.render('dashboard.ejs', {newItem: items, user: req.user, daysLeft: daysLeft, expiringSoonCount: expiringSoonCount, purchaseDateError: purchaseDateError, expiryDateError: expiryDateError})
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
        }
    }

    //* 
    export const createItem = async (req, res) => {

        // Creates user's items
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
        
        // Date validation 
        const purchaseDate = new Date(req.body.purchaseDate);
        const expiryDate = new Date(req.body.expiry);
        const currentDate = new Date();

        if(purchaseDate > currentDate) {
            // Check if date of purchase is in the future
            req.flash('purchaseDateError', 'Purchase date cannot be in the future.')
            return res.redirect('/dash')
        }
        if (expiryDate < currentDate) {
            // Check if date of expiration is in the past
            req.flash('expiryDateError', 'Expiry date cannot be in the past.')
            return res.redirect('/dash')
        }
        if (expiryDate < purchaseDate) {
            // Check if date of expiration is before date of purchase
            req.flash('expiryDateError', 'Expiry date cannot be before the purchase date.')
            return res.redirect('/dash')
        }

        try {
            await newItem.save()
            console.log(newItem)
            // Redirect to dashboard view
            res.redirect('/dash')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    }

    export const getExpiringItems = async (req, res) => {
        try {
            // Retrieve user's items
            const items = await NewItem.find({ user: req.user.id })

            // Initialize arrays to store days left for each item and count of expiring items
            let expiringItems = [];
            let expiringDaysLeft = [];

            // Calculate days left for each item
            for (let i = 0; i < items.length; i++) {
                let expiration = new Date(items[i].expiry);
                let today = new Date();
                let timeDiff = expiration.getTime() - today.getTime();

            if (timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000) {
                // Item expiring within 7 days
                expiringItems.push(items[i]);
                let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                expiringDaysLeft.push(diffDays);
            }
        }

        // Render the expirationPage view with data
        res.render('expirationPage.ejs', {
            user: req.user,
            expiringItems: expiringItems,
            expiringDaysLeft: expiringDaysLeft
        });
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err);
        }
    }

      // Function to get edit page
    export const editItems = async (req, res) => {
        const id = req.params.id
        // Error messages for wrong date inputs
        const purchaseDateError = req.flash('purchaseDateError');
        const expiryDateError = req.flash('expiryDateError');
        try {
            const items = await NewItem.find()
            // Render the editDashboard view with data
            res.render('editDashboard.ejs', { dashItems : items, dashId : id, purchaseDateError: purchaseDateError, expiryDateError: expiryDateError})
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
        }
    }

    // Function to update items in dashboard
    export const updateItem = async (req, res) => {
        const id = req.params.id

        try {
            console.log('Item has been updated');
            // Retrieve and updates user's item based on its unique identifier.
            await NewItem.findByIdAndUpdate(id, {
                itemInput: req.body.itemInput,
                quantity: req.body.quantity,
                unit: req.body.unit,
                purchaseDate: req.body.purchaseDate,
                expiry: req.body.expiry,
                user: req.user.id,
            })

            // Date validation 
        const purchaseDate = new Date(req.body.purchaseDate);
        const expiryDate = new Date(req.body.expiry);
        const currentDate = new Date();

        if(purchaseDate > currentDate) {
            // Check if date of purchase is in the future
            req.flash('purchaseDateError', 'Purchase date cannot be in the future.')
            return res.redirect(`/dash/edit/${id}`)
        }
        if (expiryDate < currentDate) {
            // Check if date of expiration is in the past
            req.flash('expiryDateError', 'Expiry date cannot be in the past.')
            return res.redirect(`/dash/edit/${id}`)
        }
        if (expiryDate < purchaseDate) {
            // Check if date of expiration is before date of purchase
            req.flash('expiryDateError', 'Expiry date cannot be before the purchase date.')
            return res.redirect(`/dash/edit/${id}`)
        }
        
        // Redirect to dashboard view
            res.redirect('/dash')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
            res.redirect('/dash')
        }
    }

    export const deleteItem = async (req, res) => {
        const id = req.params.id
        try {
            // Delete the user's individual item based on its unique identifier.
            const item = await NewItem.findByIdAndDelete(id)
            console.log(item);
            // Redirects to dashboard view
            res.redirect('/dash')
        } catch (err) {
            // Handle errors and send an appropriate response
            if (err) return res.status(500).send(err)
        }
    }