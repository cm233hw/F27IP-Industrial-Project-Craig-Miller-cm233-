## How to run the back-end web-server 
Navigate to the back-end root directory and type:

	yarn server

## To test if it's running correctly: 

Navigate to http://localhost:6001/testconnection and you should see

	Connection to Azure CosmosDB successful

This shows the express server is running and the GET route is working. 

Navigating to http://localhost:3000 should now show the tables with each one containing rows of information

## How to test the back-end code
Please go to the back-end/arrow-version-history root directory and type:

    yarn test

This will run the test suite within the back-end

To run test suite with coverage type:

    yarn coverage

## How to manually update the database
Please go to the back-end/arrow-version-history root directory and type:

    yarn dbupdate

This will run the dbupdate script which will connect to the database and update it with the latest arrow stats information
