# FatinIzzati_HajiMahari_EP_CA_AUG22FT
This application is designed to serve as a back-end system that provides warehouse
operations for sales business. The system is developed with a focus on managing the stock
control and sales from data fetched from the external API , and is meant to be interfaced with a front-end designed
by a separate UX design company.

At the backbone of the application is the SQL Workbench database which stores and manages all relevant information
relating to the inventory and sales operations.

The system implements CRUD (Create, Read, Update, Delete) operations through most of the endpoints for all
database tables.

Authentication are implemented to ensure only authorized access to the system and to maintain the integrity of the
system.

This application is built using Node.js Express framework and uses Sequelize as the ORM to interact with the databases.


# Application installation and Usage instructions
To run this application, you'll need to have Node.js and MySQL installed in your machine.

Clone this repository to your local machine using the command:

git clone repository-url under the CODE tab or download the zip file.

Navigate to the terminal of the project window and install the required dependencies using:

npm install



# Environment Variables
Create a .env and .env.test file in the root directory and add the following environment variables as shown below:

In the .env
ADMIN_USERNAME = admin
ADMIN_PASSWORD = P@ssw0rd
REQUIRED_ADMIN_USERNAME=Admin
REQUIRED_ADMIN_PASSWORD=P@ssword2023
REQUIRED_ADMIN_FULLNAME=admin Setter
REQUIRED_ADMIN_EMAIL=admin@admin.com
DATABASE_NAME =StockSalesDB
TEST_DATABASE_NAME =StockSalesDBTest
DIALECT =mysql
DIALECTMODULE =mysql2
TOKEN_SECRET=your_generated_secret_key
EXTERNAL_API_URL=http://143.42.108.232:8888/items/stock

In the .env.test
NODE_ENV=test
ADMIN_USERNAME=admin
ADMIN_PASSWORD=P@ssw0rd
REQUIRED_ADMIN_USERNAME=Admin
REQUIRED_ADMIN_PASSWORD=P@ssword2023
REQUIRED_ADMIN_FULLNAME=adminTest
REQUIRED_ADMIN_EMAIL=admin@adminTest.com
DATABASE_NAME=StockSalesDBTest
DIALECT=mysql
DIALECTMODULE=mysql2
TOKEN_SECRET=your_generated_secret_key
EXTERNAL_API_URL=http://143.42.108.232:8888/items/stock

Replace your_generated_secret_key with the actual key you have generated for signing and verifying JWT tokens.

To Generate the token secret, open the terminal and run the command:

node 

and then type in:

require('crypto').randomBytes(64).toString('hex')

and press enter.

Run the whole application using:

npm start

NOTE : Before you do 'npm start' please make sure you have created the database and make sure db.sequelize.sync({force: false }) in app.js is set to false. This is to prevent Sequelize dropping and recreating tables when intializing the application or testing it in Postman. This is so the data will continue to persist between sessions and effect of previous API calls.



# Test
If you want to run the test in the tests folder, please make sure you have created a test database and in your JSON package insert the following under the Debug 
"scripts": {
    "start": "node ./bin/www",
    "test": "dotenv -e .env.test jest"
  },

Then run the test using:

npm test 

NOTE : Before you 'npm test' please make sure to db.sequelize.sync({force: false }) in app.js is set to true. You want your test to always start with a clean/empty database and change it back to false when done testing.



# NodeJS Version Used
Node.js v18.16.0


# POSTMAN Documentation link
https://documenter.getpostman.com/view/25221116/2s93sXcuX6



# Acknowledgements/Resources
1.	Node.js documentation [online] NodeJS. Available at: https://nodejs.org/docs/latest-v14.x/api/fs.html#fs_fs_readdirsync_path_options. 

2.	Sequelize model associations [online] Sequelize. Available at: https://sequelize.org/master/manual/assocs.html. 

3.	How to hash password with Crypto [online] geeksforgeeks. Available at: https://www.geeksforgeeks.org/node-js-password-hashing-crypto-module/ 

4.	Understanding stock system in real world app [online] Tutorials 24x7. Available at: 
https://mysql.tutorials24x7.com/blog/guide-to-design-database-for-inventory-management-system-in-mysql

5. how to validate with express [online] Youtube. Available at:https://www.youtube.com/watch?v=7i7xmwowwCY 

6. sequelize transactions how? [online] Stack Overflow. Available at:https://stackoverflow.com/questions/63527257/use-cls-with-sequelize-unmanaged-transactions 

7. sequelize transactions how? [online] Dev. Available at:https://dev.to/luizcalaca/coding-unmanaged-and-managed-transactions-with-nodejs-express-and-sequelize-2bhe 

8. sequelize transactions how? [online] topcoder. Available at:https://www.topcoder.com/thrive/articles/managing-database-transactionsa-using-sequelize 

9. jest mock[online] Jest. Available at:https://jestjs.io/docs/mock-functions

10 Javascript [online] mdn web docs_. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof

11. raw queries [online] medium.com. Available at:https://medium.com/@codemonk/writing-raw-sql-queries-in-sequelize-for-express-js-eaa095cd41e4

12. sql join [online] W3Schools. Available at:https://www.w3schools.com/sql/sql_join_inner.asp

13. Axios [online] npmjs. Available at: https://www.npmjs.com/package/axios

14. JEST [online] JEST. Available at:https://jestjs.io/docs/jest-object

15. Unit testing JEST [online] Meticulous. Available at:https://www.meticulous.ai/blog/how-to-use-jest-spyon

16. EER Diagram symbols [online] ConceptDraw Solutions. Available at:https://www.conceptdraw.com/How-To-Guide/erd-entity-relationship-diagram-symbols