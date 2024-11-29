# Food Management App

## About the project

Food wastage is a major problem all around the world. A simple and easy-to-use app that helps you manage your food and avoid waste. With this app, you will never have to worry about throwing away expired food again. 

Live site: Click <a href="https://food-management-app.onrender.com" target="_blank">here</a>

## What the app looks like

#### Landing Page
<img width="771" alt="Screen Shot 2023-08-24 at 4 12 14 PM" src="https://github.com/CodingLady22/Food-management-app/assets/99496129/1ce793b6-7a15-4919-a6de-20e2f02425c8">

#### Sign up 
<img width="457" alt="Screen Shot 2023-08-24 at 4 14 20 PM" src="https://github.com/CodingLady22/Food-management-app/assets/99496129/58133139-a4ba-4b9e-ac82-15151553a146">

#### Dashboard
<img width="1440" alt="Screen Shot 2023-08-24 at 4 17 32 PM" src="https://github.com/CodingLady22/Food-management-app/assets/99496129/07c2358c-9ffd-4960-a013-a574eeb790b3">

#### Dashboard Edit page
<img width="1440" alt="Screen Shot 2023-08-24 at 4 18 56 PM" src="https://github.com/CodingLady22/Food-management-app/assets/99496129/7019bd53-ce53-41f1-aefa-95b763418f8e">

#### Comments Page
<img width="1440" alt="Screen Shot 2023-08-28 at 4 59 38 PM" src="https://github.com/CodingLady22/Food-management-app/assets/99496129/c66b3352-8ab9-43ef-97b2-b8b43e5dfc72">

#### Displayed Comments
<img width="808" alt="Screen Shot 2023-08-28 at 5 02 31 PM" src="https://github.com/CodingLady22/Food-management-app/assets/99496129/4383b8d0-1821-4fec-9308-7a025aa0fdd7">




## Features
* Notifications for entered food 
* Ability to write recipes directly in the app.
* Comments are available where users can write down their shopping lists or ideas on how to use up their food items.
* Ability to save recipes of other users
* External api integration to show food-related quotes


### How it's made
This is a full-stack application using the following:
* [![MongoDB][MongoDB]][MongoDB-url]
* [![Express][Express.js]][Express-url]
* [![Node][Node.js]][Node-url]
* [![EJS][EJS]][EJS-url]

### Optimization

* When food items are about to expire, recipes for those food items will be sent along with the expiration notifications.
* Search for external recipes from the app.
* Search input with dropdown to simplify searching for items.
* Personal recipes can be uploaded privately or publicly.
* Public recipes can be accessed by all users while private recipes will only be seen by the owner of the recipe.
* Update user profile.
* Account deactivation.


### How to install
Fork repo, clone and install dependencies 
```
npm install
```

- Create your own .env file in the 'config' folder
- Add these variables below with their appropriate values to the .env file:

```
 * PORT = 'port number of your choice'
 * CONNECTION_STRING_DB = 'connection string from mongoDB'
 * CLOUD_NAME = 'cloudinary cloud name'
 * API_KEY = 'cloudinary key'
 * API_SECRET = 'cloudinary API secret'

```


To run in development: Open 2 integrated terminals, one to run node and the other to run tailwind

```
npm run dev
npm run watch
```







<!-- MARKDOWN LINKS & IMAGES -->

[Node.js]: https://img.shields.io/badge/Node.js-233056?style=flat&logo=nodedotjs&logoColor=339933
[Node-url]: https://nodejs.org/en/
[Express.js]: https://img.shields.io/badge/Express-eeeeee?style=flat&logo=express&logoColor=000000
[Express-url]: https://expressjs.com
[MongoDB]: https://img.shields.io/badge/MongoDB-023430?style=flat&logo=mongodb&logoColor=00ed64
[MongoDB-url]: https://www.mongodb.com
[EJS]: https://img.shields.io/badge/-EJS-%238f3d3d?style=flat&logo=javascript&logoColor=ffffff
[EJS-url]: https://ejs.co
[React.js]: https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white
[React-url]: https://reactjs.org
